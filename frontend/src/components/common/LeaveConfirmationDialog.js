import React, { useEffect } from 'react';
import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from '../../context/TranslationContext';

/**
 * Dialog component to confirm before leaving a property creation/edit flow
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Controls if the dialog is visible
 * @param {Function} props.onCancel - Function to call when canceling
 * @param {Function} props.onConfirm - Function to call when confirming leave
 * @param {string} props.title - Optional custom title
 * @param {string} props.content - Optional custom content
 * @returns {JSX.Element} Modal dialog component
 */
const LeaveConfirmationDialog = ({
 visible,
 onCancel,
 onConfirm,
 title = null,
 content = null,
}) => {
 const { t } = useTranslation();

 // Default translations if not provided
 const dialogTitle =
  title || t('navigation.leaveWarningTitle') || 'Leave property creation?';
 const dialogContent =
  content ||
  t('navigation.leaveWarningContent') ||
  'You have unsaved changes. If you leave now, your progress will be lost. Are you sure you want to leave?';

 return (
  <Modal
   title={
    <span>
     <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
     {dialogTitle}
    </span>
   }
   open={visible}
   onCancel={() => {
    onCancel();
   }}
   footer={[
    <Button
     key="back"
     onClick={() => {
      onCancel();
     }}
    >
     {t('common.stay') || 'Stay'}
    </Button>,
    <Button
     key="submit"
     type="primary"
     danger
     onClick={() => {
      onConfirm();
     }}
    >
     {t('common.leave') || 'Leave'}
    </Button>,
   ]}
   closable={false}
   maskClosable={false}
  >
   <p>{dialogContent}</p>
  </Modal>
 );
};

export default LeaveConfirmationDialog;
