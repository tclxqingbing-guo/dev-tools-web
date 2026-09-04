import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import neo4j, { type Driver } from 'neo4j-driver'
import { query, queryOne } from '../agent/db.js'
import { decryptSecret } from '../agent/security.js'

const execFileAsync = promisify(execFile)
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.java'])

interface SymbolNode { name: string; kind: 'module' | 'class' | 'function' | 'interface'; path: string; exported: boolean; startLine: number }
interface ImportEdge { from: string; to: string }

class CodeGraphService {
  private driver: Driver | null = null
  private readonly cacheRoot = path.resolve(process.env.CODEGRAPH_REPO_CACHE_DIR || '/app/data/code-repos')

  private neo4j(): Driver {
    if (!this.driver) {
      this.driver = neo4j.driver(
        process.env.CODEGRAPH_NEO4J_URI || 'bolt://codegraph-neo4j:7687',
        neo4j.auth.basic(process.env.CODEGRAPH_NEO4J_USER || 'neo4j', process.env.CODEGRAPH_NEO4J_PASSWORD || 'bx_codegraph_pass'),
      )
    }
    return this.driver
  }

  private async graph<T = Record<string, unknown>>(cypher: string, params: Record<string, unknown> = {}): Promise<T[]> {
    const session = this.neo4j().session()
    try {
      const result = await session.run(cypher, params)
      return result.records.map((record) => record.toObject() as T)
    } finally { await session.close() }
  }

  /** 返回已迁移到公共系统的仓库同步状态。 */
  listRepositories(): Promise<any[]> {
    return query(`SELECT project_id AS "projectId",name,branch,commit_sha AS "commitSha",status,file_count AS "fileCount",
      node_count AS "nodeCount",edge_count AS "edgeCount",error,synced_at AS "syncedAt" FROM codegraph_repository ORDER BY name`)
  }

  private async configuration(): Promise<{ url: string; token: string; branch: string; projects: string[] }> {
    const rows = await query<{ key: string; value: any }>(`SELECT key,value FROM agent_setting WHERE key LIKE 'codegraph.%'`)
    const values = Object.fromEntries(rows.map((row) => [row.key, row.value]))
    const rawToken = values['codegraph.gitlabToken']
    return {
      url: String(values['codegraph.gitlabUrl'] || process.env.CODEGRAPH_GITLAB_URL || '').replace(/\/+$/, ''),
      token: rawToken?.encrypted ? decryptSecret(rawToken.encrypted) : String(process.env.CODEGRAPH_GITLAB_TOKEN || ''),
      branch: String(values['codegraph.branch'] || process.env.CODEGRAPH_BRANCH || 'master'),
      projects: Array.isArray(values['codegraph.projects']) ? values['codegraph.projects'].map(String) : String(process.env.CODEGRAPH_PROJECTS || '').split(',').map((item) => item.trim()).filter(Boolean),
    }
  }

  /** 触发一个或全部 GitLab 项目的只读快照与图谱重建。 */
  async trigger(projectId?: string): Promise<{ accepted: boolean; projects: string[] }> {
    const config = await this.configuration()
    if (!config.url || !config.token) throw new Error('未配置 Code Graph GitLab 地址或 Token')
    const projects = projectId ? [projectId] : config.projects
    if (!projects.length) throw new Error('未配置 Code Graph 项目 ID')
    for (const id of projects) {
      if (!/^[A-Za-z0-9_.-]{1,100}$/.test(id)) throw new Error(`非法 GitLab 项目 ID: ${id}`)
      void this.syncProject(id, config).catch((error) => this.saveStatus(id, { status: 'failed', error: String(error.message).slice(0, 1000) }))
    }
    return { accepted: true, projects }
  }

  private async syncProject(projectId: string, config: { url: string; token: string; branch: string }): Promise<void> {
    await this.saveStatus(projectId, { name: `Project ${projectId}`, branch: config.branch, status: 'syncing', error: null })
    const response = await fetch(`${config.url}/api/v4/projects/${encodeURIComponent(projectId)}`, {
      headers: { 'Private-Token': config.token }, signal: AbortSignal.timeout(30_000),
    })
    if (!response.ok) throw new Error(`GitLab API 错误: ${response.status} ${await response.text()}`)
    const project = await response.json() as any
    const name = String(project.name || `Project ${projectId}`)
    const branch = String(project.default_branch || config.branch)
    const cloneUrl = String(project.http_url_to_repo || `${config.url}/${project.path_with_namespace}.git`)
    const snapshot = await this.syncSnapshot(projectId, branch, cloneUrl, config.token)
    await this.saveStatus(projectId, { name, branch, clone_url: cloneUrl, commit_sha: snapshot.commit, snapshot_path: snapshot.path, status: 'parsing' })
    const files = (await this.run('rg', ['--files', '--glob', '!.git'], snapshot.path)).split('\n').filter((file) => extensions.has(path.extname(file)))
    const symbols: SymbolNode[] = []; const imports: ImportEdge[] = []
    for (const file of files) {
      const parsed = this.parse(file, await fs.readFile(path.join(snapshot.path, file), 'utf8'))
      symbols.push(...parsed.symbols); imports.push(...parsed.imports)
    }
    await this.saveStatus(projectId, { status: 'building_graph', file_count: files.length })
    await this.buildGraph(projectId, name, branch, snapshot.commit, symbols, imports)
    await this.saveStatus(projectId, { status: 'ready', file_count: files.length, node_count: symbols.length, edge_count: imports.length, error: null, synced_at: new Date() })
  }

