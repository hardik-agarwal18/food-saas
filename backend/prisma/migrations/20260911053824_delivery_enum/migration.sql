/*
  Warnings:

  - The values [REJECTED,FAILED] on the enum `DeliveryAssignmentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DeliveryAssignmentStatus_new" AS ENUM ('PENDING', 'OFFERED', 'ACCEPTED', 'DRIVER_ARRIVING', 'PICKED_UP', 'DELIVERED', 'EXPIRED', 'CANCELLED');
ALTER TABLE "public"."delivery_assignments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "delivery_assignments" ALTER COLUMN "status" TYPE "DeliveryAssignmentStatus_new" USING ("status"::text::"DeliveryAssignmentStatus_new");
ALTER TYPE "DeliveryAssignmentStatus" RENAME TO "DeliveryAssignmentStatus_old";
ALTER TYPE "DeliveryAssignmentStatus_new" RENAME TO "DeliveryAssignmentStatus";
DROP TYPE "public"."DeliveryAssignmentStatus_old";
ALTER TABLE "delivery_assignments" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
