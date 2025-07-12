import React, { useCallback, useState, useEffect } from 'react';
import {
 Layout,
 Row,
 Col,
 Typography,
 Form,
 Input,
 InputNumber,
 Select,
 Button,
 Divider,
 Upload,
 Modal,
 Flex,
 Space,
 Card,
 QRCode,
 Spin,
 message,
 Image,
 Grid,
} from 'antd';
import {
 DownloadOutlined,
 CopyOutlined,
 ShareAltOutlined,
 PlusOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Head from '../../components/common/header';
import Foot from '../../components/common/footer';
import Changepassword from './sign/changepassword';
import Logo from '../../assets/logo-icon.png';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useUserData } from '../../hooks/useUserData';
import ImgCrop from 'antd-img-crop';
import useUploadPhotos from '../../hooks/useUploadPhotos';
import { countries } from '../../utils/countries';
import ShareModal from '../../components/common/ShareModal';
import { useTranslation } from '../../context/TranslationContext';

const { Title, Text } = Typography;
const { Content } = Layout;
const { Option } = Select;

const getBase64 = (file) =>
 new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
 });

const normFile = (e: any) => {
 if (Array.isArray(e)) {
  return e;
 }
 return e?.fileList;
};

const downloadQRCode = () => {
 const canvas = document.getElementById('qrcode')?.querySelector('canvas');
 if (canvas) {
  const url = canvas.toDataURL();
  const a = document.createElement('a');
  a.download = `conciergestayqrcode.png`;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
 }
};

