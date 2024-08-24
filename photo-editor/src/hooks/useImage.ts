import { useState, useEffect } from "react";
import { FORCED_WIDTH, FORCED_HEIGHT } from "../App";
// import { on } from "events";

export const useImage = ({ files, index, onError }: { files: File[] | null, index: number, onError?: (error: string) => void }) => {
  const [image, setImage] = useState<string | ArrayBuffer | null>(null);

  useEffect(() => {
    if (!files || !files[index]) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < FORCED_WIDTH || img.height < FORCED_HEIGHT) {
          // onError && onError('Image too small');
          // maybe we can just allow the user to zoom in?
        } else {
          setImage(img.src);
        }
      };
      img.src = String(e.target?.result);
    };

    reader.readAsDataURL(files[index]);

    // Cleanup function
    return () => {
      reader.abort();
    };
  }, [files, index]);

  return image;
};