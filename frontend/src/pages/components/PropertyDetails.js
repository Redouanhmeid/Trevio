import React, { useState, useEffect, useCallback } from 'react';
import {
 Anchor,
 Layout,
 Typography,
 Spin,
 Image,
 Divider,
 Flex,
 Tag,
 Carousel,
 Row,
 Col,
 FloatButton,
 Button,
 Card,
 List,
 Modal,
 Avatar,
 Tooltip,
 Dropdown,
 Popconfirm,
 Space,
 Rate,
 message,
} from 'antd';
import {
 ArrowLeftOutlined,
 EyeOutlined,
 SettingOutlined,
 EnvironmentOutlined,
 PhoneOutlined,
 HeartOutlined,
} from '@ant-design/icons';
import { useTranslation } from '../../context/TranslationContext';
import Head from '../../components/common/header';
import Foot from '../../components/common/footer';
import { useNavigate, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import MapMarker from './MapMarker';
import NearbyPlacesCarousel from './nearbyplacescarousel';
import { Helmet } from 'react-helmet';
import useProperty from '../../hooks/useProperty';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useUserData } from '../../hooks/useUserData';
import useEquipement from '../../hooks/useEquipement';
import ReactPlayer from 'react-player';
import airbnb from '../../assets/airbnb.png';
import booking from '../../assets/booking.png';
import { PropertyGallery } from './PropertyGallery';
import ServiceWorkerManagement from '../forms/ServiceWorkerManagement';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { Meta } = Card;

