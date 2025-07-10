import React from 'react';

const Footer = () => {
  return (    <footer className="bg-white bg-opacity-70 backdrop-blur-sm border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-5 text-center">
          <p className="text-sm text-gray-600 font-medium">© {new Date().getFullYear()} EmailManagement. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
