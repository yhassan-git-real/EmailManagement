// Layout Components
import {
  Header,
  Footer,
  Sidebar,
  Breadcrumb
} from './layout';

// UI Components
import {
  Alert,
  Toast,
  BackgroundIllustration,
  StatusBadge,
  Welcome,
  BrandingHeader
} from './ui';

// Authentication Components
import { ProtectedRoute } from './auth';

// Chart Components
import { EmailChart } from './charts';

// Email Components
import {
  // Cards
  EmailStatusCard,
  StatusSummary,
  
  // Editor
  CustomRichTextEditor,
  TemplateEditor,
  TemplateSelector,
  
  // Analytics
  EmailLogViewer,
  MetricsPanel,
  
  // Settings
  EmailSettingsModal
} from './email';

// Database Components
import { DatabaseConnector } from './database';

// File Components
import { FilePreviewer } from './file';

// Scheduler Components
import { SchedulerSettings } from './scheduler';

// Drag and Drop Components
import { DraggableWithRef } from './dragdrop';

// Export all components
export {
  // Layout
  Header,
  Footer,
  Sidebar,
  Breadcrumb,
  
  // UI
  Alert,
  Toast,
  BackgroundIllustration,
  StatusBadge,
  Welcome,
  BrandingHeader,
  
  // Auth
  ProtectedRoute,
  
  // Charts
  EmailChart,
  
  // Email Components
  EmailStatusCard,
  StatusSummary,
  CustomRichTextEditor,
  TemplateEditor,
  TemplateSelector,
  EmailLogViewer,
  MetricsPanel,
  EmailSettingsModal,
  
  // Database
  DatabaseConnector,
  
  // File
  FilePreviewer,
  
  // Scheduler
  SchedulerSettings,
  
  // Drag and Drop
  DraggableWithRef
};
