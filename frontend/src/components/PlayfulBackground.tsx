import React from 'react';

export const PlayfulBackground = () => {
  if (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-15 select-none">
      <div className="absolute top-[10%] left-[5%] text-6xl animate-bounce duration-[3000ms]">✏️</div>
      <div className="absolute top-[25%] right-[8%] text-7xl animate-pulse duration-[4000ms]">📖</div>
      <div className="absolute top-[60%] left-[8%] text-6xl animate-bounce duration-[5000ms]">📐</div>
      <div className="absolute top-[75%] right-[10%] text-7xl animate-pulse duration-[3500ms]">🎒</div>
      <div className="absolute top-[45%] left-[85%] text-6xl animate-bounce duration-[4500ms]">🎨</div>
      <div className="absolute bottom-[10%] left-[45%] text-6xl animate-pulse duration-[2500ms]">⭐</div>
    </div>
  );
};

export default PlayfulBackground;
