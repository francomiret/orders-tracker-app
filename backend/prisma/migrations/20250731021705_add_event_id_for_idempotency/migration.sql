/*
  Warnings:

  - A unique constraint covering the columns `[event_id]` on the table `order_events` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order_id,event_type,timestamp]` on the table `order_events` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."order_events_order_id_event_type_key";

-- AlterTable
ALTER TABLE "public"."order_events" ADD COLUMN     "event_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "order_events_event_id_key" ON "public"."order_events"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_events_order_id_event_type_timestamp_key" ON "public"."order_events"("order_id", "event_type", "timestamp");
