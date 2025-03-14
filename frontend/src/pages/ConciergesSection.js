import React, { useState, useEffect } from 'react';
import {
 Row,
 Col,
 Card,
 Divider,
 Typography,
 List,
 Flex,
 Space,
 Button,
 Tag,
 message,
 Form,
 Input,
 Spin,
} from 'antd';
import { useTranslation } from '../context/TranslationContext';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

export const ConciergesSection = React.memo(
 ({ userId: clientId, concierges }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!clientId) {
   return (
    <div className="loading">
     <Spin size="large" />
    </div>
   );
  }
  return (
   <Row gutter={[32, 32]}>
    <Col xs={24}>
     <Card
      title={
       <>
        {t('managers.title')}
        {'  '}
        <i className="PrimaryColor fa-regular fa-users" />
        <br />
        <Divider />
       </>
      }
      className="dash-card"
      extra={
       <Space>
        <Button
         onClick={() => navigate('/assign-concierge', { state: { clientId } })}
         icon={<i className="fa-regular fa-house-user" />}
        >
         {t('managers.assignButton')}
        </Button>
        <Button
         type="primary"
         icon={<i className="fa-regular fa-plus" />}
         onClick={() => navigate('/add-concierge', { state: { clientId } })}
        >
         {t('managers.addButton')}
        </Button>
       </Space>
      }
     >
      <List
       itemLayout="horizontal"
       dataSource={concierges}
       renderItem={(concierge) => (
        <List.Item
         actions={[
          <Button
           type="link"
           onClick={() => navigate(`/concierges/${concierge.id}/properties`)}
          >
           {t('managers.manageProperties')}
          </Button>,
         ]}
        >
         <List.Item.Meta
          title={
           <Flex justify="flex-start" align="center" gap="middle">
            <Text strong>{`${concierge.firstname} ${concierge.lastname}`}</Text>
            <Tag color="blue">{concierge.email}</Tag>
           </Flex>
          }
          description={
           <Space direction="vertical" size="small">
            <Text type="secondary">
             <i className="fa-regular fa-phone" /> {concierge.phone}
            </Text>
            {concierge.isVerified ? (
             <Tag color="green">{t('managers.active')}</Tag>
            ) : (
             <Tag color="#9DE3F2">{t('managers.pending')}</Tag>
            )}
           </Space>
          }
         />
        </List.Item>
       )}
      />
     </Card>
    </Col>
   </Row>
  );
 }
);
