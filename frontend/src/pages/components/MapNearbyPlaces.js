import React, { useState, useEffect } from 'react';
import { Spin, Space, Image, Typography, Button, Alert, message } from 'antd';
import MapConfig from '../../mapconfig';
import {
 APIProvider,
 Map,
 AdvancedMarker,
 InfoWindow,
} from '@vis.gl/react-google-maps';
import { useGoogleMapsLoader } from '../../services/GoogleMapService';
import useNearbyPlace from '../../hooks/useNearbyPlace';
import { useTranslation } from '../../context/TranslationContext';

// Define libraries as a const variable outside of the component
const libraries = ['places', 'geometry'];
const { Text, Paragraph } = Typography;

const MapNearbyPlaces = React.memo(({ latitude, longitude, type }) => {
 const { t } = useTranslation();
 const isLoaded = useGoogleMapsLoader();

 const { loading, error, getNearbyPlacesByLatLon } = useNearbyPlace();

 const [places, setPlaces] = useState(null);
 const [selectedPlace, setSelectedPlace] = useState(null);
 const [filteredPlaces, setFilteredPlaces] = useState([]);
 const [loadedImages, setLoadedImages] = useState(new Set());

 const center = {
  lat: latitude,
  lng: longitude,
 };
 const toggleInfoWindow = (place) => {
  setSelectedPlace((prevPlace) =>
   prevPlace && prevPlace.id === place.id ? null : place
  );
 };
 const closeInfoWindow = () => {
  setSelectedPlace(null);
 };
 const handleImageLoad = (placeId) => {
  setLoadedImages((prev) => new Set([...prev, placeId]));
 };

 const handleImageError = (placeId) => {
  // Still add to loaded set so marker appears even if image fails
  setLoadedImages((prev) => new Set([...prev, placeId]));
 };
 const display = (url) => {
  window.open(url, '_blank');
 };

 useEffect(() => {
  if (selectedPlace) {
   // Inject custom CSS for InfoWindow styling
   const style = document.createElement('style');
   style.textContent = `
    .gm-style-iw-d {
     overflow: visible !important;
     max-height: none !important;
     height: auto !important;
    }
    .gm-style-iw-c {
     max-width: none !important;
     max-height: none !important;
     padding: 0 !important;
    }
    .gm-style-iw {
     border-radius: 8px !important;
     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    }
     .gm-ui-hover-effect {
     background: rgba(255, 255, 255, 0.5) !important;
     border-radius: 8% !important;
     backdrop-filter: blur(8px) !important;
    }
    .gm-ui-hover-effect:hover {
     background: rgba(255, 255, 255, 1) !important;
    }
   `;
   document.head.appendChild(style);

   // Clean up the style when component unmounts or InfoWindow closes
   return () => {
    if (document.head.contains(style)) {
     document.head.removeChild(style);
    }
   };
  }
 }, [selectedPlace]);

 useEffect(() => {
  if (latitude && longitude) {
   getNearbyPlacesByLatLon(latitude, longitude)
    .then((data) => {
     setPlaces(data);
    })
    .catch((err) => {
     message.error(t('map.messageError'));
    });
  }
 }, [latitude, longitude]);

 useEffect(() => {
  if (places && places.length > 0) {
   let placesToFilter = places;

   if (type && type !== 'Tous') {
    if (type === 'Restaurant & Café') {
     placesToFilter = places.filter((place) =>
      place.types.includes('Restaurant & Café')
     );
    } else {
     placesToFilter = places.filter((place) => place.types.includes(type));
    }
   }

   setFilteredPlaces(placesToFilter);

   // Reset loaded images when places change
   setLoadedImages(new Set());

   // Preload images for filtered places
   placesToFilter.forEach((place) => {
    if (place.photo) {
     const img = document.createElement('img');
     img.onload = () => handleImageLoad(place.id);
     img.onerror = () => handleImageError(place.id);
     img.src = place.photo;
    } else {
     // If no photo, mark as loaded so marker appears
     handleImageLoad(place.id);
    }
   });
  }
 }, [places, type]);

 if (!isLoaded || loading) {
  return (
   <div className="loading">
    <Spin size="large" />
   </div>
  );
 }

 // Check if there are no places to display
 if (filteredPlaces.length === 0) {
  return (
   <div style={{ textAlign: 'center', padding: '50px' }}>
    <Alert description={t('nearbyPlace.noNearbyPlaceRecorded')} />
   </div>
  );
 }

 return (
  <APIProvider>
   <div
    style={{
     display: 'inline-block',
     width: '100%',
     height: '360px',
     borderRadius: '12px',
     overflow: 'hidden',
    }}
   >
    <Map defaultCenter={center} defaultZoom={14} mapId={MapConfig.MAP_ID}>
     {filteredPlaces
      .filter((place) => loadedImages.has(place.id))
      .map((place) => (
       <AdvancedMarker
        key={place.id}
        position={{ lat: place.latitude, lng: place.longitude }}
        onClick={() => toggleInfoWindow(place)}
       >
        <div className="pin">
         <img src={place.photo} alt={place.name} />
        </div>
       </AdvancedMarker>
      ))}

     {selectedPlace && (
      <InfoWindow
       position={{ lat: selectedPlace.latitude, lng: selectedPlace.longitude }}
       pixelOffset={new window.google.maps.Size(0, -80)}
       onCloseClick={closeInfoWindow}
      >
       <div
        style={{
         padding: '12px',
         minWidth: '300px',
         maxWidth: '400px',
        }}
       >
        <Space>
         <Image width={120} src={selectedPlace.photo} />
         <Space direction="vertical">
          <Text size={18} style={{ color: '#6D5FFA', fontWeight: 'bold' }}>
           {selectedPlace.name}
          </Text>
          <Paragraph style={{ width: 200, margin: 0 }}>
           {selectedPlace.address}
          </Paragraph>
          <Button
           type="link"
           shape="round"
           style={{ float: 'right' }}
           icon={<i className="fa-light fa-map-location-dot"></i>}
           onClick={() => display(selectedPlace.url)}
          />
         </Space>
        </Space>
       </div>
      </InfoWindow>
     )}
    </Map>
   </div>
  </APIProvider>
 );
});

export default MapNearbyPlaces;