const Account = () => {
 const { t } = useTranslation();
 const [form] = Form.useForm();
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();
 const { user } = useAuthContext();
 const {
  isLoading,
  userData,
  getUserData,
  updateUser,
  updateAvatar,
  success,
  error,
 } = useUserData();
 const { uploadAvatar, uploading } = useUploadPhotos();
 const currentUser = user || JSON.parse(localStorage.getItem('user'));
 // State declarations
 const [loading, setLoading] = useState(true);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [previewOpen, setPreviewOpen] = useState(false);
 const [previewImage, setPreviewImage] = useState('');
 const [fileList, setFileList] = useState([]);
 const [isShareModalVisible, setIsShareModalVisible] = useState(false);
 const [countryCode, setCountryCode] = useState(
  countries.find((country) => country.name === 'Morocco').dialCode
 ); // Default to first country

 const pageUrl = window.location.href;

 useEffect(() => {
  const initializeUserData = async () => {
   if (currentUser?.email) {
    await getUserData(currentUser.email);
    setLoading(false);
   }
  };
  initializeUserData();
 }, [currentUser?.email]);

 // Update form values when userData changes
 useEffect(() => {
  if (userData && form) {
   const fullPhone = userData?.phone || '';
   const phoneWithoutCountryCode = fullPhone.startsWith(countryCode)
    ? fullPhone.slice(countryCode.length)
    : fullPhone;

   form.setFieldsValue({
    lastname: userData.lastname,
    firstname: userData.firstname,
    phone: phoneWithoutCountryCode,
   });

   // Only set fileList for non-Google avatars
   if (userData?.avatar && !userData.avatar.includes('googleusercontent.com')) {
    setFileList([
     {
      uid: '1',
      name: 'avatar.jpg',
      status: 'done',
      url: userData.avatar,
     },
    ]);
   }
  }
 }, [userData?.email, form]);

 // Handle success and error messages
 useEffect(() => {
  if (success) message.success(t('account.passwordUpdateSuccess'));
  if (error) message.warning(t('account.updateError'));
 }, [success, error, t]);

 const urlToFile = async (url, filename) => {
  try {
   const response = await fetch(url);
   const blob = await response.blob();
   return new File([blob], filename, { type: blob.type });
  } catch (error) {
   console.error('Error converting URL to File:', error);
   return null;
  }
 };

 const showPWDModal = () => {
  setIsModalOpen(true);
 };
 const handlePWDCancel = () => {
  setIsModalOpen(false);
 };

 const showShareModal = () => {
  setIsShareModalVisible(true);
 };

 const hideShareModal = () => {
  setIsShareModalVisible(false);
 };

 const onFinish = (values) => {
  const fullPhoneNumber = `${countryCode}${values.phone}`;
  updateUser(userData.id, values.firstname, values.lastname, fullPhoneNumber);
 };

 const handlePreview = async (file) => {
  if (!file.url && !file.preview) {
   file.preview = await getBase64(file.originFileObj);
  }
  setPreviewImage(file.url || file.preview);
  setPreviewOpen(true);
 };

 const handleChange = ({ fileList: newFileList }) => {
  setFileList(newFileList);
 };

 const onAvatarChange = async () => {
  const AvatarUrl = await uploadAvatar(fileList);
  updateAvatar(userData.id, AvatarUrl);
 };

 const handleCountryChange = (value) => {
  setCountryCode(value);
 };

 const initializeUserData = async () => {
  if (currentUser?.email) {
   await getUserData(currentUser.email);
   setLoading(false);
  }
 };

 const uploadButton = (
  <button
   style={{
    border: 0,
    background: 'none',
   }}
   type="button"
  >
   <PlusOutlined />
   <div
    style={{
     marginTop: 8,
    }}
   >
    <div style={{ marginTop: 8 }}>{t('common.upload')}</div>
   </div>
  </button>
 );

 if (loading) {
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
    <Row gutter={[16, 16]}>
     <Col xs={24} sm={14}>
      <Title level={2}>{t('account.manage')}</Title>
      <Text>{t('account.privacy')}</Text>
      <br />
      <Text>{t('account.hostCard')}</Text>
      <br />
      <Divider />
      <Form
       name="account"
       form={form}
       labelCol={{ xs: 24, sm: 4 }}
       wrapperCol={{ xs: 24, sm: 20 }}
       onFinish={onFinish}
       labelAlign="left"
       size="large"
      >
       <Form.Item name="lastname" label={t('account.lastName')}>
        <Input />
       </Form.Item>
       <Form.Item name="firstname" label={t('account.firstName')}>
        <Input />
       </Form.Item>
       <Form.Item name="phone" label={t('account.phone')}>
        <InputNumber
         type="number"
         addonBefore={
          <Select
           value={countryCode}
           style={{ width: 140 }}
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
       <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading}>
         {t('account.updateProfile')}
        </Button>
       </Form.Item>
      </Form>
      <Divider />
      <Form name="avatar" onFinish={onAvatarChange} layout="vertical">
       <Row gutter={[24, 0]}>
        <Flex align="center">
         <Col xs={12}>
          <Form.Item name="avatar" label="Avatar">
           <div>
            <ImgCrop rotationSlider>
             <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
             >
              {fileList.length >= 1 ? null : uploadButton}
             </Upload>
            </ImgCrop>
            {previewImage && (
             <Image
              style={{
               width: '100%', // Ensure the image fills the circular area
               height: '100%', // Ensure the image fills the circular area
               objectFit: 'cover', // Crop the image to fit within the circular area
              }}
              wrapperStyle={{
               display: 'none',
              }}
              preview={{
               visible: previewOpen,
               onVisibleChange: (visible) => setPreviewOpen(visible),
               afterOpenChange: (visible) => !visible && setPreviewImage(''),
              }}
              src={previewImage}
             />
            )}
           </div>
          </Form.Item>
         </Col>
         <Col xs={12}>
          <Form.Item>
           <Button type="primary" htmlType="submit" loading={uploading}>
            {t('account.changeAvatar')}
           </Button>
          </Form.Item>
         </Col>
        </Flex>
       </Row>
      </Form>
     </Col>

     <Col xs={24} sm={10}>
      <Flex justify="center" align="center" style={{ height: 'auto' }}>
       <Card title={t('account.quickLinks')} style={{ textAlign: 'center' }}>
        <Space size="small" direction="vertical">
         {/* <p>
          <Link to="/">Gérer l'abonnement</Link>
         </p> */}
         <p>
          <Link onClick={showPWDModal}>{t('account.changePassword')}</Link>
         </p>
         <div id="qrcode">
          <QRCode size={220} value={pageUrl} />
         </div>
         <br />
         <Flex gap="small" wrap="wrap">
          <Button icon={<DownloadOutlined />} onClick={downloadQRCode}>
           {t('common.download')}
          </Button>
          <Button
           type="link"
           icon={<CopyOutlined />}
           onClick={() => {
            navigator.clipboard.writeText(pageUrl);
           }}
          />
          <Button
           type="link"
           icon={<ShareAltOutlined />}
           onClick={showShareModal}
          />
         </Flex>
        </Space>
       </Card>

       <Modal
        title={t('account.changePassword')}
        open={isModalOpen}
        onCancel={handlePWDCancel}
        footer={null}
       >
        <Changepassword Id={userData.id} />
       </Modal>
      </Flex>
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

export default Account;
