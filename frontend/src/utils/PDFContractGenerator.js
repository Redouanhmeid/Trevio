import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from 'antd';
import Logo from '../assets/Trevio-10.png';

const PDFContractGenerator = ({ formData, signature, t }) => {
 const [isGenerating, setIsGenerating] = useState(false);

 const A4_WIDTH_MM = 210;
 const A4_HEIGHT_MM = 297;
 const MM_TO_PX = 5.5; // 1mm = 3.779527559px at 96 DPI
 const A4_WIDTH_PX = A4_WIDTH_MM * MM_TO_PX;
 const CONTENT_PADDING_MM = 12;

 const createContentContainer = (content) => {
  const container = document.createElement('div');
  container.style.width = `${A4_WIDTH_PX}px`;
  container.style.margin = '0';
  container.style.padding = `${CONTENT_PADDING_MM * MM_TO_PX}px`;
  container.style.boxSizing = 'border-box';
  container.style.backgroundColor = '#ffffff';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.innerHTML = content;
  return container;
 };

 const renderToCanvas = async (content) => {
  const container = createContentContainer(content);
  document.body.appendChild(container);

  try {
   const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: A4_WIDTH_PX,
    height: A4_HEIGHT_MM * MM_TO_PX,
    windowWidth: A4_WIDTH_PX,
    windowHeight: A4_HEIGHT_MM * MM_TO_PX,
    scrollY: 0,
    scrollX: 0,
    onclone: function (clonedDoc) {
     const clonedElement = clonedDoc.querySelector('#pdf-content');
     if (clonedElement) {
      clonedElement.style.transform = 'none';
     }
    },
   });
   return canvas;
  } finally {
   document.body.removeChild(container);
  }
 };

 const addPageToDocument = (pdf, canvas) => {
  const contentWidth = A4_WIDTH_MM;
  const contentHeight = (canvas.height * A4_WIDTH_MM) / canvas.width;

  pdf.addImage(
   canvas.toDataURL('image/jpeg', 0.8),
   'JPEG',
   0,
   0,
   contentWidth,
   contentHeight
  );
 };

 const generatePDF = async () => {
  try {
   setIsGenerating(true);

   let signatureImageData = '';
   if (signature && !signature.isEmpty()) {
    signatureImageData = signature.toDataURL();
    // Position signature in the placeholder area
    // pdf.addImage(signatureData, 'PNG', 20, 250, 120, 40);
   }

   // Create PDF
   const pdf = new jsPDF({
    unit: 'mm',
    format: 'a4',
    compress: true,
   });

   const currentDate = new Date().toLocaleDateString();
   const reference = Math.random().toString(36).substr(2, 9).toUpperCase();

   const firstPageContent = `
        <div style="font-family: Arial, sans-serif;
  color: #333;
  width: 100%;
  word-wrap: break-word;
  text-align: justify;
  font-size: 12px;
  line-height: 1.6;">
          <!-- Header -->
          
          <div style="margin-bottom: 20px">
          <img src="${Logo}" style="width: 160px">
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #6D5FFA; padding-bottom: 10px;">
            <div>
              <h1 style="color: #6D5FFA; margin: 0; font-size: 24px;">${t(
               'guestForm.pdfTitle'
              )}</h1>
              <p style="margin: 5px 0 0 0; font-size: 12px;">${t(
               'guestForm.Generated'
              )}: ${currentDate}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 12px;">REF: #${reference}</p>
            </div>
          </div>

          <!-- Content Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <!-- Left Column -->
            <div>
              <!-- Personal Information -->
              <div style="margin-bottom: 25px;">
                <h2 style="color: #6D5FFA; font-size: 16px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                ${t('guestForm.personalData.pdfTitle')}
                </h2>
                <div style="background: #F8F7FE; padding: 15px; border-radius: 12px;">
                <p style="margin: 8px 0;"><strong>${t(
                 'guestForm.personalData.firstName'
                )}:</strong> ${formData.firstname}</p>
                <p style="margin: 8px 0;"><strong>${t(
                 'guestForm.personalData.lastName'
                )}:</strong> ${formData.lastname}</p>
                <p style="margin: 8px 0;"><strong>${t(
                 'guestForm.personalData.middleName'
                )}:</strong> ${formData.middlename || '-'}</p>
                <p style="margin: 8px 0;"><strong>${t(
                 'guestForm.personalData.birthDate'
                )}:</strong> ${formData.birthDate.format('DD/MM/YYYY')}</p>
                <p style="margin: 8px 0;"><strong>${t(
                 'guestForm.personalData.sex.label'
                )}:</strong> ${formData.sex}</p>
                <p style="margin: 8px 0;"><strong>${t(
                 'guestForm.personalData.nationality'
                )}:</strong> ${formData.Nationality}</p>
              </div>
              </div>

              <!-- Contact Information -->
              <div style="margin-bottom: 25px;">
                <h2 style="color: #6D5FFA; font-size: 16px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                ${t('guestForm.contact.title')}
                </h2>
                <div style="background: #F8F7FE; padding: 15px; border-radius: 12px;">
                  <p style="margin: 8px 0;"><strong>${t(
                   'guestForm.contact.email'
                  )}</strong> ${formData.email}</p>
                  <p style="margin: 8px 0;"><strong>${t(
                   'guestForm.contact.phone'
                  )}</strong> ${formData.phone}</p>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div>
              <!-- Residence Information -->
              <div style="margin-bottom: 25px;">
                <h2 style="color: #6D5FFA; font-size: 16px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                   ${t('guestForm.personalData.residence')}
                </h2>
                <div style="background: #F8F7FE; padding: 15px; border-radius: 12px;">
                <p style="margin: 8px 0;"><strong>${t(
                 'guestForm.personalData.residenceCountry'
                )}:</strong> ${formData.residenceCountry}</p>
                <p style="margin: 8px 0;"><strong>${t(
                 'guestForm.personalData.residenceCity'
                )}:</strong> ${formData.residenceCity}</p>
                <p style="margin: 8px 0;"><strong>${t(
                 'guestForm.personalData.residenceAddress'
                )}:</strong> ${formData.residenceAddress}</p>
                <p style="margin: 8px 0;"><strong>${t(
                 'guestForm.personalData.postalCode'
                )}:</strong> ${formData.residencePostalCode}</p>
              </div>
              </div>

              <!-- Document Information -->
              <div style="margin-bottom: 25px;">
                <h2 style="color: #6D5FFA; font-size: 16px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                   ${t('guestForm.identity.title')}
                </h2>
                <div style="background: #F8F7FE; padding: 15px; border-radius: 12px;">
                  <p style="margin: 8px 0;"><strong>${t(
                   'guestForm.identity.documentType.label'
                  )}:</strong> ${formData.documentType}</p>
                <p style="margin: 8px 0;"><strong>${t(
                 'guestForm.identity.documentNumber'
                )}:</strong> ${formData.documentNumber}</p>
                <p style="margin: 8px 0;"><strong>${t(
                 'guestForm.identity.issueDate.label'
                )}:</strong> ${formData.documentIssueDate.format(
    'DD/MM/YYYY'
   )}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

   const firstPageCanvas = await renderToCanvas(firstPageContent);

   addPageToDocument(pdf, firstPageCanvas);

   pdf.addPage();

   const secondPageContent = `
    
 <div style="font-family: Arial, sans-serif;
  color: #333;
  width: 100%;
  word-wrap: break-word;
  text-align: justify;
  font-size: 12px;
  line-height: 1.6;">
    <!-- Logo -->
    <div style="margin-top: 10px, margin-bottom: 30px">
       <img src="${Logo}" style="width: 160px">
     </div>
	 <div>
       <h1 style="color: #6D5FFA; font-size: 20px; margin-bottom: 15px;">${t(
        'guestForm.contractTerms.title'
       )}</h1>
       <div style="width: 100%; border-top: 1px solid #6D5FFA;">
      </div>

    <!-- Content -->

    <div>
    <h2 style="color: #6D5FFA; font-size: 16px; margin: 25px 0 15px;">${t(
     'guestForm.contractTerms.contract.title'
    )}</h2>
    <p style="margin-bottom: 20px; font-size: 12px; line-height: 1.6;">${t(
     'guestForm.contractTerms.contract.content'
    )}</p>
      <h2 style="color: #6D5FFA; font-size: 16px; margin: 25px 0 15px;">${t(
       'guestForm.contractTerms.arrival.title'
      )}</h2>
      <ul style="list-style-type: none; padding-left: 0; margin-bottom: 20px;">
        <li style="margin-bottom: 8px; font-size: 12px;">• ${t(
         'guestForm.contractTerms.arrival.guestNotify'
        )}</li>
        <li style="margin-bottom: 8px; font-size: 12px;">• ${t(
         'guestForm.contractTerms.arrival.departure'
        )}</li>
      </ul>

      <h2 style="color: #6D5FFA; font-size: 16px; margin: 25px 0 15px;">${t(
       'guestForm.contractTerms.behavior.title'
      )}</h2>
      <ul style="list-style-type: none; padding-left: 0; margin-bottom: 20px;">
        <li style="margin-bottom: 8px; font-size: 12px;">• ${t(
         'guestForm.contractTerms.behavior.noise'
        )}</li>
        <li style="margin-bottom: 8px; font-size: 12px;">• ${t(
         'guestForm.contractTerms.behavior.care'
        )}</li>
        <li style="margin-bottom: 8px; font-size: 12px;">• ${t(
         'guestForm.contractTerms.behavior.smoking'
        )}</li>
        <li style="margin-bottom: 8px; font-size: 12px;">• ${t(
         'guestForm.contractTerms.behavior.pets'
        )}</li>
      </ul>

      <h2 style="color: #6D5FFA; font-size: 16px; margin: 25px 0 15px;">${t(
       'guestForm.contractTerms.facilities.title'
      )}</h2>
      <ul style="list-style-type: none; padding-left: 0; margin-bottom: 20px;">
        <li style="margin-bottom: 8px; font-size: 12px;">• ${t(
         'guestForm.contractTerms.facilities.usage'
        )}</li>
        <li style="margin-bottom: 8px; font-size: 12px;">• ${t(
         'guestForm.contractTerms.facilities.responsibility'
        )}</li>
      </ul>

      <h2 style="color: #6D5FFA; font-size: 16px; margin: 25px 0 15px;">${t(
       'guestForm.contractTerms.cleanliness.title'
      )}</h2>
      <ul style="list-style-type: none; padding-left: 0; margin-bottom: 20px;">
        <li style="margin-bottom: 8px; font-size: 12px;">• ${t(
         'guestForm.contractTerms.cleanliness.maintain'
        )}</li>
        <li style="margin-bottom: 8px; font-size: 12px;">• ${t(
         'guestForm.contractTerms.cleanliness.service'
        )}</li>
      </ul>

      <h2 style="color: #6D5FFA; font-size: 16px; margin: 25px 0 15px;">${t(
       'guestForm.contractTerms.security.title'
      )}</h2>
      <ul style="list-style-type: none; padding-left: 0; margin-bottom: 20px;">
        <li style="margin-bottom: 8px; font-size: 12px;">• ${t(
         'guestForm.contractTerms.security.lock'
        )}</li>
        <li style="margin-bottom: 8px; font-size: 12px;">• ${t(
         'guestForm.contractTerms.security.emergency'
        )}</li>
      </ul>

      <h2 style="color: #6D5FFA; font-size: 16px; margin: 25px 0 15px;">${t(
       'guestForm.contractTerms.morocco.title'
      )}</h2>
      <ul style="list-style-type: none; padding-left: 0; margin-bottom: 20px;">
        <li style="margin-bottom: 8px; font-size: 12px;">• ${t(
         'guestForm.contractTerms.morocco.laws'
        )}</li>
        <li style="margin-bottom: 8px; font-size: 12px;">• ${t(
         'guestForm.contractTerms.morocco.consequences'
        )}</li>
      </ul>

      <h2 style="color: #6D5FFA; font-size: 16px; margin: 25px 0 15px;">${t(
       'guestForm.contractTerms.internet.title'
      )}</h2>
      <ul style="list-style-type: none; padding-left: 0; margin-bottom: 20px;">
        <li style="margin-bottom: 8px; font-size: 12px;">• ${t(
         'guestForm.contractTerms.internet.content'
        )}</li>
      </ul>

      <h2 style="color: #6D5FFA; font-size: 16px; margin: 25px 0 15px;">${t(
       'guestForm.contractTerms.disputes.title'
      )}</h2>
      <ul style="list-style-type: none; padding-left: 0; margin-bottom: 20px;">
        <li style="margin-bottom: 8px; font-size: 12px;">• ${t(
         'guestForm.contractTerms.disputes.content'
        )}</li>
      </ul>

      <h2 style="color: #6D5FFA; font-size: 16px; margin: 25px 0 15px;">${t(
       'guestForm.contractTerms.cancellation.title'
      )}</h2>
      <ul style="list-style-type: none; padding-left: 0; margin-bottom: 20px;">
        <li style="margin-bottom: 8px; font-size: 12px;">• ${t(
         'guestForm.contractTerms.cancellation.content'
        )}</li>
      </ul>

      <h2 style="color: #6D5FFA; font-size: 16px; margin: 25px 0 15px;">${t(
       'guestForm.contractTerms.unauthorized.title'
      )}</h2>
      <ul style="list-style-type: none; padding-left: 0; margin-bottom: 20px;">
        <li style="margin-bottom: 8px; font-size: 12px;">• ${t(
         'guestForm.contractTerms.unauthorized.content'
        )}</li>
      </ul>

      <h2 style="color: #6D5FFA; font-size: 16px; margin: 25px 0 15px;">${t(
       'guestForm.contractTerms.signature.title'
      )}</h2>
      <p style="font-size: 12px; line-height: 1.6;">${t(
       'guestForm.contractTerms.signature.content'
      )}</p>
    </div>

    <!-- Electronic Signature Section -->
    <div style="position: relative; min-height: 300px; margin: 25px 0 15px;">
      <div style="position: absolute; bottom: 0; right: 0; width: auto">
        <p style="margin: 5px 0; font-size: 12px;">${t(
         'guestForm.signature.date'
        )}: ${new Date(formData.submissionDate).toLocaleDateString()}</p>
          <img src="${signatureImageData}" style="width: auto; height: 220px; object-fit: contain; margin: 15px 0;">
          <p style="margin: 5px 0; font-size: 12px; color: #666;">${t(
           'guestForm.signature.confirmation'
          )}:</p>
      </div>
    </div>
  </div>
      `;

   const secondPageCanvas = await renderToCanvas(secondPageContent);
   addPageToDocument(pdf, secondPageCanvas);

   const pdfOutput = pdf.output('blob');
   const url = URL.createObjectURL(pdfOutput);
   const link = document.createElement('a');
   link.href = url;
   link.download = `reservation-contract-${reference}-${formData.firstname}-${formData.lastname}.pdf`;
   link.click();
   URL.revokeObjectURL(url);

   setIsGenerating(false);
  } catch (error) {
   console.error('Error generating PDF:', error);
  } finally {
   setIsGenerating(false);
  }
 };

 return (
  <Button
   type="primary"
   key="download"
   icon={<i className="fa-regular fa-arrow-down-to-line"></i>}
   onClick={generatePDF}
   disabled={isGenerating}
   block
  >
   {isGenerating
    ? t('guestForm.success.downloadingPdf')
    : t('guestForm.success.downloadPdf')}
  </Button>
 );
};

export default PDFContractGenerator;
