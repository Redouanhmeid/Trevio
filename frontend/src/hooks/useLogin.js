// useLogin.js
import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import { useNavigate } from 'react-router-dom';
import { auth, provider } from '../services/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';

export const useLogin = () => {
 const [error, setError] = useState(null);
 const [isLoading, setIsLoading] = useState(false);
 const { dispatch } = useAuthContext();
 const navigate = useNavigate();

 const login = async (email, password) => {
  setIsLoading(true);
  setError(null);

  try {
   const response = await fetch('/api/v1/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
   });
   const json = await response.json();

   if (!response.ok) {
    setIsLoading(false);
    setError(json.error);
    return { error: json.error };
   }

   // Store both user data and token separately
   const { token, ...userData } = json;
   localStorage.setItem('user', JSON.stringify(userData));
   localStorage.setItem('token', token); // Store token separately

   // update the auth context with both user data and token
   dispatch({
    type: 'LOGIN',
    payload: { ...userData, token },
   });

   setIsLoading(false);
   return { data: json };
  } catch (err) {
   setIsLoading(false);
   const errorMessage = err.message || 'An error occurred during login';
   setError(errorMessage);
   return { error: errorMessage };
  }
 };

 const googleLogin = async () => {
  try {
   setIsLoading(true);
   const result = await signInWithPopup(auth, provider);
   const user = result.user;

   // Check if the user already exists in your backend
   const response = await fetch(`/api/v1/users/email/${user.email}`);
   const userData = await response.json();

   if (response.ok && userData) {
    // If user exists, get their token through login
    const loginResponse = await fetch('/api/v1/users/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
      email: user.email,
      // You might need to handle this differently based on your backend
      password: user.uid,
     }),
    });
    const loginData = await loginResponse.json();

    if (loginResponse.ok) {
     const { token, ...userInfo } = loginData;
     localStorage.setItem('user', JSON.stringify(userInfo));
     localStorage.setItem('token', token);
     dispatch({ type: 'LOGIN', payload: { ...userInfo, token } });
    }
   } else {
    // If user doesn't exist, sign them up
    const dummyPassword = Math.random().toString(36).slice(-8);

    const newUser = {
     email: user.email,
     password: dummyPassword,
     firstname: user.displayName.split(' ')[0],
     lastname: user.displayName.split(' ').slice(1).join(' '),
     phone: user.phoneNumber || 'N/A',
     avatar: user.photoURL || '/avatars/default.png',
     isVerified: true,
    };

    const signupResponse = await fetch('/api/v1/users', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(newUser),
    });

    const newUserData = await signupResponse.json();

    if (signupResponse.ok) {
     const { token, ...userData } = newUserData;
     localStorage.setItem('user', JSON.stringify(userData));
     localStorage.setItem('token', token);
     dispatch({ type: 'LOGIN', payload: { ...userData, token } });
    } else {
     throw new Error(newUserData.error || 'Sign-up failed');
    }
   }

   setIsLoading(false);
   navigate('/');
  } catch (error) {
   if (error.code === 'auth/popup-closed-by-user') {
    setError('Vous avez fermé la fenêtre de connexion. Veuillez réessayer.');
   } else {
    setError(error.message);
   }
   setIsLoading(false);
  }
 };

 return { login, googleLogin, isLoading, error };
};
