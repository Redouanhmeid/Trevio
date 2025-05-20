import React, { useState, useEffect, useCallback } from 'react';
import {
 Spin,
 Layout,
 Card,
 Row,
 Col,
 Typography,
 Button,
 Tag,
 Space,
 Select,
 DatePicker,
 List,
 Statistic,
 Progress,
 Grid,
 Avatar,
 Empty,
 Modal,
 Form,
 Input,
 InputNumber,
 Tabs,
 Alert,
 Tooltip,
 message,
 Dropdown,
 Menu,
} from 'antd';
import {
 DollarCircleOutlined,
 HomeOutlined,
 CalendarOutlined,
 TrendingUpOutlined,
 TrendingDownOutlined,
 LineChartOutlined,
 BarChartOutlined,
 PieChartOutlined,
 PlusOutlined,
 EditOutlined,
 DeleteOutlined,
 EyeOutlined,
 ExportOutlined,
 FilterOutlined,
 ArrowUpOutlined,
 ArrowDownOutlined,
} from '@ant-design/icons';
import {
 LineChart,
 Line,
 BarChart,
 Bar,
 PieChart,
 Pie,
 Cell,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip as RechartsTooltip,
 Legend,
 ResponsiveContainer,
 AreaChart,
 Area,
} from 'recharts';
import DashboardHeader from '../../../components/common/DashboardHeader';
import Foot from '../../../components/common/footer';
import { useNavigate } from 'react-router-dom';
import useRevenue from '../../../hooks/useRevenue';
import { useConcierge } from '../../../hooks/useConcierge';
import { useAuthContext } from '../../../hooks/useAuthContext';
import { useTranslation } from '../../../context/TranslationContext';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { RangePicker, MonthPicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

// Revenue Stats Component
const RevenueStats = ({ revenues, properties }) => {
 const screens = useBreakpoint();

 const currentYear = new Date().getFullYear();
 const currentMonth = new Date().getMonth() + 1;
 const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
 const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

 const stats = {
  totalRevenue: revenues.reduce((sum, r) => sum + r.amount, 0),
  currentMonthRevenue: revenues
   .filter((r) => r.year === currentYear && r.month === currentMonth)
   .reduce((sum, r) => sum + r.amount, 0),
  lastMonthRevenue: revenues
   .filter((r) => r.year === lastMonthYear && r.month === lastMonth)
   .reduce((sum, r) => sum + r.amount, 0),
  totalProperties: properties.length,
  avgRevenuePerProperty:
   revenues.length > 0
    ? revenues.reduce((sum, r) => sum + r.amount, 0) / properties.length
    : 0,
 };

 const monthGrowth =
  stats.lastMonthRevenue > 0
   ? ((stats.currentMonthRevenue - stats.lastMonthRevenue) /
      stats.lastMonthRevenue) *
     100
   : 0;

 const yearToDateRevenue = revenues
  .filter((r) => r.year === currentYear)
  .reduce((sum, r) => sum + r.amount, 0);

 const lastYearRevenue = revenues
  .filter((r) => r.year === currentYear - 1)
  .reduce((sum, r) => sum + r.amount, 0);

 const yearGrowth =
  lastYearRevenue > 0
   ? ((yearToDateRevenue - lastYearRevenue) / lastYearRevenue) * 100
   : 0;

 return (
  <Row gutter={[16, 16]}>
   <Col xs={12} sm={12} md={6}>
    <Card bordered={false}>
     <Statistic
      title="Total Revenue"
      value={stats.totalRevenue}
      suffix="Dh"
      precision={0}
      valueStyle={{ color: '#1890ff' }}
     />
    </Card>
   </Col>
   <Col xs={12} sm={12} md={6}>
    <Card bordered={false}>
     <Statistic
      title="This Month"
      value={stats.currentMonthRevenue}
      suffix="Dh"
      precision={0}
      valueStyle={{ color: monthGrowth >= 0 ? '#52c41a' : '#ff4d4f' }}
      suffix={
       <div style={{ fontSize: '14px', marginTop: 4 }}>
        {monthGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        <span style={{ marginLeft: 4 }}>
         {Math.abs(monthGrowth).toFixed(1)}%
        </span>
       </div>
      }
     />
    </Card>
   </Col>
   <Col xs={12} sm={12} md={6}>
    <Card bordered={false}>
     <Statistic
      title="Year to Date"
      value={yearToDateRevenue}
      suffix="Dh"
      precision={0}
      valueStyle={{ color: yearGrowth >= 0 ? '#52c41a' : '#ff4d4f' }}
      suffix={
       <div style={{ fontSize: '14px', marginTop: 4 }}>
        {yearGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        <span style={{ marginLeft: 4 }}>
         {Math.abs(yearGrowth).toFixed(1)}%
        </span>
       </div>
      }
     />
    </Card>
   </Col>
   <Col xs={12} sm={12} md={6}>
    <Card bordered={false}>
     <Statistic
      title="Avg. per Property"
      value={stats.avgRevenuePerProperty}
      suffix="Dh"
      precision={0}
      valueStyle={{ color: '#722ed1' }}
     />
    </Card>
   </Col>
  </Row>
 );
};

// Revenue Chart Component
const RevenueChart = ({ revenues, type = 'line' }) => {
 const processChartData = () => {
  const monthlyData = {};

  revenues.forEach((revenue) => {
   const key = `${revenue.year}-${revenue.month.toString().padStart(2, '0')}`;
   if (!monthlyData[key]) {
    monthlyData[key] = {
     period: new Date(revenue.year, revenue.month - 1).toLocaleDateString(
      'en-US',
      {
       month: 'short',
       year: 'numeric',
      }
     ),
     total: 0,
     properties: {},
    };
   }
   monthlyData[key].total += revenue.amount;
   if (!monthlyData[key].properties[revenue.property.name]) {
    monthlyData[key].properties[revenue.property.name] = 0;
   }
   monthlyData[key].properties[revenue.property.name] += revenue.amount;
  });

  return Object.values(monthlyData).sort((a, b) =>
   a.period.localeCompare(b.period)
  );
 };

 const pieData = () => {
  const propertyRevenue = {};
  revenues.forEach((revenue) => {
   if (!propertyRevenue[revenue.property.name]) {
    propertyRevenue[revenue.property.name] = 0;
   }
   propertyRevenue[revenue.property.name] += revenue.amount;
  });

  return Object.entries(propertyRevenue).map(([name, value]) => ({
   name,
   value,
  }));
 };

 const chartData = processChartData();
 const COLORS = [
  '#1890ff',
  '#52c41a',
  '#faad14',
  '#722ed1',
  '#13c2c2',
  '#fa541c',
 ];

 if (type === 'line') {
  return (
   <ResponsiveContainer width="100%" height={400}>
    <LineChart data={chartData}>
     <CartesianGrid strokeDasharray="3 3" />
     <XAxis dataKey="period" />
     <YAxis />
     <RechartsTooltip
      formatter={(value) => [`${value.toLocaleString()} Dh`, 'Revenue']}
     />
     <Legend />
     <Line
      type="monotone"
      dataKey="total"
      stroke="#1890ff"
      strokeWidth={2}
      dot={{ fill: '#1890ff' }}
     />
    </LineChart>
   </ResponsiveContainer>
  );
 }

 if (type === 'area') {
  return (
   <ResponsiveContainer width="100%" height={400}>
    <AreaChart data={chartData}>
     <CartesianGrid strokeDasharray="3 3" />
     <XAxis dataKey="period" />
     <YAxis />
     <RechartsTooltip
      formatter={(value) => [`${value.toLocaleString()} Dh`, 'Revenue']}
     />
     <Legend />
     <Area
      type="monotone"
      dataKey="total"
      stroke="#1890ff"
      fill="url(#colorRevenue)"
     />
     <defs>
      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
       <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
       <stop offset="95%" stopColor="#1890ff" stopOpacity={0.1} />
      </linearGradient>
     </defs>
    </AreaChart>
   </ResponsiveContainer>
  );
 }

 if (type === 'bar') {
  return (
   <ResponsiveContainer width="100%" height={400}>
    <BarChart data={chartData}>
     <CartesianGrid strokeDasharray="3 3" />
     <XAxis dataKey="period" />
     <YAxis />
     <RechartsTooltip
      formatter={(value) => [`${value.toLocaleString()} Dh`, 'Revenue']}
     />
     <Legend />
     <Bar dataKey="total" fill="#1890ff" />
    </BarChart>
   </ResponsiveContainer>
  );
 }

 return (
  <ResponsiveContainer width="100%" height={400}>
   <PieChart>
    <Pie
     data={pieData()}
     cx="50%"
     cy="50%"
     labelLine={false}
     label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
     outerRadius={120}
     fill="#8884d8"
     dataKey="value"
    >
     {pieData().map((entry, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
     ))}
    </Pie>
    <RechartsTooltip
     formatter={(value) => [`${value.toLocaleString()} Dh`, 'Revenue']}
    />
   </PieChart>
  </ResponsiveContainer>
 );
};

// Property Performance Component
const PropertyPerformance = ({ revenues, properties }) => {
 const getPropertyPerformance = () => {
  const performance = {};

  properties.forEach((property) => {
   performance[property.id] = {
    ...property,
    totalRevenue: 0,
    monthCount: 0,
    avgMonthly: 0,
   };
  });

  revenues.forEach((revenue) => {
   if (performance[revenue.propertyId]) {
    performance[revenue.propertyId].totalRevenue += revenue.amount;
    performance[revenue.propertyId].monthCount += 1;
   }
  });

  Object.values(performance).forEach((p) => {
   p.avgMonthly = p.monthCount > 0 ? p.totalRevenue / p.monthCount : 0;
  });

  return Object.values(performance).sort(
   (a, b) => b.totalRevenue - a.totalRevenue
  );
 };

 const performanceData = getPropertyPerformance();

 return (
  <List
   itemLayout="horizontal"
   dataSource={performanceData}
   renderItem={(property, index) => (
    <List.Item>
     <List.Item.Meta
      avatar={
       <div
        style={{
         width: 40,
         height: 40,
         borderRadius: '50%',
         backgroundColor: '#1890ff',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
         color: 'white',
         fontWeight: 'bold',
        }}
       >
        #{index + 1}
       </div>
      }
      title={
       <Space>
        <Text strong>{property.name}</Text>
        <Tag color="blue">{property.totalRevenue.toLocaleString()} Dh</Tag>
       </Space>
      }
      description={
       <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Text type="secondary">
         Avg. Monthly: {property.avgMonthly.toLocaleString()} Dh
        </Text>
        <Progress
         percent={Math.min(
          (property.totalRevenue /
           Math.max(...performanceData.map((p) => p.totalRevenue))) *
           100,
          100
         )}
         size="small"
         status="active"
        />
       </Space>
      }
     />
    </List.Item>
   )}
  />
 );
};

// Revenue Entry Card Component
const RevenueCard = ({ revenue, onAction }) => {
 const getActionsMenu = () => (
  <Menu>
   <Menu.Item
    key="view"
    icon={<EyeOutlined />}
    onClick={() => onAction('view', revenue)}
   >
    View Details
   </Menu.Item>
   <Menu.Item
    key="edit"
    icon={<EditOutlined />}
    onClick={() => onAction('edit', revenue)}
   >
    Edit Revenue
   </Menu.Item>
   <Menu.Divider />
   <Menu.Item
    key="delete"
    icon={<DeleteOutlined />}
    danger
    onClick={() => onAction('delete', revenue)}
   >
    Delete Revenue
   </Menu.Item>
  </Menu>
 );

 return (
  <Card
   title={
    <Space>
     <Text strong>{revenue.amount.toLocaleString()} Dh</Text>
     <Tag color="blue">
      {new Date(revenue.year, revenue.month - 1).toLocaleDateString('en-US', {
       month: 'short',
       year: 'numeric',
      })}
     </Tag>
    </Space>
   }
   extra={
    <Dropdown overlay={getActionsMenu()} trigger={['click']}>
     <Button type="text" icon={<EyeOutlined />} />
    </Dropdown>
   }
   size="small"
  >
   <Space direction="vertical" size="small" style={{ width: '100%' }}>
    <div>
     <HomeOutlined style={{ marginRight: 8, color: '#1890ff' }} />
     <Text>{revenue.property.name}</Text>
    </div>
    <div>
     <CalendarOutlined style={{ marginRight: 8, color: '#722ed1' }} />
     <Text type="secondary">
      {new Date(revenue.year, revenue.month - 1).toLocaleDateString('en-US', {
       month: 'long',
       year: 'numeric',
      })}
     </Text>
    </div>
    {revenue.notes && (
     <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
      {revenue.notes}
     </Paragraph>
    )}
    {revenue.reservation && (
     <div>
      <Text type="secondary">From: Reservation #{revenue.reservation.id}</Text>
     </div>
    )}
   </Space>
  </Card>
 );
};

// Revenue Filters Component
const RevenueFilters = ({ onFilter, onDateRangeChange, properties }) => {
 const { t } = useTranslation();
 const [filters, setFilters] = useState({
  property: 'all',
  year: new Date().getFullYear(),
 });

 const currentYear = new Date().getFullYear();
 const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

 const handleFilterChange = (key, value) => {
  const newFilters = { ...filters, [key]: value };
  setFilters(newFilters);
  onFilter(newFilters);
 };

 return (
  <Card bordered={false}>
   <Row gutter={[16, 16]} align="middle">
    <Col xs={12} sm={8} md={6}>
     <Select
      style={{ width: '100%' }}
      placeholder={t('property.title')}
      value={filters.property}
      onChange={(value) => handleFilterChange('property', value)}
     >
      <Option value="all">{t('common.all')}</Option>
      {/* Map through real properties from API */}
      {properties.map((property) => (
       <Option key={property.id} value={property.id.toString()}>
        {property.name}
       </Option>
      ))}
     </Select>
    </Col>
    <Col xs={12} sm={8} md={6}>
     <Select
      style={{ width: '100%' }}
      placeholder={t('revenue.year')}
      value={filters.year}
      onChange={(value) => handleFilterChange('year', value)}
     >
      {years.map((year) => (
       <Option key={year} value={year}>
        {year}
       </Option>
      ))}
     </Select>
    </Col>
    <Col xs={24} sm={8} md={8}>
     <RangePicker
      style={{ width: '100%' }}
      placeholder={['Start Date', 'End Date']}
      onChange={onDateRangeChange}
     />
    </Col>
    {/* Remove the "Add Revenue" button as per your request */}
   </Row>
  </Card>
 );
};

// Revenue Form Modal
const RevenueFormModal = ({
 visible,
 revenue,
 properties,
 onClose,
 onSave,
}) => {
 const [form] = Form.useForm();
 const [loading, setLoading] = useState(false);

 useEffect(() => {
  if (visible && revenue) {
   form.setFieldsValue({
    propertyId: revenue.propertyId,
    amount: revenue.amount,
    month: revenue.month,
    year: revenue.year,
    notes: revenue.notes,
   });
  } else if (visible) {
   form.setFieldsValue({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
   });
  }
 }, [visible, revenue, form]);

 const handleSave = async (values) => {
  setLoading(true);
  try {
   await onSave(values, revenue?.id);
   form.resetFields();
   onClose();
  } catch (error) {
   console.error('Error saving revenue:', error);
  } finally {
   setLoading(false);
  }
 };

 const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
 ];

 return (
  <Modal
   title={`${revenue ? 'Edit' : 'Add'} Revenue Entry`}
   open={visible}
   onCancel={onClose}
   footer={null}
   width={500}
  >
   <Form form={form} layout="vertical" onFinish={handleSave}>
    <Form.Item
     name="propertyId"
     label="Property"
     rules={[{ required: true, message: 'Please select a property' }]}
    >
     <Select placeholder="Select property">
      {properties.map((property) => (
       <Option key={property.id} value={property.id}>
        {property.name}
       </Option>
      ))}
     </Select>
    </Form.Item>
    <Row gutter={16}>
     <Col span={12}>
      <Form.Item
       name="amount"
       label="Amount (Dh)"
       rules={[{ required: true, message: 'Please enter amount' }]}
      >
       <InputNumber
        style={{ width: '100%' }}
        min={0}
        precision={2}
        formatter={(value) =>
         `${value} Dhs`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        }
        parser={(value) => value.replace(/\€\s?|(,*)/g, '')}
       />
      </Form.Item>
     </Col>
     <Col span={12}>
      <Form.Item
       name="month"
       label="Month"
       rules={[{ required: true, message: 'Please select month' }]}
      >
       <Select placeholder="Select month">
        {months.map((month, index) => (
         <Option key={index + 1} value={index + 1}>
          {month}
         </Option>
        ))}
       </Select>
      </Form.Item>
     </Col>
    </Row>
    <Form.Item
     name="year"
     label="Year"
     rules={[{ required: true, message: 'Please select year' }]}
    >
     <Select placeholder="Select year">
      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(
       (year) => (
        <Option key={year} value={year}>
         {year}
        </Option>
       )
      )}
     </Select>
    </Form.Item>
    <Form.Item name="notes" label="Notes">
     <Input.TextArea
      rows={3}
      placeholder="Add notes about this revenue entry..."
     />
    </Form.Item>
    <div style={{ textAlign: 'right' }}>
     <Space>
      <Button onClick={onClose}>Cancel</Button>
      <Button type="primary" htmlType="submit" loading={loading}>
       {revenue ? 'Update' : 'Add'} Revenue
      </Button>
     </Space>
    </div>
   </Form>
  </Modal>
 );
};

// Main Concierge Revenue Component
const ConciergeAreaRevenue = () => {
 const { t } = useTranslation();
 const screens = useBreakpoint();
 const [loading, setLoading] = useState(false);
 const [revenues, setRevenues] = useState([]);
 const [filteredRevenues, setFilteredRevenues] = useState([]);
 const [properties, setProperties] = useState([]);
 const [activeTab, setActiveTab] = useState('overview');
 const [chartType, setChartType] = useState('line');
 const [formModal, setFormModal] = useState({
  visible: false,
  revenue: null,
 });
 const [userId, setUserId] = useState(null);
 const [propertyRevenues, setPropertyRevenues] = useState({});
 const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

 // Hooks
 const { getConciergeProperties } = useConcierge();
 const { getPropertyRevenue, getAnnualRevenue } = useRevenue();

 useEffect(() => {
  const fetchManagedProperties = async () => {
   if (!userId) return;

   setLoading(true);
   try {
    // Get properties managed by this concierge
    const assignedProperties = await getConciergeProperties(userId);

    // Extract actual property details from the assignments
    const managedProperties = assignedProperties
     .filter((assignment) => assignment.status === 'active')
     .map((assignment) => ({
      id: assignment.property.id,
      name: assignment.property.name,
     }));

    setProperties(managedProperties);
   } catch (error) {
    console.error('Error fetching managed properties:', error);
    message.error(t('managers.fetchPropertiesError'));
   } finally {
    setLoading(false);
   }
  };

  if (userId) {
   fetchManagedProperties();
  }
 }, [userId]);

 useEffect(() => {
  if (properties.length > 0) {
   getPropertyRevenue(properties);
  }
 }, [properties, selectedYear]);

 // Mock data - replace with actual API calls
 useEffect(() => {
  const fetchData = async () => {
   setLoading(true);
   try {
    // Get the concierge's managed properties
    const conciergeProperties = await getConciergeProperties(userId);

    // Extract property information
    const propertyList = conciergeProperties.map((assignment) => ({
     id: assignment.property.id,
     name: assignment.property.name,
    }));

    setProperties(propertyList);

    // Fetch revenue data for all managed properties
    if (propertyList.length > 0) {
     const currentYear = new Date().getFullYear();

     // Fetch revenue for each property
     const revenuePromises = propertyList.map((property) =>
      getPropertyRevenue(property.id, currentYear)
     );

     const revenueResults = await Promise.all(revenuePromises);

     // Flatten and format revenue data
     const allRevenues = revenueResults.flatMap((result, index) => {
      // Skip null results (failed API calls)
      if (!result) return [];

      return result.map((revenue) => ({
       id: revenue.id,
       propertyId: revenue.propertyId,
       property: {
        id: revenue.propertyId,
        name:
         propertyList.find((p) => p.id === revenue.propertyId)?.name ||
         'Unknown',
       },
       amount: parseFloat(revenue.amount),
       month: new Date(revenue.startDate).getMonth() + 1,
       year: new Date(revenue.startDate).getFullYear(),
       notes: revenue.notes,
       reservation: revenue.reservationId
        ? { id: revenue.reservationId }
        : null,
       createdAt: revenue.createdAt,
      }));
     });

     setRevenues(allRevenues);
     setFilteredRevenues(allRevenues);
    }
   } catch (error) {
    console.error('Error fetching data:', error);
    message.error('Failed to load revenue data');
   } finally {
    setLoading(false);
   }
  };

  if (userId) {
   fetchData();
  }
 }, [userId]);

 // Handle user data from header component
 const handleUserData = (userData) => {
  setUserId(userData);
 };

 const handleAction = (action, revenue = null) => {
  console.log(`Action: ${action}`, revenue);
  switch (action) {
   case 'create':
    setFormModal({ visible: true, revenue: null });
    break;
   case 'edit':
    setFormModal({ visible: true, revenue });
    break;
   case 'view':
    Modal.info({
     title: 'Revenue Details',
     content: (
      <div>
       <p>
        <strong>Property:</strong> {revenue.property.name}
       </p>
       <p>
        <strong>Amount:</strong> {revenue.amount.toLocaleString()} Dh
       </p>
       <p>
        <strong>Period:</strong>{' '}
        {new Date(revenue.year, revenue.month - 1).toLocaleDateString('en-US', {
         month: 'long',
         year: 'numeric',
        })}
       </p>
       {revenue.notes && (
        <p>
         <strong>Notes:</strong> {revenue.notes}
        </p>
       )}
       {revenue.reservation && (
        <p>
         <strong>From Reservation:</strong> #{revenue.reservation.id}
        </p>
       )}
      </div>
     ),
    });
    break;
   case 'delete':
    Modal.confirm({
     title: 'Delete Revenue Entry',
     content: 'Are you sure you want to delete this revenue entry?',
     okType: 'danger',
     onOk: () => {
      const updatedRevenues = revenues.filter((r) => r.id !== revenue.id);
      setRevenues(updatedRevenues);
      setFilteredRevenues(updatedRevenues);
      message.success('Revenue entry deleted successfully');
     },
    });
    break;
  }
 };

 const handleFilter = (filters) => {
  let filtered = [...revenues];

  if (filters.property !== 'all') {
   const propertyName = filters.property.replace('-', ' ');
   filtered = filtered.filter((r) =>
    r.property.name.toLowerCase().includes(propertyName.toLowerCase())
   );
  }
  if (filters.year) {
   filtered = filtered.filter((r) => r.year === filters.year);
  }

  setFilteredRevenues(filtered);
 };

 const handleDateRangeChange = (dates) => {
  if (dates && dates.length === 2) {
   const [start, end] = dates;
   const filtered = revenues.filter((r) => {
    const revenueDate = new Date(r.year, r.month - 1);
    return revenueDate >= start && revenueDate <= end;
   });
   setFilteredRevenues(filtered);
  } else {
   setFilteredRevenues(revenues);
  }
 };

 const handleSaveRevenue = async (values, revenueId = null) => {
  return new Promise((resolve) => {
   setTimeout(() => {
    if (revenueId) {
     // Update existing revenue
     const updatedRevenues = revenues.map((r) =>
      r.id === revenueId
       ? {
          ...r,
          ...values,
          property: properties.find((p) => p.id === values.propertyId),
         }
       : r
     );
     setRevenues(updatedRevenues);
     setFilteredRevenues(updatedRevenues);
    } else {
     // Add new revenue
     const newRevenue = {
      id: Date.now(),
      ...values,
      property: properties.find((p) => p.id === values.propertyId),
      createdAt: new Date().toISOString().split('T')[0],
     };
     const updatedRevenues = [...revenues, newRevenue];
     setRevenues(updatedRevenues);
     setFilteredRevenues(updatedRevenues);
    }
    message.success(`Revenue ${revenueId ? 'updated' : 'added'} successfully`);
    resolve();
   }, 1000);
  });
 };

 return (
  <Layout className="contentStyle">
   <DashboardHeader onUserData={handleUserData} />
   <Content className="container">
    <Title level={2}>{t('revenue.allPropertiesTitle')}</Title>

    {/* Revenue Stats */}
    <div style={{ marginBottom: '24px' }}>
     <RevenueStats revenues={filteredRevenues} properties={properties} />
    </div>

    {/* Filters */}
    <div style={{ marginBottom: '24px' }}>
     <RevenueFilters
      onFilter={handleFilter}
      onDateRangeChange={handleDateRangeChange}
      properties={properties}
     />
    </div>

    {/* Tabs */}
    <Tabs activeKey={activeTab} onChange={setActiveTab}>
     <TabPane tab="Overview" key="overview">
      <Row gutter={[24, 24]}>
       <Col xs={24} lg={16}>
        <Card
         title="Revenue Trends"
         extra={
          <Space>
           <Select value={chartType} onChange={setChartType}>
            <Option value="line">
             <LineChartOutlined /> Line Chart
            </Option>
            <Option value="area">
             <BarChartOutlined /> Area Chart
            </Option>
            <Option value="bar">
             <BarChartOutlined /> Bar Chart
            </Option>
            <Option value="pie">
             <PieChartOutlined /> Pie Chart
            </Option>
           </Select>
           <Button icon={<ExportOutlined />}>Export</Button>
          </Space>
         }
         bordered={false}
        >
         <RevenueChart revenues={filteredRevenues} type={chartType} />
        </Card>
       </Col>
       <Col xs={24} lg={8}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
         <Card title="Recent Revenue Entries" bordered={false}>
          <List
           dataSource={filteredRevenues.slice(0, 5)}
           renderItem={(revenue) => (
            <List.Item>
             <List.Item.Meta
              avatar={
               <Avatar
                icon={<DollarCircleOutlined />}
                style={{ backgroundColor: '#52c41a' }}
               />
              }
              title={`${revenue.amount.toLocaleString()} Dh`}
              description={
               <Space direction="vertical" size="small">
                <Text type="secondary">{revenue.property.name}</Text>
                <Text type="secondary">
                 {new Date(revenue.year, revenue.month - 1).toLocaleString(
                  'default',
                  {
                   month: 'long',
                   year: 'numeric',
                  }
                 )}
                </Text>
               </Space>
              }
             />
            </List.Item>
           )}
          />
         </Card>

         <Card title="Revenue Alerts" bordered={false}>
          <Alert
           message="Performance Notice"
           description="Villa Azure revenue increased by 15% this month compared to last month."
           type="success"
           showIcon
           style={{ marginBottom: 12 }}
          />
          <Alert
           message="Low Performance"
           description="Ocean View Apartment revenue is 20% below target this month."
           type="warning"
           showIcon
          />
         </Card>
        </Space>
       </Col>
      </Row>
     </TabPane>

     <TabPane tab="Property Performance" key="performance">
      <Card title="Property Revenue Analysis" bordered={false}>
       <PropertyPerformance
        revenues={filteredRevenues}
        properties={properties}
       />
      </Card>
     </TabPane>

     <TabPane tab="Revenue Entries" key="entries">
      {loading ? (
       <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
       </div>
      ) : filteredRevenues.length === 0 ? (
       <Empty
        description="No revenue entries found"
        style={{ padding: '50px' }}
       />
      ) : (
       <Row gutter={[16, 16]}>
        {filteredRevenues.map((revenue) => (
         <Col xs={24} sm={12} lg={8} xl={6} key={revenue.id}>
          <RevenueCard revenue={revenue} onAction={handleAction} />
         </Col>
        ))}
       </Row>
      )}
     </TabPane>
    </Tabs>

    {/* Revenue Form Modal */}
    <RevenueFormModal
     visible={formModal.visible}
     revenue={formModal.revenue}
     properties={properties}
     onClose={() => setFormModal({ visible: false, revenue: null })}
     onSave={handleSaveRevenue}
    />
   </Content>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default ConciergeAreaRevenue;
