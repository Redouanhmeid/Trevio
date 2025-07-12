import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Result } from 'antd';
import { useTranslation } from '../context/TranslationContext';

const NotFoundPage = () => {
 const { t } = useTranslation();

 return (
  <div className="loading">
   <Result
    status="404"
    title="404"
    subTitle={t('error.pageNotFound')}
    extra={
     <Link to="/">
      <Button type="primary">{t('common.home')}</Button>
     </Link>
    }
   />
  </div>
 );
};

export default NotFoundPage;
