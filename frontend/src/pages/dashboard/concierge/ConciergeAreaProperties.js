// ConciergeProperties.js - Properties Management Component (Complete)
import React, { useState, useEffect } from 'react';
import {
 Layout,
 Card,
 Row,
 Col,
 Typography,
 Button,
 Badge,
 Tag,
 Space,
 Input,
 Select,
 Tabs,
 List,
 Avatar,
 Progress,
 Statistic,
 Grid,
 Empty,
 Modal,
 Calendar,
 Tooltip,
 Image,
 Spin,
} from 'antd';
import {
 HomeOutlined,
 CalendarOutlined,
 DollarCircleOutlined,
 ToolOutlined,
 EyeOutlined,
 SettingOutlined,
 SearchOutlined,
 FilterOutlined,
 PlusOutlined,
 PhoneOutlined,
 MessageOutlined,
 LockOutlined,
 CheckCircleOutlined,
 AppstoreOutlined,
 BarsOutlined,
} from '@ant-design/icons';
import DashboardHeader from '../../../components/common/DashboardHeader';
import Foot from '../../../components/common/footer';
import fallback from '../../../assets/fallback.png';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

// Property Card Component
const PropertyCard = ({ property, onAction }) => {
 const getStatusColor = (status) => {
  switch (status) {
   case 'active':
    return '#52c41a';
   case 'maintenance':
    return '#faad14';
   case 'blocked':
    return '#f5222d';
   default:
    return '#d9d9d9';
  }
 };

 const getStatusText = (status) => {
  switch (status) {
   case 'active':
    return 'Active';
   case 'maintenance':
    return 'Maintenance';
   case 'blocked':
    return 'Blocked';
   default:
    return 'Unknown';
  }
 };

 return (
  <Card
   hoverable
   cover={
    <div style={{ position: 'relative', height: 200 }}>
     <Image
      src={property.photos?.[0] || fallback}
      alt={property.name}
      style={{ height: 200, width: '100%', objectFit: 'cover' }}
      preview={false}
     />
     <div
      style={{
       position: 'absolute',
       top: 12,
       right: 12,
       background: 'rgba(0,0,0,0.7)',
       borderRadius: 6,
       padding: '4px 8px',
      }}
     >
      <Badge
       color={getStatusColor(property.status)}
       text={
        <span style={{ color: 'white', fontSize: '12px' }}>
         {getStatusText(property.status)}
        </span>
       }
      />
     </div>
    </div>
   }
   actions={[
    <Tooltip title="View Details">
     <EyeOutlined onClick={() => onAction('view', property)} />
    </Tooltip>,
    <Tooltip title="Manage">
     <SettingOutlined onClick={() => onAction('manage', property)} />
    </Tooltip>,
    <Tooltip title="Calendar">
     <CalendarOutlined onClick={() => onAction('calendar', property)} />
    </Tooltip>,
    <Tooltip title="Tasks">
     <ToolOutlined onClick={() => onAction('tasks', property)} />
    </Tooltip>,
   ]}
  >
   <Card.Meta
    title={property.name}
    description={
     <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Text type="secondary">
       <HomeOutlined style={{ marginRight: 4 }} />
       {property.placeName}
      </Text>
      <div>
       <Text strong style={{ color: '#1890ff' }}>
        €{property.price}/night
       </Text>
       <Text type="secondary" style={{ marginLeft: 12 }}>
        {property.capacity} guests
       </Text>
      </div>
      <div>
       <Text type="secondary">Occupancy: </Text>
       <Text strong>{property.occupancyRate}%</Text>
       <Progress
        percent={property.occupancyRate}
        size="small"
        status={property.occupancyRate > 80 ? 'success' : 'normal'}
        style={{ marginTop: 4 }}
       />
      </div>
      {property.nextEvent && (
       <Text type="secondary" style={{ fontSize: '12px' }}>
        Next: {property.nextEvent}
       </Text>
      )}
     </Space>
    }
   />
  </Card>
 );
};

