import React, { useState, useEffect } from 'react';
import {
 Spin,
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
 DatePicker,
 List,
 Avatar,
 Progress,
 Timeline,
 Grid,
 Empty,
 Modal,
 Descriptions,
 Divider,
 Tooltip,
 Steps,
 Alert,
} from 'antd';
import {
 CalendarOutlined,
 UserOutlined,
 HomeOutlined,
 PhoneOutlined,
 MailOutlined,
 DollarCircleOutlined,
 FileTextOutlined,
 LockOutlined,
 CheckCircleOutlined,
 ClockCircleOutlined,
 SearchOutlined,
 FilterOutlined,
 EyeOutlined,
 MessageOutlined,
 KeyOutlined,
} from '@ant-design/icons';
import DashboardHeader from '../../../components/common/DashboardHeader';
import Foot from '../../../components/common/footer';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;
const { Step } = Steps;

// Reservation Status Component
const ReservationStatus = ({ status }) => {
 const statusConfig = {
  draft: { color: 'default', text: 'Draft' },
  sent: { color: 'processing', text: 'Sent' },
  signed: { color: 'warning', text: 'Signed' },
  confirmed: { color: 'success', text: 'Confirmed' },
  cancelled: { color: 'error', text: 'Cancelled' },
  'check-in': { color: 'cyan', text: 'Checked In' },
  'check-out': { color: 'purple', text: 'Checked Out' },
 };

 const config = statusConfig[status] || statusConfig.draft;
 return <Badge status={config.color} text={config.text} />;
};

// Reservation Card Component
const ReservationCard = ({ reservation, onAction }) => {
 const getDaysUntil = (date) => {
  const today = new Date();
  const targetDate = new Date(date);
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
 };

 const daysUntilCheckIn = getDaysUntil(reservation.startDate);
 const daysUntilCheckOut = getDaysUntil(reservation.endDate);

 return (
  <Card
   hoverable
   title={
    <Space>
     <Text strong>{reservation.property.name}</Text>
     <ReservationStatus status={reservation.status} />
    </Space>
   }
   extra={
    <Button.Group size="small">
     <Tooltip title="View Details">
      <Button
       icon={<EyeOutlined />}
       onClick={() => onAction('view', reservation)}
      />
     </Tooltip>
     <Tooltip title="Contact Guest">
      <Button
       icon={<MessageOutlined />}
       onClick={() => onAction('contact', reservation)}
      />
     </Tooltip>
     <Tooltip title="Electronic Lock">
      <Button
       icon={<KeyOutlined />}
       onClick={() => onAction('lock', reservation)}
      />
     </Tooltip>
    </Button.Group>
   }
  >
   <Row gutter={[16, 16]}>
    <Col xs={24} sm={12}>
     <Space direction="vertical" size="small">
      <div>
       <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
       <Text strong>{reservation.guestName}</Text>
      </div>
      <div>
       <PhoneOutlined style={{ marginRight: 8, color: '#52c41a' }} />
       <Text>{reservation.guestPhone}</Text>
      </div>
      <div>
       <MailOutlined style={{ marginRight: 8, color: '#faad14' }} />
       <Text>{reservation.guestEmail}</Text>
      </div>
     </Space>
    </Col>
    <Col xs={24} sm={12}>
     <Space direction="vertical" size="small">
      <div>
       <CalendarOutlined style={{ marginRight: 8, color: '#722ed1' }} />
       <Text>{reservation.dates}</Text>
      </div>
      <div>
       <DollarCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
       <Text strong>€{reservation.totalPrice}</Text>
       <Text type="secondary"> ({reservation.nights} nights)</Text>
      </div>
      <div>
       <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
       <Text>Contract: </Text>
       <Tag
        color={reservation.contractStatus === 'signed' ? 'green' : 'orange'}
       >
        {reservation.contractStatus}
       </Tag>
      </div>
     </Space>
    </Col>
   </Row>

   {/* Check-in/Check-out countdown */}
   <Divider />
   <Row gutter={[16, 8]}>
    {daysUntilCheckIn >= 0 && (
     <Col xs={12}>
      <Text type="secondary">Check-in: </Text>
      <Text
       strong
       color={
        daysUntilCheckIn === 0
         ? 'red'
         : daysUntilCheckIn <= 1
         ? 'orange'
         : 'default'
       }
      >
       {daysUntilCheckIn === 0 ? 'Today' : `${daysUntilCheckIn} days`}
      </Text>
     </Col>
    )}
    {daysUntilCheckOut >= 0 && reservation.status === 'check-in' && (
     <Col xs={12}>
      <Text type="secondary">Check-out: </Text>
      <Text
       strong
       color={
        daysUntilCheckOut === 0
         ? 'red'
         : daysUntilCheckOut <= 1
         ? 'orange'
         : 'default'
       }
      >
       {daysUntilCheckOut === 0 ? 'Today' : `${daysUntilCheckOut} days`}
      </Text>
     </Col>
    )}
   </Row>

   {/* Electronic Lock Info */}
   {reservation.electronicLock && (
    <Alert
     message="Electronic Lock Active"
     description={`Access Code: ${reservation.electronicLock.code} (Valid until check-out)`}
     type="info"
     showIcon
     style={{ marginTop: 12 }}
    />
   )}
  </Card>
 );
};

