import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './Landing';
import Home from './Home';
import QuizPage from './QuizPage';
import AddQuiz from './AddQuiz';
import AddQuestion from './AddQuestion';
import Leaderboard from './Leaderboard';
import Profile from './Profile';
import Friends from './Friends';
import QuizLeaderboard from './QuizLeaderboard';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/landing' element={<Landing />} />
        <Route path="/quiz/:id-l" element={<QuizPage />} />
        <Route path="/quiz/:id-u" element={<QuizPage />} />
        <Route path="/quiz/leaderboard/:id" element={<QuizLeaderboard />} />
        <Route path="/add-quiz" element={<AddQuiz />} />
        <Route path="/add-question" element={<AddQuestion />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path='/user/:name' element={<Profile />} />
        <Route path="/friends" element={<Friends />} />
      </Routes>
    </Router>
  );
};

export default App;