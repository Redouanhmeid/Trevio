import React, { useState, useEffect } from 'react';
import {
 Spin,
 Card,
 Typography,
 Button,
 Row,
 Col,
 Flex,
 Divider,
 Image,
 Tooltip,
 Modal,
} from 'antd';
import {
 LockOutlined,
 EyeOutlined,
 EyeInvisibleOutlined,
 QuestionCircleOutlined,
} from '@ant-design/icons';
import ReactPlayer from 'react-player';
import { useTranslation } from '../../context/TranslationContext';
import useEquipement from '../../hooks/useEquipement';
import fallback from '../../assets/fallback.png';

const { Title, Text, Paragraph } = Typography;

const ElectronicLockDisplay = ({ lockCode, propertyId }) => {
 const { t } = useTranslation();
 const [codeVisible, setCodeVisible] = useState(false);
 const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
 const [lockEquipment, setLockEquipment] = useState(null);
 const [loading, setLoading] = useState(false);

 const { getAllEquipements, getOneEquipement } = useEquipement();

 // Find the electronic lock equipment when component mounts
 useEffect(() => {
  const fetchLockEquipment = async () => {
   if (!propertyId) return;

   setLoading(true);
   try {
    // Get all equipment for this property
    const equipments = await getAllEquipements(propertyId);

    if (equipments && Array.isArray(equipments)) {
     // Find equipment with fingerprint name (electronic lock)
     const fingerprintEquipment = equipments.find(
      (equipment) =>
       equipment.name === 'fingerprint' || equipment.name === 'lockbox'
     );
     console.log(equipments);

     if (fingerprintEquipment) {
      // Get detailed equipment information
      const detailedEquipment = await getOneEquipement(fingerprintEquipment.id);
      setLockEquipment(detailedEquipment);
     }
    }
   } catch (error) {
    console.error('Error fetching lock equipment:', error);
   } finally {
    setLoading(false);
   }
  };

  fetchLockEquipment();
 }, [propertyId]);

 // Format the lock code with spaces for better readability
 const formatLockCode = (code) => {
  if (!code) return '';

  // Convert to string if it's not already
  const codeStr = code.toString();

  // Insert a space after every 2 digits
  return codeStr.replace(/(\d{2})(?=\d)/g, '$1 ');
 };

 const showHelpModal = () => {
  setIsHelpModalVisible(true);
 };

 const hideHelpModal = () => {
  setIsHelpModalVisible(false);
 };

 // Render media content based on type
 const renderMedia = () => {
  if (!lockEquipment || !lockEquipment.media) {
   return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
     <Text type="secondary">{t('equipment.noMedia')}</Text>
    </div>
   );
  }

  if (ReactPlayer.canPlay(lockEquipment.media)) {
   return (
    <ReactPlayer
     url={lockEquipment.media}
     controls
     width="100%"
     height={300}
     style={{ margin: '0 auto' }}
    />
   );
  } else {
   return (
    <div style={{ textAlign: 'center' }}>
     <Image
      src={lockEquipment.media}
      alt={t('equipment.lockInstructions')}
      style={{
       maxWidth: '100%',
       maxHeight: '300px',
       objectFit: 'contain',
      }}
      fallback={fallback}
     />
    </div>
   );
  }
 };

 if (!lockCode) {
  return null; // Don't render anything if no lock code
 }

 return (
  <Card className="electronic-lock-card">
   <Flex justify="center">
    <div className="lock-header">
     <LockOutlined className="lock-icon" />
     <Text>{t('reservation.lock.title')}</Text>
     {lockEquipment && (
      <Tooltip title={t('reservation.lock.howToUse')}>
       <Button
        type="link"
        icon={<i class="fa-regular fa-question" />}
        onClick={showHelpModal}
        style={{ color: '#6D5FFA' }}
       />
      </Tooltip>
     )}
    </div>
   </Flex>

   <div className="lock-content">
    <Title level={3} className="access-code-title">
     {t('reservation.lock.codeInfo')}
    </Title>

    <Text className="validity-text">{t('reservation.lock.validityInfo')}</Text>

    <div className="code-display">
     {codeVisible ? (
      <Text className="visible-code">{formatLockCode(lockCode)}</Text>
     ) : (
      <div className="hidden-code">
       <span>•</span>
       <span>•</span>
       <span>•</span>
       <span>•</span>
       <span>•</span>
       <span>•</span>
      </div>
     )}
    </div>

    <Button
     type="primary"
     icon={codeVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
     onClick={() => setCodeVisible(!codeVisible)}
     className="code-toggle-button"
    >
     {codeVisible
      ? t('reservation.lock.hideCode')
      : t('reservation.lock.showCode')}
    </Button>
   </div>

   {/* Help Modal */}
   <Modal
    title={t('reservation.lock.instructions')}
    open={isHelpModalVisible}
    onCancel={hideHelpModal}
    footer={[
     <Button key="close" onClick={hideHelpModal}>
      {t('common.close')}
     </Button>,
    ]}
    width={700}
   >
    {loading ? (
     <div style={{ textAlign: 'center', padding: '30px' }}>
      <Spin size="large" />
     </div>
    ) : lockEquipment ? (
     <div>
      <Title level={4} style={{ textAlign: 'center', marginBottom: '20px' }}>
       {t(`equipement.${lockEquipment.name}`)}
      </Title>

      {renderMedia()}

      <Paragraph
       style={{
        fontSize: '16px',
        marginTop: '20px',
        textAlign: 'center',
       }}
      >
       {lockEquipment.description || t('equipment.noDescription')}
      </Paragraph>
     </div>
    ) : (
     <div style={{ textAlign: 'center', padding: '20px' }}>
      <Text type="secondary">{t('equipment.noInstructions')}</Text>
     </div>
    )}
   </Modal>
  </Card>
 );
};

export default ElectronicLockDisplay;
