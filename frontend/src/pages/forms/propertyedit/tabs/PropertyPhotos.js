import React, { useState, useEffect } from 'react';
import {
 Row,
 Col,
 Form,
 Button,
 Typography,
 message,
 Card,
 Alert,
 Spin,
 Upload,
 Image,
 Space,
 Divider,
 Progress,
} from 'antd';
import { SaveOutlined, PlusOutlined } from '@ant-design/icons';
import {
 DndContext,
 TouchSensor,
 closestCenter,
 PointerSensor,
 useSensor,
 useSensors,
 defaultDropAnimation,
} from '@dnd-kit/core';
import {
 SortableContext,
 arrayMove,
 useSortable,
 verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from '../../../../context/TranslationContext';
import useUpdateProperty from '../../../../hooks/useUpdateProperty';
import useUploadPhotos from '../../../../hooks/useUploadPhotos';
import ImgCrop from 'antd-img-crop';

const { Title, Text } = Typography;

const getBase64 = (file) =>
 new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
 });

const DraggableUploadListItem = ({ originNode, file }) => {
 const {
  attributes,
  listeners,
  setNodeRef,
  transform,
  transition,
  isDragging,
 } = useSortable({
  id: file.uid,
 });
 const style = {
  transform: CSS.Transform.toString(transform),
  transition,
  cursor: 'move',
  border: isDragging ? '2px solid #1890ff' : 'none',
  touchAction: 'none',
 };
 return (
  <div
   ref={setNodeRef}
   style={style}
   {...attributes}
   {...listeners}
   className={isDragging ? 'dragging' : ''}
  >
   {originNode}
  </div>
 );
};

const PropertyPhotos = ({ property, propertyId, onPropertyUpdated }) => {
 const { t } = useTranslation();
 const [form] = Form.useForm();
 const {
  updatePropertyPhotos,
  isLoading: isUpdating,
  success,
 } = useUpdateProperty(propertyId);
 const { uploadPhotos, uploading, uploadProgress } = useUploadPhotos();

 const [previewOpen, setPreviewOpen] = useState(false);
 const [previewImage, setPreviewImage] = useState('');
 const [fileList, setFileList] = useState([]);

 const sensors = useSensors(
  useSensor(PointerSensor, {
   activationConstraint: {
    distance: 8, // For desktop
   },
  }),
  useSensor(TouchSensor, {
   activationConstraint: {
    delay: 100, // Short delay for touch interactions
    tolerance: 5, // Allow slight finger movement before drag starts
   },
   listeners: {
    touchmove: (event) => {
     // Prevent scrolling while dragging
     event.preventDefault();
    },
   },
  })
 );

 const handleSubmit = async () => {
  if (!fileList.length) {
   console.error(t('photo.noFiles'));
   return;
  }
  const filesWithOriginFileObj = fileList.filter((file) => file.originFileObj);
  const newFileList = filesWithOriginFileObj.reduce((acc, file, index) => {
   acc[index] = file;
   return acc;
  }, []);
  const urlsArray = fileList
   .filter((file) => !file.originFileObj)
   .map((file) => file.url);
  /* updatePropertyPhotos({ photos: files }); */
  try {
   const photoUrls = await uploadPhotos(newFileList);
   photoUrls.unshift(...urlsArray);
   await updatePropertyPhotos({ photos: photoUrls });
   if (onPropertyUpdated) {
    onPropertyUpdated();
   }
  } catch (error) {
   console.error('Error handling photos:', error);
   message.error(t('photo.uploadError'));
  }
 };

 const handlePreview = async (file) => {
  if (!file.url && !file.preview) {
   file.preview = await getBase64(file.originFileObj);
  }
  file.error = false;
  setPreviewImage(file.url || file.preview);
  setPreviewOpen(true);
 };

 useEffect(() => {
  if (property && property.photos) {
   setFileList(
    property.photos.map((url, index) => ({
     uid: `existing-${index}`,
     name: url.substring(url.lastIndexOf('/') + 1),
     status: 'done',
     url: url,
    }))
   );
  }
 }, [property]);

 useEffect(() => {
  // Add CSS to prevent scrolling while dragging
  const style = document.createElement('style');
  style.textContent = `
       .dragging {
         touch-action: none;
       }
       body.dragging {
         overflow: hidden;
         touch-action: none;
       }
     `;
  document.head.appendChild(style);
  return () => document.head.removeChild(style);
 }, []);

 const handleDragStart = () => {
  document.body.classList.add('dragging');
 };

 const onDragEnd = (event) => {
  document.body.classList.remove('dragging');
  const { active, over } = event;
  if (active.id !== over.id) {
   setFileList((items) => {
    const oldIndex = items.findIndex((item) => item.uid === active.id);
    const newIndex = items.findIndex((item) => item.uid === over.id);
    return arrayMove(items, oldIndex, newIndex);
   });
  }
 };

 const uploadButton = (
  <div
   style={{
    height: '105px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
   }}
  >
   {uploading ? (
    <div>{t('photo.uploading')}</div>
   ) : (
    <>
     <PlusOutlined />
     <div style={{ marginTop: 8 }}>{t('validation.addPhotos')}</div>
    </>
   )}
  </div>
 );

 if (!property) {
  return <Spin size="large" />;
 }

 return (
  <Form
   name="editPhotos"
   form={form}
   initialValues={property}
   layout="vertical"
  >
   <Row gutter={[8, 0]}>
    <Col xs={24} md={24}>
     <Title level={3}>
      {t('photo.editTitle', 'Modifier les photos de votre logement')}
     </Title>
     {fileList.length > 1 && (
      <div
       style={{
        textAlign: 'center',
        margin: '10px 0',
       }}
      >
       <Text type="secondary">{t('photo.dragDrop')}</Text> 🎯📷
      </div>
     )}
    </Col>
    <Col xs={24} md={24}>
     <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      dropAnimation={{
       ...defaultDropAnimation,
       dragSourceOpacity: 0.5,
      }}
     >
      <SortableContext
       items={fileList.map((f) => f.uid)}
       strategy={verticalListSortingStrategy}
      >
       <Upload
        listType="picture-card"
        className="custom-upload"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={({ fileList: newFileList }) => setFileList(newFileList)}
        beforeUpload={() => false}
        maxCount={16}
        multiple
        customRequest={({ onSuccess }) => onSuccess('ok')}
        itemRender={(originNode, file) => (
         <DraggableUploadListItem originNode={originNode} file={file} />
        )}
       >
        {fileList.length >= 16 ? null : uploadButton}
       </Upload>
      </SortableContext>
     </DndContext>

     {previewOpen && (
      <Image
       wrapperStyle={{ display: 'none' }}
       preview={{
        visible: previewOpen,
        onVisibleChange: (visible) => setPreviewOpen(visible),
       }}
       src={previewImage}
      />
     )}
    </Col>

    {fileList.length === 16 && (
     <Col xs={24}>
      <Alert message={t('photo.maxReached')} type="info" />
      <br />
     </Col>
    )}
    {uploading && (
     <Col xs={24}>
      <Progress
       percent={uploadProgress}
       status="active"
       strokeColor={{ from: '#ebdecd', to: '#aa7e42' }}
      />
     </Col>
    )}
   </Row>

   <Row justify="end">
    <Col xs={16} md={4}>
     <Button
      type="primary"
      onClick={handleSubmit}
      icon={<SaveOutlined />}
      loading={isUpdating}
      size="large"
     >
      {success ? t('messages.updateSuccess') : t('button.save')}
     </Button>
    </Col>
   </Row>
  </Form>
 );
};

export default PropertyPhotos;
