import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
        <span className="text-2xl font-bold">The Tutor</span>
      </div>
      <div className="flex gap-4">
        <button className="bg-white text-blue-600 px-4 py-1 rounded-full">تسجيل خروج</button>
      </div>
    </nav>
  );
};

export default Navbar;
