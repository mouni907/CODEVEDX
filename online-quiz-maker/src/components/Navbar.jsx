import { BookOpen, PlusCircle, LogOut, User, LogIn, Award, Trophy, Sun, Moon } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar({ user, currentScreen, onNavigate, onLogout, theme, onToggleTheme }) {
  return (
    <header className={styles.navHeader}>
      <div className={styles.navContainer}>
        <div className={styles.brand} onClick={() => onNavigate('quizzes')} data-tooltip="QuizMaker Home">
          <Award className={styles.brandIcon} size={28} />
          <span className={styles.brandText}>
            Quiz<span className={styles.brandTextAccent}>Maker</span>
          </span>
        </div>

        <nav className={styles.navMenu}>
          <div className={styles.mainLinks}>
            {user && user.role === 'admin' && (
              <div 
                className={`${styles.navLink} ${currentScreen === 'admin' || currentScreen === 'create' ? styles.activeLink : ''}`}
                onClick={() => onNavigate('admin')}
                role="button"
                tabIndex={0}
                id="nav-admin-dashboard"
                data-tooltip="Admin Dashboard"
              >
                <PlusCircle size={16} />
                <span>Admin Dashboard</span>
              </div>
            )}

            {user && (
              <div 
                className={`${styles.navLink} ${currentScreen === 'quizzes' ? styles.activeLink : ''}`}
                onClick={() => onNavigate('quizzes')}
                role="button"
                tabIndex={0}
                id="nav-browse-quizzes"
                data-tooltip="Browse Quizzes"
              >
                <BookOpen size={16} />
                <span>Browse Quizzes</span>
              </div>
            )}

            {user && (
              <div 
                className={`${styles.navLink} ${currentScreen === 'leaderboard' ? styles.activeLink : ''}`}
                onClick={() => onNavigate('leaderboard')}
                role="button"
                tabIndex={0}
                id="nav-leaderboard"
                data-tooltip="Leaderboard"
              >
                <Trophy size={16} />
                <span>Leaderboard</span>
              </div>
            )}
          </div>

          <div className={styles.bottomActions}>
            <button 
              className={styles.themeToggleBtn}
              onClick={onToggleTheme}
              aria-label="Toggle Theme"
              id="theme-toggle-btn"
              data-tooltip={theme === 'dark' ? "Light Mode" : "Dark Mode"}
            >
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className={styles.userInfo}>
                <div className={styles.userBadge} data-tooltip={`User: ${user.username}`}>
                  <User size={14} className="text-teal-600" />
                  <span>{user.username}</span>
                </div>
                <button 
                  className={styles.logoutBtn}
                  onClick={onLogout}
                  data-tooltip="Logout"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button 
                className={styles.authBtn}
                onClick={() => onNavigate('auth')}
                data-tooltip="Sign In"
              >
                <span className="flex items-center gap-1">
                  <LogIn size={14} />
                  Sign In
                </span>
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
