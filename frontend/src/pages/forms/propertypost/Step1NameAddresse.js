import React, { useState, useEffect } from 'react';
import {
 Layout,
 Form,
 Typography,
 Row,
 Col,
 Input,
 Button,
 Radio,
 Spin,
 Grid,
 message,
} from 'antd';
import DashboardHeader from '../../../components/common/DashboardHeader';
import Foot from '../../../components/common/footer';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useAuthContext } from '../../../hooks/useAuthContext';
import { useUserData } from '../../../hooks/useUserData';
import useCreateProperty from '../../../hooks/useCreateProperty';
import MapPicker from './MapPicker';
import airbnb from '../../../assets/airbnb.png';
import booking from '../../../assets/booking.png';
import { useTranslation } from '../../../context/TranslationContext';

const { Content } = Layout;
const { Title } = Typography;

const Step1NameAddresse = ({ next, handleFormData, values, ProgressSteps }) => {
 const { user } = useAuthContext();
 const User = user || JSON.parse(localStorage.getItem('user'));
 const { userData, getUserData } = useUserData();
 const { t } = useTranslation();
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();

 const { loading, error, success, propertyId, createProperty } =
  useCreateProperty();
 const [form] = Form.useForm();
 const [checkedType, setCheckedType] = useState(null);
 const [mapValues, setMapValues] = useState({
  latitude: null,
  longitude: null,
  placeName: null,
 });

 useEffect(() => {
  if (User) {
   getUserData(User.email);
  }
 }, [User]);

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

 const handleRadioChange = (e) => {
  setCheckedType(e.target.value);
 };

 const handlePlaceSelected = ({ latitude, longitude, placeName }) => {
  setMapValues({
   latitude,
   longitude,
   placeName,
  });
  // Update form data
  handleFormData('latitude')({ target: { value: latitude } });
  handleFormData('longitude')({ target: { value: longitude } });
  handleFormData('placeName')({ target: { value: placeName } });
 };

 const submitFormData = async () => {
  // Check if map values are present
  if (!mapValues.latitude || !mapValues.longitude || !mapValues.placeName) {
   message.error(t('validation.selectLocation'));
   return;
  }

  try {
   await form.validateFields();

   const completeFormData = {
    name: values.name,
    description: values.description,
    type: checkedType,
    airbnbUrl: values.airbnbUrl?.trim() ? values.airbnbUrl : '',
    bookingUrl: values.bookingUrl?.trim() ? values.bookingUrl : '',
    latitude: mapValues.latitude,
    longitude: mapValues.longitude,
    placeName: mapValues.placeName,
    clientId: userData.id,
   };

   // Create the property
   const newProperty = await createProperty(completeFormData);

   if (newProperty) {
    // Update form data as before
    Object.entries(completeFormData).forEach(([key, value]) => {
     handleFormData(key)({ target: { value } });
    });
    // Store the property ID for later use
    handleFormData('propertyId')({ target: { value: newProperty.id } });
    next();
   } else {
    message.error(t('validation.createProperty'));
   }
  } catch (info) {
   console.log('Validate Failed:', info);
  }
 };

 return (
  <Layout className="contentStyle">
   <DashboardHeader />
   <Content className="container-form">
    <ProgressSteps />
    <Form
     form={form}
     name="step1"
     layout="vertical"
     onFinish={submitFormData}
     size="large"
    >
     <Title level={4}>{t('property.basic.title')}</Title>
     <Row gutter={[24, 0]}>
      <Col xs={24} md={24}>
       <Form.Item
        label={t('type.select')}
        name="type"
        className="hide-required-mark"
        rules={[
         {
          required: true,
          message: t('type.select'),
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

      <Col xs={24} md={24}>
       <Form.Item
        label={t('property.basic.name')}
        name="name"
        className="hide-required-mark"
        rules={[
         {
          required: true,
          message: t('validation.enterName'),
         },
        ]}
       >
        <Input onChange={handleFormData('name')} />
       </Form.Item>
      </Col>

      <Col xs={24} md={24}>
       <Form.Item
        label={t('property.basic.description')}
        name="description"
        className="hide-required-mark"
        rules={[
         {
          required: true,
          message: t('validation.enterDescription'),
         },
        ]}
       >
        <Input.TextArea
         rows={6}
         onChange={handleFormData('description')}
         showCount
         maxLength={500}
        />
       </Form.Item>
      </Col>

      <Col xs={24} md={12}>
       <Form.Item
        label={t('property.basic.airbnbUrl')}
        name="airbnbUrl"
        rules={[
         {
          type: 'url',
          message: t('validation.validUrl'),
         },
        ]}
       >
        <Input
         onChange={handleFormData('airbnbUrl')}
         prefix={
          <img src={airbnb} alt="prefix" style={{ width: 24, height: 24 }} />
         }
        />
       </Form.Item>
      </Col>

      <Col xs={24} md={12}>
       <Form.Item
        label={t('property.basic.bookingUrl')}
        name="bookingUrl"
        rules={[
         {
          type: 'url',
          message: t('validation.validUrl'),
         },
        ]}
       >
        <Input
         onChange={handleFormData('bookingUrl')}
         prefix={
          <img src={booking} alt="prefix" style={{ width: 24, height: 24 }} />
         }
        />
       </Form.Item>
      </Col>

      <Col xs={24} md={24}>
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
        <MapPicker onPlaceSelected={handlePlaceSelected} />
       </Form.Item>
      </Col>
     </Row>
     <br />
     <Row justify="center">
      <Col xs={12} md={12}>
       <Form.Item>
        <Button type="primary" htmlType="submit" block>
         {t('button.continue')} {<ArrowRightOutlined />}
        </Button>
       </Form.Item>
      </Col>
     </Row>
    </Form>
   </Content>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default Step1NameAddresse;
