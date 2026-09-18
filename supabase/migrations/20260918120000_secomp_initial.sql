-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'STAFF', 'ADMIN', 'RECRUITER', 'VISITOR');

-- CreateEnum
CREATE TYPE "ActivityTurn" AS ENUM ('MORNING', 'AFTERNOON', 'NIGHT');

-- CreateEnum
CREATE TYPE "ActivityTheme" AS ENUM ('TECHNOLOGY', 'MANAGEMENT', 'INNOVATION', 'CAREER');

-- CreateEnum
CREATE TYPE "ActivityTrack" AS ENUM ('DATA_AI', 'INFRA_SECURITY', 'HARDWARE_IOT', 'DEV_UI', 'GENERAL');

-- CreateEnum
CREATE TYPE "StampType" AS ENUM ('LECTURE', 'WARMUP_WORKSHOP', 'TALENT_ARENA', 'ARENA_GAMER', 'IDEATHON');

-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'COMPLETED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "ra_encrypted" TEXT,
    "ra_hash" VARCHAR(64),
    "phone_encrypted" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "speaker_name" VARCHAR(255) NOT NULL,
    "speaker_bio" TEXT,
    "speaker_company" VARCHAR(255),
    "turn" "ActivityTurn" NOT NULL,
    "theme" "ActivityTheme" NOT NULL DEFAULT 'TECHNOLOGY',
    "track" "ActivityTrack" NOT NULL DEFAULT 'GENERAL',
    "day_index" INTEGER NOT NULL,
    "is_warmup" BOOLEAN NOT NULL DEFAULT false,
    "starts_at" TIMESTAMPTZ(6) NOT NULL,
    "ends_at" TIMESTAMPTZ(6) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "max_seats" INTEGER NOT NULL DEFAULT 100,
    "allocated_seats" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pre_enrollments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "activity_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pre_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_sessions" (
    "id" UUID NOT NULL,
    "activity_id" UUID NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 15,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "opened_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" UUID NOT NULL,

    CONSTRAINT "attendance_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "activity_id" UUID NOT NULL,
    "session_id" UUID,
    "stamp_type" "StampType" NOT NULL DEFAULT 'LECTURE',
    "points_awarded" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shark_pitches" (
    "id" UUID NOT NULL,
    "startup_name" VARCHAR(255) NOT NULL,
    "one_liner" VARCHAR(255) NOT NULL,
    "team_members" TEXT NOT NULL,
    "pitch_order" INTEGER NOT NULL,
    "vote_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shark_pitches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shark_votes" (
    "id" UUID NOT NULL,
    "pitch_id" UUID NOT NULL,
    "user_id" UUID,
    "session_fingerprint" VARCHAR(64),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shark_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talent_arena_slots" (
    "id" UUID NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "interviewer_name" VARCHAR(255) NOT NULL,
    "slot_time" TIMESTAMPTZ(6) NOT NULL,
    "status" "SlotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "talent_arena_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talent_arena_bookings" (
    "id" UUID NOT NULL,
    "slot_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "linkedin_url" VARCHAR(500) NOT NULL,
    "field_interest" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "talent_arena_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "validation_hash" VARCHAR(64) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "ra_masked" VARCHAR(20) NOT NULL,
    "total_hours" INTEGER NOT NULL,
    "level_reached" VARCHAR(50) NOT NULL,
    "issued_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_contents" (
    "id" UUID NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" JSONB NOT NULL,
    "updated_by" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cms_contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_ra_hash" ON "users"("ra_hash");

-- CreateIndex
CREATE INDEX "idx_activities_day_turn" ON "activities"("day_index", "turn");

-- CreateIndex
CREATE INDEX "idx_activities_theme" ON "activities"("theme");

-- CreateIndex
CREATE UNIQUE INDEX "pre_enrollments_user_id_activity_id_key" ON "pre_enrollments"("user_id", "activity_id");

-- CreateIndex
CREATE INDEX "idx_sessions_token_active" ON "attendance_sessions"("token_hash", "is_active");

-- CreateIndex
CREATE INDEX "idx_attendance_user_date" ON "attendance_records"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_user_id_activity_id_key" ON "attendance_records"("user_id", "activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "shark_votes_user_id_key" ON "shark_votes"("user_id");

-- CreateIndex
CREATE INDEX "idx_shark_votes_pitch" ON "shark_votes"("pitch_id");

-- CreateIndex
CREATE UNIQUE INDEX "talent_arena_bookings_slot_id_key" ON "talent_arena_bookings"("slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "talent_arena_bookings_user_id_key" ON "talent_arena_bookings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_user_id_key" ON "certificates"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_validation_hash_key" ON "certificates"("validation_hash");

-- CreateIndex
CREATE INDEX "idx_cert_hash" ON "certificates"("validation_hash");

-- CreateIndex
CREATE UNIQUE INDEX "cms_contents_key_key" ON "cms_contents"("key");

-- AddForeignKey
ALTER TABLE "pre_enrollments" ADD CONSTRAINT "pre_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pre_enrollments" ADD CONSTRAINT "pre_enrollments_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "attendance_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shark_votes" ADD CONSTRAINT "shark_votes_pitch_id_fkey" FOREIGN KEY ("pitch_id") REFERENCES "shark_pitches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shark_votes" ADD CONSTRAINT "shark_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_arena_bookings" ADD CONSTRAINT "talent_arena_bookings_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "talent_arena_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_arena_bookings" ADD CONSTRAINT "talent_arena_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

