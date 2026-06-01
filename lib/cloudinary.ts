import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

export async function uploadImage(
  file: string,
  folder: string = "richorah"
): Promise<string> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "image",
    quality: "auto",
    fetch_format: "auto",
  })
  return result.secure_url
}

export async function deleteImage(url: string): Promise<void> {
  const publicId = url.split("/").pop()?.split(".")[0]
  if (publicId) {
    await cloudinary.uploader.destroy(`richorah/${publicId}`)
  }
}
