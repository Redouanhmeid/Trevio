import React, { useState, useEffect, useCallback } from 'react';
import {
 Layout,
 Menu,
 Typography,
 Spin,
 Button,
 message,
 Grid,
 Drawer,
} from 'antd';
import {
 ArrowLeftOutlined,
 InfoCircleOutlined,
 ToolOutlined,
 LoginOutlined,
 LogoutOutlined,
 TeamOutlined,
 CalendarOutlined,
 RightOutlined,
 LeftOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import { useTranslation } from '../../../context/TranslationContext';
import useProperty from '../../../hooks/useProperty';
import Head from '../../../components/common/header';
import Foot from '../../../components/common/footer';

// Import all the property edit components
import PropertyInformation from './tabs/PropertyInformation';
import PropertyBasicInfo from './tabs/PropertyBasicInfo';
import PropertyPhotos from './tabs/PropertyPhotos';
import PropertyRules from './tabs/PropertyRules';
import PropertyEquipments from './tabs/PropertyEquipments';
import PropertyCheckIn from './tabs/PropertyCheckIn';
import PropertyCheckOut from './tabs/PropertyCheckOut';
import PropertyHouseManual from './tabs/PropertyHouseManual';
import ServiceWorkerManagement from '../ServiceWorkerManagement';
import PropertyICalTab from './tabs/PropertyICalTab';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const PropertyManagement = () => {
 const { t } = useTranslation();
 const location = useLocation();
 const { hash } = queryString.parse(location.search);
 const navigate = useNavigate();
 const { property, loading, getIdFromHash, fetchProperty } = useProperty();
 const [numericId, setNumericId] = useState(null);
 const [activeSection, setActiveSection] = useState('info');
 const [collapsed, setCollapsed] = useState(false);
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();
 const [refreshKey, setRefreshKey] = useState(0);
 const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

 const refreshPropertyData = useCallback(() => {
  if (numericId) {
   fetchProperty(numericId);
   setRefreshKey((prevKey) => prevKey + 1); // Increment refresh key to force re-render
  }
 }, [numericId, fetchProperty]);

 // Fetch property data using hash - only run once during initial load
 useEffect(() => {
  const fetchData = async () => {
   if (hash) {
    try {
     const id = await getIdFromHash(hash);
     setNumericId(id);
     if (id) {
      await fetchProperty(id);
     }
    } catch (error) {
     console.error('Error fetching property:', error);
     message.error(t('property.fetchError'));
    }
   }
  };
  fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [hash]); // Only depend on hash to prevent excessive re-fetching

 // Check if property data is valid before rendering content
 const isPropertyValid =
  property && property.id && Object.keys(property).length > 0;

 // Handle going back
 const handleBack = () => {
  navigate(-1);
 };

 // Handle menu selection
 const handleMenuSelect = ({ key }) => {
  setActiveSection(key);
  if (screens.xs) {
   setMobileMenuVisible(false);
  }
 };

 // Menu items
 const menuItems = [
  {
   key: 'info',
   icon: <InfoCircleOutlined />,
   label: t('property.tabs.information'),
  },
  {
   key: 'photos',
   icon: <i className="fa-light fa-images" />,
   label: t('photo.photos'),
  },
  {
   key: 'rules',
   icon: <i className="fa-light fa-list-check" />,
   label: t('property.sections.rules'),
  },
  {
   key: 'equipments',
   icon: <ToolOutlined />,
   label: t('property.tabs.equipments'),
  },
  {
   key: 'housemanual',
   icon: <i className="fa-light fa-cards" />,
   label: t('manual.title'),
  },
  {
   key: 'checkin',
   icon: <LoginOutlined />,
   label: t('checkIn.title'),
  },
  {
   key: 'checkout',
   icon: <LogoutOutlined />,
   label: t('checkOut.title'),
  },
  {
   key: 'services',
   icon: <TeamOutlined />,
   label: t('serviceWorker.title'),
  },

  {
   key: 'icals',
   icon: <CalendarOutlined />,
   label: 'iCals',
  },
 ];

 // Render the appropriate content based on the active section
 const renderContent = () => {
  if (!isPropertyValid) return null;

  // The key={refreshKey} prop ensures components re-render when property data changes
  switch (activeSection) {
   case 'info':
    return (
     <PropertyBasicInfo
      property={property}
      propertyId={numericId}
      onPropertyUpdated={refreshPropertyData}
      key={`basic-info-${refreshKey}`}
     />
    );
   case 'photos':
    return (
     <PropertyPhotos
      property={property}
      propertyId={numericId}
      onPropertyUpdated={refreshPropertyData}
      key={`photos-${refreshKey}`}
     />
    );
   case 'rules':
    return (
     <PropertyRules
      property={property}
      propertyId={numericId}
      onPropertyUpdated={refreshPropertyData}
      key={`rules-${refreshKey}`}
     />
    );
   case 'equipments':
    return (
     <PropertyEquipments
      property={property}
      propertyId={numericId}
      onPropertyUpdated={refreshPropertyData}
      key={`equipments-${refreshKey}`}
     />
    );
   case 'housemanual':
    return (
     <PropertyHouseManual
      property={property}
      propertyId={numericId}
      onPropertyUpdated={refreshPropertyData}
      key={`house-manual-${refreshKey}`}
     />
    );
   case 'checkin':
    return (
     <PropertyCheckIn
      property={property}
      propertyId={numericId}
      onPropertyUpdated={refreshPropertyData}
      key={`checkin-${refreshKey}`}
     />
    );
   case 'checkout':
    return (
     <PropertyCheckOut
      property={property}
      propertyId={numericId}
      onPropertyUpdated={refreshPropertyData}
      key={`checkout-${refreshKey}`}
     />
    );
   case 'services':
    return (
     <ServiceWorkerManagement
      propertyId={numericId}
      isOwner={true}
      onPropertyUpdated={refreshPropertyData}
      key={`services-${refreshKey}`}
     />
    );

   case 'icals':
    return (
     <PropertyICalTab
      property={property}
      propertyId={numericId}
      onPropertyUpdated={refreshPropertyData}
      key={`icals-${refreshKey}`}
     />
    );
   default:
    return (
     <PropertyInformation
      property={property}
      propertyId={numericId}
      onPropertyUpdated={refreshPropertyData}
      key={`information-${refreshKey}`}
     />
    );
  }
 };

 // If loading, show spinner
 if (loading) {
  return (
   <Layout className="contentStyle">
    <Head />
    <Content className="container">
     <div className="loading">
      <Spin size="large" />
     </div>
    </Content>
    {!screens.xs && <Foot />}
   </Layout>
  );
 }

 // If property is not loaded properly, show error
 if (!property || !property.id || Object.keys(property).length === 0) {
  return (
   <Layout className="contentStyle">
    <Head />
    <Content className="container">
     <Button type="link" icon={<ArrowLeftOutlined />} onClick={handleBack}>
      {t('button.back')}
     </Button>
     <div style={{ marginTop: 20, textAlign: 'center' }}>
      <Title level={4}>{t('common.loading')}</Title>
      <Button type="primary" onClick={() => window.location.reload()}>
       {t('common.reload')}
      </Button>
     </div>
    </Content>
    {!screens.xs && <Foot />}
   </Layout>
  );
 }

 // Render the semi-circular trigger for mobile
 const MobileTrigger = () => (
  <div
   className="mobile-menu-trigger"
   onClick={() => setMobileMenuVisible(true)}
  >
   <LeftOutlined />
  </div>
 );

 // Render the close trigger for mobile drawer
 const MobileCloseTrigger = () => (
  <div
   className="mobile-menu-close-trigger"
   onClick={() => setMobileMenuVisible(false)}
  >
   <RightOutlined />
  </div>
 );

 return (
  <Layout>
   <Head />
   <Layout>
    {screens.xs && !mobileMenuVisible && <MobileTrigger />}
    {screens.xs && (
     <Drawer
      placement="right"
      onClose={() => setMobileMenuVisible(false)}
      open={mobileMenuVisible}
      width="85%"
      headerStyle={{ display: 'none' }}
      bodyStyle={{ padding: 0, backgroundColor: '#6D5FFA' }}
      maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      closable={false}
      className="property-mobile-drawer"
     >
      {/* Close trigger for mobile */}
      <MobileCloseTrigger />

      {/* Property name and info */}
      <div
       style={{
        padding: '16px',
        borderBottom: '1px solid #3D3F52',
        color: '#fff',
        backgroundColor: '#2D2F3E',
       }}
      >
       <Title level={5} ellipsis style={{ color: '#fff', margin: 0 }}>
        {property.name}
       </Title>
       <Text type="secondary" style={{ color: '#fff' }}>
        <i className="fa-light fa-location-dot" style={{ marginRight: 4 }} />
        {property.placeName}
       </Text>
      </div>

      {/* Menu */}
      <Menu
       theme="dark"
       mode="inline"
       selectedKeys={[activeSection]}
       onSelect={handleMenuSelect}
       style={{
        borderRight: 0,
        backgroundColor: '#6D5FFA',
       }}
       items={menuItems.map((item) => ({
        ...item,
        className: 'property-mobile-menu-item',
       }))}
      />
     </Drawer>
    )}

    {/* Desktop Sidebar */}
    {!screens.xs && (
     <Sider
      width={280}
      theme="dark"
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      breakpoint="lg"
      collapsedWidth={screens.xs ? 0 : 80}
      style={{ backgroundColor: '#303342' }}
      className="sidebar-desktop"
      trigger={
       <div className="custom-trigger">
        <i
         className={`fa-regular ${
          collapsed ? 'fa-arrow-right-long' : 'fa-arrow-left-long'
         }`}
        />
       </div>
      }
     >
      {/* Property name and info */}
      {!collapsed && (
       <div
        style={{
         padding: '16px',
         borderBottom: '1px solid #f0f0f0',
         color: '#fff',
        }}
       >
        <Title level={5} ellipsis style={{ color: '#fff', margin: 0 }}>
         {property.name}
        </Title>
        <Typography.Text type="secondary" style={{ color: '#fff' }}>
         <i className="fa-light fa-location-dot" style={{ marginRight: 4 }} />
         {property.placeName}
        </Typography.Text>
       </div>
      )}

      {/* Menu */}
      <Menu
       theme="dark"
       mode="inline"
       selectedKeys={[activeSection]}
       onSelect={handleMenuSelect}
       style={{
        borderRight: 0,
        backgroundColor: '#303342',
       }}
       items={menuItems}
      />
     </Sider>
    )}
    <Layout className="contentStyle">
     <Content className="container" style={{ padding: 0 }}>
      <Layout style={{ minHeight: 'calc(100vh - 200px)', background: '#fff' }}>
       {/* Content Area */}
       <Content style={{ padding: 24, minHeight: '100vh', overflow: 'auto' }}>
        {renderContent()}
       </Content>
      </Layout>
     </Content>
     {!screens.xs && <Foot />}
    </Layout>
   </Layout>
  </Layout>
 );
};

export default PropertyManagement;
