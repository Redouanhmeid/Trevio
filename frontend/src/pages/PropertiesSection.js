import React, { useState } from 'react';
import {
 Row,
 Col,
 Divider,
 List,
 Image,
 Flex,
 Space,
 Popconfirm,
 Typography,
 Button,
 Spin,
 Alert,
} from 'antd';
import fallback from '../assets/fallback.png';
import { useTranslation } from '../context/TranslationContext';
import { useNavigate } from 'react-router-dom';
import ShareModal from '../components/common/ShareModal';

const { Title, Paragraph } = Typography;

const withPropertiesGuard = (WrappedComponent) => {
 return function WithPropertiesGuard({ properties, ...props }) {
  if (!properties) {
   return <Spin />;
  }

  // Ensure properties is always an array
  const propertiesArray = Array.isArray(properties) ? properties : [];

  return <WrappedComponent properties={propertiesArray} {...props} />;
 };
};

export const PropertiesSection = withPropertiesGuard(
 ({ properties, onToggleEnable, onDeleteProperty }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [pageUrl, setPageUrl] = useState();

  const hideShareModal = () => {
   setIsShareModalVisible(false);
  };

  const IconText = ({ icon, text, onClick }) => (
   <Button type="text" onClick={onClick} icon={icon} size="small">
    {text}
   </Button>
  );

  const showShareModal = (id) => {
   setPageUrl(`${window.location.origin}/propertydetails?id=${id}`);
   setIsShareModalVisible(true);
  };

  const renderPropertyItem = (property) => {
   const actions = [
    <div
     key="display"
     onClick={() => navigate(`/propertydetails?hash=${property.hashId}`)}
    >
     <i className="Dashicon Pointer fa-regular fa-eye" />
    </div>,
    <div key="share" onClick={() => showShareModal(property.id)}>
     <i className="Dashicon Pointer fa-regular fa-share-nodes" />
    </div>,
    <Popconfirm
     key="lock"
     title={
      property.status === 'enable'
       ? t('property.disable')
       : t('property.enable')
     }
     description={t('property.confirmToggle')}
     onConfirm={() => onToggleEnable(property.id)}
     okText={t('common.yes')}
     cancelText={t('common.no')}
     icon={
      property.status === 'enable' ? (
       <i
        className="Dashicon Pointer fa-regular fa-lock"
        style={{ color: '#F5222D', marginRight: 6 }}
       />
      ) : (
       <i
        className="Dashicon fa-regular fa-lock-open"
        style={{ color: '#52C41A', marginRight: 6 }}
       />
      )
     }
    >
     {property.status === 'enable' ? (
      <i
       className="Dashicon fa-regular fa-lock-open"
       style={{ color: '#52C41A' }}
      />
     ) : (
      <i className="Dashicon fa-regular fa-lock" style={{ color: '#F5222D' }} />
     )}
    </Popconfirm>,
    <Popconfirm
     key="delete"
     title={t('messages.deleteConfirm')}
     onConfirm={() => onDeleteProperty(property.id)}
     okText={t('common.yes')}
     cancelText={t('common.no')}
    >
     <Button
      danger
      icon={
       <i className="Dashicon fa-regular fa-trash" style={{ color: 'red' }} />
      }
      type="link"
      shape="circle"
     />
    </Popconfirm>,
   ];

   return (
    <List.Item
     key={property.id}
     style={{
      display: 'flex',
      padding: '16px',
      background: 'white',
      borderRadius: '16px',
      marginBottom: '16px',
      height: '274px',
     }}
    >
     <div
      style={{
       display: 'flex',
       flexDirection: 'column',
       width: 272,
       marginRight: 16,
      }}
     >
      <Image
       width={272}
       height={180}
       alt={property.name}
       src={property?.photos[0] || fallback}
       style={{
        borderRadius: '16px',
        objectFit: 'cover',
        height: '180px',
        width: '100%',
       }}
      />
      <Space
       justify="center"
       align="center"
       size={16}
       split={
        <Divider type="vertical" style={{ border: '1px solid #E9EAEB' }} />
       }
       style={{
        margin: '8px auto 0',
        padding: '4px 0',
       }}
      >
       {actions}
      </Space>
     </div>

     <div
      style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}
     >
      <Title level={4} style={{ margin: 0 }}>
       {property.name}
      </Title>
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
      <Space
       direction="vertical"
       size={2}
       style={{
        marginTop: 'auto',
        borderTop: '1px solid #f0f0f0',
        paddingTop: 6,
        width: '100%',
       }}
      >
       <IconText
        icon={<i className="PrimaryColor fa-light fa-book" />}
        text={t('property.actions.guidebook')}
        onClick={() => navigate(`/digitalguidebook?hash=${property.hashId}`)}
       />
       <IconText
        icon={<i className="PrimaryColor fa-light fa-calendar-days" />}
        text={t('reservation.title')}
        onClick={() => navigate(`/reservations?hash=${property.hashId}`)}
       />

       <IconText
        icon={<i className="PrimaryColor fa-light fa-file-signature" />}
        text={t('contracts.title')}
        onClick={() => navigate(`/contractslist?hash=${property.hashId}`)}
       />
      </Space>
     </div>
    </List.Item>
   );
  };

  return (
   <div className="dash-properties">
    <Row gutter={[12, 24]}>
     <Col xs={24}>
      <Title level={3}>
       {t('property.title')}
       {'  '}
       <i className="PrimaryColor fa-regular fa-house" />
      </Title>
      <Divider
       style={{
        width: '20%',
        minWidth: 0,
        borderTopWidth: 2,
        margin: '12px 0 16px 0',
       }}
      />
     </Col>
    </Row>
    <Row gutter={[24, 4]}>
     {properties.map((property, index) => (
      <Col key={property.id} xs={24} sm={12} md={12} lg={12}>
       <List
        className="properties-list"
        itemLayout="vertical"
        size="large"
        dataSource={[property]}
        renderItem={renderPropertyItem}
       />
      </Col>
     ))}
    </Row>

    <ShareModal
     isVisible={isShareModalVisible}
     onClose={hideShareModal}
     pageUrl={pageUrl}
    />
   </div>
  );
 }
);
