import { useState } from 'react';
import { message } from 'antd';
import axios from 'axios';
import { useTranslation } from '../context/TranslationContext';

export const useReservation = () => {
 const { t } = useTranslation();
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);
 const [reservations, setReservations] = useState([]);
 const [reservation, setReservation] = useState(null);
 const [contract, setContract] = useState(null);

 // Fetch all reservations
 const fetchReservations = async (userId) => {
  if (!userId) {
   console.error('userId is required for fetchReservations');
   return [];
  }

  setLoading(true);
  setError(null);
  try {
   // Fetch reservations as client (properties they own)
   const clientResponse = await fetch(`/api/v1/reservations/client/${userId}`);
   const clientData = await clientResponse.json();

   // Fetch reservations as concierge (properties they manage)
   const conciergeResponse = await fetch(
    `/api/v1/reservations/concierge/${userId}`
   );
   const conciergeData = await conciergeResponse.json();

   if (!clientResponse.ok) {
    throw new Error(
     `Failed to fetch client reservations: ${
      clientData.error || 'Unknown error'
     }`
    );
   }

   if (!conciergeResponse.ok) {
    throw new Error(
     `Failed to fetch concierge reservations: ${
      conciergeData.error || 'Unknown error'
     }`
    );
   }

   // Combine the results, ensuring no duplicates by using a Map with reservation ID as key
   const reservationMap = new Map();

   // Add client reservations to the map
   clientData.forEach((reservation) => {
    reservationMap.set(reservation.id, { ...reservation, source: 'client' });
   });

   // Add concierge reservations to the map (will overwrite if same ID exists)
   conciergeData.forEach((reservation) => {
    if (!reservationMap.has(reservation.id)) {
     reservationMap.set(reservation.id, {
      ...reservation,
      source: 'concierge',
     });
    }
   });

   // Convert map values back to array
   const combinedReservations = Array.from(reservationMap.values());

   // Sort by most recent first
   combinedReservations.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
   );

   setReservations(combinedReservations);
   return combinedReservations;
  } catch (error) {
   setError(error.message);
   return [];
  } finally {
   setLoading(false);
  }
 };

 // Fetch reservations for properties owned by a client
 const fetchClientReservations = async (clientId) => {
  setLoading(true);
  setError(null);
  try {
   // This could be a backend endpoint like `/api/v1/reservations/client/${clientId}`
   // For now, we'll fetch all and filter client-side
   const response = await fetch('/api/v1/reservations');
   const allData = await response.json();

   if (!response.ok) {
    throw new Error(allData.error || 'Failed to fetch reservations');
   }

   // Filter to only include reservations for properties owned by this client
   const clientReservations = allData.filter(
    (reservation) =>
     reservation.property && reservation.property.clientId === clientId
   );

   setReservations(clientReservations);
   return clientReservations;
  } catch (error) {
   setError(error.message);
   message.error(t('reservation.fetchError'));
   return [];
  } finally {
   setLoading(false);
  }
 };

 // Fetch reservations for properties assigned to a concierge
 const fetchConciergeReservations = async (
  conciergeId,
  assignedPropertyIds = []
 ) => {
  setLoading(true);
  setError(null);
  try {
   // This could be a backend endpoint in the future
   // For now, we'll fetch all and filter client-side
   const response = await fetch('/api/v1/reservations');
   const allData = await response.json();

   if (!response.ok) {
    throw new Error(allData.error || 'Failed to fetch reservations');
   }

   // Filter to only include reservations for properties assigned to this concierge
   const conciergeReservations = allData.filter(
    (reservation) =>
     reservation.property &&
     assignedPropertyIds.includes(reservation.property.id)
   );

   setReservations(conciergeReservations);
   return conciergeReservations;
  } catch (error) {
   setError(error.message);
   message.error(t('reservation.fetchError'));
   return [];
  } finally {
   setLoading(false);
  }
 };

 // Fetch a single reservation by ID
 const fetchReservation = async (id) => {
  setLoading(true);
  setError(null);
  try {
   const response = await fetch(`/api/v1/reservations/${id}`);
   const data = await response.json();

   if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch reservation');
   }

   setReservation(data);
   return data;
  } catch (error) {
   setError(error.message);
   message.error(t('reservation.fetchError'));
   return null;
  } finally {
   setLoading(false);
  }
 };

 // Fetch reservation by hash ID
 const fetchReservationByHash = async (hashId) => {
  setLoading(true);
  setError(null);
  try {
   const response = await fetch(`/api/v1/reservations/hash/${hashId}`);
   const data = await response.json();

   if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch reservation');
   }

   setReservation(data);
   return data;
  } catch (error) {
   setError(error.message);
   message.error(t('reservation.fetchError'));
   return null;
  } finally {
   setLoading(false);
  }
 };

 // Fetch reservations by property ID
 const fetchReservationsByProperty = async (propertyId) => {
  setLoading(true);
  setError(null);
  try {
   const response = await fetch(`/api/v1/reservations/property/${propertyId}`);
   const data = await response.json();

   if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch property reservations');
   }

   setReservations(data);
   return data;
  } catch (error) {
   setError(error.message);
   message.error(t('reservation.fetchError'));
   return [];
  } finally {
   setLoading(false);
  }
 };

 // Create a new reservation
 const createReservation = async (reservationData) => {
  setLoading(true);
  setError(null);
  try {
   const response = await fetch('/api/v1/reservations', {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    body: JSON.stringify(reservationData),
   });
   const data = await response.json();

   if (!response.ok) {
    throw new Error(data.error || 'Failed to create reservation');
   }
   setReservation(data);
   return data;
  } catch (error) {
   setError(error.message);
   return null;
  } finally {
   setLoading(false);
  }
 };

 // Send reservation to guest
 const sendToGuest = async (reservationId) => {
  setLoading(true);
  setError(null);
  try {
   const response = await fetch(`/api/v1/reservations/${reservationId}/send`, {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
   });
   const data = await response.json();

   if (!response.ok) {
    if (
     response.status === 400 &&
     data.error &&
     data.error.includes('date conflict')
    ) {
     message.info(
      'Cannot send to guest due to date conflict with existing reservations'
     );
    } else {
     message.error(t('reservation.sentToGuestError'));
    }
    throw new Error(data.error || 'Failed to send reservation to guest');
   }
   // After successful sending, refresh the reservation data
   await fetchReservation(reservationId);

   // Also refresh the contract data if you need it
   if (getReservationContract) {
    await getReservationContract(reservationId);
   }
   return data;
  } catch (error) {
   setError(error.message);
   return null;
  } finally {
   setLoading(false);
  }
 };

 // Generate contract for a reservation
 const generateContract = async (id) => {
  setLoading(true);
  setError(null);
  console.log(id);
  try {
   const response = await fetch(
    `/api/v1/reservations/${id}/generate-contract`,
    {
     method: 'POST',
     headers: {
      'Content-Type': 'application/json',
     },
    }
   );

   const data = await response.json();

   if (!response.ok) {
    throw new Error(data.error || 'Failed to generate contract');
   }

   setContract(data);
   message.success(t('reservation.contractGeneratedSuccess'));
   return data;
  } catch (error) {
   setError(error.message);
   message.error(t('reservation.contractGeneratedError'));
   return null;
  } finally {
   setLoading(false);
  }
 };

 // Get contract for a reservation
 const getReservationContract = async (id) => {
  setLoading(true);
  setError(null);
  try {
   const response = await fetch(`/api/v1/reservations/${id}/contract`);

   // If 404, it means no contract exists yet
   if (response.status === 404) {
    setContract(null);
    return null;
   }

   const data = await response.json();

   if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch contract');
   }

   setContract(data);
   return data;
  } catch (error) {
   // Don't treat 404 as an error
   if (error.message !== 'Failed to fetch contract') {
    setError(error.message);
    message.error(t('reservation.fetchContractError'));
   }
   return null;
  } finally {
   setLoading(false);
  }
 };

 // Update reservation status
 const updateReservationStatus = async (id, status) => {
  setLoading(true);
  setError(null);
  try {
   const response = await fetch(`/api/v1/reservations/${id}/status`, {
    method: 'PUT',
    headers: {
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
   });

   const data = await response.json();

   if (!response.ok) {
    throw new Error(data.error || 'Failed to update reservation status');
   }

   // Update the reservation in state if it exists
   if (reservation && reservation.id === id) {
    setReservation({ ...reservation, status });
   }

   return data;
  } catch (error) {
   setError(error.message);
   message.error(t('reservation.statusUpdateError'));
   return null;
  } finally {
   setLoading(false);
  }
 };

 // Delete reservation
 const deleteReservation = async (id) => {
  setLoading(true);
  setError(null);
  try {
   const response = await fetch(`/api/v1/reservations/${id}`, {
    method: 'DELETE',
   });

   if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to delete reservation');
   }

   // Update the reservations list if it exists
   if (reservations.length > 0) {
    setReservations(reservations.filter((r) => r.id !== id));
   }

   return true;
  } catch (error) {
   setError(error.message);
   message.error(t('reservation.deleteError'));
   return false;
  } finally {
   setLoading(false);
  }
 };

 // Create revenue from a reservation
 const createRevenue = async (reservationId, revenueData) => {
  setLoading(true);
  setError(null);
  try {
   const response = await fetch('/api/v1/propertyrevenue', {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({
     propertyId: revenueData.propertyId,
     amount: revenueData.amount,
     month: revenueData.month,
     year: revenueData.year,
     notes: revenueData.notes,
     reservationId: reservationId,
     createdBy: revenueData.createdBy || null,
    }),
   });

   const data = await response.json();

   if (!response.ok) {
    throw new Error(data.error || 'Failed to create revenue');
   }

   message.success(t('revenue.createSuccess'));
   return data;
  } catch (error) {
   setError(error.message);
   message.error(t('revenue.createError'));
   return null;
  } finally {
   setLoading(false);
  }
 };

 // Check dates availability
 const checkAvailability = async (
  propertyId,
  startDate,
  endDate,
  excludeReservationId = null
 ) => {
  setLoading(true);
  setError(null);
  try {
   // Use the new endpoint in the ReservationController
   const response = await axios.get(
    `/api/v1/reservations/property/${propertyId}/check-availability`,
    {
     params: {
      startDate,
      endDate,
      excludeReservationId,
     },
    }
   );

   if (!response.data) {
    throw new Error('Invalid response from server');
   }

   return response.data;
  } catch (error) {
   setError(error.message || 'Failed to check availability');
   message.error(t('guestForm.error.checkAvailability'));
   return { available: false, error: error.message };
  } finally {
   setLoading(false);
  }
 };

 // Check if a reservation has a contract
 const checkReservationContract = async (reservationId) => {
  try {
   const response = await fetch(
    `/api/v1/reservations/${reservationId}/contract`
   );

   // If 404, it means no contract exists yet
   if (response.status === 404) {
    return null;
   }

   if (!response.ok) {
    throw new Error('Failed to fetch contract');
   }

   const contractData = await response.json();
   return contractData;
  } catch (error) {
   // Don't treat 404 as an error
   console.log('Contract check error:', error);
   return null;
  }
 };

 const generateRevenue = async (reservationId, revenueData) => {
  setLoading(true);
  setError(null);
  try {
   const response = await fetch(
    `/api/v1/reservations/${reservationId}/generate-revenue`,
    {
     method: 'POST',
     headers: {
      'Content-Type': 'application/json',
     },
     body: JSON.stringify(revenueData),
    }
   );

   const data = await response.json();

   if (!response.ok) {
    throw new Error(data.error || 'Failed to generate revenue');
   }

   message.success(t('revenue.createSuccess'));
   return data;
  } catch (error) {
   setError(error.message);
   message.error(t('revenue.createError'));
   return null;
  } finally {
   setLoading(false);
  }
 };

 const updateElectronicLock = async (reservationId, lockEnabled, lockCode) => {
  setLoading(true);
  setError(null);
  try {
   const response = await axios.patch(
    `/api/v1/reservations/${reservationId}/electronic-lock`,
    {
     electronicLockEnabled: lockEnabled,
     electronicLockCode: lockEnabled ? lockCode : null,
    }
   );

   const data = await response.data;

   if (!response.ok && !response.status.toString().startsWith('2')) {
    throw new Error(data.error || 'Failed to update electronic lock settings');
   }

   // Refresh the reservation data to get the updated lock settings
   if (reservation && reservation.id === reservationId) {
    await fetchReservation(reservationId);
   }

   message.success(
    lockEnabled
     ? t('reservation.lock.enableSuccess')
     : t('reservation.lock.disableSuccess')
   );
   return data;
  } catch (error) {
   setError(error.message);
   message.error(t('reservation.lock.updateError'));
   return null;
  } finally {
   setLoading(false);
  }
 };

 return {
  loading,
  error,
  reservations,
  reservation,
  contract,
  fetchReservations,
  fetchClientReservations,
  fetchConciergeReservations,
  fetchReservation,
  fetchReservationByHash,
  fetchReservationsByProperty,
  createReservation,
  sendToGuest,
  generateContract,
  getReservationContract,
  updateReservationStatus,
  deleteReservation,
  createRevenue,
  checkAvailability,
  checkReservationContract,
  generateRevenue,
  updateElectronicLock,
 };
};

export default useReservation;
