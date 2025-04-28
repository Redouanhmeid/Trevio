// hooks/useRevenue.js
import { useState } from 'react';
import axios from 'axios';

const useRevenue = () => {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);

 const apiBase = '/api/v1/propertyrevenue';

 const getPropertyRevenue = async (propertyId, year, month) => {
  setLoading(true);
  try {
   let url = `${apiBase}/property/${propertyId}/revenue`;
   if (year) url += `?year=${year}`;
   if (month) url += `${year ? '&' : '?'}month=${month}`;

   const response = await axios.get(url);
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 const getAnnualRevenue = async (propertyId, year) => {
  setLoading(true);
  try {
   const response = await axios.get(
    `${apiBase}/property/${propertyId}/annual-revenue/${year}`
   );
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 const addRevenue = async (revenueData) => {
  setLoading(true);
  try {
   const response = await axios.post(`${apiBase}/revenue`, revenueData);
   return response.data;
  } catch (error) {
   if (error.response?.status === 400) {
    setError(error.response.data.error);
   } else {
    setError(error);
   }
   return null;
  } finally {
   setLoading(false);
  }
 };

 const updateRevenue = async (id, revenueData) => {
  setLoading(true);
  try {
   const response = await axios.put(`${apiBase}/revenue/${id}`, revenueData);
   return response.data;
  } catch (error) {
   setError(error.response.data.error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 const deleteRevenue = async (id) => {
  setLoading(true);
  try {
   const response = await axios.delete(`${apiBase}/revenue/${id}`);
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 const createRevenueFromReservation = async (reservationId, revenueData) => {
  setLoading(true);
  try {
   const response = await axios.post(
    `${apiBase}/reservation/${reservationId}/revenue`,
    revenueData
   );
   console.log(response);
   return response.data;
  } catch (error) {
   setError(error.response?.data?.error || error.message);
   return null;
  } finally {
   setLoading(false);
  }
 };

 return {
  loading,
  error,
  getPropertyRevenue,
  getAnnualRevenue,
  addRevenue,
  updateRevenue,
  deleteRevenue,
  createRevenueFromReservation,
 };
};

export default useRevenue;
