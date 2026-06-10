# coin_front — S3 + CloudFront 배포 메모

이 프로젝트는 Vite로 정적 `dist/`를 생성하는 SPA다. 서버 런타임(Node/Vercel)은 필요 없다.

## 1. 빌드

```bash
# .env.production 의 값으로 빌드 (override 가 필요하면 쉘 env 로 주입)
npm ci
npm run build
# → dist/  (index.html + assets/*.js, *.css)
```

`VITE_API_BASE_URL` 등은 **빌드 타임에 정적으로 박힌다**. 환경별로 다른 dist 가 필요하다 → 빌드를 환경별로 분리. CI에서:

```bash
VITE_API_BASE_URL=https://api.coindata.example.com \
VITE_USE_MOCK=false \
VITE_USE_MOCK_EXTERNAL=true \
npm run build
```

## 2. S3 업로드

- 버킷: `coin-front-prod` (예시)
- 정적 호스팅 켤 필요 없음 (CloudFront 가 OAC 로 직접 접근)
- `aws s3 sync dist/ s3://coin-front-prod/ --delete --cache-control "public, max-age=31536000, immutable" --exclude "index.html"`
- `aws s3 cp dist/index.html s3://coin-front-prod/index.html --cache-control "no-cache, no-store, must-revalidate"`
- 해시 들어간 `assets/*` 파일은 immutable 캐시. `index.html` 만 no-cache (라우팅·릴리즈 즉시 반영).

## 3. CloudFront — SPA 라우팅 fallback (필수)

react-router 가 `BrowserRouter` 라 `/market/BTC` 같은 딥링크 새로고침 시 S3 가 404 를 돌려준다. CloudFront 가 **404/403 → /index.html, 200** 으로 다시 쓰도록 설정:

**Distribution → Error pages**

| HTTP Error Code | Customize | Response page path | HTTP Response Code |
|---|---|---|---|
| 403 | Yes | `/index.html` | 200 |
| 404 | Yes | `/index.html` | 200 |

또는 CloudFront Functions / Lambda@Edge 로 URI rewrite 도 가능. 가장 간단한 건 Error pages 방식.

## 4. 캐시 / 무효화

- 릴리즈마다 `aws cloudfront create-invalidation --paths "/index.html"` (자산은 hash 가 바뀌어 자연 무효화)
- 배포 자동화 PR 에서 sync → invalidate 순서 보장

## 5. HTTPS / Mixed-content

- CloudFront 는 ACM 인증서로 HTTPS only (Redirect HTTP → HTTPS)
- `VITE_API_BASE_URL` 도 반드시 `https://` — HTTP API 면 브라우저가 mixed-content 차단
- SSE 도 같은 도메인이면 `VITE_SSE_BASE_URL` 생략 (fallback)

## 6. CORS / 쿠키 / 인증

httpClient 는 `credentials: 'include'` 로 호출하고, refresh 토큰을 httpOnly 쿠키로 받는다. 백엔드 CORS 설정에서:

- `Access-Control-Allow-Origin`: CloudFront 도메인 (와일드카드 금지 — credentials 와 같이 못 씀)
- `Access-Control-Allow-Credentials: true`
- 쿠키 도메인은 API/프론트 공통 부모 도메인 (예: `.coindata.example.com`) 또는 cross-site `SameSite=None; Secure`

## 7. 시크릿 / 외부 위젯

- `VITE_FINNHUB_API_KEY`, `VITE_GOLDAPI_KEY` 등은 **운영 빌드에 비워두기**. 번들에 들어가면 브라우저에 노출됨.
- 외부 위젯(F&G/금은/나스닥/10Y)은 운영에서도 mock 정적값을 표시 (`VITE_USE_MOCK_EXTERNAL=true`). 사유: `src/features/globalBar/api/externalMock.ts` 상단 주석.
- 백엔드 프록시 모듈이 추가되면 그때 분기 교체.

## 8. 동작 점검 체크리스트

- [ ] `npm run build` 성공 + `dist/` 생성
- [ ] CloudFront URL 접속 → `/` 정상 렌더
- [ ] `/watchlist` 딥링크 새로고침 → 200 (404 fallback 동작)
- [ ] DevTools Network 탭 → `/api/v1/*` 호출이 prod API 도메인으로 가는지 확인
- [ ] mock 잔재 (`localhost:8080`) 없음
- [ ] mixed-content / CORS 경고 없음
- [ ] `dist/assets/*.js` 에 `VITE_FINNHUB_API_KEY` / `VITE_GOLDAPI_KEY` 값이 박혀있지 않음

```bash
# 시크릿 누출 빠른 확인
grep -RE "FINNHUB|GOLDAPI" dist/assets/ || echo "OK: no external keys in bundle"
```
