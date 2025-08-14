import { useState } from 'react';
import { FileUpload } from '../types/FileUpload';
import { WebSocketService } from '../services/WebSocketService';

export const useWebSocketFileUpload = () => {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const service = new WebSocketService();

  const uploadFiles = async (
    files: File[],
    additionalData: Record<string, any>
  ): Promise<FileUpload[]> => {
    if (files.length === 0) throw new Error('No files selected for upload');

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const socket = await service.connect();

      return await new Promise((resolve, reject) => {
        let resultReceived = false;

        socket.onmessage = (event: MessageEvent) => {
          console.log('Received text message:');
          try {
            const data = event.data;
            console.log('Received text message:', event.data);
            if (typeof data === 'string') {
              if (data.startsWith('Error')) {
                throw new Error(`Server error: ${data}`);
              }

              try {
                const parsedData = JSON.parse(data);

                // Check if this is a progress update
                if (parsedData.progress !== undefined) {
                  setUploadProgress(parsedData.progress);
                  return; // Don't resolve yet, just update progress
                }

                // If it's the final response with file details
                if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].mediaUrl) {
                  resultReceived = true;
                  setUploadProgress(100);
                  resolve(parsedData);
                  service.close();
                }
              } catch (parseError) {
                console.error('Error parsing WebSocket message:', parseError);
                // If it's not valid JSON, it might be another type of message
                // Just log it and continue
              }
            }
          } catch (err) {
            reject(err);
            service.close();
          }
        };

        socket.onerror = (err) => {
          setError('WebSocket encountered an error.');
          reject(err);
          service.close();
        };

        socket.onclose = () => {
          if (!resultReceived) reject('WebSocket connection closed unexpectedly.');
        };

        // Send metadata and files
        socket.send(JSON.stringify(additionalData));
        socket.send(files.length.toString());

        files.forEach(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          socket.send(arrayBuffer);
        });
      });
    } catch (err: any) {
      setError(err.message || 'File upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadFiles,
    isUploading,
    error,
    uploadProgress
  };
};