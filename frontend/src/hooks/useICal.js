import { useState } from 'react';
import axios from 'axios';

const useICal = () => {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);
 const [results, setResults] = useState(null);

 // Fetch iCal content from a specific URL
 const fetchICalContent = async (url) => {
  setLoading(true);
  setError(null);

  try {
   const response = await axios.post('/api/v1/icals/fetch-ical', { url });
   return response.data;
  } catch (err) {
   setError(err.response?.data?.error || 'Failed to fetch iCal content');
   throw err;
  } finally {
   setLoading(false);
  }
 };

 // Sync iCal reservations for a specific property
 const syncPropertyICalReservations = async (propertyId) => {
  setLoading(true);
  setError(null);

  try {
   const response = await axios.post(`/api/v1/icals/sync/${propertyId}`);

   setResults({
    successful: response.data.results?.successful || 0,
    failed: response.data.results?.failed || 0,
    total: response.data.results?.total || 0,
   });

   return response.data;
  } catch (err) {
   setError(err.response?.data?.error || 'Failed to sync iCal reservations');
   throw err;
  } finally {
   setLoading(false);
  }
 };

 // Sync all properties with iCal links
 const syncAllPropertiesICalReservations = async (properties) => {
  setLoading(true);
  setError(null);

  const syncResults = {
   successful: 0,
   failed: 0,
   newReservations: 0,
  };

  try {
   // Filter properties with iCal links
   const propertiesWithiCal = properties.filter(
    (p) =>
     p.iCalLinks &&
     Array.isArray(JSON.parse(p.iCalLinks)) &&
     JSON.parse(p.iCalLinks).length > 0
   );

   if (propertiesWithiCal.length === 0) {
    setResults(syncResults);
    return syncResults;
   }

   // Process each property with iCal links
   for (const property of propertiesWithiCal) {
    try {
     const iCalLinks = JSON.parse(property.iCalLinks);

     for (const link of iCalLinks) {
      try {
       // Fetch and sync reservations for this specific iCal link
       const syncResult = await syncPropertyICalReservations(property.id);

       syncResults.successful++;
       syncResults.newReservations += syncResult.results?.newReservations || 0;
      } catch (linkError) {
       syncResults.failed++;
       console.error(
        `Error syncing iCal for property ${property.id}:`,
        linkError
       );
      }
     }
    } catch (propertyError) {
     console.error(`Error processing property ${property.id}:`, propertyError);
     syncResults.failed++;
    }
   }

   setResults(syncResults);
   return syncResults;
  } catch (err) {
   setError(err.message || 'Failed to sync all properties');
   throw err;
  } finally {
   setLoading(false);
  }
 };

 // Parse iCal content (can be moved to a utility file if needed)
 const parseICalDates = (icalContent) => {
  const events = [];
  const lines = icalContent.split('\n');
  let currentEvent = null;

  for (const line of lines) {
   if (line.startsWith('BEGIN:VEVENT')) {
    currentEvent = {};
   } else if (line.startsWith('END:VEVENT')) {
    if (currentEvent) events.push(currentEvent);
    currentEvent = null;
   } else if (currentEvent) {
    // Handle multiline content with continued lines (lines starting with space)
    let processedLine = line;
    if (processedLine.startsWith(' ')) {
     // This is a continuation of the previous line
     if (events.length > 0 && events[events.length - 1].lastProperty) {
      const lastProp = events[events.length - 1].lastProperty;
      events[events.length - 1][lastProp] += processedLine.substring(1); // Remove the leading space
     }
     continue;
    }

    const colonIndex = processedLine.indexOf(':');
    if (colonIndex !== -1) {
     const key = processedLine.substring(0, colonIndex);
     const value = processedLine.substring(colonIndex + 1);

     if (key === 'DTSTART;VALUE=DATE' || key === 'DTSTART') {
      currentEvent.start = value;
     } else if (key === 'DTEND;VALUE=DATE' || key === 'DTEND') {
      currentEvent.end = value;
     } else if (key === 'SUMMARY') {
      currentEvent.summary = value;
     } else if (key === 'UID') {
      currentEvent.uid = value;
     }

     // Remember the last property for handling multiline values
     currentEvent.lastProperty = key.toLowerCase().split(';')[0];
    }
   }
  }

  return events;
 };
 // Reset the state
 const reset = () => {
  setLoading(false);
  setError(null);
  setResults(null);
 };

 return {
  fetchICalContent,
  syncPropertyICalReservations,
  syncAllPropertiesICalReservations,
  parseICalDates,
  loading,
  error,
  results,
  reset,
 };
};

export default useICal;
