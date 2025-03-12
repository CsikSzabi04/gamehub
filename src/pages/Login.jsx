import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import './LogSig.css';

export default function Login({ auth, setUser }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const navigate = useNavigate();

  async function login() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail(); setPassword('');
      setLoginError(false);

      window.location.href = "/";

    } catch (error) {
      console.log("Login error: ", error.code);
      setLoginError(true);
    }
  }

  return (
    <>
      <header className="p-4 bg-gray-800 flex justify-between items-center">
        <div className="head flex items-center justify-between w-full md:w-auto">
          <Link to="/"><h1 className="text-2xl md:text-3xl font-bold text-white cursor-pointer"> Game Data <br /> Hub</h1></Link> 
        </div>
      </header>

      <div className="login-container flex flex-col md:flex-row items-stretch min-h-screen m-4 p-4 md:p-20">
        <div className="login-form bg-gray-800 w-full md:w-1/2 px-8 py-6 md:p-10 flex items-center justify-center">
          <div className="form-content w-full p-10">
            <h1 className="text-3xl font-semibold mb-6 text-white">Login</h1>
            <TextField error={loginError} className="tf w-full mb-4 bg-white" required label="Email" value={email} onChange={e => { setEmail(e.target.value); setLoginError(false); }} />
            <TextField required label="Password" className="tf w-full mb-4 bg-white" type="password" value={password} onChange={e => setPassword(e.target.value)}/>
            <div>
              <p className="text-white mt-10">{loginError ? "Wrong username or password!" : "Please Login!"}</p>
            </div>
            <Button variant="contained"color="success" onClick={login} className="w-full mt-4" >Login </Button>
            <p className="pp mt-10 text-white">Don't have an account?  <Link className="ps" to="/signup">  Sign up</Link> </p>
          </div>
        </div>

        <div className="login-image w-full md:w-1/2 hidden md:flex items-center justify-center"> <img  src="././gaming.png" alt="Login Illustration" className="w-full h-full object-cover" /> </div>
      </div>
    </>
  );
}
