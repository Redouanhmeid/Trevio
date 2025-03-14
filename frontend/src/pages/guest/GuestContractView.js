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
 KeyOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import useReservationContract from '../../hooks/useReservationContract';
import useProperty from '../../hooks/useProperty';
import { useTranslation } from '../../context/TranslationContext';
import { Helmet } from 'react-helmet';
import Sidebar from '../../components/common/sidebar';
import fallback from '../../assets/fallback.png';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

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

 useEffect(() => {
  const fetchData = async () => {
   try {
    const contractData = await getContractByHash(hashId);
    setContract(contractData);
    console.log(contractData);

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

 const loading = contractLoading || propertyLoading;

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
       <Col xs={24} md={10}>
        <Card
         style={{
          background:
           'linear-gradient(93deg, rgba(65,56,148,1) 0%, rgba(109,95,250,1) 100%)',
          color: 'white',
          textAlign: 'center',
          borderRadius: 16,
          paddingBottom: 16,
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
           <Title level={3} style={{ color: 'white', margin: 2 }}>
            {new Date(contract.checkInDate)
             .toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
             })
             .toUpperCase()}
           </Title>
          </Col>
          <Col>→</Col>
          <Col>
           <Text style={{ color: 'white', fontSize: '12px' }}>
            {t('contract.checkOut')}
           </Text>
           <Title level={3} style={{ color: 'white', margin: 0 }}>
            {new Date(contract.checkOutDate)
             .toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
             })
             .toUpperCase()}
           </Title>
          </Col>
         </Row>
        </Card>
       </Col>

       {contract.status === 'SENT' && (
        <Col xs={24} md={14}>
         <Card className="custom-stat-card">
          <Title level={2}>{t('contract.checkIn')}</Title>
          <Text type="secondary">{t('contract.filfill')}</Text>
          <div style={{ marginTop: '24px' }}>
           <Card
            style={{
             background: '#FFFAEB',
             borderRadius: 16,
             cursor: 'pointer',
            }}
            onClick={handleProceedToContract}
           >
            <Flex justify="space-between">
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
             <ArrowRightOutlined />
            </Flex>
           </Card>
          </div>
         </Card>
        </Col>
       )}

       {contract.status === 'SIGNED' && (
        <Col xs={24} md={14}>
         <Card className="custom-stat-card">
          <Title level={2}>{t('contract.checkIn')}</Title>
          <Text type="secondary">{t('contract.underVerification')}</Text>
          <div style={{ marginTop: '24px' }}>
           <Card style={{ background: '#B5B0E8', borderRadius: 16 }}>
            <Space>
             <ClockCircleOutlined
              style={{ color: '#6D5FFA', fontSize: '24px' }}
             />
             <div>
              <Text strong>{t('contract.verificationInProgress')}</Text>
              <br />
              <Text type="warning">{t('contract.waitingForApproval')}</Text>
             </div>
            </Space>
           </Card>
          </div>
         </Card>
        </Col>
       )}

       {contract.status === 'COMPLETED' && (
        <Col xs={24} md={14}>
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
              <Text type="success">{t('contract.completed')}</Text>
             </div>
            </Space>
           </Card>
          </div>
         </Card>

         {contract.reservation &&
          contract.reservation.electronicLockEnabled &&
          contract.reservation.electronicLockCode && (
           <Card
            style={{ marginTop: 16, background: '#F6FFED', borderRadius: 16 }}
           >
            <Space>
             <KeyOutlined style={{ color: '#52C41A', fontSize: '24px' }} />
             <div>
              <Text strong>{t('contract.electronicLock.title')}</Text>
              <br />
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
               {contract.reservation.electronicLockCode.toString()}
              </Text>
             </div>
            </Space>
            <Divider />
            <Text type="secondary">
             {t('contract.electronicLock.instructions')}
            </Text>
           </Card>
          )}
        </Col>
       )}
      </Row>
      <Divider />
      {property && (
       <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
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
        <Col xs={24} md={16}>
         <Flex vertical gap={4}>
          <Flex
           justify="space-between"
           align="center"
           style={{ marginBottom: '4px' }}
          >
           <Text strong style={{ fontSize: '16px' }}>
            {property.name}
           </Text>
           <Text style={{ color: '#666' }}>
            <i
             className="PrimaryColor fa-light fa-location-dot"
             style={{ marginRight: '4px' }}
            />
            {property.placeName}
           </Text>
          </Flex>
          <Paragraph
           ellipsis={{
            rows: 2,
            expandable: false,
            tooltip: property.description,
           }}
           style={{
            marginBottom: 16,
           }}
          >
           {property.description}
          </Paragraph>
          <Flex gap="middle" style={{ marginBottom: '16px' }}>
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

          <Flex gap="middle">
           <Button
            type="primary"
            style={{ flex: 1, background: '#8B5CF6', borderColor: '#8B5CF6' }}
            onClick={() =>
             navigate(`/digitalguidebook?hash=${property.hashId}`)
            }
           >
            {t('property.actions.guidebook')}
           </Button>
           <Button
            style={{ flex: 1 }}
            onClick={() => navigate(`/propertydetails?hash=${property.hashId}`)}
           >
            {t('property.learnMore')}
           </Button>
          </Flex>
         </Flex>
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
