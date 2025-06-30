import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
 cloud_name: 'your_cloud_name',
 api_key: 'your_api_key',
 api_secret: 'your_api_secret',
});

const uploadImage = async (image) => {
 try {
 const result = await cloudinary.uploader.upload(image, {
 folder: 'profile_pictures',
 });
 console.log(result.secure_url);
 } catch (error) {
 console.log('Cloudinary upload error:', error);
 }
};

export default uploadImage;