# 🩺 LLM-Powered Early Chronic Disease Detection using IoT

An intelligent health monitoring system that analyzes real-time IoT biometrics, lifestyle data, and medical reports to predict early-stage chronic disease risks using Large Language Models (Google Gemini AI).

---

## 🚀 Overview

This project is a high-fidelity prototype developed as a Final Year B.Sc Computer Science project. It bridges the gap between raw IoT sensor data and actionable healthcare insights by combining biometrics, patient history, and AI-driven analysis.

The system enables proactive and preventive healthcare monitoring through intelligent risk assessment.

---

## 🎯 Objectives

- Detect early-stage chronic disease risks using AI
- Integrate IoT sensor data with lifestyle and environmental factors
- Provide LLM-based health insights and predictions
- Support preventive healthcare decision-making

---

## 🏗️ Technical Architecture

### 🖥️ Frontend
- React 19 with TypeScript
- Tailwind CSS (Responsive UI with Dark/Light mode)

### 🔙 Backend & Data
- Firebase Realtime Database (IoT simulation & live updates)
- Local Storage synchronization using custom hooks

### 🤖 AI Engine (LLM)
- Google Gemini API (`@google/genai`)
  - Health risk analysis
  - OCR for medical report extraction

---

## 🔍 Core Features

### 🧠 Holistic Data Integration

- **IoT Biometrics**
  - Heart Rate
  - SpO₂
  - Body Temperature
  - Blood Glucose
  - Respiratory Rate

- **Patient Context**
  - Demographics
  - Family History (Diabetes, Hypertension, Heart Disease)
  - Lifestyle (Smoking, Alcohol, Exercise, Diet)

- **Environmental Factors**
  - Air Quality Index (AQI)
  - Pollen Levels

- **User Inputs**
  - Daily Health Journal
  - Symptom Tracking

---

### 🤖 LLM-Driven Intelligence

- Correlates vitals, lifestyle, and medical history
- Generates structured disease risk profiles
- Extracts data from uploaded medical reports using OCR

---

### 📊 Monitoring & Alerts

- ⚡ Real-time ECG Simulation
- 🔄 IoT Data Simulation Engine
- 🚨 Critical Alerts
  - Low SpO₂ (< 92%)
  - Fever detection

- 📈 AI Trend Alerts
  - Triggered when high-risk patterns persist across multiple analyses

---

## 📦 Project Status

- ✅ Fully functional prototype
- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Error handling and validation implemented
- ✅ AI integration completed

---

## 🔮 Future Enhancements

- 🔐 Firebase Authentication (multi-user support)
- ⌚ Wearable Integration (Google Fit, Fitbit APIs)
- 📄 Export AI analysis as PDF reports
- 📊 Advanced data visualization using D3.js

---

##🔐 License & Usage

© 2026 Guhan Senthil. All Rights Reserved.

This project and its source code are the intellectual property of the author.
Unauthorized copying, modification, distribution, or use of this code in any form 
is strictly prohibited without explicit written permission.

---

## ⚙️ Installation & Setup

```bash
# Clone the repository
git clone https://github.com/your-username/LLM-Powered-Early-Chronic-Disease-Detection-using-IoT.git

# Navigate into the project
cd LLM-Powered-Early-Chronic-Disease-Detection-using-IoT

# Install dependencies
npm install

# Start development server
npm run dev
