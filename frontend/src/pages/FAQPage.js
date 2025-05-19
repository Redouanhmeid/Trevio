import React, { useState, useMemo } from 'react';
import {
 Layout,
 Typography,
 Card,
 Input,
 Button,
 Space,
 Collapse,
 Tabs,
 Grid,
 FloatButton,
 Flex,
 Empty,
 Divider,
} from 'antd';
import {
 ArrowLeftOutlined,
 SearchOutlined,
 QuestionCircleOutlined,
 MailOutlined,
 MessageOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../context/TranslationContext';
import { Helmet } from 'react-helmet';
import Sidebar from '../components/common/sidebar';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

const FAQPage = ({
 reservationCode,
 showBackButton = true,
 showSidebar = true,
 embedded = false,
}) => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const [collapsed, setCollapsed] = useState(true);
 const [searchTerm, setSearchTerm] = useState('');
 const [activeCategory, setActiveCategory] = useState('general');
 const screens = useBreakpoint();

 const handleBack = () => {
  navigate(-1);
 };

 const handleContactSupport = () => {
  window.location.href = `mailto:${t('faq.contactSupport.email')}`;
 };

 // Get all FAQ categories
 const categories = [
  {
   key: 'general',
   label: t('faq.categories.general'),
   icon: 'fa-info-circle',
  },
  {
   key: 'booking',
   label: t('faq.categories.booking'),
   icon: 'fa-calendar-check',
  },
  { key: 'property', label: t('faq.categories.property'), icon: 'fa-house' },
  { key: 'guest', label: t('faq.categories.guest'), icon: 'fa-users' },
  { key: 'technical', label: t('faq.categories.technical'), icon: 'fa-wrench' },
  {
   key: 'billing',
   label: t('faq.categories.billing'),
   icon: 'fa-credit-card',
  },
 ];

 // Filter FAQs based on search term
 const filteredFAQs = useMemo(() => {
  const allFAQs = {};

  categories.forEach((category) => {
   const categoryQuestions = t(`faq.questions.${category.key}`);

   // Ensure categoryQuestions is an array
   const questionsArray = Array.isArray(categoryQuestions)
    ? categoryQuestions
    : [];

   if (searchTerm) {
    const filtered = questionsArray.filter(
     (faq) =>
      faq &&
      faq.question &&
      faq.answer &&
      (faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
       faq.answer.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    if (filtered.length > 0) {
     allFAQs[category.key] = filtered;
    }
   } else {
    if (questionsArray.length > 0) {
     allFAQs[category.key] = questionsArray;
    }
   }
  });

  return allFAQs;
 }, [searchTerm, t, categories]);

 // Create tab items for each category
 const tabItems = categories.map((category) => ({
  key: category.key,
  label: (
   <Space>
    <i className={`fa-light ${category.icon}`} style={{ color: '#6D5FFA' }} />
    {category.label}
   </Space>
  ),
  children: (
   <div>
    {filteredFAQs[category.key] && filteredFAQs[category.key].length > 0 ? (
     <Collapse
      ghost
      size="large"
      expandIconPosition="end"
      items={filteredFAQs[category.key]
       .map((faq, index) => {
        // Safety check for faq object
        if (!faq || !faq.question || !faq.answer) {
         return null;
        }

        return {
         key: `${category.key}-${index}`,
         label: (
          <Title level={5} style={{ margin: 0, color: '#333' }}>
           {faq.question}
          </Title>
         ),
         children: (
          <Paragraph style={{ fontSize: 16, lineHeight: 1.8, color: '#666' }}>
           {faq.answer}
          </Paragraph>
         ),
        };
       })
       .filter(Boolean)} // Remove null items
     />
    ) : (
     <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={t('faq.noResults')}
      style={{ margin: '40px 0' }}
     />
    )}
   </div>
  ),
 }));

 const content = (
  <>
   <Helmet>
    <link
     rel="stylesheet"
     href="https://site-assets.fontawesome.com/releases/v6.4.2/css/all.css"
    />
    <title>{t('faq.title')} - Trevio</title>
   </Helmet>

   {showBackButton && (
    <Button
     type="link"
     icon={<ArrowLeftOutlined />}
     onClick={handleBack}
     style={{ marginBottom: 16, padding: 0 }}
    >
     {t('button.back')}
    </Button>
   )}

   {/* Header */}
   <Card style={{ marginBottom: 24 }} bordered={false}>
    <Flex justify="center" align="center" vertical style={{ marginBottom: 32 }}>
     <QuestionCircleOutlined
      style={{ fontSize: 64, color: '#6D5FFA', marginBottom: 16 }}
     />
     <Title
      level={1}
      style={{ textAlign: 'center', color: '#6D5FFA', marginBottom: 16 }}
     >
      {t('faq.title')}
     </Title>
     <Text
      type="secondary"
      style={{ fontSize: 18, textAlign: 'center', maxWidth: 600 }}
     >
      Find answers to the most frequently asked questions about Trevio
     </Text>
    </Flex>

    {/* Search Bar */}
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
     <Search
      placeholder={t('faq.searchPlaceholder')}
      allowClear
      enterButton={<SearchOutlined />}
      size="large"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      style={{ width: '100%' }}
     />
    </div>
   </Card>

   {/* FAQ Content */}
   <Card bordered={false} className="faq-content-card">
    {searchTerm ? (
     // Show search results across all categories
     <div>
      <Title level={3} style={{ marginBottom: 24 }}>
       Search Results{' '}
       {Object.keys(filteredFAQs).length > 0 &&
        `(${Object.values(filteredFAQs).reduce(
         (acc, curr) => acc + curr.length,
         0
        )} results)`}
      </Title>
      {Object.keys(filteredFAQs).length === 0 ? (
       <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={t('faq.noResults')}
        style={{ margin: '40px 0' }}
       />
      ) : (
       Object.entries(filteredFAQs).map(([categoryKey, faqs]) => (
        <div key={categoryKey} style={{ marginBottom: 32 }}>
         <Title level={4} style={{ color: '#6D5FFA' }}>
          {categories.find((cat) => cat.key === categoryKey)?.label}
         </Title>
         <Collapse
          ghost
          size="large"
          expandIconPosition="end"
          items={
           Array.isArray(faqs)
            ? faqs
               .map((faq, index) => {
                // Safety check for faq object
                if (!faq || !faq.question || !faq.answer) {
                 return null;
                }

                return {
                 key: `${categoryKey}-${index}`,
                 label: (
                  <Title level={5} style={{ margin: 0, color: '#333' }}>
                   {faq.question}
                  </Title>
                 ),
                 children: (
                  <Paragraph
                   style={{ fontSize: 16, lineHeight: 1.8, color: '#666' }}
                  >
                   {faq.answer}
                  </Paragraph>
                 ),
                };
               })
               .filter(Boolean)
            : []
          } // Remove null items and ensure array
         />
        </div>
       ))
      )}
     </div>
    ) : (
     // Show tabbed categories
     <Tabs
      type="card"
      items={tabItems}
      activeKey={activeCategory}
      onChange={setActiveCategory}
      tabPosition={screens.xs ? 'top' : 'left'}
      style={{
       minHeight: screens.xs ? 'auto' : 500,
      }}
     />
    )}
   </Card>

   {/* Contact Support Card */}
   <Card
    style={{
     marginTop: 32,
     backgroundColor: '#f8f9ff',
     border: '1px solid #e8e9ff',
     textAlign: 'center',
    }}
    bordered={false}
   >
    <MessageOutlined
     style={{ fontSize: 48, color: '#6D5FFA', marginBottom: 16 }}
    />
    <Title level={3} style={{ color: '#6D5FFA' }}>
     {t('faq.contactSupport.title')}
    </Title>
    <Paragraph style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
     {t('faq.contactSupport.description')}
    </Paragraph>
    <Button
     type="primary"
     size="large"
     icon={<MailOutlined />}
     onClick={handleContactSupport}
    >
     {t('faq.contactSupport.button')}
    </Button>
   </Card>

   <FloatButton.BackTop />
  </>
 );

 if (embedded) {
  return content;
 }

 return (
  <Layout>
   {showSidebar && (
    <Sidebar reservationCode={reservationCode} onCollapse={setCollapsed} />
   )}
   <Layout className="contentStyle">
    <Content className="container">{content}</Content>
   </Layout>
  </Layout>
 );
};

export default FAQPage;
