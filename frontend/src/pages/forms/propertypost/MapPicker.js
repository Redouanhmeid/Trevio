import React, { useState, useRef } from 'react';
import MapConfig from '../../../mapconfig';
import { Spin } from 'antd';
import {
 APIProvider,
 Map,
 AdvancedMarker,
 Pin,
} from '@vis.gl/react-google-maps';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { useGoogleMapsLoader } from '../../../services/GoogleMapService';
import { useTranslation } from '../../../context/TranslationContext';

const libraries = ['places'];

const MapPicker = React.memo(({ onPlaceSelected }) => {
 const isLoaded = useGoogleMapsLoader();
 const [position, setPosition] = useState({ lat: 34.0083637, lng: -6.8538748 });
 const [placeName, setPlaceName] = useState('Rabat');
 const [placeURL, setPlaceURL] = useState('');
 const [placeAddress, setPlaceAddress] = useState('');
 const [placeRating, setPlaceRating] = useState(0);
 const [placePhotos, setPlacePhotos] = useState([]);
 const [placeTypes, setPlaceTypes] = useState([]);
 const { t } = useTranslation();

 const [touched, setTouched] = useState(false);
 const inputRef = useRef(null);

 const autocompleteRef = useRef(null);

 const handlePlaceSelect = (place) => {
  if (!place || !place.geometry || !place.geometry.location) {
   console.error(
    'Selected place is invalid or missing necessary location data.'
   );
   return; // Exit the function if no valid place data is available
  }
  // Extract location coordinates
  const latitude = place.geometry.location.lat();
  const longitude = place.geometry.location.lng();

  // Update the position and marker key
  setPosition({ lat: latitude, lng: longitude });
  setPlaceName(place.name || 'Name not available');
  setPlaceURL(place.url || '');
  setPlaceAddress(place.formatted_address || 'Address not available');
  setPlaceRating(place.rating || 0);
  // Handle photos: get up to 10 photo URLs
  const photoUrls = place.photos
   ? place.photos.slice(0, 8).map((photo) => photo.getUrl())
   : [];
  setPlacePhotos(photoUrls);
  setPlaceTypes(place.types || []);

  // Prepare the selectedPlace object for callback
  const selectedPlace = {
   latitude: latitude,
   longitude: longitude,
   placeName: place.name || 'Name not available',
   placeURL: place.url || '',
   placeAddress: place.formatted_address || 'Address not available',
   placeRating: place.rating || 0,
   placePhotos: photoUrls,
   placeTypes: place.types || [],
  };
  // Trigger the callback with the selected place data
  onPlaceSelected(selectedPlace);
 };

 const handleMarkerDragEnd = ({ latLng }) => {
  if (!latLng) return;

  const geocoder = new window.google.maps.Geocoder();
  const newLatLng = { lat: latLng.lat(), lng: latLng.lng() };

  setPosition(newLatLng); // Update position immediately for smooth UI

  geocoder.geocode({ location: newLatLng }, (results, status) => {
   if (status === 'OK' && results[0]) {
    const place = results[0];

    // Find the locality (city) from address_components
    const localityComponent = place.address_components.find((component) =>
     component.types.includes('locality')
    );

    // Extract locality name, or fallback to formatted_address
    const placeName = localityComponent
     ? localityComponent.long_name
     : place.formatted_address;

    // Update the state with the new place details
    setPosition(newLatLng);
    setPlaceName(placeName);
    setPlaceAddress(place.formatted_address || 'Address not available');
    setPlaceURL(place.url || '');
    setPlaceRating(0); // Optional, depends on geocoding result
    setPlacePhotos([]); // Optional, depends on your requirements
    setPlaceTypes(place.types || []);

    // Trigger the callback with the updated data
    onPlaceSelected({
     latitude: newLatLng.lat,
     longitude: newLatLng.lng,
     placeName: placeName,
     placeAddress: place.formatted_address || 'Address not available',
     placeURL: '',
     placeRating: 0, // Optional
     placePhotos: [], // Optional
     placeTypes: place.types || [],
    });
   } else {
    console.error(
     'Geocode was not successful for the following reason: ' + status
    );
   }
  });
 };

 const inputStyle = {
  width: '100%',
  padding: '0.8rem',
  borderRadius: '8px',
  marginBottom: '20px',
  border: touched && !placeName ? '1px solid #ff4d4f' : '1px solid #d9d9d9',
 };

 if (!isLoaded) {
  return (
   <div className="loading">
    <Spin size="large" />
   </div>
  );
 }
 return (
  <APIProvider>
   <div
    style={{
     display: 'inline-block',
     width: '100%',
     height: '400px',
     overflow: 'hidden',
    }}
   >
    <Autocomplete
     onLoad={(autocomplete) => {
      autocompleteRef.current = autocomplete;
     }}
     onPlaceChanged={() => {
      if (autocompleteRef.current !== null) {
       const place = autocompleteRef.current.getPlace();
       handlePlaceSelect(place);
       setTouched(true);
      }
     }}
     options={{
      componentRestrictions: { country: 'ma' }, // Restrict search to Morocco
     }}
    >
     <input
      ref={inputRef}
      placeholder="Indiquer une place *"
      className="autocomplete"
      onFocus={() => setTouched(true)}
     />
    </Autocomplete>
    {touched && !placeName && (
     <div style={{ color: '#ff4d4f', marginTop: '4px' }}>
      {t('validation.selectLocation')}
     </div>
    )}
    <Map
     // key={position.lat + position.lng}
     center={position}
     defaultZoom={14}
     // defaultCenter={position}
     mapId={MapConfig.MAP_ID}
    >
     <AdvancedMarker
      position={position}
      draggable
      onDragEnd={({ latLng }) => handleMarkerDragEnd({ latLng })}
     >
      <Pin
       background={'#aa7e42'}
       borderColor={'#2b2c32'}
       glyphColor={'#fbfbfb'}
      />
     </AdvancedMarker>
    </Map>
   </div>
  </APIProvider>
 );
});

export default MapPicker;
