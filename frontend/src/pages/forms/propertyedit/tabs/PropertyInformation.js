import React, { useState, useEffect } from 'react';
import {
 Row,
 Col,
 Form,
 Input,
 Button,
 Typography,
 Radio,
 Upload,
 message,
 Card,
 Divider,
 Checkbox,
 Collapse,
 Space,
 Image,
 Alert,
 Spin,
 InputNumber,
} from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ImgCrop from 'antd-img-crop';
import { useTranslation } from '../../../../context/TranslationContext';
import useUpdateProperty from '../../../../hooks/useUpdateProperty';
import useUploadPhotos from '../../../../hooks/useUploadPhotos';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

const getBase64 = (file) =>
 new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
 });

const PropertyInformation = ({ property, propertyId }) => {
 const { t } = useTranslation();
 const [form] = Form.useForm();
 const {
  updatePropertyBasicInfo,
  updatePropertyRules,
  updatePropertyPhotos,
  isLoading,
  success,
 } = useUpdateProperty(propertyId);
 const { uploadPhotos, uploadFrontPhoto, uploading, uploadProgress } =
  useUploadPhotos();

 const [checkedType, setCheckedType] = useState(property?.type || null);
 const [fileList, setFileList] = useState([]);
 const [frontPhotoList, setFrontPhotoList] = useState([]);
 const [previewOpen, setPreviewOpen] = useState(false);
 const [previewImage, setPreviewImage] = useState('');
 const [previewFrontOpen, setPreviewFrontOpen] = useState(false);
 const [previewFrontImage, setPreviewFrontImage] = useState('');
 const [showAdditionalRules, setShowAdditionalRules] = useState(false);
 const [additionalRules, setAdditionalRules] = useState('');
 const [saving, setSaving] = useState(false);
 const [successMessage, setSuccessMessage] = useState('');

 // Property type options
 const propertyTypes = [
  {
   label: t('type.house'),
   value: 'house',
   icon: <i className="Radioicon fa-light fa-house"></i>,
  },
  {
   label: t('type.apartment'),
   value: 'apartment',
   icon: <i className="Radioicon fa-light fa-building"></i>,
  },
  {
   label: t('type.guesthouse'),
   value: 'guesthouse',
   icon: <i className="Radioicon fa-light fa-house-user"></i>,
  },
 ];

 // Ensure data is properly formatted before setting form values
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

 // Set initial form values from property - only run once when property is loaded
 useEffect(() => {
  if (property) {
   console.log('Setting initial form values for PropertyInformation');

   // Handle house rules - ensure it's an array
   const houseRules = parseArrayProperty(property.houseRules);

   // Set form values
   form.setFieldsValue({
    type: property.type,
    name: property.name,
    description: property.description,
    price: property.price,
    capacity: property.capacity,
    rooms: property.rooms,
    beds: property.beds,
    airbnbUrl: property.airbnbUrl,
    bookingUrl: property.bookingUrl,
    houseRules: houseRules,
   });

   setCheckedType(property.type);

   // Check if there are additional rules
   if (houseRules.length > 0) {
    const additionalRuleItem = houseRules.find(
     (rule) => typeof rule === 'string' && rule.startsWith('additionalRules:')
    );
    if (additionalRuleItem) {
     setShowAdditionalRules(true);
     setAdditionalRules(
      additionalRuleItem.replace('additionalRules:', '').trim()
     );
    }
   }

   // Set photos
   if (property.photos) {
    const photos = parseArrayProperty(property.photos);
    if (photos.length > 0) {
     setFileList(
      photos.map((url, index) => ({
       uid: `existing-${index}`,
       name: url.substring(url.lastIndexOf('/') + 1),
       status: 'done',
       url: url,
      }))
     );
    }
   }

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
 }, [property?.id]); // Only run when property ID changes

 // Handle image preview
 const handlePreview = async (file) => {
  if (!file.url && !file.preview) {
   file.preview = await getBase64(file.originFileObj);
  }
  setPreviewImage(file.url || file.preview);
  setPreviewOpen(true);
 };

 // Handle image changes
 const handleChange = ({ fileList: newFileList }) => {
  setFileList(newFileList);
 };

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

 // Handle radio change
 const handleRadioChange = (e) => {
  setCheckedType(e.target.value);
 };

 // Handle form submission
 const handleSubmit = async (formValues) => {
  setSaving(true);
  try {
   // Basic information update
   await updatePropertyBasicInfo({
    type: formValues.type,
    name: formValues.name,
    description: formValues.description,
    price: formValues.price,
    capacity: formValues.capacity,
    rooms: formValues.rooms,
    beds: formValues.beds,
    airbnbUrl: formValues.airbnbUrl,
    bookingUrl: formValues.bookingUrl,
   });

   // House rules update
   let housRulesData = [...formValues.houseRules];
   if (showAdditionalRules && additionalRules) {
    housRulesData.push(`additionalRules: ${additionalRules}`);
   }
   await updatePropertyRules({ houseRules: housRulesData });

   // Photos update
   if (fileList.length > 0) {
    const filesWithOriginFileObj = fileList.filter(
     (file) => file.originFileObj
    );
    const newFileList = filesWithOriginFileObj.reduce((acc, file, index) => {
     acc[index] = file;
     return acc;
    }, []);

    const urlsArray = fileList
     .filter((file) => !file.originFileObj)
     .map((file) => file.url);

    const photoUrls = await uploadPhotos(newFileList);
    photoUrls.unshift(...urlsArray);

    await updatePropertyPhotos({ photos: photoUrls });
   }

   // Front photo update
   if (frontPhotoList.length > 0) {
    const frontPhotoWithOriginFileObj = frontPhotoList.filter(
     (file) => file.originFileObj
    );
    if (frontPhotoWithOriginFileObj.length > 0) {
     const frontPhotoUrl = await uploadFrontPhoto(frontPhotoWithOriginFileObj);
     await updatePropertyBasicInfo({ frontPhoto: frontPhotoUrl });
    }
   }

   // Success message
   setSuccessMessage(t('messages.updateSuccess'));
   message.success(t('messages.updateSuccess'));
  } catch (error) {
   console.error('Error updating property:', error);
   message.error(t('messages.updateError'));
  } finally {
   setSaving(false);

   // Clear success message after a delay
   setTimeout(() => {
    setSuccessMessage('');
   }, 3000);
  }
 };

 return (
  <Form
   form={form}
   layout="vertical"
   onFinish={handleSubmit}
   initialValues={property}
  >
   <Collapse
    defaultActiveKey={['basic', 'photos', 'rules']}
    style={{ marginBottom: 24 }}
    bordered={false}
   >
    {/* Basic Information */}
    <Panel
     header={
      <Title level={4}>
       <i className="fa-light fa-circle-info" style={{ marginRight: 8 }} />
       {t('property.basic.title')}
      </Title>
     }
     key="basic"
    >
     <Row gutter={[24, 16]}>
      <Col xs={24} md={24}>
       <Form.Item
        label={t('property.basic.type')}
        name="type"
        rules={[
         {
          required: true,
          message: t('validation.selectType'),
         },
        ]}
       >
        <Radio.Group value={checkedType} onChange={handleRadioChange}>
         <div className="customRadioGroup">
          {propertyTypes.map((PropertyType) => (
           <div className="customRadioContainer" key={PropertyType.value}>
            <Radio value={PropertyType.value}>
             <div
              className={
               checkedType === PropertyType.value
                ? 'customRadioButton customRadioChecked'
                : 'customRadioButton'
              }
             >
              {PropertyType.icon}
              <div>{PropertyType.label}</div>
             </div>
            </Radio>
           </div>
          ))}
         </div>
        </Radio.Group>
       </Form.Item>
      </Col>

      <Col xs={24} md={12}>
       <Form.Item
        name="name"
        label={t('property.basic.name')}
        rules={[{ required: true, message: t('validation.enterName') }]}
       >
        <Input />
       </Form.Item>
      </Col>

      <Col xs={24} md={12}>
       <Form.Item label={t('property.basic.price')} name="price">
        <InputNumber min={0} addonAfter="Dhs" style={{ width: '100%' }} />
       </Form.Item>
      </Col>

      <Col xs={24}>
       <Form.Item
        name="description"
        label={t('property.basic.description')}
        rules={[{ required: true, message: t('validation.enterDescription') }]}
       >
        <TextArea showCount maxLength={500} rows={4} />
       </Form.Item>
      </Col>

      <Col xs={8} md={4}>
       <Form.Item label={t('property.basic.capacity')} name="capacity">
        <InputNumber min={0} style={{ width: '100%' }} />
       </Form.Item>
      </Col>

      <Col xs={8} md={4}>
       <Form.Item label={t('property.basic.rooms')} name="rooms">
        <InputNumber min={0} style={{ width: '100%' }} />
       </Form.Item>
      </Col>

      <Col xs={8} md={4}>
       <Form.Item label={t('property.basic.beds')} name="beds">
        <InputNumber min={0} style={{ width: '100%' }} />
       </Form.Item>
      </Col>

      <Col xs={24} md={12}>
       <Form.Item name="airbnbUrl" label={t('property.basic.airbnbUrl')}>
        <Input />
       </Form.Item>
      </Col>

      <Col xs={24} md={12}>
       <Form.Item name="bookingUrl" label={t('property.basic.bookingUrl')}>
        <Input />
       </Form.Item>
      </Col>
     </Row>
    </Panel>

    {/* Photos */}
    <Panel
     header={
      <Title level={4}>
       <i className="fa-light fa-images" style={{ marginRight: 8 }} />
       {t('property.photos.title')}
      </Title>
     }
     key="photos"
    >
     <Row gutter={[24, 16]}>
      <Col xs={24}>
       <Title level={5}>{t('property.photos.gallery')}</Title>
       <Text type="secondary">{t('property.photos.galleryDescription')}</Text>
       <div style={{ marginTop: 16 }}>
        {fileList.length > 1 && (
         <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <Text type="secondary">{t('photo.dragDrop')}</Text>
         </div>
        )}
        <ImgCrop aspect={16 / 9} rotationSlider>
         <Upload
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
          beforeUpload={() => false}
          maxCount={16}
          multiple
         >
          {fileList.length >= 16 ? null : (
           <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>{t('photo.upload')}</div>
           </div>
          )}
         </Upload>
        </ImgCrop>
        <Image
         style={{ display: 'none' }}
         preview={{
          visible: previewOpen,
          onVisibleChange: (visible) => setPreviewOpen(visible),
          afterOpenChange: (visible) => !visible && setPreviewImage(''),
         }}
         src={previewImage}
        />

        {fileList.length === 16 && (
         <Alert
          message={t('photo.maxReached')}
          type="info"
          style={{ marginTop: 16 }}
         />
        )}
       </div>
      </Col>

      <Col xs={24}>
       <Divider />
       <Title level={5}>{t('property.photos.frontPhoto')}</Title>
       <Text type="secondary">
        {t('property.photos.frontPhotoDescription')}
       </Text>
       <div style={{ marginTop: 16 }}>
        <ImgCrop aspect={4 / 3} rotationSlider>
         <Upload
          listType="picture-card"
          fileList={frontPhotoList}
          onPreview={handleFrontPreview}
          onChange={handleFrontChange}
          beforeUpload={() => false}
          maxCount={1}
         >
          {frontPhotoList.length >= 1 ? null : (
           <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>{t('photo.upload')}</div>
           </div>
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
     </Row>
    </Panel>

    {/* House Rules */}
    <Panel
     header={
      <Title level={4}>
       <i className="fa-light fa-list-check" style={{ marginRight: 8 }} />
       {t('property.rules.title')}
      </Title>
     }
     key="rules"
    >
     <Row gutter={[24, 16]}>
      <Col xs={24}>
       <Form.Item name="houseRules">
        <Checkbox.Group className="houseRules-checkbox-group">
         <Row>
          <Col xs={24}>
           <Checkbox value="noNoise">
            <i className="fa-light fa-volume-slash fa-xl" />{' '}
            {t('rules.noNoise')}
           </Checkbox>
          </Col>
          <Col xs={24}>
           <Checkbox value="noFoodDrinks">
            <i className="fa-light fa-utensils-slash fa-xl" />{' '}
            {t('rules.noFood')}
           </Checkbox>
          </Col>
          <Col xs={24}>
           <Checkbox value="noParties">
            <i className="fa-light fa-champagne-glasses fa-xl" />{' '}
            {t('rules.noParties')}
           </Checkbox>
          </Col>
          <Col xs={24}>
           <Checkbox value="noSmoking">
            <i className="fa-light fa-ban-smoking fa-xl" />{' '}
            {t('rules.noSmoking')}
           </Checkbox>
          </Col>
          <Col xs={24}>
           <Checkbox value="noPets">
            <i className="fa-light fa-paw-simple fa-xl" /> {t('rules.noPets')}
           </Checkbox>
          </Col>
          <Col xs={24}>
           <Checkbox value="noUnmarriedCouple">
            <i className="fa-light fa-ban fa-xl" />{' '}
            {t('rules.noUnmarriedCouple')}
           </Checkbox>
          </Col>
          <Col xs={24}>
           <Checkbox
            value="additionalRules"
            checked={showAdditionalRules}
            onChange={(e) => setShowAdditionalRules(e.target.checked)}
           >
            <i className="fa-light fa-circle-info fa-xl" />{' '}
            {t('rules.additionalRules')}
           </Checkbox>
          </Col>
         </Row>
        </Checkbox.Group>
       </Form.Item>

       {showAdditionalRules && (
        <Form.Item label={t('rules.additionalRules')}>
         <TextArea
          rows={4}
          value={additionalRules}
          onChange={(e) => setAdditionalRules(e.target.value)}
          showCount
          maxLength={255}
         />
        </Form.Item>
       )}
      </Col>
     </Row>
    </Panel>
   </Collapse>

   {/* Submit button */}
   <Form.Item>
    <Button
     type="primary"
     htmlType="submit"
     loading={saving}
     icon={<SaveOutlined />}
     size="large"
    >
     {t('button.save')}
    </Button>

    {successMessage && (
     <Alert
      message={successMessage}
      type="success"
      showIcon
      style={{ marginTop: 16 }}
     />
    )}
   </Form.Item>
  </Form>
 );
};

export default PropertyInformation;
