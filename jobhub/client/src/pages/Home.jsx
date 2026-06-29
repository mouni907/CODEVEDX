import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchJobs } from '../redux/slices/jobSlice';
import { fetchCompanies } from '../redux/slices/companySlice';
import { Search, MapPin, Briefcase, ChevronRight, TrendingUp, Sparkles, Compass, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
export default function Home() {
    const [searchTerm, setSearchTerm] = useState('');
    const [locationTerm, setLocationTerm] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { jobs } = useSelector((state) => state.jobs);
    const { companies } = useSelector((state) => state.companies);
    useEffect(() => {
        dispatch(fetchJobs({}));
        dispatch(fetchCompanies());
    }, [dispatch]);
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const query = new URLSearchParams();
        if (searchTerm)
            query.append('search', searchTerm);
        if (locationTerm)
            query.append('location', locationTerm);
        navigate(`/jobs?${query.toString()}`);
    };
    const handleCategoryClick = (category) => {
        navigate(`/jobs?category=${encodeURIComponent(category)}`);
    };
    // Predefined Popular Categories with stats
    const popularCategories = [
        { name: 'Frontend Development', count: jobs.filter(j => j.category === 'Frontend Development').length, icon: Sparkles, bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
        { name: 'Backend Development', count: jobs.filter(j => j.category === 'Backend Development').length, icon: Briefcase, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
        { name: 'Design', count: jobs.filter(j => j.category === 'Design').length, icon: TrendingUp, bg: 'bg-orange-50 text-orange-600 border-orange-100' },
        { name: 'Marketing', count: jobs.filter(j => j.category === 'Marketing').length, icon: Compass, bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    ];
    return (<div id="page-home" className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 py-20 lg:py-28 text-white overflow-hidden">
        {/* Abstract background grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"/>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5"/>
              <span>Next Generation Talent Network</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Find Your Dream Career <br />
              With <span className="text-emerald-400 font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">JobHub</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-lg text-indigo-200/95 font-medium leading-relaxed">
              Discover matching employment postings at top tech companies, design houses, and high-velocity startups. Build your portfolio and apply securely with 1-click.
            </motion.p>

            {/* Advanced Search Form */}
            <motion.form initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} onSubmit={handleSearchSubmit} id="home-search-form" className="bg-white p-2.5 sm:p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-stretch md:items-center gap-2.5 max-w-2xl mx-auto border border-slate-100">
              {/* Job Search Input */}
              <div className="flex-1 flex items-center px-3 border border-slate-100 md:border-none rounded-lg py-2 md:py-0">
                <Search className="h-5 w-5 text-slate-400 mr-2 flex-shrink-0"/>
                <input type="text" placeholder="Job title, keywords, or company..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full focus:outline-none text-slate-800 text-sm placeholder-slate-400"/>
              </div>

              {/* Location Input */}
              <div className="flex-1 flex items-center px-3 border-t md:border-t-0 md:border-l border-slate-100 py-2 md:py-0">
                <MapPin className="h-5 w-5 text-slate-400 mr-2 flex-shrink-0"/>
                <input type="text" placeholder="City, state, or 'Remote'..." value={locationTerm} onChange={(e) => setLocationTerm(e.target.value)} className="w-full focus:outline-none text-slate-800 text-sm placeholder-slate-400"/>
              </div>

              {/* Search Button */}
              <button type="submit" id="home-btn-search" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-150 flex-shrink-0 flex items-center justify-center space-x-1 shadow-md shadow-indigo-200">
                <span>Find Jobs</span>
                <ChevronRight className="h-4 w-4"/>
              </button>
            </motion.form>

            <div className="flex justify-center items-center space-x-6 text-xs text-indigo-300 font-medium pt-4">
              <span className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-400 mr-1"/> Verified Profiles</span>
              <span className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-400 mr-1"/> 1-Click Resume Upload</span>
              <span className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-400 mr-1"/> Instant Email Alerts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Explore Popular Categories</h2>
          <p className="text-slate-500 text-sm mt-2">Find your professional path within highly active recruiting markets</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (<motion.div key={cat.name} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: idx * 0.1 }} onClick={() => handleCategoryClick(cat.name)} className={`p-5 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md cursor-pointer transition-all duration-200 group flex flex-col justify-between`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-3 rounded-lg ${cat.bg}`}>
                    <Icon className="h-5 w-5"/>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{cat.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{cat.count} {cat.count === 1 ? 'Professional' : 'Professionals'}</p>
                  </div>
                </div>
                <div className="flex items-center text-xs text-indigo-600 font-semibold group-hover:translate-x-1.5 transition-transform">
                  <span>Browse Jobs</span>
                  <ChevronRight className="h-3.5 w-3.5 ml-0.5"/>
                </div>
              </motion.div>);
        })}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="flex justify-between items-end mb-10 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Featured Careers</h2>
            <p className="text-slate-500 text-sm mt-1">High-quality, verified listings updated in real-time</p>
          </div>
          <Link id="home-link-all-jobs" to="/jobs" className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 flex items-center space-x-0.5 mb-1 group">
            <span>See All Openings</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform"/>
          </Link>
        </div>

        {jobs.length === 0 ? (<div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-500">
            <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3 animate-pulse"/>
            Loading latest careers ...
          </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.slice(0, 4).map((job) => (<motion.div key={job.id} initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 mb-2">
                        {job.employmentType}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 hover:text-indigo-600">
                        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                      </h3>
                      <p className="text-sm font-medium text-slate-600 mt-0.5">{job.company}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-150">
                      {job.salary}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4">
                    {job.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {job.requirements.split(',').slice(0, 3).map((req, i) => (<span key={i} className="text-xs bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                        {req.trim()}
                      </span>))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                  <div className="flex items-center text-xs text-slate-400 space-x-1">
                    <MapPin className="h-3.5 w-3.5"/>
                    <span>{job.location}</span>
                  </div>
                  <Link to={`/jobs/${job.id}`} className="text-xs text-indigo-600 font-bold hover:text-indigo-700 flex items-center space-x-0.5">
                    <span>View Details</span>
                    <ChevronRight className="h-3.5 w-3.5"/>
                  </Link>
                </div>
              </motion.div>))}
          </div>)}
      </section>

      {/* Top Companies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Top Companies Hiring</h2>
          <p className="text-slate-500 text-sm mt-2">Work at the most respected startup ecosystems and innovative tech brands</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.slice(0, 3).map((company) => (<motion.div key={company.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-6 bg-white rounded-2xl border border-slate-100 text-center flex flex-col items-center hover:shadow-md transition-all duration-200">
              <img src={company.logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150'} alt={company.companyName} className="h-16 w-16 object-cover rounded-xl border border-slate-100 shadow-sm mb-4"/>
              <h3 className="text-base font-bold text-slate-900">{company.companyName}</h3>
              <p className="text-xs text-slate-400 flex items-center mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1"/>
                {company.location}
              </p>
              <p className="text-slate-500 text-sm mt-3 line-clamp-2 leading-relaxed">
                {company.description}
              </p>
              <Link to={`/companies`} className="mt-4 inline-flex items-center text-xs text-indigo-600 font-semibold hover:text-indigo-700">
                <span>Learn More</span>
                <ChevronRight className="h-3.5 w-3.5 ml-0.5"/>
              </Link>
            </motion.div>))}
        </div>
      </section>
    </div>);
}
