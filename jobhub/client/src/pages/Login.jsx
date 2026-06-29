import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../redux/slices/authSlice';
import { Mail, Lock, LogIn, ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, loading, error, token } = useSelector((state) => state.auth);
    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);
    useEffect(() => {
        if (token && user) {
            const redirect = searchParams.get('redirect');
            if (redirect) {
                navigate(decodeURIComponent(redirect));
            }
            else if (user.role === 'employer') {
                navigate('/employer-dashboard');
            }
            else {
                navigate('/candidate-dashboard');
            }
        }
    }, [token, user, navigate, searchParams]);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !password)
            return;
        dispatch(loginUser({ email, password }));
    };
    return (<div id="page-login" className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative ambient blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl"/>
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl"/>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 text-3xl font-extrabold text-indigo-600 tracking-tight">
            <span>Job<span className="text-emerald-500">Hub</span></span>
          </Link>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="mt-1 text-slate-500 text-sm">Log in to manage listings, save jobs, and apply.</p>
        </div>

        {/* Error Notification */}
        {error && (<div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center space-x-3 text-rose-800 shadow-sm animate-shake">
            <ShieldAlert className="h-5 w-5 text-rose-600 flex-shrink-0"/>
            <p className="text-xs font-semibold">{error}</p>
          </div>)}

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 p-3 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
                <Mail className="h-4.5 w-4.5 text-slate-400 mr-2 flex-shrink-0"/>
                <input type="email" required placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent focus:outline-none text-slate-800 text-sm"/>
              </div>
            </div>

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

            <button type="submit" id="btn-login-submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl transition duration-150 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-100 mt-2">
              {loading ? (<div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>) : (<>
                  <LogIn className="h-4 w-4"/>
                  <span>Log In to JobHub</span>
                </>)}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-50 text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline flex items-center justify-center space-x-0.5 mt-1.5">
              <span>Create Candidate or Employer Profile</span>
              <ArrowRight className="h-3.5 w-3.5"/>
            </Link>
          </div>
        </div>
      </div>
    </div>);
}
