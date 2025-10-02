AI Engine (FastAPI)

Run locally:

```bash
cd services/ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Endpoints:
- GET /health
- POST /embeddings { texts: [string] }
- POST /match { userId, candidates }

Queue:
- services/ai-queue-node contains a producer and worker using Redis + BullMQ. Start Redis and run the worker to process embedding jobs.
