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
 message,
} from 'antd';
import {
 ArrowLeftOutlined,
 PlusOutlined,
 EyeOutlined,
 SettingOutlined,
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

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { Meta } = Card;

const PropertyDetails = () => {
 const location = useLocation();
 const { id } = queryString.parse(location.search);
 const { t } = useTranslation();
 const navigate = useNavigate();
 const {
  property,
  loading,
  success,
  error,
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
 const [imageAspectRatios, setImageAspectRatios] = useState({});

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

  const details = {
   basic: {
    [item]: {
     avatar: <i className={`fa-light ${icons.basic[item]} fa-xl`} />,
     title: t(`equipement.${item}`),
    },
   },
   houseRules: {
    [item]: {
     avatar:
      item === 'additionalRules' ? (
       <i
        className={`fa-light ${icons.rules[item]} fa-xl`}
        onClick={showARulesModal}
        style={{ color: '#aa7e42', cursor: 'pointer' }}
       />
      ) : (
       <i className={`fa-light ${icons.rules[item]} fa-xl`} />
      ),
     title:
      item === 'additionalRules' ? (
       <span
        onClick={showARulesModal}
        style={{ color: '#aa7e42', cursor: 'pointer' }}
       >
        {t('rules.additional')}
       </span>
      ) : (
       t(`rules.${item}`)
      ),
    },
   },
  };

  return details[type]?.[item] || { avatar: null, title: '' };
 };

 const handleImageLoad = (e, index) => {
  const { naturalWidth, naturalHeight } = e.target;
  const aspectRatio = naturalHeight > naturalWidth && 'portrait';

  setImageAspectRatios((prevState) => {
   const newState = {
    ...prevState,
    [index]: aspectRatio,
   };
   return newState;
  });
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

 const actionsItems = [
  {
   key: '1',
   label: (
    <a href={`/digitalguidebook?id=${id}`}>
     <i className="fa-light fa-house-lock" /> {t('property.actions.guidebook')}
    </a>
   ),
  },
  {
   key: '2',
   label: (
    <a href={`/guestform?id=${id}`}>
     <i className="fa-light fa-file-signature" />{' '}
     {t('property.actions.guestForm')}
    </a>
   ),
  },

  {
   key: '3',
   label: (
    <a href={`/contractslist?id=${id}`}>
     <i className="fa-light fa-list-check" /> {t('property.actions.contracts')}
    </a>
   ),
  },
  {
   key: '4',
   label: (
    <div onClick={toggleEnable}>
     {property.status === 'enable' ? (
      <Text type="danger">
       <i className="fa-light fa-lock" /> {t('property.actions.enable')}
      </Text>
     ) : (
      <Text type="success">
       <i className="fa-light fa-lock-open" /> {t('property.actions.disable')}
      </Text>
     )}
    </div>
   ),
  },
  {
   key: '5',
   label: (
    <Popconfirm
     title={t('property.actions.delete')}
     description={t('messages.deleteConfirm')}
     onConfirm={confirmDelete}
     onCancel={cancelDelete}
     okText="Oui"
     cancelText="Non"
    >
     <a>
      <i className="fa-light fa-trash-can" /> {t('property.actions.delete')}
     </a>
    </Popconfirm>
   ),
  },
 ];

 const showARulesModal = () => {
  setIsARulesModalOpen(true);
 };
 const handleARulesCancel = () => {
  setIsARulesModalOpen(false);
 };

 useEffect(() => {
  fetchProperty(id);
 }, [loading]);

 useEffect(() => {
  if (property.userId) {
   getUserDataById(property.userId);
  }
 }, [property.userId]);

 useEffect(() => {
  if (storedUser && userData) {
   if (String(storedUser.email) === String(userData.email)) {
    setIsOwner(true);
   }
  }
 }, [storedUser, userData]);

 useEffect(() => {
  const fetchData = async (id) => {
   const data = await getAllEquipements(id);
   if (data) {
    setEquipements(data);
   }
  };
  if (property.id) {
   fetchData(property.id);
  }
 }, [property.id]);

 const hasEquipement = (equipementName) => {
  return equipements.some((equipement) => equipement.name === equipementName);
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
    {!isLoading && (
     <Card
      className="fixed-bottom-card host-card-mobile"
      style={{ width: '100%', marginTop: 16 }}
      loading={loading}
      actions={[
       userData.phone !== 'N/A' && (
        <Tooltip title={`${userData.phone}`}>
         <a href={`tel:${userData.phone}`} style={{ textDecoration: 'none' }}>
          <i className="Hosticon fa-light fa-mobile" />
         </a>
        </Tooltip>
       ),
       property.airbnbUrl && (
        <Image
         width={32}
         src={airbnb}
         preview={false}
         onClick={() => window.open(property.airbnbUrl, '_blank')}
        />
       ),
       property.bookingUrl && (
        <Image
         width={32}
         src={booking}
         preview={false}
         onClick={() => window.open(property.bookingUrl, '_blank')}
        />
       ),
      ].filter(Boolean)}
     >
      <Meta
       avatar={
        <Avatar
         size={{ xs: 54, md: 56, lg: 56, xl: 56, xxl: 56 }}
         src={userData.avatar}
         onClick={() => navigate('/profile')}
        />
       }
       title={`${userData.firstname} ${userData.lastname}`}
       description={
        <>
         <i className="fa-light fa-envelope" /> {userData.email}
        </>
       }
      />
     </Card>
    )}
    <div className="mobile-hide">
     <Head />
    </div>
    <Layout>
     <div style={{ padding: '20px' }}>
      <Anchor
       direction="horizontal"
       className="custom-anchor"
       onClick={(e, link) => {
        e.preventDefault();
        scrollToAnchor(link.href.slice(1));
       }}
       items={[
        {
         key: '1',
         href: '#desc',
         title: (
          <div
           style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
           }}
          >
           <i className="Anchoricon fa-light fa-square-info" />
           <span>{t('property.sections.info')}</span>
          </div>
         ),
        },
        {
         key: '2',
         href: '#manuelle',
         title: (
          <div
           style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
           }}
          >
           <i className="Anchoricon fa-light fa-wifi" />
           <span>{t('property.sections.manual')}</span>
          </div>
         ),
        },
        {
         key: '3',
         href: '#map&nearbyplaces',
         title: (
          <div
           style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
           }}
          >
           <i className="Anchoricon fa-light fa-map-marker-alt" />
           <span>{t('property.sections.nearby')}</span>
          </div>
         ),
        },
        {
         key: '4',
         href: '#rules',
         title: (
          <div
           style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
           }}
          >
           <i className="Anchoricon fa-light fa-ban-smoking" />
           <span>{t('property.sections.rules')}</span>
          </div>
         ),
        },
       ]}
      />
     </div>
     <Content className="container-poperty-details">
      <Flex gap="middle" align="start" justify="space-between">
       <Button
        type="default"
        shape="round"
        icon={<ArrowLeftOutlined />}
        onClick={goBack}
       >
        {t('button.back')}
       </Button>
       <div>
        {isOwner && (
         <Dropdown.Button
          menu={{
           items: actionsItems,
          }}
          className="right-button"
         >
          {t('property.actions.actions')}
         </Dropdown.Button>
        )}
        {success && <p>{t('property.messages.success')}</p>}
        {error && (
         <p>
          {t('property.messages.error')}
          {error.message}
         </p>
        )}
       </div>
      </Flex>
      {!isLoading &&
       (userData.role === 'user' || userData.role === 'admin') && (
        <FloatButton
         icon={<i className="fa-light fa-location-plus" />}
         tooltip={<div>{t('nearbyPlace.add')}</div>}
         type="primary"
         onClick={nearbyPlace}
        />
       )}
      <Row gutter={[16, 4]}>
       <Col xs={24} sm={12} id="desc">
        <div style={{ maxWidth: '100%', margin: '12px 0 0 0' }}>
         <Carousel autoplay effect="fade" className="propertydtcarousel">
          {Array.isArray(parsedProperty.photos) &&
           parsedProperty.photos.map((photo, index) => (
            <div key={index}>
             <Image
              src={photo}
              className={`card-image ${imageAspectRatios[index]}`}
              onLoad={(e) => handleImageLoad(e, index)}
             />
            </div>
           ))}
         </Carousel>
        </div>
        {isOwner && (
         <Button
          icon={<i className="fa-light fa-pen-to-square" />}
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
       <Col xs={24} sm={12}>
        <Flex gap="middle" align="center" justify="space-between">
         <Title level={2}>{parsedProperty.name}</Title>
         {isOwner && (
          <Button
           icon={<i className="fa-light fa-pen-to-square" />}
           onClick={() => navigate(`/editbasicinfo?id=${id}`)}
           type="link"
           size="Large"
           style={{ fontSize: 16, color: '#2b2c32' }}
          />
         )}
        </Flex>
        <Title level={3}>
         {parsedProperty.price} {t('property.basic.priceNight')}
        </Title>
        <Flex gap="4px 0" wrap>
         <Tag icon={<i className="tag-icon-style fa-light fa-bed-front" />}>
          {parsedProperty.rooms} {t('property.basic.rooms')}
         </Tag>
         <Tag icon={<i className="tag-icon-style fa-light fa-users" />}>
          {parsedProperty.capacity} {t('property.basic.people')}
         </Tag>
         <Tag icon={<i className="tag-icon-style fa-light fa-bed" />}>
          {parsedProperty.beds} {t('property.basic.beds')}
         </Tag>
        </Flex>
        <Divider />
        <Paragraph>{parsedProperty.description}</Paragraph>
        <Card
         className="host-card"
         style={{ width: '100%', marginTop: 16 }}
         loading={loading}
         actions={[
          userData.phone !== 'N/A' && (
           <Tooltip title={`${userData.phone}`}>
            <a
             href={`tel:${userData.phone}`}
             style={{ textDecoration: 'none' }}
            >
             <i className="Hosticon fa-light fa-mobile" />
            </a>
           </Tooltip>
          ),
          property.airbnbUrl && (
           <Image
            width={32}
            src={airbnb}
            preview={false}
            onClick={() => window.open(property.airbnbUrl, '_blank')}
           />
          ),
          property.bookingUrl && (
           <Image
            width={32}
            src={booking}
            preview={false}
            onClick={() => window.open(property.bookingUrl, '_blank')}
           />
          ),
         ].filter(Boolean)}
        >
         <Meta
          avatar={
           <Avatar
            size={{ xs: 54, md: 56, lg: 56, xl: 56, xxl: 56 }}
            src={userData.avatar}
            onClick={() => navigate('/profile')}
           />
          }
          title={`${userData.firstname} ${userData.lastname}`}
          description={
           <>
            <i className="fa-light fa-envelope" /> {userData.email}
           </>
          }
         />
        </Card>
       </Col>

       <Divider id="manuelle" />
       {parsedProperty.basicEquipements && (
        <Col xs={24} sm={24}>
         <Title level={3}>{t('property.sections.manual')}:</Title>
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
          <Col xs={24} md={24}>
           <Button
            style={{ marginTop: 24 }}
            type="default"
            size="large"
            onClick={showEquipementsModal}
           >
            {t('button.showAllEquipement')}
           </Button>
          </Col>
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
               {t('property.password')}:{' '}
               {selectedEquipementDetails.wifiPassword}
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
        <Title level={3}>{t('property.accommodationLocated')}</Title>
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

       <Divider id="rules" />
       {parsedProperty.houseRules && (
        <Col xs={24} sm={24}>
         <Title level={3}>{t('property.sections.rules')}:</Title>
         {isOwner && (
          <Button
           icon={<i className="fa-light fa-pen-to-square" />}
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
           const { avatar, title } = getEquipementDetails(
            'houseRules',
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
          })}
         </Row>
        </Col>
       )}
      </Row>
      <div style={{ marginBottom: 100 }} />
     </Content>
    </Layout>
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
       icon={<i className="fa-light fa-pen-to-square" />}
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
