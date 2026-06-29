import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckSquare, AlertCircle } from 'lucide-react';
import { api } from '../api.js';
import styles from './QuizTake.module.css';

export default function QuizTake({ user, quizId, onNavigate }) {
  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!quizId) {
      onNavigate('quizzes');
      return;
    }

    const checkAttemptsAndLoadQuiz = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check attempt count before loading quiz
        if (user) {
          const attemptList = await api.getMyAttempts();
          const existingCount = attemptList.filter(a => a.quizId === quizId).length;
          if (existingCount >= 2) {
            setError('You have already completed the maximum limit of 2 attempts for this quiz.');
            setLoading(false);
            return;
          }
        } else {
          // Check guest attempts
          const guestAttempts = JSON.parse(localStorage.getItem('guest_quiz_attempts') || '[]');
          const existingCount = guestAttempts.filter(a => a.quizId === quizId).length;
          if (existingCount >= 2) {
            setError('You have already completed the maximum limit of 2 attempts for this quiz. Please register or log in to track more quizzes.');
            setLoading(false);
            return;
          }
        }

        const data = await api.getQuiz(quizId);
        setQuiz(data);
        // Initialize blank answers array
        setAnswers(new Array(data.questions.length).fill(null));
      } catch (err) {
        console.error('Error fetching quiz details:', err);
        setError('Could not load quiz questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    checkAttemptsAndLoadQuiz();
  }, [quizId, user]);

  const handleSelectOption = (optionIndex) => {
    const updated = [...answers];
    updated[currentIdx] = optionIndex;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate that all questions are answered
    const unansweredIndex = answers.findIndex(ans => ans === null);
    if (unansweredIndex !== -1) {
      // Prompt user or scroll to first unanswered, let's show an alert or select it
      setCurrentIdx(unansweredIndex);
      setError(`Please select an answer for Question ${unansweredIndex + 1} before submitting.`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const payloadUserId = user ? user.id : 'anonymous';
      const payloadUsername = user ? user.username : 'Anonymous Guest';

      const results = await api.submitAttempt(
        quiz.id, 
        answers, 
        payloadUserId, 
        payloadUsername
      );

      // If user is guest, save the attempt locally to enforce the 2 attempt limit
      if (!user) {
        try {
          const guestAttempts = JSON.parse(localStorage.getItem('guest_quiz_attempts') || '[]');
          guestAttempts.push({
            id: 'attempt_' + Math.random().toString(36).substr(2, 9),
            quizId: quiz.id,
            completedAt: new Date().toISOString()
          });
          localStorage.setItem('guest_quiz_attempts', JSON.stringify(guestAttempts));
        } catch (e) {
          console.error('Error saving guest attempt locally:', e);
        }
      }

      // Navigate to results screen
      onNavigate('results', quiz.id, results);
    } catch (err) {
      console.error('Error submitting quiz attempt:', err);
      setError('Failed to submit your answers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-[var(--color-text-muted)]">Loading quiz questions...</p>
      </div>
    );
  }

  if (error && !quiz) {
    const isLimitError = error.includes('limit of 2 attempts');
    return (
      <div className={styles.container}>
        <div className={`p-8 border rounded-xl text-center max-w-md mx-auto ${
          isLimitError 
            ? 'bg-amber-50/90 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-200' 
            : 'bg-red-50/90 border-red-200 text-red-900 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-200'
        }`}>
          <AlertCircle className={`mx-auto mb-4 ${isLimitError ? 'text-amber-500' : 'text-red-500'}`} size={40} />
          <h3 className="font-bold text-xl mb-2">{isLimitError ? 'Attempt Limit Reached' : 'Error Loading Quiz'}</h3>
          <p className="text-sm mb-6 leading-relaxed">{error}</p>
          <button 
            className="px-5 py-2.5 bg-[var(--color-primary)] text-[var(--color-primary-btn-text)] rounded-lg font-semibold text-sm hover:bg-[var(--color-primary-hover)] shadow-md hover:shadow-lg transition cursor-pointer"
            onClick={() => onNavigate('quizzes')}
          >
            Return to Listing
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIdx];
  const totalQuestions = quiz.questions.length;
  const progressPercent = Math.round(((currentIdx + 1) / totalQuestions) * 100);
  const currentAnswer = answers[currentIdx];

  return (
    <div className={styles.container}>
      {/* Progress Indicator */}
      <div className={styles.progressContainer}>
        <div className={styles.progressHeader}>
          <span>{quiz.title}</span>
          <span>Question {currentIdx + 1} of {totalQuestions}</span>
        </div>
        <div className={styles.progressBarTrack}>
          <div 
            className={styles.progressBarFill} 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Active Question Display Card */}
      <div className={styles.card} id={`take-question-card-${currentIdx}`}>
        <h2 className={styles.questionText}>{currentQuestion.text}</h2>

        <div className={styles.optionsList}>
          {currentQuestion.options.map((option, idx) => {
            const charCode = String.fromCharCode(65 + idx); // A, B, C, D
            const isSelected = currentAnswer === idx;

            return (
              <button
                key={idx}
                type="button"
                className={`${styles.optionBtn} ${isSelected ? styles.optionBtnSelected : ''}`}
                onClick={() => {
                  setError(null);
                  handleSelectOption(idx);
                }}
                id={`option-btn-${currentIdx}-${idx}`}
              >
                <div className={styles.optionPrefix}>{charCode}</div>
                <div className={styles.optionText}>{option}</div>
              </button>
            );
          })}
        </div>

        {/* Step Navigation Bar */}
        <div className={styles.navRow}>
          <button
            type="button"
            className={`${styles.prevBtn} ${currentIdx === 0 ? styles.prevBtnDisabled : ''}`}
            onClick={handlePrev}
            disabled={currentIdx === 0}
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </button>

          {currentIdx < totalQuestions - 1 ? (
            <button
              type="button"
              className={styles.nextBtn}
              onClick={handleNext}
              disabled={currentAnswer === null}
              style={{ opacity: currentAnswer === null ? 0.6 : 1 }}
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={submitting}
              id="submit-quiz-btn"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckSquare size={16} />
                  <span>Submit Quiz</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
