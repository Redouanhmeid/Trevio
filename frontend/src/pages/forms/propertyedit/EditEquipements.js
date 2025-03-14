import React, { useState, useEffect } from 'react';
import {
 Spin,
 Layout,
 Form,
 Typography,
 Row,
 Col,
 Checkbox,
 Button,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import useUpdateProperty from '../../../hooks/useUpdateProperty';
import useProperty from '../../../hooks/useProperty';
import Head from '../../../components/common/header';
import Foot from '../../../components/common/footer';
import { useTranslation } from '../../../context/TranslationContext';

const { Content } = Layout;
const { Title, Text } = Typography;

const EditEquipements = () => {
 const { t } = useTranslation();
 const location = useLocation();
 const { id } = queryString.parse(location.search);
 const navigate = useNavigate();
 const [form] = Form.useForm();
 const { updatePropertyEquipements, isLoading, success } =
  useUpdateProperty(id);
 const { property, loading, fetchProperty } = useProperty();

 const handleSubmit = async (values) => {
  try {
   await updatePropertyEquipements(values);
   navigate(-1);
  } catch (error) {
   console.error('Error:', error);
  }
 };

 useEffect(() => {
  fetchProperty(id);
 }, [loading]);

 if (loading || property.length === 0) {
  return (
   <div className="loading">
    <Spin size="large" />
   </div>
  );
 }
 return (
  <Layout className="contentStyle">
   <Head />
   <Layout>
    <Content className="container-fluid">
     <Button
      type="default"
      shape="round"
      icon={<ArrowLeftOutlined />}
      onClick={() => navigate(-1)}
     >
      {t('button.back')}
     </Button>
     <Title level={3}>
      {t('equipement.editTitle', 'Modifier le manuel de la maison')}
     </Title>
     <Form
      name="editEquipement"
      form={form}
      onFinish={handleSubmit}
      initialValues={property}
      layout="vertical"
     >
      <Row gutter={[16, 8]}>
       <Col xs={24} md={24}>
        <Form.Item name="basicEquipements">
         <Checkbox.Group>
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
               <i className="fa-light fa-shower fa-xl" />{' '}
               {t('equipement.shower')}
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
               <i className="fa-light fa-bath fa-xl" />{' '}
               {t('equipement.bathtub')}
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
               <i className="fa-light fa-vacuum fa-xl" />{' '}
               {t('equipement.vacuum')}
              </Checkbox>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="vault">
               <i className="fa-light fa-vault fa-xl" /> {t('equipement.vault')}
              </Checkbox>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="babybed">
               <i className="fa-light fa-baby fa-xl" />{' '}
               {t('equipement.babybed')}
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
               <i className="fa-light fa-tv fa-xl" />{' '}
               {t('equipement.television')}
              </Checkbox>
             </Col>
             <Col xs={12} md={8}>
              <Checkbox value="speaker">
               <i className="fa-light fa-speaker fa-xl" />{' '}
               {t('equipement.speaker')}
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
               <i className="fa-light fa-fan fa-xl" />{' '}
               {t('equipement.ceilingfan')}
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
        <Button type="primary" htmlType="submit" loading={isLoading}>
         {success ? t('messages.updateSuccess') : t('button.save')}
        </Button>
       </Col>
      </Row>
     </Form>
    </Content>
   </Layout>
   <Foot />
  </Layout>
 );
};

export default EditEquipements;
