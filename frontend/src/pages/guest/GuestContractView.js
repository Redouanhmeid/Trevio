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
 Space,
 Flex,
 Grid,
 Image,
 Carousel,
 Divider,
 Button,
} from 'antd';
import {
 FileTextOutlined,
 SendOutlined,
 CheckCircleOutlined,
 ExclamationCircleOutlined,
 ArrowRightOutlined,
 ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import useReservationContract from '../../hooks/useReservationContract';
import useProperty from '../../hooks/useProperty';
import { useTranslation } from '../../context/TranslationContext';
import { Helmet } from 'react-helmet';
import Sidebar from '../../components/common/sidebar';
import fallback from '../../assets/fallback.png';
import ElectronicLockDisplay from './ElectronicLockDisplay';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const statusMap = {
 DRAFT: 0,
 SENT: 1,
 SIGNED: 2,
 COMPLETED: 3,
 REJECTED: -1,
};

const statusColors = {
 DRAFT: 'default',
 SENT: 'processing',
 SIGNED: 'success',
 REJECTED: 'error',
 COMPLETED: 'purple',
};

const GuestContractView = () => {
 const { t } = useTranslation();
 const { hashId } = useParams();
 const navigate = useNavigate();
 const { getContractByHash, loading: contractLoading } =
  useReservationContract();
 const { property, fetchProperty, loading: propertyLoading } = useProperty();
 const [contract, setContract] = useState(null);
 const [error, setError] = useState(null);
 const [collapsed, setCollapsed] = useState(false);
 const [imageAspectRatios, setImageAspectRatios] = useState({});
 const screens = useBreakpoint();

 useEffect(() => {
  const fetchData = async () => {
   try {
    const contractData = await getContractByHash(hashId);
    setContract(contractData);

    if (contractData) {
     await fetchProperty(contractData.propertyId);
    }
   } catch (err) {
    setError(err.message);
   }
  };

  if (hashId) {
   fetchData();
  }
 }, [hashId]);

 const reservationCode = contract?.hashId || hashId;

 const handleProceedToContract = () => {
  navigate(`/guestform?hash=${contract.hashId}`);
 };

 const loading = contractLoading && propertyLoading;

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
    <Sidebar reservationCode={reservationCode} />
    <Content className="container">
     <Result
      status="error"
      title={t('contract.error.notFound')}
      subTitle={t('contract.error.tryAgain')}
     />
    </Content>
   </Layout>
  );
 }

 if (!contract) {
  return null;
 }

 // If contract is completed, show the check-in completion page
 if (
  contract.status === 'COMPLETED' ||
  contract.status === 'SENT' ||
  contract.status === 'SIGNED'
 ) {
  return (
   <Layout>
    <Helmet>
     <link
      rel="stylesheet"
      href="https://site-assets.fontawesome.com/releases/v6.4.2/css/all.css"
     />
    </Helmet>
    <Sidebar reservationCode={reservationCode} onCollapse={setCollapsed} />
    <Layout className="contentStyle">
     <Content className="container">
      <Row gutter={[24, 24]}>
       <Col xs={24} md={24}>
        <Card className="booking-dates-card">
         <Title level={3} className="booking-dates-title">
          {t('contract.bookingDates')}
         </Title>
         <Flex justify="space-between" align="center">
          <Flex vertical align="center" className="date-column">
           <Text className="date-label">
            <i
             className="fa-regular fa-arrow-right-to-arc fa-xl"
             style={{ marginRight: 12 }}
            />
            {t('contract.checkIn')}
           </Text>
           <Text strong className="date-value">
            {new Date(contract.checkInDate)
             .toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
             })
             .toUpperCase()}
           </Text>
          </Flex>

          {screens.xs ? (
           <div className="timeline-container-vertical">
            <div className="timeline-line-vertical">
             <div className="timeline-solid-vertical" />
            </div>
           </div>
          ) : (
           <div className="timeline-container" style={{ width: '50%' }}>
            <div className="timeline-dot" />
            <div className="timeline-line">
             <div className="timeline-dashed" />
            </div>
            <div className="timeline-dot" />
           </div>
          )}

          <Flex vertical align="center" className="date-column">
           <Text className="date-label">
            {t('contract.checkOut')}
            <i
             className="fa-regular fa-arrow-right-from-arc fa-xl"
             style={{ marginLeft: 12 }}
            />
           </Text>
           <Text strong className="date-value">
            {new Date(contract.checkOutDate)
             .toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
             })
             .toUpperCase()}
           </Text>
          </Flex>
         </Flex>
        </Card>
       </Col>

       {contract.status === 'SENT' && (
        <Col xs={24} md={24}>
         <Card className="status-card">
          <Title level={3} className="status-title">
           {t('contract.checkIn')}
          </Title>
          <Text className="status-description">{t('contract.filfill')}</Text>

          <Card
           className="notification-card notification-sent"
           onClick={handleProceedToContract}
          >
           <Flex justify="space-between" align="center">
            <Space align="center" wrap>
             <ExclamationCircleOutlined className="status-icon-warning" />
             <Text strong>{t('contract.guestRegistration')}</Text>
            </Space>
            <Space align="center" wrap>
             <Text className="status-text-warning">
              {t('contract.checkInInComplete')}
             </Text>
             <ArrowRightOutlined className="status-text-warning" />
            </Space>
           </Flex>
          </Card>
         </Card>
        </Col>
       )}

       {contract.status === 'SIGNED' && (
        <Col xs={24} md={24}>
         <Card className="status-card">
          <Title level={3} className="status-title">
           {t('contract.checkIn')}
          </Title>
          <Text className="status-description">
           {t('contract.underVerification')}
          </Text>

          <Card className="notification-card notification-signed">
           <Flex justify="space-between" align="center">
            <Space align="center" wrap>
             <ClockCircleOutlined className="status-icon-info" />
             <Text strong>{t('contract.verificationInProgress')}</Text>
            </Space>
            <Text className="status-text-info">
             {t('contract.waitingForApproval')}
            </Text>
           </Flex>
          </Card>
         </Card>
        </Col>
       )}

       {contract.status === 'COMPLETED' && (
        <Col xs={24} md={24}>
         <Card className="status-card">
          <Title level={3} className="status-title">
           {t('contract.checkInComplete')}
          </Title>
          <Text className="status-description">{t('contract.enjoyStay')}</Text>

          <Card className="notification-card notification-completed">
           <Flex justify="space-between" align="center">
            <Space align="center" wrap>
             <CheckCircleOutlined className="status-icon-success" />
             <Text strong>{t('contract.guestRegistration')}</Text>
            </Space>
            <Text className="status-text-success">
             {t('contract.completed')}
            </Text>
           </Flex>
          </Card>
         </Card>
        </Col>
       )}
      </Row>
      <br />
      {property && (
       <Row gutter={[24, 24]}>
        <Col xs={24} md={14}>
         <Row gutter={[12, 12]}>
          <Col xs={24} md={12}>
           <div style={{ position: 'relative' }}>
            <Carousel className="propertycarousel" autoplay effect="fade">
             {property.photos?.map((photo, index) => (
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
           </div>
          </Col>
          <Col xs={24} md={12}>
           <Flex vertical gap={4}>
            <Text style={{ color: '#666' }}>
             <i
              className="PrimaryColor fa-light fa-location-dot"
              style={{ marginRight: '4px' }}
             />
             {property.placeName}
            </Text>
            <Text strong style={{ fontSize: '16px' }}>
             {property.name}
            </Text>
            <Paragraph
             ellipsis={{
              rows: 3,
              expandable: false,
              tooltip: property.description,
             }}
             style={{
              marginBottom: 4,
             }}
            >
             {property.description}
            </Paragraph>
            <Flex gap="middle" style={{ marginBottom: 4 }}>
             {property.basicEquipements && (
              <Text type="secondary">
               <i
                className="PrimaryColor fa-light fa-snowflake"
                style={{ marginRight: '4px' }}
               />
               {t('property.tag.airconditioned')}
              </Text>
             )}
             <Text type="secondary">
              <i
               className="PrimaryColor fa-light fa-lock"
               style={{ marginRight: '4px' }}
              />
              {t('property.tag.smartlock')}
             </Text>
            </Flex>

            <Button
             block
             type="primary"
             size="large"
             onClick={() =>
              navigate(`/digitalguidebook?hash=${property.hashId}`)
             }
            >
             {t('property.actions.guidebook')}
            </Button>
           </Flex>
          </Col>
         </Row>
        </Col>

        <Col xs={24} md={10}>
         {contract.status === 'COMPLETED' &&
          contract.reservation &&
          contract.reservation.electronicLockEnabled &&
          contract.reservation.electronicLockCode && (
           <ElectronicLockDisplay
            lockCode={contract.reservation.electronicLockCode}
            propertyId={contract.propertyId}
           />
          )}
        </Col>
       </Row>
      )}
     </Content>
    </Layout>
   </Layout>
  );
 }

 // Show contract status for non-completed contracts
 return (
  <Layout className="contentStyle">
   <Content className="container">
    <Card>
     <Title level={2}>{t('contract.status.title')}</Title>
     <Tag
      color={statusColors[contract.status]}
      style={{ marginBottom: '24px' }}
     >
      {contract.status}
     </Tag>

     <Steps
      current={statusMap[contract.status]}
      status={contract.status === 'REJECTED' ? 'error' : 'process'}
      items={[
       {
        title: t('contract.status.draft'),
        icon: <FileTextOutlined />,
       },
       {
        title: t('contract.status.sent'),
        icon: <SendOutlined />,
       },
       {
        title: t('contract.status.signed'),
        icon: <CheckCircleOutlined />,
       },
       {
        title: t('contract.status.completed'),
        icon: <CheckCircleOutlined />,
       },
      ]}
     />

     <Card style={{ marginTop: '24px' }}>
      <Space direction="vertical">
       <div>
        <Text type="secondary">{t('contract.guest')}:</Text>
        <Text strong>
         {' '}
         {contract.firstname} {contract.lastname}
        </Text>
       </div>
       <div>
        <Text type="secondary">{t('contract.email')}:</Text>
        <Text strong> {contract.email}</Text>
       </div>
       <div>
        <Text type="secondary">{t('contract.phone')}:</Text>
        <Text strong> {contract.phone}</Text>
       </div>
       {contract.checkInDate && (
        <div>
         <Text type="secondary">{t('contract.dates')}:</Text>
         <Text strong>
          {' '}
          {new Date(contract.checkInDate).toLocaleDateString()} -{' '}
          {new Date(contract.checkOutDate).toLocaleDateString()}
         </Text>
        </div>
       )}
      </Space>
     </Card>
    </Card>
   </Content>
  </Layout>
 );
};

export default GuestContractView;
