-- EmailRecords Table DDL
CREATE TABLE EmailRecords (
    Email_ID INT IDENTITY(1,1) PRIMARY KEY,
    Company_Name NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    Subject NVARCHAR(500) NOT NULL,
    File_Path NVARCHAR(1000) NULL,
    Email_Send_Date DATETIME NOT NULL,
    Email_Status NVARCHAR(50) DEFAULT 'Pending' CHECK (Email_Status IN ('Pending', 'Failed', 'Success')),
    Date DATETIME DEFAULT GETDATE(),
    Reason NVARCHAR(MAX) NULL
);

-- EmailTemplates Table DDL
CREATE TABLE EmailTemplates (
    Template_ID INT IDENTITY(1,1) PRIMARY KEY,
    Template_Name NVARCHAR(255) NOT NULL,
    Subject_Template NVARCHAR(500) NOT NULL,
    Body_Template NVARCHAR(MAX) NOT NULL,
    Created_Date DATETIME DEFAULT GETDATE(),
    Modified_Date DATETIME DEFAULT GETDATE(),
    Created_By NVARCHAR(100) NULL,
    Is_Active BIT DEFAULT 1,
    Category NVARCHAR(100) NULL,
    Description NVARCHAR(500) NULL,
    Has_Attachments BIT DEFAULT 0,
    Default_Attachment_Paths NVARCHAR(MAX) NULL
);

-- Add indexes for better performance
CREATE INDEX IX_EmailRecords_Status ON EmailRecords (Email_Status);
CREATE INDEX IX_EmailRecords_SendDate ON EmailRecords (Email_Send_Date);
CREATE INDEX IX_EmailRecords_Email ON EmailRecords (Email);
CREATE INDEX IX_EmailTemplates_Name ON EmailTemplates (Template_Name);
CREATE INDEX IX_EmailTemplates_IsActive ON EmailTemplates (Is_Active);
