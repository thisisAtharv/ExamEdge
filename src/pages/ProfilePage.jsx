import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Trophy, Target, Edit, Medal, BookCheck } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../Firebase';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';

function ProfilePage() {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ quizzesCompleted: 0, averageScore: 0, totalPoints: 0, badgesEarned: 0 });
  const [streak, setStreak] = useState(0);
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    if (currentUser) {
      const fetchAllProfileData = async () => {
        try {
          // Use Promise.all to fetch everything concurrently for speed
          const [profileSnap, resultsSnap, badgesSnap] = await Promise.all([
            getDoc(doc(db, 'users', currentUser.uid)),
            getDocs(query(collection(db, "quizResults"), where("userId", "==", currentUser.uid))),
            getDocs(query(collection(db, "userBadges"), where("userId", "==", currentUser.uid)))
          ]);

          // 1. Set Profile Form Data
          if (profileSnap.exists()) {
            setFormData(profileSnap.data());
          } else {
            setFormData({ firstName: currentUser.displayName?.split(' ')[0] || '', lastName: '', phone: '', city: '', state: '' });
          }

          // 2. Calculate and Set Performance Stats
          const userResults = resultsSnap.docs.map(d => d.data());
          if (userResults.length > 0) {
            const quizzesCompleted = new Set(userResults.map(r => r.quizId)).size;
            const averageScore = Math.round(userResults.reduce((sum, r) => sum + r.percentage, 0) / userResults.length);
            const totalPoints = userResults.reduce((sum, r) => sum + r.score, 0) * 10;
            const badgesEarned = badgesSnap.size;
            setStats({ quizzesCompleted, averageScore, totalPoints, badgesEarned });

            // 3. Calculate and Set Learning Streak & Heatmap Data
            const dates = userResults.map(r => new Date(r.completedAt.seconds * 1000));
            const uniqueDays = new Set(dates.map(d => d.toDateString()));

            // Heatmap data
            const activityCounts = dates.reduce((acc, date) => {
              const dateString = date.toISOString().slice(0, 10);
              acc[dateString] = (acc[dateString] || 0) + 1;
              return acc;
            }, {});
            setHeatmapData(Object.keys(activityCounts).map(date => ({ date, count: activityCounts[date] })));

            // Streak calculation
            const sortedDays = Array.from(uniqueDays).map(day => new Date(day)).sort((a, b) => b - a);
            let currentStreak = 0;
            if (sortedDays.length > 0) {
              currentStreak = 1;
              let today = new Date();
              today.setHours(0, 0, 0, 0);
              // Check if the most recent day is today or yesterday
              const dayDiff = (today - sortedDays[0]) / (1000 * 60 * 60 * 24);

              if (dayDiff <= 1) {
                for (let i = 1; i < sortedDays.length; i++) {
                  const diff = (sortedDays[i - 1] - sortedDays[i]) / (1000 * 60 * 60 * 24);
                  if (diff === 1) { currentStreak++; } else { break; }
                }
              } else {
                currentStreak = 0; // Streak is broken
              }
            }
            setStreak(currentStreak);
          }
        } catch (error) {
          console.error("Error fetching profile data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAllProfileData();
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser || !formData) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      if (formData.displayName || formData.photoURL) {
      await firebase.auth().currentUser.updateProfile({
        displayName: formData.displayName,
        photoURL: formData.photoURL // if using photoURL too
      });
      await firebase.auth().currentUser.reload();
    }
      await setDoc(userDocRef, formData, { merge: true });
      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile: ", error);
      alert("Failed to update profile.");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading || !formData) {
    return <div className="text-center p-10">Loading Profile...</div>;
  }

  const avatarUrl = currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.firstName || 'U')}&background=E9D5FF&color=6D28D9&bold=true`;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Profile Overview */}
      <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <img src={avatarUrl} alt="Profile Avatar" referrerPolicy="no-referrer" className="w-24 h-24 rounded-full " />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{formData.firstName} {formData.lastName}</h2>
            <p className="text-gray-600">{currentUser.email}</p>
            <p className="text-sm text-gray-500 mt-1">Member since {new Date(currentUser.metadata.creationTime).toLocaleDateString()}</p>
          </div>
          <button onClick={() => setIsEditing(!isEditing)} className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 self-start sm:self-center">
            <Edit className="w-4 h-4" /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
        {/* Personal Information (Main Column) */}
        <div className="lg:col-span-2 ">
          <div className="bg-white p-8 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Personal Information</h3>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">First Name</label><input name="firstName" type="text" value={formData.firstName} onChange={handleInputChange} className="w-full p-2 border rounded-md" /></div>
                  <div><label className="block text-sm font-medium mb-1">Last Name</label><input name="lastName" type="text" value={formData.lastName} onChange={handleInputChange} className="w-full p-2 border rounded-md" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">Phone Number</label><input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} className="w-full p-2 border rounded-md" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Date of Birth (1975-2005)*</label><input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full p-2 border rounded-md" /></div>
                  <div><label className="block text-sm font-medium mb-1">State</label><input name="state" type="text" value={formData.state} onChange={handleInputChange} className="w-full p-2 border rounded-md" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">City</label><input name="city" type="text" value={formData.city} onChange={handleInputChange} className="w-full p-2 border rounded-md" /></div>
                <div className="flex gap-4 pt-4">
                  <button onClick={handleSave} className="bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors">Save Changes</button>
                  <button onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-3"><User className="w-5 h-5 text-purple-400" /><span>{formData.firstName} {formData.lastName}</span></div>
                <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-blue-400" /><span>{currentUser.email}</span></div>
                <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-green-400" /><span>{formData.phone || 'Not provided'}</span></div>
                <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-yellow-400" /><span>{formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'Not provided'}</span></div>
                <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-pink-400" /><span>{formData.city && formData.state ? `${formData.city}, ${formData.state}` : 'Not provided'}</span></div>
              </div>
            )}
          </div>
        </div>
        {/* Stats & Activity (Sidebar Column) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm"><span className="flex items-center gap-2 text-gray-600"><BookCheck className="text-purple-500" /> Quizzes Completed</span><span className="font-semibold">{stats.quizzesCompleted}</span></div>
              <div className="flex justify-between items-center text-sm"><span className="flex items-center gap-2 text-gray-600"><Target className="text-green-500" /> Average Score</span><span className="font-semibold">{stats.averageScore}%</span></div>
              <div className="flex justify-between items-center text-sm"><span className="flex items-center gap-2 text-gray-600"><Trophy className="text-yellow-500" /> Total Points</span><span className="font-semibold">{stats.totalPoints.toLocaleString()}</span></div>
              <div className="flex justify-between items-center text-sm"><span className="flex items-center gap-2 text-gray-600"><Medal className="text-amber-600" /> Badges Earned</span><span className="font-semibold">{stats.badgesEarned}</span></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Learning Streak</h3>
            <div className="text-4xl font-bold text-purple-600 mb-1">{streak}</div>
            <p className="text-sm text-gray-500 mb-3">day{streak !== 1 && 's'} in a row</p>
            {streak > 0 && <p className="text-xs text-purple-700 font-medium bg-purple-100 p-2 rounded-lg">🔥 You're on fire! Keep it up!</p>}
          </div>
        </div>
      </div>
      {/* Wide full-width heatmap at bottom */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-8 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
        <h3 className="text-xl font-semibold text-gray-900 mb-5">
          Activity Heatmap
        </h3>
        <div className="w-full overflow-x-auto" style={{ maxWidth: 700, margin: "0 auto" }}>
          <CalendarHeatmap
          values={heatmapData || []} 
            // ...your props
            showWeekdayLabels={true}
            weekdayLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
            tooltipDataAttrs={value => {
              if (!value || !value.date) return {};
              const d = new Date(value.date);
              const dd = String(d.getDate()).padStart(2, '0');
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const yyyy = d.getFullYear();
              return {
                'data-tooltip-id': 'heatmap-tooltip',
                'data-tooltip-content': `${dd}/${mm}/${yyyy}`
              };
            }}
          />
          <Tooltip id="heatmap-tooltip" />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;