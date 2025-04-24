import React, { useState, useEffect } from 'react';
import {
 Layout,
 Row,
 Col,
 Typography,
 Button,
 message,
 Spin,
 Alert,
 Space,
 Form,
 Input,
 InputNumber,
 Select,
 Grid,
} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../context/TranslationContext';
import Head from '../../../components/common/header';
import Foot from '../../../components/common/footer';
import { useUserData } from '../../../hooks/useUserData';
import { useLogin } from '../../../hooks/useLogin';
import { countries } from '../../../utils/countries';
import DashboardHeader from '../../../components/common/DashboardHeader';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const ManagerVerification = () => {
 const [form] = Form.useForm();
 const [loading, setLoading] = useState(true);
 const { t } = useTranslation();
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();
 const { token } = useParams();
 const navigate = useNavigate();
 const [validToken, setValidToken] = useState(false);
 const [invitationData, setInvitationData] = useState(null);
 const {
  userData,
  error,
  verifyManagerInvitation,
  acceptManagerInvitation,
  getUserData,
 } = useUserData();
 const { login } = useLogin();
 const [countryCode, setCountryCode] = useState(
  countries.find((country) => country.name === 'Maroc').dialCode
 );

 useEffect(() => {
  const verifyToken = async () => {
   try {
    const response = await verifyManagerInvitation(token);
    setValidToken(true);
    setInvitationData(response.invitation);
    if (response.invitation.userExists) {
     await getUserData(response.invitation.email);
    }
   } catch (error) {
    message.error(t('managers.messages.invalidInvitation'));
    navigate('/login');
   } finally {
    setLoading(false);
   }
  };

  verifyToken();
 }, [token, t]);

 const handleExistingUserAccept = async (values) => {
  try {
   setLoading(true);

   // First attempt login
   const loginResult = await login(invitationData.email, values.password);
   if (loginResult.error) {
    throw new Error(loginResult.error);
   }

   // Only proceed if login was successful
   const managerData = {
    email: invitationData.email, // Add email to ensure we're processing the right user
    firstname: userData.firstname,
    lastname: userData.lastname,
    phone: userData.phone,
   };

   try {
    const acceptResponse = await acceptManagerInvitation(token, managerData);

    if (!acceptResponse) {
     throw new Error('No response received from server');
    }

    if (acceptResponse.error) {
     throw new Error(acceptResponse.error);
    }

    message.success(t('managers.messages.assignSuccess'));
    navigate('/login');
   } catch (acceptError) {
    console.error('Accept Invitation Error:', acceptError);
    // Check if the error is because the invitation was already accepted
    if (
     acceptError.response?.status === 500 &&
     acceptError.response?.data?.details?.includes('already accepted')
    ) {
     // This is actually a success case - the invitation was already accepted
     message.success(t('managers.messages.assignSuccess'));
     navigate('/login');
     return;
    }
    throw acceptError;
   }
  } catch (error) {
   console.error('Operation Error:', error);
   const errorMessage =
    error.response?.data?.error ||
    error.message ||
    t('managers.messages.failedAcceptInvitation');
   message.error(errorMessage);
  } finally {
   setLoading(false);
  }
 };

 // Add this hook to monitor the invitation acceptance process
 useEffect(() => {
  if (error) {
   console.error('Verification Error:', error);
  }
 }, [error]);

 const handleNewUserSignup = async (values) => {
  try {
   setLoading(true);

   // Format phone number with country code
   const fullPhoneNumber = `${countryCode}${values.phone}`;

   // Prepare the data for new user creation
   const signupData = {
    email: invitationData.email, // Use email from invitation
    firstname: values.firstname,
    lastname: values.lastname,
    phone: fullPhoneNumber,
    password: values.password,
   };

   const response = await acceptManagerInvitation(token, signupData);

   if (response.status === 'accepted') {
    message.success(t('managers.messages.signupSuccess'));
    setTimeout(() => {
     navigate('/login');
    }, 1500);
   } else {
    throw new Error(response.error || 'Failed to create account');
   }
  } catch (error) {
   console.error('Signup Error:', error);
   const errorMessage =
    error.response?.data?.error ||
    error.message ||
    t('managers.messages.signupError');
   message.error(errorMessage);
  } finally {
   setLoading(false);
  }
 };

 const handleCountryChange = (value) => {
  setCountryCode(value);
 };

 if (loading) {
  return (
   <div className="loading">
    <Spin size="large" />
   </div>
  );
 }

 if (!validToken || !invitationData) {
  return null;
 }

 // Split the client name into message components
 const messageTitle = t('managers.invitation.title');
 const fromMessage = invitationData.clientName
  ? `${t('managers.invitation.from')} ${invitationData.clientName}`
  : t('managers.invitation.generic');

 return (
  <Layout className="contentStyle">
   <DashboardHeader />
   <Content className="container">
    <Row justify="center" align="middle" gutter={48}>
     <Col xs={24}>
      <Title level={2}>{t('managers.invitation.title')}</Title>
      <Alert
       message={fromMessage}
       description={
        invitationData.userExists
         ? t('managers.invitation.existingUserMessage')
         : t('managers.invitation.newUserMessage')
       }
       type="info"
       showIcon
      />{' '}
      <br />
      {invitationData.userExists ? (
       <Form form={form} layout="vertical" onFinish={handleExistingUserAccept}>
        <Form.Item
         name="password"
         rules={[{ required: true, message: t('auth.validation.required') }]}
        >
         <Input.Password
          size="large"
          prefix={<LockOutlined />}
          placeholder={t('auth.passwordPlaceholder')}
         />
        </Form.Item>

        <Form.Item>
         <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          block
         >
          {t('managers.invitation.acceptButton')}
         </Button>
        </Form.Item>
       </Form>
      ) : (
       <div>
        <Title level={4}>
         {t('managers.invitation.proceedToSignupButton')}
        </Title>
        <Form
         form={form}
         name="signup"
         layout="vertical"
         onFinish={handleNewUserSignup}
         className="hide-required-mark"
        >
         <Row gutter={16}>
          <Col xd={24} md={12}>
           <Form.Item
            name="firstname"
            rules={[{ required: true, message: t('validation.firstName') }]}
           >
            <Input
             size="large"
             prefix={<UserOutlined />}
             placeholder={t('signup.firstName')}
            />
           </Form.Item>
          </Col>

          <Col xd={24} md={12}>
           <Form.Item
            name="lastname"
            rules={[{ required: true, message: t('validation.lastName') }]}
           >
            <Input
             size="large"
             prefix={<UserOutlined />}
             placeholder={t('signup.lastName')}
            />
           </Form.Item>
          </Col>

          <Col xd={24} md={12}>
           <Form.Item
            name="phone"
            rules={[{ required: true, message: t('validation.phone') }]}
           >
            <InputNumber
             size="large"
             type="number"
             addonBefore={
              <Select
               defaultValue={countryCode}
               style={{ width: 140 }}
               onChange={handleCountryChange}
              >
               {countries.map((country) => (
                <Option key={country.code} value={country.dialCode}>
                 {`${country.name} ${country.dialCode}`}
                </Option>
               ))}
              </Select>
             }
             style={{ width: '100%' }}
             placeholder={t('signup.phone')}
             controls={false}
            />
           </Form.Item>
          </Col>

          <Col xd={24} md={12}>
           <Form.Item
            name="password"
            rules={[
             { required: true, message: t('validation.createPassword') },
             { min: 8, message: t('validation.passwordLength') },
             {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
              message: t('validation.passwordRequirements'),
             },
            ]}
           >
            <Input.Password
             size="large"
             prefix={<LockOutlined />}
             placeholder={t('signup.password')}
            />
           </Form.Item>
          </Col>

          <Col xd={24} md={12}>
           <Form.Item
            name="password2"
            dependencies={['password']}
            rules={[
             { required: true },
             ({ getFieldValue }) => ({
              validator(_, value) {
               if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
               }
               return Promise.reject(
                new Error(t('validation.passwordMismatch'))
               );
              },
             }),
            ]}
           >
            <Input.Password
             size="large"
             prefix={<LockOutlined />}
             placeholder={t('signup.confirmPassword')}
            />
           </Form.Item>
          </Col>

          <Col xd={24} md={12}>
           <Form.Item>
            <Button
             type="primary"
             htmlType="submit"
             loading={loading}
             size="large"
             block
            >
             {t('managers.invitation.proceedToSignupButton')}
            </Button>
           </Form.Item>
          </Col>
         </Row>
        </Form>
       </div>
      )}
     </Col>
    </Row>
   </Content>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default ManagerVerification;
