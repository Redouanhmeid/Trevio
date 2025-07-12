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
 Popconfirm,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
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

const EditEquipment = ({ equipment, onSuccess, onCancel }) => {
 const { t } = useTranslation();
 const [form] = Form.useForm();
 const { uploadEquipement } = useUploadPhotos();
 const { loading, error, updateEquipement, deleteEquipement } = useEquipement();

 const [mediaType, setMediaType] = useState(
  ReactPlayer.canPlay(equipment?.media) ? 'Video' : 'Photo'
 );
 const [videoUrl, setVideoUrl] = useState(
  ReactPlayer.canPlay(equipment?.media) ? equipment?.media : ''
 );
 const [previewOpen, setPreviewOpen] = useState(false);
 const [previewImage, setPreviewImage] = useState('');
 const [fileList, setFileList] = useState([]);
 const [submitting, setSubmitting] = useState(false);

 // Set initial form values
 useEffect(() => {
  if (equipment) {
   form.setFieldsValue({
    description: equipment.description,
    wifiName: equipment.wifiName,
    wifiPassword: equipment.wifiPassword,
   });

   if (!ReactPlayer.canPlay(equipment.media) && equipment.media) {
    setFileList([
     { uid: '-1', name: 'image.jpg', status: 'done', url: equipment.media },
    ]);
   }
  }
 }, [equipment, form]);

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
  // Only reset if switching from video to photo
  if (e.target.value === 'Photo') {
   setVideoUrl('');
  }
  // Only reset if switching from photo to video
  if (e.target.value === 'Video') {
   setFileList([]);
  }
 };

 const uploadButton = (
  <div>
   <PlusOutlined />
   <div style={{ marginTop: 8 }}>{t('photo.upload')}</div>
  </div>
 );

 const handleDelete = async () => {
  try {
   await deleteEquipement(equipment.id);
   message.success(t('equipment.deleteSuccess'));
   if (typeof onSuccess === 'function') {
    onSuccess();
   }
  } catch (err) {
   console.error('Error deleting equipment:', err);
   message.error(t('equipment.deleteError'));
  }
 };

 const onFinish = async (values) => {
  if (submitting) return;

  setSubmitting(true);
  try {
   let mediaUrl = equipment.media;

   // Handle media updates
   if (mediaType === 'Video') {
    mediaUrl = videoUrl;
   } else if (mediaType === 'Photo' && fileList.length > 0) {
    const currentFile = fileList[0];
    if (currentFile.url && currentFile.url.startsWith('/equipements')) {
     // Existing file from server
     mediaUrl = currentFile.url;
    } else if (currentFile.originFileObj) {
     // New file to upload
     mediaUrl = await uploadEquipement(fileList);
    }
   }

   // Prepare update data
   const updateData = {
    id: equipment.id,
    name: equipment.name,
    description: values.description,
    media: mediaUrl,
    propertyId: equipment.propertyId,
    ...(equipment.name === 'wifi' && {
     wifiName: values.wifiName,
     wifiPassword: values.wifiPassword,
    }),
   };
   // Update the equipment
   await updateEquipement(updateData);

   message.success(t('equipment.updateSuccess'));

   // Call the onSuccess callback to refresh the parent component
   if (typeof onSuccess === 'function') {
    onSuccess();
   }
  } catch (err) {
   console.error('Error updating equipment card:', err);
   message.error(t('equipment.updateError'));
  } finally {
   setSubmitting(false);
  }
 };

 return (
  <Form
   form={form}
   layout="vertical"
   onFinish={onFinish}
   initialValues={{
    description: equipment?.description,
    wifiName: equipment?.wifiName,
    wifiPassword: equipment?.wifiPassword,
   }}
  >
   <div
    style={{
     display: 'flex',
     justifyContent: 'space-between',
     alignItems: 'center',
     marginBottom: 16,
    }}
   >
    <Typography.Title level={4}>
     {t('equipment.editCardFor')} {t(`equipement.${equipment?.name}`)}
    </Typography.Title>

    <Popconfirm
     title={t('equipment.confirmDelete')}
     onConfirm={handleDelete}
     okText={t('equipment.confirmYes')}
     cancelText={t('equipment.confirmNo')}
    >
     <Button danger icon={<DeleteOutlined />}>
      {t('common.delete')}
     </Button>
    </Popconfirm>
   </div>

   <Row gutter={[16, 16]}>
    <Col xs={24}>
     <Form.Item label={t('equipment.mediaType')}>
      <Radio.Group onChange={onChangeMediaType} value={mediaType}>
       <Radio.Button value="Photo">{t('common.photo')}</Radio.Button>
       <Radio.Button value="Video">{t('common.video')}</Radio.Button>
      </Radio.Group>
     </Form.Item>
    </Col>

    <Col xs={24}>
     {mediaType === 'Photo' ? (
      <Form.Item label={t('equipment.mediaUrl')} name="media">
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
          {t('equipment.videoUrlLabel')}
          <br />
          <Text type="secondary">{t('equipment.videoUrlHint')}</Text>
         </Text>
        </>
       }
       name="media"
      >
       <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
      </Form.Item>
     )}

     {mediaType === 'Video' && (videoUrl || equipment?.media) && (
      <div style={{ marginBottom: 16 }}>
       <ReactPlayer
        url={videoUrl || equipment?.media}
        controls={true}
        width="100%"
        height={200}
       />
      </div>
     )}
    </Col>

    <Col xs={24}>
     <Form.Item label={t('equipment.guestMessage')} name="description">
      <TextArea rows={4} showCount maxLength={500} />
     </Form.Item>
    </Col>

    {equipment?.name === 'wifi' && (
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

export default EditEquipment;
