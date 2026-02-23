-- CreateEnum
CREATE TYPE "HomeworkStatus" AS ENUM ('ACTIVE', 'CLOSED', 'DRAFT');

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "status" "HomeworkStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "gender" "Gender";

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "department" TEXT;
