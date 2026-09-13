-- CreateEnum
CREATE TYPE "MenuImportStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'READY_FOR_REVIEW', 'CONFIRMED', 'IMPORTED', 'FAILED');

-- CreateTable
CREATE TABLE "menu_imports" (
    "id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "status" "MenuImportStatus" NOT NULL DEFAULT 'UPLOADED',
    "source_file_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "raw_ocr_text" TEXT,
    "extracted_data" JSONB,
    "warnings" JSONB,
    "errors" JSONB,
    "failure_reason" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "processing_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "imported_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "menu_imports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "menu_imports_restaurant_id_idx" ON "menu_imports"("restaurant_id");

-- CreateIndex
CREATE INDEX "menu_imports_status_idx" ON "menu_imports"("status");

-- AddForeignKey
ALTER TABLE "menu_imports" ADD CONSTRAINT "menu_imports_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
