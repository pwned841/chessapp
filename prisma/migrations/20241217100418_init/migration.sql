-- CreateTable
CREATE TABLE "Player" (
    "fideid" INTEGER NOT NULL,
    "name" TEXT,
    "country" TEXT,
    "sex" TEXT,
    "title" TEXT,
    "w_title" TEXT,
    "o_title" TEXT,
    "foa_title" TEXT,
    "rating" INTEGER,
    "games" INTEGER,
    "k" INTEGER,
    "rapid_rating" INTEGER,
    "rapid_games" INTEGER,
    "rapid_k" INTEGER,
    "blitz_rating" INTEGER,
    "blitz_games" INTEGER,
    "blitz_k" INTEGER,
    "birthday" INTEGER,
    "flag" TEXT,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("fideid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_fideid_key" ON "Player"("fideid");
