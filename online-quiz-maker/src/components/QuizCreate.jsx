import { useEffect, useState } from 'react';
import { Plus, Trash2, ArrowLeft, Save, AlertCircle, HelpCircle, FileText } from 'lucide-react';
import { api } from '../api.js';
import styles from './QuizCreate.module.css';

export default function QuizCreate({ user, onNavigate, quizId }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    { text: '', options: ['', '', '', ''], correctAnswerIndex: 0 }
  ]);
  const [loading, setLoading] = useState(!!quizId);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load existing quiz for edit if quizId is provided
  useEffect(() => {
    if (quizId) {
      const loadQuizDetails = async () => {
        try {
          setLoading(true);
          const data = await api.getQuiz(quizId);
          setTitle(data.title || '');
          setDescription(data.description || '');
          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions);
          }
        } catch (err) {
          console.error('Error fetching quiz details for edit:', err);
          setError('Could not load quiz structure. Please verify details.');
        } finally {
          setLoading(false);
        }
      };
      loadQuizDetails();
    }
  }, [quizId]);

  // Add a blank question
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { text: '', options: ['', '', '', ''], correctAnswerIndex: 0 }
    ]);
  };

  // Remove a question
  const handleRemoveQuestion = (index) => {
    if (questions.length === 1) {
      setError('A quiz must have at least one question.');
      return;
    }
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  // Update question text
  const handleQuestionTextChange = (index, value) => {
    const updated = [...questions];
    updated[index].text = value;
    setQuestions(updated);
  };

  // Update option text
  const handleOptionTextChange = (questionIndex, optionIndex, value) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  // Set correct option index
  const handleCorrectOptionChange = (questionIndex, optionIndex) => {
    const updated = [...questions];
    updated[questionIndex].correctAnswerIndex = optionIndex;
    setQuestions(updated);
  };

  // Form submission and validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError('Please provide a quiz title.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a quiz description.');
      return;
    }

    for (let qIdx = 0; qIdx < questions.length; qIdx++) {
      const q = questions[qIdx];
      if (!q.text.trim()) {
        setError(`Please fill out the question text for Question ${qIdx + 1}.`);
        return;
      }
      for (let oIdx = 0; oIdx < q.options.length; oIdx++) {
        if (!q.options[oIdx].trim()) {
          setError(`Please fill out Option ${String.fromCharCode(65 + oIdx)} for Question ${qIdx + 1}.`);
          return;
        }
      }
    }

    try {
      setSaving(true);
      const quizData = {
        title: title.trim(),
        description: description.trim(),
        questions: questions.map(q => ({
          id: q.id, // preserve existing question ID if editing
          text: q.text.trim(),
          options: q.options.map(o => o.trim()),
          correctAnswerIndex: q.correctAnswerIndex
        }))
      };

      if (quizId) {
        await api.updateQuiz(quizId, quizData);
      } else {
        await api.createQuiz(quizData);
      }
      onNavigate('admin'); // Navigate back to Admin Dashboard
    } catch (err) {
      console.error('Failed to save quiz:', err);
      setError(err.message || 'Failed to save quiz. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Retrieving quiz data...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header Area */}
      <div className={styles.headingArea}>
        <button 
          className="flex items-center gap-1 text-sm text-indigo-600 hover:underline border-none bg-transparent cursor-pointer font-semibold mb-4"
          onClick={() => onNavigate('admin')}
          id="quiz-create-back-btn"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
        <h1 className={styles.title} id="quiz-builder-title">
          {quizId ? 'Edit Quiz Structure' : 'Create a New Quiz'}
        </h1>
        <p className={styles.subtitle}>
          {quizId ? 'Modify questions, correct answers, and details.' : 'Design a custom quiz with engaging multiple-choice questions.'}
        </p>
      </div>

      {error && (
        <div className={styles.errorBox}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} id="create-quiz-form">
        {/* Basic Info Section */}
        <div className={styles.formCard}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <FileText size={16} className="text-slate-500" />
              Quiz Title
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g., Introduction to Javascript"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <HelpCircle size={16} className="text-slate-500" />
              Quiz Description
            </label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              placeholder="Provide a brief description of what this quiz covers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              required
            />
          </div>
        </div>

        {/* Questions Header */}
        <div className={styles.divider}>
          <h3 className={styles.dividerText}>Quiz Questions</h3>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded">
            {questions.length} Question{questions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Dynamic Questions Builder */}
        {questions.map((question, qIdx) => (
          <div key={qIdx} className={styles.questionCard} id={`question-builder-${qIdx}`}>
            <div className={styles.questionHeader}>
              <span className={styles.questionNum}>Question {qIdx + 1}</span>
              {questions.length > 1 && (
                <button 
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => handleRemoveQuestion(qIdx)}
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Question Text</label>
              <input
                type="text"
                className={styles.input}
                placeholder="What question would you like to ask?"
                value={question.text}
                onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                maxLength={200}
                required
              />
            </div>

            {/* Answer Choices Grid */}
            <div className={styles.optionsGrid}>
              {question.options.map((option, oIdx) => {
                const isCorrect = question.correctAnswerIndex === oIdx;
                const charCode = String.fromCharCode(65 + oIdx); // A, B, C, D
                
                return (
                  <div 
                    key={oIdx} 
                    className={`${styles.optionItem} ${isCorrect ? styles.optionItemCorrect : ''}`}
                  >
                    <div className={styles.optionItemHeader}>
                      <span className={styles.optionLabel}>Option {charCode}</span>
                      <label 
                        className={`${styles.correctRadioLabel} ${isCorrect ? styles.correctRadioLabelActive : ''}`}
                      >
                        <input
                          type="radio"
                          name={`correct-answer-${qIdx}`}
                          className={styles.radioInput}
                          checked={isCorrect}
                          onChange={() => handleCorrectOptionChange(qIdx, oIdx)}
                        />
                        <span>Correct</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      className={styles.input}
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                      placeholder={`Enter option value...`}
                      value={option}
                      onChange={(e) => handleOptionTextChange(qIdx, oIdx, e.target.value)}
                      required
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Add Question Button */}
        <button 
          type="button"
          className={styles.addQuestionBtn}
          onClick={handleAddQuestion}
        >
          <Plus size={16} />
          <span>Add Another Question</span>
        </button>

        {/* Action Controls */}
        <div className={styles.submitSection}>
          <button 
            type="button" 
            className={styles.cancelBtn}
            onClick={() => onNavigate('admin')}
            disabled={saving}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={saving}
            id="save-quiz-btn"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Saving Quiz...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>{quizId ? 'Save Changes' : 'Publish Quiz'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
