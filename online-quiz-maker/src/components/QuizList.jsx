import { useEffect, useState } from 'react';
import { Search, Play, User, Calendar, Award, ClipboardCheck, Layers, AlertCircle } from 'lucide-react';
import { api } from '../api.js';
import styles from './QuizList.module.css';

export default function QuizList({ user, onNavigate }) {
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const quizList = await api.getQuizzes();
        setQuizzes(quizList);

        if (user) {
          const attemptList = await api.getMyAttempts();
          setAttempts(attemptList);
        }
      } catch (err) {
        console.error('Error loading quizzes/history:', err);
        setError('Failed to load data. Please refresh and try again.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  // Filter quizzes by search query
  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Group attempts by quizId to calculate latest score and cumulative accuracy
  const getGroupedAttempts = () => {
    const groupedMap = {};
    attempts.forEach(attempt => {
      if (!groupedMap[attempt.quizId]) {
        groupedMap[attempt.quizId] = {
          quizId: attempt.quizId,
          quizTitle: attempt.quizTitle,
          latestScore: attempt.score,
          totalQuestions: attempt.totalQuestions,
          latestCompletedAt: attempt.completedAt,
          attemptsCount: 0,
          sumScore: 0,
          sumQuestions: 0,
          latestAttempt: attempt
        };
      }
      const group = groupedMap[attempt.quizId];
      group.attemptsCount += 1;
      group.sumScore += attempt.score;
      group.sumQuestions += attempt.totalQuestions;
    });
    return Object.values(groupedMap);
  };

  const groupedAttempts = getGroupedAttempts();

  // Get current play attempt count for any quiz
  const getAttemptCount = (quizId) => {
    if (user) {
      return attempts.filter(a => a.quizId === quizId).length;
    } else {
      try {
        const guestAttempts = JSON.parse(localStorage.getItem('guest_quiz_attempts') || '[]');
        return guestAttempts.filter(a => a.quizId === quizId).length;
      } catch (e) {
        return 0;
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Loading available quizzes...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Title & Search Panel */}
      <div className={styles.sectionHeader}>
        <div>
          <h1 className={styles.heading}>Available Quizzes</h1>
          <p className={styles.subheading}>Pick a topic, test your knowledge, and track your progress!</p>
        </div>
        <div className={styles.searchContainer}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search quizzes by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {/* Quizzes Grid */}
      {filteredQuizzes.length > 0 ? (
        <div className={styles.grid}>
          {filteredQuizzes.map((quiz) => {
            const attemptCount = getAttemptCount(quiz.id);
            const isLimitReached = attemptCount >= 2;
            return (
              <div key={quiz.id} className={styles.card} id={`quiz-card-${quiz.id}`}>
                <h3 className={styles.cardTitle}>{quiz.title}</h3>
                <p className={styles.cardDesc}>{quiz.description}</p>
                
                <div className={styles.cardMeta}>
                  <div className={styles.creatorBadge}>
                    <User size={12} />
                    <span>By {quiz.creatorName || 'System'}</span>
                  </div>
                  <div className={styles.playsBadge}>
                    <Layers size={11} />
                    <span>{quiz.questionsCount || 0} Qs</span>
                  </div>
                  <div className={`${styles.playsBadge} ${
                    isLimitReached 
                      ? 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border border-orange-500/20 font-bold' 
                      : ''
                  }`}>
                    <span>Attempts: {isLimitReached ? 2 : attemptCount}/2</span>
                  </div>
                </div>

                <button 
                  className={`${styles.startBtn} ${isLimitReached ? styles.limitReachedBtn : ''}`}
                  onClick={() => !isLimitReached && onNavigate('take', quiz.id)}
                  id={`start-quiz-btn-${quiz.id}`}
                  disabled={isLimitReached}
                  data-tooltip={isLimitReached ? "Maximum attempt limit of 2 reached for this quiz" : "Start playing this quiz"}
                >
                  {isLimitReached ? (
                    <>
                      <AlertCircle size={14} className="text-red-600 dark:text-red-400" />
                      <span className="text-red-600 dark:text-red-400 font-bold">Limit Reached (2/2)</span>
                    </>
                  ) : (
                    <>
                      <Play size={12} className="fill-current" />
                      <span>Start Quiz</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Search size={40} className={styles.emptyIcon} />
          <h3 className={styles.emptyHeading}>No quizzes found</h3>
          <p className={styles.emptyText}>
            {searchQuery 
              ? `We couldn't find any quizzes matching "${searchQuery}". Try a different keyword.`
              : (user && user.role === 'admin'
                  ? 'There are currently no custom quizzes available. Be the first to create one!'
                  : 'There are currently no custom quizzes available. Please check back later!')}
          </p>
          {user && user.role === 'admin' && (
            <button 
              className={styles.emptyBtn}
              onClick={() => onNavigate('create')}
            >
              Create a Quiz
            </button>
          )}
        </div>
      )}

      {/* Play History (Personalized) */}
      {user && groupedAttempts.length > 0 && (
        <section className={styles.historySection}>
          <h2 className={styles.historyTitle}>
            <ClipboardCheck size={18} className="text-emerald-600" />
            Your Play History
          </h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Quiz Title</th>
                  <th className={styles.th}>Latest Score</th>
                  <th className={styles.th} style={{ textAlign: 'center' }}>Attempts</th>
                  <th className={styles.th}>Accuracy</th>
                  <th className={styles.th}>Completed At</th>
                  <th className={styles.th} style={{ textAlign: 'center' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {groupedAttempts.map((group) => {
                  const percent = Math.round((group.sumScore / group.sumQuestions) * 100);
                  const isGood = percent >= 70;
                  return (
                    <tr key={group.quizId}>
                      <td className={styles.td} style={{ fontWeight: 600 }}>{group.quizTitle}</td>
                      <td className={styles.td}>
                        {group.latestScore} / {group.totalQuestions}
                      </td>
                      <td className={styles.td} style={{ textAlign: 'center' }}>
                        <span className="bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1 rounded-full text-xs font-semibold inline-block">
                          {group.attemptsCount} {group.attemptsCount === 1 ? 'attempt' : 'attempts'}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <span className={isGood ? styles.scoreBadge : styles.scoreBadgeBad}>
                          {percent}%
                        </span>
                      </td>
                      <td className={styles.td}>{formatDate(group.latestCompletedAt)}</td>
                      <td className={styles.td} style={{ textAlign: 'center' }}>
                        <button 
                          className="text-xs text-indigo-600 hover:underline font-semibold border-none bg-none cursor-pointer"
                          onClick={() => onNavigate('results', group.quizId, group.latestAttempt)}
                        >
                          View Results
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
