import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// ES Module support for __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const QUIZZES_FILE = path.join(DATA_DIR, 'quizzes.json');
const ATTEMPTS_FILE = path.join(DATA_DIR, 'attempts.json');

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const initJsonFile = (filePath, defaultData) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
  }
};

initJsonFile(USERS_FILE, [
  {
    id: "user_admin",
    username: "Admin",
    password: "Admin@123",
    role: "admin",
    createdAt: new Date().toISOString()
  }
]);
initJsonFile(QUIZZES_FILE, [
  {
    id: "quiz-1",
    title: "Web Development Essentials",
    description: "Test your knowledge on modern HTML, CSS, JavaScript, and general web technologies.",
    creatorId: "system",
    creatorName: "QuizMaker System",
    createdAt: new Date().toISOString(),
    playsCount: 24,
    questions: [
      {
        id: "q1",
        text: "Which HTML5 element is used to display self-contained illustrative content, such as diagrams or photos?",
        options: ["<aside>", "<figure>", "<section>", "<details>"],
        correctAnswerIndex: 1
      },
      {
        id: "q2",
        text: "What does CSS stand for?",
        options: ["Computer Style Sheets", "Creative Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"],
        correctAnswerIndex: 2
      },
      {
        id: "q3",
        text: "Which of the following is NOT a valid JavaScript primitive type?",
        options: ["string", "boolean", "array", "symbol"],
        correctAnswerIndex: 2
      },
      {
        id: "q4",
        text: "In React, what hook would you use to perform side effects in functional components?",
        options: ["useState", "useContext", "useEffect", "useReducer"],
        correctAnswerIndex: 2
      }
    ]
  },
  {
    id: "quiz-2",
    title: "General Science Trivia",
    description: "Explore the fascinating world of science! Covers biology, physics, and basic chemical elements.",
    creatorId: "system",
    creatorName: "QuizMaker System",
    createdAt: new Date().toISOString(),
    playsCount: 15,
    questions: [
      {
        id: "q1",
        text: "What is the powerhouse of the cell?",
        options: ["Nucleus", "Ribosome", "Mitochondria", "Endoplasmic Reticulum"],
        correctAnswerIndex: 2
      },
      {
        id: "q2",
        text: "Which planet in our solar system is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswerIndex: 1
      },
      {
        id: "q3",
        text: "What is the chemical symbol for Gold?",
        options: ["Gd", "Ag", "Fe", "Au"],
        correctAnswerIndex: 3
      }
    ]
  }
]);
initJsonFile(ATTEMPTS_FILE, []);

// Helper read/write functions
const readData = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// Ensure there is an admin user with username: "Admin" and password: "Admin@123"
const users = readData(USERS_FILE);
const adminUserIndex = users.findIndex(u => u.username.toLowerCase() === 'admin');
if (adminUserIndex === -1) {
  users.push({
    id: "user_admin",
    username: "Admin",
    password: "Admin@123",
    role: "admin",
    createdAt: new Date().toISOString()
  });
  writeData(USERS_FILE, users);
} else {
  // Enforce username "Admin" and password "Admin@123"
  users[adminUserIndex].username = "Admin";
  users[adminUserIndex].password = "Admin@123";
  users[adminUserIndex].role = "admin";
  writeData(USERS_FILE, users);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Simple Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // Token is just the user's ID for this clean development setup
  const userId = authHeader.replace('Bearer ', '');
  const users = readData(USERS_FILE);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(401).json({ error: 'Invalid session or token.' });
  }

  req.user = user;
  next();
};

// --- AUTH API ROUTES ---

// Register
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const normalizedUsername = username.trim().toLowerCase();
  if (normalizedUsername.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
  }

  const users = readData(USERS_FILE);
  const existingUser = users.find(u => u.username.toLowerCase() === normalizedUsername);

  if (existingUser) {
    return res.status(400).json({ error: 'Username is already taken.' });
  }

  const newUser = {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    username: username.trim(),
    role: username.trim().toLowerCase() === 'admin' ? 'admin' : 'user',
    createdAt: new Date().toISOString()
  };

  // Store password as-is for easy dev login (or simple hash if needed, but in-memory/JSON store plaintext is fine for demo)
  newUser.password = password;

  users.push(newUser);
  writeData(USERS_FILE, users);

  // Return user details without password
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({
    user: userWithoutPassword,
    token: newUser.id
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const users = readData(USERS_FILE);
  const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());

  if (!user || user.password !== password) {
    return res.status(400).json({ error: 'Invalid username or password.' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({
    user: userWithoutPassword,
    token: user.id
  });
});

// Get profile & stats
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const { password, ...userWithoutPassword } = req.user;
  
  // Fetch user attempts
  const attempts = readData(ATTEMPTS_FILE);
  const userAttempts = attempts.filter(a => a.userId === req.user.id);
  const uniqueQuizIds = new Set(userAttempts.map(a => a.quizId));

  res.json({
    user: userWithoutPassword,
    stats: {
      quizzesTaken: uniqueQuizIds.size,
      averageScore: userAttempts.length > 0 
        ? Math.round((userAttempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / userAttempts.length) * 100)
        : 0
    }
  });
});

