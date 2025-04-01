import React, { useState, useEffect } from 'react';
import Head from '../components/common/header';
import Foot from '../components/common/footer';
import {
 Layout,
 Typography,
 Divider,
 Flex,
 Button,
 Spin,
 Card,
 Col,
 Row,
 Statistic,
 Anchor,
 message,
} from 'antd';
import '../App.css';
import { useAuthContext } from '../hooks/useAuthContext';
import { useUserData } from '../hooks/useUserData';
import { useTranslation } from '../context/TranslationContext';
import { useNavigate } from 'react-router-dom';
import useProperty from '../hooks/useProperty';
import useRevenue from '../hooks/useRevenue';
import { useConcierge } from '../hooks/useConcierge';
import { TasksSection } from './TasksSection';
import { RevenusSection } from './RevenusSection';
import { PropertiesSection } from './PropertiesSection';
import { ConciergesSection } from './ConciergesSection';
import AddPropertyCard from './components/AddPropertyCard';
import useTask from '../hooks/useTask';
import ManagedPropertiesSection from './ManagedPropertiesSection';
import ReservationsSection from './ReservationsSection';

const { Content } = Layout;
const { Title } = Typography;

const Dashboard = () => {
 const { user } = useAuthContext();
 const { isLoading, userData, getUserData } = useUserData();
 const User = user || JSON.parse(localStorage.getItem('user'));
 const { t } = useTranslation();
 const navigate = useNavigate();
 const {
  properties,
  error,
  fetchPropertiesbyClient,
  toggleEnableProperty,
  deleteProperty,
 } = useProperty();
 const { getAnnualRevenue } = useRevenue();
 const { getClientConcierges, getConciergeProperties } = useConcierge();
 const { getUserTasks } = useTask();
 const [concierges, setConcierges] = useState([]);
 const [userAssignedProperties, setUserAssignedProperties] = useState([]);

 useEffect(() => {
  if (user) {
   getUserData(User.email);
  }
 }, [user]);

 useEffect(() => {
  if (userData.id) {
   fetchPropertiesbyClient(userData.id);
  }
 }, [isLoading]);

 const [userId, setUserId] = useState(null);
 const [tasks, setTasks] = useState([]);
 const [propertyRevenues, setPropertyRevenues] = useState({});
 const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

 const handleUserData = (userData) => {
  setUserId(userData);
 };

 const fetchTasks = async () => {
  try {
   const fetchedTasks = await getUserTasks(userId);
   setTasks(fetchedTasks || []);
  } catch (err) {
   console.error(t('error.tasksFetch'), err);
  }
 };

 const fetchAllPropertyRevenues = async () => {
  const revenues = {};

  const fetchPromises = properties.map(async (property) => {
   try {
    const revenue = await getAnnualRevenue(property.id, selectedYear);
    revenues[property.id] = revenue?.totalRevenue || 0;
   } catch (err) {
    console.error(t('error.revenueFetch', { id: property.id }), err);
    revenues[property.id] = 0;
   }
  });

  await Promise.all(fetchPromises);
  setPropertyRevenues(revenues);
 };

 // Fetch properties assigned to the current user (when they are a concierge)
 const fetchUserAssignedProperties = async () => {
  try {
   if (userData && userData.id) {
    const assignedProps = await getConciergeProperties(userData.id);
    // Filter only active assignments
    const activeAssignedProps = assignedProps.filter(
     (prop) => prop.status === 'active'
    );
    setUserAssignedProperties(activeAssignedProps);
   }
  } catch (err) {
   console.error('Error fetching properties assigned to current user:', err);
   setUserAssignedProperties([]);
  }
 };

 const fetchConcierges = async () => {
  try {
   const fetchedConcierges = await getClientConcierges(userId);
   setConcierges(fetchedConcierges || []);
  } catch (err) {
   console.error(t('error.managersFetch'), err);
  }
 };

 useEffect(() => {
  if (userId) {
   fetchTasks();
   fetchPropertiesbyClient(userId);
   fetchConcierges();
   fetchUserAssignedProperties();
  }
 }, [userId]);

 useEffect(() => {
  if (properties.length > 0) {
   fetchAllPropertyRevenues();
  }
 }, [properties, selectedYear]);

 const totalRevenue = Object.values(propertyRevenues).reduce(
  (sum, revenue) => sum + (revenue || 0),
  0
 );

 const toggleEnable = async (ID) => {
  await toggleEnableProperty(ID);
  if (!error) {
   message.success(t('property.toggleSuccess'));
   await fetchPropertiesbyClient(userData.id);
  } else {
   message.error(t('property.toggleError', { error: error.message }));
  }
 };

 const confirmDelete = async (ID) => {
  await deleteProperty(ID);
  if (!error) {
   await fetchPropertiesbyClient(userId);
   message.success(t('messages.deleteSuccess'));
  } else {
   message.error(t('messages.deleteError', { error: error.message }));
  }
 };

 if (isLoading) {
  return (
   <div className="loading">
    <Spin size="large" />
   </div>
  );
 }
 return (
  <Layout className="contentStyle">
   <Head onUserData={handleUserData} />
   <Content className="container">
    <Flex justify="flex-end">
     <Button
      type="primary"
      icon={<i className="fa-regular fa-circle-plus fa-xl"></i>}
      size="large"
      onClick={() => navigate('/addproperty')}
      style={{ width: 260, height: 48 }}
     >
      {t('property.addButton')}
     </Button>
    </Flex>

    <Row gutter={[32, 32]} style={{ marginTop: 16 }}>
     <Col md={8}>
      <Title level={1}>{t('header.mydashbord')}</Title>
     </Col>
     <Col md={16}>
      <div className="dash-nav-container">
       <Anchor
        affix={false}
        className="dash-anchor"
        targetOffset={20}
        onClick={(e) => {
         e.preventDefault(); // Prevent default anchor behavior
         const targetId = e.target
          .closest('.ant-anchor-link')
          .getAttribute('href');
         const targetElement = document.querySelector(targetId);
         if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
         }
        }}
        items={[
         {
          key: 'reservations',
          href: '#reservations',
          title: (
           <div className="dash-anchor-item">
            <i className="fa-light fa-calendar-days" />
            <span>{t('reservation.title')}</span>
           </div>
          ),
         },
         {
          key: 'tasks',
          href: '#tasks',
          title: (
           <div className="dash-anchor-item">
            <i className="fa-regular fa-thumbtack" />
            <span>{t('tasks.title')}</span>
           </div>
          ),
         },
         {
          key: 'revenue',
          href: '#revenue',
          title: (
           <div className="dash-anchor-item">
            <i className="fa-regular fa-wallet" />
            <span>{t('revenue.title')}</span>
           </div>
          ),
         },
         {
          key: 'properties',
          href: '#properties',
          title: (
           <div className="dash-anchor-item">
            <i className="fa-regular fa-house" />
            <span>{t('property.title')}</span>
           </div>
          ),
         },
         {
          key: 'concierges',
          href: '#concierges',
          title: (
           <div className="dash-anchor-item">
            <i className="fa-regular fa-users" />
            <span>{t('managers.title')}</span>
           </div>
          ),
         },
        ]}
       />
      </div>
     </Col>
    </Row>

    <Divider />

    <Row gutter={[32, 32]}>
     <Col xs={24} md={6}>
      <Card
       className="custom-stat-card"
       title={t('dashboard.totalTasks')}
       bordered={false}
      >
       <Statistic value={tasks.length} />
      </Card>
     </Col>
     <Col xs={24} md={6}>
      <Card
       className="custom-stat-card"
       title={t('dashboard.totalProperties')}
       bordered={false}
      >
       <Statistic value={properties.length} />
      </Card>
     </Col>

     {userAssignedProperties.length > 0 && (
      <Col xs={24} md={6}>
       <Card
        className="custom-stat-card"
        title={t('dashboard.assignedToMe')}
        bordered={false}
       >
        <Statistic value={userAssignedProperties.length} />
       </Card>
      </Col>
     )}

     <Col xs={24} md={6}>
      <Card
       className="custom-stat-card"
       title={t('dashboard.totalRevenue')}
       bordered={false}
      >
       <Statistic value={totalRevenue} suffix="Dhs" />
      </Card>
     </Col>

     {userAssignedProperties.length === 0 && (
      <Col xs={24} md={6}>
       <Card
        className="custom-stat-card"
        title={t('dashboard.totalManagers')}
        bordered={false}
       >
        <Statistic value={concierges.length} />
       </Card>
      </Col>
     )}
    </Row>

    <br />
    {/* Managed Properties Section */}
    <div id="managed">
     <ManagedPropertiesSection userId={userId} onNavigate={navigate} t={t} />
    </div>
    <br />

    {/* Reservations Section */}
    <div id="reservations">
     <ReservationsSection
      userId={userId}
      properties={properties}
      onNavigate={navigate}
     />
    </div>
    <br />

    {/* Tasks Section */}
    <div id="tasks">
     <TasksSection
      userId={userId}
      tasks={tasks}
      error={error}
      onStatusUpdate={fetchTasks}
     />
    </div>
    <br />
    {/* Revenus Section */}
    <div id="revenue">
     <RevenusSection properties={properties} />
    </div>

    <br />
    {/* Properties Section */}

    <div id="properties">
     {/* Add Property Card */}
     {properties.length === 0 && <AddPropertyCard />}
     {properties.length > 0 && (
      <PropertiesSection
       properties={properties}
       onToggleEnable={toggleEnable}
       onDeleteProperty={deleteProperty}
      />
     )}
    </div>
    <br />

    {/* Concierges Section */}
    <div id="concierges">
     <ConciergesSection
      userId={userId}
      concierges={concierges}
      onUpdate={fetchConcierges}
     />
    </div>
   </Content>
   <Foot />
  </Layout>
 );
};

export default Dashboard;
