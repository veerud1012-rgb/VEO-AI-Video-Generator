import React, { useState, useCallback, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';
import LoadingIndicator from './LoadingIndicator';
import { UploadIcon, DownloadIcon, SparklesIcon, TrashIcon } from './icons';
import { VideoHistoryEntry } from '../types';
import VideoHistory from './VideoHistory';
import { blobToBase64, generateVideoThumbnail } from '../utils/videoUtils';


interface UploadedImage {
  file: File;
  previewUrl: string;
}

const aspectRatios = [
  { value: '16:9', label: 'Landscape' },
  { value: '9:16', label: 'Portrait' },
  { value: '1:1', label: 'Square' },
];

const MAX_HISTORY_ITEMS = 9;

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<VideoHistoryEntry[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('videoHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load video history from localStorage", error);
      localStorage.removeItem('videoHistory');
      setHistory([]);
    }
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError("Image size should not exceed 4MB.");
        return;
      }
      setImage({
        file: file,
        previewUrl: URL.createObjectURL(file),
      });
      setError(null);
    }
  };

  const handleGenerateVideo = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate a video.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);
    setLoadingMessage('Initializing...');

    try {
      const videoBlob = await generateVideo(prompt, image?.file || null, aspectRatio, setLoadingMessage);
      
      const [thumbnailDataUrl, videoDataUrl] = await Promise.all([
          generateVideoThumbnail(videoBlob),
          blobToBase64(videoBlob)
      ]);

      const newEntry: VideoHistoryEntry = {
          id: `vid_${Date.now()}`,
          prompt,
          videoDataUrl,
          thumbnailDataUrl,
          timestamp: Date.now(),
      };

      setHistory(prevHistory => {
          const newHistory = [newEntry, ...prevHistory];
          const updatedHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
          localStorage.setItem('videoHistory', JSON.stringify(updatedHistory));
          return updatedHistory;
      });
      
      const videoBlobUrl = URL.createObjectURL(videoBlob);
      setGeneratedVideoUrl(videoBlobUrl);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Generation failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, image, aspectRatio]);

  const resetState = () => {
    setPrompt('');
    setImage(null);
    setGeneratedVideoUrl(null);
    setError(null);
    setAspectRatio('16:9');
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory(prevHistory => {
        const updatedHistory = prevHistory.filter(item => item.id !== id);
        localStorage.setItem('videoHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
    });
  };

  const handleSelectHistoryVideo = (videoDataUrl: string) => {
      setGeneratedVideoUrl(videoDataUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-6 md:p-8 transition-all duration-300">
        {isLoading ? (
          <LoadingIndicator message={loadingMessage} />
        ) : error ? (
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => setError(null)}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : generatedVideoUrl ? (
          <div className="text-center flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">Your Video is Ready!</h2>
            <video src={generatedVideoUrl} controls autoPlay loop className="w-full max-w-lg rounded-lg shadow-lg mb-6 border-2 border-purple-500/50">
              Your browser does not support the video tag.
            </video>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={generatedVideoUrl}
                download={`veo_video_${Date.now()}.mp4`}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                <DownloadIcon className="h-5 w-5" />
                Download Video
              </a>
              <button
                onClick={resetState}
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Create Another
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
                Describe your video
              </label>
              <textarea
                id="prompt"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A majestic lion roaring on a rocky outcrop at sunset, cinematic lighting"
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Aspect Ratio
              </label>
              <div className="flex flex-wrap gap-3">
                {aspectRatios.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAspectRatio(value)}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border-2 ${
                      aspectRatio === value
                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-600'
                    }`}
                  >
                    {label} ({value})
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="flex-1 w-full cursor-pointer bg-gray-700 hover:bg-gray-600 border-2 border-dashed border-gray-500 rounded-lg p-4 text-center transition-colors">
                <div className="flex items-center justify-center gap-3 text-gray-400">
                  <UploadIcon className="h-6 w-6" />
                  <span>{image ? 'Change Image' : 'Upload an Image (Optional)'}</span>
                </div>
                <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleImageChange} />
              </label>
              
              {image && (
                  <div className="relative flex-shrink-0 group">
                      <img src={image.previewUrl} alt="Preview" className="h-20 w-20 rounded-md object-cover border-2 border-gray-600"/>
                      <button 
                          onClick={() => setImage(null)} 
                          className="absolute top-0 right-0 -m-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                          aria-label="Remove image"
                      >
                          <TrashIcon className="h-4 w-4" />
                      </button>
                  </div>
              )}
            </div>
            
            <button
              onClick={handleGenerateVideo}
              disabled={!prompt.trim()}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
            >
              <SparklesIcon className="h-6 w-6" />
              Generate Video
            </button>
          </div>
        )}
      </div>
      <VideoHistory 
        history={history}
        onSelect={handleSelectHistoryVideo}
        onDelete={handleDeleteHistoryItem}
      />
    </>
  );
};

export default VideoGenerator;