import { Card, Button, Image } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AddPropertyImg from '../../assets/building-bro.png';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/TranslationContext';

const AddPropertyCard = ({ userData }) => {
 const { t } = useTranslation();
 const navigate = useNavigate();

 return (
  <Card
   style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
   bordered={false}
   cover={<Image src={AddPropertyImg} width={380} preview={false} />}
  >
   <Button
    type="default"
    icon={<i className="fa-regular fa-circle-plus fa-xl"></i>}
    size="large"
    onClick={() => navigate('/addproperty')}
    style={{ width: 260, height: 48 }}
   >
    {t('property.addButton')}
   </Button>
  </Card>
 );
};

export default AddPropertyCard;
