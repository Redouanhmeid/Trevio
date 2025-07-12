import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Spin, Space, Flex, Tag, Typography, Button, message } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import MapConfig from '../../mapconfig';
import {
 Map,
 AdvancedMarker,
 InfoWindow,
 useMap,
} from '@vis.gl/react-google-maps';
import useGetPropertiesByLatLon from '../../hooks/useGetPropertiesByLatLon';
import { useTranslation } from '../../context/TranslationContext';
import useDebounce from '../../hooks/useDebounce';
import { useNavigate } from 'react-router-dom';
import pinIcon from '../../assets/position.gif';
import { filterProperties } from '../../utils/filterProperties';
import { getLocationForCityOrUser } from '../../utils/utils';

const { Text, Link } = Typography;
// Fallback center (e.g., center of Rabat)
const FALLBACK_CENTER = { lat: 34.0209, lng: -6.8416 };

const MapHome = React.memo(
 ({
  isLoaded,
  city,
  checkedTypes,
  range,
  roomValue,
  paxValue,
  checkedbasicEquipements,
 }) => {
  const { t } = useTranslation();
  const [mapCenter, setMapCenter] = useState(FALLBACK_CENTER);
  const [currentPosition, setCurrentPosition] = useState();
  const [zoom, setZoom] = useState(13);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);

  const debouncedCenter = useDebounce(mapCenter, 300);
  const debouncedBounds = useDebounce(mapBounds, 300);

  const { loading, error, data } = useGetPropertiesByLatLon(
   debouncedCenter.lat,
   debouncedCenter.lng,
   debouncedBounds
  );
  const [filteredProperties, setFilteredProperties] = useState([]);

  const navigate = useNavigate();
  const map = useMap();

  const toggleInfoWindow = (place) =>
   setSelectedPlace(
    selectedPlace && selectedPlace.id === place.id ? null : place
   );

  const closeInfoWindow = () => {
   setSelectedPlace(null);
  };

  const display = (hashId) => {
   navigate(`/propertydetails?hash=${hashId}`);
  };

  const onMapIdle = useCallback(() => {
   if (map) {
    const newCenter = map.getCenter();
    if (newCenter) {
     setMapCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
    }
    setZoom(map.getZoom());
    setMapBounds(map.getBounds());
   }
  }, [map]);

  useEffect(() => {
   if (map) {
    const listeners = [
     map.addListener('idle', onMapIdle),
     map.addListener('dragend', onMapIdle),
     map.addListener('zoom_changed', onMapIdle),
    ];
    return () => listeners.forEach((listener) => listener.remove());
   }
  }, [map, onMapIdle]);

  useEffect(() => {
   if (data) {
    setFilteredProperties(
     filterProperties(
      data,
      checkedTypes,
      range,
      roomValue,
      paxValue,
      checkedbasicEquipements
     )
    );
   }
   console.log(filteredProperties);
  }, [data, checkedTypes, range, roomValue, paxValue, checkedbasicEquipements]);

  useEffect(() => {
   const fetchLocation = async () => {
    const location = await getLocationForCityOrUser(city);
    setMapCenter(location);
    setCurrentPosition(location);
   };

   fetchLocation();
  }, [city]);

  if (!isLoaded) {
   return (
    <div className="loading">
     <Spin size="large" />
    </div>
   );
  }

  return (
   <div
    style={{
     display: 'inline-block',
     width: '100%',
     height: '520px',
     borderRadius: '12px',
     overflow: 'hidden',
    }}
   >
    <Map
     mapId={MapConfig.MAP_ID}
     zoom={zoom}
     center={mapCenter}
     onCenterChanged={() => {
      if (map) {
       const newCenter = map.getCenter();
       setMapCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
       closeInfoWindow();
      }
     }}
    >
     <AdvancedMarker position={currentPosition}>
      <img src={pinIcon} alt="Position actuelle" />
     </AdvancedMarker>

     {filteredProperties.map((place, index) => (
      <AdvancedMarker
       key={index}
       position={{ lat: place.latitude, lng: place.longitude }}
       onClick={() => toggleInfoWindow(place)}
      >
       <div className="pin">
        <img src={place.photos[0]} alt={place.name} />
       </div>
      </AdvancedMarker>
     ))}

     {selectedPlace && (
      <InfoWindow
       position={{ lat: selectedPlace.latitude, lng: selectedPlace.longitude }}
       pixelOffset={new window.google.maps.Size(0, -75)}
      >
       <Flex
        justify="space-between"
        style={{
         display: 'flex',
         paddingBottom: '4px',
         borderBottom: '1px solid #ddd',
        }}
       >
        <Link
         href={`/propertydetails?hash=${selectedPlace.hashId}`}
         style={{
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer',
          color: '#2b2c32',
         }}
        >
         {selectedPlace.name}
        </Link>
        <Button
         size="small"
         icon={<RightOutlined />}
         onClick={() => display(selectedPlace.hashId)}
         style={{
          backgroundColor: '#2b2c32',
          color: '#faf6f1',
          borderRadius: 0,
         }}
        />
       </Flex>
       <Space direction="vertical" style={{ paddingTop: '4px' }}>
        <Text size={18}>
         <span style={{ color: '#aa7e42', fontWeight: 'bold' }}>
          {selectedPlace.price}
         </span>{' '}
         {t('property.basic.priceNight')}
        </Text>
        <Flex justify="space-between">
         <Tag>
          <Text size={16}>
           {selectedPlace.rooms} {t('property.basic.rooms')}
          </Text>
         </Tag>
         <Tag>
          <Text size={16}>
           {selectedPlace.capacity} {t('property.basic.Capacity')}
          </Text>
         </Tag>
        </Flex>
       </Space>
      </InfoWindow>
     )}
    </Map>
   </div>
  );
 }
);

export default MapHome;