// Reservation Timeline Component
const ReservationTimeline = ({ reservations }) => {
 const today = new Date();
 const upcomingReservations = reservations
  .filter((r) => new Date(r.startDate) >= today)
  .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
  .slice(0, 5);

 return (
  <Card title="Upcoming Timeline" bordered={false}>
   <Timeline mode="left">
    {upcomingReservations.map((reservation) => {
     const startDate = new Date(reservation.startDate);
     const isToday = startDate.toDateString() === today.toDateString();
     const isTomorrow =
      startDate.toDateString() ===
      new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString();

     return (
      <Timeline.Item
       key={reservation.id}
       color={isToday ? 'red' : isTomorrow ? 'orange' : 'blue'}
       label={
        <div>
         <Text strong>{startDate.toLocaleDateString()}</Text>
         <br />
         <Text type="secondary">{startDate.toLocaleTimeString()}</Text>
        </div>
       }
      >
       <Space direction="vertical" size="small">
        <Text strong>{reservation.property.name}</Text>
        <Text>{reservation.guestName}</Text>
        <Tag color="blue">Check-in</Tag>
       </Space>
      </Timeline.Item>
     );
    })}
   </Timeline>
  </Card>
 );
};

// Reservation Filters Component
const ReservationFilters = ({ onFilter, onSearch, onDateRangeChange }) => {
 const [filters, setFilters] = useState({
  status: 'all',
  property: 'all',
  contractStatus: 'all',
 });

 const handleFilterChange = (key, value) => {
  const newFilters = { ...filters, [key]: value };
  setFilters(newFilters);
  onFilter(newFilters);
 };

 return (
  <Card bordered={false}>
   <Row gutter={[16, 16]} align="middle">
    <Col xs={24} sm={12} md={6}>
     <Search
      placeholder="Search by guest name..."
      allowClear
      enterButton={<SearchOutlined />}
      onSearch={onSearch}
     />
    </Col>
    <Col xs={12} sm={6} md={4}>
     <Select
      style={{ width: '100%' }}
      placeholder="Status"
      value={filters.status}
      onChange={(value) => handleFilterChange('status', value)}
     >
      <Option value="all">All Status</Option>
      <Option value="confirmed">Confirmed</Option>
      <Option value="check-in">Checked In</Option>
      <Option value="check-out">Checked Out</Option>
      <Option value="cancelled">Cancelled</Option>
     </Select>
    </Col>
    <Col xs={12} sm={6} md={4}>
     <Select
      style={{ width: '100%' }}
      placeholder="Property"
      value={filters.property}
      onChange={(value) => handleFilterChange('property', value)}
     >
      <Option value="all">All Properties</Option>
      <Option value="villa-azure">Villa Azure</Option>
      <Option value="ocean-view">Ocean View</Option>
      <Option value="sunset-villa">Sunset Villa</Option>
     </Select>
    </Col>
    <Col xs={12} sm={6} md={4}>
     <Select
      style={{ width: '100%' }}
      placeholder="Contract"
      value={filters.contractStatus}
      onChange={(value) => handleFilterChange('contractStatus', value)}
     >
      <Option value="all">All Contracts</Option>
      <Option value="signed">Signed</Option>
      <Option value="pending">Pending</Option>
      <Option value="draft">Draft</Option>
     </Select>
    </Col>
    <Col xs={24} sm={12} md={6}>
     <RangePicker
      style={{ width: '100%' }}
      placeholder={['Check-in', 'Check-out']}
      onChange={onDateRangeChange}
     />
    </Col>
   </Row>
  </Card>
 );
};

