import v2 from "cloudinary";
import fs from "fs";

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
});

export const uploadToCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        //file upload on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resourcetype: "auto",
        })
        //file have been uploaded on cloudinary successfully
        console.log("File uploaded to Cloudinary successfully !!!",response);
        return response
    }catch (error) {
        fs.unlinkSync(localFilePath); // remove the file from local storage
        return null
    }
}

export {uploadToCloudinary}