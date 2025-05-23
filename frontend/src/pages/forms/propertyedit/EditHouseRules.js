import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
 Spin,
 Layout,
 Row,
 Col,
 Form,
 Input,
 Typography,
 Checkbox,
 Button,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import queryString from 'query-string';
import useProperty from '../../../hooks/useProperty';
import useUpdateProperty from '../../../hooks/useUpdateProperty';
import Head from '../../../components/common/header';
import Foot from '../../../components/common/footer';
import { useTranslation } from '../../../context/TranslationContext';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const EditHouseRules = () => {
 const { t } = useTranslation();
 const location = useLocation();
 const { id } = queryString.parse(location.search);
 const { property, loading, fetchProperty } = useProperty();
 const navigate = useNavigate();
 const [form] = Form.useForm();
 const { updatePropertyRules, isLoading, success } = useUpdateProperty(id);

 const [showAdditionalRules, setShowAdditionalRules] = useState(false);
 const [additionalRules, setAdditionalRules] = useState('');

 const handleSubmit = (values) => {
  if (showAdditionalRules) {
   values.houseRules.push(`additionalRules: ${additionalRules}`);
  }
  updatePropertyRules(values);
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
     <Title level={3}>{t('rules.editTitle')}</Title>
     <Form
      name="editHouseRules"
      form={form}
      onFinish={handleSubmit}
      initialValues={property}
      layout="vertical"
     >
      <Form.Item name="houseRules">
       <Checkbox.Group>
        <Row gutter={[24, 0]}>
         <Col xs={24}>
          <Checkbox value="noNoise">
           <i className="fa-light fa-volume-slash fa-xl" /> {t('rules.noNoise')}
          </Checkbox>
         </Col>
         <Col xs={24}>
          <Checkbox value="noFoodDrinks">
           <i className="fa-light fa-utensils-slash fa-xl" />{' '}
           {t('rules.noFood')}
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
       <Col xs={24} md={24}>
        <Form.Item label={t('rules.additionalRules')} value="AdditionalRules">
         <TextArea
          rows={4}
          value={additionalRules}
          onChange={(e) => setAdditionalRules(e.target.value)}
          showCount
          maxLength={255}
         />
        </Form.Item>
       </Col>
      )}
      <Button type="primary" htmlType="submit" loading={isLoading}>
       {success ? t('messages.updateSuccess') : t('button.save')}
      </Button>
     </Form>
    </Content>
   </Layout>
   <Foot />
  </Layout>
 );
};

export default EditHouseRules;
