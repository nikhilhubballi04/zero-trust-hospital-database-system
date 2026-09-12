import pandas as pd
import numpy as np
import random

random.seed(42)
np.random.seed(42)

roles     = ['doctor','nurse','lab_tech','pharmacist','admin','it_security']
resources = ['/api/ehr','/api/lab','/api/pharmacy','/api/admin','/api/patients']
records   = []

# Normal behaviour — 360 records
for _ in range(360):
    role = random.choice(roles)
    records.append({
        'role':             roles.index(role),
        'login_hour':       random.randint(8, 20),
        'ip_known':         1,
        'request_count':    random.randint(1, 25),
        'resource_zone':    resources.index(random.choice(resources)),
        'session_duration': random.randint(5, 60),
        'failed_attempts':  random.randint(0, 1),
        'device_known':     1,
        'label':            0
    })

# Anomalous behaviour — 180 records
for _ in range(180):
    records.append({
        'role':             random.randint(0, 5),
        'login_hour':       random.choice([0,1,2,3,4,23]),
        'ip_known':         0,
        'request_count':    random.randint(100, 500),
        'resource_zone':    random.randint(0, 4),
        'session_duration': random.randint(1, 3),
        'failed_attempts':  random.randint(3, 10),
        'device_known':     0,
        'label':            1
    })

df = pd.DataFrame(records)
df = df.sample(frac=1).reset_index(drop=True)
df.to_csv('dataset.csv', index=False)
print(f'Dataset created: {len(df)} records')
print(df['label'].value_counts())