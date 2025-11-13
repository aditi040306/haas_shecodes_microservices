/*************************************************************************************************************
 * @file        ApplicationLayout.jsx
 * @description ApplicationLayout component providing a consistent header, footer, and navigation across pages.
 * @team        SheCodes-Hub (MSITM'26 @ McComb School of Business, UT Austin)
 * @created     2025-11-12
 * @version     v2.0.0
 *
 * @notes       - Header to display the Common System name across the pages.
 *              - Uses React Router's <Outlet /> to render nested routes.
 *              - Footer credits the team.
 ***************************************************************************************************************/
import React, { useState } from "react";
import { Outlet } from "react-router-dom";

//importing react-toastify library to leverage the toast features
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import NavBar from "./NavBar";

function ApplicationLayout() {

  //placing the useState for tracking LoggedIn/LoggedOut on this page as, its the parent of all the child pages(Outlet)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (

    <div>

      {/*Will provide the navigation bar of the Application*/}
      <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      {/* Child component will load in this section */}
      <main style={{ padding: "1rem", minHeight: "80vh" }}>
        <Outlet context={{ setIsLoggedIn }} />
      </main>

      <footer
        style={{
          padding: "0.625rem",
          textAlign: "center",
          background: "#4B0082",
          color: "#fff",
        }}
      >
        © 2025 SheCodes‑Hub Team | McCombs School of Business, UT Austin
      </footer>

      {/* Placing toast container for all pages and not calling seperately on each pages */}
      <ToastContainer />
  
    </div>
  );
}

export default ApplicationLayout;
