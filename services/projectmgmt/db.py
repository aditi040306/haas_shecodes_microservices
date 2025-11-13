# services/projectmgmt/db.py
import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient
import certifi


this_file = Path(__file__).resolve()


possible_root = this_file.parents[2] if len(this_file.parents) >= 3 else this_file.parent

env_path = possible_root / ".env"


if not env_path.exists():
    env_path = Path("/app/.env")

# load 
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise RuntimeError(f"MONGO_URI not set in .env (looked at {env_path})")

client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())


def get_projects_collection():
    db = client["Projects"]
    return db["Projects"]
