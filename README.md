# proxmox-frond

Cloudflare Workers + D1 + R2 기반으로 Proxmox 자동화 플랫폼을 만드는 초기 스켈레톤입니다.

## 빠른 시작

```bash
npm install
npm run dev
```

## 환경 설정

`wrangler.toml`의 D1/R2 설정을 실제 값으로 교체하세요.

## API (초기 스텁)

- `GET /health`
- `GET /vms`
- `POST /vms`
- `GET /vms/:id`
- `DELETE /vms/:id`
- `PUT /vms/:id/reset`

## 마이그레이션

```bash
npx wrangler d1 migrations apply proxmox-frond
```
