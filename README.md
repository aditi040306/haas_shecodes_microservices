````markdown
# Hardware Resource Management Portal – SheCodes-Hub

Microservices-based Hardware-as-a-Service (HaaS) portal with:
- **Backend:** Python Flask + MongoDB Atlas (3 services – user, project, inventory)
- **Analytics:** 1 external microservice (Dewey API) hosted on Azure App Service
- **Frontend:** React (portal UI)
- **Deployment:** Docker images + Docker Compose

---

## 1. Project Structure

```bash
repo-root/
├── backend/                 # (older monolithic structure)
│   ├── app.py
│   ├── .env
│   ├── requirements.txt
│   └── app/
│       ├── __init__.py
│       ├── db.py
│       ├── models/
│       │   └── user.py
│       ├── routes/
│       │   └── auth_routes.py
│       └── controllers/
│           └── auth_controller.py
│
├── services/                # Final microservices (Dockerized)
│   ├── usermgmt/
│   │   ├── Dockerfile
│   │   ├── app.py
│   │   ├── db.py
│   │   ├── .env
│   │   └── requirements.txt
│   ├── projectmgmt/
│   │   ├── Dockerfile
│   │   ├── app.py
│   │   ├── db.py
│   │   ├── .env
│   │   └── requirements.txt
│   └── inventorymgmt/
│       ├── Dockerfile
│       ├── app.py
│   │   ├── db.py
│   │   ├── .env
│       └── requirements.txt
│
├── frontend/
│   └── portal-ui/           # React app (web UI)
│       ├── package.json
│       └── src/
│           └── components/
│               └── AnalysisDewey.jsx  # Integrates with external Dewey analytics API
│               └── SignUpComponent.jsx 
│               └── LoginComponent.jsx 
│               └── ProjectComponent.jsx 
│               └── ResourceComponent.jsx 
│               └── AboutComponent.jsx 
│               └── NavBar.jsx 
│
├── docker-compose.yml
└── README.md
````

> **Note:** The 4th microservice (Dewey analytics API) is hosted separately on Azure App Service and is **not** part of this repo’s Docker Compose stack. The frontend consumes it via HTTP in `AnalysisDewey.jsx`.

---

## 2. (Legacy) Local Flask Setup – Single `backend/` App

> This was the original monolithic setup – which is updated now as the final project uses the microservices in `services/`.

### 2.1. Create folder structure

```bash
mkdir checkIncheckout
cd checkIncheckout

mkdir backend
cd backend

mkdir app app/models app/routes app/controllers
touch app.py .env requirements.txt

cd app
touch __init__.py db.py
touch models/user.py
touch routes/auth_routes.py
touch controllers/auth_controller.py
```

### 2.2. Create & activate virtualenv

```bash
cd backend

python3 -m venv venv
source venv/bin/activate          # Mac/Linux

# On Windows:
# venv\Scripts\activate
```

### 2.3. Install dependencies

```bash
pip install --upgrade pip
pip install Flask flask-pymongo pymongo python-dotenv flask-cors certifi

# Optional: freeze into requirements.txt
pip freeze > requirements.txt
```

### 2.4. Run Flask app

```bash
python3 app.py
```

---

## 3. React Frontend – Local Dev

```bash
cd frontend/portal-ui

node -v
npm -v

npm install
npm install react-router-dom
npm install react-toastify
npm install react-bootstrap bootstrap react-router-bootstrap

npm start
```

This will start the React dev server (typically on `http://localhost:3000`).

> All dependencies will be stored in `package.json` so new developers can simply run:
>
> ```bash
> npm install
> npm start
> ```

---

## 4. Environment Variables (.env)

Create a `.env` file (for each Flask service) with:

```env
MONGO_URI=mongodb+srv://<USER>:<PASS>@<CLUSTER>.mongodb.net/<DB_NAME>?retryWrites=true&w=majority

# If your password has special characters, URL-encode it.
# Example:
# p@ssw/rd#1  →  p%40ssw%2Frd%231

SECRET_KEY=<YOUR_SECRET_KEY>
# Generate via:
# python3 -c "import secrets; print(secrets.token_hex(16))"
```


---

## 5. CORS & Port Note (MacOS)

If React (port `3000`) talks to Flask:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

if __name__ == "__main__":
    # macOS sometimes reserves port 5000 internally.
    # Use a different port for local dev, e.g. 8000:
    app.run(port=8000, debug=True)
