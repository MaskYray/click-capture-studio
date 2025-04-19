
import html2canvas from "html2canvas";
import { toast } from "sonner";

export const formatTimeDisplay = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return "00:00.00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
};

export const exportVideo = async (
  videoRef: HTMLVideoElement,
  videoContainer: HTMLElement,
  format: string,
  quality: string,
  onProgress: (progress: number) => void
): Promise<void> => {
  try {
    if (!videoRef || !videoContainer) {
      toast.error("No video available to export");
      return;
    }

    onProgress(0);
    const wasPlaying = !videoRef.paused;
    if (wasPlaying) videoRef.pause();
    
    videoRef.currentTime = 0;

    // Calculate high resolution canvas dimensions based on quality setting
    const scaleFactor = quality === '2160p' ? 3 : quality === '1080p' ? 2 : 1.5;
    const canvas = document.createElement('canvas');
    canvas.width = videoContainer.offsetWidth * scaleFactor;
    canvas.height = videoContainer.offsetHeight * scaleFactor;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      toast.error("Failed to create canvas context");
      return;
    }

    // Higher bitrates for better quality
    const bitrate = quality === '2160p' ? 20000000 : quality === '1080p' ? 12000000 : 6000000;
    
    // Higher framerate for smoother video
    const fps = 60;
    const stream = canvas.captureStream(fps);
    
    // Configure MediaRecorder with higher quality settings
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: format === 'webm' ? 'video/webm;codecs=vp9' : 'video/mp4;codecs=h264',
      videoBitsPerSecond: bitrate
    });
    
    const chunks: BlobPart[] = [];
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { 
          type: format === 'webm' ? 'video/webm' : 'video/mp4' 
        });
        
        onProgress(100);
        const fileName = `screen-recording-${new Date().toISOString().slice(0, 10)}.${format}`;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Export completed successfully: ${fileName}`);
        resolve();
      };

      mediaRecorder.start();
      onProgress(10);
      videoRef.muted = false;
      videoRef.play();

      let lastProgress = 10;
      const totalDuration = videoRef.duration || 0;
      const progressInterval = setInterval(() => {
        if (videoRef && totalDuration > 0) {
          const currentProgress = 10 + (videoRef.currentTime / totalDuration) * 85;
          lastProgress = Math.min(95, currentProgress);
          onProgress(Math.floor(lastProgress));
        }
      }, 500);

      const captureFrame = async () => {
        try {
          // Enhanced html2canvas options for better quality
          const snapshot = await html2canvas(videoContainer, {
            backgroundColor: null,
            logging: false,
            useCORS: true,
            allowTaint: true,
            scale: scaleFactor,
            imageTimeout: 0, // No timeout for image rendering
            onclone: (clonedDoc) => {
              // Make sure styles are preserved in cloned document
              const clonedContainer = clonedDoc.getElementById('video-container');
              if (clonedContainer) {
                clonedContainer.style.transform = 'none';
                
                // Ensure all child elements maintain their quality
                const allElements = clonedContainer.querySelectorAll('*');
                allElements.forEach(el => {
                  if (el instanceof HTMLElement) {
                    el.style.imageRendering = 'high-quality';
                  }
                });
              }
            }
          });
          
          // Use high-quality image rendering when drawing to canvas
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(snapshot, 0, 0, canvas.width, canvas.height);
          
          if (!videoRef.ended && !videoRef.paused) {
            requestAnimationFrame(captureFrame);
          } else {
            clearInterval(progressInterval);
            setTimeout(() => {
              mediaRecorder.stop();
              if (wasPlaying) videoRef.play();
            }, 500);
          }
        } catch (err) {
          console.error("Error capturing frame:", err);
          reject(err);
        }
      };

      captureFrame().catch(reject);
    });
  } catch (error) {
    console.error('Export failed:', error);
    toast.error('Failed to export video');
    throw error;
  }
};
