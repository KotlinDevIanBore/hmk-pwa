-- AlterEnum
-- Add new appointment statuses: RESCHEDULED, CHECKED_IN, CHECKED_OUT

DO $$ BEGIN
    -- Add new enum values if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'RESCHEDULED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AppointmentStatus')) THEN
        ALTER TYPE "AppointmentStatus" ADD VALUE 'RESCHEDULED';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CHECKED_IN' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AppointmentStatus')) THEN
        ALTER TYPE "AppointmentStatus" ADD VALUE 'CHECKED_IN';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CHECKED_OUT' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AppointmentStatus')) THEN
        ALTER TYPE "AppointmentStatus" ADD VALUE 'CHECKED_OUT';
    END IF;
END $$;

