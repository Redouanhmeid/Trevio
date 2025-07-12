import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from '../context/TranslationContext';

const useServiceWorker = () => {
 const { t } = useTranslation();
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);
 const [serviceWorkers, setServiceWorkers] = useState([]);

 const apiBase = '/api/v1/serviceworkers';

 // Get all service workers for a property (admin/owner/concierge view)
 const getPropertyServiceWorkers = async (propertyId) => {
  setLoading(true);
  setError(null);
  try {
   const response = await axios.get(`${apiBase}/property/${propertyId}`);
   setServiceWorkers(response.data);
   return response.data;
  } catch (error) {
   const errorMsg =
    error.response?.data?.error || 'Failed to fetch service workers';
   setError(errorMsg);
   console.error(errorMsg);
   return [];
  } finally {
   setLoading(false);
  }
 };

 // Get service workers visible to guests
 const getGuestVisibleServiceWorkers = async (propertyId) => {
  setLoading(true);
  setError(null);
  try {
   const response = await axios.get(`${apiBase}/property/${propertyId}/guest`);
   setServiceWorkers(response.data);
   return response.data;
  } catch (error) {
   const errorMsg =
    error.response?.data?.error || 'Failed to fetch service workers';
   setError(errorMsg);
   console.error(errorMsg);
   return [];
  } finally {
   setLoading(false);
  }
 };

 // Get a single service worker by ID
 const getServiceWorker = async (id) => {
  setLoading(true);
  setError(null);
  try {
   const response = await axios.get(`${apiBase}/${id}`);
   return response.data;
  } catch (error) {
   const errorMsg =
    error.response?.data?.error || 'Failed to fetch service worker';
   setError(errorMsg);
   console.error(errorMsg);
   return null;
  } finally {
   setLoading(false);
  }
 };

 // Create a new service worker
 const createServiceWorker = async (workerData) => {
  console.log(workerData);
  setLoading(true);
  setError(null);
  try {
   const response = await axios.post(apiBase, workerData);
   return response.data;
  } catch (error) {
   const errorMsg =
    error.response?.data?.error || 'Failed to create service worker';
   setError(errorMsg);
   console.error(errorMsg);
   return null;
  } finally {
   setLoading(false);
  }
 };

 // Bulk create service workers
 const bulkCreateServiceWorkers = async (propertyId, workers) => {
  setLoading(true);
  setError(null);
  try {
   const response = await axios.post(`${apiBase}/bulk`, {
    propertyId,
    workers,
   });
   return response.data;
  } catch (error) {
   const errorMsg =
    error.response?.data?.error || 'Failed to create service workers';
   setError(errorMsg);
   console.error(errorMsg);
   return null;
  } finally {
   setLoading(false);
  }
 };

 // Update a service worker
 const updateServiceWorker = async (id, workerData) => {
  setLoading(true);
  setError(null);
  try {
   const response = await axios.put(`${apiBase}/${id}`, workerData);
   return response.data;
  } catch (error) {
   const errorMsg =
    error.response?.data?.error || 'Failed to update service worker';
   setError(errorMsg);
   console.error(errorMsg);
   return null;
  } finally {
   setLoading(false);
  }
 };

 // Delete a service worker
 const deleteServiceWorker = async (id) => {
  setLoading(true);
  setError(null);
  try {
   const response = await axios.delete(`${apiBase}/${id}`);
   return response.data;
  } catch (error) {
   const errorMsg =
    error.response?.data?.error || 'Failed to delete service worker';
   setError(errorMsg);
   console.error(errorMsg);
   return null;
  } finally {
   setLoading(false);
  }
 };

 return {
  loading,
  error,
  serviceWorkers,
  getPropertyServiceWorkers,
  getGuestVisibleServiceWorkers,
  getServiceWorker,
  createServiceWorker,
  bulkCreateServiceWorkers,
  updateServiceWorker,
  deleteServiceWorker,
 };
};

export default useServiceWorker;
