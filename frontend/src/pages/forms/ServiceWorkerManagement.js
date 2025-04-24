import React, { useState, useEffect } from 'react';
import {
 Table,
 Button,
 Space,
 Modal,
 Form,
 Input,
 Select,
 Switch,
 Tooltip,
 Popconfirm,
 message,
 Typography,
 Tag,
 Card,
 Divider,
} from 'antd';
import {
 PlusOutlined,
 EditOutlined,
 DeleteOutlined,
 PhoneOutlined,
 MailOutlined,
 EyeOutlined,
 EyeInvisibleOutlined,
} from '@ant-design/icons';
import { useTranslation } from '../../context/TranslationContext';
import useServiceWorker from '../../hooks/useServiceWorker';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ServiceWorkerManagement = ({ propertyId, isOwner = false }) => {
 const { t } = useTranslation();
 const {
  loading,
  error,
  serviceWorkers,
  getPropertyServiceWorkers,
  createServiceWorker,
  updateServiceWorker,
  deleteServiceWorker,
 } = useServiceWorker();

 const [isModalVisible, setIsModalVisible] = useState(false);
 const [editingWorker, setEditingWorker] = useState(null);
 const [form] = Form.useForm();
 const [openPopconfirmId, setOpenPopconfirmId] = useState(null);

 // Fetch service workers when component mounts
 useEffect(() => {
  if (propertyId) {
   getPropertyServiceWorkers(propertyId);
  }
 }, [propertyId]);

 // Reset form when modal opens/closes
 useEffect(() => {
  if (!isModalVisible) {
   setEditingWorker(null);
   form.resetFields();
  }
 }, [isModalVisible, form]);

 // Set form values when editing a worker
 useEffect(() => {
  if (editingWorker) {
   form.setFieldsValue(editingWorker);
  }
 }, [editingWorker, form]);

 const showModal = () => {
  setIsModalVisible(true);
 };

 const handleCancel = () => {
  setIsModalVisible(false);
 };

 const handleEdit = (worker) => {
  setEditingWorker(worker);
  showModal();
 };

 const handleOpenChange = (open, workerId) => {
  if (open) {
   setOpenPopconfirmId(workerId);
  } else {
   setOpenPopconfirmId(null);
  }
 };

 const handleDelete = async (id) => {
  try {
   await deleteServiceWorker(id);
   message.success(t('serviceWorker.deleteSuccess'));
   getPropertyServiceWorkers(propertyId);
  } catch (error) {
   message.error(t('serviceWorker.deleteError'));
  }
  setOpenPopconfirmId(null);
 };

 const handleSubmit = async (values) => {
  try {
   if (editingWorker) {
    await updateServiceWorker(editingWorker.id, values);
    message.success(t('serviceWorker.updateSuccess'));
   } else {
    await createServiceWorker({
     ...values,
     propertyId,
    });
    message.success(t('serviceWorker.createSuccess'));
   }
   setIsModalVisible(false);
   getPropertyServiceWorkers(propertyId);
  } catch (error) {
   message.error(
    editingWorker
     ? t('serviceWorker.updateError')
     : t('serviceWorker.createError')
   );
  }
 };

 const columns = [
  {
   title: t('serviceWorker.name'),
   dataIndex: 'name',
   key: 'name',
  },
  {
   title: t('serviceWorker.category'),
   dataIndex: 'category',
   key: 'category',
   render: (category) => (
    <Tag color="blue">{t(`serviceWorker.categories.${category}`)}</Tag>
   ),
   filters: Object.keys(
    t('serviceWorker.categories', { returnObjects: true })
   ).map((key) => ({
    text: t(`serviceWorker.categories.${key}`),
    value: key,
   })),
   onFilter: (value, record) => record.category === value,
  },
  {
   title: t('serviceWorker.phone'),
   dataIndex: 'phone',
   key: 'phone',
   render: (phone) => (
    <a href={`tel:${phone}`}>
     <PhoneOutlined /> {phone}
    </a>
   ),
  },
  {
   title: t('serviceWorker.email'),
   dataIndex: 'email',
   key: 'email',
   render: (email) =>
    email ? (
     <a href={`mailto:${email}`}>
      <MailOutlined /> {email}
     </a>
    ) : (
     '-'
    ),
  },
  {
   title: t('serviceWorker.isVisibleToGuests'),
   dataIndex: 'isVisibleToGuests',
   key: 'isVisibleToGuests',
   render: (isVisible, record) => (
    <Switch
     className="custom-switch-purple"
     checked={isVisible}
     disabled={!isOwner}
     onChange={async (checked) => {
      if (isOwner) {
       try {
        await updateServiceWorker(record.id, {
         ...record,
         isVisibleToGuests: checked,
        });
        message.success(t('serviceWorker.updateSuccess'));
        getPropertyServiceWorkers(propertyId);
       } catch (err) {
        message.error(t('serviceWorker.updateError'));
       }
      }
     }}
    />
   ),
   filters: [
    { text: t('common.yes'), value: true },
    { text: t('common.no'), value: false },
   ],
   onFilter: (value, record) => record.isVisibleToGuests === value,
  },
  {
   title: t('property.actions.actions'),
   key: 'actions',
   render: (_, record) => (
    <Space size="small">
     <Tooltip title={t('common.edit')}>
      <Button
       type="link"
       icon={<EditOutlined />}
       onClick={(e) => {
        e.stopPropagation();
        handleEdit(record);
       }}
      />
     </Tooltip>
     <Popconfirm
      title={t('serviceWorker.confirmDelete')}
      onConfirm={() => handleDelete(record.id)}
      okText={t('common.yes')}
      cancelText={t('common.no')}
      open={openPopconfirmId === record.id}
      onOpenChange={(open) => handleOpenChange(open, record.id)}
      placement="topRight"
     >
      <Tooltip title={t('common.delete')}>
       <Button
        type="link"
        danger
        icon={<DeleteOutlined />}
        onClick={(e) => {
         // Stop event propagation
         e.stopPropagation();
         // Manually set this popconfirm to open if it's not already
         if (openPopconfirmId !== record.id) {
          setOpenPopconfirmId(record.id);
         }
        }}
       />
      </Tooltip>
     </Popconfirm>
    </Space>
   ),
  },
 ];

 // If user doesn't have owner/admin permissions, show limited view
 if (!isOwner) {
  columns.pop(); // Remove actions column
 }

 return (
  <Card>
   <div
    style={{
     marginBottom: 16,
     display: 'flex',
     justifyContent: 'space-between',
    }}
   >
    <Title level={4}>{t('serviceWorker.title')}</Title>
    {isOwner && (
     <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
      {t('serviceWorker.addButton')}
     </Button>
    )}
   </div>
   <Divider />

   <Table
    loading={loading}
    dataSource={serviceWorkers}
    columns={columns}
    rowKey="id"
    pagination={{ pageSize: 10 }}
    locale={{
     emptyText: t('serviceWorker.noServiceWorkersFound'),
    }}
   />

   <Modal
    title={
     editingWorker
      ? t('serviceWorker.editButton')
      : t('serviceWorker.addButton')
    }
    open={isModalVisible}
    onCancel={handleCancel}
    footer={null}
   >
    <Form
     form={form}
     layout="vertical"
     onFinish={handleSubmit}
     initialValues={{ isVisibleToGuests: true }}
    >
     <Form.Item
      name="name"
      label={t('serviceWorker.name')}
      rules={[{ required: true, message: t('validation.required') }]}
     >
      <Input placeholder={t('serviceWorker.name')} />
     </Form.Item>

     <Form.Item
      name="category"
      label={t('serviceWorker.category')}
      rules={[{ required: true, message: t('validation.required') }]}
     >
      <Select placeholder={t('serviceWorker.selectCategory')}>
       {Object.entries(
        t('serviceWorker.categories', { returnObjects: true })
       ).map(([key, value]) => (
        <Option key={key} value={key}>
         {value}
        </Option>
       ))}
      </Select>
     </Form.Item>

     <Form.Item
      name="phone"
      label={t('serviceWorker.phone')}
      rules={[{ required: true, message: t('validation.required') }]}
     >
      <Input placeholder="+212 XXX-XXXXXX" />
     </Form.Item>

     <Form.Item name="email" label={t('serviceWorker.email')}>
      <Input placeholder="email@example.com" />
     </Form.Item>

     <Form.Item name="notes" label={t('serviceWorker.notes')}>
      <TextArea rows={4} />
     </Form.Item>

     <Form.Item
      name="isVisibleToGuests"
      valuePropName="checked"
      label={t('serviceWorker.isVisibleToGuests')}
     >
      <Switch className="custom-switch-purple" />
     </Form.Item>

     <Form.Item>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
       <Button onClick={handleCancel}>{t('common.cancel')}</Button>
       <Button type="primary" htmlType="submit">
        {editingWorker ? t('common.update') : t('common.save')}
       </Button>
      </div>
     </Form.Item>
    </Form>
   </Modal>
  </Card>
 );
};

export default ServiceWorkerManagement;
