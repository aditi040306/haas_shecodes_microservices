import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ApplicationLayout from './components/ApplicationLayout';
import LoginComponent from './components/LoginComponent';
import SignUpComponent from './components/SignUpComponent';
import AboutComponent from './components/AboutComponent';
import ProjectComponent from './components/ProjectComponent';
import ResourceComponent from './components/ResourceComponent';
import AddUserToProject from './components/AddUserToProject';
import AnalysisDewey from './components/AnalysisDewey';
import 'bootstrap/dist/css/bootstrap.min.css';

function MainApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ApplicationLayout />}>
          <Route index element={<AboutComponent />} />
          <Route path="login" element={<LoginComponent />} />
          <Route path="signup" element={<SignUpComponent />} />
          <Route path="about" element={<AboutComponent/>} />
          <Route path="project" element={<ProjectComponent/>} />
          <Route path="adduser" element={<AddUserToProject/>} />
          <Route path="resource" element={<ResourceComponent/>} />
          <Route path="analysis" element={<AnalysisDewey/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<MainApp />);
reportWebVitals();
