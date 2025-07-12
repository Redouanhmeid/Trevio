import React, { useState, useRef, useEffect } from 'react';
import MapConfig from '../../../mapconfig';
import {
 Spin,
 Input,
 Space,
 Typography,
 Collapse,
 Tooltip,
 Button,
 Grid,
 Flex,
} from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import {
 APIProvider,
 Map,
 AdvancedMarker,
 Pin,
} from '@vis.gl/react-google-maps';
import { useGoogleMapsLoader } from '../../../services/GoogleMapService';
import { useTranslation } from '../../../context/TranslationContext';

const { Text } = Typography;
const { Panel } = Collapse;

const MapPicker = React.memo(
 ({
  onPlaceSelected,
  initialPosition = { lat: 34.0083637, lng: -6.8538748 },
  initialPlaceName = 'Rabat',
 }) => {
  const isLoaded = useGoogleMapsLoader();
  const [position, setPosition] = useState(initialPosition);
  const [placeName, setPlaceName] = useState(initialPlaceName);
  const [placeURL, setPlaceURL] = useState('');
  const [placeAddress, setPlaceAddress] = useState('');
  const [placeRating, setPlaceRating] = useState(0);
  const [placePhotos, setPlacePhotos] = useState([]);
  const [placeTypes, setPlaceTypes] = useState([]);
  const { t } = useTranslation();
  const [touched, setTouched] = useState(false);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  const autocompleteContainerRef = useRef(null);

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const [manualLat, setManualLat] = useState(initialPosition.lat.toString());
  const [manualLng, setManualLng] = useState(initialPosition.lng.toString());
  const [manualInputError, setManualInputError] = useState('');

  // Update the input value with the initial place name
  useEffect(() => {
   if (inputRef.current && initialPlaceName) {
    inputRef.current.value = initialPlaceName;
   }
  }, [initialPlaceName, isLoaded]);

  // Update manual coordinates when position changes
  useEffect(() => {
   setManualLat(position.lat.toString());
   setManualLng(position.lng.toString());
  }, [position]);

  // Initialize Google Places Autocomplete
  useEffect(() => {
   if (isLoaded && window.google && autocompleteContainerRef.current) {
    try {
     // Clear any existing content
     if (autocompleteContainerRef.current.firstChild) {
      autocompleteContainerRef.current.innerHTML = '';
     }

     // Create input element
     const input = document.createElement('input');
     input.placeholder = t('home.searchPlaceholder') || 'Indicate a place *';
     input.className = 'autocomplete';
     input.style.width = '100%';
     input.style.padding = '0.8rem';
     input.style.borderRadius = '8px';
     input.style.marginBottom = '2px';
     input.style.border =
      touched && !placeName ? '1px solid #ff4d4f' : '1px solid #d9d9d9';

     // Set initial value if available
     if (initialPlaceName) {
      input.value = initialPlaceName;
     }

     // Add event listener for focus
     input.addEventListener('focus', () => setTouched(true));

     // Append to container
     autocompleteContainerRef.current.appendChild(input);
     inputRef.current = input;

     // Initialize Google Places Autocomplete with strict country restriction
     const autocomplete = new window.google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: 'ma' }, // Explicitly restrict to Morocco
      fields: [
       'geometry',
       'name',
       'formatted_address',
       'url',
       'rating',
       'photos',
       'types',
      ],
      strictBounds: false, // Don't restrict to viewport
      types: ['geocode', 'establishment'], // Allow both locations and businesses
     });

     // Store reference
     autocompleteRef.current = autocomplete;

     // Add place_changed listener
     autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place && place.geometry) {
       handlePlaceSelect(place);
       setTouched(true);
      }
     });
    } catch (error) {
     console.error('Error initializing Places Autocomplete:', error);
    }
   }
  }, [isLoaded, touched, placeName, initialPlaceName, t]);

  const handlePlaceSelect = (place) => {
   if (!place || !place.geometry || !place.geometry.location) {
    console.error(
     'Selected place is invalid or missing necessary location data.'
    );
    return;
   }

   // Extract location coordinates
   const latitude = place.geometry.location.lat();
   const longitude = place.geometry.location.lng();

   // Update position and marker
   setPosition({ lat: latitude, lng: longitude });
   setPlaceName(place.name || 'Name not available');
   setPlaceURL(place.url || '');
   setPlaceAddress(place.formatted_address || 'Address not available');
   setPlaceRating(place.rating || 0);

   // Handle photos
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
     setPlaceRating(0);
     setPlacePhotos([]);
     setPlaceTypes(place.types || []);

     // Update input field value if available
     if (inputRef.current) {
      inputRef.current.value = placeName;
     }

     // Trigger the callback with the updated data
     onPlaceSelected({
      latitude: newLatLng.lat,
      longitude: newLatLng.lng,
      placeName: placeName,
      placeAddress: place.formatted_address || 'Address not available',
      placeURL: '',
      placeRating: 0,
      placePhotos: [],
      placeTypes: place.types || [],
     });
    } else {
     console.error(
      'Geocode was not successful for the following reason: ' + status
     );
    }
   });
  };

  // Handle manual coordinate input
  const handleManualCoordinatesSubmit = () => {
   setManualInputError('');

   // Validate inputs
   const lat = parseFloat(manualLat);
   const lng = parseFloat(manualLng);

   if (isNaN(lat) || isNaN(lng)) {
    setManualInputError(
     t('validation.invalidCoordinates') ||
      'Please enter valid numbers for coordinates'
    );
    return;
   }

   // Validate latitude range (-90 to 90)
   if (lat < -90 || lat > 90) {
    setManualInputError(
     t('validation.invalidLatitude') || 'Latitude must be between -90 and 90'
    );
    return;
   }

   // Validate longitude range (-180 to 180)
   if (lng < -180 || lng > 180) {
    setManualInputError(
     t('validation.invalidLongitude') ||
      'Longitude must be between -180 and 180'
    );
    return;
   }

   // Update position and use geocoder to get place name
   const newLatLng = { lat, lng };
   setPosition(newLatLng);

   if (isLoaded && window.google) {
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ location: newLatLng }, (results, status) => {
     if (status === 'OK' && results[0]) {
      const place = results[0];

      // Find the locality (city) from address_components
      const localityComponent = place.address_components.find((component) =>
       component.types.includes('locality')
      );

      // Extract locality name, or fallback to formatted_address
      const newPlaceName = localityComponent
       ? localityComponent.long_name
       : place.formatted_address;

      // Update the state
      setPlaceName(newPlaceName);
      setPlaceAddress(place.formatted_address || 'Address not available');

      // Update input field value if available
      if (inputRef.current) {
       inputRef.current.value = newPlaceName;
      }

      // Trigger the callback with the updated data
      onPlaceSelected({
       latitude: lat,
       longitude: lng,
       placeName: newPlaceName,
       placeAddress: place.formatted_address || 'Address not available',
       placeURL: '',
       placeRating: 0,
       placePhotos: [],
       placeTypes: place.types || [],
      });
     } else {
      console.error(
       'Geocode was not successful for the following reason: ' + status
      );
      // Set a default place name if geocoding fails
      setPlaceName(`Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`);

      // Update input field value if available
      if (inputRef.current) {
       inputRef.current.value = `Location (${lat.toFixed(6)}, ${lng.toFixed(
        6
       )})`;
      }

      // Trigger the callback with the updated data
      onPlaceSelected({
       latitude: lat,
       longitude: lng,
       placeName: `Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`,
       placeAddress: '',
       placeURL: '',
       placeRating: 0,
       placePhotos: [],
       placeTypes: [],
      });
     }
    });
   }
  };

  // Create Collapse items
  const collapseItems = [
   {
    key: '1',
    label: (
     <Text strong style={{ color: '#6D5FFA' }}>
      {t('property.basic.manualCoordinates')}
     </Text>
    ),
    children: (
     <Space direction="vertical" style={{ width: '100%', lineHeight: 1 }}>
      <Text>{t('property.basic.enterCoordinates')}</Text>

      <Space
       size="large"
       style={{ width: '100%' }}
       direction={screens.xs ? 'vertical' : 'horizontal'}
      >
       <div style={{ width: screens.xs ? '100%' : 'auto' }}>
        <Flex align="center" style={{ marginBottom: screens.xs ? 8 : 0 }}>
         <Text
          style={{
           minWidth: screens.xs ? '80px' : 'auto',
           marginRight: '8px',
          }}
         >
          {t('property.basic.latitude')}
         </Text>
         <Tooltip title="-90 to 90" style={{ width: '100%' }}>
          <Input
           value={manualLat}
           onChange={(e) => setManualLat(e.target.value)}
           placeholder="e.g. 34.020882"
           style={{ width: screens.xs ? '100%' : '150px' }}
          />
         </Tooltip>
        </Flex>
       </div>

       <div style={{ width: screens.xs ? '100%' : 'auto' }}>
        <Flex align="center" style={{ marginBottom: screens.xs ? 8 : 0 }}>
         <Text
          style={{
           minWidth: screens.xs ? '80px' : 'auto',
           marginRight: '8px',
          }}
         >
          {t('property.basic.longitude')}
         </Text>
         <Tooltip title="-180 to 180" style={{ width: '100%' }}>
          <Input
           value={manualLng}
           onChange={(e) => setManualLng(e.target.value)}
           placeholder="e.g. -6.841650"
           style={{ width: screens.xs ? '100%' : '150px' }}
          />
         </Tooltip>
        </Flex>
       </div>

       <Button
        type="primary"
        onClick={handleManualCoordinatesSubmit}
        style={{ width: screens.xs ? '100%' : 'auto' }}
       >
        {t('common.apply')}
       </Button>
      </Space>

      {manualInputError && <Text type="danger">{manualInputError}</Text>}

      <Text type="secondary" style={{ fontSize: '12px' }}>
       {t('property.basic.coordinatesTip')}
      </Text>
     </Space>
    ),
    showArrow: true,
   },
  ];

  if (!isLoaded) {
   return (
    <div className="loading">
     <Spin size="large" />
    </div>
   );
  }

  return (
   <APIProvider>
    {/* Autocomplete Container */}
    <div
     ref={autocompleteContainerRef}
     style={{
      width: '100%',
     }}
    />

    {touched && !placeName && (
     <div style={{ color: '#ff4d4f', marginTop: '4px', marginBottom: '10px' }}>
      {t('validation.selectLocation')}
     </div>
    )}

    {/* Manual Coordinates Input */}
    <Collapse
     ghost
     expandIcon={({ isActive }) => (
      <CaretDownOutlined rotate={isActive ? 180 : 0} />
     )}
     style={{ marginTop: 0, marginBottom: 0 }}
     items={collapseItems}
    />

    <div
     style={{
      display: 'inline-block',
      width: '100%',
      height: '400px',
      overflow: 'hidden',
     }}
    >
     <Map center={position} defaultZoom={14} mapId={MapConfig.MAP_ID}>
      <AdvancedMarker
       position={position}
       draggable
       onDragEnd={({ latLng }) => handleMarkerDragEnd({ latLng })}
      >
       <Pin
        background={'#6d5ffa'}
        borderColor={'#2b2c32'}
        glyphColor={'#fbfbfb'}
       />
      </AdvancedMarker>
     </Map>
    </div>
   </APIProvider>
  );
 }
);

export default MapPicker;
