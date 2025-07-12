import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useUserData } from '../../../hooks/useUserData';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../context/TranslationContext';

const { Title, Text } = Typography;

const ResetPasswordRequest = () => {
 const { requestPasswordReset, error, success, errorMsg } = useUserData();
 const [email, setEmail] = useState('');
 const navigate = useNavigate();
 const { t } = useTranslation();

 const handleSubmit = async () => {
  await requestPasswordReset(email);
 };

 // Redirect to the VerifyResetCode page upon success
 useEffect(() => {
  if (success) {
   navigate('/verify-reset-code', { state: { email } });
  }
 }, [success, navigate, email]);

 return (
  <div style={{ maxWidth: 400, margin: 'auto' }}>
   <Title level={2}>{t('password.requestReset')}</Title>
   <Text className="sign-subtitle">{t('password.requestInstructions')}</Text>
   <Form onFinish={handleSubmit}>
    <Form.Item
     name="email"
     rules={[
      {
       required: true,
       type: 'email',
       message: t('validation.email'),
      },
     ]}
    >
     <Input
      prefix={<MailOutlined />}
      placeholder={t('common.email')}
      value={email}
      onChange={(e) => setEmail(e.target.value)}
     />
    </Form.Item>
    <Form.Item>
     <Button type="primary" htmlType="submit">
      {t('password.sendCode')}
     </Button>
    </Form.Item>
   </Form>
   {error && <Alert message={errorMsg} type="error" showIcon />}
   {success && (
    <Alert message={t('password.codeSent')} type="success" showIcon />
   )}
  </div>
 );
};

export default ResetPasswordRequest;
