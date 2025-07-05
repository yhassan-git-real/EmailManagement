-- Email Records Stored Procedures
-- These procedures will help with CRUD operations for the EmailRecords table

-- Create or Update procedure for EmailRecords
IF EXISTS (SELECT *
FROM sys.objects
WHERE type = 'P' AND name = 'sp_EmailRecords_CreateOrUpdate')
    DROP PROCEDURE sp_EmailRecords_CreateOrUpdate
GO

CREATE PROCEDURE sp_EmailRecords_CreateOrUpdate
    @id INT = NULL,
    @company_name NVARCHAR(255) = NULL,
    @email NVARCHAR(255),
    @subject NVARCHAR(500),
    @file_path NVARCHAR(1000) = NULL,
    @email_status NVARCHAR(50) = 'Pending',
    @reason NVARCHAR(1000) = NULL,
    @email_send_date DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ReturnID INT;

    -- Validate required fields
    IF @email IS NULL OR @email = ''
    BEGIN
        RAISERROR('Email address is required', 16, 1);
        RETURN;
    END

    IF @subject IS NULL OR @subject = ''
    BEGIN
        RAISERROR('Subject is required', 16, 1);
        RETURN;
    END

    -- Validate email format (basic check for @ character)
    IF CHARINDEX('@', @email) = 0
    BEGIN
        RAISERROR('Invalid email format', 16, 1);
        RETURN;
    END

    -- If ID is provided, update existing record
    IF @id IS NOT NULL
    BEGIN
        UPDATE [EmailRecords]
        SET 
            Company_Name = ISNULL(@company_name, Company_Name),
            Email = @email,
            Subject = @subject,
            File_Path = ISNULL(@file_path, File_Path),
            Email_Status = ISNULL(@email_status, Email_Status),
            Reason = ISNULL(@reason, Reason),
            Email_Send_Date = ISNULL(@email_send_date, Email_Send_Date)
        WHERE Email_ID = @id;

        -- Check if record was actually updated
        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('Record not found', 16, 1);
            RETURN;
        END

        SET @ReturnID = @id;
    END
    ELSE -- Otherwise, insert new record
    BEGIN
        INSERT INTO [EmailRecords]
            (
            Company_Name,
            Email,
            Subject,
            File_Path,
            Email_Status,
            Reason,
            Email_Send_Date,
            Date
            )
        VALUES
            (
                @company_name,
                @email,
                @subject,
                @file_path,
                @email_status,
                @reason,
                @email_send_date,
                GETDATE()
        );

        SET @ReturnID = SCOPE_IDENTITY();
    END

    -- Return the ID
    SELECT @ReturnID AS Email_ID;
END
GO

-- Get Email Records procedure with filtering and pagination
IF EXISTS (SELECT *
FROM sys.objects
WHERE type = 'P' AND name = 'sp_EmailRecords_Get')
    DROP PROCEDURE sp_EmailRecords_Get
GO

CREATE PROCEDURE sp_EmailRecords_Get
    @limit INT = 10,
    @offset INT = 0,
    @search NVARCHAR(255) = NULL,
    @status NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Count total records with filters
    SELECT COUNT(*) AS total
    FROM [EmailRecords]
    WHERE
        (@search IS NULL OR
        Company_Name LIKE '%' + @search + '%' OR
        Email LIKE '%' + @search + '%' OR
        Subject LIKE '%' + @search + '%' OR
        File_Path LIKE '%' + @search + '%'
        )
        AND (@status IS NULL OR Email_Status = @status);

    -- Get paginated records with filters
    SELECT
        Email_ID as id,
        Company_Name as company_name,
        Email as email,
        Subject as subject,
        File_Path as file_path,
        Email_Status as email_status,
        Reason as reason,
        Email_Send_Date as email_send_date,
        Date as date
    FROM [EmailRecords]
    WHERE
        (@search IS NULL OR
        Company_Name LIKE '%' + @search + '%' OR
        Email LIKE '%' + @search + '%' OR
        Subject LIKE '%' + @search + '%' OR
        File_Path LIKE '%' + @search + '%'
        )
        AND (@status IS NULL OR Email_Status = @status)
    ORDER BY Date DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY;
END
GO

-- Delete Email Record procedure
IF EXISTS (SELECT *
FROM sys.objects
WHERE type = 'P' AND name = 'sp_EmailRecords_Delete')
    DROP PROCEDURE sp_EmailRecords_Delete
GO

CREATE PROCEDURE sp_EmailRecords_Delete
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @RowCount INT = 0;

    -- Check if record exists
    IF NOT EXISTS (SELECT 1
    FROM [EmailRecords]
    WHERE Email_ID = @id)
    BEGIN
        RAISERROR('Record not found', 16, 1);
        RETURN;
    END

    -- Delete the record
    DELETE FROM [EmailRecords] WHERE Email_ID = @id;
    SET @RowCount = @@ROWCOUNT;

    -- Return success
    SELECT 'Record deleted successfully' AS message, @RowCount AS affected_rows;
END
GO

-- Update Email Record Status procedure
IF EXISTS (SELECT *
FROM sys.objects
WHERE type = 'P' AND name = 'sp_EmailRecords_UpdateStatus')
    DROP PROCEDURE sp_EmailRecords_UpdateStatus
GO

CREATE PROCEDURE sp_EmailRecords_UpdateStatus
    @id INT,
    @status NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @RowCount INT = 0;

    -- Validate status
    IF @status IS NULL OR @status NOT IN ('Pending', 'Success', 'Failed')
    BEGIN
        RAISERROR('Invalid status. Must be one of: Pending, Success, Failed', 16, 1);
        RETURN;
    END

    -- Check if record exists
    IF NOT EXISTS (SELECT 1
    FROM [EmailRecords]
    WHERE Email_ID = @id)
    BEGIN
        RAISERROR('Record not found', 16, 1);
        RETURN;
    END

    -- Update the record status
    UPDATE [EmailRecords]
    SET Email_Status = @status
    WHERE Email_ID = @id;
    SET @RowCount = @@ROWCOUNT;

    -- Return success
    SELECT 'Status updated successfully' AS message, @RowCount AS affected_rows;
END
GO
