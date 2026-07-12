# WebCanDoIt

Live demos of what your browser can do today — installable apps, on-device AI, hardware
access, and everything in between. Own implementation inspired by whatpwacando.today (no code
shared with it).

## Development

Requires Node >= 22.

    npm install
    npm run dev        # app on :5173, api on :8080

Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run e2e`.

## Publishing a build

Multi-platform builds need a `docker-container` builder (the default `docker` driver
cannot push amd64+arm64 in one go):

    docker buildx create --name multiarch --driver docker-container --use
    docker buildx inspect --bootstrap

Then build and push (`docker login` first if needed):

    docker buildx build --platform linux/amd64,linux/arm64 \
    -t gorobetsva/webcandoit:latest \
    -t gorobetsva/webcandoit:$(git rev-parse --short HEAD) \
    --push .

## Deployment (VPS)

The VPS only needs `docker-compose.yml` — not the source tree. The container binds
to `127.0.0.1:8080` only; an external Nginx (behind Cloudflare) reverse-proxies to it
and terminates TLS.

    docker compose pull
    docker compose up -d

Nginx proxies to the node server, which serves the SPA and the API from one origin.
To deploy a new version after a fresh push: repeat `docker compose pull && docker
compose up -d` — Compose only restarts the `app` service since the image changed.

Example Nginx server block:

    server {
        listen 80;
        server_name your.domain;

        location / {
            proxy_pass http://127.0.0.1:18080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

### Web Push

Push notifications need a VAPID key pair. Generate one once:

    npx web-push generate-vapid-keys

Add the output to the VPS `.env`:

    echo "VAPID_PUBLIC_KEY=<public key>" >> .env
    echo "VAPID_PRIVATE_KEY=<private key>" >> .env

Then `docker compose up -d` to pick them up. Subscriptions persist in the `push-data` volume
across redeploys. Without these keys set, the push-notifications demo shows a "not configured"
message but the rest of the site is unaffected.
