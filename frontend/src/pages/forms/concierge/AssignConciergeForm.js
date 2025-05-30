import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
 Grid,
 Form,
 Button,
 message,
 Layout,
 Typography,
 Spin,
 Select,
 Transfer,
 Alert,
 Flex,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../../context/TranslationContext';
import { useConcierge } from '../../../hooks/useConcierge';
import useProperty from '../../../hooks/useProperty';
import DashboardHeader from '../../../components/common/DashboardHeader';
import Foot from '../../../components/common/footer';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const AssignConciergeForm = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const screens = useBreakpoint();
 const location = useLocation();
 const clientId = location.state?.clientId;
 const {
  getClientConcierges,
  getConciergeProperties,
  assignConcierge,
  removeConcierge,
  isLoading: conciergeLoading,
 } = useConcierge();
 const {
  properties,
  fetchPropertiesbyClient,
  fetchAvailablePropertiesForAssignment,
  loading: propertyLoading,
 } = useProperty();
 const [concierges, setConcierges] = useState([]);
 const [selectedConcierge, setSelectedConcierge] = useState(null);
 const [selectedProperties, setSelectedProperties] = useState([]);
 const [availableProperties, setAvailableProperties] = useState([]);
 const [allProperties, setAllProperties] = useState([]);
 const [transferLoading, setTransferLoading] = useState(false);
 const [form] = Form.useForm();

 // This will be added to the document head only on mobile
 useEffect(() => {
  if (screens.xs) {
   // Create a style element
   const styleElement = document.createElement('style');
   styleElement.id = 'custom-transfer-mobile-styles';
   styleElement.innerHTML = `
     .ant-transfer-operation {
       display: flex !important;
       flex-direction: row-reverse !important;
       justify-content: center !important;
       width: 100% !important;
       margin: 8px 0 !important;
       gap: 16px !important;
     }
     .ant-transfer-operation .ant-btn {
       width: 100px !important;
     }
   `;

   // Append to the head if it doesn't exist already
   if (!document.getElementById('custom-transfer-mobile-styles')) {
    document.head.appendChild(styleElement);
   }

   // Cleanup when component unmounts
   return () => {
    const styleToRemove = document.getElementById(
     'custom-transfer-mobile-styles'
    );
    if (styleToRemove) {
     document.head.removeChild(styleToRemove);
    }
   };
  }
 }, [screens.xs]);

 // Memoize transfer style configuration
 const transferStyle = useMemo(
  () => ({
   listStyle: {
    width: screens.xs ? '100%' : 400,
    height: screens.xs ? 240 : 400,
    marginBottom: screens.xs ? '16px' : 0,
   },
   style: {
    display: 'flex',
    flexDirection: screens.xs ? 'column' : 'row',
   },
  }),
  [screens.xs]
 );

 // Fetch initial data
 useEffect(() => {
  const fetchData = async () => {
   try {
    // Fetch all properties for the client (for reference)
    const allPropertiesData = await fetchPropertiesbyClient(clientId);
    setAllProperties(allPropertiesData || []);

    // Fetch concierges for this client
    const fetchedConcierges = await getClientConcierges(clientId);
    setConcierges(fetchedConcierges || []);

    // Fetch properties that are available for assignment (not already assigned)
    const availablePropertiesData = await fetchAvailablePropertiesForAssignment(
     clientId
    );
    setAvailableProperties(availablePropertiesData || []);
   } catch (err) {
    message.error(t('managers.message.fetchError'));
   }
  };

  if (clientId) {
   fetchData();
  }
 }, [clientId]);

 // Update selected properties when concierge changes
 useEffect(() => {
  if (!selectedConcierge) {
   setSelectedProperties([]);
   setTransferLoading(false);
   return;
  }
  setTransferLoading(true);

  const selectedConciergeData = concierges.find(
   (c) => c.id === selectedConcierge
  );
  if (selectedConciergeData?.properties) {
   const assignedPropertyIds = selectedConciergeData.properties
    .filter((p) => p.status !== 'inactive')
    .map((p) => p.id);
   setSelectedProperties(assignedPropertyIds);
  }
  setTimeout(() => {
   setTransferLoading(false);
  }, 500);
 }, [selectedConcierge, concierges]);

 // Memoize transfer data source
 // Memoize transfer data source based on concierge selection
 const transferDataSource = useMemo(() => {
  if (selectedConcierge) {
   // Get properties assigned to this concierge
   const conciergeData = concierges.find((c) => c.id === selectedConcierge);
   const assignedToThisConcierge = conciergeData?.properties || [];
   const assignedIds = assignedToThisConcierge
    .filter((p) => p.status === 'active')
    .map((p) => p.id);

   // Combine properties assigned to this concierge with available properties
   return [
    // Properties assigned to this concierge
    ...assignedToThisConcierge.map((property) => ({
     key: property.id.toString(),
     title: property.name,
     description: property.type,
     disabled: false,
    })),
    // Available properties (not assigned to anyone)
    ...availableProperties.map((property) => ({
     key: property.id.toString(),
     title: property.name,
     description: property.type,
     disabled: false,
    })),
   ];
  } else {
   // If no concierge selected, just show available properties
   return availableProperties.map((property) => ({
    key: property.id.toString(),
    title: property.name,
    description: property.type,
    disabled: false,
   }));
  }
 }, [availableProperties, concierges, selectedConcierge]);

 // Handle assignment submission
 const handleAssign = useCallback(async () => {
  if (!selectedConcierge) {
   message.error(t('managers.selectManagerFirst'));
   return;
  }

  try {
   // Show loading state during assignment
   setTransferLoading(true);

   const conciergeData = concierges.find((c) => c.id === selectedConcierge);
   const currentAssignedIds = conciergeData?.properties?.map((p) => p.id) || [];

   const propsToAdd = selectedProperties.filter(
    (id) => !currentAssignedIds.includes(id)
   );
   const propsToRemove = currentAssignedIds.filter(
    (id) => !selectedProperties.includes(id)
   );

   // Use Promise.all to process assignments in parallel for better performance
   if (propsToAdd.length > 0) {
    const addPromises = propsToAdd.map((propertyId) =>
     assignConcierge(clientId, selectedConcierge, propertyId).catch((err) => {
      console.error(`Failed to assign property ${propertyId}:`, err);
      return { error: true, propertyId };
     })
    );

    const addResults = await Promise.all(addPromises);
    const addErrors = addResults.filter((result) => result?.error);

    if (addErrors.length > 0) {
     console.warn(
      `Failed to assign ${addErrors.length} properties:`,
      addErrors
     );
    }
   }

   // Handle removals similarly
   if (propsToRemove.length > 0) {
    const removePromises = propsToRemove.map((propertyId) =>
     removeConcierge(clientId, selectedConcierge, propertyId).catch((err) => {
      console.error(`Failed to remove property ${propertyId}:`, err);
      return { error: true, propertyId };
     })
    );

    const removeResults = await Promise.all(removePromises);
    const removeErrors = removeResults.filter((result) => result?.error);

    if (removeErrors.length > 0) {
     console.warn(
      `Failed to remove ${removeErrors.length} properties:`,
      removeErrors
     );
    }
   }

   message.success(t('managers.assignSuccess'));
   navigate('/concierges');
  } catch (err) {
   message.error(t('managers.assignError'));
  }
 }, [
  selectedConcierge,
  selectedProperties,
  concierges,
  clientId,
  assignConcierge,
  removeConcierge,
  navigate,
  t,
 ]);

 const isLoading = conciergeLoading || propertyLoading;

 return (
  <Layout className="contentStyle">
   <DashboardHeader />
   <Content className="container">
    <Title level={3}>{t('managers.assignProperties')}</Title>

    {!isLoading && allProperties.length > 0 && (
     <div style={{ marginBottom: 16 }}>
      <Text>
       {availableProperties.length === 0
        ? t('managers.noAvailableProperties')
        : `${availableProperties.length} ${t('managers.availableProperties')} ${
           allProperties.length
          } ${t('managers.properties.totalProperties')}`}
      </Text>
     </div>
    )}
    <Form
     form={form}
     layout="vertical"
     className="hide-required-mark"
     onFinish={handleAssign}
    >
     {/* Concierge Selection */}
     <Form.Item
      label={t('managers.selectManager')}
      required
      name="concierge"
      rules={[{ required: true, message: t('managers.selectManagerFirst') }]}
     >
      <Select
       placeholder={t('managers.selectManagerPlaceholder')}
       onChange={setSelectedConcierge}
       value={selectedConcierge}
       style={{ width: '100%', marginBottom: 12 }}
      >
       {concierges.map((concierge) => (
        <Option key={concierge.id} value={concierge.id}>
         {`${concierge.firstname} ${concierge.lastname} (${concierge.email})`}
        </Option>
       ))}
      </Select>
     </Form.Item>

     {/* Property Transfer */}
     {selectedConcierge && (
      <Form.Item
       label={t('managers.selectProperties')}
       required
       name="properties"
      >
       <Spin spinning={transferLoading}>
        <Transfer
         dataSource={transferDataSource}
         titles={[
          t('managers.properties.available'),
          t('managers.properties.assigned'),
         ]}
         targetKeys={selectedProperties.map((id) => id.toString())}
         onChange={(keys) => {
          const numericKeys = keys.map((key) => parseInt(key, 10));
          setSelectedProperties(numericKeys);
         }}
         render={(item) => (
          <div>
           <Text>
            {item.title}
            {item.disabled && (
             <Text secondary>({t('managers.propertyAlreadyAssigned')})</Text>
            )}
           </Text>
          </div>
         )}
         oneWay={false} // Make it one-way on mobile for simplicity
         pagination={{
          // Add pagination for better mobile experience
          simple: screens.xs,
          pageSize: screens.xs ? 5 : 10,
         }}
         {...transferStyle}
        />
       </Spin>
      </Form.Item>
     )}

     {/* Action Buttons */}
     <Form.Item>
      <Flex justify="flex-end" gap={16}>
       <Button onClick={() => navigate('/concierges')}>
        {t('common.cancel')}
       </Button>
       <Button type="primary" htmlType="submit" disabled={!selectedConcierge}>
        {t('button.save')}
       </Button>
      </Flex>
     </Form.Item>
    </Form>
   </Content>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default AssignConciergeForm;
