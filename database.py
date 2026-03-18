"""
JSON-based database helpers for the ATM application.
Provides async read/write and user-lookup utilities.
"""

import json
import os
from typing import Optional

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
DB_FILE = os.path.join(DATA_DIR, "users.json")


def _ensure_db() -> None:
    """Create the data directory and seed file if they don't exist."""
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, "w") as f:
            json.dump([], f)


async def read_db() -> list[dict]:
    """Read all users from the JSON file."""
    _ensure_db()
    with open(DB_FILE, "r") as f:
        return json.load(f)


async def write_db(users: list[dict]) -> None:
    """Write the full user list back to the JSON file."""
    _ensure_db()
    with open(DB_FILE, "w") as f:
        json.dump(users, f, indent=2)


async def find_user(email: str) -> Optional[dict]:
    """Look up a single user by email. Returns None if not found."""
    users = await read_db()
    for user in users:
        if user["email"].lower() == email.lower():
            return user
    return None
