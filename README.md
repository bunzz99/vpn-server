# VPN Server - GitHub Pages + Cloudflare Pages

Free VPN subscription server using Cloudflare Pages Functions.

## Features
- ✅ Unlimited requests (multiple apps)
- ✅ WebSocket support
- ✅ Multiple VPN protocols
- ✅ Custom domains
- ✅ Auto-deploy from GitHub

## Deployment

1. Fork this repository
2. Connect to Cloudflare Pages
3. Add custom domain
4. Done!

## API Endpoints

- `GET /api/v1/sub` - Get subscription
- `GET /api/v1/check` - Health check
- `GET /api/v1/myip` - Get client IP
- `WebSocket /ws/...` - VPN protocols

## Local Development

```bash
npm install
npm run dev
