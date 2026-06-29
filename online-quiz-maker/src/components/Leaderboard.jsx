import { useEffect, useState } from 'react';
import { Trophy, Award, RefreshCw, Star, Users, Flame, AlertCircle } from 'lucide-react';
import { api } from '../api.js';
import styles from './Leaderboard.module.css';

export default function Leaderboard({ user }) {
  const [boardData, setBoardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBoard = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError(null);
      const data = await api.getGlobalLeaderboard();
      setBoardData(data);
    } catch (err) {
      console.error('Error fetching global leaderboard:', err);
      setError('Could not update the leaderboard rankings. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBoard(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Loading leaderboard rankings...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header section */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Global Leaderboard</h1>
          <p>Ranked by average score percentage across all played quizzes.</p>
        </div>
        <button 
          className={styles.refreshBtn}
          onClick={handleRefresh}
          disabled={refreshing}
          id="refresh-leaderboard-btn"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Leaderboard Card */}
      <div className={styles.card}>
        {boardData.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th} style={{ width: '10%' }}>Rank</th>
                <th className={styles.th} style={{ width: '45%' }}>Player</th>
                <th className={styles.th} style={{ width: '25%' }}>Average Score</th>
                <th className={styles.th} style={{ width: '20%' }}>Quizzes Played</th>
              </tr>
            </thead>
            <tbody>
              {boardData.map((row, index) => {
                const rank = index + 1;
                const isSelf = user && user.id === row.userId;
                
                // Rank styling
                let rankStyle = styles.rankDefault;
                let rankIcon = null;

                if (rank === 1) {
                  rankStyle = styles.rank1;
                  rankIcon = <Trophy size={14} className="text-amber-500 fill-amber-500" />;
                } else if (rank === 2) {
                  rankStyle = styles.rank2;
                  rankIcon = <Award size={14} className="text-slate-400 fill-slate-300" />;
                } else if (rank === 3) {
                  rankStyle = styles.rank3;
                  rankIcon = <Star size={14} className="text-orange-600 fill-orange-400" />;
                }

                // Score bar color selection
                let scoreColorClass = styles.fillLow;
                if (row.averageScore >= 80) {
                  scoreColorClass = styles.fillHigh;
                } else if (row.averageScore >= 50) {
                  scoreColorClass = styles.fillMedium;
                }

                return (
                  <tr 
                    key={row.userId} 
                    className={`${styles.tr} ${isSelf ? styles.currentUser : ''}`}
                    id={`leaderboard-row-${row.userId}`}
                  >
                    <td className={styles.td}>
                      <div className={styles.rankCell}>
                        <div className={`${styles.rankBadge} ${rankStyle}`}>
                          {rankIcon || rank}
                        </div>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.username}>
                        {row.username}
                      </span>
                      {isSelf && (
                        <span className={styles.currentUserIndicator}>
                          You
                        </span>
                      )}
                    </td>
                    <td className={styles.td}>
                      <div className={styles.scoreProgressContainer}>
                        <span className={styles.scoreBadge}>
                          {row.averageScore}%
                        </span>
                        <div className={styles.scoreTrack}>
                          <div 
                            className={`${styles.scoreFill} ${scoreColorClass}`}
                            style={{ width: `${row.averageScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.statsText}>
                        {row.quizzesPlayed} {row.quizzesPlayed === 1 ? 'quiz' : 'quizzes'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <Users size={40} className={styles.emptyIcon} />
            <h3 className={styles.emptyHeading}>No Rankings Yet</h3>
            <p className={styles.emptyText}>Be the first registered student to log in, complete a quiz, and start the scoreboard!</p>
          </div>
        )}
      </div>
    </div>
  );
}
