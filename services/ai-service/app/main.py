from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import numpy as np
import uvicorn

app = FastAPI(title='Etincel AI Engine')

class EmbedRequest(BaseModel):
    texts: list[str]

@app.get('/health')
async def health():
    return {'status':'ok'}

@app.post('/embeddings')
async def embeddings(req: EmbedRequest):
    # Stub: return deterministic random vectors for each text
    out = []
    for t in req.texts:
        vec = np.random.RandomState(abs(hash(t)) % (2**32)).randn(768).tolist()
        out.append(vec)
    return {'embeddings': out}

@app.post('/match')
async def match(payload: dict):
    # payload: { 'userId': '...', 'candidates': [{id, embedding}, ...] }
    # Return top-k by cosine similarity (stub: random order)
    candidates = payload.get('candidates', [])
    # naive: shuffle and return first 10 ids
    ids = [c.get('id') for c in candidates]
    return {'matches': ids[:10]}

if __name__ == '__main__':
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)
