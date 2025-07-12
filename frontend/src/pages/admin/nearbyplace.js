import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
 Spin,
 Layout,
 Typography,
 Form,
 Input,
 Button,
 Rate,
 Upload,
 Checkbox,
 Select,
 message,
} from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from '../../context/TranslationContext';
import useNearbyPlace from '../../hooks/useNearbyPlace';
import useUploadPhotos from '../../hooks/useUploadPhotos';
import ImgCrop from 'antd-img-crop';
import Head from '../../components/common/header';
import Foot from '../../components/common/footer';

const { Content } = Layout;
const { Title } = Typography;

const NearbyPlace = () => {
 const [place, setPlace] = useState(null);
 const location = useLocation();
 const navigate = useNavigate();
 const { loading, getNearbyPlaceById, updateNearbyPlace } = useNearbyPlace();
 const { uploadPlace } = useUploadPhotos();
 const { t } = useTranslation();

 const [filelist, setFileList] = useState([]);

 const placeId = new URLSearchParams(location.search).get('id');

 useEffect(() => {
  if (placeId) {
   getNearbyPlaceById(placeId)
    .then((data) => {
     setPlace(data);
    })
    .catch((err) => {
     message.error(t('map.messageError'));
    });
  }
 }, [loading]);

 const handleChange = ({ fileList }) => {
  setFileList(fileList);
 };

 const handleFormSubmit = async (values) => {
  try {
   let photoUrl = '';
   if (filelist.length > 0) {
    const photoUrls = await uploadPlace(filelist);
    values.photo = photoUrls;
   }
   await updateNearbyPlace(placeId, { ...place, ...values });
   message.success(t('messages.updateSuccess'));
   navigate(-1); // Redirect to nearby places list after update
  } catch (err) {
   message.error(t('messages.updateError'));
  }
 };

 if (loading || !place) {
  return (
   <div className="loading">
    <Spin size="large" />
   </div>
  );
 }

 return (
  <Layout className="contentStyle">
   <Head />
   <Content className="container-fluid">
    <Button
     type="default"
     shape="round"
     icon={<ArrowLeftOutlined />}
     onClick={() => navigate(-1)}
    >
     {t('button.back')}
    </Button>
    <Title level={2}>{t('nearbyPlace.title')}</Title>
    <Form
     initialValues={place}
     onFinish={handleFormSubmit}
     autoComplete="off"
     labelAlign="left"
     labelCol={{ xs: 24, sm: 4 }}
     wrapperCol={{ xs: 24, sm: 20 }}
    >
     <Form.Item label={t('nearbyPlace.name')} name="name">
      <Input />
     </Form.Item>

     <Form.Item label={t('nearbyPlace.address')} name="address">
      <Input />
     </Form.Item>

     <Form.Item label={t('nearbyPlace.rating')} name="rating">
      <Rate allowHalf />
     </Form.Item>

     <Form.Item label={t('nearbyPlace.types')} name="types">
      <Select
       mode="multiple"
       allowClear
       style={{ width: '100%' }}
       placeholder={t('nearbyPlace.selectTypes')}
       options={[
        { label: t('nearbyPlace.restaurantcafe'), value: 'Restaurant & Café' },
        { label: t('nearbyPlace.activite'), value: 'Activité' },
        { label: t('nearbyPlace.attraction'), value: 'Attraction' },
        { label: t('nearbyPlace.mall'), value: 'Centre commercial' },
       ]}
       defaultValue={place.types} // Set default value as the current place types
      />
     </Form.Item>

     <Form.Item label={t('nearbyPlace.photo')} name="photo">
      <ImgCrop rotationSlider>
       <Upload
        listType="picture"
        defaultFileList={[
         {
          uid: '-1',
          name: 'photo.jpg',
          status: 'done',
          url: place.photo, // The URL of the uploaded photo
         },
        ]}
        onChange={handleChange}
        onPreview={null}
       >
        <Button icon={<UploadOutlined />}>{t('common.upload')}</Button>
       </Upload>
      </ImgCrop>
     </Form.Item>

     <Form.Item
      label={t('user.verified')}
      name="isVerified"
      valuePropName="checked"
     >
      <Checkbox />
     </Form.Item>

     <Form.Item>
      <Button type="primary" htmlType="submit" loading={loading}>
       {t('button.save')}
      </Button>
     </Form.Item>
    </Form>
   </Content>
   <Foot />
  </Layout>
 );
};

export default NearbyPlace;
