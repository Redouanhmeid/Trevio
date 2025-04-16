import React, { useState } from 'react';
import { Card, Typography, Button, Row, Col, Space, Divider } from 'antd';
import {
 LockOutlined,
 EyeOutlined,
 EyeInvisibleOutlined,
} from '@ant-design/icons';
import { useTranslation } from '../../context/TranslationContext';

const { Title, Text } = Typography;

const ElectronicLockDisplay = ({ lockCode }) => {
 const { t } = useTranslation();
 const [codeVisible, setCodeVisible] = useState(false);

 // Format the lock code with spaces for better readability
 const formatLockCode = (code) => {
  if (!code) return '';

  // Convert to string if it's not already
  const codeStr = code.toString();

  // Insert a space after every 2 digits
  return codeStr.replace(/(\d{2})(?=\d)/g, '$1 ');
 };

 if (!lockCode) {
  return null; // Don't render anything if no lock code
 }

 return (
  <Card className="electronic-lock-card">
   <div className="lock-header">
    <LockOutlined className="lock-icon" />
    <Text>{t('reservation.lock.title')}</Text>
   </div>

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
  </Card>
 );
};

export default ElectronicLockDisplay;