// Reservation Details Modal
const ReservationDetailsModal = ({
 visible,
 reservation,
 onClose,
 onAction,
}) => {
 if (!reservation) return null;

 const contractSteps = [
  { title: 'Created', status: 'finish' },
  {
   title: 'Sent',
   status: reservation.contractStatus === 'draft' ? 'wait' : 'finish',
  },
  {
   title: 'Signed',
   status: reservation.contractStatus === 'signed' ? 'finish' : 'wait',
  },
  {
   title: 'Confirmed',
   status: reservation.status === 'confirmed' ? 'finish' : 'wait',
  },
 ];

 return (
  <Modal
   title={`Reservation Details - ${reservation.property.name}`}
   open={visible}
   onCancel={onClose}
   footer={[
    <Button
     key="contact"
     icon={<MessageOutlined />}
     onClick={() => onAction('contact', reservation)}
    >
     Contact Guest
    </Button>,
    <Button
     key="lock"
     icon={<KeyOutlined />}
     onClick={() => onAction('lock', reservation)}
    >
     Manage Lock
    </Button>,
    <Button key="close" onClick={onClose}>
     Close
    </Button>,
   ]}
   width={800}
  >
   <Row gutter={[24, 24]}>
    <Col xs={24} md={12}>
     <Descriptions title="Guest Information" bordered size="small">
      <Descriptions.Item label="Name" span={3}>
       {reservation.guestName}
      </Descriptions.Item>
      <Descriptions.Item label="Email" span={3}>
       {reservation.guestEmail}
      </Descriptions.Item>
      <Descriptions.Item label="Phone" span={3}>
       {reservation.guestPhone}
      </Descriptions.Item>
      <Descriptions.Item label="Nationality" span={3}>
       {reservation.guestNationality || 'Not specified'}
      </Descriptions.Item>
     </Descriptions>
    </Col>
    <Col xs={24} md={12}>
     <Descriptions title="Reservation Details" bordered size="small">
      <Descriptions.Item label="Property" span={3}>
       {reservation.property.name}
      </Descriptions.Item>
      <Descriptions.Item label="Dates" span={3}>
       {reservation.dates}
      </Descriptions.Item>
      <Descriptions.Item label="Duration" span={3}>
       {reservation.nights} nights
      </Descriptions.Item>
      <Descriptions.Item label="Total Price" span={3}>
       €{reservation.totalPrice}
      </Descriptions.Item>
      <Descriptions.Item label="Source" span={3}>
       <Tag color="blue">{reservation.source}</Tag>
      </Descriptions.Item>
     </Descriptions>
    </Col>
   </Row>

   <Divider />

   <Title level={4}>Contract Progress</Title>
   <Steps
    current={contractSteps.findIndex((step) => step.status === 'wait')}
    items={contractSteps}
   />

   {reservation.electronicLock && (
    <>
     <Divider />
     <Alert
      message="Electronic Lock Information"
      description={
       <Space direction="vertical">
        <Text>
         Access Code: <Text code>{reservation.electronicLock.code}</Text>
        </Text>
        <Text>Valid From: {reservation.startDate}</Text>
        <Text>Valid Until: {reservation.endDate}</Text>
        <Text type="secondary">
         Guest will receive this code automatically upon contract confirmation.
        </Text>
       </Space>
      }
      type="info"
      showIcon
     />
    </>
   )}
  </Modal>
 );
};

