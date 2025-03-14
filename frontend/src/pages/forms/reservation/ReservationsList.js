import React, { useState, useEffect } from 'react';
import {
 Layout,
 Typography,
 Table,
 Button,
 Space,
 Tag,
 message,
 Tooltip,
 Input,
 Select,
 DatePicker,
 Dropdown,
 Card,
 Spin,
 Flex,
} from 'antd';
import {
 PlusOutlined,
 SearchOutlined,
 EllipsisOutlined,
 ArrowLeftOutlined,
 MailOutlined,
 FileTextOutlined,
 DollarOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../../context/TranslationContext';
import { useAuthContext } from '../../../hooks/useAuthContext';
import { useReservation } from '../../../hooks/useReservation';
import useProperty from '../../../hooks/useProperty';
import { useConcierge } from '../../../hooks/useConcierge';
import dayjs from 'dayjs';
import Head from '../../../components/common/header';
import Foot from '../../../components/common/footer';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ReservationsList = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();
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
    message.error(t('property.fetchError'));
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
  const data = await sendToGuest(id);
  if (data) {
   // Refresh the list if successful
   fetchReservations();
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
   draft: 'default',
   sent: 'processing',
   confirmed: 'success',
   cancelled: 'error',
  };

  return (
   <Tag color={statusColors[status]}>{t(`reservation.statuses.${status}`)}</Tag>
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

 const columns = [
  {
   title: t('property.title'),
   dataIndex: ['property', 'name'],
   key: 'propertyName',
   render: (text, record) => (
    <a
     onClick={() =>
      navigate(`/propertydetails?hash=${record.property?.hashId}`)
     }
    >
     {text}
    </a>
   ),
  },
  {
   title: t('reservation.dates'),
   key: 'dates',
   render: (_, record) => (
    <span>
     {dayjs(record.startDate).format('YYYY-MM-DD')} -{' '}
     {dayjs(record.endDate).format('YYYY-MM-DD')}
    </span>
   ),
  },
  {
   title: t('reservation.nights'),
   key: 'nights',
   render: (_, record) => {
    const nights = dayjs(record.endDate).diff(dayjs(record.startDate), 'day');
    return <span>{nights}</span>;
   },
  },
  {
   title: t('reservation.totalPrice'),
   dataIndex: 'totalPrice',
   key: 'price',
   render: (price) => <span>{price} Dhs</span>,
  },
  {
   title: t('property.status'),
   dataIndex: 'status',
   key: 'status',
   render: getStatusTag,
  },
  {
   title: t('property.actions.actions'),
   key: 'actions',
   render: (_, record) => {
    const hasContract = reservationContracts[record.id];

    return (
     <Space size="small">
      {/* Show Generate Contract only for draft status without contract */}
      {record.status === 'draft' && !hasContract && (
       <Button
        type="default"
        icon={<i className="fa-regular fa-file-signature"></i>}
        onClick={() => handleGenerateContract(record.id)}
       >
        {t('reservation.generateContract')}
       </Button>
      )}

      {/* Show Send to Guest only for draft status with contract */}
      {record.status === 'draft' && hasContract && (
       <Button type="primary" onClick={() => handleSendToGuest(record.id)}>
        {t('reservation.sendToGuest')}
        <i
         className="fa-regular fa-paper-plane-top"
         style={{ marginLeft: 6 }}
        />
       </Button>
      )}

      {/* View button always shown */}
      <Button
       type="text"
       icon={<i className="PrimaryColor fa-regular fa-eye"></i>}
       onClick={() => handleViewReservation(record.id)}
      />
     </Space>
    );
   },
  },
 ];

 return (
  <Layout className="contentStyle">
   <Head onUserData={handleUserData} />
   <Content className="container">
    <Button
     type="link"
     icon={<ArrowLeftOutlined />}
     onClick={() => navigate(-1)}
    >
     {t('button.back')}
    </Button>

    <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
     <Title level={2}>{t('reservation.list.title')}</Title>
     <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={handleCreateReservation}
     >
      {t('reservation.create.button')}
     </Button>
    </Flex>

    <Card bordered={false}>
     <Flex gap="middle" wrap="wrap" style={{ marginBottom: 16 }}>
      <Input
       placeholder={t('common.search')}
       prefix={<SearchOutlined />}
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

     <Table
      columns={columns}
      dataSource={filteredReservations}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10 }}
      scroll={{ x: 'max-content' }}
     />
    </Card>
   </Content>
   <Foot />
  </Layout>
 );
};

export default ReservationsList;
