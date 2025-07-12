import React, { useRef, useEffect, useState } from 'react';
import {
 Carousel,
 Card,
 Spin,
 Image,
 Button,
 Flex,
 Typography,
 Rate,
 Grid,
 message,
} from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import useNearbyPlace from '../../hooks/useNearbyPlace';
import { useTranslation } from '../../context/TranslationContext';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const NearbyPlacesCarousel = ({ latitude, longitude }) => {
 const { t } = useTranslation();
 const slider1 = useRef(null);
 const slider2 = useRef(null);
 const slider3 = useRef(null);
 const slider4 = useRef(null);

 const [data, setData] = useState(null);

 const { loading, error, getNearbyPlacesByLatLon } = useNearbyPlace();

 useEffect(() => {
  if (latitude && longitude) {
   getNearbyPlacesByLatLon(latitude, longitude)
    .then((data) => {
     setData(data);
    })
    .catch((err) => {
     message.error(t('map.messageError2'));
    });
  }
 }, [latitude]);

 const dataArray = data ? Object.values(data) : [];
 const screens = useBreakpoint();

 if (loading) {
  return (
   <div className="loading">
    <Spin size="large" />
   </div>
  );
 }
 if (error) return <div></div>;

 const PlacesToEat = dataArray.filter(
  (place) =>
   Array.isArray(place.types) && place.types.includes('Restaurant & Café')
 );
 const Activities = dataArray.filter(
  (place) => Array.isArray(place.types) && place.types.includes('Activité')
 );
 const Attractions = dataArray.filter(
  (place) => Array.isArray(place.types) && place.types.includes('Attraction')
 );
 const Malls = dataArray.filter(
  (place) =>
   Array.isArray(place.types) && place.types.includes('Centre commercial')
 );

 const getSlidesToShow = (dataArray) => {
  if (!dataArray || !Array.isArray(dataArray)) {
   return 0; // Return 0 if data is undefined or not an array
  }
  const totalSlides = dataArray.length;
  if (screens.xs) {
   return Math.min(2, totalSlides);
  } else {
   return Math.min(5, totalSlides);
  }
 };

 return (
  <>
   {PlacesToEat.length > 0 && (
    <>
     <Title level={3}>
      <i className="PrimaryColor fa-regular fa-plate-utensils"></i>{' '}
      {t('guidebook.tabs.places.restaurants')}
     </Title>
     <div style={{ position: 'relative' }}>
      <div className="nearbyplacescarouselarrow left">
       <LeftOutlined onClick={() => slider1.current.prev()} />
      </div>

      <Carousel
       ref={slider1}
       slidesToShow={getSlidesToShow(PlacesToEat)}
       dots={false}
       autoplay
      >
       {PlacesToEat.map((place, index) => (
        <Place place={place} key={index} style={{ margin: '0 12px' }} />
       ))}
      </Carousel>

      <div className="nearbyplacescarouselarrow right">
       <RightOutlined onClick={() => slider1.current.next()} />
      </div>
     </div>
     <br />
    </>
   )}

   {Activities.length > 0 && (
    <>
     <Title level={3}>
      <i className="PrimaryColor fa-regular fa-sun-cloud"></i>{' '}
      {t('guidebook.tabs.places.activities')}
     </Title>
     <div style={{ position: 'relative' }}>
      <div className="nearbyplacescarouselarrow left">
       <LeftOutlined onClick={() => slider2.current.prev()} />
      </div>
      <Carousel
       ref={slider2}
       slidesToShow={getSlidesToShow(Activities)}
       dots={false}
       autoplay
      >
       {Activities.map((place, index) => (
        <Place place={place} key={index} style={{ margin: '0 12px' }} />
       ))}
      </Carousel>
      <div className="nearbyplacescarouselarrow right">
       <RightOutlined onClick={() => slider2.current.next()} />
      </div>
     </div>
     <br />
    </>
   )}

   {Attractions.length > 0 && (
    <>
     <Title level={3}>
      <i className="PrimaryColor fa-regular fa-camera"></i>{' '}
      {t('guidebook.tabs.places.attractions')}
     </Title>
     <div style={{ position: 'relative' }}>
      <div className="nearbyplacescarouselarrow left">
       <LeftOutlined onClick={() => slider3.current.prev()} />
      </div>
      <Carousel
       ref={slider3}
       slidesToShow={getSlidesToShow(Attractions)}
       dots={false}
       autoplay
      >
       {Attractions.map((place, index) => (
        <Place place={place} key={index} style={{ margin: '0 12px' }} />
       ))}
      </Carousel>
      <div className="nearbyplacescarouselarrow right">
       <RightOutlined onClick={() => slider3.current.next()} />
      </div>
     </div>
     <br />
    </>
   )}

   {Malls.length > 0 && (
    <>
     <Title level={3}>
      <i className="PrimaryColor fa-regular fa-store"></i>{' '}
      {t('guidebook.tabs.places.malls')}
     </Title>
     <div style={{ position: 'relative' }}>
      <div className="nearbyplacescarouselarrow left">
       <LeftOutlined onClick={() => slider4.current.prev()} />
      </div>
      <Carousel
       ref={slider4}
       slidesToShow={getSlidesToShow(Malls)}
       dots={false}
       autoplay
      >
       {Malls.map((place, index) => (
        <Place place={place} key={index} style={{ margin: '0 12px' }} />
       ))}
      </Carousel>
      <div className="nearbyplacescarouselarrow right">
       <RightOutlined onClick={() => slider4.current.next()} />
      </div>
     </div>
    </>
   )}
  </>
 );
};

export default NearbyPlacesCarousel;

const Place = ({ place }) => {
 const screens = useBreakpoint();
 return (
  <Card
   hoverable={false}
   bordered={false}
   className="custom-card"
   cover={
    <div className="nearbyplacescarousel" hoverable="false">
     <Image
      alt={place.name}
      src={place.photo}
      style={{
       position: 'absolute',
       top: 0,
       left: 0,
       objectFit: 'cover',
       width: '100%',
       height: '100%',
       borderRadius: 16,
      }}
     />
    </div>
   }
   style={{
    width: 'calc(100% - 16px)',
    margin: '0 8px',
    height: screens.xs ? '220px' : 'auto',
    position: 'relative',
    textAlign: 'center',
   }}
  >
   <Card.Meta
    title={
     <Flex
      gap="middle"
      justify="center"
      align="center"
      vertical
      style={{ height: '54px' }}
     >
      <Text
       style={{
        fontSize: '16px',
        display: '-webkit-box',
        WebkitLineClamp: 2, // Limit to two lines
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'normal', // Allow text to wrap
       }}
      >
       {place.name}
      </Text>
     </Flex>
    }
    description={
     <Flex justify="space-between" align="center" wrap>
      <div>
       <Rate
        allowHalf
        disabled
        defaultValue={place.rating}
        style={{ color: '#FDB022', fontSize: 12 }}
       />{' '}
       {!screens.xs && place.rating}
      </div>
      <Button
       href={place.url}
       target="_blank"
       type="link"
       size={40}
       icon={
        <i className="fa-lg PrimaryColor fa-regular fa-map-location-dot"></i>
       }
      />
     </Flex>
    }
   />
  </Card>
 );
};
