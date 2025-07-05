-- Alter EmailRecords table to make Email_Send_Date column nullable
USE EmailDB;
GO

-- Check if column exists and is not nullable
IF EXISTS (
    SELECT 1
FROM sys.columns c
    JOIN sys.tables t ON c.object_id = t.object_id
WHERE t.name = 'EmailRecords'
    AND c.name = 'Email_Send_Date'
    AND c.is_nullable = 0
)
BEGIN
    PRINT 'Altering Email_Send_Date column to be nullable...';

    -- Alter the column to be nullable
    ALTER TABLE EmailRecords
    ALTER COLUMN Email_Send_Date DATETIME NULL;

    PRINT 'Column Email_Send_Date has been modified to be nullable.';
END
ELSE
BEGIN
    PRINT 'Column Email_Send_Date is already nullable or does not exist.';
END
