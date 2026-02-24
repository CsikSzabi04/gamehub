import React, { useState, useEffect } from 'react';
import { signOut, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import Footer from '../Footer';
import Header from '../Header';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaCalendarAlt, FaEdit, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

export default function Profile({ setUser, username }) {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUserData() {
            try {
                const user = auth.currentUser;
                if (!user) {
                    navigate('/login');
                    return;
                }

                const userDoc = doc(firestore, "users", user.uid);
                const userSnapshot = await getDoc(userDoc);
                
                if (userSnapshot.exists()) {
                    setUserInfo({
                        username: userSnapshot.data().username || user.email.split("@")[0],
                        email: user.email,
                        emailVerified: user.emailVerified,
                        photoURL: user.photoURL,
                        createdAt: user.metadata.creationTime
                    });
                } else {
                    setUserInfo({
                        username: user.email.split("@")[0],
                        email: user.email,
                        emailVerified: user.emailVerified,
                        photoURL: user.photoURL,
                        createdAt: user.metadata.creationTime
                    });
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setError("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    async function handleLogout() {
        try {
            await signOut(auth);
            setUser(null);
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            setError("Failed to logout. Please try again.");
        }
    };

    async function handleUpdateUsername(){
        try {
            await updateProfile(auth.currentUser, {
                displayName: newUsername
            });
            setUserInfo(prev => ({ ...prev, username: newUsername }));
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating username:", error);
            setError("Failed to update username");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-[#030712]">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full"
                        />
                        <p className="text-gray-400 mt-4">Loading profile...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#030712]">
            <Header />
            <main className="flex-grow flex items-center justify-center p-4 sm:p-8 pt-24">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                        {/* Profile Header */}
                        <div className="flex flex-col items-center mb-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="relative"
                            >
                                {userInfo.photoURL ? (
                                    <img 
                                        src={userInfo.photoURL} 
                                        alt="Profile" 
                                        className="w-24 h-24 rounded-full object-cover border-4 border-violet-500"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center border-4 border-violet-500">
                                        <FaUserCircle className="w-14 h-14 text-white" />
                                    </div>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => { setIsEditing(!isEditing); setNewUsername(userInfo.username); }}
                                    className="absolute bottom-0 right-0 p-2 rounded-full bg-violet-500 text-white shadow-lg"
                                >
                                    <FaEdit className="w-4 h-4" />
                                </motion.button>
                            </motion.div>
                            
                            <motion.h1 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-2xl font-bold text-white mt-4"
                            >
                                {userInfo.username}
                            </motion.h1>
                        </div>

                        {/* Edit Username */}
                        {isEditing && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10"
                            >
                                <p className="text-gray-400 text-sm mb-3">Edit Username</p>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newUsername} 
                                        onChange={(e) => setNewUsername(e.target.value)} 
                                        className="flex-grow p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleUpdateUsername}
                                        className="px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl font-medium"
                                    >
                                        Save
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* User Info */}
                        <div className="space-y-4">
                            <div className="flex items-center p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400 mr-4">
                                    <FaUser className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Username</p>
                                    <p className="text-white font-medium">{userInfo.username}</p>
                                </div>
                            </div>

                            <div className="flex items-center p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 mr-4">
                                    <FaEnvelope className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="text-white font-medium">{userInfo.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400 mr-4">
                                    <FaCalendarAlt className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Member since</p>
                                    <p className="text-white font-medium">{new Date(userInfo.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Logout Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLogout}
                            className="w-full mt-8 py-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-semibold flex items-center justify-center gap-3 hover:bg-red-500/30 transition-all"
                        >
                            <FaSignOutAlt className="w-5 h-5" />
                            Logout
                        </motion.button>
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}
