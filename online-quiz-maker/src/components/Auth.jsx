import { useState, useEffect } from 'react';
import { LogIn, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../api.js';
import styles from './Auth.module.css';

export default function Auth({ onLogin, onNavigate }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Strictly clear input fields when the component mounts or switches between Login/Register
  useEffect(() => {
    setUsername('');
    setPassword('');
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!username.trim() || !password.trim()) {
      setError('Please fill out all fields.');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    try {
      setSubmitting(true);
      if (isLogin) {
        const data = await api.login(username, password);
        onLogin(data.user, data.token);
      } else {
        const data = await api.register(username, password);
        onLogin(data.user, data.token);
      }
    } catch (err) {
      console.error('Auth action failed:', err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title} id="auth-title">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className={styles.subtitle}>
          {isLogin 
            ? 'Sign in to save custom quizzes and track progress.' 
            : 'Join to create personal quizzes and test your knowledge.'}
        </p>

        {error && (
          <div className={styles.errorBox}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} id="auth-form" autoComplete="off">
          <div className={styles.inputGroup}>
            <label className={styles.label}>Username</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={20}
              required
              autoComplete="new-username"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                className={`${styles.input} ${styles.passwordInput}`}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={4}
                maxLength={30}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
                data-tooltip={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={submitting}
            id="auth-submit-btn"
          >
            {submitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : isLogin ? (
              <>
                <LogIn size={16} />
                <span>Sign In</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className={styles.toggleArea}>
          <span>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button 
            type="button" 
            className={styles.toggleBtn}
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setShowPassword(false);
            }}
          >
            {isLogin ? 'Register Now' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
