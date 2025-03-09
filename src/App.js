import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import './App.css';
import LearnMore from './components/LearnMore/LearnMore';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<div>Sign Up Page (Coming Soon)</div>} />
        <Route path="/learn-more" element={<LearnMore/>} />
      </Routes>
    </Router>
  );
}

export default App;