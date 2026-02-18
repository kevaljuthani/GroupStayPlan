-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stay" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "mapsLink" TEXT,
    "rating" DOUBLE PRECISION,
    "pricePerNight" INTEGER,
    "foodIncluded" BOOLEAN NOT NULL DEFAULT false,
    "images" TEXT[],
    "recommendedBy" TEXT[],
    "contactName" TEXT,
    "contactPhone" TEXT,
    "notes" TEXT,
    "sourceMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Stay_groupId_idx" ON "Stay"("groupId");

-- AddForeignKey
ALTER TABLE "Stay" ADD CONSTRAINT "Stay_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