// Change Password Route
app.post('/api/auth/change-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }

  if (newPassword.length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters long.' });
  }

  const users = readData(USERS_FILE);
  const user = users.find(u => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (user.password !== currentPassword) {
    return res.status(400).json({ error: 'Incorrect current password.' });
  }

  user.password = newPassword;
  writeData(USERS_FILE, users);

  res.json({ message: 'Password changed successfully.' });
});


// --- QUIZZES API ROUTES ---

// List available quizzes
app.get('/api/quizzes', (req, res) => {
  const quizzes = readData(QUIZZES_FILE);
  // Return summarized info (no need for correct answers when browsing)
  const summarizedQuizzes = quizzes.map(({ questions, ...q }) => ({
    ...q,
    questionsCount: questions.length
  }));
  res.json(summarizedQuizzes);
});

// Get single quiz with questions (omits correct answers for safety? Actually, to show correct answers during results, we can either grade on server or return full details. Let's return full details so taking can display answer choices and give immediate feedback).
app.get('/api/quizzes/:id', (req, res) => {
  const quizzes = readData(QUIZZES_FILE);
  const quiz = quizzes.find(q => q.id === req.params.id);

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found.' });
  }

  res.json(quiz);
});

// Create a new quiz
app.post('/api/quizzes', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Only Admins can manage quizzes.' });
  }

  const { title, description, questions } = req.body;

  if (!title || !description || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Quiz must have a title, description, and at least one question.' });
  }

  // Validate questions
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.text || !Array.isArray(q.options) || q.options.length < 2) {
      return res.status(400).json({ error: `Question ${i + 1} must have text and at least two options.` });
    }
    if (q.correctAnswerIndex === undefined || q.correctAnswerIndex < 0 || q.correctAnswerIndex >= q.options.length) {
      return res.status(400).json({ error: `Question ${i + 1} must specify a valid correct answer index.` });
    }
  }

  const quizzes = readData(QUIZZES_FILE);
  const newQuiz = {
    id: 'quiz_' + Math.random().toString(36).substr(2, 9),
    title: title.trim(),
    description: description.trim(),
    creatorId: req.user.id,
    creatorName: req.user.username,
    createdAt: new Date().toISOString(),
    playsCount: 0,
    questions: questions.map((q, idx) => ({
      id: 'q_' + idx + '_' + Math.random().toString(36).substr(2, 5),
      text: q.text.trim(),
      options: q.options.map(opt => opt.trim()),
      correctAnswerIndex: parseInt(q.correctAnswerIndex)
    }))
  };

  quizzes.push(newQuiz);
  writeData(QUIZZES_FILE, quizzes);

  res.status(201).json(newQuiz);
});

// Edit an existing quiz
app.put('/api/quizzes/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Only Admins can manage quizzes.' });
  }

  const { title, description, questions } = req.body;

  if (!title || !description || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Quiz must have a title, description, and at least one question.' });
  }

  // Validate questions
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.text || !Array.isArray(q.options) || q.options.length < 2) {
      return res.status(400).json({ error: `Question ${i + 1} must have text and at least two options.` });
    }
    if (q.correctAnswerIndex === undefined || q.correctAnswerIndex < 0 || q.correctAnswerIndex >= q.options.length) {
      return res.status(400).json({ error: `Question ${i + 1} must specify a valid correct answer index.` });
    }
  }

  const quizzes = readData(QUIZZES_FILE);
  const quizIndex = quizzes.findIndex(q => q.id === req.params.id);

  if (quizIndex === -1) {
    return res.status(404).json({ error: 'Quiz not found.' });
  }

  const existingQuiz = quizzes[quizIndex];
  const updatedQuiz = {
    ...existingQuiz,
    title: title.trim(),
    description: description.trim(),
    questions: questions.map((q, idx) => ({
      id: q.id || ('q_' + idx + '_' + Math.random().toString(36).substr(2, 5)),
      text: q.text.trim(),
      options: q.options.map(opt => opt.trim()),
      correctAnswerIndex: parseInt(q.correctAnswerIndex)
    }))
  };

  quizzes[quizIndex] = updatedQuiz;
  writeData(QUIZZES_FILE, quizzes);

  res.json(updatedQuiz);
});

// Delete a quiz
app.delete('/api/quizzes/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Only Admins can manage quizzes.' });
  }

  const quizzes = readData(QUIZZES_FILE);
  const quizIndex = quizzes.findIndex(q => q.id === req.params.id);

  if (quizIndex === -1) {
    return res.status(404).json({ error: 'Quiz not found.' });
  }

  quizzes.splice(quizIndex, 1);
  writeData(QUIZZES_FILE, quizzes);

  // Also clear attempts related to this quiz
  let attempts = readData(ATTEMPTS_FILE);
  attempts = attempts.filter(a => a.quizId !== req.params.id);
  writeData(ATTEMPTS_FILE, attempts);

  res.json({ message: 'Quiz deleted successfully.' });
});

