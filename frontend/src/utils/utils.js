import { message } from 'antd';

export const formatTimeFromDatetime = (datetimeString) => {
 const date = new Date(datetimeString);
 const hours = date.getHours();
 const minutes = date.getMinutes().toString().padStart(2, '0');
 return `${hours}:${minutes}`;
};

export const getAdditionalRules = (houseRules) => {
 if (!Array.isArray(houseRules)) {
  return null;
 }
 const additionalRuleEntry = houseRules.find((rule) =>
  rule.startsWith('additionalRules:')
 );
 if (additionalRuleEntry) {
  return additionalRuleEntry.split('additionalRules: ')[1];
 }
 return null;
};

export const getStaticMapUrl = (latitude, longitude, apiKey) => {
 const center = `${latitude},${longitude}`;
 const zoom = 15;
 const size = `2000x600`;
 const mapType = 'roadmap';
 const marker = `color:red|label:C|${latitude},${longitude}`;

 return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=${zoom}&size=${size}&maptype=${mapType}&markers=${marker}&key=${apiKey}`;
};

export const loadImage = (src) => {
 return new Promise((resolve, reject) => {
  const img = new Image();
  img.src = src;
  img.onload = resolve;
  img.onerror = reject;
 });
};

export const getVideoThumbnail = (url) => {
 let thumbnailUrl = '';
 if (url.includes('youtube.com') || url.includes('youtu.be')) {
  const videoId = url.split('v=')[1] || url.split('/')[3];
  thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
 } else if (url.includes('vimeo.com')) {
  const videoId = url.split('.com/')[1];
  thumbnailUrl = `https://vumbnail.com/${videoId}.jpg`;
 }
 return thumbnailUrl;
};

const FALLBACK_CENTER = { lat: 34.0209, lng: -6.8416 };

export const getLocationForCityOrUser = async (city) => {
 const getUserLocation = () =>
  new Promise((resolve) => {
   if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
     (position) => {
      resolve({
       lat: position.coords.latitude,
       lng: position.coords.longitude,
      });
     },
     (error) => {
      console.error('Error getting user location:', error);
      message.warning(
       "Impossible d'obtenir votre position. Utilisation de l'emplacement par défaut."
      );
      resolve(FALLBACK_CENTER);
     }
    );
   } else {
    console.error('Geolocation is not supported by this browser.');
    message.warning(
     "La géolocalisation n'est pas prise en charge par votre navigateur. Utilisation de l'emplacement par défaut."
    );
    resolve(FALLBACK_CENTER);
   }
  });

 if (city) {
  return new Promise((resolve) => {
   const geocoder = new window.google.maps.Geocoder();
   geocoder.geocode({ address: city }, async (results, status) => {
    if (status === 'OK' && results[0]) {
     const { lat, lng } = results[0].geometry.location;
     resolve({ lat: lat(), lng: lng() });
    } else {
     console.error('Geocode was not successful: ' + status);
     message.warning(
      'Impossible de localiser la ville spécifiée. Utilisation de votre position actuelle.'
     );
     const userLocation = await getUserLocation();
     resolve(userLocation);
    }
   });
  });
 } else {
  return getUserLocation();
 }
};

export const frFormatDate = (date) => {
 const d = new Date(date);
 const day = String(d.getDate()).padStart(2, '0');
 const month = String(d.getMonth() + 1).padStart(2, '0');
 const year = d.getFullYear();
 return `${day}/${month}/${year}`;
};

// Helper function to parse iCal links property
export const parseICalLinks = (propValue) => {
 if (!propValue) return [];

 if (typeof propValue === 'string') {
  try {
   return JSON.parse(propValue);
  } catch (e) {
   console.warn('Failed to parse iCal links:', propValue);
   return [];
  }
 }
 return Array.isArray(propValue) ? propValue : [];
};
