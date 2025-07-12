import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { useUserData } from '../../../hooks/useUserData';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../context/TranslationContext';
const { Title } = Typography;

const NewPassword = () => {
 const { t } = useTranslation();
 const { resetPassword, error, success, errorMsg } = useUserData();
 const location = useLocation();
 const navigate = useNavigate();
 const [email, setEmail] = useState(location.state?.email || '');
 const [code, setCode] = useState(location.state?.code || '');
 const [newPassword, setNewPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');

 useEffect(() => {
  if (!email || !code) {
   navigate('/reset-password-request');
  }
 }, [email, code, navigate]);

 useEffect(() => {
  if (success) {
   navigate('/login');
  }
 }, [success, navigate]);

 const handleSubmit = async () => {
  if (newPassword === confirmPassword) {
   await resetPassword(email, code, newPassword);
  } else {
   alert(t('password.mismatch'));
  }
 };

 return (
  <div style={{ maxWidth: 400, margin: 'auto' }}>
   <Title level={2}>{t('password.reset')}</Title>
   <Form onFinish={handleSubmit}>
    <Form.Item
     name="newPassword"
     rules={[
      {
       required: true,
       message: t('password.enterNew'),
      },
      {
       min: 8,
       message: t('validation.passwordLength'),
      },
      {
       pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
       message: t('validation.passwordRequirements'),
      },
     ]}
    >
     <Input.Password
      placeholder={t('password.enterNewPlaceholder')}
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
     />
    </Form.Item>

    <Form.Item
     name="confirmPassword"
     dependencies={['newPassword']}
     rules={[
      {
       required: true,
       message: t('password.confirmNew'),
      },
      ({ getFieldValue }) => ({
       validator(_, value) {
        if (!value || getFieldValue('newPassword') === value) {
         return Promise.resolve();
        }
        return Promise.reject(new Error(t('password.mismatch')));
       },
      }),
     ]}
    >
     <Input.Password
      placeholder={t('password.confirmNewPlaceholder')}
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
     />
    </Form.Item>
    <Form.Item>
     <Button type="primary" htmlType="submit" className="sign-submit-button">
      {t('password.resetButton')}
     </Button>
    </Form.Item>
   </Form>
   {error && <Alert message={errorMsg} type="error" showIcon />}
   {success && (
    <Alert message={t('password.resetSuccess')} type="success" showIcon />
   )}
  </div>
 );
};

export default NewPassword;
