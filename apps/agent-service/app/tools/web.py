import asyncio
import ipaddress
import socket
from typing import Any
from urllib.parse import urlparse

import httpx


def _domain_allowed(value: str, config: dict[str, Any]) -> bool:
    host = (urlparse(value).hostname or '').lower()
    allowed = [item.strip().lower() for item in str(config.get('search.allowedDomains') or '').split(',') if item.strip()]
    blocked = [item.strip().lower() for item in str(config.get('search.blockedDomains') or '').split(',') if item.strip()]
    matches = lambda rule: host == rule or host.endswith('.' + rule)
    return not any(matches(rule) for rule in blocked) and (not allowed or any(matches(rule) for rule in allowed))


def _http_url(value: str) -> str:
    parsed = urlparse(value)
    host = (parsed.hostname or '').lower()
    if parsed.scheme not in {'http', 'https'}:
        raise ValueError('只允许读取 HTTP/HTTPS 网页')
    return value


async def _public_url(value: str) -> str:
    """校验网页地址及 DNS 解析结果，阻止通过域名绕过私网限制。"""
    value = _http_url(value)
    host = urlparse(value).hostname or ''
    if host.lower() == 'localhost':
        raise ValueError('禁止读取本机或私网地址')
    records = await asyncio.to_thread(socket.getaddrinfo, host, None)
    for record in records:
        address = ipaddress.ip_address(record[4][0])
        if not address.is_global:
            raise ValueError('禁止读取本机、私网或云元数据地址')
    return value


async def search_web(reason: str, query: str, config: dict[str, Any], max_results: int = 8) -> dict[str, Any]:
    """联网搜索并返回可引用的标题、URL、摘要和发布时间。"""
    primary = str(config.get('search.primary') or 'searxng')
    fallback = str(config.get('search.fallback') or 'tavily')
    providers = [primary] + ([fallback] if fallback not in {'', 'none', primary} else [])
    errors: list[str] = []
    for provider in providers:
        try:
            timeout = float(config.get('search.timeoutSeconds') or 15)
            limit = min(10, max(1, int(max_results or config.get('search.maxResults') or 8)))
            async with httpx.AsyncClient(timeout=timeout, trust_env=False) as client:
                if provider == 'searxng':
                    base = _http_url(str(config.get('search.searxngUrl') or 'http://searxng:8080'))
                    engines = str(config.get('search.searxngEngines') or 'sogou').strip()
                    params = {'q': query, 'format': 'json'}
                    if engines:
                        params['engines'] = engines
                    response = await client.get(f'{base.rstrip("/")}/search', params=params)
                    response.raise_for_status()
                    rows = response.json().get('results', [])[:limit]
                    result = [{'title': r.get('title'), 'url': r.get('url'), 'snippet': r.get('content'), 'publishedAt': r.get('publishedDate'), 'source': 'searxng'} for r in rows]
                elif provider == 'tavily':
                    key = str(config.get('search.tavilyKey') or '')
                    if not key:
                        raise ValueError('未配置 Tavily API Key')
                    response = await client.post('https://api.tavily.com/search', json={'api_key': key, 'query': query, 'max_results': limit, 'include_answer': False})
                    response.raise_for_status()
                    rows = response.json().get('results', [])
                    result = [{'title': r.get('title'), 'url': r.get('url'), 'snippet': r.get('content'), 'publishedAt': r.get('published_date'), 'source': 'tavily'} for r in rows]
                else:
                    raise ValueError(f'未知搜索服务: {provider}')
            return {'results': [item for item in result if item.get('url') and _domain_allowed(str(item['url']), config)]}
        except Exception as error:  # noqa: BLE001
            errors.append(f'{provider}: {error}')
    return {'results': [], 'error': '联网搜索失败：' + '; '.join(errors)}


async def read_web_page(reason: str, url: str, config: dict[str, Any]) -> str:
    """读取公开网页正文，限制响应大小避免上下文失控。"""
    from bs4 import BeautifulSoup
    if not _domain_allowed(url, config):
        raise ValueError('目标域名不在联网读取策略内')
    async with httpx.AsyncClient(timeout=20, follow_redirects=False, trust_env=False) as client:
        current = url
        for _ in range(6):
            response = await client.get(await _public_url(current), headers={'User-Agent': 'BX-Agent/1.0'})
            if response.is_redirect:
                target = response.headers.get('location')
                if not target:
                    break
                current = str(response.url.join(target))
                continue
            break
        else:
            raise ValueError('网页重定向次数过多')
        response.raise_for_status()
        if int(response.headers.get('content-length') or 0) > 2_000_000:
            raise ValueError('网页内容超过 2MB 限制')
        soup = BeautifulSoup(response.text[:2_000_000], 'html.parser')
        for node in soup(['script', 'style', 'nav', 'footer']):
            node.decompose()
        return ' '.join(soup.get_text('\n').split())[:50000]
