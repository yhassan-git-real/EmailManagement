import React from 'react';
import { EnvelopeIcon, CodeBracketIcon, HeartIcon } from '@heroicons/react/24/outline';

const Footer = () => {
  return (
    <footer className="bg-dark-700/80 backdrop-blur-xl border-t border-dark-300/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-2 flex flex-wrap items-center justify-between gap-2">
          {/* Left - Copyright */}
          <div className="flex items-center text-xs text-text-muted">
            <span>© {new Date().getFullYear()} EmailManagement</span>
          </div>

          {/* Center - Links */}
          <div className="flex items-center gap-4 text-xs">
            <a href="#" className="text-text-muted hover:text-primary-400 transition-colors flex items-center gap-1">
              <CodeBracketIcon className="h-3 w-3" />
              <span>v1.0.0</span>
            </a>
            <span className="text-dark-300">|</span>
            <a href="#" className="text-text-muted hover:text-primary-400 transition-colors">
              Documentation
            </a>
            <span className="text-dark-300">|</span>
            <a href="#" className="text-text-muted hover:text-primary-400 transition-colors">
              Support
            </a>
          </div>

          {/* Right - Made with */}
          <div className="flex items-center text-xs text-text-muted">
            <span className="flex items-center gap-1">
              Made with <HeartIcon className="h-3 w-3 text-danger" /> using React
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
