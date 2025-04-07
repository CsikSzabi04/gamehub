import React, { useState, useEffect } from 'react';
import { Button, Typography, Avatar, CircularProgress ,Paper ,Divider ,IconButton ,Tooltip} from '@mui/material';
import { signOut, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../../firebaseConfig';
import {  doc,  getDoc} from 'firebase/firestore';
import Logout from '@mui/icons-material/Logout';
import Edit from '@mui/icons-material/Edit';
import Email from '@mui/icons-material/Email';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Footer from '../Footer';
import Header from '../Header';

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
            <div className="flex flex-col min-h-screen bg-gray-900">
                <Header />
                    <div className="flex-grow flex items-center justify-center"><CircularProgress color="primary" size={60} /></div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-900">
            <Header />
            <main className="flex-grow flex items-center justify-center p-4 sm:p-8 ">
                <Paper  className="w-full max-w-md p-6 sm:p-8 rounded-xl"sx={{ backgroundColor: '#1F2937', color: 'white', '& .MuiDivider-root': { backgroundColor: '#374151'}}}>
                    <div className="flex flex-col items-center mb-6 ">
                        <Avatar src={userInfo.photoURL} sx={{ width: 100, height: 100,fontSize: '3rem',bgcolor: 'primary.main'}} >
                            {userInfo.photoURL ? null : userInfo.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="h4" component="h1" className="mt-4 text-center font-bold">
                            {userInfo.username}
                        </Typography>
                    </div>
                    <Divider className="my-4 bg-gray-700" />

                    <div className="space-y-4">
                        <div className="flex items-center">
                            <AccountCircle className="mr-2 text-gray-400" />
                            <Typography variant="body1">
                                <span className="text-gray-400">Username:</span> {userInfo.username}
                            </Typography>
                            <Tooltip title="Edit username">
                                <IconButton size="small" className="ml-2" onClick={() => { setIsEditing(!isEditing); setNewUsername(userInfo.username); }} >
                                    <Edit fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </div>

                        {isEditing && (
                            <div className="flex items-center space-x-2">
                                <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="flex-grow p-2 bg-gray-700 rounded text-white"/>
                                <Button  variant="contained"  size="small" onClick={handleUpdateUsername}> Save</Button>
                            </div>
                        )}

                        <div className="flex items-center">
                            <Email className="mr-2 text-gray-400" />
                            <Typography variant="body1">
                                <span className="text-gray-400">Email:</span> {userInfo.email}
                            </Typography>
                        </div>

                        <div className="flex items-center">
                            <Typography variant="body1" className="text-gray-400">
                                Member since: {new Date(userInfo.createdAt).toLocaleDateString()}
                            </Typography>
                        </div>
                    </div>
                    <Divider className="my-6 bg-gray-700" />

                    <Button variant="contained" color="error" fullWidth startIcon={<Logout />} onClick={handleLogout} size="large" className="mt-4"  >Logout</Button>

                    {error && (
                        <Typography color="error" className="mt-4 text-center">
                            {error}
                        </Typography>
                    )}
                </Paper>
            </main>

            <Footer />
        </div>
    );
}