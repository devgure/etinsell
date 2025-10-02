from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np

app = FastAPI()

class TextIn(BaseModel):
    text: str

@app.post('/embed')
def embed(req: TextIn):
    # Dummy deterministic embedding for scaffold
    vec = np.array([float(ord(c) % 32) for c in req.text[:32]])
    return {'embedding': vec.tolist()}

@app.get('/health')
def health():
    return {'status':'ok'}
