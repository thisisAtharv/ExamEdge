import React from "react";
import { Link } from "react-router-dom";
import { BookCheck, Target, TrendingUp, ArrowRight } from "lucide-react";

function HomePage() {
  return (
    <>
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Master Your Competitive Exams
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Comprehensive UPSC preparation with interactive quizzes, curated study materials, and personalized progress tracking. Your journey to success starts here.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
      
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose ExamEdge?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to excel in your UPSC preparation, all in one platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-2">
              <BookCheck className="mx-auto h-12 w-12 text-purple-600" />
              <h3 className="text-xl font-bold mt-4">Curated Resources</h3>
              <p className="mt-2 text-gray-600">
                Access a vast library of notes, PDFs, and study materials organized by subject for efficient learning.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-2">
              <Target className="mx-auto h-12 w-12 text-purple-600" />
              <h3 className="text-xl font-bold mt-4">Interactive Quizzes</h3>
              <p className="mt-2 text-gray-600">
                Test your knowledge with topic-wise MCQs and timed tests with instant feedback and performance analysis.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-2">
              <TrendingUp className="mx-auto h-12 w-12 text-purple-600" />
              <h3 className="text-xl font-bold mt-4">Progress Tracking</h3>
              <p className="mt-2 text-gray-600">
                Visually track your quiz scores, completed topics, and learning trends to stay motivated and focused.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- THIS SECTION WAS MOVED --- */}
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Success Journey?
          </h2>
          <p className="text-xl text-purple-200 mb-8">
            Join thousands of successful UPSC aspirants who chose ExamEdge for their preparation.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}

export default HomePage;