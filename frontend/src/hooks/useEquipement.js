import { useState } from 'react';
import axios from 'axios';

const useEquipement = () => {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);

 const getAllEquipements = async (propertyId) => {
  setLoading(true);
  try {
   const response = await axios.get(`/api/v1/equipments/${propertyId}`);
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 const getOneEquipement = async (id) => {
  setLoading(true);
  try {
   const response = await axios.get(`/api/v1/equipments/one/${id}`);
   setLoading(false);
   return response.data;
  } catch (error) {
   setLoading(false);
   setError(error);
   return null;
  }
 };

 const postEquipement = async (equipementData) => {
  setLoading(true);
  try {
   const response = await axios.post(`/api/v1/equipments/`, equipementData);
   setLoading(false);
   return response.data;
  } catch (error) {
   setLoading(false);
   setError(error);
   return null;
  }
 };

 const updateEquipement = async (equipementData) => {
  try {
   const response = await axios.put(
    `/api/v1/equipments/${equipementData.id}`,
    equipementData
   );
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  }
 };

 const deleteEquipement = async (id) => {
  setLoading(true);
  try {
   const response = await axios.delete(`/api/v1/equipments/${id}`);
   setLoading(false);
   return response.data;
  } catch (error) {
   setLoading(false);
   setError(error);
   return null;
  }
 };

 return {
  loading,
  error,
  getAllEquipements,
  getOneEquipement,
  postEquipement,
  updateEquipement,
  deleteEquipement,
 };
};

export default useEquipement;
