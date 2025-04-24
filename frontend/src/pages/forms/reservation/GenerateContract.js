import React, { useState, useEffect } from 'react';
import {
 Layout,
 Row,
 Col,
 Flex,
 Typography,
 Card,
 Input,
 Button,
 Steps,
 Divider,
 Descriptions,
 Result,
 Alert,
 Space,
 Spin,
 message,
 Modal,
 Tag,
 Tooltip,
 Empty,
 Image,
 Popconfirm,
 Grid,
} from 'antd';
import {
 ArrowLeftOutlined,
 MailOutlined,
 LinkOutlined,
 CheckCircleOutlined,
 CloseCircleOutlined,
 LockOutlined,
 CopyOutlined,
 ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../../context/TranslationContext';
import { useReservation } from '../../../hooks/useReservation';
import ShareModal from '../../../components/common/ShareModal';
import dayjs from 'dayjs';
import DashboardHeader from '../../../components/common/DashboardHeader';
import Foot from '../../../components/common/footer';
import useReservationContract from '../../../hooks/useReservationContract';
import ElectronicLockCodeManager from './ElectronicLockCodeManager';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const GenerateContract = () => {
 const { t } = useTranslation();

 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();
 const navigate = useNavigate();
 const { id } = useParams();
 const {
  reservation,
  contract,
  error,
  fetchReservation,
  getReservationContract,
  generateContract,
  sendToGuest,
  deleteReservation,
 } = useReservation();
 const { loading, updateContractStatus } = useReservationContract();

 const [currentStep, setCurrentStep] = useState(0);
 const [isShareModalVisible, setIsShareModalVisible] = useState(false);
 const [shareUrl, setShareUrl] = useState('');

 const [lockSettingsChanged, setLockSettingsChanged] = useState(false);

 const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

 useEffect(() => {
  const fetchData = async () => {
   // Fetch the reservation
   const reservationData = await fetchReservation(id);

   // Check if contract already exists
   const contractData = await getReservationContract(id);

   if (contractData) {
    // Set step based on contract status
    if (contractData.status === 'SENT') {
     setCurrentStep(1);
    } else if (contractData.status === 'SIGNED') {
     setCurrentStep(2);
    } else if (contractData.status === 'COMPLETED') {
     setCurrentStep(3);
    } else if (contractData.status === 'REJECTED') {
     setCurrentStep(0); // Reset to draft state for rejected contracts
    } else {
     setCurrentStep(0);
    }
   } else {
    console.log('No contract found, keeping step at 0');
    setCurrentStep(0);
   }
  };

  if (id) {
   fetchData();
  }
 }, [id, lockSettingsChanged]);

 const handleGenerateContract = async () => {
  try {
   const contractData = await generateContract(id);
   if (contractData) {
    // Set the step based on the contract status returned from the API
    // DRAFT = 0, SENT = 1, SIGNED = 2, COMPLETED = 3, REJECTED = 0
    const stepMap = {
     DRAFT: 0,
     SENT: 1,
     SIGNED: 2,
     COMPLETED: 3,
    };
    setCurrentStep(stepMap[contractData.status] || 0);
   }
  } catch (error) {
   message.error(t('reservation.contractGeneratedError'));
  }
 };

 const handleSendToGuest = async () => {
  const data = await sendToGuest(id);
  if (data) {
   // Update current step
   setCurrentStep(1);

   // Show share modal with the contract URL
   const contractUrl = data.contractFormUrl.startsWith('http')
    ? data.contractFormUrl
    : `${window.location.origin}${data.contractFormUrl}`;

   setShareUrl(contractUrl);
   setIsShareModalVisible(true);
  }
 };

 const handleShowShareModal = () => {
  if (contract && contract.hashId) {
   const url = `${window.location.origin}/guest/contract/${contract.hashId}`;
   setShareUrl(url);
   setIsShareModalVisible(true);
  }
 };

 const markContractComplete = async (contractId) => {
  try {
   await updateContractStatus(contractId, 'COMPLETED');
   message.success(t('reservation.contract.completeSuccess'));

   // Refresh data to update UI
   await getReservationContract(id);
   setCurrentStep(3);
  } catch (error) {
   message.error(t('reservation.contract.completeError'));
  }
 };

 const markContractRejected = async (contractId) => {
  console.log(contractId);
  try {
   await updateContractStatus(contractId, 'REJECTED');
   message.success(t('reservation.contract.rejectSuccess'));

   // Refresh data to update UI
   await getReservationContract(id);
   setCurrentStep(0); // Reset to draft state after rejection
  } catch (error) {
   message.error(t('reservation.contract.rejectError'));
  }
 };

 const handleLockSettingsChange = () => {
  setLockSettingsChanged(!lockSettingsChanged); // Toggle to trigger re-fetch
 };

 const handleContinue = () => {
  navigate('/reservations');
 };

 const handleDeleteReservation = async (reservationId) => {
  try {
   await deleteReservation(reservationId);
   message.success(t('messages.deleteSuccess'));
   navigate('/reservations');
  } catch (error) {
   message.error(t('messages.deleteError'));
  }
 };

 const showDeleteConfirm = (e) => {
  e.stopPropagation(); // Stop event propagation to prevent immediate closing
  setDeleteConfirmVisible(true);
 };

 const hideDeleteConfirm = () => {
  setDeleteConfirmVisible(false);
 };

 const confirmDelete = () => {
  if (reservation && reservation.id) {
   handleDeleteReservation(reservation.id);
  }
  hideDeleteConfirm();
 };

 if (loading) {
  return (
   <Layout className="contentStyle">
    <DashboardHeader />
    <Content className="container">
     <div className="loading">
      <Spin size="large" />
     </div>
    </Content>
    {!screens.xs && <Foot />}
   </Layout>
  );
 }

 if (error) {
  return (
   <Layout className="contentStyle">
    <DashboardHeader />
    <Content className="container">
     <Button
      type="link"
      icon={<ArrowLeftOutlined />}
      onClick={() => navigate(-1)}
     >
      {t('button.back')}
     </Button>

     <Result
      status="error"
      title={t('reservation.error')}
      subTitle={error}
      extra={[
       <Button type="primary" onClick={() => navigate(-1)}>
        {t('button.back')}
       </Button>,
      ]}
     />
    </Content>
    {!screens.xs && <Foot />}
   </Layout>
  );
 }

 return (
  <Layout className="contentStyle">
   <DashboardHeader />
   <Content className="container">
    <Flex justify="space-between">
     <Button
      type="link"
      icon={<ArrowLeftOutlined />}
      onClick={() => navigate(-1)}
     >
      {t('button.back')}
     </Button>
     <Space>
      <Button
       type="text"
       danger
       icon={<i className="fa-light fa-trash" />}
       onClick={showDeleteConfirm}
      />
     </Space>
    </Flex>

    <Title level={screens.xs ? 4 : 2}>
     {t('reservation.contractGeneration')}
    </Title>

    {screens.xs ? (
     <div
      style={{
       display: 'flex',
       justifyContent: 'space-between',
       alignItems: 'center',
       marginBottom: 20,
       width: '100%',
      }}
     >
      {[0, 1, 2, 3].map((step) => (
       <div
        key={step}
        style={{
         display: 'flex',
         flexDirection: 'column',
         alignItems: 'center',
        }}
       >
        <div
         style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: currentStep >= step ? '#6D5FFA' : '#E8E7F9',
         }}
        />
        {step < 3 && (
         <div
          style={{
           position: 'absolute',
           height: 2,
           width: '20%',
           backgroundColor: currentStep > step ? '#6D5FFA' : '#E8E7F9',
           transform: `translateX(70%) translateY(3px)`,
           zIndex: 0,
          }}
         />
        )}
       </div>
      ))}
     </div>
    ) : (
     <Steps
      current={currentStep}
      items={[
       {
        title: t('reservation.steps.created'),
       },
       {
        title: t('reservation.steps.sent'),
       },
       {
        title: t('reservation.steps.signed'),
       },
       {
        title: t('reservation.steps.completed'),
       },
      ]}
      style={{ marginBottom: 24 }}
     />
    )}

    <Card bordered={false} className="contract-card">
     {reservation && (
      <>
       {screens.xs ? (
        <Card bordered={false} className="reservation-details-card">
         <Title level={4} style={{ marginBottom: '20px', color: '#6D5FFA' }}>
          {t('reservation.details')}
         </Title>
         <Row gutter={[8, 8]}>
          <Col span={12}>
           <Text type="secondary">Full name</Text>
           <Paragraph strong style={{ fontSize: '14px', marginBottom: '0' }}>
            {reservation.property.name}
           </Paragraph>
          </Col>
          <Col span={12}>
           <Text type="secondary">Reservation dates</Text>
           <Paragraph strong style={{ fontSize: '14px', marginBottom: '0' }}>
            {dayjs(reservation.startDate).format('DD-MM-YYYY')}
            <br />
            {dayjs(reservation.endDate).format('DD-MM-YYYY')}
           </Paragraph>
          </Col>
          <Col span={12}>
           <Text type="secondary">Price per night</Text>
           <Paragraph strong style={{ fontSize: '14px', marginBottom: '0' }}>
            {Math.round(
             reservation.totalPrice /
              dayjs(reservation.endDate).diff(
               dayjs(reservation.startDate),
               'day'
              )
            )}{' '}
            Dhs
           </Paragraph>
          </Col>
          <Col span={12}>
           <Text type="secondary">Total nights</Text>
           <Paragraph strong style={{ fontSize: '14px', marginBottom: '0' }}>
            {dayjs(reservation.endDate).diff(
             dayjs(reservation.startDate),
             'day'
            )}{' '}
            nights
           </Paragraph>
          </Col>
          <Col span={12}>
           <Text type="secondary">Total price</Text>
           <Paragraph strong style={{ fontSize: '14px', marginBottom: '0' }}>
            {reservation.totalPrice} dhs
           </Paragraph>
          </Col>
          {reservation.bookingSource && (
           <Col span={12}>
            <Text type="secondary">Booking source</Text>
            <Paragraph strong style={{ fontSize: '14px', marginBottom: '0' }}>
             {reservation.bookingSource}
            </Paragraph>
           </Col>
          )}
         </Row>
        </Card>
       ) : (
        <Descriptions
         title={t('reservation.details')}
         bordered
         column={{ xs: 1, sm: 2 }}
        >
         <Descriptions.Item label={t('property.basic.name')}>
          {reservation.property.name}
         </Descriptions.Item>
         <Descriptions.Item label={t('reservation.dates')}>
          {dayjs(reservation.startDate).format('YYYY-MM-DD')} -{' '}
          {dayjs(reservation.endDate).format('YYYY-MM-DD')}
         </Descriptions.Item>
         <Descriptions.Item label={t('reservation.pricePerNight')}>
          {reservation.totalPrice /
           dayjs(reservation.endDate).diff(
            dayjs(reservation.startDate),
            'day'
           )}{' '}
          Dhs
         </Descriptions.Item>
         <Descriptions.Item label={t('reservation.totalNights')}>
          {dayjs(reservation.endDate).diff(dayjs(reservation.startDate), 'day')}
         </Descriptions.Item>
         <Descriptions.Item label={t('reservation.totalPrice')}>
          {reservation.totalPrice} Dhs
         </Descriptions.Item>
         {reservation.bookingSource && (
          <Descriptions.Item label={t('reservation.bookingSource')}>
           {reservation.bookingSource}
          </Descriptions.Item>
         )}
         <Descriptions.Item label={t('reservation.status')}>
          {t(`reservation.statuses.${reservation.status}`)}
         </Descriptions.Item>
        </Descriptions>
       )}

       <br />
       {reservation && (
        <ElectronicLockCodeManager
         reservationId={reservation.id}
         initialLockEnabled={reservation.electronicLockEnabled || false}
         initialLockCode={reservation.electronicLockCode}
         onSettingsChange={handleLockSettingsChange}
        />
       )}
       <Divider />

       {currentStep === 0 && !contract && (
        <div className="action-container">
         <Alert
          message={t('reservation.readyToGenerate')}
          description={t('reservation.generateDescription')}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
         />
         <Button
          type="primary"
          onClick={handleGenerateContract}
          loading={loading}
         >
          {t('reservation.generateContract')}
         </Button>
        </div>
       )}

       {contract && currentStep === 0 && (
        <div className="action-container">
         <Alert
          message={t('reservation.contractReady')}
          description={t('reservation.sendDescription')}
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
         />
         <Button type="primary" onClick={handleSendToGuest} loading={loading}>
          {t('reservation.sendToGuest')}{' '}
          <i
           className="fa-regular fa-paper-plane-top"
           style={{ marginLeft: 6 }}
          />
         </Button>
        </div>
       )}

       {contract && currentStep === 1 && (
        <div className="action-container">
         <Alert
          message={t('reservation.contractSent')}
          description={
           <>
            <Paragraph>{t('reservation.waitingForGuest')}</Paragraph>
            <Space>
             <Text
              copyable
             >{`${window.location.origin}/guest/contract/${contract.hashId}`}</Text>
             <Button
              type="link"
              icon={<LinkOutlined />}
              onClick={handleShowShareModal}
             >
              {t('common.share')}
             </Button>
            </Space>
           </>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
         />
         <Button type="primary" onClick={handleContinue}>
          {t('button.continue')}
         </Button>
        </div>
       )}

       {contract && currentStep === 2 && (
        <div className="action-container">
         <Alert
          message={t('reservation.contract.contractSigned')}
          description={t('reservation.contract.completionDescription')}
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
         />

         {/* Contract information display - styled like GuestContractView */}
         <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
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

          <Col xs={24} md={14}>
           <Card className="custom-stat-card">
            <Title level={2}>{t('contracts.guestInformation')}</Title>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
             <Flex justify="space-between">
              <Space>
               <i
                className="fa-regular fa-user PrimaryColor"
                style={{ fontSize: 24 }}
               />
               <div>
                <Text strong style={{ fontSize: 16 }}>
                 {contract.firstname} {contract.middlename || ''}{' '}
                 {contract.lastname}
                </Text>
               </div>
              </Space>
              <Space>
               <i
                className="fa-regular fa-envelope PrimaryColor"
                style={{ fontSize: 24 }}
               />
               <div>
                <Text>{contract.email}</Text>
               </div>
              </Space>
              <Space>
               <i
                className="fa-regular fa-phone PrimaryColor"
                style={{ fontSize: 24 }}
               />
               <div>
                <Text>{contract.phone || '-'}</Text>
               </div>
              </Space>
             </Flex>

             <Flex justify="space-between">
              <Space>
               <i
                className="fa-regular fa-calendar PrimaryColor"
                style={{ fontSize: 24 }}
               />
               <div>
                <Text>{dayjs(contract.birthDate).format('YYYY-MM-DD')}</Text>
               </div>
              </Space>
              <Space>
               <i
                className="fa-regular fa-venus-mars PrimaryColor"
                style={{ fontSize: 24 }}
               />
               <div>
                <Text>{contract.sex}</Text>
               </div>
              </Space>
              <Space>
               <i
                className="fa-regular fa-globe PrimaryColor"
                style={{ fontSize: 24 }}
               />
               <div>
                <Text>{contract.nationality}</Text>
               </div>
              </Space>
             </Flex>

             <Flex justify="space-between">
              <Space>
               <i
                className="fa-regular fa-location-dot PrimaryColor"
                style={{ fontSize: 24 }}
               />
               <div>
                <Text>
                 {contract.residenceAddress}, {contract.residenceCity},{' '}
                 {contract.residenceCountry},{contract.residencePostalCode}
                </Text>
               </div>
              </Space>
             </Flex>
            </Space>
           </Card>
          </Col>
         </Row>

         {/* Document Information */}
         <Card
          title={t('contracts.details.documentInfo')}
          style={{ marginBottom: 16, borderRadius: 16 }}
         >
          <Row gutter={[16, 16]}>
           <Col xs={24} md={8}>
            <Space>
             <i
              className="fa-regular fa-passport PrimaryColor"
              style={{ fontSize: 24 }}
             />
             <div>
              <Text type="secondary">
               {t('contracts.details.documentType')}
              </Text>
              <br />
              <Text>{contract.documentType}</Text>
             </div>
            </Space>
           </Col>
           <Col xs={24} md={8}>
            <Space>
             <i
              className="fa-regular fa-id-card PrimaryColor"
              style={{ fontSize: 24 }}
             />
             <div>
              <Text type="secondary">
               {t('contracts.details.documentNumber')}
              </Text>
              <br />
              <Text>{contract.documentNumber}</Text>
             </div>
            </Space>
           </Col>
           <Col xs={24} md={8}>
            <Space>
             <i
              className="fa-regular fa-calendar-check PrimaryColor"
              style={{ fontSize: 24 }}
             />
             <div>
              <Text type="secondary">
               {t('contracts.details.documentIssueDate')}
              </Text>
              <br />
              <Text>
               {dayjs(contract.documentIssueDate).format('YYYY-MM-DD')}
              </Text>
             </div>
            </Space>
           </Col>
          </Row>
         </Card>

         {/* Signature */}
         {contract.signatureImageUrl && (
          <Card
           title={t('contracts.details.signature')}
           style={{ marginBottom: 16, borderRadius: 16 }}
          >
           <Flex justify="center" align="center">
            <div
             style={{
              padding: 16,
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              background: '#f9f9f9',
             }}
            >
             <Image
              src={contract.signatureImageUrl}
              alt="Signature"
              style={{ maxHeight: 100 }}
             />
            </div>
           </Flex>
          </Card>
         )}

         <Space>
          <Button
           type="primary"
           onClick={() => markContractComplete(contract.id)}
           icon={<CheckCircleOutlined />}
          >
           {t('reservation.contract.markComplete')}
          </Button>

          <Button
           danger
           onClick={() => markContractRejected(contract.id)}
           icon={<CloseCircleOutlined />}
          >
           {t('reservation.contract.markRejected')}
          </Button>

          <Button
           onClick={() =>
            navigate(`/contractslist?hash=${reservation.property.hashId}`)
           }
          >
           {t('reservation.contract.viewAllContracts')}
          </Button>
         </Space>
        </div>
       )}

       {contract && currentStep === 3 && (
        <div className="action-container">
         <Alert
          message={t('reservation.contract.contractCompleted')}
          description={t('reservation.contract.completedDescription')}
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
         />
         {/* Contract information display - styled like GuestContractView */}
         <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
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

          <Col xs={24} md={14}>
           <Card className="custom-stat-card">
            <Title level={2}>{t('contracts.guestInformation')}</Title>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
             <Flex justify="space-between">
              <Space>
               <i
                className="fa-regular fa-user PrimaryColor"
                style={{ fontSize: 24 }}
               />
               <div>
                <Text strong style={{ fontSize: 16 }}>
                 {contract.firstname} {contract.middlename || ''}{' '}
                 {contract.lastname}
                </Text>
               </div>
              </Space>
              <Space>
               <i
                className="fa-regular fa-envelope PrimaryColor"
                style={{ fontSize: 24 }}
               />
               <div>
                <Text>{contract.email}</Text>
               </div>
              </Space>
              <Space>
               <i
                className="fa-regular fa-phone PrimaryColor"
                style={{ fontSize: 24 }}
               />
               <div>
                <Text>{contract.phone || '-'}</Text>
               </div>
              </Space>
             </Flex>

             <Flex justify="space-between">
              <Space>
               <i
                className="fa-regular fa-calendar PrimaryColor"
                style={{ fontSize: 24 }}
               />
               <div>
                <Text>{dayjs(contract.birthDate).format('YYYY-MM-DD')}</Text>
               </div>
              </Space>
              <Space>
               <i
                className="fa-regular fa-venus-mars PrimaryColor"
                style={{ fontSize: 24 }}
               />
               <div>
                <Text>{contract.sex}</Text>
               </div>
              </Space>
              <Space>
               <i
                className="fa-regular fa-globe PrimaryColor"
                style={{ fontSize: 24 }}
               />
               <div>
                <Text>{contract.nationality}</Text>
               </div>
              </Space>
             </Flex>

             <Flex justify="space-between">
              <Space>
               <i
                className="fa-regular fa-location-dot PrimaryColor"
                style={{ fontSize: 24 }}
               />
               <div>
                <Text>
                 {contract.residenceAddress}, {contract.residenceCity},{' '}
                 {contract.residenceCountry},{contract.residencePostalCode}
                </Text>
               </div>
              </Space>
             </Flex>
            </Space>
           </Card>
          </Col>
         </Row>

         {/* Document Information */}
         <Card
          title={t('contracts.details.documentInfo')}
          style={{ marginBottom: 16, borderRadius: 16 }}
         >
          <Row gutter={[16, 16]}>
           <Col xs={24} md={8}>
            <Space>
             <i
              className="fa-regular fa-passport PrimaryColor"
              style={{ fontSize: 24 }}
             />
             <div>
              <Text type="secondary">
               {t('contracts.details.documentType')}
              </Text>
              <br />
              <Text>{contract.documentType}</Text>
             </div>
            </Space>
           </Col>
           <Col xs={24} md={8}>
            <Space>
             <i
              className="fa-regular fa-id-card PrimaryColor"
              style={{ fontSize: 24 }}
             />
             <div>
              <Text type="secondary">
               {t('contracts.details.documentNumber')}
              </Text>
              <br />
              <Text>{contract.documentNumber}</Text>
             </div>
            </Space>
           </Col>
           <Col xs={24} md={8}>
            <Space>
             <i
              className="fa-regular fa-calendar-check PrimaryColor"
              style={{ fontSize: 24 }}
             />
             <div>
              <Text type="secondary">
               {t('contracts.details.documentIssueDate')}
              </Text>
              <br />
              <Text>
               {dayjs(contract.documentIssueDate).format('YYYY-MM-DD')}
              </Text>
             </div>
            </Space>
           </Col>
          </Row>
         </Card>

         {/* Signature */}
         {contract.signatureImageUrl && (
          <Card
           title={t('contracts.details.signature')}
           style={{ marginBottom: 16, borderRadius: 16 }}
          >
           <Flex justify="center" align="center">
            <div
             style={{
              padding: 16,
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              background: '#f9f9f9',
             }}
            >
             <Image
              src={contract.signatureImageUrl}
              alt="Signature"
              style={{ maxHeight: 100 }}
             />
            </div>
           </Flex>
          </Card>
         )}
         <Space>
          <Button
           onClick={() =>
            navigate(`/contractslist?hash=${reservation.property.hashId}`)
           }
          >
           {t('reservation.contract.viewAllContracts')}
          </Button>
         </Space>
        </div>
       )}
      </>
     )}
    </Card>

    <Modal
     title={
      <span>
       <ExclamationCircleOutlined
        style={{ color: 'red', marginRight: '8px' }}
       />
       {t('messages.deleteConfirm')}
      </span>
     }
     open={deleteConfirmVisible}
     onOk={confirmDelete}
     onCancel={hideDeleteConfirm}
     okText={t('common.yes')}
     cancelText={t('common.no')}
     okButtonProps={{ danger: true }}
    />

    <ShareModal
     isVisible={isShareModalVisible}
     onClose={() => setIsShareModalVisible(false)}
     pageUrl={shareUrl}
    />
   </Content>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default GenerateContract;
