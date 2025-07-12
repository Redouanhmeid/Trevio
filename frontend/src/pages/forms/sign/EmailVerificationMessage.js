import React from 'react';
import { Result, Button } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../context/TranslationContext';

const EmailVerificationMessage = ({ email }) => {
 const { t } = useTranslation();
 const navigate = useNavigate();

 return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
   <Result
    icon={<MailOutlined className="text-6xl text-blue-500" />}
    title={t('verification.checkEmail')}
    subTitle={
     <div className="space-y-4">
      <p className="text-gray-600">
       {t('verification.emailSentTo')} <strong>{email}</strong>
      </p>
      <p className="text-gray-600">{t('verification.followInstructions')}</p>
     </div>
    }
    extra={[
     <Button
      key="login"
      type="primary"
      onClick={() => navigate('/login')}
      className="mt-4"
     >
      {t('auth.loginButton')}
     </Button>,
    ]}
   />
  </div>
 );
};

export default EmailVerificationMessage;
