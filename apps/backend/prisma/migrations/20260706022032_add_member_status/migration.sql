-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE';
