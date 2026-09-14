-- AlterTable
ALTER TABLE "outbox_events" ADD COLUMN     "attempt_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "claimed_at" TIMESTAMP(3),
ADD COLUMN     "dead_lettered_at" TIMESTAMP(3),
ADD COLUMN     "last_attempt_at" TIMESTAMP(3),
ADD COLUMN     "last_error" TEXT,
ADD COLUMN     "next_attempt_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "idx_outbox_polling" ON "outbox_events"("processed_at", "dead_lettered_at", "next_attempt_at", "claimed_at");
