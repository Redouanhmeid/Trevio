import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LeaveConfirmationDialog from '../components/common/LeaveConfirmationDialog';

const withNavigationProtection = (WrappedComponent, { allowedPaths = [] }) => {
 const WithNavigationProtection = (props) => {
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Store the current path to compare against later
  const currentPath = location.pathname;

  // Set up global click handler to log ALL clicks for debugging
  useEffect(() => {
   const debugClickHandler = (e) => {
    if (e.target.tagName === 'A' || e.target.closest('a')) {
     const linkElement =
      e.target.tagName === 'A' ? e.target : e.target.closest('a');
    }
   };

   document.addEventListener('click', debugClickHandler, true);

   return () => {
    document.removeEventListener('click', debugClickHandler, true);
   };
  }, []);

  // This handles the browser's back/forward buttons and tab closing
  useEffect(() => {
   // Function to handle before unload (closing tab/browser)
   const handleBeforeUnload = (e) => {
    const message = 'You have unsaved changes. Are you sure you want to leave?';
    e.preventDefault();
    e.returnValue = message;
    return message;
   };

   // Add event listener for tab/browser closing
   window.addEventListener('beforeunload', handleBeforeUnload);

   // Handle clicks on links in the page - USE CAPTURE PHASE
   const handleLinkClick = (e) => {
    // Find if the click was on an anchor tag or inside one
    let element = e.target;
    while (element && element.tagName !== 'A') {
     element = element.parentElement;
     if (!element) {
      return;
     }
    }

    // If it's an anchor tag with an href
    if (element && element.tagName === 'A' && element.getAttribute('href')) {
     const href = element.getAttribute('href');

     // Skip for external links, anchor links, or special URLs
     if (
      href.startsWith('http') ||
      href.startsWith('#') ||
      href.startsWith('tel:') ||
      href.startsWith('mailto:')
     ) {
      return;
     }

     // For internal links, intercept and show dialog if needed
     if (!allowedPaths.includes(href) && href !== currentPath) {
      e.preventDefault();
      e.stopPropagation();
      setPendingNavigation(href);
      setShowLeaveDialog(true);
     }
    }
   };

   // Listen for click events to catch link clicks - USE CAPTURE
   document.addEventListener('click', handleLinkClick, true);

   // Listen for popstate (browser back/forward) events
   const handlePopState = (e) => {
    // If the user is navigating away from the form
    if (
     !allowedPaths.includes(window.location.pathname) &&
     window.location.pathname !== currentPath
    ) {
     // Prevent the navigation
     e.preventDefault();
     // This next line is important - it puts the URL back to where it was
     window.history.pushState(null, '', currentPath);
     // Show the confirm dialog
     setShowLeaveDialog(true);
    }
   };

   // Listen for popstate (browser back/forward) events
   window.addEventListener('popstate', handlePopState);

   // Also prevent the initial navigation by pushing the current path to history
   window.history.pushState(null, '', currentPath);

   // Clean up when component unmounts
   return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('click', handleLinkClick, true);
    window.removeEventListener('popstate', handlePopState);
   };
  }, [currentPath]);

  // Method to handle canceling navigation
  const handleCancel = () => {
   setShowLeaveDialog(false);
   setPendingNavigation(null);
  };

  // Method to handle confirming navigation
  const handleConfirm = () => {
   setShowLeaveDialog(false);

   if (pendingNavigation) {
    navigate(pendingNavigation);
   }
  };

  return (
   <>
    <WrappedComponent
     {...props}
     safeNavigate={(to) => {
      // If the path is allowed, navigate directly
      if (allowedPaths.includes(to) || to === currentPath) {
       navigate(to);
       return;
      }

      // Otherwise show the dialog
      setPendingNavigation(to);
      setShowLeaveDialog(true);
     }}
    />
    <LeaveConfirmationDialog
     visible={showLeaveDialog}
     onCancel={handleCancel}
     onConfirm={handleConfirm}
    />
   </>
  );
 };

 return WithNavigationProtection;
};

export default withNavigationProtection;
