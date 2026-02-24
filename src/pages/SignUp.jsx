import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig.js';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser, FaGamepad } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Header from '../Header.jsx';

export default function Register({ auth, setUsername, username }) {
  const [localUsername, setLocalUsername] = useState(username || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Sync local username with prop
  useEffect(() => {
    if (username) {
      setLocalUsername(username);
    }
  }, [username]);

  // Update parent state when username changes
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setLocalUsername(value);
    if (setUsername) {
      setUsername(value);
    }
  };

  async function handleRegister(){
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess(true);
      await addDoc(collection(firestore, "usernames"), { username: localUsername });
      setError('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to create an account.');
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="min-h-screen flex items-center justify-center p-4 pt-20">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Image */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:block order-2 md:order-1"
          >
            <div className="relative rounded-3xl overflow-hidden h-[500px]">
              <img 
                src="./gaming.png" 
                alt="Signup Illustration" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent"></div>
              
              {/* Overlay Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h2 className="text-2xl font-bold text-white mb-2">Join Our Community</h2>
                <p className="text-gray-300">Create an account to track your favorite games and discover new ones.</p>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full order-1 md:order-2"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 mb-4">
                  <FaGamepad className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Create Account</h1>
                <p className="text-gray-400">Join GameDataHub today</p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Username Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUser className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Username"
                    value={localUsername}
                    onChange={handleUsernameChange}
                    onKeyDown={(e) => {if (e.key === "Enter") handleRegister();}}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all"
                  />
                </div>

                {/* Email Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {if (e.key === "Enter") handleRegister();}}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all"
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {if (e.key === "Enter") handleRegister();}}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all"
                  />
                </div>

                {/* Confirm Password Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => {if (e.key === "Enter") handleRegister();}}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all"
                  />
                </div>

                {/* Error/Success Message */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center"
                  >
                    Account created successfully! Redirecting to login...
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Register Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 text-white font-semibold text-lg shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </motion.button>
              </div>

              {/* Login Link */}
              <p className="text-center text-gray-400 mt-8">
                Already have an account?{' '}
                <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
