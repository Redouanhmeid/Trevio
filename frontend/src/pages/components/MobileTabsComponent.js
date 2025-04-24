import React, { useState } from 'react';
import { Select, Tabs, Grid } from 'antd';

const { useBreakpoint } = Grid;

const MobileTabsComponent = ({ items, defaultActiveKey }) => {
 const [activeKey, setActiveKey] = useState(defaultActiveKey || items[0]?.key);
 const screens = useBreakpoint();

 const handleChange = (value) => {
  setActiveKey(value);
 };

 // Find the active content based on key
 const activeContent = items.find((item) => item.key === activeKey)?.children;

 // On mobile, show a Select component
 if (!screens.md) {
  return (
   <div className="mobile-tabs-container">
    <Select
     className="mobile-tabs-select"
     value={activeKey}
     onChange={handleChange}
     options={items.map((item) => ({
      value: item.key,
      label: (
       <div className="mobile-tab-option">
        {item.icon && <span className="mobile-tab-icon">{item.icon}</span>}
        <span>{item.label}</span>
       </div>
      ),
     }))}
     dropdownStyle={{ maxHeight: 400 }}
    />
    <div className="mobile-tabs-content">{activeContent}</div>
   </div>
  );
 }

 // On desktop, use regular Tabs
 return (
  <Tabs
   defaultActiveKey={defaultActiveKey}
   tabPosition="left"
   size="large"
   className="digital-tabs"
   activeKey={activeKey}
   onChange={handleChange}
   items={items}
  />
 );
};

export default MobileTabsComponent;
