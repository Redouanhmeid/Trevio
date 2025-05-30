const trevioThemeConfig = {
 token: {
  fontFamily: '"Inter", sans-serif',
  colorPrimary: '#6d5ffa',
  colorInfo: '#6d5ffa',
  colorSuccess: '#17b26a',
  colorWarning: '#f79009',
  colorError: '#f04438',
  colorTextBase: '#303342',
  borderRadius: 5,
  fontSize: 14,
 },
 components: {
  Button: {
   borderColorDisabled: 'rgb(48,51,66)',
   colorBgContainerDisabled: 'rgb(175,172,215)',
   colorTextDisabled: 'rgb(255,255,255)',
   defaultBorderColor: 'rgb(109,95,250)',
   defaultColor: 'rgb(109,95,250)',
   textHoverBg: 'rgb(232,231,249)',
   textTextHoverColor: 'rgb(109,95,250)',
   fontSize: 14,
   fontWeight: 600,
  },
  Layout: {
   headerBg: 'rgb(255,255,255)',
   footerBg:
    'linear-gradient(180deg, rgb(109, 95,250) 0%, rgb(65, 56, 148) 100%)',
   lightSiderBg: 'rgb(251, 251, 251)',
   headerColor: 'rgb(43, 44, 50)',
   siderBg: 'rgb(251, 251, 251)',
   triggerBg: 'rgb(109, 95, 250)',
   triggerColor: 'rgb(255, 255, 255)',
   headerHeight: 80,
   footerPadding: '24px 60px',
   headerPadding: '0 40px',
   bodyBg: 'rgb(255,255,255)',
  },
  Anchor: {
   fontSize: 20,
   linkPaddingBlock: 6,
  },
  Menu: {
   itemColor: 'rgb(48,51,66)',
   itemHoverColor: 'rgb(48,51,66)',
   itemSelectedColor: 'rgb(109,95,250)',
   subMenuItemSelectedColor: 'rgb(109,95,250)',
   horizontalItemSelectedColor: 'rgb(109,95,250)',
   darkItemSelectedBg: 'rgb(109,95,250)',
   horizontalItemHoverColor: 'rgb(109,95,250)',
   colorText: 'rgb(48,51,66)',
  },
  Form: {
   labelColor: 'rgb(48,51,66)',
   colorBorder: 'rgb(213,215,218)',
   colorText: 'rgb(213,215,218)',
   colorTextDescription: 'rgb(113,118,128)',
   verticalLabelPadding: '0',
   labelHeight: 20,
  },
  Input: {
   borderRadius: 8,
   paddingBlock: 6,
  },
  Checkbox: {
   paddingXS: 8,
   lineHeight: 2.2,
   controlInteractiveSize: 18,
   lineWidthBold: 3,
   borderRadiusSM: 3,
   fontSize: 13,
   colorBorder: 'rgb(109,95,250)',
  },
  Rate: {
   starColor: 'rgb(253,176,34)',
   starSize: 14,
  },
  Slider: {
   handleSize: 18,
   railSize: 6,
   colorPrimaryBorderHover: 'rgb(109,95,250)',
   handleActiveColor: 'rgb(114,46,209)',
   dotActiveBorderColor: 'rgb(114,46,209)',
   dotBorderColor: 'rgb(255,255,255)',
   handleActiveOutlineColor: 'rgb(109,95,250)',
  },
  Avatar: {
   groupBorderColor: 'rgb(113,118,128)',
   colorTextPlaceholder: 'rgb(245,245,245)',
   colorTextLightSolid: 'rgb(113,118,128)',
  },
  Card: {
   colorTextHeading: 'rgb(48,51,66)',
   colorBorderSecondary: 'rgb(236,236,237)',
   boxShadowCard: '0',
   boxShadowTertiary: '0',
   fontWeightStrong: 500,
   headerFontSize: 16,
   headerFontSizeSM: 11,
  },
  Upload: {
   colorText: 'rgb(109,95,250)',
   colorError: 'rgb(181,176,232)',
   colorBorder: 'rgb(181,176,232)',
   colorFillAlter: 'rgb(255,255,255)',
   borderRadiusLG: 8,
   borderRadiusSM: 5,
   padding: 12,
   paddingSM: 10,
   paddingXS: 6,
   controlHeightLG: 60,
  },
  Tag: {
   defaultColor: 'rgb(48,51,66)',
   defaultBg: 'rgba(255, 255, 255, 0)',
   fontSize: 16,
   fontSizeIcon: 16,
   fontSizeSM: 16,
  },
  Radio: {
   buttonSolidCheckedActiveBg: 'rgb(109,95,250)',
   buttonSolidCheckedBg: 'rgb(109,95,250)',
   buttonSolidCheckedHoverBg: 'rgb(109,95,250)',
   radioSize: 18,
   dotSize: 9,
   fontSize: 16,
   buttonPaddingInline: 60,
  },
  Switch: {
   algorithm: true,
   handleSize: 0,
   handleSizeSM: 0,
   fontSize: 16,
   fontSizeSM: 16,
   fontSizeIcon: 0,
   marginXXS: 6,
   trackHeight: 36,
   trackHeightSM: 30,
  },
  Table: {
   headerBorderRadius: 16,
   borderRadius: 8,
   headerBg: 'rgb(248,247,254)',
   headerSplitColor: 'rgb(164,167,174)',
   cellPaddingBlock: 18,
   fontSizeIcon: 14,
   rowHoverBg: 'rgb(248,247,254)',
   headerSortActiveBg: 'rgb(248,247,254)',
   headerSortHoverBg: 'rgba(181,176,232,0.25)',
   borderColor: 'rgb(245,245,245)',
   bodySortBg: 'rgb(248,247,254)',
   rowExpandedBg: 'rgba(232,231,249,0.15)',
  },
  Pagination: {
   itemActiveBg: 'rgb(109,95,250)',
   colorPrimary: 'rgb(255,255,255)',
   colorText: 'rgb(109,95,250)',
   controlHeight: 36,
   fontSize: 15,
   borderRadius: 8,
   fontWeightStrong: 700,
  },
 },
};

export default trevioThemeConfig;
