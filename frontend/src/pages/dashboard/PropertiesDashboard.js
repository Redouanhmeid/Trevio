import React, { useState, useEffect, useMemo } from 'react';
import {
 Layout,
 Card,
 Table,
 Button,
 Input,
 Select,
 Tag,
 Typography,
 Space,
 Dropdown,
 Menu,
 Empty,
 Row,
 Col,
 Statistic,
 Tooltip,
 Flex,
 Badge,
 Popconfirm,
 message,
} from 'antd';
import useProperty from '../../hooks/useProperty';
import { useConcierge } from '../../hooks/useConcierge';
import { useTranslation } from '../../context/TranslationContext';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/common/DashboardHeader';
import Foot from '../../components/common/footer';
import fallback from '../../assets/fallback.png';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const PropertiesDashboard = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();

 // State variables
 const [userId, setUserId] = useState(null);
 const [properties, setProperties] = useState([]);
 const [filteredProperties, setFilteredProperties] = useState([]);
 const [loading, setLoading] = useState(true);

 // Filters
 const [searchTerm, setSearchTerm] = useState('');
 const [propertyTypeFilter, setPropertyTypeFilter] = useState('all');
 const [propertyOwnershipFilter, setPropertyOwnershipFilter] = useState('all');
 const [propertyStatusFilter, setPropertyStatusFilter] = useState('all');

 // Hooks
 const {
  fetchPropertiesbyClient,
  toggleEnableProperty,
  deleteProperty,
  error: propertyError,
 } = useProperty();
 const { getConciergeProperties } = useConcierge();

 // Handle user data from header
 const handleUserData = (userData) => {
  setUserId(userData);
 };

 // Fetch user properties
 const fetchUserProperties = async () => {
  setLoading(true);
  try {
   // Fetch owned properties
   const ownedProperties = await fetchPropertiesbyClient(userId);

   // Fetch managed properties
   const assignedProperties = await getConciergeProperties(userId);

   // Extract actual property details from the assignments
   const managedPropertyDetails = assignedProperties
    .filter((assignment) => assignment.status === 'active')
    .map((assignment) => ({
     ...assignment.property,
     propertyType: 'managed',
    }));

   // Mark owned properties
   const ownedPropertyDetails = (ownedProperties || []).map((property) => ({
    ...property,
    propertyType: 'owned',
   }));

   // Combine and deduplicate properties
   const combinedProperties = [
    ...ownedPropertyDetails,
    ...managedPropertyDetails.filter(
     (managedProp) =>
      !ownedPropertyDetails.some((ownedProp) => ownedProp.id === managedProp.id)
    ),
   ];

   setProperties(combinedProperties);
   setFilteredProperties(combinedProperties);
  } catch (error) {
   console.error('Error fetching properties:', error);
   setProperties([]);
   setFilteredProperties([]);
  } finally {
   setLoading(false);
  }
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

   // Ownership filter
   const matchesOwnership =
    propertyOwnershipFilter === 'all' ||
    property.propertyType === propertyOwnershipFilter;

   // Status filter
   const matchesStatus =
    propertyStatusFilter === 'all' || property.status === propertyStatusFilter;

   return matchesSearch && matchesType && matchesOwnership && matchesStatus;
  });

  setFilteredProperties(filtered);
 }, [
  properties,
  searchTerm,
  propertyTypeFilter,
  propertyOwnershipFilter,
  propertyStatusFilter,
 ]);

 // First, load properties when userId is available
 useEffect(() => {
  if (userId) {
   fetchUserProperties();
  }
 }, [userId]);

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

 // Handle delete property
 const handleDeleteProperty = async (propertyId) => {
  try {
   await deleteProperty(propertyId);
   if (!propertyError) {
    message.success(t('messages.deleteSuccess'));
    fetchUserProperties();
   } else {
    message.error(t('messages.deleteError', { error: propertyError.message }));
   }
  } catch (err) {
   message.error(t('messages.deleteError', { error: err.message }));
  }
 };

 // Property action menu
 const getPropertyActionMenu = (property) => {
  const actions = [
   <Button
    key={`view-${property.id}`}
    icon={<i className="Dashicon fa-light fa-eye" />}
    onClick={() => navigate(`/propertydetails?hash=${property.hashId}`)}
    type="link"
    shape="circle"
   />,
   <Button
    key={`guide-${property.id}`}
    icon={<i className="Dashicon fa-light fa-book" />}
    onClick={() => navigate(`/digitalguidebook?hash=${property.hashId}`)}
    type="link"
    shape="circle"
   />,
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
   />,
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
   />,

   <Button
    key={`contracts-${property.id}`}
    icon={<i className="PrimaryColor Dashicon fa-light fa-file-signature" />}
    onClick={() => navigate(`/contractslist?hash=${property.hashId}`)}
    type="link"
    shape="circle"
   />,
   <Popconfirm
    key={`toggle-${property.id}`}
    title={
     property.status === 'enable' ? t('property.disable') : t('property.enable')
    }
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
      property.status === 'enable' ? (
       <i
        className="Dashicon Pointer fa-light fa-lock-open"
        style={{ color: '#52C41A' }}
       />
      ) : (
       <i className="Dashicon fa-light fa-lock" style={{ color: '#F5222D' }} />
      )
     }
    />
   </Popconfirm>,
   <Popconfirm
    key={`delete-${property.id}`}
    title={t('messages.deleteConfirm')}
    onConfirm={() => handleDeleteProperty(property.id)}
    okText={t('common.yes')}
    cancelText={t('common.no')}
   >
    <Button
     danger
     icon={
      <i className="Dashicon fa-light fa-trash" style={{ color: 'red' }} />
     }
     type="link"
     shape="circle"
    />
   </Popconfirm>,
  ];

  return actions;
 };

 // Columns for properties table
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
   render: (price) => `${price} ${t('property.basic.priceNight')}`,
   sorter: (a, b) => a.price - b.price,
  },
  {
   title: t('dashboard.lastUpdate'),
   dataIndex: 'updatedAt',
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
   <DashboardHeader onUserData={handleUserData} />
   <Content className="container">
    {/* Page Header */}
    <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
     <Title level={2}>{t('property.title')}</Title>
     <Button
      type="primary"
      icon={<i className="fa-regular fa-circle-plus fa-xl"></i>}
      size="large"
      onClick={() => navigate('/addproperty')}
      style={{ width: 260, height: 48 }}
     >
      {t('property.addButton')}
     </Button>
    </Flex>

    {/* Filters and Search */}
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

     <Select
      style={{ width: 200 }}
      placeholder={t('managers.properties.assignedTo')}
      allowClear
      onChange={(value) => setPropertyOwnershipFilter(value || 'all')}
      size="large"
     >
      <Option value="owned">{t('property.owned')}</Option>
      <Option value="managed">{t('property.managed')}</Option>
     </Select>
    </Flex>

    {/* Statistics */}
    <Row gutter={16} style={{ marginBottom: 16 }}>
     <Col xs={24} md={6}>
      <Card>
       <Statistic
        title={t('dashboard.totalProperties')}
        value={filteredProperties.length}
       />
      </Card>
     </Col>
     <Col xs={24} md={6}>
      <Card>
       <Statistic
        title={t('property.owned')}
        value={
         filteredProperties.filter((p) => p.propertyType === 'owned').length
        }
       />
      </Card>
     </Col>
     <Col xs={24} md={6}>
      <Card>
       <Statistic
        title={t('property.managed')}
        value={
         filteredProperties.filter((p) => p.propertyType === 'managed').length
        }
       />
      </Card>
     </Col>
     <Col xs={24} md={6}>
      <Card>
       <Statistic
        title={t('property.propertyStatus.active')}
        value={filteredProperties.filter((p) => p.status === 'enable').length}
       />
      </Card>
     </Col>
    </Row>

    {/* Properties Table */}
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
   </Content>
   <Foot />
  </Layout>
 );
};

export default PropertiesDashboard;
