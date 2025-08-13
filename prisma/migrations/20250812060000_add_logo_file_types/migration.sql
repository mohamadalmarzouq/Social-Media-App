-- AlterTable
ALTER TABLE "contests" ADD COLUMN "logoFileTypes" TEXT[] DEFAULT '{}';

-- Update existing contests to have empty logo file types array
UPDATE "contests" SET "logoFileTypes" = '{}' WHERE "logoFileTypes" IS NULL;
