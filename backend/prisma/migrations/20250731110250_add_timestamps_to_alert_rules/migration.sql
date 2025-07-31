-- AlterTable
-- First add created_at with default value
ALTER TABLE "public"."alert_rules" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Then add updated_at with default value
ALTER TABLE "public"."alert_rules" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have proper timestamps
UPDATE "public"."alert_rules" SET 
  "created_at" = CURRENT_TIMESTAMP,
  "updated_at" = CURRENT_TIMESTAMP
WHERE "created_at" IS NULL OR "updated_at" IS NULL;
