import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import useNotification from './useNotification';

const useProperty = () => {
 const [properties, setProperties] = useState([]);
 const [property, setProperty] = useState([]);
 const [pendingProperties, setPendingProperties] = useState([]);
 const [loading, setLoading] = useState(false);
 const [success, setSuccess] = useState(false);
 const [error, setError] = useState(null);
 const [numericId, setNumericId] = useState(null);

 const { createPropertyVerificationNotification } = useNotification();

 const apiBase = '/api/v1/properties';

 const getIdFromHash = async (hashId) => {
  setError(null);
  try {
   const response = await axios.get(`${apiBase}/hash/${hashId}`);
   setNumericId(response.data.id);
   return response.data.id;
  } catch (err) {
   console.error('Error fetching numeric ID:', err);
   setError(err.message || 'Failed to fetch property ID');
   return null;
  } finally {
  }
 };

 // Fetch all properties
 const fetchAllProperties = async () => {
  setError(null);
  try {
   const response = await axios.get(`${apiBase}`);
   setProperties(response.data);
  } catch (err) {
   console.error('Error fetching properties:', err);
   setError(err.message);
  } finally {
   setLoading(false);
  }
 };

 // Fetch properties by id
 const fetchProperty = async (id) => {
  setLoading(true);
  setError(null);
  try {
   const response = await axios.get(`${apiBase}/${id}`);
   const propertyData = response.data;

   // Parse JSON fields if they are strings
   if (propertyData) {
    const fieldsToCheck = [
     'photos',
     'basicEquipements',
     'safetyFeatures',
     'elements',
     'houseRules',
     'earlyCheckIn',
     'beforeCheckOut',
     'accessToProperty',
     'lateCheckOutPolicy',
    ];

    fieldsToCheck.forEach((field) => {
     if (typeof propertyData[field] === 'string') {
      try {
       propertyData[field] = JSON.parse(propertyData[field]);
      } catch (err) {
       console.warn(`Failed to parse ${field}, keeping as string`);
      }
     }
    });
   }
   setProperty(propertyData);
   return propertyData;
  } catch (error) {
   console.error('Error fetching property:', error);
   setError(error.message || 'Failed to fetch property');
   return null;
  } finally {
   setLoading(false);
  }
 };

 const fetchAvailablePropertiesForAssignment = async (clientId) => {
  setLoading(true);
  setError(null);

  try {
   const response = await axios.get(`${apiBase}/available/${clientId}`);

   if (response.status === 200) {
    return response.data;
   } else {
    throw new Error('Failed to fetch available properties');
   }
  } catch (error) {
   console.error('Error in fetchAvailablePropertiesForAssignment:', error);
   setError(error.message || 'Failed to fetch available properties');
   return [];
  } finally {
   setLoading(false);
  }
 };

 // Fetch properties by user id
 const fetchPropertiesbyClient = async (userId) => {
  setLoading(true);
  setError(null);
  try {
   const response = await axios.get(`${apiBase}/byclient/${userId}`);
   setProperties(response.data);
   return response.data;
  } catch (error) {
   console.error('Error fetching properties:', error);
  } finally {
   setLoading(false);
  }
 };

 // Fetch pending properties
 const fetchPendingProperties = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
   const response = await axios.get(`${apiBase}/pending`);
   setPendingProperties(response.data);
  } catch (err) {
   setError(err.message || 'Failed to fetch pending properties.');
  } finally {
   setLoading(false);
  }
 }, [apiBase]);

 // Verify a property
 const verifyProperty = async (userId, id, propertyName) => {
  setLoading(true);
  setError(null);
  try {
   const response = await axios.put(`${apiBase}/${id}/verify`);
   // Optimistically update the local state
   setPendingProperties((prev) => prev.filter((prop) => prop.id !== id));
   // Send notification
   if (response.data) {
    await createPropertyVerificationNotification(userId, id, propertyName);
   }

   return response.data;
  } catch (err) {
   setError(err.message || `Failed to verify property with ID: ${id}`);
  } finally {
   setLoading(false);
  }
 };

 // Toggle property publish status
 const toggleEnableProperty = async (id) => {
  setLoading(true);
  setError(null);
  try {
   await axios.put(`${apiBase}/${id}/toggleenable`);
   // Optionally, refresh the data or provide feedback to the user
  } catch (err) {
   setError(
    err.message || `Failed to toggle publish status for property ID: ${id}`
   );
  } finally {
   setLoading(false);
  }
 };

 // Bulk verify properties
 const bulkVerifyProperties = async (ids) => {
  setLoading(true);
  setError(null);
  try {
   // First, get all properties details
   const propertiesResponse = await Promise.all(
    ids.map((id) => axios.get(`/api/v1/properties/${id}`))
   );
   const properties = propertiesResponse.map((response) => response.data);

   const response = await axios.post(`${apiBase}/bulkVerify`, { ids });
   const { successful, failed } = response.data;

   // Optimistically update the state to remove successfully verified properties
   setPendingProperties((prev) =>
    prev.filter((prop) => !successful.some((success) => success.id === prop.id))
   );

   if (response.data) {
    await Promise.all(
     properties.map((property) =>
      createPropertyVerificationNotification(
       property.userId,
       property.id,
       property.name
      )
     )
    );
   }

   return { successful, failed }; // Return the results for further handling if needed
  } catch (err) {
   setError(err.message || 'Failed to bulk verify properties.');
   return null; // Return null to indicate failure
  } finally {
   setLoading(false);
  }
 };

 const deleteProperty = async (id) => {
  setLoading(true);
  setSuccess(false);
  setError(null);
  try {
   await axios.delete(`${apiBase}/${id}`);
   setSuccess(true);
  } catch (err) {
   console.error('Error deleting property:', err);
   setError(err);
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  fetchPendingProperties();
 }, [fetchPendingProperties]);

 return {
  properties,
  property,
  pendingProperties,
  loading,
  success,
  error,
  getIdFromHash,
  fetchAllProperties,
  fetchProperty,
  fetchAvailablePropertiesForAssignment,
  fetchPropertiesbyClient,
  fetchPendingProperties,
  verifyProperty,
  bulkVerifyProperties,
  toggleEnableProperty,
  deleteProperty,
 };
};

export default useProperty;
