import React, { useState, useEffect } from 'react';
import {
 Row,
 Col,
 Form,
 Input,
 Button,
 Typography,
 Checkbox,
 message,
 Card,
 Alert,
 Spin,
 Upload,
 Image,
 Space,
 TimePicker,
} from 'antd';
import { SaveOutlined, PlusOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import ReactPlayer from 'react-player';
import dayjs from 'dayjs';
import { useTranslation } from '../../../../context/TranslationContext';
import useUpdateProperty from '../../../../hooks/useUpdateProperty';
import useUploadPhotos from '../../../../hooks/useUploadPhotos';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Default check-in time
const DEFAULT_CHECK_IN_TIME = dayjs().hour(14).minute(0); // 2:00 PM

const getBase64 = (file) =>
 new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
 });

const PropertyCheckIn = ({ property, propertyId, onPropertyUpdated }) => {
 const { t } = useTranslation();
 const [form] = Form.useForm();
 const { updatePropertyCheckIn, isLoading, success } =
  useUpdateProperty(propertyId);
 const { uploadFrontPhoto } = useUploadPhotos();

 const [saving, setSaving] = useState(false);
 const [successMessage, setSuccessMessage] = useState('');

 // Check-in state
 const [checkInTime, setCheckInTime] = useState(null);
 const [videoURL, setVideoURL] = useState('');
 const [frontPhotoList, setFrontPhotoList] = useState([]);
 const [previewFrontOpen, setPreviewFrontOpen] = useState(false);
 const [previewFrontImage, setPreviewFrontImage] = useState('');

 // Parse property values safely
 const parseArrayProperty = (propValue) => {
  if (typeof propValue === 'string') {
   try {
    return JSON.parse(propValue);
   } catch (e) {
    console.warn('Failed to parse property value:', propValue);
    return [];
   }
  }
  return Array.isArray(propValue) ? propValue : [];
 };

 // Set initial form values from property - only run when property ID changes
 useEffect(() => {
  if (property) {
   const formattedCheckInTime = property.checkInTime
    ? dayjs(property.checkInTime)
    : DEFAULT_CHECK_IN_TIME;

   // Initialize form values
   form.setFieldsValue({
    // Check-in values
    checkInTime: formattedCheckInTime,
    earlyCheckIn: parseArrayProperty(property.earlyCheckIn),
    accessToProperty: parseArrayProperty(property.accessToProperty),
    guestAccessInfo: property.guestAccessInfo || '',
    videoCheckIn: property.videoCheckIn || '',
   });

   // Set state values
   setCheckInTime(formattedCheckInTime);
   setVideoURL(property.videoCheckIn || '');

   // Set front photo
   if (property.frontPhoto) {
    setFrontPhotoList([
     {
      uid: 'front-1',
      name: property.frontPhoto.substring(
       property.frontPhoto.lastIndexOf('/') + 1
      ),
      status: 'done',
      url: property.frontPhoto,
     },
    ]);
   }
  }
 }, [property?.id]); // Only re-run when property ID changes

 // Handle front photo preview
 const handleFrontPreview = async (file) => {
  if (!file.url && !file.preview) {
   file.preview = await getBase64(file.originFileObj);
  }
  setPreviewFrontImage(file.url || file.preview);
  setPreviewFrontOpen(true);
 };

 // Handle front photo changes
 const handleFrontChange = ({ fileList: newFileList }) => {
  setFrontPhotoList(newFileList);
 };

 // Handle form submission - Check-in
 const handleSubmit = async () => {
  setSaving(true);
  try {
   const values = await form.validateFields([
    'checkInTime',
    'earlyCheckIn',
    'accessToProperty',
    'guestAccessInfo',
    'videoCheckIn',
   ]);

   // Handle front photo upload if needed
   if (frontPhotoList.length > 0) {
    const frontPhotoWithOriginFileObj = frontPhotoList.filter(
     (file) => file.originFileObj
    );
    if (frontPhotoWithOriginFileObj.length > 0) {
     const frontPhotoUrl = await uploadFrontPhoto(frontPhotoWithOriginFileObj);
     values.frontPhoto = frontPhotoUrl;
    } else if (frontPhotoList[0].url) {
     values.frontPhoto = frontPhotoList[0].url;
    }
   }

   await updatePropertyCheckIn(values);
   if (onPropertyUpdated) {
    onPropertyUpdated();
   }
  } catch (error) {
   console.error('Error updating check-in settings:', error);
   message.error(t('messages.updateError'));
  } finally {
   setSaving(false);
  }
 };

 if (!property) {
  return <Spin size="large" />;
 }

 return (
  <Form
   form={form}
   layout="vertical"
   onFinish={handleSubmit}
   initialValues={{
    checkInTime: checkInTime,
   }}
  >
   <Card
    bordered={false}
    title={
     <Title level={4} style={{ margin: 0 }}>
      <i
       className="fa-light fa-arrow-right-to-arc"
       style={{ marginRight: 8 }}
      />
      {t('checkIn.title')}
     </Title>
    }
   >
    <Row gutter={[24, 16]}>
     <Col xs={24} md={12}>
      <Form.Item label={t('checkIn.earliestTime')} name="checkInTime">
       <TimePicker
        format="HH:mm"
        showNow={false}
        size="large"
        value={checkInTime}
        onChange={setCheckInTime}
        style={{ width: '100%' }}
       />
      </Form.Item>
     </Col>

     <Col xs={24}>
      <Form.Item label={t('checkIn.policyTitle')} name="earlyCheckIn">
       <Checkbox.Group>
        <Row>
         <Col xs={24}>
          <Checkbox value="heureNonFlexible">
           {t('checkIn.policyNotFlexible')}
          </Checkbox>
         </Col>
         <Col xs={24}>
          <Checkbox value="ajustementHeure">
           {t('checkIn.policyAdjustTime')}
          </Checkbox>
         </Col>
         <Col xs={24}>
          <Checkbox value="autreHeureArrivee">
           {t('checkIn.policyAlternateTime')}
          </Checkbox>
         </Col>
         <Col xs={24}>
          <Checkbox value="laissezBagages">
           {t('checkIn.policyStoreBags')}
          </Checkbox>
         </Col>
        </Row>
       </Checkbox.Group>
      </Form.Item>
     </Col>

     <Col xs={24}>
      <Form.Item label={t('checkIn.accessTitle')} name="accessToProperty">
       <Checkbox.Group>
        <Row>
         <Col xs={24}>
          <Checkbox value="cleDansBoite">
           {t('checkIn.accessKeyInBox')}
          </Checkbox>
         </Col>
         <Col xs={24}>
          <Checkbox value="acceuilContactezMoi">
           {t('checkIn.accessWelcomeContact')}
          </Checkbox>
         </Col>
         <Col xs={24}>
          <Checkbox value="codesAccesCourriel">
           {t('checkIn.accessCodesByEmail')}
          </Checkbox>
         </Col>
         <Col xs={24}>
          <Checkbox value="verifiezCourriel">
           {t('checkIn.accessCheckEmail')}
          </Checkbox>
         </Col>
         <Col xs={24}>
          <Checkbox value="serrureNumero">
           {t('checkIn.accessNumberLock')}
          </Checkbox>
         </Col>
        </Row>
       </Checkbox.Group>
      </Form.Item>
     </Col>

     <Col xs={24}>
      <Form.Item label={t('checkIn.guestInfo')} name="guestAccessInfo">
       <TextArea showCount maxLength={500} rows={4} />
      </Form.Item>
     </Col>

     <Col xs={24}>
      <Title level={5}>{t('checkIn.frontPhoto')}</Title>
      <div style={{ marginTop: 16 }}>
       <ImgCrop aspect={4 / 3} rotationSlider>
        <Upload
         listType="picture-card"
         fileList={frontPhotoList}
         onPreview={handleFrontPreview}
         onChange={handleFrontChange}
        >
         {frontPhotoList.length >= 1 ? null : (
          <button
           style={{
            border: 0,
            background: 'none',
           }}
           type="button"
          >
           <PlusOutlined />
           <div style={{ marginTop: 8 }}>{t('photo.upload')}</div>
          </button>
         )}
        </Upload>
       </ImgCrop>
       <Image
        style={{ display: 'none' }}
        preview={{
         visible: previewFrontOpen,
         onVisibleChange: (visible) => setPreviewFrontOpen(visible),
         afterOpenChange: (visible) => !visible && setPreviewFrontImage(''),
        }}
        src={previewFrontImage}
       />
      </div>
     </Col>

     <Col xs={24}>
      <Form.Item label={t('checkIn.videoInstructions')} name="videoCheckIn">
       <Input
        placeholder={t('checkIn.hostVideo')}
        value={videoURL}
        onChange={(e) => setVideoURL(e.target.value)}
       />
      </Form.Item>

      {videoURL && (
       <div style={{ marginTop: 16, marginBottom: 16 }}>
        <ReactPlayer
         url={videoURL}
         controls={true}
         width="100%"
         height="240px"
        />
       </div>
      )}
     </Col>
    </Row>
   </Card>

   {/* Submit button */}
   <Form.Item>
    <Space>
     <Button
      type="primary"
      onClick={handleSubmit}
      loading={saving || isLoading}
      icon={<SaveOutlined />}
      size="large"
     >
      {success ? t('messages.updateSuccess') : t('button.save')}
     </Button>
    </Space>
   </Form.Item>
  </Form>
 );
};

export default PropertyCheckIn;
