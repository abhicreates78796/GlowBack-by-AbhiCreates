import React, { useState, useCallback, useEffect } from 'react';
import { restoreImage } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { Loader } from './components/Loader';
import { UploadIcon, SparklesIcon, DownloadIcon, XCircleIcon, PhotoIcon, HistoryIcon } from './components/Icons';
import ImageComparator from './components/ImageComparator';
import { HistorySidebar, HistoryItem } from './components/HistorySidebar';

type AppState = 'initial' | 'imageSelected' | 'loading' | 'restored' | 'error';

const loadingMessages = [
    "AI is working its magic...",
    "Analyzing pixels...",
    "Restoring faded colors...",
    "Mending digital tears...",
    "Enhancing fine details...",
    "Almost there, polishing the final image!",
];

export default function App() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [restoredImageUrl, setRestoredImageUrl] = useState<string | null>(null);
  const [currentOriginalFileName, setCurrentOriginalFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>('initial');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  
  const [restorationHistory, setRestorationHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    let progressInterval: number | undefined;
    let messageInterval: number | undefined;

    if (appState === 'loading') {
      setLoadingProgress(0);
      let messageIndex = 0;
      setLoadingMessage(loadingMessages[0]);

      progressInterval = window.setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          const increment = Math.random() * 10 + 5;
          return Math.min(prev + increment, 95);
        });
      }, 800);

      messageInterval = window.setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 2500);
    }

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [appState]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        setAppState('error');
        return;
      }
      setOriginalFile(file);
      setCurrentOriginalFileName(file.name);
      setOriginalImageUrl(URL.createObjectURL(file));
      setRestoredImageUrl(null);
      setError(null);
      setAppState('imageSelected');
    }
  };

  const handleRestoreClick = useCallback(async () => {
    if (!originalFile) return;

    setAppState('loading');
    setError(null);

    try {
      const { base64, mimeType } = await fileToBase64(originalFile);
      const restoredBase64 = await restoreImage(base64, mimeType);
      
      if (restoredBase64) {
        setLoadingProgress(100);
        setTimeout(() => {
          const restoredUrl = `data:image/png;base64,${restoredBase64}`;
          setRestoredImageUrl(restoredUrl);
          setAppState('restored');

          const newHistoryItem: HistoryItem = {
            id: Date.now(),
            originalImageUrl: URL.createObjectURL(originalFile),
            restoredImageUrl: restoredUrl,
            originalFileName: originalFile.name,
          };
          setRestorationHistory(prev => [...prev, newHistoryItem].slice(-5));
        }, 500);
      } else {
        throw new Error('The AI model did not return an image. Please try again.');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to restore image. ${errorMessage}`);
      setAppState('error');
    }
  }, [originalFile]);
  
  const handleDownload = (imageUrlToDownload?: string, fileNameToUse?: string) => {
    const url = imageUrlToDownload || restoredImageUrl;
    if (!url) return;

    const name = fileNameToUse || currentOriginalFileName || 'restored_image.png';
    const finalName = name.replace(/(\.[\w\d_-]+)$/i, '_restored.png');

    const link = document.createElement('a');
    link.href = url;
    link.download = finalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const resetState = () => {
      setOriginalFile(null);
      setOriginalImageUrl(null);
      setRestoredImageUrl(null);
      setError(null);
      setCurrentOriginalFileName('');
      setAppState('initial');
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if(fileInput) fileInput.value = '';
  }

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setOriginalFile(null); 
    setOriginalImageUrl(item.originalImageUrl);
    setRestoredImageUrl(item.restoredImageUrl);
    setCurrentOriginalFileName(item.originalFileName);
    setAppState('restored');
    setError(null);
    setIsHistoryOpen(false);
  };

  const handleHistoryDownload = (item: HistoryItem) => {
    handleDownload(item.restoredImageUrl, item.originalFileName);
  };

  const renderContent = () => {
    if (appState === 'initial') {
      return <ImageUploader onFileChange={handleFileChange} />;
    }

    if (appState === 'restored' && originalImageUrl && restoredImageUrl) {
      return (
        <div className="w-full max-w-7xl mx-auto">
          <ImageComparator originalImageUrl={originalImageUrl} restoredImageUrl={restoredImageUrl} />
        </div>
      );
    }

    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ImageCard title="Original Image" imageUrl={originalImageUrl} />
          <ImageCard 
            title="Restored Image" 
            imageUrl={restoredImageUrl} 
            isLoading={appState === 'loading'}
            hasContent={!!restoredImageUrl}
            loadingProgress={loadingProgress}
            loadingMessage={loadingMessage}
          />
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8 flex flex-col">
      <header className="text-center mb-8 relative">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
          GlowBack <span className="font-normal">by AbhiCreates</span>
        </h1>
        <p className="mt-2 text-lg text-gray-400 max-w-2xl mx-auto">
          Breathe new life into your old photos. Upload a damaged image to see the magic.
        </p>
        <button 
          onClick={() => setIsHistoryOpen(true)}
          className="absolute top-0 right-0 p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="View restoration history"
        >
          <HistoryIcon />
        </button>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center w-full">
        {renderContent()}
        {error && <ErrorMessage message={error} />}
      </main>

      <footer className="w-full p-4 mt-8 flex items-center justify-center space-x-4">
        {appState !== 'initial' && (
             <button
              onClick={resetState}
              className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-300"
            >
              Start Over
            </button>
        )}
        {appState === 'imageSelected' && (
            <ActionButton onClick={handleRestoreClick} disabled={false} icon={<SparklesIcon />} text="Restore Image" />
        )}
        {appState === 'loading' && (
            <ActionButton onClick={() => {}} disabled={true} icon={<Loader />} text="Restoring..." />
        )}
        {appState === 'restored' && (
            <ActionButton onClick={() => handleDownload()} disabled={false} icon={<DownloadIcon />} text="Download Restored Image" />
        )}
      </footer>

      <HistorySidebar
        history={restorationHistory}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelect={handleSelectHistoryItem}
        onDownload={handleHistoryDownload}
      />
    </div>
  );
}

const ImageUploader = ({ onFileChange }: { onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="w-full max-w-2xl mx-auto">
    <label
      htmlFor="file-upload"
      className="relative block w-full h-64 sm:h-80 rounded-2xl border-2 border-dashed border-gray-600 hover:border-indigo-500 transition-colors duration-300 cursor-pointer bg-gray-800/50"
    >
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <UploadIcon />
        <p className="mt-4 text-xl font-semibold text-gray-300">
          Click to upload or drag and drop
        </p>
        <p className="mt-1 text-sm text-gray-500">
          PNG, JPG, GIF up to 10MB
        </p>
      </div>
      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={onFileChange} />
    </label>
  </div>
);

const ImageCard = ({ title, imageUrl, isLoading = false, hasContent = true, loadingProgress = 0, loadingMessage = '' }: { title: string, imageUrl: string | null, isLoading?: boolean, hasContent?: boolean, loadingProgress?: number, loadingMessage?: string }) => (
  <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden p-4 flex flex-col">
    <h2 className="text-xl font-semibold text-center mb-4 text-gray-300">{title}</h2>
    <div className="aspect-square w-full bg-gray-900 rounded-lg flex items-center justify-center flex-grow">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center w-full px-8">
            <p className="mb-4 text-gray-400 text-lg text-center">{loadingMessage}</p>
            <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 h-4 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                ></div>
            </div>
            <p className="mt-2 text-gray-300 font-semibold">{Math.round(loadingProgress)}%</p>
        </div>
      ) : imageUrl ? (
        <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
      ) : (
        <div className="text-gray-500 flex flex-col items-center">
            <PhotoIcon />
            <p className="mt-2">{hasContent ? "Image will appear here" : "Restored image will appear here"}</p>
        </div>
      )}
    </div>
  </div>
);

const ActionButton = ({ onClick, disabled, icon, text }: { onClick: () => void, disabled: boolean, icon: React.ReactNode, text: string }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
  >
    {icon}
    <span className="ml-3 text-lg">{text}</span>
  </button>
);

const ErrorMessage = ({ message }: { message: string }) => (
    <div className="mt-4 p-4 max-w-2xl mx-auto bg-red-900/50 border border-red-700 text-red-300 rounded-lg flex items-center">
        <XCircleIcon />
        <p className="ml-3">{message}</p>
    </div>
);
