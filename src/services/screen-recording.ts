
export interface RecordingOptions {
  audio: boolean;
  video: boolean;
}

export interface MousePosition {
  x: number;
  y: number;
  timestamp: number;
}

export class ScreenRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private currentRecordingPath: string | null = null;
  private mousePositions: MousePosition[] = [];

  getCurrentRecordingPath() {
    return this.currentRecordingPath;
  }

  getMousePositions() {
    return this.mousePositions;
  }

  private trackMousePosition = () => {
    const handleMouseMove = (e: MouseEvent) => {
      this.mousePositions.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }

  async startRecording(stream: MediaStream) {
    try {
      this.recordedChunks = [];
      this.mousePositions = [];
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 8000000 // 8 Mbps for high quality
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      const cleanup = this.trackMousePosition();
      this.mediaRecorder.onstop = () => {
        cleanup();
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  private generateFileName(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `recording-${timestamp}.webm`;
  }

  stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const recordedBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
          const fileName = this.generateFileName();
          
          // Use the File System Access API to save the file
          try {
            const handle = await window.showSaveFilePicker({
              suggestedName: fileName,
              types: [{
                description: 'Video Files',
                accept: { 'video/webm': ['.webm'] }
              }]
            });
            
            const writable = await handle.createWritable();
            await writable.write(recordedBlob);
            await writable.close();
            
            // Store the file path
            this.currentRecordingPath = fileName;
            resolve(fileName);
          } catch (error) {
            // Fallback to downloading if File System Access API is not supported
            const url = URL.createObjectURL(recordedBlob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            this.currentRecordingPath = fileName;
            resolve(fileName);
          }
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }
}

export const screenRecordingService = new ScreenRecordingService();
