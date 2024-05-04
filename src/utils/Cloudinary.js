import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "namastebackend",
  api_key: "788577795323168",
  api_secret: "GjPiFEJOdiAvWFiKoQnwDpVouQA",
});

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const reponse = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File is uploaded on cloudinary ", reponse.url);

    fs.unlinkSync(localFilePath);
    return reponse;
  } catch (error) {
    // remove the locally saved file
    console.log(error);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export const deleteFromCloudinary = async (fileName) => {
  try {
    if (!fileName) return null;

    const res = await cloudinary.uploader.destroy(fileName, function (result) {
      console.log("File is deleted from cloudinary", result);
    });

    console.log(res);
  } catch (error) {
    console.log(error?.message);
  }
};
