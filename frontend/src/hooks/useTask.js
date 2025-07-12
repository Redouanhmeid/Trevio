// hooks/useTask.js
import { useState } from 'react';
import axios from 'axios';

const useTask = () => {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);

 const apiBase = '/api/v1/propertytask';

 const getPropertyTasks = async (propertyId, filters = {}) => {
  setLoading(true);
  try {
   let url = `${apiBase}/property/${propertyId}/tasks`;
   const queryParams = new URLSearchParams();

   // Add filters if they exist
   if (filters.status) queryParams.append('status', filters.status);
   if (filters.priority) queryParams.append('priority', filters.priority);
   if (filters.startDate) queryParams.append('startDate', filters.startDate);
   if (filters.endDate) queryParams.append('endDate', filters.endDate);

   if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
   }

   const response = await axios.get(url);
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 const getTask = async (id) => {
  setLoading(true);
  try {
   const response = await axios.get(`${apiBase}/tasks/${id}`);
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 const getUserTasks = async (userId) => {
  setLoading(true);
  try {
   let url = `${apiBase}/user/${userId}/tasks`;
   const response = await axios.get(url);
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 const createTask = async (taskData) => {
  setLoading(true);
  try {
   const response = await axios.post(`${apiBase}/tasks`, taskData);
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 const updateTask = async (id, taskData) => {
  setLoading(true);
  try {
   const response = await axios.put(`${apiBase}/tasks/${id}`, taskData);
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 const updateTaskStatus = async (id, status) => {
  setLoading(true);
  try {
   const response = await axios.patch(`${apiBase}/tasks/${id}/status`, {
    status,
   });
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 const deleteTask = async (id) => {
  setLoading(true);
  try {
   const response = await axios.delete(`${apiBase}/tasks/${id}`);
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 const getUserPropertyTasks = async (userId) => {
  setLoading(true);
  try {
   const response = await axios.get(`${apiBase}/user/${userId}/all-tasks`);
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
  getPropertyTasks,
  getTask,
  getUserTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getUserPropertyTasks,
 };
};

export default useTask;
