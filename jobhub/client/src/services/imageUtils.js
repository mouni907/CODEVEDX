/**
 * Resizes an image file using HTML5 Canvas to a maximum width/height
 * and returns a promise resolving to a smaller File object and its base64 data URL.
 */
export const resizeImage = (file, maxWidth = 150, maxHeight = 150) => {
    return new Promise((resolve) => {
        if (!file || !file.type.startsWith('image/')) {
            resolve({ file, previewUrl: null });
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                }

                const mimeType = file.type || 'image/png';
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        const resizedFile = new File([blob], file.name, {
                            type: mimeType,
                            lastModified: Date.now()
                        });
                        resolve({
                            file: resizedFile,
                            previewUrl: canvas.toDataURL(mimeType, 0.85)
                        });
                    } else {
                        resolve({ file, previewUrl: event.target.result });
                    }
                }, mimeType, 0.85);
            };
            img.onerror = () => {
                resolve({ file, previewUrl: event.target.result });
            };
        };
        reader.onerror = () => {
            resolve({ file, previewUrl: null });
        };
    });
};
