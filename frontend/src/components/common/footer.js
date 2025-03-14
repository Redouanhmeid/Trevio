import React, { useState, useEffect } from 'react';
import { Layout, Divider, Flex, Typography } from 'antd';

const { Text } = Typography;
const { Footer } = Layout;

const Foot = () => {
 return (
  <Footer className="footerStyle">
   <Divider style={{ borderColor: '#fff', margin: '12px 0 16px 0' }} />

   <Flex justify="center">
    {/* <Text
     style={{
      color: '#fff',
     }}
    >
     Créer et développé par Astral Digital agency
    </Text> */}
    <Text
     style={{
      color: '#fff',
     }}
    >
     Trevio ©{new Date().getFullYear()}
    </Text>
   </Flex>
  </Footer>
 );
};

export default Foot;
