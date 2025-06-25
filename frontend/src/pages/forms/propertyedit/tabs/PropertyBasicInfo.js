import React, { useState, useEffect } from 'react';
import {
 Row,
 Col,
 Form,
 Input,
 Button,
 Typography,
 Radio,
 message,
 Card,
 Alert,
 Divider,
 Spin,
 InputNumber,
 Space,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useTranslation } from '../../../../context/TranslationContext';
import useUpdateProperty from '../../../../hooks/useUpdateProperty';
import MapPicker from '../../propertypost/MapPicker';

const { Title, Text } = Typography;
const { TextArea } = Input;

const PropertyBasicInfo = ({ property, propertyId, onPropertyUpdated }) => {
 const { t } = useTranslation();
 const [form] = Form.useForm();
 const { updatePropertyBasicInfo, isLoading, success } =
  useUpdateProperty(propertyId);

 const [checkedType, setCheckedType] = useState(property?.type || null);
 const [saving, setSaving] = useState(false);

 const [mapValues, setMapValues] = useState({
  latitude: property?.latitude || null,
  longitude: property?.longitude || null,
  placeName: property?.placeName || null,
 });

 // Property type options
 const propertyTypes = [
  {
   label: t('type.house'),
   value: 'house',
   icon: <i className="Radioicon fa-light fa-house"></i>,
  },
  {
   label: t('type.apartment'),
   value: 'apartment',
   icon: <i className="Radioicon fa-light fa-building"></i>,
  },
  {
   label: t('type.guesthouse'),
   value: 'guesthouse',
   icon: <i className="Radioicon fa-light fa-house-user"></i>,
  },
 ];

 // Set initial form values from property - only run once when property is loaded
 useEffect(() => {
  if (property) {
   // Set form values
   form.setFieldsValue({
    type: property.type,
    name: property.name,
    description: property.description,
    price: property.price,
    capacity: property.capacity,
    rooms: property.rooms,
    beds: property.beds,
    airbnbUrl: property.airbnbUrl,
    bookingUrl: property.bookingUrl,
   });

   setCheckedType(property.type);

   setMapValues({
    latitude: property.latitude,
    longitude: property.longitude,
    placeName: property.placeName,
   });
  }
 }, [property?.id]); // Only run when property ID changes

 // Handle radio change
 const handleRadioChange = (e) => {
  setCheckedType(e.target.value);
 };

 // Handle place selection from MapPicker
 const handlePlaceSelected = ({ latitude, longitude, placeName }) => {
  setMapValues({
   latitude,
   longitude,
   placeName,
  });
 };

 // Handle form submission
 const handleSubmit = async () => {
  // Check if map values are present
  if (!mapValues.latitude || !mapValues.longitude || !mapValues.placeName) {
   message.error(t('validation.selectLocation'));
   return;
  }
  setSaving(true);
  try {
   const values = await form.validateFields();

   // Basic information update
   await updatePropertyBasicInfo({
    type: values.type,
    name: values.name,
    description: values.description,
    price: values.price,
    capacity: values.capacity,
    rooms: values.rooms,
    beds: values.beds,
    airbnbUrl: values.airbnbUrl,
    bookingUrl: values.bookingUrl,
    latitude: mapValues.latitude,
    longitude: mapValues.longitude,
    placeName: mapValues.placeName,
   });
   if (onPropertyUpdated) {
    onPropertyUpdated();
   }
  } catch (error) {
   console.error('Error updating property:', error);
   message.error(t('messages.updateError'));
  } finally {
   setSaving(false);
  }
 };

 if (!property) {
  return <Spin size="large" />;
 }

 return (
  <Form
   form={form}
   layout="vertical"
   onFinish={handleSubmit}
   initialValues={property}
   size="large"
  >
   <Title level={4} style={{ margin: 0 }}>
    <i
     className="fa-light fa-circle-info"
     style={{ marginRight: 8, padding: 0 }}
    />
    {t('property.basic.title')}
   </Title>
   <Row gutter={[24, 16]}>
    <Col xs={24} md={24}>
     <Form.Item
      label={t('property.basic.type')}
      name="type"
      rules={[
       {
        required: true,
        message: t('validation.selectType'),
       },
      ]}
     >
      <Radio.Group value={checkedType} onChange={handleRadioChange}>
       <div className="customRadioGroup">
        {propertyTypes.map((PropertyType) => (
         <div className="customRadioContainer" key={PropertyType.value}>
          <Radio value={PropertyType.value}>
           <div
            className={
             checkedType === PropertyType.value
              ? 'customRadioButton customRadioChecked'
              : 'customRadioButton'
            }
           >
            {PropertyType.icon}
            <div>{PropertyType.label}</div>
           </div>
          </Radio>
         </div>
        ))}
       </div>
      </Radio.Group>
     </Form.Item>
    </Col>

    <Col xs={24} md={12}>
     <Form.Item
      name="name"
      label={t('property.basic.name')}
      rules={[{ required: true, message: t('validation.enterName') }]}
     >
      <Input />
     </Form.Item>
    </Col>

    <Col xs={24} md={12}>
     <Form.Item label={t('property.basic.price')} name="price">
      <InputNumber min={0} addonAfter="Dhs" style={{ width: '100%' }} />
     </Form.Item>
    </Col>

    <Col xs={24}>
     <Form.Item
      name="description"
      label={t('property.basic.description')}
      rules={[{ required: true, message: t('validation.enterDescription') }]}
     >
      <TextArea showCount maxLength={500} rows={4} />
     </Form.Item>
    </Col>

    <Col xs={12} md={4}>
     <Form.Item label={t('property.basic.capacity')} name="capacity">
      <InputNumber min={0} style={{ width: '100%' }} />
     </Form.Item>
    </Col>

    <Col xs={6} md={4}>
     <Form.Item label={t('property.basic.rooms')} name="rooms">
      <InputNumber min={0} style={{ width: '100%' }} />
     </Form.Item>
    </Col>

    <Col xs={6} md={4}>
     <Form.Item label={t('property.basic.beds')} name="beds">
      <InputNumber min={0} style={{ width: '100%' }} />
     </Form.Item>
    </Col>

    <Col xs={24} md={12}>
     <Form.Item name="airbnbUrl" label={t('property.basic.airbnbUrl')}>
      <Input />
     </Form.Item>
    </Col>

    <Col xs={24} md={12}>
     <Form.Item name="bookingUrl" label={t('property.basic.bookingUrl')}>
      <Input />
     </Form.Item>
    </Col>

    <Col xs={24}>
     <Divider />
     <Title level={5}>{t('property.basic.location')}</Title>

     <Form.Item
      label={t('property.basic.selectLocation')}
      required
      className="hide-required-mark"
      rules={[
       {
        validator: (_, value) => {
         if (
          !mapValues.latitude ||
          !mapValues.longitude ||
          !mapValues.placeName
         ) {
          return Promise.reject(t('property.basic.selectLocation'));
         }
         return Promise.resolve();
        },
       },
      ]}
     >
      <MapPicker
       onPlaceSelected={handlePlaceSelected}
       initialPosition={{
        lat: property.latitude,
        lng: property.longitude,
       }}
       initialPlaceName={property.placeName}
      />
     </Form.Item>
    </Col>
   </Row>

   {/* Submit button */}
   <Form.Item>
    <Space>
     <Button
      type="primary"
      onClick={handleSubmit}
      loading={saving || isLoading}
      icon={<SaveOutlined />}
      size="large"
     >
      {success ? t('messages.updateSuccess') : t('button.save')}
     </Button>
    </Space>
   </Form.Item>
  </Form>
 );
};

export default PropertyBasicInfo;
