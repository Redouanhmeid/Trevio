import { Space } from 'antd';
import { FR, US } from 'country-flag-icons/react/3x2';

const flagStyle = {
 width: 16,
 height: 13,
 position: 'relative',
 top: 2,
};

const LanguageOption = ({ value, label, FlagComponent, isActive }) => (
 <Space
  style={{
   color: isActive ? '#6D5FFA' : 'inherit',
   fontWeight: isActive ? 600 : 500,
  }}
 >
  <FlagComponent style={flagStyle} />
  {label}
 </Space>
);

const createOption = (value, label, FlagComponent, currentLanguage) => ({
 value,
 label: (
  <LanguageOption
   value={value}
   label={label}
   FlagComponent={FlagComponent}
   isActive={currentLanguage === value}
  />
 ),
});

const getLanguages = (currentLanguage) => [
 createOption('fr', 'Français', FR, currentLanguage),
 createOption('en', 'English', US, currentLanguage),
];

export default getLanguages;
