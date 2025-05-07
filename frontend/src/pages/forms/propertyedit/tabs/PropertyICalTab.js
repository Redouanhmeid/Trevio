import React, { useState, useEffect } from 'react';
import {
 Row,
 Col,
 Form,
 Input,
 Button,
 Typography,
 message,
 Card,
 Alert,
 Divider,
 List,
 Popconfirm,
 Select,
} from 'antd';
import { SaveOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from '../../../../context/TranslationContext';
import useUpdateProperty from '../../../../hooks/useUpdateProperty';
import { parseICalLinks } from '../../../../utils/utils';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Available booking platforms
const BOOKING_PLATFORMS = [
 'Airbnb',
 'Booking.com',
 'Expedia',
 'VRBO',
 'HomeAway',
 'TripAdvisor',
 'Other',
];

const PropertyICalTab = (props) => {
 const { property = {}, propertyId, onPropertyUpdated } = props;
 const { t } = useTranslation();
 const [form] = Form.useForm();

 const { updatePropertyICalLinks, isLoading, success } =
  useUpdateProperty(propertyId);

 const [saving, setSaving] = useState(false);
 const [iCalLinks, setICalLinks] = useState([]);
 const [newSource, setNewSource] = useState(undefined);
 const [newUrl, setNewUrl] = useState('');

 // Set initial form values from property
 useEffect(() => {
  if (property) {
   // Handle iCal links - ensure it's an array
   const links = parseICalLinks(property.iCalLinks);
   setICalLinks(links);
  }
 }, [property]); // Run when property changes

 // Get the list of platforms that are already added
 const getUsedPlatforms = () => {
  return iCalLinks.map((link) => link.source);
 };

 // Filter out already used platforms from the dropdown options
 const getAvailablePlatforms = () => {
  const usedPlatforms = getUsedPlatforms();
  return BOOKING_PLATFORMS.filter(
   (platform) => !usedPlatforms.includes(platform)
  );
 };

 // Handle adding a new iCal link
 const handleAddLink = () => {
  // Validate inputs
  if (!newSource || !newUrl) {
   message.error(t('ical.validation.fieldsRequired'));
   return;
  }

  // Check if this platform already exists
  if (iCalLinks.some((link) => link.source === newSource)) {
   message.error(t('ical.validation.platformExists'));
   return;
  }

  // Validate URL format
  try {
   new URL(newUrl);
  } catch (e) {
   message.error(t('ical.validation.invalidUrl'));
   return;
  }

  // Add new link
  const updatedLinks = [
   ...iCalLinks,
   { source: newSource, url: newUrl, id: Date.now().toString() },
  ];

  setICalLinks(updatedLinks);
  setNewSource(undefined);
  setNewUrl('');
 };

 // Handle removing an iCal link
 const handleRemoveLink = (id) => {
  setTimeout(() => {
   const updatedLinks = iCalLinks.filter((link) => link.id !== id);
   setICalLinks(updatedLinks);
  }, 0);
 };

 // Handle form submission
 const handleSubmit = async () => {
  setSaving(true);
  try {
   // Update iCal links
   await updatePropertyICalLinks({ iCalLinks: iCalLinks });

   message.success(t('ical.saveSuccess'));

   if (onPropertyUpdated) {
    onPropertyUpdated();
   }
  } catch (error) {
   console.error('Error updating iCal links:', error);
   message.error(t('messages.updateError'));
  } finally {
   setSaving(false);
  }
 };

 if (!propertyId) {
  return <Alert message={t('property.notFound')} type="error" />;
 }

 // Custom render for list item actions to avoid ResizeObserver issues
 const renderListItemActions = (item) => {
  return [
   <Popconfirm
    key={`delete-${item.id}`}
    title={t('ical.confirmRemove')}
    description={t('ical.confirmRemoveDescription')}
    onConfirm={() => handleRemoveLink(item.id)}
    okText={t('common.yes')}
    cancelText={t('common.no')}
    placement="left"
   >
    <Button type="text" danger style={{ padding: '4px 8px' }}>
     <i className="fa-regular fa-trash" />
    </Button>
   </Popconfirm>,
  ];
 };

 return (
  <Form form={form} layout="vertical" onFinish={handleSubmit}>
   <Card
    bordered={false}
    title={
     <Title level={4} style={{ margin: 0 }}>
      <i className="fa-light fa-calendar-days" style={{ marginRight: 8 }} />
      {t('ical.title')}
     </Title>
    }
   >
    <Row gutter={[24, 16]}>
     <Col xs={24}>
      <Paragraph>{t('ical.description')}</Paragraph>

      <Alert
       message={t('ical.infoTitle')}
       description={
        <>
         <p>{t('ical.airbnbInstruction')}</p>
         <p>{t('ical.bookingInstruction')}</p>
        </>
       }
       type="info"
       showIcon
       style={{ marginBottom: 24 }}
      />
     </Col>

     <Col xs={24}>
      <Title level={5}>{t('ical.existingLinks')}</Title>
      {iCalLinks.length === 0 ? (
       <Text type="secondary">{t('ical.noLinks')}</Text>
      ) : (
       <List
        bordered
        dataSource={iCalLinks}
        renderItem={(item) => (
         <List.Item actions={renderListItemActions(item)}>
          <List.Item.Meta title={item.source} description={item.url} />
         </List.Item>
        )}
       />
      )}
     </Col>

     <Col xs={24}>
      <Divider />
      <Title level={5}>{t('ical.addNewLink')}</Title>
      <Row gutter={[16, 16]}>
       <Col xs={24} md={6}>
        <Select
         placeholder={t('ical.sourcePlaceholder')}
         value={newSource}
         onChange={setNewSource}
         style={{ width: '100%' }}
         size="large"
         disabled={getAvailablePlatforms().length === 0}
        >
         {getAvailablePlatforms().map((platform) => (
          <Option key={platform} value={platform}>
           {platform}
          </Option>
         ))}
        </Select>
        {getAvailablePlatforms().length === 0 && (
         <Text type="warning" style={{ fontSize: '12px' }}>
          {t('ical.allPlatformsAdded')}
         </Text>
        )}
       </Col>
       <Col xs={24} md={14}>
        <Input
         placeholder={t('ical.urlPlaceholder')}
         value={newUrl}
         onChange={(e) => setNewUrl(e.target.value)}
         size="large"
        />
       </Col>
       <Col xs={24} md={4}>
        <Button
         type="primary"
         icon={<PlusOutlined />}
         onClick={handleAddLink}
         block
         disabled={getAvailablePlatforms().length === 0}
         size="large"
        >
         {t('ical.addButton')}
        </Button>
       </Col>
      </Row>
     </Col>
    </Row>
   </Card>

   {/* Submit button */}
   <Form.Item style={{ marginTop: 24 }}>
    <Button
     type="primary"
     onClick={handleSubmit}
     loading={saving || isLoading}
     icon={<SaveOutlined />}
     size="large"
    >
     {success ? t('messages.updateSuccess') : t('button.save')}
    </Button>
   </Form.Item>
  </Form>
 );
};

export default PropertyICalTab;
