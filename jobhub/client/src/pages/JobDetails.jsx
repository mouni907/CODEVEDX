import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchJobDetails, resetJobDetails } from '../redux/slices/jobSlice';
import { submitApplication, fetchMyApplications, clearApplicationSuccess, clearApplicationError } from '../redux/slices/applicationSlice';
import { MapPin, Briefcase, DollarSign, Calendar, FileText, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
export default function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { jobDetails, loading: jobLoading } = useSelector((state) => state.jobs);
    const { user } = useSelector((state) => state.auth);
    const { applications, loading: appLoading, success: appSuccess, error: appError } = useSelector((state) => state.applications);
    // Application Modal & File States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [useDefaultResume, setUseDefaultResume] = useState(true);
    const [customResumeFile, setCustomResumeFile] = useState(null);
    const [alertMsg, setAlertMsg] = useState(null);
    useEffect(() => {
        if (id) {
            dispatch(fetchJobDetails(id));
            if (user && user.role === 'candidate') {
                dispatch(fetchMyApplications());
            }
        }
        return () => {
            dispatch(resetJobDetails());
        };
    }, [id, dispatch, user]);
    useEffect(() => {
        if (appSuccess) {
            setAlertMsg({ type: 'success', text: 'Application submitted successfully! Check your email for confirmation.' });
            setIsModalOpen(false);
            setCustomResumeFile(null);
            dispatch(clearApplicationSuccess());
            if (id) {
                dispatch(fetchMyApplications());
            }
        }
        if (appError) {
            setAlertMsg({ type: 'error', text: appError });
            dispatch(clearApplicationError());
        }
    }, [appSuccess, appError, dispatch, id]);
    if (jobLoading || !jobDetails) {
        return (<div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>);
    }
    // Check if candidate already applied to this job
    const alreadyApplied = user?.role === 'candidate' && applications.some((app) => {
        const jobObj = typeof app.job === 'object' ? app.job : null;
        const jobIdStr = jobObj ? jobObj.id : app.job;
        return jobIdStr === jobDetails.id;
    });
    const handleApplyClick = () => {
        if (!user) {
            navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
            return;
        }
        setIsModalOpen(true);
    };
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!id || !user)
            return;
        const formData = new FormData();
        formData.append('jobId', id);
        if (!useDefaultResume) {
            if (!customResumeFile) {
                alert('Please select a resume file to upload.');
                return;
            }
            formData.append('file', customResumeFile);
        }
        dispatch(submitApplication(formData));
    };
    return (<div id="page-job-details" className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back navigation */}
        <Link id="btn-back-jobs" to="/jobs" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 mb-6 group transition">
          <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-1 transition"/>
          Back to Listings
        </Link>

        {/* Status Alerts */}
        {alertMsg && (<div id="job-details-alert" className={`p-4 rounded-xl border flex items-center space-x-3 mb-6 shadow-sm ${alertMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
            {alertMsg.type === 'success' ? (<CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0"/>) : (<AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0"/>)}
            <p className="text-sm font-medium">{alertMsg.text}</p>
          </div>)}

        {/* Master details card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
          {/* Header section */}
          <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-indigo-50/20 via-white to-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700">
                    {jobDetails.category}
                  </span>
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700">
                    {jobDetails.employmentType}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {jobDetails.title}
                </h1>
                <p className="text-base font-semibold text-slate-600">{jobDetails.company}</p>
              </div>

              <div>
                {user?.role === 'employer' ? (<div className="text-xs bg-indigo-50 text-indigo-700 px-4 py-2 border border-indigo-150 rounded-xl font-bold">
                    Employer View
                  </div>) : alreadyApplied ? (<div className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold rounded-xl text-sm shadow-sm">
                    <CheckCircle2 className="h-4.5 w-4.5"/>
                    <span>Applied</span>
                  </div>) : (<button id="job-btn-apply-details" onClick={handleApplyClick} className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-indigo-100 inline-flex items-center justify-center space-x-1.5">
                    <Send className="h-4 w-4"/>
                    <span>Apply for Job</span>
                  </button>)}
              </div>
            </div>

            {/* Core Job Meta grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                  <MapPin className="h-5 w-5"/>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Location</div>
                  <div className="text-sm font-semibold text-slate-800">{jobDetails.location}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                  <DollarSign className="h-5 w-5"/>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Salary</div>
                  <div className="text-sm font-semibold text-slate-800">{jobDetails.salary}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                  <Briefcase className="h-5 w-5"/>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Experience</div>
                  <div className="text-sm font-semibold text-slate-800">{jobDetails.experience}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                  <Calendar className="h-5 w-5"/>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Posted</div>
                  <div className="text-sm font-semibold text-slate-800">
                    {new Date(jobDetails.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Body Section */}
          <div className="p-8 space-y-8">
            {/* Description block */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">Job Description</h2>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {jobDetails.description}
              </p>
            </div>

            {/* Requirements block */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 border-l-4 border-indigo-600 pl-3">Requirements</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-sm text-slate-600">
                {jobDetails.requirements.split(',').map((req, index) => (<li key={index} className="flex items-start space-x-2">
                    <span className="text-indigo-600 font-extrabold mt-0.5">•</span>
                    <span>{req.trim()}</span>
                  </li>))}
              </ul>
            </div>
          </div>
        </div>

        {/* Modal for Job Application */}
        <AnimatePresence>
          {isModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Overlay Backdrop */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"/>

              {/* Modal Box */}
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden relative z-10 p-6 space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">Apply for "{jobDetails.title}"</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">
                    Close
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Select default or custom resume */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Resume Attachment</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button type="button" id="btn-use-default-resume" onClick={() => setUseDefaultResume(true)} className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition ${useDefaultResume
                ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700'
                : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                        <span className="text-xs font-bold">Profile Resume</span>
                        <span className="text-[10px] text-slate-400 truncate w-full">
                          {user?.resume ? 'Default resume uploaded' : 'No resume on profile yet'}
                        </span>
                      </button>

                      <button type="button" id="btn-use-custom-resume" onClick={() => setUseDefaultResume(false)} className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition ${!useDefaultResume
                ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700'
                : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                        <span className="text-xs font-bold">Upload Custom File</span>
                        <span className="text-[10px] text-slate-400">PDF, Word Document</span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Resume file upload handler */}
                  {!useDefaultResume && (<div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 text-center">
                      <FileText className="h-8 w-8 text-slate-300 mx-auto mb-1"/>
                      <label className="block text-xs font-semibold text-slate-700 cursor-pointer hover:text-indigo-600">
                        <span>Click to choose file</span>
                        <input type="file" id="input-custom-resume" onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                        setCustomResumeFile(e.target.files[0]);
                    }
                }} accept=".pdf,.doc,.docx" className="hidden"/>
                      </label>
                      <p className="text-[10px] text-slate-400">PDF, DOC, or DOCX (Max 5MB)</p>
                      {customResumeFile && (<p className="text-xs font-semibold text-indigo-600 mt-2 truncate max-w-xs mx-auto">
                          📎 {customResumeFile.name}
                        </p>)}
                    </div>)}

                  {useDefaultResume && !user?.resume && (<p className="text-xs text-rose-600 font-medium">
                      ⚠️ Note: You don't have a default resume on your profile yet. Selecting this option will require you to upload a resume file during submission.
                    </p>)}

                  {/* Action buttons */}
                  <div className="flex space-x-3 pt-2">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold rounded-lg transition">
                      Cancel
                    </button>
                    <button type="submit" id="btn-submit-application-modal" disabled={appLoading} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition flex items-center justify-center space-x-1">
                      {appLoading ? (<>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                          <span>Sending...</span>
                        </>) : (<span>Submit Application</span>)}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>)}
        </AnimatePresence>
      </div>
    </div>);
}
