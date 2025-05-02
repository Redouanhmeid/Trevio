import React, { useState, useEffect } from 'react';
import { DatePicker, Space, Form, Alert, Typography, Grid } from 'antd';
import { useTranslation } from '../../../context/TranslationContext';
import dayjs from 'dayjs';

const { Text } = Typography;
const { useBreakpoint } = Grid;
const { RangePicker } = DatePicker;

const ResponsiveDatePicker = ({
 value,
 onChange,
 disabledDate,
 availabilityError,
 form,
}) => {
 const { t } = useTranslation();
 const screens = useBreakpoint();
 const [startDate, setStartDate] = useState(null);
 const [endDate, setEndDate] = useState(null);

 // Use RangePicker on desktop, separate DatePickers on mobile
 const handleStartDateChange = (date) => {
  setStartDate(date);
  if (endDate && date) {
   // Make sure end date is after start date
   if (date.isAfter(endDate)) {
    setEndDate(null);
    onChange([date, null]);
   } else {
    onChange([date, endDate]);
   }
  } else {
   onChange(date ? [date, endDate] : [null, endDate]);
  }
 };

 const handleEndDateChange = (date) => {
  setEndDate(date);
  if (startDate && date) {
   onChange([startDate, date]);
  } else {
   onChange(date ? [startDate, date] : [startDate, null]);
  }
 };

 // Sync state with form values when value changes externally
 useEffect(() => {
  if (value && Array.isArray(value)) {
   setStartDate(value[0]);
   setEndDate(value[1]);
  } else {
   setStartDate(null);
   setEndDate(null);
  }
 }, [value]);

 // Custom disabled date functions for individual pickers
 const disabledStartDates = (current) => {
  if (disabledDate) {
   return disabledDate(current);
  }
  return false;
 };

 const disabledEndDates = (current) => {
  if (startDate && current && current.isBefore(startDate, 'day')) {
   return true;
  }
  if (disabledDate) {
   return disabledDate(current);
  }
  return false;
 };

 if (screens.xs) {
  // Mobile view with separate date pickers
  return (
   <div>
    <Space direction="vertical" style={{ width: '100%' }} size="small">
     <Form.Item
      label={t('reservation.create.startDate')}
      className="no-margin-bottom"
     >
      <DatePicker
       style={{ width: '100%' }}
       placeholder={t('reservation.create.startDate')}
       value={startDate}
       onChange={handleStartDateChange}
       disabledDate={disabledStartDates}
       format="YYYY-MM-DD"
      />
     </Form.Item>

     <Form.Item
      label={t('reservation.create.endDate')}
      className="no-margin-bottom"
     >
      <DatePicker
       style={{ width: '100%' }}
       placeholder={t('reservation.create.endDate')}
       value={endDate}
       onChange={handleEndDateChange}
       disabledDate={disabledEndDates}
       format="YYYY-MM-DD"
      />
     </Form.Item>

     {availabilityError && (
      <Text type="danger" style={{ display: 'block', marginTop: 8 }}>
       {availabilityError}
      </Text>
     )}
    </Space>
   </div>
  );
 }

 // Desktop view with RangePicker
 return (
  <RangePicker
   style={{ width: '100%' }}
   disabledDate={disabledDate}
   onChange={onChange}
   format="YYYY-MM-DD"
   value={value}
  />
 );
};

export default ResponsiveDatePicker;
