import React, { useState, useEffect } from 'react';
import {
 Layout,
 Card,
 Row,
 Col,
 Statistic,
 Table,
 Select,
 Input,
 Button,
 Modal,
 message,
 Typography,
 Tabs,
 Space,
 Tag,
 Progress,
 Spin,
 Divider,
 List,
 Avatar,
 Badge,
 Grid,
} from 'antd';
import {
 DashboardOutlined,
 MessageOutlined,
 UserOutlined,
 SettingOutlined,
 ReloadOutlined,
 EditOutlined,
 TrophyOutlined,
 ClockCircleOutlined,
 RobotOutlined,
} from '@ant-design/icons';
import { useTranslation } from '../../context/TranslationContext';
import Head from '../../components/common/header';
import Foot from '../../components/common/footer';

const { Content, Header, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ChatbotAdminDashboard = () => {
 const { t } = useTranslation();
 // State management
 const [loading, setLoading] = useState(false);
 const [dashboardStats, setDashboardStats] = useState(null);
 const [conversations, setConversations] = useState([]);
 const [users, setUsers] = useState(null);
 const [performance, setPerformance] = useState(null);
 const [prompts, setPrompts] = useState(null);
 const [selectedMenu, setSelectedMenu] = useState('dashboard');
 const [promptModalVisible, setPromptModalVisible] = useState(false);
 const [conversationFilters, setConversationFilters] = useState({
  limit: 100,
  user_id: '',
 });
 const [promptFormData, setPromptFormData] = useState({});

 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();

 // API Base URL
 const API_BASE = 'https://chatbot.trevio.ma';

 // Fetch functions
 const fetchDashboardStats = async () => {
  try {
   const response = await fetch(`${API_BASE}/dashboard/stats`);
   const data = await response.json();
   setDashboardStats(data);
  } catch (error) {
   message.error(t('common.error'));
  }
 };

 const fetchConversations = async () => {
  try {
   let url = `${API_BASE}/dashboard/conversations?limit=${conversationFilters.limit}`;
   if (conversationFilters.user_id) {
    url += `&user_id=${conversationFilters.user_id}`;
   }
   const response = await fetch(url);
   const data = await response.json();
   setConversations(data.conversations || []);
  } catch (error) {
   message.error(t('common.error'));
  }
 };

 const fetchUsers = async () => {
  try {
   const response = await fetch(`${API_BASE}/dashboard/users`);
   const data = await response.json();
   setUsers(data);
  } catch (error) {
   message.error(t('common.error'));
  }
 };

 const fetchPerformance = async () => {
  try {
   const response = await fetch(`${API_BASE}/dashboard/performance`);
   const data = await response.json();
   setPerformance(data);
  } catch (error) {
   message.error(t('common.error'));
  }
 };

 const fetchPrompts = async () => {
  try {
   const response = await fetch(`${API_BASE}/admin/prompts`);
   const data = await response.json();
   setPrompts(data);
   setPromptFormData(data);
  } catch (error) {
   message.error(t('common.error'));
  }
 };

 const updatePrompts = async () => {
  try {
   setLoading(true);
   const response = await fetch(`${API_BASE}/admin/prompts/update`, {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompts: promptFormData }),
   });

   if (response.ok) {
    message.success(t('messages.updateSuccess'));
    setPromptModalVisible(false);
    fetchPrompts();
   } else {
    throw new Error('Update failed');
   }
  } catch (error) {
   message.error(t('messages.updateError'));
  } finally {
   setLoading(false);
  }
 };

 // Initial data loading
 useEffect(() => {
  if (selectedMenu === 'dashboard') {
   fetchDashboardStats();
   fetchUsers();
   fetchPerformance();
  } else if (selectedMenu === 'conversations') {
   fetchConversations();
  } else if (selectedMenu === 'prompts') {
   fetchPrompts();
  }
 }, [selectedMenu, conversationFilters]);

 // Menu items
 const menuItems = [
  {
   key: 'dashboard',
   icon: <DashboardOutlined />,
   label: t('chatbot.admin.dashboard'),
  },
  {
   key: 'conversations',
   icon: <MessageOutlined />,
   label: t('chatbot.admin.conversations'),
  },
  { key: 'users', icon: <UserOutlined />, label: t('chatbot.admin.users') },
  {
   key: 'prompts',
   icon: <SettingOutlined />,
   label: t('chatbot.admin.configuration'),
  },
 ];

 // Get user type color
 const getUserTypeColor = (userType) => {
  const colors = {
   client: 'blue',
   concierge: 'green',
   admin: 'purple',
   guest: 'orange',
  };
  return colors[userType] || 'default';
 };

 // Get source color
 const getSourceColor = (source) => {
  const colors = {
   llm: 'blue',
   cache: 'green',
   intent_classifier: 'orange',
   hybrid: 'purple',
  };
  return colors[source] || 'default';
 };

 // Handle prompt form data change
 const handlePromptChange = (userType, field, value) => {
  setPromptFormData((prev) => ({
   ...prev,
   [userType]: {
    ...prev[userType],
    [field]: value,
   },
  }));
 };

 // Dashboard Overview Component
 const DashboardOverview = () => (
  <div>
   <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
    <Col xs={24} sm={12} lg={6}>
     <Card>
      <Statistic
       title={t('chatbot.admin.totalConversations')}
       value={dashboardStats?.conversations?.total_conversations || 0}
       prefix={<MessageOutlined />}
       valueStyle={{ color: '#3f8600' }}
      />
     </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
     <Card>
      <Statistic
       title={t('chatbot.admin.uniqueUsers')}
       value={users?.total_unique_users || 0}
       prefix={<UserOutlined />}
       valueStyle={{ color: '#1890ff' }}
      />
     </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
     <Card>
      <Statistic
       title={t('chatbot.admin.avgResponseTime')}
       value={performance?.response_times?.average_ms || 0}
       suffix="ms"
       prefix={<ClockCircleOutlined />}
       valueStyle={{ color: '#722ed1' }}
      />
     </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
     <Card>
      <Statistic
       title={t('chatbot.admin.cacheHitRate')}
       value={performance?.cache_hit_rate || 0}
       suffix="%"
       prefix={<TrophyOutlined />}
       valueStyle={{ color: '#eb2f96' }}
      />
     </Card>
    </Col>
   </Row>

   <Row gutter={[16, 16]}>
    <Col xs={24} lg={12}>
     <Card title={t('chatbot.admin.userTypeDistribution')} bordered={false}>
      {dashboardStats?.conversations?.user_types && (
       <div>
        {Object.entries(dashboardStats.conversations.user_types).map(
         ([type, count]) => (
          <div key={type} style={{ marginBottom: 16 }}>
           <div
            style={{
             display: 'flex',
             justifyContent: 'space-between',
             marginBottom: 4,
            }}
           >
            <Text>{type}</Text>
            <Text>{count}</Text>
           </div>
           <Progress
            percent={
             (count / dashboardStats.conversations.total_conversations) * 100
            }
            size="small"
            strokeColor={getUserTypeColor(type)}
           />
          </div>
         )
        )}
       </div>
      )}
     </Card>
    </Col>

    <Col xs={24} lg={12}>
     <Card title={t('chatbot.admin.languageUsage')} bordered={false}>
      {dashboardStats?.conversations?.languages && (
       <div>
        {Object.entries(dashboardStats.conversations.languages).map(
         ([lang, count]) => (
          <div key={lang} style={{ marginBottom: 16 }}>
           <div
            style={{
             display: 'flex',
             justifyContent: 'space-between',
             marginBottom: 4,
            }}
           >
            <Text>{lang.toUpperCase()}</Text>
            <Text>{count}</Text>
           </div>
           <Progress
            percent={
             (count / dashboardStats.conversations.total_conversations) * 100
            }
            size="small"
            strokeColor="#52c41a"
           />
          </div>
         )
        )}
       </div>
      )}
     </Card>
    </Col>
   </Row>

   {users?.most_active_users && (
    <Card
     title={t('chatbot.admin.mostActiveUsers')}
     style={{ marginTop: 16 }}
     bordered={false}
    >
     <List
      dataSource={users.most_active_users}
      renderItem={(item) => (
       <List.Item>
        <List.Item.Meta
         avatar={<Avatar icon={<UserOutlined />} />}
         title={item[0]}
         description={`${item[1]} ${t('chatbot.admin.conversationsCount')}`}
        />
        <Badge count={item[1]} style={{ backgroundColor: '#52c41a' }} />
       </List.Item>
      )}
     />
    </Card>
   )}
  </div>
 );

 // Conversations Component
 const ConversationsView = () => {
  const columns = [
   {
    title: t('chatbot.admin.userId'),
    dataIndex: 'userid',
    key: 'userid',
    width: 150,
    ellipsis: true,
   },
   {
    title: t('chatbot.admin.userType'),
    dataIndex: 'user_type',
    key: 'user_type',
    width: 80,
    render: (type) => <Tag color={getUserTypeColor(type)}>{type}</Tag>,
   },
   {
    title: t('chatbot.admin.message'),
    dataIndex: 'user_input',
    key: 'user_input',
    ellipsis: true,
    width: 200,
   },
   {
    title: t('chatbot.admin.response'),
    dataIndex: 'response',
    key: 'response',
    ellipsis: true,
    width: 250,
   },
   {
    title: t('chatbot.admin.source'),
    dataIndex: 'source',
    key: 'source',
    width: 80,
    render: (source) => <Tag color={getSourceColor(source)}>{source}</Tag>,
   },
   {
    title: t('chatbot.admin.language'),
    dataIndex: 'language',
    key: 'language',
    width: 60,
    render: (lang) => <Tag color="blue">{lang?.toUpperCase()}</Tag>,
   },
   {
    title: t('chatbot.admin.processingTime'),
    dataIndex: 'processing_time_ms',
    key: 'processing_time_ms',
    width: 80,
    render: (time) => (time ? Math.round(time) : '-'),
   },
   {
    title: t('chatbot.admin.date'),
    dataIndex: 'timestamp',
    key: 'timestamp',
    width: 120,
    render: (timestamp) =>
     new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
     }),
   },
  ];

  return (
   <div>
    <Card style={{ marginBottom: 16 }}>
     <Space size="middle" wrap>
      <Input
       placeholder={t('chatbot.admin.userIdPlaceholder')}
       value={conversationFilters.user_id}
       onChange={(e) =>
        setConversationFilters((prev) => ({ ...prev, user_id: e.target.value }))
       }
       style={{ width: 200 }}
      />
      <Select
       value={conversationFilters.limit}
       onChange={(value) =>
        setConversationFilters((prev) => ({ ...prev, limit: value }))
       }
       style={{ width: 120 }}
      >
       <Option value={50}>50</Option>
       <Option value={100}>100</Option>
       <Option value={200}>200</Option>
       <Option value={500}>500</Option>
      </Select>
      <Button
       type="primary"
       icon={<ReloadOutlined />}
       onClick={fetchConversations}
      >
       {t('chatbot.admin.refresh')}
      </Button>
     </Space>
    </Card>

    <Card>
     <Table
      columns={columns}
      dataSource={conversations}
      rowKey="id"
      scroll={{ x: 1200 }}
      pagination={{
       pageSize: 20,
       showSizeChanger: true,
       showQuickJumper: true,
       showTotal: (total) => `Total: ${total} conversations`,
      }}
     />
    </Card>
   </div>
  );
 };

 // Users Component
 const UsersView = () => (
  <Row gutter={[16, 16]}>
   <Col xs={24} lg={12}>
    <Card title={t('chatbot.admin.userStats')} bordered={false}>
     <Statistic
      title={t('chatbot.admin.totalUsers')}
      value={users?.total_unique_users || 0}
     />
     <Divider />
     <Statistic
      title={t('chatbot.admin.totalConversations')}
      value={users?.total_conversations || 0}
     />
     <Divider />
     <Statistic
      title={t('chatbot.admin.avgPerUser')}
      value={users?.average_conversations_per_user || 0}
      precision={2}
     />
    </Card>
   </Col>

   <Col xs={24} lg={12}>
    <Card title={t('chatbot.admin.distributionByType')} bordered={false}>
     {users?.user_types_distribution &&
      Object.entries(users.user_types_distribution).map(([type, count]) => (
       <div key={type} style={{ marginBottom: 16 }}>
        <div
         style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 4,
         }}
        >
         <Text strong>{type}</Text>
         <Text>
          {count} {t('chatbot.admin.usersCount')}
         </Text>
        </div>
        <Progress
         percent={(count / users.total_unique_users) * 100}
         strokeColor={getUserTypeColor(type)}
        />
       </div>
      ))}
    </Card>
   </Col>
  </Row>
 );

 // Prompts Configuration Component
 const PromptsView = () => (
  <div>
   <Card
    title={t('chatbot.admin.promptConfig')}
    extra={
     <Button
      type="primary"
      icon={<EditOutlined />}
      onClick={() => {
       if (prompts) {
        setPromptFormData(prompts);
        setPromptModalVisible(true);
       }
      }}
     >
      {t('chatbot.admin.edit')}
     </Button>
    }
   >
    {prompts ? (
     <Tabs defaultActiveKey="client">
      {Object.entries(prompts).map(([userType, config]) => (
       <Tabs.TabPane
        tab={userType.charAt(0).toUpperCase() + userType.slice(1)}
        key={userType}
       >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
         <div>
          <Title level={5}>{t('chatbot.admin.basePrompt')}</Title>
          <Paragraph
           style={{
            background: '#f5f5f5',
            padding: 12,
            borderRadius: 4,
            whiteSpace: 'pre-wrap',
           }}
          >
           {config.base_prompt}
          </Paragraph>
         </div>

         <div>
          <Title level={5}>{t('chatbot.admin.contextInstructions')}</Title>
          <Paragraph
           style={{
            background: '#f5f5f5',
            padding: 12,
            borderRadius: 4,
            whiteSpace: 'pre-wrap',
           }}
          >
           {config.context_instructions}
          </Paragraph>
         </div>

         <div>
          <Title level={5}>{t('chatbot.admin.responseGuidelines')}</Title>
          <Paragraph
           style={{
            background: '#f5f5f5',
            padding: 12,
            borderRadius: 4,
            whiteSpace: 'pre-wrap',
           }}
          >
           {config.response_guidelines}
          </Paragraph>
         </div>
        </Space>
       </Tabs.TabPane>
      ))}
     </Tabs>
    ) : (
     <Spin size="large" />
    )}
   </Card>

   <Modal
    title={t('chatbot.admin.editPrompts')}
    open={promptModalVisible}
    onCancel={() => setPromptModalVisible(false)}
    footer={[
     <Button key="cancel" onClick={() => setPromptModalVisible(false)}>
      {t('chatbot.admin.cancel')}
     </Button>,
     <Button
      key="submit"
      type="primary"
      loading={loading}
      onClick={updatePrompts}
     >
      {t('chatbot.admin.update')}
     </Button>,
    ]}
    width={800}
    destroyOnClose
   >
    <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
     {promptFormData &&
      Object.keys(promptFormData).map((userType) => (
       <div key={userType} style={{ marginBottom: 24 }}>
        <Title level={4}>
         {userType.charAt(0).toUpperCase() + userType.slice(1)}
        </Title>

        <div style={{ marginBottom: 16 }}>
         <Text strong>{t('chatbot.admin.basePrompt')}</Text>
         <TextArea
          rows={4}
          value={promptFormData[userType]?.base_prompt || ''}
          onChange={(e) =>
           handlePromptChange(userType, 'base_prompt', e.target.value)
          }
          placeholder={t('chatbot.admin.basePlaceholder')}
          style={{ marginTop: 8 }}
         />
        </div>

        <div style={{ marginBottom: 16 }}>
         <Text strong>{t('chatbot.admin.contextInstructions')}</Text>
         <TextArea
          rows={3}
          value={promptFormData[userType]?.context_instructions || ''}
          onChange={(e) =>
           handlePromptChange(userType, 'context_instructions', e.target.value)
          }
          placeholder={t('chatbot.admin.contextPlaceholder')}
          style={{ marginTop: 8 }}
         />
        </div>

        <div style={{ marginBottom: 16 }}>
         <Text strong>{t('chatbot.admin.responseGuidelines')}</Text>
         <TextArea
          rows={3}
          value={promptFormData[userType]?.response_guidelines || ''}
          onChange={(e) =>
           handlePromptChange(userType, 'response_guidelines', e.target.value)
          }
          placeholder={t('chatbot.admin.responsePlaceholder')}
          style={{ marginTop: 8 }}
         />
        </div>

        {Object.keys(promptFormData).indexOf(userType) <
         Object.keys(promptFormData).length - 1 && <Divider />}
       </div>
      ))}
    </div>
   </Modal>
  </div>
 );

 // Render content based on selected menu
 const renderContent = () => {
  switch (selectedMenu) {
   case 'dashboard':
    return <DashboardOverview />;
   case 'conversations':
    return <ConversationsView />;
   case 'users':
    return <UsersView />;
   case 'prompts':
    return <PromptsView />;
   default:
    return <DashboardOverview />;
  }
 };

 return (
  <Layout style={{ minHeight: '100vh' }}>
   <Head />
   <Header style={{ background: '#001529', padding: '0 24px' }}>
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
     <RobotOutlined style={{ fontSize: 24, color: 'white', marginRight: 16 }} />
     <Title level={3} style={{ color: 'white', margin: 0 }}>
      {t('chatbot.admin.title')}
     </Title>
    </div>
   </Header>

   <Layout>
    <Sider width={250} style={{ background: '#fff' }}>
     <div style={{ padding: 16 }}>
      {menuItems.map((item) => (
       <Button
        key={item.key}
        type={selectedMenu === item.key ? 'primary' : 'text'}
        icon={item.icon}
        onClick={() => setSelectedMenu(item.key)}
        style={{
         width: '100%',
         textAlign: 'left',
         marginBottom: 8,
         height: 40,
        }}
       >
        {item.label}
       </Button>
      ))}
     </div>
    </Sider>

    <Layout style={{ padding: 24 }}>
     <Content>{renderContent()}</Content>
    </Layout>
   </Layout>

   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default ChatbotAdminDashboard;
