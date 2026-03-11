/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ScheduleItem" ADD COLUMN     "weekStartDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ScheduleItem_weekStartDate_classId_idx" ON "ScheduleItem"("weekStartDate", "classId");

-- CreateIndex
CREATE INDEX "ScheduleItem_weekStartDate_teacherId_idx" ON "ScheduleItem"("weekStartDate", "teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");
