import React, { useState, useEffect } from 'react';
import {
 Spin,
 Button,
 DatePicker,
 Form,
 Input,
 InputNumber,
 Select,
 Layout,
 Flex,
 Row,
 Col,
 Typography,
 Divider,
 Modal,
 Tooltip,
 Result,
 Space,
 message,
} from 'antd';
import {
 SyncOutlined,
 ArrowLeftOutlined,
 QuestionCircleOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import Foot from '../../components/common/footer';
import SignatureCanvas from 'react-signature-canvas';
import { Nationalities } from '../../utils/nationalities';
import { countries } from '../../utils/countries';
import useReservationContract from '../../hooks/useReservationContract';
import { useReservation } from '../../hooks/useReservation';
import { useAuthContext } from '../../hooks/useAuthContext';
import useUploadPhotos from '../../hooks/useUploadPhotos';
import { useTranslation } from '../../context/TranslationContext';
import dayjs from 'dayjs';

const { Title, Paragraph, Link } = Typography;
const { Option } = Select;

const filterOption = (input, option) =>
 (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

const Guestform = () => {
 const { t } = useTranslation();
 const location = useLocation();
 const { hash } = queryString.parse(location.search);
 const { user } = useAuthContext();
 const [form] = Form.useForm();
 const { loading, updateContract, getContractByHash } =
  useReservationContract();
 const { fetchReservation, updateReservationStatus } = useReservation();
 const { uploadSignature } = useUploadPhotos();
 const [countryCode, setCountryCode] = useState(
  countries.find((country) => country.name === 'Morocco').dialCode
 ); // Default to first country
 const navigate = useNavigate();

 const [selectedNationality, setSelectedNationality] = useState('');
 const [sign, setSign] = useState();
 const [isperDataModalOpen, setIsperDataModalOpen] = useState(false);
 const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
 const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
 const [reservation, setReservation] = useState(null);

 const perDataPrivacyLink = () => {
  setIsperDataModalOpen(false);
  setIsPrivacyModalOpen(true);
 };

 // Fetch reservation data if reservationId is provided
 useEffect(() => {
  const fetchData = async () => {
   try {
    // First get the contract by hash
    const contract = await getContractByHash(hash);

    if (contract) {
     // Then use the contract's reservationId to get the reservation
     if (contract.reservationId) {
      const reservationData = await fetchReservation(contract.reservationId);
      setReservation(reservationData);
     }
    }
   } catch (error) {
    console.error('Error fetching reservation:', error);
    message.error(t('reservation.fetchError'));
   }
  };

  fetchData();
 }, [location.search]);

 const getMoroccanDocumentTypes = () => [
  { label: t('guestForm.identity.documentType.types.cin'), value: 'CIN' },
  {
   label: t('guestForm.identity.documentType.types.drivingLicense'),
   value: 'DRIVING_LICENSE',
  },
  {
   label: t('guestForm.identity.documentType.types.passport'),
   value: 'PASSPORT',
  },
 ];

 const getForeignerDocumentTypes = () => [
  {
   label: t('guestForm.identity.documentType.types.passport'),
   value: 'PASSPORT',
  },
  {
   label: t('guestForm.identity.documentType.types.moroccanResidence'),
   value: 'MOROCCAN_RESIDENCE',
  },
  {
   label: t('guestForm.identity.documentType.types.foreignerResidence'),
   value: 'FOREIGNER_RESIDENCE',
  },
 ];

 const handleNationalityChange = (value) => {
  setSelectedNationality(value);
  // Clear document-related fields when nationality changes
  form.setFieldsValue({
   documentType: undefined,
   documentNumber: undefined,
   documentIssueDate: undefined,
  });
 };

 const handleClear = () => {
  sign.clear();
 };

 const handleCountryChange = (value) => {
  setCountryCode(value);
 };

 const handleSubmit = async (values) => {
  try {
   const fullPhoneNumber = `${countryCode}${values.phone}`;

   if (!sign || sign.isEmpty()) {
    message.error(t('guestForm.validation.signature'));
    return;
   }

   // Get signature data
   let signatureUrl = '';
   if (sign) {
    const signatureData = sign.toDataURL();
    try {
     signatureUrl = await uploadSignature(
      signatureData,
      values.firstname,
      values.lastname
     );
    } catch (uploadError) {
     message.error(t('error.submit'));
     return;
    }
   }

   // Fetch the existing contract using getContractByHash from our hook
   const existingContract = await getContractByHash(hash);

   if (!existingContract) {
    message.error(t('guestForm.error.contractNotFound'));
    return;
   }

   // Prepare contract data
   const contractData = {
    firstname: values.firstname,
    lastname: values.lastname,
    middlename: values.middlename,
    birthDate: values.birthDate,
    sex: values.sex,
    nationality: values.Nationality,
    email: values.email,
    phone: fullPhoneNumber,
    residenceCountry: values.residenceCountry,
    residenceCity: values.residenceCity,
    residenceAddress: values.residenceAddress,
    residencePostalCode: values.residencePostalCode,
    documentType: values.documentType,
    documentNumber: values.documentNumber,
    documentIssueDate: values.documentIssueDate,
    status: 'SIGNED',
    signatureImageUrl: signatureUrl,
   };
   const response = await updateContract(existingContract.id, contractData);

   // Also update the reservation status to confirmed if needed
   if (reservation?.id) {
    await updateReservationStatus(reservation.id, 'signed');
   }

   setIsSuccessModalOpen(true);
  } catch (err) {
   message.error(t('error.submit'));
   console.error('Error submitting form:', err);
  }
 };

 const renderDocumentSection = () => (
  <>
   <Col xs={24} md={12}>
    <Form.Item
     label={t('guestForm.identity.documentType.label')}
     name="documentType"
     rules={[
      {
       required: true,
       message: t('guestForm.validation.documentType'),
      },
     ]}
    >
     <Select
      placeholder={
       selectedNationality
        ? t('guestForm.identity.documentType.placeholder')
        : t('guestForm.identity.documentType.nationalityFirst')
      }
      disabled={!selectedNationality}
      options={
       selectedNationality === 'Morocco'
        ? getMoroccanDocumentTypes()
        : selectedNationality
        ? getForeignerDocumentTypes()
        : []
      }
     />
    </Form.Item>
   </Col>

   <Col xs={24} md={12}>
    <Form.Item
     label={t('guestForm.identity.documentNumber')}
     name="documentNumber"
     rules={[
      {
       required: true,
       message: t('guestForm.validation.documentNumber'),
      },
     ]}
    >
     <Input />
    </Form.Item>
   </Col>

   <Col xs={24} md={12}>
    <Form.Item
     label={
      <Tooltip title={t('guestForm.identity.issueDate.tooltip')}>
       {t('guestForm.identity.issueDate.label')}{' '}
       <QuestionCircleOutlined className="PrimaryColor" />
      </Tooltip>
     }
     name="documentIssueDate"
     rules={[
      {
       required: true,
       message: t('guestForm.validation.issueDate'),
      },
     ]}
    >
     <DatePicker
      style={{ width: '100%' }}
      disabledDate={(current) => {
       // Disable future dates - documents are issued in the past
       return current && current.isAfter(dayjs().endOf('day'));
      }}
      placeholder={t('guestForm.validation.placeholder')}
     />
    </Form.Item>
   </Col>
  </>
 );

 if (!reservation) {
  return (
   <div className="loading">
    <Spin size="large" />
   </div>
  );
 }

 return (
  <Layout className="contentStyle">
   <Layout className="container">
    <Flex gap="middle" align="start" justify="space-between">
     <Button
      type="link"
      icon={<ArrowLeftOutlined />}
      onClick={() => navigate(-1)}
     >
      {t('button.back')}
     </Button>
    </Flex>

    <Row>
     <Col xs={24} md={24}>
      <div className="container-fluid">
       <Title level={2}>{t('guestForm.title')}</Title>

       <Form
        form={form}
        layout="vertical"
        size="large"
        className="hide-required-mark"
        onFinish={handleSubmit}
       >
        <Row gutter={[24, 24]}>
         <Col xs={24} md={14}>
          <Divider orientation="left">
           {t('guestForm.personalData.title')}{' '}
           <i
            className="PrimaryColor fa-regular fa-square-question fa-lg"
            style={{ cursor: 'pointer' }}
            onClick={() => setIsperDataModalOpen(true)}
           />
          </Divider>
          <Row gutter={[16, 0]}>
           <Col xs={24} md={12}>
            <Form.Item
             label={t('guestForm.personalData.firstName')}
             name="firstname"
             rules={[
              {
               required: true,
               message: t('guestForm.validation.firstName'),
              },
             ]}
            >
             <Input />
            </Form.Item>
           </Col>

           <Col xs={24} md={12}>
            <Form.Item
             label={t('guestForm.personalData.lastName')}
             name="lastname"
             rules={[
              {
               required: true,
               message: t('guestForm.validation.lastName'),
              },
             ]}
            >
             <Input />
            </Form.Item>
           </Col>

           <Col xs={24} md={12}>
            <Form.Item
             label={t('guestForm.personalData.middleName')}
             name="middlename"
            >
             <Input />
            </Form.Item>
           </Col>

           <Col xs={24} md={12}>
            <Form.Item
             label={t('guestForm.personalData.birthDate')}
             name="birthDate"
             rules={[
              {
               required: true,
               message: t('guestForm.validation.birthDate'),
              },
             ]}
            >
             <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) => {
               // Disable dates that are less than 18 years ago
               const eighteenYearsAgo = new Date();
               eighteenYearsAgo.setFullYear(
                eighteenYearsAgo.getFullYear() - 18
               );
               return current && current.isAfter(eighteenYearsAgo);
              }}
              defaultPickerValue={(() => {
               // Set default picker to show 25 years ago
               const defaultDate = new Date();
               defaultDate.setFullYear(defaultDate.getFullYear() - 25);
               return dayjs(defaultDate);
              })()}
              placeholder={t('guestForm.validation.birthDatePlaceholder')}
             />
            </Form.Item>
           </Col>

           <Col xs={24} md={12}>
            <Form.Item
             label={t('guestForm.personalData.sex.label')}
             name="sex"
             rules={[
              {
               required: true,
               message: t('guestForm.validation.sex'),
              },
             ]}
            >
             <Select>
              <Select.Option value="MALE">
               {t('guestForm.personalData.sex.male')}
              </Select.Option>
              <Select.Option value="FEMALE">
               {t('guestForm.personalData.sex.female')}
              </Select.Option>
             </Select>
            </Form.Item>
           </Col>

           <Col xs={24} md={12}>
            <Form.Item
             label={t('guestForm.personalData.nationality')}
             name="Nationality"
             rules={[
              {
               required: true,
               message: t('guestForm.validation.nationality'),
              },
             ]}
            >
             <Select
              showSearch
              placeholder={t('guestForm.personalData.nationality')}
              optionFilterProp="children"
              filterOption={filterOption}
              options={Nationalities}
              onChange={handleNationalityChange}
             />
            </Form.Item>
           </Col>

           <Col xs={24} md={12}>
            <Form.Item
             label={t('guestForm.personalData.residenceCountry')}
             name="residenceCountry"
             rules={[
              {
               required: true,
               message: t('guestForm.validation.residenceCountry'),
              },
             ]}
            >
             <Input />
            </Form.Item>
           </Col>

           <Col xs={24} md={12}>
            <Form.Item
             label={t('guestForm.personalData.residenceCity')}
             name="residenceCity"
             rules={[
              {
               required: true,
               message: t('guestForm.validation.residenceCity'),
              },
             ]}
            >
             <Input />
            </Form.Item>
           </Col>

           <Col xs={24} md={12}>
            <Form.Item
             label={t('guestForm.personalData.residenceAddress')}
             name="residenceAddress"
             rules={[
              {
               required: true,
               message: t('guestForm.validation.residenceAddress'),
              },
             ]}
            >
             <Input />
            </Form.Item>
           </Col>

           <Col xs={24} md={12}>
            <Form.Item
             label={t('guestForm.personalData.postalCode')}
             name="residencePostalCode"
             rules={[
              {
               required: true,
               message: t('guestForm.validation.postalCode'),
              },
             ]}
            >
             <InputNumber
              style={{ width: '100%' }}
              controls={false}
              maxLength={5}
              min={0}
              parser={(value) => {
               // Remove any non-digit characters and limit to 5 digits
               return value.replace(/\D/g, '').slice(0, 5);
              }}
              formatter={(value) => {
               // Format to ensure only numbers
               return value.replace(/\D/g, '');
              }}
             />
            </Form.Item>
           </Col>
          </Row>

          <br />
          <Divider orientation="left">{t('guestForm.identity.title')}</Divider>
          <Row gutter={[16, 4]}>{renderDocumentSection()}</Row>

          <Divider orientation="left">{t('guestForm.contact.title')}</Divider>
          <Row gutter={[16, 0]}>
           <Col xs={24} md={12}>
            <Form.Item
             label={t('guestForm.contact.email')}
             name="email"
             rules={[
              {
               type: 'email',
               required: true,
               message: t('guestForm.validation.email'),
              },
             ]}
            >
             <Input />
            </Form.Item>
           </Col>

           <Col xs={24} md={12}>
            <Form.Item
             label={t('guestForm.contact.phone')}
             name="phone"
             rules={[
              {
               required: true,
               message: t('guestForm.validation.phone'),
              },
             ]}
            >
             <InputNumber
              type="number"
              addonBefore={
               <Select
                value={countryCode}
                style={{ width: 160 }}
                onChange={handleCountryChange}
               >
                {countries.map((country) => (
                 <Option key={country.code} value={country.dialCode}>
                  {`${country.name} ${country.dialCode}`}
                 </Option>
                ))}
               </Select>
              }
              style={{ width: '100%' }}
              controls={false}
             />
            </Form.Item>
           </Col>
          </Row>
         </Col>

         <Col xs={24} md={10}>
          <Divider orientation="left">{t('guestForm.signature.title')}</Divider>
          <Col xs={24} md={24}>
           <div
            style={{
             border: '1px solid #d9d9d9',
             backgroundColor: '#F8F7FE',
             marginTop: 12,
             marginBottom: 16,
             position: 'relative',
             minHeight: 160,
            }}
           >
            <Button
             type="link"
             shape="circle"
             icon={<SyncOutlined />}
             onClick={handleClear}
             style={{ position: 'absolute', top: 0, right: 0 }}
            />
            <SignatureCanvas
             canvasProps={{ className: 'sigCanvas' }}
             ref={(data) => setSign(data)}
            />
           </div>
          </Col>

          <Col xs={24} md={24}>
           <br />
           <br />
           <Paragraph>
            {t('guestForm.signature.policy')}{' '}
            <Link onClick={() => setIsPrivacyModalOpen(true)}>
             {t('guestForm.signature.privacyLink')}
            </Link>
           </Paragraph>
           <br />
          </Col>
          <Col xs={24}>
           <Form.Item>
            <Button
             style={{ width: '100%' }}
             size="large"
             type="primary"
             htmlType="submit"
             loading={loading}
             disabled={loading}
            >
             {t('guestForm.signature.button')}
            </Button>
           </Form.Item>
          </Col>
         </Col>
        </Row>
       </Form>
      </div>
     </Col>
    </Row>
   </Layout>
   <Foot />
   <Modal
    title={t('guestForm.infoModal.title')}
    open={isperDataModalOpen}
    onCancel={() => setIsperDataModalOpen(false)}
    footer={null}
   >
    <Paragraph>{t('guestForm.infoModal.content1')}</Paragraph>
    <Paragraph>{t('guestForm.infoModal.content2')}</Paragraph>
    <Paragraph>{t('guestForm.infoModal.content3')}</Paragraph>
    <Link onClick={() => perDataPrivacyLink()} target="_blank">
     {t('guestForm.signature.privacyLink')}
    </Link>
   </Modal>
   <Modal
    open={isSuccessModalOpen}
    footer={null}
    closable={false}
    width={500}
    centered
   >
    <Result
     status="success"
     title={t('guestForm.success.title')}
     subTitle={
      <div style={{ textAlign: 'center' }}>
       <p>{t('guestForm.success.subtitle1')}</p>
       <p>{t('guestForm.success.subtitle2')}</p>
      </div>
     }
     extra={[
      <Space align="center">
       <Button
        type="primary"
        key="home"
        onClick={() => navigate(-1)}
        size="large"
       >
        {t('guestForm.backCheckIn')}
       </Button>
      </Space>,
     ]}
    />
   </Modal>

   <Modal
    title={t('guestForm.contractTerms.title')}
    open={isPrivacyModalOpen}
    onCancel={() => setIsPrivacyModalOpen(false)}
    onOk={() => setIsPrivacyModalOpen(false)}
    cancelText={null}
    width={800}
   >
    <div className="privacy-policy" style={{ whiteSpace: 'pre-line' }}>
     <Title level={4}>{t('guestForm.contractTerms.contract.title')}</Title>
     <Paragraph>{t('guestForm.contractTerms.contract.content')}</Paragraph>

     <Title level={4}>{t('guestForm.contractTerms.arrival.title')}</Title>
     <ul>
      <li>{t('guestForm.contractTerms.arrival.guestNotify')}</li>
      <li>{t('guestForm.contractTerms.arrival.departure')}</li>
     </ul>

     <Title level={4}>{t('guestForm.contractTerms.behavior.title')}</Title>
     <ul>
      <li>{t('guestForm.contractTerms.behavior.noise')}</li>
      <li>{t('guestForm.contractTerms.behavior.care')}</li>
      <li>{t('guestForm.contractTerms.behavior.smoking')}</li>
      <li>{t('guestForm.contractTerms.behavior.pets')}</li>
     </ul>

     <Title level={4}>{t('guestForm.contractTerms.facilities.title')}</Title>
     <ul>
      <li>{t('guestForm.contractTerms.facilities.usage')}</li>
      <li>{t('guestForm.contractTerms.facilities.responsibility')}</li>
     </ul>

     <Title level={4}>{t('guestForm.contractTerms.cleanliness.title')}</Title>
     <ul>
      <li>{t('guestForm.contractTerms.cleanliness.maintain')}</li>
      <li>{t('guestForm.contractTerms.cleanliness.service')}</li>
     </ul>

     <Title level={4}>{t('guestForm.contractTerms.security.title')}</Title>
     <ul>
      <li>{t('guestForm.contractTerms.security.lock')}</li>
      <li>{t('guestForm.contractTerms.security.emergency')}</li>
     </ul>

     <Title level={4}>{t('guestForm.contractTerms.morocco.title')}</Title>
     <ul>
      <li>{t('guestForm.contractTerms.morocco.laws')}</li>
      <li>{t('guestForm.contractTerms.morocco.consequences')}</li>
     </ul>

     <Title level={4}>{t('guestForm.contractTerms.internet.title')}</Title>
     <ul>
      <li>{t('guestForm.contractTerms.internet.content')}</li>
     </ul>

     <Title level={4}>{t('guestForm.contractTerms.disputes.title')}</Title>
     <ul>
      <li>{t('guestForm.contractTerms.disputes.content')}</li>
     </ul>

     <Title level={4}>{t('guestForm.contractTerms.cancellation.title')}</Title>
     <ul>
      <li>{t('guestForm.contractTerms.cancellation.content')}</li>
     </ul>

     <Title level={4}>{t('guestForm.contractTerms.unauthorized.title')}</Title>
     <ul>
      <li>{t('guestForm.contractTerms.unauthorized.content')}</li>
     </ul>

     <Title level={4}>{t('guestForm.contractTerms.signature.title')}</Title>
     <Paragraph>{t('guestForm.contractTerms.signature.content')}</Paragraph>
    </div>
   </Modal>
  </Layout>
 );
};

export default Guestform;
