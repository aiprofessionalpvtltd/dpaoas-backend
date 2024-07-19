PGDMP     %                    {            senate %   12.16 (Ubuntu 12.16-0ubuntu0.20.04.1)    14.9 t   �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16386    senate    DATABASE     [   CREATE DATABASE senate WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'en_US.UTF-8';
    DROP DATABASE senate;
                postgres    false            �           0    0    DATABASE senate    ACL     &   GRANT ALL ON DATABASE senate TO root;
                   postgres    false    3544            �           1247    16679 !   enum_Departments_departmentStatus    TYPE     a   CREATE TYPE public."enum_Departments_departmentStatus" AS ENUM (
    'active',
    'inactive'
);
 6   DROP TYPE public."enum_Departments_departmentStatus";
       public          root    false            �           1247    16607 !   enum_departments_departmentStatus    TYPE     a   CREATE TYPE public."enum_departments_departmentStatus" AS ENUM (
    'active',
    'inactive'
);
 6   DROP TYPE public."enum_departments_departmentStatus";
       public          root    false            �           1247    16624 #   enum_designations_designationStatus    TYPE     c   CREATE TYPE public."enum_designations_designationStatus" AS ENUM (
    'active',
    'inactive'
);
 8   DROP TYPE public."enum_designations_designationStatus";
       public          root    false            �           1247    16526    enum_leaveTypes_leaveStatus    TYPE     [   CREATE TYPE public."enum_leaveTypes_leaveStatus" AS ENUM (
    'active',
    'inactive'
);
 0   DROP TYPE public."enum_leaveTypes_leaveStatus";
       public          root    false            +           1247    17426    enum_members_electionType    TYPE     i   CREATE TYPE public."enum_members_electionType" AS ENUM (
    'Bye Election',
    'Scheduled Election'
);
 .   DROP TYPE public."enum_members_electionType";
       public          root    false            4           1247    17432    enum_members_gender    TYPE     M   CREATE TYPE public.enum_members_gender AS ENUM (
    'Male',
    'Female'
);
 &   DROP TYPE public.enum_members_gender;
       public          root    false            (           1247    17410    enum_members_memberStatus    TYPE     �   CREATE TYPE public."enum_members_memberStatus" AS ENUM (
    'Active',
    'Active/Oath Not Administered',
    'Deceased',
    'Disqualified',
    'Resigned',
    'Retired',
    'Tenure Completed'
);
 .   DROP TYPE public."enum_members_memberStatus";
       public          root    false            j           1247    17619    enum_motions_motionType    TYPE       CREATE TYPE public."enum_motions_motionType" AS ENUM (
    'Adjournment Motion',
    'Call Attention Notice',
    'Privilege Motion',
    'Laying of Copy',
    'Motion For Consideration/Discussion',
    'Motion Under Rule 194',
    'Motion Under Rule 218',
    'Motion Under Rule 60'
);
 ,   DROP TYPE public."enum_motions_motionType";
       public          root    false            m           1247    17636    enum_motions_motionWeek    TYPE     �   CREATE TYPE public."enum_motions_motionWeek" AS ENUM (
    'Not Applicable',
    '1st Week',
    '2nd Week',
    '3rd Week',
    '4th Week',
    '5th Week'
);
 ,   DROP TYPE public."enum_motions_motionWeek";
       public          root    false            �           1247    17666 %   enum_noticeOfficeDairies_businessType    TYPE     w   CREATE TYPE public."enum_noticeOfficeDairies_businessType" AS ENUM (
    'Resolution',
    'Motion',
    'Question'
);
 :   DROP TYPE public."enum_noticeOfficeDairies_businessType";
       public          root    false                       1247    16742 !   enum_permissions_permissionStatus    TYPE     a   CREATE TYPE public."enum_permissions_permissionStatus" AS ENUM (
    'active',
    'inactive'
);
 6   DROP TYPE public."enum_permissions_permissionStatus";
       public          root    false            �           1247    16558 &   enum_requestLeaves_requestLeaveSubType    TYPE     �   CREATE TYPE public."enum_requestLeaves_requestLeaveSubType" AS ENUM (
    'preApproved',
    'postApproved',
    'telephonicInformed'
);
 ;   DROP TYPE public."enum_requestLeaves_requestLeaveSubType";
       public          root    false            �           1247    16549     enum_requestLeaves_requestStatus    TYPE     �   CREATE TYPE public."enum_requestLeaves_requestStatus" AS ENUM (
    'pending',
    'approved',
    'disapproved',
    'marked'
);
 5   DROP TYPE public."enum_requestLeaves_requestStatus";
       public          root    false            g           1247    17113    enum_resolutions_resolutionType    TYPE     �   CREATE TYPE public."enum_resolutions_resolutionType" AS ENUM (
    'Government Resolution',
    'Private Member Resolution',
    'Govt. Resolution Supported by others'
);
 4   DROP TYPE public."enum_resolutions_resolutionType";
       public          root    false            n           1247    16388    enum_roles_roleStatus    TYPE     U   CREATE TYPE public."enum_roles_roleStatus" AS ENUM (
    'active',
    'inactive'
);
 *   DROP TYPE public."enum_roles_roleStatus";
       public          root    false            �           1247    17290    enum_sessions_motions    TYPE     W   CREATE TYPE public.enum_sessions_motions AS ENUM (
    'Carry Forward',
    'Lapse'
);
 (   DROP TYPE public.enum_sessions_motions;
       public          root    false            �           1247    17285    enum_sessions_questions    TYPE     Y   CREATE TYPE public.enum_sessions_questions AS ENUM (
    'Carry Forward',
    'Lapse'
);
 *   DROP TYPE public.enum_sessions_questions;
       public          root    false            �           1247    17296    enum_sessions_resolutions    TYPE     [   CREATE TYPE public.enum_sessions_resolutions AS ENUM (
    'Carry Forward',
    'Lapse'
);
 ,   DROP TYPE public.enum_sessions_resolutions;
       public          root    false            �           1247    16505    enum_userSessions_status    TYPE     W   CREATE TYPE public."enum_userSessions_status" AS ENUM (
    'Success',
    'Failed'
);
 -   DROP TYPE public."enum_userSessions_status";
       public          root    false            �           1247    16406    enum_users_gender    TYPE     K   CREATE TYPE public.enum_users_gender AS ENUM (
    'male',
    'female'
);
 $   DROP TYPE public.enum_users_gender;
       public          root    false            �           1247    16412    enum_users_status    TYPE     ]   CREATE TYPE public.enum_users_status AS ENUM (
    'active',
    'inactive',
    'locked'
);
 $   DROP TYPE public.enum_users_status;
       public          root    false                       1247    16735    enum_users_userStatus    TYPE     c   CREATE TYPE public."enum_users_userStatus" AS ENUM (
    'active',
    'inactive',
    'locked'
);
 *   DROP TYPE public."enum_users_userStatus";
       public          root    false                       1247    16777    enum_visitors_visitorStatus    TYPE     [   CREATE TYPE public."enum_visitors_visitorStatus" AS ENUM (
    'active',
    'inactive'
);
 0   DROP TYPE public."enum_visitors_visitorStatus";
       public          root    false            �            1259    17042    Departments    TABLE     �  CREATE TABLE public."Departments" (
    id integer NOT NULL,
    "departmentName" character varying(255) NOT NULL,
    description character varying(255),
    "departmentDate" timestamp with time zone,
    "departmentStatus" public."enum_Departments_departmentStatus" DEFAULT 'active'::public."enum_Departments_departmentStatus",
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 !   DROP TABLE public."Departments";
       public         heap    root    false    761    761            �            1259    17040    Departments_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Departments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public."Departments_id_seq";
       public          root    false    238            �           0    0    Departments_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public."Departments_id_seq" OWNED BY public."Departments".id;
          public          root    false    237            �            1259    16977    departments    TABLE     '  CREATE TABLE public.departments (
    id integer NOT NULL,
    "departmentName" character varying(255) NOT NULL,
    description character varying(255),
    "departmentStatus" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.departments;
       public         heap    root    false            �            1259    16826    departments_id_seq    SEQUENCE     {   CREATE SEQUENCE public.departments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.departments_id_seq;
       public          root    false            �            1259    16975    departments_id_seq1    SEQUENCE     �   CREATE SEQUENCE public.departments_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.departments_id_seq1;
       public          root    false    230            �           0    0    departments_id_seq1    SEQUENCE OWNED BY     J   ALTER SEQUENCE public.departments_id_seq1 OWNED BY public.departments.id;
          public          root    false    229            �            1259    16988    designations    TABLE     *  CREATE TABLE public.designations (
    id integer NOT NULL,
    "designationName" character varying(255) NOT NULL,
    description character varying(255),
    "designationStatus" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
     DROP TABLE public.designations;
       public         heap    root    false            �            1259    16986    designations_id_seq    SEQUENCE     �   CREATE SEQUENCE public.designations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.designations_id_seq;
       public          root    false    232            �           0    0    designations_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.designations_id_seq OWNED BY public.designations.id;
          public          root    false    231                       1259    18049 	   divisions    TABLE       CREATE TABLE public.divisions (
    id integer NOT NULL,
    "divisionName" character varying(255) NOT NULL,
    "fkMinistryId" integer NOT NULL,
    "divisionStatus" boolean NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.divisions;
       public         heap    root    false                       1259    18047    divisions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.divisions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.divisions_id_seq;
       public          root    false    276            �           0    0    divisions_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.divisions_id_seq OWNED BY public.divisions.id;
          public          root    false    275            �            1259    16999 	   employees    TABLE     6  CREATE TABLE public.employees (
    id integer NOT NULL,
    "firstName" character varying(255) NOT NULL,
    "lastName" character varying(255) NOT NULL,
    "userName" character varying(255) NOT NULL,
    "phoneNo" character varying(255) NOT NULL,
    gender character varying(255) NOT NULL,
    "fileNumber" integer NOT NULL,
    "profileImage" character varying(255),
    supervisor integer,
    "fkUserId" integer,
    "fkDepartmentId" integer,
    "fkDesignationId" integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.employees;
       public         heap    root    false            �            1259    16708    employees_id_seq    SEQUENCE     y   CREATE SEQUENCE public.employees_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.employees_id_seq;
       public          root    false            �            1259    16997    employees_id_seq1    SEQUENCE     �   CREATE SEQUENCE public.employees_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.employees_id_seq1;
       public          root    false    234            �           0    0    employees_id_seq1    SEQUENCE OWNED BY     F   ALTER SEQUENCE public.employees_id_seq1 OWNED BY public.employees.id;
          public          root    false    233                       1259    18062    groups    TABLE     3  CREATE TABLE public.groups (
    id integer NOT NULL,
    "groupNameStarred" character varying(255) NOT NULL,
    "groupSequence" character varying(255) NOT NULL,
    "groupNameUnstarred" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.groups;
       public         heap    root    false                       1259    18060    groups_id_seq    SEQUENCE     �   CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.groups_id_seq;
       public          root    false    278            �           0    0    groups_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;
          public          root    false    277            �            1259    16590    leaveComments    TABLE       CREATE TABLE public."leaveComments" (
    id integer NOT NULL,
    "leaveComment" character varying(255),
    "fkRequestLeaveId" integer,
    "commentedBy" integer NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 #   DROP TABLE public."leaveComments";
       public         heap    root    false            �            1259    16588    leaveComments_id_seq    SEQUENCE     �   CREATE SEQUENCE public."leaveComments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public."leaveComments_id_seq";
       public          root    false    211            �           0    0    leaveComments_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public."leaveComments_id_seq" OWNED BY public."leaveComments".id;
          public          root    false    210            �            1259    16533 
   leaveTypes    TABLE     v  CREATE TABLE public."leaveTypes" (
    id integer NOT NULL,
    "leaveType" character varying(255) NOT NULL,
    "fkRoleId" integer,
    "leavesCount" character varying(255),
    "leaveStatus" public."enum_leaveTypes_leaveStatus" DEFAULT 'inactive'::public."enum_leaveTypes_leaveStatus",
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
     DROP TABLE public."leaveTypes";
       public         heap    root    false    728    728            �            1259    16531    leaveTypes_id_seq    SEQUENCE     �   CREATE SEQUENCE public."leaveTypes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public."leaveTypes_id_seq";
       public          root    false    207            �           0    0    leaveTypes_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public."leaveTypes_id_seq" OWNED BY public."leaveTypes".id;
          public          root    false    206            �            1259    17600    members    TABLE       CREATE TABLE public.members (
    id integer NOT NULL,
    "memberName" character varying(255) NOT NULL,
    "fkTenureId" integer NOT NULL,
    "memberStatus" public."enum_members_memberStatus" DEFAULT 'Active'::public."enum_members_memberStatus",
    "politicalParty" integer NOT NULL,
    "electionType" public."enum_members_electionType" NOT NULL,
    gender public.enum_members_gender NOT NULL,
    "isMinister" boolean DEFAULT true,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.members;
       public         heap    root    false    808    820    811    808            �            1259    17598    members_id_seq    SEQUENCE     �   CREATE SEQUENCE public.members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.members_id_seq;
       public          root    false    254            �           0    0    members_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.members_id_seq OWNED BY public.members.id;
          public          root    false    253                       1259    17815 
   ministries    TABLE     �   CREATE TABLE public.ministries (
    id integer NOT NULL,
    "ministryName" character varying(255) NOT NULL,
    "ministryStatus" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.ministries;
       public         heap    root    false                       1259    17813    ministries_id_seq    SEQUENCE     �   CREATE SEQUENCE public.ministries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.ministries_id_seq;
       public          root    false    262            �           0    0    ministries_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.ministries_id_seq OWNED BY public.ministries.id;
          public          root    false    261            �            1259    16951    modules    TABLE       CREATE TABLE public.modules (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "moduleStatus" character varying(255) DEFAULT 'active'::character varying NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.modules;
       public         heap    root    false            �            1259    16949    modules_id_seq    SEQUENCE     �   CREATE SEQUENCE public.modules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.modules_id_seq;
       public          root    false    226            �           0    0    modules_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.modules_id_seq OWNED BY public.modules.id;
          public          root    false    225                       1259    17826    motionMinistries    TABLE     �   CREATE TABLE public."motionMinistries" (
    id integer NOT NULL,
    "fkMinistryId" integer NOT NULL,
    "fkMotionId" integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 &   DROP TABLE public."motionMinistries";
       public         heap    root    false                       1259    17824    motionMinistries_id_seq    SEQUENCE     �   CREATE SEQUENCE public."motionMinistries_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public."motionMinistries_id_seq";
       public          root    false    264            �           0    0    motionMinistries_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public."motionMinistries_id_seq" OWNED BY public."motionMinistries".id;
          public          root    false    263                       1259    17765    motionMovers    TABLE     �   CREATE TABLE public."motionMovers" (
    id integer NOT NULL,
    "fkMotionId" integer NOT NULL,
    "fkMemberId" integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 "   DROP TABLE public."motionMovers";
       public         heap    root    false                       1259    17763    motionMovers_id_seq    SEQUENCE     �   CREATE SEQUENCE public."motionMovers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public."motionMovers_id_seq";
       public          root    false    260            �           0    0    motionMovers_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public."motionMovers_id_seq" OWNED BY public."motionMovers".id;
          public          root    false    259            
           1259    17844    motionStatusHistories    TABLE       CREATE TABLE public."motionStatusHistories" (
    id integer NOT NULL,
    "fkSessionId" integer NOT NULL,
    "fkMotionId" integer,
    date timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 +   DROP TABLE public."motionStatusHistories";
       public         heap    root    false            	           1259    17842    motionStatusHistories_id_seq    SEQUENCE     �   CREATE SEQUENCE public."motionStatusHistories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 5   DROP SEQUENCE public."motionStatusHistories_id_seq";
       public          root    false    266            �           0    0    motionStatusHistories_id_seq    SEQUENCE OWNED BY     a   ALTER SEQUENCE public."motionStatusHistories_id_seq" OWNED BY public."motionStatusHistories".id;
          public          root    false    265            �            1259    17400    motionStatuses    TABLE       CREATE TABLE public."motionStatuses" (
    id integer NOT NULL,
    "statusName" character varying(255) NOT NULL,
    description character varying(255),
    status boolean,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 $   DROP TABLE public."motionStatuses";
       public         heap    root    false            �            1259    17398    motionStatuses_id_seq    SEQUENCE     �   CREATE SEQUENCE public."motionStatuses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public."motionStatuses_id_seq";
       public          root    false    250            �           0    0    motionStatuses_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public."motionStatuses_id_seq" OWNED BY public."motionStatuses".id;
          public          root    false    249                       1259    17739    motions    TABLE       CREATE TABLE public.motions (
    id integer NOT NULL,
    "fkSessionId" integer,
    "fileNumber" character varying(255) NOT NULL,
    "motionType" public."enum_motions_motionType",
    "motionWeek" public."enum_motions_motionWeek",
    "fkDairyNumber" integer,
    image character varying(255),
    "englishText" character varying(255),
    "urduText" character varying(255),
    "fkMotionStatus" integer,
    "dateOfMovingHouse" timestamp with time zone NOT NULL,
    "dateOfDiscussion" timestamp with time zone NOT NULL,
    "dateOfReferringToSc" timestamp with time zone NOT NULL,
    note character varying(255),
    "sentForTranslation" boolean NOT NULL,
    "isTranslated" boolean NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.motions;
       public         heap    root    false    874    877                       1259    17737    motions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.motions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.motions_id_seq;
       public          root    false    258            �           0    0    motions_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.motions_id_seq OWNED BY public.motions.id;
          public          root    false    257                        1259    17675    noticeOfficeDairies    TABLE     �  CREATE TABLE public."noticeOfficeDairies" (
    id integer NOT NULL,
    "noticeOfficeDiaryNo" integer NOT NULL,
    "noticeOfficeDiaryDate" character varying(255) NOT NULL,
    "noticeOfficeDiaryTime" character varying(255) NOT NULL,
    "businessType" public."enum_noticeOfficeDairies_businessType" NOT NULL,
    "businessId" integer NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 )   DROP TABLE public."noticeOfficeDairies";
       public         heap    root    false    919            �            1259    17673    noticeOfficeDairies_id_seq    SEQUENCE     �   CREATE SEQUENCE public."noticeOfficeDairies_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public."noticeOfficeDairies_id_seq";
       public          root    false    256            �           0    0    noticeOfficeDairies_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE public."noticeOfficeDairies_id_seq" OWNED BY public."noticeOfficeDairies".id;
          public          root    false    255            �            1259    16795    passVisitors    TABLE     �   CREATE TABLE public."passVisitors" (
    id integer NOT NULL,
    "passId" integer,
    "visitorId" integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 "   DROP TABLE public."passVisitors";
       public         heap    root    false            �            1259    16793    passVisitors_id_seq    SEQUENCE     �   CREATE SEQUENCE public."passVisitors_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public."passVisitors_id_seq";
       public          root    false    220            �           0    0    passVisitors_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public."passVisitors_id_seq" OWNED BY public."passVisitors".id;
          public          root    false    219            �            1259    16767    passes    TABLE     o  CREATE TABLE public.passes (
    id integer NOT NULL,
    "passDate" character varying(255) NOT NULL,
    "requestedBy" character varying(255) NOT NULL,
    branch character varying(255),
    "visitPurpose" character varying(255) NOT NULL,
    "cardType" character varying(255),
    "companyName" character varying(255),
    "fromDate" character varying(255) NOT NULL,
    "toDate" character varying(255) NOT NULL,
    "allowOffDays" character varying(255)[],
    remarks character varying(255),
    "passStatus" character varying(255),
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.passes;
       public         heap    root    false            �            1259    16765    passes_id_seq    SEQUENCE     �   CREATE SEQUENCE public.passes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.passes_id_seq;
       public          root    false    216            �           0    0    passes_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.passes_id_seq OWNED BY public.passes.id;
          public          root    false    215            �            1259    16963    permissions    TABLE     ^  CREATE TABLE public.permissions (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "fkModuleId" integer,
    "permissionStatus" public."enum_permissions_permissionStatus" DEFAULT 'active'::public."enum_permissions_permissionStatus" NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.permissions;
       public         heap    root    false    773    773            �            1259    16961    permissions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.permissions_id_seq;
       public          root    false    228            �           0    0    permissions_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;
          public          root    false    227            �            1259    17389    politicalParties    TABLE     N  CREATE TABLE public."politicalParties" (
    id integer NOT NULL,
    "partyName" character varying(255) NOT NULL,
    description character varying(255) NOT NULL,
    "shortName" character varying(255) NOT NULL,
    status character varying(255),
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 &   DROP TABLE public."politicalParties";
       public         heap    root    false            �            1259    17387    politicalParties_id_seq    SEQUENCE     �   CREATE SEQUENCE public."politicalParties_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public."politicalParties_id_seq";
       public          root    false    248            �           0    0    politicalParties_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public."politicalParties_id_seq" OWNED BY public."politicalParties".id;
          public          root    false    247            �            1259    17084    questionCategories    TABLE     �   CREATE TABLE public."questionCategories" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "categoryStatus" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 (   DROP TABLE public."questionCategories";
       public         heap    root    false            �            1259    17082    questionCategories_id_seq    SEQUENCE     �   CREATE SEQUENCE public."questionCategories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public."questionCategories_id_seq";
       public          root    false    242            �           0    0    questionCategories_id_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public."questionCategories_id_seq" OWNED BY public."questionCategories".id;
          public          root    false    241                       1259    18096    questionDefers    TABLE     E  CREATE TABLE public."questionDefers" (
    id integer NOT NULL,
    "fkQuestionId" integer NOT NULL,
    "fkSessionId" integer NOT NULL,
    "deferredDate" character varying(255) NOT NULL,
    "defferedBy" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 $   DROP TABLE public."questionDefers";
       public         heap    root    false                       1259    18094    questionDefers_id_seq    SEQUENCE     �   CREATE SEQUENCE public."questionDefers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public."questionDefers_id_seq";
       public          root    false    282            �           0    0    questionDefers_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public."questionDefers_id_seq" OWNED BY public."questionDefers".id;
          public          root    false    281                       1259    18130    questionDiaries    TABLE     �   CREATE TABLE public."questionDiaries" (
    id integer NOT NULL,
    "questionID" integer NOT NULL,
    "questionDiaryNo" integer NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 %   DROP TABLE public."questionDiaries";
       public         heap    root    false                       1259    18128    questionDiaries_id_seq    SEQUENCE     �   CREATE SEQUENCE public."questionDiaries_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public."questionDiaries_id_seq";
       public          root    false    286            �           0    0    questionDiaries_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public."questionDiaries_id_seq" OWNED BY public."questionDiaries".id;
          public          root    false    285                       1259    18117    questionFiles    TABLE     �   CREATE TABLE public."questionFiles" (
    id integer NOT NULL,
    "fkQuestionId" integer NOT NULL,
    "fileStatus" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 #   DROP TABLE public."questionFiles";
       public         heap    root    false                       1259    18115    questionFiles_id_seq    SEQUENCE     �   CREATE SEQUENCE public."questionFiles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public."questionFiles_id_seq";
       public          root    false    284            �           0    0    questionFiles_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public."questionFiles_id_seq" OWNED BY public."questionFiles".id;
          public          root    false    283                        1259    18138    questionRevivals    TABLE     �  CREATE TABLE public."questionRevivals" (
    id integer NOT NULL,
    "fkQuestionId" integer NOT NULL,
    "fkSessionId" integer NOT NULL,
    "fkGroupId" integer NOT NULL,
    "fkDivisionId" integer NOT NULL,
    "fkNoticeDiaryNo" integer NOT NULL,
    "fkQuestionStatus" integer NOT NULL,
    "fkQuestionDiaryId" integer NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 &   DROP TABLE public."questionRevivals";
       public         heap    root    false                       1259    18136    questionRevivals_id_seq    SEQUENCE     �   CREATE SEQUENCE public."questionRevivals_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public."questionRevivals_id_seq";
       public          root    false    288            �           0    0    questionRevivals_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public."questionRevivals_id_seq" OWNED BY public."questionRevivals".id;
          public          root    false    287            �            1259    17095    questionStatuses    TABLE       CREATE TABLE public."questionStatuses" (
    id integer NOT NULL,
    "questionStatus" character varying(255) NOT NULL,
    "questionActive" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 &   DROP TABLE public."questionStatuses";
       public         heap    root    false            �            1259    17093    questionStatuses_id_seq    SEQUENCE     �   CREATE SEQUENCE public."questionStatuses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public."questionStatuses_id_seq";
       public          root    false    244            �           0    0    questionStatuses_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public."questionStatuses_id_seq" OWNED BY public."questionStatuses".id;
          public          root    false    243                       1259    18073 	   questions    TABLE     �   CREATE TABLE public.questions (
    id integer NOT NULL,
    "fkSessionId" integer NOT NULL,
    "fkDivisionId" integer NOT NULL,
    "fkGroupId" integer NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.questions;
       public         heap    root    false                       1259    18071    questions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.questions_id_seq;
       public          root    false    280            �           0    0    questions_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;
          public          root    false    279            �            1259    16567    requestLeaves    TABLE     �  CREATE TABLE public."requestLeaves" (
    id integer NOT NULL,
    "fkRequestTypeId" integer,
    "fkUserId" integer,
    "requestStartDate" timestamp with time zone NOT NULL,
    "requestEndDate" timestamp with time zone NOT NULL,
    "requestStatus" public."enum_requestLeaves_requestStatus" DEFAULT 'pending'::public."enum_requestLeaves_requestStatus",
    "requestLeaveSubType" public."enum_requestLeaves_requestLeaveSubType" DEFAULT 'postApproved'::public."enum_requestLeaves_requestLeaveSubType",
    "requestLeaveReason" character varying(255),
    "requestNumberOfDays" character varying(255),
    "requestStationLeave" boolean NOT NULL,
    "requestLeaveAttachment" character varying(255),
    "requestLeaveSubmittedTo" character varying(255),
    "requestLeaveApplyOnBehalf" boolean,
    "requestLeaveForwarder" character varying(255),
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 #   DROP TABLE public."requestLeaves";
       public         heap    root    false    736    739    739    736            �            1259    16565    requestLeaves_id_seq    SEQUENCE     �   CREATE SEQUENCE public."requestLeaves_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public."requestLeaves_id_seq";
       public          root    false    209            �           0    0    requestLeaves_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public."requestLeaves_id_seq" OWNED BY public."requestLeaves".id;
          public          root    false    208                       1259    17918    resolutionDiaries    TABLE     �   CREATE TABLE public."resolutionDiaries" (
    id integer NOT NULL,
    "resolutionId" integer NOT NULL,
    "resolutionDiaryNo" integer NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 '   DROP TABLE public."resolutionDiaries";
       public         heap    root    false                       1259    17916    resolutionDiaries_id_seq    SEQUENCE     �   CREATE SEQUENCE public."resolutionDiaries_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public."resolutionDiaries_id_seq";
       public          root    false    270            �           0    0    resolutionDiaries_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE public."resolutionDiaries_id_seq" OWNED BY public."resolutionDiaries".id;
          public          root    false    269                       1259    18030    resolutionMovers    TABLE     �   CREATE TABLE public."resolutionMovers" (
    id integer NOT NULL,
    "fkResolutionId" integer NOT NULL,
    "fkMemberId" integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 &   DROP TABLE public."resolutionMovers";
       public         heap    root    false                       1259    18028    resolutionMovers_id_seq    SEQUENCE     �   CREATE SEQUENCE public."resolutionMovers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public."resolutionMovers_id_seq";
       public          root    false    274            �           0    0    resolutionMovers_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public."resolutionMovers_id_seq" OWNED BY public."resolutionMovers".id;
          public          root    false    273                       1259    17862    resolutionStatuses    TABLE     �   CREATE TABLE public."resolutionStatuses" (
    id integer NOT NULL,
    "resolutionStatus" character varying(255) NOT NULL,
    "resolutionActive" boolean NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 (   DROP TABLE public."resolutionStatuses";
       public         heap    root    false                       1259    17860    resolutionStatuses_id_seq    SEQUENCE     �   CREATE SEQUENCE public."resolutionStatuses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public."resolutionStatuses_id_seq";
       public          root    false    268            �           0    0    resolutionStatuses_id_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public."resolutionStatuses_id_seq" OWNED BY public."resolutionStatuses".id;
          public          root    false    267                       1259    17999    resolutions    TABLE     �  CREATE TABLE public.resolutions (
    id integer NOT NULL,
    "fkSessionNo" integer NOT NULL,
    "fkResolutionDairyId" integer NOT NULL,
    "fkNoticeOfficeDairyId" integer NOT NULL,
    "colourResNo" integer,
    "resolutionType" public."enum_resolutions_resolutionType" NOT NULL,
    "fkResolutionStatus" integer NOT NULL,
    attachment character varying(255),
    "englishText" text NOT NULL,
    "urduText" text NOT NULL,
    "dateOfMovingHouse" character varying(255) NOT NULL,
    "dateOfDiscussion" character varying(255) NOT NULL,
    "dateOfPassing" character varying(255) NOT NULL,
    "sentForTranslation" boolean NOT NULL,
    "isTranslated" boolean NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.resolutions;
       public         heap    root    false    871                       1259    17997    resolutions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.resolutions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.resolutions_id_seq;
       public          root    false    272            �           0    0    resolutions_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.resolutions_id_seq OWNED BY public.resolutions.id;
          public          root    false    271            �            1259    16395    roles    TABLE     ?  CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255),
    "roleStatus" public."enum_roles_roleStatus" DEFAULT 'active'::public."enum_roles_roleStatus",
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.roles;
       public         heap    root    false    622    622            �            1259    16462    rolesPermissions    TABLE     �   CREATE TABLE public."rolesPermissions" (
    id integer NOT NULL,
    "roleId" integer,
    "permissionId" integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 &   DROP TABLE public."rolesPermissions";
       public         heap    root    false            �            1259    16460    rolesPermissions_id_seq    SEQUENCE     �   CREATE SEQUENCE public."rolesPermissions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public."rolesPermissions_id_seq";
       public          root    false    205            �           0    0    rolesPermissions_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public."rolesPermissions_id_seq" OWNED BY public."rolesPermissions".id;
          public          root    false    204            �            1259    16393    roles_id_seq    SEQUENCE     �   CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.roles_id_seq;
       public          root    false    203            �           0    0    roles_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;
          public          root    false    202            �            1259    17303    sessions    TABLE       CREATE TABLE public.sessions (
    id integer NOT NULL,
    "sessionNo" integer NOT NULL,
    "sessionType" character varying(255) NOT NULL,
    questions public.enum_sessions_questions NOT NULL,
    motions public.enum_sessions_motions NOT NULL,
    resolutions public.enum_sessions_resolutions NOT NULL,
    "carryForwardSessions" integer[],
    "startDate" character varying(255) NOT NULL,
    "prorogationDate" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.sessions;
       public         heap    root    false    934    928    931            �            1259    17301    sessions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.sessions_id_seq;
       public          root    false    246            �           0    0    sessions_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;
          public          root    false    245            �            1259    17574    tenures    TABLE     D  CREATE TABLE public.tenures (
    id integer NOT NULL,
    "tenureName" character varying(255) NOT NULL,
    "fromDate" timestamp with time zone NOT NULL,
    "toDate" timestamp with time zone NOT NULL,
    status character varying(255),
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.tenures;
       public         heap    root    false            �            1259    17572    tenures_id_seq    SEQUENCE     �   CREATE SEQUENCE public.tenures_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.tenures_id_seq;
       public          root    false    252            �           0    0    tenures_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.tenures_id_seq OWNED BY public.tenures.id;
          public          root    false    251            �            1259    17025    userSessions    TABLE     L  CREATE TABLE public."userSessions" (
    id integer NOT NULL,
    "userId" integer,
    "ipAddress" character varying(255),
    "loggedInAt" timestamp with time zone,
    tokens character varying(255),
    status character varying(255) NOT NULL,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
 "   DROP TABLE public."userSessions";
       public         heap    root    false            �            1259    17023    userSessions_id_seq    SEQUENCE     �   CREATE SEQUENCE public."userSessions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public."userSessions_id_seq";
       public          root    false    236            �           0    0    userSessions_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public."userSessions_id_seq" OWNED BY public."userSessions".id;
          public          root    false    235            �            1259    16842    users_id_seq    SEQUENCE     u   CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          root    false            �            1259    16844    users    TABLE     �  CREATE TABLE public.users (
    id integer DEFAULT nextval('public.users_id_seq'::regclass) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    "userStatus" public."enum_users_userStatus" DEFAULT 'active'::public."enum_users_userStatus" NOT NULL,
    "loginAttempts" integer DEFAULT 3,
    "fkRoleId" integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.users;
       public         heap    root    false    222    770    770            �            1259    16749    usersPermissions    TABLE     �   CREATE TABLE public."usersPermissions" (
    id integer NOT NULL,
    "userId" integer,
    "permissionId" integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 &   DROP TABLE public."usersPermissions";
       public         heap    root    false            �            1259    16747    usersPermissions_id_seq    SEQUENCE     �   CREATE SEQUENCE public."usersPermissions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public."usersPermissions_id_seq";
       public          root    false    214                        0    0    usersPermissions_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public."usersPermissions_id_seq" OWNED BY public."usersPermissions".id;
          public          root    false    213            �            1259    17054 
   usersRoles    TABLE     �   CREATE TABLE public."usersRoles" (
    id integer NOT NULL,
    "userId" integer,
    "roleId" integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
     DROP TABLE public."usersRoles";
       public         heap    root    false            �            1259    17052    usersRoles_id_seq    SEQUENCE     �   CREATE SEQUENCE public."usersRoles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public."usersRoles_id_seq";
       public          root    false    240                       0    0    usersRoles_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public."usersRoles_id_seq" OWNED BY public."usersRoles".id;
          public          root    false    239            �            1259    16862    usersessions_id_seq    SEQUENCE     |   CREATE SEQUENCE public.usersessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.usersessions_id_seq;
       public          root    false            �            1259    16783    visitors    TABLE     �  CREATE TABLE public.visitors (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    cnic character varying(255) NOT NULL,
    details character varying(255) NOT NULL,
    "visitorStatus" public."enum_visitors_visitorStatus" DEFAULT 'active'::public."enum_visitors_visitorStatus" NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.visitors;
       public         heap    root    false    785    785            �            1259    16781    visitors_id_seq    SEQUENCE     �   CREATE SEQUENCE public.visitors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.visitors_id_seq;
       public          root    false    218                       0    0    visitors_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.visitors_id_seq OWNED BY public.visitors.id;
          public          root    false    217            ^           2604    17045    Departments id    DEFAULT     t   ALTER TABLE ONLY public."Departments" ALTER COLUMN id SET DEFAULT nextval('public."Departments_id_seq"'::regclass);
 ?   ALTER TABLE public."Departments" ALTER COLUMN id DROP DEFAULT;
       public          root    false    237    238    238            Z           2604    16980    departments id    DEFAULT     q   ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq1'::regclass);
 =   ALTER TABLE public.departments ALTER COLUMN id DROP DEFAULT;
       public          root    false    229    230    230            [           2604    16991    designations id    DEFAULT     r   ALTER TABLE ONLY public.designations ALTER COLUMN id SET DEFAULT nextval('public.designations_id_seq'::regclass);
 >   ALTER TABLE public.designations ALTER COLUMN id DROP DEFAULT;
       public          root    false    231    232    232            t           2604    18052    divisions id    DEFAULT     l   ALTER TABLE ONLY public.divisions ALTER COLUMN id SET DEFAULT nextval('public.divisions_id_seq'::regclass);
 ;   ALTER TABLE public.divisions ALTER COLUMN id DROP DEFAULT;
       public          root    false    275    276    276            \           2604    17002    employees id    DEFAULT     m   ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq1'::regclass);
 ;   ALTER TABLE public.employees ALTER COLUMN id DROP DEFAULT;
       public          root    false    234    233    234            u           2604    18065 	   groups id    DEFAULT     f   ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);
 8   ALTER TABLE public.groups ALTER COLUMN id DROP DEFAULT;
       public          root    false    277    278    278            M           2604    16593    leaveComments id    DEFAULT     x   ALTER TABLE ONLY public."leaveComments" ALTER COLUMN id SET DEFAULT nextval('public."leaveComments_id_seq"'::regclass);
 A   ALTER TABLE public."leaveComments" ALTER COLUMN id DROP DEFAULT;
       public          root    false    210    211    211            H           2604    16536    leaveTypes id    DEFAULT     r   ALTER TABLE ONLY public."leaveTypes" ALTER COLUMN id SET DEFAULT nextval('public."leaveTypes_id_seq"'::regclass);
 >   ALTER TABLE public."leaveTypes" ALTER COLUMN id DROP DEFAULT;
       public          root    false    207    206    207            g           2604    17603 
   members id    DEFAULT     h   ALTER TABLE ONLY public.members ALTER COLUMN id SET DEFAULT nextval('public.members_id_seq'::regclass);
 9   ALTER TABLE public.members ALTER COLUMN id DROP DEFAULT;
       public          root    false    253    254    254            m           2604    17818    ministries id    DEFAULT     n   ALTER TABLE ONLY public.ministries ALTER COLUMN id SET DEFAULT nextval('public.ministries_id_seq'::regclass);
 <   ALTER TABLE public.ministries ALTER COLUMN id DROP DEFAULT;
       public          root    false    262    261    262            V           2604    16954 
   modules id    DEFAULT     h   ALTER TABLE ONLY public.modules ALTER COLUMN id SET DEFAULT nextval('public.modules_id_seq'::regclass);
 9   ALTER TABLE public.modules ALTER COLUMN id DROP DEFAULT;
       public          root    false    225    226    226            n           2604    17829    motionMinistries id    DEFAULT     ~   ALTER TABLE ONLY public."motionMinistries" ALTER COLUMN id SET DEFAULT nextval('public."motionMinistries_id_seq"'::regclass);
 D   ALTER TABLE public."motionMinistries" ALTER COLUMN id DROP DEFAULT;
       public          root    false    264    263    264            l           2604    17768    motionMovers id    DEFAULT     v   ALTER TABLE ONLY public."motionMovers" ALTER COLUMN id SET DEFAULT nextval('public."motionMovers_id_seq"'::regclass);
 @   ALTER TABLE public."motionMovers" ALTER COLUMN id DROP DEFAULT;
       public          root    false    259    260    260            o           2604    17847    motionStatusHistories id    DEFAULT     �   ALTER TABLE ONLY public."motionStatusHistories" ALTER COLUMN id SET DEFAULT nextval('public."motionStatusHistories_id_seq"'::regclass);
 I   ALTER TABLE public."motionStatusHistories" ALTER COLUMN id DROP DEFAULT;
       public          root    false    265    266    266            e           2604    17403    motionStatuses id    DEFAULT     z   ALTER TABLE ONLY public."motionStatuses" ALTER COLUMN id SET DEFAULT nextval('public."motionStatuses_id_seq"'::regclass);
 B   ALTER TABLE public."motionStatuses" ALTER COLUMN id DROP DEFAULT;
       public          root    false    249    250    250            k           2604    17742 
   motions id    DEFAULT     h   ALTER TABLE ONLY public.motions ALTER COLUMN id SET DEFAULT nextval('public.motions_id_seq'::regclass);
 9   ALTER TABLE public.motions ALTER COLUMN id DROP DEFAULT;
       public          root    false    257    258    258            j           2604    17678    noticeOfficeDairies id    DEFAULT     �   ALTER TABLE ONLY public."noticeOfficeDairies" ALTER COLUMN id SET DEFAULT nextval('public."noticeOfficeDairies_id_seq"'::regclass);
 G   ALTER TABLE public."noticeOfficeDairies" ALTER COLUMN id DROP DEFAULT;
       public          root    false    255    256    256            R           2604    16798    passVisitors id    DEFAULT     v   ALTER TABLE ONLY public."passVisitors" ALTER COLUMN id SET DEFAULT nextval('public."passVisitors_id_seq"'::regclass);
 @   ALTER TABLE public."passVisitors" ALTER COLUMN id DROP DEFAULT;
       public          root    false    219    220    220            O           2604    16770 	   passes id    DEFAULT     f   ALTER TABLE ONLY public.passes ALTER COLUMN id SET DEFAULT nextval('public.passes_id_seq'::regclass);
 8   ALTER TABLE public.passes ALTER COLUMN id DROP DEFAULT;
       public          root    false    215    216    216            X           2604    16966    permissions id    DEFAULT     p   ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);
 =   ALTER TABLE public.permissions ALTER COLUMN id DROP DEFAULT;
       public          root    false    228    227    228            d           2604    17392    politicalParties id    DEFAULT     ~   ALTER TABLE ONLY public."politicalParties" ALTER COLUMN id SET DEFAULT nextval('public."politicalParties_id_seq"'::regclass);
 D   ALTER TABLE public."politicalParties" ALTER COLUMN id DROP DEFAULT;
       public          root    false    247    248    248            a           2604    17087    questionCategories id    DEFAULT     �   ALTER TABLE ONLY public."questionCategories" ALTER COLUMN id SET DEFAULT nextval('public."questionCategories_id_seq"'::regclass);
 F   ALTER TABLE public."questionCategories" ALTER COLUMN id DROP DEFAULT;
       public          root    false    241    242    242            w           2604    18099    questionDefers id    DEFAULT     z   ALTER TABLE ONLY public."questionDefers" ALTER COLUMN id SET DEFAULT nextval('public."questionDefers_id_seq"'::regclass);
 B   ALTER TABLE public."questionDefers" ALTER COLUMN id DROP DEFAULT;
       public          root    false    282    281    282            y           2604    18133    questionDiaries id    DEFAULT     |   ALTER TABLE ONLY public."questionDiaries" ALTER COLUMN id SET DEFAULT nextval('public."questionDiaries_id_seq"'::regclass);
 C   ALTER TABLE public."questionDiaries" ALTER COLUMN id DROP DEFAULT;
       public          root    false    285    286    286            x           2604    18120    questionFiles id    DEFAULT     x   ALTER TABLE ONLY public."questionFiles" ALTER COLUMN id SET DEFAULT nextval('public."questionFiles_id_seq"'::regclass);
 A   ALTER TABLE public."questionFiles" ALTER COLUMN id DROP DEFAULT;
       public          root    false    283    284    284            z           2604    18141    questionRevivals id    DEFAULT     ~   ALTER TABLE ONLY public."questionRevivals" ALTER COLUMN id SET DEFAULT nextval('public."questionRevivals_id_seq"'::regclass);
 D   ALTER TABLE public."questionRevivals" ALTER COLUMN id DROP DEFAULT;
       public          root    false    287    288    288            b           2604    17098    questionStatuses id    DEFAULT     ~   ALTER TABLE ONLY public."questionStatuses" ALTER COLUMN id SET DEFAULT nextval('public."questionStatuses_id_seq"'::regclass);
 D   ALTER TABLE public."questionStatuses" ALTER COLUMN id DROP DEFAULT;
       public          root    false    244    243    244            v           2604    18076    questions id    DEFAULT     l   ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);
 ;   ALTER TABLE public.questions ALTER COLUMN id DROP DEFAULT;
       public          root    false    280    279    280            J           2604    16570    requestLeaves id    DEFAULT     x   ALTER TABLE ONLY public."requestLeaves" ALTER COLUMN id SET DEFAULT nextval('public."requestLeaves_id_seq"'::regclass);
 A   ALTER TABLE public."requestLeaves" ALTER COLUMN id DROP DEFAULT;
       public          root    false    208    209    209            q           2604    17921    resolutionDiaries id    DEFAULT     �   ALTER TABLE ONLY public."resolutionDiaries" ALTER COLUMN id SET DEFAULT nextval('public."resolutionDiaries_id_seq"'::regclass);
 E   ALTER TABLE public."resolutionDiaries" ALTER COLUMN id DROP DEFAULT;
       public          root    false    270    269    270            s           2604    18033    resolutionMovers id    DEFAULT     ~   ALTER TABLE ONLY public."resolutionMovers" ALTER COLUMN id SET DEFAULT nextval('public."resolutionMovers_id_seq"'::regclass);
 D   ALTER TABLE public."resolutionMovers" ALTER COLUMN id DROP DEFAULT;
       public          root    false    274    273    274            p           2604    17865    resolutionStatuses id    DEFAULT     �   ALTER TABLE ONLY public."resolutionStatuses" ALTER COLUMN id SET DEFAULT nextval('public."resolutionStatuses_id_seq"'::regclass);
 F   ALTER TABLE public."resolutionStatuses" ALTER COLUMN id DROP DEFAULT;
       public          root    false    268    267    268            r           2604    18002    resolutions id    DEFAULT     p   ALTER TABLE ONLY public.resolutions ALTER COLUMN id SET DEFAULT nextval('public.resolutions_id_seq'::regclass);
 =   ALTER TABLE public.resolutions ALTER COLUMN id DROP DEFAULT;
       public          root    false    271    272    272            E           2604    16398    roles id    DEFAULT     d   ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);
 7   ALTER TABLE public.roles ALTER COLUMN id DROP DEFAULT;
       public          root    false    203    202    203            G           2604    16465    rolesPermissions id    DEFAULT     ~   ALTER TABLE ONLY public."rolesPermissions" ALTER COLUMN id SET DEFAULT nextval('public."rolesPermissions_id_seq"'::regclass);
 D   ALTER TABLE public."rolesPermissions" ALTER COLUMN id DROP DEFAULT;
       public          root    false    204    205    205            c           2604    17306    sessions id    DEFAULT     j   ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);
 :   ALTER TABLE public.sessions ALTER COLUMN id DROP DEFAULT;
       public          root    false    246    245    246            f           2604    17577 
   tenures id    DEFAULT     h   ALTER TABLE ONLY public.tenures ALTER COLUMN id SET DEFAULT nextval('public.tenures_id_seq'::regclass);
 9   ALTER TABLE public.tenures ALTER COLUMN id DROP DEFAULT;
       public          root    false    252    251    252            ]           2604    17028    userSessions id    DEFAULT     v   ALTER TABLE ONLY public."userSessions" ALTER COLUMN id SET DEFAULT nextval('public."userSessions_id_seq"'::regclass);
 @   ALTER TABLE public."userSessions" ALTER COLUMN id DROP DEFAULT;
       public          root    false    235    236    236            N           2604    16752    usersPermissions id    DEFAULT     ~   ALTER TABLE ONLY public."usersPermissions" ALTER COLUMN id SET DEFAULT nextval('public."usersPermissions_id_seq"'::regclass);
 D   ALTER TABLE public."usersPermissions" ALTER COLUMN id DROP DEFAULT;
       public          root    false    213    214    214            `           2604    17057    usersRoles id    DEFAULT     r   ALTER TABLE ONLY public."usersRoles" ALTER COLUMN id SET DEFAULT nextval('public."usersRoles_id_seq"'::regclass);
 >   ALTER TABLE public."usersRoles" ALTER COLUMN id DROP DEFAULT;
       public          root    false    239    240    240            P           2604    16786    visitors id    DEFAULT     j   ALTER TABLE ONLY public.visitors ALTER COLUMN id SET DEFAULT nextval('public.visitors_id_seq'::regclass);
 :   ALTER TABLE public.visitors ALTER COLUMN id DROP DEFAULT;
       public          root    false    217    218    218            �          0    17042    Departments 
   TABLE DATA           �   COPY public."Departments" (id, "departmentName", description, "departmentDate", "departmentStatus", "createdAt", "updatedAt") FROM stdin;
    public          root    false    238   m�      �          0    16977    departments 
   TABLE DATA           v   COPY public.departments (id, "departmentName", description, "departmentStatus", "createdAt", "updatedAt") FROM stdin;
    public          root    false    230   ��      �          0    16988    designations 
   TABLE DATA           y   COPY public.designations (id, "designationName", description, "designationStatus", "createdAt", "updatedAt") FROM stdin;
    public          root    false    232   ��      �          0    18049 	   divisions 
   TABLE DATA           s   COPY public.divisions (id, "divisionName", "fkMinistryId", "divisionStatus", "createdAt", "updatedAt") FROM stdin;
    public          root    false    276   0�      �          0    16999 	   employees 
   TABLE DATA           �   COPY public.employees (id, "firstName", "lastName", "userName", "phoneNo", gender, "fileNumber", "profileImage", supervisor, "fkUserId", "fkDepartmentId", "fkDesignationId", "createdAt", "updatedAt") FROM stdin;
    public          root    false    234   M�      �          0    18062    groups 
   TABLE DATA           y   COPY public.groups (id, "groupNameStarred", "groupSequence", "groupNameUnstarred", "createdAt", "updatedAt") FROM stdin;
    public          root    false    278   ��      �          0    16590    leaveComments 
   TABLE DATA           z   COPY public."leaveComments" (id, "leaveComment", "fkRequestLeaveId", "commentedBy", "createdAt", "updatedAt") FROM stdin;
    public          root    false    211   ��      �          0    16533 
   leaveTypes 
   TABLE DATA           {   COPY public."leaveTypes" (id, "leaveType", "fkRoleId", "leavesCount", "leaveStatus", "createdAt", "updatedAt") FROM stdin;
    public          root    false    207   k�      �          0    17600    members 
   TABLE DATA           �   COPY public.members (id, "memberName", "fkTenureId", "memberStatus", "politicalParty", "electionType", gender, "isMinister", "createdAt", "updatedAt") FROM stdin;
    public          root    false    254   ��      �          0    17815 
   ministries 
   TABLE DATA           d   COPY public.ministries (id, "ministryName", "ministryStatus", "createdAt", "updatedAt") FROM stdin;
    public          root    false    262   ��      �          0    16951    modules 
   TABLE DATA           U   COPY public.modules (id, name, "moduleStatus", "createdAt", "updatedAt") FROM stdin;
    public          root    false    226   ��      �          0    17826    motionMinistries 
   TABLE DATA           h   COPY public."motionMinistries" (id, "fkMinistryId", "fkMotionId", "createdAt", "updatedAt") FROM stdin;
    public          root    false    264   7�      �          0    17765    motionMovers 
   TABLE DATA           b   COPY public."motionMovers" (id, "fkMotionId", "fkMemberId", "createdAt", "updatedAt") FROM stdin;
    public          root    false    260   T�      �          0    17844    motionStatusHistories 
   TABLE DATA           r   COPY public."motionStatusHistories" (id, "fkSessionId", "fkMotionId", date, "createdAt", "updatedAt") FROM stdin;
    public          root    false    266   q�      �          0    17400    motionStatuses 
   TABLE DATA           k   COPY public."motionStatuses" (id, "statusName", description, status, "createdAt", "updatedAt") FROM stdin;
    public          root    false    250   ��      �          0    17739    motions 
   TABLE DATA           )  COPY public.motions (id, "fkSessionId", "fileNumber", "motionType", "motionWeek", "fkDairyNumber", image, "englishText", "urduText", "fkMotionStatus", "dateOfMovingHouse", "dateOfDiscussion", "dateOfReferringToSc", note, "sentForTranslation", "isTranslated", "createdAt", "updatedAt") FROM stdin;
    public          root    false    258   ��      �          0    17675    noticeOfficeDairies 
   TABLE DATA           �   COPY public."noticeOfficeDairies" (id, "noticeOfficeDiaryNo", "noticeOfficeDiaryDate", "noticeOfficeDiaryTime", "businessType", "businessId", "createdAt", "updatedAt") FROM stdin;
    public          root    false    256   ��      �          0    16795    passVisitors 
   TABLE DATA           ]   COPY public."passVisitors" (id, "passId", "visitorId", "createdAt", "updatedAt") FROM stdin;
    public          root    false    220   ��      �          0    16767    passes 
   TABLE DATA           �   COPY public.passes (id, "passDate", "requestedBy", branch, "visitPurpose", "cardType", "companyName", "fromDate", "toDate", "allowOffDays", remarks, "passStatus", "createdAt", "updatedAt") FROM stdin;
    public          root    false    216   �      �          0    16963    permissions 
   TABLE DATA           k   COPY public.permissions (id, name, "fkModuleId", "permissionStatus", "createdAt", "updatedAt") FROM stdin;
    public          root    false    228   �      �          0    17389    politicalParties 
   TABLE DATA           y   COPY public."politicalParties" (id, "partyName", description, "shortName", status, "createdAt", "updatedAt") FROM stdin;
    public          root    false    248   \�      �          0    17084    questionCategories 
   TABLE DATA           d   COPY public."questionCategories" (id, name, "categoryStatus", "createdAt", "updatedAt") FROM stdin;
    public          root    false    242   y�      �          0    18096    questionDefers 
   TABLE DATA           �   COPY public."questionDefers" (id, "fkQuestionId", "fkSessionId", "deferredDate", "defferedBy", "createdAt", "updatedAt") FROM stdin;
    public          root    false    282   ��      �          0    18130    questionDiaries 
   TABLE DATA           j   COPY public."questionDiaries" (id, "questionID", "questionDiaryNo", "createdAt", "updatedAt") FROM stdin;
    public          root    false    286   ��      �          0    18117    questionFiles 
   TABLE DATA           e   COPY public."questionFiles" (id, "fkQuestionId", "fileStatus", "createdAt", "updatedAt") FROM stdin;
    public          root    false    284   ��      �          0    18138    questionRevivals 
   TABLE DATA           �   COPY public."questionRevivals" (id, "fkQuestionId", "fkSessionId", "fkGroupId", "fkDivisionId", "fkNoticeDiaryNo", "fkQuestionStatus", "fkQuestionDiaryId", "createdAt", "updatedAt") FROM stdin;
    public          root    false    288   ��      �          0    17095    questionStatuses 
   TABLE DATA           n   COPY public."questionStatuses" (id, "questionStatus", "questionActive", "createdAt", "updatedAt") FROM stdin;
    public          root    false    244   
�      �          0    18073 	   questions 
   TABLE DATA           m   COPY public.questions (id, "fkSessionId", "fkDivisionId", "fkGroupId", "createdAt", "updatedAt") FROM stdin;
    public          root    false    280   '�      �          0    16567    requestLeaves 
   TABLE DATA           c  COPY public."requestLeaves" (id, "fkRequestTypeId", "fkUserId", "requestStartDate", "requestEndDate", "requestStatus", "requestLeaveSubType", "requestLeaveReason", "requestNumberOfDays", "requestStationLeave", "requestLeaveAttachment", "requestLeaveSubmittedTo", "requestLeaveApplyOnBehalf", "requestLeaveForwarder", "createdAt", "updatedAt") FROM stdin;
    public          root    false    209   D�      �          0    17918    resolutionDiaries 
   TABLE DATA           p   COPY public."resolutionDiaries" (id, "resolutionId", "resolutionDiaryNo", "createdAt", "updatedAt") FROM stdin;
    public          root    false    270   ��      �          0    18030    resolutionMovers 
   TABLE DATA           j   COPY public."resolutionMovers" (id, "fkResolutionId", "fkMemberId", "createdAt", "updatedAt") FROM stdin;
    public          root    false    274   ��      �          0    17862    resolutionStatuses 
   TABLE DATA           t   COPY public."resolutionStatuses" (id, "resolutionStatus", "resolutionActive", "createdAt", "updatedAt") FROM stdin;
    public          root    false    268   ��      �          0    17999    resolutions 
   TABLE DATA           @  COPY public.resolutions (id, "fkSessionNo", "fkResolutionDairyId", "fkNoticeOfficeDairyId", "colourResNo", "resolutionType", "fkResolutionStatus", attachment, "englishText", "urduText", "dateOfMovingHouse", "dateOfDiscussion", "dateOfPassing", "sentForTranslation", "isTranslated", "createdAt", "updatedAt") FROM stdin;
    public          root    false    272   �      }          0    16395    roles 
   TABLE DATA           ^   COPY public.roles (id, name, description, "roleStatus", "createdAt", "updatedAt") FROM stdin;
    public          root    false    203   9�                0    16462    rolesPermissions 
   TABLE DATA           d   COPY public."rolesPermissions" (id, "roleId", "permissionId", "createdAt", "updatedAt") FROM stdin;
    public          root    false    205   ��      �          0    17303    sessions 
   TABLE DATA           �   COPY public.sessions (id, "sessionNo", "sessionType", questions, motions, resolutions, "carryForwardSessions", "startDate", "prorogationDate", "createdAt", "updatedAt") FROM stdin;
    public          root    false    246   ��      �          0    17574    tenures 
   TABLE DATA           k   COPY public.tenures (id, "tenureName", "fromDate", "toDate", status, "createdAt", "updatedAt") FROM stdin;
    public          root    false    252   ��      �          0    17025    userSessions 
   TABLE DATA           {   COPY public."userSessions" (id, "userId", "ipAddress", "loggedInAt", tokens, status, "updatedAt", "createdAt") FROM stdin;
    public          root    false    236   ��      �          0    16844    users 
   TABLE DATA           y   COPY public.users (id, email, password, "userStatus", "loginAttempts", "fkRoleId", "createdAt", "updatedAt") FROM stdin;
    public          root    false    223   g�      �          0    16749    usersPermissions 
   TABLE DATA           d   COPY public."usersPermissions" (id, "userId", "permissionId", "createdAt", "updatedAt") FROM stdin;
    public          root    false    214   �      �          0    17054 
   usersRoles 
   TABLE DATA           X   COPY public."usersRoles" (id, "userId", "roleId", "createdAt", "updatedAt") FROM stdin;
    public          root    false    240   C�      �          0    16783    visitors 
   TABLE DATA           f   COPY public.visitors (id, name, cnic, details, "visitorStatus", "createdAt", "updatedAt") FROM stdin;
    public          root    false    218   `�                 0    0    Departments_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public."Departments_id_seq"', 1, false);
          public          root    false    237                       0    0    departments_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.departments_id_seq', 1, false);
          public          root    false    221                       0    0    departments_id_seq1    SEQUENCE SET     B   SELECT pg_catalog.setval('public.departments_id_seq1', 1, false);
          public          root    false    229                       0    0    designations_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.designations_id_seq', 1, false);
          public          root    false    231                       0    0    divisions_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.divisions_id_seq', 1, false);
          public          root    false    275                       0    0    employees_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.employees_id_seq', 1, false);
          public          root    false    212            	           0    0    employees_id_seq1    SEQUENCE SET     @   SELECT pg_catalog.setval('public.employees_id_seq1', 1, false);
          public          root    false    233            
           0    0    groups_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.groups_id_seq', 1, false);
          public          root    false    277                       0    0    leaveComments_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public."leaveComments_id_seq"', 5, true);
          public          root    false    210                       0    0    leaveTypes_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public."leaveTypes_id_seq"', 1, false);
          public          root    false    206                       0    0    members_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.members_id_seq', 1, false);
          public          root    false    253                       0    0    ministries_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.ministries_id_seq', 1, false);
          public          root    false    261                       0    0    modules_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.modules_id_seq', 1, false);
          public          root    false    225                       0    0    motionMinistries_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public."motionMinistries_id_seq"', 1, false);
          public          root    false    263                       0    0    motionMovers_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public."motionMovers_id_seq"', 1, false);
          public          root    false    259                       0    0    motionStatusHistories_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('public."motionStatusHistories_id_seq"', 1, false);
          public          root    false    265                       0    0    motionStatuses_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public."motionStatuses_id_seq"', 1, false);
          public          root    false    249                       0    0    motions_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.motions_id_seq', 1, false);
          public          root    false    257                       0    0    noticeOfficeDairies_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public."noticeOfficeDairies_id_seq"', 1, false);
          public          root    false    255                       0    0    passVisitors_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public."passVisitors_id_seq"', 1, false);
          public          root    false    219                       0    0    passes_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.passes_id_seq', 1, false);
          public          root    false    215                       0    0    permissions_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.permissions_id_seq', 1, false);
          public          root    false    227                       0    0    politicalParties_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public."politicalParties_id_seq"', 1, false);
          public          root    false    247                       0    0    questionCategories_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public."questionCategories_id_seq"', 1, false);
          public          root    false    241                       0    0    questionDefers_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public."questionDefers_id_seq"', 1, false);
          public          root    false    281                       0    0    questionDiaries_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public."questionDiaries_id_seq"', 1, false);
          public          root    false    285                       0    0    questionFiles_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public."questionFiles_id_seq"', 1, false);
          public          root    false    283                       0    0    questionRevivals_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public."questionRevivals_id_seq"', 1, false);
          public          root    false    287                       0    0    questionStatuses_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public."questionStatuses_id_seq"', 1, false);
          public          root    false    243                        0    0    questions_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.questions_id_seq', 1, false);
          public          root    false    279            !           0    0    requestLeaves_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public."requestLeaves_id_seq"', 7, true);
          public          root    false    208            "           0    0    resolutionDiaries_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public."resolutionDiaries_id_seq"', 1, false);
          public          root    false    269            #           0    0    resolutionMovers_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public."resolutionMovers_id_seq"', 1, false);
          public          root    false    273            $           0    0    resolutionStatuses_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public."resolutionStatuses_id_seq"', 1, false);
          public          root    false    267            %           0    0    resolutions_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.resolutions_id_seq', 1, false);
          public          root    false    271            &           0    0    rolesPermissions_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public."rolesPermissions_id_seq"', 1, false);
          public          root    false    204            '           0    0    roles_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.roles_id_seq', 2, true);
          public          root    false    202            (           0    0    sessions_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.sessions_id_seq', 1, false);
          public          root    false    245            )           0    0    tenures_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.tenures_id_seq', 1, false);
          public          root    false    251            *           0    0    userSessions_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public."userSessions_id_seq"', 97, true);
          public          root    false    235            +           0    0    usersPermissions_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public."usersPermissions_id_seq"', 1, false);
          public          root    false    213            ,           0    0    usersRoles_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public."usersRoles_id_seq"', 1, false);
          public          root    false    239            -           0    0    users_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.users_id_seq', 1, false);
          public          root    false    222            .           0    0    usersessions_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.usersessions_id_seq', 1, false);
          public          root    false    224            /           0    0    visitors_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.visitors_id_seq', 1, false);
          public          root    false    217            �           2606    17051    Departments Departments_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public."Departments"
    ADD CONSTRAINT "Departments_pkey" PRIMARY KEY (id);
 J   ALTER TABLE ONLY public."Departments" DROP CONSTRAINT "Departments_pkey";
       public            root    false    238            �           2606    16985    departments departments_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.departments DROP CONSTRAINT departments_pkey;
       public            root    false    230            �           2606    16996    designations designations_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.designations DROP CONSTRAINT designations_pkey;
       public            root    false    232            �           2606    18054    divisions divisions_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT divisions_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.divisions DROP CONSTRAINT divisions_pkey;
       public            root    false    276            �           2606    17007    employees employees_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.employees DROP CONSTRAINT employees_pkey;
       public            root    false    234            �           2606    18070    groups groups_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.groups DROP CONSTRAINT groups_pkey;
       public            root    false    278            �           2606    16595     leaveComments leaveComments_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public."leaveComments"
    ADD CONSTRAINT "leaveComments_pkey" PRIMARY KEY (id);
 N   ALTER TABLE ONLY public."leaveComments" DROP CONSTRAINT "leaveComments_pkey";
       public            root    false    211            �           2606    16542    leaveTypes leaveTypes_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public."leaveTypes"
    ADD CONSTRAINT "leaveTypes_pkey" PRIMARY KEY (id);
 H   ALTER TABLE ONLY public."leaveTypes" DROP CONSTRAINT "leaveTypes_pkey";
       public            root    false    207            �           2606    17607    members members_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.members DROP CONSTRAINT members_pkey;
       public            root    false    254            �           2606    17823    ministries ministries_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.ministries
    ADD CONSTRAINT ministries_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.ministries DROP CONSTRAINT ministries_pkey;
       public            root    false    262            �           2606    16960    modules modules_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.modules DROP CONSTRAINT modules_pkey;
       public            root    false    226            �           2606    17831 &   motionMinistries motionMinistries_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public."motionMinistries"
    ADD CONSTRAINT "motionMinistries_pkey" PRIMARY KEY (id);
 T   ALTER TABLE ONLY public."motionMinistries" DROP CONSTRAINT "motionMinistries_pkey";
       public            root    false    264            �           2606    17770    motionMovers motionMovers_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public."motionMovers"
    ADD CONSTRAINT "motionMovers_pkey" PRIMARY KEY (id);
 L   ALTER TABLE ONLY public."motionMovers" DROP CONSTRAINT "motionMovers_pkey";
       public            root    false    260            �           2606    17849 0   motionStatusHistories motionStatusHistories_pkey 
   CONSTRAINT     r   ALTER TABLE ONLY public."motionStatusHistories"
    ADD CONSTRAINT "motionStatusHistories_pkey" PRIMARY KEY (id);
 ^   ALTER TABLE ONLY public."motionStatusHistories" DROP CONSTRAINT "motionStatusHistories_pkey";
       public            root    false    266            �           2606    17408 "   motionStatuses motionStatuses_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public."motionStatuses"
    ADD CONSTRAINT "motionStatuses_pkey" PRIMARY KEY (id);
 P   ALTER TABLE ONLY public."motionStatuses" DROP CONSTRAINT "motionStatuses_pkey";
       public            root    false    250            �           2606    17747    motions motions_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.motions
    ADD CONSTRAINT motions_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.motions DROP CONSTRAINT motions_pkey;
       public            root    false    258            �           2606    17683 ,   noticeOfficeDairies noticeOfficeDairies_pkey 
   CONSTRAINT     n   ALTER TABLE ONLY public."noticeOfficeDairies"
    ADD CONSTRAINT "noticeOfficeDairies_pkey" PRIMARY KEY (id);
 Z   ALTER TABLE ONLY public."noticeOfficeDairies" DROP CONSTRAINT "noticeOfficeDairies_pkey";
       public            root    false    256            �           2606    16800    passVisitors passVisitors_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public."passVisitors"
    ADD CONSTRAINT "passVisitors_pkey" PRIMARY KEY (id);
 L   ALTER TABLE ONLY public."passVisitors" DROP CONSTRAINT "passVisitors_pkey";
       public            root    false    220            �           2606    16775    passes passes_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.passes
    ADD CONSTRAINT passes_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.passes DROP CONSTRAINT passes_pkey;
       public            root    false    216            �           2606    16969    permissions permissions_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.permissions DROP CONSTRAINT permissions_pkey;
       public            root    false    228            �           2606    17397 &   politicalParties politicalParties_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public."politicalParties"
    ADD CONSTRAINT "politicalParties_pkey" PRIMARY KEY (id);
 T   ALTER TABLE ONLY public."politicalParties" DROP CONSTRAINT "politicalParties_pkey";
       public            root    false    248            �           2606    17092 *   questionCategories questionCategories_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public."questionCategories"
    ADD CONSTRAINT "questionCategories_pkey" PRIMARY KEY (id);
 X   ALTER TABLE ONLY public."questionCategories" DROP CONSTRAINT "questionCategories_pkey";
       public            root    false    242            �           2606    18104 "   questionDefers questionDefers_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public."questionDefers"
    ADD CONSTRAINT "questionDefers_pkey" PRIMARY KEY (id);
 P   ALTER TABLE ONLY public."questionDefers" DROP CONSTRAINT "questionDefers_pkey";
       public            root    false    282            �           2606    18135 $   questionDiaries questionDiaries_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public."questionDiaries"
    ADD CONSTRAINT "questionDiaries_pkey" PRIMARY KEY (id);
 R   ALTER TABLE ONLY public."questionDiaries" DROP CONSTRAINT "questionDiaries_pkey";
       public            root    false    286            �           2606    18122     questionFiles questionFiles_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public."questionFiles"
    ADD CONSTRAINT "questionFiles_pkey" PRIMARY KEY (id);
 N   ALTER TABLE ONLY public."questionFiles" DROP CONSTRAINT "questionFiles_pkey";
       public            root    false    284            �           2606    18143 &   questionRevivals questionRevivals_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public."questionRevivals"
    ADD CONSTRAINT "questionRevivals_pkey" PRIMARY KEY (id);
 T   ALTER TABLE ONLY public."questionRevivals" DROP CONSTRAINT "questionRevivals_pkey";
       public            root    false    288            �           2606    17103 &   questionStatuses questionStatuses_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public."questionStatuses"
    ADD CONSTRAINT "questionStatuses_pkey" PRIMARY KEY (id);
 T   ALTER TABLE ONLY public."questionStatuses" DROP CONSTRAINT "questionStatuses_pkey";
       public            root    false    244            �           2606    18078    questions questions_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.questions DROP CONSTRAINT questions_pkey;
       public            root    false    280            �           2606    16577     requestLeaves requestLeaves_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public."requestLeaves"
    ADD CONSTRAINT "requestLeaves_pkey" PRIMARY KEY (id);
 N   ALTER TABLE ONLY public."requestLeaves" DROP CONSTRAINT "requestLeaves_pkey";
       public            root    false    209            �           2606    17923 (   resolutionDiaries resolutionDiaries_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public."resolutionDiaries"
    ADD CONSTRAINT "resolutionDiaries_pkey" PRIMARY KEY (id);
 V   ALTER TABLE ONLY public."resolutionDiaries" DROP CONSTRAINT "resolutionDiaries_pkey";
       public            root    false    270            �           2606    18035 &   resolutionMovers resolutionMovers_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public."resolutionMovers"
    ADD CONSTRAINT "resolutionMovers_pkey" PRIMARY KEY (id);
 T   ALTER TABLE ONLY public."resolutionMovers" DROP CONSTRAINT "resolutionMovers_pkey";
       public            root    false    274            �           2606    17867 *   resolutionStatuses resolutionStatuses_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public."resolutionStatuses"
    ADD CONSTRAINT "resolutionStatuses_pkey" PRIMARY KEY (id);
 X   ALTER TABLE ONLY public."resolutionStatuses" DROP CONSTRAINT "resolutionStatuses_pkey";
       public            root    false    268            �           2606    18007    resolutions resolutions_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.resolutions
    ADD CONSTRAINT resolutions_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.resolutions DROP CONSTRAINT resolutions_pkey;
       public            root    false    272            ~           2606    16467 &   rolesPermissions rolesPermissions_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public."rolesPermissions"
    ADD CONSTRAINT "rolesPermissions_pkey" PRIMARY KEY (id);
 T   ALTER TABLE ONLY public."rolesPermissions" DROP CONSTRAINT "rolesPermissions_pkey";
       public            root    false    205            |           2606    16404    roles roles_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_pkey;
       public            root    false    203            �           2606    17311    sessions sessions_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.sessions DROP CONSTRAINT sessions_pkey;
       public            root    false    246            �           2606    17582    tenures tenures_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.tenures
    ADD CONSTRAINT tenures_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.tenures DROP CONSTRAINT tenures_pkey;
       public            root    false    252            �           2606    17033    userSessions userSessions_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public."userSessions"
    ADD CONSTRAINT "userSessions_pkey" PRIMARY KEY (id);
 L   ALTER TABLE ONLY public."userSessions" DROP CONSTRAINT "userSessions_pkey";
       public            root    false    236            �           2606    16754 &   usersPermissions usersPermissions_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public."usersPermissions"
    ADD CONSTRAINT "usersPermissions_pkey" PRIMARY KEY (id);
 T   ALTER TABLE ONLY public."usersPermissions" DROP CONSTRAINT "usersPermissions_pkey";
       public            root    false    214            �           2606    17059    usersRoles usersRoles_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public."usersRoles"
    ADD CONSTRAINT "usersRoles_pkey" PRIMARY KEY (id);
 H   ALTER TABLE ONLY public."usersRoles" DROP CONSTRAINT "usersRoles_pkey";
       public            root    false    240            �           2606    16856    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public            root    false    223            �           2606    16854    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            root    false    223            �           2606    16792    visitors visitors_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.visitors
    ADD CONSTRAINT visitors_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.visitors DROP CONSTRAINT visitors_pkey;
       public            root    false    218            �           2606    18055 %   divisions divisions_fkMinistryId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.divisions
    ADD CONSTRAINT "divisions_fkMinistryId_fkey" FOREIGN KEY ("fkMinistryId") REFERENCES public.ministries(id);
 Q   ALTER TABLE ONLY public.divisions DROP CONSTRAINT "divisions_fkMinistryId_fkey";
       public          root    false    276    262    3254            �           2606    17013 '   employees employees_fkDepartmentId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_fkDepartmentId_fkey" FOREIGN KEY ("fkDepartmentId") REFERENCES public.departments(id);
 S   ALTER TABLE ONLY public.employees DROP CONSTRAINT "employees_fkDepartmentId_fkey";
       public          root    false    3222    234    230            �           2606    17018 (   employees employees_fkDesignationId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_fkDesignationId_fkey" FOREIGN KEY ("fkDesignationId") REFERENCES public.designations(id);
 T   ALTER TABLE ONLY public.employees DROP CONSTRAINT "employees_fkDesignationId_fkey";
       public          root    false    232    234    3224            �           2606    17008 !   employees employees_fkUserId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_fkUserId_fkey" FOREIGN KEY ("fkUserId") REFERENCES public.users(id);
 M   ALTER TABLE ONLY public.employees DROP CONSTRAINT "employees_fkUserId_fkey";
       public          root    false    3216    223    234            �           2606    16596 1   leaveComments leaveComments_fkRequestLeaveId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."leaveComments"
    ADD CONSTRAINT "leaveComments_fkRequestLeaveId_fkey" FOREIGN KEY ("fkRequestLeaveId") REFERENCES public."requestLeaves"(id) ON UPDATE CASCADE ON DELETE SET NULL;
 _   ALTER TABLE ONLY public."leaveComments" DROP CONSTRAINT "leaveComments_fkRequestLeaveId_fkey";
       public          root    false    211    209    3202            �           2606    16543 #   leaveTypes leaveTypes_fkRoleId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."leaveTypes"
    ADD CONSTRAINT "leaveTypes_fkRoleId_fkey" FOREIGN KEY ("fkRoleId") REFERENCES public.roles(id);
 Q   ALTER TABLE ONLY public."leaveTypes" DROP CONSTRAINT "leaveTypes_fkRoleId_fkey";
       public          root    false    3196    203    207            �           2606    17608    members members_fkTenureId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.members
    ADD CONSTRAINT "members_fkTenureId_fkey" FOREIGN KEY ("fkTenureId") REFERENCES public.tenures(id);
 K   ALTER TABLE ONLY public.members DROP CONSTRAINT "members_fkTenureId_fkey";
       public          root    false    254    252    3244            �           2606    17613 #   members members_politicalParty_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.members
    ADD CONSTRAINT "members_politicalParty_fkey" FOREIGN KEY ("politicalParty") REFERENCES public."politicalParties"(id);
 O   ALTER TABLE ONLY public.members DROP CONSTRAINT "members_politicalParty_fkey";
       public          root    false    248    3240    254            �           2606    17832 3   motionMinistries motionMinistries_fkMinistryId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."motionMinistries"
    ADD CONSTRAINT "motionMinistries_fkMinistryId_fkey" FOREIGN KEY ("fkMinistryId") REFERENCES public.ministries(id);
 a   ALTER TABLE ONLY public."motionMinistries" DROP CONSTRAINT "motionMinistries_fkMinistryId_fkey";
       public          root    false    262    3254    264            �           2606    17837 1   motionMinistries motionMinistries_fkMotionId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."motionMinistries"
    ADD CONSTRAINT "motionMinistries_fkMotionId_fkey" FOREIGN KEY ("fkMotionId") REFERENCES public.motions(id);
 _   ALTER TABLE ONLY public."motionMinistries" DROP CONSTRAINT "motionMinistries_fkMotionId_fkey";
       public          root    false    258    3250    264            �           2606    17776 )   motionMovers motionMovers_fkMemberId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."motionMovers"
    ADD CONSTRAINT "motionMovers_fkMemberId_fkey" FOREIGN KEY ("fkMemberId") REFERENCES public.members(id);
 W   ALTER TABLE ONLY public."motionMovers" DROP CONSTRAINT "motionMovers_fkMemberId_fkey";
       public          root    false    3246    254    260            �           2606    17771 )   motionMovers motionMovers_fkMotionId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."motionMovers"
    ADD CONSTRAINT "motionMovers_fkMotionId_fkey" FOREIGN KEY ("fkMotionId") REFERENCES public.motions(id);
 W   ALTER TABLE ONLY public."motionMovers" DROP CONSTRAINT "motionMovers_fkMotionId_fkey";
       public          root    false    258    3250    260            �           2606    17855 ;   motionStatusHistories motionStatusHistories_fkMotionId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."motionStatusHistories"
    ADD CONSTRAINT "motionStatusHistories_fkMotionId_fkey" FOREIGN KEY ("fkMotionId") REFERENCES public.motions(id);
 i   ALTER TABLE ONLY public."motionStatusHistories" DROP CONSTRAINT "motionStatusHistories_fkMotionId_fkey";
       public          root    false    258    3250    266            �           2606    17850 <   motionStatusHistories motionStatusHistories_fkSessionId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."motionStatusHistories"
    ADD CONSTRAINT "motionStatusHistories_fkSessionId_fkey" FOREIGN KEY ("fkSessionId") REFERENCES public.sessions(id);
 j   ALTER TABLE ONLY public."motionStatusHistories" DROP CONSTRAINT "motionStatusHistories_fkSessionId_fkey";
       public          root    false    246    3238    266            �           2606    17753 "   motions motions_fkDairyNumber_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.motions
    ADD CONSTRAINT "motions_fkDairyNumber_fkey" FOREIGN KEY ("fkDairyNumber") REFERENCES public."noticeOfficeDairies"(id);
 N   ALTER TABLE ONLY public.motions DROP CONSTRAINT "motions_fkDairyNumber_fkey";
       public          root    false    256    258    3248            �           2606    17758 #   motions motions_fkMotionStatus_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.motions
    ADD CONSTRAINT "motions_fkMotionStatus_fkey" FOREIGN KEY ("fkMotionStatus") REFERENCES public."motionStatuses"(id);
 O   ALTER TABLE ONLY public.motions DROP CONSTRAINT "motions_fkMotionStatus_fkey";
       public          root    false    250    3242    258            �           2606    17748     motions motions_fkSessionId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.motions
    ADD CONSTRAINT "motions_fkSessionId_fkey" FOREIGN KEY ("fkSessionId") REFERENCES public.sessions(id);
 L   ALTER TABLE ONLY public.motions DROP CONSTRAINT "motions_fkSessionId_fkey";
       public          root    false    246    258    3238            �           2606    16801 %   passVisitors passVisitors_passId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."passVisitors"
    ADD CONSTRAINT "passVisitors_passId_fkey" FOREIGN KEY ("passId") REFERENCES public.passes(id);
 S   ALTER TABLE ONLY public."passVisitors" DROP CONSTRAINT "passVisitors_passId_fkey";
       public          root    false    216    220    3208            �           2606    16806 (   passVisitors passVisitors_visitorId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."passVisitors"
    ADD CONSTRAINT "passVisitors_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES public.visitors(id);
 V   ALTER TABLE ONLY public."passVisitors" DROP CONSTRAINT "passVisitors_visitorId_fkey";
       public          root    false    218    3210    220            �           2606    16970 '   permissions permissions_fkModuleId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT "permissions_fkModuleId_fkey" FOREIGN KEY ("fkModuleId") REFERENCES public.modules(id);
 S   ALTER TABLE ONLY public.permissions DROP CONSTRAINT "permissions_fkModuleId_fkey";
       public          root    false    226    228    3218            �           2606    18105 /   questionDefers questionDefers_fkQuestionId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."questionDefers"
    ADD CONSTRAINT "questionDefers_fkQuestionId_fkey" FOREIGN KEY ("fkQuestionId") REFERENCES public.questions(id);
 ]   ALTER TABLE ONLY public."questionDefers" DROP CONSTRAINT "questionDefers_fkQuestionId_fkey";
       public          root    false    3272    282    280            �           2606    18110 .   questionDefers questionDefers_fkSessionId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."questionDefers"
    ADD CONSTRAINT "questionDefers_fkSessionId_fkey" FOREIGN KEY ("fkSessionId") REFERENCES public.sessions(id);
 \   ALTER TABLE ONLY public."questionDefers" DROP CONSTRAINT "questionDefers_fkSessionId_fkey";
       public          root    false    246    282    3238            �           2606    18123 -   questionFiles questionFiles_fkQuestionId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."questionFiles"
    ADD CONSTRAINT "questionFiles_fkQuestionId_fkey" FOREIGN KEY ("fkQuestionId") REFERENCES public.questions(id);
 [   ALTER TABLE ONLY public."questionFiles" DROP CONSTRAINT "questionFiles_fkQuestionId_fkey";
       public          root    false    284    3272    280            �           2606    18159 3   questionRevivals questionRevivals_fkDivisionId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."questionRevivals"
    ADD CONSTRAINT "questionRevivals_fkDivisionId_fkey" FOREIGN KEY ("fkDivisionId") REFERENCES public.divisions(id);
 a   ALTER TABLE ONLY public."questionRevivals" DROP CONSTRAINT "questionRevivals_fkDivisionId_fkey";
       public          root    false    3268    276    288            �           2606    18154 0   questionRevivals questionRevivals_fkGroupId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."questionRevivals"
    ADD CONSTRAINT "questionRevivals_fkGroupId_fkey" FOREIGN KEY ("fkGroupId") REFERENCES public.groups(id);
 ^   ALTER TABLE ONLY public."questionRevivals" DROP CONSTRAINT "questionRevivals_fkGroupId_fkey";
       public          root    false    278    3270    288            �           2606    18164 6   questionRevivals questionRevivals_fkNoticeDiaryNo_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."questionRevivals"
    ADD CONSTRAINT "questionRevivals_fkNoticeDiaryNo_fkey" FOREIGN KEY ("fkNoticeDiaryNo") REFERENCES public."noticeOfficeDairies"(id);
 d   ALTER TABLE ONLY public."questionRevivals" DROP CONSTRAINT "questionRevivals_fkNoticeDiaryNo_fkey";
       public          root    false    256    3248    288            �           2606    18174 8   questionRevivals questionRevivals_fkQuestionDiaryId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."questionRevivals"
    ADD CONSTRAINT "questionRevivals_fkQuestionDiaryId_fkey" FOREIGN KEY ("fkQuestionDiaryId") REFERENCES public."questionDiaries"(id);
 f   ALTER TABLE ONLY public."questionRevivals" DROP CONSTRAINT "questionRevivals_fkQuestionDiaryId_fkey";
       public          root    false    286    3278    288            �           2606    18144 3   questionRevivals questionRevivals_fkQuestionId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."questionRevivals"
    ADD CONSTRAINT "questionRevivals_fkQuestionId_fkey" FOREIGN KEY ("fkQuestionId") REFERENCES public.questions(id);
 a   ALTER TABLE ONLY public."questionRevivals" DROP CONSTRAINT "questionRevivals_fkQuestionId_fkey";
       public          root    false    288    280    3272            �           2606    18169 7   questionRevivals questionRevivals_fkQuestionStatus_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."questionRevivals"
    ADD CONSTRAINT "questionRevivals_fkQuestionStatus_fkey" FOREIGN KEY ("fkQuestionStatus") REFERENCES public."questionStatuses"(id);
 e   ALTER TABLE ONLY public."questionRevivals" DROP CONSTRAINT "questionRevivals_fkQuestionStatus_fkey";
       public          root    false    244    288    3236            �           2606    18149 2   questionRevivals questionRevivals_fkSessionId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."questionRevivals"
    ADD CONSTRAINT "questionRevivals_fkSessionId_fkey" FOREIGN KEY ("fkSessionId") REFERENCES public.sessions(id);
 `   ALTER TABLE ONLY public."questionRevivals" DROP CONSTRAINT "questionRevivals_fkSessionId_fkey";
       public          root    false    3238    288    246            �           2606    18084 %   questions questions_fkDivisionId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.questions
    ADD CONSTRAINT "questions_fkDivisionId_fkey" FOREIGN KEY ("fkDivisionId") REFERENCES public.divisions(id);
 Q   ALTER TABLE ONLY public.questions DROP CONSTRAINT "questions_fkDivisionId_fkey";
       public          root    false    3268    280    276            �           2606    18089 "   questions questions_fkGroupId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.questions
    ADD CONSTRAINT "questions_fkGroupId_fkey" FOREIGN KEY ("fkGroupId") REFERENCES public.groups(id);
 N   ALTER TABLE ONLY public.questions DROP CONSTRAINT "questions_fkGroupId_fkey";
       public          root    false    3270    278    280            �           2606    18079 $   questions questions_fkSessionId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.questions
    ADD CONSTRAINT "questions_fkSessionId_fkey" FOREIGN KEY ("fkSessionId") REFERENCES public.sessions(id);
 P   ALTER TABLE ONLY public.questions DROP CONSTRAINT "questions_fkSessionId_fkey";
       public          root    false    3238    246    280            �           2606    16578 0   requestLeaves requestLeaves_fkRequestTypeId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."requestLeaves"
    ADD CONSTRAINT "requestLeaves_fkRequestTypeId_fkey" FOREIGN KEY ("fkRequestTypeId") REFERENCES public."leaveTypes"(id);
 ^   ALTER TABLE ONLY public."requestLeaves" DROP CONSTRAINT "requestLeaves_fkRequestTypeId_fkey";
       public          root    false    3200    209    207            �           2606    18041 1   resolutionMovers resolutionMovers_fkMemberId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."resolutionMovers"
    ADD CONSTRAINT "resolutionMovers_fkMemberId_fkey" FOREIGN KEY ("fkMemberId") REFERENCES public.members(id);
 _   ALTER TABLE ONLY public."resolutionMovers" DROP CONSTRAINT "resolutionMovers_fkMemberId_fkey";
       public          root    false    274    254    3246            �           2606    18036 5   resolutionMovers resolutionMovers_fkResolutionId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."resolutionMovers"
    ADD CONSTRAINT "resolutionMovers_fkResolutionId_fkey" FOREIGN KEY ("fkResolutionId") REFERENCES public.resolutions(id);
 c   ALTER TABLE ONLY public."resolutionMovers" DROP CONSTRAINT "resolutionMovers_fkResolutionId_fkey";
       public          root    false    274    272    3264            �           2606    18018 2   resolutions resolutions_fkNoticeOfficeDairyId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.resolutions
    ADD CONSTRAINT "resolutions_fkNoticeOfficeDairyId_fkey" FOREIGN KEY ("fkNoticeOfficeDairyId") REFERENCES public."noticeOfficeDairies"(id);
 ^   ALTER TABLE ONLY public.resolutions DROP CONSTRAINT "resolutions_fkNoticeOfficeDairyId_fkey";
       public          root    false    272    3248    256            �           2606    18013 0   resolutions resolutions_fkResolutionDairyId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.resolutions
    ADD CONSTRAINT "resolutions_fkResolutionDairyId_fkey" FOREIGN KEY ("fkResolutionDairyId") REFERENCES public."resolutionDiaries"(id);
 \   ALTER TABLE ONLY public.resolutions DROP CONSTRAINT "resolutions_fkResolutionDairyId_fkey";
       public          root    false    272    270    3262            �           2606    18023 /   resolutions resolutions_fkResolutionStatus_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.resolutions
    ADD CONSTRAINT "resolutions_fkResolutionStatus_fkey" FOREIGN KEY ("fkResolutionStatus") REFERENCES public."resolutionStatuses"(id);
 [   ALTER TABLE ONLY public.resolutions DROP CONSTRAINT "resolutions_fkResolutionStatus_fkey";
       public          root    false    272    268    3260            �           2606    18008 (   resolutions resolutions_fkSessionNo_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.resolutions
    ADD CONSTRAINT "resolutions_fkSessionNo_fkey" FOREIGN KEY ("fkSessionNo") REFERENCES public.sessions(id);
 T   ALTER TABLE ONLY public.resolutions DROP CONSTRAINT "resolutions_fkSessionNo_fkey";
       public          root    false    272    246    3238            �           2606    16468 -   rolesPermissions rolesPermissions_roleId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."rolesPermissions"
    ADD CONSTRAINT "rolesPermissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id);
 [   ALTER TABLE ONLY public."rolesPermissions" DROP CONSTRAINT "rolesPermissions_roleId_fkey";
       public          root    false    3196    205    203            �           2606    17034 %   userSessions userSessions_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."userSessions"
    ADD CONSTRAINT "userSessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id);
 S   ALTER TABLE ONLY public."userSessions" DROP CONSTRAINT "userSessions_userId_fkey";
       public          root    false    236    3216    223            �           2606    17065 !   usersRoles usersRoles_roleId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."usersRoles"
    ADD CONSTRAINT "usersRoles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id);
 O   ALTER TABLE ONLY public."usersRoles" DROP CONSTRAINT "usersRoles_roleId_fkey";
       public          root    false    240    3196    203            �           2606    17060 !   usersRoles usersRoles_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."usersRoles"
    ADD CONSTRAINT "usersRoles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id);
 O   ALTER TABLE ONLY public."usersRoles" DROP CONSTRAINT "usersRoles_userId_fkey";
       public          root    false    223    3216    240            �           2606    16857    users users_fkRoleId_fkey    FK CONSTRAINT     }   ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_fkRoleId_fkey" FOREIGN KEY ("fkRoleId") REFERENCES public.roles(id);
 E   ALTER TABLE ONLY public.users DROP CONSTRAINT "users_fkRoleId_fkey";
       public          root    false    203    223    3196            �      x������ � �      �   C   x�3�tL���SpI-H,*�M�+��H�K�I-V�H��$���(��e+r&&�d��r��W� �	�      �   C   x�3�tL���S ���%E�%�E��y)9��Q��ԜĒ�����lE���̲T�? ����� '��      �      x������ � �      �   =   x�3�t��Tp��ML��J��L��Ls��9ssR98c�89���Č������ �+?      �      x������ � �      �   �   x��α
�@�����K�$w����I'G�b�������oĞ%���2�j�7�=�v�74#��(��b��r�"��G�Q��;�y-�_�缴�
�b�i� �co/}�6�4���ȣŨ�*��1.�u1ۺ�uW�<��z��[)���� ��	� ���O      �   9   x�3�tN,.M�Q�IM,K�4�4�LL.�2c���ˈ3839��1�c^�1z\\\ x
      �      x������ � �      �      x������ � �      �   9   x�3���I-�LL.�,K��".N�܂���Tt	cN�ԂĢ��Լ4�=... ��~      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �   -   x�3��L-W��I�4�LL.�,K��".#Nǔ�21z\\\ ��      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �   q  x���MO�0��ɯ�Z�Ϧ�mLB;�u��fbk���ƿ')Lk��j+;��u8��a��	�J!��[B.n����l��N�����i�]hn��њ�V@�,�.�{9;�b1�D�X�c�t�CPx�@2�cI��{�._�΃!S���mL�W��%��Լ]�W���(͸fS!{e{!��j7����e���������>h�J:�1c�Y�!H�I����I��Ԅb%��V�Hp�'�jh3/�ub��t?;T�{{���^@�st
R�	ǉ�z��$�R�8j9�]�d��M�q�Yv0��ml����)�����j�\���d��2��������P����M�v���Vj*���B��8&      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      }   O   x�3�tL����L)�ͭ�LL.�,K��".#��T�/ʆ���Y*X�[�X�k������� �{~            x�3�4�? �2����=... IC�      �      x������ � �      �      x������ � �      �   Z  x����R9�����-T:�`�5ېppR�J�	�'x��l 3�F�����{�Ӓ~�dؚX���S1J¯����)댭�u��U�;WS��i����tz�X�T8^��U�JY>郊'���¤�b�Pّ����eR֖(C8!��n{v�f:ͷ���}6����wj�����W��mG��dr�;��o�/��������~W�n�ǳ������Ư��.�}'������������w��|H��ގ�].���`7�ˑ��_v�qS�ZC�
+�*!	w6_�
G��v3D�?T�)Kx��
�>�۸��:��wbѣ��ͷ���j���W���'=?a_Mϲ���V&޵���X�J�������¤���8�Ն
G�����Ű�:��a��aeÇa��hsC'�`q����/۟]���?`N��7����R3l�<~\�x�FJ�h�xE��{��5���F+�L�e�?V�o���p>�a�9#{�1�����k�{jx�!�nn����G~Kz[���9�����?��b��헝���O;�S�7��;���d�|���lދ��.�ִߵ���l9� !3&[�
G�{NШ�)��?R���kWx�k�w�������ϯ�醼۟Mz?.l�����o&qڣGo�M֧�Tb���aco���-'يIblfS���N"B�t2+{���)��ꊚJQB�KfM�p,����6L)x>k]�#`i�oguaˠ*]�
G�\YV�V��fm�p<�������X���
G��>���E�󳩡��t��*h(g�qm�p<툭��VTi�s���pY��OAFL�zm�p<�M����n��׆
G���w[ܟRhzWO�p�Л��� �&ݙ&U8^�M!H�:*��B�>"�E��#hh��yS���"oZY�Tn\#�@y�ҡ�Hg�T��M�����d~~�%~���$��^C �,�G�0�d��"��(��!�Z&*7M�"��(2�)߯jڑ����"��A�W�9��T"�@��񛟏#9�ƪĘ��"��A���;V~"5T8Qh>��6-�n�p��|$�mqR��U8Yh>R�4�%R�dQcd�%��]2r�H�p�ȕ|�+�}�2I�ZI�d�/��2��D*�,��U�Fo;�*�,��� �[�MJ@��*Ɵ|���H�#�E���t��>�p�ȗ���JO*�*�� e�,I�@��*ț�9D���"_
G�p�6��G*�*��ePvC�-J�j�*��e�������R_ZY��Ku�@���
ǭ��鷪��6�RkZ1���O*�*��e���S8�Z�&UjM� er�K���Rk�A����p�Ԛ�A�u��'�@?ÚLQ�^a�T�gX���T��yR��3��x���^W*4���A?Ù,a�����RgR��S��}��p�ԙt0Qi:fp]�#Х�d�e���qT�\C��I��;B;�RC�#0�Τt�����P�L�3�.�dǎ�P�L�3� ��6��_*�)t&Z��=����BgR�(��Mu��y������r-x��ԛ�B���<�ƫ�I���{4��?˻�Z��L��~�[�d��A�$�h)�1Į!��gt<\E��!��5�.��*Y������?���d�.���e(����Xt=��=�;�I������6�p�Q��eV���t!Ȅ/�h�
-V�lI���
g��X�#�/Z�޷-I?��}�z��t��z��+�VAJ���j$B	���Ǆ������U8W� � ��}��p�%��D؄�IԱ��������UG�J��$+�{ �i�b���d;gj�OO:�"��|Pp��%a��|" �x��      �   �   x�����@ 뽯��3�����H0����S$/����T��4��z]�BՖh5��o5H�� ?�0e���/�U�~"�_B�Q��O�3^d���Xd~��u���*|�t��T���8Ym�mu+����9r�$n"-�BrC-7p��,�c_�8       �      x�3�4�4��".# �ʎ���� I��      �      x������ � �      �      x������ � �     