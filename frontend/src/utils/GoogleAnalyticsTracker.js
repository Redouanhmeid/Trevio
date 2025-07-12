// utils/GoogleAnalyticsTracker.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleAnalyticsTracker = () => {
 const location = useLocation();

 useEffect(() => {
  if (window.gtag) {
   window.gtag('event', 'page_view', {
    page_path: location.pathname + location.search,
    page_location: window.location.href,
    page_title: document.title,
   });
  }
 }, [location]);

 useEffect(() => {
  if (process.env.NODE_ENV === 'production') {
   console.log('Sending test GA event...');
   window.gtag('event', 'test_event', {
    event_category: 'test',
    event_label: 'Deployment verification',
   });
  }
 }, []);

 return null; // It's a side-effect-only component
};

export default GoogleAnalyticsTracker;
