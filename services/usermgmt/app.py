import os
import bcrypt
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi

# 1) load env
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise RuntimeError("MONGO_URI not set in .env")

client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
users_col = client["Users"]["Users"]

# 2) Flask app (API only)
app = Flask(__name__)
CORS(app)
app.secret_key = os.getenv("SECRET_KEY", "dev-secret")

# -------------------------------------------------
# helpers / "model" layer
# -------------------------------------------------
def find_user_by_username(username: str):
    return users_col.find_one({"userid": username})

def create_user(username: str, plain_password: str):
    pw_hash = bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    users_col.insert_one({
        "userid": username,
        "password": pw_hash
    })

def password_matches(stored: str, provided: str) -> bool:
    if not stored:
        return False
    # bcrypt hash
    if stored.startswith("$2b$") or stored.startswith("$2a$"):
        return bcrypt.checkpw(provided.encode("utf-8"), stored.encode("utf-8"))
    # old plain
    return stored == provided

# -------------------------------------------------
# controllers (define BEFORE routes)
# -------------------------------------------------
def handle_register(req):
    data = req.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400

    if find_user_by_username(username):
        return jsonify({"message": "Username already exists"}), 400

    create_user(username, password)
    return jsonify({"message": "User registered successfully"}), 201


def handle_login(req):
    data = req.get_json()
    username = data.get("username")
    password = data.get("password")

    user = find_user_by_username(username)
    if not user:
        return jsonify({"message": "Invalid credentials"}), 401

    stored = user.get("password", "")
    if not password_matches(stored, password):
        return jsonify({"message": "Invalid credentials"}), 401

    session["username"] = username
    return jsonify({"message": f"Welcome, {username}!"}), 200

# -------------------------------------------------
# API routes
# -------------------------------------------------
@app.post("/shecodes/signup")
def signup_route():
    return handle_register(request)

@app.post("/shecodes/login")
def login_route():
    return handle_login(request)

@app.get("/shecodes/users/<username>")
def get_user(username):
    user = find_user_by_username(username)
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify({"userid": user["userid"]}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001, debug=True)
