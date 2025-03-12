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
import Discover from './Dicvover.jsx';
import News from './News.jsx';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default function App() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  async function logout() {
    await signOut(auth);  
  }

  const router = createBrowserRouter([
    { path: "/", element: <Body /> },
    { path: "/login", element: <Login auth={auth} setUser={setUser} component={Login} /> },
    { path: "/discover", element: <Discover /> },
    { path: "/news", element: <News /> },
    { path: "/signup", element: <SignUp auth={auth} /> },
    { path: "*", element: <Notfound /> }
  ]);
  
  return (
    
    <div className='app'> 
      <RouterProvider router={router} />
    </div>
  );
}
