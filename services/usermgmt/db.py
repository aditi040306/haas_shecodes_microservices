# services/usermgmt/db.py
import os
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi

ROOT_DIR = Path(__file__).resolve().parents[2]  # <- shecodes-microservices
ENV_PATH = ROOT_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise RuntimeError(f"MONGO_URI not set in .env (looked at {ENV_PATH})")

client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())

def get_users_collection():
    db = client["Users"]
    return db["Users"]
