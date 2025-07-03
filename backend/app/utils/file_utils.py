"""
File utilities for handling file operations and size conversions
"""
import os
from typing import Tuple, Union

def get_file_size(file_path: str) -> int:
    """
    Get the size of a file in bytes
    
    Args:
        file_path: Path to the file
        
    Returns:
        int: Size of the file in bytes
    """
    try:
        return os.path.getsize(file_path)
    except (FileNotFoundError, OSError):
        return 0

def format_file_size(size_bytes: Union[int, float]) -> str:
    """
    Format a file size in bytes to a human-readable string with appropriate units
    
    Args:
        size_bytes: Size in bytes
        
    Returns:
        str: Formatted size string with units (e.g., "4.2 MB")
    """
    if size_bytes < 0:
        return "0 B"
    
    # Define size units
    units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    
    # Determine appropriate unit
    i = 0
    while size_bytes >= 1024 and i < len(units) - 1:
        size_bytes /= 1024.0
        i += 1
    
    # Format the size with appropriate precision
    if i == 0:  # bytes
        return f"{int(size_bytes)} {units[i]}"
    else:
        # Use 2 decimal places for larger units
        return f"{size_bytes:.2f} {units[i]}"

def get_formatted_file_size(file_path: str) -> Tuple[int, str]:
    """
    Get both the raw size in bytes and a human-readable formatted size string
    
    Args:
        file_path: Path to the file
        
    Returns:
        Tuple[int, str]: (raw size in bytes, formatted size string)
    """
    size_bytes = get_file_size(file_path)
    formatted = format_file_size(size_bytes)
    return size_bytes, formatted
