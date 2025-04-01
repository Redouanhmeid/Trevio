import React, { useEffect } from 'react';
import { Form, Input, Select, Switch, Button, Space } from 'antd';
import { useTranslation } from '../../context/TranslationContext';

const { Option } = Select;
const { TextArea } = Input;

const ServiceWorkerForm = ({
 initialValues = {},
 onFinish,
 onCancel,
 isSubmitting = false,
}) => {
 const { t } = useTranslation();
 const [form] = Form.useForm();

 // Set form values when initialValues change
 useEffect(() => {
  if (Object.keys(initialValues).length > 0) {
   form.setFieldsValue(initialValues);
  } else {
   form.resetFields();
   // Set default value for isVisibleToGuests
   form.setFieldsValue({ isVisibleToGuests: true });
  }
 }, [initialValues, form]);

 return (
  <Form
   form={form}
   layout="vertical"
   onFinish={onFinish}
   initialValues={{ isVisibleToGuests: true }}
  >
   <Form.Item
    name="name"
    label={t('serviceWorker.name')}
    rules={[{ required: true, message: t('validation.required') }]}
   >
    <Input placeholder={t('serviceWorker.name')} />
   </Form.Item>

   <Form.Item
    name="category"
    label={t('serviceWorker.category')}
    rules={[{ required: true, message: t('validation.required') }]}
   >
    <Select placeholder={t('serviceWorker.selectCategory')}>
     {Object.entries(
      t('serviceWorker.categories', { returnObjects: true })
     ).map(([key, value]) => (
      <Option key={key} value={key}>
       {value}
      </Option>
     ))}
    </Select>
   </Form.Item>

   <Form.Item
    name="phone"
    label={t('serviceWorker.phone')}
    rules={[{ required: true, message: t('validation.required') }]}
   >
    <Input placeholder="+212 XXX-XXXXXX" />
   </Form.Item>

   <Form.Item name="email" label={t('serviceWorker.email')}>
    <Input placeholder="email@example.com" />
   </Form.Item>

   <Form.Item name="notes" label={t('serviceWorker.notes')}>
    <TextArea rows={4} />
   </Form.Item>

   <Form.Item
    name="isVisibleToGuests"
    valuePropName="checked"
    label={t('serviceWorker.isVisibleToGuests')}
   >
    <Switch className="custom-switch-purple" />
   </Form.Item>

   <Form.Item>
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
     <Button onClick={onCancel}>{t('common.cancel')}</Button>
     <Button type="primary" htmlType="submit" loading={isSubmitting}>
      {initialValues.id ? t('common.update') : t('common.save')}
     </Button>
    </div>
   </Form.Item>
  </Form>
 );
};

export default ServiceWorkerForm;
