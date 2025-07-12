import React, { useState } from 'react';
import { Spin } from 'antd';
import MapConfig from '../../mapconfig';
import {
 APIProvider,
 Map,
 AdvancedMarker,
 InfoWindow,
} from '@vis.gl/react-google-maps';
import pinIcon from '../../assets/pin-0.png';
import { useGoogleMapsLoader } from '../../services/GoogleMapService';
import { useTranslation } from '../../context/TranslationContext';

// Define libraries as a const variable outside of the component
const libraries = ['places', 'geometry'];

const MapMarker = React.memo(({ latitude, longitude }) => {
 const { t } = useTranslation();
 const isLoaded = useGoogleMapsLoader();
 const [showInfoWindow, setShowInfoWindow] = useState(false);

 const center = {
  lat: latitude,
  lng: longitude,
 };

 const handleMarkerClick = () => {
  setShowInfoWindow(true);
 };
 const handleCloseInfoWindow = () => {
  setShowInfoWindow(false); // Close InfoWindow when user clicks "X"
 };

 const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

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
     height: '420px',
     borderRadius: '12px',
     overflow: 'hidden',
    }}
   >
    <Map defaultCenter={center} defaultZoom={14} mapId={MapConfig.MAP_ID}>
     <AdvancedMarker position={center} onClick={handleMarkerClick}>
      <div
       style={{
        width: '30px',
        height: '46px',
        backgroundImage: `url(${pinIcon})`,
        backgroundSize: 'cover',
        zIndex: 1000,
       }}
      />
     </AdvancedMarker>

     {/* InfoWindow is shown when the marker is clicked */}
     {showInfoWindow && (
      <InfoWindow
       position={center}
       pixelOffset={new window.google.maps.Size(0, -50)}
       onCloseClick={handleCloseInfoWindow}
       headerContent={<p>{t('map.headerContent')}</p>}
      >
       <div>
        <p>{t('map.markerLocation')}</p>
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
         {t('map.SeeOnMaps')}
        </a>
       </div>
      </InfoWindow>
     )}
    </Map>
   </div>
  </APIProvider>
 );
});

export default MapMarker;
