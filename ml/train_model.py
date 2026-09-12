import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import pickle

df = pd.read_csv('dataset.csv')

features = [
    'role','login_hour','ip_known',
    'request_count','resource_zone',
    'session_duration','failed_attempts','device_known'
]

X = df[features]
y = df['label']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.28, random_state=42
)

print(f'Training samples : {len(X_train)}')
print(f'Testing samples  : {len(X_test)}')

model = IsolationForest(
    n_estimators=100,
    contamination=0.1,
    random_state=42
)
model.fit(X_train)

y_pred_raw = model.predict(X_test)
y_pred     = [1 if p == -1 else 0 for p in y_pred_raw]

print('\n=== Model Performance ===')
print(f'Accuracy : {accuracy_score(y_test, y_pred):.4f}')
print('\nClassification Report:')
print(classification_report(y_test, y_pred, target_names=['Normal','Anomaly']))

with open('model.pkl', 'wb') as f:
    pickle.dump(model, f)

print('\nModel saved to model.pkl')