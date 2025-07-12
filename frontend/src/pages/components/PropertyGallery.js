import React, { useState } from 'react';
import { Image, Button, Space } from 'antd';
import { PictureOutlined } from '@ant-design/icons';

export const PropertyGallery = ({ images, t }) => {
 const [visible, setVisible] = useState(false);
 const [imageAspectRatios, setImageAspectRatios] = useState({});

 const handleImageLoad = (e, index) => {
  const { naturalWidth, naturalHeight } = e.target;
  const aspectRatio = naturalHeight > naturalWidth && 'portrait';

  setImageAspectRatios((prevState) => ({
   ...prevState,
   [index]: aspectRatio,
  }));
 };

 return (
  <div className="gallery-container">
   {/* Main large image */}
   <div className="main-image">
    <Image
     src={images[0]}
     alt="Property"
     className={`card-image ${imageAspectRatios[0] || ''}`}
     onLoad={(e) => handleImageLoad(e, 0)}
     preview={{
      visible: false,
      onVisibleChange: (vis) => setVisible(vis),
     }}
    />
   </div>

   {/* Thumbnails */}
   <div className="thumbnail-container">
    {images.slice(1, 3).map((image, index) => (
     <div key={index} className="thumbnail">
      <Image
       src={image}
       alt={`Property ${index + 2}`}
       className={`card-image ${imageAspectRatios[index + 1] || ''}`}
       onLoad={(e) => handleImageLoad(e, index + 1)}
       alt={`Property ${index + 2}`}
       style={{ objectFit: 'cover' }}
       preview={{
        visible: false,
        onVisibleChange: (vis) => setVisible(vis),
       }}
      />
     </div>
    ))}
   </div>

   {/* Show all photos button */}
   <Button type="default" size="large" onClick={() => setVisible(true)}>
    <PictureOutlined />
    {t('property.showAllPhotos')}
   </Button>

   {/* Preview group for all images */}
   <div style={{ display: 'none' }}>
    <Image.PreviewGroup
     preview={{
      visible,
      onVisibleChange: (vis) => setVisible(vis),
     }}
    >
     {images.map((image, index) => (
      <Image key={index} src={image} alt={`Property ${index + 1}`} />
     ))}
    </Image.PreviewGroup>
   </div>
  </div>
 );
};
