# Sasahyog workspace instructions

- Use JavaScript modules and preserve the `client` and `server` split.
- Keep the server runnable in `DEMO_MODE` without external provider keys.
- Keep WebSocket event names compatible with the contract documented in `README.md`.
- Use Mongoose models for persisted intake data and graceful fallback when MongoDB is unavailable.
- Validate changes with `npm run build:client` and a server `/health` smoke test where possible.
