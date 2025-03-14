import React, { useState, useEffect } from 'react';
import {
 Layout,
 Typography,
 Form,
 Select,
 DatePicker,
 InputNumber,
 Input,
 Button,
 Alert,
 Space,
 Card,
 Divider,
 Checkbox,
 message,
 Spin,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../../context/TranslationContext';
import useProperty from '../../../hooks/useProperty';
import { useConcierge } from '../../../hooks/useConcierge';
import { useReservation } from '../../../hooks/useReservation';
import useRevenue from '../../../hooks/useRevenue';
import useNotification from '../../../hooks/useNotification';
import dayjs from 'dayjs';
import Head from '../../../components/common/header';
import Foot from '../../../components/common/footer';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const CreateReservationForm = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const location = useLocation();
 const {
  properties: ownedProperties,
  fetchPropertiesbyClient,
  loading: ownedPropertiesLoading,
 } = useProperty();
 const { getConciergeProperties, loading: conciergePropertiesLoading } =
  useConcierge();
 const {
  createReservation,
  loading: reservationLoading,
  error: reservationError,
 } = useReservation();
 const { createRevenueFromReservation, loading: revenueLoading } = useRevenue();
 const { createNotification } = useNotification();
 const [managedProperties, setManagedProperties] = useState([]);
 const [allProperties, setAllProperties] = useState([]);
 const [form] = Form.useForm();
 const [selectedProperty, setSelectedProperty] = useState(null);
 const [dateRange, setDateRange] = useState(null);
 const [formError, setFormError] = useState(null);
 const [error, setError] = useState(null);
 const [fetchingProperties, setFetchingProperties] = useState(true);
 const [userId, setUserId] = useState(null);
 const [totalNights, setTotalNights] = useState(0);
 const [suggestedTotalPrice, setSuggestedTotalPrice] = useState(0);

 // Get propertyId from query params if available
 const queryParams = new URLSearchParams(location.search);
 const hashId = queryParams.get('hash');

 const handleUserData = (userData) => {
  setUserId(userData);
 };

 useEffect(() => {
  const fetchProperties = async () => {
   setFetchingProperties(true);
   try {
    if (userId) {
     // Fetch properties owned by the client
     await fetchPropertiesbyClient(userId);

     // Fetch properties managed by the concierge
     const conciergePropertiesResponse = await getConciergeProperties(userId);

     // Filter active properties and extract property details
     const activeProperties = conciergePropertiesResponse
      .filter((assignment) => assignment.status === 'active')
      .map((assignment) => assignment.property);

     setManagedProperties(activeProperties);
    }
   } catch (error) {
    console.error('Error fetching properties:', error);
    message.error(t('property.fetchError'));
   } finally {
    setFetchingProperties(false);
   }
  };

  fetchProperties();
 }, [userId]);

 // Combine owned and managed properties, ensuring no duplicates
 useEffect(() => {
  const ownedIds = new Set(ownedProperties.map((p) => p.id));
  const uniqueManagedProperties = managedProperties.filter(
   (p) => !ownedIds.has(p.id)
  );

  const combined = [
   ...ownedProperties.map((p) => ({ ...p, isOwned: true })),
   ...uniqueManagedProperties.map((p) => ({ ...p, isOwned: false })),
  ];

  setAllProperties(combined);
 }, [ownedProperties, managedProperties]);

 useEffect(() => {
  // If hashId is provided, find the corresponding property
  if (hashId && allProperties.length > 0) {
   const property = allProperties.find((p) => p.hashId === hashId);
   if (property) {
    form.setFieldsValue({ propertyId: property.id });
    setSelectedProperty(property);
   }
  }
 }, [hashId, allProperties, form]);

 // Calculate total nights and suggested total price when date range or property changes
 useEffect(() => {
  if (dateRange && dateRange.length === 2 && selectedProperty) {
   // Calculate total nights
   const nights = dateRange[1].diff(dateRange[0], 'day');
   setTotalNights(nights);

   // Calculate suggested total price based on property price per night and total nights
   const pricePerNight = selectedProperty.price || 0;
   const total = pricePerNight * nights;
   setSuggestedTotalPrice(total);

   // Update the form field
   form.setFieldsValue({ totalPrice: total });
  }
 }, [dateRange, selectedProperty, form]);

 const handlePropertyChange = (propertyId) => {
  const property = allProperties.find((p) => p.id === propertyId);
  setSelectedProperty(property);

  // Recalculate total price if date range exists
  if (dateRange && dateRange.length === 2 && property) {
   const nights = dateRange[1].diff(dateRange[0], 'day');
   const total = (property.price || 0) * nights;
   form.setFieldsValue({ totalPrice: total });
  }
 };

 const disabledDate = (current) => {
  // Can't select days before today
  return current && current < dayjs().startOf('day');
 };

 const handleDateRangeChange = (dates) => {
  setDateRange(dates);
 };

 const handleSubmit = async (values) => {
  setFormError(null);

  try {
   // Calculate price per night from total price and nights
   const nights = dayjs(values.dateRange[1]).diff(
    dayjs(values.dateRange[0]),
    'day'
   );

   const reservationData = {
    propertyId: values.propertyId,
    startDate: values.dateRange[0].format('YYYY-MM-DD'),
    endDate: values.dateRange[1].format('YYYY-MM-DD'),
    totalPrice: values.totalPrice,
    bookingSource: values.bookingSource,
    createdByUserId: userId,
    electronicLockEnabled: values.electronicLockEnabled || false,
    electronicLockCode: values.electronicLockEnabled
     ? values.electronicLockCode
     : null,
   };

   const data = await createReservation(reservationData);

   if (data) {
    message.success(t('reservation.createSuccess'));
    try {
     const property = allProperties.find((p) => p.id === values.propertyId);
     const propertyName = property ? property.name : 'Property';
     const month = values.dateRange[0].format('MMMM');
     const year = values.dateRange[0].format('YYYY');
     const revenueData = {
      propertyId: values.propertyId,
      amount: values.totalPrice,
      createdBy: userId,
      notes: values.revenueNotes || `Revenue from reservation #${data.id}`,
      startDate: values.dateRange[0].format('YYYY-MM-DD'),
      endDate: values.dateRange[1].format('YYYY-MM-DD'),
     };

     const revenueResult = await createRevenueFromReservation(
      data.id,
      revenueData
     );

     if (!revenueResult) {
      console.error('Failed to create revenue:', revenueData);
      message.warning(t('revenue.createWarning'));
     } else {
      message.success(t('reservation.createWithRevenueSuccess'));
     }

     // Create a notification for the revenue creation
     try {
      const notificationData = {
       userId: userId,
       propertyId: values.propertyId,
       title: 'New Revenue Update',
       message: `The revenue for ${propertyName} has been updated for ${month} ${year}`,
       type: 'revenue_update',
       channel: 'email',
       status: 'pending',
      };

      await createNotification(notificationData);
     } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue execution even if notification creation fails
     }
    } catch (revenueError) {
     console.error('Error creating revenue:', revenueError);
     message.warning(t('revenue.createWarning'));
    }
    // Navigate to the contract generation page
    navigate(`/generate-contract/${data.id}`);
   }
  } catch (error) {
   setFormError(error.message || 'Failed to create reservation');
   message.error(t('reservation.createError'));
  }
 };

 const isLoading =
  fetchingProperties ||
  ownedPropertiesLoading ||
  conciergePropertiesLoading ||
  reservationLoading ||
  revenueLoading;

 return (
  <Layout className="contentStyle">
   <Head onUserData={handleUserData} />
   <Content className="container">
    <Button
     type="link"
     icon={<ArrowLeftOutlined />}
     onClick={() => navigate(-1)}
    >
     {t('button.back')}
    </Button>

    <Title level={2}>{t('reservation.create.title')}</Title>

    <Card bordered={false} className="form-card">
     <Spin spinning={isLoading}>
      <Form
       form={form}
       layout="vertical"
       onFinish={handleSubmit}
       requiredMark={false}
      >
       <Form.Item
        name="propertyId"
        label={t('reservation.create.property')}
        rules={[
         { required: true, message: t('reservation.create.propertyRequired') },
        ]}
       >
        <Select
         placeholder={t('reservation.create.selectProperty')}
         onChange={handlePropertyChange}
         disabled={hashId !== null}
         optionFilterProp="children"
         showSearch
         filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
         }
        >
         {ownedProperties.length > 0 && (
          <Select.OptGroup label={t('property.owned')}>
           {ownedProperties.map((property) => (
            <Option key={`owned-${property.id}`} value={property.id}>
             {property.name}
            </Option>
           ))}
          </Select.OptGroup>
         )}

         {managedProperties.length > 0 && (
          <Select.OptGroup label={t('property.managed')}>
           {managedProperties.map((property) => (
            <Option key={`managed-${property.id}`} value={property.id}>
             {property.name}
            </Option>
           ))}
          </Select.OptGroup>
         )}
        </Select>
       </Form.Item>

       <Form.Item
        name="dateRange"
        label={t('reservation.create.dates')}
        rules={[
         { required: true, message: t('reservation.create.datesRequired') },
        ]}
       >
        <RangePicker
         style={{ width: '100%' }}
         disabledDate={disabledDate}
         onChange={handleDateRangeChange}
         format="YYYY-MM-DD"
        />
       </Form.Item>

       {totalNights > 0 && (
        <div style={{ marginBottom: 16 }}>
         <Text>{t('reservation.nights')}: </Text>
         <Text strong>{totalNights}</Text>
        </div>
       )}

       <Form.Item
        name="totalPrice"
        label={t('reservation.totalPrice')}
        tooltip={
         selectedProperty?.price
          ? t('property.basic.priceNight') +
            ': ' +
            selectedProperty.price +
            ' Dhs'
          : ''
        }
        rules={[
         { required: true, message: t('reservation.create.priceRequired') },
        ]}
       >
        <InputNumber min={0} addonAfter="Dhs" style={{ width: '100%' }} />
       </Form.Item>

       <Form.Item
        name="bookingSource"
        label={t('reservation.create.bookingSource')}
       >
        <Select placeholder={t('reservation.create.selectSource')}>
         <Option value="direct">{t('reservation.sources.direct')}</Option>
         <Option value="airbnb">Airbnb</Option>
         <Option value="booking">Booking.com</Option>
         <Option value="expedia">Expedia</Option>
         <Option value="other">{t('reservation.sources.other')}</Option>
        </Select>
       </Form.Item>

       <Form.Item name="electronicLockEnabled" valuePropName="checked">
        <Checkbox>{t('reservation.lock.enableLock')}</Checkbox>
       </Form.Item>

       <Form.Item
        name="electronicLockCode"
        label={t('reservation.lock.code')}
        dependencies={['electronicLockEnabled']}
        rules={[
         ({ getFieldValue }) => ({
          validator(_, value) {
           const enabled = getFieldValue('electronicLockEnabled');
           if (!enabled) return Promise.resolve();

           if (!value && enabled) {
            return Promise.reject(
             new Error(t('reservation.lock.codeRequired'))
            );
           }

           if (
            value &&
            (!/^\d+$/.test(value) || value.toString().length !== 6)
           ) {
            return Promise.reject(
             new Error(t('reservation.lock.codeValidation'))
            );
           }

           return Promise.resolve();
          },
         }),
        ]}
       >
        <InputNumber
         disabled={!Form.useWatch('electronicLockEnabled', form)}
         placeholder="123456"
         style={{ width: '100%' }}
         min={100000}
         max={999999}
        />
       </Form.Item>

       {error && (
        <Alert
         message={t('reservation.create.error')}
         description={error}
         type="error"
         showIcon
         style={{ marginBottom: 24 }}
        />
       )}

       <Divider />

       <Form.Item>
        <Space
         size="middle"
         style={{ display: 'flex', justifyContent: 'flex-end' }}
        >
         <Button onClick={() => navigate(-1)}>{t('common.cancel')}</Button>
         <Button type="primary" htmlType="submit" loading={isLoading}>
          {t('reservation.create.submit')}
         </Button>
        </Space>
       </Form.Item>
      </Form>
     </Spin>
    </Card>
   </Content>
   <Foot />
  </Layout>
 );
};

export default CreateReservationForm;
