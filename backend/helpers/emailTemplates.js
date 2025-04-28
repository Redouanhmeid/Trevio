/**
 * Email templates for different notification types
 * This module centralizes all email templates for better organization
 */

/**
 * Generate a standard email template layout
 *
 * @param {Object} notification - The notification object
 * @param {Object} user - The user object
 * @param {string} content - The main content HTML
 * @param {string} accentColor - The accent color for the template
 * @returns {string} - Complete HTML email template
 */
const generateStandardTemplate = (
 notification,
 user,
 content,
 accentColor = '#6D5FFA'
) => {
 const greeting =
  user && user.firstname ? `Bonjour ${user.firstname},` : 'Bonjour,';

 const currentYear = new Date().getFullYear();

 return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color: #333333; background-color: #f7f7f7;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
          <tr>
            <td style="padding: 20px 0;">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" align="center" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <!-- Header with logo -->
                <tr>
                  <td style="padding: 20px 30px; text-align: center; background-color: ${accentColor}; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px;">${notification.title}</h1>
                  </td>
                </tr>
                
                <!-- Greeting -->
                <tr>
                  <td style="padding: 30px 30px 10px 30px;">
                    <p style="margin: 0; font-size: 16px; line-height: 1.5;">${greeting}</p>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 10px 30px 30px 30px;">
                    ${content}
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 30px; text-align: center; background-color: #f9f9f9; border-top: 1px solid #e8e8e8; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; color: #888888; font-size: 12px;">Cette notification a été envoyée automatiquement par Trevio.ma</p>
                    <p style="margin: 5px 0 0 0; color: #888888; font-size: 12px;">&copy; ${currentYear} Trevio. Tous droits réservés.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
};

/**
 * Generate appropriate email template based on notification type
 *
 * @param {Object} notification - The notification object
 * @param {Object} user - The user object
 * @param {string} propertyName - Optional property name
 * @returns {string} - Complete HTML email
 */
const generateEmailTemplate = (notification, user, propertyName = '') => {
 // Format message with property name if available
 let messageContent = notification.message;
 if (propertyName && !messageContent.includes(propertyName)) {
  messageContent = messageContent.replace('property', propertyName);
 }

 // Select template based on notification type
 switch (notification.type) {
  case 'property_update':
   return generatePropertyUpdateTemplate(
    notification,
    user,
    messageContent,
    propertyName
   );
  case 'revenue_update':
   return generateRevenueUpdateTemplate(
    notification,
    user,
    messageContent,
    propertyName
   );
  case 'task_update':
   return generateTaskUpdateTemplate(
    notification,
    user,
    messageContent,
    propertyName
   );
  default:
   return generateDefaultTemplate(notification, user, messageContent);
 }
};

/**
 * Template for property updates (verification, changes, etc.)
 */
const generatePropertyUpdateTemplate = (
 notification,
 user,
 message,
 propertyName
) => {
 const content = `
      <div style="padding: 20px; background-color: #f9f9f9; border-left: 4px solid #17B26A; margin-bottom: 20px; border-radius: 3px;">
        <p style="margin: 0; font-size: 16px; line-height: 1.5;">${message}</p>
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <a href="https://app.trevio.ma/" style="display: inline-block; padding: 12px 24px; background-color: #17B26A; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 4px;">Accéder au tableau de bord</a>
      </div>
    `;

 return generateStandardTemplate(notification, user, content, '#17B26A');
};

/**
 * Template for revenue updates
 */
const generateRevenueUpdateTemplate = (
 notification,
 user,
 message,
 propertyName
) => {
 const content = `
      <div style="padding: 20px; background-color: #f9f9f9; border-left: 4px solid #6D5FFA; margin-bottom: 20px; border-radius: 3px;">
        <p style="margin: 0; font-size: 16px; line-height: 1.5;">${message}</p>
      </div>
      
      <div style="background-color: #F9F9F9; padding: 15px; border-radius: 4px; margin-top: 20px;">
        <p style="margin: 0; color: #6D5FFA; font-size: 14px;">💡 Vous pouvez consulter toutes vos données financières dans la section Revenus de votre tableau de bord.</p>
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <a href="https://app.trevio.ma/revenues" style="display: inline-block; padding: 12px 24px; background-color: #6D5FFA; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 4px;">Voir les revenus</a>
      </div>
    `;

 return generateStandardTemplate(notification, user, content, '#6D5FFA');
};

/**
 * Template for task updates
 */
const generateTaskUpdateTemplate = (
 notification,
 user,
 message,
 propertyName
) => {
 const content = `
      <div style="padding: 20px; background-color: #f9f9f9; border-left: 4px solid #F79009; margin-bottom: 20px; border-radius: 3px;">
        <p style="margin: 0; font-size: 16px; line-height: 1.5;">${message}</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-top: 20px;">
        <p style="margin: 0; color: #F79009; font-size: 14px;">⏰ N'oubliez pas de mettre à jour le statut de vos tâches lorsqu'elles sont terminées.</p>
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <a href="https://app.trevio.ma/propertytaskdashboard" style="display: inline-block; padding: 12px 24px; background-color: #F79009; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 4px;">Voir les tâches</a>
      </div>
    `;

 return generateStandardTemplate(notification, user, content, '#F79009');
};

/**
 * Default template for generic notifications
 */
const generateDefaultTemplate = (notification, user, message) => {
 const content = `
      <div style="padding: 20px; background-color: #f9f9f9; border-left: 4px solid #F79009; margin-bottom: 20px; border-radius: 3px;">
        <p style="margin: 0; font-size: 16px; line-height: 1.5;">${message}</p>
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <a href="https://app.trevio.ma/" style="display: inline-block; padding: 12px 24px; background-color: #F79009; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 4px;">Accéder au tableau de bord</a>
      </div>
    `;

 return generateStandardTemplate(notification, user, content, '#F79009');
};

module.exports = {
 generateEmailTemplate,
};
