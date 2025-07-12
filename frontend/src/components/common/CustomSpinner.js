import React from 'react';
import { Spin } from 'antd';
import loadingGif from '../../assets/trevio-spinner.gif';

// Create a custom spinner indicator
const customIndicator = (
 <img
  src={loadingGif}
  alt="Loading..."
  style={{
   width: '80px',
   height: '80px',
  }}
 />
);

// Set the custom spinner as the default for all Spin components
Spin.setDefaultIndicator(customIndicator);

// Optional: Export a custom spin component in case you need specific variations
export const CustomSpin = (props) => {
 return <Spin indicator={customIndicator} {...props} />;
};

export default CustomSpin;
