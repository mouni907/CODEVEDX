import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../redux/slices/authSlice';
import { Mail, Lock, User, Phone, ShieldAlert, ArrowRight, UserCheck, Eye, EyeOff } from 'lucide-react';
export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('candidate');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, loading, error, token } = useSelector((state) => state.auth);
    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);
    useEffect(() => {
        if (token && user) {
            if (user.role === 'employer') {
                navigate('/employer-dashboard');
            }
            else {
                navigate('/candidate-dashboard');
            }
        }
    }, [token, user, navigate]);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !email || !password || !role)
            return;
        dispatch(registerUser({ name, email, password, role, phone }));
    };
    return (<div id="page-register" className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl"/>
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl"/>

      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 text-3xl font-extrabold text-indigo-600 tracking-tight">
            <span>Job<span className="text-emerald-500">Hub</span></span>
          </Link>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 tracking-tight">Create Your Account</h2>
          <p className="mt-1 text-slate-500 text-sm">Join JobHub to access custom tools for candidates and employers.</p>
        </div>

        {/* Error alert */}
        {error && (<div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center space-x-3 text-rose-800 shadow-sm animate-shake">
            <ShieldAlert className="h-5 w-5 text-rose-600 flex-shrink-0"/>
            <p className="text-xs font-semibold">{error}</p>
          </div>)}

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection Tabs */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">I want to register as a...</label>
              <div className="grid grid-cols-2 gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner">
                <button type="button" id="tab-role-candidate" onClick={() => setRole('candidate')} className={`py-2 text-xs font-bold rounded-lg transition-all ${role === 'candidate'
            ? 'bg-white text-indigo-700 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'}`}>
                  Candidate
                </button>
                <button type="button" id="tab-role-employer" onClick={() => setRole('employer')} className={`py-2 text-xs font-bold rounded-lg transition-all ${role === 'employer'
            ? 'bg-white text-indigo-700 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'}`}>
                  Employer
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 p-3 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
                <User className="h-4.5 w-4.5 text-slate-400 mr-2 flex-shrink-0"/>
                <input type="text" required placeholder={role === 'candidate' ? 'Jane Doe' : 'John Smith'} value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent focus:outline-none text-slate-800 text-sm"/>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 p-3 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
                <Mail className="h-4.5 w-4.5 text-slate-400 mr-2 flex-shrink-0"/>
                <input type="email" required placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent focus:outline-none text-slate-800 text-sm"/>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 p-3 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
                <Lock className="h-4.5 w-4.5 text-slate-400 mr-2 flex-shrink-0"/>
                <input type={showPassword ? 'text' : 'password'} required placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent focus:outline-none text-slate-800 text-sm"/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 focus:outline-none ml-2 flex-shrink-0" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number (Optional)</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 p-3 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
                <Phone className="h-4.5 w-4.5 text-slate-400 mr-2 flex-shrink-0"/>
                <input type="text" placeholder="+1 (555) 012-3456" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-transparent focus:outline-none text-slate-800 text-sm"/>
              </div>
            </div>

            <button type="submit" id="btn-register-submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl transition duration-150 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-100 mt-4">
              {loading ? (<div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>) : (<>
                  <UserCheck className="h-4 w-4"/>
                  <span>Register Profile</span>
                </>)}
            </button>
          </form>

          <div className="text-center pt-3 border-t border-slate-50 text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline flex items-center justify-center space-x-0.5 mt-1.5">
              <span>Sign In to JobHub</span>
              <ArrowRight className="h-3.5 w-3.5"/>
            </Link>
          </div>
        </div>
      </div>
    </div>);
}
