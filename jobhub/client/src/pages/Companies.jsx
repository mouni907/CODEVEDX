import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCompanies } from '../redux/slices/companySlice';
import { Building, MapPin, Globe, Search, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
export default function Companies() {
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const { companies, loading } = useSelector((state) => state.companies);
    useEffect(() => {
        dispatch(fetchCompanies());
    }, [dispatch]);
    const filteredCompanies = companies.filter((c) => c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return (<div id="page-companies" className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ecosystem Directory</h1>
            <p className="text-slate-500 text-sm mt-1">Explore verified employer partners recruiting on JobHub</p>
          </div>

          {/* Search bar */}
          <div className="flex items-center px-3.5 py-2.5 bg-white rounded-xl border border-slate-250 shadow-sm max-w-sm w-full gap-2">
            <Search className="h-5 w-5 text-slate-400 mr-1.5 flex-shrink-0"/>
            <input type="text" placeholder="Search companies by name or location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full focus:outline-none text-slate-850 text-sm placeholder-slate-400"/>
          </div>
        </div>

        {loading ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (<div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-14 w-14 bg-slate-200 rounded-xl"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-10 bg-slate-200 rounded w-full"></div>
              </div>))}
          </div>) : filteredCompanies.length === 0 ? (<div className="bg-white p-12 rounded-2xl border border-slate-150 text-center text-slate-500 shadow-sm">
            <Building className="h-12 w-12 text-slate-300 mx-auto mb-4 animate-bounce"/>
            <h3 className="text-base font-bold text-slate-800">No Companies Found</h3>
            <p className="text-xs text-slate-400 mt-1">Try resetting your search parameter or adding a new company profile.</p>
          </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company, index) => (<motion.div key={company.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-start space-x-4 mb-4">
                    <img src={company.logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=150'} alt={company.companyName} className="h-14 w-14 object-cover rounded-xl border border-slate-100 shadow-sm flex-shrink-0"/>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 hover:text-indigo-600">
                        {company.companyName}
                      </h3>
                      <p className="text-xs font-medium text-slate-400 flex items-center mt-0.5">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-slate-300"/>
                        {company.location}
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6">
                    {company.description}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                  {company.website && company.website.trim() ? (<a href={(() => {
                        const url = company.website.trim();
                        if (url.startsWith('http://') || url.startsWith('https://')) {
                            return url;
                        }
                        return `https://${url}`;
                    })()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition">
                      <Globe className="h-3.5 w-3.5 mr-1"/>
                      Visit Website
                      <ArrowUpRight className="h-3 w-3 ml-0.5"/>
                    </a>) : (<span className="text-xs text-slate-400 italic">No website listed</span>)}

                  <Link to={`/jobs?search=${encodeURIComponent(company.companyName)}`} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center">
                    <span>View Jobs</span>
                  </Link>
                </div>
              </motion.div>))}
          </div>)}
      </div>
    </div>);
}
