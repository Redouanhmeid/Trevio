import React, { useEffect, useState } from 'react';
import {
 Layout,
 Typography,
 Card,
 Steps,
 Tag,
 Spin,
 Result,
 Row,
 Col,
 Flex,
 Space,
 Button,
 Divider,
 Descriptions,
 Alert,
} from 'antd';
import {
 FileTextOutlined,
 SendOutlined,
 CheckCircleOutlined,
 FormOutlined,
 DollarOutlined,
 HomeOutlined,
 CalendarOutlined,
 ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/TranslationContext';
import Foot from '../../components/common/footer';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// Status mapping for the Steps component
const statusMap = {
 draft: 0,
 sent: 1,
 confirmed: 2,
 cancelled: -1,
};

// Colors for status tags
const statusColors = {
 draft: 'default',
 sent: 'processing',
 confirmed: 'success',
 cancelled: 'error',
};

const GuestReservationView = () => {
 const { t } = useTranslation();
 const { hashId } = useParams();
 const navigate = useNavigate();
 const [reservation, setReservation] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 useEffect(() => {
  const fetchReservation = async () => {
   try {
    setLoading(true);
    // Fetch reservation data by hash ID
    const response = await fetch(`/api/v1/reservations/hash/${hashId}`);

    if (!response.ok) {
     throw new Error('Failed to fetch reservation');
    }

    const data = await response.json();
    setReservation(data);
   } catch (err) {
    console.error('Error fetching reservation:', err);
    setError(err.message);
   } finally {
    setLoading(false);
   }
  };

  if (hashId) {
   fetchReservation();
  }
 }, [hashId]);

 const handleProceedToContract = () => {
  // Navigate to guestform passing the reservation hashId
  if (reservation && reservation?.hashId) {
   navigate(`/guestform?hash=${reservation.hashId}`);
  }
 };

 if (loading) {
  return (
   <div className="loading">
    <Spin size="large" />
   </div>
  );
 }

 if (error) {
  return (
   <Layout className="contentStyle">
    <Content className="container">
     <Result
      status="error"
      title={t('reservation.notFound')}
      subTitle={t('reservation.tryAgain')}
     />
    </Content>
    <Foot />
   </Layout>
  );
 }

 if (!reservation) {
  return null;
 }

 // Format dates in the style of the screenshot (e.g., "15 MAR 2025")
 const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  // Get month name and take first 3 letters
  const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
 };

 const startDate = formatDate(reservation.startDate);
 const endDate = formatDate(reservation.endDate);
 const nights = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
 const totalPrice = reservation.pricePerNight * nights;

 if (reservation.status === 'draft' || reservation.status === 'cancelled') {
  return (
   <Layout className="contentStyle">
    <Content className="container">
     <Result
      status={reservation.status === 'cancelled' ? 'error' : 'info'}
      title={
       reservation.status === 'cancelled'
        ? t('reservation.cancelled')
        : t('reservation.draft')
      }
      subTitle={
       reservation.status === 'cancelled'
        ? t('reservation.cancellationReason')
        : t('reservation.draftDescription')
      }
     />
    </Content>
    <Foot />
   </Layout>
  );
 }

 return (
  <Layout className="contentStyle">
   <Content className="container">
    <Row gutter={[24, 24]}>
     <Col xs={24} md={10}>
      <Card
       style={{
        background:
         'linear-gradient(93deg, rgba(65,56,148,1) 0%, rgba(109,95,250,1) 100%)',
        color: 'white',
        textAlign: 'center',
        borderRadius: 16,
        padding: '10px',
       }}
      >
       <Title
        level={2}
        style={{
         color: 'white',
         marginBottom: '2rem',
         textTransform: 'uppercase',
        }}
       >
        {t('contract.bookingDates')}
       </Title>
       <Row justify="space-between" align="middle">
        <Col>
         <Text style={{ color: 'white', fontSize: '12px' }}>
          {t('contract.checkIn')}
         </Text>
         <Title level={3} style={{ color: 'white', margin: 0 }}>
          {startDate}
         </Title>
        </Col>
        <Col>→</Col>
        <Col>
         <Text style={{ color: 'white', fontSize: '12px' }}>
          {t('contract.checkOut')}
         </Text>
         <Title level={3} style={{ color: 'white', margin: 0 }}>
          {endDate}
         </Title>
        </Col>
       </Row>
      </Card>
     </Col>

     <Col xs={24} md={14}>
      {reservation.status === 'completed' && (
       <Card className="custom-stat-card">
        <Title level={2}>{t('contract.checkInComplete')}</Title>
        <Text type="secondary">{t('contract.enjoyStay')}</Text>
        <div style={{ marginTop: '24px' }}>
         <Card style={{ background: '#ECFDF3', borderRadius: 16 }}>
          <Space>
           <CheckCircleOutlined
            style={{ color: '#079455', fontSize: '24px' }}
           />
           <div>
            <Text strong>{t('contract.guestRegistration')}</Text>
            <br />
            <Text type="success">✓ {t('contract.completed')}</Text>
           </div>
          </Space>
         </Card>
        </div>
       </Card>
      )}

      {reservation.status === 'sent' && (
       <Card className="custom-stat-card">
        <Title level={2}>{t('checkIn.title')}</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
         {t('contract.filfill')}
        </Text>
        <Card
         style={{
          background: '#FFFAEB',
          marginTop: '24px',
          borderRadius: 16,
          cursor: 'pointer',
         }}
         onClick={handleProceedToContract}
        >
         <Flex align="center" justify="space-between">
          <Space>
           <ExclamationCircleOutlined
            style={{ color: '#FDB022', fontSize: '24px' }}
           />
           <div>
            <Text strong>{t('contract.guestRegistration')}</Text>
            <br />
            <Text type="warning">{t('contract.checkInInComplete')}</Text>
           </div>
          </Space>
          <a href="#">{t('reservation.proceedToContract')}</a>
         </Flex>
        </Card>
       </Card>
      )}
     </Col>
    </Row>
   </Content>
   <Foot />
  </Layout>
 );
};

export default GuestReservationView;
