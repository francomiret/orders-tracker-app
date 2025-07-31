-- AlterTable
ALTER TABLE "public"."alert_rules" ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "public"."alerts" ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "public"."order_events" ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "estimated_delivery_date" TIMESTAMP(3),
ADD COLUMN     "user_id" TEXT;
