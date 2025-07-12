import { Dropdown } from 'antd';
import { useTranslation } from '../context/TranslationContext';
import getLanguages from './languages';

export const LanguageSelector = () => {
 const { currentLanguage, setLanguage } = useTranslation();

 const menuItems = {
  items: getLanguages(currentLanguage).map((option) => ({
   key: option.value,
   label: option.label,
   onClick: () => setLanguage(option.value),
  })),
 };

 return (
  <Dropdown menu={menuItems} trigger={['click']} placement="bottomRight">
   <i className="language-selector fa-light fa-globe" />
  </Dropdown>
 );
};
