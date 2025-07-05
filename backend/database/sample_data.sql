-- Sample data for EmailRecords table
-- This script inserts a variety of sample records with different statuses, dates, and companies

-- Clear existing data (if any)
DELETE FROM EmailRecords;

-- Reset identity column
DBCC CHECKIDENT ('EmailRecords', RESEED, 0);

-- Insert sample email records with various statuses
INSERT INTO EmailRecords
    (Company_Name, Email, Subject, File_Path, Email_Send_Date, Email_Status, Date, Reason)
VALUES
    -- Successful emails
    ('Acme Corporation', 'john.doe@acme.com', 'Q2 Financial Report', 'D:\Reports\Finance\Q2_2025.pdf', '2025-05-15 09:00:00', 'Success', '2025-05-15 09:02:43', NULL),
    ('TechSolutions Inc', 'sarah.johnson@techsolutions.com', 'Project Status Update', 'D:\Projects\TechSolutions\Status_June2025.docx', '2025-06-01 14:30:00', 'Success', '2025-06-01 14:30:22', NULL),
    ('Global Shipping LLC', 'mike.torres@globalshipping.com', 'Shipping Invoice #GS-78342', 'D:\Invoices\GS-78342.pdf', '2025-06-10 11:15:00', 'Success', '2025-06-10 11:15:33', NULL),
    ('Stellar Marketing', 'lisa.wong@stellarmarketing.com', 'Campaign Results - Q2', 'D:\Marketing\Campaigns\Q2_Results_2025.pptx', '2025-06-15 16:45:00', 'Success', '2025-06-15 16:45:12', NULL),
    ('InnovateTech', 'alex.chen@innovatetech.co', 'Product Launch Details', 'D:\Products\Launch\ProductX_Details.zip', '2025-06-20 10:00:00', 'Success', '2025-06-20 10:01:05', NULL),

    -- Pending emails
    ('Westfield Insurance', 'robert.smith@westfield.com', 'Policy Renewal Notice', 'D:\Insurance\Renewals\WF-29854.pdf', '2025-06-30 09:00:00', 'Pending', '2025-06-28 15:42:18', NULL),
    ('Bright Future Bank', 'customers@bfbank.com', 'Important Account Changes', 'D:\Banking\Notices\AccountChanges_June2025.pdf', '2025-07-01 08:00:00', 'Pending', '2025-06-28 16:30:45', NULL),
    ('Summit Healthcare', 'appointments@summit-health.org', 'Appointment Reminder', 'D:\Healthcare\Reminders\July2025.docx', '2025-06-30 17:00:00', 'Pending', '2025-06-28 17:15:22', NULL),
    ('City Power & Utilities', 'billing@citypower.com', 'June 2025 Statement', 'D:\Utilities\Statements\June2025.pdf', '2025-06-30 23:59:59', 'Pending', '2025-06-28 12:00:00', NULL),
    ('FreshGrocer Delivery', 'orders@freshgrocer.com', 'Your Delivery Schedule', 'D:\Delivery\Schedules\Week26_2025.pdf', '2025-06-29 06:00:00', 'Pending', '2025-06-28 18:42:15', NULL),

    -- Failed emails
    ('DataCorp Analytics', 'info@datacorp.ai', 'Monthly Analysis Report', 'D:\Reports\Analytics\DataCorp_June2025.xlsx', '2025-06-15 13:00:00', 'Failed', '2025-06-15 13:01:12', 'Recipient mailbox full'),
    ('Horizon Travel Agency', 'bookings@horizontravel.com', 'Booking Confirmation #HT-56789', 'D:\Travel\Confirmations\HT-56789.pdf', '2025-06-18 09:30:00', 'Failed', '2025-06-18 09:31:05', 'Invalid email address'),
    ('Premier Automotive', 'service@premierauto.com', 'Service Reminder', 'D:\Automotive\Reminders\June2025.pdf', '2025-06-20 12:00:00', 'Failed', '2025-06-20 12:01:33', 'Connection timeout'),
    ('Golden State Properties', 'leasing@gsproperties.com', 'Lease Renewal Information', 'D:\Properties\Leasing\RenewalInfo_2025.docx', '2025-06-25 15:30:00', 'Failed', '2025-06-25 15:30:45', 'Email rejected by recipient server'),
    ('EduTech Learning', 'courses@edutech-learning.com', 'New Course Offerings', 'D:\Education\Courses\Summer2025.pdf', '2025-06-27 10:15:00', 'Failed', '2025-06-27 10:16:22', 'SMTP server error (code: 550)'),

    -- More successful emails for variety
    ('Sunshine Organics', 'orders@sunshineorganics.com', 'Your Order Confirmation #SO-98765', 'D:\Orders\SO-98765.pdf', '2025-06-22 11:30:00', 'Success', '2025-06-22 11:30:15', NULL),
    ('Pacific Northwest Timber', 'invoices@pnwtimber.com', 'Invoice #PNW-12345 Due', 'D:\Accounting\Invoices\PNW-12345.pdf', '2025-06-23 14:00:00', 'Success', '2025-06-23 14:01:02', NULL),
    ('Modern Architects Group', 'projects@modernarch.com', 'Project Blueprint Review', 'D:\Projects\Blueprints\MAG-3421.dwg', '2025-06-24 09:45:00', 'Success', '2025-06-24 09:45:33', NULL),
    ('BioChem Research', 'reports@biochem-research.org', 'Quarterly Research Findings', 'D:\Research\Q2_2025\Findings.pdf', '2025-06-26 16:00:00', 'Success', '2025-06-26 16:00:45', NULL),
    ('Alliance Manufacturing', 'procurement@alliancemfg.com', 'Purchase Order Confirmation', 'D:\Procurement\PO-78901.pdf', '2025-06-27 13:20:00', 'Success', '2025-06-27 13:20:22', NULL),

    -- Currently processing emails (still showing as Pending)
    ('United Logistics', 'tracking@unitedlogistics.com', 'Shipment Tracking Update', 'D:\Logistics\Tracking\UL-45678.pdf', '2025-06-29 12:00:00', 'Pending', '2025-06-28 14:30:00', NULL),
    ('Quantum Security Systems', 'alerts@quantumsecurity.com', 'Security Protocol Updates', 'D:\Security\Protocols\Update_June2025.pdf', '2025-06-29 15:45:00', 'Pending', '2025-06-28 16:22:18', NULL),
    ('Global Communications Inc', 'support@globalcomm.net', 'Service Outage Notification', 'D:\Communications\Outages\Notice_June29.docx', '2025-06-29 18:30:00', 'Pending', '2025-06-28 17:45:33', NULL),
    ('HealthPlus Insurance', 'claims@healthplus.com', 'Claim Status Update #HP-34567', 'D:\Insurance\Claims\HP-34567.pdf', '2025-06-30 08:15:00', 'Pending', '2025-06-28 19:00:15', NULL),
    ('EcoSmart Energy', 'billing@ecosmart-energy.com', 'Your June 2025 Energy Statement', 'D:\Energy\Statements\ESE-June2025.pdf', '2025-06-30 10:30:00', 'Pending', '2025-06-28 20:15:42', NULL);

