"""
Log Parser for Email Processing Metrics
Parses Email_Logs to extract processing time statistics.
"""
import os
import re
import json
import logging
from datetime import datetime
from pathlib import Path

from ..core.config import get_settings

logger = logging.getLogger(__name__)


def parse_elapsed_time(elapsed_str: str) -> float:
    """
    Parse elapsed time string to seconds.
    Handles formats like:
    - "13.46s"
    - "1m 19.55s"
    - "2m 30s"
    """
    try:
        # Check for minutes and seconds format
        minutes_match = re.search(r'(\d+)m', elapsed_str)
        seconds_match = re.search(r'([\d.]+)s', elapsed_str)
        
        total_seconds = 0.0
        
        if minutes_match:
            total_seconds += int(minutes_match.group(1)) * 60
        
        if seconds_match:
            total_seconds += float(seconds_match.group(1))
        
        return total_seconds
    except Exception as e:
        logger.warning(f"Failed to parse elapsed time '{elapsed_str}': {e}")
        return 0.0


def extract_processing_times_from_log(log_content: str) -> list:
    """
    Extract individual email processing times from log content.
    Looks for patterns like 'SENT SUCCESSFULLY (Elapsed: 13.46s)'
    """
    times = []
    
    # Pattern to match successful email sends with elapsed time
    pattern = r'Email ID (\d+).*?SENT SUCCESSFULLY \(Elapsed: ([^)]+)\)'
    
    for match in re.finditer(pattern, log_content):
        email_id = match.group(1)
        elapsed_str = match.group(2)
        elapsed_seconds = parse_elapsed_time(elapsed_str)
        
        if elapsed_seconds > 0:
            times.append({
                'email_id': int(email_id),
                'elapsed_seconds': elapsed_seconds
            })
    
    return times


def get_log_files_for_date_range(start_date: datetime = None, end_date: datetime = None) -> list:
    """
    Get log files that fall within the specified date range.
    Log files are named like: success_20260111.log
    Uses LOG_DIR_PATH from .env configuration.
    """
    settings = get_settings()
    logs_dir = Path(settings.LOG_DIR_PATH)
    
    if not logs_dir.exists():
        logger.warning(f"Email_Logs directory not found: {logs_dir}")
        return []
    
    log_files = []
    
    for log_file in logs_dir.glob("success_*.log"):
        try:
            # Extract date from filename (success_YYYYMMDD.log)
            date_str = log_file.stem.split('_')[1]
            file_date = datetime.strptime(date_str, "%Y%m%d")
            
            # Check if within date range
            if start_date and file_date.date() < start_date.date():
                continue
            if end_date and file_date.date() > end_date.date():
                continue
            
            log_files.append(log_file)
        except (IndexError, ValueError) as e:
            logger.warning(f"Could not parse date from log file {log_file}: {e}")
            continue
    
    return sorted(log_files)


def calculate_avg_processing_time(start_date: datetime = None, end_date: datetime = None) -> dict:
    """
    Calculate average processing time from log files within date range.
    
    Returns:
        dict with:
        - avg_seconds: average processing time in seconds
        - total_emails: number of emails processed
        - min_seconds: minimum processing time
        - max_seconds: maximum processing time
    """
    log_files = get_log_files_for_date_range(start_date, end_date)
    
    if not log_files:
        logger.info(f"No log files found for date range {start_date} to {end_date}")
        return {
            'avg_seconds': 0,
            'total_emails': 0,
            'min_seconds': 0,
            'max_seconds': 0
        }
    
    all_times = []
    
    for log_file in log_files:
        try:
            with open(log_file, 'r', encoding='utf-8') as f:
                content = f.read()
                times = extract_processing_times_from_log(content)
                all_times.extend(times)
        except Exception as e:
            logger.warning(f"Error reading log file {log_file}: {e}")
            continue
    
    if not all_times:
        return {
            'avg_seconds': 0,
            'total_emails': 0,
            'min_seconds': 0,
            'max_seconds': 0
        }
    
    elapsed_values = [t['elapsed_seconds'] for t in all_times]
    
    return {
        'avg_seconds': sum(elapsed_values) / len(elapsed_values),
        'total_emails': len(elapsed_values),
        'min_seconds': min(elapsed_values),
        'max_seconds': max(elapsed_values)
    }


