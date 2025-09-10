import React from 'react';
import { VideoHistoryEntry } from '../types';
import { DownloadIcon, TrashIcon, PlayIcon } from './icons';

interface VideoHistoryProps {
  history: VideoHistoryEntry[];
  onSelect: (videoDataUrl: string) => void;
  onDelete: (id: string) => void;
}

const VideoHistory: React.FC<VideoHistoryProps> = ({ history, onSelect, onDelete }) => {
  if (history.length === 0) {
    return (
      <div className="mt-12 text-center text-gray-500">
        <h3 className="text-xl font-semibold text-gray-300 mb-2">Video History</h3>
        <p>Your generated videos will appear here.</p>
      </div>
    );
  }

  return (
    <div className="mt-12 w-full">
      <h3 className="text-2xl font-semibold text-gray-200 mb-6 text-center">Video History</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item) => (
          <div key={item.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg group relative transition-transform duration-300 hover:scale-105 focus-within:ring-2 focus-within:ring-purple-500">
            <button onClick={() => onSelect(item.videoDataUrl)} className="block w-full aspect-video bg-black cursor-pointer" aria-label={`View video for prompt: ${item.prompt}`}>
                <img src={item.thumbnailDataUrl} alt={`Thumbnail for prompt: ${item.prompt}`} className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayIcon className="h-12 w-12 text-white/80" />
                </div>
            </button>
            <div className="p-4">
              <p className="text-sm text-gray-300 truncate" title={item.prompt}>{item.prompt}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
            </div>
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300">
              <a
                href={item.videoDataUrl}
                download={`veo_video_${item.id}.mp4`}
                className="bg-green-600/80 hover:bg-green-600 text-white p-2 rounded-full shadow-md"
                aria-label="Download video"
                onClick={(e) => e.stopPropagation()}
              >
                <DownloadIcon className="h-5 w-5" />
              </a>
              <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                }}
                className="bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-full shadow-md"
                aria-label="Delete video from history"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoHistory;