// Submit a quiz attempt (Record a play)
app.post('/api/quizzes/:id/attempt', (req, res) => {
  const { answers, userId, username } = req.body;
  const quizzes = readData(QUIZZES_FILE);
  
  const quizIdx = quizzes.findIndex(q => q.id === req.params.id);
  if (quizIdx === -1) {
    return res.status(404).json({ error: 'Quiz not found.' });
  }

  const quiz = quizzes[quizIdx];

  // Enforce a maximum of 2 attempts per quiz
  const attempts = readData(ATTEMPTS_FILE);
  if (userId && userId !== 'anonymous') {
    const userQuizAttempts = attempts.filter(a => a.userId === userId && a.quizId === req.params.id);
    if (userQuizAttempts.length >= 2) {
      return res.status(400).json({ error: 'You have already reached the limit of 2 attempts for this quiz.' });
    }
  }
  
  // Increment play count
  quiz.playsCount = (quiz.playsCount || 0) + 1;
  writeData(QUIZZES_FILE, quizzes);

  // Grade quiz
  let score = 0;
  const results = quiz.questions.map((q, idx) => {
    const selectedAnswerIndex = answers[idx];
    const isCorrect = selectedAnswerIndex === q.correctAnswerIndex;
    if (isCorrect) score++;
    return {
      questionId: q.id,
      selectedAnswerIndex,
      correctAnswerIndex: q.correctAnswerIndex,
      isCorrect
    };
  });

  // Record attempt
  const newAttempt = {
    id: 'attempt_' + Math.random().toString(36).substr(2, 9),
    userId: userId || 'anonymous',
    username: username || 'Anonymous Guest',
    quizId: quiz.id,
    quizTitle: quiz.title,
    score,
    totalQuestions: quiz.questions.length,
    results,
    completedAt: new Date().toISOString()
  };

  attempts.push(newAttempt);
  writeData(ATTEMPTS_FILE, attempts);

  res.json({
    attemptId: newAttempt.id,
    score,
    totalQuestions: quiz.questions.length,
    results
  });
});

// Get user's attempts history
app.get('/api/attempts/me', authenticateToken, (req, res) => {
  const attempts = readData(ATTEMPTS_FILE);
  const userAttempts = attempts
    .filter(a => a.userId === req.user.id)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  res.json(userAttempts);
});

// Get quiz leaderboard/stats
app.get('/api/quizzes/:id/stats', (req, res) => {
  const attempts = readData(ATTEMPTS_FILE);
  const quizAttempts = attempts.filter(a => a.quizId === req.params.id);
  
  const totalPlays = quizAttempts.length;
  const averageScore = totalPlays > 0
    ? Math.round((quizAttempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / totalPlays) * 100)
    : 0;

  // High scores (leaderboard)
  const leaderboard = quizAttempts
    .sort((a, b) => {
      const pctA = a.score / a.totalQuestions;
      const pctB = b.score / b.totalQuestions;
      if (pctB !== pctA) return pctB - pctA;
      return new Date(a.completedAt) - new Date(b.completedAt); // faster completion (older timestamp first)
    })
    .slice(0, 5)
    .map(a => ({
      username: a.username,
      score: a.score,
      totalQuestions: a.totalQuestions,
      completedAt: a.completedAt
    }));

  res.json({
    totalPlays,
    averageScore,
    leaderboard
  });
});

// Get global leaderboard based on users' average score
app.get('/api/leaderboard', (req, res) => {
  const attempts = readData(ATTEMPTS_FILE);
  const users = readData(USERS_FILE);
  
  const userMap = {};
  users.forEach(u => {
    // Skip admin users if desired, or keep them. Let's exclude admin from leaderboard so it's only students/normal users.
    if (u.role !== 'admin') {
      userMap[u.id] = u.username;
    }
  });

  const userStats = {};
  attempts.forEach(a => {
    if (!a.userId || a.userId === 'anonymous') return;
    
    // Only count if user exists and is not admin
    const username = userMap[a.userId];
    if (!username) return;
    
    if (!userStats[a.userId]) {
      userStats[a.userId] = {
        userId: a.userId,
        username: username,
        totalQuizzesPlayed: 0,
        totalScorePercentageSum: 0
      };
    }
    
    const percentage = (a.score / a.totalQuestions) * 100;
    userStats[a.userId].totalQuizzesPlayed += 1;
    userStats[a.userId].totalScorePercentageSum += percentage;
  });

  const leaderboardList = Object.values(userStats).map(stats => {
    const averageScore = stats.totalQuizzesPlayed > 0 
      ? Math.round(stats.totalScorePercentageSum / stats.totalQuizzesPlayed)
      : 0;
    return {
      userId: stats.userId,
      username: stats.username,
      averageScore: averageScore,
      quizzesPlayed: stats.totalQuizzesPlayed
    };
  });

  // Sort by averageScore descending, then quizzesPlayed descending
  leaderboardList.sort((a, b) => {
    if (b.averageScore !== a.averageScore) {
      return b.averageScore - a.averageScore;
    }
    return b.quizzesPlayed - a.quizzesPlayed;
  });

  res.json(leaderboardList);
});

// --- VITE DEVELOPMENT MIDDLEWARE OR STATIC SERVING ---

if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
