import React from 'react';

const CartoonBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
      <div className="absolute top-10 left-10 w-32 h-32 bg-amber-300 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-orange-300 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-yellow-200 rounded-full blur-2xl"></div>
    </div>
  );
};

export default CartoonBackground;