  private async syncSnapshot(projectId: string, branch: string, cloneUrl: string, token: string): Promise<{ commit: string; path: string }> {
    const root = path.join(this.cacheRoot, projectId); const mirror = path.join(root, 'mirror.git')
    await fs.mkdir(path.join(root, 'snapshots'), { recursive: true })
    const authorization = Buffer.from(`oauth2:${token}`).toString('base64')
    const env = { ...process.env, GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'http.extraHeader', GIT_CONFIG_VALUE_0: `Authorization: Basic ${authorization}`, GIT_TERMINAL_PROMPT: '0', HTTP_PROXY: '', HTTPS_PROXY: '', ALL_PROXY: '' }
    let mirrorExists = true
    try { await fs.access(mirror) } catch { mirrorExists = false }
    if (mirrorExists) {
      await this.run('git', ['--git-dir', mirror, 'remote', 'set-url', 'origin', cloneUrl], undefined, env)
      await this.run('git', ['--git-dir', mirror, 'fetch', '--prune', 'origin'], undefined, env, 120_000)
    } else {
      await this.run('git', ['clone', '--mirror', cloneUrl, mirror], undefined, env, 120_000)
    }
    const commit = (await this.run('git', ['--git-dir', mirror, 'rev-parse', `refs/heads/${branch}`])).trim()
    if (!/^[a-f0-9]{40}$/i.test(commit)) throw new Error('无法解析 Git commit')
    const snapshot = path.join(root, 'snapshots', commit)
    try { await fs.access(snapshot) } catch { await this.run('git', ['--git-dir', mirror, 'worktree', 'add', '--detach', snapshot, commit], undefined, undefined, 120_000) }
    await fs.writeFile(path.join(root, 'current.json'), JSON.stringify({ projectId, branch, commit, snapshot }, null, 2))
    return { commit, path: snapshot }
  }

