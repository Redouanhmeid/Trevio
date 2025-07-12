import React, { createContext, useState, useContext } from 'react';
import enTranslations from '../translations/en.json';
import frTranslations from '../translations/fr.json';

const TranslationContext = createContext();

// Combine all translations
const translations = {
 en: enTranslations,
 fr: frTranslations,
};

export const TranslationProvider = ({ children }) => {
 // Get initial language from localStorage or default to 'fr'
 const [currentLanguage, setCurrentLanguage] = useState(
  localStorage.getItem('preferredLanguage') || 'fr'
 );

 // Function to get translation
 const t = (key, defaultText = key) => {
  // Split the key by dots to handle nested objects
  const keys = key.split('.');
  let translation = translations[currentLanguage];

  // Traverse the nested object
  for (const k of keys) {
   translation = translation?.[k];
   if (translation === undefined) {
    console.warn(
     `Translation missing for key: ${key} in language: ${currentLanguage}`
    );
    return defaultText;
   }
  }

  return translation;
 };

 // Function to change the current language
 const setLanguage = (language) => {
  if (translations[language]) {
   setCurrentLanguage(language);
   localStorage.setItem('preferredLanguage', language);
  } else {
   console.warn(`Language ${language} is not supported`);
  }
 };

 return (
  <TranslationContext.Provider
   value={{
    t,
    currentLanguage,
    setLanguage,
   }}
  >
   {children}
  </TranslationContext.Provider>
 );
};

export const useTranslation = () => {
 const context = useContext(TranslationContext);
 if (!context) {
  throw new Error('useTranslation must be used within a TranslationProvider');
 }
 return context;
};

export default TranslationContext;
