import React, { useState, useEffect } from 'react';
import {
 Layout,
 Row,
 Col,
 Card,
 Divider,
 Space,
 Button,
 List,
 Flex,
 Typography,
 Tag,
 Spin,
 Grid,
 Avatar,
 Empty,
} from 'antd';
import { useTranslation } from '../../context/TranslationContext';
import { useNavigate } from 'react-router-dom';
import { useConcierge } from '../../hooks/useConcierge';
import DashboardHeader from '../../components/common/DashboardHeader';
import Foot from '../../components/common/footer';
import MobileNavigationBar from '../../components/common/MobileNavigationBar';

const { Content } = Layout;
const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const ConciergesDashboard = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const screens = useBreakpoint();
 const [clientId, setClientId] = useState(null);
 const [concierges, setConcierges] = useState([]);
 const [loading, setLoading] = useState(true);

 const { getClientConcierges } = useConcierge();

 const handleUserData = (userData) => {
  setClientId(userData);
 };

 const fetchConcierges = async () => {
  try {
   setLoading(true);
   const fetchedConcierges = await getClientConcierges(clientId);
   setConcierges(fetchedConcierges || []);
  } catch (err) {
   console.error(t('error.managersFetch'), err);
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  if (clientId) {
   fetchConcierges();
  }
 }, [clientId]);

 // Empty state component
 const EmptyState = () => (
  <Empty
   image={Empty.PRESENTED_IMAGE_SIMPLE}
   description={t('managers.noConcierges')}
   style={{ margin: '40px 0' }}
  >
   <Button
    type="primary"
    onClick={() => navigate('/add-concierge', { state: { clientId } })}
    icon={<i className="fa-regular fa-plus" />}
   >
    {t('managers.addButton')}
   </Button>
  </Empty>
 );

 return (
  <Layout className="contentStyle">
   <DashboardHeader onUserData={handleUserData} />

   <Content className="container">
    {/* Header section with conditional styling for mobile/desktop */}
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
      {t('managers.title')}
     </Title>

     {screens.xs ? (
      <Space>
       <Button
        type="primary"
        onClick={() => navigate('/assign-concierge', { state: { clientId } })}
        icon={<i className="fa-regular fa-user-tie" />}
       >
        {t('managers.assignButton')}
       </Button>
       <Button
        type="text"
        icon={<i className="PrimaryColor fa-regular fa-circle-plus fa-2xl" />}
        onClick={() => navigate('/add-concierge', { state: { clientId } })}
       />
      </Space>
     ) : (
      <Space>
       <Button
        onClick={() => navigate('/assign-concierge', { state: { clientId } })}
        icon={<i className="fa-regular fa-user-tie" />}
       >
        {t('managers.assignButton')}
       </Button>
       <Button
        type="primary"
        icon={<i className="fa-regular fa-plus" />}
        onClick={() => navigate('/add-concierge', { state: { clientId } })}
       >
        {t('managers.addButton')}
       </Button>
      </Space>
     )}
    </Flex>

    <Card
     className="dash-card"
     styles={{ body: { padding: screens.xs ? 8 : 24 } }}
     style={{ padding: screens.xs ? 0 : undefined }}
    >
     {loading ? (
      <Flex justify="center" align="center" style={{ padding: '40px 0' }}>
       <Spin size="large" />
      </Flex>
     ) : concierges.length === 0 ? (
      <EmptyState />
     ) : (
      <List
       className={screens.xs ? 'concierge-list-mobile' : ''}
       itemLayout={screens.xs ? 'vertical' : 'horizontal'}
       dataSource={concierges}
       renderItem={(concierge) => (
        <List.Item
         key={concierge.id}
         style={
          screens.xs
           ? {
              background: 'white',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '16px',
             }
           : {}
         }
         actions={
          screens.xs
           ? []
           : [
              <Button
               type="link"
               onClick={() =>
                navigate(`/concierges/${concierge.id}/properties`)
               }
              >
               {t('managers.manageProperties')}
              </Button>,
             ]
         }
        >
         {screens.xs ? (
          <Flex vertical style={{ width: '100%' }}>
           <Flex align="center" gap={16}>
            <Avatar
             size={48}
             src={concierge.avatar}
             style={{ backgroundColor: '#6D5FFA', color: 'white' }}
            >
             {concierge.firstname?.charAt(0) || 'M'}
            </Avatar>
            <Flex vertical>
             <Text strong style={{ fontSize: 16 }}>
              {`${concierge.firstname} ${concierge.lastname}`}
             </Text>
             <Text style={{ color: '#6D5FFA' }}>{concierge.email}</Text>
            </Flex>
           </Flex>

           <Flex style={{ marginTop: 12, marginLeft: 64 }}>
            <Text type="secondary">
             <i className="fa-regular fa-phone" style={{ marginRight: 8 }} />
             {concierge.phone}
            </Text>
           </Flex>

           <Flex
            justify="space-between"
            align="center"
            style={{ marginTop: 12 }}
           >
            <Flex>
             {concierge.isVerified ? (
              <Tag color="green">{t('managers.active')}</Tag>
             ) : (
              <Tag color="#9DE3F2">{t('managers.pending')}</Tag>
             )}
            </Flex>
            <Button
             type="link"
             style={{ padding: 0, color: '#6D5FFA' }}
             onClick={() => navigate(`/concierges/${concierge.id}/properties`)}
            >
             {t('managers.manageProperties')} →
            </Button>
           </Flex>
          </Flex>
         ) : (
          <List.Item.Meta
           title={
            <Flex justify="flex-start" align="center" gap="middle">
             <Text
              strong
              style={{ fontSize: 16 }}
             >{`${concierge.firstname} ${concierge.lastname}`}</Text>
             <Tag color="blue">{concierge.email}</Tag>
             {concierge.isVerified ? (
              <Tag color="green">{t('managers.active')}</Tag>
             ) : (
              <Tag color="#9DE3F2">{t('managers.pending')}</Tag>
             )}
            </Flex>
           }
           description={
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
             <Text type="secondary">
              <i className="fa-regular fa-phone" /> {concierge.phone}
             </Text>
            </Space>
           }
          />
         )}
        </List.Item>
       )}
      />
     )}
    </Card>
   </Content>

   {!screens.xs && <Foot />}
   {screens.xs && <MobileNavigationBar />}
  </Layout>
 );
};

export default ConciergesDashboard;
