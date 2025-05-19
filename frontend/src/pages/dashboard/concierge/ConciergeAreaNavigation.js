import React from 'react';
import { Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
 HomeOutlined,
 CalendarOutlined,
 ToolOutlined,
 DollarCircleOutlined,
 AppstoreOutlined,
} from '@ant-design/icons';

const ConciergeAreaNavigation = () => {
 const location = useLocation();
 const navigate = useNavigate();

 const menuItems = [
  {
   key: '/concierge/dashboard',
   icon: <HomeOutlined />,
   label: 'Dashboard',
   path: '/concierge/dashboard',
  },
  {
   key: '/concierge/properties',
   icon: <AppstoreOutlined />,
   label: 'Properties',
   path: '/concierge/properties',
  },
  {
   key: '/concierge/reservations',
   icon: <CalendarOutlined />,
   label: 'Reservations',
   path: '/concierge/reservations',
  },
  {
   key: '/concierge/tasks',
   icon: <ToolOutlined />,
   label: 'Tasks',
   path: '/concierge/tasks',
  },
  {
   key: '/concierge/revenue',
   icon: <DollarCircleOutlined />,
   label: 'Revenue',
   path: '/concierge/revenue',
  },
 ];

 const handleMenuClick = ({ key }) => {
  const item = menuItems.find((item) => item.key === key);
  if (item) {
   navigate(item.path);
  }
 };

 // Find the current path for highlighting
 const currentPath =
  menuItems.find((item) => location.pathname === item.path)?.key ||
  '/concierge/dashboard';

 return (
  <Menu
   mode="horizontal"
   selectedKeys={[currentPath]}
   onClick={handleMenuClick}
   style={{ borderBottom: 'none' }}
   items={menuItems.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
   }))}
  />
 );
};

export default ConciergeAreaNavigation;
