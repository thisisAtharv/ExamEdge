// This file holds temporary data so our UI looks complete.
// Later, we will fetch this data from our Firestore database.

// Add explanations to the questions
export const historyQuestions = [
  { question: "The Battle of Plassey was fought in which year?", options: ["1757", "1764", "1857", "1772"], correctAnswer: 0, explanation: "The Battle of Plassey was a decisive victory of the British East India Company over the Nawab of Bengal and his French allies on 23 June 1757." },
  { question: "Who was the first Governor-General of India?", options: ["Lord Canning", "Lord Curzon", "Lord William Bentinck", "Warren Hastings"], correctAnswer: 2, explanation: "Lord William Bentinck was the first Governor-General of India, serving from 1828 to 1835. He is credited for several social and educational reforms." },
  { question: "The 'Doctrine of Lapse' was an annexation policy followed by:", options: ["Lord Dalhousie", "Lord Wellesley", "Lord Cornwallis", "Lord Hastings"], correctAnswer: 0, explanation: "The Doctrine of Lapse was an annexation policy applied by the British East India Company in India until 1859, famously associated with Lord Dalhousie." },
  { question: "In which session did the Indian National Congress declare 'Purna Swaraj' (Complete Independence)?", options: ["Calcutta Session, 1928", "Lahore Session, 1929", "Karachi Session, 1931", "Nagpur Session, 1920"], correctAnswer: 1, explanation: "The Lahore session of the Indian National Congress in 1929 was where the resolution for 'Purna Swaraj' or complete independence from British rule was passed." },
  { question: "The permanent settlement of Bengal was introduced by:", options: ["Lord Curzon", "Lord Cornwallis", "Lord Hastings", "Lord Wellesley"], correctAnswer: 1, explanation: "The permanent settlement of Bengal was introduced by Lord Cornwallis in 1793. It was an agreement between the East India Company and Bengali landlords." },
  { question: "Who founded the 'Ghadar Party' in San Francisco?", options: ["Lala Lajpat Rai", "Lala Har Dayal", "Sardar Ajit Singh", "V. D. Savarkar"], correctAnswer: 1, explanation: "The Ghadar Party was an international political movement founded by expatriate Indians to overthrow British rule in India. It was founded by Lala Har Dayal in 1913." },
  { question: "The Jallianwala Bagh massacre took place in which city?", options: ["Lahore", "Delhi", "Amritsar", "Calcutta"], correctAnswer: 2, explanation: "The Jallianwala Bagh massacre occurred on 13 April 1919 in Amritsar, Punjab, where British troops fired on a large crowd of unarmed Indians." },
  { question: "Who was the author of the book 'Annihilation of Caste'?", options: ["Mahatma Gandhi", "Jawaharlal Nehru", "Sardar Patel", "B. R. Ambedkar"], correctAnswer: 3, explanation: "Annihilation of Caste is an undelivered speech written in 1936 by Dr. B. R. Ambedkar, a prominent Indian jurist, economist, and social reformer." },
  { question: "The Quit India Movement was launched in response to:", options: ["The failure of the Cripps Mission", "The Simon Commission", "The Rowlatt Act", "The Government of India Act, 1935"], correctAnswer: 0, explanation: "The Quit India Movement was launched at the Bombay session of the All-India Congress Committee by Mahatma Gandhi on 8 August 1942, following the failure of the Cripps Mission." },
  { question: "Who gave the slogan 'Inquilab Zindabad'?", options: ["Bhagat Singh", "Subhas Chandra Bose", "Chandra Shekhar Azad", "Maulana Hasrat Mohani"], correctAnswer: 3, explanation: "While popularized by Bhagat Singh, the slogan 'Inquilab Zindabad' (Long live the revolution) was originally coined by the Urdu poet and freedom fighter Maulana Hasrat Mohani." }
];

export const mockQuizzes = [
  { id: 'history-quiz-1', title: 'Indian Independence Movement', subject: 'History', timeLimit: 10, difficulty: 'Medium', questions: historyQuestions },
  { id: 'geography-quiz-1', title: 'Physical Geography of India', subject: 'Geography', timeLimit: 25, difficulty: 'Easy', questions: [] },
  { id: 'polity-quiz-1', title: 'Indian Constitution Basics', subject: 'Political Science', timeLimit: 35, difficulty: 'Hard', questions: [] },
];

