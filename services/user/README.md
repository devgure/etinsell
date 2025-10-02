User service scaffold

Endpoints:
- GET /health
- POST /users { email, name, password }
- GET /users/:id

This service uses Prisma client and expects a generated Prisma client in node_modules. Run `npm install` and `npx prisma generate` when developing locally.
