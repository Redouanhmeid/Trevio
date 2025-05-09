import React, { useState, useEffect, useMemo } from 'react';
import {
 Layout,
 Card,
 Row,
 Col,
 Statistic,
 Table,
 Image,
 Space,
 Popconfirm,
 Tag,
 Button,
 Spin,
 Empty,
 message,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from '../../context/TranslationContext';
import { useAuthContext } from '../../hooks/useAuthContext';
import useProperty from '../../hooks/useProperty';
import { useNavigate } from 'react-router-dom';
import useManager from '../../hooks/useManager';
import Head from '../../components/common/header';
import Foot from '../../components/common/footer';

const { Content } = Layout;

// Separate components for better organization and performance
const StatisticCard = ({ title, value, valueStyle }) => (
 <Card className="custom-stat-card" bordered={false} title={title}>
  <Statistic value={value} valueStyle={valueStyle} />
 </Card>
);

const PropertyTable = ({ properties, columns, t }) => (
 <Card title={t('user.managedProperties')}>
  {properties.length > 0 ? (
   <Table
    columns={columns}
    dataSource={properties.map((p) => ({
     key: p.propertyId,
     name: p.property.name,
     address: p.property.placeName,
     status: p.property.status,
     id: p.propertyId,
     property: p.property,
    }))}
    rowKey="id"
    pagination={{ pageSize: 5 }}
   />
  ) : (
   <Empty
    description={t('property.noProperties')}
    image={Empty.PRESENTED_IMAGE_SIMPLE}
   />
  )}
 </Card>
);

const ManagerDashboard = () => {
 const { t } = useTranslation();
 const { user } = useAuthContext();
 const navigate = useNavigate();
 const { error, toggleEnableProperty, deleteProperty } = useProperty();
 const { getManagerProperties, getManager, loading } = useManager();
 const [properties, setProperties] = useState([]);
 const [managerData, setManagerData] = useState(null);

 const toggleEnable = async (ID) => {
  await toggleEnableProperty(ID);
  if (!error) {
   message.success(t('property.toggleSuccess'));
   await fetchManagerData();
  } else {
   message.error(t('property.toggleError', { error: error.message }));
  }
 };

 const confirmDelete = async (id) => {
  await deleteProperty(id);
  if (!error) {
   message.success(t('messages.deleteSuccess'));
   await fetchManagerData();
  } else {
   message.error(t('messages.deleteError', { error: error.message }));
  }
 };

 const fetchManagerData = async () => {
  if (!user?.id) return;

  try {
   const [managerResponse, propertiesResponse] = await Promise.all([
    getManager(user.id),
    getManagerProperties(user.id),
   ]);

   setManagerData(managerResponse);
   setProperties(propertiesResponse);
  } catch (err) {
   console.error('Error fetching manager data:', err);
  }
 };
 useEffect(() => {
  fetchManagerData();
 }, [user?.id]);

 // Memoized calculations
 const statistics = useMemo(
  () => ({
   totalProperties: properties.length,
   activeProperties: properties.filter((p) => p.status === 'active').length,
   pendingTasks: properties.reduce(
    (acc, p) =>
     acc + (p.tasks?.filter((t) => t.status === 'pending').length || 0),
    0
   ),
  }),
  [properties]
 );

 // Memoized table columns
 const propertyColumns = useMemo(
  () => [
   {
    title: 'Photo',
    key: 'photo',
    render: (_, record) => (
     <Image
      src={record.property.photos[0]}
      alt={record.name}
      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
     />
    ),
   },
   {
    title: t('property.title'),
    dataIndex: 'name',
    key: 'name',
   },
   {
    title: t('property.address'),
    dataIndex: 'address',
    key: 'address',
   },
   {
    title: t('property.status'),
    dataIndex: 'status',
    key: 'status',
    render: (status) => (
     <Tag color={status === 'enable' ? 'green' : 'orange'}>
      {status.toUpperCase()}
     </Tag>
    ),
   },
   {
    title: t('property.actions.actions'),
    key: 'actions',
    render: (_, record) => (
     <Space direction="vertical">
      <Space>
       <Button
        icon={<i className="Dashicon fa-light fa-eye" key="display" />}
        onClick={() =>
         navigate(`/propertydetails?hash=${record.property.hashId}`)
        }
        type="link"
        shape="circle"
       />
       <Button
        icon={<i className="Dashicon fa-light fa-house-lock" key="ellipsis" />}
        onClick={() =>
         navigate(`/digitalguidebook?hash=${record.property.hashId}`)
        }
        type="link"
        shape="circle"
       />
       <Button
        icon={
         <i
          className="Dashicon fa-light fa-list-check"
          style={{ color: '#2b2c32' }}
          key="task"
         />
        }
        onClick={() =>
         navigate(`/propertytaskdashboard?id=${record.id}&name=${record.name}`)
        }
        type="link"
        shape="circle"
       />
       <Button
        icon={
         <i
          className="Dashicon fa-light fa-dollar-sign"
          style={{ color: '#389e0d' }}
          key="revenue"
         />
        }
        onClick={() =>
         navigate(
          `/propertyrevenuedashboard?id=${record.id}&name=${record.name}`
         )
        }
        type="link"
        shape="circle"
       />

       <Popconfirm
        key="lock"
        title={
         record.property.status === 'enable'
          ? t('property.disable')
          : t('property.enable')
        }
        description={t('property.confirmToggle')}
        onConfirm={() => toggleEnable(record.property.id)}
        okText={t('common.yes')}
        cancelText={t('common.no')}
        icon={
         record.property.status === 'enable' ? (
          <i
           className="Dashicon Pointer fa-regular fa-lock"
           style={{ color: '#F5222D', marginRight: 6 }}
          />
         ) : (
          <i
           className="Dashicon fa-regular fa-lock-open"
           style={{ color: '#52C41A', marginRight: 6 }}
          />
         )
        }
       >
        <div style={{ cursor: 'pointer' }}>
         {record.property.status === 'enable' ? (
          <i
           className="Dashicon fa-regular fa-lock-open"
           style={{ color: '#52C41A' }}
          />
         ) : (
          <i
           className="Dashicon fa-regular fa-lock"
           style={{ color: '#F5222D' }}
          />
         )}
        </div>
       </Popconfirm>

       <Popconfirm
        title={t('messages.deleteConfirm')}
        onConfirm={() => confirmDelete(record.id)}
       >
        <Button
         danger
         icon={
          <i
           className="Dashicon fa-regular fa-trash"
           style={{ color: 'red' }}
           key="delete"
          />
         }
         type="link"
         shape="circle"
        />
       </Popconfirm>
      </Space>
      <Button
       type="text"
       icon={<i className="PrimaryColor fa-regular fa-file-contract" />}
       onClick={() => navigate(`/contractslist?hash=${record.property.hashId}`)}
      >
       {t('property.actions.contracts')}
      </Button>
      <Button
       type="text"
       icon={<i className="PrimaryColor fa-regular fa-file-pen" />}
       onClick={() => navigate(`/guestform?hash=${record.property.hashId}`)}
      >
       {t('property.actions.guestForm')}
      </Button>
     </Space>
    ),
   },
   {
    title: t('dashboard.lastUpdate'),
    key: 'updatedAt',
    render: (_, record) =>
     new Date(record.property.updatedAt).toLocaleDateString(),
   },
  ],
  [t]
 );

 if (loading) {
  return (
   <div className="loading">
    <Spin size="large" />
   </div>
  );
 }

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
    <Row gutter={16}>
     <Col xs={8}>
      <StatisticCard
       title={t('dashboard.totalProperties')}
       value={statistics.totalProperties}
      />
     </Col>
     <Col xs={8}>
      <StatisticCard
       title={t('dashboard.activeProperties')}
       value={statistics.activeProperties}
      />
     </Col>
     <Col xs={8}>
      <StatisticCard
       title={t('tasks.pending')}
       value={statistics.pendingTasks}
       valueStyle={{
        color: statistics.pendingTasks > 0 ? '#F79009' : '#17B26A',
       }}
      />
     </Col>
    </Row>
    <br />

    <Row gutter={16}>
     <Col xs={24}>
      <PropertyTable properties={properties} columns={propertyColumns} t={t} />
     </Col>
    </Row>
   </Content>
   <Foot />
  </Layout>
 );
};

export default ManagerDashboard;
