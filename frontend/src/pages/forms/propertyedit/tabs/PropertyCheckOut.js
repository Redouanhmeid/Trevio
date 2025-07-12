import React, { useState, useEffect } from 'react';
import {
 Row,
 Col,
 Form,
 Input,
 Button,
 Typography,
 Checkbox,
 message,
 Card,
 Alert,
 Spin,
 Space,
 TimePicker,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from '../../../../context/TranslationContext';
import useUpdateProperty from '../../../../hooks/useUpdateProperty';

const { Title } = Typography;
const { TextArea } = Input;

// Default check-out time
const DEFAULT_CHECK_OUT_TIME = dayjs().hour(12).minute(0); // 12:00 PM

const PropertyCheckOut = ({ property, propertyId, onPropertyUpdated }) => {
 const { t } = useTranslation();
 const [form] = Form.useForm();
 const { updatePropertyCheckOut, isLoading, success } =
  useUpdateProperty(propertyId);

 const [saving, setSaving] = useState(false);
 const [successMessage, setSuccessMessage] = useState('');

 // Check-out state
 const [checkOutTime, setCheckOutTime] = useState(null);

 // Parse property values safely
 const parseArrayProperty = (propValue) => {
  if (typeof propValue === 'string') {
   try {
    return JSON.parse(propValue);
   } catch (e) {
    console.warn('Failed to parse property value:', propValue);
    return [];
   }
  }
  return Array.isArray(propValue) ? propValue : [];
 };

 // Set initial form values from property - only run when property ID changes
 useEffect(() => {
  if (property) {
   console.log('Setting initial form values for PropertyCheckOut');

   const formattedCheckOutTime = property.checkOutTime
    ? dayjs(property.checkOutTime)
    : DEFAULT_CHECK_OUT_TIME;

   // Initialize form values
   form.setFieldsValue({
    // Check-out values
    checkOutTime: formattedCheckOutTime,
    lateCheckOutPolicy: parseArrayProperty(property.lateCheckOutPolicy),
    beforeCheckOut: parseArrayProperty(property.beforeCheckOut),
    additionalCheckOutInfo: property.additionalCheckOutInfo || '',
   });

   // Set state values
   setCheckOutTime(formattedCheckOutTime);
  }
 }, [property?.id]); // Only re-run when property ID changes

 // Handle form submission - Check-out
 const handleSubmit = async () => {
  setSaving(true);
  try {
   const values = await form.validateFields([
    'checkOutTime',
    'lateCheckOutPolicy',
    'beforeCheckOut',
    'additionalCheckOutInfo',
   ]);

   await updatePropertyCheckOut(values);
   if (onPropertyUpdated) {
    onPropertyUpdated();
   }
  } catch (error) {
   console.error('Error updating check-out settings:', error);
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
   initialValues={{
    checkOutTime: checkOutTime,
   }}
  >
   <Card
    bordered={false}
    title={
     <Title level={4} style={{ margin: 0 }}>
      <i
       className="fa-light fa-arrow-right-from-arc"
       style={{ marginRight: 8 }}
      />
      {t('checkOut.title')}
     </Title>
    }
   >
    <Row gutter={[24, 16]}>
     <Col xs={24} md={12}>
      <Form.Item label={t('checkOut.departureTime')} name="checkOutTime">
       <TimePicker
        format="HH:mm"
        showNow={false}
        size="large"
        value={checkOutTime}
        onChange={setCheckOutTime}
        style={{ width: '100%' }}
       />
      </Form.Item>
     </Col>

     <Col xs={24}>
      <Form.Item
       label={t('property.checkOut.policyTitle')}
       name="lateCheckOutPolicy"
      >
       <Checkbox.Group>
        <Row>
         <Col xs={24}>
          <Checkbox value="heureNonFlexible">
           {t('checkOut.policyNotFlexible')}
          </Checkbox>
         </Col>
         <Col xs={24}>
          <Checkbox value="heureDepartAlternative">
           {t('checkOut.policyAlternateTime')}
          </Checkbox>
         </Col>
         <Col xs={24}>
          <Checkbox value="contactezNous">
           {t('checkOut.policyContactUs')}
          </Checkbox>
         </Col>
         <Col xs={24}>
          <Checkbox value="optionDepartTardif">
           {t('checkOut.policyLateOption')}
          </Checkbox>
         </Col>
        </Row>
       </Checkbox.Group>
      </Form.Item>
     </Col>

     <Col xs={24}>
      <Form.Item label={t('checkOut.tasksTitle')} name="beforeCheckOut">
       <Checkbox.Group>
        <Row>
         <Col xs={24} md={12}>
          <Checkbox value="laissezBagages">
           {t('checkOut.tasksStoreBags')}
          </Checkbox>
         </Col>
         <Col xs={24} md={12}>
          <Checkbox value="signezLivreOr">
           {t('checkOut.tasksGuestBook')}
          </Checkbox>
         </Col>
         <Col xs={24} md={12}>
          <Checkbox value="litsNonFaits">
           {t('checkOut.tasksUnmadeBeds')}
          </Checkbox>
         </Col>
         <Col xs={24} md={12}>
          <Checkbox value="laverVaisselle">
           {t('checkOut.tasksCleanDishes')}
          </Checkbox>
         </Col>
         <Col xs={24} md={12}>
          <Checkbox value="vaisselleLaveVaisselle">
           {t('checkOut.tasksFinalDishes')}
          </Checkbox>
         </Col>
         <Col xs={24} md={12}>
          <Checkbox value="eteindreAppareilsElectriques">
           {t('checkOut.tasksTurnOffAppliances')}
          </Checkbox>
         </Col>
         <Col xs={24} md={12}>
          <Checkbox value="replacezMeubles">
           {t('checkOut.tasksReplaceFurniture')}
          </Checkbox>
         </Col>
         <Col xs={24} md={12}>
          <Checkbox value="deposePoubelles">
           {t('checkOut.tasksGarbage')}
          </Checkbox>
         </Col>
         <Col xs={24} md={12}>
          <Checkbox value="serviettesDansBaignoire">
           {t('checkOut.tasksTowelsInBath')}
          </Checkbox>
         </Col>
         <Col xs={24} md={12}>
          <Checkbox value="serviettesParTerre">
           {t('checkOut.tasksTowelsOnFloor')}
          </Checkbox>
         </Col>
         <Col xs={24} md={12}>
          <Checkbox value="portesVerrouillees">
           {t('checkOut.tasksDoorUnlocked')}
          </Checkbox>
         </Col>
         <Col xs={24} md={12}>
          <Checkbox value="porteNonVerrouillee">
           {t('checkOut.tasksDoorLocked')}
          </Checkbox>
         </Col>
         <Col xs={24} md={12}>
          <Checkbox value="laissezCleMaison">
           {t('checkOut.tasksKeyInHouse')}
          </Checkbox>
         </Col>
         <Col xs={24} md={12}>
          <Checkbox value="laissezCleBoiteCle">
           {t('checkOut.tasksKeyInBox')}
          </Checkbox>
         </Col>
        </Row>
       </Checkbox.Group>
      </Form.Item>
     </Col>

     <Col xs={24}>
      <Form.Item
       label={t('checkOut.additionalInfo')}
       name="additionalCheckOutInfo"
      >
       <TextArea showCount maxLength={500} rows={4} />
      </Form.Item>
     </Col>
    </Row>
   </Card>

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

export default PropertyCheckOut;
