import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { BookCheck, Library, Trophy, Target, Star, Book } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, getDoc, doc, query, limit } from 'firebase/firestore';
import { db } from '../Firebase';
import resources from '../data/resources.json';
import { ALL_POSSIBLE_BADGES } from '../data/badgeMeta';

function StatCard({ icon, title, value, theme }) {
  const colors = {
    blue: { text: 'text-blue-500', bg: 'bg-blue-100' },
    green: { text: 'text-green-500', bg: 'bg-green-100' },
    yellow: { text: 'text-yellow-500', bg: 'bg-yellow-100' },
    purple: { text: 'text-purple-500', bg: 'bg-purple-100' },
  };
  const selectedTheme = colors[theme] || colors.purple;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between transition-transform duration-300 hover:-translate-y-1 shadow hover:shadow-md">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`w-12 h-12 ${selectedTheme.bg} rounded-lg flex items-center justify-center`}>
        {React.cloneElement(icon, { className: `w-6 h-6 ${selectedTheme.text}` })}
      </div>
    </div>
  );
}

function formatQuizTitle(title = "") {
  let t = title.replace(/M[\s-]?0*\d+\s*_?/i, '').trim();
  t = t.replace(/practicequestions$/i, '').trim();
  return t.replace(/(\s+|\W+)$/, '').trim();
}

function getRandomUniqueSubjectResources(resources, count = 4) {
  const shuffled = [...resources].sort(() => 0.5 - Math.random());
  const picked = [];
  const subjects = new Set();
  for (const res of shuffled) {
    if (!subjects.has(res.subject)) {
      picked.push(res);
      subjects.add(res.subject);
      if (picked.length === count) break;
    }
  }
  return picked;
}

