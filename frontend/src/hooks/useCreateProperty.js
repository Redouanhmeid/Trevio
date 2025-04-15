import { useState } from 'react';

const useCreateProperty = () => {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);
 const [success, setSuccess] = useState(false);
 const [propertyId, setPropertyId] = useState(null);

 const createProperty = async (firstStepData) => {
  setLoading(true);
  try {
   const initialProperty = {
    name: firstStepData.name,
    description: firstStepData.description,
    type: firstStepData.type,
    latitude: firstStepData.latitude,
    longitude: firstStepData.longitude,
    placeName: firstStepData.placeName,
    clientId: firstStepData.clientId,
    // Optional fields from step 1
    airbnbUrl: firstStepData.airbnbUrl,
    bookingUrl: firstStepData.bookingUrl,
    // Default values for required fields in the model
    basicEquipements: [],
    price: null,
    capacity: null,
    rooms: null,
    beds: null,
    houseRules: [],
    checkInTime: '1970-01-01 00:00:00',
    earlyCheckIn: [],
    accessToProperty: [],
    guestAccessInfo: '',
    videoCheckIn: '',
    checkOutTime: '1970-01-01 00:00:00',
    lateCheckOutPolicy: [],
    beforeCheckOut: [],
    additionalCheckOutInfo: '',
    photos: [],
    frontPhoto: '',
    status: 'pending',
   };

   const response = await fetch('/api/v1/properties', {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    body: JSON.stringify(initialProperty),
   });

   const data = await response.json();

   if (!response.ok) {
    console.log(response);
    throw new Error(data.message || 'Failed to create property');
   }

   setPropertyId(data.id);
   setSuccess(true);
   return data;
  } catch (error) {
   setError(error.message);
   setSuccess(false);
   throw error;
  } finally {
   setLoading(false);
  }
 };

 return { loading, error, propertyId, success, createProperty };
};

export default useCreateProperty;
