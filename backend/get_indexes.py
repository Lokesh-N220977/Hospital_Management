import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def run():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['hospital_db']
    coll = db['appointments']
    indexes = await coll.index_information()
    import pprint
    pprint.pprint(indexes)

asyncio.run(run())
