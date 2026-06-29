import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Briefcase, Github, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();

    // Determine the role context for logged in or route-specific contexts
    const isEmployerPage = user 
        ? (user.role === 'employer') 
        : (location.pathname.includes('employer') || location.pathname.includes('companies'));

    const isLoggedOut = !user;

    // Dynamic Social URL generation based on the active role context
    const twitterUrl = isLoggedOut 
        ? "https://twitter.com/jobhub" 
        : (isEmployerPage ? "https://twitter.com/jobhub_employers" : "https://twitter.com/jobhub_candidates");
    const linkedinUrl = isLoggedOut 
        ? "https://linkedin.com/company/jobhub" 
        : (isEmployerPage ? "https://linkedin.com/company/jobhub-employers" : "https://linkedin.com/company/jobhub-candidates");
    const githubUrl = isLoggedOut 
        ? "https://github.com/jobhub" 
        : (isEmployerPage ? "https://github.com/jobhub-employers" : "https://github.com/jobhub-candidates");

    return (<footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link id="footer-logo" to="/" className="flex items-center space-x-2 text-2xl font-bold text-white tracking-tight">
              <Briefcase className="h-7 w-7 text-indigo-400"/>
              <span>
                Job<span className="text-emerald-400">Hub</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              {isLoggedOut
                ? "JobHub is a premier global matching ecosystem connecting top candidate talent with leading startup and enterprise organizations."
                : (isEmployerPage 
                    ? "JobHub for Employers provides the ultimate suite of tools to post jobs, track applications, build brand authority, and source premier global talent."
                    : "JobHub is a leading global career matching ecosystem connecting top candidate talent with high-growth startup and enterprise employers."
                  )
              }
            </p>
            <div className="flex space-x-4">
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-indigo-600 rounded-lg text-slate-400 hover:text-white transition-all duration-150">
                <Twitter className="h-4 w-4"/>
              </a>
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-indigo-600 rounded-lg text-slate-400 hover:text-white transition-all duration-150">
                <Linkedin className="h-4 w-4"/>
              </a>
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-indigo-600 rounded-lg text-slate-400 hover:text-white transition-all duration-150">
                <Github className="h-4 w-4"/>
              </a>
            </div>
          </div>

          {/* Dynamic Column 2 */}
          {isLoggedOut ? (
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Explore Careers</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/jobs" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Explore Openings
                  </Link>
                </li>
                <li>
                  <Link to="/companies" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Featured Companies
                  </Link>
                </li>
                <li>
                  <Link to="/register?role=employer" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Post a Career Listing
                  </Link>
                </li>
                <li>
                  <Link to="/register?role=candidate" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Join as a Professional
                  </Link>
                </li>
              </ul>
            </div>
          ) : isEmployerPage ? (
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Employer Operations</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/employer-dashboard?tab=post" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Post a Job Listing
                  </Link>
                </li>
                <li>
                  <Link to="/employer-dashboard?tab=jobs" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Manage Active Jobs
                  </Link>
                </li>
                <li>
                  <Link to="/employer-dashboard" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Applicant Tracking (ATS)
                  </Link>
                </li>
                <li>
                  <Link to="/employer-dashboard" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Search Candidates
                  </Link>
                </li>
              </ul>
            </div>
          ) : (
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">For Candidates</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/jobs" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Explore Openings
                  </Link>
                </li>
                <li>
                  <Link to="/candidate-dashboard" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Submit Resume
                  </Link>
                </li>
                <li>
                  <Link to="/candidate-dashboard?tab=applied" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Track Applications
                  </Link>
                </li>
                <li>
                  <Link to="/jobs?category=Frontend%20Development" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Frontend Positions
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Dynamic Column 3 */}
          {isLoggedOut ? (
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">JobHub Platform</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors duration-150">
                    About Our Platform
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Trust & Safety
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Resource Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>
          ) : isEmployerPage ? (
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Business Services</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/companies" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Employer Branding
                  </Link>
                </li>
                <li>
                  <Link to="/employer-dashboard?tab=company" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Company Profiles
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Talent Solutions
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Enterprise Hiring
                  </a>
                </li>
              </ul>
            </div>
          ) : (
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Career Growth</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/candidate-dashboard" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Resume Enhancement
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Interview Coaching
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Salary Estimator
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors duration-150">
                    Skill Assessments
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-slate-500 text-xs flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; {currentYear} JobHub Global Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>);
}
