import React, { useState, useEffect } from 'react';
import {
 Layout,
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
} from 'antd';
import {
 ArrowLeftOutlined,
 MailOutlined,
 LinkOutlined,
 CheckCircleOutlined,
 LockOutlined,
 CopyOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../../context/TranslationContext';
import { useReservation } from '../../../hooks/useReservation';
import ShareModal from '../../../components/common/ShareModal';
import dayjs from 'dayjs';
import Head from '../../../components/common/header';
import Foot from '../../../components/common/footer';
import useReservationContract from '../../../hooks/useReservationContract';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const GenerateContract = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const { id } = useParams();
 const {
  reservation,
  contract,
  loading,
  error,
  fetchReservation,
  getReservationContract,
  generateContract,
  sendToGuest,
 } = useReservation();
 const { updateContractStatus } = useReservationContract();

 const [currentStep, setCurrentStep] = useState(0);
 const [isShareModalVisible, setIsShareModalVisible] = useState(false);
 const [shareUrl, setShareUrl] = useState('');

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
 }, [id]);

 const handleGenerateContract = async () => {
  try {
   const contractData = await generateContract(id);
   if (contractData) {
    // Set the step based on the contract status returned from the API
    // DRAFT = 0, SENT = 1, SIGNED = 2, COMPLETED = 3
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

 const handleContinue = () => {
  navigate('/dashboard');
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
    <Foot />
   </Layout>
  );
 }

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

    <Title level={2}>{t('reservation.contractGeneration')}</Title>

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

    <Card bordered={false} className="contract-card">
     {reservation && (
      <>
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
       <Card
        title={
         <Space>
          <LockOutlined />
          {t('reservation.lock.title')}
          {reservation.electronicLockEnabled ? (
           <Tag color="success">{t('reservation.lock.active')}</Tag>
          ) : (
           <Tag color="default">{t('reservation.lock.inactive')}</Tag>
          )}
         </Space>
        }
        style={{ marginTop: 16 }}
        bordered={false}
       >
        {reservation.electronicLockEnabled && reservation.electronicLockCode ? (
         <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
           message={t('reservation.lock.codeInfo')}
           description={
            <Space direction="vertical" style={{ width: '100%' }}>
             <Text>{t('reservation.lock.validityInfo')}</Text>
             <Space>
              <Text strong>{reservation.electronicLockCode.toString()}</Text>
              <Tooltip title={t('common.copy')}>
               <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={() => {
                 navigator.clipboard.writeText(
                  reservation.electronicLockCode.toString()
                 );
                 message.success(t('common.copied'));
                }}
               />
              </Tooltip>
             </Space>
            </Space>
           }
           type="info"
           showIcon
          />
         </Space>
        ) : (
         <Empty
          description={t('reservation.lock.noCodeInfo')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
         />
        )}
       </Card>
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
         <Space>
          <Button
           onClick={() =>
            navigate(`/contractslist?hash=${reservation.property.hashId}`)
           }
          >
           {t('reservation.contract.viewAllContracts')}
          </Button>
          <Button
           type="primary"
           onClick={() => markContractComplete(contract.id)}
           icon={<CheckCircleOutlined />}
          >
           {t('reservation.contract.markComplete')}
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
         <Space>
          <Button
           onClick={() =>
            navigate(`/contractslist?hash=${reservation.property.hashId}`)
           }
          >
           {t('reservation.contract.viewAllContracts')}
          </Button>
          <Button type="primary" onClick={handleContinue}>
           {t('button.continue')}
          </Button>
         </Space>
        </div>
       )}
      </>
     )}
    </Card>

    <ShareModal
     isVisible={isShareModalVisible}
     onClose={() => setIsShareModalVisible(false)}
     pageUrl={shareUrl}
    />
   </Content>
   <Foot />
  </Layout>
 );
};

export default GenerateContract;
