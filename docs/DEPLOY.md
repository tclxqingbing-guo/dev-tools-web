# 远程服务器部署步骤

## 一、需要映射到宿主机的内容

当前项目只有 **后端数据目录** 需要持久化到宿主机：

| 映射目标（容器内） | 说明 |
|-------------------|------|
| `/app/data`       | 后端 SQLite 数据目录，内含 `notes.db`（笔记）、`wishes.db`（许愿/意见箱）。必须映射，否则重启容器后数据丢失。 |

其他无需映射：

- **环境变量**：通过 docker-compose 的 `environment` 或宿主机 `.env` 传入即可，无需挂载文件（可选：若用 `.env` 文件可挂载 `./.env:/app/.env`，需后端支持从该路径读）。
- **日志**：当前仅控制台输出，不写文件，无需映射。
- **前端**：纯静态资源，由 Nginx 提供，无持久化数据。

`docker-compose.yml` 中已配置命名 volume `backend-data` 挂载到 `/app/data`。若希望**直接映射到宿主机目录**（便于备份、迁移），可改为：

```yaml
# 将 volumes 中的 backend 部分改为：
volumes:
  - /your/host/path/dev-tools-data:/app/data
```

---

## 二、部署到远程服务器的具体步骤

### 1. 服务器环境准备

- 安装 Docker 与 Docker Compose（V2）。
- 开放端口：用于访问前端的端口（如下示例为 `8080`，可改）。

```bash
# 示例：Ubuntu
sudo apt update && sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
```

### 2. 上传代码

在本地打包并上传（或使用 git clone）：

```bash
# 本地：打包（排除 node_modules、.git 等）
cd /path/to/dev-tools-web
tar --exclude=node_modules --exclude=.git --exclude=packages/frontend/dist --exclude=packages/backend/dist -czvf dev-tools-web.tar.gz .

# 上传到服务器
scp dev-tools-web.tar.gz user@your-server:/opt/dev-tools-web/
```

在服务器上解压：

```bash
ssh user@your-server
cd /opt/dev-tools-web
tar -xzvf dev-tools-web.tar.gz
```

或直接在服务器上 git clone：

```bash
cd /opt
git clone <your-repo-url> dev-tools-web
cd dev-tools-web
```

### 3. 配置环境变量

在项目根目录创建 `.env`（与 `docker-compose.yml` 同目录）：

```bash
cd /opt/dev-tools-web
cp .env.example .env
vim .env
```

按需填写，例如：

```env
# 前端访问端口（浏览器访问的端口）
FRONTEND_PORT=8080

# 可选：AI 能力
AI_API_BASE_URL=https://api.openai.com
AI_API_KEY=sk-xxx
# 若只用分用途密钥、不设 AI_API_KEY，务必在 compose 里传入（仓库已包含）：
# AI_API_KEY-CHAT=sk-xxx
# AI_API_KEY-IMAGE=sk-xxx
```

保存后确认 `docker-compose.yml` 会通过 **`env_file: .env`** 把整份 `.env` 注入 backend（带连字符的 `AI_API_KEY-CHAT` 等才能正确传入；不要用 `${AI_API_KEY-CHAT:-}` 写在 `environment` 里，Compose 会解析错）。

### 4. 构建并启动

```bash
cd /opt/dev-tools-web
docker compose -f docker-compose.yml build --no-cache
docker compose -f docker-compose.yml up -d
```

**仅 `git pull` 再 `docker compose up -d` 不会更新页面**：前端是构建时打进镜像的静态文件，容器一直在跑旧镜像。更新代码后必须**至少重建 frontend** 再起容器：

```bash
cd /opt/dev-tools-web
git pull
docker compose build frontend
docker compose up -d
```

改了后端或依赖时可用 `docker compose build` 全量构建；想彻底避免缓存问题可加 `--no-cache`。

### 5. 验证

- 浏览器访问：`http://服务器IP:8080`（端口与 `FRONTEND_PORT` 一致）。
- 检查后端健康：`curl http://服务器IP:8080/api/health`，应返回 `{"status":"ok",...}`。
- 数据持久化：在许愿池/笔记里写一条数据，重启容器后数据仍在：

```bash
docker compose restart backend
# 再刷新页面查看数据是否还在
```

### 6. 可选：数据目录映射到宿主机路径

若希望数据在宿主机固定目录（便于备份、迁移），先创建目录并改 compose：

```bash
sudo mkdir -p /opt/dev-tools-web/data
sudo chown 1000:1000 /opt/dev-tools-web/data   # 与容器内运行用户一致（按需调整）
```

编辑 `docker-compose.yml`，将 backend 的 volumes 改为：

```yaml
volumes:
  - /opt/dev-tools-web/data:/app/data
```

然后重启：

```bash
docker compose up -d
```

---

## 三、常用运维命令

```bash
# 查看日志
docker compose logs -f

# 仅后端日志
docker compose logs -f backend

# 停止
docker compose down

# 停止并删除数据 volume（慎用，会清空笔记与许愿数据）
docker compose down -v
```

---

## 四、后期更新部署

代码或配置有更新时，在服务器上按以下步骤操作即可（**数据 volume 不会动，笔记和许愿数据会保留**）。

### 1. 拉取最新代码

```bash
cd /opt/dev-tools-web

# 若本地改过文件（如 docker-compose.yml）导致无法 pull，二选一：
# 方式 A：用远程版本覆盖该文件后再拉取
git checkout -- docker-compose.yml
git pull

# 方式 B：暂存本地修改再拉取（之后需要可 git stash pop）
git stash push -m "local" -- docker-compose.yml
git pull
```

### 2. 重新构建并启动

```bash
# 全量重新构建并启动（推荐，避免缓存导致未用到新代码）
docker compose -f docker-compose.yml build --no-cache
docker compose -f docker-compose.yml up -d
```

若确定只改了前端或只改了后端，可只构建对应服务（更快）：

```bash
# 只更新前端
docker compose build --no-cache frontend && docker compose up -d frontend

# 只更新后端
docker compose build --no-cache backend && docker compose up -d backend
```

### 3. 确认

- 浏览器访问并刷新（必要时强刷 Ctrl+F5）。
- `curl http://服务器IP:8080/api/health` 返回正常即表示后端已更新。

### 4. 若更新了 .env

改完 `.env` 后需重启服务使环境变量生效：

```bash
docker compose up -d
```

无需重新 build，除非 Dockerfile 或依赖有变。

---

## 五、小结

- **必须持久化的只有**：后端数据目录 `/app/data`（内含 `notes.db`、`wishes.db`）。
- 已用命名 volume `backend-data` 时，数据在 Docker 管理目录下，重启/重建容器不会丢。
- 若要自己备份或迁移，可改为绑定宿主机目录，例如 `/opt/dev-tools-web/data:/app/data`。
- **后期更新**：服务器上 `git pull` → `docker compose build --no-cache` → `docker compose up -d`，数据不会丢失。
