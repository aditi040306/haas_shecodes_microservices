/********************************************************************************************
 * Direct service endpoints on localhost (no API gateway).
 * UI runs at http://localhost:3000 and calls:
 *  - http://localhost:8001/shecodes/...        (User)
 *  - http://localhost:8002/shecodes/projects... (Project)
 *  - http://localhost:8003/shecodes/inventory... (Inventory)
 ********************************************************************************************/

export const USER_BASE =
  process.env.REACT_APP_USER_URL || "http://localhost:8001/shecodes";

export const PROJECT_BASE =
  process.env.REACT_APP_PROJECT_URL || "http://localhost:8002/shecodes/projects";

export const INVENTORY_BASE =
  process.env.REACT_APP_INVENTORY_URL || "http://localhost:8003/shecodes/inventory";


export const BASE_URL = USER_BASE;

export const API = {
  user: USER_BASE,
  project: PROJECT_BASE,
  inventory: INVENTORY_BASE,
};
