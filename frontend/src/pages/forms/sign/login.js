import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../hooks/useAuthContext';
import { useLogin } from '../../../hooks/useLogin';
import {
 Button,
 Space,
 Checkbox,
 Form,
 Input,
 Col,
 Row,
 Radio,
 Typography,
 Layout,
 Alert,
 Grid,
} from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import Foot from '../../../components/common/footer';
import Logo from '../../../assets/Trevio-10.png';
import LoginSignup from '../../../assets/treviologinsignup.png';
import { useTranslation } from '../../../context/TranslationContext';

const { Title, Text } = Typography;

const Login = () => {
 const { t } = useTranslation();
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();

 const [form] = Form.useForm();
 const navigate = useNavigate();
 const location = useLocation();
 const { login, googleLogin, error, isLoading } = useLogin();
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [loginError, setLoginError] = useState(null);
 const { user } = useAuthContext();

 useEffect(() => {
  if (loginError) {
   setLoginError(null);
  }
 }, [email, password]);

 useEffect(() => {
  if (user) {
   const from = location.state?.from?.pathname || '/dashboard';
   navigate(from, { replace: true });
  }
 }, [user, navigate, location]);

 const options = [
  {
   label: t('auth.signupButton'),
   value: 'signup',
  },
  {
   label: t('auth.loginButton'),
   value: 'login',
  },
 ];

 const onChange = ({ target: { value } }) => {
  navigate(`/${value}`);
 };

 const handleSubmit = async () => {
  try {
   setLoginError(null);

   const result = await login(email, password);
   if (result?.error) {
    handleFormError(result.error);
    return;
   } /* 
   if (result.data?.status === 'EN ATTENTE') {
    // Remove from localStorage
    localStorage.removeItem('user');
    return;
   } */
   navigate('/');
  } catch (err) {
   // Error handling is already done in the hooks
   console.error('Login error:', err);
  }
 };

 // Handle form errors
 const handleFormError = (error) => {
  if (typeof error === 'string') {
   setLoginError(error);
  } else if (error?.message) {
   setLoginError(error.message);
  } else {
   setLoginError(t('auth.genericError') || 'An error occurred during login');
  }
 };

 const handleGoogleLogin = async () => {
  try {
   const result = await googleLogin();
   if (result) {
    navigate('/');
   }
  } catch (err) {
   console.error('Google login error:', err);
   setLoginError(err.message || 'Google login failed');
  }
 };

 return (
  <Layout className="contentStyle">
   <Layout className="container">
    <Row
     justify="center"
     align="middle"
     gutter={48}
     className={!screens.xs && 'TrevioBg'}
    >
     <Col xs={24} md={10}>
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
       {/* Logo */}
       <img
        src={Logo}
        alt="Trevio"
        style={{
         height: 40,
         marginBottom: 12,
         marginTop: screens.xs ? 32 : 0,
        }}
       />

       {/* Header */}
       <Title level={2} style={{ marginBottom: 8 }}>
        {t('auth.login')}
       </Title>
       <Text
        type="secondary"
        style={{ fontSize: 16, marginBottom: 16, display: 'block' }}
       >
        {t('auth.welcome')}
       </Text>

       {/* Sign up / Login Toggle */}
       <Row gutter={8} style={{ marginBottom: 24 }}>
        <Col span={24}>
         <Radio.Group
          block
          options={options}
          defaultValue="login"
          optionType="button"
          onChange={onChange}
          style={{ width: '100%', display: 'flex' }}
          buttonStyle="solid"
          className="custom-radio-group"
         />
        </Col>
       </Row>

       <Form
        form={form}
        layout="vertical"
        name="login"
        initialValues={{ remember: true }}
        onFinish={handleSubmit}
        style={{ marginBottom: 24 }}
       >
        <Form.Item
         name="email"
         onChange={(e) => setEmail(e.target.value)}
         value={email}
         rules={[
          {
           required: true,
           message: t('auth.emailRequired'),
           type: 'email',
          },
         ]}
        >
         <Input
          size="large"
          prefix={<UserOutlined />}
          placeholder={t('auth.emailPlaceholder')}
         />
        </Form.Item>

        <Form.Item
         name="password"
         onChange={(e) => setPassword(e.target.value)}
         value={password}
         rules={[
          {
           required: true,
           message: t('auth.validation.required'),
          },
         ]}
        >
         <Input.Password
          size="large"
          prefix={<LockOutlined />}
          placeholder={t('auth.passwordPlaceholder')}
         />
        </Form.Item>

        <Row
         justify="space-between"
         align="middle"
         style={{ marginBottom: 24 }}
        >
         <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox>{t('auth.rememberMe')}</Checkbox>
         </Form.Item>
         <Button type="link" style={{ padding: 0 }}>
          {t('auth.forgotPassword')}
         </Button>
        </Row>

        {(loginError || error) && (
         <Form.Item>
          <Alert
           message={loginError || error}
           type="error"
           showIcon
           closable
           onClose={() => setLoginError(null)}
          />
         </Form.Item>
        )}

        <Space direction="vertical" style={{ width: '100%', gap: 16 }}>
         <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={isLoading}
         >
          {t('auth.loginButton')}
         </Button>

         <Button
          block
          size="large"
          icon={<GoogleOutlined />}
          onClick={handleGoogleLogin}
          disabled={isLoading}
         >
          {t('auth.loginWithGoogle')}
         </Button>
        </Space>
       </Form>

       <Row justify="center">
        <Text type="secondary">
         {t('auth.needAccount')}{' '}
         <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => navigate(`/signup`)}
         >
          {t('auth.signupButton')}
         </Button>
        </Text>
       </Row>
      </div>
     </Col>

     {/* Right side illustration */}
     <Col xs={0} md={14}>
      <div
       style={{
        padding: 24,
        maxWidth: 580,
        margin: '0 auto',
       }}
      >
       <img
        src={LoginSignup}
        alt="Login illustration"
        style={{ width: '100%', height: 'auto' }}
       />
      </div>
     </Col>
    </Row>
   </Layout>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default Login;
