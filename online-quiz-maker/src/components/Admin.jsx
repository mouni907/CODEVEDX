import { useEffect, useState } from 'react';
import { 
  PlusCircle, Edit, Trash2, HelpCircle, Layers, Play, AlertCircle, 
  CheckCircle, Database, KeyRound, Eye, EyeOff, Settings, BookOpen, Lock 
} from 'lucide-react';
import { api } from '../api.js';
import styles from './Admin.module.css';

export default function Admin({ user, onNavigate }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Tabs state
  const [activeTab, setActiveTab] = useState('quizzes'); // 'quizzes' or 'password'

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getQuizzes();
      setQuizzes(data);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Failed to load quizzes list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Basic protection (role checking)
    if (!user || user.role !== 'admin') {
      onNavigate('quizzes');
      return;
    }
    loadQuizzes();
  }, [user]);

  const handleDeleteClick = (quiz) => {
    setQuizToDelete(quiz);
  };

  const handleConfirmDelete = async () => {
    if (!quizToDelete) return;

    try {
      setDeleting(true);
      await api.deleteQuiz(quizToDelete.id);
      setSuccess(`Quiz "${quizToDelete.title}" deleted successfully.`);
      setQuizToDelete(null);
      // Reload quizzes list
      loadQuizzes();
      // Auto-hide success message after 4s
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError('Failed to delete quiz. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (quizId) => {
    onNavigate('create', quizId);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill out all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError('New password must be at least 4 characters long.');
      return;
    }

    try {
      setChangingPassword(true);
      await api.changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password change failed:', err);
      setPasswordError(err.message || 'Failed to change password. Please verify current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Loading quiz inventory...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Admin Panel Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Admin Control Panel</h1>
          <p>Welcome, {user.username}. Configure platform configurations and curate quizzes.</p>
        </div>
        <button 
          className={styles.createBtn}
          onClick={() => onNavigate('create')}
          id="admin-create-quiz-btn"
        >
          <PlusCircle size={16} />
          <span>Create New Quiz</span>
        </button>
      </div>

      {error && (
        <div className={styles.errorBox} id="admin-error-box">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className={styles.successBox} id="admin-success-box">
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-[var(--color-border)] mb-6">
        <button
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'quizzes'
              ? 'border-indigo-500 text-indigo-500 dark:text-indigo-400'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
          }`}
          onClick={() => {
            setActiveTab('quizzes');
            setError(null);
            setSuccess(null);
          }}
          id="admin-tab-quizzes"
        >
          <BookOpen size={16} />
          <span>Manage Quizzes & Quiz Making</span>
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'password'
              ? 'border-indigo-500 text-indigo-500 dark:text-indigo-400'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
          }`}
          onClick={() => {
            setActiveTab('password');
            setPasswordError(null);
            setPasswordSuccess(null);
          }}
          id="admin-tab-password"
        >
          <KeyRound size={16} />
          <span>Change Admin Password</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'quizzes' ? (
        <>
          {/* Quizzes Inventory Table */}
          {quizzes.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Quiz Details</th>
                    <th className={styles.th}>Questions</th>
                    <th className={styles.th} style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz) => (
                    <tr key={quiz.id} className={styles.tr} id={`admin-quiz-row-${quiz.id}`}>
                      <td className={styles.td}>
                        <div className={styles.quizInfo}>
                          <h4 className={styles.quizTitle}>{quiz.title}</h4>
                          <p className={styles.quizDesc}>{quiz.description}</p>
                        </div>
                      </td>
                      <td className={styles.td}>
                        <span className={`${styles.badge} ${styles.badgeIndigo}`}>
                          <Layers size={12} />
                          <span>{quiz.questionsCount || 0} Questions</span>
                        </span>
                      </td>
                      <td className={styles.td} style={{ textAlign: 'center' }}>
                        <div className={styles.actionsCell}>
                          <button
                            className={styles.editBtn}
                            onClick={() => handleEditClick(quiz.id)}
                            data-tooltip="Edit Quiz Structure"
                            id={`admin-edit-btn-${quiz.id}`}
                          >
                            <Edit size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteClick(quiz)}
                            data-tooltip="Delete Quiz from Platform"
                            id={`admin-delete-btn-${quiz.id}`}
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Database size={40} className={styles.emptyIcon} />
              <h3 className={styles.emptyHeading}>No Quizzes Published Yet</h3>
              <p className={styles.emptyText}>The system currently has no quizzes. Click the button below to start building your first one!</p>
              <button 
                className={styles.createBtn} 
                style={{ margin: '0 auto' }}
                onClick={() => onNavigate('create')}
                id="admin-empty-create-btn"
              >
                <PlusCircle size={16} />
                <span>Create First Quiz</span>
              </button>
            </div>
          )}
        </>
      ) : (
        /* Change Password Panel */
        <div className="max-w-md bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-main)]">Change Password</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Secure your Admin account with a new password.</p>
            </div>
          </div>

          {passwordError && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg p-3 text-sm font-medium mb-4">
              <AlertCircle size={16} className="shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg p-3 text-sm font-medium mb-4">
              <CheckCircle size={16} className="shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-indigo-500 text-[var(--color-text-main)] transition-colors pr-10"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-indigo-500 text-[var(--color-text-main)] transition-colors pr-10"
                  placeholder="Min 4 characters"
                  minLength={4}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-indigo-500 text-[var(--color-text-main)] transition-colors pr-10"
                  placeholder="Re-enter new password"
                  minLength={4}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="w-full py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-[var(--color-primary-btn-text)] font-semibold rounded-lg text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {changingPassword ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Lock size={14} />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Confirmation Dialog overlay */}
      {quizToDelete && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialog} id="delete-confirm-dialog">
            <h3 className={styles.dialogTitle}>Delete Quiz?</h3>
            <p className={styles.dialogDesc}>
              Are you sure you want to delete <strong>"{quizToDelete.title}"</strong>? 
              This action is permanent and will remove all student attempts and leaderboard records associated with this quiz.
            </p>
            <div className={styles.dialogActions}>
              <button 
                className={styles.cancelDialogBtn} 
                onClick={() => setQuizToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmDeleteBtn} 
                onClick={handleConfirmDelete}
                disabled={deleting}
                id="confirm-delete-btn"
              >
                {deleting ? 'Deleting...' : 'Delete Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
