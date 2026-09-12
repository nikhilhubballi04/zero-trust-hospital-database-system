-- =======================================================
-- Zero Trust Hospital Information System - Database Schema
-- =======================================================

CREATE DATABASE IF NOT EXISTS zerotrust_hospital;
USE zerotrust_hospital;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('doctor','nurse','lab_tech','pharmacist','admin','it_security','patient') NOT NULL,
  is_active     BOOLEAN       DEFAULT TRUE,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  last_login    TIMESTAMP     NULL
);

-- 2. Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  dob         DATE         NOT NULL,
  gender      ENUM('male','female','other'),
  blood_type  VARCHAR(5),
  phone       VARCHAR(20),
  address     TEXT,
  created_by  INT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 3. Electronic Health Records (EHR)
CREATE TABLE IF NOT EXISTS ehr_records (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  patient_id   INT  NOT NULL,
  doctor_id    INT  NOT NULL,
  diagnosis    TEXT NOT NULL,
  prescription TEXT,
  notes        TEXT,
  visit_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id)  REFERENCES users(id)
);

-- 4. Laboratory Reports
CREATE TABLE IF NOT EXISTS lab_reports (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  patient_id   INT          NOT NULL,
  lab_tech_id  INT          NOT NULL,
  test_name    VARCHAR(100) NOT NULL,
  result       TEXT         NOT NULL,
  status       ENUM('pending','completed','flagged') DEFAULT 'pending',
  report_date  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id)  REFERENCES patients(id),
  FOREIGN KEY (lab_tech_id) REFERENCES users(id)
);

-- 5. Pharmacy Records
CREATE TABLE IF NOT EXISTS pharmacy_records (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  patient_id     INT          NOT NULL,
  pharmacist_id  INT          NOT NULL,
  ehr_id         INT          NOT NULL,
  medicine_name  VARCHAR(150) NOT NULL,
  dosage         VARCHAR(100),
  status         ENUM('pending','dispensed','returned') DEFAULT 'pending',
  dispensed_at   TIMESTAMP    NULL,
  FOREIGN KEY (patient_id)    REFERENCES patients(id),
  FOREIGN KEY (pharmacist_id) REFERENCES users(id),
  FOREIGN KEY (ehr_id)        REFERENCES ehr_records(id)
);

-- 6. Access Logs (Audit Trail for Zero Trust Architecture)
CREATE TABLE IF NOT EXISTS access_logs (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT          NULL,
  role         VARCHAR(50)  NULL,
  action       VARCHAR(100) NOT NULL,
  resource     VARCHAR(100),
  ip_address   VARCHAR(45)  NOT NULL,
  device_info  VARCHAR(255),
  outcome      ENUM('success','denied','failed') NOT NULL,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 7. Trusted Devices
CREATE TABLE IF NOT EXISTS trusted_devices (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT          NOT NULL,
  ip_address  VARCHAR(45)  NOT NULL,
  device_info VARCHAR(255),
  first_seen  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  last_seen   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  patient_name   VARCHAR(100) NOT NULL,
  phone          VARCHAR(20)  NOT NULL,
  email          VARCHAR(150),
  department     VARCHAR(100) NOT NULL,
  preferred_date DATE         NOT NULL,
  preferred_time VARCHAR(20)  NOT NULL,
  message        TEXT,
  status         ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default Admin User (Password: Admin@1234)
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin Suresh', 'admin@hospital.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LsR4QeXEK7K', 'admin')
ON DUPLICATE KEY UPDATE name=name;
