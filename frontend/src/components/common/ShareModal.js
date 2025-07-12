import React, { useState, useEffect } from 'react';
import { Modal, Grid, Flex, Divider, QRCode, message } from 'antd';
import { useTranslation } from '../../context/TranslationContext';

const { useBreakpoint } = Grid;

const ShareModal = ({ isVisible, onClose, pageUrl }) => {
 const { t } = useTranslation();
 const [qrValue, setQrValue] = useState(pageUrl);
 const screens = useBreakpoint();

 useEffect(() => {
  if (pageUrl) {
   setQrValue(pageUrl);
  }
 }, [pageUrl]);

 const shareOnWhatsApp = () => {
  const whatsappUrl = screens.xs
   ? `whatsapp://send?text=${encodeURIComponent(pageUrl)}`
   : `https://api.whatsapp.com/send?text=${encodeURIComponent(pageUrl)}`;
  window.open(whatsappUrl, '_blank');
 };

 const shareOnMessenger = () => {
  const messengerUrl = screens.xs
   ? `fb-messenger://share/?link=${encodeURIComponent(pageUrl)}`
   : `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
      pageUrl
     )}&app_id=YOUR_FACEBOOK_APP_ID`;
  window.open(messengerUrl, '_blank');
 };

 const shareOnInstagram = () => {
  if (screens.xs) {
   window.open(
    `instagram://share?text=${encodeURIComponent(pageUrl)}`,
    '_blank'
   );
  } else {
   navigator.clipboard.writeText(pageUrl).then(() => {
    message.success(t('share.instagram.copied'));
   });
  }
 };

 const shareOnGmail = () => {
  const subject = encodeURIComponent('Découvrez ce guide digital');
  const body = encodeURIComponent(`${t('share.email.body')} ${pageUrl}`);
  const gmailUrl = screens.xs
   ? `googlegmail://compose?subject=${subject}&body=${body}`
   : `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=&su=${subject}&body=${body}`;
  window.open(gmailUrl, '_blank');
 };

 const shareOnX = () => {
  const text = encodeURIComponent(t('share.x.text'));
  const xUrl = screens.xs
   ? `twitter://post?text=${text}&url=${encodeURIComponent(pageUrl)}`
   : `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(
      pageUrl
     )}`;
  window.open(xUrl, '_blank');
 };

 return (
  <Modal
   title={t('share.modalTitle')}
   open={isVisible}
   onCancel={onClose}
   footer={null}
  >
   <Flex vertical align="center">
    {qrValue ? (
     <QRCode value={qrValue} size={200} />
    ) : (
     <p>{t('share.noQrCode')}</p>
    )}
    <Divider>{t('share.orShareVia')}</Divider>
    <br />
    <Flex gap="middle">
     <i
      className="fa-light fa-brands fa-whatsapp fa-2xl"
      onClick={shareOnWhatsApp}
      style={{ cursor: 'pointer' }}
     />
     <i
      className="fa-brands fa-facebook-messenger fa-2xl"
      onClick={shareOnMessenger}
      style={{ cursor: 'pointer' }}
     />

     <i
      className="fa-light fa-brands fa-instagram fa-2xl"
      onClick={shareOnInstagram}
      style={{ cursor: 'pointer' }}
     />
     <i
      className="fa-light fa-envelope fa-2xl"
      onClick={shareOnGmail}
      style={{ cursor: 'pointer' }}
     />
     <i
      className="fa-light fa-brands fa-x-twitter fa-2xl"
      onClick={shareOnX}
      style={{ cursor: 'pointer' }}
     />
    </Flex>
    <br />
   </Flex>
  </Modal>
 );
};

export default ShareModal;
