import React, { useState, useEffect } from 'react';
import {
 Row,
 Col,
 Form,
 Checkbox,
 Button,
 Typography,
 message,
 Card,
 Alert,
 Spin,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useTranslation } from '../../../../context/TranslationContext';
import useUpdateProperty from '../../../../hooks/useUpdateProperty';

const { Title, Text } = Typography;

const PropertyEquipments = ({ property, propertyId, onPropertyUpdated }) => {
 const { t } = useTranslation();
 const [form] = Form.useForm();
 const { updatePropertyEquipements, isLoading, success } =
  useUpdateProperty(propertyId);
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

 // Set initial form values from property - only run when property ID changes to prevent repeated renders
 useEffect(() => {
  if (property) {
   const equipments = parseArrayProperty(property.basicEquipements);
   form.setFieldsValue({
    basicEquipements: equipments,
   });
  }
 }, [property?.id]); // Only re-run when property ID changes

 // Handle form submission
 const handleSubmit = async (formValues) => {
  setSaving(true);
  try {
   await updatePropertyEquipements(formValues);
   if (onPropertyUpdated) {
    onPropertyUpdated();
   }
  } catch (error) {
   console.error('Error updating property equipments:', error);
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
   initialValues={{ basicEquipements: [] }}
  >
   <Card
    bordered={false}
    title={
     <Title level={4} style={{ margin: 0 }}>
      <i className="fa-light fa-house-laptop" style={{ marginRight: 8 }} />
      {t('equipement.editTitle')}
     </Title>
    }
   >
    <Form.Item name="basicEquipements">
     <Checkbox.Group className="equipement-checkbox-group">
      <Row gutter={[24, 0]}>
       <Col xs={24}>
        {/* Bathroom */}
        <Row>
         <Col xs={24}>
          <Text strong>
           <br />
           {t('equipement.categories.bathroom')}
          </Text>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="shower">
           <i className="fa-light fa-shower fa-xl" /> {t('equipement.shower')}
          </Checkbox>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="jacuzzi">
           <i className="fa-light fa-hot-tub-person fa-xl" />{' '}
           {t('equipement.jacuzzi')}
          </Checkbox>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="bathtub">
           <i className="fa-light fa-bath fa-xl" /> {t('equipement.bathtub')}
          </Checkbox>
         </Col>
        </Row>
        {/* Bedroom and Linen */}
        <Row>
         <Col xs={24}>
          <Text strong>
           <br />
           {t('equipement.categories.bedroomLinen')}
          </Text>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="washingMachine">
           <i className="fa-light fa-washing-machine fa-xl" />{' '}
           {t('equipement.washingMachine')}
          </Checkbox>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="dryerheat">
           <i className="fa-light fa-dryer-heat fa-xl" />{' '}
           {t('equipement.dryerheat')}
          </Checkbox>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="vacuum">
           <i className="fa-light fa-vacuum fa-xl" /> {t('equipement.vacuum')}
          </Checkbox>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="vault">
           <i className="fa-light fa-vault fa-xl" /> {t('equipement.vault')}
          </Checkbox>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="babybed">
           <i className="fa-light fa-baby fa-xl" /> {t('equipement.babybed')}
          </Checkbox>
         </Col>
        </Row>
        {/* Entertainment */}
        <Row>
         <Col xs={24}>
          <Text strong>
           <br />
           {t('equipement.categories.entertainment')}
          </Text>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="television">
           <i className="fa-light fa-tv fa-xl" /> {t('equipement.television')}
          </Checkbox>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="speaker">
           <i className="fa-light fa-speaker fa-xl" /> {t('equipement.speaker')}
          </Checkbox>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="gameconsole">
           <i className="fa-light fa-gamepad-modern fa-xl" />{' '}
           {t('equipement.gameconsole')}
          </Checkbox>
         </Col>
        </Row>
        {/* Kitchen */}
        <Row>
         <Col xs={24}>
          <Text strong>
           <br />
           {t('equipement.categories.kitchen')}
          </Text>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="oven">
           <i className="fa-light fa-oven fa-xl" /> {t('equipement.oven')}
          </Checkbox>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="microwave">
           <i className="fa-light fa-microwave fa-xl" />{' '}
           {t('equipement.microwave')}
          </Checkbox>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="coffeemaker">
           <i className="fa-light fa-coffee-pot fa-xl" />{' '}
           {t('equipement.coffeemaker')}
          </Checkbox>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="fridge">
           <i className="fa-light fa-refrigerator fa-xl" />{' '}
           {t('equipement.fridge')}
          </Checkbox>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="fireburner">
           <i className="fa-light fa-fire-burner fa-xl" />{' '}
           {t('equipement.fireburner')}
          </Checkbox>
         </Col>
        </Row>
        {/* Heating and Cooling */}
        <Row>
         <Col xs={24}>
          <Text strong>
           <br />
           {t('equipement.categories.heatingCooling')}
          </Text>
         </Col>
         <Col xs={10} md={8}>
          <Checkbox value="heating">
           <i className="fa-light fa-temperature-arrow-up fa-xl" />{' '}
           {t('equipement.heating')}
          </Checkbox>
         </Col>
         <Col xs={14} md={8}>
          <Checkbox value="airConditioning">
           <i className="fa-light fa-snowflake fa-xl" />{' '}
           {t('equipement.airConditioning')}
          </Checkbox>
         </Col>
         <Col xs={10} md={8}>
          <Checkbox value="fireplace">
           <i className="fa-light fa-fireplace fa-xl" />{' '}
           {t('equipement.fireplace')}
          </Checkbox>
         </Col>
         <Col xs={14} md={8}>
          <Checkbox value="ceilingfan">
           <i className="fa-light fa-fan fa-xl" /> {t('equipement.ceilingfan')}
          </Checkbox>
         </Col>
         <Col xs={14} md={8}>
          <Checkbox value="tablefan">
           <i className="fa-light fa-fan-table fa-xl" />{' '}
           {t('equipement.tablefan')}
          </Checkbox>
         </Col>
        </Row>
        {/* Home Security */}
        <Row>
         <Col xs={24}>
          <Text strong>
           <br />
           {t('equipement.categories.homeSecurity')}
          </Text>
         </Col>
         <Col xs={24} md={8}>
          <Checkbox value="fingerprint">
           <i className="fa-light fa-fingerprint fa-xl" />{' '}
           {t('equipement.fingerprint')}
          </Checkbox>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="lockbox">
           <i className="fa-light fa-lock-hashtag fa-xl" />{' '}
           {t('equipement.lockbox')}
          </Checkbox>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="parkingaccess">
           <i className="fa-light fa-square-parking fa-xl" />{' '}
           {t('equipement.parkingaccess')}
          </Checkbox>
         </Col>
        </Row>
        {/* Internet and Office */}
        <Row>
         <Col xs={24}>
          <Text strong>
           <br />
           {t('equipement.categories.internetOffice')}
          </Text>
         </Col>
         <Col xs={24} md={8}>
          <Checkbox value="wifi">
           <i className="fa-light fa-wifi fa-xl" /> {t('equipement.wifi')}
          </Checkbox>
         </Col>
         <Col xs={24} md={8}>
          <Checkbox value="dedicatedworkspace">
           <i className="fa-light fa-chair-office fa-xl" />{' '}
           {t('equipement.dedicatedworkspace')}
          </Checkbox>
         </Col>
        </Row>
        {/* Parking and Facilities */}
        <Row>
         <Col xs={24}>
          <Text strong>
           <br />
           {t('equipement.categories.parkingFacilities')}
          </Text>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="freeParking">
           <i className="fa-light fa-circle-parking fa-xl" />{' '}
           {t('equipement.freeParking')}
          </Checkbox>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="paidParking">
           <i className="fa-light fa-square-parking fa-xl" />{' '}
           {t('equipement.paidParking')}
          </Checkbox>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="pool">
           <i className="fa-light fa-water-ladder fa-xl" />{' '}
           {t('equipement.pool')}
          </Checkbox>
         </Col>
         <Col xs={12} md={8}>
          <Checkbox value="garbageCan">
           <i className="fa-light fa-trash-can fa-xl" />{' '}
           {t('equipement.garbageCan')}
          </Checkbox>
         </Col>
        </Row>
       </Col>
      </Row>
     </Checkbox.Group>
    </Form.Item>
   </Card>

   {/* Submit button */}
   <Form.Item>
    <Button
     type="primary"
     htmlType="submit"
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

export default PropertyEquipments;
