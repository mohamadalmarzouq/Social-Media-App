-- AlterEnum
ALTER TYPE "SubmissionStatus" ADD VALUE 'WINNER';

-- AlterTable
ALTER TABLE "contests" ADD COLUMN     "winningSubmissionId" TEXT;

-- AddForeignKey
ALTER TABLE "contests" ADD CONSTRAINT "contests_winningSubmissionId_fkey" FOREIGN KEY ("winningSubmissionId") REFERENCES "submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
