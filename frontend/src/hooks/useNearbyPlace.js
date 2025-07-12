import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = '/api/v1/nearbyplaces';

const useNearbyPlace = () => {
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 // 1. Get all nearby places
 const getAllNearbyPlaces = async () => {
  try {
   const response = await axios.get(`${API_BASE_URL}`);
   return response.data;
  } catch (err) {
   setError(err);
   throw err;
  } finally {
   setLoading(false);
  }
 };

 // 2. Get a nearby place by ID
 const getNearbyPlaceById = async (id) => {
  try {
   const response = await axios.get(`${API_BASE_URL}/${id}`);
   return response.data;
  } catch (err) {
   setError(err);
   throw err;
  } finally {
   setLoading(false);
  }
 };

 // 3. Create a new nearby place
 const createNearbyPlace = async (placeData) => {
  setLoading(false);
  try {
   const response = await axios.post(`${API_BASE_URL}`, placeData);
   return response.data;
  } catch (err) {
   setError(err);
   throw err;
  } finally {
   setLoading(true);
  }
 };

 // 4. Update a nearby place by ID
 const updateNearbyPlace = async (id, placeData) => {
  setLoading(false);
  try {
   const response = await axios.put(`${API_BASE_URL}/${id}`, placeData);
   return response.data;
  } catch (err) {
   setError(err);
   throw err;
  } finally {
   setLoading(true);
  }
 };

 // 5. Delete a nearby place by ID
 const deleteNearbyPlace = async (id) => {
  setLoading(false);
  try {
   await axios.delete(`${API_BASE_URL}/${id}`);
   return true;
  } catch (err) {
   setError(err);
   throw err;
  } finally {
   setLoading(true);
  }
 };

 // 6. Get nearby places by latitude and longitude
 const getNearbyPlacesByLatLon = async (lat, lon) => {
  try {
   const response = await axios.get(`${API_BASE_URL}/nearby-places`, {
    params: {
     latitude: lat,
     longitude: lon,
    },
   });
   return response.data;
  } catch (err) {
   setError("Aucun lieu à proximité n'est enregistré");
   throw err;
  } finally {
   setLoading(false);
  }
 };

 // Verify a nearby place
 const verifyNearbyPlace = async (id) => {
  setLoading(true);
  setError(null);
  try {
   const response = await axios.put(`${API_BASE_URL}/${id}/verify`);
   return response.data;
  } catch (err) {
   setError(err.message || `Failed to verify nearby place with ID: ${id}`);
  } finally {
   setLoading(false);
  }
 };

 // Bulk verify properties
 const bulkVerifyNearbyPlaces = async (ids) => {
  setLoading(true);
  setError(null);
  try {
   const response = await axios.post(`${API_BASE_URL}/bulkVerify`, { ids });
   const { successful, failed } = response.data;

   return { successful, failed }; // Return the results for further handling if needed
  } catch (err) {
   setError(err.message || 'Failed to bulk verify nearby places.');
   return null; // Return null to indicate failure
  } finally {
   setLoading(false);
  }
 };

 return {
  loading,
  error,
  getAllNearbyPlaces,
  getNearbyPlaceById,
  createNearbyPlace,
  updateNearbyPlace,
  deleteNearbyPlace,
  getNearbyPlacesByLatLon,
  verifyNearbyPlace,
  bulkVerifyNearbyPlaces,
 };
};

export default useNearbyPlace;
