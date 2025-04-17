
export interface RecordingOptions {
  audio: boolean;
  video: boolean;
}

export class ScreenRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private currentRecording: Blob | null = null;

  getCurrentRecording() {
    return this.currentRecording;
  }

  async startRecording(stream: MediaStream) {
    try {
      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.recordedChunks = [];
        this.currentRecording = recordedBlob;
        resolve(recordedBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  async saveRecording(blob: Blob, filename: string = 'recording.webm') {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export const screenRecordingService = new ScreenRecordingService();
