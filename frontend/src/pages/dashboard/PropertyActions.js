import React, { useState, useEffect } from 'react';
import {
 Layout,
 Image,
 Typography,
 Button,
 Space,
 Divider,
 Row,
 Col,
 Card,
 Spin,
 Flex,
 Badge,
 Popconfirm,
 message,
 List,
} from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/TranslationContext';
import useProperty from '../../hooks/useProperty';
import Head from '../../components/common/header';
import MobileNavigationBar from '../../components/common/MobileNavigationBar';
import fallback from '../../assets/fallback.png';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const PropertyActions = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const location = useLocation();
 const searchParams = new URLSearchParams(location.search);
 const hash = searchParams.get('hash');

 const [userId, setUserId] = useState(null);
 const [propertyId, setPropertyId] = useState();

 const {
  loading,
  property,
  getIdFromHash,
  fetchProperty,
  toggleEnableProperty,
  deleteProperty,
  error: propertyError,
 } = useProperty();

 // Handle user data from header
 const handleUserData = (userData) => {
  setUserId(userData);
 };

 // Fetch property data
 useEffect(() => {
  const fetchPropertyData = async () => {
   if (hash) {
    console.log(hash);
    try {
     if (hash) {
      const numericId = await getIdFromHash(hash);
      setPropertyId(numericId);
      const data = await fetchProperty(numericId);
      console.log(data);
     }
    } catch (error) {
     console.error('Error fetching property:', error);
     message.error(t('property.fetchError'));
    }
   }
  };

  fetchPropertyData();
 }, [hash, t]);

 // Handle toggle property status
 const handleToggleProperty = async (id) => {
  try {
   await toggleEnableProperty(id);
   if (!propertyError) {
    message.success(t('property.toggleSuccess'));
    // Refresh property data
    const updatedProperty = await fetchProperty(id);
   } else {
    message.error(t('property.toggleError', { error: propertyError.message }));
   }
  } catch (err) {
   message.error(t('property.toggleError', { error: err.message }));
  }
 };

 // Handle delete property
 const handleDeleteProperty = async (propertyId) => {
  try {
   await deleteProperty(propertyId);
   if (!propertyError) {
    message.success(t('messages.deleteSuccess'));
    navigate('/propertiesdashboard');
   } else {
    message.error(t('messages.deleteError', { error: propertyError.message }));
   }
  } catch (err) {
   message.error(t('messages.deleteError', { error: err.message }));
  }
 };

 if (loading) {
  return (
   <Layout className="contentStyle">
    <Head onUserData={handleUserData} />
    <Content className="container">
     <div
      style={{
       display: 'flex',
       justifyContent: 'center',
       alignItems: 'center',
       height: '50vh',
      }}
     >
      <Spin size="large" />
     </div>
    </Content>
    <MobileNavigationBar />
   </Layout>
  );
 }

 if (!property) {
  return (
   <Layout className="contentStyle">
    <Head onUserData={handleUserData} />
    <Content className="container">
     <div style={{ textAlign: 'center', marginTop: 40 }}>
      <Text>{t('property.notFound')}</Text>
      <Button
       type="primary"
       onClick={() => navigate('/propertiesdashboard')}
       style={{ marginTop: 16 }}
      >
       {t('button.back')}
      </Button>
     </div>
    </Content>
    <MobileNavigationBar />
   </Layout>
  );
 }

 // Main action buttons
 const actionButtons = [
  {
   key: 'edit',
   icon: <i className="fa-light fa-pen-to-square fa-xl" />,
   text: t('property.actions.edit'),
   onClick: () => navigate(`/property-management?hash=${property.hashId}`),
  },
  {
   key: 'guidebook',
   icon: <i className="fa-light fa-book fa-xl" />,
   text: t('property.actions.guidebook'),
   onClick: () => navigate(`/digitalguidebook?hash=${property.hashId}`),
  },
 ];

 // Booking and revenue management buttons
 const managementButtons = [
  {
   key: 'reservations',
   icon: <i className="fa-light fa-calendar-days fa-xl" />,
   text: t('reservation.title'),
   onClick: () => navigate(`/reservations?hash=${property.hashId}`),
  },
  {
   key: 'contracts',
   icon: <i className="fa-light fa-file-signature fa-xl" />,
   text: t('contracts.title'),
   onClick: () => navigate(`/contractslist?hash=${property.hashId}`),
  },
 ];

 // Operations and management buttons
 const operationsButtons = [
  {
   key: 'tasks',
   icon: <i className="fa-light fa-list-check fa-xl" />,
   text: t('tasks.title'),
   onClick: () =>
    navigate(`/propertytaskdashboard?id=${property.id}&name=${property.name}`),
  },
  {
   key: 'revenue',
   icon: <i className="fa-light fa-dollar-sign fa-xl" />,
   text: t('revenue.title'),
   onClick: () =>
    navigate(
     `/propertyrevenuedashboard?id=${property.id}&name=${property.name}`
    ),
  },
 ];

 // Administrative buttons
 const adminButtons = [
  {
   key: 'toggle',
   icon:
    property.status === 'pending' ? (
     <i className="fa-light fa-clock" style={{ color: '#d9d9d9' }} />
    ) : property.status === 'enable' ? (
     <i className="fa-light fa-lock-open" style={{ color: '#52C41A' }} />
    ) : (
     <i className="fa-light fa-lock" style={{ color: '#F5222D' }} />
    ),
   text:
    property.status === 'pending'
     ? t('property.pendingApproval')
     : property.status === 'enable'
     ? t('property.actions.disable')
     : t('property.actions.enable'),
   danger: property.status === 'enable',
   isPopconfirm: property.status !== 'pending',
   disabled: property.status === 'pending',
   confirmTitle:
    property.status === 'enable' ? t('property.disable') : t('property.enable'),
   confirmDescription: t('property.confirmToggle'),
   onConfirm: () => handleToggleProperty(property.id),
   color: property.status === 'pending' ? '#d9d9d9' : undefined,
  },
  {
   key: 'delete',
   icon: <i className="fa-light fa-trash" style={{ color: '#F5222D' }} />,
   text: t('property.actions.delete'),
   danger: true,
   isPopconfirm: true,
   confirmTitle: t('messages.deleteConfirm'),
   onConfirm: () => handleDeleteProperty(property.id),
  },
 ];

 // Render button or popconfirm button based on config
 const renderButton = (button) => {
  if (button.disabled && !button.isPopconfirm) {
   return (
    <Button
     key={button.key}
     type="text"
     icon={button.icon}
     disabled={true}
     style={{
      width: '100%',
      textAlign: 'left',
      color: '#d9d9d9',
     }}
    >
     {button.text}
    </Button>
   );
  }

  if (button.isPopconfirm) {
   return (
    <Popconfirm
     key={button.key}
     title={button.confirmTitle}
     description={button.confirmDescription}
     onConfirm={button.onConfirm}
     okText={t('common.yes')}
     cancelText={t('common.no')}
     disabled={button.disabled}
    >
     <Button
      type="text"
      icon={button.icon}
      danger={button.danger}
      disabled={button.disabled}
      style={{
       width: '100%',
       textAlign: 'left',
       color: button.disabled ? '#d9d9d9' : button.color,
      }}
     >
      {button.text}
     </Button>
    </Popconfirm>
   );
  }

  return (
   <Button
    key={button.key}
    type="text"
    icon={button.icon}
    onClick={button.onClick}
    style={{
     width: '100%',
     textAlign: 'left',
     color: button.color,
    }}
   >
    {button.text}
   </Button>
  );
 };

 return (
  <Layout className="contentStyle">
   <Head onUserData={handleUserData} />
   <Content className="container">
    <Card style={{ marginBottom: 16 }}>
     <Flex vertical>
      <Image
       src={property.frontPhoto || property.photos?.[0] || fallback}
       alt={property.name}
       style={{
        width: '100%',
        height: 200,
        objectFit: 'cover',
        borderRadius: 8,
        marginBottom: 16,
       }}
       fallback={fallback}
      />

      <Title level={4} style={{ margin: 0 }}>
       {property.name}
      </Title>

      <Space style={{ marginBottom: 8 }}>
       <Badge
        status={property.status === 'enable' ? 'success' : 'error'}
        text={t(`property.propertyStatus.${property.status}`)}
       />
       <Badge color="blue" text={t(`type.${property.type}`)} />
      </Space>

      <Paragraph
       ellipsis={{
        rows: 3,
        expandable: true,
        symbol: t('common.more'),
       }}
      >
       {property.description}
      </Paragraph>

      <Space split={<Divider type="vertical" />}>
       <Text>
        <i className="fa-light fa-location-dot" /> {property.placeName}
       </Text>
       <Text>
        <i className="fa-light fa-coins" /> {property.price}{' '}
        {t('property.basic.priceNight')}
       </Text>
      </Space>
     </Flex>
    </Card>

    <Card title={t('property.actions.main')} style={{ marginBottom: 16 }}>
     <List
      itemLayout="horizontal"
      dataSource={actionButtons}
      renderItem={renderButton}
     />
    </Card>

    <Card title={t('property.actions.bookings')} style={{ marginBottom: 16 }}>
     <List
      itemLayout="horizontal"
      dataSource={managementButtons}
      renderItem={renderButton}
     />
    </Card>

    <Card title={t('property.actions.operations')} style={{ marginBottom: 16 }}>
     <List
      itemLayout="horizontal"
      dataSource={operationsButtons}
      renderItem={renderButton}
     />
    </Card>

    <Card
     title={t('property.actions.administration')}
     style={{ marginBottom: 16 }}
    >
     <List
      itemLayout="horizontal"
      dataSource={adminButtons}
      renderItem={renderButton}
     />
    </Card>
   </Content>
   <MobileNavigationBar />
  </Layout>
 );
};

export default PropertyActions;
