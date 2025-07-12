// hooks/useManager.js
import { useState } from 'react';
import axios from 'axios';
import { useAuthContext } from '../hooks/useAuthContext';
import { useTranslation } from '../context/TranslationContext';
import { useNavigate } from 'react-router-dom';

const useManager = () => {
 const { t } = useTranslation();
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);
 const { dispatch } = useAuthContext();
 const apiBase = '/api/v1/managers';
 const navigate = useNavigate();

 // Get all managers for a specific user
 const getUserManagers = async (userId) => {
  setLoading(true);
  try {
   const response = await axios.get(`${apiBase}/users/${userId}/managers`);
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 // Get a specific manager
 const getManager = async (id) => {
  setLoading(true);
  try {
   const response = await axios.get(`${apiBase}/${id}`);
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 // Create a new manager (send invitation)
 const createManager = async (managerData) => {
  setLoading(true);
  try {
   const response = await axios.post(`${apiBase}/`, managerData);
   return response.data;
  } catch (error) {
   setError(
    error.response?.data?.error || t('managers.messages.failedInvitation')
   );
   throw error;
  } finally {
   setLoading(false);
  }
 };

 // Verify manager and complete profile
 const verifyManager = async (token, profileData = null) => {
  setLoading(true);
  try {
   if (profileData) {
    // If profileData is provided, it's a profile completion request (POST)
    const response = await axios.post(
     `${apiBase}/verify/${token}`,
     profileData
    );
    return response.data;
   } else {
    // If no profileData, it's a token verification request (GET)
    const response = await axios.get(`${apiBase}/verify/${token}`);
    return response.data;
   }
  } catch (error) {
   const errorMessage =
    error.response?.data?.error || t('managers.messages.verifationFailed');
   setError(errorMessage);
   throw error;
  } finally {
   setLoading(false);
  }
 };

 // Update manager information
 const updateManager = async (id, managerData) => {
  setLoading(true);
  try {
   const response = await axios.put(`${apiBase}/${id}`, managerData);
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 // Delete a manager
 const deleteManager = async (id) => {
  setLoading(true);
  try {
   const response = await axios.delete(`${apiBase}/${id}`);
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 // Manager login
 const loginManager = async (email, password) => {
  setLoading(true);
  setError(null);
  try {
   const response = await axios.post(`${apiBase}/login`, { email, password });
   const userData = { ...response.data, role: 'manager' };
   localStorage.setItem('user', JSON.stringify(userData));
   dispatch({ type: 'LOGIN', payload: userData });
   navigate('/manager/dashboard');
   return userData;
  } catch (error) {
   setError(error.response?.data?.error || t('managers.messages.failedLogin'));
   throw error;
  } finally {
   setLoading(false);
  }
 };

 // Property Assignment Functions
 const assignProperty = async (managerId, propertyId) => {
  setLoading(true);
  try {
   const response = await axios.post(`${apiBase}/manager-properties`, {
    managerId,
    propertyId,
   });
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 const getManagerProperties = async (managerId) => {
  setLoading(true);
  try {
   const response = await axios.get(`${apiBase}/${managerId}/properties`);
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 const updateAssignment = async (assignmentId, status) => {
  setLoading(true);
  try {
   const response = await axios.put(
    `${apiBase}/manager-properties/${assignmentId}`,
    {
     status,
    }
   );
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 const removeAssignment = async (assignmentId) => {
  setLoading(true);
  try {
   const response = await axios.delete(
    `${apiBase}/manager-properties/${assignmentId}`
   );
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 return {
  loading,
  error,
  // Manager operations
  getUserManagers,
  getManager,
  createManager,
  verifyManager,
  updateManager,
  deleteManager,
  loginManager,
  // Property assignment operations
  assignProperty,
  getManagerProperties,
  updateAssignment,
  removeAssignment,
 };
};

export default useManager;
