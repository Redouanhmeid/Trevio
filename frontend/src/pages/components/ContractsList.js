import React, { useState, useEffect } from 'react';
import {
 Table,
 Tag,
 Space,
 Button,
 Layout,
 Typography,
 Image,
 message,
 Row,
 Col,
 Card,
 Statistic,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import useReservationContract from '../../hooks/useReservationContract';
import { useTranslation } from '../../context/TranslationContext';
import { useLocation, useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import Head from '../../components/common/header';
import Foot from '../../components/common/footer';
import ShareModal from '../../components/common/ShareModal';
import useProperty from '../../hooks/useProperty';

const { Title, Text } = Typography;
const { Content } = Layout;

const ContractsList = () => {
 const { t } = useTranslation();
 const location = useLocation();
 const { hash } = queryString.parse(location.search);
 const [contracts, setContracts] = useState([]);
 const [loading, setLoading] = useState(true);
 const { getIdFromHash } = useProperty();
 const { getContractsByProperty, updateContractStatus } =
  useReservationContract();
 const [propertyId, setPropertyId] = useState();
 const [pageUrl, setPageUrl] = useState();
 const [isShareModalVisible, setIsShareModalVisible] = useState(false);

 const navigate = useNavigate();

 const showShareModal = (hashId) => {
  setPageUrl();
  setPageUrl(`${window.location.origin}/guest/contract/${hashId}`);
  setIsShareModalVisible(true);
 };

 const hideShareModal = () => {
  setIsShareModalVisible(false);
 };

 useEffect(() => {
  const fetchData = async () => {
   if (hash) {
    const numericId = await getIdFromHash(hash);
    setPropertyId(numericId);
   }
  };
  fetchData();
 }, [hash]);

 useEffect(() => {
  if (propertyId) {
   fetchContracts();
  }
 }, [propertyId]);

 const handleStatusChange = async (contractId, newStatus) => {
  try {
   await updateContractStatus(contractId, newStatus);
   message.success(t('contracts.success.statusUpdate'));
   fetchContracts(); // Refresh the list
  } catch (error) {
   message.error(t('contracts.error.statusUpdate'));
  }
 };

 const getStatusCounts = () => {
  // Add check to ensure contracts is an array
  if (!Array.isArray(contracts)) return {};

  return contracts.reduce((acc, contract) => {
   acc[contract.status] = (acc[contract.status] || 0) + 1;
   return acc;
  }, {});
 };

 const statusColors = {
  DRAFT: 'gray',
  SENT: 'blue',
  SIGNED: 'green',
  REJECTED: 'red',
  COMPLETED: 'purple',
 };

 const columns = [
  {
   title: t('contracts.guest'),
   key: 'guest',
   render: (text, record) => (
    <Space direction="vertical">
     <Text>
      <i className="fa-light fa-user tag-icon-style" /> {record.firstname}{' '}
      {record.lastname}
     </Text>
     <Text>
      <i className="fa-light fa-envelope tag-icon-style" /> {record.email}
     </Text>
    </Space>
   ),
  },
  {
   title: t('contracts.signature'),
   dataIndex: 'signature',
   key: 'signature',
   render: (text, record) => (
    <Image
     src={record.signatureImageUrl}
     shape="square"
     width={200}
     preview={false}
    />
   ),
  },
  {
   title: t('contracts.status'),
   key: 'status',
   render: (text, record) => (
    <Tag color={statusColors[record.status]}>{record.status}</Tag>
   ),
  },
  {
   title: t('contracts.actions.actions'),
   key: 'actions',
   render: (text, record) => (
    <Space>
     {record.status === 'DRAFT' && (
      <Button
       type="primary"
       onClick={() => handleStatusChange(record.id, 'SENT')}
      >
       {t('contracts.actions.send')}
      </Button>
     )}
     {record.status === 'SENT' && (
      <>
       <Button
        type="primary"
        onClick={() => handleStatusChange(record.id, 'SIGNED')}
       >
        {t('contracts.actions.markSigned')}
       </Button>
       <Button danger onClick={() => handleStatusChange(record.id, 'REJECTED')}>
        {t('contracts.actions.reject')}
       </Button>
      </>
     )}
     {record.status === 'SIGNED' && (
      <Button
       type="primary"
       onClick={() => handleStatusChange(record.id, 'COMPLETED')}
      >
       {t('contracts.actions.complete')}
      </Button>
     )}
     {record.status === 'COMPLETED' && (
      <Button
       icon={<i className="fa-regular fa-share-nodes" />}
       onClick={() => showShareModal(record.hashId)}
      >
       {t('guidebook.share')}
      </Button>
     )}
    </Space>
   ),
  },
 ];

 const fetchContracts = async () => {
  try {
   setLoading(true);
   const data = await getContractsByProperty(propertyId);
   // Ensure we're setting an array
   setContracts(Array.isArray(data) ? data : []);
  } catch (error) {
   message.error(t('contracts.error.fetch'));
   setContracts([]); // Set empty array on error
  } finally {
   setLoading(false);
  }
 };

 // Calculate status counts whenever contracts change
 const statusCounts = contracts.reduce((acc, contract) => {
  acc[contract.status] = (acc[contract.status] || 0) + 1;
  return acc;
 }, {});

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
    <Title level={2}>{t('contracts.title')}</Title>

    <Row gutter={[16, 4]}>
     {/* Status Summary Cards */}
     <Col span={24}>
      <Row gutter={16}>
       {Object.entries(statusCounts).map(([status, count]) => (
        <Col span={4} key={status}>
         <Card>
          <Statistic
           title={t(`contracts.statuses.${status.toLowerCase()}`)}
           value={count}
           valueStyle={{ color: statusColors[status] }}
          />
         </Card>
        </Col>
       ))}
      </Row>
     </Col>

     {/* Contracts Table */}
     <Col span={24}>
      <br />
      <Table
       columns={columns}
       dataSource={contracts}
       loading={loading}
       rowKey="id"
       expandable={{
        expandedRowRender: (record) => (
         <Card bordered={false} className="contract-details-card">
          <Row gutter={[24, 16]}>
           {/* First row - personal information with icons */}
           <Col span={24}>
            <Card
             type="inner"
             title={t('contracts.details.personalInfo')}
             className="detail-section"
            >
             <Row gutter={16}>
              <Col span={8}>
               <Space>
                <i className="fa-light fa-phone detail-icon" />
                <Text>{record.phone}</Text>
               </Space>
              </Col>
              <Col span={8}>
               <Space>
                <i className="fa-light fa-globe detail-icon" />
                <Text>{record.nationality}</Text>
               </Space>
              </Col>
              <Col span={8}>
               <Space>
                <i className="fa-light fa-venus-mars detail-icon" />
                <Text>{record.sex}</Text>
               </Space>
              </Col>
              <Col span={8}>
               <Space>
                <i className="fa-light fa-cake-candles detail-icon" />
                <Text>
                 {record.birthDate &&
                  new Date(record.birthDate).toLocaleDateString()}
                </Text>
               </Space>
              </Col>
              <Col span={8}>
               <Space>
                <i className="fa-light fa-envelope detail-icon" />
                <Text>{record.email}</Text>
               </Space>
              </Col>
              <Col span={8}>
               <Space>
                <i className="fa-light fa-location-dot detail-icon" />
                <Text>{record.residenceCountry}</Text>
               </Space>
              </Col>
             </Row>
            </Card>
           </Col>

           {/* Second row - reservation details with appealing design */}
           <Col span={24}>
            <Card
             type="inner"
             title={t('contracts.details.stayDetails')}
             className="detail-section"
             style={{ background: '#f9f9ff' }}
            >
             <Row gutter={16} align="middle">
              <Col span={8}>
               <div className="date-container">
                <div className="date-label">{t('contract.checkIn')}</div>
                <div className="date-value">
                 {record.checkInDate &&
                  new Date(record.checkInDate).toLocaleDateString()}
                </div>
               </div>
              </Col>
              <Col span={8}>
               <div className="date-container">
                <div className="date-label">{t('contract.checkOut')}</div>
                <div className="date-value">
                 {record.checkOutDate &&
                  new Date(record.checkOutDate).toLocaleDateString()}
                </div>
               </div>
              </Col>
              <Col span={8}>
               {record.reservationId && (
                <Button
                 type="primary"
                 icon={<i className="fa-light fa-calendar"></i>}
                 onClick={() =>
                  navigate(`/generate-contract/${record.reservationId}`)
                 }
                >
                 {t('contracts.details.viewReservation')}
                </Button>
               )}
              </Col>
             </Row>
            </Card>
           </Col>

           {/* Third row - document information */}
           <Col span={24}>
            <Card
             type="inner"
             title={t('contracts.details.documentInfo')}
             className="detail-section"
            >
             <Row gutter={[8, 24]}>
              <Col span={8}>
               <Space direction="vertical">
                <Text type="secondary">
                 {t('contracts.details.documentType')}
                </Text>
                <Text strong>{record.documentType}</Text>
               </Space>
              </Col>
              <Col span={8}>
               <Space direction="vertical">
                <Text type="secondary">
                 {t('contracts.details.documentNumber')}
                </Text>
                <Text strong>{record.documentNumber}</Text>
               </Space>
              </Col>
              <Col span={8}>
               <Space direction="vertical">
                <Text type="secondary">
                 {t('contracts.details.documentIssueDate')}
                </Text>
                <Text strong>
                 {record.documentIssueDate &&
                  new Date(record.documentIssueDate).toLocaleDateString()}
                </Text>
               </Space>
              </Col>
              <Col span={8}>
               <Space direction="vertical">
                <Text type="secondary">
                 {t('contracts.details.contractCreated')}
                </Text>
                <Text strong>
                 {record.createdAt &&
                  new Date(record.createdAt).toLocaleDateString()}
                </Text>
               </Space>
              </Col>
              <Col span={8}>
               <Space direction="vertical">
                <Text type="secondary">
                 {t('contracts.details.contractUpdated')}
                </Text>
                <Text strong>
                 {record.updatedAt &&
                  new Date(record.updatedAt).toLocaleDateString()}
                </Text>
               </Space>
              </Col>
              <Col span={8}>
               <Space direction="vertical">
                <Text type="secondary">
                 {t('contracts.details.residenceAddress')}
                </Text>
                <Text strong>
                 {record.residenceAddress}, {record.residenceCity},{' '}
                 {record.residencePostalCode}
                </Text>
               </Space>
              </Col>
             </Row>
            </Card>
           </Col>
          </Row>
         </Card>
        ),
       }}
      />
     </Col>
    </Row>
   </Content>
   <Foot />
   <ShareModal
    isVisible={isShareModalVisible}
    onClose={hideShareModal}
    pageUrl={pageUrl}
   />
  </Layout>
 );
};

export default ContractsList;
