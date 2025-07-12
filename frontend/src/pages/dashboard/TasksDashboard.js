import React, { useState, useEffect } from 'react';
import {
 Layout,
 Typography,
 Flex,
 List,
 Tag,
 Button,
 Modal,
 Form,
 Input,
 DatePicker,
 Select,
 Space,
 Row,
 Col,
 Statistic,
 message,
 Grid,
 Spin,
 Card,
 Badge,
} from 'antd';
import {
 PlusOutlined,
 CheckCircleOutlined,
 ClockCircleOutlined,
 SyncOutlined,
 ExclamationCircleOutlined,
} from '@ant-design/icons';
import Head from '../../components/common/header';
import Foot from '../../components/common/footer';
import useTask from '../../hooks/useTask';
import useNotification from '../../hooks/useNotification';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../context/TranslationContext';
import { useAuthContext } from '../../hooks/useAuthContext';
import useProperty from '../../hooks/useProperty';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const TasksDashboard = () => {
 const location = useLocation();
 const searchParams = new URLSearchParams(location.search);
 const { t } = useTranslation();
 const navigate = useNavigate();
 const propertyId = searchParams.get('id');
 const propertyName = searchParams.get('name');
 const { user } = useAuthContext();
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();

 const [tasks, setTasks] = useState([]);
 const [filteredTasks, setFilteredTasks] = useState([]);
 const [modalVisible, setModalVisible] = useState(false);
 const [modalType, setModalType] = useState('create');
 const [selectedTask, setSelectedTask] = useState(null);
 const [userId, setUserId] = useState(null);
 const [isLoading, setIsLoading] = useState(true);
 const [properties, setProperties] = useState([]);
 const [selectedPropertyId, setSelectedPropertyId] = useState(
  propertyId || null
 );
 const [filter, setFilter] = useState('all');

 const [form] = Form.useForm();

 const {
  loading: taskLoading,
  error,
  getPropertyTasks,
  getUserPropertyTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
 } = useTask();
 const { fetchPropertiesbyClient, loading: propertyLoading } = useProperty();

 const { createTaskUpdateNotification } = useNotification();

 const handleUserData = (userData) => {
  setUserId(userData);
 };

 // Fetch user properties
 const fetchUserProperties = async () => {
  try {
   const ownedProperties = await fetchPropertiesbyClient(userId);
   const ownedPropertyDetails = (ownedProperties || []).map((property) => ({
    ...property,
    propertyType: 'owned',
   }));

   setProperties(ownedPropertyDetails);

   if (!propertyId && ownedPropertyDetails.length > 0 && !selectedPropertyId) {
    setSelectedPropertyId(ownedPropertyDetails[0].id.toString());
   }
  } catch (error) {
   console.error('Error fetching properties:', error);
   setProperties([]);
  }
 };

 useEffect(() => {
  if (userId) {
   if (propertyId) {
    // If propertyId is provided, fetch tasks for that specific property
    fetchPropertyTasks();
   } else {
    // Otherwise, fetch all tasks for properties owned or managed by the user
    fetchAllUserPropertyTasks();
   }
   // Fetch properties for dropdown selector
   fetchUserProperties();
  }
 }, [userId, propertyId]);

 useEffect(() => {
  if (tasks.length > 0) {
   filterTasks();
  }
 }, [filter, tasks]);

 const filterTasks = () => {
  if (filter === 'all') {
   setFilteredTasks(tasks);
  } else if (filter === 'pending') {
   setFilteredTasks(tasks.filter((task) => task.status === 'pending'));
  } else if (filter === 'in_progress') {
   setFilteredTasks(tasks.filter((task) => task.status === 'in_progress'));
  } else if (filter === 'completed') {
   setFilteredTasks(tasks.filter((task) => task.status === 'completed'));
  } else if (filter === 'high') {
   setFilteredTasks(tasks.filter((task) => task.priority === 'high'));
  } else if (filter === 'medium') {
   setFilteredTasks(tasks.filter((task) => task.priority === 'medium'));
  } else if (filter === 'low') {
   setFilteredTasks(tasks.filter((task) => task.priority === 'low'));
  }
 };

 const fetchPropertyTasks = async () => {
  if (!propertyId) return;

  try {
   const data = await getPropertyTasks(propertyId);
   setTasks(data || []);
   setFilteredTasks(data || []);
   setIsLoading(false);
  } catch (err) {
   console.error('Error fetching tasks:', err);
   message.error(t('tasks.fetchError'));
   setIsLoading(false);
  }
 };

 const fetchAllUserPropertyTasks = async () => {
  if (!userId) return;

  try {
   const data = await getUserPropertyTasks(userId);
   setTasks(data || []);
   setFilteredTasks(data || []);
   setIsLoading(false);
  } catch (err) {
   console.error('Error fetching all property tasks:', err);
   message.error(t('tasks.fetchError'));
   setIsLoading(false);
  }
 };

 const handleCreate = () => {
  setModalType('create');
  setSelectedTask(null);
  form.resetFields();
  if (propertyId) {
   form.setFieldsValue({
    propertyId: parseInt(propertyId),
   });
  } else if (selectedPropertyId) {
   form.setFieldsValue({
    propertyId: parseInt(selectedPropertyId),
   });
  }
  setModalVisible(true);
 };

 const handleEdit = (task) => {
  setModalType('edit');
  setSelectedTask(task);
  form.setFieldsValue({
   ...task,
   dueDate: dayjs(task.dueDate),
   propertyId: task.propertyId,
  });
  setModalVisible(true);
 };

 const handleDelete = (id) => {
  Modal.confirm({
   title: t('tasks.confirmDelete.title'),
   icon: <ExclamationCircleOutlined />,
   content: t('tasks.confirmDelete.content'),
   okText: t('tasks.confirmDelete.ok'),
   okType: 'danger',
   cancelText: t('tasks.confirmDelete.cancel'),
   onOk: async () => {
    try {
     await deleteTask(id);
     message.success(t('tasks.deleteSuccess'));
     if (propertyId) {
      fetchPropertyTasks();
     } else {
      fetchAllUserPropertyTasks();
     }
    } catch (err) {
     message.error(t('tasks.deleteError'));
    }
   },
  });
 };

 const handleStatusChange = async (id, status) => {
  try {
   await updateTaskStatus(id, status);
   message.success(t('tasks.message.statusUpdateSuccess'));
   if (propertyId) {
    fetchPropertyTasks();
   } else {
    fetchAllUserPropertyTasks();
   }
  } catch (err) {
   message.error(t('tasks.message.statusUpdateError'));
  }
 };

 const handleSubmit = async (values) => {
  try {
   // Use the selected property ID from form if available, otherwise fallback to the URL propertyId
   const taskPropertyId = values.propertyId || propertyId;

   if (!taskPropertyId) {
    message.error(t('tasks.error.noPropertySelected'));
    return;
   }

   const taskData = {
    ...values,
    propertyId: taskPropertyId,
    dueDate: values.dueDate.format('YYYY-MM-DD'),
    createdBy: userId,
   };

   let result;

   if (modalType === 'create') {
    result = await createTask(taskData);
    message.success(t('tasks.createSuccess'));
   } else {
    result = await updateTask(selectedTask.id, taskData);
    message.success(t('tasks.updateSuccess'));
   }

   if (result) {
    // Send notification for task updates
    await createTaskUpdateNotification(
     Number(userId),
     Number(taskPropertyId),
     values.title,
     values.priority
    );
   }

   setModalVisible(false);
   if (propertyId) {
    fetchPropertyTasks();
   } else {
    fetchAllUserPropertyTasks();
   }
  } catch (err) {
   console.error('Error submitting task:', err);
   message.error(
    modalType === 'create' ? t('tasks.createError') : t('tasks.updateError')
   );
  }
 };

 const getPriorityLabel = (priority) => {
  switch (priority) {
   case 'high':
    return t('tasks.priority.high');
   case 'medium':
    return t('tasks.priority.medium');
   case 'low':
    return t('tasks.priority.low');
   default:
    return priority;
  }
 };

 const getPriorityColor = (priority) => {
  switch (priority) {
   case 'high':
    return '#F04438';
   case 'medium':
    return '#F79009';
   case 'low':
    return '#17B26A';
   default:
    return 'gray';
  }
 };

 const getStatusTag = (status) => {
  let icon, text, color;

  switch (status) {
   case 'pending':
    icon = <ClockCircleOutlined />;
    text = t('tasks.status.pending');
    color = '#A8ADC6';
    break;
   case 'in_progress':
    icon = <SyncOutlined spin />;
    text = t('tasks.status.inProgress');
    color = '#9DE3F2';
    break;
   case 'completed':
    icon = <CheckCircleOutlined />;
    text = t('tasks.status.completed');
    color = '#17B26A';
    break;
   default:
    icon = <ClockCircleOutlined />;
    text = status;
    color = '#A8ADC6';
  }

  return (
   <Tag
    color={color}
    style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.8 }}
   >
    {icon} {text}
   </Tag>
  );
 };

 if (isLoading) {
  return (
   <Layout className="contentStyle">
    <Head onUserData={handleUserData} />
    <Content className="container">
     <div
      style={{
       display: 'flex',
       justifyContent: 'center',
       alignItems: 'center',
       height: '50vh',
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
      {propertyId
       ? `${t('tasks.management')} ${propertyName}`
       : t('tasks.title')}
     </Title>

     {screens.xs ? (
      <Button
       type="text"
       icon={<i className="PrimaryColor fa-regular fa-circle-plus fa-2xl" />}
       onClick={handleCreate}
      />
     ) : (
      <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
       {t('tasks.createTask')}
      </Button>
     )}
    </Flex>

    {/* Filter buttons */}
    <Space
     wrap
     className="horizontal-scroll-container"
     style={{ marginBottom: '16px' }}
    >
     <Button
      type={filter === 'all' ? 'primary' : 'default'}
      size={screens.xs ? 'small' : 'medium'}
      onClick={() => setFilter('all')}
     >
      {t('common.all')}
     </Button>
     <Button
      type={filter === 'pending' ? 'primary' : 'default'}
      size={screens.xs ? 'small' : 'medium'}
      onClick={() => setFilter('pending')}
     >
      {t('tasks.status.pending')}
     </Button>
     <Button
      type={filter === 'in_progress' ? 'primary' : 'default'}
      size={screens.xs ? 'small' : 'medium'}
      onClick={() => setFilter('in_progress')}
     >
      {t('tasks.status.inProgress')}
     </Button>
     <Button
      type={filter === 'completed' ? 'primary' : 'default'}
      size={screens.xs ? 'small' : 'medium'}
      onClick={() => setFilter('completed')}
     >
      {t('tasks.status.completed')}
     </Button>
     <Button
      type={filter === 'high' ? 'primary' : 'default'}
      size={screens.xs ? 'small' : 'medium'}
      onClick={() => setFilter('high')}
      danger
     >
      {t('tasks.priority.high')}
     </Button>
     <Button
      type={filter === 'medium' ? 'primary' : 'default'}
      size={screens.xs ? 'small' : 'medium'}
      onClick={() => setFilter('medium')}
      style={
       filter === 'medium' ? {} : { color: '#F79009', borderColor: '#F79009' }
      }
     >
      {t('tasks.priority.medium')}
     </Button>
     <Button
      type={filter === 'low' ? 'primary' : 'default'}
      size={screens.xs ? 'small' : 'medium'}
      onClick={() => setFilter('low')}
      style={
       filter === 'low' ? {} : { color: '#17B26A', borderColor: '#17B26A' }
      }
     >
      {t('tasks.priority.low')}
     </Button>
    </Space>

    <List
     loading={taskLoading}
     itemLayout="horizontal"
     dataSource={filteredTasks}
     locale={{ emptyText: t('tasks.emptyText') }}
     renderItem={(task) => {
      const priorityColor = getPriorityColor(task.priority);
      const priorityLabel = getPriorityLabel(task.priority);

      return (
       <div style={{ marginBottom: 16 }}>
        <Card
         className="task-card"
         styles={{ body: { padding: '8px 0' } }}
         bordered={false}
         style={{
          borderRadius: 0,
          borderBottom: '1px solid #D6D6D6',
         }}
        >
         <Flex align="center" style={{ width: '100%' }}>
          <div style={{ width: '100%' }}>
           <Flex justify="start" align="center" gap="large">
            <Text strong style={{ fontSize: 14, color: priorityColor }}>
             {priorityLabel}
             <Badge color={priorityColor} style={{ marginLeft: 6 }} />
            </Text>
            <Text strong style={{ fontSize: 11 }}>
             {!propertyId && task.property
              ? `${
                 screens.xs && task.property.name.length > 25
                  ? task.property.name.substring(0, 25) + '...'
                  : task.property.name
                }`
              : ''}
            </Text>
           </Flex>
           <Flex
            justify="space-between"
            align="center"
            style={{ marginTop: 8, marginBottom: 8 }}
           >
            <span>
             <Text strong>{task.title}</Text>
             <Text type="secondary">{task.notes && ` | ${task.notes}`}</Text>
            </span>
            <Flex align="center">
             <Button
              type="text"
              onClick={() => handleEdit(task)}
              icon={<i className="PrimaryColor fa-regular fa-pen-to-square" />}
             />
            </Flex>
           </Flex>
           <Flex justify="space-between" align="center">
            <Tag color="#6D5FFA">
             <i className="fa-light fa-calendar fa-lg" color="#fff" />
             <Text type="secondary" style={{ color: '#fff', marginLeft: 4 }}>
              {dayjs(task.dueDate).format('DD-MM-YYYY')}
             </Text>
            </Tag>

            <Space>
             <Select
              value={task.status}
              onChange={(value) => handleStatusChange(task.id, value)}
              style={{ width: 140 }}
              popupMatchSelectWidth={false}
             >
              <Option value="pending">
               <ClockCircleOutlined /> {t('tasks.status.pending')}
              </Option>
              <Option value="in_progress">
               <SyncOutlined spin /> {t('tasks.status.inProgress')}
              </Option>
              <Option value="completed">
               <CheckCircleOutlined /> {t('tasks.status.completed')}
              </Option>
             </Select>
            </Space>
           </Flex>
          </div>
         </Flex>
        </Card>
       </div>
      );
     }}
    />

    <Modal
     title={
      modalType === 'create' ? t('tasks.createTask') : t('tasks.editTask')
     }
     open={modalVisible}
     onCancel={() => setModalVisible(false)}
     footer={[
      <Button key="cancel" onClick={() => setModalVisible(false)}>
       {t('common.cancel')}
      </Button>,
      <Button key="submit" type="primary" onClick={() => form.submit()}>
       {modalType === 'create' ? t('tasks.createTask') : t('tasks.edit')}
      </Button>,
     ]}
    >
     <Form form={form} layout="vertical" onFinish={handleSubmit}>
      {/* Property selection dropdown (only shown when no propertyId in URL) */}
      {!propertyId && (
       <Form.Item
        name="propertyId"
        label={t('property.title')}
        rules={[
         { required: true, message: t('reservation.create.propertyRequired') },
        ]}
       >
        <Select
         placeholder={t('tasks.selectProperty')}
         onChange={(value) => setSelectedPropertyId(value)}
         loading={propertyLoading}
        >
         {properties.map((property) => (
          <Option key={property.id} value={property.id}>
           {property.name}
          </Option>
         ))}
        </Select>
       </Form.Item>
      )}
      <Form.Item
       name="title"
       label={t('tasks.title')}
       rules={[
        { required: true, message: t('tasks.validation.titleRequired') },
       ]}
      >
       <Input />
      </Form.Item>
      <Form.Item
       name="priority"
       label={t('tasks.priority.title')}
       rules={[
        { required: true, message: t('tasks.validation.priorityRequired') },
       ]}
      >
       <Select>
        <Option value="high">{t('tasks.priority.high')}</Option>
        <Option value="medium">{t('tasks.priority.medium')}</Option>
        <Option value="low">{t('tasks.priority.low')}</Option>
       </Select>
      </Form.Item>
      <Form.Item
       name="dueDate"
       label={t('tasks.dueDate')}
       rules={[
        { required: true, message: t('tasks.validation.dueDateRequired') },
       ]}
      >
       <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="notes" label={t('tasks.notes')}>
       <TextArea rows={4} />
      </Form.Item>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
     </Form>
    </Modal>
   </Content>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default TasksDashboard;
