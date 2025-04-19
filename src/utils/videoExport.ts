
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
    const videoWidth = videoRef.videoWidth || videoContainer.clientWidth;
    const videoHeight = videoRef.videoHeight || videoContainer.clientHeight;
    
    // Ensure dimensions are even (required by some codecs)
    canvas.width = Math.floor(videoWidth * scaleFactor / 2) * 2;
    canvas.height = Math.floor(videoHeight * scaleFactor / 2) * 2;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    
    if (!ctx) {
      toast.error("Failed to create canvas context");
      if (wasPlaying) videoRef.play();
      return;
    }

    // Higher bitrates for better quality
    const bitrate = quality === '2160p' ? 30000000 : quality === '1080p' ? 15000000 : 8000000;
    
    // Use higher framerate for smoother video
    const fps = 30;
    const stream = canvas.captureStream(fps);
    
    // Force appropriate codec based on format
    let mimeType;
    let codecs;
    if (format === 'mp4') {
      // Try different codecs for MP4
      const possibleMimeTypes = [
        'video/mp4;codecs=h264',
        'video/mp4;codecs=avc1.42E01E',
        'video/mp4'
      ];
      
      for (const type of possibleMimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
    } else if (format === 'webm') {
      // Try different codecs for WebM
      const possibleMimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm'
      ];
      
      for (const type of possibleMimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
    }
    
    // Configure MediaRecorder with the best available codec
    let mediaRecorder;
    try {
      const options: MediaRecorderOptions = {
        videoBitsPerSecond: bitrate
      };
      
      if (mimeType) {
        options.mimeType = mimeType;
      }
      
      mediaRecorder = new MediaRecorder(stream, options);
      console.log(`Using codec: ${mediaRecorder.mimeType}`);
    } catch (e) {
      console.error("MediaRecorder error:", e);
      // Fallback to default settings
      mediaRecorder = new MediaRecorder(stream);
      console.log(`Fallback codec: ${mediaRecorder.mimeType}`);
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
          
          // Create appropriate MIME type for the output format
          const outputMimeType = format === 'webm' ? 'video/webm' : 'video/mp4';
          
          // Create blob with the correct type
          const blob = new Blob(chunks, { type: outputMimeType });
          
          if (blob.size === 0) {
            toast.error("Export failed: No data recorded");
            if (wasPlaying) videoRef.play();
            reject(new Error("No data recorded"));
            return;
          }
          
          onProgress(100);
          const fileName = `screen-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
          const url = window.URL.createObjectURL(blob);
          
          // Create a download link and trigger it
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          
          // Clean up
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            if (wasPlaying) videoRef.play();
          }, 100);
          
          toast.success(`Export completed: ${fileName}`);
          resolve();
        } catch (error) {
          console.error("Error in mediaRecorder.onstop:", error);
          toast.error("Export failed: Error processing video");
          if (wasPlaying) videoRef.play();
          reject(error);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        toast.error("Error during recording");
        if (wasPlaying) videoRef.play();
        reject(new Error("MediaRecorder error"));
      };

      try {
        // Start recording
        mediaRecorder.start(1000); // Collect data every second
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
            if (videoRef.paused || videoRef.ended) {
              clearInterval(progressInterval);
              setTimeout(() => {
                try {
                  mediaRecorder.stop();
                } catch (e) {
                  console.error("Error stopping mediaRecorder:", e);
                  reject(e);
                }
              }, 500);
              return;
            }

            // Capture the video frame directly
            ctx.drawImage(videoRef, 0, 0, canvas.width, canvas.height);
            
            requestAnimationFrame(captureFrame);
          } catch (err) {
            console.error("Error capturing frame:", err);
            clearInterval(progressInterval);
            toast.error("Export failed: Error capturing frames");
            if (wasPlaying) videoRef.play();
            reject(err);
          }
        };

        // Start capturing frames
        captureFrame().catch(err => {
          console.error("Error in captureFrame:", err);
          clearInterval(progressInterval);
          toast.error("Export failed: Error initiating capture");
          if (wasPlaying) videoRef.play();
          reject(err);
        });
        
        // Set a maximum recording time as a safeguard
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }, (totalDuration * 1000) + 5000); // Video duration plus 5 seconds buffer
        
      } catch (error) {
        console.error("Error starting mediaRecorder:", error);
        toast.error("Export failed: Could not start recording");
        if (wasPlaying) videoRef.play();
        reject(error);
      }
    });
  } catch (error) {
    console.error('Export failed:', error);
    toast.error('Failed to export video');
    throw error;
  }
};
