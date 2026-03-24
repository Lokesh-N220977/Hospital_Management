import asyncio
import os
import sys

# Add the project root to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from app.database.collections import doctors_collection

async def migrate():
    print("Migrating doctor experience data to integers...")
    async for doc in doctors_collection.find({}):
        exp = doc.get("experience")
        doc_id = doc["_id"]
        if isinstance(exp, str):
            try:
                # Extract number from "10 years"
                new_exp = int(exp.split()[0])
                print(f"Updating {doc.get('name')}: {exp} -> {new_exp}")
                await doctors_collection.update_one(
                    {"_id": doc_id},
                    {"$set": {"experience": new_exp}}
                )
            except (ValueError, IndexError):
                print(f"Could not parse experience for {doc.get('name')}: {exp}")
        elif exp is None:
            await doctors_collection.update_one(
                {"_id": doc_id},
                {"$set": {"experience": 0}}
            )

    print("Migration complete.")

if __name__ == "__main__":
    asyncio.run(migrate())
