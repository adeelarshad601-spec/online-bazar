-- Existing seller-role accounts were created without a seller status.
-- Keep their dashboard access and shop management behavior consistent.
UPDATE "User"
SET "sellerStatus" = 'APPROVED'
WHERE "role" = 'SELLER'
  AND "sellerStatus" IS NULL;
