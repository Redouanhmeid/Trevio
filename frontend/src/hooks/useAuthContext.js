import { AuthContext } from '../context/AuthContext';
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuthContext = () => {
 const context = useContext(AuthContext);
 const navigate = useNavigate();

 useEffect(() => {
  // Check if user exists and is not verified
  if (context.user && context.user.status === 'EN ATTENTE') {
   // Remove from localStorage and logout
   localStorage.removeItem('user');
   context.dispatch({ type: 'LOGOUT' });
   navigate('/verify-email', { state: { email: context.user.email } });
  }
 }, [context.user]);

 if (!context) {
  throw Error('useAuthContext must be used inside an AuthContextProvider');
 }

 return context;
};
