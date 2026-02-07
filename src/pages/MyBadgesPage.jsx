import React, { useState, useEffect } from 'react';
import { Award, Lock, CheckCircle, Calendar, Target } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, query, where, setDoc, doc } from 'firebase/firestore';
import { db } from '../Firebase';

const ALL_POSSIBLE_BADGES = [
  { id: 1, name: 'First Quiz', icon: '🎉', description: 'Complete your very first quiz.', criteria: { quizzesCompleted: 1 } },
  { id: 2, name: 'History Buff', icon: '📜', description: 'Complete 3 History quizzes.', criteria: { subject: 'History', count: 3 } },
  { id: 3, name: 'Geography Expert', icon: '🌍', description: 'Score 80%+ in a Geography quiz.', criteria: { subject: 'Geography', minPercentage: 80 } },
  { id: 4, name: 'Quick Learner', icon: '⚡', description: 'Complete any quiz with an average score of 90% or higher.', criteria: { minPercentage: 90 } },
  { id: 5, name: 'Consistent Scholar', icon: '🗓️', description: 'Complete a quiz on 3 different days.', criteria: { uniqueDays: 3 } },
  { id: 6, name: 'Quiz Master', icon: '👑', description: 'Complete 10 unique quizzes.', criteria: { uniqueQuizzes: 10 } },
  { id: 7, name: 'Top Performer', icon: '🏆', description: 'Achieve a perfect score (100%) in any quiz.', criteria: { minPercentage: 100 } },
  { id: 8, name: 'Night Owl', icon: '🦉', description: 'Complete a quiz after 10 PM.', criteria: { afterHour: 22 } },
];

