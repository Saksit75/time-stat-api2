const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');
const { CLOUDIN_KEY, CLOUDIN_SECRET, CLOUDIN_NAME } = require('../config');

cloudinary.config({
    cloud_name: CLOUDIN_NAME,
    api_key: CLOUDIN_KEY,
    api_secret: CLOUDIN_SECRET,
});

const uploadImage = (buffer, folder = 'teachers') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                transformation: [
                    { width: 500, height: 500, crop: 'fill', gravity: 'auto', fetch_format: 'auto', quality: 'auto' }
                ]
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};
const deleteImage = async (publicId) => {
    if (!publicId) return;
    return cloudinary.uploader.destroy(publicId);
};

module.exports = {
    uploadImage,
    deleteImage
};