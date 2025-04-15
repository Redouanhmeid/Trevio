import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebaseConfig';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

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
  setIsLoading(true);
  setError(null);

  try {
   const provider = new GoogleAuthProvider();
   // Configure additional scopes
   provider.addScope('profile');
   provider.addScope('email');

   const result = await signInWithPopup(auth, provider);
   const user = result.user;

   // Optionally send user information to your backend if needed
   dispatch({ type: 'LOGIN', payload: user });
   localStorage.setItem('user', JSON.stringify(user));

   setIsLoading(false);
   navigate('/');
  } catch (error) {
   setIsLoading(false);
   setError(error.message);
  }
 };

 return { login, googleLogin, isLoading, error };
};
