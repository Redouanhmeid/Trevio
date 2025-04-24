import React, { useState, useEffect } from 'react';
import {
 Layout,
 List,
 Image,
 Button,
 Select,
 message,
 Typography,
 Grid,
 Card,
 Space,
 Flex,
 Tag,
 Divider,
 Spin,
 Empty,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../context/TranslationContext';
import Foot from '../../components/common/footer';
import { useConcierge } from '../../hooks/useConcierge';
import fallback from '../../assets/fallback.png';
import DashboardHeader from '../../components/common/DashboardHeader';

const { Content } = Layout;
const { Title, Text } = Typography;

const ConciergeProperties = () => {
 const navigate = useNavigate();
 const { managerId } = useParams();
 const { getConciergeProperties, updateConciergeStatus, removeConcierge } =
  useConcierge();
 const [userProperties, setUserProperties] = useState([]);
 const [loading, setLoading] = useState(false);
 const [managerData, setManagerData] = useState(null);
 const { t } = useTranslation();
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();

 const fetchProperties = async () => {
  setLoading(true);
  try {
   const data = await getConciergeProperties(managerId);
   setUserProperties(data);

   // Get manager info from the first property assignment (if available)
   if (data && data.length > 0) {
    const firstAssignment = data[0];
    const managerEmail = firstAssignment?.manager?.email || 'Unknown';
    setManagerData({
     email: managerEmail,
     propertyCount: data.length,
     activeCount: data.filter((item) => item.status === 'active').length,
    });
   }
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
  try {
   await removeConcierge(clientId, conciergeId, propertyId);
   message.success(t('managers.messages.propertyRemoved'));
   fetchProperties();
  } catch (error) {
   message.error(t('managers.messages.removeError'));
  }
 };

 return (
  <Layout className="contentStyle">
   <DashboardHeader />
   <Content className="container">
    <Button
     type="link"
     icon={<ArrowLeftOutlined />}
     onClick={() => navigate(-1)}
    >
     {t('button.back')}
    </Button>

    <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
     <Title level={2}>{t('managers.propertiesTitle')}</Title>
    </Flex>

    {loading ? (
     <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Spin size="large" />
     </div>
    ) : (
     <Card className="dash-card">
      <List
       itemLayout="horizontal"
       dataSource={userProperties}
       locale={{
        emptyText: <Empty description={t('managers.noAssignedProperties')} />,
       }}
       renderItem={(item) => (
        <List.Item
         key={item.id}
         actions={[
          <Select
           key="status"
           value={item.status}
           onChange={(value) => handleStatusChange(item.id, value)}
           style={{ width: 120 }}
          >
           <Select.Option value="active">
            {t('property.propertyStatus.active')}
           </Select.Option>
           <Select.Option value="inactive">
            {t('property.propertyStatus.inactive')}
           </Select.Option>
          </Select>,
          <Button
           key="remove"
           type="link"
           danger
           onClick={() =>
            handleRemove(item.clientId, managerId, item.property.id)
           }
          >
           {t('property.actions.remove')}
          </Button>,
         ]}
        >
         <List.Item.Meta
          avatar={
           <Image
            src={item.property.photos?.[0] || fallback}
            alt={item.property.name}
            height={64}
            width={64}
            style={{ borderRadius: 8, objectFit: 'cover' }}
           />
          }
          title={<Text strong>{item.property.name}</Text>}
          description={
           <Space direction="vertical" size={1}>
            <Text type="secondary">
             <i
              className="fa-light fa-location-dot"
              style={{ marginRight: 4 }}
             />
             {item.property.placeName}
            </Text>
            {item.property.price && (
             <Text type="secondary">
              <i
               className="fa-light fa-money-bill"
               style={{ marginRight: 4 }}
              />
              {item.property.price} {t('property.basic.priceNight')}
             </Text>
            )}
           </Space>
          }
         />
        </List.Item>
       )}
      />
     </Card>
    )}
   </Content>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default ConciergeProperties;
