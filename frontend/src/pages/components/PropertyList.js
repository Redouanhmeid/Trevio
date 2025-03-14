import React, { useState, useEffect } from 'react';
import {
 Row,
 Col,
 Card,
 Button,
 Rate,
 Spin,
 Image,
 Flex,
 Tag,
 Typography,
 Carousel,
 message,
} from 'antd';
import { HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { filterProperties } from '../../utils/filterProperties';
import { getLocationForCityOrUser } from '../../utils/utils';
import fallback from '../../assets/fallback.png';
import useProperty from '../../hooks/useProperty';
import useGetPropertiesByLatLon from '../../hooks/useGetPropertiesByLatLon';
import useDebounce from '../../hooks/useDebounce';
import { useTranslation } from '../../context/TranslationContext';

const { Text } = Typography;

const PropertyList = ({
 city,
 mapCenter,
 checkedTypes,
 range,
 roomValue,
 paxValue,
 checkedbasicEquipements,
}) => {
 const navigate = useNavigate();
 const { t } = useTranslation();

 const debouncedCenter = useDebounce(mapCenter, 300);
 const { loading, data } = useGetPropertiesByLatLon(
  debouncedCenter.lat,
  debouncedCenter.lng
 );
 const [filteredProperties, setFilteredProperties] = useState([]);
 const [imageAspectRatios, setImageAspectRatios] = useState({});

 // Effect to filter properties when properties or filter criteria change
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
 }, [
  data,
  city,
  checkedTypes,
  range,
  roomValue,
  paxValue,
  checkedbasicEquipements,
 ]);

 const handleImageLoad = (e, index) => {
  const { naturalWidth, naturalHeight } = e.target;
  const aspectRatio = naturalHeight > naturalWidth ? 'portrait' : 'landscape';

  setImageAspectRatios((prevState) => {
   const newState = {
    ...prevState,
    [index]: aspectRatio,
   };
   return newState;
  });
 };

 if (!mapCenter)
  return (
   <div className="loading">
    <Spin size="large" />
   </div>
  );

 return (
  <Row gutter={[32, 32]}>
   {filteredProperties &&
    filteredProperties.map((property) => (
     <Col xs={24} md={6} key={property.id}>
      <Card
       key={property.id}
       hoverable={false}
       bordered={false}
       style={{
        overflow: 'hidden',
        body: { padding: '12px' },
       }}
       cover={
        <div style={{ position: 'relative' }}>
         <Carousel className="propertycarousel" autoplay effect="fade">
          {property.photos.map((photo, index) => (
           <div key={index} className="image-container">
            <Image
             alt={property.name}
             src={photo}
             preview={false}
             fallback={fallback}
             placeholder={
              <div className="image-placeholder">{t('common.loading')}</div>
             }
             className={`card-image ${imageAspectRatios[index]}`}
             onLoad={(e) => handleImageLoad(e, index)}
            />
           </div>
          ))}
         </Carousel>
         <Button
          type="text"
          icon={<HeartOutlined style={{ color: '#6D5FFA' }} />}
          style={{
           position: 'absolute',
           top: '10px',
           right: '10px',
           background: 'white',
           borderRadius: '50%',
           width: '32px',
           height: '32px',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           border: 'none',
           zIndex: 1,
           boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
          onClick={(e) => {
           e.stopPropagation();
           // Add favorite functionality here
          }}
         />
        </div>
       }
      >
       <Flex vertical gap={4}>
        <Flex
         justify="space-between"
         align="center"
         style={{ marginBottom: '4px' }}
        >
         <Text style={{ color: '#666' }}>
          <i
           className="PrimaryColor fa-light fa-location-dot"
           style={{ marginRight: '4px' }}
          />
          {property.placeName}
         </Text>
         <Flex align="center" gap="4px">
          <Rate
           disabled
           value={1}
           count={1}
           style={{ fontSize: '14px', color: '#FFB800' }}
          />
          <Text strong>4,3</Text>
         </Flex>
        </Flex>

        <Text strong style={{ fontSize: '16px' }}>
         {property.name}
        </Text>

        <Text strong style={{ fontSize: '16px', marginBottom: '8px' }}>
         {property.price}{' '}
         <Text
          type="secondary"
          style={{ fontWeight: 'normal', fontSize: '14px' }}
         >
          {t('property.basic.priceNight')}
         </Text>
        </Text>

        <Flex gap="middle" style={{ marginBottom: '16px' }}>
         <Text type="secondary">
          <i
           className="PrimaryColor fa-light fa-snowflake"
           style={{ marginRight: '4px' }}
          />
          {t('property.tag.airconditioned')}
         </Text>
         <Text type="secondary">
          <i
           className="PrimaryColor fa-light fa-lock"
           style={{ marginRight: '4px' }}
          />
          {t('property.tag.smartlock')}
         </Text>
        </Flex>

        <Flex gap="middle">
         <Button
          type="primary"
          style={{ flex: 1, background: '#8B5CF6', borderColor: '#8B5CF6' }}
         >
          {t('property.book')}
         </Button>
         <Button
          style={{ flex: 1 }}
          onClick={() => navigate(`/propertydetails?hash=${property.hashId}`)}
         >
          {t('property.learnMore')}
         </Button>
        </Flex>
       </Flex>
      </Card>
     </Col>
    ))}
  </Row>
 );
};

export default PropertyList;
