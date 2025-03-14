import React, { useState, useEffect, useRef } from 'react';
import {
 Spin,
 Row,
 Col,
 Input,
 Button,
 Layout,
 Switch,
 Drawer,
 Checkbox,
 Typography,
 Slider,
 InputNumber,
 Space,
} from 'antd';
import { MinusOutlined } from '@ant-design/icons';
import Head from '../components/common/header';
import Foot from '../components/common/footer';
import MapHome from './components/MapHome';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Autocomplete } from '@react-google-maps/api';
import { useGoogleMapsLoader } from '../services/GoogleMapService';
import { getLocationForCityOrUser } from '../utils/utils';
import { useTranslation } from '../context/TranslationContext';
import './../App.css';
import PropertyList from './components/PropertyList';

const { Content } = Layout;
const { Title, Text } = Typography;

const Home = () => {
 const { t } = useTranslation();
 const isLoaded = useGoogleMapsLoader();
 const [searchCity, setSearchCity] = useState('');
 const [selectedCity, setSelectedCity] = useState('');
 const autocomplete = useRef(null);
 const [viewMode, setViewMode] = useState('list');
 const [openFilter, setOpenFilter] = useState(false);
 const [range, setRange] = useState([0, 10000]);
 const [roomValue, setRoomValue] = useState(0);
 const [paxValue, setPaxValue] = useState(0);
 const [checkedTypes, setCheckedTypes] = useState([]);
 const [showAllbasicEquipements, setShowAllBasicEquipements] = useState(false);
 const [checkedbasicEquipements, setCheckedbasicEquipements] = useState([]);

 const [mapCenter, setMapCenter] = useState(null); // Track map center

 const propertyTypes = [
  {
   label: t('type.house'),
   value: 'house',
   icon: <i className="checkboxicon fa-light fa-house"></i>,
  },
  {
   label: t('type.apartment'),
   value: 'apartment',
   icon: <i className="checkboxicon fa-light fa-building"></i>,
  },
  {
   label: t('type.guesthouse'),
   value: 'guesthouse',
   icon: <i className="checkboxicon fa-light fa-house-user"></i>,
  },
 ];
 const basicEquipements = [
  { value: 'kitchen', label: t('equipement.categories.kitchen') },
  { value: 'freeParking', label: t('equipement.freeParking') },
  { value: 'wifi', label: t('equipement.wifi') },
  { value: 'airConditioning', label: t('equipement.airConditioning') },
  { value: 'television', label: t('equipement.television') },
  { value: 'washingMachine', label: t('equipement.washingMachine') },
  { value: 'pool', label: t('equipement.pool') },
 ];

 useEffect(() => {
  const fetchLocation = async () => {
   const location = await getLocationForCityOrUser(searchCity); // Get the center location
   if (location) {
    setMapCenter(location);
   } else {
    setMapCenter({ lat: 34.0209, lng: -6.8416 });
   }
  };

  fetchLocation();
 }, [searchCity]);

 const handleCityChange = (city) => {
  setSearchCity(city || '');
  setSelectedCity(city);
 };
 const handlePlaceSelect = () => {
  if (autocomplete.current !== null) {
   const place = autocomplete.current.getPlace();
   setSearchCity(place.formatted_address);
  } else {
   console.error('Autocomplete is not loaded yet!');
  }
 };
 const showFilter = () => {
  setOpenFilter(true);
 };
 const onClose = () => {
  setOpenFilter(false);
 };
 const onClear = () => {
  setRange([0, 10000]);
  setRoomValue(0);
  setPaxValue(0);
  setCheckedTypes([]);
  setCheckedbasicEquipements([]);
 };
 const onSliderChange = (newRange) => {
  setRange(newRange);
 };
 const onMinChange = (value) => {
  setRange([value, range[1]]);
 };
 const onMaxChange = (value) => {
  setRange([range[0], value]);
 };
 const onChangeRoom = (newValue) => {
  setRoomValue(newValue);
 };
 const onChangePax = (newValue) => {
  setPaxValue(newValue);
 };
 const handleCheckboxChange = (checkedValues) => {
  setCheckedTypes(checkedValues);
 };

 const visiblebasicAmenitie = showAllbasicEquipements
  ? basicEquipements
  : basicEquipements.slice(0, 6);

 const toggleShowAllbasicEquipements = () => {
  setShowAllBasicEquipements(!showAllbasicEquipements);
 };
 const handleCheckboxChangebasicEquipements = (e, value) => {
  if (e.target.checked) {
   setCheckedbasicEquipements([...checkedbasicEquipements, value]);
  } else {
   setCheckedbasicEquipements(
    checkedbasicEquipements.filter((item) => item !== value)
   );
  }
 };

 if (!isLoaded || !mapCenter) {
  return (
   <div className="loading">
    <Spin size="large" />
   </div>
  );
 }
 return (
  <>
   <Layout className="contentStyle">
    <Head />
    <Content className="container">
     <Row gutter={[16, 16]}>
      <Col xs={searchCity.trim() ? 16 : 24} md={searchCity.trim() ? 22 : 24}>
       <div className="search-container">
        <i className="fa-light fa-magnifying-glass fa-xl search-icon"></i>
        <APIProvider>
         <Autocomplete
          onLoad={(auto) => {
           autocomplete.current = auto;
          }}
          onPlaceChanged={handlePlaceSelect}
          options={{
           componentRestrictions: { country: 'ma' }, // Restrict search to Morocco
          }}
         >
          <Input placeholder={t('home.searchPlaceholder')} />
         </Autocomplete>
        </APIProvider>
       </div>
      </Col>
      {searchCity.trim() && (
       <Col xs={8} md={2}>
        <Button
         size="large"
         icon={<i className="fa-light fa-filter"></i>}
         onClick={showFilter}
         block
        >
         {t('home.filters.title')}
        </Button>
       </Col>
      )}
      <Col xs={24} sm={24}>
       <div className="horizontal-scroll-container">
        <Button
         size="large"
         onClick={() => handleCityChange('Casablanca, Morocco')}
         type={selectedCity === 'Casablanca, Morocco' ? 'primary' : 'default'}
        >
         Casablanca
        </Button>
        <Button
         size="large"
         onClick={() => handleCityChange('Rabat, Morocco')}
         type={selectedCity === 'Rabat, Morocco' ? 'primary' : 'default'}
        >
         Rabat
        </Button>
        <Button
         size="large"
         onClick={() => handleCityChange('Marrakesh, Morocco')}
         type={selectedCity === 'Marrakesh, Morocco' ? 'primary' : 'default'}
        >
         Marrakesh
        </Button>
        <Button
         size="large"
         onClick={() => handleCityChange('Agadir, Morocco')}
         type={selectedCity === 'Agadir, Morocco' ? 'primary' : 'default'}
        >
         Agadir
        </Button>
        <Button
         size="large"
         onClick={() => handleCityChange('Tangier, Morocco')}
         type={selectedCity === 'Tangier, Morocco' ? 'primary' : 'default'}
        >
         Tangier
        </Button>
        <Button
         size="large"
         onClick={() => handleCityChange('Fes, Morocco')}
         type={selectedCity === 'Fes, Morocco' ? 'primary' : 'default'}
        >
         Fes
        </Button>
        <Button
         size="large"
         onClick={() => handleCityChange('Bouznika, Morocco')}
         type={selectedCity === 'Bouznika, Morocco' ? 'primary' : 'default'}
        >
         Bouznika
        </Button>
        <Button
         size="large"
         onClick={() => handleCityChange('Kénitra, Morocco')}
         type={selectedCity === 'Kénitra, Morocco' ? 'primary' : 'default'}
        >
         Kénitra
        </Button>
        <Button
         size="large"
         onClick={() => handleCityChange('Oujda, Morocco')}
         type={selectedCity === 'Oujda, Morocco' ? 'primary' : 'default'}
        >
         Oujda
        </Button>
        <Button
         size="large"
         onClick={() => handleCityChange('Tetouan, Morocco')}
         type={selectedCity === 'Tetouan, Morocco' ? 'primary' : 'default'}
        >
         Tetouan
        </Button>
        <Button
         size="large"
         onClick={() => handleCityChange('Al Hoceima, Morocco')}
         type={selectedCity === 'Al Hoceima, Morocco' ? 'primary' : 'default'}
        >
         Al Hoceima
        </Button>
        <Button
         size="large"
         onClick={() => handleCityChange('Ouarzazate, Morocco')}
         type={selectedCity === 'Ouarzazate, Morocco' ? 'primary' : 'default'}
        >
         Ouarzazate
        </Button>
       </div>
      </Col>
      <Col xs={24}>
       {viewMode === 'map' ? (
        <APIProvider>
         <MapHome
          isLoaded={isLoaded}
          city={searchCity}
          checkedTypes={checkedTypes}
          range={range}
          roomValue={roomValue}
          paxValue={paxValue}
          checkedbasicEquipements={checkedbasicEquipements}
         />
        </APIProvider>
       ) : (
        <PropertyList
         city={searchCity}
         mapCenter={mapCenter}
         checkedTypes={checkedTypes}
         range={range}
         roomValue={roomValue}
         paxValue={paxValue}
         checkedbasicEquipements={checkedbasicEquipements}
        />
       )}
      </Col>
     </Row>
     <br />
     <Row justify="center">
      <Col xs={14} md={4}>
       <Switch
        checkedChildren={
         <>
          <i className="fa-light fa-map-location-dot" /> {t('home.showMap')}
         </>
        }
        unCheckedChildren={
         <>
          <i className="fa-light fa-grid-2" /> {t('home.showList')}
         </>
        }
        checked={viewMode === 'list'}
        onChange={(checked) => setViewMode(checked ? 'list' : 'map')}
        size="large"
        className="custom-switch"
       />
      </Col>
     </Row>
    </Content>
    <Foot />
   </Layout>
   <Drawer
    title={t('home.filters.title')}
    onClose={onClose}
    open={openFilter}
    placement="left"
    size="large"
    extra={
     <Space>
      <Button onClick={onClear}>{t('home.filters.clearAll')}</Button>
      <Button type="primary" onClick={onClose}>
       {t('home.filters.show')}
      </Button>
     </Space>
    }
   >
    <Row gutter={[16, 16]}>
     <Col xs={24}>
      <Title level={4}>{t('home.filters.propertyType')}</Title>
      <Checkbox.Group
       value={checkedTypes}
       onChange={handleCheckboxChange}
       style={{ width: '100%' }}
      >
       {propertyTypes.map((PropertyType) => (
        <div className="customCheckboxContainer" key={PropertyType.value}>
         <Checkbox value={PropertyType.value}>
          <div
           className={
            checkedTypes.includes(PropertyType.value)
             ? 'customCheckboxButton customCheckboxChecked'
             : 'customCheckboxButton'
           }
          >
           {PropertyType.icon}
           <div>{PropertyType.label}</div>
          </div>
         </Checkbox>
        </div>
       ))}
      </Checkbox.Group>
     </Col>

     <Col xs={24}>
      <Title level={4}>{t('home.filters.priceRange')}</Title>
      <Row align="middle" gutter={16}>
       <Col xs={24}>
        <Slider
         range
         step={100}
         min={0}
         max={10000}
         onChange={onSliderChange}
         value={range}
        />
       </Col>
       <Col xs={11}>
        <InputNumber
         step={100}
         min={0}
         max={10000}
         value={range[0]}
         onChange={onMinChange}
         formatter={(value) =>
          `${t('home.filters.min')} ${value}`.replace(
           /\B(?=(\d{3})+(?!\d))/g,
           ','
          )
         }
         size="large"
         style={{ width: '100%' }}
        />
       </Col>
       <Col xs={2}>
        <MinusOutlined />
       </Col>
       <Col xs={11}>
        <InputNumber
         step={100}
         min={0}
         max={10000}
         value={range[1]}
         formatter={(value) =>
          `${t('home.filters.max')} ${value}`.replace(
           /\B(?=(\d{3})+(?!\d))/g,
           ','
          )
         }
         parser={(value) => value.replace(/Maximum\s?|(,*)/g, '')}
         onChange={onMaxChange}
         size="large"
         style={{ width: '100%' }}
        />
       </Col>
      </Row>
     </Col>

     <Col xs={24}>
      <Title level={4}>{t('home.filters.roomsAndCapacity')}</Title>
      <Col xs={24}>
       <Text>{t('home.filters.rooms')}</Text>
       <Row gutter={[16, 16]}>
        <Col span={18}>
         <Slider
          min={0}
          max={5}
          onChange={onChangeRoom}
          value={typeof roomValue === 'number' ? roomValue : 0}
         />
        </Col>
        <Col xs={6}>
         {roomValue > 0 ? (
          <InputNumber
           min={1}
           max={5}
           value={roomValue}
           onChange={onChangeRoom}
           style={{ width: '100%' }}
          />
         ) : (
          <InputNumber
           min={0}
           max={5}
           placeholder={t('home.filters.all')}
           variant="filled"
           style={{ width: '100%' }}
           onFocus={() => setRoomValue(1)} // Set a default minimum value when focused
          />
         )}
        </Col>
       </Row>
      </Col>

      <Col xs={24}>
       <Text>
        <Text>{t('home.filters.maxPeople')}</Text>
       </Text>
       <Row gutter={[16, 16]}>
        <Col span={18}>
         <Slider
          min={0}
          max={5}
          onChange={onChangePax}
          value={typeof paxValue === 'number' ? paxValue : 0}
         />
        </Col>
        <Col xs={6}>
         {paxValue > 0 ? (
          <InputNumber
           min={1}
           max={5}
           value={paxValue}
           onChange={onChangePax}
           style={{ width: '100%' }}
          />
         ) : (
          <InputNumber
           min={0}
           max={5}
           placeholder={t('home.filters.all')}
           variant="filled"
           style={{ width: '100%' }}
           onFocus={() => setPaxValue(1)} // Set a default minimum value when focused
          />
         )}
        </Col>
       </Row>
      </Col>
     </Col>

     <Col xs={24}>
      <Title level={4}>{t('home.filters.basicEquipements')}</Title>
      <Row gutter={[16, 16]}>
       {visiblebasicAmenitie.map((item, index) => (
        <Col xs={12} md={8} key={index}>
         <Checkbox
          value={item.value}
          checked={checkedbasicEquipements.includes(item.value)}
          onChange={(e) => handleCheckboxChangebasicEquipements(e, item.value)}
         >
          {item.label}
         </Checkbox>
        </Col>
       ))}
      </Row>
      <Button
       onClick={toggleShowAllbasicEquipements}
       style={{ marginTop: '20px' }}
      >
       {showAllbasicEquipements
        ? t('home.filters.showLess')
        : t('home.filters.showMore')}
      </Button>
     </Col>
    </Row>
   </Drawer>
  </>
 );
};

export default Home;
