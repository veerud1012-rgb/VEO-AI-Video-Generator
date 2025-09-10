export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generateVideoThumbnail = (videoBlob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      return reject(new Error('Could not get canvas context'));
    }

    video.src = URL.createObjectURL(videoBlob);
    video.muted = true;
    video.crossOrigin = "anonymous"; 

    video.onloadeddata = () => {
      video.currentTime = 0.1; 
    };

    video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        URL.revokeObjectURL(video.src);
        video.remove();
        canvas.remove();
        
        resolve(dataUrl);
    };

    video.onerror = (err) => {
      reject(err);
      URL.revokeObjectURL(video.src);
      video.remove();
      canvas.remove();
    };

    video.load();
  });
};
