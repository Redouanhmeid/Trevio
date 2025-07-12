import React, { useState, useEffect, useCallback } from 'react';
import {
 Layout,
 Typography,
 Form,
 Select,
 InputNumber,
 Input,
 Button,
 Alert,
 Space,
 Card,
 Divider,
 Checkbox,
 message,
 Grid,
 Spin,
 Popover,
} from 'antd';
import {
 ArrowLeftOutlined,
 LockOutlined,
 InfoCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../../context/TranslationContext';
import useProperty from '../../../hooks/useProperty';
import { useConcierge } from '../../../hooks/useConcierge';
import { useReservation } from '../../../hooks/useReservation';
import useRevenue from '../../../hooks/useRevenue';
import useNotification from '../../../hooks/useNotification';
import dayjs from 'dayjs';
// Import the isBetween plugin
import isBetweenPlugin from 'dayjs/plugin/isBetween';
import Head from '../../../components/common/header';
import Foot from '../../../components/common/footer';
import ResponsiveDatePicker from './ResponsiveDatePicker';

// Extend dayjs with the isBetween plugin
dayjs.extend(isBetweenPlugin);

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const CreateReservationForm = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const location = useLocation();
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();
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
  checkAvailability,
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

 // state for handling reserved dates
 const [reservedDates, setReservedDates] = useState([]);
 const [checkingAvailability, setCheckingAvailability] = useState(false);
 const [availabilityError, setAvailabilityError] = useState(null);

 // Lock code visibility state
 const [codeVisible, setCodeVisible] = useState(false);

 // Get form values using useWatch at the top level
 const lockEnabled = Form.useWatch('electronicLockEnabled', form);
 const lockCode = Form.useWatch('electronicLockCode', form);

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
    message.error(t('property.messages.fetchError'));
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

    // Fetch reserved dates for this property
    fetchReservedDates(property.id);
   }
  }
 }, [hashId, allProperties, form]);

 // Calculate total nights and suggested total price when date range or property changes
 useEffect(() => {
  if (
   dateRange &&
   dateRange.length === 2 &&
   dateRange[0] &&
   dateRange[1] &&
   selectedProperty
  ) {
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

 const fetchReservedDates = useCallback(
  async (propertyId) => {
   if (!propertyId) return;

   try {
    setCheckingAvailability(true);
    setAvailabilityError(null);

    // We'll make a request that covers the next year to get all upcoming reservations
    const startDate = dayjs().format('YYYY-MM-DD');
    const endDate = dayjs().add(1, 'year').format('YYYY-MM-DD');

    const result = await checkAvailability(propertyId, startDate, endDate);

    if (
     result &&
     result.conflictingReservations &&
     result.conflictingReservations.length > 0
    ) {
     // Transform conflicting reservations to disable date ranges
     const reservedDateRanges = result.conflictingReservations.map(
      (reservation) => ({
       startDate: dayjs(reservation.startDate),
       endDate: dayjs(reservation.endDate),
      })
     );

     setReservedDates(reservedDateRanges);
    } else {
     setReservedDates([]);
    }
   } catch (error) {
    console.error('Error fetching reserved dates:', error);
    setAvailabilityError(error.message);
   } finally {
    setCheckingAvailability(false);
   }
  },
  [checkAvailability]
 );

 const handlePropertyChange = (propertyId) => {
  const property = allProperties.find((p) => p.id === propertyId);
  setSelectedProperty(property);

  form.setFieldsValue({ dateRange: null });
  setDateRange(null);

  fetchReservedDates(propertyId);

  // Recalculate total price if date range exists
  if (
   dateRange &&
   dateRange.length === 2 &&
   dateRange[0] &&
   dateRange[1] &&
   property
  ) {
   const nights = dateRange[1].diff(dateRange[0], 'day');
   const total = (property.price || 0) * nights;
   form.setFieldsValue({ totalPrice: total });
  }
 };

 const disabledDate = (current) => {
  // Can't select days before today
  if (current && current < dayjs().startOf('day')) {
   return true;
  }

  // Only check reserved dates if we have a selected property and reserved dates
  if (selectedProperty && reservedDates.length > 0) {
   return reservedDates.some((reservation) => {
    return current.isBetween(
     reservation.startDate.startOf('day'),
     reservation.endDate.endOf('day'),
     null,
     '[]' // inclusive
    );
   });
  }

  return false;
 };

 const handleDateRangeChange = (dates) => {
  setDateRange(dates);

  // Check availability as the user selects dates
  if (dates && dates.length === 2 && dates[0] && dates[1] && selectedProperty) {
   validateDateRangeAvailability(selectedProperty.id, dates[0], dates[1]);
  }
 };

 const validateDateRangeAvailability = async (
  propertyId,
  startDate,
  endDate
 ) => {
  if (!propertyId || !startDate || !endDate) return;

  try {
   setCheckingAvailability(true);
   setAvailabilityError(null);

   const result = await checkAvailability(
    propertyId,
    startDate.format('YYYY-MM-DD'),
    endDate.format('YYYY-MM-DD')
   );

   if (result && !result.available) {
    setAvailabilityError(t('guestForm.validation.datesNotAvailable'));
    // Optionally show conflicting bookings information
    if (
     result.conflictingReservations &&
     result.conflictingReservations.length > 0
    ) {
     console.log('Conflicting reservations:', result.conflictingReservations);
    }
   }
  } catch (error) {
   console.error('Error checking date availability:', error);
   setAvailabilityError(error.message);
  } finally {
   setCheckingAvailability(false);
  }
 };

 const generateRandomCode = () => {
  // Generate a random code (6 digits by default)
  const length = 6; // Default length
  return Math.floor(
   Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
  ).toString();
 };

 // Handle generate code button click
 const handleGenerateCode = () => {
  const newCode = generateRandomCode();
  form.setFieldsValue({ electronicLockCode: newCode });
 };

 const handleSubmit = async (values) => {
  setFormError(null);

  try {
   // Validate date range availability first
   if (
    values.propertyId &&
    values.dateRange &&
    values.dateRange.length === 2 &&
    values.dateRange[0] &&
    values.dateRange[1]
   ) {
    const availabilityResult = await checkAvailability(
     values.propertyId,
     values.dateRange[0].format('YYYY-MM-DD'),
     values.dateRange[1].format('YYYY-MM-DD')
    );

    if (availabilityResult && !availabilityResult.available) {
     setFormError(t('validation.datesNotAvailable'));
     return;
    }
   }

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

   /*  if (data) {
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
   } */

   navigate(`/generate-contract/${data.id}`);
  } catch (error) {
   setFormError(error.message || 'Failed to create reservation');
   message.error(t('reservation.createError'));
  }
 };

 // Information content for the lock Popover
 const lockInfoContent = (
  <div style={{ maxWidth: 300 }}>
   <Text>{t('reservation.lock.infoText')}</Text>
   <ul>
    <li>{t('reservation.lock.autoGeneratedInfo')}</li>
    <li>{t('reservation.lock.validityPeriodInfo')}</li>
    <li>{t('reservation.lock.securityInfo')}</li>
   </ul>
  </div>
 );

 const isLoading =
  fetchingProperties ||
  ownedPropertiesLoading ||
  conciergePropertiesLoading ||
  reservationLoading ||
  revenueLoading ||
  checkingAvailability;

 return (
  <Layout className="contentStyle">
   <Head onUserData={handleUserData} />
   <Content className="container">
    <Button
     type="link"
     icon={<ArrowLeftOutlined />}
     onClick={() => navigate(-1)}
     style={{ marginBottom: 16, padding: 0 }}
    >
     {t('button.back')}
    </Button>

    <Title level={4}>{t('reservation.create.title')}</Title>

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
        validateStatus={availabilityError ? 'error' : ''}
       >
        <ResponsiveDatePicker
         value={dateRange}
         onChange={handleDateRangeChange}
         disabledDate={disabledDate}
         availabilityError={availabilityError}
         form={form}
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
         <Option value="Airbnb">Airbnb</Option>
         <Option value="booking">Booking.com</Option>
         <Option value="expedia">Expedia</Option>
         <Option value="other">{t('reservation.sources.other')}</Option>
        </Select>
       </Form.Item>

       {/* Electronic Lock Card - Styled similarly to ElectronicLockCodeManager */}
       <Card
        title={
         <Space>
          <LockOutlined />
          <span>{t('reservation.lock.title')}</span>
          <Popover
           content={lockInfoContent}
           title={
            t('reservation.lock.infoTitle') || 'Electronic Lock Information'
           }
           trigger="click"
          >
           <InfoCircleOutlined
            style={{ cursor: 'pointer', color: '#1890ff' }}
           />
          </Popover>
         </Space>
        }
        className="electroniclock"
        style={{ marginBottom: 24 }}
       >
        <Form.Item name="electronicLockEnabled" valuePropName="checked">
         <Checkbox style={{ lineHeight: 1.2 }}>
          {t('reservation.lock.enableLock')}
         </Checkbox>
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

            if (value && !/^\d+$/.test(value)) {
             return Promise.reject(
              new Error(
               t('reservation.lock.codeFormat') ||
                'The code must contain only digits'
              )
             );
            }

            if (value && value.toString().length > 10) {
             return Promise.reject(
              new Error(
               t('reservation.lock.codeMaxLength') ||
                'The code cannot exceed 10 digits'
              )
             );
            }

            return Promise.resolve();
           },
          }),
         ]}
        >
         <Input.Password
          disabled={!lockEnabled}
          placeholder={
           t('reservation.lock.codePlaceholder') || 'Enter code (max 10 digits)'
          }
          style={{ width: '100%' }}
          maxLength={10}
          visibilityToggle={{
           visible: codeVisible,
           onVisibleChange: setCodeVisible,
          }}
         />
        </Form.Item>

        <Button
         onClick={handleGenerateCode}
         disabled={!Form.useWatch('electronicLockEnabled', form)}
        >
         {t('reservation.lock.generateCode') || 'Generate Code'}
        </Button>

        {lockEnabled && lockCode && (
         <div style={{ marginTop: 16 }}>
          <Text type="secondary">
           {t('reservation.lock.validityInfo') ||
            "This code will be valid during the guest's stay"}
          </Text>
         </div>
        )}
       </Card>

       {formError && (
        <Alert
         message={t('reservation.create.error')}
         description={formError}
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
         <Button
          type="primary"
          htmlType="submit"
          loading={isLoading}
          disabled={availabilityError ? true : false}
         >
          {t('reservation.create.submit')}
         </Button>
        </Space>
       </Form.Item>
      </Form>
     </Spin>
    </Card>
   </Content>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default CreateReservationForm;
