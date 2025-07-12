import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
 Layout,
 Row,
 Col,
 Space,
 Typography,
 Avatar,
 Image,
 Table,
 Button,
 Spin,
 message,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import useProperty from '../../hooks/useProperty';
import { useUserData } from '../../hooks/useUserData';
import Head from '../../components/common/header';
import Foot from '../../components/common/footer';
import { useTranslation } from '../../context/TranslationContext';

const { Content } = Layout;
const { Title, Text } = Typography;

const User = () => {
 const location = useLocation();
 const searchParams = new URLSearchParams(location.search);
 const userId = searchParams.get('id'); // Extract the 'id' from the query params
 const { t } = useTranslation();

 const navigate = useNavigate();
 const { isLoading, userData, fetchUserById, verifyUser, error, errorMsg } =
  useUserData();
 const {
  properties = [],
  loading: propertiesLoading,
  fetchAllProperties,
 } = useProperty();

 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);

 const fetchUserData = async () => {
  if (userId) {
   try {
    const userData = await fetchUserById(userId);
    setUser(userData);
   } catch (error) {
    console.error('Error fetching user data:', error);
   } finally {
    setLoading(false);
   }
  }
 };
 useEffect(() => {
  fetchUserData();
  fetchAllProperties();
 }, [loading]);

 const handleVerify = async () => {
  try {
   await verifyUser(userId);
   message.success(t('user.verifySuccess'));
   fetchUserData();
  } catch (err) {
   message.error(errorMsg || t('user.verifyError'));
  }
 };

 if (loading || propertiesLoading) {
  return (
   <div className="loading">
    <Spin size="large" />
   </div>
  );
 }

 const userProperties = properties.filter(
  (property) => property.userId === Number(userId)
 );

 const columns = [
  {
   title: t('common.photo'),
   dataIndex: 'photos',
   key: 'photos',
   render: (photos) =>
    photos && photos.length > 0 ? (
     <Image src={photos[0]} shape="square" size="large" width={64} />
    ) : null,
  },
  {
   title: t('property.basic.name'),
   dataIndex: 'name',
   key: 'name',
   render: (text, record) => (
    <a onClick={() => navigate(`/propertydetails?hash=${record.hashId}`)}>
     {text}
    </a>
   ),
  },
  {
   title: t('property.basic.type'),
   dataIndex: 'type',
   key: 'type',
   render: (type) => {
    switch (type) {
     case 'apartment':
      return 'appartement';
     case 'house':
      return 'maison';
     case 'guesthouse':
      return "maison d'hôtes";
     default:
      return type;
    }
   },
  },
  {
   title: t('property.basic.price'),
   dataIndex: 'price',
   key: 'price',
   render: (price) => `${price} MAD`,
  },
  {
   title: t('property.basic.rooms'),
   dataIndex: 'rooms',
   key: 'rooms',
  },
  {
   title: t('property.basic.beds'),
   dataIndex: 'beds',
   key: 'beds',
  },
  {
   title: t('property.basic.location'),
   dataIndex: 'placeName',
   key: 'placeName',
  },
  {
   title: t('user.createdAt'),
   dataIndex: 'createdAt',
   key: 'createdAt',
   render: (createdAt) => new Date(createdAt).toLocaleString(),
  },
 ];

 return (
  <Layout className="contentStyle">
   <Head />
   <Content className="container-fluid">
    <Button
     type="default"
     shape="round"
     icon={<ArrowLeftOutlined />}
     onClick={() => navigate(-1)}
    >
     {t('button.back')}
    </Button>
    <Row gutter={[16, 16]}>
     <Col xs={24} md={8}>
      <Space direction="vertical">
       <br />
       <Avatar size={164} src={user?.avatar} />
       <Title level={3}>{`${user?.firstname} ${user?.lastname}`}</Title>
       <Text>
        {t('common.email')}: {user?.email}
       </Text>
       <Text>
        {t('common.phone')}: {user?.phone}
       </Text>
       <Text>
        {t('user.role')}: {user?.role}
       </Text>
       <Text>
        {t('user.verified')}:{' '}
        {user?.isVerified ? t('common.yes') : t('common.no')}
       </Text>
       {!user?.isVerified && (
        <Button type="primary" loading={!isLoading} onClick={handleVerify}>
         {t('user.verifyButton')}
        </Button>
       )}
       <Text>
        {t('user.createdAt')}: {new Date(user?.createdAt).toLocaleDateString()}
       </Text>
      </Space>
     </Col>
     <Col xs={24} md={16}>
      <Title level={4}>{t('user.managedProperties')}</Title>
      <Table columns={columns} dataSource={userProperties} rowKey="id" />
     </Col>
    </Row>
   </Content>
   <Foot />
  </Layout>
 );
};

export default User;
