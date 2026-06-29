import { useState, useEffect, useRef } from 'react';
import { api } from './api.js';
import styles from './App.module.css';

// Import views
import Navbar from './components/Navbar.jsx';
import Home from './components/Home.jsx';
import QuizList from './components/QuizList.jsx';
import QuizCreate from './components/QuizCreate.jsx';
import QuizTake from './components/QuizTake.jsx';
import QuizResults from './components/QuizResults.jsx';
import Auth from './components/Auth.jsx';
import Admin from './components/Admin.jsx';
import Leaderboard from './components/Leaderboard.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('auth'); // Default to auth for logged out state
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [lastAttemptResult, setLastAttemptResult] = useState(null);

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('quiz_theme') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  // Keep HTML and Body attributes synchronized with theme state
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    try {
      localStorage.setItem('quiz_theme', theme);
    } catch (e) {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('quiz_token');
    const savedUser = localStorage.getItem('quiz_user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        if (parsedUser.role === 'admin') {
          setCurrentScreen('admin');
        } else {
          setCurrentScreen('quizzes');
        }
        
        // Verify token & fetch fresh profile/stats in background
        api.getProfile()
          .then(data => {
            setUser(data.user);
            localStorage.setItem('quiz_user', JSON.stringify(data.user));
            if (data.user.role === 'admin') {
              setCurrentScreen('admin');
            } else {
              setCurrentScreen('quizzes');
            }
          })
          .catch(() => {
            // If token invalid, clear
            handleLogout();
          });
      } catch (e) {
        handleLogout();
      }
    } else {
      setCurrentScreen('auth');
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('quiz_token', token);
    localStorage.setItem('quiz_user', JSON.stringify(userData));
    setUser(userData);
    if (userData.role === 'admin') {
      setCurrentScreen('admin');
    } else {
      setCurrentScreen('quizzes');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('quiz_token');
    localStorage.removeItem('quiz_user');
    setUser(null);
    setCurrentScreen('auth');
  };

  const navigateTo = (screen, quizId = null, attemptResult = null) => {
    setActiveQuizId(quizId);
    if (attemptResult) setLastAttemptResult(attemptResult);
    
    // Auth redirection check
    if (!user) {
      setCurrentScreen('auth');
      return;
    }

    if ((screen === 'create' || screen === 'admin') && user.role !== 'admin') {
      setCurrentScreen('quizzes');
      return;
    }

    setCurrentScreen(screen);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--color-bg-main)] text-[var(--color-text-main)]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
          <p className="font-sans text-sm text-[var(--color-text-muted)] font-medium">Initializing platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.appContainer} id="app-root">
      <Navbar 
        user={user} 
        currentScreen={currentScreen} 
        onNavigate={navigateTo} 
        onLogout={handleLogout} 
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      
      <main className={styles.mainContent}>
        <div className={styles.fadeEnter} key={currentScreen}>
          {!user ? (
            <Auth 
              onLogin={handleLogin} 
              onNavigate={navigateTo} 
            />
          ) : (
            <>
              {currentScreen === 'home' && (
                <Home 
                  user={user} 
                  onNavigate={navigateTo} 
                />
              )}
              
              {currentScreen === 'quizzes' && (
                <QuizList 
                  user={user}
                  onNavigate={navigateTo} 
                />
              )}
              
              {currentScreen === 'admin' && (
                <Admin 
                  user={user} 
                  onNavigate={navigateTo} 
                />
              )}
              
              {currentScreen === 'create' && (
                <QuizCreate 
                  user={user} 
                  quizId={activeQuizId}
                  onNavigate={navigateTo} 
                />
              )}
              
              {currentScreen === 'take' && (
                <QuizTake 
                  user={user} 
                  quizId={activeQuizId} 
                  onNavigate={navigateTo} 
                />
              )}
              
              {currentScreen === 'results' && (
                <QuizResults 
                  user={user} 
                  quizId={activeQuizId} 
                  attemptResult={lastAttemptResult} 
                  onNavigate={navigateTo} 
                />
              )}

              {currentScreen === 'leaderboard' && (
                <Leaderboard 
                  user={user} 
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
