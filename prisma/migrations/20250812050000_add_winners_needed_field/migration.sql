-- AlterTable
ALTER TABLE "contests" ADD COLUMN "winnersNeeded" INTEGER NOT NULL DEFAULT 1;

-- Update existing contests to have appropriate winners needed based on package type
-- This is a safe default since most existing contests would be Package 1 (1 winner)
UPDATE "contests" SET "winnersNeeded" = 1 WHERE "winnersNeeded" IS NULL;
