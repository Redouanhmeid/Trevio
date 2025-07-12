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
 Descriptions,
 Result,
 Alert,
 Space,
 Spin,
 message,
 Modal,
 Image,
 Grid,
 Form,
 InputNumber,
} from 'antd';
import {
 ArrowLeftOutlined,
 LinkOutlined,
 CheckCircleOutlined,
 CloseCircleOutlined,
 ExclamationCircleOutlined,
 EditOutlined,
 SaveOutlined,
 CloseOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../../context/TranslationContext';
import { useReservation } from '../../../hooks/useReservation';
import useRevenue from '../../../hooks/useRevenue';
import useNotification from '../../../hooks/useNotification';
import ShareModal from '../../../components/common/ShareModal';
import dayjs from 'dayjs';
import Head from '../../../components/common/header';
import Foot from '../../../components/common/footer';
import useReservationContract from '../../../hooks/useReservationContract';
import ElectronicLockCodeManager from './ElectronicLockCodeManager';
import PDFContractGenerator from '../../../utils/PDFContractGenerator';

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

 const { createRevenueFromReservation } = useRevenue();
 const { createNotification } = useNotification();
 const [userId, setUserId] = useState(null);

 const [currentStep, setCurrentStep] = useState(0);
 const [isShareModalVisible, setIsShareModalVisible] = useState(false);
 const [shareUrl, setShareUrl] = useState('');

 const [lockSettingsChanged, setLockSettingsChanged] = useState(false);

 const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

 const [isDesktopFormVisible, setIsDesktopFormVisible] = useState(false);
 const [editMode, setEditMode] = useState(false);
 const [editForm] = Form.useForm();
 const [editingReservation, setEditingReservation] = useState(null);
 const [isLoading, setIsLoading] = useState(false);

 const handleUserData = (userData) => {
  setUserId(userData);
 };

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
   setIsLoading(true);
   await updateContractStatus(contractId, 'COMPLETED');

   const revenueData = {
    propertyId: reservation.propertyId,
    amount: reservation.totalPrice,
    createdBy: userId,
    notes: `Revenue from reservation #${reservation.id}`,
    startDate: reservation.startDate,
    endDate: reservation.endDate,
   };

   const revenueResult = await createRevenueFromReservation(
    reservation.id,
    revenueData
   );

   try {
    const notificationData = {
     userId: userId,
     propertyId: reservation.propertyId,
     title: 'New Revenue Update',
     message: `The revenue for ${reservation.property.propertyName} has been updated`,
     type: 'revenue_update',
     channel: 'email',
     status: 'pending',
    };

    await createNotification(notificationData);
   } catch (notificationError) {
    console.error('Error creating notification:', notificationError);
   }
   // Refresh data to update UI
   await getReservationContract(id);
   setCurrentStep(3);
   message.success(t('reservation.contract.completeSuccess'));
  } catch (error) {
   message.error(t('reservation.contract.completeError'));
  } finally {
   setIsLoading(false);
  }
 };

 const markContractRejected = async (contractId) => {
  try {
   setIsLoading(true);
   await updateContractStatus(contractId, 'REJECTED');

   // Refresh data to update UI
   await getReservationContract(id);
   setCurrentStep(0); // Reset to draft state after rejection
   message.success(t('reservation.contract.rejectSuccess'));
  } catch (error) {
   message.error(t('reservation.contract.rejectError'));
  } finally {
   setIsLoading(false);
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

 const handleEditReservation = () => {
  setEditingReservation({
   ...reservation,
   totalPrice: reservation.totalPrice,
  });
  editForm.setFieldsValue({
   totalPrice: reservation.totalPrice,
  });
  setEditMode(true);
 };

 const handleSaveReservation = async () => {
  try {
   const values = await editForm.validateFields();

   // Call API to update reservation
   const response = await fetch(`/api/v1/reservations/${id}`, {
    method: 'PUT',
    headers: {
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({
     totalPrice: values.totalPrice,
    }),
   });

   if (!response.ok) {
    throw new Error('Failed to update reservation');
   }

   message.success(t('messages.updateSuccess'));

   // Refresh the reservation data
   await fetchReservation(id);
   setEditMode(false);
  } catch (error) {
   message.error(t('messages.updateError'));
  }
 };

 const handleCancelEdit = () => {
  setEditMode(false);
 };

 const showDesktopEditForm = () => {
  editForm.setFieldsValue({
   totalPrice: reservation.totalPrice,
  });
  setIsDesktopFormVisible(true);
 };

 const hideDesktopEditForm = () => {
  setIsDesktopFormVisible(false);
 };

 const handleDesktopFormSave = async () => {
  try {
   const values = await editForm.validateFields();

   // Call API to update reservation
   const response = await fetch(`/api/v1/reservations/${id}`, {
    method: 'PUT',
    headers: {
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({
     totalPrice: values.totalPrice,
    }),
   });

   if (!response.ok) {
    throw new Error('Failed to update reservation');
   }

   message.success(t('messages.updateSuccess'));

   // Refresh the reservation data
   await fetchReservation(id);
   setIsDesktopFormVisible(false);
  } catch (error) {
   message.error(t('messages.updateError'));
  }
 };

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

 if (error) {
  return (
   <Layout className="contentStyle">
    <Head />
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
   <Head onUserData={handleUserData} />
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

    {reservation && (
     <>
      {screens.xs ? (
       <Card bordered={false} className="reservation-details-card">
        <Flex justify="space-between" align="center">
         <Title
          level={4}
          style={{ marginTop: '8px', marginBottom: '16px', color: '#6D5FFA' }}
         >
          {t('reservation.details')}
         </Title>
         {!editMode ? (
          <Button
           type="text"
           icon={<EditOutlined />}
           onClick={handleEditReservation}
          />
         ) : (
          <Space>
           <Button
            type="text"
            danger
            icon={<CloseOutlined />}
            onClick={handleCancelEdit}
           />
           <Button
            type="text"
            icon={<SaveOutlined />}
            onClick={handleSaveReservation}
           />
          </Space>
         )}
        </Flex>

        {!editMode ? (
         <Row gutter={[8, 0]}>
          <Col span={12}>
           <Text type="secondary">{t('property.basic.name')}</Text>
           <Paragraph strong className="reservation-paragraph">
            {reservation.property.name}
           </Paragraph>
          </Col>
          <Col span={12}>
           <Text type="secondary">{t('reservation.dates')}</Text>
           <Paragraph strong className="reservation-paragraph">
            {dayjs(reservation.startDate).format('DD-MM-YYYY')}
            <br />
            {dayjs(reservation.endDate).format('DD-MM-YYYY')}
           </Paragraph>
          </Col>
          <Col span={12}>
           <Text type="secondary">{t('reservation.pricePerNight')}</Text>
           <Paragraph strong className="reservation-paragraph">
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
           <Text type="secondary">{t('reservation.totalNights')}</Text>
           <Paragraph strong className="reservation-paragraph">
            {dayjs(reservation.endDate).diff(
             dayjs(reservation.startDate),
             'day'
            )}
           </Paragraph>
          </Col>
          <Col span={12}>
           <Text type="secondary">{t('reservation.totalPrice')}</Text>
           <Paragraph strong className="reservation-paragraph">
            {reservation.totalPrice} dhs
           </Paragraph>
          </Col>
          {reservation.bookingSource && (
           <Col span={12}>
            <Text type="secondary">{t('reservation.bookingSource')}</Text>
            <Paragraph strong className="reservation-paragraph">
             {reservation.bookingSource}
            </Paragraph>
           </Col>
          )}
         </Row>
        ) : (
         <Form
          form={editForm}
          layout="vertical"
          initialValues={{
           totalPrice: editingReservation?.totalPrice,
          }}
         >
          <Row gutter={[8, 0]}>
           <Col span={12}>
            <Text type="secondary">{t('property.basic.name')}</Text>
            <Paragraph strong className="reservation-paragraph">
             {reservation.property.name}
            </Paragraph>
           </Col>
           <Col span={12}>
            <Text type="secondary">{t('reservation.dates')}</Text>
            <Paragraph strong className="reservation-paragraph">
             {dayjs(reservation.startDate).format('DD-MM-YYYY')}
             <br />
             {dayjs(reservation.endDate).format('DD-MM-YYYY')}
            </Paragraph>
           </Col>
           <Col span={12}>
            <Text type="secondary">{t('reservation.pricePerNight')}</Text>
            <Paragraph strong className="reservation-paragraph">
             {Math.round(
              editForm.getFieldValue('totalPrice') /
               dayjs(reservation.endDate).diff(
                dayjs(reservation.startDate),
                'day'
               )
             )}{' '}
             Dhs
            </Paragraph>
           </Col>
           <Col span={12}>
            <Text type="secondary">{t('reservation.totalNights')}</Text>
            <Paragraph strong className="reservation-paragraph">
             {dayjs(reservation.endDate).diff(
              dayjs(reservation.startDate),
              'day'
             )}
            </Paragraph>
           </Col>
           <Col span={12}>
            <Form.Item
             name="totalPrice"
             label={t('reservation.totalPrice')}
             rules={[
              { required: true, message: t('validation.required') },
              {
               type: 'number',
               min: 0,
               message: t('validation.positiveNumber'),
              },
             ]}
            >
             <InputNumber
              min={0}
              addonAfter="Dhs"
              style={{ width: '100%' }}
              onChange={(value) => {
               // Update form value when changed
               editForm.setFieldsValue({ totalPrice: value });
              }}
             />
            </Form.Item>
           </Col>
           {reservation.bookingSource && (
            <Col span={12}>
             <Text type="secondary">{t('reservation.bookingSource')}</Text>
             <Paragraph strong className="reservation-paragraph">
              {reservation.bookingSource}
             </Paragraph>
            </Col>
           )}
          </Row>
         </Form>
        )}
       </Card>
      ) : (
       <>
        <Descriptions
         title={
          <Flex
           justify="space-between"
           align="center"
           style={{ width: '100%' }}
          >
           <span>{t('reservation.details')}</span>
           <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={showDesktopEditForm}
           >
            {t('common.edit')}
           </Button>
          </Flex>
         }
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
        </Descriptions>

        <Modal
         title={t('common.edit')}
         open={isDesktopFormVisible}
         onCancel={hideDesktopEditForm}
         footer={[
          <Button key="cancel" onClick={hideDesktopEditForm}>
           {t('common.cancel')}
          </Button>,
          <Button key="save" type="primary" onClick={handleDesktopFormSave}>
           {t('common.save')}
          </Button>,
         ]}
         width={600}
        >
         <Form
          form={editForm}
          layout="vertical"
          initialValues={{
           totalPrice: reservation?.totalPrice,
          }}
         >
          <Row gutter={[24, 16]}>
           <Col span={12}>
            <Form.Item label={t('property.basic.name')}>
             <Input value={reservation.property.name} disabled />
            </Form.Item>
           </Col>
           <Col span={12}>
            <Form.Item label={t('reservation.totalNights')}>
             <Input
              value={dayjs(reservation.endDate).diff(
               dayjs(reservation.startDate),
               'day'
              )}
              disabled
              suffix={t('reservation.nights')}
             />
            </Form.Item>
           </Col>
           <Col span={12}>
            <Form.Item label={t('reservation.dates')}>
             <Input
              value={`${dayjs(reservation.startDate).format(
               'YYYY-MM-DD'
              )} - ${dayjs(reservation.endDate).format('YYYY-MM-DD')}`}
              disabled
             />
            </Form.Item>
           </Col>
           <Col span={12}>
            <Form.Item
             label={t('reservation.totalPrice')}
             name="totalPrice"
             rules={[
              { required: true, message: t('validation.required') },
              {
               type: 'number',
               min: 0,
               message: t('validation.positiveNumber'),
               transform: (value) =>
                value === '' || value === undefined ? 0 : Number(value),
              },
             ]}
            >
             <InputNumber
              min={0}
              addonAfter="Dhs"
              style={{ width: '100%' }}
              onChange={(value) => {
               editForm.setFieldsValue({ totalPrice: value });
              }}
             />
            </Form.Item>
           </Col>
           {reservation.bookingSource && (
            <Col span={12}>
             <Form.Item label={t('reservation.bookingSource')}>
              <Input value={reservation.bookingSource} disabled />
             </Form.Item>
            </Col>
           )}
          </Row>
         </Form>
        </Modal>
       </>
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
             <div className="timeline-container">
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

         <Col xs={24} md={14}>
          <Card className="reservation-guest-card">
           <Title level={3}>{t('contracts.guestInformation')}</Title>
           <Space direction="vertical" style={{ width: '100%' }}>
            <Flex justify="space-between">
             <Space>
              <i className="fa-regular fa-user PrimaryColor" />
              <div>
               <Text>
                {contract.firstname} {contract.middlename || ''}{' '}
                {contract.lastname}
               </Text>
              </div>
             </Space>
             <Space>
              <i className="fa-regular fa-envelope PrimaryColor" />
              <div>
               <Text>{contract.email}</Text>
              </div>
             </Space>
             <Space>
              <i className="fa-regular fa-phone PrimaryColor" />
              <div>
               <Text>{contract.phone || '-'}</Text>
              </div>
             </Space>
            </Flex>

            <Flex justify="space-between">
             <Space>
              <i className="fa-regular fa-calendar PrimaryColor" />
              <div>
               <Text>{dayjs(contract.birthDate).format('YYYY-MM-DD')}</Text>
              </div>
             </Space>
             <Space>
              <i className="fa-regular fa-venus-mars PrimaryColor" />
              <div>
               <Text>{contract.sex}</Text>
              </div>
             </Space>
             <Space>
              <i className="fa-regular fa-globe PrimaryColor" />
              <div>
               <Text>{contract.nationality}</Text>
              </div>
             </Space>
            </Flex>

            <Flex justify="space-between">
             <Space>
              <i className="fa-regular fa-location-dot PrimaryColor" />
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
             <Text type="secondary">{t('contracts.details.documentType')}</Text>
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

        <Space direction={screens.xs ? 'vertical' : 'horizontal'}>
         <Button
          type="primary"
          onClick={() => markContractComplete(contract.id)}
          icon={<CheckCircleOutlined />}
          loading={isLoading}
         >
          {t('reservation.contract.markComplete')}
         </Button>

         <Button
          danger
          onClick={() => markContractRejected(contract.id)}
          icon={<CloseCircleOutlined />}
          loading={isLoading}
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
             <div className="timeline-container">
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

         <Col xs={24} md={14}>
          <Card className="reservation-guest-card">
           <Title level={3}>{t('contracts.guestInformation')}</Title>
           <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Flex justify="space-between">
             <Space>
              <i className="fa-regular fa-user PrimaryColor" />
              <div>
               <Text strong style={{ fontSize: 16 }}>
                {contract.firstname} {contract.middlename || ''}{' '}
                {contract.lastname}
               </Text>
              </div>
             </Space>
             <Space>
              <i className="fa-regular fa-envelope PrimaryColor" />
              <div>
               <Text>{contract.email}</Text>
              </div>
             </Space>
             <Space>
              <i className="fa-regular fa-phone PrimaryColor" />
              <div>
               <Text>{contract.phone || '-'}</Text>
              </div>
             </Space>
            </Flex>

            <Flex justify="space-between">
             <Space>
              <i className="fa-regular fa-calendar PrimaryColor" />
              <div>
               <Text>{dayjs(contract.birthDate).format('YYYY-MM-DD')}</Text>
              </div>
             </Space>
             <Space>
              <i className="fa-regular fa-venus-mars PrimaryColor" />
              <div>
               <Text>{contract.sex}</Text>
              </div>
             </Space>
             <Space>
              <i className="fa-regular fa-globe PrimaryColor" />
              <div>
               <Text>{contract.nationality}</Text>
              </div>
             </Space>
            </Flex>

            <Flex justify="space-between">
             <Space>
              <i className="fa-regular fa-location-dot PrimaryColor" />
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
             <Text type="secondary">{t('contracts.details.documentType')}</Text>
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
         <PDFContractGenerator
          formData={{
           firstname: contract.firstname,
           lastname: contract.lastname,
           middlename: contract.middlename,
           birthDate: dayjs(contract.birthDate),
           sex: contract.sex,
           Nationality: contract.nationality,
           email: contract.email,
           phone: contract.phone,
           residenceCountry: contract.residenceCountry,
           residenceCity: contract.residenceCity,
           residenceAddress: contract.residenceAddress,
           residencePostalCode: contract.residencePostalCode,
           documentType: contract.documentType,
           documentNumber: contract.documentNumber,
           documentIssueDate: dayjs(contract.documentIssueDate),
           submissionDate: contract.updatedAt,
          }}
          signature={
           contract.signatureImageUrl
            ? {
               toDataURL: () => contract.signatureImageUrl,
               isEmpty: () => false,
              }
            : null
          }
          filelist={[]} // Empty since contracts don't have attached files
          t={t}
         />
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
