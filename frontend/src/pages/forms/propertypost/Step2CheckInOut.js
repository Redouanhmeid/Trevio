import React, { useState, useCallback } from 'react';
import {
 Layout,
 Typography,
 Form,
 Row,
 Col,
 Checkbox,
 Input,
 Button,
 TimePicker,
 Upload,
 Image,
 Spin,
 Grid,
 message,
} from 'antd';
import Head from '../../../components/common/header';
import Foot from '../../../components/common/footer';
import {
 ArrowLeftOutlined,
 ArrowRightOutlined,
 PlusOutlined,
} from '@ant-design/icons';
import ReactPlayer from 'react-player';
import dayjs from 'dayjs';
import ImgCrop from 'antd-img-crop';
import useUpdatePropertyCheckIn from '../../../hooks/useUpdateProperty';
import useUpdatePropertyCheckOut from '../../../hooks/useUpdateProperty';
import useUploadPhotos from '../../../hooks/useUploadPhotos';
import { useTranslation } from '../../../context/TranslationContext';

const { Title } = Typography;
const { Content } = Layout;
const { TextArea } = Input;
// Default check-in/out times that make more business sense
const DEFAULT_CHECK_IN_TIME = dayjs().hour(11).minute(0); // 11:00 AM
const DEFAULT_CHECK_OUT_TIME = dayjs().hour(12).minute(0); // 12:00 AM

const TimePickerWithDefault = ({
 value,
 t,
 onChange,
 name,
 label,
 isCheckIn = true,
}) => {
 // Internal state to track if user has made a selection
 const [hasUserSelected, setHasUserSelected] = useState(
  value && value.format('HH:mm') !== '00:00'
 );

 const handleTimeChange = (time) => {
  setHasUserSelected(true);
  onChange?.(time);
 };

 const handleClear = () => {
  setHasUserSelected(false);
  // When cleared, reset to the appropriate default time
  onChange?.(isCheckIn ? DEFAULT_CHECK_IN_TIME : DEFAULT_CHECK_OUT_TIME);
 };

 return (
  <Form.Item
   label={label}
   name={name}
   help={
    !hasUserSelected
     ? t(`timePicker.default${isCheckIn ? 'CheckIn' : 'CheckOut'}`)
     : undefined
   }
  >
   <TimePicker
    format="HH:mm"
    showNow={false}
    size="large"
    onChange={handleTimeChange}
    onClear={handleClear}
    allowClear={false}
    value={value}
    placeholder={t(`timePicker.select${isCheckIn ? 'CheckIn' : 'CheckOut'}`)}
   />
  </Form.Item>
 );
};

const getBase64 = (file) =>
 new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
 });

