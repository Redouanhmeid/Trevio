const fs = require('fs').promises;
const path = require('path');

// Shared helper functions
const utils = {
 // Helper function to safely delete a file
 safeDeleteFile: async (filePath, deletionErrors = []) => {
  try {
   await fs.access(filePath); // Check if file exists
   await fs.unlink(filePath);
   return true;
  } catch (error) {
   if (error.code !== 'ENOENT') {
    // Ignore "file not found" errors
    const errorMessage = `Failed to delete ${filePath}: ${error.message}`;
    console.error(errorMessage);
    deletionErrors.push(errorMessage);
   } else {
    console.log(`File not found (already deleted): ${filePath}`);
   }
   return false;
  }
 },

 // Helper function to extract filename from URL
 getFilenameFromUrl: (url) => {
  if (!url) return null;
  return url.split('/').pop();
 },

 // Helper function to delete a file from a specific directory
 deleteFileFromDirectory: async (fileUrl, directory, deletionErrors) => {
  const filename = utils.getFilenameFromUrl(fileUrl);
  if (filename) {
   const filePath = path.join(
    process.env[`${directory}_PATH`] || directory.toLowerCase(),
    filename
   );
   await utils.safeDeleteFile(filePath, deletionErrors);
  }
 },

 // Helper function to handle deletion errors
 handleDeletionErrors: (deletionErrors) => {
  if (deletionErrors.length > 0) {
   const errorMessage = `File deletion errors occurred: ${deletionErrors.join(
    '; '
   )}`;
   console.error(errorMessage);
   throw new Error(errorMessage);
  }
 },
};

const deleteEquipementFiles = async (equipement) => {
 const deletionErrors = [];
 if (equipement.media) {
  await utils.deleteFileFromDirectory(
   equipement.media,
   'EQUIPEMENTS',
   deletionErrors
  );
  if (!fileDeleted) {
   console.warn(`Failed to delete file for equipement: ${equipement.id}`);
  }
 }
 utils.handleDeletionErrors(deletionErrors);
};

// Main deletion functions
const deletePropertyFiles = async (property) => {
 const deletionErrors = [];

 // Delete main photos
 if (property.photos && Array.isArray(property.photos)) {
  for (const photoUrl of property.photos) {
   await utils.deleteFileFromDirectory(photoUrl, 'UPLOADS', deletionErrors);
  }
 }

 // Delete front photo
 if (property.frontPhoto) {
  await utils.deleteFileFromDirectory(
   property.frontPhoto,
   'FRONTPHOTOS',
   deletionErrors
  );
 }

 // Delete property-specific photo
 if (property.photo) {
  await utils.deleteFileFromDirectory(property.photo, 'PLACES', deletionErrors);
 }

 // Delete associated equipement files if equipements exist
 if (property.Equipements && Array.isArray(property.Equipements)) {
  for (const equipement of property.Equipements) {
   try {
    await deleteEquipementFiles(equipement);
   } catch (error) {
    console.error('Error deleting equipement files:', error);
    deletionErrors.push(`Failed to delete equipement files: ${error.message}`);
   }
  }
 }

 utils.handleDeletionErrors(deletionErrors);
};

module.exports = {
 deletePropertyFiles,
 deleteEquipementFiles,
 ...utils, // Export utilities in case they're needed elsewhere
};
