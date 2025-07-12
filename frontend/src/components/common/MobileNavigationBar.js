import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../context/TranslationContext';

const MobileNavigationBar = () => {
 const { t } = useTranslation();
 const location = useLocation();
 const navigate = useNavigate();

 // Define navigation items with icons and routes
 const navItems = [
  {
   key: 'reservations',
   icon: <i className="fa-light fa-calendar-days" />,
   label: t('reservation.title'),
   path: '/reservations',
   pathPatterns: [
    '/reservations',
    '/create-reservation',
    '/generate-contract',
    '/contractslist',
   ],
  },
  {
   key: 'properties',
   icon: <i className="fa-light fa-house" />,
   label: t('property.title'),
   path: '/propertiesdashboard',
   pathPatterns: [
    '/propertiesdashboard',
    '/addproperty',
    '/property-management',
    '/propertyactions',
   ],
  },
  {
   key: 'tasks',
   icon: <i className="fa-light fa-list-check" />,
   label: t('tasks.title'),
   path: '/propertytaskdashboard',
  },
  {
   key: 'revenue',
   icon: <i className="fa-light fa-dollar-sign" />,
   label: t('revenue.title'),
   path: '/revenues',
   pathPatterns: ['/revenues', '/propertyrevenuedashboard'],
  },
  {
   key: 'concierges',
   icon: <i className="fa-light fa-user-tie" />,
   label: t('managers.title'),
   path: '/concierges',
   pathPatterns: ['/add-concierge', '/assign-concierge', '/concierges'],
  },
 ];

 const getInitialSelectedKey = () => {
  const currentPath = location.pathname;

  const matchingItem = navItems.find((item) => {
   if (item.pathPatterns && Array.isArray(item.pathPatterns)) {
    return item.pathPatterns.some((pattern) => currentPath.includes(pattern));
   }
   return currentPath.includes(item.path);
  });

  if (matchingItem) {
   return matchingItem.key;
  } else if (currentPath === '/') {
   return 'reservations';
  } else {
   return '';
  }
 };
 const [selectedKey, setSelectedKey] = useState(getInitialSelectedKey());

 useEffect(() => {
  const currentPath = location.pathname;

  // Find matching menu item based on pathPatterns
  const matchingItem = navItems.find((item) => {
   // Make sure pathPatterns exists before calling .some()
   if (item.pathPatterns && Array.isArray(item.pathPatterns)) {
    return item.pathPatterns.some((pattern) => currentPath.includes(pattern));
   }
   // Fallback to simple path matching if pathPatterns is not defined
   return currentPath.includes(item.path);
  });

  if (matchingItem) {
   setSelectedKey(matchingItem.key);
  } else if (currentPath === '/') {
   setSelectedKey('reservations');
  }
 }, [location.pathname]);

 // Improved function to check if an item should be active
 const isItemActive = (item) => {
  const currentPath = location.pathname;

  // First check if this is the selected key from our useEffect
  if (item.key === selectedKey) {
   return true;
  }

  // Then check if the current path exactly matches or starts with the item's path
  if (currentPath === item.path || currentPath.startsWith(item.path + '/')) {
   return true;
  }

  // Finally check if the current path matches any of the defined path patterns
  if (item.pathPatterns && Array.isArray(item.pathPatterns)) {
   return item.pathPatterns.some((pattern) => currentPath.includes(pattern));
  }

  return false;
 };

 return (
  <div className="mobile-navigation-bar">
   {navItems.map((item) => (
    <div
     key={item.key}
     className={`mobile-nav-item ${isItemActive(item) ? 'active' : ''}`}
     onClick={() => navigate(item.path)}
    >
     <div className="mobile-nav-icon">{item.icon}</div>
     <div className="mobile-nav-label">{item.label}</div>
    </div>
   ))}
  </div>
 );
};

export default MobileNavigationBar;
