import React, { useState, useEffect } from 'react';
import {
 Layout,
 Card,
 Row,
 Col,
 Typography,
 List,
 Badge,
 Button,
 Tabs,
 Statistic,
 Avatar,
 Tag,
 Space,
 Grid,
 Empty,
 Alert,
 Calendar,
 Timeline,
} from 'antd';
import {
 HomeOutlined,
 CalendarOutlined,
 CheckCircleOutlined,
 ClockCircleOutlined,
 DollarCircleOutlined,
 UserOutlined,
 BellOutlined,
 ToolOutlined,
} from '@ant-design/icons';
import DashboardHeader from '../../../components/common/DashboardHeader';
import Foot from '../../../components/common/footer';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

// Quick Stats Component
const QuickStats = ({ stats = {} }) => {
 const screens = useBreakpoint();

 const statsData = [
  {
   title: 'Active Properties',
   value: stats.activeProperties || 0,
   icon: <HomeOutlined style={{ color: '#1890ff' }} />,
   color: '#1890ff',
  },
  {
   title: 'Pending Reservations',
   value: stats.pendingReservations || 0,
   icon: <CalendarOutlined style={{ color: '#52c41a' }} />,
   color: '#52c41a',
  },
  {
   title: "Today's Tasks",
   value: stats.todayTasks || 0,
   icon: <CheckCircleOutlined style={{ color: '#faad14' }} />,
   color: '#faad14',
  },
  {
   title: 'Overdue Tasks',
   value: stats.overdueTasks || 0,
   icon: <ClockCircleOutlined style={{ color: '#f5222d' }} />,
   color: '#f5222d',
  },
 ];

 return (
  <Row gutter={[16, 16]}>
   {statsData.map((stat, index) => (
    <Col xs={12} sm={12} md={6} key={index}>
     <Card
      bordered={false}
      style={{
       background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
       borderRadius: '12px',
      }}
     >
      <Statistic
       title={stat.title}
       value={stat.value}
       prefix={stat.icon}
       valueStyle={{
        color: stat.color,
        fontSize: screens.xs ? '20px' : '24px',
       }}
      />
     </Card>
    </Col>
   ))}
  </Row>
 );
};

// Recent Activity Component
const RecentActivity = ({ activities = [] }) => {
 const defaultActivities = [
  {
   id: 1,
   type: 'reservation',
   message: 'New reservation at Villa Azure',
   time: '2 hours ago',
   icon: <CalendarOutlined style={{ color: '#1890ff' }} />,
  },
  {
   id: 2,
   type: 'task',
   message: 'Task completed: Cleaning',
   time: '4 hours ago',
   icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  },
  {
   id: 3,
   type: 'contract',
   message: 'Contract signed for booking #1234',
   time: '1 day ago',
   icon: <UserOutlined style={{ color: '#722ed1' }} />,
  },
 ];

 const activityList = activities.length > 0 ? activities : defaultActivities;

 return (
  <Card
   title={
    <Space>
     <BellOutlined />
     <span>Recent Activity</span>
    </Space>
   }
   extra={<Button type="link">View All</Button>}
   bordered={false}
  >
   <List
    itemLayout="horizontal"
    dataSource={activityList}
    renderItem={(item) => (
     <List.Item>
      <List.Item.Meta
       avatar={<Avatar icon={item.icon} />}
       title={item.message}
       description={item.time}
      />
     </List.Item>
    )}
   />
  </Card>
 );
};

// Today's Schedule Component
const TodaySchedule = ({ schedule = [] }) => {
 const defaultSchedule = [
  {
   id: 1,
   time: '10:00 AM',
   type: 'check-in',
   property: 'Villa Azure',
   guest: 'John Smith',
   color: 'green',
  },
  {
   id: 2,
   time: '02:00 PM',
   type: 'maintenance',
   property: 'Sunset Apartment',
   task: 'Plumbing repair',
   color: 'orange',
  },
  {
   id: 3,
   time: '04:00 PM',
   type: 'check-out',
   property: 'Ocean View',
   guest: 'Sarah Johnson',
   color: 'blue',
  },
 ];

 const scheduleList = schedule.length > 0 ? schedule : defaultSchedule;

 return (
  <Card
   title={
    <Space>
     <CalendarOutlined />
     <span>Today's Schedule</span>
    </Space>
   }
   extra={<Button type="link">View Calendar</Button>}
   bordered={false}
  >
   <Timeline>
    {scheduleList.map((item) => (
     <Timeline.Item color={item.color} key={item.id}>
      <div>
       <Text strong>{item.time}</Text>
       <div>
        <Text>
         {item.type === 'check-in'
          ? '📅'
          : item.type === 'check-out'
          ? '🚪'
          : '🔧'}{' '}
        </Text>
        <Text>{item.property}</Text>
        {item.guest && <Text type="secondary"> - {item.guest}</Text>}
        {item.task && <Text type="secondary"> - {item.task}</Text>}
       </div>
      </div>
     </Timeline.Item>
    ))}
   </Timeline>
  </Card>
 );
};