// Reservation Stats Component
const ReservationStats = ({ reservations }) => {
 const today = new Date();
 const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

 const stats = {
  total: reservations.length,
  confirmed: reservations.filter((r) => r.status === 'confirmed').length,
  checkingInToday: reservations.filter(
   (r) => new Date(r.startDate).toDateString() === today.toDateString()
  ).length,
  checkingOutToday: reservations.filter(
   (r) => new Date(r.endDate).toDateString() === today.toDateString()
  ).length,
  thisMonth: reservations.filter((r) => new Date(r.startDate) >= thisMonth)
   .length,
 };

 return (
  <Row gutter={[16, 16]}>
   <Col xs={12} sm={12} md={6}>
    <Card bordered={false}>
     <div style={{ textAlign: 'center' }}>
      <Text type="secondary">Total Reservations</Text>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
       {stats.total}
      </div>
     </div>
    </Card>
   </Col>
   <Col xs={12} sm={12} md={6}>
    <Card bordered={false}>
     <div style={{ textAlign: 'center' }}>
      <Text type="secondary">Confirmed</Text>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
       {stats.confirmed}
      </div>
     </div>
    </Card>
   </Col>
   <Col xs={12} sm={12} md={6}>
    <Card bordered={false}>
     <div style={{ textAlign: 'center' }}>
      <Text type="secondary">Check-ins Today</Text>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
       {stats.checkingInToday}
      </div>
     </div>
    </Card>
   </Col>
   <Col xs={12} sm={12} md={6}>
    <Card bordered={false}>
     <div style={{ textAlign: 'center' }}>
      <Text type="secondary">Check-outs Today</Text>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
       {stats.checkingOutToday}
      </div>
     </div>
    </Card>
   </Col>
  </Row>
 );
};

