"""
ATM Simulation System — FastAPI Backend
========================================
Provides RESTful API endpoints for user management and banking operations.
All data is persisted in a local JSON file.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse

import bcrypt
import os

from models import SignupRequest, LoginRequest, TransactionRequest, BalanceRequest, APIResponse
from database import read_db, write_db, find_user

# ──────────────────────────────────────────────
# App Initialisation
# ──────────────────────────────────────────────

app = FastAPI(
    title="ATM Simulation System",
    description="A secure ATM simulation API built with FastAPI",
    version="1.0.0",
)

# CORS — allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (frontend)
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


# ──────────────────────────────────────────────
# Root redirect
# ──────────────────────────────────────────────

@app.get("/", include_in_schema=False)
async def root():
    """Redirect bare root to the frontend."""
    return RedirectResponse(url="/static/index.html")


# ──────────────────────────────────────────────
# Auth endpoints
# ──────────────────────────────────────────────

@app.post("/api/signup", response_model=APIResponse)
async def signup(req: SignupRequest):
    """Register a new user account."""
    existing = await find_user(req.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password
    hashed = bcrypt.hashpw(req.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    users = await read_db()
    new_user = {
        "name": req.name,
        "email": req.email.lower(),
        "password": hashed,
        "balance": 0.0,
    }
    users.append(new_user)
    await write_db(users)

    return APIResponse(
        status="success",
        message=f"Account created for {req.name}",
        data={"name": req.name, "email": req.email.lower()},
    )


@app.post("/api/login", response_model=APIResponse)
async def login(req: LoginRequest):
    """Authenticate an existing user."""
    user = await find_user(req.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not bcrypt.checkpw(req.password.encode("utf-8"), user["password"].encode("utf-8")):
        raise HTTPException(status_code=401, detail="Invalid password")

    return APIResponse(
        status="success",
        message=f"Welcome back, {user['name']}!",
        data={"name": user["name"], "email": user["email"], "balance": user["balance"]},
    )


# ──────────────────────────────────────────────
# Banking endpoints
# ──────────────────────────────────────────────

@app.post("/api/balance", response_model=APIResponse)
async def check_balance(req: BalanceRequest):
    """Return the current account balance."""
    user = await find_user(req.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return APIResponse(
        status="success",
        message="Balance retrieved",
        data={"name": user["name"], "balance": user["balance"]},
    )


@app.post("/api/deposit", response_model=APIResponse)
async def deposit(req: TransactionRequest):
    """Deposit money into the account."""
    users = await read_db()
    for user in users:
        if user["email"].lower() == req.email.lower():
            user["balance"] = round(user["balance"] + req.amount, 2)
            await write_db(users)
            return APIResponse(
                status="success",
                message=f"${req.amount:,.2f} deposited successfully",
                data={"balance": user["balance"]},
            )

    raise HTTPException(status_code=404, detail="User not found")


@app.post("/api/withdraw", response_model=APIResponse)
async def withdraw(req: TransactionRequest):
    """Withdraw money from the account."""
    users = await read_db()
    for user in users:
        if user["email"].lower() == req.email.lower():
            if req.amount > user["balance"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient funds. Current balance: ${user['balance']:,.2f}",
                )
            user["balance"] = round(user["balance"] - req.amount, 2)
            await write_db(users)
            return APIResponse(
                status="success",
                message=f"${req.amount:,.2f} withdrawn successfully",
                data={"balance": user["balance"]},
            )

    raise HTTPException(status_code=404, detail="User not found")
