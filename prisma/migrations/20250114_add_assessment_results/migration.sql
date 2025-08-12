-- CreateTable
CREATE TABLE "AssessmentResult" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "responses" JSONB NOT NULL,
    "scores" JSONB,
    "summary" TEXT,
    "insights" JSONB,
    "recommendations" JSONB,
    "userProfile" JSONB,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shareId" TEXT,
    "pdfUrl" TEXT,
    "pdfGeneratedAt" TIMESTAMP(3),

    CONSTRAINT "AssessmentResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssessmentResult_invitationId_idx" ON "AssessmentResult"("invitationId");

-- CreateIndex
CREATE INDEX "AssessmentResult_toolId_idx" ON "AssessmentResult"("toolId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentResult_shareId_key" ON "AssessmentResult"("shareId");

-- CreateIndex
CREATE INDEX "AssessmentResult_shareId_idx" ON "AssessmentResult"("shareId");

-- AddForeignKey
ALTER TABLE "AssessmentResult" ADD CONSTRAINT "AssessmentResult_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;