import React, { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { FileUploader } from "react-drag-drop-files";
import { useImage } from "./hooks/useImage";
import JSZip from "jszip";
import "./App.css";

type Crop = { x: number; y: number; width: number; height: number; unit: "%" };

type FileImageCrop = {
  file: File;
  image: string;
  crop: Crop;
  croppedAreaPixels: Area;
  zoom: number;
};

export const FORCED_HEIGHT = 512;
export const FORCED_WIDTH = 512;
const DOWNLOAD_FILENAME = "sd-photos.zip";
const fileTypes = ["JPEG", "PNG", "HEIC"];

const ImageUploadAndCrop = () => {
  const [files, setFiles] = useState<File[] | null>(null);
  const [croppedImages, setCroppedImages] = useState<FileImageCrop[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [crop, setCrop] = useState<Crop>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    unit: "%",
  });

  const [zoom, setZoom] = useState<number>(1);

  const image = useImage({files, index});

  const handleChange = (files: File[]) => {
    setFiles(Array.from(files));
    setIndex(0);
  };

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      if (!image || !files) return;
      setCroppedImages((prev) => [
        ...prev.filter(({file}) => file !== files[index]),
          {
            file: files[index],
            image: String(image),
            croppedAreaPixels,
            crop: {
              x: croppedArea.x,
              y: croppedArea.y,
              width: croppedArea.width,
              height: croppedArea.height,
              unit: "%",
            },
            zoom,
          },
        ]
      );
    },
    [files, index, image, zoom]
  );

  const handleExport = useCallback(() => {
    if (!croppedImages.length) return;

    const zip = new JSZip();
    const promises = croppedImages.map(({ file, image, croppedAreaPixels }) => {
      return new Promise<void>((resolve) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const imageObj = new Image();

        imageObj.onload = () => {
          canvas.width = FORCED_WIDTH;
          canvas.height = FORCED_HEIGHT;
          ctx?.drawImage(
            imageObj,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            FORCED_WIDTH,
            FORCED_HEIGHT
          );

          canvas.toBlob((blob) => {
            if (blob) {
              zip.file(file.name, blob);
            }
            resolve();
          }, "image/png");
        };

        imageObj.src = image;
      });
    });

    Promise.all(promises).then(() => {
      zip.generateAsync({ type: "blob" }).then((blob: Blob) => {
        if (blob) {
          const link = document.createElement("a");
          link.download = DOWNLOAD_FILENAME;
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);
        }
      });
    });
  }, [croppedImages]);

  return (
    <div className="App">
      {!files &&
        <>
          <h1>SD Photo Cropper</h1>
          <div className='main-content'>
            <p>This tool allows you to crop photos into 512x512 squares, which are compatible with stablediffusion and dreambooth.</p>
            <FileUploader
              multiple={true}
              handleChange={handleChange}
              name="file"
              types={fileTypes}
            />
          </div>
        </>
      }

      {files && (
        <>
          <h1>SD Photo Cropper</h1>
          <div className='main-content'>
            <div className="crop-container">
              <Cropper
                image={String(image)}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={(newCrop) =>
                  setCrop({
                    x: newCrop.x,
                    y: newCrop.y,
                    width: FORCED_WIDTH,
                    height: FORCED_HEIGHT,
                    unit: "%",
                  })
                }
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
          </div>
          <div className="controls">
            <button
              type="button"
              onClick={() => {
                setFiles(null);
                setIndex(0);
                setCrop({
                  x: 0, y: 0, width: 0, height: 0, unit: "%"
                })
                setZoom(1);
              }}
              className='button'
            >
              Start Over
            </button>
            <button onClick={() => {
              const newIndex = index - 1;
              setIndex(newIndex);
              setCrop(croppedImages[newIndex]?.crop ?? {x: 0, y: 0, width: 0, height: 0, unit: "%"});
              setZoom(croppedImages[newIndex]?.zoom ?? 1);
            }}
            className='button'
            disabled={index - 1 < 0}>
              Prev
            </button>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => {
                setZoom(Number(e.target.value));
              }}
              className="zoom-range"
            />

            <button className='button' onClick={() => {
              const newIndex = index + 1;
              setIndex(newIndex);
              setCrop(croppedImages[newIndex]?.crop ?? {x: 0, y: 0, width: 0, height: 0, unit: "%"});
              setZoom(croppedImages[newIndex]?.zoom ?? 1);
            }} disabled={index === files?.length - 1}>
              Next
            </button>

            <button
              type="button"
              onClick={handleExport}
              className={`${'button'} ${index === files?.length - 1 ? "active" : ""}`}
            >
              Export
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageUploadAndCrop;
