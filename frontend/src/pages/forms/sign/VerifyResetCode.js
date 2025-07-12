import React, { useState, useEffect } from 'react';
import {
 Form,
 Input,
 Button,
 Alert,
 Layout,
 Row,
 Col,
 Typography,
 Divider,
} from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import { useUserData } from '../../../hooks/useUserData';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../context/TranslationContext';
import Head from '../../../components/common/header';
import Foot from '../../../components/common/footer';

const { Title, Text } = Typography;

const VerifyResetCode = () => {
 const { verifyResetCode, error, success, errorMsg } = useUserData();
 const location = useLocation();
 const navigate = useNavigate();
 const { t } = useTranslation();
 const [form] = Form.useForm();

 const [email, setEmail] = useState(location.state?.email || '');
 const [code, setCode] = useState('');

 useEffect(() => {
  if (!location.state?.email) {
   navigate('/reset-password-request');
  }
 }, [location, navigate]);

 const handleSubmit = async () => {
  const isValid = await verifyResetCode(email, code);
  if (isValid) {
   navigate('/new-password', { state: { email, code } });
  }
 };

 return (
  <Layout className="sign-layout">
   <Head />
   <Row justify="center" align="middle" className="login-row">
    <Col xs={24} sm={12} md={8}>
     <div className="sign-container">
      <Title level={2}>{t('password.verifyCode')}</Title>
      <Text className="sign-subtitle">{t('password.verifyInstructions')}</Text>
      <Divider />

      <Form
       form={form}
       name="verify-code"
       onFinish={handleSubmit}
       layout="vertical"
       size="large"
       className="sign-form"
      >
       <Form.Item
        name="code"
        rules={[
         {
          required: true,
          message: t('password.enterCode'),
         },
         {
          len: 6,
          message: t('password.codeLength'),
         },
         {
          pattern: /^\d+$/,
          message: t('password.codeNumbers'),
         },
        ]}
       >
        <Input
         prefix={<KeyOutlined />}
         placeholder={t('password.codePlaceholder')}
         value={code}
         onChange={(e) => setCode(e.target.value)}
         maxLength={6}
        />
       </Form.Item>

       <Form.Item>
        <Button
         type="primary"
         htmlType="submit"
         className="sign-submit-button"
         block
        >
         {t('password.verifyButton')}
        </Button>
       </Form.Item>

       {error && (
        <Form.Item>
         <Alert message={errorMsg} type="error" showIcon />
        </Form.Item>
       )}
       {success && (
        <Form.Item>
         <Alert message={t('password.verifySuccess')} type="success" showIcon />
        </Form.Item>
       )}
      </Form>
     </div>
    </Col>
   </Row>
   <Foot />
  </Layout>
 );
};

export default VerifyResetCode;
