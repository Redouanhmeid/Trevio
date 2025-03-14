import React, { useMemo } from 'react';
import { Row, Col, Divider, Card, Typography, Image, Grid } from 'antd';
import ReactPlayer from 'react-player';
import { useTranslation } from '../../context/TranslationContext';

const { Text, Paragraph } = Typography;
const { Meta } = Card;
const { useBreakpoint } = Grid;

const equipementIcons = {
 shower: <i className="PrimaryColor fa-regular fa-shower fa-xl" />,
 jacuzzi: <i className="PrimaryColor fa-regular fa-hot-tub-person fa-xl" />,
 bathtub: <i className="PrimaryColor fa-regular fa-bath fa-xl" />,
 washingMachine: (
  <i className="PrimaryColor fa-regular fa-washing-machine fa-xl" />
 ),
 dryerheat: <i className="PrimaryColor fa-regular fa-dryer-heat fa-xl" />,
 vacuum: <i className="PrimaryColor fa-regular fa-vacuum fa-xl" />,
 vault: <i className="PrimaryColor fa-regular fa-vault fa-xl" />,
 babybed: <i className="PrimaryColor fa-regular fa-baby fa-xl" />,
 television: <i className="PrimaryColor fa-regular fa-tv fa-xl" />,
 speaker: <i className="PrimaryColor fa-regular fa-speaker fa-xl" />,
 gameconsole: <i className="PrimaryColor fa-regular fa-gamepad-modern fa-xl" />,
 oven: <i className="PrimaryColor fa-regular fa-oven fa-xl" />,
 microwave: <i className="PrimaryColor fa-regular fa-microwave fa-xl" />,
 coffeemaker: <i className="PrimaryColor fa-regular fa-coffee-pot fa-xl" />,
 fridge: <i className="PrimaryColor fa-regular fa-refrigerator fa-xl" />,
 fireburner: <i className="PrimaryColor fa-regular fa-fire-burner fa-xl" />,
 heating: (
  <i className="PrimaryColor fa-regular fa-temperature-arrow-up fa-xl" />
 ),
 airConditioning: <i className="PrimaryColor fa-regular fa-snowflake fa-xl" />,
 fireplace: <i className="PrimaryColor fa-regular fa-fireplace fa-xl" />,
 ceilingfan: <i className="PrimaryColor fa-regular fa-fan fa-xl" />,
 tablefan: <i className="PrimaryColor fa-regular fa-fan-table fa-xl" />,
 fingerprint: <i className="PrimaryColor fa-regular fa-fingerprint fa-xl" />,
 lockbox: <i className="PrimaryColor fa-regular fa-lock-hashtag fa-xl" />,
 parkingaccess: (
  <i className="PrimaryColor fa-regular fa-square-parking fa-xl" />
 ),
 wifi: <i className="PrimaryColor fa-regular fa-wifi fa-xl" />,
 dedicatedworkspace: (
  <i className="PrimaryColor fa-regular fa-chair-office fa-xl" />
 ),
 freeParking: <i className="PrimaryColor fa-regular fa-circle-parking fa-xl" />,
 paidParking: <i className="PrimaryColor fa-regular fa-square-parking fa-xl" />,
 pool: <i className="PrimaryColor fa-regular fa-water-ladder fa-xl" />,
 garbageCan: <i className="PrimaryColor fa-regular fa-trash-can fa-xl" />,
};

const EquipementCard = React.memo(
 ({
  equipement,
  description,
  media,
  wifiName,
  wifiPassword,
  shouldBeFullRow,
 }) => {
  const { t } = useTranslation();
  const screens = useBreakpoint();
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

  return (
   <Card
    hoverable={false}
    bordered={false}
    style={{ width: '100%', textAlign: 'center' }}
    cover={
     ReactPlayer.canPlay(media) ? (
      <ReactPlayer
       url={media}
       controls
       width="100%"
       height={screens.xs ? 240 : 220}
      />
     ) : (
      <Image
       src={media}
       height={screens.xs ? 240 : 220}
       style={{ objectFit: 'cover', borderRadius: 16 }}
      />
     )
    }
   >
    <Meta
     title={
      <>
       {equipementIcons[equipement]}
       <Text strong style={{ fontSize: 16, marginLeft: 6 }}>
        {equipementTitles[equipement]}
       </Text>
      </>
     }
     description={
      <>
       {equipement === 'wifi' && (
        <>
         <br />
         <Paragraph>
          <Text strong>{t('equipement.wifiName')}: </Text>
          {wifiName}
         </Paragraph>
         <Paragraph>
          <Text strong>{t('equipement.wifiPassword')}: </Text>
          <Text copyable>{wifiPassword}</Text>
         </Paragraph>
        </>
       )}
       <Paragraph
        ellipsis={{
         rows: 4,
         expandable: true,
         symbol: t('button.readMore'),
        }}
       >
        {description}
       </Paragraph>
      </>
     }
    />
   </Card>
  );
 }
);

const HouseManual = React.memo(({ equipements }) => {
 const { t } = useTranslation();
 const equipementCategories = {
  [t('equipement.categories.bathroom')]: ['shower', 'jacuzzi', 'bathtub'],
  [t('equipement.categories.bedroomLinen')]: [
   'washingMachine',
   'dryerheat',
   'vacuum',
   'vault',
   'babybed',
  ],
  [t('equipement.categories.entertainment')]: [
   'television',
   'speaker',
   'gameconsole',
  ],
  [t('equipement.categories.kitchenDiningRoom')]: [
   'oven',
   'microwave',
   'coffeemaker',
   'fridge',
   'fireburner',
  ],
  [t('equipement.categories.heatingCooling')]: [
   'heating',
   'airConditioning',
   'fireplace',
   'ceilingfan',
   'tablefan',
  ],
  [t('equipement.categories.homeSecurity')]: [
   'fingerprint',
   'lockbox',
   'parkingaccess',
  ],
  [t('equipement.categories.internetOffice')]: ['wifi', 'dedicatedworkspace'],
  [t('equipement.categories.parkingFacilities')]: [
   'freeParking',
   'paidParking',
   'pool',
   'garbageCan',
  ],
 };

 const availableEquipements = useMemo(() => {
  return Object.entries(equipementCategories).reduce(
   (acc, [category, categoryEquipements]) => {
    const available = categoryEquipements.filter(
     (equipement) => equipements[equipement]
    );
    if (available.length > 0) {
     acc[category] = available;
    }
    return acc;
   },
   {}
  );
 }, [equipements]);
 return (
  <Row gutter={[16, 16]}>
   {Object.entries(availableEquipements).map(
    ([category, categoryEquipements]) => (
     <Col key={category} xs={24} md={12}>
      <Divider orientation="left">
       <Text strong className="PrimaryColor" style={{ fontSize: 20 }}>
        {category}
       </Text>
      </Divider>
      <Row gutter={[16, 16]}>
       {categoryEquipements.map((equipement, index) => {
        return (
         <Col key={equipement} xs={24} md={12}>
          <EquipementCard
           equipement={equipement}
           description={equipements[equipement].description}
           media={equipements[equipement].media}
           wifiName={equipements[equipement].wifiName}
           wifiPassword={equipements[equipement].wifiPassword}
          />
         </Col>
        );
       })}
      </Row>
     </Col>
    )
   )}
  </Row>
 );
});

export default HouseManual;
