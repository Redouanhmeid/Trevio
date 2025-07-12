import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
 Layout,
 Card,
 Table,
 Button,
 Select,
 Modal,
 Statistic,
 Row,
 Col,
 Typography,
 Space,
 Empty,
 Tabs,
 Badge,
 Flex,
 Spin,
 Grid,
} from 'antd';
import {
 ArrowUpOutlined,
 ArrowDownOutlined,
 LineChartOutlined,
 BarChartOutlined,
 PieChartOutlined,
} from '@ant-design/icons';
import Head from '../../components/common/header';
import Foot from '../../components/common/footer';
import {
 LineChart,
 Line,
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 Legend,
 ResponsiveContainer,
 PieChart,
 Pie,
 Cell,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import useRevenue from '../../hooks/useRevenue';
import useProperty from '../../hooks/useProperty';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useTranslation } from '../../context/TranslationContext';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const COLORS = [
 '#6D5FFA',
 '#AA7E42',
 '#52C41A',
 '#FFA940',
 '#F5222D',
 '#13C2C2',
 '#722ED1',
 '#EB2F96',
];

const RevenueDashboard = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();

 const [userId, setUserId] = useState(null);
 const [selectedProperty, setSelectedProperty] = useState(null);
 const [propertyRevenues, setPropertyRevenues] = useState({});
 const [monthlyRevenuesByProperty, setMonthlyRevenuesByProperty] = useState({});
 const [totalAnnualRevenue, setTotalAnnualRevenue] = useState(0);
 const [percentageChange, setPercentageChange] = useState(0);
 const [topPerformers, setTopPerformers] = useState([]);
 const [underperformers, setUnderperformers] = useState([]);
 const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
 const [activeTab, setActiveTab] = useState('overview');
 const [chartData, setChartData] = useState([]);
 const [isChartModalVisible, setIsChartModalVisible] = useState(false);
 const [selectedPropertyId, setSelectedPropertyId] = useState('all');

 const [properties, setProperties] = useState([]);

 const [loadingProperties, setLoadingProperties] = useState(false);
 const [loadingRevenue, setLoadingRevenue] = useState(false);

 // Get hooks
 const { getAnnualRevenue } = useRevenue();
 const { fetchPropertiesbyClient } = useProperty();

 // Handle user data from header component
 const handleUserData = (userData) => {
  setUserId(userData);
 };

 const fetchUserProperties = async () => {
  setLoadingRevenue(true);
  try {
   // Fetch owned properties
   const ownedProperties = await fetchPropertiesbyClient(userId);

   // Mark owned properties
   const ownedPropertyDetails = (ownedProperties || []).map((property) => ({
    ...property,
    propertyType: 'owned',
   }));

   setProperties(ownedPropertyDetails);

   setTimeout(() => {
    if (ownedPropertyDetails.length > 0) {
     fetchAllPropertyRevenues(ownedPropertyDetails);
    }
   }, 0);
  } catch (error) {
   console.error('Error fetching properties:', error);
   setProperties([]);
  } finally {
   setLoadingRevenue(false);
  }
 };

 // First, load properties when userId is available
 useEffect(() => {
  if (userId) {
   fetchUserProperties(userId);
  }
 }, [userId]);

 const fetchAllPropertyRevenues = useCallback(
  async (propsToUse) => {
   const propsArray = propsToUse || properties;
   if (!propsArray || propsArray.length === 0) {
    setLoadingRevenue(false);
    return;
   }
   if (!properties || properties.length === 0) {
    setLoadingRevenue(false);
    return;
   }

   setLoadingRevenue(true);
   const revenues = {};
   const monthlyRevenuesByPropertyTemp = {};
   let totalRevenue = 0;
   let previousYearTotal = 0;

   try {
    // Get current year and previous year revenues for all properties
    const currentYearPromises = properties
     .filter(
      (property) =>
       selectedPropertyId === 'all' || property.id === selectedPropertyId
     )
     .map(async (property) => {
      try {
       const revenue = await getAnnualRevenue(property.id, selectedYear);

       if (revenue && revenue.totalRevenue) {
        revenues[property.id] = {
         total: revenue.totalRevenue,
         propertyName: property.name,
         monthlyData: revenue.revenues,
        };

        totalRevenue += revenue.totalRevenue;

        // Store monthly data for charts
        monthlyRevenuesByPropertyTemp[property.id] = revenue.revenues.map(
         (item) => ({
          month: item.month,
          amount: item.amount,
          propertyName: property.name,
         })
        );
       }
      } catch (err) {
       console.error(
        `Error fetching revenue for property ${property.id}:`,
        err
       );
       revenues[property.id] = { total: 0, propertyName: property.name };
      }
     });

    const previousYearPromises = properties
     .filter(
      (property) =>
       selectedPropertyId === 'all' || property.id === selectedPropertyId
     )
     .map(async (property) => {
      try {
       const prevYearRevenue = await getAnnualRevenue(
        property.id,
        selectedYear - 1
       );
       if (prevYearRevenue && prevYearRevenue.totalRevenue) {
        previousYearTotal += prevYearRevenue.totalRevenue;
       }
      } catch (err) {
       console.error(
        `Error fetching previous year revenue for property ${property.id}:`,
        err
       );
      }
     });

    await Promise.all([...currentYearPromises, ...previousYearPromises]);

    setPropertyRevenues(revenues);
    setTotalAnnualRevenue(totalRevenue);
    setMonthlyRevenuesByProperty(monthlyRevenuesByPropertyTemp);

    // Calculate percentage change
    if (previousYearTotal > 0) {
     const change =
      ((totalRevenue - previousYearTotal) / previousYearTotal) * 100;
     setPercentageChange(change);
    }

    // Identify top performers and underperformers
    const propertiesWithRevenue = Object.entries(revenues).map(
     ([id, data]) => ({
      id,
      ...data,
     })
    );

    const sortedProperties = [...propertiesWithRevenue].sort(
     (a, b) => b.total - a.total
    );

    setTopPerformers(sortedProperties.slice(0, 3));
    setUnderperformers(
     sortedProperties
      .filter(
       (p) =>
        p.total === 0 ||
        p.total < (totalRevenue / sortedProperties.length) * 0.5
      )
      .slice(0, 3)
    );
   } catch (error) {
    console.error('Error in fetchAllPropertyRevenues:', error);
   } finally {
    setLoadingRevenue(false);
   }
  },
  [properties, selectedYear, selectedPropertyId]
 );

 // Load revenue data once properties are loaded
 useEffect(() => {
  if (properties.length > 0) {
   fetchAllPropertyRevenues();
  }
 }, [fetchAllPropertyRevenues]);

 // Generate year options for selector
 const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 5; i <= currentYear; i++) {
   years.push(i);
  }
  return years;
 };

 // Prepare data for the property distribution pie chart
 const revenueDistributionData = useMemo(() => {
  return Object.entries(propertyRevenues)
   .map(([id, data]) => ({
    name: data.propertyName,
    value: data.total,
    id: id,
   }))
   .filter((item) => item.value > 0);
 }, [propertyRevenues]);

 // Prepare data for the monthly revenue chart
 const monthlyRevenueData = useMemo(() => {
  const monthsData = Array(12)
   .fill(0)
   .map((_, idx) => ({
    month: idx + 1,
    name: new Date(2000, idx, 1).toLocaleString('default', { month: 'short' }),
    revenue: 0,
   }));

  // Aggregate monthly revenue across all properties
  Object.values(monthlyRevenuesByProperty).forEach((propertyData) => {
   propertyData.forEach((item) => {
    const monthIndex = item.month - 1;
    if (monthsData[monthIndex]) {
     monthsData[monthIndex].revenue += Number(item.amount);
    }
   });
  });

  return monthsData;
 }, [monthlyRevenuesByProperty]);

 // Handle chart modal display
 const showPropertyChart = async (propertyId) => {
  setSelectedPropertyId(propertyId);

  try {
   const revenue = await getAnnualRevenue(propertyId, selectedYear);
   const propertyName =
    properties.find((p) => p.id === parseInt(propertyId))?.name || 'Property';

   const monthlyData = revenue.revenues.map((item) => ({
    month: new Date(selectedYear, item.month - 1).toLocaleString('default', {
     month: 'short',
    }),
    revenue: Number(item.amount),
   }));

   setChartData(monthlyData);
   setSelectedProperty(propertyName);
   setIsChartModalVisible(true);
  } catch (error) {
   console.error(t('error.revenueDataFetch'), error);
  }
 };

 // Handle property revenue page navigation
 const navigateToPropertyRevenue = (propertyId, propertyName) => {
  navigate(`/propertyrevenuedashboard?id=${propertyId}&name=${propertyName}`);
 };

 // Table columns for properties overview
 const columns = [
  {
   title: t('property.basic.name'),
   dataIndex: 'propertyName',
   key: 'propertyName',
   render: (name, record) => (
    <Button
     type="link"
     onClick={() => navigateToPropertyRevenue(record.id, name)}
    >
     {name}
    </Button>
   ),
  },
  {
   title: t('dashboard.totalRevenue'),
   dataIndex: 'total',
   key: 'total',
   render: (total) =>
    `${Number(total).toLocaleString()} ${t('revenue.currency')}`,
   sorter: (a, b) => a.total - b.total,
   defaultSortOrder: 'descend',
  },
  {
   title: t('property.actions.actions'),
   key: 'actions',
   render: (_, record) => (
    <Space>
     <Button
      icon={<BarChartOutlined />}
      onClick={() => showPropertyChart(record.id)}
     >
      {t('revenue.chart')}
     </Button>
    </Space>
   ),
  },
 ];

 // Format property revenue data for table
 const propertiesTableData = useMemo(() => {
  return Object.entries(propertyRevenues).map(([id, data]) => ({
   id,
   propertyName: data.propertyName,
   total: data.total,
  }));
 }, [propertyRevenues]);

 const loading = loadingProperties && loadingRevenue;
 // Loading indicator
 if (loading) {
  return (
   <Layout className="contentStyle">
    <Head onUserData={handleUserData} />
    <Content className="container">
     <div
      style={{
       display: 'flex',
       justifyContent: 'center',
       alignItems: 'center',
       height: '60vh',
      }}
     >
      <Spin size="large" />
     </div>
    </Content>
    {!screens.xs && <Foot />}
   </Layout>
  );
 }

 return (
  <Layout className="contentStyle">
   <Head onUserData={handleUserData} />
   <Content className="container">
    <Title level={2}>{t('revenue.allPropertiesTitle')}</Title>

    {/* Filters */}
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
     <Col>
      <Select
       style={{ width: 280 }}
       placeholder={t('dashboard.filterByProperty')}
       value={selectedPropertyId}
       onChange={(value) => setSelectedPropertyId(value)}
       size="large"
      >
       <Option value="all">{t('revenue.allProperties')}</Option>
       {properties.map((property) => (
        <Option key={property.id} value={property.id}>
         {property.name}
        </Option>
       ))}
      </Select>
     </Col>
     <Col>
      <Select
       style={{ width: 200 }}
       placeholder={t('revenue.filterByYear')}
       value={selectedYear}
       onChange={(value) => setSelectedYear(value)}
       size="large"
      >
       {generateYearOptions().map((year) => (
        <Option key={year} value={year}>
         {year}
        </Option>
       ))}
      </Select>
     </Col>
    </Row>

    {/* Statistics Cards */}
    <Row gutter={16} style={{ marginBottom: 24 }}>
     <Col xs={24} md={8}>
      <Card className="stat-card revenue-stat-card">
       <Statistic
        title={t('revenue.annualTotal')}
        value={totalAnnualRevenue}
        suffix={t('revenue.currency')}
        precision={0}
       />
       <div className="stat-info">
        <i className="fa-light fa-chart-line stat-icon" />
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
         {t('dashboard.totalRevenue')}
        </Text>
       </div>
      </Card>
     </Col>
     <Col xs={24} md={8}>
      <Card className="stat-card property-stat-card">
       <Statistic
        title={t('revenue.propertiesCount')}
        value={properties.length}
        suffix={t('property.title')}
        precision={0}
       />
       <div className="stat-info">
        <i className="fa-light fa-building stat-icon" />
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
         {t('property.title')}
        </Text>
       </div>
      </Card>
     </Col>
     <Col xs={24} md={8}>
      <Card
       className={`stat-card ${
        percentageChange >= 0
         ? 'change-stat-card-positive'
         : 'change-stat-card-negative'
       }`}
      >
       <Statistic
        title={t('revenue.yearOverYear')}
        value={percentageChange}
        precision={2}
        prefix={
         percentageChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />
        }
        suffix="%"
       />
       <div className="stat-info">
        <i
         className={`fa-light ${
          percentageChange >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'
         } stat-icon`}
        />
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
         {percentageChange >= 0
          ? t('dashboard.growth')
          : t('dashboard.decline')}
        </Text>
       </div>
      </Card>
     </Col>
    </Row>

    {/* Tabs for different views */}
    <Tabs
     activeKey={activeTab}
     onChange={setActiveTab}
     style={{ marginBottom: 24 }}
     type="card"
     items={[
      {
       key: 'overview',
       label: (
        <span>
         <PieChartOutlined /> {t('revenue.tabs.overview')}
        </span>
       ),
       children: (
        <>
         <Row gutter={16}>
          {/* Revenue Distribution Chart */}
          <Col xs={24} lg={12}>
           <Card
            title={t('revenue.distributionChart')}
            style={{ marginBottom: 16 }}
           >
            {revenueDistributionData.length > 0 ? (
             <ResponsiveContainer width="100%" height={300}>
              <PieChart>
               <Pie
                data={revenueDistributionData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) =>
                 `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
               >
                {revenueDistributionData.map((entry, index) => (
                 <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  onClick={() => showPropertyChart(entry.id)}
                  style={{ cursor: 'pointer' }}
                 />
                ))}
               </Pie>
               <Tooltip
                formatter={(value) =>
                 `${Number(value).toLocaleString()} ${t('revenue.currency')}`
                }
               />
              </PieChart>
             </ResponsiveContainer>
            ) : (
             <Empty description={t('revenue.noData')} />
            )}
           </Card>
          </Col>

          {/* Monthly Revenue Chart */}
          <Col xs={24} lg={12}>
           <Card title={t('revenue.monthlyChart')} style={{ marginBottom: 16 }}>
            {monthlyRevenueData.some((item) => item.revenue > 0) ? (
             <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenueData}>
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis dataKey="name" />
               <YAxis />
               <Tooltip
                formatter={(value) =>
                 `${Number(value).toLocaleString()} ${t('revenue.currency')}`
                }
               />
               <Legend />
               <Bar
                dataKey="revenue"
                fill="#6D5FFA"
                name={t('revenue.monthlyRevenue')}
               />
              </BarChart>
             </ResponsiveContainer>
            ) : (
             <Empty description={t('revenue.noData')} />
            )}
           </Card>
          </Col>
         </Row>

         {/* Top Performers and Underperforming Properties */}
         <Row gutter={16}>
          <Col xs={24} md={12}>
           <Card
            title={t('revenue.topPerformers')}
            style={{ marginBottom: 16 }}
           >
            {topPerformers.length > 0 ? (
             <ul className="property-stats-list">
              {topPerformers.map((property) => (
               <li key={property.id} style={{ marginBottom: 8 }}>
                <Flex justify="space-between" align="center">
                 <Text strong>{property.propertyName}</Text>
                 <Space>
                  <Badge color="#52C41A" />
                  <Text>
                   {Number(property.total).toLocaleString()}{' '}
                   {t('revenue.currency')}
                  </Text>
                  <Button
                   type="link"
                   size="small"
                   onClick={() =>
                    navigateToPropertyRevenue(
                     property.id,
                     property.propertyName
                    )
                   }
                  >
                   {t('revenue.details')}
                  </Button>
                 </Space>
                </Flex>
               </li>
              ))}
             </ul>
            ) : (
             <Empty description={t('revenue.noData')} />
            )}
           </Card>
          </Col>

          <Col xs={24} md={12}>
           <Card
            title={t('revenue.underperforming')}
            style={{ marginBottom: 16 }}
           >
            {underperformers.length > 0 ? (
             <ul className="property-stats-list">
              {underperformers.map((property) => (
               <li key={property.id} style={{ marginBottom: 8 }}>
                <Flex justify="space-between" align="center">
                 <Text strong>{property.propertyName}</Text>
                 <Space>
                  <Badge color="#F5222D" />
                  <Text>
                   {Number(property.total).toLocaleString()}{' '}
                   {t('revenue.currency')}
                  </Text>
                 </Space>
                </Flex>
               </li>
              ))}
             </ul>
            ) : (
             <Empty description={t('revenue.noUnderperforming')} />
            )}
           </Card>
          </Col>
         </Row>
        </>
       ),
      },
      {
       key: 'monthly',
       label: (
        <span>
         <LineChartOutlined /> {t('revenue.tabs.monthly')}
        </span>
       ),
       children: (
        <Card title={t('revenue.monthlyComparison')}>
         {Object.keys(monthlyRevenuesByProperty).length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
           <LineChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
             dataKey="month"
             type="category"
             allowDuplicatedCategory={false}
             tickFormatter={(month) =>
              new Date(2000, month - 1, 1).toLocaleString('default', {
               month: 'short',
              })
             }
            />
            <YAxis />
            <Tooltip
             formatter={(value) =>
              `${Number(value).toLocaleString()} ${t('revenue.currency')}`
             }
            />
            <Legend />

            {Object.entries(propertyRevenues).map(
             ([propertyId, data], index) => {
              // Skip if no monthly data
              if (!monthlyRevenuesByProperty[propertyId]) return null;

              const monthlyData = monthlyRevenuesByProperty[propertyId].map(
               (item) => ({
                month: item.month,
                revenue: Number(item.amount),
               })
              );

              return (
               <Line
                key={propertyId}
                data={monthlyData}
                type="monotone"
                dataKey="revenue"
                name={data.propertyName}
                stroke={COLORS[index % COLORS.length]}
                activeDot={{ r: 8 }}
                connectNulls
               />
              );
             }
            )}
           </LineChart>
          </ResponsiveContainer>
         ) : (
          <Empty description={t('revenue.noData')} />
         )}
        </Card>
       ),
      },
      {
       key: 'properties',
       label: (
        <span>
         <i
          className="PrimaryColor fa-light fa-table"
          style={{ marginRight: 8 }}
         />
         {t('revenue.tabs.properties')}
        </span>
       ),
       children: (
        <Card title={t('revenue.allProperties')}>
         <Table
          dataSource={propertiesTableData}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
         />
        </Card>
       ),
      },
     ]}
    />

    {/* Property Chart Modal */}
    <Modal
     title={t('revenue.chartTitle', {
      name: selectedProperty || '',
      year: selectedYear,
     })}
     open={isChartModalVisible}
     onCancel={() => setIsChartModalVisible(false)}
     footer={null}
     width={800}
    >
     <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
       <CartesianGrid strokeDasharray="3 3" />
       <XAxis dataKey="month" />
       <YAxis />
       <Tooltip
        formatter={(value) =>
         `${Number(value).toLocaleString()} ${t('revenue.currency')}`
        }
       />
       <Legend />
       <Line
        type="monotone"
        dataKey="revenue"
        stroke="#6D5FFA"
        activeDot={{ r: 8 }}
       />
      </LineChart>
     </ResponsiveContainer>
     <div style={{ marginTop: 16, textAlign: 'center' }}>
      <Button
       type="primary"
       onClick={() => {
        setIsChartModalVisible(false);
        navigateToPropertyRevenue(selectedPropertyId, selectedProperty);
       }}
      >
       {t('revenue.viewDetails')}
      </Button>
     </div>
    </Modal>
   </Content>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default RevenueDashboard;
