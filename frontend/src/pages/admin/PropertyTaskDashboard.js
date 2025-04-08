import React, { useState, useEffect } from 'react';
import {
 Layout,
 Result,
 Typography,
 Table,
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
 Spin,
} from 'antd';
import {
 ArrowLeftOutlined,
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
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const PropertyTaskDashboard = () => {
 const location = useLocation();
 const searchParams = new URLSearchParams(location.search);
 const { t } = useTranslation();
 const navigate = useNavigate();
 const propertyId = searchParams.get('id');
 const propertyName = searchParams.get('name');
 const { user } = useAuthContext();

 const [tasks, setTasks] = useState([]);
 const [modalVisible, setModalVisible] = useState(false);
 const [modalType, setModalType] = useState('create');
 const [selectedTask, setSelectedTask] = useState(null);
 const [userId, setUserId] = useState(null);
 const [isLoading, setIsLoading] = useState(true);

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

 const { createTaskUpdateNotification } = useNotification();

 const handleUserData = (userData) => {
  setUserId(userData);
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
  }
 }, [userId, propertyId]);

 const fetchPropertyTasks = async () => {
  if (!propertyId) return;

  try {
   const data = await getPropertyTasks(propertyId);
   setTasks(data || []);
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
  setModalVisible(true);
 };

 const handleEdit = (task) => {
  setModalType('edit');
  setSelectedTask(task);
  form.setFieldsValue({
   ...task,
   dueDate: dayjs(task.dueDate),
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
   const taskData = {
    ...values,
    propertyId: propertyId, // This will be undefined when not in single property view
    dueDate: values.dueDate.format('YYYY-MM-DD'),
    createdBy: userId,
   };

   console.log(taskData);

   let result;

   if (modalType === 'create') {
    if (!propertyId) {
     message.error(t('tasks.error.noPropertySelected'));
     return;
    }
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
     Number(propertyId || selectedTask.propertyId),
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

 const columns = [
  {
   title: t('property.title'),
   dataIndex: ['property', 'name'],
   key: 'property',
   render: (text, record) => record.property?.name || '-',
   sorter: (a, b) => {
    const nameA = a.property?.name || '';
    const nameB = b.property?.name || '';
    return nameA.localeCompare(nameB);
   },
  },
  {
   title: t('tasks.title'),
   dataIndex: 'title',
   key: 'title',
  },
  {
   title: t('tasks.notes'),
   dataIndex: 'notes',
   key: 'notes',
   ellipsis: true,
  },
  {
   title: t('tasks.priority.title'),
   dataIndex: 'priority',
   key: 'priority',
   render: (priority) => {
    let color;
    let label;

    switch (priority) {
     case 'high':
      color = 'red';
      label = t('tasks.priority.high');
      break;
     case 'medium':
      color = 'orange';
      label = t('tasks.priority.medium');
      break;
     case 'low':
      color = 'green';
      label = t('tasks.priority.low');
      break;
     default:
      color = 'gray';
      label = priority;
    }

    return <Tag color={color}>{label}</Tag>;
   },
   filters: [
    { text: t('tasks.priority.high'), value: 'high' },
    { text: t('tasks.priority.medium'), value: 'medium' },
    { text: t('tasks.priority.low'), value: 'low' },
   ],
   onFilter: (value, record) => record.priority === value,
  },
  {
   title: t('tasks.dueDate'),
   dataIndex: 'dueDate',
   key: 'dueDate',
   render: (date) => dayjs(date).format('YYYY-MM-DD'),
   sorter: (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
  },
  {
   title: t('tasks.status.title'),
   dataIndex: 'status',
   key: 'status',
   render: (status, record) => (
    <Select
     value={status}
     onChange={(value) => handleStatusChange(record.id, value)}
     style={{ width: '100%' }}
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
   ),
   filters: [
    { text: t('tasks.status.pending'), value: 'pending' },
    { text: t('tasks.status.inProgress'), value: 'in_progress' },
    { text: t('tasks.status.completed'), value: 'completed' },
   ],
   onFilter: (value, record) => record.status === value,
  },
  {
   title: t('tasks.actions'),
   key: 'action',
   render: (_, record) => (
    <Space size="middle">
     <Button type="link" onClick={() => handleEdit(record)}>
      {t('tasks.edit')}
     </Button>
     <Button type="link" danger onClick={() => handleDelete(record.id)}>
      {t('tasks.delete')}
     </Button>
    </Space>
   ),
  },
 ];

 if (isLoading) {
  return (
   <Layout>
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
    <Foot />
   </Layout>
  );
 }

 return (
  <Layout className="contentStyle">
   <Head onUserData={handleUserData} />
   <Content className="container">
    <Button
     type="text"
     icon={<ArrowLeftOutlined />}
     onClick={() => navigate(-1)}
    >
     {t('button.back')}
    </Button>
    <Title level={2}>
     {propertyId
      ? `${t('tasks.management')} ${propertyName}`
      : t('tasks.allPropertiesManagement')}
    </Title>

    <Row gutter={16} style={{ marginBottom: 24 }}>
     <Col span={6}>
      <Statistic
       title={t('tasks.statistics.totalTasks')}
       value={tasks.length}
      />
     </Col>
     <Col span={6}>
      <Statistic
       title={t('tasks.statistics.completedTasks')}
       value={tasks.filter((t) => t.status === 'completed').length}
      />
     </Col>
     <Col span={6}>
      <Statistic
       title={t('tasks.statistics.activeTasks')}
       value={tasks.filter((t) => t.status !== 'completed').length}
      />
     </Col>
     <Col span={6}>
      <Statistic
       title={t('tasks.statistics.urgentTasks')}
       value={tasks.filter((t) => t.priority === 'high').length}
      />
     </Col>
    </Row>

    {propertyId && (
     <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={handleCreate}
      style={{ marginBottom: 16 }}
     >
      {t('tasks.createTask')}
     </Button>
    )}

    <Table
     columns={
      propertyId ? columns.filter((col) => col.key !== 'property') : columns
     }
     dataSource={tasks}
     rowKey="id"
     loading={taskLoading}
     pagination={{ pageSize: 10 }}
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
       {modalType === 'create' ? t('tasks.createTask') : t('tasks.updateTask')}
      </Button>,
     ]}
    >
     <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
   <Foot />
  </Layout>
 );
};

export default PropertyTaskDashboard;
