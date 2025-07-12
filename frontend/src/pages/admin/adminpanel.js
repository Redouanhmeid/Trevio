import React, { useState, useEffect } from 'react';
import {
 Layout,
 Row,
 Col,
 Card,
 Typography,
 Divider,
 Avatar,
 Image,
 List,
 Statistic,
 Badge,
 Button,
 Spin,
 Flex,
 Space,
 Tag,
 Rate,
 Popconfirm,
 Grid,
 message,
} from 'antd';
import { UserOutlined, PlusOutlined, RobotOutlined } from '@ant-design/icons';
import { useTranslation } from '../../context/TranslationContext';
import { useNavigate } from 'react-router-dom';
import Head from '../../components/common/header';
import Foot from '../../components/common/footer';
import useProperty from '../../hooks/useProperty';
import { useUserData } from '../../hooks/useUserData';
import useNearbyPlace from '../../hooks/useNearbyPlace';

const { Content } = Layout;
const { Title, Text } = Typography;

const Dashboard = () => {
 const {
  properties = [],
  pendingProperties,
  loading: PropertiesLoading,
  fetchPendingProperties,
  fetchAllProperties,
 } = useProperty();
 const { Users = [], isLoading: UsersLoading, fetchAllUsers } = useUserData();
 const { error, getAllNearbyPlaces, deleteNearbyPlace } = useNearbyPlace();
 const { t } = useTranslation();
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();
 const navigate = useNavigate();

 const [NearbyPlaces, setNearbyPlaces] = useState([]);
 const [visibleProperties, setVisibleProperties] = useState(3);
 const [visibleUsers, setVisibleUsers] = useState(3);
 const [visibleNPlaces, setVisibleNPlaces] = useState(3);
 const [Ploading, setPLoading] = useState(false);
 const [Mloading, setMLoading] = useState(false);
 const [Nloading, setNLoading] = useState(false);

 const pendingNearbyPlaces = NearbyPlaces.filter(
  (NearbyPlace) => NearbyPlace.isVerified === false
 ).length;

 const fetchNearbyPlaces = async () => {
  try {
   const data = await getAllNearbyPlaces(); // Properly calling the function
   setNearbyPlaces(data);
  } catch (err) {
   message.error(t('error.update'));
  }
 };

 useEffect(() => {
  fetchAllProperties();
  fetchPendingProperties();
  fetchAllUsers();
  fetchNearbyPlaces();
 }, []);

 const numberOfProperties = properties.length;
 const totalPrice = properties.reduce(
  (sum, property) => sum + property.price,
  0
 );
 const averagePrice = totalPrice / numberOfProperties || 0;
 const numberOfUsers = Users.length;
 const numberOfNearbyPlaces = NearbyPlaces.length;

 const handleMLoadMore = () => {
  setMLoading(true);
  setTimeout(() => {
   setVisibleUsers((prev) => prev + 3); // Show 3 more users
   setMLoading(false); // Turn off loading state after users are shown
  }, 1000); // Simulate a 1-second delay
 };
 const handlePLoadMore = () => {
  setPLoading(true);
  setTimeout(() => {
   setVisibleProperties((prev) => prev + 3); // Show 3 more users
   setPLoading(false); // Turn off loading state after users are shown
  }, 1000); // Simulate a 1-second delay
 };
 const handleNLoadMore = () => {
  setNLoading(true);
  setTimeout(() => {
   setVisibleNPlaces((prev) => prev + 3); // Show 3 more users
   setNLoading(false); // Turn off loading state after users are shown
  }, 1000); // Simulate a 1-second delay
 };

 const loadMMoreButton =
  !Mloading && visibleUsers < Users.length ? (
   <div style={{ textAlign: 'center', marginTop: 12 }}>
    <Button
     type="primary"
     size="large"
     icon={<PlusOutlined />}
     onClick={handleMLoadMore}
    >
     {t('button.loadmore')}
    </Button>
   </div>
  ) : null;
 const loadPMoreButton =
  !Ploading && visibleProperties < properties.length ? (
   <div style={{ textAlign: 'center', marginTop: 12 }}>
    <Button
     type="primary"
     size="large"
     icon={<PlusOutlined />}
     onClick={handlePLoadMore}
    >
     {t('button.loadmore')}
    </Button>
   </div>
  ) : null;
 const loadNMoreButton =
  !Nloading && visibleNPlaces < NearbyPlaces.length ? (
   <div style={{ textAlign: 'center', marginTop: 12 }}>
    <Button
     type="primary"
     size="large"
     icon={<PlusOutlined />}
     onClick={handleNLoadMore}
    >
     {t('button.loadmore')}
    </Button>
   </div>
  ) : null;

 const confirmDelete = async (id) => {
  await deleteNearbyPlace(id);
  if (!error) {
   fetchNearbyPlaces();
   message.success(t('messages.deleteSuccess'));
  } else {
   message.error(t('messages.deleteError') + error.message);
  }
 };

 return (
  <Layout className="contentStyle">
   <Head />
   <Content className="container">
    <Row gutter={[16, 16]} align="center" justify="end">
     <Col xs={24} md={24} className="stat-col">
      <Button
       type="primary"
       icon={<RobotOutlined />}
       size="large"
       block
       onClick={() => navigate('/chatbot/admin')}
      >
       {t('chatbot.admin.title')}
      </Button>
     </Col>
    </Row>
    <Row gutter={[16, 16]} align="bottom" justify="center">
     <Col xs={24} md={8}>
      <Title level={2}>{t('messages.reviewAndApprove')} :</Title>
     </Col>

     <Col xs={24} md={8} className="stat-col">
      <Badge count={pendingProperties.length} status="warning" offset={[4, 4]}>
       <Card
        title={null}
        className="custom-stat-card"
        bordered={false}
        onClick={() => navigate(`/pendingproperties`)}
        style={{ cursor: 'pointer' }}
       >
        <Card.Meta
         avatar={
          <Avatar
           style={{ borderRadius: 0 }}
           src={<i className="PrimaryColor fa-regular fa-house fa-xl" />}
          />
         }
         title={t('property.pending')}
        />
       </Card>
      </Badge>
     </Col>
     <Col xs={24} md={8} className="stat-col">
      <Badge count={pendingNearbyPlaces} status="warning" offset={[4, 4]}>
       <Card
        title={null}
        className="custom-stat-card"
        bordered={false}
        onClick={() => navigate(`/pendingnearbyplaces`)}
        style={{ cursor: 'pointer' }}
       >
        <Card.Meta
         avatar={
          <Avatar
           style={{ borderRadius: 0 }}
           src={<i className="PrimaryColor fa-regular fa-map-location fa-xl" />}
          />
         }
         title={t('nearbyPlace.pending')}
        />
       </Card>
      </Badge>
     </Col>
    </Row>

    <Divider />
    <Title level={2}>
     {t('dashboard.statistics')}{' '}
     <i className="PrimaryColor fa-regular fa-chart-mixed"></i>
    </Title>
    <Row gutter={[16, 16]}>
     <Col xs={24} md={6}>
      <Card
       title={t('dashboard.totalUsers')}
       className="custom-stat-card"
       bordered={false}
      >
       <Statistic value={numberOfUsers} />
      </Card>
     </Col>
     <Col xs={24} md={6}>
      <Card
       title={t('dashboard.totalProperties')}
       className="custom-stat-card"
       bordered={false}
      >
       <Statistic value={numberOfProperties} />
      </Card>
     </Col>
     <Col xs={24} md={6}>
      <Card
       title={t('dashboard.averagePrice')}
       className="custom-stat-card"
       bordered={false}
      >
       <Statistic value={averagePrice.toFixed(2)} precision={2} />
      </Card>
     </Col>
     <Col xs={24} md={6}>
      <Card
       title={t('nearbyPlace.title')}
       className="custom-stat-card"
       bordered={false}
      >
       <Statistic value={numberOfNearbyPlaces} />
      </Card>
     </Col>
    </Row>
    <br />
    <br />

    <Row gutter={[16, 16]}>
     <Col xs={24} sm={8} className="custom-list">
      <Card
       className="custom-stat-card"
       title={
        <>
         <a href={`/users`}>{t('dashboard.users')}</a>
         <Divider
          style={{
           borderColor: '#6D5FFA',
          }}
         />
        </>
       }
       bordered={false}
      >
       <List
        className="users-card"
        itemLayout="horizontal"
        dataSource={Array.isArray(Users) ? Users.slice(0, visibleUsers) : []}
        renderItem={(item) => (
         <List.Item
          actions={[
           <a href={`/user?id=${item.id}`}>
            <i className="Dashicon fa-regular fa-eye" key="display" />
           </a>,
          ]}
         >
          <List.Item.Meta
           avatar={
            <a href={`/user?id=${item.id}`}>
             <Avatar src={item.avatar} size={52} />
            </a>
           }
           title={
            <Text style={{ fontSize: 16 }}>
             {item.firstname} {item.lastname}
            </Text>
           }
           description={
            <Text style={{ color: '#828282', fontSize: 14 }}>{item.email}</Text>
           }
          />
         </List.Item>
        )}
       />
       {Mloading && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
         <Spin />
        </div>
       )}
       {loadMMoreButton}
      </Card>
     </Col>

     <Col xs={24} sm={8}>
      <Card
       className="custom-stat-card"
       title={
        <>
         <a href={`/properties`}>{t('property.title')}</a>
         <Divider
          style={{
           borderColor: '#6D5FFA',
          }}
         />
        </>
       }
       bordered={false}
      >
       <List
        itemLayout="vertical"
        dataSource={
         Array.isArray(properties) ? properties.slice(0, visibleProperties) : []
        }
        renderItem={(item) => (
         <List.Item
          actions={[
           <a href={`/propertydetails?hash=${item.hashId}`}>
            <i className="Dashicon fa-regular fa-eye" key="display" />
           </a>,
           <a href={`/digitalguidebook?hash=${item.hashId}`}>
            <i className="Dashicon fa-regular fa-house-lock" key="ellipsis" />
           </a>,
          ]}
         >
          <List.Item.Meta
           avatar={<Image src={item.photos[0]} width={140} />}
           title={<Text className="dash-meta-title">{item.name}</Text>}
           description={
            <Flex gap="4px 0" vertical>
             <Text className="dash-place-style">
              <i className="PrimaryColor fa-regular fa-location-dot" />{' '}
              {item.placeName}
             </Text>
             <Text className="dash-price-style">
              <Text strong>{item.price} Dhs </Text>
              {t('property.basic.priceNight')}
             </Text>
            </Flex>
           }
          />
         </List.Item>
        )}
       />
       {Ploading && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
         <Spin />
        </div>
       )}
       {loadPMoreButton}
      </Card>
     </Col>

     <Col xs={24} sm={8}>
      <Card
       className="custom-stat-card"
       title={
        <>
         <a href={`/nearbyplaces`}>{t('nearbyPlace.title')}</a>
         <Divider
          style={{
           borderColor: '#6D5FFA',
          }}
         />
        </>
       }
       bordered={false}
      >
       <List
        itemLayout="horizontal"
        dataSource={
         Array.isArray(NearbyPlaces)
          ? NearbyPlaces.slice(0, visibleNPlaces)
          : []
        }
        renderItem={(item) => (
         <List.Item>
          <List.Item.Meta
           avatar={<Image src={item.photo} width={100} />}
           title={<Text className="dash-meta-title">{item.name}</Text>}
           description={
            <Flex gap="14px 0" vertical>
             <Space size="small" wrap>
              <Rate
               allowHalf
               disabled
               defaultValue={item.rating}
               style={{ fontSize: 13 }}
              />
              <Text style={{ color: '#28282' }}>{item.rating}</Text>
             </Space>
             <Space size="large" align="baseline" wrap>
              <a href={item.url} target="_blank">
               <i className="Dashicon fa-regular fa-eye" key="display" />
              </a>
              <a href={`/nearbyplace?id=${item.id}`}>
               <i className="Dashicon fa-regular fa-pen-to-square" key="edit" />
              </a>
              <Popconfirm
               title={t('messages.deleteConfirm')}
               onConfirm={() => confirmDelete(item.id)}
              >
               <Button
                className="Dashicon fa-regular fa-trash"
                style={{ color: '#F04438', minWidth: 0 }}
                key="delete"
                type="link"
                shape="circle"
               />
              </Popconfirm>
             </Space>
            </Flex>
           }
          />
         </List.Item>
        )}
       />
       {Nloading && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
         <Spin />
        </div>
       )}
       {loadNMoreButton}
      </Card>
     </Col>
    </Row>
   </Content>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default Dashboard;
