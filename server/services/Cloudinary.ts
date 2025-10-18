import {v2 as cloudinary} from "cloudinary"
import fs, { PathLike } from "fs"
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname= path.dirname(__filename);

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUDNAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath: string) => {
    try {
        if (!localFilePath)
            {
                return null
            }
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // console.log("lol",response)
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath as PathLike)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath as PathLike) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const getAllVideos = async(publicIds: string[])=>{
    const videosFiles = publicIds.forEach((publicId)=>{
        return cloudinary.url(publicId, {
            resource_type: 'video',
            secure: true,
        });
    });
    console.log(videosFiles);
}

const downloadVideoFromCloudinary= async(url: string | null, filename: string | null, extension: string | null)=>{
    const uploadDir = path.join(__dirname, "../../uploads");
    console.log(`url: ${url} and filename: ${filename}`);
    console.log(`uploadDir ${uploadDir}`);

    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    if (!url || !filename || !extension) {
        throw new Error("Video URL or filename is missing");
    }

    const filePath = path.join(uploadDir, `${filename}.${extension}`);
    const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
    })

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on("finish", () => resolve(filePath));
        writer.on("error", reject);
    });
};

const deleteOldVideo= async()=>{
    console.log("hi");
    try{
        const uploadDir = path.join(__dirname, "../../uploads");
        // console.log(`uploadDir ${uploadDir}`);
        const oldFiles = fs.readdirSync(uploadDir);
        for(const file of oldFiles){
            fs.unlinkSync(path.join(uploadDir,file))
        }
    }
    catch(error){
        console.log("delete old files failed");
        throw new Error("delete old files failed");
    }
}

export {
    uploadOnCloudinary,
    getAllVideos,
    deleteOldVideo,
    downloadVideoFromCloudinary
}