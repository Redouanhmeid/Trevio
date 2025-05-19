// components/AddManagerForm.js
import React, { useEffect, useState } from 'react';
import {
 Form,
 Input,
 Button,
 message,
 Layout,
 Typography,
 Divider,
 Spin,
 Grid,
 Alert,
} from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../../context/TranslationContext';
import Foot from '../../../components/common/footer';
import { useUserData } from '../../../hooks/useUserData';
import DashboardHeader from '../../../components/common/DashboardHeader';
import { useConcierge } from '../../../hooks/useConcierge';

const { Content } = Layout;
const { Title, Text } = Typography;

const AddConciergeForm = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const { assignConcierge, isLoading } = useConcierge();
 const { sendManagerInvitation, error: userDataError } = useUserData();
 const [form] = Form.useForm();
 const location = useLocation();
 const clientId = location.state?.clientId;
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();

 // State to track if there's a pending invitation
 const [pendingInvitation, setPendingInvitation] = useState(false);
 const [invitedEmail, setInvitedEmail] = useState('');
 const [formError, setFormError] = useState(null);
 const [loading, setLoading] = useState(false);

 const onFinish = async (values) => {
  setLoading(true);
  setFormError(null);

  try {
   await sendManagerInvitation(values.email);
   message.success(t('managers.addSuccess'));
   navigate('/concierges');
  } catch (err) {
   if (err.response?.data?.error?.includes('invitation is already pending')) {
    setPendingInvitation(true);
    setInvitedEmail(values.email);
   } else {
    setFormError(err.response?.data?.error || t('managers.addError'));
   }
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  if (!clientId) {
   setFormError(t('managers.noUserId'));
   setTimeout(() => {
    navigate('/concierges');
   }, 2000);
  }
 }, [clientId, navigate, t]);

 return (
  <Layout className="contentStyle">
   <DashboardHeader />
   <Content className="container">
    <Title level={3}>{t('managers.addTitle')}</Title>

    {pendingInvitation && (
     <Alert
      type="info"
      showIcon
      message={t('managers.pendingInvitation.title')}
      description={
       <>
        <Text>
         {t('managers.pendingInvitation.description', { email: invitedEmail })}
        </Text>
        <br />
        <br />
        <Text>{t('managers.pendingInvitation.instructions')}</Text>
       </>
      }
      style={{ marginBottom: 24 }}
     />
    )}

    {formError && (
     <Alert
      type="error"
      showIcon
      message={t('common.error')}
      description={formError}
      style={{ marginBottom: 24 }}
     />
    )}

    <Spin spinning={loading || isLoading}>
     <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      autoComplete="off"
      className="hide-required-mark"
     >
      <Form.Item
       name="email"
       label={t('managers.email')}
       rules={[
        {
         required: true,
         message: t('managers.validation.required'),
        },
        {
         type: 'email',
         message: t('managers.validation.email'),
        },
       ]}
      >
       <Input placeholder={t('managers.emailPlaceholder')} />
      </Form.Item>

      <Form.Item>
       <div
        style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}
       >
        <Button onClick={() => navigate('/concierges')}>
         {t('common.cancel')}
        </Button>
        <Button type="primary" htmlType="submit">
         {t('managers.addButton')}
        </Button>
       </div>
      </Form.Item>
     </Form>
    </Spin>
   </Content>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default AddConciergeForm;
