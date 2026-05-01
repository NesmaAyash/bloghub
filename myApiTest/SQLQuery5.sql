USE BlogDb;
GO

UPDATE Authors 
SET Role = 'author' 
WHERE Role IS NULL OR Role = '';

UPDATE Authors 
SET Role = 'admin' 
WHERE Email = 'nsoomay1@gmail.com';

SELECT Id, Name, Email, Role FROM Authors;