// Property Overview Component
const PropertyOverview = ({ properties = [] }) => {
 const defaultProperties = [
  {
   id: 1,
   name: 'Villa Azure',
   location: 'Rabat Marina',
   status: 'active',
   price: 120,
   nextEvent: 'Check-in: 10:00 AM',
   image: '/api/placeholder/200/120',
   occupancyRate: 92,
  },
  {
   id: 2,
   name: 'Ocean View Apartment',
   location: 'Casablanca',
   status: 'active',
   price: 85,
   nextEvent: 'Check-out: 11:00 AM',
   image: '/api/placeholder/200/120',
   occupancyRate: 85,
  },
  {
   id: 3,
   name: 'Sunset Villa',
   location: 'Marrakech',
   status: 'maintenance',
   price: 150,
   nextEvent: 'Maintenance: 2:00 PM',
   image: '/api/placeholder/200/120',
   occupancyRate: 0,
  },
 ];

 const propertyList = properties.length > 0 ? properties : defaultProperties;

 const getStatusColor = (status) => {
  switch (status) {
   case 'active':
    return 'green';
   case 'maintenance':
    return 'orange';
   case 'blocked':
    return 'red';
   default:
    return 'default';
  }
 };

 return (
  <Card
   title={
    <Space>
     <HomeOutlined />
     <span>Your Properties</span>
    </Space>
   }
   extra={<Button type="link">View All Properties</Button>}
   bordered={false}
  >
   <Row gutter={[16, 16]}>
    {propertyList.map((property) => (
     <Col xs={24} sm={12} lg={8} key={property.id}>
      <Card
       hoverable
       cover={
        <img
         alt={property.name}
         src={property.image}
         style={{ height: 120, objectFit: 'cover' }}
        />
       }
       size="small"
      >
       <Card.Meta
        title={property.name}
        description={
         <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text type="secondary">{property.location}</Text>
          <div>
           <Tag color={getStatusColor(property.status)}>
            {property.status.toUpperCase()}
           </Tag>
           <Text strong>€{property.price}/night</Text>
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
           {property.nextEvent}
          </Text>
          <div>
           <Text type="secondary">Occupancy: </Text>
           <Text strong>{property.occupancyRate}%</Text>
          </div>
         </Space>
        }
       />
      </Card>
     </Col>
    ))}
   </Row>
  </Card>
 );
};

// Quick Actions Component
const QuickActions = () => {
 const actions = [
  {
   title: 'New Task',
   icon: <ToolOutlined />,
   color: '#1890ff',
   action: () => console.log('Create new task'),
  },
  {
   title: 'Emergency Contact',
   icon: <UserOutlined />,
   color: '#f5222d',
   action: () => console.log('Emergency contact'),
  },
  {
   title: 'Report Issue',
   icon: <BellOutlined />,
   color: '#faad14',
   action: () => console.log('Report issue'),
  },
 ];

 return (
  <Card title="Quick Actions" bordered={false}>
   <Row gutter={[8, 8]}>
    {actions.map((action, index) => (
     <Col span={8} key={index}>
      <Button
       type="dashed"
       block
       icon={action.icon}
       onClick={action.action}
       style={{
        height: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
       }}
      >
       <div style={{ fontSize: '12px', marginTop: '4px' }}>{action.title}</div>
      </Button>
     </Col>
    ))}
   </Row>
  </Card>
 );
};

// Main Concierge Dashboard Component
const ConciergeArea = () => {
 const [loading, setLoading] = useState(false);
 const [dashboardData, setDashboardData] = useState({
  stats: {},
  activities: [],
  schedule: [],
  properties: [],
 });
 const screens = useBreakpoint();

 // Simulate data loading
 useEffect(() => {
  setLoading(true);
  // Simulate API call
  setTimeout(() => {
   setDashboardData({
    stats: {
     activeProperties: 5,
     pendingReservations: 12,
     todayTasks: 3,
     overdueTasks: 1,
    },
    activities: [],
    schedule: [],
    properties: [],
   });
   setLoading(false);
  }, 1000);
 }, []);

 return (
  <Layout className="contentStyle">
   <DashboardHeader />
   <Content className="container" style={{ padding: '24px' }}>
    <div style={{ marginBottom: '24px' }}>
     <Title level={2}>Concierge Dashboard</Title>
     <Text type="secondary">
      Welcome back! Here's what's happening with your properties.
     </Text>
    </div>

    {/* Quick Stats */}
    <div style={{ marginBottom: '24px' }}>
     <QuickStats stats={dashboardData.stats} />
    </div>

    {/* Main Content Grid */}
    <Row gutter={[24, 24]}>
     {/* Left Column */}
     <Col xs={24} lg={16}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
       {/* Recent Activity */}
       <RecentActivity activities={dashboardData.activities} />

       {/* Property Overview */}
       <PropertyOverview properties={dashboardData.properties} />
      </Space>
     </Col>

     {/* Right Column */}
     <Col xs={24} lg={8}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
       {/* Today's Schedule */}
       <TodaySchedule schedule={dashboardData.schedule} />

       {/* Quick Actions */}
       <QuickActions />

       {/* Tips/Alerts */}
       <Card title="Tips & Alerts" bordered={false}>
        <Alert
         message="Reminder"
         description="Don't forget to update the WiFi password for Villa Azure before the next guest arrives."
         type="info"
         showIcon
         style={{ marginBottom: '12px' }}
        />
        <Alert
         message="Weather Alert"
         description="Rain expected today. Consider offering umbrellas to guests."
         type="warning"
         showIcon
        />
       </Card>
      </Space>
     </Col>
    </Row>
   </Content>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default ConciergeArea;
