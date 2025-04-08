import React, { useState, useEffect } from 'react';
import {
 Row,
 Col,
 Card,
 Divider,
 Typography,
 Table,
 Space,
 Button,
 Image,
 Tag,
 Empty,
 Input,
 Checkbox,
 Tooltip,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useConcierge } from '../hooks/useConcierge';
import { useUserData } from '../hooks/useUserData';
import fallback from '../assets/fallback.png';

const { Title, Text } = Typography;

const ManagedPropertiesSection = ({ userId, onNavigate, t }) => {
 const [searchText, setSearchText] = useState('');
 const [searchedColumn, setSearchedColumn] = useState('');
 const [managedProperties, setManagedProperties] = useState([]);
 const [propertyOwners, setPropertyOwners] = useState({});
 const { getConciergeProperties, loading: conciergeLoading } = useConcierge();
 const { getUserDataById, loading: userLoading } = useUserData();

 useEffect(() => {
  const fetchManagedProperties = async () => {
   try {
    const data = await getConciergeProperties(userId);
    const activeProperties = data.filter(
     (assignment) => assignment.status === 'active'
    );
    setManagedProperties(activeProperties);

    // Fetch owner information for each property
    const ownersData = {};
    const clientIds = [
     ...new Set(activeProperties.map((prop) => prop.clientId)),
    ];

    await Promise.all(
     clientIds.map(async (clientId) => {
      try {
       const userData = await getUserDataById(clientId);
       if (userData) {
        ownersData[clientId] = {
         firstname: userData.firstname || '',
         lastname: userData.lastname || '',
         email: userData.email || '',
        };
       }
      } catch (err) {
       console.error(
        `Error fetching user data for client ID ${clientId}:`,
        err
       );
      }
     })
    );

    setPropertyOwners(ownersData);
   } catch (error) {
    console.error('Error fetching managed properties:', error);
   }
  };

  if (userId) {
   fetchManagedProperties();
  }
 }, [userId]);

 // Handle search
 const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  setSearchText(selectedKeys[0]);
  setSearchedColumn(dataIndex);
 };
 // Reset search
 const handleReset = (clearFilters) => {
  clearFilters();
  setSearchText('');
 };
 // Helper function to get value from a nested path
 const getValueByPath = (obj, path) => {
  const keys = path.split('.');
  return keys.reduce(
   (o, key) => (o && o[key] !== undefined ? o[key] : undefined),
   obj
  );
 };

 // Function to handle search props for the columns
 const getColumnSearchProps = (dataIndex) => ({
  filterDropdown: ({
   setSelectedKeys,
   selectedKeys,
   confirm,
   clearFilters,
  }) => (
   <div style={{ padding: 8 }}>
    <Input
     placeholder={t('common.search')}
     value={selectedKeys[0]}
     onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
     onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
     style={{ marginBottom: 8, display: 'block' }}
    />
    <Space>
     <Button
      type="primary"
      onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
      icon={<SearchOutlined />}
      size="small"
      style={{ width: 90 }}
     />
     <Button
      onClick={() => clearFilters && handleReset(clearFilters)}
      size="small"
      style={{ width: 90 }}
     >
      {t('common.reset')}
     </Button>
    </Space>
   </div>
  ),
  filterIcon: (filtered) => (
   <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
  ),
  onFilter: (value, record) => {
   // Handle nested properties using our helper function
   const val = getValueByPath(record, dataIndex);

   return val
    ? val.toString().toLowerCase().includes(value.toLowerCase())
    : false;
  },
  render: (text, record) => {
   if (dataIndex === 'userId') {
    const propertyName = managedProperties[record.userId];
    return propertyName || t('common.loading');
   }
   return searchedColumn === dataIndex ? <strong>{text}</strong> : text;
  },
 });

 const columns = [
  {
   title: 'Photo',
   key: 'photo',
   render: (_, record) => (
    <Image
     src={record.property.photos?.[0] || fallback}
     alt={record.property.name}
     width={64}
     height={64}
    />
   ),
  },
  {
   title: t('property.title'),
   dataIndex: ['property', 'name'],
   key: 'name',
   sorter: (a, b) => {
    const aName = a.property?.name || '';
    const bName = b.property?.name || '';
    return aName.localeCompare(bName);
   },
   ...getColumnSearchProps('property.name'),
   render: (_, record) => <Text strong>{record.property?.name}</Text>,
  },
  {
   title: t('property.address'),
   dataIndex: ['property', 'placeName'],
   key: 'address',
   ...getColumnSearchProps('property.placeName'),
  },
  {
   title: 'Owner',
   key: 'owner',
   render: (_, record) => {
    const owner = propertyOwners[record.clientId] || {};
    const ownerName =
     owner.firstname && owner.lastname
      ? `${owner.firstname} ${owner.lastname}`
      : '-';

    return (
     <Tooltip title={owner.email || ''}>
      <Text>{ownerName}</Text>
     </Tooltip>
    );
   },
   sorter: (a, b) => {
    const ownerA = propertyOwners[a.clientId] || {};
    const ownerB = propertyOwners[b.clientId] || {};
    const nameA = `${ownerA.firstname || ''} ${ownerA.lastname || ''}`.trim();
    const nameB = `${ownerB.firstname || ''} ${ownerB.lastname || ''}`.trim();
    return nameA.localeCompare(nameB);
   },
   filterDropdown: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
   }) => {
    // Get unique owners
    const uniqueOwners = [
     ...new Set(
      Object.values(propertyOwners)
       .map((owner) =>
        `${owner.firstname || ''} ${owner.lastname || ''}`.trim()
       )
       .filter((name) => name)
     ),
    ].sort();

    return (
     <div style={{ padding: 8 }}>
      <div style={{ marginBottom: 8 }}>
       {uniqueOwners.map((ownerName) => (
        <div key={ownerName} style={{ marginBottom: 4 }}>
         <Checkbox
          checked={selectedKeys.includes(ownerName)}
          onChange={(e) => {
           const newSelectedKeys = e.target.checked
            ? [...selectedKeys, ownerName]
            : selectedKeys.filter((key) => key !== ownerName);
           setSelectedKeys(newSelectedKeys);
          }}
         >
          {ownerName}
         </Checkbox>
        </div>
       ))}
      </div>
      <Space>
       <Button
        onClick={() => {
         clearFilters();
         confirm();
        }}
        size="small"
       >
        {t('common.reset')}
       </Button>
       <Button type="primary" onClick={() => confirm()} size="small">
        OK
       </Button>
      </Space>
     </div>
    );
   },
   filterIcon: (filtered) => (
    <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
   ),
   onFilter: (value, record) => {
    const owner = propertyOwners[record.clientId] || {};
    const ownerName = `${owner.firstname || ''} ${owner.lastname || ''}`.trim();
    return ownerName === value;
   },
  },
  {
   title: t('property.basic.price'),
   dataIndex: ['property', 'price'],
   key: 'price',
   width: 120,
   sorter: (a, b) => a.price - b.price,
   render: (price) => `${price} ${t('property.basic.priceNight')}`,
  },
  {
   title: t('property.actions.actions'),
   key: 'actions',
   render: (_, record) => (
    <Space direction="vertical">
     <Space>
      <Button
       icon={<i className="Dashicon fa-light fa-eye" key="display" />}
       onClick={() =>
        onNavigate(`/propertydetails?hash=${record.property.hashId}`)
       }
       type="link"
       shape="circle"
      />
      <Button
       icon={<i className="Dashicon fa-light fa-house-lock" key="ellipsis" />}
       onClick={() =>
        onNavigate(`/digitalguidebook?hash=${record.property.hashId}`)
       }
       type="link"
       shape="circle"
      />
      <Button
       icon={
        <i
         className="Dashicon fa-light fa-list-check"
         style={{ color: '#2b2c32' }}
         key="task"
        />
       }
       onClick={() =>
        onNavigate(
         `/propertytaskdashboard?id=${record.property.id}&name=${record.property.name}`
        )
       }
       type="link"
       shape="circle"
      />
      <Button
       icon={
        <i
         className="Dashicon fa-light fa-dollar-sign"
         style={{ color: '#389e0d' }}
         key="revenue"
        />
       }
       onClick={() =>
        onNavigate(
         `/propertyrevenuedashboard?id=${record.property.id}&name=${record.property.name}`
        )
       }
       type="link"
       shape="circle"
      />
     </Space>
     <Button
      type="text"
      icon={<i className="PrimaryColor fa-regular fa-file-contract" />}
      onClick={() =>
       onNavigate(`/contractslist?hash=${record.property.hashId}`)
      }
     >
      {t('property.actions.contracts')}
     </Button>
     <Button
      type="text"
      icon={<i className="PrimaryColor fa-regular fa-file-pen" />}
      onClick={() => onNavigate(`/guestform?hash=${record.property.hashId}`)}
     >
      {t('property.actions.guestForm')}
     </Button>
    </Space>
   ),
  },
  {
   title: t('dashboard.lastUpdate'),
   key: 'updatedAt',
   render: (_, record) =>
    new Date(record.property.updatedAt).toLocaleDateString(),
  },
 ];

 if (!managedProperties.length) return null;

 return (
  <div className="dash-properties">
   <Row gutter={[12, 24]}>
    <Col xs={24}>
     <Title level={3}>
      {t('managers.propertiesTitle')}
      {'  '}
      <i className="PrimaryColor fa-regular fa-house" />
     </Title>
     <Divider />
    </Col>
   </Row>
   <Row gutter={[24, 4]}>
    <Col xs={24}>
     <Card>
      {managedProperties.length > 0 ? (
       <Table
        columns={columns}
        dataSource={managedProperties}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        loading={userLoading}
       />
      ) : (
       <Empty
        description={t('property.noProperties')}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
       />
      )}
     </Card>
    </Col>
   </Row>
  </div>
 );
};

export default ManagedPropertiesSection;
