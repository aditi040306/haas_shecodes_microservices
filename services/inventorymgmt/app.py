from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_db

# API-only Flask app
app = Flask(__name__)
CORS(app, resources={r"/shecodes/*": {"origins": "*"}})

# fixed order so UI = backend
HARDWARE_INDEX_MAP = {
    "hw1": 0,
    "hw2": 1,
}

@app.get("/shecodes/inventory/projectstatus")
def get_project_status():
    project_id = request.args.get("projectid")
    userid = request.args.get("userid")   #  NEW
    if not project_id:
        return jsonify({"message": "projectid is required"}), 400

    projects_col = get_db("Projects")["Projects"]
    inventory_col = get_db("Inventory")["Inventory"]

    project = projects_col.find_one({"projectid": project_id})
    if not project:
        return jsonify({"message": "Project not found"}), 404
    

    # ensure phardware length = number of supported hardware sets
    phardware = list(map(int, project.get("phardware", [])))
    needed = len(HARDWARE_INDEX_MAP)
    if len(phardware) < needed:
        phardware += [0] * (needed - len(phardware))

    # fetch inventory in the SAME order: hw1, hw2
    inventory = []
    for hwid in ("hw1", "hw2"):
        doc = inventory_col.find_one({"hardwareid": hwid})
        if doc:
            inventory.append({
                "hardwareid": doc["hardwareid"],
                "capacity": doc.get("capacity", 0),
                "available": doc.get("availability", 0),
            })
        else:
            inventory.append({
                "hardwareid": hwid,
                "capacity": 0,
                "available": 0,
            })

    return jsonify({
        "message": "Project data fetched successfully.",
        "response": {
            "projectid": project_id,
            "checkedOut": phardware,
            "inventory": inventory
        }
    }), 200


@app.post("/shecodes/inventory/checkincheckout")
def checkin_checkout():
    data = request.get_json() or {}
    project_id = data.get("projectid")
    action = data.get("action")
    items = data.get("inventory", [])
    userid = data.get("userid")  #  NEW

    if not project_id or not action or not items:
        return jsonify({"message": "projectid, action and inventory are required"}), 400
    
    if not userid:
        return jsonify({"message": "userid is required"}), 400  #  NEW

    if action not in ("checkin", "checkout"):
        return jsonify({"message": "action must be 'checkin' or 'checkout'"}), 400

    projects_col = get_db("Projects")["Projects"]
    inventory_col = get_db("Inventory")["Inventory"]

    project = projects_col.find_one({"projectid": project_id})
    if not project:
        return jsonify({"message": "Project not found"}), 404
    
    # NEW: authorization check – only project members can check in/out
    authorized_users = project.get("authorized_users")
    if authorized_users is None:
        authorized_users = project.get("users", [])
    if authorized_users and userid not in authorized_users:
        return jsonify({ "message": "You are not a member of this project. Please add your User ID on the Add User page."}), 403

    phardware = list(map(int, project.get("phardware", [])))
    needed = len(HARDWARE_INDEX_MAP)
    if len(phardware) < needed:
        phardware += [0] * (needed - len(phardware))

    any_updated = False

    for item in items:
        hwid = item.get("hardwareid")
        qty = item.get("quantity")

        if not hwid or qty in (None, "", 0, "0"):
            continue

        if hwid not in HARDWARE_INDEX_MAP:
            return jsonify({"message": f"Unsupported hardwareid: {hwid}"}), 400

        try:
            qty = int(qty)
        except ValueError:
            return jsonify({"message": f"Quantity for {hwid} must be a number"}), 400

        if qty <= 0:
            continue

        idx = HARDWARE_INDEX_MAP[hwid]
        current_checked = phardware[idx]

        inv_doc = inventory_col.find_one({"hardwareid": hwid})
        if not inv_doc:
            return jsonify({"message": f"Hardware {hwid} not found"}), 404

        available = inv_doc.get("availability", 0)

        if action == "checkout":
            if qty > available:
                return jsonify({"message": f"Only {available} units of {hwid} are available"}), 400

            inventory_col.update_one(
                {"hardwareid": hwid}, {"$inc": {"availability": -qty}}
            )
            phardware[idx] = current_checked + qty
            any_updated = True

        else:  # checkin
            if qty > current_checked:
                return jsonify({
                    "message": f"Project has only {current_checked} units of {hwid} to check in"
                }), 400

            inventory_col.update_one(
                {"hardwareid": hwid}, {"$inc": {"availability": qty}}
            )
            phardware[idx] = current_checked - qty
            any_updated = True

    if not any_updated:
        return jsonify({"message": "No valid hardware items to process."}), 400

    projects_col.update_one(
        {"projectid": project_id},
        {"$set": {"phardware": phardware}}
    )

    return jsonify({
        "message": f"{action.capitalize()} successful",
        "response": {
            "projectid": project_id,
            "checkedOut": phardware
        }
    }), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8003, debug=True)
