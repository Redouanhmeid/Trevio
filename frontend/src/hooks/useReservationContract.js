import { useState } from 'react';
import axios from 'axios';

const useReservationContract = () => {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);

 const apiBase = '/api/v1/reservationcontract/';

 // Create a new contract
 const createContract = async (contractData) => {
  console.log(contractData);
  setLoading(true);
  setError(null);
  try {
   const response = await axios.post(`${apiBase}contracts`, contractData);
   return response.data;
  } catch (err) {
   setError(err.response?.data?.error || 'Failed to create contract');
   throw err;
  } finally {
   setLoading(false);
  }
 };

 // Update an existing contract
 const updateContract = async (contractId, updatedData) => {
  setLoading(true);
  setError(null);
  try {
   const response = await axios.put(
    `${apiBase}/contracts/${contractId}`,
    updatedData
   );
   return response.data;
  } catch (err) {
   setError(err.response?.data?.error || 'Failed to update contract');
   throw err;
  } finally {
   setLoading(false);
  }
 };

 // Update contract status
 const updateContractStatus = async (contractId, status) => {
  setLoading(true);
  setError(null);
  try {
   const response = await axios.patch(
    `${apiBase}contracts/${contractId}/status`,
    {
     status,
    }
   );
   return response.data;
  } catch (err) {
   setError(err.response?.data?.error || 'Failed to update contract status');
   throw err;
  } finally {
   setLoading(false);
  }
 };

 // Get contracts for a property
 const getContractsByProperty = async (propertyId) => {
  setLoading(true);
  setError(null);
  try {
   const response = await axios.get(`${apiBase}/properties/${propertyId}`);
   return response.data;
  } catch (err) {
   setError(err.response?.data?.error || 'Failed to fetch contracts');
   throw err;
  } finally {
   setLoading(false);
  }
 };

 // Get a single contract by ID
 const getContractById = async (contractId) => {
  setLoading(true);
  setError(null);
  try {
   const response = await axios.get(`${apiBase}/contracts/${contractId}`);
   return response.data;
  } catch (err) {
   setError(err.response?.data?.error || 'Failed to fetch contract');
   throw err;
  } finally {
   setLoading(false);
  }
 };

 const getContractByReservationId = async (reservationId) => {
  setLoading(true);
  setError(null);
  try {
   const response = await axios.get(
    `${apiBase}/reservation/${reservationId}/contract`
   );
   return response.data;
  } catch (err) {
   // If it's a 404, it means no contract exists yet - this might be expected
   if (err.response?.status === 404) {
    return null;
   }
   setError(
    err.response?.data?.error || 'Failed to fetch contract for this reservation'
   );
   throw err;
  } finally {
   setLoading(false);
  }
 };
 // Get a single contract by hashId
 const getContractByHash = async (hashId) => {
  setLoading(true);
  setError(null);
  try {
   const response = await axios.get(`${apiBase}/contracts/hash/${hashId}`);
   return response.data;
  } catch (err) {
   setError(err.response?.data?.error || 'Failed to fetch contract');
   throw err;
  } finally {
   setLoading(false);
  }
 };

 // Check property availability
 const checkAvailability = async (propertyId, checkInDate, checkOutDate) => {
  setLoading(true);
  setError(null);
  try {
   const response = await axios.get(
    `${apiBase}/properties/${propertyId}/availability`,
    {
     params: {
      startDate: checkInDate.format('YYYY-MM-DD'),
      endDate: checkOutDate.format('YYYY-MM-DD'),
     },
    }
   );
   return response.data;
  } catch (err) {
   setError(err.response?.data?.error || 'Failed to check availability');
   throw err;
  } finally {
   setLoading(false);
  }
 };

 // Delete a contract
 const deleteContract = async (contractId) => {
  setLoading(true);
  setError(null);
  try {
   await axios.delete(`${apiBase}/contracts/${contractId}`);
   return true;
  } catch (err) {
   setError(err.response?.data?.error || 'Failed to delete contract');
   throw err;
  } finally {
   setLoading(false);
  }
 };

 return {
  loading,
  error,
  createContract,
  updateContract,
  updateContractStatus,
  getContractsByProperty,
  getContractByReservationId,
  getContractById,
  getContractByHash,
  checkAvailability,
  deleteContract,
 };
};

export default useReservationContract;
