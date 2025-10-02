# Etincell - Dating App MVP scaffold

This repository contains a microservice scaffold for an MVP dating app with a modular architecture.

Services included:
- auth (Node/Express) - signup/login, JWT
- gateway (Node/Express) - API gateway/proxy
- match (Python/Flask) - profile store and search with vector similarity
- blockchain (Node/Express) - mock verifier for blockchain-based verification

Additional services added in this scaffold:
- user (Node/Prisma) - user CRUD using Prisma + MongoDB
- payment (Node/Stripe) - Stripe webhook handler stub
- ai (Python/FastAPI) - embedding endpoint stub
- facial (Python/FastAPI) - photo verification stub
- notification (Node/Socket.IO) - real-time notifications
- media (Node/Express) - file uploads (local uploads/MinIO stub)

Run locally with Docker Compose:

1. docker-compose up --build
2. Gateway: http://localhost:3000

Service endpoints (examples):
- Auth: http://localhost:3001/
- User: http://localhost:3002/health
- Match: http://localhost:5000/
- AI: http://localhost:8000/health
- Facial: http://localhost:8010/health
- Payment webhook: http://localhost:3010/webhook
- Notification Socket.IO: ws://localhost:3020
- Media upload: http://localhost:3030/upload

Notes:
- This is a minimal scaffold for demonstration. Add persistent databases, message queues, auth hardening, rate limiting, and full mobile clients for production.