const PropertyDetails = () => {
 const location = useLocation();
 const { hash } = queryString.parse(location.search);
 const { t } = useTranslation();
 const navigate = useNavigate();
 const {
  property,
  loading,
  success,
  error,
  getIdFromHash,
  fetchProperty,
  toggleEnableProperty,
  deleteProperty,
 } = useProperty();
 const { user } = useAuthContext();
 const storedUser = user || JSON.parse(localStorage.getItem('user'));
 const { userData, getUserDataById, isLoading } = useUserData();
 const { getAllEquipements, getOneEquipement } = useEquipement();
 const [equipements, setEquipements] = useState([]);
 const [selectedEquipementDetails, setSelectedEquipementDetails] =
  useState(null);
 const [isModalVisible, setIsModalVisible] = useState(false);
 const [isEquipementsModalVisible, setIsEquipementsModalVisible] =
  useState(false);
 const [isARulesModalOpen, setIsARulesModalOpen] = useState(false);
 const [isOwner, setIsOwner] = useState(false);
 const [userId, setUserId] = useState(null);
 const [id, setId] = useState();

 const handleUserData = (userData) => {
  setUserId(userData);
 };

 const getEquipementDetails = (type, item, showARulesModal) => {
  const icons = {
   basic: {
    shower: 'fa-shower',
    jacuzzi: 'fa-hot-tub-person',
    bathtub: 'fa-bath',
    washingMachine: 'fa-washing-machine',
    dryerheat: 'fa-dryer-heat',
    vacuum: 'fa-vacuum',
    vault: 'fa-vault',
    babybed: 'fa-baby',
    television: 'fa-tv',
    speaker: 'fa-speaker',
    gameconsole: 'fa-gamepad-modern',
    oven: 'fa-oven',
    microwave: 'fa-microwave',
    coffeemaker: 'fa-coffee-pot',
    fridge: 'fa-refrigerator',
    fireburner: 'fa-fire-burner',
    heating: 'fa-temperature-arrow-up',
    airConditioning: 'fa-snowflake',
    fireplace: 'fa-fireplace',
    ceilingfan: 'fa-fan',
    tablefan: 'fa-fan-table',
    fingerprint: 'fa-fingerprint',
    lockbox: 'fa-lock-hashtag',
    parkingaccess: 'fa-square-parking',
    wifi: 'fa-wifi',
    dedicatedworkspace: 'fa-chair-office',
    freeParking: 'fa-circle-parking',
    paidParking: 'fa-square-parking',
    pool: 'fa-water-ladder',
    garbageCan: 'fa-trash-can',
    soap: 'fa-soap',
    hotwater: 'fa-heat',
    basicequipement: 'fa-box-open',
    blankets: 'fa-blanket',
    mattresspillow: 'fa-mattress-pillow',
    cameras: 'fa-camera-cctv',
    kitchen: 'fa-sink',
    kitchenset: 'fa-kitchen-set',
    coffeepot: 'fa-coffee-pot',
   },
   rules: {
    noNoise: 'fa-volume-slash',
    noFoodDrinks: 'fa-utensils-slash',
    noParties: 'fa-champagne-glasses',
    noSmoking: 'fa-ban-smoking',
    noPets: 'fa-paw-simple',
    noUnmarriedCouple: 'fa-ban',
    additionalRules: 'fa-circle-info',
   },
  };

  const getTranslationKey = (type, item) => {
   // Use the appropriate translation namespace based on the type
   const namespace = type === 'basic' ? 'equipement' : 'rules';
   return `${namespace}.${item}`;
  };

  const safeTranslation = (key) => {
   try {
    const translation = t(key);
    // Check if translation is missing (often returns the key itself)
    if (translation === key || translation.startsWith('Translation missing')) {
     // Use a fallback by converting camelCase to Title Case
     return item
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
    }
    return translation;
   } catch (error) {
    console.warn(`Translation error for key: ${key}`, error);
    // Fallback to formatted item name
    return item
     .replace(/([A-Z])/g, ' $1')
     .replace(/^./, (str) => str.toUpperCase());
   }
  };

  const getIcon = (iconType, iconItem) => {
   const iconClass = icons[iconType]?.[iconItem] || 'fa-question';
   if (iconType === 'rules' && iconItem === 'additionalRules') {
    return (
     <i
      className={`fa-regular ${iconClass} fa-xl`}
      onClick={showARulesModal}
      style={{ color: '#aa7e42', cursor: 'pointer' }}
     />
    );
   }
   return <i className={`PrimaryColor fa-regular ${iconClass} fa-xl`} />;
  };
  const getTitle = (titleType, titleItem) => {
   const translationKey = getTranslationKey(titleType, titleItem);
   if (titleType === 'rules' && titleItem === 'additionalRules') {
    return (
     <span
      onClick={showARulesModal}
      style={{ color: '#aa7e42', cursor: 'pointer' }}
     >
      {safeTranslation(translationKey)}
     </span>
    );
   }
   return safeTranslation(translationKey);
  };

  return {
   avatar: getIcon(type, item),
   title: getTitle(type, item),
  };
 };

 const toggleEnable = async () => {
  await toggleEnableProperty(id);
  if (!error) {
   message.success('Propriété activer avec succès.');
  } else {
   message.error(
    `Erreur lors de la activation de la propriété: ${error.message}`
   );
  }
 };

 const confirmDelete = async () => {
  await deleteProperty(id);
  if (!error) {
   message.success('Propriété supprimée avec succès.');
   navigate(`/dashboard`);
  } else {
   message.error(
    `Erreur lors de la suppression de la propriété: ${error.message}`
   );
  }
 };

 const cancelDelete = () => {
  message.error('Opération de suppression annulée.');
 };

 const showARulesModal = () => {
  setIsARulesModalOpen(true);
 };
 const handleARulesCancel = () => {
  setIsARulesModalOpen(false);
 };

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
  if (userId) {
   getUserDataById(userId);
  }
 }, [userId]);

 useEffect(() => {
  if (storedUser && userData) {
   if (String(storedUser.email) === String(userData.email)) {
    setIsOwner(true);
   }
  }
 }, [storedUser, userData]);

 useEffect(() => {
  const fetchData = async (id) => {
   try {
    const data = await getAllEquipements(id);
    // Ensure data is an array before setting it
    if (data && Array.isArray(data)) {
     setEquipements(data);
    } else {
     // If data is not an array, set an empty array instead
     console.warn('Equipements data is not an array:', data);
     setEquipements([]);
    }
   } catch (error) {
    console.error('Error fetching equipements:', error);
    setEquipements([]);
   }
  };

  if (property.id) {
   fetchData(property.id);
  }
 }, [property.id]);

 const hasEquipement = (equipementName) => {
  return (
   Array.isArray(equipements) &&
   equipements.some((equipement) => equipement.name === equipementName)
  );
 };

 const goBack = () => {
  navigate(-1);
 };

 const nearbyPlace = () => {
  navigate('/createnearbyplace');
 };

 const AddEquipement = (equipement) => {
  navigate('/addequipement', {
   state: { equipement: equipement, id: property.id },
  });
 };

 const EditEquipement = (id) => {
  navigate('/editequipement', { state: { id } });
 };

 const showModal = async (equipementName) => {
  const equipement = equipements.find((a) => a.name === equipementName);
  if (equipement) {
   const equipementDetails = await getOneEquipement(equipement.id);
   setSelectedEquipementDetails(equipementDetails);
   setIsModalVisible(true);
  }
 };

 const handleOk = () => {
  setIsModalVisible(false);
  setSelectedEquipementDetails(null);
 };

 const handleCancel = () => {
  setIsModalVisible(false);
 };

 const showEquipementsModal = () => {
  setIsEquipementsModalVisible(true);
 };

 // Hide modal handler
 const handleEquipementsOk = () => {
  setIsEquipementsModalVisible(false);
 };

 const handleEquipementsCancel = () => {
  setIsEquipementsModalVisible(false);
 };
 // Utility to parse JSON strings safely
 const parseJSON = (str) => {
  try {
   return JSON.parse(str);
  } catch (error) {
   console.error('Failed to parse JSON:', error);
   return [];
  }
 };
 function scrollToAnchor(anchorId) {
  const element = document.getElementById(anchorId);
  if (element) {
   element.scrollIntoView({ behavior: 'smooth' });
  }
 }

 // Parse properties if they are strings
 const parsedProperty = {
  ...property,
  photos:
   typeof property.photos === 'string'
    ? parseJSON(property.photos)
    : property.photos,
  basicEquipements:
   typeof property.basicEquipements === 'string'
    ? parseJSON(property.basicEquipements)
    : property.basicEquipements,
  houseRules:
   typeof property.houseRules === 'string'
    ? parseJSON(property.houseRules)
    : property.houseRules,
 };

 if (loading || property.length === 0) {
  return (
   <div className="loading">
    <Spin size="large" />
   </div>
  );
 }

 return (
  <>
   <Helmet>
    <link
     rel="stylesheet"
     href="https://site-assets.fontawesome.com/releases/v6.4.2/css/all.css"
    />
   </Helmet>
   <Layout className="contentStyle">
    <div className="mobile-hide">
     <Head onUserData={handleUserData} />
    </div>
    <Content className="container">
     <br />
     <br />
     <div className="nav-container">
      <Anchor
       direction="horizontal"
       className="custom-anchor"
       targetOffset={75}
       onClick={(e, link) => {
        e.preventDefault();
        scrollToAnchor(link.href.slice(1));
       }}
       items={[
        {
         key: '1',
         href: '#desc',
         title: (
          <div className="anchor-item">
           <i className="PrimaryColor Anchoricon fa-regular fa-square-info" />
           <span>{t('property.sections.info')}</span>
          </div>
         ),
        },
        {
         key: '2',
         href: '#rules',
         title: (
          <div className="anchor-item">
           <i className="PrimaryColor Anchoricon fa-regular fa-bullhorn" />
           <span>{t('property.sections.rules')}</span>
          </div>
         ),
        },
        {
         key: '3',
         href: '#manuelle',
         title: (
          <div className="anchor-item">
           <i className="PrimaryColor Anchoricon fa-regular fa-book-open" />
           <span>{t('property.sections.manual')}</span>
          </div>
         ),
        },
        {
         key: '4',
         href: '#map&nearbyplaces',
         title: (
          <div className="anchor-item">
           <i className="PrimaryColor Anchoricon fa-regular fa-map-marker-alt" />
           <span>{t('property.sections.nearby')}</span>
          </div>
         ),
        },
       ]}
      />
     </div>

     {!isLoading && (userData.role === 'user' || userData.role === 'admin') && (
      <FloatButton
       icon={<i className="fa-regular fa-location-plus" />}
       tooltip={<div>{t('nearbyPlace.add')}</div>}
       type="primary"
       onClick={nearbyPlace}
      />
     )}
     <Row gutter={[16, 4]}>
      <Col xs={24} md={10} id="desc">
       <PropertyGallery images={parsedProperty.photos} t={t} />
       {isOwner && (
        <Button
         icon={<i className="fa-regular fa-pen-to-square" />}
         onClick={() => navigate(`/editphotos?id=${id}`)}
         type="link"
         style={{
          position: 'absolute',
          right: 15,
          top: 15,
          fontSize: 16,
          color: '#2b2c32',
         }}
        />
       )}
      </Col>
      <Col xs={24} md={14}>
       <Card
        className="property-card"
        extra={
         isOwner && (
          <Button
           icon={<i className="fa-regular fa-pen-to-square" />}
           onClick={() => navigate(`/editbasicinfo?id=${id}`)}
           type="link"
           size="Large"
           style={{ fontSize: 16, color: '#2b2c32' }}
          />
         )
        }
       >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
         {/* Header Section */}
         <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
          <Title level={2} style={{ margin: 0 }}>
           {parsedProperty.name}
          </Title>
          <Space>
           <Text style={{ fontSize: 20 }}>4.3</Text>
           <Rate
            disabled
            defaultValue={4.3}
            count={1}
            style={{ fontSize: 20 }}
           />
          </Space>
         </Space>

         {/* Location */}
         <Space>
          <i className="PrimaryColor Cardicon fa-regular fa-location-dot"></i>
          <Text style={{ fontSize: 22 }}>{parsedProperty.placeName}</Text>
         </Space>

         {/* Description */}
         <Paragraph>{parsedProperty.description}</Paragraph>

         {/* Price */}
         <Space align="baseline" wrap>
          <Text className="price-text">{parsedProperty.price} Dhs</Text>
          <Text className="price-text-secondary" type="secondary">
           {t('property.basic.priceNight')}
          </Text>
         </Space>

         {/* Equipements */}
         <Space>
          <Tag
           className="tag-style"
           icon={<i className="tag-icon-style fa-regular fa-bed-front" />}
          >
           {parsedProperty.rooms} {t('property.basic.rooms')}
          </Tag>
          <Tag
           className="tag-style"
           icon={<i className="tag-icon-style fa-regular fa-users" />}
          >
           {parsedProperty.capacity} {t('property.basic.people')}
          </Tag>
          <Tag
           className="tag-style"
           icon={<i className="tag-icon-style fa-regular fa-bed" />}
          >
           {parsedProperty.beds} {t('property.basic.beds')}
          </Tag>
         </Space>

         {/* Host Section */}
         {!isLoading && (
          <div className="host-section">
           <Space>
            <Avatar
             size={80}
             src={userData.avatar}
             onClick={() => navigate('/profile')}
            />
            <Space direction="vertical" size={0} style={{ marginLeft: 8 }}>
             <Text strong>{`${userData.firstname} ${userData.lastname}`}</Text>
             <Text type="secondary">{userData.email}</Text>
            </Space>
           </Space>
           <Space size="large">
            {userData.phone !== 'N/A' && (
             <Tooltip title={`${userData.phone}`}>
              <a
               href={`tel:${userData.phone}`}
               style={{ textDecoration: 'none' }}
              >
               <i className="PrimaryColor Hosticon fa-regular fa-phone" />
              </a>
             </Tooltip>
            )}
            {property.airbnbUrl && (
             <Image
              width={40}
              src={airbnb}
              preview={false}
              style={{ borderRadius: 0 }}
              onClick={() => window.open(property.airbnbUrl, '_blank')}
             />
            )}
            {property.bookingUrl && (
             <Image
              width={40}
              src={booking}
              preview={false}
              onClick={() => window.open(property.bookingUrl, '_blank')}
             />
            )}
           </Space>
          </div>
         )}
        </Space>
       </Card>
      </Col>

      <Divider id="rules" />
      {parsedProperty.houseRules && (
       <Col xs={24} sm={24}>
        <Title level={3}>
         {t('property.sections.rules')}{' '}
         <i className="PrimaryColor fa-regular fa-bullhorn" />
        </Title>
        {isOwner && (
         <Button
          icon={<i className="fa-regular fa-pen-to-square" />}
          onClick={() => navigate(`/edithouserules?id=${id}`)}
          type="link"
          style={{
           position: 'absolute',
           right: 15,
           top: 15,
           fontSize: 16,
           color: '#2b2c32',
          }}
         />
        )}
        <br />
        <Row gutter={[0, 16]}>
         {parsedProperty.houseRules.map((houseRule, index) => {
          if (houseRule.startsWith('additionalRules:')) {
           const { avatar, title } = getEquipementDetails(
            'rules',
            'additionalRules',
            showARulesModal
           );
           return (
            <Col xs={24} md={4} key={index} style={{ maxWidth: '100%' }}>
             <Card
              bordered={false}
              hoverable={false}
              cover={avatar}
              style={{ width: '100%', textAlign: 'center' }}
             >
              <Meta title={title} />
             </Card>
            </Col>
           );
          } else {
           const { avatar, title } = getEquipementDetails(
            'rules', // Change from 'houseRules' to 'rules'
            houseRule,
            showARulesModal
           );
           return (
            <Col xs={24} md={4} key={index} style={{ maxWidth: '100%' }}>
             <Card
              bordered={false}
              hoverable={false}
              cover={avatar}
              style={{ width: '100%', textAlign: 'center' }}
             >
              <Meta title={title} />
             </Card>
            </Col>
           );
          }
         })}
        </Row>
       </Col>
      )}

      <Divider id="manuelle" />
      {parsedProperty.basicEquipements && (
       <Col xs={24} sm={24}>
        <Flex justify="space-between" align="center">
         <Title level={3}>
          {t('property.sections.manual')}{' '}
          <i className="PrimaryColor fa-regular fa-book-open" />
         </Title>
         <Button type="default" onClick={showEquipementsModal}>
          {t('button.showAllEquipement')}
         </Button>
        </Flex>
        <br />
        <Row gutter={[16, 0]}>
         {parsedProperty.basicEquipements
          .slice(0, 6)
          .map((equipement, index) => {
           const { avatar, title } = getEquipementDetails('basic', equipement);
           const equipementExists = hasEquipement(equipement);
           return (
            <Col xs={24} md={8} key={index} style={{ textAlign: 'left' }}>
             <Card
              bordered={false}
              cover={avatar}
              style={{
               display: 'flex',
               alignItems: 'center',
              }}
             >
              <Meta title={title} />
             </Card>
            </Col>
           );
          })}
        </Row>

        {selectedEquipementDetails && (
         <Modal
          title="Commodité"
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={
           isOwner && (
            <Button
             icon={<SettingOutlined />}
             type="primary"
             onClick={() => EditEquipement(selectedEquipementDetails.id)}
            >
             {t('property.actions.editCard')}
            </Button>
           )
          }
         >
          <Flex vertical align="center">
           {ReactPlayer.canPlay(selectedEquipementDetails.media) ? (
            <ReactPlayer
             url={selectedEquipementDetails.media}
             controls
             width="100%"
             height={300}
            />
           ) : (
            <Image
             width={300}
             src={selectedEquipementDetails.media}
             preview={false}
            />
           )}
           <br />
           <Text>{selectedEquipementDetails.description}</Text>
           {selectedEquipementDetails.name === 'wifi' && (
            <>
             <Divider>
              <Text strong>{t('property.accessWifi')}</Text>
             </Divider>
             <Text>
              {t('property.networkName')}: {selectedEquipementDetails.wifiName}
             </Text>
             <Text>
              {t('property.password')}: {selectedEquipementDetails.wifiPassword}
             </Text>
            </>
           )}
          </Flex>
         </Modal>
        )}
       </Col>
      )}
      <Divider id="map&nearbyplaces" />
      <Col xs={24} sm={24}>
       <Title level={3}>
        {t('property.accommodationLocated')}{' '}
        <i className="PrimaryColor fa-regular fa-map-location-dot" />
       </Title>
       <MapMarker
        latitude={parsedProperty.latitude}
        longitude={parsedProperty.longitude}
       />
      </Col>
      <Col xs={24}>
       <NearbyPlacesCarousel
        latitude={parsedProperty.latitude}
        longitude={parsedProperty.longitude}
       />
      </Col>
      <Divider id="serviceWorkers" />
      {isOwner && (
       <Col xs={24} sm={24}>
        <Title level={3}>
         {t('serviceWorker.title')}{' '}
         <i className="PrimaryColor fa-regular fa-phone" />
        </Title>
        <ServiceWorkerManagement propertyId={id} isOwner={isOwner} />
       </Col>
      )}
      {isOwner && (
       <Button
        type="primary"
        icon={<i className="fa-regular fa-users-gear" />}
        onClick={() => navigate(`/service-workers?hash=${hash}`)}
        style={{ marginTop: 16 }}
       >
        {t('serviceWorker.title')}
       </Button>
      )}
     </Row>
     <div style={{ marginBottom: 100 }} />
    </Content>
    <Foot />
   </Layout>
   <Modal
    title={t('rules.additionalRules')}
    open={isARulesModalOpen}
    onCancel={handleARulesCancel}
    footer={null}
   >
    <p>
     {(() => {
      const rule = parsedProperty.houseRules.find((rule) =>
       rule.startsWith('additionalRules:')
      );
      return rule
       ? rule.substring(16).trim()
       : 'Aucune règle supplémentaire trouvée';
     })()}
    </p>
   </Modal>

   <Modal
    title="Équipements"
    open={isEquipementsModalVisible}
    onOk={handleEquipementsOk}
    onCancel={handleEquipementsCancel}
    footer={[
     isOwner && (
      <Button
       key="edit"
       type="primary"
       onClick={() => navigate(`/editequipements?id=${id}`)}
       icon={<i className="fa-regular fa-pen-to-square" />}
      >
       {t('property.actions.modifyEquipement')}
      </Button>
     ),
     <Button key="back" onClick={handleEquipementsCancel}>
      OK
     </Button>,
    ]}
   >
    <List
     itemLayout="horizontal"
     dataSource={parsedProperty.basicEquipements}
     renderItem={(equipement) => {
      const { avatar, title } = getEquipementDetails('basic', equipement);
      const equipementExists = hasEquipement(equipement);
      return (
       <List.Item
        actions={[
         <a
          key="list-voir"
          onClick={() =>
           isOwner &&
           (equipementExists
            ? showModal(equipement)
            : AddEquipement(equipement))
          }
         >
          {isOwner &&
           (equipementExists
            ? t('property.actions.viewCard')
            : t('property.actions.addCard'))}
         </a>,
        ]}
       >
        {isOwner ? (
         <List.Item.Meta avatar={avatar} title={title} />
        ) : (
         <List.Item.Meta avatar={avatar} title={title} />
        )}
       </List.Item>
      );
     }}
    />
   </Modal>
  </>
 );
};

export default PropertyDetails;
