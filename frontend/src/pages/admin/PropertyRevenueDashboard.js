import React, { useState, useEffect, useMemo } from 'react';
import {
 Alert,
 Layout,
 Card,
 Table,
 Button,
 Select,
 Modal,
 Form,
 Input,
 DatePicker,
 message,
 Statistic,
 Row,
 Col,
 Typography,
 Popconfirm,
 Space,
} from 'antd';
import {
 ArrowLeftOutlined,
 PlusOutlined,
 ArrowUpOutlined,
 ArrowDownOutlined,
} from '@ant-design/icons';
import Foot from '../../components/common/footer';
import {
 LineChart,
 Line,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 Legend,
 ResponsiveContainer,
} from 'recharts';
import { useLocation, useNavigate } from 'react-router-dom';
import useRevenue from '../../hooks/useRevenue';
import useNotification from '../../hooks/useNotification';
import { useTranslation } from '../../context/TranslationContext';
import dayjs from 'dayjs';
import Head from '../../components/common/header';

const { Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const PropertyRevenueDashboard = () => {
 const { t } = useTranslation();
 const location = useLocation();
 const searchParams = new URLSearchParams(location.search);
 const navigate = useNavigate();
 const propertyId = searchParams.get('id');
 const propertyName = searchParams.get('name');
 const currentYear = new Date().getFullYear();
 const [isModalVisible, setIsModalVisible] = useState(false);
 const [revenueData, setRevenueData] = useState([]);
 const [filteredRevenueData, setFilteredRevenueData] = useState([]);
 const [yearlyTotal, setYearlyTotal] = useState(0);
 const [monthlyAverage, setMonthlyAverage] = useState(0);
 const [percentageChange, setPercentageChange] = useState(0);
 const [yearFilter, setYearFilter] = useState(currentYear);

 const [userId, setUserId] = useState(null);

 // Callback function to receive userData from Head
 const handleUserData = (userData) => {
  setUserId(userData);
 };

 const {
  loading,
  error: ERROR,
  getPropertyRevenue,
  addRevenue,
  updateRevenue,
  deleteRevenue,
 } = useRevenue();

 const { createRevenueUpdateNotification } = useNotification();

 const [form] = Form.useForm();

 const fetchRevenueData = async () => {
  const data = await getPropertyRevenue(propertyId);
  if (data) {
   // Ensure data is an array
   const revenueArray = Array.isArray(data) ? data : [];
   setRevenueData(revenueArray);
   applyFilters(revenueArray);
  }
 };

 const applyFilters = (data, year) => {
  let filteredData = data;

  if (year) {
   filteredData = data.filter(
    (item) => new Date(item.startDate).getFullYear() === year
   );
  }

  // Sort by startDate (newest first)
  filteredData.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  setFilteredRevenueData(filteredData);
  calculateStatistics(filteredData);
 };

 const calculateStatistics = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
   setYearlyTotal(0);
   setMonthlyAverage(0);
   setPercentageChange(0);
   return;
  }

  // Calculate yearly total
  const total = data.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  setYearlyTotal(total);

  // Calculate monthly average - group by month first
  const monthlyTotals = data.reduce((acc, item) => {
   const month = new Date(item.startDate).getMonth();
   if (!acc[month]) acc[month] = 0;
   acc[month] += Number(item.amount || 0);
   return acc;
  }, {});

  const monthCount = Object.keys(monthlyTotals).length || 1;
  const average = total / monthCount;
  setMonthlyAverage(average);

  // Calculate percentage change from last period
  if (data.length >= 2) {
   const lastAmount = Number(data[0].amount || 0);
   const previousAmount = Number(data[1].amount || 0);
   const change =
    previousAmount !== 0
     ? ((lastAmount - previousAmount) / previousAmount) * 100
     : 0;
   setPercentageChange(change);
  }
 };

 useEffect(() => {
  fetchRevenueData();
 }, [propertyId]);

 useEffect(() => {
  if (revenueData.length > 0) {
   applyFilters(revenueData, yearFilter);
  }
 }, [yearFilter, revenueData]);

 const formatDate = (dateString) => {
  const date = new Date(dateString);
  // Format as "DD MMM" (e.g., "15 Jan")
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
 };

 const columns = [
  {
   title: t('reservation.dates'),
   key: 'dates',
   render: (_, record) =>
    `${formatDate(record.startDate)} - ${formatDate(record.endDate)}`,
   sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
  },
  {
   title: t('revenue.amount'),
   dataIndex: 'amount',
   key: 'amount',
   render: (amount) =>
    `${Number(amount || 0).toLocaleString()} ${t('revenue.currency')}`,
   sorter: (a, b) => a.amount - b.amount,
  },
  {
   title: t('revenue.notes'),
   dataIndex: 'notes',
   key: 'notes',
  },
  {
   title: t('property.actions.actions'),
   key: 'actions',
   render: (_, record) => (
    <Space>
     <Button
      icon={<i className="fa-light fa-pen-to-square" key="edit" />}
      onClick={() => handleEdit(record)}
      type="link"
      shape="circle"
     />
     <Popconfirm
      title={t('messages.deleteConfirm')}
      onConfirm={() => handleDelete(record.id)}
     >
      <Button
       className="fa-light fa-trash"
       style={{ color: 'red' }}
       key="delete"
       type="link"
       shape="circle"
      />
     </Popconfirm>
    </Space>
   ),
  },
 ];

 const handleAdd = () => {
  form.resetFields();
  setIsModalVisible(true);
 };

 const handleEdit = (record) => {
  form.setFieldsValue({
   ...record,
   dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
  });
  setIsModalVisible(true);
 };

 const handleDelete = async (id) => {
  const result = await deleteRevenue(id);
  if (result) {
   message.success(t('revenue.deleteSuccess'));
   fetchRevenueData();
  }
 };

 const handleModalOk = async () => {
  try {
   const values = await form.validateFields();

   const revenueData = {
    propertyId: Number(propertyId, 10),
    amount: parseInt(values.amount),
    startDate: values.dateRange[0].format('YYYY-MM-DD'),
    endDate: values.dateRange[1].format('YYYY-MM-DD'),
    notes: values.notes,
    createdBy: Number(userId),
   };

   const result = values.id
    ? await updateRevenue(values.id, revenueData)
    : await addRevenue(revenueData);

   if (result) {
    const month = values.dateRange[0].month() + 1;
    const year = values.dateRange[0].year();

    const notification = await createRevenueUpdateNotification(
     Number(userId), // userId
     Number(propertyId, 10), // propertyId
     parseInt(values.amount), // amount
     month, // month
     year // year
    );

    message.success(
     `${t('revenue.title')} ${
      values.id ? t('messages.updateSuccess') : t('messages.createSuccess')
     }`
    );
    setIsModalVisible(false);
    form.resetFields();
    fetchRevenueData();
   }
  } catch (error) {
   console.error('Form validation failed:', error);
  }
 };

 // Prepare chart data with formatted date labels
 const chartData = useMemo(() => {
  return filteredRevenueData
   .map((item) => ({
    dateRange: `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`,
    revenue: Number(item.amount || 0),
   }))
   .sort((a, b) => {
    // Sort by start date (ascending) for the chart
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateA - dateB;
   })
   .slice(0, 12); // Limit to 12 periods for better readability
 }, [filteredRevenueData]);

 // Get available years from the data
 const availableYears = useMemo(() => {
  const years = [
   ...new Set(
    revenueData.map((item) => new Date(item.startDate).getFullYear())
   ),
  ].sort();

  // If current year is not in the list, add it
  if (!years.includes(currentYear)) {
   years.push(currentYear);
  }

  return years;
 }, [revenueData, currentYear]);

 return (
  <Layout className="contentStyle">
   <Head onUserData={handleUserData} />
   <Content className="container">
    <Button
     type="text"
     icon={<ArrowLeftOutlined />}
     onClick={() => navigate(-1)}
    >
     {t('button.back')}
    </Button>
    <Title level={2}>
     {t('revenue.management')} {propertyName}
    </Title>
    {/* Year Filter */}
    <Row gutter={16} style={{ marginBottom: 16 }}>
     <Col>
      <Select
       style={{ width: 200 }}
       placeholder={t('revenue.filterByYear')}
       value={yearFilter}
       onChange={(value) => setYearFilter(value)}
      >
       {availableYears.map((year) => (
        <Option key={year} value={year}>
         {year}
        </Option>
       ))}
      </Select>
     </Col>
    </Row>
    {/* Statistics Cards */}
    <Row gutter={16} style={{ marginBottom: 24 }}>
     <Col span={8}>
      <Card>
       <Statistic
        title={t('revenue.yearlyTotal')}
        value={yearlyTotal}
        suffix={t('revenue.currency')}
        precision={0}
       />
      </Card>
     </Col>
     <Col span={8}>
      <Card>
       <Statistic
        title={t('revenue.monthlyAverage')}
        value={monthlyAverage}
        suffix={t('revenue.currency')}
        precision={0}
       />
      </Card>
     </Col>
     <Col span={8}>
      <Card>
       <Statistic
        title={t('revenue.monthOverMonth')}
        value={percentageChange}
        precision={2}
        prefix={
         percentageChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />
        }
        suffix="%"
        valueStyle={{ color: percentageChange >= 0 ? '#3f8600' : '#cf1322' }}
       />
      </Card>
     </Col>
    </Row>
    <Row gutter={16}>
     <Col xs={24} md={12}>
      {/* Revenue Chart */}
      <Card style={{ marginBottom: 24 }}>
       <ResponsiveContainer width="100%" height={275}>
        <LineChart data={chartData}>
         <CartesianGrid strokeDasharray="3 3" />
         <XAxis dataKey="dateRange" />
         <YAxis />
         <Tooltip />
         <Legend />
         <Line
          type="monotone"
          dataKey="revenue"
          stroke="#6D5FFA"
          activeDot={{ r: 8 }}
         />
        </LineChart>
       </ResponsiveContainer>
      </Card>
     </Col>

     <Col xs={24} md={12}>
      {/* Revenue Table */}
      <Card title={t('revenue.entries')}>
       <Table
        columns={columns}
        dataSource={filteredRevenueData}
        rowKey="id"
        loading={loading}
       />
      </Card>
     </Col>
    </Row>
    {/* Add/Edit Modal */}
    <Modal
     title={
      form.getFieldValue('id')
       ? t('revenue.editRevenue')
       : t('revenue.addRevenue')
     }
     open={isModalVisible}
     onOk={handleModalOk}
     onCancel={() => {
      setIsModalVisible(false);
      form.resetFields();
     }}
     forceRender
    >
     <Form
      form={form}
      layout="vertical"
      preserve={false}
      initialValues={{ notes: '' }}
      name="revenueForm"
     >
      <Form.Item name="id" hidden>
       <Input />
      </Form.Item>

      <Form.Item
       name="dateRange"
       label={t('reservation.dates')}
       rules={[
        { required: true, message: t('reservation.validation.datesRequired') },
       ]}
      >
       <RangePicker format="DD MMM YYYY" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
       name="amount"
       label={t('revenue.amount')}
       rules={[
        { required: true, message: t('revenue.validation.enterAmount') },
       ]}
      >
       <Input suffix={t('revenue.currency')} type="number" step="1" />
      </Form.Item>

      <Form.Item name="notes" label={t('revenue.notes')}>
       <TextArea rows={4} />
      </Form.Item>

      {ERROR && <Alert message={ERROR} type="warning" showIcon closable />}
     </Form>
    </Modal>
   </Content>
   <Foot />
  </Layout>
 );
};

export default PropertyRevenueDashboard;
