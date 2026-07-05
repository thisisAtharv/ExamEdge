const admin = require('firebase-admin');
const path = require('path');

// Initialize firebase admin with local service account key
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin SDK initialized.');
} catch (error) {
  console.error('❌ Error: Please place your downloaded "serviceAccountKey.json" from Firebase inside the "backend/" folder.');
  console.error(error.message);
  process.exit(1);
}

const db = admin.firestore();

const sampleQuizzes = [
  {
    id: 'history-independence-movement',
    title: 'Indian Independence Movement',
    subject: 'History',
    topic: 'Modern History',
    difficulty: 'Medium',
    timeLimit: 15,
    questionCount: 5,
    questions: [
      {
        questionText: 'The Battle of Plassey was fought in which year?',
        options: ['1757', '1764', '1857', '1772'],
        correctAnswer: 0
      },
      {
        questionText: 'Who was the first Governor-General of India?',
        options: ['Lord Canning', 'Lord Curzon', 'Lord William Bentinck', 'Warren Hastings'],
        correctAnswer: 2
      },
      {
        questionText: "The 'Doctrine of Lapse' was an annexation policy followed by:",
        options: ['Lord Dalhousie', 'Lord Wellesley', 'Lord Cornwallis', 'Lord Hastings'],
        correctAnswer: 0
      },
      {
        questionText: 'In which session did the Indian National Congress declare Purna Swaraj (Complete Independence)?',
        options: ['Calcutta Session, 1928', 'Lahore Session, 1929', 'Karachi Session, 1931', 'Nagpur Session, 1920'],
        correctAnswer: 1
      },
      {
        questionText: 'Who founded the Ghadar Party in San Francisco?',
        options: ['Lala Lajpat Rai', 'Lala Har Dayal', 'Sardar Ajit Singh', 'V. D. Savarkar'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'geography-physical-india',
    title: 'Physical Geography of India',
    subject: 'Geography',
    topic: 'Indian Geography',
    difficulty: 'Easy',
    timeLimit: 10,
    questionCount: 3,
    questions: [
      {
        questionText: 'Which is the highest peak in India?',
        options: ['Kanchenjunga', 'Mount Everest', 'Nanda Devi', 'K2 (Godwin Austen)'],
        correctAnswer: 0
      },
      {
        questionText: 'Which river is known as the "Dakshin Ganga"?',
        options: ['Krishna', 'Cauvery', 'Godavari', 'Mahanadi'],
        correctAnswer: 2
      },
      {
        questionText: 'The standard meridian of India passes through which city?',
        options: ['Patna', 'Mirzapur', 'Ranchi', 'Delhi'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'polity-constitution-basics',
    title: 'Indian Constitution Basics',
    subject: 'Political Science',
    topic: 'Indian Polity',
    difficulty: 'Hard',
    timeLimit: 20,
    questionCount: 3,
    questions: [
      {
        questionText: 'Who was the Chairman of the Drafting Committee of the Constitution?',
        options: ['Dr. Rajendra Prasad', 'Jawaharlal Nehru', 'Dr. B. R. Ambedkar', 'Sardar Patel'],
        correctAnswer: 2
      },
      {
        questionText: 'Fundamental Duties were incorporated into the Constitution by which Amendment?',
        options: ['42nd Amendment', '44th Amendment', '86th Amendment', '24th Amendment'],
        correctAnswer: 0
      },
      {
        questionText: 'Which article of the Constitution relates to the Right to Constitutional Remedies?',
        options: ['Article 19', 'Article 21', 'Article 32', 'Article 226'],
        correctAnswer: 2
      }
    ]
  }
];

async function seedData() {
  console.log('🚀 Starting Database Seeding...');
  
  try {
    for (const quiz of sampleQuizzes) {
      const { id, questions, ...quizMetadata } = quiz;
      
      // 1. Create/Update the Quiz document in the "quizzes" collection
      await db.collection('quizzes').doc(id).set(quizMetadata);
      console.log(`📝 Added Quiz metadata for: "${quizMetadata.title}"`);
      
      // 2. Clear out any existing questions for this quiz first to avoid duplicates
      const existingQuestions = await db.collection('questions')
        .where('quizId', '==', id)
        .get();
      
      const batch = db.batch();
      existingQuestions.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      
      // 3. Upload new questions for this quiz
      for (const question of questions) {
        const questionDoc = {
          quizId: id,
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer
        };
        await db.collection('questions').add(questionDoc);
      }
      console.log(`✅ Uploaded ${questions.length} questions for Quiz: "${id}"`);
    }
    
    console.log('\n🎉 Seeding completed successfully! Refresh your page to see the quizzes.');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    process.exit(0);
  }
}

seedData();
