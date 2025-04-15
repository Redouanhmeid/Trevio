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
 const [form] = Form.useForm();

 // Memoize transfer style configuration
 const transferStyle = useMemo(
  () => ({
   listStyle: {
    width: screens.xs ? '100%' : 400,
    height: 400,
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
   return;
  }

  const selectedConciergeData = concierges.find(
   (c) => c.id === selectedConcierge
  );
  if (selectedConciergeData?.properties) {
   const assignedPropertyIds = selectedConciergeData.properties
    .filter((p) => p.status !== 'inactive')
    .map((p) => p.id);
   setSelectedProperties(assignedPropertyIds);
  }
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
   const conciergeData = concierges.find((c) => c.id === selectedConcierge);
   const currentAssignedIds = conciergeData?.properties?.map((p) => p.id) || [];

   const propsToAdd = selectedProperties.filter(
    (id) => !currentAssignedIds.includes(id)
   );
   const propsToRemove = currentAssignedIds.filter(
    (id) => !selectedProperties.includes(id)
   );

   // Process assignments
   for (const propertyId of propsToAdd) {
    await assignConcierge(clientId, selectedConcierge, propertyId);
   }

   // Process removals
   for (const propertyId of propsToRemove) {
    await removeConcierge(clientId, selectedConcierge, propertyId);
   }

   message.success(t('managers.assignSuccess'));
   navigate('/dashboard');
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
    <Title level={2}>{t('managers.assignProperties')}</Title>

    <Spin spinning={isLoading}>
     {!isLoading && allProperties.length > 0 && (
      <div style={{ marginBottom: 16 }}>
       <Text>
        {availableProperties.length === 0
         ? t('managers.noAvailableProperties')
         : `${availableProperties.length} available properties out of ${allProperties.length} total properties`}
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
        style={{ width: '100%', marginBottom: 24 }}
       >
        {concierges.map((concierge) => (
         <Option key={concierge.id} value={concierge.id}>
          {`${concierge.firstname} ${concierge.lastname} (${concierge.email})`}
         </Option>
        ))}
       </Select>
      </Form.Item>

      {/* Property Transfer */}
      <Form.Item
       label={t('managers.selectProperties')}
       required
       name="properties"
      >
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
      </Form.Item>

      {/* Action Buttons */}
      <Form.Item>
       <Flex justify="flex-end" gap={16}>
        <Button onClick={() => navigate('/concierges')}>
         {t('common.cancel')}
        </Button>
        <Button type="primary" htmlType="submit">
         {t('managers.assignButton')}
        </Button>
       </Flex>
      </Form.Item>
     </Form>
    </Spin>
   </Content>
   <Foot />
  </Layout>
 );
};

export default AssignConciergeForm;
