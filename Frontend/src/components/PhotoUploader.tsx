import { useState } from "react";
import type { ChangeEvent } from "react";
import { Camera, ImagePlus } from "lucide-react";
import { usePhotos } from "../hooks/usePhotos";
import { useApp } from "../context/AppContext";
import { PhotoLightbox } from "./PhotoLightbox";

export function PhotoUploader({
  ownerType,
  ownerId,
  mode,
}: {
  ownerType: "box" | "item";
  ownerId: string;
  mode: "box" | "condition";
}) {
  const { photos, addPhotos, deletePhoto, updatePhoto } = usePhotos(ownerType, ownerId);
  const { reportError } = useApp();
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const activePhoto = photos.find((photo) => photo.id === activePhotoId) ?? null;

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      addPhotos(event.target.files).catch((err) => reportError(err));
    }
    event.target.value = "";
  };

  return (
    <div className="photo-section">
      <div className="photo-add-row">
        <label className="soft-button ghost-button photo-input-label">
          <Camera size={16} /> Take photo
          <input type="file" accept="image/*" capture="environment" multiple onChange={handleFiles} hidden />
        </label>
        <label className="soft-button ghost-button photo-input-label">
          <ImagePlus size={16} /> Upload
          <input type="file" accept="image/*" multiple onChange={handleFiles} hidden />
        </label>
      </div>
      {photos.length === 0 ? (
        <p className="muted">No photos yet.</p>
      ) : (
        <div className="photo-grid">
          {photos.map((photo) => (
            <button className="photo-thumb" key={photo.id} onClick={() => setActivePhotoId(photo.id)}>
              <img src={photo.dataUrl} alt={photo.caption || "Photo"} />
            </button>
          ))}
        </div>
      )}
      {activePhoto && (
        <PhotoLightbox
          photo={activePhoto}
          mode={mode}
          onClose={() => setActivePhotoId(null)}
          onDelete={() => {
            deletePhoto(activePhoto.id).catch((err) => reportError(err));
            setActivePhotoId(null);
          }}
          onSave={(fields) => updatePhoto(activePhoto.id, fields).catch((err) => reportError(err))}
        />
      )}
    </div>
  );
}
