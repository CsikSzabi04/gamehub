import './App.css';
import './body.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Body from './Body.jsx'
import Notfound from './pages/Notfound.jsx'
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../firebaseConfig.js";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useState, useEffect } from 'react'
import SignUp from './pages/SignUp.jsx'
import Discover from '././Sections/Dicvover.jsx';
import Movie from './FeaturesByGame/Movies/Movie.jsx';
import Contact from '././Features/Contact.jsx';
import Profile from './pages/Profile.jsx';
import Terms from './TermsAndPrivacy/Terms.jsx';
import Privacy from './TermsAndPrivacy/Privacy.jsx';
import Review from '././Features/Review.jsx';
import SearchReview from '././Features/SearchReview.jsx';
import AllReview from '././Features/AllReview.jsx';
import React from 'react';
import ReviewsOpen from './Features/ReviewsOpen.jsx';
import Dbd from './FeaturesByGame/DBD_Movies.jsx';
import DeadByDaylight from './FeaturesByGame/DBD/DeadByDaylight.jsx';
import DbdApp from './FeaturesByGame/DBD/DbdApp.jsx';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default function App() {

  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  async function logout() {
    await signOut(auth);  
  }

  const router = createBrowserRouter([
    { path: "/", element: <Body /> },
    { path: "/terms", element: <Terms /> },
    { path: "/movies", element: <Movie /> },
    { path: "/dbd", element: <DbdApp /> },
    { path: "/review", element: <Review /> },
    { path: "/allreview/:gameId", element: <AllReview /> },
    { path: "/searchreview/:gameId", element: <SearchReview /> },
    { path: "/privacy", element: <Privacy /> },
    { path: "/profile", element: <Profile setUser={setUser} username={username}/> },
    { path: "/login", element: <Login auth={auth} setUser={setUser} component={Login} /> },
    { path: "/discover", element: <Discover /> },
    { path: "/contact", element: <Contact /> },
    { path: "/signup", element: <SignUp auth={auth} setUsername={setUsername} username={username}/> },
    { path: "*", element: <Notfound /> },
    { path: "/reviews/:gameId", element: <ReviewsOpen /> }

  ]);
  
  return (
    
    <div className='app'> 
      <RouterProvider router={router} />
    </div>
  );
}
