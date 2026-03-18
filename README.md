# 🏧 ATM Simulation System

A full-stack ATM simulation built with **FastAPI** (backend) and **HTML / CSS / JavaScript** (frontend). Replicates core banking operations with a modern, secure API architecture.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)

---

## ✨ Features

| Module | Capabilities |
|--------|-------------|
| **Auth** | Signup with bcrypt password hashing, Login with validation |
| **Banking** | Check Balance, Deposit, Withdraw (with insufficient-funds guard) |
| **Frontend** | Premium dark theme, glassmorphism cards, particle background, toast notifications |
| **Backend** | Async endpoints, Pydantic validation, CORS middleware, structured JSON responses |

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the server
uvicorn main:app --reload

# 3. Open in browser
# → http://127.0.0.1:8000
```

---

## 📁 Project Structure

```
ATM-application-Fastapi/
├── main.py              # FastAPI app & API routes
├── models.py            # Pydantic request/response schemas
├── database.py          # JSON file read/write helpers
├── requirements.txt     # Python dependencies
├── data/
│   └── users.json       # User data store (auto-created)
└── static/
    ├── index.html        # Single-page frontend
    ├── style.css         # Premium dark ATM theme
    └── script.js         # Client logic & animations
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/signup` | Create a new account |
| `POST` | `/api/login` | Authenticate user |
| `POST` | `/api/balance` | Get current balance |
| `POST` | `/api/deposit` | Deposit money |
| `POST` | `/api/withdraw` | Withdraw money |

---

## 🛠️ Technologies

- **FastAPI** — async Python web framework
- **Pydantic** — data validation & serialization
- **bcrypt** — password hashing
- **Uvicorn** — ASGI server
- **HTML / CSS / JS** — responsive frontend with particle animations

---

## 📜 License

This project is licensed under the MIT License.
