from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

app = Flask(__name__)
CORS(app)

with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

roles_map = {
    'doctor':0, 'nurse':1, 'lab_tech':2,
    'pharmacist':3, 'admin':4, 'it_security':5
}

resources_map = {
    '/api/ehr':0, '/api/lab':1, '/api/pharmacy':2,
    '/api/admin':3, '/api/patients':4
}

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        role             = roles_map.get(data.get('role','doctor'), 0)
        login_hour       = int(data.get('login_hour', 9))
        ip_known         = int(data.get('ip_known', 1))
        request_count    = int(data.get('request_count', 5))
        resource_zone    = resources_map.get(data.get('resource','/api/ehr'), 0)
        session_duration = int(data.get('session_duration', 30))
        failed_attempts  = int(data.get('failed_attempts', 0))
        device_known     = int(data.get('device_known', 1))

        features = np.array([[
            role, login_hour, ip_known,
            request_count, resource_zone,
            session_duration, failed_attempts, device_known
        ]])

        prediction = model.predict(features)[0]
        score      = model.score_samples(features)[0]
        is_anomaly = bool(prediction == -1)

        return jsonify({
            'is_anomaly':    is_anomaly,
            'anomaly_score': round(float(score), 4),
            'label':         'ANOMALY' if is_anomaly else 'NORMAL',
            'risk_level':    'HIGH'    if is_anomaly else 'LOW',
            'message':       'Suspicious activity detected' if is_anomaly else 'Normal behaviour'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({ 'status':'ML API running', 'model':'Isolation Forest' })


if __name__ == '__main__':
    print('Starting ML API on port 5001...')
    app.run(port=5001, debug=True)