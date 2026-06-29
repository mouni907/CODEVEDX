import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { Menu, X, Briefcase, LogOut, LayoutDashboard, Compass, Building, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
        setIsOpen(false);
    };
    const isActive = (path) => location.pathname === path;
    const navLinks = [
        { name: 'Find Jobs', path: '/jobs', icon: Compass },
        { name: 'Companies', path: '/companies', icon: Building },
    ];
    return (<nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link id="nav-logo" to="/" className="flex items-center space-x-2 text-2xl font-bold text-indigo-600 tracking-tight">
              <Briefcase className="h-7 w-7 text-indigo-600"/>
              <span>
                Job<span className="text-emerald-500">Hub</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navLinks.map((link) => {
            const Icon = link.icon;
            return (<Link key={link.path} to={link.path} id={`nav-link-${link.name.toLowerCase().replace(' ', '-')}`} className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${isActive(link.path)
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}>
                    <Icon className="h-4 w-4 mr-1.5"/>
                    {link.name}
                  </Link>);
        })}
            </div>
          </div>

          {/* Desktop Right Side Profile or CTA */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (<div className="flex items-center space-x-4">
                {/* Dashboard shortcut */}
                <Link id="nav-btn-dashboard" to={user.role === 'employer' ? '/employer-dashboard' : '/candidate-dashboard'} className="inline-flex items-center px-3.5 py-1.5 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all duration-150 border border-slate-200">
                  <LayoutDashboard className="h-4 w-4 mr-1.5 text-slate-500"/>
                  Dashboard
                </Link>

                {/* Employer Post-Job shortcut */}
                {user.role === 'employer' && (<Link id="nav-btn-post-job" to="/employer-dashboard?tab=post" className="inline-flex items-center px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-150 shadow-sm shadow-indigo-100">
                    <PlusCircle className="h-4 w-4 mr-1.5"/>
                    Post a Job
                  </Link>)}

                {/* Profile Avatar / Quick dropdown */}
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-semibold text-slate-800">{user.name}</span>
                    <span className="text-xs text-slate-400 capitalize">{user.role}</span>
                  </div>
                  <img src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt="profile" className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-50 border border-white shadow-sm"/>
                  <button id="nav-btn-logout" onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-all duration-150" title="Logout">
                    <LogOut className="h-4 w-4"/>
                  </button>
                </div>
              </div>) : (<div className="flex items-center space-x-3">
                <Link id="nav-btn-login" to="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-all duration-150">
                  Log In
                </Link>
                <Link id="nav-btn-register" to="/register" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-150 shadow-sm shadow-indigo-100">
                  Sign Up
                </Link>
              </div>)}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button id="mobile-menu-toggle" onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
              {isOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="md:hidden border-b border-slate-100 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (<Link key={link.path} to={link.path} id={`mobile-nav-${link.name.toLowerCase().replace(' ', '-')}`} onClick={() => setIsOpen(false)} className={`flex items-center px-3 py-2.5 rounded-md text-base font-medium transition-all ${isActive(link.path)
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                    <Icon className="h-5 w-5 mr-3 text-slate-400"/>
                    {link.name}
                  </Link>);
            })}

              {user && (<Link to={user.role === 'employer' ? '/employer-dashboard' : '/candidate-dashboard'} onClick={() => setIsOpen(false)} className="flex items-center px-3 py-2.5 rounded-md text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                  <LayoutDashboard className="h-5 w-5 mr-3 text-slate-400"/>
                  Dashboard
                </Link>)}
            </div>

            <div className="pt-4 pb-4 border-t border-slate-100 px-4">
              {user ? (<div>
                  <div className="flex items-center space-x-3 mb-4">
                    <img src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt="profile" className="h-10 w-10 rounded-full object-cover"/>
                    <div>
                      <div className="text-base font-semibold text-slate-800">{user.name}</div>
                      <div className="text-sm text-slate-400 capitalize">{user.role}</div>
                    </div>
                  </div>
                  <button id="mobile-nav-btn-logout" onClick={handleLogout} className="flex w-full items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md text-rose-700 bg-rose-50 hover:bg-rose-100 transition-all duration-150">
                    <LogOut className="h-4 w-4 mr-2"/>
                    Log Out
                  </button>
                </div>) : (<div className="flex flex-col space-y-2">
                  <Link id="mobile-nav-btn-login" to="/login" onClick={() => setIsOpen(false)} className="flex w-full items-center justify-center px-4 py-2.5 border border-slate-200 text-sm font-medium rounded-md text-slate-700 bg-slate-50 hover:bg-slate-100 transition-all">
                    Log In
                  </Link>
                  <Link id="mobile-nav-btn-register" to="/register" onClick={() => setIsOpen(false)} className="flex w-full items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-100">
                    Sign Up
                  </Link>
                </div>)}
            </div>
          </motion.div>)}
      </AnimatePresence>
    </nav>);
}
