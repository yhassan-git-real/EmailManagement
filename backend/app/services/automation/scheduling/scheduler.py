"""Main scheduler component for automation scheduling"""

import logging
import time
import threading
from datetime import datetime, timedelta
from typing import Dict, Any

from ..core.state_manager import get_automation_state
from .schedule_calculator import _calculate_next_run

logger = logging.getLogger(__name__)


def _schedule_next_run():
    """Schedule the next run time based on current settings"""
    automation_state = get_automation_state()
    
    if not automation_state["schedule"]["enabled"]:
        return
    
    try:
        frequency = automation_state["schedule"]["frequency"]
        current_time = datetime.now()
        next_run = None
        
        if frequency == "minute":
            next_run = current_time + timedelta(minutes=int(automation_state["schedule"]["interval"]))
        elif frequency == "hour":
            next_run = current_time + timedelta(hours=int(automation_state["schedule"]["interval"]))
        elif frequency == "daily":
            next_run = current_time.replace(hour=int(automation_state["schedule"]["time"].split(":")[0]), 
                                             minute=int(automation_state["schedule"]["time"].split(":")[1]), 
                                             second=0, microsecond=0)
            # If the time has already passed today, schedule for tomorrow
            if next_run < current_time:
                next_run += timedelta(days=1)
        elif frequency == "weekly":
            # Schedule for the next specified day of the week
            today = current_time.weekday()  # Monday is 0, Sunday is 6
            days_ahead = (automation_state["schedule"]["days"][(current_time.weekday() + 1) % 7] - today) % 7
            if days_ahead == 0:
                # If the day is today, schedule for the next hour
                next_run = current_time.replace(hour=int(automation_state["schedule"]["time"].split(":")[0]), 
                                                 minute=int(automation_state["schedule"]["time"].split(":")[1]), 
                                                 second=0, microsecond=0)
                # If the time has already passed, schedule for next week
                if next_run < current_time:
                    next_run += timedelta(weeks=1)
            else:
                next_run = current_time + timedelta(days=days_ahead)
        elif frequency == "monthly":
            # Schedule for the next month on the same day
            next_run = current_time.replace(day=1) + timedelta(days=32)  # Go to next month
            next_run = next_run.replace(day=int(automation_state["schedule"]["time"]))
            # If the day is in the past, schedule for next month
            if next_run < current_time:
                next_run = next_run + timedelta(days=32)
        
        automation_state["schedule"]["nextRun"] = next_run
        logger.info(f"Next run scheduled at {next_run}")
        
    except Exception as e:
        logger.error(f"Error scheduling next run: {str(e)}")


def _scheduler_thread():
    """Thread function for the scheduler"""
    automation_state = get_automation_state()
    
    while automation_state["scheduler_running"]:
        try:
            # Check if it's time to run the automation
            current_time = datetime.now()
            
            if automation_state["schedule"]["nextRun"] and current_time >= automation_state["schedule"]["nextRun"]:
                logger.info("Scheduled time reached, starting automation")
                
                # Import here to avoid circular imports
                from ..core.automation_manager import start_automation
                start_automation()
                
                # Schedule the next run
                _schedule_next_run()
            else:
                # Sleep for a while before checking again
                time.sleep(10)
        
        except Exception as e:
            logger.error(f"Error in scheduler thread: {str(e)}")
            time.sleep(60)  # Wait before retrying


def start_scheduler() -> Dict[str, Any]:
    """
    Start the scheduler for automated email processing
    
    Returns:
        Current automation state
    """
    automation_state = get_automation_state()
    
    if automation_state["scheduler_running"]:
        logger.info("Scheduler is already running")
        from ..core.automation_manager import get_automation_status
        return get_automation_status()
    
    # Set the scheduler to running
    automation_state["scheduler_running"] = True
    
    # Start the scheduler thread
    automation_state["scheduler_thread"] = threading.Thread(
        target=_scheduler_thread,
        daemon=True
    )
    automation_state["scheduler_thread"].start()
    
    logger.info("Started email automation scheduler")
    from ..core.automation_manager import get_automation_status
    return get_automation_status()


def stop_scheduler() -> Dict[str, Any]:
    """
    Stop the scheduler for automated email processing
    
    Returns:
        Current automation state
    """
    automation_state = get_automation_state()
    
    if not automation_state["scheduler_running"]:
        logger.info("Scheduler is not running")
        from ..core.automation_manager import get_automation_status
        return get_automation_status()
    
    # Set the scheduler to not running
    automation_state["scheduler_running"] = False
    
    logger.info("Stopped email automation scheduler")
    from ..core.automation_manager import get_automation_status
    return get_automation_status()


def update_schedule_settings(schedule_settings: Dict[str, Any]) -> Dict[str, Any]:
    """
    Update the automation schedule settings
    
    Args:
        schedule_settings: New schedule settings
        
    Returns:
        Updated schedule settings
    """
    automation_state = get_automation_state()
    
    # Update only valid keys
    for key, value in schedule_settings.items():
        if key in automation_state["schedule"]:
            automation_state["schedule"][key] = value
            
    # Calculate next run time if schedule is enabled
    if automation_state["schedule"]["enabled"]:
        _calculate_next_run()
        
        # Start the scheduler if it's not already running
        if not automation_state.get("scheduler_running", False):
            _start_scheduler()
    else:
        # Stop the scheduler if it's running
        _stop_scheduler()
    
    return get_schedule_settings()


def get_schedule_settings() -> Dict[str, Any]:
    """
    Get the current schedule settings
    
    Returns:
        Dictionary with current schedule settings
    """
    automation_state = get_automation_state()
    return automation_state["schedule"]


def _start_scheduler() -> None:
    """Start the scheduler thread"""
    automation_state = get_automation_state()
    
    if automation_state.get("scheduler_running", False):
        return
        
    logger.info("Starting email automation scheduler")
    
    automation_state["scheduler_running"] = True
    automation_state["scheduler_thread"] = threading.Thread(
        target=_run_scheduler,
        daemon=True
    )
    automation_state["scheduler_thread"].start()


def _stop_scheduler() -> None:
    """Stop the scheduler thread"""
    automation_state = get_automation_state()
    
    logger.info("Stopping email automation scheduler")
    automation_state["scheduler_running"] = False


def _run_scheduler() -> None:
    """Run the scheduler loop"""
    automation_state = get_automation_state()
    
    while automation_state.get("scheduler_running", False):
        try:
            # Check if scheduler is enabled
            if not automation_state["schedule"]["enabled"]:
                break
                
            now = datetime.now()
            next_run = automation_state["schedule"].get("nextRun")
            
            if next_run and now >= next_run:
                # It's time to run the automation
                logger.info("Scheduled automation starting")
                
                # Update last run time
                automation_state["schedule"]["lastRun"] = now
                
                # Start the automation
                if not automation_state["is_running"]:
                    from ..core.automation_manager import start_automation
                    start_automation()
                
                # Calculate the next run time
                _calculate_next_run()
                
                # Log the next scheduled run
                logger.info(f"Next scheduled run: {automation_state['schedule']['nextRun']}")
        except Exception as e:
            logger.error(f"Error in scheduler loop: {str(e)}")
            
        # Sleep for a minute before checking again
        time.sleep(60)
    
    logger.info("Scheduler thread stopped")
