import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import useProperty from '../../../hooks/useProperty';
import useUploadPhotos from '../../../hooks/useUploadPhotos';
import useUpdateProperty from '../../../hooks/useUpdateProperty';
import {
 Layout,
 Button,
 Spin,
 Row,
 Col,
 Form,
 Typography,
 Input,
 InputNumber,
 Checkbox,
 Divider,
 TimePicker,
 Upload,
 Image,
 Alert,
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import Head from '../../../components/common/header';
import Foot from '../../../components/common/footer';
import MapMarker from '../../components/MapMarker';
import dayjs from 'dayjs';
import ImgCrop from 'antd-img-crop';
import ReactPlayer from 'react-player';

const { Content } = Layout;
const { Title, Text } = Typography;
const format = 'HH:mm';
const { TextArea } = Input;

const getBase64 = (file) =>
 new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
 });

const EditProperty = () => {
 const location = useLocation();
 const { hash } = queryString.parse(location.search);
 const { property, loading, getIdFromHash, fetchProperty } = useProperty();
 const navigate = useNavigate();
 const { uploadPhotos, uploadFrontPhoto } = useUploadPhotos();
 const { updateProperty } = useUpdateProperty();
 const [showAdditionalRules, setShowAdditionalRules] = useState(false);
 const [additionalRules, setAdditionalRules] = useState('');
 const [form] = Form.useForm();
 const [checkInTime, setCheckInTime] = useState(dayjs());
 const [checkOutTime, setCheckOutTime] = useState(dayjs());
 const [previewOpen, setPreviewOpen] = useState(false);
 const [previewImage, setPreviewImage] = useState('');
 const [fileList, setFileList] = useState([]);
 const [uploading, setUploading] = useState(false);
 const [successMessage, setSuccessMessage] = useState('');
 const [errorMessage, setErrorMessage] = useState('');
 const [videoURL, setVideoURL] = useState('');

 const [fileList2, setFileList2] = useState([]);
 const [previewImage2, setPreviewImage2] = useState('');
 const [previewOpen2, setPreviewOpen2] = useState(false);
 const [id, setId] = useState();

 const parseJSONFields = (property) => {
  const fields = [
   'photos',
   'basicEquipements',
   'safetyFeatures',
   'elements',
   'houseRules',
   'earlyCheckIn',
   'beforeCheckOut',
   'accessToProperty',
   'lateCheckOutPolicy',
  ];
  fields.forEach((field) => {
   if (typeof property[field] === 'string') {
    property[field] = JSON.parse(property[field]);
   }
  });
 };

 useEffect(() => {
  const fetchData = async () => {
   if (hash) {
    const numericId = await getIdFromHash(hash);
    setId(numericId);
    if (numericId) {
     console.log('Fetching property with numericId:', numericId);
     await fetchProperty(numericId);
    }
   }
  };
  fetchData();
 }, [hash]);

 useEffect(() => {
  if (!loading && property) {
   parseJSONFields(property);
   form.setFieldsValue({
    ...property,
    checkInTime: dayjs(property.checkInTime),
    checkOutTime: dayjs(property.checkOutTime),
   });
   setFileList(
    property.photos.map((url, index) => ({
     uid: index,
     name: url.substring(url.lastIndexOf('/') + 1),
     status: 'done',
     url: url,
    }))
   );
   setFileList2([
    {
     uid: 1,
     name: property.frontPhoto,
     status: 'done',
     url: property.frontPhoto,
    },
   ]);
   setVideoURL(property.videoCheckIn || ''); // Initialize video URL state
  }
 }, [loading, property]);

 const goBack = () => {
  navigate(-1); // This will navigate back to the previous page
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
  setUploading(newFileList.some((file) => file.status === 'uploading'));
 };

 const handleRemove = (file) => {
  setFileList(fileList.filter((item) => item.uid !== file.uid));
 };

 const handlePreview2 = async (file) => {
  if (!file.url && !file.preview) {
   file.preview = await getBase64(file.originFileObj);
  }
  setPreviewImage2(file.url || file.preview);
  setPreviewOpen2(true);
 };
 const handleChange2 = ({ fileList }) => {
  setFileList2(fileList);
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
    Charger
   </div>
  </button>
 );
 const submitFormData = async () => {
  const formData = form.getFieldsValue();
  const {
   name,
   description,
   price,
   capacity,
   rooms,
   beds,
   basicEquipements,
   safetyFeatures,
   elements,
   houseRules,
   earlyCheckIn,
   accessToProperty,
   guestAccessInfo,
   lateCheckOutPolicy,
   beforeCheckOut,
   additionalCheckOutInfo,
  } = formData;

  formData.latitude = property.latitude;
  formData.longitude = property.longitude;
  formData.placeName = property.placeName;

  formData.checkInTime =
   checkInTime.format('YYYY-MM-DD HH:mm:ss') || property.checkInTime;
  formData.checkOutTime =
   checkOutTime.format('YYYY-MM-DD HH:mm:ss') || property.checkOutTime;
  formData.userId = property.userId;
  if (showAdditionalRules) {
   formData.houseRules.push(`additionalRules: ${additionalRules}`);
  }
  for (const key in formData) {
   if (formData.hasOwnProperty(key) && formData[key] === undefined) {
    formData[key] = null;
   }
  }

  const filesWithOriginFileObj = fileList.filter((file) => file.originFileObj);
  const newFileList = filesWithOriginFileObj.reduce((acc, file, index) => {
   acc[index] = file;
   return acc;
  }, []);
  const filesWithOriginFileObj2 = fileList2.filter(
   (file) => file.originFileObj
  );
  const newFileList2 = filesWithOriginFileObj2.reduce((acc, file, index) => {
   acc[index] = file;
   return acc;
  }, []);

  const urlsArray = fileList
   .filter((file) => !file.originFileObj)
   .map((file) => file.url);
  try {
   const photoUrls = await uploadPhotos(newFileList);
   photoUrls.unshift(...urlsArray);
   formData.photos = photoUrls;
   const frontPhoto = await uploadFrontPhoto(newFileList2);
   formData.frontPhoto = frontPhoto;
   await updateProperty(id, formData);
   setSuccessMessage('Property updated successfully');
   setErrorMessage('');
   setTimeout(() => {
    navigate(`/propertydetails?hash=${id}`);
   }, 2000);
  } catch (error) {
   console.error('Error updating property:', error);
   setErrorMessage('Failed to update property');
   setSuccessMessage('');
  }
 };

 if (loading || property.length === 0) {
  return (
   <div className="loading">
    <Spin size="large" />
   </div>
  );
 }

 return (
  <Layout className="contentStyle">
   <Head />
   <Layout>
    <Content className="container-fluid">
     <Button
      type="default"
      shape="round"
      icon={<ArrowLeftOutlined />}
      onClick={goBack}
     >
      Retour
     </Button>
     <Form
      name="editProperty"
      layout="vertical"
      onFinish={submitFormData}
      form={form}
      size="large"
     >
      <Title level={3}>Modifier les informations de votre propriété</Title>
      <Row gutter={[32, 32]}>
       <Col xs={24} xl={12}>
        <Row gutter={[24, 0]}>
         <Col xs={24}>
          <Form.Item
           label="Nom"
           name="name"
           rules={[{ required: true, message: 'Veuillez saisir votre nom!' }]}
          >
           <Input />
          </Form.Item>
         </Col>
         <Col xs={24}>
          <Form.Item
           label="Description"
           name="description"
           rules={[
            { required: true, message: 'Veuillez saisir une description!' },
           ]}
          >
           <TextArea showCount maxLength={500} rows={6} />
          </Form.Item>
         </Col>
         <Col xs={24}>
          <MapMarker
           latitude={property.latitude}
           longitude={property.longitude}
          />
         </Col>
        </Row>
       </Col>
       <Col xs={24} xl={12}>
        <Row gutter={[24, 0]}>
         <Col xs={24} md={9}>
          <Form.Item label="Fixez votre prix" name="price">
           <InputNumber min={0} addonAfter="Dh" />
          </Form.Item>
         </Col>
         <Col xs={12} md={5}>
          <Form.Item label="Max Personnes" name="capacity">
           <InputNumber min={0} />
          </Form.Item>
         </Col>
         <Col xs={12} md={5}>
          <Form.Item label="Chambres" name="rooms">
           <InputNumber min={0} />
          </Form.Item>
         </Col>
         <Col xs={12} md={5}>
          <Form.Item label="Lits" name="beds">
           <InputNumber min={0} />
          </Form.Item>
         </Col>
         <Col xs={24} md={24}>
          <Form.Item
           label={<Title level={4}>Manuelle de la maison:</Title>}
           name="basicEquipements"
          >
           <Checkbox.Group className="equipement-checkbox-group">
            <Row gutter={[24, 0]}>
             {/* Salle de bain */}
             <Row>
              <Col xs={24}>
               <Text strong>
                <br />
                Salle de bain
               </Text>
              </Col>
              <Col xs={12}>
               <Checkbox value="shower">
                <i className="fa-light fa-shower fa-xl" /> Douche
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="soap">
                <i className="fa-light fa-soap fa-xl" /> Savon
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="hairdryer">
                <i className="fa-light fa-gun-squirt fa-xl" /> Sèche-cheveux
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="shampoo">
                <i className="fa-light fa-bottle-water fa-xl" /> Shampooing
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="hotwater">
                <i className="fa-light fa-tank-water fa-xl" /> Eau chaude
               </Checkbox>
              </Col>
             </Row>
             {/* Chambre et linge */}
             <Row>
              <Col xs={24}>
               <Text strong>
                <br />
                Chambre et linge
               </Text>
              </Col>
              <Col xs={12}>
               <Checkbox value="washingMachine">
                <i className="fa-light fa-washing-machine fa-xl" /> Machine à
                laver
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="dryerheat">
                <i className="fa-light fa-dryer-heat fa-xl" /> Sèche-linge
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="basicequipements" style={{ lineHeight: 1 }}>
                <i className="fa-light fa-toilet-paper-blank fa-xl" />{' '}
                Équipements de base
                <br />
                <Text type="secondary">
                 Serviettes, draps, savon et papier toilette
                </Text>
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="cabinetfiling">
                <i className="fa-light fa-cabinet-filing fa-xl" /> Classeur
                d'armoire
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="blankets">
                <i className="fa-light fa-blanket fa-xl" /> Couvertures
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="vault">
                <i className="fa-light fa-vault fa-xl" /> Coffre-fort
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="vacuum">
                <i className="fa-light fa-vacuum fa-xl" /> Aspirateur
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="mattresspillow">
                <i className="fa-light fa-mattress-pillow fa-xl" /> Matelas
                oreiller
               </Checkbox>
              </Col>
             </Row>
             {/* Divertissement */}
             <Row>
              <Col xs={24}>
               <Text strong>
                <br />
                Divertissement
               </Text>
              </Col>
              <Col xs={12}>
               <Checkbox value="television">
                <i className="fa-light fa-tv fa-xl" /> Télévision
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="ethernet">
                <i className="fa-light fa-ethernet fa-xl" /> Connexion Ethernet
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="speaker">
                <i className="fa-light fa-speaker fa-xl" /> Système audio
                Bluetooth
               </Checkbox>
              </Col>
             </Row>
             {/* Chauffage et climatisation */}
             <Row>
              <Col xs={24}>
               <Text strong>
                <br />
                Chauffage et climatisation
               </Text>
              </Col>
              <Col xs={12}>
               <Checkbox value="heating">
                <i className="fa-light fa-temperature-arrow-up fa-xl" />{' '}
                Chauffage
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="airConditioning">
                <i className="fa-light fa-snowflake fa-xl" /> Climatisation
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="fireplace">
                <i className="fa-light fa-fireplace fa-xl" /> Cheminée
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="ceilingfan">
                <i className="fa-light fa-fan fa-xl" /> Ventilateur de plafond
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="tablefan">
                <i className="fa-light fa-fan-table fa-xl" /> Ventilateur de
                table
               </Checkbox>
              </Col>
             </Row>
             {/* Sécurité à la maison */}
             <Row>
              <Col xs={24}>
               <Text strong>
                <br />
                Sécurité à la maison
               </Text>
              </Col>
              <Col xs={12}>
               <Checkbox value="fingerprint">
                <i className="fa-light fa-fingerprint fa-xl" /> Serrure
                biometrique à empreinte digitale
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="cameras">
                <i className="fa-light fa-camera-cctv fa-xl" /> Caméras de
                surveillance extérieures
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="extinguisher">
                <i className="fa-light fa-fire-extinguisher fa-xl" /> Extincteur
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="sensor">
                <i className="fa-light fa-sensor fa-xl" /> Détecteur de fumée
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="kitmedical">
                <i className="fa-light fa-kit-medical fa-xl" /> Kit de premiers
                secours
               </Checkbox>
              </Col>
             </Row>
             {/* Cuisine et salle à manger */}
             <Row>
              <Col xs={24}>
               <Text strong>
                <br />
                Cuisine et salle à manger
               </Text>
              </Col>
              <Col xs={12}>
               <Checkbox value="kitchen" style={{ lineHeight: 1 }}>
                <i className="fa-light fa-utensils fa-xl" /> Cuisine
                <br />
                <Text type="secondary">
                 Espace où les voyageurs peuvent cuisiner
                </Text>
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="fridge">
                <i className="fa-light fa-refrigerator fa-xl" /> Réfrigérateur
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="microwave">
                <i className="fa-light fa-microwave fa-xl" /> Microwave
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="oven">
                <i className="fa-light fa-oven fa-xl" /> Four à micro-ondes
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="kitchenset" style={{ lineHeight: 1 }}>
                <i className="fa-light fa-kitchen-set fa-xl" /> Équipements de
                cuisine de base
                <br />
                <Text type="secondary">
                 Casseroles et poêles, Bols, tasses, etc
                </Text>
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="blender">
                <i className="fa-light fa-blender fa-xl" /> Mixeur
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="fireburner">
                <i className="fa-light fa-fire-burner fa-xl" /> Cuisinière à gaz
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="coffeepot">
                <i className="fa-light fa-coffee-pot fa-xl" /> Café
               </Checkbox>
              </Col>
             </Row>
             {/* Internet et bureau  */}
             <Row>
              <Col xs={24}>
               <Text strong>
                <br />
                Internet et bureau
               </Text>
              </Col>
              <Col xs={12}>
               <Checkbox value="wifi">
                <i className="fa-light fa-wifi fa-xl" /> Wifi
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="dedicatedworkspace">
                <i className="fa-light fa-chair-office fa-xl" /> Espace de
                travail dédié
               </Checkbox>
              </Col>
             </Row>
             {/* Parking et installations */}
             <Row>
              <Col xs={24}>
               <Text strong>
                <br />
                Parking et installations
               </Text>
              </Col>
              <Col xs={12}>
               <Checkbox value="freeParking">
                <i className="fa-light fa-circle-parking fa-xl" /> Parking
                gratuit
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="paidParking">
                <i className="fa-light fa-square-parking fa-xl" /> Stationnement
                payant dans la rue
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="pool">
                <i className="fa-light fa-water-ladder fa-xl" /> Piscine
               </Checkbox>
              </Col>
              <Col xs={12}>
               <Checkbox value="garbageCan">
                <i className="fa-light fa-trash-can fa-xl" /> Benne à ordures
               </Checkbox>
              </Col>
             </Row>
            </Row>
           </Checkbox.Group>
          </Form.Item>
         </Col>

         <Col xs={24} md={24}>
          <Form.Item
           label="Règles de la maison:"
           name="houseRules"
           className="houseRules-checkbox-group"
          >
           <Checkbox.Group>
            <Row>
             <Col xs={24}>
              <Checkbox value="noNoise">Pas de bruit après 23h</Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="noFoodDrinks">
               Pas de nourriture ni de boissons dans les chambres à coucher
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="noParties">
               Pas de fêtes ni d'événements
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="noSmoking">Défense de fumer</Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="noPets">Pas d'animaux de compagnie</Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="noUnmarriedCouple">
               Pas de couple non marié
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox
               value="additionalRules"
               checked={showAdditionalRules}
               onChange={(e) => setShowAdditionalRules(e.target.checked)}
              >
               Règles supplémentaires
              </Checkbox>
             </Col>
            </Row>
           </Checkbox.Group>
          </Form.Item>
          {showAdditionalRules && (
           <Col xs={24} md={24}>
            <Form.Item label="Règles supplémentaires" value="AdditionalRules">
             <TextArea
              rows={4}
              value={additionalRules}
              onChange={(e) => setAdditionalRules(e.target.value)}
              showCount
              maxLength={255}
             />
            </Form.Item>
           </Col>
          )}
         </Col>
        </Row>
       </Col>
       <Col xs={24}>
        <Row gutter={[24, 0]}>
         <Col xs={24}>
          <Divider orientation="left">
           <Title level={4}>Les photos de votre logement</Title>
          </Divider>
          <ImgCrop aspect={640 / 426} rotationSlider>
           <Upload
            listType="picture-card"
            fileList={fileList}
            onPreview={handlePreview}
            onChange={handleChange}
            onRemove={handleRemove}
            disabled={uploading}
           >
            {fileList.length >= 8 ? null : (
             <div>
              {uploading ? (
               <div style={{ marginTop: 8 }}>Téléchargement en cours...</div>
              ) : (
               <button style={{ border: 0, background: 'none' }} type="button">
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Ajouter des Photos</div>
               </button>
              )}
             </div>
            )}
           </Upload>
          </ImgCrop>
          {previewOpen && (
           <Image
            wrapperStyle={{ display: 'none' }}
            preview={{
             visible: previewOpen,
             onVisibleChange: (visible) => setPreviewOpen(visible),
             afterOpenChange: (visible) => !visible && setPreviewImage(''),
            }}
            src={previewImage}
           />
          )}
         </Col>
         {fileList.length === 8 && (
          <Col xs={24}>
           <Alert
            message="Vous avez atteint le nombre maximum de photos."
            type="success"
           />
           <br />
          </Col>
         )}
        </Row>
       </Col>
       <Col xs={24} xl={12}>
        <Row gutter={[24, 0]}>
         <Col xs={24}>
          <Divider orientation="left">
           <h2 style={{ margin: 0 }}>Arrivée</h2>
          </Divider>
          <Form.Item
           label="Quand est l'heure la plus tôt à laquelle les invités peuvent s'enregistrer?"
           name="checkInTime"
          >
           <TimePicker
            format={format}
            showNow={false}
            size="large"
            onChange={setCheckInTime}
           />
          </Form.Item>
         </Col>
         <Col xs={24}>
          <Form.Item
           label="Sélectionnez les déclarations qui décrivent le mieux votre politique en matière de check-in anticipé."
           name="earlyCheckIn"
          >
           <Checkbox.Group>
            <Row>
             <Col xs={24}>
              <Checkbox value="heureNonFlexible">
               Malheureusement l'heure d'arrivée n'est pas flexible.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="ajustementHeure">
               À l'occasion il est possible d'ajuster votre heure d'arrivée si
               vous nous contactez.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="autreHeureArrivee">
               Lorsque que cela est possible, nous pouvons vous arranger en vous
               proposant une autre heure d’arrivée qui vous conviendrait mieux.
               Contactez nous à l’avance si vous souhaitez modifier votre heure
               d’arrivée.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="laissezBagages">
               Vous pouvez laissez vos bagages pendant la journée.
              </Checkbox>
             </Col>
            </Row>
           </Checkbox.Group>
          </Form.Item>
         </Col>
         <Col xs={24}>
          <Form.Item
           label="Sélectionnez les déclarations qui décrivent le mieux la manière dont vos invités accéderont à la propriété."
           name="accessToProperty"
          >
           <Checkbox.Group>
            <Row>
             <Col xs={24}>
              <Checkbox value="cleDansBoite">
               La clé de la maison se trouve dans la boîte à clé
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="acceuilContactezMoi">
               On sera là pour vous accueillir, sinon, contactez moi quand vous
               arrivez.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="codesAccesCourriel">
               Nous vous enverrons vos codes d’accès par courriel avant votre
               arrivée.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="verifiezCourriel">
               Vérifiez votre courriel pour les instructions relatives à votre
               arrivée.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="serrureNumero">
               Nous avons une serrure à numéro.
              </Checkbox>
             </Col>
            </Row>
           </Checkbox.Group>
          </Form.Item>
         </Col>
         <Col xs={24}>
          <Form.Item
           label="Quelles informations vos invités doivent-ils connaître pour accéder à la propriété ?"
           name="guestAccessInfo"
          >
           <TextArea showCount maxLength={500} />
          </Form.Item>
         </Col>

         {/* Fron image Input */}
         <Col xs={24} md={24}>
          <Form.Item
           label="Photo de la façade de la résidence ou de la maison."
           name="frontPhoto"
          >
           <div>
            <ImgCrop rotationSlider>
             <Upload
              listType="picture-card"
              fileList={fileList2}
              onPreview={handlePreview2}
              onChange={handleChange2}
             >
              {fileList2.length >= 1 ? null : uploadButton}
             </Upload>
            </ImgCrop>
            {previewImage2 && (
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
               visible: previewOpen2,
               onVisibleChange: (visible) => setPreviewOpen2(visible),
               afterOpenChange: (visible) => !visible && setPreviewImage2(''),
              }}
              src={previewImage2}
             />
            )}
           </div>
          </Form.Item>
         </Col>

         {/* Video URL Input */}
         <Col xs={24}>
          <Form.Item label="Lien vidéo pour les instructions d'enregistrement">
           <Input
            placeholder={
             !property.videoCheckIn
              ? "Entrez l'URL de la vidéo (Hébergez vos vidéos sur Vimeo ou Youtube avant)"
              : ''
            }
            value={videoURL}
            onChange={(e) => setVideoURL(e.target.value)} // Handle change
           />
          </Form.Item>

          {/* Show the video if videoURL exists */}
          {videoURL && (
           <div style={{ marginTop: '16px' }}>
            <ReactPlayer url={videoURL} controls={true} width="100%" />
           </div>
          )}
         </Col>
        </Row>
       </Col>
       <Col xs={24} xl={12}>
        <Row gutter={[24, 0]}>
         <Col xs={24}>
          <Divider orientation="left">
           <h2 style={{ margin: 0 }}>Départ</h2>
          </Divider>
          <Form.Item
           label="À quelle heure voulez-vous demander aux invités de quitter les lieux ?"
           name="checkOutTime"
          >
           <TimePicker
            format={format}
            showNow={false}
            size="large"
            onChange={setCheckOutTime}
           />
          </Form.Item>
         </Col>
         <Col xs={24}>
          <Form.Item
           label="Sélectionnez les déclarations qui décrivent le mieux votre politique de départ tardif :"
           name="lateCheckOutPolicy"
          >
           <Checkbox.Group>
            <Row>
             <Col xs={24}>
              <Checkbox value="heureNonFlexible">
               Malheureusement l'heure de départ n'est pas flexible.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="heureDepartAlternative">
               Lorsque l'horaire le permet, il nous fait plaisir d'accommoder
               une heure de départ alternative. Contactez-nous à l'avance si
               vous souhaitez prendre un arrangement à cet effet.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="contactezNous">
               Communiquez avec nous si vous aimeriez quitter plus tard.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="optionDepartTardif">
               Montrer l’option du départ tardif (si ce n’est pas coché on ne va
               pas le mentionner)
              </Checkbox>
             </Col>
            </Row>
           </Checkbox.Group>
          </Form.Item>
         </Col>
         <Col xs={24}>
          <Form.Item
           label="Que doivent faire les invités avant de partir ?"
           name="beforeCheckOut"
          >
           <Checkbox.Group>
            <Row>
             <Col xs={24}>
              <Checkbox value="laissezBagages">
               Vous pouvez laissez vos bagages dans la propriété après l’heure
               du départ.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="signezLivreOr">
               S’il vous plait, signez notre livre d’or avant de partir.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="litsNonFaits">
               Laissez les lits que vous avez utilisés défaits.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="laverVaisselle">
               Merci de laver et ranger vaisselle et plats utilisés.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="vaisselleLaveVaisselle">
               Mettez la vaisselle de dernière minute dans le lave-vaisselle.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="eteindreAppareilsElectriques">
               Merci de vous assurer que vous avez bien éteint la cuisinière,
               lumières et autres appareils électriques.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="replacezMeubles">
               Replacez les meubles à leur endroit original.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="deposePoubelles">
               Merci de déposer poubelles et déchets dans les containers
               appropriés.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="serviettesDansBaignoire">
               Mettez vos serviettes utilisées dans la baignoire.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="serviettesParTerre">
               Laissez les serviettes utilisées par terre.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="porteNonVerrouillee">
               Laissez la porte déverrouillée.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="portesVerrouillees">
               Assurez-vous que les portes sont verrouillées.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="laissezCleMaison">
               Laissez la clé dans la maison.
              </Checkbox>
             </Col>
             <Col xs={24}>
              <Checkbox value="laissezCleBoiteCle">
               Laissez la clé dans la boîte à clef.
              </Checkbox>
             </Col>
            </Row>
           </Checkbox.Group>
          </Form.Item>
         </Col>
         <Col xl={24}>
          <Form.Item
           label="Informations supplémentaires sur le départ :"
           name="additionalCheckOutInfo"
          >
           <TextArea showCount maxLength={500} />
          </Form.Item>
         </Col>
        </Row>
       </Col>
      </Row>
      <Row>
       <Col xs={24} md={24}>
        {successMessage && (
         <Alert message={successMessage} type="success" showIcon closable />
        )}
        {errorMessage && (
         <Alert message={errorMessage} type="error" showIcon closable />
        )}
       </Col>
      </Row>
      <br />
      <Row>
       <Col xs={24} md={24}>
        <Form.Item>
         <Button
          type="primary"
          shape="square"
          htmlType="submit"
          style={{ width: '100%' }}
         >
          Enregistrer
         </Button>
        </Form.Item>
       </Col>
      </Row>
     </Form>
    </Content>
   </Layout>
   <Foot />
  </Layout>
 );
};

export default EditProperty;
