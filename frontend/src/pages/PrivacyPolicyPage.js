import React, { useState } from 'react';
import {
 Layout,
 Typography,
 Card,
 Button,
 Space,
 Divider,
 Anchor,
 FloatButton,
 Grid,
 Flex,
 List,
} from 'antd';
import { ArrowLeftOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../context/TranslationContext';
import { Helmet } from 'react-helmet';
import Sidebar from '../components/common/sidebar';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const PrivacyPolicyPage = ({
 reservationCode,
 showBackButton = true,
 showSidebar = true,
 embedded = false,
}) => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const [collapsed, setCollapsed] = useState(true);
 const screens = useBreakpoint();

 const handleBack = () => {
  navigate(-1);
 };

 // Privacy policy sections based on the new translations
 const privacyPolicySections = [
  {
   key: 'introduction',
   title: t('privacyPolicy.introduction.title'),
   content: t('privacyPolicy.introduction.content'),
  },
  {
   key: 'dataCollection',
   title: t('privacyPolicy.dataCollection.title'),
   items: [
    {
     subtitle: t('privacyPolicy.dataCollection.personal.subtitle'),
     content: t('privacyPolicy.dataCollection.personal.content'),
    },
    {
     subtitle: t('privacyPolicy.dataCollection.identification.subtitle'),
     content: t('privacyPolicy.dataCollection.identification.content'),
    },
    {
     subtitle: t('privacyPolicy.dataCollection.booking.subtitle'),
     content: t('privacyPolicy.dataCollection.booking.content'),
    },
    {
     subtitle: t('privacyPolicy.dataCollection.communication.subtitle'),
     content: t('privacyPolicy.dataCollection.communication.content'),
    },
   ],
  },
  {
   key: 'dataUse',
   title: t('privacyPolicy.dataUse.title'),
   listItems: t('privacyPolicy.dataUse.purposes'),
  },
  {
   key: 'dataSharing',
   title: t('privacyPolicy.dataSharing.title'),
   items: [
    {
     subtitle: t('privacyPolicy.dataSharing.hosts.subtitle'),
     content: t('privacyPolicy.dataSharing.hosts.content'),
    },
    {
     subtitle: t('privacyPolicy.dataSharing.authorities.subtitle'),
     content: t('privacyPolicy.dataSharing.authorities.content'),
    },
    {
     subtitle: t('privacyPolicy.dataSharing.services.subtitle'),
     content: t('privacyPolicy.dataSharing.services.content'),
    },
   ],
  },
  {
   key: 'dataProtection',
   title: t('privacyPolicy.dataProtection.title'),
   items: [
    {
     subtitle: t('privacyPolicy.dataProtection.security.subtitle'),
     content: t('privacyPolicy.dataProtection.security.content'),
    },
    {
     subtitle: t('privacyPolicy.dataProtection.retention.subtitle'),
     content: t('privacyPolicy.dataProtection.retention.content'),
    },
    {
     subtitle: t('privacyPolicy.dataProtection.encryption.subtitle'),
     content: t('privacyPolicy.dataProtection.encryption.content'),
    },
   ],
  },
  {
   key: 'yourRights',
   title: t('privacyPolicy.yourRights.title'),
   content: t('privacyPolicy.yourRights.content'),
   listItems: t('privacyPolicy.yourRights.rights'),
  },
  {
   key: 'cookies',
   title: t('privacyPolicy.cookies.title'),
   content: t('privacyPolicy.cookies.content'),
  },
  {
   key: 'legalBasis',
   title: t('privacyPolicy.legalBasis.title'),
   content: t('privacyPolicy.legalBasis.content'),
   listItems: t('privacyPolicy.legalBasis.bases'),
  },
  {
   key: 'childrenPrivacy',
   title: t('privacyPolicy.childrenPrivacy.title'),
   content: t('privacyPolicy.childrenPrivacy.content'),
  },
  {
   key: 'contact',
   title: t('privacyPolicy.contact.title'),
   content: t('privacyPolicy.contact.content'),
   contactInfo: {
    email: t('privacyPolicy.contact.email'),
    address: t('privacyPolicy.contact.address'),
   },
  },
  {
   key: 'changes',
   title: t('privacyPolicy.changes.title'),
   content: t('privacyPolicy.changes.content'),
  },
 ];

 const anchorItems = privacyPolicySections.map((section) => ({
  key: section.key,
  href: `#${section.key}`,
  title: section.title,
 }));

 const renderSection = (section) => (
  <Card
   key={section.key}
   id={section.key}
   style={{ marginBottom: 12 }}
   bordered={false}
   className="privacy-section-card"
  >
   <Title level={4} style={{ color: '#6D5FFA' }}>
    {section.title}
   </Title>

   {section.content && <Paragraph>{section.content}</Paragraph>}

   {section.items &&
    section.items.map((item, index) => (
     <div key={index} style={{ marginBottom: 10 }}>
      <Title level={5} style={{ marginBottom: 8, color: '#333' }}>
       {item.subtitle}
      </Title>
      <Paragraph style={{ paddingLeft: 16 }}>{item.content}</Paragraph>
     </div>
    ))}

   {section.listItems && (
    <List
     dataSource={section.listItems}
     renderItem={(item) => (
      <List.Item style={{ border: 'none', paddingLeft: 0, paddingRight: 0 }}>
       <Text>• {item}</Text>
      </List.Item>
     )}
     style={{ marginTop: 8 }}
    />
   )}

   {section.contactInfo && (
    <div style={{ marginTop: 16, paddingLeft: 16 }}>
     <Paragraph>
      <strong>Email:</strong> {section.contactInfo.email}
     </Paragraph>
     <Paragraph>
      <strong>Address:</strong> {section.contactInfo.address}
     </Paragraph>
    </div>
   )}
  </Card>
 );

 const content = (
  <>
   <Helmet>
    <link
     rel="stylesheet"
     href="https://site-assets.fontawesome.com/releases/v6.4.2/css/all.css"
    />
    <title>{t('privacyPolicy.title')} - Trevio</title>
   </Helmet>

   {showBackButton && (
    <Button
     type="link"
     icon={<ArrowLeftOutlined />}
     onClick={handleBack}
     style={{ marginBottom: 16, padding: 0 }}
    >
     {t('button.back')}
    </Button>
   )}

   <Card style={{ marginBottom: 24 }} bordered={false}>
    <Flex justify="center" align="center" vertical style={{ marginBottom: 32 }}>
     <Title
      level={1}
      style={{ textAlign: 'center', color: '#6D5FFA', marginBottom: 16 }}
     >
      {t('privacyPolicy.title')}
     </Title>

     <Space size="middle" align="center">
      <CalendarOutlined style={{ color: '#666' }} />
      <Text type="secondary" style={{ fontSize: 16 }}>
       {t('privacyPolicy.lastUpdated')} {new Date().toLocaleDateString()}
      </Text>
     </Space>
    </Flex>
   </Card>

   <Flex gap="middle" className="privacy-layout">
    {/* Anchor Navigation - Desktop Only */}
    {!screens.xs && (
     <Anchor
      items={anchorItems}
      offsetTop={100}
      bounds={30}
      replace
      targetOffset={100}
     />
    )}

    {/* Content Area */}
    <div style={{ flex: 1 }}>
     {privacyPolicySections.map(renderSection)}

     {/* Footer Note */}
     <Card
      style={{
       marginTop: 32,
       backgroundColor: '#f8f9ff',
       border: '1px solid #e8e9ff',
      }}
      bordered={false}
     >
      <Paragraph
       style={{
        textAlign: 'center',
        margin: 0,
        color: '#666',
        fontSize: 14,
       }}
      >
       This privacy policy is compliant with GDPR and local Moroccan data
       protection laws.
      </Paragraph>
     </Card>
    </div>
   </Flex>

   <FloatButton.BackTop />
  </>
 );

 if (embedded) {
  return content;
 }

 return (
  <Layout>
   {showSidebar && (
    <Sidebar reservationCode={reservationCode} onCollapse={setCollapsed} />
   )}
   <Layout className="contentStyle">
    <Content className="container">{content}</Content>
   </Layout>
  </Layout>
 );
};

export default PrivacyPolicyPage;
