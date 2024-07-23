-- ALTER TABLE public.questions ADD createdbyuser int4 NULL;

-- INSERT INTO public.""resolutionStatuses"" (id,""resolutionStatus"",""resolutionActive"")
-- VALUES (13,'balloting',true) 

-- INSERT INTO public.""motionStatuses"" (id,""statusName"",description)
-- VALUES (44,'balloting','balloting') 

-- INSERT INTO public.""motionStatuses"" (id,""statusName"",description,status)
-- VALUES (43,'Defered','Defered',true) 

-- DO $$ BEGIN
-- IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_status_enum') THEN
-- CREATE TYPE employee_status_enum AS ENUM ('active', 'inactive');
-- END IF;
-- END $$;

-- ALTER TABLE public.employees
-- ADD COLUMN ""employeeStatus"" employee_status_enum DEFAULT 'active' NOT NULL; 