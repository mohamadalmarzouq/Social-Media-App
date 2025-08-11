-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('STATIC_POST', 'ANIMATED_POST');

-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('PACKAGE_1', 'PACKAGE_2', 'PACKAGE_3');

-- AlterEnum
ALTER TYPE "Platform" ADD VALUE 'LOGO';

-- AlterTable
ALTER TABLE "contests" ADD COLUMN     "fileType" "FileType",
ADD COLUMN     "packageType" "PackageType";
