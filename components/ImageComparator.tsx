import React, { useState, useRef, useCallback, useEffect } from 'react';

const ImageComparator = ({ originalImageUrl, restoredImageUrl }: { originalImageUrl: string; restoredImageUrl: string }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current || !isDragging) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  }

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX);
  }, [handleMove]);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
      handleMove(e.touches[0].clientX);
  }, [handleMove]);

  useEffect(() => {
    if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden p-4 flex flex-col items-center">
      <h2 className="text-xl font-semibold text-center mb-4 text-gray-300">Compare Before & After</h2>
      <div 
        ref={containerRef} 
        className="relative w-full max-w-4xl aspect-square select-none cursor-ew-resize"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <img
          src={originalImageUrl}
          alt="Before"
          draggable="false"
          className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none rounded-lg"
        />
        <div
          className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none rounded-lg"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={restoredImageUrl}
            alt="After"
            draggable="false"
            className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
          />
        </div>
        <div
          className="absolute top-0 h-full w-1 bg-white/50 pointer-events-none"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white rounded-full h-10 w-10 flex items-center justify-center shadow-lg cursor-ew-resize">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </div>
        </div>
      </div>
       <div className="flex justify-between w-full max-w-4xl mt-2 px-1 text-sm text-gray-400 font-semibold">
          <span>Before</span>
          <span>After</span>
        </div>
    </div>
  );
};

export default ImageComparator;