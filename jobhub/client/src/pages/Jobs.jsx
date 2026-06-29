import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchJobs } from '../redux/slices/jobSlice';
import { Search, MapPin, DollarSign, Calendar, Inbox } from 'lucide-react';
import { motion } from 'motion/react';
export default function Jobs() {
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useDispatch();
    const { jobs, loading } = useSelector((state) => state.jobs);
    // Filter States
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [location, setLocation] = useState(searchParams.get('location') || 'All');
    const [category, setCategory] = useState(searchParams.get('category') || 'All');
    const [employmentType, setEmploymentType] = useState(searchParams.get('employmentType') || 'All');
    // Load from Query Params on startup
    useEffect(() => {
        const filters = {
            search: searchParams.get('search') || '',
            location: searchParams.get('location') || 'All',
            category: searchParams.get('category') || 'All',
            employmentType: searchParams.get('employmentType') || 'All',
        };
        dispatch(fetchJobs(filters));
    }, [dispatch, searchParams]);
    // Handle trigger filter updates
    const handleApplyFilters = () => {
        const params = {};
        if (search)
            params.search = search;
        if (location !== 'All')
            params.location = location;
        if (category !== 'All')
            params.category = category;
        if (employmentType !== 'All')
            params.employmentType = employmentType;
        setSearchParams(params);
    };
    const handleResetFilters = () => {
        setSearch('');
        setLocation('All');
        setCategory('All');
        setEmploymentType('All');
        setSearchParams({});
    };
    // Dynamic list of categories including custom ones that have jobs
    const defaultCategories = ['Frontend Development', 'Backend Development', 'Design', 'Marketing', 'Product Management'];
    const loadedJobCategories = jobs ? jobs.map((j) => j.category).filter(Boolean) : [];
    const categories = ['All', ...new Set([...defaultCategories, ...loadedJobCategories])];
    const locations = ['All', 'Remote', 'San Francisco, CA', 'Mountain View, CA', 'New York, NY'];
    const types = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship'];
    return (<div id="page-jobs" className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Open Job Opportunities</h1>
            <p className="text-slate-500 text-sm mt-1">Discover, filter, and apply to premium career postings</p>
          </div>

          {/* Quick Header Search Bar */}
          <div className="flex bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm max-w-md w-full gap-2">
            <div className="flex items-center flex-1 px-2">
              <Search className="h-4.5 w-4.5 text-slate-400 mr-2 flex-shrink-0"/>
              <input type="text" placeholder="Title or keywords..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()} className="w-full focus:outline-none text-slate-800 text-sm"/>
            </div>
            <button id="jobs-btn-search" onClick={handleApplyFilters} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition">
              Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Filters</h3>
              <button id="jobs-btn-reset" onClick={handleResetFilters} className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">
                Clear All
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
              <select id="filter-category" value={category} onChange={(e) => {
            setCategory(e.target.value);
            const p = Object.fromEntries(searchParams.entries());
            if (e.target.value === 'All')
                delete p.category;
            else
                p.category = e.target.value;
            setSearchParams(p);
        }} className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                {categories.map((cat) => {
                  const count = cat === 'All' 
                    ? (jobs ? jobs.length : 0) 
                    : (jobs ? jobs.filter(j => j.category === cat).length : 0);
                  return (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? `All (${count} Professionals)` : `${cat} (${count} ${count === 1 ? 'Professional' : 'Professionals'})`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location</label>
              <select id="filter-location" value={location} onChange={(e) => {
            setLocation(e.target.value);
            const p = Object.fromEntries(searchParams.entries());
            if (e.target.value === 'All')
                delete p.location;
            else
                p.location = e.target.value;
            setSearchParams(p);
        }} className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                {locations.map((loc) => (<option key={loc} value={loc}>
                    {loc}
                  </option>))}
              </select>
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Employment Type</label>
              <select id="filter-type" value={employmentType} onChange={(e) => {
            setEmploymentType(e.target.value);
            const p = Object.fromEntries(searchParams.entries());
            if (e.target.value === 'All')
                delete p.employmentType;
            else
                p.employmentType = e.target.value;
            setSearchParams(p);
        }} className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                {types.map((type) => (<option key={type} value={type}>
                    {type}
                  </option>))}
              </select>
            </div>
          </div>

          {/* Job List Output */}
          <div className="lg:col-span-3 space-y-4">
            {loading ? (
        // Loading Skeleton State
        Array.from({ length: 4 }).map((_, idx) => (<div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse space-y-4">
                  <div className="flex justify-between">
                    <div className="space-y-2 w-1/2">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-slate-200 rounded w-20"></div>
                  </div>
                  <div className="h-10 bg-slate-200 rounded w-full"></div>
                  <div className="flex space-x-4 pt-2">
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                  </div>
                </div>))) : jobs.length === 0 ? (
        // Empty State
        <div id="jobs-empty-state" className="bg-white p-12 rounded-2xl border border-slate-150 text-center shadow-sm">
                <Inbox className="h-12 w-12 text-slate-300 mx-auto mb-4"/>
                <h3 className="text-lg font-bold text-slate-800">No Job Postings Found</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
                  We couldn't find any employment listings matching your exact combination of search terms and filters.
                </p>
                <button id="jobs-btn-reset-empty" onClick={handleResetFilters} className="mt-5 inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition">
                  Reset All Filters
                </button>
              </div>) : (
        // Real Job List output
        jobs.map((job) => (<motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-indigo-150 hover:shadow-md transition-all duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700">
                        {job.category}
                      </span>
                      <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700">
                        {job.employmentType}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 hover:text-indigo-600">
                        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                      </h3>
                      <p className="text-sm font-semibold text-slate-600 mt-0.5">{job.company}</p>
                    </div>

                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs text-slate-400 font-medium">
                      <span className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-slate-300"/>
                        {job.location}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="h-3.5 w-3.5 mr-0.5 text-slate-300"/>
                        {job.salary}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-slate-300"/>
                        <span>Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-stretch w-full md:w-auto gap-2 border-t md:border-none pt-4 md:pt-0">
                    <Link id={`job-btn-apply-${job.id}`} to={`/jobs/${job.id}`} className="flex-1 md:flex-none inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition">
                      View Details
                    </Link>
                  </div>
                </motion.div>)))}
          </div>
        </div>
      </div>
    </div>);
}
