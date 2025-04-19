
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

    onProgress(5);
    toast.info("Preparing for export...");
    
    const wasPlaying = !videoRef.paused;
    if (wasPlaying) videoRef.pause();
    
    // Reset video to beginning
    videoRef.currentTime = 0;
    await new Promise(resolve => setTimeout(resolve, 500));

    // Calculate high resolution canvas dimensions based on quality setting
    const scaleFactor = quality === '2160p' ? 4 : quality === '1080p' ? 2.5 : 2;
    const canvas = document.createElement('canvas');
    canvas.width = videoContainer.offsetWidth * scaleFactor;
    canvas.height = videoContainer.offsetHeight * scaleFactor;
    const ctx = canvas.getContext('2d', { alpha: false });
    
    if (!ctx) {
      toast.error("Failed to create canvas context");
      return;
    }

    // Higher bitrates for better quality
    const bitrate = quality === '2160p' ? 30000000 : quality === '1080p' ? 15000000 : 8000000;
    
    // Use higher framerate for smoother video
    const fps = 60;
    const stream = canvas.captureStream(fps);
    
    // Force specific codec and container type
    let mimeType = 'video/webm;codecs=vp9';
    if (format === 'mp4') {
      mimeType = 'video/mp4;codecs=h264';
    }
    
    // Configure MediaRecorder with highest quality settings
    let mediaRecorder;
    try {
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: bitrate
      });
    } catch (e) {
      console.error("MediaRecorder error:", e);
      // Fallback to default mime type if codec not supported
      mediaRecorder = new MediaRecorder(stream, {
        videoBitsPerSecond: bitrate
      });
    }
    
    const chunks: BlobPart[] = [];
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    onProgress(10);
    toast.info("Starting video capture...");

    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = async () => {
        try {
          onProgress(95);
          toast.info("Finalizing export...");
          
          const blob = new Blob(chunks, { 
            type: format === 'webm' ? 'video/webm' : 'video/mp4' 
          });
          
          onProgress(100);
          const fileName = `screen-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          
          // Clean up
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 100);
          
          toast.success(`Export completed successfully: ${fileName}`);
          resolve();
        } catch (error) {
          console.error("Error in mediaRecorder.onstop:", error);
          reject(error);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        toast.error("Error during recording");
        reject(new Error("MediaRecorder error"));
      };

      try {
        mediaRecorder.start();
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
                      // Ensure video is visible
                      if (el.tagName === 'VIDEO') {
                        el.style.visibility = 'visible';
                        el.style.opacity = '1';
                      }
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
                try {
                  mediaRecorder.stop();
                  if (wasPlaying) videoRef.play();
                } catch (e) {
                  console.error("Error stopping mediaRecorder:", e);
                  reject(e);
                }
              }, 500);
            }
          } catch (err) {
            console.error("Error capturing frame:", err);
            clearInterval(progressInterval);
            reject(err);
          }
        };

        captureFrame().catch(err => {
          console.error("Error in captureFrame:", err);
          clearInterval(progressInterval);
          reject(err);
        });
      } catch (error) {
        console.error("Error starting mediaRecorder:", error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('Export failed:', error);
    toast.error('Failed to export video');
    throw error;
  }
};
