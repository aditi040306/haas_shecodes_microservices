/**********************************************************************************************************
 * @file        ProjectComponent.jsx
 * @description Component to create new Project in the system (optionally add a user in the same call)
 * @team        SheCodes-Hub (MSITM'26 @ McComb School of Business, UT Austin)
 * @created     2025-11-12
 * @version     v2.1.1
 **********************************************************************************************************/
import React, { useState, useEffect } from 'react';
import ReusableHeaderComponent from './ReusableHeaderComponent';
import { useOutletContext, useNavigate } from 'react-router-dom';
import CancelButton from './CancelButton';

import { postToEndpoint } from "../utils/apiHelpers";
import { PROJECT_BASE } from "../utils/apiConfig";
import { showSuccess, showError } from "../utils/toastUtils";

function ProjectComponent() {
  const { setIsLoggedIn } = useOutletContext();

  useEffect(() => {
    setIsLoggedIn(true);
  }, [setIsLoggedIn]);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    projectid: "",
    projectname: "",
    description: ""
  });

  // Optional: add a user as part of project creation
  const [initialUserId, setInitialUserId] = useState("");

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const resetForm = () => {
    setFormData({ projectid: "", projectname: "", description: "" });
    setInitialUserId("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

      const trimmedUser = initialUserId.trim();
      if (!trimmedUser) {
      showError("User ID is required for project creation.");
      return;
      }

    try {
      // Build payload; include userid only if provided
      const trimmedUser = initialUserId.trim();
      const payload = {
        projectid: formData.projectid,
        projectname: formData.projectname,
        description: formData.description,
        userid: trimmedUser,  // NEW
      };

      // Single call: /shecodes/projects/createproject
      const { ok, data } = await postToEndpoint("createproject", payload, PROJECT_BASE);

      if (!ok) {
        showError(`Error: ${data?.message || "Unknown error"}`);
        return;
      }

      showSuccess(data?.message || "Project created successfully");
      navigate("/resource");
    } catch (error) {
      showError(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ width: '80vw', maxWidth: '700px', margin: '40px auto' }}>
      <ReusableHeaderComponent title="Welcome to New Project page" message="" />
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px", marginTop: "2rem" }}>
          <label style={{ width: "100px" }}>Project ID</label>
          <input
            type="text"
            name="projectid"
            value={formData.projectid}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <label style={{ width: "100px" }}>Project Name</label>
          <input
            type="text"
            name="projectname"
            value={formData.projectname}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <label style={{ width: "100px" }}>Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        {/*  */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <label style={{ width: "100px" }}>User ID</label>
          <input
            type="text"
            name="initialUserId"
            value={initialUserId}
            onChange={(e) => setInitialUserId(e.target.value)}
            required
            
          />
        </div>

        <button type="submit">Add Project</button>
        <CancelButton resetForm={resetForm} redirectTo="/resource" />
      </form>
    </div>
  );
}

export default ProjectComponent;
