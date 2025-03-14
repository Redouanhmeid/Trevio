import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
 Spin,
 Layout,
 Row,
 Col,
 Typography,
 Button,
 Form,
 Input,
 Flex,
 Radio,
 Upload,
 Image,
 Popconfirm,
 message,
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import Head from '../../../components/common/header';
import Foot from '../../../components/common/footer';
import ImgCrop from 'antd-img-crop';
import useUploadPhotos from '../../../hooks/useUploadPhotos';
import ReactPlayer from 'react-player';
import useEquipement from '../../../hooks/useEquipement';
import { useTranslation } from '../../../context/TranslationContext';

const { Title, Text } = Typography;
const { Content } = Layout;

const getBase64 = (file) =>
 new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
 });

const EditEquipement = () => {
 const location = useLocation();
 const { id } = location.state;
 const { t } = useTranslation();
 const navigate = useNavigate();
 const { uploadEquipement } = useUploadPhotos();
 const {
  loading,
  error,
  deleteEquipement,
  updateEquipement,
  getOneEquipement,
 } = useEquipement();

 const [form] = Form.useForm();
 const [equipment, setEquipement] = useState('');
 const [mediaType, setMediaType] = useState('Photo');
 const [videoUrl, setVideoUrl] = useState('');
 const [previewOpen, setPreviewOpen] = useState(false);
 const [previewImage, setPreviewImage] = useState('');
 const [fileList, setFileList] = useState([]);
 const [isSubmitting, setIsSubmitting] = useState(false);

 const getEquipement = async (id) => {
  try {
   const data = await getOneEquipement(id);
   setEquipement(data);
  } catch (error) {
   console.error('Error fetching equipment:', error);
  }
 };

 useEffect(() => {
  getEquipement(id);
 }, [id]);

 useEffect(() => {
  if (equipment) {
   form.setFieldsValue({
    name: equipment.name,
    description: equipment.description,
    media: equipment.media,
    wifiName: equipment.wifiName,
    wifiPassword: equipment.wifiPassword,
    mediaType: ReactPlayer.canPlay(equipment.media) ? 'Video' : 'Photo',
   });

   setVideoUrl(equipment.media);
   setMediaType(ReactPlayer.canPlay(equipment.media) ? 'Video' : 'Photo');

   if (!ReactPlayer.canPlay(equipment.media) && equipment.media) {
    setFileList([
     { uid: '-1', name: 'image.jpg', status: 'done', url: equipment.media },
    ]);
   }
  }
 }, [equipment, form]);

 const onChangeMediaType = (e) => {
  setMediaType(e.target.value);
  form.setFieldsValue({ media: '' });
  setVideoUrl('');
  setFileList([]);
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
    {t('photo.upload')}
   </div>
  </button>
 );

 const onFinish = async (values) => {
  if (isSubmitting) return; // Prevent double submission

  setIsSubmitting(true);
  try {
   let mediaUrl = videoUrl;

   if (mediaType === 'Photo' && fileList.length > 0) {
    const currentFile = fileList[0];
    if (currentFile.url && currentFile.url.startsWith('/equipements')) {
     mediaUrl = currentFile.url;
    } else if (currentFile.originFileObj) {
     mediaUrl = await uploadEquipement(fileList);
    }
   }

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

   await updateEquipement(updateData);
   navigate(-1);
  } catch (error) {
   console.error('Error:', error);
  } finally {
   setIsSubmitting(false);
  }
 };

 const confirmDelete = async (id) => {
  await deleteEquipement(id);
  if (!error) {
   message.success(t('equipment.deleteSuccess'));
   navigate(-1);
  } else {
   message.error(`${t('equipment.deleteError')}: ${error.message}`);
  }
 };

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
    <Flex horizontal="true" gap="middle" justify="space-between" align="start">
     <Button
      type="default"
      shape="round"
      icon={<ArrowLeftOutlined />}
      onClick={() => navigate(-1)}
     >
      {t('button.back')}
     </Button>

     <Popconfirm
      title={t('equipment.confirmDelete')}
      onConfirm={() => confirmDelete(equipment.id)}
      okText={t('equipment.confirmYes')}
      cancelText={t('equipment.confirmNo')}
     >
      <Button
       danger
       icon={
        <i
         className="Dashicon fa-light fa-trash"
         style={{ color: 'red' }}
         key="delete"
        />
       }
       type="link"
       shape="circle"
      />
     </Popconfirm>
    </Flex>
    <Row gutter={[16, 16]}>
     <Col xs={24}>
      <Title level={2}>{`${t('equipment.addCard')} ${t(
       'equipment.name'
      )}`}</Title>
      <Form
       name="equipment_form"
       initialValues={{ remember: true }}
       onFinish={onFinish}
       layout="vertical"
       size="large"
       form={form}
       initialValues={{
        mediaType: equipment.media,
       }}
      >
       <Row gutter={[32, 16]}>
        <Col xs={24} md={12}>
         <Flex
          horizontal="true"
          gap="middle"
          justify="center"
          onChange={onChangeMediaType}
         >
          <Form.Item name="mediaType">
           <Radio.Group buttonStyle="solid" size="large">
            <Radio.Button value="Photo">{t('common.photo')}</Radio.Button>
            <Radio.Button value="Video">{t('common.video')}</Radio.Button>
           </Radio.Group>
          </Form.Item>
         </Flex>
         <br />
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
           <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
           />
          </Form.Item>
         )}
         {mediaType === 'Video' &&
          form.getFieldValue(['media']) &&
          form.getFieldValue(['media']).trim() !== '' && (
           <ReactPlayer url={form.getFieldValue(['media'])} controls />
          )}
        </Col>
        <Col
         xs={24}
         md={{
          span: 10,
          offset: 2,
         }}
        >
         <Form.Item label={t('equipment.guestMessage')} name="description">
          <Input.TextArea rows={6} showCount maxLength={500} />
         </Form.Item>
        </Col>
        {equipment.name === 'wifi' && (
         <Col xs={24} md={12}>
          <Row gutter={[16, 0]}>
           <Col xs={24} md={12}>
            <Form.Item label={t('equipment.wifiName')} name="wifiName">
             <Input showCount maxLength={25} />
            </Form.Item>
           </Col>
           <Col xs={24} md={12}>
            <Form.Item label={t('equipment.wifiPassword')} name="wifiPassword">
             <Input showCount maxLength={25} />
            </Form.Item>
           </Col>
          </Row>
         </Col>
        )}
       </Row>
       <Form.Item>
        <br />
        <Row justify="end">
         <Col xs={24} md={6}>
          <Form.Item>
           <Button
            style={{ width: '100%' }}
            type="primary"
            htmlType="submit"
            loading={isSubmitting || loading}
            disabled={isSubmitting}
           >
            {t('button.save')}
           </Button>
          </Form.Item>
         </Col>
        </Row>
       </Form.Item>
      </Form>
     </Col>
    </Row>
   </Content>
   <Foot />
  </Layout>
 );
};

export default EditEquipement;
