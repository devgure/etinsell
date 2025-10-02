from flask import Flask, request, jsonify
from math import radians, cos, sin, asin, sqrt
import numpy as np

app = Flask(__name__)

# In-memory profiles: {id: {id, name, lat, lon, vector}}
profiles = {}

def haversine(lat1, lon1, lat2, lon2):
    # convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    km = 6371 * c
    return km

@app.post('/profiles')
def create_profile():
    data = request.json
    pid = data.get('id') or str(len(profiles)+1)
    vec = np.array(data.get('vector', []), dtype=float)
    profiles[pid] = { 'id': pid, 'name': data.get('name'), 'lat': data.get('lat'), 'lon': data.get('lon'), 'vector': vec }
    return jsonify({'id': pid}), 201

@app.get('/search')
def search():
    # requires lat/lon and optional radius_km
    lat = float(request.args.get('lat', 0))
    lon = float(request.args.get('lon', 0))
    radius = float(request.args.get('radius_km', 50))
    qvec = np.array([float(x) for x in request.args.get('v', '').split(',')]) if request.args.get('v') else None
    candidates = []
    for p in profiles.values():
        dist = haversine(lat, lon, p['lat'], p['lon']) if p['lat'] is not None else 1e6
        if dist <= radius:
            score = 1.0
            if qvec is not None and p['vector'].size>0:
                # cosine similarity
                a = qvec; b = p['vector']
                score = float(np.dot(a,b) / (np.linalg.norm(a)*np.linalg.norm(b)+1e-8))
            candidates.append({'id': p['id'], 'name': p['name'], 'distance_km': dist, 'score': score})
    candidates.sort(key=lambda x: -x['score'])
    return jsonify({'results': candidates[:50]})

@app.get('/')
def root():
    return jsonify({'status':'ok','profiles':len(profiles)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
