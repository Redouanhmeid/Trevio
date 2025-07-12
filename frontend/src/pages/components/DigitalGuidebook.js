import React, { useState, useEffect, useMemo } from 'react';
import {
 Spin,
 Layout,
 Row,
 Col,
 Typography,
 Tabs,
 Grid,
 Divider,
 Image,
 Flex,
 Space,
 Button,
 Card,
 Modal,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from '../../context/TranslationContext';
import { useNavigate, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import Head from '../../components/common/header';
import Foot from '../../components/common/footer';
import useProperty from '../../hooks/useProperty';
import useEquipement from '../../hooks/useEquipement';
import MapMarker from './MapMarker';
import ReactPlayer from 'react-player';
import NearbyPlacesCarouselByType from './nearbyplacescarouselbytype';
import MapNearbyPlaces from './MapNearbyPlaces';
import { formatTimeFromDatetime } from '../../utils/utils';
import {
 getEarlyCheckInDetails,
 getAccessToPropertyDetails,
 getLateCheckOutPolicyDetails,
 getBeforeCheckOutDetails,
} from '../../utils/iconMappings';
import Print from './print';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useUserData } from '../../hooks/useUserData';
import ShareModal from '../../components/common/ShareModal';
import HouseManual from './HouseManual';
import ServiceWorkerGuest from './ServiceWorkerGuest';
import MobileTabsComponent from './MobileTabsComponent';
import NonTranslatableContent from '../../utils/NonTranslatableContent';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;
const { Meta } = Card;

const parseJSON = (str) => {
 try {
  return JSON.parse(str);
 } catch (error) {
  console.error('Failed to parse JSON:', error);
  return [];
 }
};

const ensureArray = (value) => {
 if (typeof value === 'string') {
  return parseJSON(value);
 }
 if (Array.isArray(value)) {
  return value;
 }
 return [];
};
const isValidCoordinate = (coord) => typeof coord === 'number' && !isNaN(coord);

const generateTabs = (
 isOwner,
 property,
 equipements,
 memoizedEquipements,
 navigate,
 id,
 earlyCheckInParagraphs,
 accessToPropertyParagraphs,
 validLatitude,
 validLongitude,
 parkingEquipement,
 paidparkingEquipement,
 lateCheckOutPolicyParagraphs,
 beforeCheckOutParagraphs,
 t,
 screens
) => [
 {
  key: '1',
  icon: <i className="fa-regular fa-arrow-left-to-arc"></i>,
  label: t('guidebook.tabs.arrival.title'),
  children: (
   <div>
    <Flex gap="middle" align="center" justify="space-between">
     <Divider orientation="left">
      <Text strong className="PrimaryColor" style={{ fontSize: 20 }}>
       {t('guidebook.tabs.arrival.title')}
      </Text>
     </Divider>
     {isOwner && (
      <Button
       icon={<i className="fa-regular fa-pen-to-square" />}
       onClick={() => navigate(`/editcheckin?id=${id}`)}
       type="link"
       size="Large"
       style={{ fontSize: 20, bottom: 6 }}
      />
     )}
    </Flex>
    {earlyCheckInParagraphs.length > 0 && (
     <div>
      <Row gutter={[16, 16]}>
       <Col xs={24} md={12}>
        <Paragraph strong>
         {t('guidebook.tabs.arrival.checkInTime')}
         <span className="PrimaryColor">
          {formatTimeFromDatetime(property.checkInTime)}
         </span>
        </Paragraph>
        {earlyCheckInParagraphs.map((paragraph, index) => (
         <Paragraph key={index}>{paragraph}</Paragraph>
        ))}
       </Col>
       <Col xs={24} md={12}>
        {property.frontPhoto && <Image src={property.frontPhoto} />}
       </Col>
      </Row>
     </div>
    )}
    {/* Display video if videoCheckIn is not null or empty */}
    {property.videoCheckIn && (
     <div>
      <Divider orientation="left">
       <Text strong className="PrimaryColor" style={{ fontSize: 20 }}>
        {t('guidebook.tabs.arrival.video')}
       </Text>
      </Divider>
      <ReactPlayer url={property.videoCheckIn} controls width="100%" />
     </div>
    )}
    {accessToPropertyParagraphs.length > 0 && (
     <div>
      <Divider orientation="left">
       <Text strong className="PrimaryColor" style={{ fontSize: 20 }}>
        {t('guidebook.tabs.arrival.access.title')}
       </Text>
      </Divider>
      {accessToPropertyParagraphs.map((paragraph, index) => (
       <Paragraph key={index}>{paragraph}</Paragraph>
      ))}
     </div>
    )}
    {property.guestAccessInfo && (
     <Space
      direction="vertical"
      align={screens.xs ? 'start' : 'baseline'}
      style={{ width: '100%' }}
      size={screens.xs ? 'small' : 'middle'}
     >
      <Text strong className="PrimaryColor" width={20}>
       {t('guidebook.note')}
      </Text>
      <NonTranslatableContent
       content={property.guestAccessInfo}
       style={{
        marginBottom: screens.xs ? 8 : 16,
        width: screens.xs ? '100%' : 'auto',
       }}
      />
     </Space>
    )}

    {validLatitude && validLongitude ? (
     <Divider orientation="left">
      <Text strong className="PrimaryColor" style={{ fontSize: 20 }}>
       {t('guidebook.tabs.arrival.location')}
      </Text>
     </Divider>
    ) : (
     <div>{t('guidebook.invalidCoordinates')}</div>
    )}
    {validLatitude && validLongitude && (
     <Row gutter={[16, 16]}>
      <Col
       xs={24}
       md={
        parkingEquipement && paidparkingEquipement
         ? 12 // both exist
         : parkingEquipement || paidparkingEquipement
         ? 16 // one exists
         : 24 // none exist
       }
      >
       <MapMarker latitude={property.latitude} longitude={property.longitude} />
      </Col>

      {parkingEquipement && (
       <Col xs={24} md={paidparkingEquipement ? 6 : 8}>
        <Text strong className="PrimaryColor" style={{ fontSize: 16 }}>
         {t('guidebook.tabs.arrival.parking.free')}
        </Text>
        {ReactPlayer.canPlay(parkingEquipement.media) ? (
         <ReactPlayer url={parkingEquipement.media} controls width="100%" />
        ) : (
         <>
          <Image width={'100%'} src={parkingEquipement.media} />
          <br />
          <Paragraph>{parkingEquipement.description}</Paragraph>
         </>
        )}
       </Col>
      )}
      {paidparkingEquipement && (
       <Col xs={24} md={parkingEquipement ? 6 : 8}>
        <Text strong className="PrimaryColor" style={{ fontSize: 16 }}>
         {t('guidebook.tabs.arrival.parking.paid')}
        </Text>
        {ReactPlayer.canPlay(parkingEquipement.media) ? (
         <ReactPlayer url={paidparkingEquipement.media} controls width="100%" />
        ) : (
         <>
          <Image width={'100%'} src={paidparkingEquipement.media} />
          <br />
          <Paragraph>{paidparkingEquipement.description}</Paragraph>
         </>
        )}
       </Col>
      )}
     </Row>
    )}
   </div>
  ),
 },
 {
  key: '2',
  icon: <i className="fa-regular fa-door-open"></i>,
  label: t('guidebook.tabs.manual.title'),
  children: (
   <div>
    <Flex gap="middle" align="center" justify="flex-end">
     {isOwner && (
      <Button
       icon={<i className="fa-regular fa-pen-to-square" />}
       onClick={() => navigate(`/editequipements?id=${id}`)}
       type="link"
       size="Large"
       style={{ fontSize: 20 }}
      />
     )}
    </Flex>
    {equipements.length > 0 ? (
     <HouseManual equipements={memoizedEquipements} />
    ) : (
     <div
      style={{
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'center',
      }}
     >
      {t('guidebook.noEquipements')}
     </div>
    )}
   </div>
  ),
 },
 {
  key: '3',
  icon: <i className="fa-regular fa-arrow-right-to-arc"></i>,
  label: t('guidebook.tabs.departure.title'),
  children: (
   <div>
    <Flex gap="middle" align="center" justify="space-between">
     <Divider orientation="left">
      <Text strong className="PrimaryColor" style={{ fontSize: 20 }}>
       {t('guidebook.tabs.departure.title')}
      </Text>
     </Divider>
     {isOwner && (
      <Button
       icon={<i className="fa-regular fa-pen-to-square" />}
       onClick={() => navigate(`/editcheckout?id=${id}`)}
       type="link"
       size="Large"
       style={{ fontSize: 20, bottom: 6 }}
      />
     )}
    </Flex>
    {lateCheckOutPolicyParagraphs.length > 0 && (
     <div>
      <Paragraph strong>
       {t('guidebook.tabs.departure.checkOutTime')}
       <Text strong className="PrimaryColor">
        {formatTimeFromDatetime(property.checkOutTime)}
       </Text>
      </Paragraph>
      {lateCheckOutPolicyParagraphs.map((paragraph, index) => (
       <Paragraph key={index}>{paragraph}</Paragraph>
      ))}
     </div>
    )}

    {beforeCheckOutParagraphs.length > 0 && (
     <div>
      <Divider orientation="left">
       <Text strong className="PrimaryColor" style={{ fontSize: 20 }}>
        {t('guidebook.tabs.departure.beforeLeaving')}
       </Text>
      </Divider>
      {beforeCheckOutParagraphs.map((paragraph, index) => (
       <Paragraph key={index}>{paragraph}</Paragraph>
      ))}
     </div>
    )}

    {property.additionalCheckOutInfo && (
     <Space
      direction={screens.xs ? 'vertical' : 'horizontal'}
      align={screens.xs ? 'start' : 'baseline'}
      style={{ width: '100%' }}
      size={screens.xs ? 'small' : 'middle'}
     >
      <Text strong className="PrimaryColor">
       {t('guidebook.note')}
      </Text>
      <NonTranslatableContent
       content={property.additionalCheckOutInfo}
       style={{
        marginBottom: screens.xs ? 8 : 16,
        width: screens.xs ? '100%' : 'auto',
       }}
      />
     </Space>
    )}
   </div>
  ),
 },
 {
  key: '4',
  icon: <i className="fa-regular fa-plate-utensils"></i>,
  label: t('guidebook.tabs.places.restaurants'),
  children: (
   <div>
    <MapNearbyPlaces
     latitude={property.latitude}
     longitude={property.longitude}
     type="Restaurant & Café"
    />
    <Divider />
    <NearbyPlacesCarouselByType
     latitude={property.latitude}
     longitude={property.longitude}
     type="Restaurant & Café"
    />
   </div>
  ),
 },
 {
  key: '5',
  icon: <i className="fa-regular fa-sun-cloud"></i>,
  label: t('guidebook.tabs.places.activities'),
  children: (
   <div>
    <MapNearbyPlaces
     latitude={property.latitude}
     longitude={property.longitude}
     type="Activité"
    />
    <Divider />
    <NearbyPlacesCarouselByType
     latitude={property.latitude}
     longitude={property.longitude}
     type="Activité"
    />
   </div>
  ),
 },
 {
  key: '6',
  icon: <i className="fa-regular fa-camera"></i>,
  label: t('guidebook.tabs.places.attractions'),
  children: (
   <div>
    <MapNearbyPlaces
     latitude={property.latitude}
     longitude={property.longitude}
     type="Attraction"
    />
    <Divider />
    <NearbyPlacesCarouselByType
     latitude={property.latitude}
     longitude={property.longitude}
     type="Attraction"
    />
   </div>
  ),
 },
 {
  key: '7',
  icon: <i className="fa-regular fa-store"></i>,
  label: t('guidebook.tabs.places.malls'),
  children: (
   <div>
    <MapNearbyPlaces
     latitude={property.latitude}
     longitude={property.longitude}
     type="Centre commercial"
    />
    <Divider />
    <NearbyPlacesCarouselByType
     latitude={property.latitude}
     longitude={property.longitude}
     type="Centre commercial"
    />
   </div>
  ),
 },
 {
  key: '8',
  icon: <i className="fa-regular fa-phone"></i>,
  label: t('serviceWorker.title'),
  children: (
   <div>
    <ServiceWorkerGuest propertyId={property.id} />
   </div>
  ),
 },
];

const DigitalGuidebook = () => {
 const { t } = useTranslation();
 const screens = useBreakpoint();
 const location = useLocation();
 const { hash } = queryString.parse(location.search);
 const navigate = useNavigate();
 const { user } = useAuthContext();
 const storedUser = user || JSON.parse(localStorage.getItem('user'));
 const { userData, getUserDataById, isLoading } = useUserData();
 const { property, loading, getIdFromHash, fetchProperty } = useProperty();
 const { getAllEquipements } = useEquipement();
 const [equipements, setEquipements] = useState([]);
 const [isOwner, setIsOwner] = useState(false);
 const [isShareModalVisible, setIsShareModalVisible] = useState(false);
 const [id, setId] = useState();
 const rows = 4;

 useEffect(() => {
  const fetchData = async () => {
   if (hash) {
    const numericId = await getIdFromHash(hash);
    setId(numericId);
    if (numericId) {
     await fetchProperty(numericId);
    }
   }
  };
  fetchData();
 }, [hash]);

 useEffect(() => {
  if (property.userId) {
   getUserDataById(property.userId);
  }
 }, [property.userId]);

 const fetchEquipements = async () => {
  if (id) {
   try {
    const response = await getAllEquipements(id);

    // Only update the equipements state if there are valid equipements to show
    if (response && Array.isArray(response) && response.length > 0) {
     setEquipements(response);
    }
   } catch (error) {
    console.error(t('error.equipementsFetch'), error);
   }
  }
 };

 useEffect(() => {
  fetchEquipements();
 }, [id]);

 useEffect(() => {
  if (storedUser && userData) {
   if (String(storedUser.email) === String(userData.email)) {
    setIsOwner(true);
   }
  }
 }, [storedUser, userData]);

 const parsedEquipements = useMemo(
  () => ensureArray(equipements),
  [equipements]
 );
 const parkingEquipement = useMemo(
  () =>
   parsedEquipements.find((equipement) => equipement.name === 'freeParking'),
  [parsedEquipements]
 );
 const paidparkingEquipement = useMemo(
  () =>
   parsedEquipements.find((equipement) => equipement.name === 'paidParking'),
  [parsedEquipements]
 );
 const earlyCheckInParagraphs = useMemo(
  () =>
   ensureArray(property?.earlyCheckIn).map((key) =>
    t(getEarlyCheckInDetails(key))
   ),
  [property?.earlyCheckIn, t]
 );
 const accessToPropertyParagraphs = useMemo(
  () =>
   ensureArray(property?.accessToProperty).map((key) =>
    t(getAccessToPropertyDetails(key))
   ),
  [property?.accessToProperty, t]
 );
 const lateCheckOutPolicyParagraphs = useMemo(
  () =>
   ensureArray(property?.lateCheckOutPolicy).map((key) =>
    t(getLateCheckOutPolicyDetails(key))
   ),
  [property?.lateCheckOutPolicy, t]
 );
 const beforeCheckOutParagraphs = useMemo(
  () =>
   ensureArray(property?.beforeCheckOut).map((key) =>
    t(getBeforeCheckOutDetails(key))
   ),
  [property?.beforeCheckOut, t]
 );

 const validLatitude = isValidCoordinate(property?.latitude);
 const validLongitude = isValidCoordinate(property?.longitude);

 const showShareModal = () => {
  setIsShareModalVisible(true);
 };

 const hideShareModal = () => {
  setIsShareModalVisible(false);
 };

 const pageUrl = window.location.href;

 const memoizedEquipements = useMemo(() => {
  // Transform equipements data into the required format
  return equipements.reduce((acc, equipement) => {
   acc[equipement.name] = {
    description: equipement.description,
    media: equipement.media,
    wifiName: equipement.wifiName,
    wifiPassword: equipement.wifiPassword,
   };
   return acc;
  }, {});
 }, [equipements]);

 const innerTabs = useMemo(
  () =>
   generateTabs(
    isOwner,
    property,
    equipements,
    memoizedEquipements,
    navigate,
    id,
    earlyCheckInParagraphs,
    accessToPropertyParagraphs,
    validLatitude,
    validLongitude,
    parkingEquipement,
    paidparkingEquipement,
    lateCheckOutPolicyParagraphs,
    beforeCheckOutParagraphs,
    t,
    screens
   ),
  [
   isOwner,
   property,
   equipements,
   memoizedEquipements,
   navigate,
   id,
   earlyCheckInParagraphs,
   accessToPropertyParagraphs,
   validLatitude,
   validLongitude,
   parkingEquipement,
   paidparkingEquipement,
   lateCheckOutPolicyParagraphs,
   beforeCheckOutParagraphs,
   t,
   screens,
  ]
 );

 if (loading || property.length === 0) {
  return (
   <div className="loading">
    <Spin size="large" />
   </div>
  );
 }

 return (
  <Layout className="contentStyle">
   <Head />
   <Layout className="container">
    <Content>
     {/* <Flex gap="middle" align="end" justify="space-between">
      <Button
       type="link"
       icon={<ArrowLeftOutlined />}
       onClick={() => navigate(-1)}
      >
       {t('button.back')}
      </Button>
      <Button
       icon={<i className="fa-regular fa-share-nodes" />}
       onClick={showShareModal}
      >
       {t('guidebook.share')}
      </Button>
     </Flex> */}
     <Divider type="vertical" />
     <Row gutter={[16, 16]}>
      <Col xs={24}>
       <MobileTabsComponent items={innerTabs} defaultActiveKey="1" />
      </Col>
     </Row>
    </Content>
   </Layout>
   {!screens.xs && <Foot />}
   <ShareModal
    isVisible={isShareModalVisible}
    onClose={hideShareModal}
    pageUrl={pageUrl}
   />
  </Layout>
 );
};

export default DigitalGuidebook;
