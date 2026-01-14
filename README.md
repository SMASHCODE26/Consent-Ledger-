# 🧾 ConsentLedger

**Decentralized Consent & Data Usage Tracker**

ConsentLedger is a learning-focused system that treats user consent as a technical, enforceable entity, not just a checkbox. It ensures that data access is impossible without valid consent, and that every access attempt is transparently logged and auditable.

This project is built as a **hackathon prototype** to demonstrate ethical data usage, transparency, and trust using modern backend architecture.

---

## 🔴 Problem Statement

Today, user consent is mostly:
- A checkbox
- A legal statement
- Not technically enforced
- Not auditable
- Hard to revoke meaningfully

**Users:**
- Don't know who accesses their data
- Can't track usage
- Can't verify misuse
- Must blindly trust companies

---

## 🟢 Our Solution

ConsentLedger introduces a **Consent Gateway** that:
- Treats consent as a structured backend entity
- Enforces consent server-side
- Blocks data access without valid consent
- Logs every access attempt (allowed or denied)
- Allows users to audit and revoke consent at any time
- Uses cryptographic hashes to make logs tamper-evident

---

## 🧠 Key Concepts Implemented

- **Consent as a first-class data object**
- **Purpose-based and time-bound consent**
- **Backend-enforced access control**
- **Transparency through audit logs**
- **Blockchain-style immutable logging** (hash-based)
- **Clear separation of trust boundaries**

---

## 🧱 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Recharts (for visualization)

### Backend
- Node.js
- Express.js
- Supabase (PostgreSQL)

### Security & Integrity
- SHA-256 hashing for log integrity
- UTC timestamps (converted to IST in UI)

---

## 🏗️ System Architecture (High Level)
```
User / App
    |
    | (API Requests)
    v
ConsentLedger Backend (Node.js)
    |
    |-- Consent Validation
    |-- Access Control
    |-- Audit Logging
    v
Supabase (PostgreSQL)
```

---

## 🔁 Core Features

### 1️⃣ Grant Consent
- User defines:
  - App
  - Data type
  - Purpose
  - Expiry
- Stored in backend database

### 2️⃣ Enforce Consent
- Applications must request access via backend
- Backend checks:
  - Consent exists
  - Status is active
  - Purpose matches
  - Not expired

### 3️⃣ Revoke Consent
- User can revoke anytime
- Consent is not deleted (history preserved)
- Enforcement reacts immediately

### 4️⃣ Audit & Transparency
- Users can see:
  - All consents
  - All access attempts
  - Allowed vs denied
- Visualized with charts

### 5️⃣ Blockchain-Style Logging
- Every access log is hashed (SHA-256)
- Any tampering breaks hash integrity
- Future-ready for on-chain anchoring

---

## ⏭️ Future Scope

- SDK / middleware for real third-party apps
- Authentication (Supabase Auth)
- On-chain hash anchoring (Ethereum / Polygon)
- Role-based access
- Consent analytics dashboards

---

## ⚠️ Disclaimer

This is a **prototype for educational and hackathon purposes**, not a production system.

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Backend Setup
```bash
cd backend
npm install
# Configure your Supabase credentials in .env
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👥 Team

Built with ❤️ for learning and innovation

---

**⭐ If you find this project interesting, please star the repository!**