const ConciergeAreaReservations = () => {
 const [loading, setLoading] = useState(false);
 const [reservations, setReservations] = useState([]);
 const [filteredReservations, setFilteredReservations] = useState([]);
 const [detailsModal, setDetailsModal] = useState({
  visible: false,
  reservation: null,
 });
 const screens = useBreakpoint();

 // Mock data - replace with actual API calls
 useEffect(() => {
  setLoading(true);
  // Simulate API call
  setTimeout(() => {
   const mockReservations = [
    {
     id: 1,
     guestName: 'John Smith',
     guestEmail: 'john.smith@email.com',
     guestPhone: '+1-555-123-4567',
     guestNationality: 'American',
     property: { id: 1, name: 'Villa Azure' },
     startDate: '2024-03-15',
     endDate: '2024-03-22',
     dates: 'Mar 15-22, 2024',
     nights: 7,
     totalPrice: 840,
     status: 'confirmed',
     contractStatus: 'signed',
     source: 'Direct',
     electronicLock: { code: '123456' },
    },
    {
     id: 2,
     guestName: 'Sarah Johnson',
     guestEmail: 'sarah.j@email.com',
     guestPhone: '+44-20-7123-4567',
     guestNationality: 'British',
     property: { id: 2, name: 'Ocean View Apartment' },
     startDate: '2024-03-18',
     endDate: '2024-03-25',
     dates: 'Mar 18-25, 2024',
     nights: 7,
     totalPrice: 595,
     status: 'check-in',
     contractStatus: 'signed',
     source: 'Airbnb',
     electronicLock: { code: '789012' },
    },
    {
     id: 3,
     guestName: 'Marie Dubois',
     guestEmail: 'marie.dubois@email.com',
     guestPhone: '+33-1-42-12-34-56',
     guestNationality: 'French',
     property: { id: 3, name: 'Sunset Villa' },
     startDate: '2024-03-20',
     endDate: '2024-03-27',
     dates: 'Mar 20-27, 2024',
     nights: 7,
     totalPrice: 1050,
     status: 'sent',
     contractStatus: 'pending',
     source: 'Booking.com',
    },
   ];
   setReservations(mockReservations);
   setFilteredReservations(mockReservations);
   setLoading(false);
  }, 1000);
 }, []);

 const handleAction = (action, reservation) => {
  console.log(`Action: ${action}`, reservation);
  switch (action) {
   case 'view':
    setDetailsModal({ visible: true, reservation });
    break;
   case 'contact':
    // Implement contact functionality
    Modal.info({
     title: 'Contact Guest',
     content: `Opening contact options for ${reservation.guestName}`,
    });
    break;
   case 'lock':
    // Implement electronic lock management
    Modal.info({
     title: 'Electronic Lock Management',
     content: `Managing lock for ${reservation.property.name}`,
    });
    break;
   default:
    console.log(`Executing ${action} for reservation:`, reservation);
  }
 };

 const handleFilter = (filters) => {
  let filtered = [...reservations];

  if (filters.status !== 'all') {
   filtered = filtered.filter((r) => r.status === filters.status);
  }
  if (filters.property !== 'all') {
   filtered = filtered.filter(
    (r) =>
     r.property.name.toLowerCase().replace(/\s+/g, '-') === filters.property
   );
  }
  if (filters.contractStatus !== 'all') {
   filtered = filtered.filter(
    (r) => r.contractStatus === filters.contractStatus
   );
  }

  setFilteredReservations(filtered);
 };

 const handleSearch = (value) => {
  const filtered = reservations.filter(
   (r) =>
    r.guestName.toLowerCase().includes(value.toLowerCase()) ||
    r.guestEmail.toLowerCase().includes(value.toLowerCase()) ||
    r.property.name.toLowerCase().includes(value.toLowerCase())
  );
  setFilteredReservations(filtered);
 };

 const handleDateRangeChange = (dates) => {
  if (dates && dates.length === 2) {
   const [start, end] = dates;
   const filtered = reservations.filter((r) => {
    const reservationStart = new Date(r.startDate);
    const reservationEnd = new Date(r.endDate);
    return (
     (reservationStart >= start && reservationStart <= end) ||
     (reservationEnd >= start && reservationEnd <= end) ||
     (reservationStart <= start && reservationEnd >= end)
    );
   });
   setFilteredReservations(filtered);
  } else {
   setFilteredReservations(reservations);
  }
 };

 return (
  <Layout className="contentStyle">
   <DashboardHeader />
   <Content className="container" style={{ padding: '24px' }}>
    <div style={{ marginBottom: '24px' }}>
     <Title level={2}>Reservations</Title>
     <Text type="secondary">Manage guest reservations and check-ins</Text>
    </div>

    {/* Reservation Stats */}
    <div style={{ marginBottom: '24px' }}>
     <ReservationStats reservations={filteredReservations} />
    </div>

    {/* Filters */}
    <div style={{ marginBottom: '24px' }}>
     <ReservationFilters
      onFilter={handleFilter}
      onSearch={handleSearch}
      onDateRangeChange={handleDateRangeChange}
     />
    </div>

    <Row gutter={[24, 24]}>
     {/* Reservations List */}
     <Col xs={24} lg={16}>
      {loading ? (
       <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
       </div>
      ) : filteredReservations.length === 0 ? (
       <Empty description="No reservations found" style={{ padding: '50px' }} />
      ) : (
       <Row gutter={[16, 16]}>
        {filteredReservations.map((reservation) => (
         <Col xs={24} xl={12} key={reservation.id}>
          <ReservationCard reservation={reservation} onAction={handleAction} />
         </Col>
        ))}
       </Row>
      )}
     </Col>

     {/* Timeline Sidebar */}
     <Col xs={24} lg={8}>
      <ReservationTimeline reservations={reservations} />
     </Col>
    </Row>

    {/* Reservation Details Modal */}
    <ReservationDetailsModal
     visible={detailsModal.visible}
     reservation={detailsModal.reservation}
     onClose={() => setDetailsModal({ visible: false, reservation: null })}
     onAction={handleAction}
    />
   </Content>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default ConciergeAreaReservations;
