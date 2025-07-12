// src/components/common/TutorialsButton.js
// Updated to work with TutorialsAlert instead of TutorialsDrawer
import React from 'react';
import { Button, Tooltip } from 'antd';
import { useTranslation } from '../../context/TranslationContext';

const TutorialsButton = ({ onClick, isOpen = false }) => {
 const { t } = useTranslation();

 return (
  <Tooltip title={t('tutorials.title')}>
   <Button
    type="text"
    icon={
     <i
      className="fa-regular fa-circle-play"
      style={{
       color: '#fff',
       fontSize: '20px',
       transition: 'all 0.3s ease',
       transform: isOpen ? 'rotate(15deg)' : 'rotate(0deg)',
      }}
     />
    }
    onClick={onClick}
    style={{
     color: 'white',
     border: 'none',
     background: isOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
     padding: '4px 8px',
     height: 'auto',
     display: 'flex',
     alignItems: 'center',
     justifyContent: 'center',
     borderRadius: '8px',
     transition: 'all 0.3s ease',
    }}
    className={`tutorials-button ${isOpen ? 'tutorials-button-active' : ''}`}
   />
  </Tooltip>
 );
};

export default TutorialsButton;
