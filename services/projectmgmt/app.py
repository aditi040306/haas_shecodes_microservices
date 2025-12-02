# services/projectmgmt/app.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from db import get_projects_collection

# API-only Flask app
app = Flask(__name__)
CORS(app)

# ----------------------------------------------------
# "Model" helpers
# ----------------------------------------------------
def get_project_by_id(projectid: str):
    projects = get_projects_collection()
    return projects.find_one({"projectid": projectid})

def create_project(projectid: str, projectname: str, description: str, created_by: str | None = None):
    projects = get_projects_collection()

    # NEW 
    authorized_users = []
    if created_by:
        authorized_users.append(created_by)

    doc = {
        "projectid": projectid,
        "projectname": projectname,
        "description": description,
        
        # important field you wanted
        "authorized_users": authorized_users,  #NEW
    }
    projects.insert_one(doc)

def add_authorized_user(projectid: str, userid: str):
    projects = get_projects_collection()
    res = projects.update_one(
        {"projectid": projectid},
        {"$addToSet": {"authorized_users": userid}}
    )
    return res.modified_count > 0

# ----------------------------------------------------
# Controllers
# ----------------------------------------------------
def handle_create_project(req):
    data = req.get_json()
    projectid = data.get("projectid")
    projectname = data.get("projectname")
    description = data.get("description")
    # optional, so your frontend can send the logged-in user
    userid = data.get("userid")   # e.g. "user1"

    if not projectid or not projectname or not description or not userid:
        return jsonify({"message": "projectid, projectname, description and userid are required"}), 400

    if get_project_by_id(projectid):
        return jsonify({"message": "Project Id already exists"}), 400

    create_project(projectid, projectname, description, userid)
    return jsonify({"message": "Project created successfully"}), 200


def handle_get_project(req):
    projectid = req.args.get("projectid")
    if not projectid:
        return jsonify({"message": "projectid is required"}), 400

    proj = get_project_by_id(projectid)
    if not proj:
        return jsonify({"message": "Project not found"}), 404

    # shape exactly like you wrote:
    result = {
        "projectname": proj.get("projectname"),
        "projectid": proj.get("projectid"),
        "description": proj.get("description"),
        "authorized_users": proj.get("authorized_users", [])
    }
    return jsonify({"message": "Project fetched", "project": result}), 200


def handle_add_user(req):
    data = req.get_json()
    projectid = data.get("projectid")
    userid = data.get("userid")

    if not projectid or not userid:
        return jsonify({"message": "projectid and userid are required"}), 400

    if not get_project_by_id(projectid):
        return jsonify({"message": "Project not found"}), 404

    updated = add_authorized_user(projectid, userid)
    if not updated:
        # user was already in the list
        return jsonify({"message": "User already authorized"}), 200

    return jsonify({"message": "User authorized"}), 200

# ----------------------------------------------------
# Routes
# ----------------------------------------------------
@app.post("/shecodes/projects/createproject")
def create_project_route():
    return handle_create_project(request)

@app.get("/shecodes/projects/projectstatus")
def get_project_route():
    return handle_get_project(request)

@app.post("/shecodes/projects/addUserProject")
def add_user_route():
    return handle_add_user(request)

if __name__ == "__main__":
    # different port from usermgmt
    app.run(host="0.0.0.0", port=8002, debug=True)
