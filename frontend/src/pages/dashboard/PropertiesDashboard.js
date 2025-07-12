import React, { useState, useEffect } from 'react';
import {
 Layout,
 Card,
 Table,
 List,
 Button,
 Input,
 Select,
 Tag,
 Typography,
 Space,
 Flex,
 Badge,
 Popconfirm,
 message,
 Grid,
 Drawer,
 Image,
 Empty,
 Tooltip,
} from 'antd';
import useProperty from '../../hooks/useProperty';
import { useTranslation } from '../../context/TranslationContext';
import { useUserData } from '../../hooks/useUserData';
import { useNavigate } from 'react-router-dom';
import Head from '../../components/common/header';
import Foot from '../../components/common/footer';
import fallback from '../../assets/fallback.png';
import PasswordConfirmationModal from '../forms/PasswordConfirmationModal';
import { useAuthContext } from '../../hooks/useAuthContext';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const PropertiesDashboard = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();
 const { user } = useAuthContext();
 const { verifyUserPassword } = useUserData();

 // State variables
 const [userId, setUserId] = useState(null);
 const [properties, setProperties] = useState([]);
 const [filteredProperties, setFilteredProperties] = useState([]);
 const [loading, setLoading] = useState(true);
 const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

 // Password confirmation modal state
 const [passwordModalVisible, setPasswordModalVisible] = useState(false);
 const [confirmLoading, setConfirmLoading] = useState(false);
 const [passwordError, setPasswordError] = useState(null);
 const [propertyToDelete, setPropertyToDelete] = useState(null);

 // Filters
 const [searchTerm, setSearchTerm] = useState('');
 const [propertyTypeFilter, setPropertyTypeFilter] = useState('all');
 const [propertyStatusFilter, setPropertyStatusFilter] = useState('all');

 // Hooks
 const {
  fetchPropertiesbyClient,
  toggleEnableProperty,
  deleteProperty,
  error: propertyError,
 } = useProperty();

 // Handle user data from header
 const handleUserData = (userData) => {
  setUserId(userData);
 };

 // Fetch user properties
 const fetchUserProperties = async () => {
  setLoading(true);
  try {
   const ownedProperties = await fetchPropertiesbyClient(userId);
   const ownedPropertyDetails = (ownedProperties || []).map((property) => ({
    ...property,
    propertyType: 'owned',
   }));

   setProperties(ownedPropertyDetails);
   setFilteredProperties(ownedPropertyDetails);
  } catch (error) {
   console.error('Error fetching properties:', error);
   setProperties([]);
   setFilteredProperties([]);
  } finally {
   setLoading(false);
  }
 };

 const handleToggleProperty = async (propertyId) => {
  try {
   await toggleEnableProperty(propertyId);
   if (!propertyError) {
    message.success(t('property.toggleSuccess'));
    fetchUserProperties();
   } else {
    message.error(t('property.toggleError', { error: propertyError.message }));
   }
  } catch (err) {
   message.error(t('property.toggleError', { error: err.message }));
  }
 };

 // Show password confirmation modal before deleting
 const showDeleteConfirmation = (property) => {
  setPropertyToDelete(property);
  setPasswordModalVisible(true);
  setPasswordError(null);
 };

 // Handle password confirmation and property deletion
 const handlePasswordConfirm = async (password) => {
  if (!propertyToDelete) return;

  setConfirmLoading(true);
  setPasswordError(null);

  try {
   const email = user?.email;
   if (!email) {
    throw new Error('User information not available');
   }

   // Use our new verification function
   const isPasswordValid = await verifyUserPassword(email, password);

   if (isPasswordValid) {
    // Password verified, proceed with deletion
    await deleteProperty(propertyToDelete.id);
    message.success(t('messages.deleteSuccess'));
    setPasswordModalVisible(false);
    fetchUserProperties();
   } else {
    setPasswordError(t('auth.invalidPassword'));
   }
  } catch (error) {
   console.error('Error during property deletion:', error);
   setPasswordError(error.message || t('messages.deleteError'));
  } finally {
   setConfirmLoading(false);
  }
 };

 // Handle delete modal cancel
 const handleCancelPasswordModal = () => {
  setPasswordModalVisible(false);
  setPropertyToDelete(null);
  setPasswordError(null);
 };

 // Property action menu
 const getPropertyActionMenu = (property) => {
  const actions = [
   <Tooltip
    key={`edit-tooltip-${property.id}`}
    title={t('property.actions.edit')}
   >
    <Button
     key={`view-${property.id}`}
     icon={<i className="Dashicon fa-light fa-pen-to-square" />}
     onClick={() => navigate(`/property-management?hash=${property.hashId}`)}
     type="link"
     shape="circle"
    />
   </Tooltip>,
   <Tooltip
    key={`guide-tooltip-${property.id}`}
    title={t('property.actions.guidebook')}
   >
    <Button
     key={`guide-${property.id}`}
     icon={<i className="Dashicon fa-light fa-book" />}
     onClick={() => navigate(`/digitalguidebook?hash=${property.hashId}`)}
     type="link"
     shape="circle"
    />
   </Tooltip>,
   <Tooltip key={`task-tooltip-${property.id}`} title={t('tasks.title')}>
    <Button
     key={`task-${property.id}`}
     icon={
      <i
       className="Dashicon fa-light fa-list-check"
       style={{ color: '#2b2c32' }}
      />
     }
     onClick={() =>
      navigate(`/propertytaskdashboard?id=${property.id}&name=${property.name}`)
     }
     type="link"
     shape="circle"
    />
   </Tooltip>,
   <Tooltip key={`revenue-tooltip-${property.id}`} title={t('revenue.title')}>
    <Button
     key={`revenue-${property.id}`}
     icon={
      <i
       className="Dashicon fa-light fa-dollar-sign"
       style={{ color: '#389e0d' }}
      />
     }
     onClick={() =>
      navigate(
       `/propertyrevenuedashboard?id=${property.id}&name=${property.name}`
      )
     }
     type="link"
     shape="circle"
    />
   </Tooltip>,
   <Tooltip
    key={`contracts-tooltip-${property.id}`}
    title={t('contracts.title')}
   >
    <Button
     key={`contracts-${property.id}`}
     icon={<i className="PrimaryColor Dashicon fa-light fa-file-signature" />}
     onClick={() => navigate(`/contractslist?hash=${property.hashId}`)}
     type="link"
     shape="circle"
    />
   </Tooltip>,
   <Tooltip
    key={`toggle-tooltip-${property.id}`}
    title={
     property.status === 'pending'
      ? t('property.pendingApproval')
      : property.status === 'enable'
      ? t('property.disable')
      : t('property.enable')
    }
   >
    <Popconfirm
     key={`toggle-${property.id}`}
     disabled={property.status === 'pending'}
     title={
      property.status === 'enable'
       ? t('property.disable')
       : t('property.enable')
     }
     placement="topLeft"
     description={t('property.confirmToggle')}
     onConfirm={() => handleToggleProperty(property.id)}
     okText={t('common.yes')}
     cancelText={t('common.no')}
     trigger="click"
     icon={
      property.status === 'enable' ? (
       <i
        className="Dashicon Pointer fa-light fa-lock"
        style={{ color: '#F5222D', marginRight: 6 }}
       />
      ) : (
       <i
        className="Dashicon Pointer fa-light fa-lock-open"
        style={{ color: '#52C41A', marginRight: 6 }}
       />
      )
     }
    >
     <Button
      type="link"
      shape="circle"
      icon={
       property.status === 'pending' ? (
        <i
         className="Dashicon fa-light fa-clock"
         style={{ color: '#d9d9d9' }}
        />
       ) : property.status === 'enable' ? (
        <i
         className="Dashicon Pointer fa-light fa-lock-open"
         style={{ color: '#52C41A' }}
        />
       ) : (
        <i className="Dashicon fa-light fa-lock" style={{ color: '#F5222D' }} />
       )
      }
     />
    </Popconfirm>
   </Tooltip>,
   <Tooltip
    key={`delete-tooltip-${property.id}`}
    title={t('property.actions.delete')}
   >
    <Button
     key={`delete-${property.id}`}
     danger
     icon={
      <i className="Dashicon fa-light fa-trash" style={{ color: 'red' }} />
     }
     type="link"
     shape="circle"
     onClick={() => showDeleteConfirmation(property)}
    />
   </Tooltip>,
  ];

  return actions;
 };

 // Apply filters
 useEffect(() => {
  if (properties.length === 0) return;

  const filtered = properties.filter((property) => {
   // Search term filter
   const matchesSearch =
    !searchTerm ||
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.placeName.toLowerCase().includes(searchTerm.toLowerCase());

   // Property type filter
   const matchesType =
    propertyTypeFilter === 'all' || property.type === propertyTypeFilter;

   // Status filter
   const matchesStatus =
    propertyStatusFilter === 'all' || property.status === propertyStatusFilter;

   return matchesSearch && matchesType && matchesStatus;
  });

  setFilteredProperties(filtered);
 }, [properties, searchTerm, propertyTypeFilter, propertyStatusFilter]);

 // First, load properties when userId is available
 useEffect(() => {
  if (userId) {
   fetchUserProperties();
  }
 }, [userId]);

 const columns = [
  {
   title: t('property.basic.name'),
   dataIndex: 'name',
   key: 'name',
   render: (name, record) => (
    <Flex align="center" gap={12}>
     <img
      src={record.frontPhoto || record.photos?.[0] || fallback}
      alt={name}
      style={{
       width: 64,
       height: 64,
       objectFit: 'cover',
       borderRadius: 8,
      }}
     />
     <Flex vertical>
      <Text strong>{name}</Text>
      <Text type="secondary">{record.placeName}</Text>
     </Flex>
    </Flex>
   ),
  },
  {
   title: t('property.basic.type'),
   dataIndex: 'type',
   key: 'type',
   render: (type) => (
    <Tag color="processing">{t(`type.${type.toLowerCase()}`)}</Tag>
   ),
   filters: [
    { text: t('type.house'), value: 'house' },
    { text: t('type.apartment'), value: 'apartment' },
    { text: t('type.guesthouse'), value: 'guesthouse' },
   ],
   onFilter: (value, record) => record.type.toLowerCase() === value,
  },
  {
   title: t('property.status'),
   dataIndex: 'status',
   width: 140,
   key: 'status',
   render: (status) => {
    const statusColors = {
     enable: 'success',
     disable: 'error',
     pending: 'warning',
    };
    return (
     <Badge
      status={statusColors[status] || 'default'}
      text={t(`property.propertyStatus.${status}`)}
     />
    );
   },
   filters: [
    { text: t('property.propertyStatus.active'), value: 'enable' },
    { text: t('property.propertyStatus.inactive'), value: 'disable' },
    { text: t('property.propertyStatus.pending'), value: 'pending' },
   ],
   onFilter: (value, record) => record.status === value,
  },
  {
   title: t('property.basic.price'),
   dataIndex: 'price',
   key: 'price',
   width: 140,
   render: (price) =>
    price ? `${price} ${t('property.basic.priceNight')}` : '-',
   sorter: (a, b) => {
    // Handle null values in sorting
    if (a.price === null && b.price === null) return 0;
    if (a.price === null) return -1;
    if (b.price === null) return 1;
    return a.price - b.price;
   },
  },
  {
   title: t('dashboard.lastUpdate'),
   dataIndex: 'updatedAt',
   width: 140,
   key: 'updatedAt',
   render: (updatedAt) => new Date(updatedAt).toLocaleDateString(),
   sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
  },
  {
   title: t('common.actions'),
   key: 'actions',
   render: (_, record) => (
    <Space size="small">{getPropertyActionMenu(record)}</Space>
   ),
  },
 ];

 return (
  <Layout className="contentStyle">
   <Head onUserData={handleUserData} />
   <Content className="container">
    {/* Header */}
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
      {t('property.title')}
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
        onClick={() => navigate('/addproperty')}
       />
      </Space>
     ) : (
      <Button
       type="primary"
       icon={<i className="fa-regular fa-circle-plus fa-xl"></i>}
       size="large"
       onClick={() => navigate('/addproperty')}
       style={{ width: 260, height: 48 }}
      >
       {t('property.addButton')}
      </Button>
     )}
    </Flex>

    {/* Desktop filters */}
    {!screens.xs && (
     <Flex gap={16} style={{ marginBottom: 16 }}>
      <Search
       placeholder={t('common.search')}
       allowClear
       style={{ width: 250 }}
       onSearch={(value) => setSearchTerm(value)}
       onChange={(e) => setSearchTerm(e.target.value)}
       size="large"
      />

      <Select
       style={{ width: 150 }}
       placeholder={t('property.basic.type')}
       allowClear
       onChange={(value) => setPropertyTypeFilter(value || 'all')}
       size="large"
      >
       <Option value="house">{t('type.house')}</Option>
       <Option value="apartment">{t('type.apartment')}</Option>
       <Option value="guesthouse">{t('type.guesthouse')}</Option>
      </Select>

      <Select
       style={{ width: 150 }}
       placeholder={t('property.status')}
       allowClear
       onChange={(value) => setPropertyStatusFilter(value || 'all')}
       size="large"
      >
       <Option value="enable">{t('property.propertyStatus.active')}</Option>
       <Option value="disable">{t('property.propertyStatus.inactive')}</Option>
       <Option value="pending">{t('property.propertyStatus.pending')}</Option>
      </Select>
     </Flex>
    )}

    {/* Properties Table */}
    {!screens.xs && (
     <Table
      columns={columns}
      dataSource={filteredProperties}
      loading={loading}
      rowKey="id"
      locale={{
       emptyText: <Empty description={t('property.noProperties')} />,
      }}
      pagination={{
       showSizeChanger: true,
       showTotal: (total, range) => `${total} ${t('property.title')}`,
      }}
     />
    )}

    {/* Mobile properties list */}
    {screens.xs && (
     <List
      dataSource={filteredProperties}
      renderItem={(property) => (
       <List.Item style={{ padding: 0, marginBottom: 8 }}>
        <Card
         styles={{ body: { padding: '0' } }}
         style={{ width: '100%' }}
         bordered={false}
        >
         <Flex align="stretch" justify="center">
          <Image
           src={property.frontPhoto || property.photos?.[0] || fallback}
           alt={property.name}
           style={{
            width: 80,
            height: 56,
            objectFit: 'cover',
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
           }}
           preview={false}
           fallback={fallback}
          />
          <Flex
           align="flex-start"
           vertical
           style={{ padding: '4px 12px', flex: 1, minHeight: 59 }}
          >
           <Text strong fontSize={screens.xs ? 10 : 14}>
            {screens.xs && property.name.length > 40
             ? property.name.substring(0, 40) + '...'
             : property.name}
           </Text>
           <Text
            style={{ color: '#6D5FFA', fontWeight: 'bold' }}
            fontSize={screens.xs ? 12 : 16}
           >
            {property.price} dhs
           </Text>
          </Flex>
          <Button
           type="text"
           shape="circle"
           size="small"
           icon={
            <i
             className="fa-regular fa-circle-arrow-right PrimaryColor"
             style={{ fontSize: 20 }}
            />
           }
           onClick={() => navigate(`/propertyactions?hash=${property.hashId}`)}
          />
         </Flex>
        </Card>
       </List.Item>
      )}
      locale={{
       emptyText: <Empty description={t('property.noProperties')} />,
      }}
      loading={loading}
      pagination={{
       pageSize: 10,
       showSizeChanger: false,
       size: 'small',
      }}
      split={false}
     />
    )}

    {/* Mobile Filter Drawer */}
    <Drawer
     title={t('home.filters.title')}
     placement="right"
     onClose={() => setFilterDrawerVisible(false)}
     open={filterDrawerVisible}
     width={screens.xs ? '90%' : 400}
     className="filter-drawer"
    >
     <Flex gap="middle" vertical>
      <Search
       placeholder={t('common.search')}
       allowClear
       onSearch={(value) => setSearchTerm(value)}
       onChange={(e) => setSearchTerm(e.target.value)}
       size="large"
      />

      <Select
       style={{ width: '100%', marginTop: 8 }}
       placeholder={t('property.basic.type')}
       allowClear
       onChange={(value) => setPropertyTypeFilter(value || 'all')}
       value={propertyTypeFilter === 'all' ? undefined : propertyTypeFilter}
       size="large"
      >
       <Option value="house">{t('type.house')}</Option>
       <Option value="apartment">{t('type.apartment')}</Option>
       <Option value="guesthouse">{t('type.guesthouse')}</Option>
      </Select>

      <Select
       placeholder={t('property.status')}
       style={{ width: '100%', marginTop: 8 }}
       onChange={(value) => setPropertyStatusFilter(value || 'all')}
       value={propertyStatusFilter === 'all' ? undefined : propertyStatusFilter}
       allowClear
       size="large"
      >
       <Option value="enable">{t('property.propertyStatus.active')}</Option>
       <Option value="disable">{t('property.propertyStatus.inactive')}</Option>
       <Option value="pending">{t('property.propertyStatus.pending')}</Option>
      </Select>
     </Flex>
    </Drawer>

    {/* Password Confirmation Modal */}
    <PasswordConfirmationModal
     visible={passwordModalVisible}
     onCancel={handleCancelPasswordModal}
     onConfirm={handlePasswordConfirm}
     title={t('property.deleteConfirmation')}
     confirmLoading={confirmLoading}
     errorMessage={passwordError}
     actionText={t('property.delete')}
    />
   </Content>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default PropertiesDashboard;
