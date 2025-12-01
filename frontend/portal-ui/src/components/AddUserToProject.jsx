/****************************************************************************************************
 * @file        AddUserToProject.jsx
 * @description Add an existing user to an existing project (Project service).
 * @team        SheCodes-Hub (MSITM'26 @ McCombs)
 * @version     v2.0.0
 ****************************************************************************************************/
import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import ReusableHeaderComponent from "./ReusableHeaderComponent";
import CancelButton from "./CancelButton";
import { postProject } from "../utils/apiHelpers";   // uses PROJECT_BASE
import { showSuccess, showError } from "../utils/toastUtils";

function AddUserToProject() {
  const { setIsLoggedIn } = useOutletContext();

  useEffect(() => { setIsLoggedIn(true); }, [setIsLoggedIn]);

  const [form, setForm] = useState({ projectid: "", userid: "" });
  const [errors, setErrors] = useState({});

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const e = {};
    if (!form.projectid.trim()) e.projectid = "Project ID is required.";
    if (!form.userid.trim()) e.userid = "User ID is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // backend expects { projectid, userid }
      const { ok, data } = await postProject("addUserProject", {
        projectid: form.projectid.trim(),
        userid: form.userid.trim(),
      });

      if (ok) {
        showSuccess(`Success: ${data.message || "User added to project."}`);
        setForm({ projectid: "", userid: "" });
      } else {
        showError(`Error: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      showError(`Error: ${err.message}`);
    }
  };

  const resetForm = () => setForm({ projectid: "", userid: "" });

  return (
    <div style={{ width: "80vw", maxWidth: "700px", margin: "2.5rem auto" }}>
      <ReusableHeaderComponent
        title="Add User to Project"
        message="Link an existing user to an existing project."
      />

      <form onSubmit={onSubmit} style={{ marginTop: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <label style={{ width: 100 }}>Project ID</label>
          <input
            name="projectid"
            type="text"
            value={form.projectid}
            onChange={onChange}
            required
          />
        </div>
        {errors.projectid && (
          <div style={{ color: "crimson", marginBottom: 8 }}>{errors.projectid}</div>
        )}

        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <label style={{ width: 100 }}>User ID</label>
          <input
            name="userid"
            type="text"
            value={form.userid}
            onChange={onChange}
            required
          />
        </div>
        {errors.userid && (
          <div style={{ color: "crimson", marginBottom: 8 }}>{errors.userid}</div>
        )}

        <button type="submit">Add User</button>
        <CancelButton resetForm={resetForm} redirectTo="/resource" />
      </form>
    </div>
  );
}

export default AddUserToProject;
