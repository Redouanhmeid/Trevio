import React, { useState, useEffect } from 'react';
import {
 Row,
 Col,
 Form,
 Button,
 Typography,
 message,
 Card,
 Spin,
 List,
 Space,
 Empty,
 Modal,
 Flex,
 Badge,
 Image,
 Grid,
 Tooltip,
} from 'antd';
import {
 SaveOutlined,
 PlusOutlined,
 EditOutlined,
 EyeOutlined,
} from '@ant-design/icons';
import fallback from '../../../../assets/fallback.png';
import { useTranslation } from '../../../../context/TranslationContext';
import useEquipement from '../../../../hooks/useEquipement';
import { useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import AddEquipment from './AddEquipment';
import EditEquipment from './EditEquipment';

const { Title, Text } = Typography;
const { Meta } = Card;
const { useBreakpoint } = Grid;

const PropertyHouseManual = ({ property, propertyId, onPropertyUpdated }) => {
 const { t } = useTranslation();
 const screens = useBreakpoint();
 const navigate = useNavigate();
 const [form] = Form.useForm();
 const { getAllEquipements, getOneEquipement } = useEquipement();

 const [equipements, setEquipements] = useState([]);
 const [selectedEquipementDetails, setSelectedEquipementDetails] =
  useState(null);
 const [isModalVisible, setIsModalVisible] = useState(false);
 const [isAddModalVisible, setIsAddModalVisible] = useState(false);
 const [isEditModalVisible, setIsEditModalVisible] = useState(false);
 const [selectedEquipmentToAdd, setSelectedEquipmentToAdd] = useState(null);
 const [selectedEquipmentToEdit, setSelectedEquipmentToEdit] = useState(null);
 const [loading, setLoading] = useState(true);

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

 // Fetch equipements
 useEffect(() => {
  const fetchEquipements = async () => {
   setLoading(true);
   try {
    const data = await getAllEquipements(propertyId);
    if (data && Array.isArray(data)) {
     setEquipements(data);
    } else {
     setEquipements([]);
    }
   } catch (error) {
    console.error('Error fetching equipements:', error);
    setEquipements([]);
   } finally {
    setLoading(false);
   }
  };

  if (propertyId) {
   fetchEquipements();
  }
 }, [propertyId]);

 // Check if an equipment has a card created
 const hasEquipement = (equipementName) => {
  return (
   Array.isArray(equipements) &&
   equipements.some((equipement) => equipement.name === equipementName)
  );
 };

 // View equipment card details
 const showModal = async (equipementName) => {
  try {
   const equipement = equipements.find((a) => a.name === equipementName);
   if (equipement) {
    const equipementDetails = await getOneEquipement(equipement.id);
    setSelectedEquipementDetails(equipementDetails);
    setIsModalVisible(true);
   }
  } catch (error) {
   console.error('Error fetching equipment details:', error);
   message.error(t('equipment.fetchError'));
  }
 };

 // Handle modal close
 const handleOk = () => {
  setIsModalVisible(false);
  setSelectedEquipementDetails(null);
 };

 const handleCancel = () => {
  setIsModalVisible(false);
  setSelectedEquipementDetails(null);
 };

 // Add a new equipment card
 const addEquipementCard = (equipement) => {
  setSelectedEquipmentToAdd(equipement);
  setIsAddModalVisible(true);
 };

 // Handle successful equipment addition
 const handleEquipmentAdded = () => {
  setIsAddModalVisible(false);
  // Refresh equipment list
  const fetchEquipements = async () => {
   setLoading(true);
   try {
    const data = await getAllEquipements(propertyId);
    if (data && Array.isArray(data)) {
     setEquipements(data);
    }
   } catch (error) {
    console.error('Error fetching equipements:', error);
   } finally {
    setLoading(false);
   }
  };
  fetchEquipements();

  // Call parent update function if available
  if (onPropertyUpdated) {
   onPropertyUpdated();
  }
 };

 // Edit existing equipment card
 const editEquipementCard = async (id) => {
  try {
   const equipmentDetails = await getOneEquipement(id);
   setSelectedEquipmentToEdit(equipmentDetails);
   setIsEditModalVisible(true);
  } catch (error) {
   console.error('Error fetching equipment details for editing:', error);
   message.error(t('equipment.fetchError'));
  }
 };

 // Handle successful equipment update
 const handleEquipmentUpdated = () => {
  setIsEditModalVisible(false);
  setSelectedEquipmentToEdit(null);

  // Refresh equipment list
  const fetchEquipements = async () => {
   setLoading(true);
   try {
    const data = await getAllEquipements(propertyId);
    if (data && Array.isArray(data)) {
     setEquipements(data);
    }
   } catch (error) {
    console.error('Error fetching equipements:', error);
   } finally {
    setLoading(false);
   }
  };
  fetchEquipements();

  // Call parent update function if available
  if (onPropertyUpdated) {
   onPropertyUpdated();
  }
 };

 // Equipement icon mapping
 const getEquipementIcon = (name) => {
  const icons = {
   shower: 'fa-shower',
   jacuzzi: 'fa-hot-tub-person',
   bathtub: 'fa-bath',
   washingMachine: 'fa-washing-machine',
   dryerheat: 'fa-dryer-heat',
   vacuum: 'fa-vacuum',
   vault: 'fa-vault',
   babybed: 'fa-baby',
   television: 'fa-tv',
   speaker: 'fa-speaker',
   gameconsole: 'fa-gamepad-modern',
   oven: 'fa-oven',
   microwave: 'fa-microwave',
   coffeemaker: 'fa-coffee-pot',
   fridge: 'fa-refrigerator',
   fireburner: 'fa-fire-burner',
   heating: 'fa-temperature-arrow-up',
   airConditioning: 'fa-snowflake',
   fireplace: 'fa-fireplace',
   ceilingfan: 'fa-fan',
   tablefan: 'fa-fan-table',
   fingerprint: 'fa-fingerprint',
   parkingaccess: 'fa-square-parking',
   wifi: 'fa-wifi',
   dedicatedworkspace: 'fa-chair-office',
   freeParking: 'fa-circle-parking',
   paidParking: 'fa-square-parking',
   pool: 'fa-water-ladder',
   garbageCan: 'fa-trash-can',
   soap: 'fa-soap',
   hotwater: 'fa-heat',
   basicequipement: 'fa-box-open',
   blankets: 'fa-blanket',
   mattresspillow: 'fa-mattress-pillow',
   cameras: 'fa-camera-cctv',
   kitchen: 'fa-sink',
   kitchenset: 'fa-kitchen-set',
   coffeepot: 'fa-coffee-pot',
  };

  return icons[name] || 'fa-question';
 };

 const renderEquipmentCardCover = (equipment) => {
  const media = equipment.media;

  if (!media) {
   // Fallback to icon if no media is available
   return (
    <div
     style={{
      height: 40,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f9f9f9',
     }}
    >
     <i
      className={`fa-light ${getEquipementIcon(
       equipment.name
      )} fa-3x PrimaryColor`}
     />
    </div>
   );
  }
  if (ReactPlayer.canPlay(media)) {
   return (
    <div style={{ height: screens.xs ? 140 : 180 }}>
     <ReactPlayer
      url={media}
      controls
      width="100%"
      height="100%"
      style={{
       borderTopLeftRadius: 8,
       borderTopRightRadius: 8,
       overflow: 'hidden',
      }}
     />
    </div>
   );
  } else {
   return (
    <div style={{ height: screens.xs ? 140 : 180, overflow: 'hidden' }}>
     <Image
      src={media}
      alt={t(`equipement.${equipment.name}`)}
      style={{
       width: '100%',
       height: '100%',
       objectFit: 'cover',
       borderTopLeftRadius: 8,
       borderTopRightRadius: 8,
      }}
      preview={false}
      fallback={fallback}
     />
    </div>
   );
  }
 };

 const renderUncreatedEquipmentCover = (equipmentName) => {
  return (
   <div
    style={{
     height: 120,
     display: 'flex',
     justifyContent: 'center',
     alignItems: 'center',
     backgroundColor: '#f9f9f9',
     opacity: 0.7,
    }}
   >
    <i
     className={`fa-light ${getEquipementIcon(
      equipmentName
     )} fa-3x PrimaryColor`}
    />
   </div>
  );
 };

 if (loading) {
  return (
   <div className="loading">
    <Spin size="large" />
   </div>
  );
 }

 const parsedBasicEquipements = parseArrayProperty(property.basicEquipements);

 return (
  <Card
   bordered={false}
   title={
    <Title level={4} style={{ margin: 0 }}>
     <i className="fa-light fa-cards" style={{ marginRight: 8 }} />
     {t('equipment.cards')}
    </Title>
   }
  >
   {parsedBasicEquipements.length === 0 ? (
    <Empty description={t('equipment.noEquipments')} />
   ) : (
    <>
     <Title level={5}>{t('equipment.existingCards')}</Title>
     <Row gutter={[16, 16]}>
      {equipements.map((equipement) => (
       <Col xs={24} sm={12} md={8} lg={6} key={equipement.id}>
        <Card
         hoverable
         actions={[
          <Button
           icon={<EyeOutlined />}
           type="text"
           onClick={() => showModal(equipement.name)}
          >
           {t('common.view')}
          </Button>,
          <Button
           icon={<EditOutlined />}
           type="text"
           onClick={() => editEquipementCard(equipement.id)}
          >
           {t('common.edit')}
          </Button>,
         ]}
         cover={renderEquipmentCardCover(equipement)}
        >
         <Meta
          title={t(`equipement.${equipement.name}`)}
          description={
           equipement.description
            ? equipement.description.length > 50
              ? `${equipement.description.substring(0, 50)}...`
              : equipement.description
            : t('equipment.noDescription')
          }
         />
        </Card>
       </Col>
      ))}
     </Row>

     <Divider style={{ margin: '24px 0' }} />

     <Title level={5}>{t('equipment.availableEquipments')}</Title>
     <Row gutter={[16, 16]}>
      {parsedBasicEquipements
       .filter((item) => !hasEquipement(item))
       .map((item) => (
        <Col xs={12} sm={8} md={6} lg={4} key={item}>
         <Badge.Ribbon text={t('equipment.needsCard')} color="blue">
          <Card
           hoverable
           style={{
            opacity: '0.7',
            height: '100%', // Makes all cards same height
           }}
           actions={[
            <Button
             icon={<PlusOutlined />}
             type="text"
             onClick={() => addEquipementCard(item)}
            >
             {t('equipment.addCard')}
            </Button>,
           ]}
           cover={renderUncreatedEquipmentCover(item)}
          >
           <Meta
            title={
             <Tooltip title={t(`equipement.${item}`)}>
              <div
               style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
               }}
              >
               {t(`equipement.${item}`)}
              </div>
             </Tooltip>
            }
            description={
             <div
              style={{
               height: '40px', // Fixed height for description
               overflow: 'hidden',
              }}
             >
              {t('equipment.noCardYet')}
             </div>
            }
           />
          </Card>
         </Badge.Ribbon>
        </Col>
       ))}
     </Row>
    </>
   )}

   {/* Equipment Detail Modal */}
   <Modal
    title={
     selectedEquipementDetails
      ? t(`equipement.${selectedEquipementDetails.name}`)
      : ''
    }
    open={isModalVisible}
    onOk={handleOk}
    onCancel={handleCancel}
    footer={[
     <Button
      key="edit"
      type="primary"
      onClick={() => {
       handleCancel();
       if (selectedEquipementDetails) {
        editEquipementCard(selectedEquipementDetails.id);
       }
      }}
     >
      {t('common.edit')}
     </Button>,
     <Button key="close" onClick={handleCancel}>
      {t('common.close')}
     </Button>,
    ]}
    width={700}
   >
    {selectedEquipementDetails && (
     <Flex vertical align="center" gap="large">
      {ReactPlayer.canPlay(selectedEquipementDetails.media) ? (
       <ReactPlayer
        url={selectedEquipementDetails.media}
        controls
        width="100%"
        height={300}
       />
      ) : (
       <Image
        width="100%"
        height={300}
        style={{ objectFit: 'contain' }}
        src={selectedEquipementDetails.media}
        alt={t(`equipement.${selectedEquipementDetails.name}`)}
        fallback={fallback}
       />
      )}

      <Text style={{ fontSize: 16, textAlign: 'center' }}>
       {selectedEquipementDetails.description || t('equipment.noDescription')}
      </Text>

      {selectedEquipementDetails.name === 'wifi' && (
       <Card style={{ width: '100%' }}>
        <Flex vertical gap="small">
         <Flex justify="space-between">
          <Text strong>{t('equipment.wifiName')}:</Text>
          <Text>{selectedEquipementDetails.wifiName || '-'}</Text>
         </Flex>
         <Flex justify="space-between">
          <Text strong>{t('equipment.wifiPassword')}:</Text>
          <Text>{selectedEquipementDetails.wifiPassword || '-'}</Text>
         </Flex>
        </Flex>
       </Card>
      )}
     </Flex>
    )}
   </Modal>

   {/* Add Equipment Modal */}
   <Modal
    open={isAddModalVisible}
    onCancel={() => setIsAddModalVisible(false)}
    footer={null}
    width={700}
    destroyOnClose={true}
   >
    {selectedEquipmentToAdd && (
     <AddEquipment
      equipmentName={selectedEquipmentToAdd}
      propertyId={propertyId}
      onSuccess={handleEquipmentAdded}
      onCancel={() => setIsAddModalVisible(false)}
     />
    )}
   </Modal>

   {/* Edit Equipment Modal */}
   <Modal
    open={isEditModalVisible}
    onCancel={() => setIsEditModalVisible(false)}
    footer={null}
    width={700}
    destroyOnClose={true}
   >
    {selectedEquipmentToEdit && (
     <EditEquipment
      equipment={selectedEquipmentToEdit}
      onSuccess={handleEquipmentUpdated}
      onCancel={() => setIsEditModalVisible(false)}
     />
    )}
   </Modal>
  </Card>
 );
};

const Divider = ({ style = {} }) => (
 <div
  style={{
   height: 1,
   backgroundColor: '#f0f0f0',
   margin: '16px 0',
   ...style,
  }}
 />
);

export default PropertyHouseManual;