-- Add a few more recent emails with different statuses to show variety
INSERT INTO EmailRecords
    (Company_Name, Email, Subject, File_Path, Email_Send_Date, Email_Status, Date, Reason)
VALUES
    ('Riverdale Properties', 'tenants@riverdaleprops.com', 'Building Maintenance Notice', 'D:\Properties\Maintenance\Notice_July2025.pdf', '2025-06-29 08:00:00', 'Success', '2025-06-29 08:00:33', NULL),
    ('Digital Solutions Ltd', 'projects@digisolutions.io', 'Project Timeline Update', 'D:\Projects\Timelines\DS-Project-112.xlsx', '2025-06-29 09:15:00', 'Failed', '2025-06-29 09:15:45', 'Network error during transmission'),
    ('National Express Delivery', 'shipments@natlexpress.com', 'Delivery Confirmation #NE-565432', 'D:\Delivery\Confirmations\NE-565432.pdf', '2025-06-29 10:30:00', 'Success', '2025-06-29 10:30:22', NULL),
    ('Coastal Wines & Spirits', 'orders@coastalws.com', 'Order Processing Update', 'D:\Orders\Processing\CWS-78901.pdf', '2025-06-29 11:45:00', 'Pending', '2025-06-28 22:15:00', NULL),
    ('Advanced Medical Group', 'records@advancedmedical.org', 'Medical Records Request', 'D:\Medical\Records\AMG-Request-3456.pdf', '2025-06-29 14:00:00', 'Failed', '2025-06-29 14:01:12', 'Email size exceeded recipient limit');

-- Display the total records per status (for verification)
SELECT Email_Status, COUNT(*) as Count
FROM EmailRecords
GROUP BY Email_Status
ORDER BY Email_Status;

-- Display the total number of records
SELECT COUNT(*) as TotalRecords
FROM EmailRecords;

-- Examples for manually adding records via SQL
/*
INSERT INTO EmailRecords (Company_Name, Email, Subject, File_Path, Email_Status, Date, Email_Send_Date, Reason)
VALUES 
(
    'Company Name', 
    'recipient@example.com', 
    'Email Subject Line', 
    'D:\Path\To\Attachment.pdf', 
    'Pending', 
    GETDATE(), 
    DATEADD(day, 1, GETDATE()), 
    NULL 
);
*/

-- Example with all values filled in for July 2025
/*
INSERT INTO EmailRecords (Company_Name, Email, Subject, File_Path, Email_Status, Date, Email_Send_Date, Reason)
VALUES 
(
    'Acme Customer Solutions', 
    'support@acmecorp.com', 
    'July 2025 Product Update', 
    'D:\Updates\July2025_Update.pdf', 
    'Pending', 
    GETDATE(), 
    '2025-07-15 09:00:00', 
    'Manual entry'
);
*/