// Property List Component (Alternative view)
const PropertyList = ({ properties, onAction }) => {
 return (
  <List
   itemLayout="horizontal"
   dataSource={properties}
   renderItem={(property) => (
    <List.Item
     actions={[
      <Button type="link" onClick={() => onAction('view', property)}>
       View
      </Button>,
      <Button type="link" onClick={() => onAction('manage', property)}>
       Manage
      </Button>,
      <Button type="link" onClick={() => onAction('calendar', property)}>
       Calendar
      </Button>,
     ]}
    >
     <List.Item.Meta
      avatar={
       <Avatar
        shape="square"
        size={64}
        src={property.photos?.[0] || fallback}
       />
      }
      title={
       <Space>
        {property.name}
        <Tag color={property.status === 'active' ? 'green' : 'orange'}>
         {property.status.toUpperCase()}
        </Tag>
       </Space>
      }
      description={
       <Space direction="vertical" size="small">
        <Text type="secondary">{property.placeName}</Text>
        <Text>
         <strong>€{property.price}/night</strong> • {property.capacity} guests
        </Text>
        <Text type="secondary">Occupancy: {property.occupancyRate}%</Text>
       </Space>
      }
     />
    </List.Item>
   )}
  />
 );
};

// Filters Component
const PropertyFilters = ({ onFilter, onSearch }) => {
 const [filters, setFilters] = useState({
  status: 'all',
  type: 'all',
  location: 'all',
 });

 const handleFilterChange = (key, value) => {
  const newFilters = { ...filters, [key]: value };
  setFilters(newFilters);
  onFilter(newFilters);
 };

 return (
  <Card bordered={false}>
   <Row gutter={[16, 16]} align="middle">
    <Col xs={24} sm={24} md={8}>
     <Search
      placeholder="Search properties..."
      allowClear
      enterButton={<SearchOutlined />}
      onSearch={onSearch}
     />
    </Col>
    <Col xs={8} sm={8} md={4}>
     <Select
      style={{ width: '100%' }}
      placeholder="Status"
      value={filters.status}
      onChange={(value) => handleFilterChange('status', value)}
     >
      <Option value="all">All Status</Option>
      <Option value="active">Active</Option>
      <Option value="maintenance">Maintenance</Option>
      <Option value="blocked">Blocked</Option>
     </Select>
    </Col>
    <Col xs={8} sm={8} md={4}>
     <Select
      style={{ width: '100%' }}
      placeholder="Type"
      value={filters.type}
      onChange={(value) => handleFilterChange('type', value)}
     >
      <Option value="all">All Types</Option>
      <Option value="house">House</Option>
      <Option value="apartment">Apartment</Option>
      <Option value="guesthouse">Guest House</Option>
     </Select>
    </Col>
    <Col xs={8} sm={8} md={4}>
     <Select
      style={{ width: '100%' }}
      placeholder="Location"
      value={filters.location}
      onChange={(value) => handleFilterChange('location', value)}
     >
      <Option value="all">All Locations</Option>
      <Option value="rabat">Rabat</Option>
      <Option value="casablanca">Casablanca</Option>
      <Option value="marrakech">Marrakech</Option>
     </Select>
    </Col>
    <Col xs={24} sm={24} md={4}>
     <Button type="primary" block>
      <PlusOutlined /> Add Property
     </Button>
    </Col>
   </Row>
  </Card>
 );
};

