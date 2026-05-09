import { storage } from "@/firebase/config";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

export const storageRepository = {
  async upload(
    userId: string,
    file: { uri: string; name: string; type: string },
  ): Promise<{ downloadUrl: string; fileName: string }> {
    const fileName = `${userId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);

    let blob: Blob;
    if (file.uri.startsWith("data:") || file.uri.startsWith("file://")) {
      const response = await fetch(file.uri);
      blob = await response.blob();
    } else {
      blob = new Blob([file.uri], { type: file.type });
    }

    const metadata = {
      contentType: file.type || "image/jpeg",
      cacheControl: "public, max-age=3600",
      customMetadata: {
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
      },
    };

    const snapshot = await uploadBytes(storageRef, blob, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return { downloadUrl, fileName: file.name };
  },

  async remove(filePath: string): Promise<void> {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
  },
};
