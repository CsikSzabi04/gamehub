import React, { useState, useEffect } from 'react';
import { Button, Typography } from '@mui/material';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Footer from '../Footer';
import Header from '../Header';

export default function Profile({ setUser, username }) {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                const q = query(collection(firestore, "usernames"), where("email", "==", user.email));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {

                    setUserInfo({
                        username: username || 'User',
                        email: user.email,
                    });
                } else {
                    setUserInfo({
                        username: 'User',
                        email: user.email,
                    });
                }
                setLoading(false);
            } else {
                navigate('/login');
            }
        };

        fetchUserData();
    }, [navigate]);


    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            navigate('/login');
        } catch (error) {
            console.log('Logout error: ', error);
        }
    };

    return (
        <>
        <Header />
        <div className="profile-container flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
            <div className="profile-card bg-gray-800 rounded-lg p-8 w-full sm:w-2/3 md:w-1/2">
                <Typography variant="h4" className="text-center mb-6">User Profile</Typography>
                {loading ? (
                    <Typography variant="body1" className="text-center">Loading...</Typography>
                ) : (
                    <>
                        <Typography variant="h6" className="mb-4">Username: {userInfo.email.split("@")[0]}</Typography>
                        <Typography variant="h6" className="mb-4">Email: {userInfo.email}</Typography> <br />
                    </>
                )}
                <Button variant="contained" color="error" onClick={handleLogout} fullWidth className="mt-6">
                    Logout
                </Button>
            </div>
        </div>
        <Footer />
        </>
    );
}
