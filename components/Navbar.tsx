import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-800 text-white px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <a href="#" className="text-white text-2xl font-semibold">
            ChefGPT
          </a>
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