export const mockBadges = [
  {
    id: 1,
    name: 'History Buff',
    icon: '📜',
    description: 'Complete 5 History quizzes with 80%+ accuracy.',
    earned: true,
    earnedDate: '2025-09-14',
  },
  {
    id: 2,
    name: 'Geography Expert',
    icon: '🌍',
    description: 'Score 90% or above in 3 Geography quizzes.',
    earned: true,
    earnedDate: '2025-09-18',
  },
  {
    id: 3,
    name: 'Quick Learner',
    icon: '⚡',
    description: 'Complete a quiz in under 15 minutes.',
    earned: true,
    earnedDate: '2025-09-20',
  },
  {
    id: 4,
    name: 'Consistent Scholar',
    icon: '🗓️',
    description: 'Log in and study for 7 consecutive days.',
    earned: true,
    earnedDate: '2025-09-25',
  },
  {
    id: 5,
    name: 'Perfect Score',
    icon: '🎯',
    description: 'Score 100% in any quiz.',
    earned: false,
  },
  {
    id: 6,
    name: 'Quiz Master',
    icon: '👑',
    description: 'Complete 50 quizzes in total.',
    earned: false,
  },
  {
    id: 7,
    name: 'Knowledge Seeker',
    icon: '📚',
    description: 'Access 25 different study resources.',
    earned: false,
  },
  {
    id: 8,
    name: 'Top Performer',
    icon: '🏆',
    description: 'Reach the Top 3 on the leaderboard.',
    earned: false,
  },
  // --- NEW BADGES ---
  {
    id: 9,
    name: 'Night Owl',
    icon: '🦉',
    description: 'Complete a quiz after 10 PM.',
    earned: true,
    earnedDate: '2025-09-28',
  },
  {
    id: 10,
    name: 'Weekend Warrior',
    icon: '⚔️',
    description: 'Complete 5 quizzes over a single weekend.',
    earned: false,
  },
];

export const mockStudyResources = [
  {
    id: 1,
    subject: 'History',
    title: 'Mughal Empire - Complete Notes',
    type: 'Notes',
    duration: '45 mins',
  },
  {
    id: 2,
    subject: 'Geography',
    title: 'Indian Geography - Rivers and Mountains',
    type: 'Video',
    duration: '30 mins',
  },
  {
    id: 3,
    subject: 'Political Science',
    title: 'Fundamental Rights in Constitution',
    type: 'Notes',
    duration: '45 mins',
  },
  {
    id: 4,
    subject: 'Economics',
    title: 'Economic Planning in India',
    type: 'Notes',
    duration: '40 mins',
  },
];

export const dailyFact = "Did you know? The Indian Constitution is the longest written constitution in the world with 395 articles and 12 schedules.";

// We'll use the real user from AuthContext, but keep this as a fallback.
export const mockUsers = [
  {
    id: 'user-001',
    name: 'Priya Sharma',
    totalScore: 3420,
    averageScore: 87,
    quizzesCompleted: 45,
    badgesEarned: 12,
  },
  {
    id: 'user-002',
    name: 'Rahul Gupta',
    totalScore: 3280,
    averageScore: 85,
    quizzesCompleted: 42,
    badgesEarned: 10,
  },
  {
    // This ID is a placeholder for the currently logged-in user
    id: 'current_user_placeholder', 
    name: 'Atharv Singh',
    totalScore: 2950,
    averageScore: 78,
    quizzesCompleted: 38,
    badgesEarned: 8,
  },
  {
    id: 'user-004',
    name: 'Ananya Reddy',
    totalScore: 2800,
    averageScore: 80,
    quizzesCompleted: 35,
    badgesEarned: 9,
  },
  {
    id: 'user-005',
    name: 'Vikram Kumar',
    totalScore: 2640,
    averageScore: 82,
    quizzesCompleted: 33,
    badgesEarned: 7,
  },
];