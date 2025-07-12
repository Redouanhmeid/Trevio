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
 Grid,
 Drawer,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/TranslationContext';
import useICal from '../../hooks/useICal';
import { useReservation } from '../../hooks/useReservation';
import useProperty from '../../hooks/useProperty';
import dayjs from 'dayjs';
import Head from '../../components/common/header';
import Foot from '../../components/common/footer';
import ShareModal from '../../components/common/ShareModal';
import { parseICalLinks } from '../../utils/utils';
import axios from 'axios';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ReservationsDashboard = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();

 const {
  fetchICalContent,
  parseICalDates,
  loading: icalLoading,
  error: icalError,
 } = useICal();
 const {
  reservations,
  loading,
  createReservation,
  fetchReservations,
  getReservationContract,
  sendToGuest,
  generateContract,
  deleteReservation,
  checkAvailability,
 } = useReservation();
 const {
  properties: ownedProperties,
  fetchPropertiesbyClient,
  loading: ownedPropertiesLoading,
 } = useProperty();
 const [searchText, setSearchText] = useState('');
 const [filters, setFilters] = useState({
  status: null,
  dateRange: null,
  property: null,
 });

 const [allProperties, setAllProperties] = useState([]);
 const [fetchingProperties, setFetchingProperties] = useState(true);
 const [reservationContracts, setReservationContracts] = useState({});
 const [userId, setUserId] = useState(null);
 const [isShareModalVisible, setIsShareModalVisible] = useState(false);
 const [shareUrl, setShareUrl] = useState('');
 const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

 const [isSyncing, setIsSyncing] = useState(false);

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
     await fetchPropertiesbyClient(userId);
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
  setAllProperties(ownedProperties.map((p) => ({ ...p, isOwned: true })));
 }, [ownedProperties]);

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

 const checkReservationWithUID = async (uid) => {
  try {
   // This is a direct database query
   const result = await axios.get(`/api/v1/reservations/check-uid/${uid}`);
   return result.data.exists;
  } catch (error) {
   console.error('Error checking reservation UID:', error);
   return false;
  }
 };

 const syncReservationsFromiCal = async () => {
  setIsSyncing(true);
  try {
   const propertiesWithiCal = allProperties.filter(
    (p) =>
     p.iCalLinks &&
     Array.isArray(parseICalLinks(p.iCalLinks)) &&
     parseICalLinks(p.iCalLinks).length > 0
   );

   if (propertiesWithiCal.length === 0) {
    message.info(t('reservation.sync.noIcalLinks'));
    return;
   }

   const syncResults = {
    successful: 0,
    failed: 0,
    newReservations: 0,
    skippedExisting: 0,
   };

   for (const property of propertiesWithiCal) {
    const iCalLinks = parseICalLinks(property.iCalLinks);

    for (const link of iCalLinks) {
     try {
      // Fetch iCal content through backend proxy
      const icalContent = await fetchICalContent(link.url);

      const events = parseICalDates(icalContent);

      for (const event of events) {
       const isReservation =
        event.summary?.toLowerCase().includes('reserved') ||
        event.summary?.toLowerCase().includes('booked');

       if (isReservation && event.start && event.end) {
        // Only proceed if the event has a UID
        if (!event.uid) {
         console.warn('Event missing UID, generating fallback ID:', event);
         // Create a fallback UID if none exists (uncommon but possible)
         event.uid = `${property.id}-${link.source}-${event.start}-${event.end}`;
        }

        // Check if a reservation with this UID already exists
        const existingReservation = reservations.find(
         (r) => r.calendarEventUID === event.uid
        );

        if (existingReservation) {
         syncResults.skippedExisting++;
         continue;
        }

        // Then check database via API
        if (event.uid) {
         const existingWithUID = await checkReservationWithUID(event.uid);
         if (existingWithUID) {
          syncResults.skippedExisting++;
          continue;
         }
        }

        const reservationData = {
         propertyId: property.id,
         startDate: dayjs(event.start).format('YYYY-MM-DD'),
         endDate: dayjs(event.end).format('YYYY-MM-DD'),
         totalPrice: 0,
         bookingSource: link.source,
         createdByUserId: userId,
         status: 'draft',
         calendarEventUID: event.uid,
        };
        console.log(reservationData);
        try {
         const availabilityResult = await checkAvailability(
          property.id,
          reservationData.startDate,
          reservationData.endDate
         );

         if (availabilityResult.available) {
          await createReservation(reservationData);
          syncResults.newReservations++;
         }
        } catch (reservationError) {
         console.error('Error creating reservation:', reservationError);
         syncResults.failed++;
        }
       }
      }

      syncResults.successful++;
     } catch (linkError) {
      console.error(`Error processing iCal link ${link.url}:`, linkError);
      syncResults.failed++;
     }
    }
   }

   // Show sync results
   message.success(
    `${t('reservation.sync.completed')}: ${syncResults.successful} ${t(
     'reservation.sync.sourcesSynced'
    )}, ${syncResults.failed} ${t('reservation.sync.sourcesFailed')}, ${
     syncResults.newReservations
    } ${t('reservation.sync.newReservations')}, ${
     syncResults.skippedExisting
    } ${t('reservation.sync.duplicatesSkipped')}`
   );

   // Refresh reservations list
   await fetchReservations(userId);
  } catch (error) {
   console.error('Error syncing iCal reservations:', error);
   message.error(t('reservation.sync.error'));
  } finally {
   setIsSyncing(false);
  }
 };

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

 const isLoading = loading && fetchingProperties && ownedPropertiesLoading;

 if (isLoading) {
  return (
   <Layout className="contentStyle">
    <Content className="container">
     <div
      style={{
       display: 'flex',
       justifyContent: 'center',
       alignItems: 'center',
       height: '60vh',
      }}
     >
      <Spin size="large" />
     </div>
    </Content>
    {!screens.xs && <Foot />}
   </Layout>
  );
 }

 return (
  <Layout className="contentStyle">
   <Head onUserData={handleUserData} />
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
        icon={<i className="PrimaryColor fa-regular fa-arrows-rotate fa-xl" />}
        onClick={syncReservationsFromiCal}
        loading={isSyncing}
       />
       <Button
        type="text"
        icon={<i className="PrimaryColor fa-regular fa-circle-plus fa-2xl" />}
        onClick={handleCreateReservation}
       />
      </Space>
     ) : (
      <Space>
       <Button
        onClick={syncReservationsFromiCal}
        icon={<i className="fa-regular fa-arrows-rotate" />}
        loading={isSyncing}
       >
        {t('reservation.sync.button')}
       </Button>
       <Button
        type="primary"
        icon={<i className="fa-regular fa-plus" />}
        onClick={handleCreateReservation}
       >
        {t('reservation.create.button')}
       </Button>
      </Space>
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
        {ownedProperties.map((property) => (
         <Option key={property.id} value={property.id}>
          {property.name}
         </Option>
        ))}
       </Select>

       <RangePicker
        onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
        placeholder={[t('reservation.startDate'), t('reservation.endDate')]}
        size="large"
       />
      </Flex>
     )}

     <List
      dataSource={filteredReservations}
      locale={{ emptyText: t('reservation.noReservations') }}
      loading={isLoading}
      pagination={{ pageSize: 10 }}
      renderItem={(reservation) => (
       <List.Item key={reservation.id} extra={renderActionButtons(reservation)}>
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
        {ownedProperties.map((property) => (
         <Option key={property.id} value={property.id}>
          {property.name}
         </Option>
        ))}
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

export default ReservationsDashboard;
