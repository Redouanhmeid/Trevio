import React, { useEffect, useState } from 'react';
import {
 Layout,
 Row,
 Col,
 Typography,
 Table,
 Button,
 Image,
 Input,
 Space,
 Spin,
 Checkbox,
 Grid,
 message,
} from 'antd';
import { SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Head from '../../components/common/header';
import Foot from '../../components/common/footer';
import { useNavigate } from 'react-router-dom';
import useProperty from '../../hooks/useProperty';
import useNotification from '../../hooks/useNotification';
import { useTranslation } from '../../context/TranslationContext';

const { Content } = Layout;
const { Title } = Typography;

const PendingProperties = () => {
 const navigate = useNavigate();
 const { t } = useTranslation();
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();
 const {
  pendingProperties,
  loading: pendingLoading,
  error,
  verifyProperty,
  bulkVerifyProperties,
  fetchPendingProperties,
 } = useProperty();

 const { createPropertyVerificationNotification } = useNotification();

 const [usersMap, setUsersMap] = useState({});
 const [searchText, setSearchText] = useState('');
 const [searchedColumn, setSearchedColumn] = useState('');
 const [selectionType, setSelectionType] = useState('checkbox');
 const [selectedRowKeys, setSelectedRowKeys] = useState([]);

 // Handle single property verification
 const handleVerifyProperty = async (userId, propertyId, propertyName) => {
  const result = await verifyProperty(userId, propertyId, propertyName);
  if (result) {
   message.success(t('property.verifySuccess'));
  }
 };
 // Handle bulk verification
 const handleBulkVerify = async () => {
  if (selectedRowKeys.length === 0) {
   message.warning(t('property.noPropertiesSelected'));
   return;
  }

  const results = await bulkVerifyProperties(selectedRowKeys);
  if (results) {
   message.success(
    `${selectedRowKeys.length} ${t('property.bulkVerifySuccess')}`
   );
   setSelectedRowKeys([]); // Clear selection after verification
   fetchPendingProperties();
  }
 };
 // Row selection configuration
 const rowSelection = {
  selectedRowKeys,
  onChange: (newSelectedRowKeys) => {
   setSelectedRowKeys(newSelectedRowKeys);
  },
 };
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
     >
      {t('common.search')}
     </Button>
     <Button
      onClick={() => handleReset(clearFilters)}
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
   if (dataIndex === 'userId') {
    const userName = usersMap[record.userId];
    return userName
     ? userName.toLowerCase().includes(value.toLowerCase())
     : false;
   }
   return record[dataIndex]
    ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
    : false;
  },
  render: (text, record) => {
   if (dataIndex === 'userId') {
    const userName = usersMap[record.userId];
    return userName || t('common.loading');
   }
   return searchedColumn === dataIndex ? <strong>{text}</strong> : text;
  },
 });

 // Filters for "type", "rooms", and "beds" columns
 const getUniqueValues = (key) =>
  [...new Set(pendingProperties.map((item) => item[key]))].sort(
   (a, b) => a - b
  );

 const columns = [
  {
   title: t('common.photo'),
   dataIndex: 'photos',
   key: 'photos',
   render: (photos) =>
    photos && photos.length > 0 ? (
     <Image src={photos[0]} shape="square" size="large" width={64} />
    ) : null,
  },
  {
   title: t('property.basic.name'),
   dataIndex: 'name',
   key: 'name',
   sorter: (a, b) => a.name.localeCompare(b.name),
   ...getColumnSearchProps('name'),
  },
  {
   title: t('property.view'),
   key: 'voir',
   render: (_, record) => (
    <Button
     icon={<i className="Dashicon fa-light fa-eye" key="display" />}
     onClick={() => navigate(`/propertydetails?hash=${record.hashId}`)}
     type="link"
     shape="circle"
    />
   ),
  },
  {
   title: t('property.basic.type'),
   dataIndex: 'type',
   key: 'type',
   filters: [
    { text: t('type.apartment'), value: 'apartment' },
    { text: t('type.house'), value: 'house' },
    { text: t('type.guesthouse'), value: 'guesthouse' },
   ],
   filterDropdown: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
   }) => (
    <div style={{ padding: 8 }}>
     <div style={{ marginBottom: 8 }}>
      {[
       { text: t('type.apartment'), value: 'apartment' },
       { text: t('type.house'), value: 'house' },
       { text: t('type.guesthouse'), value: 'guesthouse' },
      ].map((option) => (
       <div key={option.value} style={{ marginBottom: 4 }}>
        <Checkbox
         checked={selectedKeys.includes(option.value)}
         onChange={(e) => {
          const newSelectedKeys = e.target.checked
           ? [...selectedKeys, option.value]
           : selectedKeys.filter((key) => key !== option.value);
          setSelectedKeys(newSelectedKeys);
         }}
        >
         {option.text}
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
   ),
   onFilter: (value, record) => record.type === value,
   render: (type) => t(`type.${type}`),
  },
  {
   title: t('property.basic.price'),
   dataIndex: 'price',
   key: 'price',
   sorter: (a, b) => a.price - b.price,
   render: (price) => `${price} ${t('property.basic.priceNight')}`,
  },
  {
   title: t('property.basic.rooms'),
   dataIndex: 'rooms',
   key: 'rooms',
   filterDropdown: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
   }) => (
    <div style={{ padding: 8 }}>
     <div style={{ marginBottom: 8 }}>
      {getUniqueValues('rooms').map((value) => (
       <div key={value} style={{ marginBottom: 4 }}>
        <Checkbox
         checked={selectedKeys.includes(value)}
         onChange={(e) => {
          const newSelectedKeys = e.target.checked
           ? [...selectedKeys, value]
           : selectedKeys.filter((key) => key !== value);
          setSelectedKeys(newSelectedKeys);
         }}
        >
         {value}
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
   ),
   onFilter: (value, record) => record.rooms === value,
   sorter: (a, b) => a.rooms - b.rooms,
  },
  {
   title: t('property.basic.beds'),
   dataIndex: 'beds',
   key: 'beds',
   filterDropdown: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
   }) => (
    <div style={{ padding: 8 }}>
     <div style={{ marginBottom: 8 }}>
      {getUniqueValues('beds').map((value) => (
       <div key={value} style={{ marginBottom: 4 }}>
        <Checkbox
         checked={selectedKeys.includes(value)}
         onChange={(e) => {
          const newSelectedKeys = e.target.checked
           ? [...selectedKeys, value]
           : selectedKeys.filter((key) => key !== value);
          setSelectedKeys(newSelectedKeys);
         }}
        >
         {value}
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
   ),
   onFilter: (value, record) => record.beds === value,
   sorter: (a, b) => a.beds - b.beds,
  },
  {
   title: t('property.basic.location'),
   dataIndex: 'placeName',
   key: 'placeName',
   sorter: (a, b) => a.placeName.localeCompare(b.placeName),
   ...getColumnSearchProps('placeName'),
  },
  {
   title: t('user.createdAt'),
   dataIndex: 'createdAt',
   key: 'createdAt',
   sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
   render: (createdAt) => new Date(createdAt).toLocaleString(),
  },
  ,
  {
   title: t('property.actions.actions'),
   key: 'action',
   render: (_, record) => (
    <Button
     type="primary"
     onClick={() => handleVerifyProperty(record.userId, record.id, record.name)}
    >
     {t('property.verify')}
    </Button>
   ),
  },
 ];

 if (error)
  return (
   <p>
    {t('error.submit')}: {error}
   </p>
  );
 if (pendingLoading) {
  return (
   <div className="loading">
    <Spin size="large" />
   </div>
  );
 }

 return (
  <Layout className="contentStyle">
   <Head />
   <Content className="container">
    <Button
     type="link"
     icon={<ArrowLeftOutlined />}
     onClick={() => navigate(-1)}
    >
     {t('button.back')}
    </Button>
    <Title level={2}>{t('property.pending')}</Title>
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
     <Col>
      <Button
       type="primary"
       disabled={selectedRowKeys.length === 0}
       onClick={handleBulkVerify}
      >
       {t('property.verifySelected')}
      </Button>
     </Col>
    </Row>
    <Row gutter={[16, 16]}>
     <Col xs={24} md={24}>
      <Table
       columns={columns}
       dataSource={pendingProperties}
       loading={pendingLoading}
       rowKey="id"
       rowSelection={{
        type: selectionType,
        ...rowSelection,
       }}
      />
     </Col>
    </Row>
   </Content>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default PendingProperties;
