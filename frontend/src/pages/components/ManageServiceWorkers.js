import React, { useState, useEffect } from 'react';
import {
 Layout,
 Typography,
 Card,
 Button,
 Space,
 Divider,
 Modal,
 message,
 Table,
 Switch,
 Tag,
 Popconfirm,
 Tooltip,
} from 'antd';
import {
 PlusOutlined,
 EditOutlined,
 DeleteOutlined,
 PhoneOutlined,
 MailOutlined,
 EyeOutlined,
 EyeInvisibleOutlined,
 ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../context/TranslationContext';
import useServiceWorker from '../../hooks/useServiceWorker';
import useProperty from '../../hooks/useProperty';
import Head from '../../components/common/header';
import Foot from '../../components/common/footer';
import ServiceWorkerForm from '../forms/ServiceWorkerForm';
import queryString from 'query-string';

const { Content } = Layout;
const { Title, Text } = Typography;

const ManageServiceWorkers = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const location = useLocation();
 const { hash } = queryString.parse(location.search);

 const { getIdFromHash, fetchProperty, property } = useProperty();
 const {
  loading,
  error,
  serviceWorkers,
  getPropertyServiceWorkers,
  createServiceWorker,
  updateServiceWorker,
  deleteServiceWorker,
 } = useServiceWorker();

 const [propertyId, setPropertyId] = useState(null);
 const [isModalVisible, setIsModalVisible] = useState(false);
 const [editingWorker, setEditingWorker] = useState(null);
 const [isSubmitting, setIsSubmitting] = useState(false);

 // Fetch property ID from hash
 useEffect(() => {
  const fetchData = async () => {
   if (hash) {
    const numericId = await getIdFromHash(hash);
    setPropertyId(numericId);
    await fetchProperty(numericId);
   }
  };
  fetchData();
 }, [hash]);

 // Fetch service workers when propertyId is available
 useEffect(() => {
  if (propertyId) {
   getPropertyServiceWorkers(propertyId);
  }
 }, [propertyId]);

 const showModal = () => {
  setEditingWorker(null);
  setIsModalVisible(true);
 };

 const hideModal = () => {
  setIsModalVisible(false);
  setEditingWorker(null);
 };

 const handleEdit = (worker) => {
  setEditingWorker(worker);
  setIsModalVisible(true);
 };

 const handleDelete = async (id) => {
  try {
   await deleteServiceWorker(id);
   message.success(t('serviceWorker.deleteSuccess'));
   getPropertyServiceWorkers(propertyId);
  } catch (err) {
   message.error(t('serviceWorker.deleteError'));
  }
 };

 const handleSubmit = async (values) => {
  setIsSubmitting(true);
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
   hideModal();
   getPropertyServiceWorkers(propertyId);
  } catch (err) {
   message.error(
    editingWorker
     ? t('serviceWorker.updateError')
     : t('serviceWorker.createError')
   );
  } finally {
   setIsSubmitting(false);
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
     onChange={async (checked) => {
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
       onClick={() => handleEdit(record)}
      />
     </Tooltip>
     <Popconfirm
      title={t('serviceWorker.confirmDelete')}
      onConfirm={() => handleDelete(record.id)}
      okText={t('common.yes')}
      cancelText={t('common.no')}
     >
      <Tooltip title={t('common.delete')}>
       <Button type="link" danger icon={<DeleteOutlined />} />
      </Tooltip>
     </Popconfirm>
    </Space>
   ),
  },
 ];

 return (
  <Layout className="contentStyle">
   <Head />
   <Content className="container">
    <Button
     type="link"
     icon={<ArrowLeftOutlined />}
     onClick={() => navigate(-1)}
    >
     {t('button.back')}
    </Button>

    <Card bordered={false}>
     <div
      style={{
       display: 'flex',
       justifyContent: 'space-between',
       alignItems: 'center',
       marginBottom: 16,
      }}
     >
      <Title level={3}>
       {property?.name ? (
        <>
         {t('serviceWorker.title')} - {property.name}
        </>
       ) : (
        t('serviceWorker.title')
       )}
      </Title>

      <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
       {t('serviceWorker.addButton')}
      </Button>
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
    </Card>

    <Modal
     title={
      editingWorker
       ? t('serviceWorker.editButton')
       : t('serviceWorker.addButton')
     }
     open={isModalVisible}
     onCancel={hideModal}
     footer={null}
     destroyOnClose
    >
     <ServiceWorkerForm
      initialValues={editingWorker || {}}
      onFinish={handleSubmit}
      onCancel={hideModal}
      isSubmitting={isSubmitting}
     />
    </Modal>
   </Content>
   <Foot />
  </Layout>
 );
};

export default ManageServiceWorkers;