// Property Stats Component
const PropertyStats = ({ properties }) => {
 const stats = {
  total: properties.length,
  active: properties.filter((p) => p.status === 'active').length,
  maintenance: properties.filter((p) => p.status === 'maintenance').length,
  avgOccupancy:
   properties.reduce((acc, p) => acc + p.occupancyRate, 0) /
    properties.length || 0,
  totalRevenue: properties.reduce((acc, p) => acc + (p.monthlyRevenue || 0), 0),
 };

 return (
  <Row gutter={[16, 16]}>
   <Col xs={12} sm={12} md={6}>
    <Card bordered={false}>
     <Statistic
      title="Total Properties"
      value={stats.total}
      prefix={<HomeOutlined />}
      valueStyle={{ color: '#1890ff' }}
     />
    </Card>
   </Col>
   <Col xs={12} sm={12} md={6}>
    <Card bordered={false}>
     <Statistic
      title="Active Properties"
      value={stats.active}
      prefix={<CheckCircleOutlined />}
      valueStyle={{ color: '#52c41a' }}
     />
    </Card>
   </Col>
   <Col xs={12} sm={12} md={6}>
    <Card bordered={false}>
     <Statistic
      title="Avg. Occupancy"
      value={stats.avgOccupancy.toFixed(0)}
      suffix="%"
      prefix={<CalendarOutlined />}
      valueStyle={{ color: '#faad14' }}
     />
    </Card>
   </Col>
   <Col xs={12} sm={12} md={6}>
    <Card bordered={false}>
     <Statistic
      title="Monthly Revenue"
      value={stats.totalRevenue}
      prefix="€"
      prefix={<DollarCircleOutlined />}
      valueStyle={{ color: '#52c41a' }}
     />
    </Card>
   </Col>
  </Row>
 );
};

// Property Quick Actions Modal
const QuickActionsModal = ({ visible, property, onClose, onAction }) => {
 if (!property) return null;

 const actions = [
  {
   key: 'contact',
   title: 'Contact Owner',
   icon: <PhoneOutlined />,
   description: 'Call or message property owner',
  },
  {
   key: 'maintenance',
   title: 'Report Maintenance',
   icon: <ToolOutlined />,
   description: 'Create maintenance request',
  },
  {
   key: 'access',
   title: 'Access Management',
   icon: <LockOutlined />,
   description: 'Manage electronic locks and keys',
  },
  {
   key: 'emergency',
   title: 'Emergency Contacts',
   icon: <PhoneOutlined />,
   description: 'View emergency contact list',
  },
 ];

 return (
  <Modal
   title={`Quick Actions - ${property.name}`}
   open={visible}
   onCancel={onClose}
   footer={null}
   width={600}
  >
   <List
    itemLayout="horizontal"
    dataSource={actions}
    renderItem={(action) => (
     <List.Item
      actions={[
       <Button type="primary" onClick={() => onAction(action.key, property)}>
        Execute
       </Button>,
      ]}
     >
      <List.Item.Meta
       avatar={<Avatar icon={action.icon} />}
       title={action.title}
       description={action.description}
      />
     </List.Item>
    )}
   />
  </Modal>
 );
};

