import { useState, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from '../context/TranslationContext';

export const useUserData = () => {
 const { t } = useTranslation();
 const [userData, setUserData] = useState({});
 const [Users, setUsers] = useState({});
 const [isLoading, setIsLoading] = useState(true);
 const [success, setSuccess] = useState(false);
 const [error, setError] = useState(false);
 const [errorMsg, setErrorMsg] = useState();

 const getUserData = async (userEmail) => {
  try {
   const baseUrl = '/api/v1/users/email/';

   const response = await axios.get(`${baseUrl}${userEmail}`);
   setUserData(response.data);
  } catch (error) {
   console.error('Error fetching user data:', error);
  }
  setIsLoading(false);
 };

 const getUserDataById = useCallback(async (id) => {
  try {
   const response = await axios.get(`/api/v1/users/${id}`, {
    rejectUnauthorized: false, // Add when working with HTTPS sites
    requestCert: false, // Add when working with HTTPS sites
    agent: false, // Add when working with HTTPS sites
   });
   setUserData(response.data);
   setIsLoading(false);
   return response.data;
  } catch (error) {
   console.error('Error fetching user data:', error);
   setError(true);
   setErrorMsg(error.message);
   setIsLoading(false);
  }
 });

 const updateUser = async (id, firstname, lastname, phone) => {
  try {
   const params = {
    url: `/api/v1/users/${id}`,
    method: 'put',
    data: { firstname, lastname, phone },
    rejectUnauthorized: false, //add when working with https sites
    requestCert: false, //add when working with https sites
    agent: false, //add when working with https sites
   };
   const json = await axios(params);
   setSuccess(true);
   setError(false);
  } catch (error) {
   console.error('Error fetching user data:', error);
   setSuccess(false);
   setError(true);
  }
  setIsLoading(false);
 };

 const updateAvatar = async (id, avatar) => {
  try {
   const params = {
    url: `/api/v1/users/avatar/${id}`,
    method: 'put',
    data: { avatar },
    rejectUnauthorized: false, //add when working with https sites
    requestCert: false, //add when working with https sites
    agent: false, //add when working with https sites
   };
   const json = await axios(params);
   setSuccess(true);
   setError(false);
  } catch (error) {
   console.error('Error fetching user data:', error);
   setSuccess(false);
   setError(true);
  }
  setIsLoading(false);
 };

 const updatePassword = async (id, currentPassword, newPassword) => {
  try {
   const response = await fetch(`/api/v1/users/password/${id}`, {
    method: 'PUT',
    headers: {
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPassword, newPassword }),
   });
   if (!response.ok) {
    throw new Error('Échec de la mise à jour du mot de passe');
   }
   setSuccess(true);
   setErrorMsg('Échec de la mise à jour du mot de passe');
   return true;
  } catch (error) {
   console.error('Erreur lors de la mise à jour du mot de passe:', error);
   setSuccess(false);
   setErrorMsg(error.message);
   return false;
  }
  setIsLoading(false);
 };

 const requestPasswordReset = async (email) => {
  setError(false);
  setSuccess(false);
  setErrorMsg('');
  try {
   const response = await fetch('/api/v1/users/reset-password-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
   });
   if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
     errorData.message ||
      'Échec de la demande de réinitialisation de mot de passe'
    );
   }
   setSuccess(true);
   setErrorMsg('');
  } catch (err) {
   setError(true);
   setErrorMsg(err.message);
  } finally {
   setIsLoading(false);
  }
 };

 const verifyResetCode = async (email, code) => {
  try {
   const response = await fetch('/api/v1/users/verify-reset-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
   });
   console.log(response);
   if (!response.ok)
    throw new Error('Échec de la vérification du code de réinitialisation');
   setSuccess(true);
   setErrorMsg('');
   return true;
  } catch (err) {
   setError(true);
   setErrorMsg(err.message);
   return false;
  } finally {
   setIsLoading(false);
  }
 };

 const resetPassword = async (email, code, newPassword) => {
  try {
   const response = await fetch('/api/v1/users/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, newPassword }),
   });
   if (!response.ok)
    throw new Error('Échec de la réinitialisation du mot de passe');
   setSuccess(true);
   setErrorMsg('');
  } catch (err) {
   setError(true);
   setErrorMsg(err.message);
  } finally {
   setIsLoading(false);
  }
 };

 const fetchAllUsers = async () => {
  try {
   const response = await axios.get(`/api/v1/users`);
   setUsers(response.data);
   setIsLoading(false);
  } catch (err) {
   console.error('Error fetching users:', err);
   setError(err.message);
   setIsLoading(false);
  }
 };

 const fetchUserById = async (id) => {
  try {
   const response = await axios.get(`/api/v1/users/${id}`);
   return response.data;
  } catch (err) {
   console.error('Error fetching user:', err);
   return null;
  }
 };

 const deleteUserById = async (id) => {
  setSuccess(false);
  setError(null);
  try {
   await axios.delete(`/api/v1/users/${id}`);
   setSuccess(true);
   setIsLoading(false);
  } catch (err) {
   setError(err);
   setIsLoading(false);
  }
 };

 // New function to verify a user
 const verifyUser = async (id) => {
  setSuccess(false);
  setError(false);
  setErrorMsg('');

  try {
   const response = await axios.patch(`/api/v1/users/${id}/verify`, {
    rejectUnauthorized: false, // Add when working with HTTPS sites
    requestCert: false, // Add when working with HTTPS sites
    agent: false, // Add when working with HTTPS sites
   });

   if (response.status === 200) {
    setSuccess(true);
   } else {
    throw new Error('Failed to verify the user');
   }
  } catch (err) {
   console.error('Error verifying the user:', err);
   setError(true);
   setErrorMsg(err.message || 'An error occurred while verifying the user');
  } finally {
   setIsLoading(false);
  }
 };

 const sendManagerInvitation = async (invitedEmail) => {
  setIsLoading(true);
  setError(false);
  setErrorMsg('');

  try {
   // Get the stored user object which should contain the ID
   const userObj = JSON.parse(localStorage.getItem('user'));

   if (!userObj || !userObj.id) {
    throw new Error('User information not available');
   }

   // Create request with client ID directly in the request body
   // This bypasses token-based authentication entirely
   const response = await axios.post(
    '/api/v1/manager-invitations/invite-direct',
    {
     invitedEmail,
     clientId: userObj.id,
     // Include other identifiers to help validate on the backend
     email: userObj.email,
    }
   );

   setSuccess(true);
   return response.data;
  } catch (error) {
   console.error('Manager invitation error:', error);
   setError(true);
   setErrorMsg(error.response?.data?.error || 'Failed to send invitation');
   throw error;
  } finally {
   setIsLoading(false);
  }
 };

 const verifyManagerInvitation = async (token) => {
  setSuccess(false);
  setError(false);
  setErrorMsg('');
  try {
   const response = await axios.get(
    `/api/v1/manager-invitations/verify/${token}`
   );
   setSuccess(true);
   return response.data;
  } catch (error) {
   const errorMessage =
    error.response?.data?.error || t('managers.messages.verifationFailed');
   setError(errorMessage);
   throw error;
  } finally {
   setIsLoading(false);
  }
 };

 const acceptManagerInvitation = async (token, userData) => {
  setSuccess(false);
  setError(false);
  setErrorMsg('');
  try {
   const response = await axios.post(
    `/api/v1/manager-invitations/accept/${token}`,
    userData,
    {
     headers: {
      'Content-Type': 'application/json',
     },
    }
   );
   // Check if the response indicates success
   if (response.data && response.status >= 200 && response.status < 300) {
    setSuccess(true);
    return response.data;
   }
   // If we get here, something went wrong
   throw new Error(response.data?.error || 'Failed to accept invitation');
  } catch (error) {
   // Handle different types of errors
   if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const errorMessage =
     error.response.data?.error ||
     error.response.data?.details ||
     error.message;
    setError(true);
    setErrorMsg(errorMessage);
    throw error;
   } else if (error.request) {
    // The request was made but no response was received
    setError(true);
    setErrorMsg('No response received from server');
    throw new Error('No response received from server');
   } else {
    // Something happened in setting up the request that triggered an Error
    setError(true);
    setErrorMsg(error.message);
    throw error;
   }
  } finally {
   setIsLoading(false);
  }
 };

 const verifyUserPassword = async (email, password) => {
  setIsLoading(true);
  setError(false);
  setErrorMsg('');

  try {
   const response = await axios.post('/api/v1/users/verify-password', {
    email,
    password,
   });

   setIsLoading(false);
   return response.data.verified === true;
  } catch (err) {
   setError(true);
   setErrorMsg(
    err.response?.data?.message || 'Erreur de vérification du mot de passe'
   );
   setIsLoading(false);
   return false;
  }
 };

 const getPendingManagerInvitations = async (clientId) => {
  try {
   const response = await axios.get(
    `/api/v1/manager-invitations/pending/${clientId}`
   );
   return response.data;
  } catch (error) {
   console.error('Error fetching pending manager invitations:', error);
   return [];
  }
 };

 const resendManagerInvitation = async (invitationId) => {
  try {
   const response = await axios.post(
    `/api/v1/manager-invitations/resend/${invitationId}`
   );
   return response.data;
  } catch (error) {
   console.error('Error resending manager invitation:', error);
   throw error;
  }
 };

 return {
  isLoading,
  userData,
  Users,
  getUserData,
  getUserDataById,
  updateUser,
  updateAvatar,
  updatePassword,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
  fetchAllUsers,
  fetchUserById,
  deleteUserById,
  verifyUser,
  sendManagerInvitation,
  verifyManagerInvitation,
  acceptManagerInvitation,
  verifyUserPassword,
  getPendingManagerInvitations,
  resendManagerInvitation,
  success,
  error,
  errorMsg,
 };
};
