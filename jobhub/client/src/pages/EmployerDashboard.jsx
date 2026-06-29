import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile, changeUserPassword, clearSuccess as clearAuthSuccess, clearError as clearAuthError } from '../redux/slices/authSlice';
import { fetchMyJobs, postJob, editJob, removeJob, clearJobSuccess, clearJobError } from '../redux/slices/jobSlice';
import { fetchMyCompany, saveCompanyProfile, clearCompanySuccess, clearCompanyError } from '../redux/slices/companySlice';
import { fetchJobApplicants, updateApplicationStatus, clearApplicationSuccess, clearApplicationError } from '../redux/slices/applicationSlice';
import { LayoutDashboard, Briefcase, PlusCircle, Building, Lock, TrendingUp, Users, CheckCircle, Clock, Trash2, Edit, Save, MapPin, FileText, User, ArrowLeft, Upload, UserMinus, CheckCircle2, AlertCircle, XCircle, Mail, Phone, } from 'lucide-react';
import { resizeImage } from '../services/imageUtils';
export default function EmployerDashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useDispatch();
    // Global Redux States
    const { user, success: authSuccess, error: authError } = useSelector((state) => state.auth);
    const { myJobs, success: jobSuccess, error: jobError, loading: jobLoading } = useSelector((state) => state.jobs);
    const { myCompany, success: companySuccess, error: companyError } = useSelector((state) => state.companies);
    const { applicants, success: appSuccess, error: appError, loading: appLoading } = useSelector((state) => state.applications);
    // Active Tab: overview, listings, post, company, security, applicants
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
    // Applicant sub-states
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [selectedJobTitle, setSelectedJobTitle] = useState('');
    // Job Posting/Editing States
    const [isEditingJob, setIsEditingJob] = useState(false);
    const [editingJobId, setEditingJobId] = useState(null);
    const [jobTitle, setJobTitle] = useState('');
    const [jobLocation, setJobLocation] = useState('');
    const [jobCategory, setJobCategory] = useState('Frontend Development');
    const [jobExperience, setJobExperience] = useState('');
    const [jobSalary, setJobSalary] = useState('');
    const [jobType, setJobType] = useState('Full-time');
    const [jobDescription, setJobDescription] = useState('');
    const [jobRequirements, setJobRequirements] = useState('');
    // Company Profile States
    const [companyName, setCompanyName] = useState('');
    const [companyLocation, setCompanyLocation] = useState('');
    const [companyWebsite, setCompanyWebsite] = useState('');
    const [companyDescription, setCompanyDescription] = useState('');
    const [companyLogo, setCompanyLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    // Custom Category States
    const [categories, setCategories] = useState(['Frontend Development', 'Backend Development', 'Design', 'Marketing', 'Product Management']);
    const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
    const [newCategoryInput, setNewCategoryInput] = useState('');

    useEffect(() => {
        if (myJobs) {
            const myJobCategories = myJobs.map(j => j.category).filter(Boolean);
            setCategories(prev => [...new Set([...prev, ...myJobCategories])]);
        }
    }, [myJobs]);

    const handleAddCategoryPrompt = () => {
        setNewCategoryInput('');
        setShowAddCategoryInput(true);
    };

    const handleSaveNewCategory = () => {
        const trimmed = newCategoryInput.trim();
        if (trimmed) {
            if (!categories.includes(trimmed)) {
                setCategories(prev => [...prev, trimmed]);
            }
            setJobCategory(trimmed);
            setShowAddCategoryInput(false);
        }
    };
    // Employer Personal Profile States
    const [employerName, setEmployerName] = useState(user?.name || '');
    const [employerPhone, setEmployerPhone] = useState(user?.phone || '');
    const [employerAvatar, setEmployerAvatar] = useState(null);
    // Access Security
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // Banners
    const [banner, setBanner] = useState(null);
    // Load initial dashboard data
    useEffect(() => {
        dispatch(fetchMyJobs());
        dispatch(fetchMyCompany());
    }, [dispatch]);
    // Sync tab with query params
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['overview', 'listings', 'post', 'company', 'security', 'profile'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);
    // Handle MyCompany Prefills
    useEffect(() => {
        if (myCompany) {
            setCompanyName(myCompany.companyName);
            setCompanyLocation(myCompany.location);
            setCompanyWebsite(myCompany.website || '');
            setCompanyDescription(myCompany.description);
            setLogoPreview(myCompany.logo || null);
        }
    }, [myCompany]);
    // Handle Employer Personal Profile Prefills
    useEffect(() => {
        if (user) {
            setEmployerName(user.name);
            setEmployerPhone(user.phone || '');
        }
    }, [user]);
    // Alert system triggers
    useEffect(() => {
        if (authSuccess) {
            setBanner({ type: 'success', text: 'Settings or profile updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setEmployerAvatar(null);
            dispatch(clearAuthSuccess());
        }
        if (authError) {
            setBanner({ type: 'error', text: authError });
            dispatch(clearAuthError());
        }
    }, [authSuccess, authError, dispatch]);
    useEffect(() => {
        if (jobSuccess) {
            setBanner({
                type: 'success',
                text: isEditingJob ? 'Job posting updated successfully!' : 'Job posting created successfully!',
            });
            setIsEditingJob(false);
            setEditingJobId(null);
            resetJobForm();
            setActiveTab('listings');
            dispatch(fetchMyJobs());
            dispatch(clearJobSuccess());
        }
        if (jobError) {
            setBanner({ type: 'error', text: jobError });
            dispatch(clearJobError());
        }
    }, [jobSuccess, jobError, dispatch]);
    useEffect(() => {
        if (companySuccess) {
            setBanner({ type: 'success', text: 'Company profile saved successfully!' });
            dispatch(fetchMyCompany());
            dispatch(clearCompanySuccess());
        }
        if (companyError) {
            setBanner({ type: 'error', text: companyError });
            dispatch(clearCompanyError());
        }
    }, [companySuccess, companyError, dispatch]);
    useEffect(() => {
        if (appSuccess) {
            setBanner({ type: 'success', text: 'Application status changed! Recipient notified.' });
            if (selectedJobId) {
                dispatch(fetchJobApplicants(selectedJobId));
            }
            dispatch(clearApplicationSuccess());
        }
        if (appError) {
            setBanner({ type: 'error', text: appError });
            dispatch(clearApplicationError());
        }
    }, [appSuccess, appError, dispatch, selectedJobId]);
    const resetJobForm = () => {
        setJobTitle('');
        setJobLocation('');
        setJobCategory('Frontend Development');
        setJobExperience('');
        setJobSalary('');
        setJobType('Full-time');
        setJobDescription('');
        setJobRequirements('');
    };
    const handleJobSubmit = (e) => {
        e.preventDefault();
        if (!myCompany) {
            setBanner({ type: 'error', text: 'You must set up your Company Profile first.' });
            return;
        }
        const jobData = {
            title: jobTitle,
            location: jobLocation,
            category: jobCategory,
            experience: jobExperience,
            salary: jobSalary,
            employmentType: jobType,
            description: jobDescription,
            requirements: jobRequirements,
        };
        if (isEditingJob && editingJobId) {
            dispatch(editJob({ jobId: editingJobId, jobData }));
        }
        else {
            dispatch(postJob(jobData));
        }
    };
    const handleEditJobClick = (job) => {
        setIsEditingJob(true);
        setEditingJobId(job.id);
        setJobTitle(job.title);
        setJobLocation(job.location);
        setJobCategory(job.category);
        setJobExperience(job.experience);
        setJobSalary(job.salary);
        setJobType(job.employmentType);
        setJobDescription(job.description);
        setJobRequirements(job.requirements);
        setActiveTab('post');
    };
    const handleDeleteJobClick = (id) => {
        if (window.confirm('Are you absolutely sure you want to delete this job listing? This will remove all associated applications.')) {
            dispatch(removeJob(id));
        }
    };
    const handleViewApplicants = (jobId, jobTitle) => {
        setSelectedJobId(jobId);
        setSelectedJobTitle(jobTitle);
        setActiveTab('applicants');
        dispatch(fetchJobApplicants(jobId));
    };
    const handleStatusChange = (applicationId, status) => {
        dispatch(updateApplicationStatus({ applicationId, status }));
    };
    const handleCompanySubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('companyName', companyName);
        formData.append('location', companyLocation);
        formData.append('website', companyWebsite.trim());
        formData.append('description', companyDescription);
        if (companyLogo) {
            formData.append('file', companyLogo);
        }
        dispatch(saveCompanyProfile(formData));
    };
    const handleProfileSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', employerName);
        formData.append('phone', employerPhone);
        if (employerAvatar) {
            formData.append('file', employerAvatar);
        }
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
    // Predefined lists
    const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
    // Basic mock analytic aggregates
    const totalJobsCount = myJobs?.length || 0;
    const totalApplicantsCount = 5; // Simulating metrics if offline, or counting from real database lists if available
    return (<div id="page-employer-dashboard" className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side Tab Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col items-center">
            <div className="relative group cursor-pointer mb-4">
              <img src={user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt="Profile" className="h-20 w-20 object-cover rounded-full ring-4 ring-indigo-50 border-2 border-white shadow-sm"/>
              <label className="absolute inset-0 bg-black/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 text-[10px] font-semibold cursor-pointer">
                <Upload className="h-3 w-3 mr-1"/>
                Change
                <input type="file" accept="image/*" onChange={async (e) => {
            if (e.target.files && e.target.files.length > 0) {
                const file = e.target.files[0];
                const { file: resized } = await resizeImage(file, 150, 150);
                setEmployerAvatar(resized);
                const formData = new FormData();
                formData.append('file', resized);
                dispatch(updateUserProfile(formData));
            }
        }} className="hidden"/>
              </label>
            </div>
            <h2 className="text-base font-bold text-slate-900 truncate max-w-full">
              {user?.name}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {myCompany?.companyName || 'Set Company Profile'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <button id="emp-tab-overview" onClick={() => { setActiveTab('overview'); setBanner(null); }} className={`px-5 py-3.5 text-left text-sm font-semibold border-l-4 transition flex items-center space-x-2.5 ${activeTab === 'overview'
            ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700 font-bold'
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
              <LayoutDashboard className="h-4.5 w-4.5"/>
              <span>Dashboard Analytics</span>
            </button>

            <button id="emp-tab-profile" onClick={() => { setActiveTab('profile'); setBanner(null); }} className={`px-5 py-3.5 text-left text-sm font-semibold border-l-4 transition flex items-center space-x-2.5 ${activeTab === 'profile'
            ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700 font-bold'
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
              <User className="h-4.5 w-4.5"/>
              <span>Personal Profile</span>
            </button>

            <button id="emp-tab-listings" onClick={() => { setActiveTab('listings'); setBanner(null); }} className={`px-5 py-3.5 text-left text-sm font-semibold border-l-4 transition flex items-center space-x-2.5 ${activeTab === 'listings'
            ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700 font-bold'
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
              <Briefcase className="h-4.5 w-4.5"/>
              <span>Manage Listings</span>
            </button>

            <button id="emp-tab-post" onClick={() => {
            setActiveTab('post');
            setIsEditingJob(false);
            setEditingJobId(null);
            resetJobForm();
            setBanner(null);
        }} className={`px-5 py-3.5 text-left text-sm font-semibold border-l-4 transition flex items-center space-x-2.5 ${activeTab === 'post'
            ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700 font-bold'
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
              <PlusCircle className="h-4.5 w-4.5"/>
              <span>Post a Job Listing</span>
            </button>

            <button id="emp-tab-company" onClick={() => { setActiveTab('company'); setBanner(null); }} className={`px-5 py-3.5 text-left text-sm font-semibold border-l-4 transition flex items-center space-x-2.5 ${activeTab === 'company'
            ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700 font-bold'
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
              <Building className="h-4.5 w-4.5"/>
              <span>Company Profile</span>
            </button>

            <button id="emp-tab-security" onClick={() => { setActiveTab('security'); setBanner(null); }} className={`px-5 py-3.5 text-left text-sm font-semibold border-l-4 transition flex items-center space-x-2.5 ${activeTab === 'security'
            ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700 font-bold'
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
              <Lock className="h-4.5 w-4.5"/>
              <span>Credentials & Security</span>
            </button>
          </div>
        </div>

        {/* Right Side Main Dashboard Panels */}
        <div className="lg:col-span-3 space-y-6">
          {/* Status alerts */}
          {banner && (<div id="emp-dashboard-alert" className={`p-4 rounded-xl border flex items-center space-x-3 shadow-sm ${banner.type === 'success'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
              {banner.type === 'success' ? (<CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0"/>) : (<AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0"/>)}
              <p className="text-xs font-semibold">{banner.text}</p>
            </div>)}

          {/* TAB 1: OVERVIEW ANALYTICS */}
          {activeTab === 'overview' && (<div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500 text-xs mt-1">Operational aggregates and career portal analytics</p>
              </div>

              {/* Bento grid scorecards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                  <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Briefcase className="h-6 w-6"/>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Postings</div>
                    <div className="text-2xl font-black text-slate-950 mt-1">{totalJobsCount}</div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                  <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Users className="h-6 w-6"/>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Candidates Applied</div>
                    <div className="text-2xl font-black text-slate-950 mt-1">{totalApplicantsCount}</div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                  <div className="p-3.5 bg-orange-50 text-orange-600 rounded-xl">
                    <TrendingUp className="h-6 w-6"/>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Growth Factor</div>
                    <div className="text-2xl font-black text-slate-950 mt-1">Direct</div>
                  </div>
                </div>
              </div>

              {/* Shortcut card */}
              {!myCompany && (<div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-amber-800 flex items-center">
                      <AlertCircle className="h-4.5 w-4.5 mr-1.5 text-amber-600"/>
                      Action Required: Company Setup
                    </h3>
                    <p className="text-xs text-amber-600 leading-relaxed max-w-xl">
                      You must configure your company name, description, logo, and website before you can post public career listings.
                    </p>
                  </div>
                  <button onClick={() => setActiveTab('company')} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs shadow transition-colors">
                    Setup Company profile
                  </button>
                </div>)}

              {/* Quick Actions Panel */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-l-4 border-indigo-600 pl-3 uppercase tracking-wider">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button onClick={() => { setActiveTab('post'); resetJobForm(); setIsEditingJob(false); }} className="p-4 border border-slate-100 hover:border-indigo-150 hover:bg-slate-50 rounded-xl text-left transition group">
                    <PlusCircle className="h-6 w-6 text-indigo-500 mb-2 group-hover:scale-105 transition"/>
                    <h4 className="text-xs font-bold text-slate-800">Post a New Job</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Publish listings and start accepting applications.</p>
                  </button>

                  <button onClick={() => setActiveTab('listings')} className="p-4 border border-slate-100 hover:border-indigo-150 hover:bg-slate-50 rounded-xl text-left transition group">
                    <Briefcase className="h-6 w-6 text-indigo-500 mb-2 group-hover:scale-105 transition"/>
                    <h4 className="text-xs font-bold text-slate-800">Review Open Positions</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Edit credentials, delete positions, and inspect candidates.</p>
                  </button>
                </div>
              </div>
            </div>)}

          {/* TAB 2: MANAGE CAREER LISTINGS */}
          {activeTab === 'listings' && (<div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-bold text-slate-900">Manage Career Listings</h1>
                <p className="text-slate-500 text-xs mt-1">Review applicant numbers, edit details, or remove postings</p>
              </div>

              {jobLoading ? (<div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (<div key={i} className="bg-white p-6 rounded-2xl animate-pulse h-28 border border-slate-100"/>))}
                </div>) : myJobs?.length === 0 ? (<div id="listings-empty" className="bg-white p-12 rounded-2xl border border-slate-150 text-center text-slate-500 shadow-sm">
                  <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3"/>
                  <h3 className="text-sm font-bold text-slate-800">No Jobs Posted Yet</h3>
                  <p className="text-xs text-slate-400 mt-1 mb-4">You have not published any career openings under your profile yet.</p>
                  <button onClick={() => setActiveTab('post')} className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition">
                    Post Your First Job Listing
                  </button>
                </div>) : (<div className="space-y-4">
                  {myJobs?.map((job) => (<div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-200 transition">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 uppercase">
                            {job.category}
                          </span>
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 uppercase">
                            {job.employmentType}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 hover:text-indigo-600">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                          <span className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-1"/> {job.location}</span>
                          <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1"/> Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 border-t md:border-none pt-4 md:pt-0 w-full md:w-auto justify-end">
                        <button id={`btn-view-applicants-${job.id}`} onClick={() => handleViewApplicants(job.id, job.title)} className="px-3 py-2 text-xs font-bold bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-lg hover:bg-indigo-100 transition inline-flex items-center space-x-1">
                          <Users className="h-3.5 w-3.5"/>
                          <span>Applicants</span>
                        </button>

                        <button id={`btn-edit-job-${job.id}`} onClick={() => handleEditJobClick(job)} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition" title="Edit">
                          <Edit className="h-4 w-4"/>
                        </button>

                        <button id={`btn-delete-job-${job.id}`} onClick={() => handleDeleteJobClick(job.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-250 rounded-lg transition" title="Delete">
                          <Trash2 className="h-4 w-4"/>
                        </button>
                      </div>
                    </div>))}
                </div>)}
            </div>)}

          {/* TAB 3: POST OR EDIT A JOB */}
          {activeTab === 'post' && (<div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    {isEditingJob ? 'Edit Career Listing' : 'Publish Career Opening'}
                  </h1>
                  <p className="text-slate-500 text-xs mt-1">Configure parameters, role outlines, and experience indices</p>
                </div>
                {isEditingJob && (<button onClick={() => { setIsEditingJob(false); setEditingJobId(null); resetJobForm(); setActiveTab('listings'); }} className="text-xs text-slate-500 font-semibold hover:text-indigo-600 inline-flex items-center">
                    <ArrowLeft className="h-3.5 w-3.5 mr-1"/> Cancel Edit
                  </button>)}
              </div>

              {!myCompany ? (<div className="p-12 text-center bg-slate-50 border border-dashed rounded-xl">
                  <Building className="h-10 w-10 text-slate-300 mx-auto mb-2 animate-bounce"/>
                  <h3 className="text-base font-bold text-slate-800">Company Profile Required</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                    Before posting job openings, you are required to define your organization under Company Branding settings.
                  </p>
                  <button onClick={() => setActiveTab('company')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition">
                    Setup Company Profile Now
                  </button>
                </div>) : (<form onSubmit={handleJobSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Job Title</label>
                      <input type="text" required placeholder="e.g. Senior Frontend Architect" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"/>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Job Category</label>
                        <button type="button" onClick={handleAddCategoryPrompt} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1" title="Add New Category">
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span>+ Custom</span>
                        </button>
                      </div>
                      {showAddCategoryInput ? (
                        <div className="flex gap-2 animate-fade-in">
                          <input type="text" placeholder="New category name..." value={newCategoryInput} onChange={(e) => setNewCategoryInput(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"/>
                          <button type="button" onClick={handleSaveNewCategory} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 rounded-xl text-xs font-semibold">
                            Add
                          </button>
                          <button type="button" onClick={() => setShowAddCategoryInput(false)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3.5 rounded-xl text-xs font-semibold">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <select value={jobCategory} onChange={(e) => setJobCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm">
                          {categories.map((c) => {
                            const count = myJobs ? myJobs.filter(j => j.category === c).length : 0;
                            return (<option key={c} value={c}>
                              {c} ({count} {count === 1 ? 'Professional' : 'Professionals'})
                            </option>);
                          })}
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Location</label>
                      <input type="text" required placeholder="e.g. San Francisco, CA" value={jobLocation} onChange={(e) => setJobLocation(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"/>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Employment Type</label>
                      <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm">
                        {jobTypes.map((t) => (<option key={t} value={t}>
                            {t}
                          </option>))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Salary Range</label>
                      <input type="text" required placeholder="e.g. $120k - $140k" value={jobSalary} onChange={(e) => setJobSalary(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"/>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Experience Target</label>
                      <input type="text" required placeholder="e.g. 3+ Years" value={jobExperience} onChange={(e) => setJobExperience(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Key Requirements (Comma Separated)</label>
                    <input type="text" required placeholder="React, CSS, Redux, Node.js" value={jobRequirements} onChange={(e) => setJobRequirements(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"/>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description Outline</label>
                    <textarea required rows={6} placeholder="Detail the duties, growth structures, and day-to-day work patterns..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-sans"/>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex justify-end">
                    <button type="submit" id="btn-job-submit" disabled={jobLoading} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl flex items-center space-x-1.5 transition shadow-md shadow-indigo-100 animate-fade-in">
                      <Save className="h-4 w-4"/>
                      <span>{isEditingJob ? 'Update Listing' : 'Publish Listing'}</span>
                    </button>
                  </div>
                </form>)}
            </div>)}

          {/* TAB 4: COMPANY BRANDING */}
          {activeTab === 'company' && (<div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h1 className="text-xl font-bold text-slate-900">Company Branding</h1>
                <p className="text-slate-500 text-xs mt-1">Configure your public organizational profile card</p>
              </div>

              <form onSubmit={handleCompanySubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-2">
                  <div className="h-16 w-16 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 relative group overflow-hidden shadow-inner">
                    {logoPreview || myCompany?.logo ? (<img src={logoPreview || myCompany.logo} alt="Logo" className="h-full w-full object-cover rounded-xl"/>) : (<Building className="h-6 w-6"/>)}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-xs font-bold text-slate-800">Company Logo Banner</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG or SVG formats accepted (Max 2MB)</p>
                    <label className="cursor-pointer inline-flex items-center space-x-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 mt-1.5">
                      <Upload className="h-3.5 w-3.5"/>
                      <span>Upload Logo</span>
                      <input type="file" accept="image/*" onChange={async (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0];
                    const { file: resized, previewUrl } = await resizeImage(file, 150, 150);
                    setCompanyLogo(resized);
                    setLogoPreview(previewUrl);
                }
            }} className="hidden"/>
                    </label>
                    {companyLogo && (<span className="text-[10px] text-emerald-600 ml-2 block font-semibold truncate">
                        📎 Selected: {companyLogo.name}
                      </span>)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Company Name</label>
                    <input type="text" required placeholder="e.g. Acme Corp" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"/>
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Corporate Website</label>
                    <input type="text" placeholder="e.g. acme.com" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"/>
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">HQ Location</label>
                    <input type="text" required placeholder="e.g. Austin, TX" value={companyLocation} onChange={(e) => setCompanyLocation(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"/>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">About the Organization</label>
                  <textarea required rows={5} placeholder="Describe your corporate mission, team size, core services, and values..." value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-sans"/>
                </div>

                <div className="border-t border-slate-100 pt-4 flex justify-end">
                  <button type="submit" id="btn-company-save" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center space-x-1.5 transition shadow-md shadow-indigo-100">
                    <Save className="h-4 w-4"/>
                    <span>Save Company Branding</span>
                  </button>
                </div>
              </form>
            </div>)}

          {/* TAB 5: APPLICANTS VIEW (ATS OVERVIEW) */}
          {activeTab === 'applicants' && (<div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <div>
                  <button onClick={() => setActiveTab('listings')} className="text-xs text-slate-500 hover:text-indigo-600 font-semibold inline-flex items-center mb-1 group">
                    <ArrowLeft className="h-3.5 w-3.5 mr-1 group-hover:-translate-x-0.5 transition"/> Back to Listings
                  </button>
                  <h1 className="text-2xl font-bold text-slate-900 truncate max-w-lg">
                    Applicants for "{selectedJobTitle}"
                  </h1>
                </div>
                <span className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-semibold">
                  {applicants.length} Total Applied
                </span>
              </div>

              {appLoading ? (<div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (<div key={i} className="bg-white p-6 rounded-2xl animate-pulse h-24 border border-slate-100"/>))}
                </div>) : applicants.length === 0 ? (<div id="applicants-empty" className="bg-white p-12 rounded-2xl border border-slate-150 text-center text-slate-500">
                  <UserMinus className="h-10 w-10 text-slate-300 mx-auto mb-3"/>
                  <h3 className="text-sm font-bold text-slate-800">No Applicants Yet</h3>
                  <p className="text-xs text-slate-400 mt-1">This job opening hasn't received any applications from candidates yet.</p>
                </div>) : (<div className="space-y-4">
                  {applicants.map((app) => {
                    const candidate = typeof app.candidate === 'object' ? app.candidate : null;
                    if (!candidate)
                        return null;
                    return (<div key={app.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-200 transition">
                        <div className="flex items-start space-x-4 flex-1">
                          <img src={candidate.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt={candidate.name} className="h-12 w-12 rounded-full object-cover border"/>
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div>
                              <h3 className="text-base font-bold text-slate-900">{candidate.name}</h3>
                              <p className="text-xs text-slate-400 font-medium">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-500">
                              <span className="flex items-center"><Mail className="h-3.5 w-3.5 mr-1"/> {candidate.email}</span>
                              {candidate.phone && <span className="flex items-center"><Phone className="h-3.5 w-3.5 mr-1"/> {candidate.phone}</span>}
                            </div>

                            {app.resume && (<div className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800 font-semibold bg-indigo-50/30 px-2.5 py-1 rounded border border-indigo-100/50">
                                <FileText className="h-3.5 w-3.5 mr-1.5 text-indigo-500"/>
                                <a href={app.resume} target="_blank" rel="noopener noreferrer" className="truncate max-w-xs sm:max-w-md">
                                  Review submitted resume file
                                </a>
                              </div>)}
                          </div>
                        </div>

                        {/* Decision controller panels */}
                        <div className="border-t sm:border-none pt-4 sm:pt-0 flex items-center justify-end space-x-2">
                          {app.status === 'pending' ? (<div className="flex space-x-2 w-full sm:w-auto">
                              <button id={`btn-reject-app-${app.id}`} onClick={() => handleStatusChange(app.id, 'rejected')} className="px-3.5 py-1.5 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 rounded-lg text-xs font-semibold text-slate-500 transition-all duration-150">
                                Reject
                              </button>
                              <button id={`btn-accept-app-${app.id}`} onClick={() => handleStatusChange(app.id, 'accepted')} className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all duration-150 shadow shadow-emerald-100">
                                Accept Applicant
                              </button>
                            </div>) : (<span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold uppercase border ${app.status === 'accepted'
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                              {app.status === 'accepted' ? (<CheckCircle className="h-3.5 w-3.5 mr-1"/>) : (<XCircle className="h-3.5 w-3.5 mr-1"/>)}
                              <span>{app.status === 'accepted' ? 'Accepted' : 'Rejected'}</span>
                            </span>)}
                        </div>
                      </div>);
                })}
                </div>)}
            </div>)}

          {/* TAB 7: EMPLOYER PERSONAL PROFILE */}
          {activeTab === 'profile' && (<div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h1 className="text-xl font-bold text-slate-900">Personal Profile</h1>
                <p className="text-slate-500 text-xs mt-1">Configure your personal representative details</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-2">
                  <div className="h-16 w-16 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 relative group overflow-hidden shadow-inner">
                    {user?.profileImage ? (<img src={user.profileImage} alt="Avatar" className="h-full w-full object-cover rounded-full"/>) : (<User className="h-6 w-6"/>)}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-xs font-bold text-slate-800">Employer Profile Photo</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG or SVG formats accepted (Max 2MB)</p>
                    <label className="cursor-pointer inline-flex items-center space-x-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 mt-1.5">
                      <Upload className="h-3.5 w-3.5"/>
                      <span>Upload Avatar</span>
                      <input type="file" accept="image/*" onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                    setEmployerAvatar(e.target.files[0]);
                }
            }} className="hidden"/>
                    </label>
                    {employerAvatar && (<span className="text-[10px] text-emerald-600 ml-2 block font-semibold truncate">
                        📎 Selected: {employerAvatar.name}
                      </span>)}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input type="text" required placeholder="e.g. Jane Doe" value={employerName} onChange={(e) => setEmployerName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"/>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Corporate Email Address (Read-only)</label>
                  <input type="email" disabled value={user?.email || ''} className="w-full bg-slate-100 border border-slate-200 p-3 rounded-xl text-slate-500 text-sm cursor-not-allowed font-medium"/>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contact Phone Number</label>
                  <input type="text" placeholder="e.g. +1 (512) 555-0199" value={employerPhone} onChange={(e) => setEmployerPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"/>
                </div>

                <div className="border-t border-slate-100 pt-4 flex justify-end">
                  <button type="submit" id="btn-employer-profile-save" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center space-x-1.5 transition shadow-md shadow-indigo-100 cursor-pointer">
                    <Save className="h-4 w-4"/>
                    <span>Save Personal Profile</span>
                  </button>
                </div>
              </form>
            </div>)}

          {/* TAB 6: ACCESS CREDENTIALS SECURITY */}
          {activeTab === 'security' && (<div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h1 className="text-xl font-bold text-slate-900">Security & Credentials</h1>
                <p className="text-slate-500 text-xs mt-1">Keep your corporate employer credentials safe</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Current Password</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 p-3 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20">
                    <Lock className="h-4.5 w-4.5 text-slate-400 mr-2"/>
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
                  <button type="submit" id="btn-security-employer-save" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 transition shadow-md">
                    <Lock className="h-4 w-4"/>
                    <span>Change Credentials</span>
                  </button>
                </div>
              </form>
            </div>)}
        </div>
      </div>
    </div>);
}
