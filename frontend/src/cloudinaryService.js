
const CLOUDINARY_CLOUD_NAME = 'df1uxcckl'; 
const CLOUDINARY_UPLOAD_PRESET = 'DT_2004'; 


const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Uploads an image file URI to Cloudinary using an unsigned upload preset.
 * @param {string} imageUri 
 * @returns {Promise<string|null>} 
 */
export const uploadImageToCloudinary = async (imageUri) => {
  if (!imageUri) {
    console.warn('No image URI provided for upload.');
    return null;
  }

 
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg', 
    name: 'upload.jpg', 
  });
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); 

  console.log('Uploading image to Cloudinary...');
  console.log('Upload URL:', CLOUDINARY_UPLOAD_URL);
  console.log('Upload Preset:', CLOUDINARY_UPLOAD_PRESET);
  console.log('Image URI:', imageUri);


  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });


    const result = await response.json();

    console.log('Cloudinary upload response:', result);


    if (response.ok) {
      
      return result.secure_url;
    } else {
      
      console.error('Cloudinary upload failed:', result.error ? result.error.message : 'Unknown error');
      Alert.alert('Upload Failed', result.error ? result.error.message : 'Could not upload image.');
      return null;
    }

  } catch (error) {
    console.error('Cloudinary upload network error:', error);
    Alert.alert('Upload Failed', 'Network error during upload.');
    return null;
  }
};