import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Volume2, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { doc, getDoc, addDoc, getDocs, query, where, collection } from "firebase/firestore"
import { db } from "../Firebase";
import { useAuth } from "../context/AuthContext";

function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);


  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const quizDocRef = doc(db, 'quizzes', quizId);
        const quizDocSnap = await getDoc(quizDocRef);

        if (!quizDocSnap.exists()) throw new Error("Quiz not found!");

        const quizData = { id: quizDocSnap.id, ...quizDocSnap.data() };
        setQuiz(quizData);
        setTimeLeft(quizData.timeLimit * 60);

        const q = query(collection(db, "questions"), where("quizId", "==", quizId));
        const questionsSnapshot = await getDocs(q);
        const questionsData = questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setQuestions(questionsData.sort(() => Math.random() - 0.5));
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        alert(error.message);
        navigate('/dashboard/quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId, navigate]);

  // --- 2. Timer Logic ---
  // This separate useEffect is now only for the timer
  useEffect(() => {
    // Don't start the timer until data is loaded and timeLeft is a number
    if (loading || timeLeft === null || timeLeft <= 0) {
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          handleSubmit(); // Call submit when time is up
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // This is a cleanup function that runs when the component unmounts
    // It's crucial to stop the timer to prevent memory leaks
    return () => clearInterval(timerId);

  }, [loading, timeLeft]); // This effect depends on loading and timeLeft


  const handleSubmit = async() => {
    const score = Object.keys(answers).reduce((acc, index) => {
      return acc + (answers[index] === questions[index]?.correctAnswer ? 1 : 0);
    }, 0);

    // Calculate timeSpent before navigating
    const timeSpent = (quiz.timeLimit * 60) - timeLeft;

    // Save the result to Firestore
  try {
    const resultsCollectionRef = collection(db, 'quizResults');
    await addDoc(resultsCollectionRef, {
      userId: currentUser.uid,
      quizId: quiz.id,
      quizTitle: quiz.title,
      score: score,
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      completedAt: new Date() // Timestamp for when the quiz was finished
    });
    console.log("Quiz result saved successfully!");
  } catch (error) {
    console.error("Error saving quiz result: ", error);
  }

    navigate(`/dashboard/quiz/${quizId}/results`, {
      state: {
        score,
        total: questions.length,
        answers,
        quizTitle: quiz.title,
        questions: questions,
        timeSpent // Pass the calculated time
      }
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex) => {
    setAnswers({ ...answers, [currentQuestion]: answerIndex });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel(); // Cancel any previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };

  if (!quiz || questions.length === 0) {
    return <div>Loading quiz...</div>;
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
            <p className="text-gray-600">{quiz.subject} • {quiz.difficulty}</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2 text-purple-600">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg font-semibold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-purple-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Question Area */}
        <div className="lg:col-span-3">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
                Q{currentQuestion + 1}. {currentQ.questionText}
              </h2>
              {/* 2. THIS IS THE FIX: Highlighted speaker icon */}
              <button
                onClick={() => speakQuestion(currentQ.questionText)}
                className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors"
                title="Listen to question"
              >
                <Volume2 className="w-5 h-5 text-purple-600" />
              </button>
            </div>
            <div className="space-y-3 mb-8">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all text-gray-800 ${answers[currentQuestion] === index
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                >
                  <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              ))}
            </div>
            <div className="flex justify-between border-t pt-6">
              <button onClick={handlePrevious} disabled={currentQuestion === 0} className="flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button onClick={handleSubmit} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700">
                  Submit Quiz <CheckCircle className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleNext} className="flex items-center gap-2 bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigator */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Question Navigator</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${index === currentQuestion ? 'bg-purple-600 text-white'
                      : answers[index] !== undefined ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizPage;