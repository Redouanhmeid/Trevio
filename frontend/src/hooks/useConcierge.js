import { useState } from 'react';
import axios from 'axios';

export const useConcierge = () => {
 const [concierges, setConcierges] = useState([]);
 const [error, setError] = useState(null);
 const [isLoading, setIsLoading] = useState(false);

 // Get all concierges for a client
 const getClientConcierges = async (clientId) => {
  setIsLoading(true);
  setError(null);
  try {
   const response = await axios.get(`/api/v1/concierges/client/${clientId}`);
   setConcierges(response.data);
   return response.data;
  } catch (err) {
   setError(err.response?.data?.error || 'Failed to fetch concierges');
   return [];
  } finally {
   setIsLoading(false);
  }
 };

 // Add a new concierge assignment
 const assignConcierge = async (clientId, conciergeId, propertyId) => {
  setIsLoading(true);
  setError(null);
  try {
   const response = await axios.post('/api/v1/concierges/assign', {
    clientId,
    conciergeId,
    propertyId,
   });
   await getClientConcierges(clientId); // Refresh the list
   return response.data;
  } catch (err) {
   setError(err.response?.data?.error || 'Failed to assign concierge');
   throw err;
  } finally {
   setIsLoading(false);
  }
 };

 // Remove concierge assignment
 const removeConcierge = async (clientId, conciergeId, propertyId) => {
  setIsLoading(true);
  setError(null);
  try {
   await axios.delete('/api/v1/concierges/unassign', {
    data: { clientId, conciergeId, propertyId },
   });
   await getClientConcierges(clientId); // Refresh the list
  } catch (err) {
   setError(err.response?.data?.error || 'Failed to remove concierge');
   throw err;
  } finally {
   setIsLoading(false);
  }
 };

 // Update concierge assignment status
 const updateConciergeStatus = async (assignmentId, status) => {
  setIsLoading(true);
  setError(null);
  try {
   const response = await axios.patch(
    `/api/v1/concierges/status/${assignmentId}`,
    {
     status,
    }
   );
   return response.data;
  } catch (err) {
   setError(err.response?.data?.error || 'Failed to update status');
   throw err;
  } finally {
   setIsLoading(false);
  }
 };

 // Get concierge details
 const getConciergeDetails = async (conciergeId) => {
  setIsLoading(true);
  setError(null);
  try {
   const response = await axios.get(`/api/v1/concierges/${conciergeId}`);
   return response.data;
  } catch (err) {
   setError(err.response?.data?.error || 'Failed to fetch concierge details');
   throw err;
  } finally {
   setIsLoading(false);
  }
 };

 // Get managed properties for a concierge
 const getConciergeProperties = async (conciergeId) => {
  setIsLoading(true);
  setError(null);
  try {
   const response = await axios.get(
    `/api/v1/concierges/${conciergeId}/properties`
   );
   return response.data;
  } catch (err) {
   setError(
    err.response?.data?.error || 'Failed to fetch concierge properties'
   );
   throw err;
  } finally {
   setIsLoading(false);
  }
 };

 return {
  concierges,
  error,
  isLoading,
  getClientConcierges,
  assignConcierge,
  removeConcierge,
  updateConciergeStatus,
  getConciergeDetails,
  getConciergeProperties,
 };
};
