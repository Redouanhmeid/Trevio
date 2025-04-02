import React, { useState, useEffect } from 'react';
import {
 Row,
 Col,
 Card,
 Divider,
 Flex,
 Select,
 Button,
 Grid,
 List,
 Typography,
 Image,
 Tag,
 Modal,
 Spin,
 Alert,
} from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
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
import { useTranslation } from '../context/TranslationContext';
import useRevenue from '../hooks/useRevenue';
import fallback from '../assets/fallback.png';

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

// Wrapper component to ensure properties is always an array
const withPropertiesGuard = (WrappedComponent) => {
 return function WithPropertiesGuard({ properties, ...props }) {
  if (!properties) {
   return <Spin />;
  }

  // Ensure properties is always an array
  const propertiesArray = Array.isArray(properties) ? properties : [];

  return <WrappedComponent properties={propertiesArray} {...props} />;
 };
};

export const RevenusSection = withPropertiesGuard(({ properties }) => {
 const { t } = useTranslation();
 const { getAnnualRevenue } = useRevenue();
 const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
 const currentYear = new Date().getFullYear();
 const [propertyRevenues, setPropertyRevenues] = useState({});
 const screens = useBreakpoint();
 const [selectedProperty, setSelectedProperty] = useState(null);
 const [chartData, setChartData] = useState([]);
 const [isModalVisible, setIsModalVisible] = useState(false);

 const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 5; i <= currentYear; i++) {
   years.push(i);
  }
  return years;
 };

 const showRevenueChart = async (property) => {
  setSelectedProperty(property);
  try {
   const revenue = await getAnnualRevenue(property.id, selectedYear);
   const monthlyData = revenue.revenues.map((item) => ({
    month: new Date(selectedYear, item.month - 1).toLocaleString('default', {
     month: 'short',
    }),
    revenue: Number(item.amount),
   }));
   setChartData(monthlyData);
   setIsModalVisible(true);
  } catch (error) {
   console.error(t('error.revenueDataFetch'), error);
  }
 };

 useEffect(() => {
  const fetchAllPropertyRevenues = async () => {
   const revenues = {};

   if (!properties || properties.length === 0) {
    return;
   }

   try {
    const fetchPromises = properties.map(async (property) => {
     try {
      const revenue = await getAnnualRevenue(property.id, selectedYear);
      // Check if the revenue data exists and has the expected structure
      if (revenue && typeof revenue.totalRevenue !== 'undefined') {
       revenues[property.id] = revenue.totalRevenue;
      } else {
       console.log(
        `Revenue data for property ${property.id} is not in expected format:`,
        revenue
       );
       revenues[property.id] = 0;
      }
     } catch (err) {
      console.error(`Error fetching revenue for property ${property.id}:`, err);
      revenues[property.id] = 0;
     }
    });

    await Promise.all(fetchPromises);
    setPropertyRevenues(revenues);
   } catch (error) {
    console.error('Error in fetchAllPropertyRevenues:', error);
   }
  };

  if (properties.length > 0) {
   fetchAllPropertyRevenues();
  }
 }, [properties, selectedYear]);

 return (
  <Row gutter={[32, 32]}>
   <Col xs={24}>
    <Card
     title={
      <>
       {t('revenue.title')}
       {'  '}
       <i className="PrimaryColor fa-regular fa-wallet" />
       <br />
       <Divider />
      </>
     }
     className="dash-card"
     extra={
      <Flex gap="middle">
       <Select
        value={selectedYear}
        onChange={setSelectedYear}
        style={{ width: 120 }}
       >
        {generateYearOptions().map((year) => (
         <Option key={year} value={year}>
          {year}
         </Option>
        ))}
       </Select>
      </Flex>
     }
    >
     {Object.keys(propertyRevenues).length === 0 && properties.length > 0 ? (
      <Alert
       message={t('revenue.noDataFound')}
       description={t('revenue.tryAnotherYear')}
       type="info"
       showIcon
      />
     ) : (
      <List
       itemLayout="horizontal"
       dataSource={properties || []}
       locale={{ emptyText: t('revenue.noData') }}
       renderItem={(logement) => (
        <List.Item
         extra={
          <Button
           type="primary"
           icon={<BarChartOutlined />}
           onClick={() => showRevenueChart(logement)}
          >
           {t('revenue.viewChart')}
          </Button>
         }
        >
         <List.Item.Meta
          avatar={
           <Image
            src={logement.frontPhoto || (logement.photos && logement.photos[0])}
            alt={logement.name}
            fallback={fallback}
            placeholder={
             <div className="image-placeholder">{t('common.loading')}</div>
            }
            width={94}
           />
          }
          title={
           <Text style={{ fontSize: '14px' }} strong>
            {logement.name}
           </Text>
          }
          description={
           <Title level={2} className="PrimaryColor">
            {propertyRevenues[logement.id] || 0} Dhs
           </Title>
          }
         />
        </List.Item>
       )}
      />
     )}
    </Card>
   </Col>

   <Modal
    title={t('revenue.chartTitle', {
     name: selectedProperty?.name || '',
     year: selectedYear,
    })}
    open={isModalVisible}
    onCancel={() => setIsModalVisible(false)}
    footer={null}
    width={800}
   >
    <ResponsiveContainer width="100%" height={400}>
     <LineChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis hide={screens.xs ? true : false} />
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
   </Modal>
  </Row>
 );
});
