"""
Smart Attachment Handler for intelligent file attachment decisions.

This module provides logic to decide whether to:
- Attach files directly (when file count <= threshold)
- Compress to ZIP (when file count > threshold)

Based on configurable file count thresholds and file type filters.
"""

import os
import logging
from typing import List, Dict, Tuple, Optional
from pathlib import Path

from ....core.config import get_settings

logger = logging.getLogger(__name__)

# Supported file extension mappings for UI display
EXTENSION_MAPPINGS = {
    'excel': ['.xlsx', '.xls'],
    'csv': ['.csv'],
    'txt': ['.txt'],
    'pdf': ['.pdf'],
    'all': []  # Empty means all files
}


class SmartAttachmentHandler:
    """
    Handles smart attachment logic for deciding between direct file attachment
    and ZIP compression based on configurable thresholds.
    """
    
    def __init__(self, file_count_threshold: Optional[int] = None, 
                 allowed_extensions: Optional[List[str]] = None):
        """
        Initialize the smart attachment handler.
        
        Args:
            file_count_threshold: Number of files threshold. Files <= this attach directly.
            allowed_extensions: List of allowed extensions or ['all'] for all files.
        """
        settings = get_settings()
        
        # Use provided values or fall back to settings
        self.file_count_threshold = file_count_threshold or settings.ATTACHMENT_FILE_COUNT_THRESHOLD
        
        if allowed_extensions is not None:
            self.allowed_extensions = allowed_extensions
        else:
            # Parse from settings
            ext_setting = settings.ATTACHMENT_ALLOWED_EXTENSIONS
            if ext_setting.lower() == 'all':
                self.allowed_extensions = ['all']
            else:
                self.allowed_extensions = [ext.strip().lower() for ext in ext_setting.split(',')]
        
        logger.info(f"SmartAttachmentHandler initialized: threshold={self.file_count_threshold}, "
                   f"extensions={self.allowed_extensions}")
    
    def _get_extension_list(self) -> List[str]:
        """
        Convert allowed extensions to actual file extensions.
        
        Returns:
            List of file extensions (with dots) or empty list for all files.
        """
        if 'all' in self.allowed_extensions:
            return []  # Empty means all files
        
        extensions = []
        for ext in self.allowed_extensions:
            ext_lower = ext.lower().strip('.')
            
            # Check if it's a category name
            if ext_lower in EXTENSION_MAPPINGS:
                extensions.extend(EXTENSION_MAPPINGS[ext_lower])
            else:
                # It's a direct extension
                if not ext_lower.startswith('.'):
                    ext_lower = f'.{ext_lower}'
                extensions.append(ext_lower)
        
        return list(set(extensions))  # Remove duplicates
    
    def get_matching_files(self, folder_path: str) -> List[str]:
        """
        Get list of files in folder matching the allowed extensions.
        
        Args:
            folder_path: Path to the folder to analyze.
            
        Returns:
            List of absolute file paths matching the criteria.
        """
        matching_files = []
        normalized_path = os.path.normpath(folder_path)
        
        if not os.path.exists(normalized_path):
            logger.warning(f"Folder does not exist: {normalized_path}")
            return matching_files
        
        if not os.path.isdir(normalized_path):
            # It's a single file
            if self._file_matches_extensions(normalized_path):
                matching_files.append(normalized_path)
            return matching_files
        
        extension_list = self._get_extension_list()
        
        for root, _, files in os.walk(normalized_path):
            for filename in files:
                file_path = os.path.join(root, filename)
                
                # If no extension filter (all files) or file matches extensions
                if not extension_list or self._file_matches_extensions(file_path, extension_list):
                    matching_files.append(file_path)
        
        return matching_files
    
    def _file_matches_extensions(self, file_path: str, 
                                  extension_list: Optional[List[str]] = None) -> bool:
        """
        Check if a file matches the allowed extensions.
        
        Args:
            file_path: Path to the file to check.
            extension_list: List of extensions to check against.
            
        Returns:
            True if file matches, False otherwise.
        """
        if extension_list is None:
            extension_list = self._get_extension_list()
        
        # If no extensions specified, all files match
        if not extension_list:
            return True
        
        file_ext = os.path.splitext(file_path)[1].lower()
        return file_ext in extension_list
    
    def analyze_folder(self, folder_path: str) -> Dict:
        """
        Analyze a folder and determine the attachment strategy.
        
        Args:
            folder_path: Path to the folder to analyze.
            
        Returns:
            Dictionary with analysis results:
            {
                'should_compress': bool,
                'matching_files': List[str],
                'file_count': int,
                'total_size': int,
                'threshold': int,
                'extensions_filter': List[str]
            }
        """
        matching_files = self.get_matching_files(folder_path)
        file_count = len(matching_files)
        
        # Calculate total size
        total_size = 0
        for file_path in matching_files:
            try:
                total_size += os.path.getsize(file_path)
            except OSError:
                pass
        
        should_compress = file_count > self.file_count_threshold
        
        result = {
            'should_compress': should_compress,
            'matching_files': matching_files,
            'file_count': file_count,
            'total_size': total_size,
            'threshold': self.file_count_threshold,
            'extensions_filter': self.allowed_extensions
        }
        
        logger.info(f"Folder analysis: {file_count} files, should_compress={should_compress}, "
                   f"threshold={self.file_count_threshold}")
        
        return result
    
    def should_compress(self, folder_path: str) -> Tuple[bool, int, List[str]]:
        """
        Determine if a folder should be compressed or files attached directly.
        
        Args:
            folder_path: Path to the folder.
            
        Returns:
            Tuple of (should_compress, file_count, matching_files)
        """
        analysis = self.analyze_folder(folder_path)
        return (
            analysis['should_compress'],
            analysis['file_count'],
            analysis['matching_files']
        )


def get_smart_attachment_handler() -> SmartAttachmentHandler:
    """
    Factory function to get a SmartAttachmentHandler with current settings.
    
    Returns:
        SmartAttachmentHandler instance configured from settings.
    """
    return SmartAttachmentHandler()


def analyze_folder_for_attachment(folder_path: str) -> Dict:
    """
    Convenience function to analyze a folder for attachment decisions.
    
    Args:
        folder_path: Path to the folder to analyze.
        
    Returns:
        Analysis results dictionary.
    """
    handler = get_smart_attachment_handler()
    return handler.analyze_folder(folder_path)
