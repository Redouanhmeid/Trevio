import React, { useState } from 'react';
import { Modal, Form, Input, Button, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';

/**
 * A reusable modal component that requests password confirmation before
 * performing sensitive actions like property deletion.
 */
const PasswordConfirmationModal = ({
 visible,
 onCancel,
 onConfirm,
 title,
 confirmLoading,
 errorMessage,
 actionText,
}) => {
 const [form] = Form.useForm();

 const handleSubmit = async () => {
  try {
   const values = await form.validateFields();
   onConfirm(values.password);
  } catch (error) {
   console.error('Validation failed:', error);
  }
 };

 return (
  <Modal
   title={title}
   open={visible}
   onCancel={() => {
    form.resetFields();
    onCancel();
   }}
   footer={[
    <Button key="cancel" onClick={onCancel}>
     Cancel
    </Button>,
    <Button
     key="submit"
     type="primary"
     loading={confirmLoading}
     onClick={handleSubmit}
     danger
    >
     {actionText || 'Confirm'}
    </Button>,
   ]}
  >
   <Form form={form} layout="vertical">
    <Form.Item
     name="password"
     rules={[{ required: true, message: 'Please enter your password' }]}
    >
     <Input.Password
      prefix={<LockOutlined />}
      placeholder="Enter your password to confirm"
      autoComplete="current-password"
     />
    </Form.Item>

    {errorMessage && (
     <Alert
      message="Error"
      description={errorMessage}
      type="error"
      showIcon
      style={{ marginBottom: 16 }}
     />
    )}
   </Form>
  </Modal>
 );
};

export default PasswordConfirmationModal;
