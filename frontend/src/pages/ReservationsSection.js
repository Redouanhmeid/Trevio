import React, { useState, useEffect } from 'react';
import {
 Row,
 Col,
 Card,
 Divider,
 Typography,
 List,
 Space,
 Button,
 Tag,
 Empty,
 Tooltip,
 message,
} from 'antd';
import { CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from '../context/TranslationContext';
import { useReservation } from '../hooks/useReservation';
import ShareModal from '../components/common/ShareModal';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const ReservationsSection = ({ userId, properties, onNavigate }) => {
 const { t } = useTranslation();
 const {
  reservations,
  loading,
  fetchReservations,
  getReservationContract,
  sendToGuest,
  generateContract,
  checkReservationContract,
 } = useReservation();
 const [reservationContracts, setReservationContracts] = useState({});
 const [isShareModalVisible, setIsShareModalVisible] = useState(false);
 const [shareUrl, setShareUrl] = useState('');

 useEffect(() => {
  const fetchReservationsData = async () => {
   if (userId) {
    await fetchReservations(userId);
   }
  };

  fetchReservationsData();
 }, [userId]);

 // Load contract data for reservations
 useEffect(() => {
  const loadContractsData = async () => {
   if (reservations && reservations.length > 0) {
    // Check for contracts for each reservation in draft status
    for (const reservation of reservations.filter(
     (r) => r.status === 'draft'
    )) {
     const contract = await getReservationContract(reservation.id);
     setReservationContracts((prev) => ({
      ...prev,
      [reservation.id]: contract,
     }));
    }
   }
  };

  if (reservations.length > 0) {
   loadContractsData();
  }
 }, [reservations]);

 const handleViewReservation = (id) => {
  onNavigate(`/generate-contract/${id}`);
 };

 const handleSendToGuest = async (id) => {
  const result = await sendToGuest(id);
  if (result) {
   // Show share modal with the contract URL, ensuring the full domain is included
   const contractUrl = result.contractFormUrl.startsWith('http')
    ? result.contractFormUrl
    : `${window.location.origin}${result.contractFormUrl}`;
   setShareUrl(contractUrl);
   setIsShareModalVisible(true);

   // Refresh the reservations list
   fetchReservations();
  }
 };

 const handleGenerateContract = async (id) => {
  const contractData = await generateContract(id);
  if (contractData) {
   // Update the contract state
   setReservationContracts((prev) => ({
    ...prev,
    [id]: contractData,
   }));

   onNavigate(`/generate-contract/${id}`);
  }
 };

 const getStatusTag = (status) => {
  const statusColors = {
   draft: 'default',
   sent: 'processing',
   confirmed: 'success',
   cancelled: 'error',
  };

  return (
   <Tag color={statusColors[status]}>{t(`reservation.statuses.${status}`)}</Tag>
  );
 };

 const renderActionButtons = (reservation) => {
  const hasContract = reservationContracts[reservation.id];

  return (
   <Space size="small">
    {/* Show Generate Contract only for draft status without contract */}
    {reservation.status === 'draft' && !hasContract && (
     <Button
      type="default"
      icon={<i className="fa-regular fa-file-signature"></i>}
      onClick={() => handleGenerateContract(reservation.id)}
     >
      {t('reservation.generateContract')}
     </Button>
    )}

    {/* Show Send to Guest only for draft status with contract */}
    {reservation.status === 'draft' && hasContract && (
     <Button type="primary" onClick={() => handleSendToGuest(reservation.id)}>
      {t('reservation.sendToGuest')}
      <i className="fa-regular fa-paper-plane-top" style={{ marginLeft: 6 }} />
     </Button>
    )}

    {/* View button always shown */}
    <Tooltip title={t('common.view')}>
     <Button
      type="text"
      icon={<i className="PrimaryColor fa-regular fa-eye"></i>}
      onClick={() => handleViewReservation(reservation.id)}
     />
    </Tooltip>
   </Space>
  );
 };

 // Sort by date, most recent first, and limit to 5
 const recentReservations = [...reservations]
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  .slice(0, 5);

 return (
  <Row gutter={[24, 4]}>
   <Col xs={24}>
    <Card
     title={
      <>
       {t('reservation.list.title')}
       {'  '}
       <i className="PrimaryColor fa-light fa-calendar-days" />
       <br />
       <Divider />
      </>
     }
     className="dash-card"
     bordered={false}
     extra={
      <Button
       type="primary"
       icon={<PlusOutlined />}
       onClick={() => onNavigate('/create-reservation')}
      >
       {t('reservation.create.button')}
      </Button>
     }
    >
     {recentReservations.length > 0 ? (
      <List
       dataSource={recentReservations}
       renderItem={(reservation) => (
        <List.Item
         key={reservation.id}
         actions={[renderActionButtons(reservation)]}
        >
         <List.Item.Meta
          title={
           <Space>
            <span>#{reservation.id}</span>
            <Text strong>
             {reservation.property?.name || 'Unknown Property'}
            </Text>
            {getStatusTag(reservation.status)}
           </Space>
          }
          description={
           <Space direction="vertical" size={2}>
            <Space>
             <CalendarOutlined />
             <Text>
              {dayjs(reservation.startDate).format('YYYY-MM-DD')} -{' '}
              {dayjs(reservation.endDate).format('YYYY-MM-DD')}
             </Text>
            </Space>
            <Space>
             <Text>
              {t('reservation.nights')}:{' '}
              {dayjs(reservation.endDate).diff(
               dayjs(reservation.startDate),
               'day'
              )}
             </Text>
             <Text>|</Text>
             <Text>
              {t('reservation.totalPrice')}: {reservation.totalPrice} Dhs
             </Text>
            </Space>
           </Space>
          }
         />
        </List.Item>
       )}
      />
     ) : (
      <Empty
       description={
        loading ? t('common.loading') : t('reservation.noReservations')
       }
       image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
     )}
     {recentReservations.length > 0 && (
      <div style={{ textAlign: 'center', marginTop: 16 }}>
       <Button type="link" onClick={() => onNavigate('/reservations')}>
        {t('common.viewAll')}
       </Button>
      </div>
     )}
    </Card>
   </Col>
   <ShareModal
    isVisible={isShareModalVisible}
    onClose={() => setIsShareModalVisible(false)}
    pageUrl={shareUrl}
   />
  </Row>
 );
};

export default ReservationsSection;