const Step2CheckInOut = ({ prev, next, values, ProgressSteps }) => {
 const { t } = useTranslation();
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();
 const {
  updatePropertyCheckIn,
  isLoading: checkInLoading,
  success: checkInSuccess,
  error: checkInError,
 } = useUpdatePropertyCheckIn(values.propertyId);
 const {
  updatePropertyCheckOut,
  isLoading: checkOutLoading,
  success: checkOutSuccess,
  error: checkOutError,
 } = useUpdatePropertyCheckOut(values.propertyId);

 const [form] = Form.useForm();
 const { uploadFrontPhoto } = useUploadPhotos();
 const [loading, setLoading] = useState(false);

 const [CheckInTime, setCheckInTime] = useState(
  values.checkInTime || DEFAULT_CHECK_IN_TIME
 );
 const [CheckOutTime, setCheckOutTime] = useState(
  values.checkOutTime || DEFAULT_CHECK_OUT_TIME
 );
 const [EarlyCheckIn, setEarlyCheckIn] = useState(values.earlyCheckIn || []);
 const [AccessToProperty, setAccessToProperty] = useState(
  values.accessToProperty || []
 );

 const [LateCheckOutPolicy, setLateCheckOutPolicy] = useState(
  values.lateCheckOutPolicy || []
 );
 const [BeforeCheckOut, setBeforeCheckOut] = useState(
  values.beforeCheckOut || []
 );

 const [GuestAccessInfo, setGuestAccessInfo] = useState(
  values.guestAccessInfo || ''
 );
 const [VideoCheckIn, setVideoCheckIn] = useState(values.videoCheckIn || '');
 const [AdditionalCheckOutInfo, setAdditionalCheckOutInfo] = useState(
  values.additionalCheckOutInfo || ''
 );
 const [frontPhoto, setFrontPhoto] = useState(values.frontPhoto || '');

 const submitFormData = async () => {
  try {
   setLoading(true); // Start loading
   // Prepare check-in data
   const checkInData = {
    checkInTime: CheckInTime || dayjs().hour(12).minute(0),
    earlyCheckIn: EarlyCheckIn,
    accessToProperty: AccessToProperty,
    guestAccessInfo: GuestAccessInfo,
    videoCheckIn: VideoCheckIn,
    frontPhoto: '',
   };
   // Handle front photo upload if it exists
   if (
    typeof frontPhoto === 'string' &&
    frontPhoto.startsWith('/frontphotos')
   ) {
    checkInData.frontPhoto = frontPhoto; // Keep the existing URL if already uploaded
   } else if (frontPhoto.length > 0) {
    const photoUrl = await uploadFrontPhoto(frontPhoto);
    checkInData.frontPhoto = photoUrl;
   }
   // Prepare check-out data
   const checkOutData = {
    checkOutTime: CheckOutTime || dayjs().hour(12).minute(0),
    lateCheckOutPolicy: LateCheckOutPolicy,
    beforeCheckOut: BeforeCheckOut,
    additionalCheckOutInfo: AdditionalCheckOutInfo,
   };

   let hasErrors = false;
   try {
    await updatePropertyCheckIn(checkInData);
    await updatePropertyCheckOut(checkOutData);
   } catch (error) {
    hasErrors = true;
    message.error(t('error.submit'));
   }

   if (!hasErrors) {
    next();
    // Update values object with all the new data
    Object.assign(values, { ...checkInData, ...checkOutData });
   }
  } catch (error) {
   console.error('Error submitting form:', error);
   message.error(error.message || 'Impossible de mettre');
  } finally {
   setLoading(false); // End loading
  }
 };

 return (
  <Layout className="contentStyle">
   <Head />
   <Layout>
    <Content className="container-form">
     <ProgressSteps />
     <Spin
      spinning={loading || checkInLoading || checkOutLoading}
      tip={t('loading.submission')}
     >
      <Form
       name="step2"
       layout="vertical"
       onFinish={submitFormData}
       size="large"
       form={form}
       initialValues={{
        checkInTime: values.checkInTime || dayjs().hour(0).minute(0),
        checkOutTime: values.checkOutTime || dayjs().hour(0).minute(0),
        earlyCheckIn: values.earlyCheckIn || [],
        lateCheckOutPolicy: values.lateCheckOutPolicy || [],
        accessToProperty: values.accessToProperty || [],
        beforeCheckOut: values.beforeCheckOut || [],
        guestAccessInfo: values.guestAccessInfo || '',
        videoCheckIn: values.videoCheckIn || '',
        additionalCheckOutInfo: values.additionalCheckOutInfo || '',
       }}
      >
       <CheckInForm
        form={form}
        CheckInTime={CheckInTime}
        setCheckInTime={setCheckInTime}
        setEarlyCheckIn={setEarlyCheckIn}
        setAccessToProperty={setAccessToProperty}
        setGuestAccessInfo={setGuestAccessInfo}
        setVideoCheckIn={setVideoCheckIn}
        setFrontPhoto={setFrontPhoto}
        values={values}
        t={t}
       />
       <CheckOutForm
        form={form}
        CheckOutTime={CheckOutTime}
        setCheckOutTime={setCheckOutTime}
        setBeforeCheckOut={setBeforeCheckOut}
        setLateCheckOutPolicy={setLateCheckOutPolicy}
        setAdditionalCheckOutInfo={setAdditionalCheckOutInfo}
        t={t}
       />
       <br />
       <Row justify="center">
        <Col xs={8} md={2}>
         <Form.Item>
          <Button
           htmlType="submit"
           shape="circle"
           onClick={prev}
           icon={<ArrowLeftOutlined />}
          />
         </Form.Item>
        </Col>

        <Col xs={16} md={6}>
         <Form.Item>
          <Button
           type="primary"
           htmlType="submit"
           style={{ width: '100%' }}
           loading={checkInLoading || checkOutLoading}
          >
           {t('button.continue')} {<ArrowRightOutlined />}
          </Button>
         </Form.Item>
        </Col>
       </Row>
      </Form>
     </Spin>
    </Content>
   </Layout>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default Step2CheckInOut;

const CheckInForm = ({
 form,
 CheckInTime,
 setCheckInTime,
 setEarlyCheckIn,
 setAccessToProperty,
 setGuestAccessInfo,
 setVideoCheckIn,
 setFrontPhoto,
 values,
 t,
}) => {
 const [videoURL, setVideoURL] = useState('');
 const [fileList, setFileList] = useState(() => {
  // Initialize fileList with existing frontPhoto if it exists
  if (values?.frontPhoto) {
   return [
    {
     uid: '-1',
     name: 'front-photo',
     status: 'done',
     url: values.frontPhoto,
    },
   ];
  }
  return [];
 });
 const [previewImage, setPreviewImage] = useState('');
 const [previewOpen, setPreviewOpen] = useState(false);

 const handlePreview = useCallback(async (file) => {
  if (!file.url && !file.preview) {
   file.preview = await getBase64(file.originFileObj);
  }
  setPreviewImage(file.url || file.preview);
  setPreviewOpen(true);
 }, []);
 const handleChange = ({ fileList: newFileList }) => {
  setFileList(newFileList);
  setFrontPhoto(newFileList);
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

 const onChangeEarlyCheckIn = (checkedvalues) => {
  setEarlyCheckIn(checkedvalues);
 };
 const onChangeAccessToProperty = (checkedvalues) => {
  setAccessToProperty(checkedvalues);
 };
 const handleVideoURLChange = (e) => {
  setVideoURL(e.target.value);
  setVideoCheckIn(e.target.value);
 };

 return (
  <Row gutter={[24, 0]}>
   <Col xs={24} md={24}>
    <Title level={4}>
     {t('checkIn.title')}
     {'  '}
     <i className="PrimaryColor fa-regular fa-arrow-right-to-arc" />
    </Title>
    <TimePickerWithDefault
     value={CheckInTime}
     t={t}
     onChange={setCheckInTime}
     name="checkInTime"
     label={t('checkIn.earliestTime')}
     isCheckIn={true}
    />
   </Col>
   <Col xs={24} md={24}>
    <Form.Item label={t('checkIn.policyTitle')} name="earlyCheckIn">
     <Checkbox.Group onChange={onChangeEarlyCheckIn}>
      <Row>
       <Col span={24}>
        <Checkbox value="heureNonFlexible">
         {t('checkIn.policyNotFlexible')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="ajustementHeure">
         {t('checkIn.policyAdjustTime')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="autreHeureArrivee">
         {t('checkIn.policyAlternateTime')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="laissezBagages">
         {t('checkIn.policyStoreBags')}
        </Checkbox>
       </Col>
      </Row>
     </Checkbox.Group>
    </Form.Item>
   </Col>
   <Col xs={24} md={24}>
    <Form.Item label={t('checkIn.title')} name="accessToProperty">
     <Checkbox.Group onChange={onChangeAccessToProperty}>
      <Row>
       <Col span={24}>
        <Checkbox value="cleDansBoite">{t('checkIn.accessKeyInBox')}</Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="acceuilContactezMoi">
         {t('checkIn.accessWelcomeContact')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="codesAccesCourriel">
         {t('checkIn.accessCodesByEmail')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="verifiezCourriel">
         {t('checkIn.accessCheckEmail')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="serrureNumero">
         {t('checkIn.accessNumberLock')}
        </Checkbox>
       </Col>
      </Row>
     </Checkbox.Group>
    </Form.Item>
   </Col>
   <Col xs={24} md={24}>
    <Form.Item label={t('checkIn.guestInfo')} name="guestAccessInfo">
     <TextArea
      onChange={(e) => setGuestAccessInfo(e.target.value)}
      showCount
      maxLength={500}
     />
    </Form.Item>
   </Col>

   <Col xs={24} md={24}>
    <Form.Item
     label="Photo de la façade de la résidence ou de la maison."
     name="frontPhoto"
    >
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
         width: '100%',
         height: '100%',
         objectFit: 'cover',
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

   {/* Video URL Input */}
   <Col xs={24} md={24}>
    <Form.Item label="Lien vidéo pour les instructions d'enregistrement">
     <Input
      placeholder="Entrez l'URL de la vidéo (Hébergez vos vidéos sur Vimeo ou Youtube avant)"
      value={videoURL}
      onChange={handleVideoURLChange}
     />
    </Form.Item>
   </Col>

   {/* Video Embed */}
   {videoURL && (
    <Col xs={24} md={24}>
     <ReactPlayer url={videoURL} controls={true} width="100%" />
     <br />
    </Col>
   )}
  </Row>
 );
};

const CheckOutForm = ({
 form,
 CheckOutTime = { CheckOutTime },
 setCheckOutTime,
 setLateCheckOutPolicy,
 setBeforeCheckOut,
 setAdditionalCheckOutInfo,
 t,
}) => {
 const onChangeLateCheckOutPolicy = (checkedvalues) => {
  setLateCheckOutPolicy(checkedvalues);
 };
 const onChangeBeforeCheckOut = (checkedvalues) => {
  setBeforeCheckOut(checkedvalues);
 };
 return (
  <Row gutter={[24, 0]}>
   <Col xs={24} md={24}>
    <Title level={4}>
     {t('checkOut.title')}
     {'  '}
     <i className="PrimaryColor fa-regular fa-arrow-right-from-arc" />
    </Title>
    <TimePickerWithDefault
     value={CheckOutTime}
     t={t}
     onChange={setCheckOutTime}
     name="checkOutTime"
     label={t('checkOut.departureTime')}
     isCheckIn={false}
    />
   </Col>
   <Col xs={24} md={24}>
    <Form.Item
     label={t('property.checkOut.policyTitle')}
     name="lateCheckOutPolicy"
    >
     <Checkbox.Group onChange={onChangeLateCheckOutPolicy}>
      <Row>
       <Col span={24}>
        <Checkbox value="heureNonFlexible">
         {t('checkOut.policyNotFlexible')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="heureDepartAlternative">
         {t('checkOut.policyAlternateTime')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="contactezNous">
         {t('checkOut.policyContactUs')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="optionDepartTardif">
         {t('checkOut.policyLateOption')}
        </Checkbox>
       </Col>
      </Row>
     </Checkbox.Group>
    </Form.Item>
   </Col>
   <Col xs={24} md={24}>
    <Form.Item label={t('checkOut.tasksTitle')} name="beforeCheckOut">
     <Checkbox.Group onChange={onChangeBeforeCheckOut}>
      <Row>
       <Col span={24}>
        <Checkbox value="laissezBagages">
         {t('checkOut.tasksStoreBags')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="signezLivreOr">
         {t('checkOut.tasksGuestBook')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="litsNonFaits">
         {t('checkOut.tasksUnmadeBeds')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="laverVaisselle">
         {t('checkOut.tasksCleanDishes')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="vaisselleLaveVaisselle">
         {t('checkOut.tasksFinalDishes')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="eteindreAppareilsElectriques">
         {t('checkOut.tasksTurnOffAppliances')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="replacezMeubles">
         {t('checkOut.tasksReplaceFurniture')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="deposePoubelles">
         {t('checkOut.tasksGarbage')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="serviettesDansBaignoire">
         {t('checkOut.tasksTowelsInBath')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="serviettesParTerre">
         {t('checkOut.tasksTowelsOnFloor')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="porteNonVerrouillee">
         {t('checkOut.tasksDoorUnlocked')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="portesVerrouillees">
         {t('checkOut.tasksDoorLocked')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="laissezCleMaison">
         {t('checkOut.tasksKeyInHouse')}
        </Checkbox>
       </Col>
       <Col span={24}>
        <Checkbox value="laissezCleBoiteCle">
         {t('checkOut.tasksKeyInBox')}
        </Checkbox>
       </Col>
      </Row>
     </Checkbox.Group>
    </Form.Item>
   </Col>
   <Col xs={24} md={24}>
    <Form.Item
     label={t('checkOut.additionalInfo')}
     name="additionalCheckOutInfo"
    >
     <TextArea
      onChange={(e) => setAdditionalCheckOutInfo(e.target.value)}
      showCount
      maxLength={500}
     />
    </Form.Item>
   </Col>
  </Row>
 );
};