// Main Concierge Properties Component
const ConciergeAreaProperties = () => {
 const [loading, setLoading] = useState(false);
 const [properties, setProperties] = useState([]);
 const [filteredProperties, setFilteredProperties] = useState([]);
 const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
 const [quickActionsModal, setQuickActionsModal] = useState({
  visible: false,
  property: null,
 });
 const screens = useBreakpoint();

 // Mock data - replace with actual API calls
 useEffect(() => {
  setLoading(true);
  // Simulate API call
  setTimeout(() => {
   const mockProperties = [
    {
     id: 1,
     name: 'Villa Azure',
     placeName: 'Rabat Marina',
     status: 'active',
     type: 'house',
     price: 120,
     capacity: 8,
     photos: ['/api/placeholder/300/200'],
     occupancyRate: 92,
     nextEvent: 'Check-in: Tomorrow 3:00 PM',
     monthlyRevenue: 3600,
    },
    {
     id: 2,
     name: 'Ocean View Apartment',
     placeName: 'Casablanca',
     status: 'active',
     type: 'apartment',
     price: 85,
     capacity: 4,
     photos: ['/api/placeholder/300/200'],
     occupancyRate: 87,
     nextEvent: 'Check-out: Today 11:00 AM',
     monthlyRevenue: 2550,
    },
    {
     id: 3,
     name: 'Sunset Villa',
     placeName: 'Marrakech',
     status: 'maintenance',
     type: 'house',
     price: 150,
     capacity: 10,
     photos: ['/api/placeholder/300/200'],
     occupancyRate: 0,
     nextEvent: 'Maintenance: Tomorrow 10:00 AM',
     monthlyRevenue: 0,
    },
    {
     id: 4,
     name: 'City Center Apartment',
     placeName: 'Rabat Center',
     status: 'active',
     type: 'apartment',
     price: 75,
     capacity: 6,
     photos: ['/api/placeholder/300/200'],
     occupancyRate: 78,
     nextEvent: 'Check-in: Today 4:00 PM',
     monthlyRevenue: 2250,
    },
   ];
   setProperties(mockProperties);
   setFilteredProperties(mockProperties);
   setLoading(false);
  }, 1000);
 }, []);

 const handleAction = (action, property) => {
  console.log(`Action: ${action}`, property);
  switch (action) {
   case 'view':
    // Navigate to property details
    break;
   case 'manage':
    // Navigate to property management
    break;
   case 'calendar':
    // Navigate to property calendar
    break;
   case 'tasks':
    // Navigate to property tasks
    break;
   case 'quickActions':
    setQuickActionsModal({ visible: true, property });
    break;
   default:
    console.log(`Executing ${action} for property:`, property);
  }
 };

 const handleFilter = (filters) => {
  let filtered = [...properties];

  if (filters.status !== 'all') {
   filtered = filtered.filter((p) => p.status === filters.status);
  }
  if (filters.type !== 'all') {
   filtered = filtered.filter((p) => p.type === filters.type);
  }
  if (filters.location !== 'all') {
   filtered = filtered.filter((p) =>
    p.placeName.toLowerCase().includes(filters.location.toLowerCase())
   );
  }

  setFilteredProperties(filtered);
 };

 const handleSearch = (value) => {
  const filtered = properties.filter(
   (p) =>
    p.name.toLowerCase().includes(value.toLowerCase()) ||
    p.placeName.toLowerCase().includes(value.toLowerCase())
  );
  setFilteredProperties(filtered);
 };

 return (
  <Layout className="contentStyle">
   <DashboardHeader />
   <Content className="container" style={{ padding: '24px' }}>
    <div style={{ marginBottom: '24px' }}>
     <Title level={2}>My Properties</Title>
     <Text type="secondary">Manage and monitor your assigned properties</Text>
    </div>

    {/* Property Stats */}
    <div style={{ marginBottom: '24px' }}>
     <PropertyStats properties={filteredProperties} />
    </div>

    {/* Filters */}
    <div style={{ marginBottom: '24px' }}>
     <PropertyFilters onFilter={handleFilter} onSearch={handleSearch} />
    </div>

    {/* View Mode Toggle */}
    <div style={{ marginBottom: '16px', textAlign: 'right' }}>
     <Button.Group>
      <Button
       type={viewMode === 'card' ? 'primary' : 'default'}
       onClick={() => setViewMode('card')}
       icon={<AppstoreOutlined />}
      >
       Card View
      </Button>
      <Button
       type={viewMode === 'list' ? 'primary' : 'default'}
       onClick={() => setViewMode('list')}
       icon={<BarsOutlined />}
      >
       List View
      </Button>
     </Button.Group>
    </div>

    {/* Properties Display */}
    {loading ? (
     <div style={{ textAlign: 'center', padding: '50px' }}>
      <Spin size="large" />
     </div>
    ) : filteredProperties.length === 0 ? (
     <Empty description="No properties found" style={{ padding: '50px' }} />
    ) : viewMode === 'card' ? (
     <Row gutter={[16, 16]}>
      {filteredProperties.map((property) => (
       <Col xs={24} sm={12} lg={8} xl={6} key={property.id}>
        <PropertyCard property={property} onAction={handleAction} />
       </Col>
      ))}
     </Row>
    ) : (
     <Card bordered={false}>
      <PropertyList properties={filteredProperties} onAction={handleAction} />
     </Card>
    )}

    {/* Quick Actions Modal */}
    <QuickActionsModal
     visible={quickActionsModal.visible}
     property={quickActionsModal.property}
     onClose={() => setQuickActionsModal({ visible: false, property: null })}
     onAction={handleAction}
    />
   </Content>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default ConciergeAreaProperties;
