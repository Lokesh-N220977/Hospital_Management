import asyncio
import os
import sys

# Add the current directory to sys.path to find 'app'
sys.path.append(os.getcwd())

from app.database import users_collection
from app.core.security import verify_password

async def check():
    user = await users_collection.find_one({"email": "admin@hospital.com"})
    if user:
        print(f"User found: {user['email']}, Role: {user['role']}")
        # Check if password 'admin123' works
        if verify_password("admin123", user['password']):
            print("Password 'admin123' is correct.")
        else:
            print("Password 'admin123' is INCORRECT.")
    else:
        print("Admin user NOT found.")

if __name__ == "__main__":
    asyncio.run(check())