def get_log_metrics_from_logs(start_date: datetime = None, end_date: datetime = None) -> dict:
    """
    Get comprehensive email metrics from log files within date range.
    Parses both success and error logs to count processed emails.
    Uses unique email IDs to avoid double-counting duplicate log entries.
    
    Returns:
        dict with:
        - total_processed: total emails processed (success + failed)
        - success_count: number of successful emails
        - failed_count: number of failed emails
        - delivery_rate: success percentage
        - avg_processing_time: average time in seconds
    """
    settings = get_settings()
    logs_dir = Path(settings.LOG_DIR_PATH)
    
    if not logs_dir.exists():
        logger.warning(f"Email_Logs directory not found: {logs_dir}")
        return {
            'total_processed': 0,
            'success_count': 0,
            'failed_count': 0,
            'delivery_rate': 0,
            'avg_processing_time': 0
        }
    
    # Use sets to track unique email IDs and avoid double-counting
    success_email_ids = set()
    failed_email_ids = set()
    processing_times = []
    
    # Get all log files in date range
    for log_type in ["success", "error"]:
        for log_file in logs_dir.glob(f"{log_type}_*.log"):
            try:
                # Extract date from filename
                date_str = log_file.stem.split('_')[1]
                file_date = datetime.strptime(date_str, "%Y%m%d")
                
                # Check if within date range
                if start_date and file_date.date() < start_date.date():
                    continue
                if end_date and file_date.date() > end_date.date():
                    continue
                
                with open(log_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    if log_type == "success":
                        # Count successful sends - look for "SENT SUCCESSFULLY"
                        success_pattern = r'Email ID (\d+).*?SENT SUCCESSFULLY \(Elapsed: ([^)]+)\)'
                        for match in re.finditer(success_pattern, content):
                            email_id = match.group(1)
                            success_email_ids.add(email_id)
                            
                            elapsed_str = match.group(2)
                            elapsed_seconds = parse_elapsed_time(elapsed_str)
                            if elapsed_seconds > 0:
                                processing_times.append(elapsed_seconds)
                    else:
                        # Count failed sends - look for "FAILED:"
                        failed_pattern = r'Email ID (\d+).*?FAILED:'
                        for match in re.finditer(failed_pattern, content):
                            email_id = match.group(1)
                            failed_email_ids.add(email_id)
                        
            except (IndexError, ValueError) as e:
                logger.warning(f"Could not parse log file {log_file}: {e}")
                continue
            except Exception as e:
                logger.warning(f"Error reading log file {log_file}: {e}")
                continue
    
    # Remove any email IDs that appear in both (success takes precedence - email was eventually sent)
    failed_email_ids = failed_email_ids - success_email_ids
    
    success_count = len(success_email_ids)
    failed_count = len(failed_email_ids)
    total_processed = success_count + failed_count
    
    delivery_rate = (success_count / total_processed * 100) if total_processed > 0 else 0
    avg_time = sum(processing_times) / len(processing_times) if processing_times else 0
    
    logger.debug(f"Log metrics: {success_count} success, {failed_count} failed, {total_processed} total")
    
    return {
        'total_processed': total_processed,
        'success_count': success_count,
        'failed_count': failed_count,
        'delivery_rate': round(delivery_rate, 1),
        'avg_processing_time': avg_time
    }


def get_daily_trends_from_logs(start_date: datetime = None, end_date: datetime = None) -> dict:
    """
    Get daily email trends from log files within date range.
    Returns per-day counts of success and failed emails.
    
    Returns:
        dict with:
        - dates: list of date strings (YYYY-MM-DD)
        - success: list of daily success counts
        - failed: list of daily failed counts  
        - pending: list of zeros (pending comes from database, not logs)
    """
    settings = get_settings()
    logs_dir = Path(settings.LOG_DIR_PATH)
    
    if not logs_dir.exists():
        logger.warning(f"Email_Logs directory not found: {logs_dir}")
        return {
            'dates': [],
            'success': [],
            'failed': [],
            'pending': []
        }
    
    # Collect daily data
    daily_data = {}  # {date_str: {'success': set(), 'failed': set()}}
    
    # Process all log files in date range
    for log_type in ["success", "error"]:
        for log_file in logs_dir.glob(f"{log_type}_*.log"):
            try:
                # Extract date from filename
                date_str = log_file.stem.split('_')[1]
                file_date = datetime.strptime(date_str, "%Y%m%d")
                formatted_date = file_date.strftime("%Y-%m-%d")
                
                # Check if within date range
                if start_date and file_date.date() < start_date.date():
                    continue
                if end_date and file_date.date() > end_date.date():
                    continue
                
                # Initialize day if needed
                if formatted_date not in daily_data:
                    daily_data[formatted_date] = {'success': set(), 'failed': set()}
                
                with open(log_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    if log_type == "success":
                        success_pattern = r'Email ID (\d+).*?SENT SUCCESSFULLY'
                        for match in re.finditer(success_pattern, content):
                            email_id = match.group(1)
                            daily_data[formatted_date]['success'].add(email_id)
                    else:
                        failed_pattern = r'Email ID (\d+).*?FAILED:'
                        for match in re.finditer(failed_pattern, content):
                            email_id = match.group(1)
                            daily_data[formatted_date]['failed'].add(email_id)
                            
            except (IndexError, ValueError) as e:
                logger.warning(f"Could not parse log file {log_file}: {e}")
                continue
            except Exception as e:
                logger.warning(f"Error reading log file {log_file}: {e}")
                continue
    
    # Process: success takes precedence over failed (same as main metric)
    for date_str in daily_data:
        daily_data[date_str]['failed'] = daily_data[date_str]['failed'] - daily_data[date_str]['success']
    
    # Sort by date and build arrays
    sorted_dates = sorted(daily_data.keys())
    
    return {
        'dates': sorted_dates,
        'success': [len(daily_data[d]['success']) for d in sorted_dates],
        'failed': [len(daily_data[d]['failed']) for d in sorted_dates],
        'pending': [0 for _ in sorted_dates]  # Pending comes from database, not logs
    }
