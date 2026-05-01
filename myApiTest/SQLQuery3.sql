UPDATE Authors
SET CreatedAt = GETUTCDATE()
WHERE CreatedAt < '2000-01-01'