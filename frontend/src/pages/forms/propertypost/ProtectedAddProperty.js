import React from 'react';
import AddProperty from './AddProperty';
import withNavigationProtection from '../../../utils/withNavigationProtection';

// Define the allowed paths within the add property flow
// Any navigation to these paths won't trigger the confirmation dialog
const allowedPaths = [
 '/addproperty',
 // Add any other paths that are part of the creation flow
];

// Create a protected version of the AddProperty component
const ProtectedAddProperty = withNavigationProtection(AddProperty, {
 allowedPaths,
});

export default ProtectedAddProperty;
