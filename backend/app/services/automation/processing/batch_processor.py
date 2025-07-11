"""
Batch processor for updating summaries and batch operations
"""

import logging
from ..core.state_manager import get_automation_state

logger = logging.getLogger(__name__)


def _update_summary():
    """Update the summary counts from the database"""
    try:
        from ....services.email_service import get_email_status_summary
        summary = get_email_status_summary()
        
        automation_state = get_automation_state()
        
        # Always update all counts from the database for accuracy
        automation_state["summary"]["pending"] = summary["Pending"]
        automation_state["summary"]["successful"] = summary["Success"]
        automation_state["summary"]["failed"] = summary["Failed"]
            
    except Exception as e:
        # Just log at debug level since this is called frequently by polling
        # and doesn't affect core functionality
        logger.debug(f"Error updating summary counts: {str(e)}")
