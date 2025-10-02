from fastapi import FastAPI
app = FastAPI(title='Etincel Analytics')

@app.get('/health')
async def health():
    return {'status':'ok'}

@app.post('/event')
async def event(payload: dict):
    # In production: stream to BigQuery/Snowflake
    print('received event', payload.get('type'))
    return {'ok': True}
