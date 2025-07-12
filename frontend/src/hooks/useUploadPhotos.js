import React, { useState } from 'react';
// Remove imageCompression import since we're not using it anymore

const useUploadPhotos = () => {
 const [uploading, setUploading] = useState(false);
 const [uploadProgress, setUploadProgress] = useState(0);

 // Remove the compressImage function entirely

 const uploadAvatar = async (avatar) => {
  const formData = new FormData();
  formData.append('avatar', avatar[0].originFileObj);
  try {
   setUploading(true);
   const response = await fetch('/avatars', {
    method: 'POST',
    body: formData,
   });
   if (!response.ok) {
    throw new Error('Failed to upload Avatar');
   }
   const data = await response.json();
   setUploading(false);

   return data.file.url;
  } catch (error) {
   console.error('Error uploading Avatar:', error);
   setUploading(false);
   throw error;
  }
 };

 const uploadPlace = async (photo) => {
  const formData = new FormData();
  formData.append('photo', photo[0].originFileObj);

  try {
   setUploading(true);

   const response = await fetch('/places', {
    method: 'POST',
    body: formData,
   });

   if (!response.ok) {
    throw new Error('Failed to upload photo');
   }

   const data = await response.json();
   setUploading(false);

   return data.file.url;
  } catch (error) {
   console.error('Error uploading photo:', error);
   setUploading(false);
   throw error;
  }
 };

 const uploadEquipement = async (photo) => {
  const formData = new FormData();
  formData.append('photo', photo[0].originFileObj);

  try {
   setUploading(true);

   const response = await fetch('/equipments', {
    method: 'POST',
    body: formData,
   });

   if (!response.ok) {
    throw new Error('Failed to upload photo');
   }

   const data = await response.json();
   console.log(data);
   setUploading(false);

   return data.file.url;
  } catch (error) {
   console.error('Error uploading photo:', error);
   setUploading(false);
   throw error;
  }
 };

 // Fixed uploadFrontPhoto - no more client-side compression
 const uploadFrontPhoto = async (photo) => {
  const formData = new FormData();

  // Use original file, let server handle compression
  formData.append('photo', photo[0].originFileObj, photo[0].name);

  try {
   setUploading(true);

   const response = await fetch('/frontphotos', {
    method: 'POST',
    body: formData,
   });

   if (!response.ok) {
    throw new Error('Failed to upload photo');
   }

   const data = await response.json();
   setUploading(false);

   return data.file.url;
  } catch (error) {
   console.error('Error uploading photo:', error);
   setUploading(false);
   throw error;
  }
 };

 const uploadSignature = async (signatureData, firstname, lastname) => {
  try {
   setUploading(true);

   // Convert base64 to blob
   const byteString = atob(signatureData.split(',')[1]);
   const mimeString = signatureData.split(',')[0].split(':')[1].split(';')[0];
   const ab = new ArrayBuffer(byteString.length);
   const ia = new Uint8Array(ab);

   for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
   }

   const blob = new Blob([ab], { type: mimeString });
   const timestamp = new Date().getTime();
   const filename = `signature_${firstname.toLowerCase()}_${lastname.toLowerCase()}_${timestamp}.png`;
   const file = new File([blob], filename, { type: 'image/png' });

   const formData = new FormData();
   formData.append('signature', file);

   const response = await fetch('/signatures', {
    method: 'POST',
    body: formData,
   });

   if (!response.ok) {
    throw new Error('Failed to upload signature');
   }

   const data = await response.json();
   setUploading(false);
   return data.file.url;
  } catch (error) {
   console.error('Error uploading signature:', error);
   setUploading(false);
   throw error;
  }
 };

 const uploadWithProgress = async (formData, onProgress) => {
  return new Promise((resolve, reject) => {
   const xhr = new XMLHttpRequest();

   xhr.upload.addEventListener('progress', (event) => {
    if (event.lengthComputable) {
     const percentComplete = Math.round((event.loaded / event.total) * 100);
     onProgress(percentComplete);
    }
   });

   xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
     const response = JSON.parse(xhr.responseText);
     resolve(response);
    } else {
     reject(new Error(`HTTP Error: ${xhr.status}`));
    }
   });

   xhr.addEventListener('error', () => {
    reject(new Error('Network Error'));
   });

   xhr.open('POST', '/upload');
   xhr.send(formData);
  });
 };

 // Fixed uploadPhotos - no more client-side compression
 const uploadPhotos = async (photos) => {
  try {
   setUploading(true);
   const formData = new FormData();

   // Use original files, let server handle compression
   for (const photo of photos) {
    formData.append('photos', photo.originFileObj, photo.name);
   }

   const data = await uploadWithProgress(formData, (progress) => {
    setUploadProgress(progress);
   });

   return data.files.map((file) => file.url);
  } catch (error) {
   console.error('Error uploading photos:', error);
   throw error;
  } finally {
   setUploading(false);
   setUploadProgress(0);
  }
 };

 return {
  uploadPhotos,
  uploadPlace,
  uploadEquipement,
  uploadFrontPhoto,
  uploadSignature,
  uploadAvatar,
  uploading,
  uploadProgress,
 };
};

export default useUploadPhotos;
