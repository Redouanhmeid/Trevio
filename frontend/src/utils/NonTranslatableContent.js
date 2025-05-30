import React from 'react';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from '../context/TranslationContext';

const NonTranslatableContent = ({ content, className = '', style = {} }) => {
 const { t } = useTranslation();

 if (!content || content.trim() === '') {
  return null;
 }

 return (
  <div
   className={className}
   style={{
    position: 'relative',
    padding: '12px',
    border: '1px solid #d9d9d9',
    borderRadius: '6px',
    backgroundColor: '#fafafa',
    marginBottom: '16px',
    ...style,
   }}
  >
   <Tooltip
    title={t('common.nonTranslatableNote')}
    overlayStyle={{ maxWidth: '300px' }}
    overlayInnerStyle={{
     fontSize: '13px',
     lineHeight: '1.4',
     padding: '8px 12px',
    }}
   >
    <InfoCircleOutlined
     style={{
      position: 'absolute',
      top: '8px',
      right: '8px',
      color: '#1890ff',
      fontSize: '14px',
      cursor: 'help',
     }}
    />
   </Tooltip>
   <div style={{ paddingRight: '12px' }}>{content}</div>
  </div>
 );
};

export default NonTranslatableContent;
