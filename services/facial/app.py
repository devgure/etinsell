from fastapi import FastAPI, UploadFile, File
app = FastAPI()

@app.post('/verify')
async def verify(image: UploadFile = File(...)):
    # Placeholder: in production we'd run face detection/embedding comparison
    content = await image.read()
    size = len(content)
    return {'verified': True if size % 2 == 0 else False, 'size_bytes': size}

@app.get('/health')
def health():
    return {'status':'ok'}
