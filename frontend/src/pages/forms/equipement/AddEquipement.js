import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
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
 Grid,
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

const AddEquipement = () => {
 const location = useLocation();
 const { equipement, id } = location.state;
 const { t } = useTranslation();
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();
 const navigate = useNavigate();
 const { uploadEquipement } = useUploadPhotos();
 const { loading, error, postEquipement } = useEquipement();

 const [form] = Form.useForm();
 const [name, setName] = useState('');
 const [mediaType, setMediaType] = useState('Photo');
 const [videoUrl, setVideoUrl] = useState('');
 const [previewOpen, setPreviewOpen] = useState(false);
 const [previewImage, setPreviewImage] = useState('');
 const [fileList, setFileList] = useState([]);

 const equipementTitles = {
  shower: t('equipement.shower'),
  jacuzzi: t('equipement.jacuzzi'),
  bathtub: t('equipement.bathtub'),
  washingMachine: t('equipement.washingMachine'),
  dryerheat: t('equipement.dryerheat'),
  vacuum: t('equipement.vacuum'),
  vault: t('equipement.vault'),
  babybed: t('equipement.babybed'),
  television: t('equipement.television'),
  speaker: t('equipement.speaker'),
  gameconsole: t('equipement.gameconsole'),
  oven: t('equipement.oven'),
  microwave: t('equipement.microwave'),
  coffeemaker: t('equipement.coffeemaker'),
  fridge: t('equipement.fridge'),
  fireburner: t('equipement.fireburner'),
  heating: t('equipement.heating'),
  airConditioning: t('equipement.airConditioning'),
  fireplace: t('equipement.fireplace'),
  ceilingfan: t('equipement.ceilingfan'),
  tablefan: t('equipement.tablefan'),
  fingerprint: t('equipement.fingerprint'),
  lockbox: t('equipement.lockbox'),
  parkingaccess: t('equipement.parkingaccess'),
  wifi: t('equipement.wifi'),
  dedicatedworkspace: t('equipement.dedicatedworkspace'),
  freeParking: t('equipement.freeParking'),
  paidParking: t('equipement.paidParking'),
  pool: t('equipement.pool'),
  garbageCan: t('equipement.garbageCan'),
 };

 useEffect(() => {
  setName(equipementTitles[equipement] || '');
 }, [equipement]);

 const goBack = () => {
  navigate(-1); // This will navigate back to the previous page
 };

 const onChangeMediaType = (e) => {
  setMediaType(e.target.value);
  form.setFieldsValue({ media: '' });
  setVideoUrl('');
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
  values.name = equipement;
  values.propertyId = id;
  values.media = videoUrl;
  if (mediaType === t('common.photo') && fileList.length > 0) {
   const photoUrl = await uploadEquipement(fileList);
   values.media = photoUrl;
  }
  try {
   await postEquipement(values);
   if (!error) {
    setTimeout(() => {
     // Navigate to the dashboard
     navigate(-1);
    }, 1000);
   }
  } catch (error) {
   console.error('Error:', error);
  }
 };
 return (
  <Layout className="contentStyle">
   <Head />
   <Content className="container">
    <Button
     type="default"
     shape="round"
     icon={<ArrowLeftOutlined />}
     onClick={goBack}
    >
     {t('button.back')}
    </Button>
    <Row gutter={[16, 16]}>
     <Col xs={24}>
      <Title level={2}>
       {t('equipement.addCard')} {name}
      </Title>
      <Form
       name="equipement_form"
       initialValues={{ remember: true }}
       onFinish={onFinish}
       layout="vertical"
       size="large"
       form={form}
      >
       <Row gutter={[32, 16]}>
        <Col xs={24} md={12}>
         <Flex
          horizontal="true"
          gap="middle"
          justify="center"
          onChange={onChangeMediaType}
         >
          <Radio.Group defaultValue="Photo" buttonStyle="solid" size="large">
           <Radio.Button value="Photo">{t('common.photo')}</Radio.Button>
           <Radio.Button value="Video">{t('common.video')}</Radio.Button>
          </Radio.Group>
         </Flex>
         <br />
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
         <Form.Item label={t('equipement.guestMessage')} name="description">
          <Input.TextArea rows={6} showCount maxLength={500} />
         </Form.Item>
        </Col>
        {equipement === 'wifi' && (
         <Col xs={24} md={12}>
          <Row gutter={[16, 32]}>
           <Col xs={24} md={12}>
            <Form.Item label={t('equipement.wifiName')} name="wifiName">
             <Input showCount maxLength={25} />
            </Form.Item>
           </Col>
           <Col xs={24} md={12}>
            <Form.Item
             label={t('translations.wifiPassword')}
             name="wifiPassword"
            >
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
            loading={loading}
           >
            {t('common.save')}
           </Button>
          </Form.Item>
         </Col>
        </Row>
       </Form.Item>
      </Form>
     </Col>
    </Row>
   </Content>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default AddEquipement;
