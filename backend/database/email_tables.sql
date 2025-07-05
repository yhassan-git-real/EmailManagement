-- EmailRecords Table DDL
CREATE TABLE EmailRecords
(
    Email_ID INT IDENTITY(1,1) PRIMARY KEY,
    Company_Name NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    Subject NVARCHAR(500) NOT NULL,
    File_Path NVARCHAR(1000) NULL,
    Email_Send_Date DATETIME NULL,
    Email_Status NVARCHAR(50) DEFAULT 'Pending' CHECK (Email_Status IN ('Pending', 'Failed', 'Success')),
    Date DATETIME DEFAULT GETDATE(),
    Reason NVARCHAR(MAX) NULL
);

-- Add indexes for better performance
CREATE INDEX IX_EmailRecords_Status ON EmailRecords (Email_Status);
CREATE INDEX IX_EmailRecords_SendDate ON EmailRecords (Email_Send_Date);
CREATE INDEX IX_EmailRecords_Email ON EmailRecords (Email);
