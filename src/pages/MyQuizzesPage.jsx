import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { BookCheck, Clock, TrendingUp, Target, Trophy } from "lucide-react";
import { collection, getDocs, query, where, orderBy, average } from 'firebase/firestore';
import { db } from '../Firebase';
import { useAuth } from '../context/AuthContext';

// Helper component for stat cards
function StatCard({ icon, title, value, color }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between transition-transform duration-300 hover:-translate-y-1">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      {React.cloneElement(icon, { className: `w-8 h-8 ${color}` })}
    </div>
  );
}

// Helper function to get subject tag colors ---
const getSubjectTagColors = (subject) => {
  switch (subject.toLowerCase()) {
    case 'history': return { bg: 'bg-red-100', text: 'text-red-700' };
    case 'electronic science': return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'geography': return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'legal studies': return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
    case 'political science': return { bg: 'bg-purple-100', text: 'text-purple-700' };
    case 'economics': return { bg: 'bg-indigo-100', text: 'text-indigo-700' }; // Added for your existing quizzes
    default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
};

// Helper function to get difficulty tag colors ---
const getDifficultyTagColors = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'medium': return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
    case 'hard': return { bg: 'bg-red-100', text: 'text-red-700' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
};
// Helper function to clean up messy quiz titles ---
function formatQuizTitle(title) {
  let cleanedTitle = title.replace(/M[\s-]?\d+\s?_?/i, '');
  cleanedTitle = cleanedTitle.replace(/practicequestions/i, '');
  cleanedTitle = cleanedTitle.replace(/_/g, ' ');
  return cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1).trim();
}

