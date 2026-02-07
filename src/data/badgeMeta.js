export const ALL_POSSIBLE_BADGES = [
  { id: 1, name: 'First Quiz', icon: '🎉', description: 'Complete your very first quiz.', criteria: { quizzesCompleted: 1 } },
  { id: 2, name: 'History Buff', icon: '📜', description: 'Complete 3 History quizzes.', criteria: { subject: 'History', count: 3 } },
  { id: 3, name: 'Geography Expert', icon: '🌍', description: 'Score 80%+ in a Geography quiz.', criteria: { subject: 'Geography', minPercentage: 80 } },
  { id: 4, name: 'Quick Learner', icon: '⚡', description: 'Complete any quiz with an average score of 90% or higher.', criteria: { minPercentage: 90 } },
  { id: 5, name: 'Consistent Scholar', icon: '🗓️', description: 'Complete a quiz on 3 different days.', criteria: { uniqueDays: 3 } },
  { id: 6, name: 'Quiz Master', icon: '👑', description: 'Complete 10 unique quizzes.', criteria: { uniqueQuizzes: 10 } },
  { id: 7, name: 'Top Performer', icon: '🏆', description: 'Achieve a perfect score (100%) in any quiz.', criteria: { minPercentage: 100 } },
  { id: 8, name: 'Night Owl', icon: '🦉', description: 'Complete a quiz after 10 PM.', criteria: { afterHour: 22 } },
];
