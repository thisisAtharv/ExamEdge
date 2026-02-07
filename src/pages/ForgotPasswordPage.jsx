import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../Firebase';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');     
  const [loading, setLoading] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email) {
      setError("Email field cannot be empty");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Please check your inbox (and spam folder).');
      setEmail('');
    } catch (firebaseError) {
      console.error("Password Reset Error:", firebaseError.code);
      if (firebaseError.code === 'auth/user-not-found') {
        setError('No user found with this email address.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4">
      <div className="max-w-md w-full mx-auto bg-white p-8 shadow-xl rounded-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Forgot Your Password?
          </h2>
          <p className="text-center text-gray-600 mb-8">
            No worries! Enter your email below and we’ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>

          {/* Display Success or Error Messages */}
          {message && <p className="text-green-600 text-sm text-center">{message}</p>}
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-purple-700 transition duration-300 disabled:bg-purple-400"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Remembered your password?{' '}
          <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;

