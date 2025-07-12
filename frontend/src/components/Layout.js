import React from 'react';
import GoogleAnalyticsTracker from '../utils/GoogleAnalyticsTracker';
import ChatbotWidget from '../pages/components/ChatbotWidget';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
 const location = useLocation();

 // Don't show chatbot on login/signup pages
 const hideChatbot = ['/reset-password-request'].includes(location.pathname);

 return (
  <>
   <GoogleAnalyticsTracker />
   {children}
   {!hideChatbot && <ChatbotWidget />}
  </>
 );
};

export default Layout;
