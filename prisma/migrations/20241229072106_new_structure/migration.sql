/*
  Warnings:

  - You are about to drop the column `addressId` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Amenities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Facilities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AddressToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AmenitiesToProperty` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FacilitiesToProperty` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_addressId_fkey";

-- DropForeignKey
ALTER TABLE "_AddressToUser" DROP CONSTRAINT "_AddressToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_AddressToUser" DROP CONSTRAINT "_AddressToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "_AmenitiesToProperty" DROP CONSTRAINT "_AmenitiesToProperty_A_fkey";

-- DropForeignKey
ALTER TABLE "_AmenitiesToProperty" DROP CONSTRAINT "_AmenitiesToProperty_B_fkey";

-- DropForeignKey
ALTER TABLE "_FacilitiesToProperty" DROP CONSTRAINT "_FacilitiesToProperty_A_fkey";

-- DropForeignKey
ALTER TABLE "_FacilitiesToProperty" DROP CONSTRAINT "_FacilitiesToProperty_B_fkey";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "addressId",
ADD COLUMN     "amenities" TEXT[],
ADD COLUMN     "bedroomNumber" INTEGER,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "facilities" TEXT[],
ADD COLUMN     "street" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- DropTable
DROP TABLE "Address";

-- DropTable
DROP TABLE "Amenities";

-- DropTable
DROP TABLE "Facilities";

-- DropTable
DROP TABLE "_AddressToUser";

-- DropTable
DROP TABLE "_AmenitiesToProperty";

-- DropTable
DROP TABLE "_FacilitiesToProperty";
