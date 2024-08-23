-- ALTER TABLE public.questions ADD createdbyuser int4 NULL;

-- INSERT INTO public."resolutionStatuses" (id,"resolutionStatus","resolutionActive")
-- VALUES (13,'balloting',true) 

-- INSERT INTO public."motionStatuses" (id,"statusName",description)
-- VALUES (44,'balloting','balloting') 

-- INSERT INTO public."motionStatuses" (id,"statusName",description,status)
-- VALUES (43,'Defered','Defered',true) 

-- DO $$ BEGIN
-- IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_status_enum') THEN
-- CREATE TYPE employee_status_enum AS ENUM ('active', 'inactive');
-- END IF;
-- END $$;

-- ALTER TABLE public.employees
-- ADD COLUMN "employeeStatus" employee_status_enum DEFAULT 'active' NOT NULL; 



-- ALTER TABLE public."noteParagraphs" ADD createdby int4 NULL;

-- CREATE TYPE file_register_status AS ENUM ('active', 'inactive');
-- ALTER TABLE "fileRegisters" ADD COLUMN "status" file_register_status DEFAULT 'active' NOT NULL;

-- CREATE TYPE file_status AS ENUM ('active', 'inactive');
-- ALTER TABLE "newFiles" ADD COLUMN "status" file_status DEFAULT 'active' NOT NULL;

-- ALTER TABLE public."legislativeBills" ADD diary_number varchar NULL;

-- ALTER TYPE public."enum_freshReceiptRemarks_CommentStatus" RENAME VALUE 'Put Up For' TO 'Please Put Up';

-- CREATE TYPE public.enum_freshReceiptRemarks_priority AS ENUM ('Confidential', 'Immediate', 'Routine');


-- ALTER TABLE public."freshReceiptRemarks"
-- ADD COLUMN priority public.enum_freshReceiptRemarks_priority;


-- ALTER TABLE public."freshReceiptRemarks"
-- ALTER COLUMN priority SET DEFAULT 'Immediate';


-- UPDATE public."freshReceiptRemarks"
-- SET priority = 'Immediate' 
-- WHERE priority IS NULL;


CREATE TYPE tenureType AS ENUM ('Senators', 'Ministers');

ALTER TABLE tenures ADD COLUMN tenureType tenureType DEFAULT 'Senators';

ALTER TABLE members
ADD COLUMN "fkParliamentaryYearId" INTEGER NULL;

ALTER TABLE members
ADD CONSTRAINT fk_parliamentary_year_id
FOREIGN KEY ("fkParliamentaryYearId")
REFERENCES "parliamentaryYears"(id)
ON DELETE CASCADE;





