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
 const display = (url) => {
  window.open(url, '_blank');
 };

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
   if (type && type !== 'Tous') {
    if (type === 'Restaurant & Café') {
     setFilteredPlaces(
      places.filter((place) => place.types.includes('Restaurant & Café'))
     );
    } else {
     setFilteredPlaces(places.filter((place) => place.types.includes(type)));
    }
   } else {
    setFilteredPlaces(places);
   }
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
     {filteredPlaces.map((place) => (
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
       pixelOffset={new window.google.maps.Size(0, -100)}
       onCloseClick={closeInfoWindow}
      >
       <Space>
        <Image width={140} src={selectedPlace.photo} />
        <Space direction="vertical">
         <Text size={20} style={{ color: '#aa7e42', fontWeight: 'bold' }}>
          {selectedPlace.name}
         </Text>
         <Paragraph style={{ width: 180 }}>{selectedPlace.address}</Paragraph>
         <Button
          type="primary"
          shape="round"
          style={{ float: 'right' }}
          icon={<i className="fa-light fa-map-location-dot"></i>}
          onClick={() => display(selectedPlace.url)}
         />
        </Space>
       </Space>
      </InfoWindow>
     )}
    </Map>
   </div>
  </APIProvider>
 );
});

export default MapNearbyPlaces;
