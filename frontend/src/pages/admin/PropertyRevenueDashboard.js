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
import Head from '../../components/common/header';
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

const { Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

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
  addMonthlyRevenue,
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
   filteredData = data.filter((item) => item.year === year);
  }
  // Sort by month from 1 to 12
  filteredData.sort((a, b) => a.month - b.month);

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

  // Calculate monthly average
  const average = total / data.length;
  setMonthlyAverage(average);

  // Calculate percentage change from last month
  if (data.length >= 2) {
   const lastMonth = Number(data[data.length - 1].amount || 0);
   const previousMonth = Number(data[data.length - 2].amount || 0);
   const change =
    previousMonth !== 0
     ? ((lastMonth - previousMonth) / previousMonth) * 100
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

 const columns = [
  {
   title: t('revenue.year'),
   dataIndex: 'year',
   key: 'year',
   render: (year) => String(year),
  },
  {
   title: t('revenue.month'),
   dataIndex: 'month',
   key: 'month',
   render: (month) => String(month),
  },
  {
   title: t('revenue.amount'),
   dataIndex: 'amount',
   key: 'amount',
   render: (amount) => `${Number(amount || 0).toLocaleString()} DHs`,
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
  const month = String(record.month).padStart(2, '0');
  form.setFieldsValue({
   ...record,
   date: record.month ? dayjs(`${record.year}/${month}`, 'YYYY/MM') : undefined,
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
   const month = values.date.month() + 1;
   const year = values.date.year();

   const revenueData = {
    propertyId: Number(propertyId, 10),
    amount: parseInt(values.amount),
    month,
    year,
    notes: values.notes,
    createdBy: Number(userId),
   };

   const result = values.id
    ? await updateRevenue(values.id, revenueData)
    : await addMonthlyRevenue(revenueData);

   if (result) {
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

 const chartData = (filteredRevenueData || [])
  .sort((a, b) => a.month - b.month)
  .map((item) => ({
   month: new Date(item.year, (item.month || 1) - 1).toLocaleString('default', {
    month: 'short',
   }),
   revenue: Number(item.amount || 0),
  }));

 // Modify the initial availableYears logic
 const availableYears = useMemo(() => {
  const years = [...new Set(revenueData.map((item) => item.year))].sort();

  // If current year is not in the list, add it
  if (!years.includes(currentYear)) {
   years.push(currentYear);
  }

  return years;
 }, [revenueData]);

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
         <XAxis dataKey="month" />
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
      <Card
       title={t('revenue.entries')}
       extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
         {t('revenue.addRevenue')}
        </Button>
       }
      >
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
       name="date"
       label={t('revenue.month')}
       rules={[
        { required: true, message: t('revenue.validation.selectMonth') },
       ]}
      >
       <DatePicker picker="month" />
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
  </Layout>
 );
};

export default PropertyRevenueDashboard;
