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
 Flex,
 Statistic,
 Grid,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import useReservationContract from '../../hooks/useReservationContract';
import { useTranslation } from '../../context/TranslationContext';
import { useLocation, useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import Foot from '../../components/common/footer';
import ShareModal from '../../components/common/ShareModal';
import useProperty from '../../hooks/useProperty';
import Head from '../../components/common/header';
import PDFContractGenerator from '../../utils/PDFContractGenerator';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Content } = Layout;

const ContractsList = () => {
 const { t } = useTranslation();
 const location = useLocation();
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();
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

 const mobileColumns = [
  {
   title: t('contracts.guest'),
   key: 'guest',
   width: 100,
   render: (text, record) => (
    <Text>
     {record.firstname} {record.lastname}
    </Text>
   ),
  },
  {
   title: t('contracts.status'),
   key: 'status',
   width: 100,
   render: (text, record) => (
    <Tag color={statusColors[record.status]}>{record.status}</Tag>
   ),
  },
 ];

 const desktopColumns = [
  {
   title: t('contracts.guest'),
   width: 300,
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
   title: t('contract.bookingDates'),
   key: 'dates',
   width: 260,
   render: (text, record) => (
    <Text>
     {record.checkInDate &&
      new Date(record.checkInDate).toLocaleDateString('en-GB', {
       day: '2-digit',
       month: '2-digit',
       year: 'numeric',
      })}
     {' - '}
     {record.checkOutDate &&
      new Date(record.checkOutDate).toLocaleDateString('en-GB', {
       day: '2-digit',
       month: '2-digit',
       year: 'numeric',
      })}
    </Text>
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
      <Space>
       <Button
        icon={<i className="fa-regular fa-share-nodes" />}
        onClick={() => showShareModal(record.hashId)}
       >
        {t('guidebook.share')}
       </Button>
       <PDFContractGenerator
        formData={{
         firstname: record.firstname,
         lastname: record.lastname,
         middlename: record.middlename,
         birthDate: dayjs(record.birthDate),
         sex: record.sex,
         Nationality: record.nationality,
         email: record.email,
         phone: record.phone,
         residenceCountry: record.residenceCountry,
         residenceCity: record.residenceCity,
         residenceAddress: record.residenceAddress,
         residencePostalCode: record.residencePostalCode,
         documentType: record.documentType,
         documentNumber: record.documentNumber,
         documentIssueDate: dayjs(record.documentIssueDate),
         submissionDate: record.updatedAt,
        }}
        signature={
         record.signatureImageUrl
          ? {
             toDataURL: () => record.signatureImageUrl,
             isEmpty: () => false,
            }
          : null
        }
        filelist={[]}
        t={t}
       />
      </Space>
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
        <Col xs={12} md={4} key={status}>
         <Card
          className="custom-stat-card"
          title={t(`contracts.statuses.${status.toLowerCase()}`)}
          bordered={false}
         >
          <Statistic
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
       columns={screens.xs ? mobileColumns : desktopColumns}
       dataSource={contracts}
       loading={loading}
       rowKey="id"
       expandable={{
        expandedRowRender: (record) => (
         <Row
          gutter={[16, 16]}
          style={{
           padding: screens.xs ? '8px' : '16px',
           width: '100%',
           maxWidth: '100%',
           margin: 0,
          }}
         >
          {/* reservation details */}
          <Col xs={24} md={10}>
           <Card className="booking-dates-card">
            <Title level={3} className="booking-dates-title">
             {t('contract.bookingDates')}
            </Title>
            <Flex justify="space-between" align="center">
             <Flex vertical align="center" className="date-column">
              <Text className="date-label">
               <i
                className="fa-regular fa-arrow-right-to-arc fa-xl"
                style={{ marginRight: 12 }}
               />
               {t('contract.checkIn')}
              </Text>
              <Text strong className="date-value">
               {new Date(record.checkInDate)
                .toLocaleDateString('fr-FR', {
                 day: '2-digit',
                 month: 'short',
                 year: 'numeric',
                })
                .toUpperCase()}
              </Text>
             </Flex>

             {screens.xs ? (
              <div className="timeline-container-vertical">
               <div className="timeline-line-vertical">
                <div className="timeline-solid-vertical" />
               </div>
              </div>
             ) : (
              <div className="timeline-container">
               <div className="timeline-dot" />
               <div className="timeline-line">
                <div className="timeline-dashed" />
               </div>
               <div className="timeline-dot" />
              </div>
             )}

             <Flex vertical align="center" className="date-column">
              <Text className="date-label">
               {t('contract.checkOut')}
               <i
                className="fa-regular fa-arrow-right-from-arc fa-xl"
                style={{ marginLeft: 12 }}
               />
              </Text>
              <Text strong className="date-value">
               {new Date(record.checkOutDate)
                .toLocaleDateString('fr-FR', {
                 day: '2-digit',
                 month: 'short',
                 year: 'numeric',
                })
                .toUpperCase()}
              </Text>
             </Flex>
            </Flex>
           </Card>
          </Col>

          {/* personal information */}
          <Col xs={24} md={14}>
           <Card className="reservation-guest-card">
            <Title level={4}>{t('contracts.guestInformation')}</Title>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
             <Flex justify="space-between">
              <Space>
               <i className="fa-regular fa-user PrimaryColor" />
               <div>
                <Text strong style={{ fontSize: 16 }}>
                 {record.firstname} {record.middlename || ''} {record.lastname}
                </Text>
               </div>
              </Space>
              <Space>
               <i className="fa-regular fa-envelope PrimaryColor" />
               <div>
                <Text>{record.email}</Text>
               </div>
              </Space>
              <Space>
               <i className="fa-regular fa-phone PrimaryColor" />
               <div>
                <Text>{record.phone || '-'}</Text>
               </div>
              </Space>
             </Flex>

             <Flex justify="space-between">
              <Space>
               <i className="fa-regular fa-calendar PrimaryColor" />
               <div>
                <Text>
                 {record.birthDate &&
                  dayjs(record.birthDate).format('YYYY-MM-DD')}
                </Text>
               </div>
              </Space>
              <Space>
               <i className="fa-regular fa-venus-mars PrimaryColor" />
               <div>
                <Text>{record.sex}</Text>
               </div>
              </Space>
              <Space>
               <i className="fa-regular fa-globe PrimaryColor" />
               <div>
                <Text>{record.nationality}</Text>
               </div>
              </Space>
             </Flex>

             <Flex justify="space-between">
              <Space>
               <i className="fa-regular fa-location-dot PrimaryColor" />
               <div>
                <Text>
                 {record.residenceAddress}, {record.residenceCity},{' '}
                 {record.residenceCountry}, {record.residencePostalCode}
                </Text>
               </div>
              </Space>
             </Flex>
            </Space>
           </Card>
          </Col>

          {/* document information */}
          <Col xs={24}>
           <Card
            title={t('contracts.details.documentInfo')}
            style={{ borderRadius: 16 }}
           >
            <Row gutter={[16, 16]}>
             <Col xs={24} md={8}>
              <Space>
               <i
                className="fa-regular fa-passport PrimaryColor"
                style={{ fontSize: 24 }}
               />
               <div>
                <Text type="secondary">
                 {t('contracts.details.documentType')}
                </Text>
                <br />
                <Text>{record.documentType}</Text>
               </div>
              </Space>
             </Col>
             <Col xs={24} md={8}>
              <Space>
               <i
                className="fa-regular fa-id-card PrimaryColor"
                style={{ fontSize: 24 }}
               />
               <div>
                <Text type="secondary">
                 {t('contracts.details.documentNumber')}
                </Text>
                <br />
                <Text>{record.documentNumber}</Text>
               </div>
              </Space>
             </Col>
             <Col xs={24} md={8}>
              <Space>
               <i
                className="fa-regular fa-calendar-check PrimaryColor"
                style={{ fontSize: 24 }}
               />
               <div>
                <Text type="secondary">
                 {t('contracts.details.documentIssueDate')}
                </Text>
                <br />
                <Text>
                 {record.documentIssueDate &&
                  dayjs(record.documentIssueDate).format('YYYY-MM-DD')}
                </Text>
               </div>
              </Space>
             </Col>
            </Row>
           </Card>
          </Col>

          {/* Signature - if available */}
          {record.signatureImageUrl && (
           <Col xs={24}>
            <Card
             title={t('contracts.details.signature')}
             style={{ borderRadius: 16 }}
            >
             <Flex justify="center" align="center">
              <div
               style={{
                padding: 16,
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                background: '#f9f9f9',
               }}
              >
               <Image
                src={record.signatureImageUrl}
                alt="Signature"
                style={{ maxHeight: 100 }}
                preview={false}
               />
              </div>
             </Flex>
            </Card>
           </Col>
          )}

          <Col xs={24}>
           <Row gutter={[8, 8]} justify="center">
            {record.status === 'COMPLETED' && (
             <Col xs={24} sm={8}>
              <PDFContractGenerator
               formData={{
                firstname: record.firstname,
                lastname: record.lastname,
                middlename: record.middlename,
                birthDate: dayjs(record.birthDate),
                sex: record.sex,
                Nationality: record.nationality,
                email: record.email,
                phone: record.phone,
                residenceCountry: record.residenceCountry,
                residenceCity: record.residenceCity,
                residenceAddress: record.residenceAddress,
                residencePostalCode: record.residencePostalCode,
                documentType: record.documentType,
                documentNumber: record.documentNumber,
                documentIssueDate: dayjs(record.documentIssueDate),
                submissionDate: record.updatedAt,
               }}
               signature={
                record.signatureImageUrl
                 ? {
                    toDataURL: () => record.signatureImageUrl,
                    isEmpty: () => false,
                   }
                 : null
               }
               filelist={[]} // Empty since contracts don't have attached files
               t={t}
              />
             </Col>
            )}
            <Col xs={24} sm={8}>
             <Button
              type="default"
              icon={<i className="fa-regular fa-calendar"></i>}
              onClick={() =>
               navigate(`/generate-contract/${record.reservationId}`)
              }
              block
             >
              {t('contracts.details.viewReservation')}
             </Button>
            </Col>
            <Col xs={24} sm={8}>
             <Button
              icon={<i className="fa-regular fa-share-nodes" />}
              onClick={() => showShareModal(record.hashId)}
              block
             >
              {t('guidebook.share')}
             </Button>
            </Col>
           </Row>
          </Col>
         </Row>
        ),
       }}
      />
     </Col>
    </Row>
   </Content>
   {!screens.xs && <Foot />}
   <ShareModal
    isVisible={isShareModalVisible}
    onClose={hideShareModal}
    pageUrl={pageUrl}
   />
  </Layout>
 );
};

export default ContractsList;
