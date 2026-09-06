import { useCallback, useEffect, useState } from "react";
import type { Photo } from "../types";
import { api } from "../services/api";

export function usePhotos(ownerType: "box" | "item", ownerId: string | null) {
  const [photos, setPhotos] = useState<Photo[]>([]);

  const refresh = useCallback(() => {
    if (!ownerId) return;
    api.getPhotos(ownerType, ownerId).then(setPhotos);
  }, [ownerType, ownerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addPhotos = async (files: FileList | File[]) => {
    if (!ownerId) return;
    const fileList = Array.from(files);
    let failures = 0;
    for (const file of fileList) {
      try {
        const dataUrl = await readAndCompressImage(file);
        await api.addPhoto({ ownerType, ownerId, dataUrl });
      } catch {
        // Keep going so one bad/corrupt file doesn't stop the rest of the batch
        // from uploading; refresh() below still surfaces whatever did succeed.
        failures += 1;
      }
    }
    refresh();
    if (failures > 0) {
      throw new Error(
        failures === fileList.length
          ? "Couldn't upload those photos. Please try again."
          : `${failures} of ${fileList.length} photos failed to upload.`,
      );
    }
  };
  const deletePhoto = async (id: string) => {
    await api.deletePhoto(id);
    refresh();
  };
  const updatePhoto = async (id: string, fields: { caption?: string; note?: string }) => {
    await api.updatePhoto(id, fields);
    refresh();
  };

  return { photos: ownerId ? photos : [], addPhotos, deletePhoto, updatePhoto };
}

// Shrinks a camera photo (often several MB) down to a small JPEG data URL before
// it ever goes over the wire to the server.
function readAndCompressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not read image"));
      img.onload = () => {
        const maxDim = 1280;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
