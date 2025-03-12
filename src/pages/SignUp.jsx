import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig.js';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './LogSig.css';

export default function Register({ auth }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess(true);
      await addDoc(collection(firestore, "usernames"), { username });
      setError('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to create an account.');
      setSuccess(false);
    }
  };

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
            <Typography variant="h4" gutterBottom className="text-3xl font-semibold mb-6 text-white">Register</Typography>
            {success && <Typography color="green" className="text-white mb-4">Account created successfully!</Typography>}
            {error && <Typography color="error" className="text-white mb-4">{error}</Typography>}
            <TextField fullWidthclassName="tf w-full mb-4 bg-white" margin="normal" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} error={!!error} />
            <TextField fullWidth className="tf w-full mb-4 bg-white" margin="normal" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} error={!!error} />
            <TextField fullWidth className="tf w-full mb-4 bg-white" margin="normal" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={!!error} />
            <TextField fullWidth className="tf w-full mb-4 bg-white" margin="normal" label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={!!error}/> 
            <Button fullWidth variant="contained" color="success" onClick={handleRegister} style={{ marginTop: '20px' }}>Register</Button>
            <p className="pp mt-10 text-white">Already have an account?  <Link className="ps" to="/login"> Log in</Link> </p>
          </div>
        </div>

        <div className="login-image w-full md:w-1/2 hidden md:flex items-center justify-center">
          <img src="././gaming.png" alt="Signup Illustration" className="w-full h-full object-cover" />
        </div>
      </div>
    </>
  );
}
