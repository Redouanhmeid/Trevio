import React, { useState, useEffect } from 'react';
import {
 Spin,
 Layout,
 Form,
 Row,
 Col,
 Upload,
 Image,
 Button,
 Alert,
 Typography,
 Progress,
 Grid,
 message,
} from 'antd';
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
import Head from '../../../components/common/header';
import Foot from '../../../components/common/footer';
import {
 ArrowLeftOutlined,
 ArrowRightOutlined,
 PlusOutlined,
 LoadingOutlined,
} from '@ant-design/icons';
import useUploadPhotos from '../../../hooks/useUploadPhotos';
import useUpdateProperty from '../../../hooks/useUpdateProperty';
import { useTranslation } from '../../../context/TranslationContext';

const { Content } = Layout;
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
 const [isPreviewLoading, setIsPreviewLoading] = useState(!file.preview);

 useEffect(() => {
  if (!file.preview && file.originFileObj) {
   getBase64(file.originFileObj)
    .then((preview) => {
     file.preview = preview;
     setIsPreviewLoading(false);
    })
    .catch((error) => {
     console.error('Error generating preview:', error);
     setIsPreviewLoading(false);
    });
  } else {
   setIsPreviewLoading(false);
  }
 }, [file]);
 const style = {
  transform: CSS.Transform.toString(transform),
  transition,
  cursor: 'move',
  border: isDragging ? '2px solid #1890ff' : 'none',
  touchAction: 'none',
 };
 if (isPreviewLoading) {
  return (
   <div
    ref={setNodeRef}
    style={{
     ...style,
     display: 'flex',
     alignItems: 'center',
     justifyContent: 'center',
     width: '100%',
     height: '100%',
     backgroundColor: '#fafafa',
     border: '1px dashed #d9d9d9',
     borderRadius: '8px',
     padding: '8px',
    }}
    {...attributes}
    {...listeners}
   >
    <Spin
     indicator={
      <LoadingOutlined
       style={{
        fontSize: 24,
        color: '#1890ff',
       }}
       spin
      />
     }
    />
   </div>
  );
 }
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

const Step4Photos = ({ next, prev, values, ProgressSteps }) => {
 const { t } = useTranslation();
 const { useBreakpoint } = Grid;
 const screens = useBreakpoint();
 const {
  updatePropertyPhotos,
  isLoading: isUpdating,
  error: updateError,
  success: updateSuccess,
 } = useUpdateProperty(values.propertyId);
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

 const beforeUpload = async (file) => {
  try {
   return false; // Prevent automatic upload
  } catch (error) {
   console.error('Error generating preview:', error);
   return false;
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

 const handleChange = ({ fileList: newFileList }) => {
  setFileList(newFileList);
 };

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

 const handleSubmit = async () => {
  if (!fileList.length) {
   console.error('Aucun fichier à télécharger');
   return;
  }
  try {
   // Filter files that need to be uploaded (have originFileObj)
   const filesWithOriginFileObj = fileList.filter((file) => file.originFileObj);
   const newFileList = filesWithOriginFileObj.reduce((acc, file, index) => {
    acc[index] = file;
    return acc;
   }, []);

   // Get URLs of existing files
   const existingUrls = fileList
    .filter((file) => !file.originFileObj)
    .map((file) => file.url);

   // Upload new files and combine with existing URLs
   const newPhotoUrls = await uploadPhotos(newFileList);
   const allPhotoUrls = [...existingUrls, ...newPhotoUrls];

   // Update property with all photo URLs
   await updatePropertyPhotos({ photos: allPhotoUrls });

   // Update form values
   values.photos = allPhotoUrls;

   // Proceed to next step
   next();
  } catch (error) {
   console.error('Error handling photos:', error);
   message.error(t('photo.uploadError'));
  }
 };

 // Initialize fileList with values.photos if they exist
 useEffect(() => {
  if (values.photos && values.photos.length > 0) {
   setFileList(
    values.photos.map((url, index) => ({
     uid: `existing-${index}`,
     name: url.substring(url.lastIndexOf('/') + 1),
     status: 'done',
     url: url,
    }))
   );
  }
 }, [values.photos]);

 useEffect(() => {
  if (updateError) {
   message.error(t('photo.uploadError'));
  }
  if (updateSuccess) {
   message.success(t('photo.uploadSuccess'));
  }
 }, [updateError, updateSuccess, t]);

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
    <div style={{ marginTop: 8 }}>{t('photo.uploading')}</div>
   ) : (
    <button
     style={{
      border: 0,
      background: 'none',
     }}
     type="button"
    >
     <PlusOutlined />
     <div style={{ marginTop: 8 }}>{t('validation.addPhotos')}</div>
    </button>
   )}
  </div>
 );

 return (
  <Layout className="contentStyle">
   <Head />
   <Layout>
    <Content className="container-form">
     <ProgressSteps />
     <Form name="step4" layout="vertical" onFinish={handleSubmit} size="large">
      <Row gutter={[24, 0]}>
       <Col xs={24} md={24}>
        <Title level={4}>{t('photo.title')}</Title>
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
           onChange={handleChange}
           beforeUpload={beforeUpload}
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
          wrapperStyle={{
           display: 'none',
          }}
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
          strokeColor={{ from: '#F8F7FE', to: '#6D5FFA' }}
         />
        </Col>
       )}
      </Row>
      <br />
      <br />
      <br />
      <Row justify="center">
       <Col xs={8} md={2}>
        <Form.Item>
         <Button
          htmlType="submit"
          shape="circle"
          onClick={prev}
          icon={<ArrowLeftOutlined />}
         />
        </Form.Item>
       </Col>
       <Col xs={16} md={6}>
        <Form.Item>
         <Button
          type="primary"
          htmlType="submit"
          style={{ width: '100%' }}
          loading={uploading || isUpdating}
         >
          {t('button.continue')} {<ArrowRightOutlined />}
         </Button>
        </Form.Item>
       </Col>
      </Row>
     </Form>
    </Content>
   </Layout>
   {!screens.xs && <Foot />}
  </Layout>
 );
};

export default Step4Photos;
