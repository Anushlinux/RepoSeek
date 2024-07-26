import { useState , useEffect } from 'react'
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import Callback from './pages/Callback';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import './App.css'
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

import ChatPage from './pages/Chat';



function App() {
  

  return (
    <Router>
      <Routes>
        <Route path="/home" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/api/github/callback" element={<Callback />} />
        <Route path="*" element={<h1>404 Page not found</h1>} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Router>
  )
}

export default App
