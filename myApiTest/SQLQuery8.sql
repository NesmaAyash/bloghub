USE BlogDb;

DECLARE @UserId INT = 1;

DELETE FROM Comments 
WHERE PostId IN (SELECT Id FROM Posts WHERE AuthorId = @UserId);

DELETE FROM Comments WHERE AuthorId = @UserId;

DELETE FROM Notifications WHERE UserId = @UserId;

DELETE FROM Notifications 
WHERE PostId IN (SELECT Id FROM Posts WHERE AuthorId = @UserId);

DELETE FROM Posts WHERE AuthorId = @UserId;

DELETE FROM Authors WHERE Id = @UserId;

SELECT Id, Name, Email FROM Authors;