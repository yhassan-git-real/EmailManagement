"""
Schedule calculator for calculating next run time based on schedule settings
"""

from datetime import datetime, timedelta
import logging

from ..core.state_manager import get_automation_state

logger = logging.getLogger(__name__)


def _calculate_next_run() -> None:
    automation_state = get_automation_state()
    now = datetime.now()
    frequency = automation_state["schedule"]["frequency"]
    time_str = automation_state["schedule"]["time"]
    
    try:
        # Parse the time string (HH:MM)
        hour, minute = map(int, time_str.split(":"))
        
        if frequency == "daily":
            # Set next run to today at the specified time
            next_run = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
            
            # If that time has already passed today, set to tomorrow
            if next_run <= now:
                next_run += timedelta(days=1)
                
        elif frequency == "weekly":
            # Get the target days of the week (0-6, where 0 is Monday in our case)
            days = automation_state["schedule"]["days"]
            
            if not days:
                # Default to Monday if no days specified
                days = [0]
                
            # Find the next occurrence from the list of days
            current_weekday = now.weekday()
            days_ahead = 7
            
            for day in days:
                # Calculate days until the next occurrence of this weekday
                days_until = (day - current_weekday) % 7
                
                # If it's today but the time has passed, add a week
                if days_until == 0 and now >= now.replace(hour=hour, minute=minute, second=0, microsecond=0):
                    days_until = 7
                    
                days_ahead = min(days_ahead, days_until)
            
            next_run = now + timedelta(days=days_ahead)
            next_run = next_run.replace(hour=hour, minute=minute, second=0, microsecond=0)
            
        elif frequency == "monthly":
            # Get the target days of the month (1-31)
            days = automation_state["schedule"]["days"]
            
            if not days:
                # Default to the 1st of the month if no days specified
                days = [1]
                
            # Find the next occurrence from the list of days
            current_day = now.day
            
            # Sort days in ascending order
            days.sort()
            
            # Find the next day in the current month
            next_day = None
            for day in days:
                if day > current_day:
                    next_day = day
                    break
            
            if next_day is None:
                # If no days remain in this month, go to next month
                if now.month == 12:
                    next_month = 1
                    next_year = now.year + 1
                else:
                    next_month = now.month + 1
                    next_year = now.year
                    
                next_day = days[0]  # Use the first day in the list for next month
                next_run = datetime(next_year, next_month, next_day, hour, minute)
            else:
                # Use the found day in the current month
                next_run = now.replace(day=next_day, hour=hour, minute=minute, second=0, microsecond=0)
        else:
            # Default to daily if unknown frequency
            next_run = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
            if next_run <= now:
                next_run += timedelta(days=1)
        
        automation_state["schedule"]["nextRun"] = next_run
        
    except Exception as e:
        logger.error(f"Error calculating next run time: {str(e)}")
        # Set a default next run time (1 hour from now)
        automation_state["schedule"]["nextRun"] = now + timedelta(hours=1)

