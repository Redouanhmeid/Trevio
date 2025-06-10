import React from 'react';
import ChatbotWidget from '../pages/components/ChatbotWidget';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
 const location = useLocation();

 // Don't show chatbot on login/signup pages
 const hideChatbot = ['/login', '/signup', '/reset-password-request'].includes(
  location.pathname
 );

 return (
  <>
   {children}
   {!hideChatbot && <ChatbotWidget />}
  </>
 );
};

export default Layout;
