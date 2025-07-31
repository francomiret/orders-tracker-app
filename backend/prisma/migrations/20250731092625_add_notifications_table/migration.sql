-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('ALERT_GENERATED', 'ORDER_STATUS_CHANGED', 'ADMIN_ALERT', 'SYSTEM_NOTIFICATION');

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),
    "sent_email" BOOLEAN NOT NULL DEFAULT false,
    "email_sent_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
