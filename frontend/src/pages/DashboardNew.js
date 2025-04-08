import React, { useState } from 'react';
import { Layout } from 'antd';
import { useAuthContext } from '../hooks/useAuthContext';
import { useUserData } from '../hooks/useUserData';
import DashboardHeader from '../components/common/DashboardHeader';

const DashboardNew = () => {
 const { user } = useAuthContext();
 const { isLoading, userData, getUserData } = useUserData();
 const [userId, setUserId] = useState(null);

 const handleUserData = (userData) => {
  setUserId(userData);
 };
 return (
  <Layout className="contentStyle">
   <DashboardHeader onUserData={handleUserData} />
  </Layout>
 );
};

export default DashboardNew;
