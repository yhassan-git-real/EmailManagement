-- Stored procedure for getting email records by status
CREATE OR ALTER PROCEDURE GetEmailRecordsByStatus
    @EmailStatus VARCHAR(50) = NULL,
    @Offset INT = 0,
    @Limit INT = 100
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @EmailStatus IS NULL OR @EmailStatus = 'All'
    BEGIN
        -- Return all records with pagination
        SELECT Email_ID, Company_Name, Email, Subject, File_Path, 
               Email_Send_Date, Email_Status, Date, Reason 
        FROM EmailRecords
        ORDER BY Email_Send_Date DESC
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;
        
        -- Return total count for pagination
        SELECT COUNT(*) AS TotalCount FROM EmailRecords;
    END
    ELSE
    BEGIN
        -- Return filtered records with pagination
        SELECT Email_ID, Company_Name, Email, Subject, File_Path, 
               Email_Send_Date, Email_Status, Date, Reason 
        FROM EmailRecords
        WHERE Email_Status = @EmailStatus
        ORDER BY Email_Send_Date DESC
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;
        
        -- Return total count for pagination
        SELECT COUNT(*) AS TotalCount FROM EmailRecords
        WHERE Email_Status = @EmailStatus;
    END
END
GO

-- NOTE: EmailTemplates stored procedure removed - using file-based templates only
