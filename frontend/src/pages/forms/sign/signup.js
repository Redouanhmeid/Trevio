import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../hooks/useAuthContext';
import { useSignup } from '../../../hooks/useSignup';
import {
 Button,
 Space,
 Form,
 Input,
 Col,
 Row,
 Radio,
 Typography,
 Layout,
 InputNumber,
 Select,
 Alert,
 Grid,
} from 'antd';
import {
 LockOutlined,
 MailOutlined,
 GoogleOutlined,
 UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import Foot from '../../../components/common/footer';
import Logo from '../../../assets/Trevio-10.png';
import LoginSignup from '../../../assets/treviologinsignup.png';
import { countries } from '../../../utils/countries';
import { useTranslation } from '../../../context/TranslationContext';

const { Title, Text } = Typography;
const { Option } = Select;

const Signup = () => {
 const { t } = useTranslation();
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();
 const [form] = Form.useForm();
 const navigate = useNavigate();
 const location = useLocation();
 const { signup, googleSignup, error, isLoading, message } = useSignup();
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [firstname, setFirstName] = useState('');
 const [lastname, setLastName] = useState('');
 const [phone, setPhone] = useState('');
 const [countryCode, setCountryCode] = useState(
  countries.find((country) => country.name === 'Morocco').dialCode
 );
 const { user } = useAuthContext();

 useEffect(() => {
  if (user) {
   // Instead of redirecting to dashboard, check if user is verified
   if (!user.isVerified) {
    navigate('/verify-email', { state: { email: user.email } });
   } else {
    const from = location.state?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
   }
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

 const handleCountryChange = (value) => {
  setCountryCode(value);
 };

 const handleSubmit = async (e) => {
  const fullPhoneNumber = `${countryCode}${phone}`;
  await signup(email, password, firstname, lastname, fullPhoneNumber);
 };

 const handleGoogleSignup = async () => {
  await googleSignup();
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
        {t('signup.startFree')}
       </Title>
       <Text
        type="secondary"
        style={{ fontSize: 16, marginBottom: 16, display: 'block' }}
       >
        {t('signup.createAccountText')}
       </Text>

       {/* Sign up / Login Toggle */}
       <Row gutter={8} style={{ marginBottom: 24 }}>
        <Col span={24}>
         <Radio.Group
          block
          options={options}
          defaultValue="signup"
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
        name="signup"
        initialValues={{ remember: true }}
        onFinish={handleSubmit}
        style={{ marginBottom: 24, textAlign: 'left' }}
       >
        <Row gutter={16}>
         <Col span={12}>
          <Form.Item
           name="lastname"
           onChange={(e) => setLastName(e.target.value)}
           value={lastname}
           rules={[{ required: true, message: t('validation.lastName') }]}
          >
           <Input
            size="large"
            prefix={<UserOutlined />}
            placeholder={t('signup.lastName')}
           />
          </Form.Item>
         </Col>
         <Col span={12}>
          <Form.Item
           name="firstname"
           onChange={(e) => setFirstName(e.target.value)}
           value={firstname}
           rules={[{ required: true, message: t('validation.firstName') }]}
          >
           <Input
            size="large"
            prefix={<UserOutlined />}
            placeholder={t('signup.firstName')}
           />
          </Form.Item>
         </Col>
        </Row>

        <Form.Item
         name="email"
         onChange={(e) => setEmail(e.target.value)}
         value={email}
         rules={[
          {
           type: 'email',
           required: true,
           message: t('validation.email'),
          },
         ]}
        >
         <Input
          size="large"
          prefix={<MailOutlined />}
          placeholder={t('signup.email')}
         />
        </Form.Item>

        <Form.Item
         name="phone"
         onChange={(e) => setPhone(e.target.value)}
         value={phone}
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

        <Form.Item
         name="password"
         onChange={(e) => setPassword(e.target.value)}
         value={password}
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
            return Promise.reject(new Error(t('validation.passwordMismatch')));
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

        {message && (
         <Form.Item>
          <Alert message={message} type="info" showIcon closable />
         </Form.Item>
        )}
        {error && (
         <Form.Item>
          <Alert message={error} type="warning" showIcon closable />
         </Form.Item>
        )}

        <Space direction="vertical" style={{ width: '100%', gap: 16 }}>
         <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          disabled={isLoading}
         >
          {t('signup.startButton')}
         </Button>

         <Button
          block
          size="large"
          icon={<GoogleOutlined />}
          onClick={handleGoogleSignup}
          disabled={isLoading}
         >
          {t('signup.withGoogle')}
         </Button>
        </Space>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
         <Text type="secondary" style={{ fontSize: 14 }}>
          {t('signup.termsText')}{' '}
          <Button type="link" style={{ padding: 0 }}>
           {t('signup.termsLink')}
          </Button>
         </Text>
        </div>
       </Form>
      </div>
     </Col>

     {/* Right side illustration */}
     <Col xs={0} md={14}>
      <div style={{ padding: 24, maxWidth: 580, margin: '0 auto' }}>
       <img
        src={LoginSignup}
        alt="Signup illustration"
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

export default Signup;