function MyQuizzesPage() {
  const { currentUser } = useAuth();
  const [allQuizzes, setAllQuizzes] = useState([]); 
  const [filteredQuizzes, setFilteredQuizzes] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [stats, setStats] = useState({ completed: 0, bestScore: 0, averageScore: 0 });
  
  const [completionStatus, setCompletionStatus] = useState('All');
  const [completedQuizIds, setCompletedQuizIds] = useState(null); 

  // Effect to fetch all data once on initial load
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const quizzesQuery = query(collection(db, "quizzes"), orderBy("title"));
        const quizzesSnapshot = await getDocs(quizzesQuery);
        const quizzesData = quizzesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setAllQuizzes(quizzesData); // Store the master list
        
        const uniqueSubjects = ['All', ...new Set(quizzesData.map(q => q.subject))];
        setSubjects(uniqueSubjects);

        if (currentUser) {
          const resultsQuery = query(collection(db, "quizResults"), where("userId", "==", currentUser.uid));
          const resultsSnapshot = await getDocs(resultsQuery);
          const resultsData = resultsSnapshot.docs.map(doc => doc.data());
          
          const completedIds = new Set(resultsData.map(result => result.quizId));
          setCompletedQuizIds(completedIds); 

          if (resultsData.length > 0) {
            const uniqueCompletedCount = new Set(resultsData.map(r => r.quizId)).size;
            const bestScore = Math.max(0, ...resultsData.map(r => r.percentage));
            
            const totalPercentage = resultsData.reduce((sum, result) => sum + result.percentage, 0);
            const averageScore = Math.round(totalPercentage / resultsData.length);
            
            setStats({
              completed: uniqueCompletedCount,
              bestScore: bestScore,
              averageScore: averageScore,
            });
          } else {
            setCompletedQuizIds(new Set());
          }
        }
      } catch (error) {
        console.error("Error fetching initial data: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [currentUser]);

  // Effect to handle filtering when selections change
  useEffect(() => {
    if (loading) return;
    let tempQuizzes = [...allQuizzes];

    if (selectedSubject !== 'All') {
            tempQuizzes = tempQuizzes.filter(q => q.subject === selectedSubject);
            const uniqueTopics = ['All', ...new Set(tempQuizzes.map(q => q.topic))];
            setTopics(uniqueTopics);
    } else {
            setTopics([]);
    }

    if (selectedSubject !== 'All' && selectedTopic !== 'All') {
            tempQuizzes = tempQuizzes.filter(q => q.topic === selectedTopic);
    }

    if (completedQuizIds) {
      if (completionStatus === 'Completed') {
        tempQuizzes = tempQuizzes.filter(quiz => completedQuizIds.has(quiz.id));
      } else if (completionStatus === 'Not Completed') {
        tempQuizzes = tempQuizzes.filter(quiz => !completedQuizIds.has(quiz.id));
      }
    }

    setFilteredQuizzes(tempQuizzes);

  }, [selectedSubject, selectedTopic, completionStatus, allQuizzes, loading, completedQuizIds]);

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
    setSelectedTopic('All'); // Reset topic when subject changes
  };

return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My Quizzes</h1>
        <p className="text-gray-600 mt-1">
          Test your knowledge with comprehensive quizzes across all UPSC subjects
        </p>
      </div>

      {/* Stats Cards (using dynamic data) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={<BookCheck />} title="Total Quizzes" value={loading ? '...' : allQuizzes.length} color="text-purple-600" />
        <StatCard icon={<TrendingUp />} title="Completed" value={stats.completed} color="text-green-600" />
        <StatCard icon={<Trophy />} title="Best Score" value={`${stats.bestScore}%`} color="text-yellow-600" />
        <StatCard icon={<Target />} title="Average Score" value={`${stats.averageScore}%`} color="text-blue-600" />
      </div>

      {/* --- CORRECTED Filter Section --- */}
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Left side filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <label htmlFor="subject-filter" className="text-gray-700 font-medium">Filter by Subject:</label>
          <select
            id="subject-filter"
            value={selectedSubject}
            onChange={handleSubjectChange}
            className="p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-purple-500 focus:border-purple-500"
          >
            {subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
          </select>

          {selectedSubject !== 'All' && topics.length > 1 && (
            <select
              id="topic-filter"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-purple-500 focus:border-purple-500"
            >
              {topics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
            </select>
          )}
        </div>
        
        {/* Right side filters */}
        <div className="flex items-center p-1 rounded-lg bg-gray-200">
          {['All', 'Completed', 'Not Completed'].map(status => (
            <button
              key={status}
              onClick={() => setCompletionStatus(status)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                completionStatus === status ? 'bg-white text-purple-600 shadow' : 'text-gray-600 hover:bg-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <p>Loading all quizzes...</p>
        ) : (
          filteredQuizzes.map((quiz) => {
            const subjectColors = getSubjectTagColors(quiz.subject);
            const difficultyColors = getDifficultyTagColors(quiz.difficulty);

            return (
              <div key={quiz.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{formatQuizTitle(quiz.title)}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        {/* --- UPDATED: Subject Tag with dynamic colors --- */}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${subjectColors.bg} ${subjectColors.text}`}>
                          {quiz.subject}
                        </span>
                        {/* --- UPDATED: Difficulty Tag with dynamic colors --- */}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors.bg} ${difficultyColors.text}`}>
                          {quiz.difficulty}
                        </span>
                      </div>
                    </div>
                    {/* Checkbox icon, remains same */}
                    <div className="w-8 h-8 flex items-center justify-center text-purple-600">
                      <BookCheck className="w-5 h-5" />
                    </div>
                  </div>
                  {/* --- UPDATED: Question Count and Time Limit display --- */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1"><BookCheck className="w-4 h-4" /><span>{quiz.questionCount || 0} Questions</span></div>
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{quiz.timeLimit || 0} Minutes</span></div>
                  </div>
                  {/* Assuming there's a description in your data; if not, you can remove this */}
                  <p className="text-sm text-gray-500 mb-6">
                    Test your knowledge of {quiz.subject} with comprehensive questions
                  </p>
                </div>
                <div className="mt-auto">
                  <Link
                    to={`/dashboard/quiz/${quiz.id}`}
                    // --- UPDATED: Button styling for smaller size ---
                    className="inline-flex items-center justify-center bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors text-base"
                  >
                    Start Quiz
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default MyQuizzesPage;