import React, { useState, useEffect, useMemo } from 'react';
import {
 Card,
 List,
 Typography,
 Button,
 Space,
 Divider,
 Empty,
 Spin,
 message,
 Tag,
 Grid,
 Tooltip,
} from 'antd';
import {
 PhoneOutlined,
 MessageOutlined,
 MailOutlined,
 InfoCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from '../../context/TranslationContext';
import useServiceWorker from '../../hooks/useServiceWorker';

const { Title, Text, Paragraph } = Typography;

// Helper function to get the icon for each service worker category
const getCategoryIcon = (category) => {
 const icons = {
  'co-host': <i className="PrimaryColor fa-regular fa-headset fa-xl" />,
  plumber: <i className="PrimaryColor fa-regular fa-pipe-valve fa-xl" />,
  technician: <i className="PrimaryColor fa-regular fa-toolbox fa-xl" />,
  housekeeper: <i className="PrimaryColor fa-regular fa-broom fa-xl" />,
  concierge: <i className="PrimaryColor fa-regular fa-bell-concierge fa-xl" />,
  electrician: <i className="PrimaryColor fa-regular fa-plug fa-xl" />,
  tv_technician: <i className="PrimaryColor fa-regular fa-tv fa-xl" />,
  grocery: <i className="PrimaryColor fa-regular fa-shop fa-xl" />,
  other: <i className="PrimaryColor fa-regular fa-circle-info fa-xl" />,
 };

 return icons[category] || icons.other;
};

const ServiceWorkerGuest = ({ propertyId }) => {
 const { t } = useTranslation();
 const { loading, error, serviceWorkers, getGuestVisibleServiceWorkers } =
  useServiceWorker();
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();

 useEffect(() => {
  if (propertyId) {
   getGuestVisibleServiceWorkers(propertyId);
  }
 }, [propertyId]);

 // Sort service workers alphabetically by name
 const sortedServiceWorkers = useMemo(() => {
  if (!serviceWorkers || !serviceWorkers.length) return [];

  // Create a copy of the array to avoid mutating the original
  return [...serviceWorkers].sort((a, b) => a.name.localeCompare(b.name));
 }, [serviceWorkers]);

 // Group service workers by category
 const serviceWorkersByCategory = useMemo(() => {
  if (!sortedServiceWorkers.length) return {};

  return sortedServiceWorkers.reduce((acc, worker) => {
   if (!acc[worker.category]) {
    acc[worker.category] = [];
   }
   acc[worker.category].push(worker);
   return acc;
  }, {});
 }, [sortedServiceWorkers]);

 const renderAction = (worker) => {
  const actions = [];
  const isMobile = screens.xs;

  // Call action
  actions.push(
   <Button
    key="call"
    type="primary"
    icon={<PhoneOutlined />}
    onClick={() => (window.location.href = `tel:${worker.phone}`)}
    size={isMobile ? 'middle' : 'default'}
   >
    {!isMobile && t('serviceWorker.callButton')}
   </Button>
  );

  // WhatsApp action - only for mobile
  if (isMobile) {
   actions.push(
    <Button
     key="whatsapp"
     type="default"
     icon={<i className="fa-brands fa-whatsapp" />}
     onClick={() =>
      (window.location.href = `https://wa.me/${worker.phone.replace(
       /\D/g,
       ''
      )}`)
     }
     style={{
      backgroundColor: '#25D366',
      borderColor: '#25D366',
      color: '#FFFFFF',
     }}
    />
   );
  }

  return actions;
 };

 if (loading) {
  return (
   <div style={{ textAlign: 'center', padding: '20px' }}>
    <Spin />
   </div>
  );
 }

 if (error) {
  return (
   <div style={{ textAlign: 'center', padding: '20px' }}>
    <Text type="danger">{error}</Text>
   </div>
  );
 }

 if (!serviceWorkers || serviceWorkers.length === 0) {
  return (
   <Empty
    description={t('serviceWorker.noServiceWorkersFound')}
    image={Empty.PRESENTED_IMAGE_SIMPLE}
   />
  );
 }

 return (
  <Card>
   <Title level={4}>{t('serviceWorker.needHelp')}</Title>
   <Paragraph>{t('serviceWorker.contactMessage')}</Paragraph>
   <Divider />

   {Object.entries(serviceWorkersByCategory).map(([category, workers]) => (
    <div key={category}>
     <Title level={5}>
      {getCategoryIcon(category)} {t(`serviceWorker.categories.${category}`)}
     </Title>
     <List
      itemLayout="horizontal"
      dataSource={workers}
      renderItem={(worker) => (
       <List.Item actions={renderAction(worker)}>
        <List.Item.Meta
         title={worker.name}
         description={
          !screens.xs && (
           <>
            {worker.phone && (
             <div>
              <PhoneOutlined /> {worker.phone}
             </div>
            )}
            {worker.notes && (
             <div>
              <Tooltip title={worker.notes}>
               <InfoCircleOutlined /> {t('serviceWorker.notesforGuest')}
              </Tooltip>
             </div>
            )}
           </>
          )
         }
        />
       </List.Item>
      )}
     />
    </div>
   ))}
  </Card>
 );
};

export default ServiceWorkerGuest;
