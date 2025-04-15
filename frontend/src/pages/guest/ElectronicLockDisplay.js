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
  <Card
   className="detail-section"
   title={
    <Space>
     <LockOutlined style={{ color: '#5DADE2' }} />
     <span>{t('reservation.lock.title')}</span>
    </Space>
   }
  >
   <Row gutter={[16, 16]}>
    <Col span={24}>
     <Title level={4} style={{ textAlign: 'center', margin: 0 }}>
      {t('reservation.lock.codeInfo')}
     </Title>
     <Divider style={{ margin: '12px 0' }} />
     <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
      {t('reservation.lock.validityInfo')}
     </Text>
    </Col>

    <Col span={24}>
     <div
      style={{
       background: '#f7f7f7',
       padding: '12px',
       borderRadius: '8px',
       textAlign: 'center',
       position: 'relative',
       margin: '8px 0',
      }}
     >
      {codeVisible ? (
       <Title
        level={2}
        style={{
         fontFamily: 'monospace',
         letterSpacing: '4px',
         margin: 0,
         color: '#6D5FFA',
        }}
       >
        {formatLockCode(lockCode)}
       </Title>
      ) : (
       <Title
        level={2}
        style={{
         fontFamily: 'monospace',
         letterSpacing: '8px',
         margin: 0,
        }}
       >
        • • • • • •
       </Title>
      )}
     </div>
    </Col>

    <Col span={24} style={{ textAlign: 'center' }}>
     <Button
      type="primary"
      icon={codeVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
      onClick={() => setCodeVisible(!codeVisible)}
     >
      {codeVisible
       ? t('reservation.lock.hideCode')
       : t('reservation.lock.showCode')}
     </Button>
    </Col>
   </Row>
  </Card>
 );
};

export default ElectronicLockDisplay;
