import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Row, Col, Alert } from 'antd';
import { useUserData } from '../../../hooks/useUserData';
import { useTranslation } from '../../../context/TranslationContext';

const Changepassword = ({ Id }) => {
 const { t } = useTranslation();
 const { isLoading, updatePassword, success, errorMsg } = useUserData();

 const onFinish = async (values) => {
  const { currentPassword, newPassword } = values;
  await updatePassword(Id, currentPassword, newPassword);
 };

 return (
  <Form
   name="dependencies"
   autoComplete="off"
   style={{
    maxWidth: 600,
   }}
   onFinish={onFinish}
   layout="vertical"
  >
   <Form.Item
    label={t('password.current')}
    name="currentPassword"
    rules={[
     {
      required: true,
      message: t('validation.required'),
     },
    ]}
   >
    <Input type="password" />
   </Form.Item>
   <Form.Item
    label={t('password.new')}
    name="newPassword"
    rules={[
     {
      required: true,
      message: t('validation.required'),
     },
    ]}
   >
    <Input type="password" />
   </Form.Item>
   <Form.Item
    label={t('password.confirm')}
    name="newPassword2"
    dependencies={['newPassword']}
    rules={[
     {
      required: true,
      message: t('validation.required'),
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
    <Input type="password" />
   </Form.Item>
   <Row justify="end">
    <Col xs={24} md={5}>
     <Form.Item>
      <Button
       type="primary"
       htmlType="submit"
       loading={!isLoading}
       disabled={success}
      >
       {t('button.modify')}
      </Button>
     </Form.Item>
    </Col>
   </Row>
   {errorMsg && !success && (
    <Alert message={errorMsg} type="warning" showIcon closable />
   )}
   {success && (
    <Alert message={t('password.success')} type="success" showIcon closable />
   )}
  </Form>
 );
};

export default Changepassword;
