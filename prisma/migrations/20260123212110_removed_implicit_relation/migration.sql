/*
  Warnings:

  - You are about to drop the `_UserMovieList` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserMovieList" DROP CONSTRAINT "_UserMovieList_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserMovieList" DROP CONSTRAINT "_UserMovieList_B_fkey";

-- DropTable
DROP TABLE "_UserMovieList";

-- CreateTable
CREATE TABLE "UserMovieList" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "movieId" INTEGER NOT NULL,

    CONSTRAINT "UserMovieList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MovieToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserMovieList_userId_movieId_key" ON "UserMovieList"("userId", "movieId");

-- CreateIndex
CREATE UNIQUE INDEX "_MovieToUser_AB_unique" ON "_MovieToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_MovieToUser_B_index" ON "_MovieToUser"("B");

-- AddForeignKey
ALTER TABLE "UserMovieList" ADD CONSTRAINT "UserMovieList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMovieList" ADD CONSTRAINT "UserMovieList_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MovieToUser" ADD CONSTRAINT "_MovieToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MovieToUser" ADD CONSTRAINT "_MovieToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
