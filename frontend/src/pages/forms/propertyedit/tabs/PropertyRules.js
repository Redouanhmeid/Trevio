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
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useTranslation } from '../../../../context/TranslationContext';
import useUpdateProperty from '../../../../hooks/useUpdateProperty';

const { Title } = Typography;
const { TextArea } = Input;

const PropertyRules = ({ property, propertyId, onPropertyUpdated }) => {
 const { t } = useTranslation();
 const [form] = Form.useForm();
 const { updatePropertyRules, isLoading, success } =
  useUpdateProperty(propertyId);

 const [showAdditionalRules, setShowAdditionalRules] = useState(false);
 const [additionalRules, setAdditionalRules] = useState('');
 const [saving, setSaving] = useState(false);

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

 // Set initial form values from property - only run once when property is loaded
 useEffect(() => {
  if (property) {
   // Handle house rules - ensure it's an array
   const houseRules = parseArrayProperty(property.houseRules);

   // Set form values
   form.setFieldsValue({
    houseRules: houseRules,
   });

   // Check if there are additional rules
   if (houseRules.length > 0) {
    const additionalRuleItem = houseRules.find(
     (rule) => typeof rule === 'string' && rule.startsWith('additionalRules:')
    );
    if (additionalRuleItem) {
     setShowAdditionalRules(true);
     setAdditionalRules(
      additionalRuleItem.replace('additionalRules:', '').trim()
     );
    }
   }
  }
 }, [property?.id]); // Only run when property ID changes

 // Handle form submission
 const handleSubmit = async () => {
  setSaving(true);
  try {
   const values = await form.validateFields();

   // House rules update
   let houseRulesData = [...values.houseRules];
   if (showAdditionalRules && additionalRules) {
    houseRulesData.push(`additionalRules: ${additionalRules}`);
   }
   await updatePropertyRules({ houseRules: houseRulesData });

   if (onPropertyUpdated) {
    onPropertyUpdated();
   }
  } catch (error) {
   console.error('Error updating property rules:', error);
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
  >
   <Card
    bordered={false}
    title={
     <Title level={4} style={{ margin: 0 }}>
      <i className="fa-light fa-list-check" style={{ marginRight: 8 }} />
      {t('rules.title')}
     </Title>
    }
   >
    <Row gutter={[24, 16]}>
     <Col xs={24}>
      <Form.Item name="houseRules">
       <Checkbox.Group className="houseRules-checkbox-group">
        <Row>
         <Col xs={24}>
          <Checkbox value="noNoise">
           <i className="fa-light fa-volume-slash fa-xl" /> {t('rules.noNoise')}
          </Checkbox>
         </Col>
         <Col xs={24}>
          <Checkbox value="noFoodDrinks">
           <i className="fa-light fa-utensils-slash fa-xl" />{' '}
           {t('rules.noFoodDrinks')}
          </Checkbox>
         </Col>
         <Col xs={24}>
          <Checkbox value="noParties">
           <i className="fa-light fa-champagne-glasses fa-xl" />{' '}
           {t('rules.noParties')}
          </Checkbox>
         </Col>
         <Col xs={24}>
          <Checkbox value="noSmoking">
           <i className="fa-light fa-ban-smoking fa-xl" />{' '}
           {t('rules.noSmoking')}
          </Checkbox>
         </Col>
         <Col xs={24}>
          <Checkbox value="noPets">
           <i className="fa-light fa-paw-simple fa-xl" /> {t('rules.noPets')}
          </Checkbox>
         </Col>
         <Col xs={24}>
          <Checkbox value="noUnmarriedCouple">
           <i className="fa-light fa-ban fa-xl" />{' '}
           {t('rules.noUnmarriedCouple')}
          </Checkbox>
         </Col>
         <Col xs={24}>
          <Checkbox
           value="additionalRules"
           checked={showAdditionalRules}
           onChange={(e) => setShowAdditionalRules(e.target.checked)}
          >
           <i className="fa-light fa-circle-info fa-xl" />{' '}
           {t('rules.additionalRules')}
          </Checkbox>
         </Col>
        </Row>
       </Checkbox.Group>
      </Form.Item>

      {showAdditionalRules && (
       <Form.Item label={t('rules.additionalRules')}>
        <TextArea
         rows={4}
         value={additionalRules}
         onChange={(e) => setAdditionalRules(e.target.value)}
         showCount
         maxLength={255}
        />
       </Form.Item>
      )}
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

export default PropertyRules;