  private parse(file: string, content: string): { symbols: SymbolNode[]; imports: ImportEdge[] } {
    const symbols: SymbolNode[] = [{ name: file, kind: 'module', path: file, exported: true, startLine: 1 }]
    const imports: ImportEdge[] = []
    content.split(/\r?\n/).forEach((raw, index) => {
      const line = raw.trim(); let match: RegExpMatchArray | null
      if (path.extname(file) === '.java') {
        if ((match = line.match(/^import\s+(?:static\s+)?([\w.]+);/))) imports.push({ from: file, to: match[1].replace(/\./g, '/') })
        else if ((match = line.match(/^(?:public\s+|private\s+|protected\s+)?(?:abstract\s+)?(class|interface|enum)\s+(\w+)/))) symbols.push({ name: match[2], kind: match[1] === 'interface' ? 'interface' : 'class', path: file, exported: line.startsWith('public'), startLine: index + 1 })
        else if ((match = line.match(/^(?:public|private|protected)\s+(?:static\s+)?[\w<>\[\]]+\s+(\w+)\s*\(/))) symbols.push({ name: match[1], kind: 'function', path: file, exported: line.startsWith('public'), startLine: index + 1 })
      } else {
        if ((match = line.match(/^import\s+.*?from\s+['"]([^'"]+)['"]/))) imports.push({ from: file, to: this.resolveImport(file, match[1]) })
        else if ((match = line.match(/^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/))) symbols.push({ name: match[1], kind: 'class', path: file, exported: line.includes('export'), startLine: index + 1 })
        else if ((match = line.match(/^(?:export\s+)?(?:interface|type)\s+(\w+)/))) symbols.push({ name: match[1], kind: 'interface', path: file, exported: line.includes('export'), startLine: index + 1 })
        else if ((match = line.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)/))) symbols.push({ name: match[1], kind: 'function', path: file, exported: line.includes('export'), startLine: index + 1 })
        else if ((match = line.match(/^export\s+(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?\(/))) symbols.push({ name: match[1], kind: 'function', path: file, exported: true, startLine: index + 1 })
      }
    })
    return { symbols, imports }
  }

  private resolveImport(file: string, target: string): string {
    if (!target.startsWith('.')) return target
    return path.posix.normalize(path.posix.join(path.posix.dirname(file), target)).replace(/^\.\//, '')
  }

  private async buildGraph(projectId: string, name: string, branch: string, commit: string, symbols: SymbolNode[], imports: ImportEdge[]): Promise<void> {
    await this.graph('MATCH (n) WHERE n.repoId=$projectId OR (n:Repo AND n.projectId=$projectId) DETACH DELETE n', { projectId })
    await this.graph('CREATE (:Repo {projectId:$projectId,name:$name,branch:$branch,commitSha:$commit,lastSyncAt:datetime()})', { projectId, name, branch, commit })
    for (const [kind, label] of Object.entries({ module: 'Module', class: 'Class', function: 'Function', interface: 'Interface' })) {
      const items = symbols.filter((symbol) => symbol.kind === kind)
      if (items.length) await this.graph(`UNWIND $items AS item CREATE (n:${label} {name:item.name,path:item.path,exported:item.exported,startLine:item.startLine,repoId:$projectId})`, { items, projectId })
    }
    await this.graph('MATCH (r:Repo {projectId:$projectId}),(m:Module {repoId:$projectId}) CREATE (r)-[:CONTAINS]->(m)', { projectId })
    await this.graph('MATCH (m:Module {repoId:$projectId}),(n {repoId:$projectId}) WHERE n.path=m.path AND NOT n:Module CREATE (m)-[:CONTAINS]->(n)', { projectId })
    if (imports.length) await this.graph('UNWIND $items AS item MATCH (a:Module {repoId:$projectId,path:item.from}),(b:Module {repoId:$projectId}) WHERE b.path=item.to OR b.path=item.to+".ts" OR b.path=item.to+"/index.ts" MERGE (a)-[:IMPORTS]->(b)', { items: imports, projectId })
  }

  /** 查询符号及一跳代码关系，供 Agent 和管理 UI 使用。 */
  async queryRelations(symbol: string, projectId?: string): Promise<any[]> {
    return this.graph(`MATCH (a)-[r]-(b) WHERE a.name CONTAINS $symbol ${projectId ? 'AND (a.repoId=$projectId OR a.projectId=$projectId)' : ''}
      RETURN labels(a)[0] AS sourceType,a.name AS source,a.path AS sourcePath,type(r) AS relation,labels(b)[0] AS targetType,b.name AS target,b.path AS targetPath LIMIT 100`, { symbol, projectId })
  }

  async tree(projectId: string): Promise<any> {
    const nodes = await this.graph<any>('MATCH (n) WHERE n.repoId=$projectId OR (n:Repo AND n.projectId=$projectId) RETURN elementId(n) AS id,labels(n)[0] AS type,n.name AS name,n.path AS path,n.startLine AS startLine LIMIT 500', { projectId })
    const edges = await this.graph<any>('MATCH (a)-[r]->(b) WHERE (a.repoId=$projectId OR a.projectId=$projectId) AND (b.repoId=$projectId OR b.projectId=$projectId) RETURN elementId(a) AS source,elementId(b) AS target,type(r) AS type LIMIT 1000', { projectId })
    return { nodes, edges }
  }

  async searchCode(projectId: string, text: string, maxResults = 60): Promise<string> {
    const repo = await queryOne<any>('SELECT name,branch,commit_sha,snapshot_path FROM codegraph_repository WHERE project_id=$1 AND status=\'ready\'', [projectId])
    if (!repo) throw new Error('仓库快照不可用')
    const output = await this.run('rg', ['--line-number', '--column', '--no-heading', '--color', 'never', '--fixed-strings', '--', text, '.'], repo.snapshot_path, undefined, 30_000, true)
    return [`[仓库] ${repo.name} (${projectId})`, `[版本] ${repo.branch}@${repo.commit_sha}`, ...output.split('\n').slice(0, Math.min(200, Math.max(1, maxResults)))].join('\n')
  }

  async readFile(projectId: string, file: string, start = 1, end = start + 199): Promise<string> {
    if (!file || file.split(/[\\/]/).includes('..')) throw new Error('非法文件路径')
    const repo = await queryOne<any>('SELECT name,branch,commit_sha,snapshot_path FROM codegraph_repository WHERE project_id=$1 AND status=\'ready\'', [projectId])
    if (!repo) throw new Error('仓库快照不可用')
    const root = path.resolve(repo.snapshot_path); const target = path.resolve(root, file)
    if (!target.startsWith(`${root}${path.sep}`)) throw new Error('文件路径越界')
    const lines = (await fs.readFile(target, 'utf8')).split(/\r?\n/)
    return [`[仓库] ${repo.name} (${projectId})`, `[版本] ${repo.branch}@${repo.commit_sha}`, ...lines.slice(start - 1, end).map((line, index) => `${start + index}: ${line}`)].join('\n')
  }

  async listFiles(projectId: string, pattern = ''): Promise<string[]> {
    const repo = await queryOne<any>('SELECT snapshot_path FROM codegraph_repository WHERE project_id=$1 AND status=\'ready\'', [projectId])
    if (!repo) throw new Error('仓库快照不可用')
    const files = (await this.run('rg', ['--files', '--glob', '!.git'], repo.snapshot_path)).split('\n').filter(Boolean)
    return (pattern ? files.filter((file) => file.toLowerCase().includes(pattern.toLowerCase())) : files).slice(0, 500)
  }

  async history(projectId: string, file?: string): Promise<string> {
    const repo = await queryOne<any>('SELECT name,branch,commit_sha,snapshot_path FROM codegraph_repository WHERE project_id=$1 AND status=\'ready\'', [projectId])
    if (!repo) throw new Error('仓库快照不可用')
    const mirror = path.join(path.dirname(path.dirname(repo.snapshot_path)), 'mirror.git')
    const args = ['--git-dir', mirror, 'log', '-20', '--date=short', '--pretty=format:%h %ad %an %s', repo.commit_sha]
    if (file) args.push('--', file)
    return [`[仓库] ${repo.name} (${projectId})`, `[版本] ${repo.branch}@${repo.commit_sha}`, await this.run('git', args)].join('\n')
  }

  async diff(projectId: string, base: string, target?: string, file?: string): Promise<string> {
    if (!/^[A-Za-z0-9._/@~^{}+-]{1,200}$/.test(base || '') || (target && !/^[A-Za-z0-9._/@~^{}+-]{1,200}$/.test(target))) throw new Error('非法 Git ref')
    const repo = await queryOne<any>('SELECT name,branch,commit_sha,snapshot_path FROM codegraph_repository WHERE project_id=$1 AND status=\'ready\'', [projectId])
    if (!repo) throw new Error('仓库快照不可用')
    const mirror = path.join(path.dirname(path.dirname(repo.snapshot_path)), 'mirror.git')
    const args = ['--git-dir', mirror, 'diff', '--no-ext-diff', '--unified=3', base, target || repo.commit_sha]
    if (file) args.push('--', file)
    return [`[仓库] ${repo.name} (${projectId})`, `[版本] ${repo.branch}@${repo.commit_sha}`, await this.run('git', args)].join('\n')
  }

  private async saveStatus(projectId: string, patch: Record<string, unknown>): Promise<void> {
    const existing = await queryOne<any>('SELECT * FROM codegraph_repository WHERE project_id=$1', [projectId])
    const row = { name: `Project ${projectId}`, branch: 'master', status: 'idle', ...existing, ...patch }
    await query(`INSERT INTO codegraph_repository(project_id,name,branch,commit_sha,clone_url,snapshot_path,status,file_count,node_count,edge_count,error,synced_at,updated_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now()) ON CONFLICT(project_id) DO UPDATE SET name=excluded.name,branch=excluded.branch,
      commit_sha=excluded.commit_sha,clone_url=excluded.clone_url,snapshot_path=excluded.snapshot_path,status=excluded.status,file_count=excluded.file_count,node_count=excluded.node_count,
      edge_count=excluded.edge_count,error=excluded.error,synced_at=excluded.synced_at,updated_at=now()`, [projectId, row.name, row.branch, row.commit_sha, row.clone_url, row.snapshot_path, row.status, row.file_count || 0, row.node_count || 0, row.edge_count || 0, row.error, row.synced_at])
  }

  private async run(command: string, args: string[], cwd?: string, env?: NodeJS.ProcessEnv, timeout = 30_000, allowNoMatch = false): Promise<string> {
    try { return (await execFileAsync(command, args, { cwd, env: env ? { ...process.env, ...env } : process.env, timeout, maxBuffer: 2_000_000 })).stdout.trim() }
    catch (error: any) {
      if (allowNoMatch && error.code === 1) return ''
      throw new Error(`${command} 执行失败: ${String(error.stderr || error.message).replace(/oauth2:[^@\s]+/gi, 'oauth2:***').slice(0, 1000)}`)
    }
  }
}

export const codeGraphService = new CodeGraphService()