function MyBadgesPage() {
  const { currentUser } = useAuth();
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [lockedBadges, setLockedBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newlyEarnedIds, setNewlyEarnedIds] = useState(new Set());


  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchBadges = async () => {
      setLoading(true);
      try {
        const resultsQuery = query(collection(db, "quizResults"), where("userId", "==", currentUser.uid));
        const badgesQuery = query(collection(db, "userBadges"), where("userId", "==", currentUser.uid));

        const [resultsSnapshot, badgesSnapshot] = await Promise.all([
          getDocs(resultsQuery),
          getDocs(badgesQuery)
        ]);

        const userResults = resultsSnapshot.docs.map(doc => doc.data());
        const earnedBadgeIds = new Set(badgesSnapshot.docs.map(doc => doc.data().badgeId));
        const newlyEarned = [];

        // Check all badges
        ALL_POSSIBLE_BADGES.forEach(badge => {
          if (earnedBadgeIds.has(badge.id)) return;

          const { criteria } = badge;
          let isEarned = false;

          // First quiz count
          if (criteria.quizzesCompleted && userResults.length >= criteria.quizzesCompleted) isEarned = true;

          // Subject-specific badges
          if (criteria.subject) {
            const subjectResults = userResults.filter(r =>
              r.quizTitle.toLowerCase().includes(criteria.subject.toLowerCase())
            );
            if (criteria.count && subjectResults.length >= criteria.count) isEarned = true;
            if (criteria.minPercentage && subjectResults.some(r => r.percentage >= criteria.minPercentage)) isEarned = true;
          } else if (criteria.minPercentage) {
            // General minPercentage badges (not tied to a subject)
            if (userResults.some(r => r.percentage >= criteria.minPercentage)) isEarned = true;
          }

          if (criteria.uniqueQuizzes && new Set(userResults.map(r => r.quizId)).size >= criteria.uniqueQuizzes) isEarned = true;

          if (criteria.uniqueDays) {
            const uniqueDays = new Set(userResults.map(r => r.completedAt.toDate().toLocaleDateString()));
            if (uniqueDays.size >= criteria.uniqueDays) isEarned = true;
          }

          if (criteria.afterHour && userResults.some(r => r.completedAt.toDate().getHours() >= criteria.afterHour)) isEarned = true;

          if (isEarned) newlyEarned.push(badge);
        });


        // Save new earned badges to Firestore
        for (const badge of newlyEarned) {
          const badgeRef = doc(db, "userBadges", `${currentUser.uid}_${badge.id}`);
          await setDoc(badgeRef, { userId: currentUser.uid, badgeId: badge.id, earnedAt: new Date() });
          earnedBadgeIds.add(badge.id);
        }

        setNewlyEarnedIds(new Set(newlyEarned.map(b => b.id)));

        // Build final earned/locked lists
        const finalEarned = ALL_POSSIBLE_BADGES.filter(b => earnedBadgeIds.has(b.id)).map(b => {
          const badgeDoc = badgesSnapshot.docs.find(doc => doc.data().badgeId === b.id);
          return { ...b, earnedDate: badgeDoc ? badgeDoc.data().earnedAt.toDate() : new Date() };
        });
        const finalLocked = ALL_POSSIBLE_BADGES.filter(b => !earnedBadgeIds.has(b.id));

        setEarnedBadges(finalEarned);
        setLockedBadges(finalLocked);

      } catch (err) {
        console.error("Error fetching badges:", err);
      } finally {
        setLoading(false);
      }

    };

    fetchBadges();
  }, [currentUser]);

  // Timeout to remove animation
  useEffect(() => {
    if (newlyEarnedIds.size > 0) {
      const timeout = setTimeout(() => setNewlyEarnedIds(new Set()), 2000);
      return () => clearTimeout(timeout);
    }
  }, [newlyEarnedIds]);


  const completionPercentage = Math.round((earnedBadges.length / ALL_POSSIBLE_BADGES.length) * 100);

  if (loading) return <div className="text-center p-10">Checking your achievements...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My Badges</h1>
        <p className="text-gray-600 mt-1">Track your achievements and unlock new badges as you progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between bg-white p-6 rounded-lg shadow-md flex items-center justify-between transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
          <div>
            <p className="text-gray-500 text-sm">Total Badges</p>
            <p className="text-2xl font-bold text-gray-800">{ALL_POSSIBLE_BADGES.length}</p>
          </div>
          <Award className="w-8 h-8 text-purple-600" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between bg-white p-6 rounded-lg shadow-md flex items-center justify-between transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
          <div>
            <p className="text-gray-500 text-sm">Earned</p>
            <p className="text-2xl font-bold text-green-600">{earnedBadges.length}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between bg-white p-6 rounded-lg shadow-md flex items-center justify-between transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
          <div>
            <p className="text-gray-500 text-sm">Completion Rate</p>
            <p className="text-2xl font-bold text-purple-600">{completionPercentage}%</p>
          </div>
          <Target className="w-8 h-8 text-purple-600" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-1 shadow hover:shadow-xl">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-800">Progress Overview</h2>
          <span className="text-sm text-gray-600">{earnedBadges.length} of {ALL_POSSIBLE_BADGES.length} badges earned</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-purple-600 h-3 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
        </div>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🏆 Earned Badges</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {earnedBadges.map(badge => (
              <div
                key={badge.id}
                className={`bg-white p-6 rounded-lg shadow-md text-center group transition-transform duration-500 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl ease-out 
      ${newlyEarnedIds.has(badge.id) ? 'scale-110 opacity-100 animate-bounce' : 'opacity-100'}`}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">{badge.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{badge.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{badge.description}</p>
                {badge.earnedDate && (
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Earned on {badge.earnedDate.toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🔒 Locked Badges</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {lockedBadges.map(badge => (
              <div key={badge.id} className="bg-white p-6 rounded-lg shadow-md text-center opacity-70 hover:opacity-100 transition-opacity transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <span className="text-3xl grayscale">{badge.icon}</span>
                  <div className="absolute inset-0 bg-gray-200/50 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6 text-gray-500" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{badge.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBadgesPage;
