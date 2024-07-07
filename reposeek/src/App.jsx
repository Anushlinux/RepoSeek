import { useState } from 'react'
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import './App.css'



function App() {
  

  return (
    <Router>
      <Routes>
        <Route path="/home" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<h1>404 Page not found</h1>} />
      </Routes>
    </Router>
  )
}

export default App
