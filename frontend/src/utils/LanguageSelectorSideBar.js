import { Dropdown, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useTranslation } from '../context/TranslationContext';
import getLanguages from './languages';

export const LanguageSelectorSideBar = () => {
 const { t, currentLanguage, setLanguage } = useTranslation();

 const menuItems = {
  items: getLanguages(currentLanguage).map((option) => ({
   key: option.value,
   label: option.label,
   onClick: () => setLanguage(option.value),
  })),
 };

 return (
  <Dropdown menu={menuItems} trigger={['click']} placement="bottomLeft">
   <Space>
    {t('common.language')}
    <DownOutlined />
   </Space>
  </Dropdown>
 );
};