function DashboardHomePage() {
  const { currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [stats, setStats] = useState({
    totalResources: 0,
    totalSubjects: 0,
    totalModules: 0,
  });
  const [dailyFact, setDailyFact] = useState("");
  const [progress, setProgress] = useState([]);
  const [activity, setActivity] = useState([]);
  const badgeMap = {};
  ALL_POSSIBLE_BADGES.forEach(badge => {
    badgeMap[badge.id] = badge;
  });
  const dashboardResources = getRandomUniqueSubjectResources(resources, 4);
  const [profile, setProfile] = useState(null);
   useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser?.uid) return;
      const userDocRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        setProfile(userSnap.data());
      }
    };
    fetchProfile();
  }, [currentUser]);

  useEffect(() => {
    const fetchActivity = async () => {
      const resultsSnap = await getDocs(collection(db, "quizResults"));
      const userResults = resultsSnap.docs
        .map(d => ({ type: "quiz", ...d.data() }))
        .filter(r => r.userId === currentUser.uid);

      const badgesSnap = await getDocs(collection(db, "userBadges"));
      const userBadges = badgesSnap.docs
        .map(d => ({ type: "badge", ...d.data() }))
        .filter(b => b.userId === currentUser.uid);

      const merged = [...userResults, ...userBadges].sort(
        (a, b) => b.completedAt?.seconds - a.completedAt?.seconds
      );

      setActivity(merged.slice(0, 5)); // last 5 events
    };
    fetchActivity();
  }, [currentUser]);


  useEffect(() => {
    const calcProgress = async () => {
      // Step 1: Fetch all quizResults for the user
      const resultsSnap = await getDocs(collection(db, "quizResults"));
      const userResults = resultsSnap.docs
        .map(d => d.data())
        .filter(r => r.userId === currentUser.uid);

      // Step 2: Collect all unique quizIds
      const quizIds = [...new Set(userResults.map(r => r.quizId))];

      // Step 3: Fetch all needed quizzes in parallel
      const quizDocs = await Promise.all(
        quizIds.map(id => getDoc(doc(db, "quizzes", id)))
      );

      // Step 4: Build a mapping {quizId: subject}
      const quizIdToSubject = {};
      quizDocs.forEach((docSnap, idx) => {
        if (docSnap.exists()) {
          quizIdToSubject[quizIds[idx]] = docSnap.data().subject;
        }
      });

      // Step 5: Replace 'r.subject' with 'quizIdToSubject[r.quizId]'
      const bySubject = {};
      userResults.forEach(r => {
        const subj = quizIdToSubject[r.quizId] || "Unknown";
        if (!bySubject[subj]) bySubject[subj] = [];
        bySubject[subj].push(r.percentage);
      });

      const progressData = Object.entries(bySubject).map(([subject, scores]) => ({
        subject,
        avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      }));

      setProgress(progressData);
    };
    if (currentUser?.uid) calcProgress();
  }, [currentUser]);

  useEffect(() => {
    const fetchFact = async () => {
      try {
        const res = await fetch("https://api.api-ninjas.com/v1/facts", {
          headers: { 'X-Api-Key': 'cRlYXQQy7GlAj79aOFpMnQ==xpftFzDlkP20nfHs' }
        });
        const data = await res.json();
        // API returns: [ { fact: "something..." } ]
        if (Array.isArray(data) && data.length > 0 && data[0].fact) {
          setDailyFact(`Did you know? ${data[0].fact}`);
        } else {
          setDailyFact("Did you know? The Indian Constitution is the longest written constitution in the world!");
        }
      } catch (error) {
        console.error("Error fetching fact:", error);
        setDailyFact("Did you know? The Indian Constitution is the longest written constitution in the world!");
      }
    };

    fetchFact();
  }, []);




  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const q = query(collection(db, "quizzes"), limit(3));
        const querySnapshot = await getDocs(q);
        const quizzesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setQuizzes(quizzesData);
      } catch (error) {
        console.error("Error fetching quizzes: ", error);
      } finally {
        setLoadingQuizzes(false);
      }
    };

    fetchQuizzes();
  }, []);


  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) return;

      try {
        // --- Quizzes completed & average score ---
        const resultsSnap = await getDocs(query(collection(db, "quizResults")));
        const userResults = resultsSnap.docs
          .map(doc => doc.data())
          .filter(r => r.userId === currentUser.uid);

        const quizzesCompleted = userResults.length;
        const averageScore = userResults.length > 0
          ? Math.round(userResults.reduce((sum, r) => sum + (r.percentage || 0), 0) / userResults.length)
          : 0;

        // --- Badges earned ---
        const badgesSnap = await getDocs(query(collection(db, "userBadges")));
        const userBadges = badgesSnap.docs
          .map(doc => doc.data())
          .filter(b => b.userId === currentUser.uid);
        const badgesEarned = userBadges.length;

        // --- Leaderboard rank ---
        // Fetch all users’ average scores
        const leaderboardSnap = await getDocs(collection(db, "quizResults"));
        const scoresByUser = {};
        leaderboardSnap.forEach(doc => {
          const d = doc.data();
          if (!scoresByUser[d.userId]) scoresByUser[d.userId] = [];
          scoresByUser[d.userId].push(d.percentage || 0);
        });

        const averages = Object.entries(scoresByUser).map(([uid, scores]) => ({
          uid,
          avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        }));

        averages.sort((a, b) => b.avg - a.avg);
        const rank = averages.findIndex(u => u.uid === currentUser.uid) + 1;

        setStats({ quizzesCompleted, averageScore, badgesEarned, rank });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
  }, [currentUser]);


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {profile?.firstName || "User"}!
          </h1>
          <p className="text-gray-600 mt-1">
            Ready to continue your UPSC preparation journey?
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/dashboard/quizzes" className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-purple-700 transition-colors">
            Start New Quiz
          </Link>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<BookCheck />} title="Quizzes Completed" value={stats.quizzesCompleted} theme="blue" />
        <StatCard icon={<Target />} title="Average Score" value={`${stats.averageScore}%`} theme="green" />
        <StatCard icon={<Star />} title="Badges Earned" value={stats.badgesEarned} theme="yellow" />
        <StatCard icon={<Trophy />} title="Leaderboard Rank" value={`#${stats.rank}`} theme="purple" />

      </div>




      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-1 shadow-sm hover:shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Available Quizzes</h2>
              <Link to="/dashboard/quizzes" className="text-purple-600 hover:text-purple-800 font-medium text-sm">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {loadingQuizzes ? (
                <p>Loading quizzes...</p>
              ) : (
                quizzes.map((quiz) => (
                  <div key={quiz.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <BookCheck className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{formatQuizTitle(quiz.title)}</h3>
                        <p className="text-sm text-gray-500">{quiz.subject} • {quiz.timeLimit} mins • {quiz.difficulty}</p>
                      </div>
                    </div>
                    <Link to={`/dashboard/quiz/${quiz.id}`} className="bg-gray-200 text-gray-700 text-sm font-semibold py-1.5 px-4 rounded-lg hover:bg-gray-300">Start Quiz</Link>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-1 shadow-sm hover:shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Study Resources</h2>
              <Link to="/dashboard/resources" className="text-purple-600 hover:text-purple-800 font-medium text-sm">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardResources.map((resource) => (
                <div key={resource.id} className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <Book className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-800">{resource.subject}</span>
                  </div><hr />
                  <br />
                  <h3 className="font-medium text-gray-800">{formatQuizTitle(resource.title)}</h3>
                  <p className="text-sm text-gray-500">{resource.topic} • {resource.duration || 'N/A'}</p>
                  <br />
                  <button
                    onClick={() => window.open(resource.url, "_blank")}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm font-medium mt-1 hover:bg-purple-200"
                  >
                    View PDF
                  </button>
                </div>
              ))}
            </div>

          </div>

        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-1 shadow-sm hover:shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Daily Insight</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{dailyFact}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-1 shadow-sm hover:shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress Overview</h3>
            <div className="space-y-4">
              {progress.map((p) => (
                <div key={p.subject}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">{p.subject}</span>
                    <span className="text-gray-800 font-medium">{p.avg}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${p.avg}%` }}></div>
                  </div>
                </div>

              ))}

            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-1 shadow-sm hover:shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {activity.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${a.type === 'quiz' ? 'bg-green-100' : 'bg-yellow-100'} rounded-full flex items-center justify-center`}>
                    {a.type === 'quiz' ? <BookCheck className="w-4 h-4 text-green-600" /> : <Star className="w-4 h-4 text-yellow-600" />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">
                      {a.type === 'quiz'
                        ? `Completed ${formatQuizTitle(a.quizTitle)}`
                        : `Earned "${badgeMap[a.badgeId]?.name || 'Unknown'}" badge`}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(a.completedAt?.toDate?.() || a.earnedAt?.toDate?.()).toLocaleString()}</p>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHomePage;