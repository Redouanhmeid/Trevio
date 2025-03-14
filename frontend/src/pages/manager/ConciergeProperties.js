import React, { useState, useEffect } from 'react';
import {
 Layout,
 Table,
 Image,
 Button,
 Select,
 message,
 Typography,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../context/TranslationContext';
import Head from '../../components/common/header';
import Foot from '../../components/common/footer';
import { useConcierge } from '../../hooks/useConcierge';
import fallback from '../../assets/fallback.png';

const { Content } = Layout;
const { Title } = Typography;

const ConciergeProperties = () => {
 const navigate = useNavigate();
 const { managerId } = useParams();
 const { getConciergeProperties, updateConciergeStatus, removeConcierge } =
  useConcierge();
 const [userProperties, setUserProperties] = useState([]);
 const [loading, setLoading] = useState(false);
 const { t } = useTranslation();

 const fetchProperties = async () => {
  setLoading(true);
  try {
   const data = await getConciergeProperties(managerId);
   setUserProperties(data);
  } catch (error) {
   message.error(t('managers.fetchPropertiesError'));
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  fetchProperties();
 }, [managerId]);

 const handleStatusChange = async (assignmentId, status) => {
  try {
   await updateConciergeStatus(assignmentId, status);
   message.success(t('managers.messages.statusUpdateSuccess'));
   fetchProperties();
  } catch (error) {
   message.error(t('managers.messages.statusUpdateError'));
  }
 };

 const handleRemove = async (clientId, conciergeId, propertyId) => {
  console.log(clientId, conciergeId, propertyId);
  try {
   await removeConcierge(clientId, conciergeId, propertyId);
   message.success(t('managers.messages.propertyRemoved'));
   fetchProperties();
  } catch (error) {
   message.error(t('managers.messages.removeError'));
  }
 };

 const columns = [
  {
   title: 'Photo',
   key: 'photo',
   render: (_, record) => (
    <Image
     src={record.property.photos?.[0] || fallback}
     alt={record.property.name}
     height={64}
     width={64}
    />
   ),
  },
  {
   title: t('property.title'),
   dataIndex: ['property', 'name'],
   key: 'name',
  },
  {
   title: t('property.basic.location'),
   dataIndex: ['property', 'placeName'],
   key: 'placeName',
  },
  {
   title: t('managers.assignmentStatus'),
   dataIndex: 'status',
   key: 'status',
   render: (status, record) => (
    <Select
     value={status}
     onChange={(value) => handleStatusChange(record.id, value)}
     style={{ width: 120 }}
    >
     <Select.Option value="active">
      {t('property.propertyStatus.active')}
     </Select.Option>
     <Select.Option value="inactive">
      {t('property.propertyStatus.inactive')}
     </Select.Option>
    </Select>
   ),
  },
  {
   title: t('property.actions.actions'),
   key: 'actions',
   render: (_, record) => (
    <Button
     type="link"
     danger
     onClick={() =>
      handleRemove(record.clientId, managerId, record.property.id)
     }
    >
     {t('property.actions.remove')}
    </Button>
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
    <Title level={2}>{t('managers.propertiesTitle')}</Title>
    <Table
     columns={columns}
     dataSource={userProperties}
     loading={loading}
     rowKey="id"
    />
   </Content>
   <Foot />
  </Layout>
 );
};

export default ConciergeProperties;
