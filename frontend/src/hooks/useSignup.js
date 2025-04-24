import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import { auth, provider } from '../services/firebaseConfig';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export const useSignup = () => {
 const [error, setError] = useState(null);
 const [message, setMessage] = useState(null);
 const [isLoading, setIsLoading] = useState(false);
 const { dispatch } = useAuthContext();

 const signup = async (email, password, firstname, lastname, phone) => {
  setIsLoading(true);
  setError(null);

  const response = await fetch('/api/v1/users', {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({ email, password, firstname, lastname, phone }),
  });
  const json = await response.json();

  if (!response.ok) {
   setIsLoading(false);
   setError(json.error);
  }
  if (response.ok) {
   // save the user to local storage
   localStorage.setItem('user', JSON.stringify(json));
   setMessage(json.message);
   // update the auth context
   dispatch({ type: 'LOGIN', payload: json });

   setIsLoading(false);
  }
 };

 const googleSignup = async () => {
  try {
   setIsLoading(true);
   const provider = new GoogleAuthProvider();
   const result = await signInWithPopup(auth, provider);
   const user = result.user;

   // Generate a dummy password
   const dummyPassword = Math.random().toString(36).slice(-8);

   // Prepare user data to send to your backend
   const userData = {
    email: user.email,
    password: dummyPassword,
    firstname: user.displayName.split(' ')[0] || 'Google',
    lastname: user.displayName.split(' ').slice(1).join(' ') || 'User',
    phone: user.phoneNumber || 'N/A', // Ensure phone is not undefined
    isVerified: true, // Skip verification step for Google sign-ups
    avatar: user.photoURL || '/avatars/default.png',
    role: 'client',
   };

   // Send user data to your backend
   const response = await fetch('/api/v1/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
   });
   const json = await response.json();

   // Handle existing user case
   if (
    !response.ok &&
    response.status === 400 &&
    json.error &&
    json.error.includes('déjà enregistré')
   ) {
    // User exists but is verified, just fetch the user data
    const fetchUserResponse = await fetch(`/api/v1/users/email/${user.email}`);

    if (fetchUserResponse.ok) {
     const existingUser = await fetchUserResponse.json();

     // Update auth context with existing user
     dispatch({ type: 'LOGIN', payload: existingUser });
     localStorage.setItem('user', JSON.stringify(existingUser));
     setMessage('Google Sign-Up Successful');
     setIsLoading(false);
     return;
    } else {
     throw new Error('Failed to fetch existing user data');
    }
   } else if (!response.ok) {
    throw new Error(json.error || 'Failed to register user');
   }

   // Send user information to your backend if needed
   dispatch({ type: 'LOGIN', payload: json });
   localStorage.setItem('user', JSON.stringify(json));
   setMessage('Google Sign-Up Successful');
   setIsLoading(false);
  } catch (error) {
   if (error.code === 'auth/popup-closed-by-user') {
    setError("Vous avez fermé la fenêtre d'inscription. Veuillez réessayer.");
   } else {
    setError(error.message);
   }
   setIsLoading(false);
  }
 };

 return { signup, googleSignup, isLoading, error, message };
};
