import React, { lazy, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { themeChange } from 'theme-change';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import checkAuth from './app/auth';
import initializeApp from './app/init';
import ScrollToTop from './components/ScrollToTop'

// Importing pages
const Layout = lazy(() => import('./containers/Layout'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Register = lazy(() => import('./pages/Register'));
const Documentation = lazy(() => import('./pages/Documentation'));

// Initializing different libraries
initializeApp();

// Check for login and initialize axios
const token = checkAuth();

function App() {
  useEffect(() => {
    themeChange(false);
  }, []);

  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/documentation" element={<Documentation />} />

          {/* Place new routes over this */}
          <Route path="/app/*" element={<Layout />} />

          <Route path="*" element={<Navigate to={token ? "/app/welcome" : "/login"} replace />} />
        </Routes>
      </Router>

      {/* Thêm ToastContainer vào đây để toast hoạt động trên toàn ứng dụng */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;
