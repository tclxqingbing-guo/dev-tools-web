import pg from 'pg'

const { Pool } = pg
const pool = new Pool({
  connectionString: process.env.AGENT_DATABASE_URL || 'postgresql://bx:bx_pass@postgres:5432/bx_agent',
  max: Number(process.env.AGENT_DB_POOL_SIZE || 10),
})

let initialized: Promise<void> | null = null

/** 初始化统一 Agent 的持久化表，重复执行安全。 */
export function initAgentDb(): Promise<void> {
  if (initialized) return initialized
  initialized = pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE TABLE IF NOT EXISTS agent_conversation (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id text NOT NULL,
      title text NOT NULL DEFAULT '新会话',
      mode text NOT NULL DEFAULT 'auto',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_agent_conversation_user_updated
      ON agent_conversation(user_id, updated_at DESC);
    CREATE TABLE IF NOT EXISTS agent_message (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id uuid NOT NULL REFERENCES agent_conversation(id) ON DELETE CASCADE,
      role text NOT NULL,
      content text NOT NULL DEFAULT '',
      status text NOT NULL DEFAULT 'completed',
      run_id uuid,
      sources jsonb NOT NULL DEFAULT '[]',
      trace jsonb NOT NULL DEFAULT '[]',
      usage jsonb NOT NULL DEFAULT '{}',
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_agent_message_conversation
      ON agent_message(conversation_id, created_at);
    CREATE TABLE IF NOT EXISTS agent_run (
      run_id uuid PRIMARY KEY,
      conversation_id uuid NOT NULL REFERENCES agent_conversation(id) ON DELETE CASCADE,
      user_id text NOT NULL,
      mode text NOT NULL,
      status text NOT NULL DEFAULT 'running',
      tool_count integer NOT NULL DEFAULT 0,
      started_at timestamptz NOT NULL DEFAULT now(),
      first_token_at timestamptz,
      finished_at timestamptz,
      duration_ms integer,
      error text
    );
    CREATE INDEX IF NOT EXISTS idx_agent_run_started ON agent_run(started_at DESC);
    CREATE TABLE IF NOT EXISTS agent_attachment (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id text NOT NULL,
      conversation_id uuid REFERENCES agent_conversation(id) ON DELETE CASCADE,
      filename text NOT NULL,
      mime_type text NOT NULL,
      size_bytes bigint NOT NULL,
      storage_path text NOT NULL,
      parsed_text_path text,
      status text NOT NULL DEFAULT 'uploaded',
      error text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS agent_mcp_server (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL UNIQUE,
      title text NOT NULL,
      url text NOT NULL,
      enabled boolean NOT NULL DEFAULT true,
      purpose text NOT NULL DEFAULT '',
      encrypted_token text,
      tool_allowlist jsonb NOT NULL DEFAULT '[]',
      timeout_seconds integer NOT NULL DEFAULT 20,
      status text NOT NULL DEFAULT 'unknown',
      latency_ms integer,
      last_error text,
      tools jsonb NOT NULL DEFAULT '[]',
      checked_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS agent_audit_log (
      id bigserial PRIMARY KEY,
      user_id text NOT NULL,
      action text NOT NULL,
      target text,
      detail jsonb NOT NULL DEFAULT '{}',
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS agent_setting (
      key text PRIMARY KEY,
      value jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS codegraph_repository (
      project_id text PRIMARY KEY,
      name text NOT NULL,
      branch text NOT NULL,
      commit_sha text,
      clone_url text,
      snapshot_path text,
      status text NOT NULL DEFAULT 'idle',
      file_count integer NOT NULL DEFAULT 0,
      node_count integer NOT NULL DEFAULT 0,
      edge_count integer NOT NULL DEFAULT 0,
      error text,
      synced_at timestamptz,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `).then(() => undefined).catch((error) => {
    initialized = null
    throw error
  })
  return initialized
}

export async function query<T>(text: string, values: unknown[] = []): Promise<T[]> {
  await initAgentDb()
  return (await pool.query(text, values)).rows as T[]
}

export async function queryOne<T>(text: string, values: unknown[] = []): Promise<T | null> {
  return (await query<T>(text, values))[0] || null
}

export { pool as agentDb }
