/*
  Warnings:

  - You are about to drop the column `amenitiyId` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `facilityId` on the `Property` table. All the data in the column will be lost.
  - Added the required column `propertyId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_amenitiyId_fkey";

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_facilityId_fkey";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "amenitiyId",
DROP COLUMN "facilityId";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "propertyId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "_FacilitiesToProperty" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FacilitiesToProperty_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AmenitiesToProperty" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AmenitiesToProperty_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_FacilitiesToProperty_B_index" ON "_FacilitiesToProperty"("B");

-- CreateIndex
CREATE INDEX "_AmenitiesToProperty_B_index" ON "_AmenitiesToProperty"("B");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FacilitiesToProperty" ADD CONSTRAINT "_FacilitiesToProperty_A_fkey" FOREIGN KEY ("A") REFERENCES "Facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FacilitiesToProperty" ADD CONSTRAINT "_FacilitiesToProperty_B_fkey" FOREIGN KEY ("B") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AmenitiesToProperty" ADD CONSTRAINT "_AmenitiesToProperty_A_fkey" FOREIGN KEY ("A") REFERENCES "Amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AmenitiesToProperty" ADD CONSTRAINT "_AmenitiesToProperty_B_fkey" FOREIGN KEY ("B") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
