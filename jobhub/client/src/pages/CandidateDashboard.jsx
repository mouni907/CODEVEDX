import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile, changeUserPassword, clearSuccess, clearError } from '../redux/slices/authSlice';
import { fetchMyApplications } from '../redux/slices/applicationSlice';
import { User, FileText, Lock, Key, Save, Phone, Mail, Clock, CheckCircle, XCircle, ChevronRight, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { resizeImage } from '../services/imageUtils';
export default function CandidateDashboard() {
    const dispatch = useDispatch();
    const { user, loading: authLoading, success: authSuccess, error: authError } = useSelector((state) => state.auth);
    const { applications, loading: appLoading } = useSelector((state) => state.applications);
    // Active Tab
    const [activeTab, setActiveTab] = useState('applied');
    // Profile Edit States
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [avatarFile, setAvatarFile] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    // Security States
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // Floating notifications
    const [banner, setBanner] = useState(null);
    useEffect(() => {
        dispatch(fetchMyApplications());
    }, [dispatch]);
    useEffect(() => {
        if (user) {
            setName(user.name);
            setPhone(user.phone || '');
        }
    }, [user]);
    useEffect(() => {
        if (authSuccess) {
            setBanner({ type: 'success', text: 'Changes updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setAvatarFile(null);
            setResumeFile(null);
            dispatch(clearSuccess());
        }
        if (authError) {
            setBanner({ type: 'error', text: authError });
            dispatch(clearError());
        }
    }, [authSuccess, authError, dispatch]);
    const handleProfileSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('phone', phone);
        if (avatarFile) {
            formData.append('file', avatarFile);
        }
        else if (resumeFile) {
            formData.append('file', resumeFile);
        }
        dispatch(updateUserProfile(formData));
    };
    const handleResumeUploadDirect = (file) => {
        const formData = new FormData();
        formData.append('file', file);
        dispatch(updateUserProfile(formData));
    };
    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setBanner({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        dispatch(changeUserPassword({ currentPassword, newPassword }));
    };
    const getStatusStyle = (status) => {
        switch (status) {
            case 'accepted':
                return { bg: 'bg-emerald-50 border-emerald-100 text-emerald-700', icon: CheckCircle, text: 'Accepted' };
            case 'rejected':
                return { bg: 'bg-rose-50 border-rose-100 text-rose-700', icon: XCircle, text: 'Not Selected' };
            default:
                return { bg: 'bg-amber-50 border-amber-100 text-amber-700', icon: Clock, text: 'Review Pending' };
        }
    };
    return (<div id="page-candidate-dashboard" className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left column sidebar widgets */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col items-center">
            <div className="relative group cursor-pointer mb-4">
              <img src={user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt="Profile" className="h-24 w-24 object-cover rounded-full ring-4 ring-indigo-50 border-2 border-white shadow-sm"/>
              <label className="absolute inset-0 bg-black/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 text-xs font-semibold cursor-pointer">
                <Upload className="h-4 w-4 mr-1"/>
                Change
                <input type="file" accept="image/*" onChange={async (e) => {
            if (e.target.files && e.target.files.length > 0) {
                const file = e.target.files[0];
                const { file: resized } = await resizeImage(file, 150, 150);
                setAvatarFile(resized);
                const formData = new FormData();
                formData.append('file', resized);
                dispatch(updateUserProfile(formData));
            }
        }} className="hidden"/>
              </label>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-400 capitalize font-semibold mb-3">{user?.role}</p>
            <div className="flex flex-col w-full text-left gap-2 border-t border-slate-50 pt-3 text-xs text-slate-500">
              <div className="flex items-center"><Mail className="h-4 w-4 mr-2 text-slate-400"/> {user?.email}</div>
              {user?.phone && <div className="flex items-center"><Phone className="h-4 w-4 mr-2 text-slate-400"/> {user.phone}</div>}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <button id="cand-tab-applied" onClick={() => { setActiveTab('applied'); setBanner(null); }} className={`px-5 py-3.5 text-left text-sm font-semibold border-l-4 transition flex items-center space-x-2.5 ${activeTab === 'applied'
            ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700 font-bold'
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
              <FileText className="h-4.5 w-4.5"/>
              <span>Applied Positions</span>
            </button>

            <button id="cand-tab-profile" onClick={() => { setActiveTab('profile'); setBanner(null); }} className={`px-5 py-3.5 text-left text-sm font-semibold border-l-4 transition flex items-center space-x-2.5 ${activeTab === 'profile'
            ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700 font-bold'
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
              <User className="h-4.5 w-4.5"/>
              <span>Personal Details</span>
            </button>

            <button id="cand-tab-security" onClick={() => { setActiveTab('security'); setBanner(null); }} className={`px-5 py-3.5 text-left text-sm font-semibold border-l-4 transition flex items-center space-x-2.5 ${activeTab === 'security'
            ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700 font-bold'
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
              <Lock className="h-4.5 w-4.5"/>
              <span>Access & Security</span>
            </button>
          </div>
        </div>

        {/* Right column dashboard tabs content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Status banner alerts */}
          {banner && (<div id="cand-dashboard-alert" className={`p-4 rounded-xl border flex items-center space-x-3 shadow-sm ${banner.type === 'success'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
              {banner.type === 'success' ? (<CheckCircle2 className="h-5 w-5 text-emerald-600"/>) : (<AlertCircle className="h-5 w-5 text-rose-600"/>)}
              <p className="text-xs font-semibold">{banner.text}</p>
            </div>)}

          {/* TAB 1: APPLIED POSITIONS */}
          {activeTab === 'applied' && (<div className="space-y-4">
              <div className="border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-bold text-slate-900">Applied Positions</h1>
                <p className="text-slate-500 text-xs mt-1">Review dates, resume configurations, and recruiter updates</p>
              </div>

              {appLoading ? (Array.from({ length: 2 }).map((_, idx) => (<div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-8 bg-slate-200 rounded w-full"></div>
                  </div>))) : applications.length === 0 ? (<div id="applied-empty-state" className="bg-white p-12 rounded-2xl border border-slate-150 text-center text-slate-500">
                  <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3"/>
                  <h3 className="text-sm font-bold text-slate-800">No Job Applications</h3>
                  <p className="text-xs text-slate-400 mt-1 mb-4">You have not submitted any applications for open listings yet.</p>
                  <Link to="/jobs" className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition">
                    Browse Career Listings
                  </Link>
                </div>) : (applications.map((app) => {
                const job = typeof app.job === 'object' ? app.job : null;
                const statusInfo = getStatusStyle(app.status);
                const StatusIcon = statusInfo.icon;
                if (!job)
                    return null;
                return (<div key={app.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-slate-200 transition">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 text-xs font-semibold border rounded-full ${statusInfo.bg}`}>
                            <StatusIcon className="h-3 w-3 mr-0.5"/>
                            <span>{statusInfo.text}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            Applied on {new Date(app.appliedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 hover:text-indigo-600">
                          <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                        </h3>
                        <p className="text-sm font-semibold text-slate-600">{job.company}</p>

                        {app.resume && (<div className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800 font-semibold bg-indigo-50/30 px-2 py-1 rounded border border-indigo-100/50">
                            <FileText className="h-3.5 w-3.5 mr-1 text-indigo-500"/>
                            <a href={app.resume} target="_blank" rel="noopener noreferrer" className="truncate max-w-xs">
                              Review submitted resume file
                            </a>
                          </div>)}
                      </div>

                      <div className="border-t sm:border-none pt-3 sm:pt-0">
                        <Link to={`/jobs/${job.id}`} className="w-full sm:w-auto text-xs text-indigo-600 font-bold hover:text-indigo-800 flex items-center justify-center space-x-0.5 border border-slate-200 py-2 px-4 rounded-lg hover:bg-slate-50 transition">
                          <span>Listing Details</span>
                          <ChevronRight className="h-4 w-4"/>
                        </Link>
                      </div>
                    </div>);
            }))}
            </div>)}

          {/* TAB 2: PERSONAL DETAILS */}
          {activeTab === 'profile' && (<div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h1 className="text-xl font-bold text-slate-900">Profile Settings</h1>
                <p className="text-slate-500 text-xs mt-1">Manage public recruiter fields and default documents</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 p-3 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20">
                      <User className="h-4.5 w-4.5 text-slate-400 mr-2"/>
                      <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent focus:outline-none text-slate-800 text-sm font-medium"/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 p-3 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20">
                      <Phone className="h-4.5 w-4.5 text-slate-400 mr-2"/>
                      <input type="text" placeholder="+1 (555) 012-3456" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-transparent focus:outline-none text-slate-800 text-sm font-medium"/>
                    </div>
                  </div>
                </div>

                {/* Resume Upload Panel */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Default Profile Resume</label>
                  {user?.resume ? (<div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center space-x-2.5">
                        <FileText className="h-6 w-6 text-indigo-500"/>
                        <div>
                          <p className="text-xs font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                            Master Resume Document
                          </p>
                          <a href={user.resume} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-600 hover:underline">
                            Download / Preview file
                          </a>
                        </div>
                      </div>

                      <label className="cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-sm">
                        <Upload className="h-3.5 w-3.5"/>
                        <span>Replace File</span>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                        setResumeFile(e.target.files[0]);
                        handleResumeUploadDirect(e.target.files[0]);
                    }
                }} className="hidden"/>
                      </label>
                    </div>) : (<div className="border border-dashed border-slate-200 p-6 rounded-xl bg-slate-50 text-center space-y-2">
                      <FileText className="h-8 w-8 text-slate-300 mx-auto"/>
                      <p className="text-xs text-slate-500">You do not have a default resume on your profile yet.</p>
                      <label className="inline-flex items-center space-x-1 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm">
                        <Upload className="h-3.5 w-3.5"/>
                        <span>Upload PDF/Word Resume</span>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                        setResumeFile(e.target.files[0]);
                        handleResumeUploadDirect(e.target.files[0]);
                    }
                }} className="hidden"/>
                      </label>
                    </div>)}
                </div>

                <div className="border-t border-slate-100 pt-4 flex justify-end">
                  <button type="submit" id="btn-profile-save" disabled={authLoading} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl flex items-center space-x-1.5 transition shadow-md shadow-indigo-100">
                    <Save className="h-4 w-4"/>
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>)}

          {/* TAB 3: ACCESS & SECURITY */}
          {activeTab === 'security' && (<div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h1 className="text-xl font-bold text-slate-900">Security & Credentials</h1>
                <p className="text-slate-500 text-xs mt-1">Keep your portal access protected and secure</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Current Password</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 p-3 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20">
                    <Key className="h-4.5 w-4.5 text-slate-400 mr-2"/>
                    <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-transparent focus:outline-none text-slate-800 text-sm"/>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">New Password</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 p-3 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20">
                    <Lock className="h-4.5 w-4.5 text-slate-400 mr-2"/>
                    <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-transparent focus:outline-none text-slate-800 text-sm"/>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 p-3 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20">
                    <Lock className="h-4.5 w-4.5 text-slate-400 mr-2"/>
                    <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-transparent focus:outline-none text-slate-800 text-sm"/>
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" id="btn-security-save" disabled={authLoading} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition shadow-md">
                    <Lock className="h-4 w-4"/>
                    <span>Change Password</span>
                  </button>
                </div>
              </form>
            </div>)}
        </div>
      </div>
    </div>);
}
