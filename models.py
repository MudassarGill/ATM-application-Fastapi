"""
Pydantic models for the ATM application.
Handles request validation and response serialization.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Any


# ──────────────────────────────────────────────
# Request Models
# ──────────────────────────────────────────────

class SignupRequest(BaseModel):
    """Schema for user registration."""
    name: str = Field(..., min_length=2, max_length=50, examples=["John Doe"])
    email: str = Field(..., min_length=5, max_length=100, examples=["john@example.com"])
    password: str = Field(..., min_length=4, max_length=100, examples=["secret123"])


class LoginRequest(BaseModel):
    """Schema for user login."""
    email: str = Field(..., examples=["john@example.com"])
    password: str = Field(..., examples=["secret123"])


class TransactionRequest(BaseModel):
    """Schema for deposit / withdraw operations."""
    email: str = Field(..., examples=["john@example.com"])
    amount: float = Field(..., gt=0, examples=[500.0])


class BalanceRequest(BaseModel):
    """Schema for balance inquiry."""
    email: str = Field(..., examples=["john@example.com"])


# ──────────────────────────────────────────────
# Response Model
# ──────────────────────────────────────────────

class APIResponse(BaseModel):
    """Unified API response wrapper."""
    status: str = Field(..., examples=["success"])
    message: str = Field(..., examples=["Operation completed"])
    data: Optional[Any] = None
