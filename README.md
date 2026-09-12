# Zero Trust Hospital Information & Database Management System

A full-stack healthcare information system designed under the **NIST SP 800-207 Zero Trust Architecture (ZTA)** framework, featuring **Role-Based Access Control (RBAC)**, **Multi-Factor Authentication (MFA)**, micro-segmented API endpoints, continuous audit logging, and **Machine Learning Anomaly Detection** using Isolation Forest.

---

## 🏥 Architecture Overview

The system follows a **Three-Tier Architecture**:
1. **Presentation Tier**: Modern React.js frontend (`client/`)
2. **Application Tier**: Node.js & Express.js REST API (`server/`)
3. **Data Tier**: MySQL Relational Database (`database/schema.sql`)
4. **Intelligent Security Tier**: Python-based Isolation Forest ML model (`ml/`)

---

## 🔒 Security Principles Implemented

- **NIST SP 800-207 Zero Trust Architecture**: "Never Trust, Always Verify" on every request.
- **Micro-Segmentation**: Strict logical boundary separation:
  - `/api/auth` — Authentication & User Registration
  - `/api/ehr` — Electronic Health Records (Doctors, Nurses, Admins)
  - `/api/lab` — Laboratory Reports (Lab Technicians, Doctors, Nurses)
  - `/api/patients` — Patient Records
  - `/api/admin` — Administrative, Security Logs & Alert Monitoring
  - `/api/appointments` — Appointment Booking & Management
- **Role-Based Access Control (RBAC)**: Distinct permissions for `admin`, `doctor`, `nurse`, `lab_tech`, `pharmacist`, `it_security`, and `patient`.
- **JWT Authentication with Short Expiry**: 15-minute token lifetime enforcing continuous re-verification.
- **Continuous Audit Trail**: Every access attempt (successful or denied) is logged to `access_logs` with user identity, timestamp, IP address, device, resource, and outcome.
- **AI Anomaly Detection**: Isolation Forest model detects unusual request bursts, off-hours access, and cross-role anomalies.

---

## 📁 Repository Structure

```text
├── client/              # React.js Frontend
│   ├── public/          # Static assets & HTML template
│   └── src/             # Pages, Components, Context, API services
├── server/              # Node.js & Express Backend
│   ├── config/          # Database configuration (db.js)
│   ├── controllers/     # Auth, Admin, EHR, Lab, Patient, Appointments
│   ├── middleware/      # JWT authMiddleware, rbacMiddleware, deviceMiddleware
│   ├── routes/          # API route definitions
│   └── utils/           # Audit logger (logger.js)
├── database/            # Database Schema & Initial Data
│   └── schema.sql       # Complete MySQL setup script
└── ml/                  # Machine Learning Anomaly Detection
    ├── app.py           # Flask/FastAPI inference service
    ├── dataset.csv      # Access log dataset
    ├── generate_dataset.py # Synthetic log generator
    └── train_model.py   # Isolation Forest model training
```

---

## 🚀 Quick Start Guide

### 1. Database Setup (MySQL)
Open MySQL Workbench or your terminal and execute:
```sql
SOURCE database/schema.sql;
```

### 2. Backend Server Setup
```bash
cd server
npm install
node app.js
```
The server will run on `http://localhost:5000`.

### 3. Frontend Client Setup
```bash
cd ../client
npm install
npm start
```
The React frontend will run on `http://localhost:3000`.

### 4. ML Anomaly Detection Service (Optional)
```bash
cd ../ml
pip install -r requirements.txt
python app.py
```
Runs on `http://localhost:5001`.

---

## 👥 Default Test Users (Password: `<Role>@1234`)

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@hospital.com` | `Admin@1234` |
| Doctor | `doctor@hospital.com` | `Doctor@1234` |
| Nurse | `nurse@hospital.com` | `Nurse@1234` |
| Lab Technician | `lab@hospital.com` | `Lab@1234` |
| Pharmacist | `pharma@hospital.com` | `Pharma@1234` |
| IT Security | `itsec@hospital.com` | `ITSec@1234` |
