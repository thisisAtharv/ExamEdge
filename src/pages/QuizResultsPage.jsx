import React from 'react';
import { useLocation, useParams, Link } from "react-router-dom";
import { Trophy, Clock, CheckCircle, XCircle, RotateCcw, Home } from "lucide-react";

function QuizResultsPage() {
  const { quizId } = useParams();
  const location = useLocation();

  // Get data passed from the QuizPage
  const { score, total, answers, timeSpent = 0, quizTitle, questions } = location.state || {};

  // Basic check to see if we have results data
  if (score === undefined || !quizTitle) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">No results found.</h1>
        <p>Please complete a quiz to see your results.</p>
        <Link to="/dashboard/quizzes" className="mt-4 inline-block bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg">
          Go to Quizzes
        </Link>
      </div>
    );
  }

  const percentage = Math.round((score / total) * 100);
  const timeSpentMinutes = Math.floor(timeSpent / 60);
  const timeSpentSeconds = timeSpent % 60;

  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-500";
    return "text-red-600";
  };

  const getScoreMessage = () => {
    if (percentage >= 90) return "Excellent! Outstanding performance!";
    if (percentage >= 80) return "Great job! You're well prepared!";
    if (percentage >= 60) return "Good work! Keep practicing!";
    return "Keep studying! You'll do better next time.";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Results Header */}
      <div className="bg-white p-8 rounded-lg shadow-md text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-10 h-10 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h1>
        <p className="text-gray-600 mb-6">{quizTitle}</p>
        <div className={`text-6xl font-bold mb-4 ${getScoreColor()}`}>{score}/{total}</div>
        <div className={`text-2xl font-semibold mb-4 ${getScoreColor()}`}>{percentage}%</div>
        <p className="text-lg text-gray-600 mb-8">{getScoreMessage()}</p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link to="/dashboard/quizzes" className="flex items-center justify-center gap-2 bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700">
            <RotateCcw className="w-4 h-4" /> Take Another Quiz
          </Link>
          <Link to="/dashboard" className="flex items-center justify-center gap-2 bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300">
            <Home className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md text-center transition-transform duration-300 hover:-translate-y-1 shadow hover:shadow-md
">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Correct Answers</h3>
          <p className="text-2xl font-bold text-green-600">{score}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center transition-transform duration-300 hover:-translate-y-1 shadow hover:shadow-md
">
          <XCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Incorrect Answers</h3>
          <p className="text-2xl font-bold text-red-600">{total - score}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center transition-transform duration-300 hover:-translate-y-1 shadow hover:shadow-md
">
          <Clock className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Time Taken</h3>
          <p className="text-2xl font-bold text-purple-600">{timeSpentMinutes}m {timeSpentSeconds}s</p>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="bg-white p-8 rounded-lg shadow-md ">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Detailed Results</h2>
        <div className="space-y-6">
          {questions.map((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-6 transition-transform duration-300 hover:-translate-y-1 shadow hover:shadow-xl">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  <h3 className="font-semibold text-gray-800">{`Q${index + 1}. ${question.question}`}</h3>
                </div>
                <div className="space-y-2 pl-12">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className={`p-3 rounded-lg border ${optionIndex === question.correctAnswer ? 'border-green-500 bg-green-50 text-green-800'
                        : optionIndex === userAnswer && !isCorrect ? 'border-red-500 bg-red-50 text-red-800'
                          : 'border-gray-200 bg-gray-50'
                      }`}>
                      {String.fromCharCode(65 + optionIndex)}. {option}
                      {optionIndex === userAnswer && !isCorrect && <span className="ml-2 font-medium">(Your Answer)</span>}
                    </div>
                  ))}
                </div>
                {question.explanation && (
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg ml-12">
                    <h4 className="font-medium text-purple-700 mb-2">Explanation:</h4>
                    <p className="text-gray-600 text-sm">{question.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- NEW PERFORMANCE ANALYSIS SECTION --- */}
      <div className="bg-white p-8 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl
">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Performance Analysis</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Overall Score</span>
            <span className={`font-bold ${getScoreColor()}`}>{percentage}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Time Efficiency</span>
            <span className="font-bold text-purple-600">
              {timeSpentMinutes < 5 ? "Excellent" : timeSpentMinutes < 8 ? "Good" : "Could be faster"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Accuracy</span>
            <span className={`font-bold ${getScoreColor()}`}>
              {score}/{total} questions
            </span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-purple-50 rounded-lg ">
          <h3 className="font-semibold text-purple-700 mb-2">Recommendations:</h3>
          <ul className="text-gray-600 space-y-1 list-disc list-inside text-sm">
            {percentage < 70 && (
              <li>Focus more on the fundamentals of this topic.</li>
            )}
            {timeSpentMinutes > 8 && (
              <li>Practice time management for better efficiency.</li>
            )}
            <li>Review the explanations for your incorrect answers.</li>
            <li>Take more practice quizzes to improve your score!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default QuizResultsPage;