```

Reason: macOS uses port `5000` internally; running Flask on `8000` avoids conflicts.

---

## 6. External Analytics Microservice (Dewey API on Azure)

The “Industry Metrics / Analysis” screen in the UI is powered by a **4th microservice** hosted separately on Azure App Service.

* **Base URL:** defined in `AnalysisDewey.jsx` as:

  ```js
  const MS4_URL =
    'https://shecodes-dewey-api-gmfpbtgxb4cmbkgg.canadacentral-01.azurewebsites.net';
  ```

* **Key endpoints:**

  * ` /industries`
    Returns a JSON list of available industries, e.g.:

    ```json
    {
      "status": "success",
      "industries": ["Insurance", "Retail", "Banking", "..."]
    }
    ```

  * ` /compute`
    Accepts a payload like:

    ```json
    {
      "industry": "Insurance",
      "start_date": "2025-01-03",
      "end_date": "2025-01-10",
      "metric": "max"
    }
    ```

    and responds with:

    ```json
    {
      "status": "success",
      "industry": "Insurance",
      "metric": "max",
      "start_date": "2025-01-03",
      "end_date": "2025-01-10",
      "record_count": 1234,
      "result": 98765.43
    }
    ```

* **Frontend integration:**

  * Implemented in `frontend/portal-ui/src/components/AnalysisDewey.jsx`.
  * The component:

    * Fetches industries from `GET /industries`.
    * Sends the selected industry + date range + metric to `POST /compute`.
    * Renders:

      * Record count
      * Numeric result
      * A natural-language sentence such as:

        > For the period between 01/03/2025 and 01/10/2025, the maximum spend amount for the Insurance industry is 98,765.43.

* **Ownership & deployment:**

  * This Dewey analytics API is maintained by a separate team member and deployed via **Azure App Service**, not through this repo’s Docker Compose.
  * If the base URL changes, update the `MS4_URL` constant in `AnalysisDewey.jsx` and ensure CORS is correctly configured on the Azure app to allow `http://localhost:3000` (and any deployed frontend origin).



## 7. Docker – Local Build & Run (Dev)

From **repo root**:

### 7.1. Build backend images

```bash
# User Management
docker build -t aditiv0401/shecodes-usermgmt:final       ./services/usermgmt

# Project Management
docker build -t aditiv0401/shecodes-projectmgmt:final    ./services/projectmgmt

# Inventory Management
docker build -t aditiv0401/shecodes-inventorymgmt:final  ./services/inventorymgmt
```

### 7.2. Build frontend image

```bash
docker build -t aditiv0401/shecodes-webui:final ./frontend/portal-ui
```

### 7.3. Bring up the entire stack with Compose

```bash
docker compose up -d --build --remove-orphans
docker compose ps
```

* Web UI: `http://localhost:3000`
* APIs: whatever ports  mapped in `docker-compose.yml`

  * e.g. `http://localhost:8001/shecodes/...`, `:8002/shecodes/...`, `:8003/shecodes/...`

---

## 8. Docker – Build & Push Multi-Arch Images

### 8.1. Login

```bash
docker login
```

### 8.2. Ensure `buildx` exists

```bash
docker buildx ls || true
docker buildx create --use --name multi || true
```

### 8.3. Build & push images (linux/amd64 + linux/arm64)

> Adjust paths if Dockerfiles move.

```bash
# usermgmt
docker buildx build --platform linux/amd64,linux/arm64 \
  -t aditiv0401/shecodes-usermgmt:final \
  -t aditiv0401/shecodes-usermgmt:1.0.0 \
  --push ./services/usermgmt

# projectmgmt
docker buildx build --platform linux/amd64,linux/arm64 \
  -t aditiv0401/shecodes-projectmgmt:final \
  -t aditiv0401/shecodes-projectmgmt:1.0.0 \
  --push ./services/projectmgmt

# inventorymgmt
docker buildx build --platform linux/amd64,linux/arm64 \
  -t aditiv0401/shecodes-inventorymgmt:final \
  -t aditiv0401/shecodes-inventorymgmt:1.0.0 \
  --push ./services/inventorymgmt

# webui
docker buildx build --platform linux/amd64,linux/arm64 \
  -t aditiv0401/shecodes-webui:final \
  -t aditiv0401/shecodes-webui:1.0.1 \
  --push ./frontend/portal-ui
```



