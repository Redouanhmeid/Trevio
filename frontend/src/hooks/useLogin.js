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
   const googleUser = result.user;

   // First check if the user already exists in our system
   const checkUserResponse = await fetch(
    `/api/v1/users/email/${googleUser.email}`
   );

   let userData;
   let token;

   if (checkUserResponse.ok) {
    // User exists, get their data
    const responseData = await checkUserResponse.json();

    // Check if the response is null (user not found)
    if (!responseData) {
     // User doesn't exist, we need to register them
     // Fall through to the registration logic below
     userData = null;
    } else {
     userData = responseData;

     // Ensure role exists, default to 'client' if missing
     if (!userData.role) {
      userData.role = 'client';
     }

     // Generate a token for the session
     token = 'google-auth-' + Date.now(); // Better placeholder token
    }
   }

   // If userData is still null or response wasn't ok, register the user
   if (!userData) {
    // User doesn't exist, register them
    const registerResponse = await fetch('/api/v1/users', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
      email: googleUser.email,
      password: Math.random().toString(36).slice(-8), // Random password
      firstname: googleUser.displayName?.split(' ')[0] || 'Google',
      lastname: googleUser.displayName?.split(' ').slice(1).join(' ') || 'User',
      phone: googleUser.phoneNumber || 'N/A',
      avatar: googleUser.photoURL || '/avatars/default.png',
      isVerified: true, // User is verified through Google
      role: 'client', // Set default role to client
     }),
    });

    if (!registerResponse.ok) {
     const errorData = await registerResponse.json();
     throw new Error(errorData.error || 'Failed to register with Google');
    }

    userData = await registerResponse.json();
    token = 'google-auth-' + Date.now(); // Better placeholder token
   }

   // Final validation before storing
   if (!userData || typeof userData !== 'object') {
    throw new Error('Invalid user data structure');
   }

   // Ensure user has a role, default to 'client' if missing
   if (!userData.role) {
    userData.role = 'client';
   }

   // Store user data and token
   localStorage.setItem('user', JSON.stringify(userData));
   localStorage.setItem('token', token);

   // Update auth context with validated data
   dispatch({
    type: 'LOGIN',
    payload: { ...userData, token },
   });

   setIsLoading(false);
   navigate('/');
   return true;
  } catch (error) {
   console.error('Google login error:', error);
   setIsLoading(false);

   // Provide user-friendly error messages
   let errorMessage = 'Error during Google login';
   if (error.code === 'auth/popup-closed-by-user') {
    errorMessage = 'Login cancelled. Please try again.';
   } else if (error.code === 'auth/popup-blocked') {
    errorMessage =
     'Login popup was blocked. Please allow popups for this site.';
   } else if (error.message) {
    errorMessage = error.message;
   }

   setError(errorMessage);
   return false;
  }
 };

 return { login, googleLogin, isLoading, error };
};
