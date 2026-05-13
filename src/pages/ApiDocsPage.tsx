import { useMemo, useState } from 'react'

type Endpoint = {
  method: 'GET' | 'POST' | 'DELETE' | 'PUT'
  path: string
  summary: string
  tag: string
  description?: string
  params?: { name: string; in: 'path' | 'query'; type: string; required: boolean; desc: string }[]
  responseSchema?: string
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'GET', path: '/api/v1/market/ticks/latest/{id}', summary: '최신 틱 단건 조회', tag: 'Market',
    description: '특정 마켓 코드의 최신 실시간 틱(매수/매도 호가)을 반환합니다.',
    params: [{ name: 'id', in: 'path', type: 'number', required: true, desc: 'marketCodeId' }],
    responseSchema: '{ marketCodeId: number, bid: string, ask: string, ts: number }',
  },
  {
    method: 'GET', path: '/api/v1/market/ticks/latest', summary: '최신 틱 벌크 조회', tag: 'Market',
    params: [{ name: 'ids', in: 'query', type: 'number[]', required: true, desc: '복수 marketCodeId' }],
    responseSchema: 'TickLatestView[]',
  },
  {
    method: 'GET', path: '/api/v1/market/premium/snapshot/{base}', summary: '김프 스냅샷', tag: 'Market',
    params: [{ name: 'base', in: 'path', type: 'string', required: true, desc: 'BTC | ETH | XRP | SOL' }],
    responseSchema: 'PremiumSnapshot[]',
  },
  {
    method: 'GET', path: '/api/v1/market/premium/ranking', summary: '김프 랭킹', tag: 'Market',
    params: [{ name: 'n', in: 'query', type: 'number', required: false, desc: '상위 N개 (default 10)' }],
    responseSchema: 'PremiumRankItem[]',
  },
  {
    method: 'GET', path: '/api/v1/market/fx/latest', summary: '최신 환율', tag: 'Market',
    responseSchema: '{ usdKrw: string, ts: number }',
  },
  {
    method: 'GET', path: '/api/v1/analytics/candles', summary: '캔들 시계열 조회', tag: 'Analytics',
    description: '특정 마켓 코드의 캔들 OHLCV 시계열 데이터 (CursorPage).',
    params: [
      { name: 'marketCodeId', in: 'query', type: 'number', required: true, desc: '마켓 코드 ID' },
      { name: 'interval', in: 'query', type: 'string', required: true, desc: '1m | 5m | 15m | 1h | 4h | 1d' },
      { name: 'cursor', in: 'query', type: 'number', required: false, desc: '커서 (다음 페이지)' },
      { name: 'limit', in: 'query', type: 'number', required: false, desc: '페이지 크기 (default 100)' },
    ],
    responseSchema: 'CursorPage<TickCandleView>',
  },
  {
    method: 'GET', path: '/api/v1/analytics/indicators', summary: '지표 시계열 조회', tag: 'Analytics',
    params: [
      { name: 'marketCodeId', in: 'query', type: 'number', required: true, desc: '마켓 코드 ID' },
      { name: 'type', in: 'query', type: 'string', required: true, desc: 'EMA | RSI | STDDEV' },
      { name: 'period', in: 'query', type: 'number', required: true, desc: '기간' },
    ],
    responseSchema: 'CursorPage<IndicatorPointView>',
  },
  {
    method: 'GET', path: '/api/v1/economic/calendar', summary: '경제지표 캘린더', tag: 'Economic',
    params: [
      { name: 'fromTs', in: 'query', type: 'number', required: true, desc: '시작 epoch ms' },
      { name: 'toTs', in: 'query', type: 'number', required: true, desc: '종료 epoch ms' },
    ],
    responseSchema: 'EconomicEventView[]',
  },
  {
    method: 'GET', path: '/api/v1/economic/indicators/{codeId}/series', summary: '경제지표 시계열', tag: 'Economic',
    params: [{ name: 'codeId', in: 'path', type: 'number', required: true, desc: '지표 코드 ID' }],
    responseSchema: 'CursorPage<EconomicDataPoint>',
  },
  {
    method: 'GET', path: '/api/v1/meta/exchanges', summary: '거래소 목록', tag: 'Meta',
    responseSchema: 'ExchangeView[]',
  },
  {
    method: 'GET', path: '/api/v1/meta/markets/search', summary: '마켓 검색', tag: 'Meta',
    params: [{ name: 'q', in: 'query', type: 'string', required: true, desc: '검색어 (심볼/이름)' }],
    responseSchema: 'OffsetPage<MarketCodeView>',
  },
  {
    method: 'GET', path: '/api/v1/compose/dashboard', summary: '대시보드 컴포지션', tag: 'Compose',
    responseSchema: 'DashboardCompositionView',
  },
  {
    method: 'GET', path: '/api/v1/stream/ticks', summary: 'SSE 틱 스트림', tag: 'Stream',
    description: 'SSE 구독. text/event-stream 응답. 이벤트명: tick',
    params: [{ name: 'marketCodeId', in: 'query', type: 'number', required: true, desc: '구독할 마켓 코드' }],
    responseSchema: 'event: tick\ndata: { marketCodeId, bid, ask, ts }',
  },
  {
    method: 'GET', path: '/api/v1/stream/premium', summary: 'SSE 프리미엄 스트림', tag: 'Stream',
    description: 'SSE 구독. 이벤트명: premium',
    responseSchema: 'event: premium\ndata: PremiumSnapshot',
  },
]

const TAGS = Array.from(new Set(ENDPOINTS.map((e) => e.tag)))

type CodeTab = 'curl' | 'js' | 'python' | 'java'

function makeCurlExample(ep: Endpoint): string {
  const base = 'http://localhost:8080'
  const path = ep.path.replace(/{(\w+)}/g, ':$1')
  return `curl -X ${ep.method} \\
  "${base}${path}" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json"`
}

