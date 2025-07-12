// src/components/common/TutorialsAlert.js
// Transformed from TutorialsDrawer to use Alert component positioned below Head
import React, { useState, useEffect } from 'react';
import {
 Alert,
 Typography,
 Button,
 Row,
 Col,
 Card,
 Image,
 Space,
 Badge,
 Flex,
} from 'antd';
import { useTranslation } from '../../context/TranslationContext';
import fallback from '../../assets/fallback2.png';

const { Title, Text } = Typography;

const TutorialsAlert = ({ open, onClose }) => {
 const { t } = useTranslation();
 const [activeFilter, setActiveFilter] = useState('all');
 const [filteredTutorials, setFilteredTutorials] = useState([]);

 // Tutorial data - you can move this to a separate file or fetch from an API
 const tutorials = [
  {
   id: 1,
   title: 'How to Create a Property in Checkin',
   description:
    "Learn how to easily set up a new property in Checkin's platform in just a few steps.",
   duration: '0:57',
   thumbnail:
    'https://trevio.ma/wp-content/uploads/2025/03/Mask-group-1-1024x392.png',
   category: 'getting-started',
   videoUrl: 'https://example.com/video1', // Replace with actual video URL
  },
  {
   id: 2,
   title: 'How to Create a Booking in Checkin',
   description:
    'Discover how to manually add and manage bookings within the Checkin platform.',
   duration: '0:59',
   thumbnail: '/api/placeholder/300/200',
   category: 'getting-started',
   videoUrl: 'https://example.com/video2',
  },
  {
   id: 3,
   title: 'How to Manage Your Bookings in Checkin',
   description:
    'A step-by-step guide to organizing and updating your reservations using Checkin.',
   duration: '0:55',
   thumbnail: '/api/placeholder/300/200',
   category: 'getting-started',
   videoUrl: 'https://example.com/video3',
  },
  {
   id: 4,
   title: 'How to Activate Online Check-in in Checkin',
   description:
    'Activate the online check-in feature to simplify your guest registration process.',
   duration: '0:53',
   thumbnail: '/api/placeholder/300/200',
   category: 'online-checkin',
   videoUrl: 'https://example.com/video4',
  },
  {
   id: 5,
   title: 'Legal Compliance Best Practices',
   description:
    'Understanding legal requirements and compliance for rental properties.',
   duration: '1:15',
   thumbnail: '/api/placeholder/300/200',
   category: 'legal-compliance',
   videoUrl: 'https://example.com/video5',
  },
  {
   id: 6,
   title: 'Identity Verification Setup',
   description:
    'Set up identity verification to ensure secure guest registration.',
   duration: '1:02',
   thumbnail: '/api/placeholder/300/200',
   category: 'identity-verification',
   videoUrl: 'https://example.com/video6',
  },
  {
   id: 7,
   title: 'Remote Access Configuration',
   description: 'Configure remote access controls for your properties.',
   duration: '1:20',
   thumbnail: '/api/placeholder/300/200',
   category: 'remote-access',
   videoUrl: 'https://example.com/video7',
  },
  {
   id: 8,
   title: 'Tourist Taxes Management',
   description: 'Learn how to handle tourist taxes and local regulations.',
   duration: '0:45',
   thumbnail: '/api/placeholder/300/200',
   category: 'tourist-taxes',
   videoUrl: 'https://example.com/video8',
  },
  {
   id: 9,
   title: 'Property Protection Guidelines',
   description:
    'Best practices for protecting your properties and managing risks.',
   duration: '1:30',
   thumbnail: '/api/placeholder/300/200',
   category: 'property-protection',
   videoUrl: 'https://example.com/video9',
  },
  {
   id: 10,
   title: 'Upselling Strategies',
   description: 'Learn effective upselling techniques to increase revenue.',
   duration: '1:10',
   thumbnail: '/api/placeholder/300/200',
   category: 'upselling',
   videoUrl: 'https://example.com/video10',
  },
 ];

 // Filter categories
 const filterCategories = [
  { key: 'all', label: t('tutorials.filters.all') },
  { key: 'getting-started', label: t('tutorials.filters.gettingStarted') },
  { key: 'online-checkin', label: t('tutorials.filters.onlineCheckin') },
  { key: 'legal-compliance', label: t('tutorials.filters.legalCompliance') },
  {
   key: 'identity-verification',
   label: t('tutorials.filters.identityVerification'),
  },
  { key: 'remote-access', label: t('tutorials.filters.remoteAccess') },
  { key: 'tourist-taxes', label: t('tutorials.filters.touristTaxes') },
  {
   key: 'property-protection',
   label: t('tutorials.filters.propertyProtection'),
  },
  { key: 'upselling', label: t('tutorials.filters.upselling') },
 ];

 // Filter tutorials based on active filter
 useEffect(() => {
  if (activeFilter === 'all') {
   setFilteredTutorials(tutorials);
  } else {
   setFilteredTutorials(
    tutorials.filter((tutorial) => tutorial.category === activeFilter)
   );
  }
 }, [activeFilter]);

 const handleVideoClick = (videoUrl) => {
  // Open video in new tab
  window.open(videoUrl, '_blank');
 };

 const TutorialCard = ({ tutorial }) => (
  <Card
   hoverable
   style={{
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid #f0f0f0',
   }}
   bodyStyle={{ padding: 0 }}
   onClick={() => handleVideoClick(tutorial.videoUrl)}
   cover={
    <div style={{ position: 'relative', width: '100%', height: 160 }}>
     <img
      src={tutorial.thumbnail}
      alt={tutorial.title}
      style={{
       width: '100%',
       height: 160,
       objectFit: 'cover',
      }}
      onError={(e) => {
       e.target.src = fallback;
      }}
     />
     <div
      style={{
       position: 'absolute',
       top: '50%',
       left: '50%',
       transform: 'translate(-50%, -50%)',
       backgroundColor: 'rgba(0, 0, 0, 0.7)',
       borderRadius: '50%',
       width: 48,
       height: 48,
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'center',
       cursor: 'pointer',
       transition: 'all 0.3s ease',
      }}
      className="tutorial-play-button"
     >
      <i
       className="fa-solid fa-play"
       style={{
        color: 'white',
        fontSize: 16,
        marginLeft: 2,
       }}
      />
     </div>
     <div
      style={{
       position: 'absolute',
       bottom: 8,
       right: 8,
       backgroundColor: 'rgba(0, 0, 0, 0.8)',
       color: 'white',
       fontSize: 11,
       padding: '2px 6px',
       borderRadius: 4,
       fontWeight: 500,
      }}
     >
      {tutorial.duration}
     </div>
    </div>
   }
  >
   <div style={{ padding: 16 }}>
    <Title
     level={5}
     style={{ margin: 0, marginBottom: 8, fontSize: 14, lineHeight: 1.3 }}
    >
     {tutorial.title}
    </Title>
    <Text
     type="secondary"
     style={{
      fontSize: 12,
      lineHeight: 1.4,
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
     }}
    >
     {tutorial.description}
    </Text>
   </div>
  </Card>
 );

 if (!open) return null;

 return (
  <div
   style={{
    position: 'fixed',
    top: '90px', // 80px header height + 10px spacing
    left: 0,
    right: 0,
    zIndex: 999, // Just below header but above content
    margin: '0 24px',
   }}
  >
   <Alert
    type="info"
    showIcon={false}
    closable
    onClose={onClose}
    style={{
     borderRadius: '16px',
     border: '1px solid #6D5FFA',
     backgroundColor: '#fafafa',
     boxShadow: '0 4px 20px rgba(109, 95, 250, 0.15)',
    }}
    message={
     <Flex align="center" gap={12} style={{ marginBottom: 16 }}>
      <i
       className="fa-regular fa-circle-play"
       style={{ fontSize: 20, color: '#6D5FFA' }}
      />
      <span style={{ fontSize: 18, fontWeight: 600, color: '#6D5FFA' }}>
       {t('tutorials.welcome.title')}
      </span>
     </Flex>
    }
    description={
     <div>
      <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
       {t('tutorials.welcome.subtitle')}
      </Text>

      {/* Filter Buttons */}
      <div style={{ marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
       <div style={{ display: 'flex', gap: 8, minWidth: 'max-content' }}>
        {filterCategories.map((category) => (
         <Button
          key={category.key}
          type={activeFilter === category.key ? 'primary' : 'default'}
          size="small"
          onClick={() => setActiveFilter(category.key)}
          style={{
           borderRadius: 16,
           fontSize: 12,
           height: 32,
           backgroundColor: activeFilter === category.key ? '#6D5FFA' : 'white',
           borderColor: activeFilter === category.key ? '#6D5FFA' : '#d9d9d9',
           whiteSpace: 'nowrap',
           flexShrink: 0,
          }}
         >
          {category.label}
         </Button>
        ))}
       </div>
      </div>

      {/* Tutorial Cards Grid */}
      <div
       style={{
        maxHeight: '60vh',
        overflowY: 'auto',
        paddingRight: 8,
       }}
      >
       <Row gutter={[16, 16]}>
        {filteredTutorials.map((tutorial) => (
         <Col xs={24} sm={24} md={8} lg={6} xl={6} key={tutorial.id}>
          <TutorialCard tutorial={tutorial} />
         </Col>
        ))}
       </Row>
      </div>
     </div>
    }
   />
  </div>
 );
};

export default TutorialsAlert;
