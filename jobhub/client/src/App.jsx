import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './redux/slices/authSlice';
// Components & Layout elements
import Navbar from './components/Navbar';
import Footer from './components/Footer';
// Pages
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Companies from './pages/Companies';
import Login from './pages/Login';
import Register from './pages/Register';
import CandidateDashboard from './pages/CandidateDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import NotFound from './pages/NotFound';
// Navigation Guards
function CandidateRoute({ children }) {
    const { token, user, loading } = useSelector((state) => state.auth);
    const location = useLocation();
    if (loading) {
        return (<div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>);
    }
    if (!token) {
        return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace/>;
    }
    if (user && user.role !== 'candidate') {
        return <Navigate to="/employer-dashboard" replace/>;
    }
    return <>{children}</>;
}
function EmployerRoute({ children }) {
    const { token, user, loading } = useSelector((state) => state.auth);
    const location = useLocation();
    if (loading) {
        return (<div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>);
    }
    if (!token) {
        return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace/>;
    }
    if (user && user.role !== 'employer') {
        return <Navigate to="/candidate-dashboard" replace/>;
    }
    return <>{children}</>;
}
export default function App() {
    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.auth);
    // Retrieve user profiles on app boot if token exists
    useEffect(() => {
        if (token) {
            dispatch(loadUser());
        }
    }, [dispatch, token]);
    return (<div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Global SaaS Navigation Bar */}
      <Navbar />

      {/* Main Pages Content Area */}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />}/>
          <Route path="/jobs" element={<Jobs />}/>
          <Route path="/jobs/:id" element={<JobDetails />}/>
          <Route path="/companies" element={<Companies />}/>
          <Route path="/login" element={<Login />}/>
          <Route path="/register" element={<Register />}/>

          {/* Secure Candidate Routes */}
          <Route path="/candidate-dashboard" element={<CandidateRoute>
                <CandidateDashboard />
              </CandidateRoute>}/>

          {/* Secure Employer Routes */}
          <Route path="/employer-dashboard" element={<EmployerRoute>
                <EmployerDashboard />
              </EmployerRoute>}/>

          {/* Catch-All Fallback Route */}
          <Route path="*" element={<NotFound />}/>
        </Routes>
      </main>

      {/* Global SaaS Footer column */}
      <Footer />
    </div>);
}
