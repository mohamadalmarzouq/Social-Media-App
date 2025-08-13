-- Add submission modification fields
ALTER TABLE "submissions" ADD COLUMN "modificationsAllowed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "submissions" ADD COLUMN "modificationRequestedAt" TIMESTAMP(3);
