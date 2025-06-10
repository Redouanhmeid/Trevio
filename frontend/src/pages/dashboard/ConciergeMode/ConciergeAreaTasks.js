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
 DatePicker,
 List,
 Avatar,
 Progress,
 Grid,
 Empty,
 Modal,
 Form,
 Tabs,
 Divider,
 Tooltip,
 message,
 Dropdown,
 Menu,
 Statistic,
 Timeline,
 Spin,
 Slider,
} from 'antd';
import {
 CalendarOutlined,
 UserOutlined,
 HomeOutlined,
 ToolOutlined,
 CheckCircleOutlined,
 ClockCircleOutlined,
 ExclamationCircleOutlined,
 PlusOutlined,
 EditOutlined,
 DeleteOutlined,
 EyeOutlined,
 SearchOutlined,
 MoreOutlined,
 FilterOutlined,
 CheckOutlined,
 PlayCircleOutlined,
 PauseCircleOutlined,
 AppstoreOutlined,
 BarsOutlined,
} from '@ant-design/icons';
import DashboardHeader from '../../../components/common/DashboardHeader';
import Foot from '../../../components/common/footer';
import { useTask } from '../../../hooks/useTask';
import { useConcierge } from '../../../hooks/useConcierge';

const { Content } = Layout;
const { Title, Text, Paragraph, Descriptions } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

// Task Priority Component
const TaskPriority = ({ priority }) => {
 const priorityConfig = {
  high: { color: 'red', text: 'Urgent', icon: <ExclamationCircleOutlined /> },
  medium: { color: 'orange', text: 'Medium', icon: <ClockCircleOutlined /> },
  low: { color: 'green', text: 'Low', icon: <CheckCircleOutlined /> },
 };

 const config = priorityConfig[priority] || priorityConfig.medium;
 return (
  <Tag color={config.color} icon={config.icon}>
   {config.text}
  </Tag>
 );
};

// Task Status Component
const TaskStatus = ({ status }) => {
 const statusConfig = {
  pending: { color: 'default', text: 'Pending' },
  'in-progress': { color: 'processing', text: 'In Progress' },
  completed: { color: 'success', text: 'Completed' },
  cancelled: { color: 'error', text: 'Cancelled' },
 };

 const config = statusConfig[status] || statusConfig.pending;
 return <Badge status={config.color} text={config.text} />;
};

