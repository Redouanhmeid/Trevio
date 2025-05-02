import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import Step1NameAddresse from './Step1NameAddresse';
import Step2CheckInOut from './Step2CheckInOut';
import Step3Equipements from './Step3Equipements';
import Step4Photos from './Step4Photos';
import Step5HouseManual from './Step5HouseManual';
import { useTranslation } from '../../../context/TranslationContext';

// Define your allowed paths - this won't trigger the confirmation dialog
const ALLOWED_PATHS = ['/addproperty', '/property-list', '/dashboard'];

const AddProperty = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const location = useLocation();

 // State for modal
 const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);
 const [pendingNavigation, setPendingNavigation] = useState(null);

 //state for steps
 const [current, setCurrent] = useState(1);
 //state for form data
 const [formData, setFormData] = useState({});

 // Set up navigation protection
 useEffect(() => {
  // Handle browser's back/forward buttons and tab closing
  const handleBeforeUnload = (e) => {
   e.preventDefault();
   e.returnValue = '';
   return '';
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  // Handle clicks on links
  const handleLinkClick = (e) => {
   let element = e.target;

   // Find if the click is on an anchor tag
   while (element && element.tagName !== 'A') {
    element = element.parentElement;
    if (!element) break;
   }

   // If we found an anchor tag with href
   if (element && element.tagName === 'A' && element.getAttribute('href')) {
    const href = element.getAttribute('href');

    // Skip for external links, anchors, emails, etc.
    if (
     href.startsWith('http') ||
     href.startsWith('#') ||
     href.startsWith('tel:') ||
     href.startsWith('mailto:')
    ) {
     return;
    }

    // For internal navigation
    if (!ALLOWED_PATHS.includes(href) && href !== location.pathname) {
     e.preventDefault();
     setPendingNavigation(href);
     setIsLeaveModalVisible(true);
    }
   }
  };

  document.addEventListener('click', handleLinkClick);

  // Cleanup listeners on unmount
  return () => {
   window.removeEventListener('beforeunload', handleBeforeUnload);
   document.removeEventListener('click', handleLinkClick);
  };
 }, [location.pathname]);

 // Create custom navigation function
 const safeNavigate = (path) => {
  if (ALLOWED_PATHS.includes(path) || path === location.pathname) {
   navigate(path);
  } else {
   setPendingNavigation(path);
   setIsLeaveModalVisible(true);
  }
 };

 // Modal handlers
 const handleCancelNavigation = () => {
  setIsLeaveModalVisible(false);
  setPendingNavigation(null);
 };

 const handleConfirmNavigation = () => {
  setIsLeaveModalVisible(false);
  if (pendingNavigation) {
   navigate(pendingNavigation);
  }
 };

 // function for going to next step by increasing current state by 1
 const next = () => {
  setCurrent(current + 1);
 };

 // function for going to previous step by decreasing current state by 1
 const prev = () => {
  setCurrent(current - 1);
 };

 // handling form input data by taking onchange value and updating our previous form data state
 const handleInputData = (input) => (e) => {
  // input value from the form
  const { value } = e.target;

  //updating for data state taking previous state and then adding new value to create new object
  setFormData((prevData) => ({
   ...prevData,
   [input]: value,
  }));
 };

 // Progress steps component
 const ProgressSteps = () => (
  <div
   style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 24,
   }}
  >
   {[1, 2, 3, 4, 5].map((step, index) => (
    <React.Fragment key={step}>
     <div
      style={{
       width: 12,
       height: 12,
       borderRadius: '50%',
       backgroundColor: step <= current ? '#6D5FFA' : '#f0f0f0',
      }}
     />
     {index < 4 && (
      <div
       style={{
        flex: 1,
        height: 2,
        backgroundColor: step < current ? '#6D5FFA' : '#f0f0f0',
        margin: '0 8px',
       }}
      />
     )}
    </React.Fragment>
   ))}
  </div>
 );

 // Add Leave Confirmation Modal
 const leaveConfirmationModal = (
  <Modal
   title={
    <span>
     <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
     {t('navigation.leaveWarningTitle') || 'Leave property creation?'}
    </span>
   }
   open={isLeaveModalVisible}
   onOk={handleConfirmNavigation}
   onCancel={handleCancelNavigation}
   okText={t('common.leave') || 'Leave'}
   cancelText={t('common.stay') || 'Stay'}
  >
   <p>
    {t('navigation.leaveWarningContent') ||
     'You have unsaved changes. If you leave now, your progress will be lost. Are you sure you want to leave?'}
   </p>
  </Modal>
 );

 switch (current) {
  // Name Adrresse & Map Picker
  case 1:
   return (
    <>
     {leaveConfirmationModal}
     <Step1NameAddresse
      next={next}
      handleFormData={handleInputData}
      values={formData}
      ProgressSteps={ProgressSteps}
     />
    </>
   );
  // CheckIn and ChekOut
  case 2:
   return (
    <>
     {leaveConfirmationModal}
     <Step2CheckInOut
      next={next}
      prev={prev}
      values={formData}
      ProgressSteps={ProgressSteps}
     />
    </>
   );
  // Equipments
  case 3:
   return (
    <>
     {leaveConfirmationModal}
     <Step3Equipements
      next={next}
      prev={prev}
      values={formData}
      ProgressSteps={ProgressSteps}
     />
    </>
   );
  // Photos
  case 4:
   return (
    <>
     {leaveConfirmationModal}
     <Step4Photos
      next={next}
      prev={prev}
      values={formData}
      ProgressSteps={ProgressSteps}
     />
    </>
   );
  // HouseManual
  case 5:
   return (
    <>
     {leaveConfirmationModal}
     <Step5HouseManual
      prev={prev}
      values={formData}
      ProgressSteps={ProgressSteps}
     />
    </>
   );
  default:
   return null;
 }
};

export default AddProperty;
