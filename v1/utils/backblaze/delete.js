import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import client from "./client.js";

export const deleteFile = async (key) => {
  await client.send(
    new DeleteObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: key,
    }),
  );
};
