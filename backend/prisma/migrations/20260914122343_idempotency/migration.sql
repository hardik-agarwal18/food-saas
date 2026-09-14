-- CreateEnum
CREATE TYPE "EventHandlerExecutionStatus" AS ENUM ('PROCESSING', 'SUCCEEDED');

-- CreateTable
CREATE TABLE "event_handler_executions" (
    "eventId" UUID NOT NULL,
    "handler_name" TEXT NOT NULL,
    "status" "EventHandlerExecutionStatus" NOT NULL DEFAULT 'PROCESSING',
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "claimed_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "last_error" TEXT,

    CONSTRAINT "event_handler_executions_pkey" PRIMARY KEY ("eventId","handler_name")
);

-- CreateTable
CREATE TABLE "processed_webhooks" (
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "processed_webhooks_provider_eventId_key" ON "processed_webhooks"("provider", "eventId");
