import sys
import os
import asyncio

backend_dir = r"c:\Users\happy\Desktop\hospital_project\backend"
sys.path.append(backend_dir)

from app.database import appointments_collection

async def main():
    print("Checking appointments indices...")
    try:
        indices = await appointments_collection.index_information()
        print(f"Indices: {list(indices.keys())}")
        
        # We drop the generic doctor_id_1_slot_start_1 index which enforce uniqueness 
        # that breaks dynamic generation.
        index_to_drop = "doctor_id_1_slot_start_1"
        if index_to_drop in indices:
            print(f"Dropping {index_to_drop}...")
            await appointments_collection.drop_index(index_to_drop)
            print("Dropped successfully.")
        else:
            print(f"{index_to_drop} not found, already dropped.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