---

## 9. Run Using Published Images (Any Machine)

### 9.1. (Optional) Stop & clean existing containers

**Mac / Linux (bash/zsh):**

```bash
docker stop $(docker ps -q) 2>/dev/null || true
docker rm   $(docker ps -aq) 2>/dev/null || true
```

**Windows PowerShell:**

```powershell
docker ps -q  | % { docker stop $_ }
docker ps -aq | % { docker rm $_ }
```

### 9.2. Pull all images

```bash
docker pull aditiv0401/shecodes-usermgmt:final
docker pull aditiv0401/shecodes-projectmgmt:final
docker pull aditiv0401/shecodes-inventorymgmt:final
docker pull aditiv0401/shecodes-webui:final
```

### 9.3. Run backend services

>  Replace `MONGO_URI` and `SECRET_KEY` with **your own** values.

```bash
# :8001 User service
docker run -d --name usermgmt \
  -e "MONGO_URI=<YOUR_MONGO_URI>" \
  -e "SECRET_KEY=<YOUR_SECRET_KEY>" \
  -p 8001:8001 \
  aditiv0401/shecodes-usermgmt:final

# :8002 Project service
docker run -d --name projectmgmt \
  -e "MONGO_URI=<YOUR_MONGO_URI>" \
  -e "SECRET_KEY=<YOUR_SECRET_KEY>" \
  -p 8002:8002 \
  aditiv0401/shecodes-projectmgmt:final

# :8003 Inventory service
docker run -d --name inventorymgmt \
  -e "MONGO_URI=<YOUR_MONGO_URI>" \
  -e "SECRET_KEY=<YOUR_SECRET_KEY>" \
  -p 8003:8003 \
  aditiv0401/shecodes-inventorymgmt:final
```

### 9.4. Run Web UI

```bash
docker run -d --name webui -p 3000:80 aditiv0401/shecodes-webui:final
```


### 9.5 Example :

```bash
docker pull aditiv0401/shecodes-usermgmt:final
docker pull aditiv0401/shecodes-projectmgmt:final
docker pull aditiv0401/shecodes-inventorymgmt:final
docker pull aditiv0401/shecodes-webui:final
```

# :8001 User service
docker run -d --name usermgmt \
  -e "MONGO_URI=mongodb+srv://aditi0401verma:AC0567%40Austin@mongoclustera.jdopjim.mongodb.net/?retryWrites=true&w=majority" \
  -e "SECRET_KEY=ab177b502f99293f209de918e1c02022a8a6170ccbddf661e4788e5a9c1159c3" \
  -p 8001:8001 \
  aditiv0401/shecodes-usermgmt:final

# :8002 Project service
docker run -d --name projectmgmt \
  -e "MONGO_URI=mongodb+srv://aditi0401verma:AC0567%40Austin@mongoclustera.jdopjim.mongodb.net/?retryWrites=true&w=majority" \
  -e "SECRET_KEY=ab177b502f99293f209de918e1c02022a8a6170ccbddf661e4788e5a9c1159c3" \
  -p 8002:8002 \
  aditiv0401/shecodes-projectmgmt:final

# :8003 Inventory service
docker run -d --name inventorymgmt \
  -e "MONGO_URI=mongodb+srv://aditi0401verma:AC0567%40Austin@mongoclustera.jdopjim.mongodb.net/?retryWrites=true&w=majority" \
  -e "SECRET_KEY=ab177b502f99293f209de918e1c02022a8a6170ccbddf661e4788e5a9c1159c3" \
  -p 8003:8003 \
  aditiv0401/shecodes-inventorymgmt:final

# Run the Web UI (serves on http://localhost:3000)
bash
Copy code
docker run -d --name webui -p 3000:80 aditiv0401/shecodes-webui:final

### 9.6. Quick verification

```bash
docker ps

# UI reachable at
curl -I http://localhost:3000

# Example API check (adjust path/body as needed)
curl -X POST http://localhost:8001/shecodes/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"x"}'
```

Open in browser:

* UI → `http://localhost:3000`
* APIs → `http://localhost:8001/shecodes/...`, `http://localhost:8002/shecodes/projects`, `http://localhost:8003/shecodes/inventory`

### 8.6. Stop containers later

```bash
docker stop webui inventorymgmt projectmgmt usermgmt
```

---




