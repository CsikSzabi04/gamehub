import React, { useState } from 'react'
import { Button, TextField } from '@mui/material'
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import "./LogSig.css";

export default function Login({ auth, setUser }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  
  const navigate = useNavigate();

  async function login() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail(); setPassword("");
      setLoginError(false);

      window.location.href = "https://csikszabi04.github.io/stats";

    } catch (error) {
      console.log("Login error: ", error.code);
      setLoginError(true);
    }
  }

  return (
    <body className='log'>
    <div className='login'>
      <h1>Login</h1>
      <TextField
        error={loginError}
        className='tf'
        required
        label="Email"
        value={email}
        onChange={e => { setEmail(e.target.value); setLoginError(false); }}
      />
      <TextField
        required
        label="Password"
        className='tf'
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        
      />
      <div> <p>{loginError ? "Wrong username or password!" : "Please Login!"}</p> </div>     
      <Button
        variant="contained"
        color="success"
        onClick={login}
      >Login</Button>
    <p className='pp'>Don't have an account? 
      <Link className='ps' to={"/signup"}>
        Sign up
      </Link>
      </p>

    </div>      
    </body>

  )
}
