// components/AddManagerForm.js
import React, { useEffect } from 'react';
import {
 Form,
 Input,
 Button,
 message,
 Layout,
 Typography,
 Divider,
 Spin,
} from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../../context/TranslationContext';
import useManager from '../../../hooks/useManager';
import Head from '../../../components/common/header';
import Foot from '../../../components/common/footer';
import { useUserData } from '../../../hooks/useUserData';

const { Content } = Layout;
const { Title } = Typography;

const AddConciergeForm = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const { createManager, loading, error } = useManager();
 const { sendManagerInvitation } = useUserData();
 const [form] = Form.useForm();
 const location = useLocation();
 const clientId = location.state?.clientId;

 const onFinish = async (values) => {
  try {
   await sendManagerInvitation(values.email);
   message.success(t('managers.addSuccess'));
   navigate('/dashboard');
  } catch (err) {
   message.error(error?.message || t('managers.addError'));
  }
 };

 useEffect(() => {
  if (!clientId) {
   message.error(t('managers.noUserId'));
   navigate('/dashboard');
  }
 }, [clientId, navigate]);

 return (
  <Layout className="contentStyle">
   <Head />
   <Content className="container">
    <Title level={2}>{t('managers.addTitle')}</Title>

    <Spin spinning={loading}>
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
        <Button onClick={() => navigate('/dashboard')}>
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
   <Foot />
  </Layout>
 );
};

export default AddConciergeForm;
