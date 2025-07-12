import React, { useState } from 'react';
import {
 Layout,
 Form,
 Typography,
 Row,
 Col,
 Checkbox,
 Button,
 Grid,
 message,
} from 'antd';
import Head from '../../../components/common/header';
import Foot from '../../../components/common/footer';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import useUpdateProperty from '../../../hooks/useUpdateProperty';
import { useTranslation } from '../../../context/TranslationContext';

const { Content } = Layout;
const { Title, Text } = Typography;

const Step3Equipements = ({ next, prev, values, ProgressSteps }) => {
 const { t } = useTranslation();
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();
 const {
  updatePropertyEquipements,
  isLoading: equipementsLoading,
  error: equipementsError,
  success,
 } = useUpdateProperty(values.propertyId);

 const [loading, setLoading] = useState(false);
 const [BasicEquipements, setBasicEquipements] = useState([]);

 const onChangeBasicEquipements = (checkedvalues) => {
  setBasicEquipements(checkedvalues);
 };

 const submitFormData = async () => {
  if (loading || equipementsLoading) {
   return; // Prevent multiple submissions while loading
  }

  try {
   setLoading(true);

   const equipementsData = {
    basicEquipements: BasicEquipements,
   };

   try {
    await updatePropertyEquipements(equipementsData);
    // If update successful, update values and proceed
    values.basicEquipements = BasicEquipements;
    next();
   } catch (error) {
    message.error(t('equipement.updateError'));
   }
  } catch (error) {
   console.error('Error submitting form:', error);
   message.error(error.message || t('property.updateError'));
  } finally {
   setLoading(false);
  }
 };

 const isSubmitting = loading || equipementsLoading;

 return (
  <Layout className="contentStyle">
   <Head />
   <Layout>
    <Content className="container-form">
     <ProgressSteps />
     <Form
      name="step3"
      layout="vertical"
      onFinish={submitFormData}
      size="large"
      initialValues={{
       basicEquipements: values.basicEquipements || [],
      }}
     >
      <Title level={4}>{t('property.equipements.title')}</Title>
      <Row gutter={[16, 8]}>
       <Col xs={24} md={24}>
        <Form.Item name="basicEquipements">
         <Checkbox.Group onChange={onChangeBasicEquipements}>
          <Row gutter={[24, 0]}>
           <Col xs={24}>
            {/* Bathroom */}
            <Row>
             <Col xs={24}>
              <Text strong>{t('equipement.categories.bathroom')}</Text>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="shower">
               <i className="PrimaryColor fa-regular fa-shower fa-lg" />{' '}
               {t('equipement.shower')}
              </Checkbox>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="jacuzzi">
               <i className="PrimaryColor fa-regular fa-hot-tub-person fa-lg" />{' '}
               {t('equipement.jacuzzi')}
              </Checkbox>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="bathtub">
               <i className="PrimaryColor fa-regular fa-bath fa-lg" />{' '}
               {t('equipement.bathtub')}
              </Checkbox>
             </Col>
            </Row>
            {/* Bedroom and Linen */}
            <Row>
             <Col xs={24}>
              <Text strong>{t('equipement.categories.bedroomLinen')}</Text>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="washingMachine">
               <i className="PrimaryColor fa-regular fa-washing-machine fa-lg" />{' '}
               {t('equipement.washingMachine')}
              </Checkbox>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="dryerheat">
               <i className="PrimaryColor fa-regular fa-dryer-heat fa-lg" />{' '}
               {t('equipement.dryerheat')}
              </Checkbox>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="vacuum">
               <i className="PrimaryColor fa-regular fa-vacuum fa-lg" />{' '}
               {t('equipement.vacuum')}
              </Checkbox>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="vault">
               <i className="PrimaryColor fa-regular fa-vault fa-lg" />{' '}
               {t('equipement.vault')}
              </Checkbox>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="babybed">
               <i className="PrimaryColor fa-regular fa-baby fa-lg" />{' '}
               {t('equipement.babybed')}
              </Checkbox>
             </Col>
            </Row>
            {/* Entertainment */}
            <Row>
             <Col xs={24}>
              <Text strong>{t('equipement.categories.entertainment')}</Text>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="television">
               <i className="PrimaryColor fa-regular fa-tv fa-xl" />{' '}
               {t('equipement.television')}
              </Checkbox>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="speaker">
               <i className="PrimaryColor fa-regular fa-speaker fa-xl" />{' '}
               {t('equipement.speaker')}
              </Checkbox>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="gameconsole">
               <i className="PrimaryColor fa-regular fa-gamepad-modern fa-xl" />{' '}
               {t('equipement.gameconsole')}
              </Checkbox>
             </Col>
            </Row>
            {/* Kitchen */}
            <Row>
             <Col xs={24}>
              <Text strong>{t('equipement.categories.kitchen')}</Text>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="oven">
               <i className="PrimaryColor fa-regular fa-oven fa-xl" />{' '}
               {t('equipement.oven')}
              </Checkbox>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="microwave">
               <i className="PrimaryColor fa-regular fa-microwave fa-xl" />{' '}
               {t('equipement.microwave')}
              </Checkbox>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="coffeemaker">
               <i className="PrimaryColor fa-regular fa-coffee-pot fa-xl" />{' '}
               {t('equipement.coffeemaker')}
              </Checkbox>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="fridge">
               <i className="PrimaryColor fa-regular fa-refrigerator fa-xl" />{' '}
               {t('equipement.fridge')}
              </Checkbox>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="fireburner">
               <i className="PrimaryColor fa-regular fa-fire-burner fa-xl" />{' '}
               {t('equipement.fireburner')}
              </Checkbox>
             </Col>
            </Row>
            {/*  Heating and Cooling */}
            <Row>
             <Col xs={24}>
              <Text strong>{t('equipement.categories.heatingCooling')}</Text>
             </Col>
             <Col xs={10} md={8}>
              <Checkbox value="heating">
               <i className="PrimaryColor fa-regular fa-temperature-arrow-up fa-xl" />{' '}
               {t('equipement.heating')}
              </Checkbox>
             </Col>
             <Col xs={14} md={8}>
              <Checkbox value="airConditioning">
               <i className="PrimaryColor fa-regular fa-snowflake fa-xl" />{' '}
               {t('equipement.airConditioning')}
              </Checkbox>
             </Col>
             <Col xs={10} md={8}>
              <Checkbox value="fireplace">
               <i className="PrimaryColor fa-regular fa-fireplace fa-xl" />{' '}
               {t('equipement.fireplace')}
              </Checkbox>
             </Col>
             <Col xs={14} md={8}>
              <Checkbox value="ceilingfan">
               <i className="PrimaryColor fa-regular fa-fan fa-xl" />{' '}
               {t('equipement.ceilingfan')}
              </Checkbox>
             </Col>
             <Col xs={14} md={8}>
              <Checkbox value="tablefan">
               <i className="PrimaryColor fa-regular fa-fan-table fa-xl" />{' '}
               {t('equipement.tablefan')}
              </Checkbox>
             </Col>
            </Row>
            {/* Home Security */}
            <Row>
             <Col xs={24}>
              <Text strong>{t('equipement.categories.homeSecurity')}</Text>
             </Col>
             <Col xs={24} md={16}>
              <Checkbox value="fingerprint">
               <i className="PrimaryColor fa-regular fa-fingerprint fa-xl" />{' '}
               {t('equipement.fingerprint')}
              </Checkbox>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="lockbox">
               <i className="PrimaryColor fa-regular fa-lock-hashtag fa-xl" />{' '}
               {t('equipement.lockbox')}
              </Checkbox>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="parkingaccess">
               <i className="PrimaryColor fa-regular fa-square-parking fa-xl" />{' '}
               {t('equipement.parkingaccess')}
              </Checkbox>
             </Col>
            </Row>
            {/* Internet and Office */}
            <Row>
             <Col xs={24}>
              <Text strong>{t('equipement.categories.internetOffice')}</Text>
             </Col>
             <Col xs={24} md={8}>
              <Checkbox value="wifi">
               <i className="PrimaryColor fa-regular fa-wifi fa-xl" />{' '}
               {t('equipement.wifi')}
              </Checkbox>
             </Col>
             <Col xs={24} md={16}>
              <Checkbox value="dedicatedworkspace">
               <i className="PrimaryColor fa-regular fa-chair-office fa-xl" />{' '}
               {t('equipement.dedicatedworkspace')}
              </Checkbox>
             </Col>
            </Row>
            {/* Parking and Facilities */}
            <Row>
             <Col xs={24}>
              <Text strong>{t('equipement.categories.parkingFacilities')}</Text>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="freeParking">
               <i className="PrimaryColor fa-regular fa-circle-parking fa-xl" />{' '}
               {t('equipement.freeParking')}
              </Checkbox>
             </Col>
             <Col xs={12} md={16}>
              <Checkbox value="paidParking">
               <i className="PrimaryColor fa-regular fa-square-parking fa-xl" />{' '}
               {t('equipement.paidParking')}
              </Checkbox>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="pool">
               <i className="PrimaryColor fa-regular fa-water-ladder fa-xl" />{' '}
               {t('equipement.pool')}
              </Checkbox>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="garbageCan">
               <i className="PrimaryColor fa-regular fa-trash-can fa-xl" />{' '}
               {t('equipement.garbageCan')}
              </Checkbox>
             </Col>
            </Row>
           </Col>
          </Row>
         </Checkbox.Group>
        </Form.Item>
       </Col>
      </Row>
      <Row justify="center">
       <Col xs={8} md={2}>
        <Form.Item>
         <Button
          htmlType="submit"
          shape="circle"
          onClick={prev}
          icon={<ArrowLeftOutlined />}
          disabled={isSubmitting}
         />
        </Form.Item>
       </Col>
       <Col xs={16} md={6}>
        <Form.Item>
         <Button type="primary" htmlType="submit" loading={isSubmitting} block>
          {t('button.continue')} {<ArrowRightOutlined />}
         </Button>
        </Form.Item>
       </Col>
      </Row>
     </Form>
    </Content>
   </Layout>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default Step3Equipements;
