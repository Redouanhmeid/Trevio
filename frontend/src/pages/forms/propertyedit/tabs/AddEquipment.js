import React, { useState, useEffect } from 'react';
import {
 Form,
 Input,
 Button,
 Radio,
 Upload,
 Image,
 Space,
 Typography,
 Row,
 Col,
 message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import ReactPlayer from 'react-player';
import useEquipement from '../../../../hooks/useEquipement';
import useUploadPhotos from '../../../../hooks/useUploadPhotos';
import { useTranslation } from '../../../../context/TranslationContext';

const { Text } = Typography;
const { TextArea } = Input;

const getBase64 = (file) =>
 new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
 });

const AddEquipment = ({ equipmentName, propertyId, onSuccess, onCancel }) => {
 const { t } = useTranslation();
 const [form] = Form.useForm();
 const { uploadEquipement } = useUploadPhotos();
 const { loading, error, postEquipement } = useEquipement();

 const [mediaType, setMediaType] = useState('Photo');
 const [videoUrl, setVideoUrl] = useState('');
 const [previewOpen, setPreviewOpen] = useState(false);
 const [previewImage, setPreviewImage] = useState('');
 const [fileList, setFileList] = useState([]);
 const [submitting, setSubmitting] = useState(false);

 // Equipment display name
 const equipmentDisplayName = t(`equipement.${equipmentName}`) || equipmentName;

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

 const onChangeMediaType = (e) => {
  setMediaType(e.target.value);
  form.setFieldsValue({ media: '' });
  setVideoUrl('');
 };

 const uploadButton = (
  <div>
   <PlusOutlined />
   <div style={{ marginTop: 8 }}>{t('photo.upload')}</div>
  </div>
 );

 const onFinish = async (values) => {
  if (submitting) return;

  setSubmitting(true);
  try {
   // Set default values
   values.name = equipmentName;
   values.propertyId = propertyId;
   values.media = videoUrl;

   // Handle photo upload
   if (mediaType === 'Photo' && fileList.length > 0) {
    const photoUrl = await uploadEquipement(fileList);
    values.media = photoUrl;
   }

   // Create the equipment
   await postEquipement(values);

   if (!error) {
    message.success(t('equipment.createSuccess'));
    // Call the onSuccess callback to refresh the parent component
    if (typeof onSuccess === 'function') {
     onSuccess();
    }
   } else {
    message.error(error || t('equipment.createError'));
   }
  } catch (err) {
   console.error('Error creating equipment card:', err);
   message.error(t('equipment.createError'));
  } finally {
   setSubmitting(false);
  }
 };

 return (
  <Form form={form} layout="vertical" onFinish={onFinish}>
   <Typography.Title level={4}>
    {t('equipment.addCard')} {equipmentDisplayName}
   </Typography.Title>

   <Row gutter={[16, 16]}>
    <Col xs={24}>
     <Form.Item>
      <Radio.Group
       defaultValue="Photo"
       onChange={onChangeMediaType}
       value={mediaType}
      >
       <Radio.Button value="Photo">{t('common.photo')}</Radio.Button>
       <Radio.Button value="Video">{t('common.video')}</Radio.Button>
      </Radio.Group>
     </Form.Item>
    </Col>

    <Col xs={24}>
     {mediaType === 'Photo' ? (
      <Form.Item label={t('equipement.mediaUrl')} name="media">
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
     ) : (
      <Form.Item
       label={
        <>
         <Text>
          {t('equipement.videoUrlLabel')}
          <br />
          <Text type="secondary">{t('equipement.videoUrlHint')}</Text>
         </Text>
        </>
       }
       name="media"
      >
       <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
      </Form.Item>
     )}

     {mediaType === 'Video' && videoUrl && (
      <div style={{ marginBottom: 16 }}>
       <ReactPlayer url={videoUrl} controls={true} width="100%" height={200} />
      </div>
     )}
    </Col>

    <Col xs={24}>
     <Form.Item label={t('equipment.guestMessage')} name="description">
      <TextArea rows={4} showCount maxLength={500} />
     </Form.Item>
    </Col>

    {equipmentName === 'wifi' && (
     <>
      <Col xs={24} md={12}>
       <Form.Item label={t('equipment.wifiName')} name="wifiName">
        <Input />
       </Form.Item>
      </Col>
      <Col xs={24} md={12}>
       <Form.Item label={t('equipment.wifiPassword')} name="wifiPassword">
        <Input />
       </Form.Item>
      </Col>
     </>
    )}
   </Row>

   {previewOpen && (
    <Image
     style={{ display: 'none' }}
     preview={{
      visible: previewOpen,
      onVisibleChange: (visible) => setPreviewOpen(visible),
      afterOpenChange: (visible) => !visible && setPreviewImage(''),
     }}
     src={previewImage}
    />
   )}

   <Form.Item>
    <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
     <Button onClick={onCancel}>{t('common.cancel')}</Button>
     <Button type="primary" htmlType="submit" loading={loading || submitting}>
      {t('common.save')}
     </Button>
    </Space>
   </Form.Item>
  </Form>
 );
};

export default AddEquipment;
