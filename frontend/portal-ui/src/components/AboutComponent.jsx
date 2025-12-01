/******************************************************************************************
 * @file        AboutComponent.jsx
 * @description 'About' which is main page of the portal having basic information of the Haas System
 * @team        SheCodes-Hub (MSITM'26 @ McComb School of Business, UT Austin)
 * @created     2025-11-12
 * @version     v2.0.0
**********************************************************************************************************/
import React from 'react'
import ReusableHeaderPage from './ReusableHeaderComponent'

const AboutComponent = () => {
  return (
    <div style={{ width: '80vw', maxWidth: '700px', margin: '2.5rem auto'  }}>
      
      {/*Reusable component 'ReusableHeaderPage' to display page title */}
      <ReusableHeaderPage 
        title = "Welcome to Hardware Resource Management Portal"
        message={`This project is a proof of concept (PoC) web application for a Hardware-as-a-Service (HaaS) system. It allows users to securely manage accounts, create and access projects, and interact with shared hardware resources.
        The app is designed for cloud-based flexibility and scalability, supporting real-time hardware status tracking, secure authentication, and collaborative development using modern tools like React.js, MongoDB, and Heroku.

        To explore the system's features, please sign in if you're an existing user, or sign up to create a new account.`} 
      />
    </div>
  )
}

export default AboutComponent