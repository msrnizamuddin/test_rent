import { PutObjectCommand } from "@aws-sdk/client-s3";
import client from "./client.js";

export const uploadFile = async (file) => {
  const fileName = `${Date.now()}-${file.originalname}`;

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  return {
    key: fileName,
    url: `${process.env.B2_PUBLIC_URL}/${encodeURIComponent(fileName)}`,
  };
};
