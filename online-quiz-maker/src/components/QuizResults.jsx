import { useEffect, useState } from 'react';
import { RefreshCw, BookOpen, Check, X, Trophy, BarChart2, Calendar } from 'lucide-react';
import { api } from '../api.js';
import styles from './QuizResults.module.css';

export default function QuizResults({ user, quizId, attemptResult, onNavigate }) {
  const [quiz, setQuiz] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId || !attemptResult) {
      onNavigate('quizzes');
      return;
    }

    const loadDetails = async () => {
      try {
        const [quizData, statsData] = await Promise.all([
          api.getQuiz(quizId),
          api.getQuizStats(quizId)
        ]);
        setQuiz(quizData);
        setStats(statsData);
      } catch (err) {
        console.error('Failed to load quiz result details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [quizId, attemptResult]);

  if (!attemptResult) return null;

  const { score, totalQuestions, results } = attemptResult;
  const percent = Math.round((score / totalQuestions) * 100);

  // Determine feedback style based on accuracy
  let circleStyle = styles.scoreDanger;
  let feedbackText = 'Keep studying! Practice makes perfect.';
  let scoreHeadline = 'Nice Try!';

  if (percent >= 80) {
    circleStyle = styles.scoreSuccess;
    feedbackText = 'Exceptional job! You have fully mastered this topic.';
    scoreHeadline = 'Outstanding!';
  } else if (percent >= 50) {
    circleStyle = styles.scoreWarning;
    feedbackText = 'Good effort! A little more study and you will ace this.';
    scoreHeadline = 'Well Done!';
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={styles.container}>
      {/* High-Level Score Card */}
      <section className={styles.scoreCard}>
        <div className={`${styles.scoreCircle} ${circleStyle}`}>
          <span className={styles.scorePercent}>{percent}%</span>
          <span className={styles.scoreRatio}>{score} / {totalQuestions}</span>
        </div>
        <h1 className={styles.scoreTitle}>{scoreHeadline}</h1>
        <p className={styles.scoreDesc}>{feedbackText}</p>

        <div className={styles.actionsRow}>
          <button 
            className={styles.primaryBtn}
            onClick={() => onNavigate('take', quizId)}
            id="retake-quiz-btn"
          >
            <RefreshCw size={15} />
            <span>Retake Quiz</span>
          </button>
          <button 
            className={styles.secondaryBtn}
            onClick={() => onNavigate('quizzes')}
            id="browse-quizzes-btn"
          >
            <BookOpen size={15} />
            <span>Browse More Quizzes</span>
          </button>
        </div>
      </section>

      {/* Leaderboards and Stats Panel */}
      {stats && (
        <section className={styles.statsSection}>
          {/* General Stats Card */}
          <div className={styles.statsBox}>
            <h3 className={styles.statsTitle}>
              <BarChart2 size={16} className="text-indigo-600" />
              Quiz Metrics
            </h3>
            <div className="flex flex-col gap-4 py-2">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-sm font-medium text-slate-500">Total Plays</span>
                <span className="text-base font-bold text-slate-800">{stats.totalPlays}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500">Average Score</span>
                <span className="text-base font-bold text-indigo-600">{stats.averageScore}%</span>
              </div>
            </div>
          </div>

          {/* Top Leaderboard Card */}
          <div className={styles.statsBox}>
            <h3 className={styles.statsTitle}>
              <Trophy size={16} className="text-amber-500" />
              Top Scores (Leaderboard)
            </h3>
            {stats.leaderboard && stats.leaderboard.length > 0 ? (
              <div className="flex flex-col">
                {stats.leaderboard.map((row, idx) => (
                  <div key={idx} className={styles.leaderboardRow}>
                    <span className={styles.leaderboardRank}>#{idx + 1}</span>
                    <span className={styles.leaderboardUser}>{row.username}</span>
                    <span className={styles.leaderboardScore}>
                      {row.score}/{row.totalQuestions} ({Math.round((row.score/row.totalQuestions)*100)}%)
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4 font-medium">No other plays recorded yet.</p>
            )}
          </div>
        </section>
      )}

      {/* Detailed Question Review List */}
      {!loading && quiz && (
        <section className={styles.breakdownSection}>
          <h2 className={styles.breakdownTitle}>Question Breakdown & Review</h2>
          
          {quiz.questions.map((question, qIdx) => {
            const resultObj = results.find(r => r.questionId === question.id) || {};
            const { selectedAnswerIndex, correctAnswerIndex, isCorrect } = resultObj;

            return (
              <div key={question.id} className={styles.questionCard} id={`breakdown-card-${qIdx}`}>
                <div className={styles.questionHeader}>
                  <span className={styles.questionNum}>Question {qIdx + 1}</span>
                  {isCorrect ? (
                    <span className={styles.badgeCorrect}>
                      <Check size={12} strokeWidth={3} />
                      Correct
                    </span>
                  ) : (
                    <span className={styles.badgeIncorrect}>
                      <X size={12} strokeWidth={3} />
                      Incorrect
                    </span>
                  )}
                </div>

                <p className={styles.questionText}>{question.text}</p>
                <div className="h-4"></div>

                <div className={styles.optionsList}>
                  {question.options.map((option, oIdx) => {
                    const charCode = String.fromCharCode(65 + oIdx);
                    
                    let optionStyle = '';
                    const isSelected = selectedAnswerIndex === oIdx;
                    const isCorrectOption = correctAnswerIndex === oIdx;

                    if (isSelected) {
                      optionStyle = isCorrect ? styles.optionSelectedCorrect : styles.optionSelectedIncorrect;
                    } else if (isCorrectOption) {
                      optionStyle = styles.optionCorrectUnselected;
                    }

                    return (
                      <div 
                        key={oIdx} 
                        className={`${styles.optionItem} ${optionStyle}`}
                      >
                        <div className={styles.optionMarker}>{charCode}</div>
                        <span>{option}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
