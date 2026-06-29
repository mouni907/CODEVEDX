import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, PlusCircle, ClipboardCheck, BarChart3, Star, User } from 'lucide-react';
import { api } from '../api.js';
import styles from './Home.module.css';

export default function Home({ user, onNavigate }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) {
      api.getProfile()
        .then(data => {
          setStats(data.stats);
        })
        .catch(err => {
          console.error('Failed to load profile stats:', err);
        });
    }
  }, [user]);

  return (
    <div className="flex flex-col">
      {/* Hero Welcome Message */}
      <section className={styles.heroContainer}>
        <h1 className={styles.title}>
          Create, Share, and Master <span className={styles.highlight}>Interactive Quizzes</span>
        </h1>
        <p className={styles.subtitle}>
          The easiest way to test knowledge, challenge your friends, and track your learning progress with immediate feedback.
        </p>

        {/* Options to Create or Take */}
        <div className={styles.actionsGrid}>
          {/* Card 1: Take Quizzes */}
          <div 
            className={styles.actionCard}
            onClick={() => onNavigate('quizzes')}
            role="button"
            tabIndex={0}
          >
            <div className={styles.cardIconContainer}>
              <BookOpen size={24} />
            </div>
            <h3 className={styles.cardTitle}>Take a Quiz</h3>
            <p className={styles.cardDesc}>
              Browse dozens of high-quality quizzes across topics like science, development, and history. Instant grading.
            </p>
            <button className={styles.cardBtn}>
              <span>Browse Quizzes</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 2: Create Quizzes */}
          <div 
            className={styles.actionCard}
            onClick={() => onNavigate('create')}
            role="button"
            tabIndex={0}
          >
            <div className={styles.cardIconContainer} style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
              <PlusCircle size={24} />
            </div>
            <h3 className={styles.cardTitle}>Create a Quiz</h3>
            <p className={styles.cardDesc}>
              Build your own custom quiz with unlimited multiple-choice questions, custom options, and correct answers.
            </p>
            <button className={styles.cardBtn}>
              <span>Design Quiz</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Stats Dashboard section */}
      <section className={styles.statsSection}>
        <h2 className={styles.statsTitle}>
          <BarChart3 size={18} className="text-[var(--color-primary)]" />
          {user ? `Your Learning Dashboard` : `QuizMaker Activity Stats`}
        </h2>

        {user ? (
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <ClipboardCheck size={20} className={styles.statIcon} />
              <div>
                <div className={styles.statValue}>{stats ? stats.quizzesTaken : '0'}</div>
                <div className={styles.statLabel}>Quizzes Taken</div>
              </div>
            </div>

            <div className={styles.statItem}>
              <Star size={20} className={styles.statIcon} style={{ color: 'var(--color-accent)', backgroundColor: 'var(--color-accent-light)' }} />
              <div>
                <div className={styles.statValue}>{stats ? `${stats.averageScore}%` : '0%'}</div>
                <div className={styles.statLabel}>Average Accuracy</div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <BookOpen size={20} className={styles.statIcon} />
              <div>
                <div className={styles.statValue}>100+</div>
                <div className={styles.statLabel}>Active Quizzes</div>
              </div>
            </div>

            <div className={styles.statItem}>
              <User size={20} className={styles.statIcon} style={{ color: 'var(--color-success)', backgroundColor: 'var(--color-success-bg)' }} />
              <div>
                <div className={styles.statValue}>Join Free</div>
                <div className={styles.statLabel} onClick={() => onNavigate('auth')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                  Create Account to Track Stats
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