// Task Category Component
const TaskCategory = ({ category }) => {
 const categoryConfig = {
  maintenance: { color: '#1890ff', icon: <ToolOutlined /> },
  cleaning: { color: '#52c41a', icon: <CheckCircleOutlined /> },
  'guest-service': { color: '#722ed1', icon: <UserOutlined /> },
  security: { color: '#fa541c', icon: <ExclamationCircleOutlined /> },
  other: { color: '#13c2c2', icon: <MoreOutlined /> },
 };

 const config = categoryConfig[category] || categoryConfig.other;
 return (
  <Tag color={config.color} icon={config.icon}>
   {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
  </Tag>
 );
};

// Task Card Component
const TaskCard = ({ task, onAction }) => {
 const getDaysUntil = (date) => {
  const today = new Date();
  const dueDate = new Date(date);
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
 };

 const daysUntilDue = getDaysUntil(task.dueDate);
 const isOverdue = daysUntilDue < 0;
 const isDueToday = daysUntilDue === 0;
 const isDueTomorrow = daysUntilDue === 1;

 const getActionsMenu = () => (
  <Menu
   items={[
    {
     key: 'view',
     icon: <EyeOutlined />,
     label: 'View Details',
     onClick: () => onAction('view', task),
    },
    {
     key: 'edit',
     icon: <EditOutlined />,
     label: 'Edit Task',
     onClick: () => onAction('edit', task),
    },
    {
     key: 'complete',
     icon: <CheckOutlined />,
     label: 'Mark Complete',
     disabled: task.status === 'completed',
     onClick: () => onAction('complete', task),
    },
    { type: 'divider' },
    {
     key: 'delete',
     icon: <DeleteOutlined />,
     label: 'Delete Task',
     danger: true,
     onClick: () => onAction('delete', task),
    },
   ]}
  />
 );

 return (
  <Card
   size="small"
   title={
    <Space>
     <Text strong>{task.title}</Text>
     <TaskPriority priority={task.priority} />
    </Space>
   }
   extra={
    <Space>
     <TaskStatus status={task.status} />
     <Dropdown overlay={getActionsMenu()} trigger={['click']}>
      <Button type="text" icon={<MoreOutlined />} />
     </Dropdown>
    </Space>
   }
   style={{
    borderLeft: `4px solid ${
     task.priority === 'high'
      ? '#ff4d4f'
      : task.priority === 'medium'
      ? '#fa8c16'
      : '#52c41a'
    }`,
   }}
  >
   <Space direction="vertical" size="small" style={{ width: '100%' }}>
    <div>
     <HomeOutlined style={{ marginRight: 8, color: '#1890ff' }} />
     <Text>{task.property.name}</Text>
    </div>

    <div>
     <CalendarOutlined style={{ marginRight: 8, color: '#722ed1' }} />
     <Text type={isOverdue ? 'danger' : isDueToday ? 'warning' : 'secondary'}>
      Due: {task.dueDate}
      {isOverdue && <Text type="danger"> (Overdue)</Text>}
      {isDueToday && <Text type="warning"> (Today)</Text>}
      {isDueTomorrow && <Text type="warning"> (Tomorrow)</Text>}
     </Text>
    </div>

    <TaskCategory category={task.category} />

    {task.assignedTo && (
     <div>
      <UserOutlined style={{ marginRight: 8, color: '#52c41a' }} />
      <Text>Assigned to: {task.assignedTo}</Text>
     </div>
    )}

    {task.description && (
     <Paragraph
      ellipsis={{ rows: 2, expandable: false }}
      style={{ marginBottom: 0 }}
     >
      {task.description}
     </Paragraph>
    )}

    {task.status === 'in-progress' && (
     <Progress percent={task.progress || 0} size="small" />
    )}
   </Space>
  </Card>
 );
};

// Kanban Board Component
const TaskKanban = ({ tasks, onAction }) => {
 const columns = [
  { key: 'pending', title: 'Pending', status: 'pending' },
  { key: 'in-progress', title: 'In Progress', status: 'in-progress' },
  { key: 'completed', title: 'Completed', status: 'completed' },
 ];

 const getTasksByStatus = (status) => {
  return tasks.filter((task) => task.status === status);
 };

 return (
  <Row gutter={[16, 16]}>
   {columns.map((column) => (
    <Col xs={24} md={8} key={column.key}>
     <Card
      title={
       <Space>
        <span>{column.title}</span>
        <Badge count={getTasksByStatus(column.status).length} />
       </Space>
      }
      bordered={false}
      style={{ minHeight: 600 }}
     >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
       {getTasksByStatus(column.status).map((task) => (
        <TaskCard key={task.id} task={task} onAction={onAction} />
       ))}
       {getTasksByStatus(column.status).length === 0 && (
        <Empty
         description={`No ${column.title.toLowerCase()} tasks`}
         style={{ padding: '20px 0' }}
        />
       )}
      </Space>
     </Card>
    </Col>
   ))}
  </Row>
 );
};

// Task List Component
const TaskList = ({ tasks, onAction }) => {
 return (
  <List
   itemLayout="horizontal"
   dataSource={tasks}
   renderItem={(task) => (
    <List.Item
     actions={[
      <Tooltip title="View Details">
       <Button icon={<EyeOutlined />} onClick={() => onAction('view', task)} />
      </Tooltip>,
      <Tooltip title="Edit Task">
       <Button icon={<EditOutlined />} onClick={() => onAction('edit', task)} />
      </Tooltip>,
      task.status !== 'completed' && (
       <Tooltip title="Mark Complete">
        <Button
         icon={<CheckOutlined />}
         onClick={() => onAction('complete', task)}
        />
       </Tooltip>
      ),
     ].filter(Boolean)}
    >
     <List.Item.Meta
      avatar={
       <Avatar
        style={{
         backgroundColor:
          task.priority === 'high'
           ? '#ff4d4f'
           : task.priority === 'medium'
           ? '#fa8c16'
           : '#52c41a',
        }}
        icon={<ToolOutlined />}
       />
      }
      title={
       <Space>
        {task.title}
        <TaskPriority priority={task.priority} />
        <TaskStatus status={task.status} />
       </Space>
      }
      description={
       <Space direction="vertical" size="small">
        <Text type="secondary">
         <HomeOutlined style={{ marginRight: 4 }} />
         {task.property.name}
        </Text>
        <Text type="secondary">
         <CalendarOutlined style={{ marginRight: 4 }} />
         Due: {task.dueDate}
        </Text>
        <TaskCategory category={task.category} />
       </Space>
      }
     />
    </List.Item>
   )}
  />
 );
};

// Task Filters Component
const TaskFilters = ({ onFilter, onSearch, onCreateTask }) => {
 const [filters, setFilters] = useState({
  status: 'all',
  priority: 'all',
  category: 'all',
  property: 'all',
  assignedTo: 'all',
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
      placeholder="Search tasks..."
      allowClear
      enterButton={<SearchOutlined />}
      onSearch={onSearch}
     />
    </Col>
    <Col xs={12} sm={6} md={3}>
     <Select
      style={{ width: '100%' }}
      placeholder="Status"
      value={filters.status}
      onChange={(value) => handleFilterChange('status', value)}
     >
      <Option value="all">All Status</Option>
      <Option value="pending">Pending</Option>
      <Option value="in-progress">In Progress</Option>
      <Option value="completed">Completed</Option>
     </Select>
    </Col>
    <Col xs={12} sm={6} md={3}>
     <Select
      style={{ width: '100%' }}
      placeholder="Priority"
      value={filters.priority}
      onChange={(value) => handleFilterChange('priority', value)}
     >
      <Option value="all">All Priority</Option>
      <Option value="high">Urgent</Option>
      <Option value="medium">Medium</Option>
      <Option value="low">Low</Option>
     </Select>
    </Col>
    <Col xs={12} sm={6} md={3}>
     <Select
      style={{ width: '100%' }}
      placeholder="Category"
      value={filters.category}
      onChange={(value) => handleFilterChange('category', value)}
     >
      <Option value="all">All Categories</Option>
      <Option value="maintenance">Maintenance</Option>
      <Option value="cleaning">Cleaning</Option>
      <Option value="guest-service">Guest Service</Option>
      <Option value="security">Security</Option>
      <Option value="other">Other</Option>
     </Select>
    </Col>
    <Col xs={12} sm={6} md={3}>
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
    <Col xs={12} sm={6} md={3}>
     <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={onCreateTask}
      block
     >
      New Task
     </Button>
    </Col>
   </Row>
  </Card>
 );
};

// Task Details Modal
const TaskDetailsModal = ({ visible, task, onClose, onAction }) => {
 if (!task) return null;

 return (
  <Modal
   title={`Task Details - ${task.title}`}
   open={visible}
   onCancel={onClose}
   footer={[
    <Button
     key="edit"
     icon={<EditOutlined />}
     onClick={() => onAction('edit', task)}
    >
     Edit Task
    </Button>,
    task.status !== 'completed' && (
     <Button
      key="complete"
      type="primary"
      icon={<CheckOutlined />}
      onClick={() => onAction('complete', task)}
     >
      Mark Complete
     </Button>
    ),
    <Button key="close" onClick={onClose}>
     Close
    </Button>,
   ].filter(Boolean)}
   width={700}
  >
   <Row gutter={[24, 24]}>
    <Col xs={24} md={12}>
     <Descriptions title="Task Information" bordered size="small">
      <Descriptions.Item label="Title" span={3}>
       {task.title}
      </Descriptions.Item>
      <Descriptions.Item label="Property" span={3}>
       {task.property.name}
      </Descriptions.Item>
      <Descriptions.Item label="Category" span={3}>
       <TaskCategory category={task.category} />
      </Descriptions.Item>
      <Descriptions.Item label="Priority" span={3}>
       <TaskPriority priority={task.priority} />
      </Descriptions.Item>
     </Descriptions>
    </Col>
    <Col xs={24} md={12}>
     <Descriptions title="Status & Timeline" bordered size="small">
      <Descriptions.Item label="Status" span={3}>
       <TaskStatus status={task.status} />
      </Descriptions.Item>
      <Descriptions.Item label="Created" span={3}>
       {task.createdAt}
      </Descriptions.Item>
      <Descriptions.Item label="Due Date" span={3}>
       {task.dueDate}
      </Descriptions.Item>
      <Descriptions.Item label="Assigned To" span={3}>
       {task.assignedTo || 'Unassigned'}
      </Descriptions.Item>
     </Descriptions>
    </Col>
   </Row>

   {task.description && (
    <>
     <Divider />
     <Title level={4}>Description</Title>
     <Paragraph>{task.description}</Paragraph>
    </>
   )}

   {task.notes && (
    <>
     <Divider />
     <Title level={4}>Notes</Title>
     <Paragraph>{task.notes}</Paragraph>
    </>
   )}

   {task.status === 'in-progress' && (
    <>
     <Divider />
     <Title level={4}>Progress</Title>
     <Progress
      percent={task.progress || 0}
      status={task.progress === 100 ? 'success' : 'active'}
     />
    </>
   )}
  </Modal>
 );
};

// Create/Edit Task Modal
const TaskFormModal = ({ visible, task, properties, onClose, onSave }) => {
 const [form] = Form.useForm();
 const [loading, setLoading] = useState(false);
 const isEdit = !!task;

 useEffect(() => {
  if (visible && task) {
   form.setFieldsValue({
    title: task.title,
    description: task.description,
    priority: task.priority,
    category: task.category,
    propertyId: task.property.id,
    dueDate: task.dueDate,
    assignedTo: task.assignedTo,
    notes: task.notes,
   });
  } else if (visible) {
   form.resetFields();
   // Set default values for new task
   form.setFieldsValue({
    priority: 'medium',
    category: 'maintenance',
    status: 'pending',
   });
  }
 }, [visible, task, form]);

 const handleSave = async (values) => {
  setLoading(true);
  try {
   await onSave(values, task?.id);
   form.resetFields();
   onClose();
  } catch (error) {
   console.error('Error saving task:', error);
   message.error('Failed to save task');
  } finally {
   setLoading(false);
  }
 };

 return (
  <Modal
   title={`${isEdit ? 'Edit' : 'Create'} Task`}
   open={visible}
   onCancel={onClose}
   footer={null}
   width={600}
  >
   <Form form={form} layout="vertical" onFinish={handleSave}>
    <Row gutter={[16, 16]}>
     <Col xs={24}>
      <Form.Item
       name="title"
       label="Task Title"
       rules={[{ required: true, message: 'Please enter task title' }]}
      >
       <Input placeholder="Enter task title" />
      </Form.Item>
     </Col>
     <Col xs={24}>
      <Form.Item name="description" label="Description">
       <TextArea rows={4} placeholder="Enter task description" />
      </Form.Item>
     </Col>
     <Col xs={12}>
      <Form.Item
       name="priority"
       label="Priority"
       rules={[{ required: true, message: 'Please select priority' }]}
      >
       <Select placeholder="Select priority">
        <Option value="low">Low</Option>
        <Option value="medium">Medium</Option>
        <Option value="high">Urgent</Option>
       </Select>
      </Form.Item>
     </Col>
     <Col xs={12}>
      <Form.Item
       name="category"
       label="Category"
       rules={[{ required: true, message: 'Please select category' }]}
      >
       <Select placeholder="Select category">
        <Option value="maintenance">Maintenance</Option>
        <Option value="cleaning">Cleaning</Option>
        <Option value="guest-service">Guest Service</Option>
        <Option value="security">Security</Option>
        <Option value="other">Other</Option>
       </Select>
      </Form.Item>
     </Col>
     <Col xs={12}>
      <Form.Item
       name="propertyId"
       label="Property"
       rules={[{ required: true, message: 'Please select property' }]}
      >
       <Select placeholder="Select property">
        {properties.map((property) => (
         <Option key={property.id} value={property.id}>
          {property.name}
         </Option>
        ))}
       </Select>
      </Form.Item>
     </Col>
     <Col xs={12}>
      <Form.Item
       name="dueDate"
       label="Due Date"
       rules={[{ required: true, message: 'Please select due date' }]}
      >
       <DatePicker style={{ width: '100%' }} />
      </Form.Item>
     </Col>
     <Col xs={24}>
      <Form.Item name="assignedTo" label="Assign To">
       <Select placeholder="Select team member" allowClear>
        <Option value="John Smith">John Smith</Option>
        <Option value="Sarah Johnson">Sarah Johnson</Option>
        <Option value="Mike Wilson">Mike Wilson</Option>
       </Select>
      </Form.Item>
     </Col>
     <Col xs={24}>
      <Form.Item name="notes" label="Notes">
       <TextArea rows={3} placeholder="Add additional notes about this task" />
      </Form.Item>
     </Col>
     {isEdit && (
      <Col xs={24}>
       <Form.Item name="status" label="Status">
        <Select placeholder="Select status">
         <Option value="pending">Pending</Option>
         <Option value="in-progress">In Progress</Option>
         <Option value="completed">Completed</Option>
        </Select>
       </Form.Item>
      </Col>
     )}
     {isEdit && task?.status === 'in-progress' && (
      <Col xs={24}>
       <Form.Item name="progress" label="Progress">
        <Slider
         marks={{
          0: '0%',
          25: '25%',
          50: '50%',
          75: '75%',
          100: '100%',
         }}
         step={5}
         defaultValue={task.progress || 0}
        />
       </Form.Item>
      </Col>
     )}
    </Row>
    <div style={{ textAlign: 'right', marginTop: 24 }}>
     <Space>
      <Button onClick={onClose}>Cancel</Button>
      <Button type="primary" htmlType="submit" loading={loading}>
       {isEdit ? 'Update' : 'Create'} Task
      </Button>
     </Space>
    </div>
   </Form>
  </Modal>
 );
};

// Task Stats Component
const TaskStats = ({ tasks }) => {
 const stats = {
  total: tasks.length,
  pending: tasks.filter((t) => t.status === 'pending').length,
  inProgress: tasks.filter((t) => t.status === 'in-progress').length,
  completed: tasks.filter((t) => t.status === 'completed').length,
  overdue: tasks.filter((t) => {
   const dueDate = new Date(t.dueDate);
   const today = new Date();
   return dueDate < today && t.status !== 'completed';
  }).length,
  highPriority: tasks.filter(
   (t) => t.priority === 'high' && t.status !== 'completed'
  ).length,
 };

 return (
  <Row gutter={[16, 16]}>
   <Col xs={12} sm={8} md={4}>
    <Card bordered={false}>
     <Statistic
      title="Total Tasks"
      value={stats.total}
      prefix={<ToolOutlined />}
      valueStyle={{ color: '#1890ff' }}
     />
    </Card>
   </Col>
   <Col xs={12} sm={8} md={4}>
    <Card bordered={false}>
     <Statistic
      title="Pending"
      value={stats.pending}
      prefix={<ClockCircleOutlined />}
      valueStyle={{ color: '#faad14' }}
     />
    </Card>
   </Col>
   <Col xs={12} sm={8} md={4}>
    <Card bordered={false}>
     <Statistic
      title="In Progress"
      value={stats.inProgress}
      prefix={<PlayCircleOutlined />}
      valueStyle={{ color: '#1890ff' }}
     />
    </Card>
   </Col>
   <Col xs={12} sm={8} md={4}>
    <Card bordered={false}>
     <Statistic
      title="Completed"
      value={stats.completed}
      prefix={<CheckCircleOutlined />}
      valueStyle={{ color: '#52c41a' }}
     />
    </Card>
   </Col>
   <Col xs={12} sm={8} md={4}>
    <Card bordered={false}>
     <Statistic
      title="Overdue"
      value={stats.overdue}
      prefix={<ExclamationCircleOutlined />}
      valueStyle={{ color: '#ff4d4f' }}
     />
    </Card>
   </Col>
   <Col xs={12} sm={8} md={4}>
    <Card bordered={false}>
     <Statistic
      title="Urgent"
      value={stats.highPriority}
      prefix={<ExclamationCircleOutlined />}
      valueStyle={{ color: '#ff4d4f' }}
     />
    </Card>
   </Col>
  </Row>
 );
};

// Today's Tasks Timeline
const TasksTimeline = ({ tasks }) => {
 const today = new Date();
 today.setHours(0, 0, 0, 0);

 // Filter for tasks due today or tomorrow, or overdue
 const upcomingTasks = tasks
  .filter((task) => {
   const dueDate = new Date(task.dueDate);
   dueDate.setHours(0, 0, 0, 0);
   const diffTime = dueDate - today;
   const diffDays = diffTime / (1000 * 60 * 60 * 24);
   return diffDays <= 1 && diffDays >= -7 && task.status !== 'completed';
  })
  .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

 // Get color for timeline item
 const getTimelineColor = (dueDate) => {
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due - today;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return 'red'; // Overdue
  if (diffDays === 0) return 'orange'; // Today
  return 'blue'; // Tomorrow
 };

 return (
  <Card title="Upcoming Tasks" bordered={false}>
   {upcomingTasks.length === 0 ? (
    <Empty description="No upcoming tasks" />
   ) : (
    <Timeline>
     {upcomingTasks.map((task) => {
      const dueDate = new Date(task.dueDate);
      const isToday = dueDate.toDateString() === today.toDateString();
      const isOverdue = dueDate < today;

      return (
       <Timeline.Item key={task.id} color={getTimelineColor(task.dueDate)}>
        <div>
         <Text strong>{task.title}</Text>
         <div>
          <Text type="secondary">{task.property.name}</Text>
         </div>
         <div>
          <TaskPriority priority={task.priority} />
          <span style={{ marginLeft: 8 }}>
           {isOverdue
            ? `Overdue by ${Math.ceil(
               (today - dueDate) / (1000 * 60 * 60 * 24)
              )} days`
            : isToday
            ? 'Due today'
            : `Due ${dueDate.toDateString()}`}
          </span>
         </div>
        </div>
       </Timeline.Item>
      );
     })}
    </Timeline>
   )}
  </Card>
 );
};

// Main Concierge Tasks Component
const ConciergeAreaTasks = () => {
 const [loading, setLoading] = useState(false);
 const [tasks, setTasks] = useState([]);
 const [filteredTasks, setFilteredTasks] = useState([]);
 const [properties, setProperties] = useState([]);
 const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
 const [detailsModal, setDetailsModal] = useState({
  visible: false,
  task: null,
 });
 const [formModal, setFormModal] = useState({
  visible: false,
  task: null,
 });
 const screens = useBreakpoint();

 // Mock data - replace with actual API calls in production
 useEffect(() => {
  setLoading(true);
  // Simulate API call
  setTimeout(() => {
   const mockProperties = [
    { id: 1, name: 'Villa Azure' },
    { id: 2, name: 'Ocean View Apartment' },
    { id: 3, name: 'Sunset Villa' },
   ];

   const mockTasks = [
    {
     id: 1,
     title: 'Fix leaky faucet in bathroom',
     description:
      'Guest reported water dripping from bathroom faucet in Villa Azure',
     priority: 'high',
     category: 'maintenance',
     status: 'pending',
     property: { id: 1, name: 'Villa Azure' },
     assignedTo: 'John Smith',
     dueDate: '2024-03-20',
     createdAt: '2024-03-15',
     progress: 0,
    },
    {
     id: 2,
     title: 'Deep cleaning before guest arrival',
     description:
      'Complete deep cleaning of all rooms before next guest check-in',
     priority: 'medium',
     category: 'cleaning',
     status: 'in-progress',
     property: { id: 2, name: 'Ocean View Apartment' },
     assignedTo: 'Sarah Johnson',
     dueDate: '2024-03-21',
     createdAt: '2024-03-16',
     progress: 60,
    },
    {
     id: 3,
     title: 'Replace broken TV remote',
     description: 'TV remote control is not working, needs replacement',
     priority: 'low',
     category: 'maintenance',
     status: 'completed',
     property: { id: 3, name: 'Sunset Villa' },
     assignedTo: 'Mike Wilson',
     dueDate: '2024-03-18',
     createdAt: '2024-03-14',
     progress: 100,
    },
    {
     id: 4,
     title: 'Install new WiFi router',
     description: 'Upgrade WiFi infrastructure for better connectivity',
     priority: 'medium',
     category: 'maintenance',
     status: 'pending',
     property: { id: 1, name: 'Villa Azure' },
     assignedTo: 'John Smith',
     dueDate: '2024-03-25',
     createdAt: '2024-03-17',
     progress: 0,
    },
    {
     id: 5,
     title: 'Guest welcome preparation',
     description: 'Prepare welcome amenities and check room setup',
     priority: 'high',
     category: 'guest-service',
     status: 'in-progress',
     property: { id: 2, name: 'Ocean View Apartment' },
     assignedTo: 'Sarah Johnson',
     dueDate: '2024-03-19',
     createdAt: '2024-03-18',
     progress: 80,
    },
   ];

   setProperties(mockProperties);
   setTasks(mockTasks);
   setFilteredTasks(mockTasks);
   setLoading(false);
  }, 1000);
 }, []);

 const handleAction = (action, task = null) => {
  console.log(`Action: ${action}`, task);
  switch (action) {
   case 'view':
    setDetailsModal({ visible: true, task });
    break;
   case 'edit':
    setFormModal({ visible: true, task });
    break;
   case 'create':
    setFormModal({ visible: true, task: null });
    break;
   case 'complete':
    // Update task status to completed
    const updatedTasks = tasks.map((t) =>
     t.id === task.id ? { ...t, status: 'completed', progress: 100 } : t
    );
    setTasks(updatedTasks);
    setFilteredTasks(
     filteredTasks.map((t) =>
      t.id === task.id ? { ...t, status: 'completed', progress: 100 } : t
     )
    );
    message.success('Task marked as completed successfully');
    break;
   case 'delete':
    Modal.confirm({
     title: 'Delete Task',
     content: 'Are you sure you want to delete this task?',
     okType: 'danger',
     onOk: () => {
      const updatedTasks = tasks.filter((t) => t.id !== task.id);
      setTasks(updatedTasks);
      setFilteredTasks(filteredTasks.filter((t) => t.id !== task.id));
      message.success('Task deleted successfully');
     },
    });
    break;
   default:
    console.log(`Unknown action: ${action}`);
  }
 };

 const handleFilter = (filters) => {
  let filtered = [...tasks];

  if (filters.status !== 'all') {
   filtered = filtered.filter((t) => t.status === filters.status);
  }
  if (filters.priority !== 'all') {
   filtered = filtered.filter((t) => t.priority === filters.priority);
  }
  if (filters.category !== 'all') {
   filtered = filtered.filter((t) => t.category === filters.category);
  }
  if (filters.property !== 'all') {
   const propertyName = filters.property.replace('-', ' ');
   filtered = filtered.filter((t) =>
    t.property.name.toLowerCase().includes(propertyName.toLowerCase())
   );
  }
  if (filters.assignedTo !== 'all') {
   filtered = filtered.filter((t) => t.assignedTo === filters.assignedTo);
  }

  setFilteredTasks(filtered);
 };

 const handleSearch = (value) => {
  if (!value) {
   setFilteredTasks(tasks);
   return;
  }

  const filtered = tasks.filter(
   (t) =>
    t.title.toLowerCase().includes(value.toLowerCase()) ||
    (t.description &&
     t.description.toLowerCase().includes(value.toLowerCase())) ||
    t.property.name.toLowerCase().includes(value.toLowerCase()) ||
    (t.assignedTo && t.assignedTo.toLowerCase().includes(value.toLowerCase()))
  );
  setFilteredTasks(filtered);
 };

 const handleSaveTask = async (values, taskId = null) => {
  return new Promise((resolve) => {
   setTimeout(() => {
    // Find the property object by ID
    const property = properties.find((p) => p.id === values.propertyId);

    if (taskId) {
     // Update existing task
     const updatedTasks = tasks.map((t) =>
      t.id === taskId
       ? {
          ...t,
          ...values,
          property, // Add property object
         }
       : t
     );
     setTasks(updatedTasks);
     setFilteredTasks(
      filteredTasks.map((t) =>
       t.id === taskId
        ? {
           ...t,
           ...values,
           property, // Add property object
          }
        : t
      )
     );
     message.success('Task updated successfully');
    } else {
     // Create new task
     const newTask = {
      id: Date.now(),
      ...values,
      property, // Add property object
      createdAt: new Date().toISOString().split('T')[0],
      status: values.status || 'pending',
      progress: values.progress || 0,
     };
     const updatedTasks = [...tasks, newTask];
     setTasks(updatedTasks);
     setFilteredTasks([...filteredTasks, newTask]);
     message.success('Task created successfully');
    }
    resolve();
   }, 1000);
  });
 };

 return (
  <Layout className="contentStyle">
   <DashboardHeader />
   <Content className="container" style={{ padding: '24px' }}>
    <div style={{ marginBottom: '24px' }}>
     <Row justify="space-between" align="middle">
      <Col>
       <Title level={2}>Task Management</Title>
       <Text type="secondary">Manage and track tasks for your properties</Text>
      </Col>
      <Col>
       <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => handleAction('create')}
       >
        Create Task
       </Button>
      </Col>
     </Row>
    </div>

    {/* Task Stats */}
    <div style={{ marginBottom: '24px' }}>
     <TaskStats tasks={filteredTasks} />
    </div>

    {/* Filters */}
    <div style={{ marginBottom: '24px' }}>
     <TaskFilters
      onFilter={handleFilter}
      onSearch={handleSearch}
      onCreateTask={() => handleAction('create')}
     />
    </div>

    {/* View Mode Toggle */}
    <div style={{ marginBottom: '16px', textAlign: 'right' }}>
     <Button.Group>
      <Button
       type={viewMode === 'kanban' ? 'primary' : 'default'}
       onClick={() => setViewMode('kanban')}
       icon={<AppstoreOutlined />}
      >
       Kanban View
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

    {/* Tasks Display */}
    <Row gutter={[24, 24]}>
     {screens.lg && (
      <Col xs={24} lg={18}>
       {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
         <Spin size="large" />
        </div>
       ) : filteredTasks.length === 0 ? (
        <Empty description="No tasks found" style={{ padding: '50px' }} />
       ) : viewMode === 'kanban' ? (
        <TaskKanban tasks={filteredTasks} onAction={handleAction} />
       ) : (
        <Card bordered={false}>
         <TaskList tasks={filteredTasks} onAction={handleAction} />
        </Card>
       )}
      </Col>
     )}

     {!screens.lg && (
      <Col xs={24}>
       {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
         <Spin size="large" />
        </div>
       ) : filteredTasks.length === 0 ? (
        <Empty description="No tasks found" style={{ padding: '50px' }} />
       ) : viewMode === 'kanban' ? (
        <TaskKanban tasks={filteredTasks} onAction={handleAction} />
       ) : (
        <Card bordered={false}>
         <TaskList tasks={filteredTasks} onAction={handleAction} />
        </Card>
       )}
      </Col>
     )}

     {screens.lg && (
      <Col xs={24} lg={6}>
       <TasksTimeline tasks={tasks} />
      </Col>
     )}
    </Row>

    {/* Task Details Modal */}
    <TaskDetailsModal
     visible={detailsModal.visible}
     task={detailsModal.task}
     onClose={() => setDetailsModal({ visible: false, task: null })}
     onAction={handleAction}
    />

    {/* Task Form Modal */}
    <TaskFormModal
     visible={formModal.visible}
     task={formModal.task}
     properties={properties}
     onClose={() => setFormModal({ visible: false, task: null })}
     onSave={handleSaveTask}
    />
   </Content>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default ConciergeAreaTasks;
