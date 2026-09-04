import assert from 'node:assert/strict'
import test from 'node:test'

process.env.AGENT_ENCRYPTION_KEY = 'test-only-encryption-key'
process.env.MCP_ALLOW_PRIVATE_NETWORK = 'false'
const security = await import('../dist/agent/security.js')

test('敏感凭据可加密解密且不保留明文', () => {
  const encrypted = security.encryptSecret('secret-value')
  assert.notEqual(encrypted, 'secret-value')
  assert.equal(security.decryptSecret(encrypted), 'secret-value')
})

test('MCP SSRF 防护拒绝回环和云元数据地址', () => {
  assert.throws(() => security.assertAllowedServiceUrl('http://127.0.0.1:3000/mcp'))
  assert.throws(() => security.assertAllowedServiceUrl('http://169.254.169.254/latest/meta-data'))
})

test('MCP SSRF 防护接受公开 HTTPS 地址', () => {
  assert.equal(security.assertAllowedServiceUrl('https://mcp.example.com/mcp').hostname, 'mcp.example.com')
})
