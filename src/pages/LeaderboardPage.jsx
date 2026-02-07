import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../Firebase';

function LeaderboardPage() {
  const { currentUser } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          name: `${doc.data().firstName} ${doc.data().lastName}`,
        }));

          const resultsSnapshot = await getDocs(collection(db, 'quizResults'));
          const results = resultsSnapshot.docs.map(doc => doc.data());

          const badgesSnapshot = await getDocs(collection(db, 'userBadges'));
          const badges = badgesSnapshot.docs.map(doc => doc.data());

          const calculatedData = users.map(user => {
          const userResults = results.filter(r => r.userId === user.id);
          const userBadges = badges.filter(b => b.userId === user.id);

          const totalScore = userResults.reduce((sum, r) => sum + r.score, 0) * 10;
          const quizzesCompleted = new Set(userResults.map(r => r.quizId)).size;
          const averageScore = quizzesCompleted > 0 ? Math.round(userResults.reduce((sum, r) => sum + r.percentage, 0) / userResults.length) : 0;
          const badgesEarned = userBadges.length;

          return { ...user, totalScore, quizzesCompleted, averageScore, badgesEarned };
        });

        const sortedData = calculatedData.sort((a, b) => b.totalScore - a.totalScore);
        setLeaderboardData(sortedData);

      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  const currentUserRank = currentUser ? leaderboardData.findIndex(user => user.id === currentUser.uid) + 1 : 0;

  const getRankIcon = (rank, size = 'w-8 h-8') => {
    if (rank === 1) return <Trophy className={`${size} text-yellow-500`} />;
    if (rank === 2) return <Medal className={`${size} text-gray-400`} />;
    if (rank === 3) return <Award className={`${size} text-amber-600`} />;
    return null;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return <div className="w-7 h-7 flex items-center justify-center bg-yellow-100 text-yellow-600 rounded-full font-semibold text-xs">#{rank}</div>;
    if (rank === 2) return <div className="w-7 h-7 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full font-semibold text-xs">#{rank}</div>;
    if (rank === 3) return <div className="w-7 h-7 flex items-center justify-center bg-amber-100 text-amber-600 rounded-full font-semibold text-xs">#{rank}</div>;
    return <div className="w-7 h-7 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full font-semibold text-xs">#{rank}</div>;
  };

  if (loading) return <div>Loading Leaderboard...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Leaderboard</h1>
        <p className="text-gray-600 mt-1">See how you rank among other UPSC aspirants</p>
      </div>

      {/* Current User Rank */}
      {currentUserRank > 0 && (
        <div className="bg-purple-100 p-8 rounded-lg shadow-xl shadow-purple-200 border border-purple-200 text-center transition-transform duration-300 hover:-translate-y-1">
          <div className="w-16 h-16 bg-purple-300 rounded-full flex items-center justify-center mx-auto mb-4"><Trophy className="w-8 h-8 text-purple-800" /></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Your Current Rank</h2>
          <div className="text-5xl font-bold text-purple-600 mb-2">#{currentUserRank}</div>
          <p className="text-gray-600">You're in the top {Math.round((currentUserRank / leaderboardData.length) * 100)}% of learners!</p>
        </div>
      )}

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leaderboardData.slice(0, 3).map((user, index) => (
          <div key={user.id} className={`bg-white p-6 rounded-lg shadow-xl shadow-black-100 text-center flex flex-col items-center transition-transform duration-300 hover:-translate-y-1 ${index === 0 ? 'border-2 border-yellow-300' :
            index === 1 ? 'border-2 border-gray-300' :
              'border-2 border-amber-300'
            }`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : 'bg-amber-100'
              }`}>{getRankIcon(index + 1)}</div>
            <h3 className="text-xl font-semibold text-gray-800">{user.name}</h3>
            <p className="text-4xl font-bold text-gray-900 mt-2">{user.totalScore.toLocaleString()}</p>
            <p className="text-md text-gray-500">Total Score</p>
            <div className="mt-4 text-center text-md text-gray-600">
              <span><span className="font-bold">Avg Score: </span>{user.averageScore}%</span>
              <br />
              <span><span className="font-bold">Quizzes: </span>{user.quizzesCompleted}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Full Rankings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between p-6"><h2 className="text-xl font-semibold text-gray-800">Full Rankings</h2><div className="flex items-center gap-2 text-gray-500 text-sm"><TrendingUp className="w-4 h-4" /><span>Updated daily</span></div></div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-sm font-semibold text-gray-600 uppercase">
                <th className="py-3 px-4 w-[15%]">Rank</th>
                <th className="py-3 px-4 w-[35%]">Name</th>
                <th className="py-3 px-4 text-center w-[15%]">Quizzes Completed</th>
                <th className="py-3 pr-2 text-right w-[15%]">TOTAL Score</th>
                <th className="py-3 pr-10 text-right w-[20%]">Avg Score</th>
                <th className="py-3 px-4 text-center w-[10%]">Badges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaderboardData.map((user, index) => (
                <tr key={user.id} className={`transition-colors ${user.id === currentUser.uid ? 'bg-purple-50' : 'hover:bg-gray-50'}`}>
                  <td className="py-4 px-4"><div className="flex items-center gap-3">{getRankIcon(index + 1, 'w-5 h-5')} {getRankBadge(index + 1)}</div></td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                        {user.id === currentUser.uid && <div className="text-xs text-purple-600 font-bold">You</div>}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-center">{user.quizzesCompleted}</td>
                  <td className="py-4 px-10 font-semibold text-purple-600 text-right">{user.totalScore.toLocaleString()}</td>
                  <td className="py-4 pr-6">
                    <div className="flex items-center justify-end gap-3">
                      <span className="font-medium text-gray-800">{user.averageScore}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5"><div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${user.averageScore}%` }}></div></div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1 text-amber-500">
                      <Award className="w-4 h-4" />
                      <span>{user.badgesEarned}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* --- NEW: Achievement Milestones Section --- */}
      <div className="bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-1">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Achievement Milestones</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg"><Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" /><p className="text-sm font-medium text-gray-800">Top 1%</p><p className="text-xs text-gray-500">Elite Performer</p></div>
          <div className="text-center p-4 bg-gray-50 rounded-lg"><Medal className="w-8 h-8 text-gray-400 mx-auto mb-2" /><p className="text-sm font-medium text-gray-800">Top 5%</p><p className="text-xs text-gray-500">Outstanding</p></div>
          <div className="text-center p-4 bg-gray-50 rounded-lg"><Award className="w-8 h-8 text-amber-600 mx-auto mb-2" /><p className="text-sm font-medium text-gray-800">Top 10%</p><p className="text-xs text-gray-500">Excellent</p></div>
          <div className="text-center p-4 bg-gray-50 rounded-lg"><TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" /><p className="text-sm font-medium text-gray-800">Top 25%</p><p className="text-xs text-gray-500">Above Average</p></div>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardPage;