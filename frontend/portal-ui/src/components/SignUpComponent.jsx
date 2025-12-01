/**********************************************************************************************************
 * @file        SignUpComponent.jsx
 * @description Component for new user registration, including user ID and password.
 * @team        SheCodes-Hub (MSITM'26 @ McComb School of Business, UT Austin)
 * @created     2025-11-12
 * @version     v2.0.0
 **********************************************************************************************************/
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ReusableHeaderComponent from "./ReusableHeaderComponent";
import CancelButton from './CancelButton';
import { postToEndpoint } from "../utils/apiHelpers";
import { showSuccess, showError } from "../utils/toastUtils";

function SignUpComponent() {

  const [formData, setFormData] = useState({ userid: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  //This will be passed via the props to the CancelButton component
  const resetForm = () => {
    setFormData({userid: "", password: ""});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {

      const { ok, data } = await postToEndpoint("signup", {
        username: formData.userid,
        password: formData.password,
      });

      if (ok) {
        showSuccess(`Success: ${data.message}`);
        navigate("/login");
      } else {
        showError(`Error: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      showError(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{width: '80vw', maxWidth: '700px', margin: '40px auto'  }}>
      <ReusableHeaderComponent title="Welcome to User Sign-Up page" message="" />

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <label style={{ width: "100px" }}>User ID</label>
          <input
            type="text"
            name="userid"
            value={formData.userid}
            onChange={handleChange}
            required
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <label style={{ width: "100px" }}>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">
          Add User
        </button>

        {/*Calling reusable CancelButton component*/}
        <CancelButton 
          resetForm={resetForm} 
          redirectTo="/about" 
        />

      </form>

      <p style={{ marginTop: "20px" }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default SignUpComponent;
