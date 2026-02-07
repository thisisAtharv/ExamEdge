import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

// 1. Import everything we need from Firebase
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../Firebase';

// Simple SVG component for the Google icon with different fill colors yrgb
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
      <path fill="#FF3D00" d="M6.306 14.691c2.16-2.454 5.04-4.01 8.304-4.686l-5.657-5.657C4.552 8.185 2.29 12.33 1.082 17.182l5.224-2.491z"></path>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-5.657-5.657C30.046 35.154 27.268 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-5.223 2.491C9.617 37.938 16.27 44 24 44z"></path>
      <path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.657 5.657C40.046 37.138 44 31.056 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
  );
}

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (firebaseError) {
      setError('Invalid email or password. Please try again.');
    }
  };

  // 2. This new function handles Google Sign-In via Firebase
  const handleGoogleSignIn = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if this is a new user by looking for their document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      // If the document doesn't exist, they are signing up for the first time
      if (!userDoc.exists()) {
        // We create a new document for them in our 'users' collection
        await setDoc(userDocRef, {
          firstName: user.displayName.split(' ')[0] || '',
          lastName: user.displayName.split(' ').slice(1).join(' ') || '',
          email: user.email,
          createdAt: new Date(),
          // Add default empty values for other fields from your sign-up form
          phone: "",
          dateOfBirth: "",
          gender: "",
          state: "",
          city: "",
          preferredSubjects: []
        });
      }
      
      navigate('/dashboard');

    } catch (googleError) {
      console.error("Google Sign In Error:", googleError);
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4">
      <div className="max-w-md w-full mx-auto bg-white p-8 shadow-xl rounded-lg">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2">
          Welcome Back!
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Sign in to continue your preparation.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Your existing email and password inputs... they are correct */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500" required />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500" required />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
          {error && (<div className="text-red-600 text-sm text-center">{error}</div>)}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
            </div>
            <div className="text-sm">
              <Link to="/forgot-pass" className="font-medium text-purple-600 hover:text-purple-500">Forgot your password?</Link>
            </div>
          </div>
          <div>
            <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-purple-700 transition duration-300">Log In</button>
          </div>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* 3. This is the new Google Sign-In button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <GoogleIcon />
            <span className="ml-3">Sign in with Google</span>
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-purple-600 hover:text-purple-500">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

