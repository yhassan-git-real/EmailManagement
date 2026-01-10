import os
import zipfile
import logging
import tempfile
import shutil
from datetime import datetime
from typing import Optional, Tuple, List
from pathlib import Path

from ....core.config import get_settings
from ....utils.email_logger import email_logger
from ....utils.file_utils import format_file_size

logger = logging.getLogger(__name__)

def format_size(size_bytes):
    """Format size in bytes to a human-readable string (KB, MB, GB)"""
    if size_bytes < 1024:
        return f"{size_bytes} bytes"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    elif size_bytes < 1024 * 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    else:
        return f"{size_bytes / (1024 * 1024 * 1024):.1f} GB"

def get_archive_path() -> str:
    """Get the path where email attachments are archived as zip files"""
    settings = get_settings()
    
    env_path = settings.EMAIL_ARCHIVE_PATH
    
    if env_path and not os.path.isabs(env_path):
        archive_path = os.path.join(os.getcwd(), env_path)
    else:
        archive_path = env_path
    
    os.makedirs(archive_path, exist_ok=True)
    
    return archive_path

class AttachmentManager:
    def __init__(self, archive_path: Optional[str] = None):
        if not archive_path:
            archive_path = get_archive_path()
        
        if not os.path.isabs(archive_path):
            self.archive_path = os.path.join(os.getcwd(), archive_path)
        else:
            self.archive_path = archive_path
            
        os.makedirs(self.archive_path, exist_ok=True)
    
    def get_folder_size(self, folder_path: str) -> int:
        """Calculate the total size of a folder in bytes"""
        total_size = 0
        
        if os.path.isfile(folder_path):
            return os.path.getsize(folder_path)
            
        for dirpath, _, filenames in os.walk(folder_path):
            for filename in filenames:
                file_path = os.path.join(dirpath, filename)
                if os.path.isfile(file_path):
                    total_size += os.path.getsize(file_path)
                    
        return total_size
    
    def compress_folder(self, folder_path: str) -> Tuple[Optional[str], Optional[int]]:
        """Compress a folder and move it to the archive directory"""
        try:
            if not os.path.exists(folder_path):
                error_msg = f"Folder path does not exist for compression: {folder_path}"
                logger.error(error_msg)
                email_logger.log_error(error_msg)
                return None, None
                
            # Normalize path to remove trailing slashes before getting basename
            normalized_path = os.path.normpath(folder_path)
            folder_name = os.path.basename(normalized_path)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            zip_filename = f"{folder_name}_{timestamp}.zip"
            archive_file_path = os.path.join(self.archive_path, zip_filename)
            
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_zip_path = os.path.join(temp_dir, zip_filename)
                
                try:
                    with zipfile.ZipFile(temp_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                        if os.path.isfile(folder_path):
                            zipf.write(folder_path, os.path.basename(folder_path))
                        else:
                            files_found = False
                            for root, _, files in os.walk(folder_path):
                                for file in files:
                                    files_found = True
                                    file_path = os.path.join(root, file)
                                    arcname = os.path.relpath(file_path, os.path.dirname(folder_path))
                                    zipf.write(file_path, arcname)
                            
                            if not files_found:
                                error_msg = f"No files found in folder for compression: {folder_path}"
                                logger.error(error_msg)
                                email_logger.log_error(error_msg)
                                return None, None
                except Exception as zip_error:
                    error_msg = f"Error creating zip file for {folder_path}: {str(zip_error)}"
                    logger.error(error_msg)
                    email_logger.log_error(error_msg)
                    return None, None
                
                try:
                    shutil.move(temp_zip_path, archive_file_path)
                except Exception as move_error:
                    error_msg = f"Error moving zip file to archive path: {str(move_error)}"
                    logger.error(error_msg)
                    email_logger.log_error(error_msg)
                    return None, None
                
                try:
                    compressed_size = os.path.getsize(archive_file_path)
                    
                    if compressed_size == 0:
                        error_msg = f"Compressed file is empty: {archive_file_path}"
                        logger.error(error_msg)
                        email_logger.log_error(error_msg)
                        
                        os.remove(archive_file_path)
                        return None, None
                        
                    formatted_size = format_file_size(compressed_size)
                except Exception as size_error:
                    error_msg = f"Error getting compressed file size: {str(size_error)}"
                    logger.error(error_msg)
                    email_logger.log_error(error_msg)
                    return None, None
                
                return archive_file_path, compressed_size
        except Exception as compression_error:
            error_msg = f"Error compressing folder: {str(compression_error)}"
            logger.error(error_msg)
            email_logger.log_error(error_msg)
            return None, None
    
    def validate_attachment_path(self, path: str) -> Tuple[bool, str]:
        """Validate that an attachment path exists and is accessible"""
        if os.path.exists(path) and os.path.isdir(path):
            return True, ""
        else:
            return False, "Attachment path does not exist or is not a directory"
    
    def prepare_smart_attachments(self, folder_path: str) -> Tuple[List[str], Optional[str], Optional[int], bool]:
        """
        Prepare attachments using smart logic based on file count and type.
        
        If file count <= threshold: returns list of files to attach directly
        If file count > threshold: compresses to ZIP
        
        Args:
            folder_path: Path to the folder containing attachments.
            
        Returns:
            Tuple containing:
                - List of file paths to attach directly (empty if compressed)
                - ZIP file path if compressed (None if direct attach)
                - Total size of attachments in bytes
                - Whether compression was used
        """
        from .smart_attachment import get_smart_attachment_handler
        
        handler = get_smart_attachment_handler()
        should_compress, file_count, matching_files = handler.should_compress(folder_path)
        
        if not matching_files:
            logger.warning(f"No matching files found in {folder_path}")
            return [], None, 0, False
        
        # Calculate total size
        total_size = sum(os.path.getsize(f) for f in matching_files if os.path.isfile(f))
        
        if should_compress:
            # Compress to ZIP
            logger.info(f"File count ({file_count}) exceeds threshold ({handler.file_count_threshold}), compressing to ZIP")
            zip_path, compressed_size = self.compress_folder(folder_path)
            return [], zip_path, compressed_size, True
        else:
            # Return files for direct attachment
            logger.info(f"File count ({file_count}) within threshold ({handler.file_count_threshold}), attaching directly")
            return matching_files, None, total_size, False
    
    def compress_specific_files(self, file_paths: List[str], archive_name: str = None) -> Tuple[Optional[str], Optional[int]]:
        """
        Compress specific files into a ZIP archive.
        
        Args:
            file_paths: List of file paths to compress.
            archive_name: Optional name for the archive (without extension).
            
        Returns:
            Tuple of (archive_path, compressed_size) or (None, None) on failure.
        """
        try:
            if not file_paths:
                return None, None
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            if archive_name:
                zip_filename = f"{archive_name}_{timestamp}.zip"
            else:
                zip_filename = f"attachments_{timestamp}.zip"
            
            archive_file_path = os.path.join(self.archive_path, zip_filename)
            
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_zip_path = os.path.join(temp_dir, zip_filename)
                
                with zipfile.ZipFile(temp_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                    for file_path in file_paths:
                        if os.path.isfile(file_path):
                            zipf.write(file_path, os.path.basename(file_path))
                
                shutil.move(temp_zip_path, archive_file_path)
                compressed_size = os.path.getsize(archive_file_path)
                
                return archive_file_path, compressed_size
                
        except Exception as e:
            logger.error(f"Error compressing files: {str(e)}")
            return None, None
