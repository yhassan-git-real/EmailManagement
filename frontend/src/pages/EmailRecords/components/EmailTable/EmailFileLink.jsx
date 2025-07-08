import React from 'react';
import PropTypes from 'prop-types';

/**
 * Email-specific file link component for handling email attachments
 */
const EmailFileLink = ({ filePath, onClick }) => {
  if (!filePath || filePath === '-') return '-';
  
  const fileName = filePath.split('/').pop();
  
  return (
    <button
      className="text-primary-600 hover:text-primary-700 text-xs underline truncate max-w-[150px] inline-block"
      onClick={(e) => {
        e.stopPropagation(); // Prevent row selection
        onClick && onClick(filePath);
      }}
      title={filePath}
    >
      {fileName}
    </button>
  );
};

EmailFileLink.propTypes = {
  filePath: PropTypes.string,
  onClick: PropTypes.func,
};

export default EmailFileLink;
