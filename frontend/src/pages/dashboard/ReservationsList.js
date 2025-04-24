import React, { useState, useEffect } from 'react';
import {
 Layout,
 Typography,
 List,
 Button,
 Space,
 Tag,
 message,
 Tooltip,
 Input,
 Select,
 DatePicker,
 Card,
 Spin,
 Flex,
 Divider,
 Row,
 Col,
 Grid,
 Drawer,
} from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../context/TranslationContext';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useReservation } from '../../hooks/useReservation';
import useProperty from '../../hooks/useProperty';
import { useConcierge } from '../../hooks/useConcierge';
import dayjs from 'dayjs';
import DashboardHeader from '../../components/common/DashboardHeader';
import Foot from '../../components/common/footer';
import ShareModal from '../../components/common/ShareModal';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ReservationsList = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();
 const {
  reservations,
  loading,
  fetchReservations,
  getReservationContract,
  sendToGuest,
  generateContract,
  deleteReservation,
 } = useReservation();
 const {
  properties: ownedProperties,
  fetchPropertiesbyClient,
  loading: ownedPropertiesLoading,
 } = useProperty();
 const { getConciergeProperties, loading: conciergePropertiesLoading } =
  useConcierge();
 const [searchText, setSearchText] = useState('');
 const [filters, setFilters] = useState({
  status: null,
  dateRange: null,
  property: null,
 });

 const [managedProperties, setManagedProperties] = useState([]);
 const [allProperties, setAllProperties] = useState([]);
 const [fetchingProperties, setFetchingProperties] = useState(true);
 const [reservationContracts, setReservationContracts] = useState({});
 const [userId, setUserId] = useState(null);
 const [isShareModalVisible, setIsShareModalVisible] = useState(false);
 const [shareUrl, setShareUrl] = useState('');
 const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

 const handleUserData = (userData) => {
  setUserId(userData);
 };

 useEffect(() => {
  const loadReservations = async () => {
   if (userId) {
    // Use the combined fetch method
    await fetchReservations(userId);
   }
  };

  loadReservations();
 }, [userId]);

 useEffect(() => {
  const fetchProperties = async () => {
   setFetchingProperties(true);
   try {
    if (userId) {
     // Fetch properties owned by the client
     await fetchPropertiesbyClient(userId);

     // Fetch properties managed by the concierge
     const conciergePropertiesResponse = await getConciergeProperties(userId);

     // Filter active properties and extract property details
     const activeProperties = conciergePropertiesResponse
      .filter((assignment) => assignment.status === 'active')
      .map((assignment) => assignment.property);

     setManagedProperties(activeProperties);
    }
   } catch (error) {
    console.error('Error fetching properties:', error);
    message.error(t('property.messages.fetchError'));
   } finally {
    setFetchingProperties(false);
   }
  };

  fetchProperties();
 }, [userId]);

 // Combine owned and managed properties, ensuring no duplicates
 useEffect(() => {
  const ownedIds = new Set(ownedProperties.map((p) => p.id));
  const uniqueManagedProperties = managedProperties.filter(
   (p) => !ownedIds.has(p.id)
  );

  const combined = [
   ...ownedProperties.map((p) => ({ ...p, isOwned: true })),
   ...uniqueManagedProperties.map((p) => ({ ...p, isOwned: false })),
  ];

  setAllProperties(combined);
 }, [ownedProperties, managedProperties]);

 useEffect(() => {
  const loadContractsData = async () => {
   if (reservations && reservations.length > 0) {
    // Check for contracts for each reservation in draft status
    for (const reservation of reservations.filter(
     (r) => r.status === 'draft'
    )) {
     await checkReservationContract(reservation.id);
    }
   }
  };

  if (reservations.length > 0) {
   loadContractsData();
  }
 }, [reservations]);

 // Check if a reservation has a contract
 const checkReservationContract = async (reservationId) => {
  try {
   const contract = await getReservationContract(reservationId);

   setReservationContracts((prev) => ({
    ...prev,
    [reservationId]: contract,
   }));

   return contract;
  } catch (error) {
   console.error('Error checking reservation contract:', error);
   return null;
  }
 };

 const handleCreateReservation = () => {
  navigate('/create-reservation');
 };

 const handleViewReservation = (id) => {
  navigate(`/generate-contract/${id}`);
 };

 const handleSendToGuest = async (id) => {
  const result = await sendToGuest(id);
  if (result) {
   // Show share modal with the contract URL
   const contractUrl = result.contractFormUrl.startsWith('http')
    ? result.contractFormUrl
    : `${window.location.origin}${result.contractFormUrl}`;

   setShareUrl(contractUrl);
   setIsShareModalVisible(true);

   // Refresh the list if successful
   fetchReservations(userId);
  }
 };

 const handleGenerateContract = async (id) => {
  try {
   const contractData = await generateContract(id);
   if (contractData) {
    navigate(`/generate-contract/${id}`);
   }
  } catch (error) {
   // Error handling is already done in the hook
   console.error('Error in handleGenerateContract:', error);
  }
 };

 const getStatusTag = (status) => {
  const statusColors = {
   draft: '#A8ADC6',
   sent: '#9DE3F2',
   signed: '#6D5FFA',
   confirmed: '#17B26A',
   cancelled: '#F04438',
  };

  return (
   <Tag
    style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.8 }}
    color={statusColors[status]}
   >
    {t(`reservation.statuses.${status}`)}
   </Tag>
  );
 };

 // Filter reservations based on search and filters
 const filteredReservations = reservations.filter((reservation) => {
  // Text search
  const searchFilter = searchText
   ? reservation.property?.name
      .toLowerCase()
      .includes(searchText.toLowerCase()) ||
     (reservation.bookingSource &&
      reservation.bookingSource
       .toLowerCase()
       .includes(searchText.toLowerCase()))
   : true;

  // Status filter
  const statusFilter = filters.status
   ? reservation.status === filters.status
   : true;

  // Property filter
  const propertyFilter = filters.property
   ? reservation.property?.id === filters.property
   : true;

  // Date range filter
  let dateFilter = true;
  if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
   const startDate = dayjs(reservation.startDate);
   const endDate = dayjs(reservation.endDate);
   const filterStart = dayjs(filters.dateRange[0]);
   const filterEnd = dayjs(filters.dateRange[1]);

   // Check if reservation dates overlap with filter dates
   dateFilter =
    ((startDate.isAfter(filterStart) || startDate.isSame(filterStart)) &&
     startDate.isBefore(filterEnd)) ||
    (endDate.isAfter(filterStart) &&
     (endDate.isBefore(filterEnd) || endDate.isSame(filterEnd))) ||
    (startDate.isBefore(filterStart) && endDate.isAfter(filterEnd));
  }

  return searchFilter && statusFilter && propertyFilter && dateFilter;
 });

 const renderActionButtons = (reservation) => {
  const hasContract = reservationContracts[reservation.id];

  return (
   <Space size="small">
    {/* Show Generate Contract only for draft status without contract */}
    {reservation.status === 'draft' && !hasContract && !screens.xs && (
     <Button
      type="default"
      icon={<i className="fa-regular fa-file-signature"></i>}
      onClick={() => handleGenerateContract(reservation.id)}
     >
      {t('reservation.generateContract')}
     </Button>
    )}

    {/* Show Send to Guest only for draft status with contract */}
    {reservation.status === 'draft' && hasContract && !screens.xs && (
     <Button type="primary" onClick={() => handleSendToGuest(reservation.id)}>
      {t('reservation.sendToGuest')}
      <i className="fa-regular fa-paper-plane-top" style={{ marginLeft: 6 }} />
     </Button>
    )}

    {/* View button always shown */}
    <Tooltip title={t('common.view')}>
     <Button
      type="text"
      icon={<i className="PrimaryColor fa-regular fa-circle-arrow-right" />}
      onClick={() => handleViewReservation(reservation.id)}
     />
    </Tooltip>
   </Space>
  );
 };

 const isLoading =
  loading &&
  fetchingProperties &&
  ownedPropertiesLoading &&
  conciergePropertiesLoading;

 return (
  <Layout className="contentStyle">
   <DashboardHeader onUserData={handleUserData} />
   <Content className="container">
    {/* Header section with conditional styling for mobile/desktop */}
    <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
     <Title
      level={2}
      style={
       screens.xs && {
        fontSize: '18px',
        margin: 0,
       }
      }
     >
      {t('reservation.list.title')}
     </Title>

     {screens.xs ? (
      <Space>
       <Button
        type="text"
        icon={
         <i className="PrimaryColor fa-regular fa-magnifying-glass fa-xl" />
        }
        onClick={() => setFilterDrawerVisible(true)}
       />
       <Button
        type="text"
        icon={<i className="PrimaryColor fa-regular fa-circle-plus fa-2xl" />}
        onClick={handleCreateReservation}
       />
      </Space>
     ) : (
      <Button
       type="primary"
       icon={<i className="fa-regular fa-plus" />}
       onClick={handleCreateReservation}
      >
       {t('reservation.create.button')}
      </Button>
     )}
    </Flex>

    <Card bordered={false} className="dash-card">
     {/* Desktop filters */}
     {!screens.xs && (
      <Flex gap="middle" wrap="wrap" style={{ marginBottom: 16 }}>
       <Input
        placeholder={t('common.search')}
        prefix={<i className="fa-regular fa-magnifying-glass" />}
        style={{ width: 240 }}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        size="large"
       />

       <Select
        placeholder={t('property.status')}
        style={{ width: 120 }}
        allowClear
        onChange={(value) => setFilters({ ...filters, status: value })}
        size="large"
       >
        <Option value="draft">{t('reservation.statuses.draft')}</Option>
        <Option value="sent">{t('reservation.statuses.sent')}</Option>
        <Option value="signed">{t('reservation.statuses.signed')}</Option>
        <Option value="confirmed">{t('reservation.statuses.confirmed')}</Option>
        <Option value="cancelled">{t('reservation.statuses.cancelled')}</Option>
       </Select>

       <Select
        placeholder={t('property.title')}
        style={{ width: 320 }}
        optionFilterProp="children"
        showSearch
        allowClear
        onChange={(value) => setFilters({ ...filters, property: value })}
        size="large"
       >
        {ownedProperties.length > 0 && (
         <Select.OptGroup label={t('property.owned')}>
          {ownedProperties.map((property) => (
           <Option key={`owned-${property.id}`} value={property.id}>
            {property.name}
           </Option>
          ))}
         </Select.OptGroup>
        )}

        {managedProperties.length > 0 && (
         <Select.OptGroup label={t('property.managed')}>
          {managedProperties.map((property) => (
           <Option key={`managed-${property.id}`} value={property.id}>
            {property.name}
           </Option>
          ))}
         </Select.OptGroup>
        )}
       </Select>

       <RangePicker
        onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
        placeholder={[t('reservation.startDate'), t('reservation.endDate')]}
        size="large"
       />
      </Flex>
     )}

     {isLoading ? (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
       <Spin size="large" />
      </div>
     ) : (
      <List
       dataSource={filteredReservations}
       locale={{ emptyText: t('reservation.noReservations') }}
       pagination={{ pageSize: 10 }}
       renderItem={(reservation) => (
        <List.Item
         key={reservation.id}
         extra={renderActionButtons(reservation)}
        >
         <List.Item.Meta
          title={
           <Space>
            <Text fontSize={screens.xs ? 10 : 12}>
             {screens.xs
              ? (reservation.property?.name || t('common.unknown')).length > 16
                ? (reservation.property?.name || t('common.unknown')).substring(
                   0,
                   16
                  ) + '...'
                : reservation.property?.name || t('common.unknown')
              : reservation.property?.name || t('common.unknown')}
            </Text>
            {getStatusTag(reservation.status)}
           </Space>
          }
          description={
           <Space direction="vertical" size={1}>
            <Space>
             <i className="fa-light fa-calendar"></i>
             <Text>
              {dayjs(reservation.startDate).format('YYYY-MM-DD')} |{' '}
              {dayjs(reservation.endDate).format('YYYY-MM-DD')}
             </Text>
            </Space>

            {!screens.xs && (
             <Space>
              <>
               <Text>
                {t('reservation.nights')}:{' '}
                {dayjs(reservation.endDate).diff(
                 dayjs(reservation.startDate),
                 'day'
                )}
               </Text>
               <Divider type="vertical" />
               <Text>
                {t('reservation.totalPrice')}: {reservation.totalPrice} Dhs
               </Text>
              </>
              {!screens.xs && reservation.bookingSource && (
               <>
                <Divider type="vertical" />
                <Text>
                 {t(
                  'reservation.sources.' +
                   (reservation.bookingSource === 'direct'
                    ? 'direct'
                    : reservation.bookingSource)
                 )}
                </Text>
               </>
              )}
             </Space>
            )}
           </Space>
          }
         />
        </List.Item>
       )}
      />
     )}
    </Card>

    {/* Mobile Filter Drawer */}
    <Drawer
     title={t('home.filters.title')}
     placement="right"
     onClose={() => setFilterDrawerVisible(false)}
     open={filterDrawerVisible}
     width={screens.xs ? '90%' : 400}
    >
     <Space direction="vertical" style={{ width: '100%' }} size="large">
      <div>
       <Text strong>{t('common.search')}</Text>
       <Input
        placeholder={t('common.search')}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginTop: 8 }}
        prefix={<i className="fa-regular fa-magnifying-glass" />}
       />
      </div>

      <div>
       <Text strong>{t('property.status')}</Text>
       <Select
        placeholder={t('property.status')}
        style={{ width: '100%', marginTop: 8 }}
        allowClear
        onChange={(value) => setFilters({ ...filters, status: value })}
       >
        <Option value="draft">{t('reservation.statuses.draft')}</Option>
        <Option value="sent">{t('reservation.statuses.sent')}</Option>
        <Option value="signed">{t('reservation.statuses.signed')}</Option>
        <Option value="confirmed">{t('reservation.statuses.confirmed')}</Option>
        <Option value="cancelled">{t('reservation.statuses.cancelled')}</Option>
       </Select>
      </div>

      <div>
       <Text strong>{t('property.title')}</Text>
       <Select
        placeholder={t('property.title')}
        style={{ width: '100%', marginTop: 8 }}
        optionFilterProp="children"
        showSearch
        allowClear
        onChange={(value) => setFilters({ ...filters, property: value })}
       >
        {ownedProperties.length > 0 && (
         <Select.OptGroup label={t('property.owned')}>
          {ownedProperties.map((property) => (
           <Option key={`owned-${property.id}`} value={property.id}>
            {property.name}
           </Option>
          ))}
         </Select.OptGroup>
        )}

        {managedProperties.length > 0 && (
         <Select.OptGroup label={t('property.managed')}>
          {managedProperties.map((property) => (
           <Option key={`managed-${property.id}`} value={property.id}>
            {property.name}
           </Option>
          ))}
         </Select.OptGroup>
        )}
       </Select>
      </div>

      <div>
       <Text strong>{t('reservation.dates')}</Text>
       <RangePicker
        style={{ width: '100%', marginTop: 8 }}
        onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
        placeholder={[t('reservation.startDate'), t('reservation.endDate')]}
       />
      </div>

      <Flex justify="end" style={{ marginTop: 16 }}>
       <Space>
        <Button
         onClick={() => {
          setSearchText('');
          setFilters({ status: null, dateRange: null, property: null });
         }}
        >
         {t('common.reset')}
        </Button>
        <Button type="primary" onClick={() => setFilterDrawerVisible(false)}>
         {t('common.apply')}
        </Button>
       </Space>
      </Flex>
     </Space>
    </Drawer>

    <ShareModal
     isVisible={isShareModalVisible}
     onClose={() => setIsShareModalVisible(false)}
     pageUrl={shareUrl}
    />
   </Content>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default ReservationsList;
