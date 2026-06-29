import { Link } from 'react-router-dom';
import { HelpCircle, Home, Search } from 'lucide-react';
export default function NotFound() {
    return (<div id="page-not-found" className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-0 -left-10 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl"/>
      <div className="absolute bottom-0 -right-10 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl"/>

      <div className="max-w-md w-full text-center space-y-6 relative z-10 bg-white p-10 rounded-3xl border border-slate-100 shadow-xl">
        <div className="inline-flex p-4 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 mb-2">
          <HelpCircle className="h-12 w-12"/>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404 Error</h1>
          <h2 className="text-lg font-bold text-slate-700">Page Not Found</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            The link you followed may be broken, or the page has been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-4">
          <Link id="notfound-btn-home" to="/" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-100">
            <Home className="h-4.5 w-4.5"/>
            <span>Return to Homepage</span>
          </Link>

          <Link id="notfound-btn-jobs" to="/jobs" className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-sm transition flex items-center justify-center space-x-1.5">
            <Search className="h-4.5 w-4.5 text-slate-400"/>
            <span>Browse Job Openings</span>
          </Link>
        </div>
      </div>
    </div>);
}