function makeJsExample(ep: Endpoint): string {
  const base = 'http://localhost:8080'
  const path = ep.path.replace(/{(\w+)}/g, '${id}')
  return `const res = await fetch(\`${base}${path}\`, {
  method: '${ep.method}',
  headers: {
    Authorization: \`Bearer \${token}\`,
  },
})
const data = await res.json()
console.log(data)`
}

function makePythonExample(ep: Endpoint): string {
  const base = 'http://localhost:8080'
  const path = ep.path.replace(/{(\w+)}/g, '{id}')
  return `import httpx

url = f"${base}${path}"
headers = {"Authorization": f"Bearer {token}"}
r = httpx.get(url, headers=headers)
data = r.json()
print(data)`
}

function makeJavaExample(ep: Endpoint): string {
  return `WebClient client = WebClient.create("http://localhost:8080");

client.${ep.method.toLowerCase()}()
    .uri("${ep.path}")
    .header("Authorization", "Bearer " + token)
    .retrieve()
    .bodyToMono(String.class)
    .block();`
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-lang">{lang}</span>
        <button type="button" className="btn-sm" onClick={copy}>{copied ? '복사됨 ✓' : '복사'}</button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  )
}

function EndpointDetail({ ep }: { ep: Endpoint }) {
  const [tab, setTab] = useState<CodeTab>('curl')
  const codeMap: Record<CodeTab, string> = {
    curl: makeCurlExample(ep),
    js: makeJsExample(ep),
    python: makePythonExample(ep),
    java: makeJavaExample(ep),
  }

  return (
    <div className="endpoint-detail">
      <div className="endpoint-title-row">
        <span className={`method-badge ${ep.method.toLowerCase()}`}>{ep.method}</span>
        <code className="endpoint-path">{ep.path}</code>
      </div>
      <h2>{ep.summary}</h2>
      {ep.description && <p className="endpoint-desc">{ep.description}</p>}

      {ep.params && ep.params.length > 0 && (
        <div className="endpoint-section">
          <h3>Parameters</h3>
          <table className="param-table">
            <thead><tr><th>Name</th><th>In</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
            <tbody>
              {ep.params.map((p) => (
                <tr key={p.name}>
                  <td><code>{p.name}</code></td>
                  <td><span className="param-in">{p.in}</span></td>
                  <td><span className="param-type">{p.type}</span></td>
                  <td>{p.required ? <span className="text-positive">✓</span> : <span className="muted">—</span>}</td>
                  <td>{p.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ep.responseSchema && (
        <div className="endpoint-section">
          <h3>Response 200</h3>
          <pre className="response-schema"><code>{ep.responseSchema}</code></pre>
        </div>
      )}

      <div className="endpoint-section">
        <h3>예시</h3>
        <div className="code-tab-bar">
          {(['curl', 'js', 'python', 'java'] as CodeTab[]).map((t) => (
            <button key={t} type="button" className={tab === t ? 'tab active' : 'tab'} onClick={() => setTab(t)}>
              {t === 'js' ? 'JavaScript' : t === 'python' ? 'Python' : t === 'java' ? 'Java' : 'curl'}
            </button>
          ))}
        </div>
        <CodeBlock code={codeMap[tab]} lang={tab} />
      </div>

      <div className="endpoint-section">
        <h3>Error Responses</h3>
        <pre className="response-schema error-schema"><code>{`// RFC 7807 ProblemDetail
{
  "type": "about:blank",
  "title": "Not Found",
  "status": 404,
  "detail": "marketCodeId not found",
  "instance": "${ep.path}"
}`}</code></pre>
      </div>
    </div>
  )
}

export function ApiDocsPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Endpoint>(ENDPOINTS[0])
  const [openTags, setOpenTags] = useState<Set<string>>(new Set(TAGS))

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return ENDPOINTS
    return ENDPOINTS.filter((e) =>
      e.path.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      e.tag.toLowerCase().includes(q)
    )
  }, [search])

  function toggleTag(tag: string) {
    setOpenTags((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag); else next.add(tag)
      return next
    })
  }

  return (
    <div className="api-docs-layout">
      <aside className="api-docs-sidebar">
        <div className="docs-search-wrap">
          <input
            type="search"
            placeholder="엔드포인트 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="API 엔드포인트 검색"
          />
        </div>
        <nav className="docs-nav" aria-label="API 엔드포인트 목록">
          {TAGS.map((tag) => {
            const tagEndpoints = filtered.filter((e) => e.tag === tag)
            if (tagEndpoints.length === 0) return null
            return (
              <div key={tag} className="docs-nav-group">
                <button
                  type="button"
                  className="docs-nav-tag"
                  onClick={() => toggleTag(tag)}
                  aria-expanded={openTags.has(tag)}
                >
                  <span>{openTags.has(tag) ? '▾' : '▸'}</span> {tag}
                </button>
                {openTags.has(tag) && (
                  <ul className="docs-nav-list">
                    {tagEndpoints.map((ep) => (
                      <li key={ep.path}>
                        <button
                          type="button"
                          className={`docs-nav-item ${selected.path === ep.path && selected.method === ep.method ? 'active' : ''}`}
                          onClick={() => setSelected(ep)}
                        >
                          <span className={`method-badge sm ${ep.method.toLowerCase()}`}>{ep.method}</span>
                          <span className="nav-item-summary">{ep.summary}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </nav>
        <div className="docs-swagger-hint">
          dev 환경에서 Swagger UI:<br />
          <code>/swagger-ui.html</code>
        </div>
      </aside>

      <main className="api-docs-main">
        <EndpointDetail ep={selected} />
      </main>
    </div>
  )
}
