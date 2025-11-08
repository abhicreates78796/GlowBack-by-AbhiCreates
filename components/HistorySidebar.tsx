import React from 'react';
import { XCircleIcon, DownloadIcon, EyeIcon } from './Icons';

export type HistoryItem = {
  id: number;
  originalImageUrl: string;
  restoredImageUrl: string;
  originalFileName: string;
};

type HistorySidebarProps = {
  history: HistoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: HistoryItem) => void;
  onDownload: (item: HistoryItem) => void;
};

export const HistorySidebar = ({ history, isOpen, onClose, onSelect, onDownload }: HistorySidebarProps) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <aside 
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 p-4 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-heading"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="history-heading" className="text-2xl font-bold text-white">Restoration History</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700" aria-label="Close history">
            <XCircleIcon />
          </button>
        </div>
        {history.length === 0 ? (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-gray-400 text-center">Your recent restorations will appear here.</p>
          </div>
        ) : (
          <ul className="space-y-4 overflow-y-auto flex-grow -mr-2 pr-2">
            {history.slice().reverse().map(item => (
              <li key={item.id} className="bg-gray-700 p-3 rounded-lg flex items-center space-x-4 transition-transform hover:scale-[1.02]">
                <img src={item.restoredImageUrl} alt="Restored thumbnail" className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                <div className="flex-grow overflow-hidden">
                  <p className="text-white font-semibold truncate" title={item.originalFileName}>{item.originalFileName}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <button onClick={() => onSelect(item)} className="p-2 bg-indigo-600 rounded-full hover:bg-indigo-500 text-white flex items-center justify-center" title="View">
                      <EyeIcon />
                    </button>
                    <button onClick={() => onDownload(item)} className="p-2 bg-purple-600 rounded-full hover:bg-purple-500 text-white flex items-center justify-center" title="Download">
                      <DownloadIcon />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </>
  );
};
