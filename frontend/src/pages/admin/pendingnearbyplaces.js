import React, { useEffect, useState } from 'react';
import {
 Layout,
 Row,
 Col,
 Typography,
 Table,
 Input,
 Button,
 Space,
 Tag,
 Popconfirm,
 Image,
 Grid,
 message,
} from 'antd';
import { SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Head from '../../components/common/header';
import Foot from '../../components/common/footer';
import { useNavigate } from 'react-router-dom';
import useNearbyPlace from '../../hooks/useNearbyPlace';
import { useTranslation } from '../../context/TranslationContext';

const { Content } = Layout;
const { Title } = Typography;

const PendingNearbyPlaces = () => {
 const {
  loading,
  error,
  getAllNearbyPlaces,
  deleteNearbyPlace,
  verifyNearbyPlace,
  bulkVerifyNearbyPlaces,
 } = useNearbyPlace();
 const navigate = useNavigate();
 const { t } = useTranslation();
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();

 const [searchText, setSearchText] = useState('');
 const [searchedColumn, setSearchedColumn] = useState('');
 const [dataSource, setDataSource] = useState([]);
 const [pagination, setPagination] = useState({
  current: 1, // Current page
  pageSize: 15, // Items per page
  total: 0, // Total number of items (from server response)
 });

 const [selectionType, setSelectionType] = useState('checkbox');
 const [selectedRowKeys, setSelectedRowKeys] = useState([]);

 const fetchData = async (page, pageSize) => {
  try {
   const data = await getAllNearbyPlaces(); // Properly calling the function
   const pending = data.filter(
    (NearbyPlace) => NearbyPlace.isVerified === false
   );
   setDataSource(pending);
   setPagination({
    ...pagination,
    total: data.totalCount, // Total count from server
   });
  } catch (err) {
   message.error(t('map.messageError'));
  }
 };

 useEffect(() => {
  fetchData(pagination.current, pagination.pageSize);
 }, [pagination.current, pagination.pageSize]);

 const handleVerifyNearbyPlace = async (ID) => {
  const result = await verifyNearbyPlace(ID);
  if (result) {
   message.success(t('nearbyPlace.verifySuccess'));
   await fetchData();
  }
 };

 // Handle bulk verification
 const handleBulkVerify = async () => {
  if (selectedRowKeys.length === 0) {
   message.warning(t('nearbyPlace.noPlacesSelected'));
   return;
  }

  const results = await bulkVerifyNearbyPlaces(selectedRowKeys);
  if (results) {
   message.success(
    t('nearbyPlace.bulkVerifySuccess', { count: selectedRowKeys.length })
   );
   setSelectedRowKeys([]); // Clear selection after verification
   await fetchData();
  }
 };

 const handleTableChange = (pagination) => {
  setPagination(pagination); // This triggers useEffect to load the new page
 };
 // Row selection configuration
 const rowSelection = {
  selectedRowKeys,
  onChange: (newSelectedRowKeys) => {
   setSelectedRowKeys(newSelectedRowKeys);
  },
 };
 const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  setSearchText(selectedKeys[0]);
  setSearchedColumn(dataIndex);
 };

 const handleReset = (clearFilters) => {
  clearFilters();
  setSearchText('');
 };

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
  onFilter: (value, record) =>
   record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
  render: (text) =>
   searchedColumn === dataIndex ? <strong>{text}</strong> : text,
 });

 const columns = [
  {
   title: t('common.photo'),
   dataIndex: 'photo',
   key: 'photo',
   render: (photo) => (
    <Image src={photo} shape="square" width={64} height={64} />
   ),
  },
  {
   title: t('nearbyPlace.name'),
   dataIndex: 'name',
   key: 'name',
   sorter: (a, b) => a.name.localeCompare(b.name),
   ...getColumnSearchProps('name'),
  },
  {
   title: t('nearbyPlace.address'),
   dataIndex: 'address',
   key: 'address',
   sorter: (a, b) => a.address.localeCompare(b.address),
   ...getColumnSearchProps('address'),
  },
  {
   title: t('nearbyPlace.rating'),
   dataIndex: 'rating',
   key: 'rating',
   sorter: (a, b) => a.rating - b.rating,
   render: (rating) => <span>{rating} / 5</span>,
  },
  {
   title: t('user.createdAt'),
   dataIndex: 'createdAt',
   key: 'createdAt',
   sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
   render: (createdAt) => new Date(createdAt).toLocaleString(),
  },
  {
   title: t('property.actions.actions'),
   key: 'actions',
   render: (_, record) => (
    <Space>
     <Button
      icon={<i className="Dashicon fa-light fa-pen-to-square" key="edit" />}
      onClick={() => navigate(`/nearbyplace?id=${record.id}`)}
      type="link"
      shape="circle"
     />
     <Popconfirm
      title={t('messages.deleteConfirm')}
      onConfirm={() => confirmDelete(record.id)}
     >
      <Button
       className="Dashicon fa-light fa-trash"
       style={{ color: 'red' }}
       key="delete"
       type="link"
       shape="circle"
      />
     </Popconfirm>

     <Button type="primary" onClick={() => handleVerifyNearbyPlace(record.id)}>
      {t('nearbyPlace.verify')}
     </Button>
    </Space>
   ),
  },
 ];

 const confirmDelete = async (id) => {
  await deleteNearbyPlace(id);
  if (!error) {
   fetchData();
   message.success(t('messages.deleteSuccess'));
  } else {
   message.error(t('messages.deleteError', { error: error.message }));
  }
 };

 return (
  <Layout className="contentStyle">
   <Head />
   <Content className="container">
    <Button
     type="link"
     shape="round"
     icon={<ArrowLeftOutlined />}
     onClick={() => navigate(-1)}
    >
     {t('button.back')}
    </Button>
    <Title level={2}>{t('nearbyPlace.pending')}</Title>
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
     <Col>
      <Button
       type="primary"
       disabled={selectedRowKeys.length === 0}
       onClick={handleBulkVerify}
      >
       {t('nearbyPlace.verifySelected')}
      </Button>
     </Col>
    </Row>
    <Row gutter={[16, 16]}>
     <Col xs={24} md={24}>
      <Table
       columns={columns}
       dataSource={dataSource}
       loading={loading}
       rowKey="id"
       pagination={pagination}
       onChange={handleTableChange}
       rowSelection={{
        type: selectionType,
        ...rowSelection,
       }}
      />
     </Col>
    </Row>
   </Content>
   {!screens.xs & <Foot />}
  </Layout>
 );
};

export default PendingNearbyPlaces;
