PGDMP                      
    {            SenateTesting01    14.9    14.9 {    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    25520    SenateTesting01    DATABASE     u   CREATE DATABASE "SenateTesting01" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'English_United States.1252';
 !   DROP DATABASE "SenateTesting01";
                postgres    false            q           1247    25974 !   enum_departments_departmentStatus    TYPE     a   CREATE TYPE public."enum_departments_departmentStatus" AS ENUM (
    'active',
    'inactive'
);
 6   DROP TYPE public."enum_departments_departmentStatus";
       public          postgres    false            t           1247    25990 #   enum_designations_designationStatus    TYPE     c   CREATE TYPE public."enum_designations_designationStatus" AS ENUM (
    'active',
    'inactive'
);
 8   DROP TYPE public."enum_designations_designationStatus";
       public          postgres    false            \           1247    25734    enum_leaveTypes_leaveStatus    TYPE     [   CREATE TYPE public."enum_leaveTypes_leaveStatus" AS ENUM (
    'active',
    'inactive'
);
 0   DROP TYPE public."enum_leaveTypes_leaveStatus";
       public          postgres    false            �           1247    26299    enum_modules_moduleState    TYPE     X   CREATE TYPE public."enum_modules_moduleState" AS ENUM (
    'active',
    'inactive'
);
 -   DROP TYPE public."enum_modules_moduleState";
       public          postgres    false            �           1247    26234    enum_passes_allowOffDays    TYPE     X   CREATE TYPE public."enum_passes_allowOffDays" AS ENUM (
    'saturday',
    'sunday'
);
 -   DROP TYPE public."enum_passes_allowOffDays";
       public          postgres    false            }           1247    26229    enum_passes_cardType    TYPE     V   CREATE TYPE public."enum_passes_cardType" AS ENUM (
    'personal',
    'official'
);
 )   DROP TYPE public."enum_passes_cardType";
       public          postgres    false            �           1247    26240    enum_passes_passStatus    TYPE     V   CREATE TYPE public."enum_passes_passStatus" AS ENUM (
    'active',
    'inactive'
);
 +   DROP TYPE public."enum_passes_passStatus";
       public          postgres    false            �           1247    26304 !   enum_permissions_permissionStatus    TYPE     a   CREATE TYPE public."enum_permissions_permissionStatus" AS ENUM (
    'active',
    'inactive'
);
 6   DROP TYPE public."enum_permissions_permissionStatus";
       public          postgres    false            b           1247    25764 &   enum_requestLeaves_requestLeaveSubType    TYPE     �   CREATE TYPE public."enum_requestLeaves_requestLeaveSubType" AS ENUM (
    'postApproved',
    'preApproved',
    'telephonicInformed',
    'active',
    'inactive'
);
 ;   DROP TYPE public."enum_requestLeaves_requestLeaveSubType";
       public          postgres    false            _           1247    25755     enum_requestLeaves_requestStatus    TYPE     �   CREATE TYPE public."enum_requestLeaves_requestStatus" AS ENUM (
    'pending',
    'approved',
    'disapproved',
    'marked',
    'active',
    'inactive'
);
 5   DROP TYPE public."enum_requestLeaves_requestStatus";
       public          postgres    false            n           1247    25968    enum_roles_roleStatus    TYPE     U   CREATE TYPE public."enum_roles_roleStatus" AS ENUM (
    'active',
    'inactive'
);
 *   DROP TYPE public."enum_roles_roleStatus";
       public          postgres    false            Y           1247    25614    enum_userSessions_status    TYPE     W   CREATE TYPE public."enum_userSessions_status" AS ENUM (
    'Success',
    'Failed'
);
 -   DROP TYPE public."enum_userSessions_status";
       public          postgres    false            z           1247    26048    enum_users_gender    TYPE     K   CREATE TYPE public.enum_users_gender AS ENUM (
    'male',
    'female'
);
 $   DROP TYPE public.enum_users_gender;
       public          postgres    false            V           1247    25531    enum_users_status    TYPE     ]   CREATE TYPE public.enum_users_status AS ENUM (
    'active',
    'inactive',
    'locked'
);
 $   DROP TYPE public.enum_users_status;
       public          postgres    false            w           1247    26006    enum_users_userStatus    TYPE     c   CREATE TYPE public."enum_users_userStatus" AS ENUM (
    'active',
    'inactive',
    'locked'
);
 *   DROP TYPE public."enum_users_userStatus";
       public          postgres    false            �           1247    26489    enum_visitors_visitorStatus    TYPE     [   CREATE TYPE public."enum_visitors_visitorStatus" AS ENUM (
    'active',
    'inactive'
);
 0   DROP TYPE public."enum_visitors_visitorStatus";
       public          postgres    false            �            1259    26806    departments_id_seq    SEQUENCE     {   CREATE SEQUENCE public.departments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.departments_id_seq;
       public          postgres    false            �            1259    26807    departments    TABLE     j  CREATE TABLE public.departments (
    id integer DEFAULT nextval('public.departments_id_seq'::regclass) NOT NULL,
    "departmentName" character varying(255) NOT NULL,
    "departmentDescription" character varying(255),
    "departmentStatus" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.departments;
       public         heap    postgres    false    216            �            1259    26815    designations_id_seq    SEQUENCE     |   CREATE SEQUENCE public.designations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.designations_id_seq;
       public          postgres    false            �            1259    26816    designations    TABLE     o  CREATE TABLE public.designations (
    id integer DEFAULT nextval('public.designations_id_seq'::regclass) NOT NULL,
    "designationName" character varying(255) NOT NULL,
    "designationDescription" character varying(255),
    "designationStatus" character varying(255) NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
     DROP TABLE public.designations;
       public         heap    postgres    false    218            �            1259    26881 	   employees    TABLE     6  CREATE TABLE public.employees (
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
       public         heap    postgres    false            �            1259    26755    employees_id_seq    SEQUENCE     y   CREATE SEQUENCE public.employees_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.employees_id_seq;
       public          postgres    false            �            1259    26880    employees_id_seq1    SEQUENCE     �   CREATE SEQUENCE public.employees_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.employees_id_seq1;
       public          postgres    false    226            �           0    0    employees_id_seq1    SEQUENCE OWNED BY     F   ALTER SEQUENCE public.employees_id_seq1 OWNED BY public.employees.id;
          public          postgres    false    225            �            1259    25956    leaveComments    TABLE     �   CREATE TABLE public."leaveComments" (
    id integer NOT NULL,
    "leaveComment" character varying(255),
    "fkRequestLeaveId" integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 #   DROP TABLE public."leaveComments";
       public         heap    postgres    false            �            1259    25955    leaveComments_id_seq    SEQUENCE     �   CREATE SEQUENCE public."leaveComments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public."leaveComments_id_seq";
       public          postgres    false    214            �           0    0    leaveComments_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public."leaveComments_id_seq" OWNED BY public."leaveComments".id;
          public          postgres    false    213            �            1259    25863 
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
       public         heap    postgres    false    860    860            �            1259    25862    leaveTypes_id_seq    SEQUENCE     �   CREATE SEQUENCE public."leaveTypes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public."leaveTypes_id_seq";
       public          postgres    false    210            �           0    0    leaveTypes_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public."leaveTypes_id_seq" OWNED BY public."leaveTypes".id;
          public          postgres    false    209            �            1259    27018    modules_id_seq    SEQUENCE     w   CREATE SEQUENCE public.modules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.modules_id_seq;
       public          postgres    false            �            1259    27019    modules    TABLE     B  CREATE TABLE public.modules (
    id integer DEFAULT nextval('public.modules_id_seq'::regclass) NOT NULL,
    name character varying(255) NOT NULL,
    "moduleStatus" character varying(255) DEFAULT 'active'::character varying NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.modules;
       public         heap    postgres    false    228            �            1259    27095    passvisitors_id_seq    SEQUENCE     |   CREATE SEQUENCE public.passvisitors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.passvisitors_id_seq;
       public          postgres    false            �            1259    27096    passVisitors    TABLE     �   CREATE TABLE public."passVisitors" (
    id integer DEFAULT nextval('public.passvisitors_id_seq'::regclass) NOT NULL,
    "passId" integer,
    "visitorId" integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 "   DROP TABLE public."passVisitors";
       public         heap    postgres    false    240            �            1259    27076    passes_id_seq    SEQUENCE     v   CREATE SEQUENCE public.passes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.passes_id_seq;
       public          postgres    false            �            1259    27077    passes    TABLE     �  CREATE TABLE public.passes (
    id integer DEFAULT nextval('public.passes_id_seq'::regclass) NOT NULL,
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
       public         heap    postgres    false    236            �            1259    27028    permissions_id_seq    SEQUENCE     {   CREATE SEQUENCE public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.permissions_id_seq;
       public          postgres    false            �            1259    27029    permissions    TABLE     �  CREATE TABLE public.permissions (
    id integer DEFAULT nextval('public.permissions_id_seq'::regclass) NOT NULL,
    name character varying(255) NOT NULL,
    "fkModuleId" integer,
    "permissionStatus" public."enum_permissions_permissionStatus" DEFAULT 'active'::public."enum_permissions_permissionStatus" NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.permissions;
       public         heap    postgres    false    230    905    905            �            1259    25937    requestLeaves    TABLE       CREATE TABLE public."requestLeaves" (
    id integer NOT NULL,
    "fkRequestTypeId" integer,
    "fkUserId" integer,
    "requestStartDate" timestamp with time zone,
    "requstEndDate" timestamp with time zone,
    "requestStatus" public."enum_requestLeaves_requestStatus",
    "requestLeaveSubType" public."enum_requestLeaves_requestLeaveSubType",
    "requestLeaveReason" character varying(255),
    "requestNumberOfDays" character varying(255),
    "requestStationLeave" boolean,
    "requestLeaveAttachment" character varying(255),
    "requestLeaveSubmittedTo" character varying(255),
    "requestLeaveApplyOnBehalf" boolean,
    "requestLeaveForwarder" character varying(255),
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 #   DROP TABLE public."requestLeaves";
       public         heap    postgres    false    866    863            �            1259    25936    requestLeaves_id_seq    SEQUENCE     �   CREATE SEQUENCE public."requestLeaves_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public."requestLeaves_id_seq";
       public          postgres    false    212            �           0    0    requestLeaves_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public."requestLeaves_id_seq" OWNED BY public."requestLeaves".id;
          public          postgres    false    211            �            1259    26824    roles_id_seq    SEQUENCE     u   CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.roles_id_seq;
       public          postgres    false            �            1259    26825    roles    TABLE     p  CREATE TABLE public.roles (
    id integer DEFAULT nextval('public.roles_id_seq'::regclass) NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255),
    "roleStatus" public."enum_roles_roleStatus" DEFAULT 'active'::public."enum_roles_roleStatus",
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.roles;
       public         heap    postgres    false    220    878    878            �            1259    27041    rolespermissions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.rolespermissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.rolespermissions_id_seq;
       public          postgres    false            �            1259    27042    rolesPermissions    TABLE       CREATE TABLE public."rolesPermissions" (
    id integer DEFAULT nextval('public.rolespermissions_id_seq'::regclass) NOT NULL,
    "roleId" integer,
    "permissionId" integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 &   DROP TABLE public."rolesPermissions";
       public         heap    postgres    false    232            �            1259    26856    usersessions_id_seq    SEQUENCE     |   CREATE SEQUENCE public.usersessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.usersessions_id_seq;
       public          postgres    false            �            1259    27005    userSessions    TABLE     �  CREATE TABLE public."userSessions" (
    id integer DEFAULT nextval('public.usersessions_id_seq'::regclass) NOT NULL,
    "userId" integer,
    "ipAddress" character varying(255),
    "loggedInAt" timestamp with time zone,
    tokens character varying(255),
    status character varying(255) NOT NULL,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);
 "   DROP TABLE public."userSessions";
       public         heap    postgres    false    224            �            1259    26834    users_id_seq    SEQUENCE     u   CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          postgres    false            �            1259    26835    users    TABLE     �  CREATE TABLE public.users (
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
       public         heap    postgres    false    222    887    887            �            1259    27058    userspermissions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.userspermissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.userspermissions_id_seq;
       public          postgres    false            �            1259    27059    usersPermissions    TABLE       CREATE TABLE public."usersPermissions" (
    id integer DEFAULT nextval('public.userspermissions_id_seq'::regclass) NOT NULL,
    "userId" integer,
    "permissionId" integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 &   DROP TABLE public."usersPermissions";
       public         heap    postgres    false    234            �            1259    27085    visitors_id_seq    SEQUENCE     x   CREATE SEQUENCE public.visitors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.visitors_id_seq;
       public          postgres    false            �            1259    27086    visitors    TABLE     �  CREATE TABLE public.visitors (
    id integer DEFAULT nextval('public.visitors_id_seq'::regclass) NOT NULL,
    name character varying(255) NOT NULL,
    cnic character varying(255) NOT NULL,
    details character varying(255) NOT NULL,
    "visitorStatus" public."enum_visitors_visitorStatus" DEFAULT 'active'::public."enum_visitors_visitorStatus" NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.visitors;
       public         heap    postgres    false    238    908    908            �           2604    26884    employees id    DEFAULT     m   ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq1'::regclass);
 ;   ALTER TABLE public.employees ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    226    225    226            �           2604    25959    leaveComments id    DEFAULT     x   ALTER TABLE ONLY public."leaveComments" ALTER COLUMN id SET DEFAULT nextval('public."leaveComments_id_seq"'::regclass);
 A   ALTER TABLE public."leaveComments" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    213    214    214            �           2604    25866    leaveTypes id    DEFAULT     r   ALTER TABLE ONLY public."leaveTypes" ALTER COLUMN id SET DEFAULT nextval('public."leaveTypes_id_seq"'::regclass);
 >   ALTER TABLE public."leaveTypes" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    210    209    210            �           2604    25940    requestLeaves id    DEFAULT     x   ALTER TABLE ONLY public."requestLeaves" ALTER COLUMN id SET DEFAULT nextval('public."requestLeaves_id_seq"'::regclass);
 A   ALTER TABLE public."requestLeaves" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    211    212    212            �          0    26807    departments 
   TABLE DATA                 public          postgres    false    217   g�       �          0    26816    designations 
   TABLE DATA                 public          postgres    false    219   �       �          0    26881 	   employees 
   TABLE DATA                 public          postgres    false    226   b�       �          0    25956    leaveComments 
   TABLE DATA                 public          postgres    false    214   |�       �          0    25863 
   leaveTypes 
   TABLE DATA                 public          postgres    false    210   ��       �          0    27019    modules 
   TABLE DATA                 public          postgres    false    229   ��       �          0    27096    passVisitors 
   TABLE DATA                 public          postgres    false    241   '�       �          0    27077    passes 
   TABLE DATA                 public          postgres    false    237   x�       �          0    27029    permissions 
   TABLE DATA                 public          postgres    false    231   5�       �          0    25937    requestLeaves 
   TABLE DATA                 public          postgres    false    212   ��       �          0    26825    roles 
   TABLE DATA                 public          postgres    false    221   ��       �          0    27042    rolesPermissions 
   TABLE DATA                 public          postgres    false    233   �       �          0    27005    userSessions 
   TABLE DATA                 public          postgres    false    227   }�       �          0    26835    users 
   TABLE DATA                 public          postgres    false    223   ��       �          0    27059    usersPermissions 
   TABLE DATA                 public          postgres    false    235   "�       �          0    27086    visitors 
   TABLE DATA                 public          postgres    false    239   ��       �           0    0    departments_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.departments_id_seq', 1, false);
          public          postgres    false    216            �           0    0    designations_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.designations_id_seq', 1, false);
          public          postgres    false    218            �           0    0    employees_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.employees_id_seq', 1, false);
          public          postgres    false    215            �           0    0    employees_id_seq1    SEQUENCE SET     @   SELECT pg_catalog.setval('public.employees_id_seq1', 1, false);
          public          postgres    false    225            �           0    0    leaveComments_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public."leaveComments_id_seq"', 1, false);
          public          postgres    false    213            �           0    0    leaveTypes_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public."leaveTypes_id_seq"', 1, false);
          public          postgres    false    209            �           0    0    modules_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.modules_id_seq', 1, false);
          public          postgres    false    228            �           0    0    passes_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.passes_id_seq', 1, false);
          public          postgres    false    236            �           0    0    passvisitors_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.passvisitors_id_seq', 1, false);
          public          postgres    false    240            �           0    0    permissions_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.permissions_id_seq', 1, false);
          public          postgres    false    230            �           0    0    requestLeaves_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public."requestLeaves_id_seq"', 1, false);
          public          postgres    false    211            �           0    0    roles_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.roles_id_seq', 1, false);
          public          postgres    false    220            �           0    0    rolespermissions_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.rolespermissions_id_seq', 1, false);
          public          postgres    false    232            �           0    0    users_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.users_id_seq', 1, false);
          public          postgres    false    222            �           0    0    usersessions_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.usersessions_id_seq', 1, false);
          public          postgres    false    224            �           0    0    userspermissions_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.userspermissions_id_seq', 1, false);
          public          postgres    false    234            �           0    0    visitors_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.visitors_id_seq', 1, false);
          public          postgres    false    238            �           2606    26814    departments departments_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.departments DROP CONSTRAINT departments_pkey;
       public            postgres    false    217            �           2606    26823    designations designations_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.designations DROP CONSTRAINT designations_pkey;
       public            postgres    false    219                        2606    26888    employees employees_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.employees DROP CONSTRAINT employees_pkey;
       public            postgres    false    226            �           2606    25961     leaveComments leaveComments_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public."leaveComments"
    ADD CONSTRAINT "leaveComments_pkey" PRIMARY KEY (id);
 N   ALTER TABLE ONLY public."leaveComments" DROP CONSTRAINT "leaveComments_pkey";
       public            postgres    false    214            �           2606    25871    leaveTypes leaveTypes_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public."leaveTypes"
    ADD CONSTRAINT "leaveTypes_pkey" PRIMARY KEY (id);
 H   ALTER TABLE ONLY public."leaveTypes" DROP CONSTRAINT "leaveTypes_pkey";
       public            postgres    false    210                       2606    27027    modules modules_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.modules DROP CONSTRAINT modules_pkey;
       public            postgres    false    229                       2606    27101    passVisitors passVisitors_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public."passVisitors"
    ADD CONSTRAINT "passVisitors_pkey" PRIMARY KEY (id);
 L   ALTER TABLE ONLY public."passVisitors" DROP CONSTRAINT "passVisitors_pkey";
       public            postgres    false    241                       2606    27084    passes passes_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.passes
    ADD CONSTRAINT passes_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.passes DROP CONSTRAINT passes_pkey;
       public            postgres    false    237                       2606    27035    permissions permissions_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.permissions DROP CONSTRAINT permissions_pkey;
       public            postgres    false    231            �           2606    25944     requestLeaves requestLeaves_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public."requestLeaves"
    ADD CONSTRAINT "requestLeaves_pkey" PRIMARY KEY (id);
 N   ALTER TABLE ONLY public."requestLeaves" DROP CONSTRAINT "requestLeaves_pkey";
       public            postgres    false    212                       2606    27047 &   rolesPermissions rolesPermissions_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public."rolesPermissions"
    ADD CONSTRAINT "rolesPermissions_pkey" PRIMARY KEY (id);
 T   ALTER TABLE ONLY public."rolesPermissions" DROP CONSTRAINT "rolesPermissions_pkey";
       public            postgres    false    233            �           2606    26833    roles roles_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_pkey;
       public            postgres    false    221                       2606    27012    userSessions userSessions_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public."userSessions"
    ADD CONSTRAINT "userSessions_pkey" PRIMARY KEY (id);
 L   ALTER TABLE ONLY public."userSessions" DROP CONSTRAINT "userSessions_pkey";
       public            postgres    false    227            
           2606    27064 &   usersPermissions usersPermissions_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public."usersPermissions"
    ADD CONSTRAINT "usersPermissions_pkey" PRIMARY KEY (id);
 T   ALTER TABLE ONLY public."usersPermissions" DROP CONSTRAINT "usersPermissions_pkey";
       public            postgres    false    235            �           2606    26846    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public            postgres    false    223            �           2606    26844    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    223                       2606    27094    visitors visitors_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.visitors
    ADD CONSTRAINT visitors_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.visitors DROP CONSTRAINT visitors_pkey;
       public            postgres    false    239                       2606    26894 '   employees employees_fkDepartmentId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_fkDepartmentId_fkey" FOREIGN KEY ("fkDepartmentId") REFERENCES public.departments(id);
 S   ALTER TABLE ONLY public.employees DROP CONSTRAINT "employees_fkDepartmentId_fkey";
       public          postgres    false    3318    217    226                       2606    26899 (   employees employees_fkDesignationId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_fkDesignationId_fkey" FOREIGN KEY ("fkDesignationId") REFERENCES public.designations(id);
 T   ALTER TABLE ONLY public.employees DROP CONSTRAINT "employees_fkDesignationId_fkey";
       public          postgres    false    3320    219    226                       2606    26889 !   employees employees_fkUserId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_fkUserId_fkey" FOREIGN KEY ("fkUserId") REFERENCES public.users(id);
 M   ALTER TABLE ONLY public.employees DROP CONSTRAINT "employees_fkUserId_fkey";
       public          postgres    false    226    223    3326                       2606    25962 1   leaveComments leaveComments_fkRequestLeaveId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."leaveComments"
    ADD CONSTRAINT "leaveComments_fkRequestLeaveId_fkey" FOREIGN KEY ("fkRequestLeaveId") REFERENCES public."requestLeaves"(id);
 _   ALTER TABLE ONLY public."leaveComments" DROP CONSTRAINT "leaveComments_fkRequestLeaveId_fkey";
       public          postgres    false    214    3314    212                       2606    27036 '   permissions permissions_fkModuleId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT "permissions_fkModuleId_fkey" FOREIGN KEY ("fkModuleId") REFERENCES public.modules(id);
 S   ALTER TABLE ONLY public.permissions DROP CONSTRAINT "permissions_fkModuleId_fkey";
       public          postgres    false    229    231    3332                       2606    25945 0   requestLeaves requestLeaves_fkRequestTypeId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."requestLeaves"
    ADD CONSTRAINT "requestLeaves_fkRequestTypeId_fkey" FOREIGN KEY ("fkRequestTypeId") REFERENCES public."leaveTypes"(id);
 ^   ALTER TABLE ONLY public."requestLeaves" DROP CONSTRAINT "requestLeaves_fkRequestTypeId_fkey";
       public          postgres    false    212    3312    210                       2606    27048 3   rolesPermissions rolesPermissions_permissionId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."rolesPermissions"
    ADD CONSTRAINT "rolesPermissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id);
 a   ALTER TABLE ONLY public."rolesPermissions" DROP CONSTRAINT "rolesPermissions_permissionId_fkey";
       public          postgres    false    3334    233    231                       2606    27053 -   rolesPermissions rolesPermissions_roleId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."rolesPermissions"
    ADD CONSTRAINT "rolesPermissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id);
 [   ALTER TABLE ONLY public."rolesPermissions" DROP CONSTRAINT "rolesPermissions_roleId_fkey";
       public          postgres    false    233    3322    221                       2606    27013 %   userSessions userSessions_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."userSessions"
    ADD CONSTRAINT "userSessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id);
 S   ALTER TABLE ONLY public."userSessions" DROP CONSTRAINT "userSessions_userId_fkey";
       public          postgres    false    3326    227    223                       2606    27065 3   usersPermissions usersPermissions_permissionId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."usersPermissions"
    ADD CONSTRAINT "usersPermissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id);
 a   ALTER TABLE ONLY public."usersPermissions" DROP CONSTRAINT "usersPermissions_permissionId_fkey";
       public          postgres    false    235    231    3334                       2606    27070 -   usersPermissions usersPermissions_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."usersPermissions"
    ADD CONSTRAINT "usersPermissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id);
 [   ALTER TABLE ONLY public."usersPermissions" DROP CONSTRAINT "usersPermissions_userId_fkey";
       public          postgres    false    3326    235    223                       2606    26847    users users_fkRoleId_fkey    FK CONSTRAINT     }   ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_fkRoleId_fkey" FOREIGN KEY ("fkRoleId") REFERENCES public.roles(id);
 E   ALTER TABLE ONLY public.users DROP CONSTRAINT "users_fkRoleId_fkey";
       public          postgres    false    223    3322    221            �   j   x���v
Q���W((M��L�KI-H,*�M�+)Vs�	uV�0�QPwL���Sp�˪�<�RrR� rA�9�%�)
��Eي ���̲T �/��BjZsqq �>$�      �   q   x���v
Q���W((M��L�KI-�L�K,���+Vs�	uV�0�QPwL���S ���%E�%�E�@a�ļ���b��BPjNbIj�Bx~Q�"H:1�$�,���񁐚�\\\ ��&?      �   
   x���          �   
   x���          �   
   x���          �   g   x���v
Q���W((M��L���O)�I-Vs�	uV�0�QP�����%�e�@�_���Դ��$l�P�knAN~e*�&5��$����1�� 1�A�      �   A   x���v
Q���W((M��L�S*H,.�,�,�/*VRs�	uV�0�Q� �P�i��� ��N      �   �   x�M��
�0�w��6[��D:�NQi�{�Dz`U�(H黷��t9���;~V��\+���ڡ܏�Zm��M�aCv�cDHDc��oJ;��vj���Ћ��F;a(���q�&)�ymp����z��3���jk��]��"B���MF���iF��/�����&�?s{
��L�A      �   ^   x���v
Q���W((M��L�+H-��,.���+Vs�	uV�0�QP�L-W��IU�Q ��K2�@�P�i��I��F@SR��� ��/�      �   
   x���          �   Q   x���v
Q���W((M��L�+��I-Vs�	uV�0�QPwL���S�12�K�K�@��%�e�@�_���Դ��� ��      �   O   x���v
Q���W((M��L�S*��I-H-��,.���+VRs�	uV�0�Q� �P�i��I�F`����� k�'�      �   �   x�%OMS�0��+2�TGaH j�k�(�^:6	�~����t��f�����8%��8c�Э[��Q'�SZJ)�;9s7�I
��#P;v�J����0���Ґ�,B� ڎ�b`�`�Y^�z=傉��W
cA%��0���s/�*T}�`����7ʌ2�G�������^,uO��_ݞ�E����苜�g����"VMa���y��l���mѠh���p��?iǹ*��8���4���N�      �   �   x���v
Q���W((M��L�+-N-*Vs�	uV�0�QPO��tH�M���K��U
�%���e��zW���Fy��%G�[��x��囥d%�g8;�f�����y�;�����'&�d��Y�:
@�B}| ��5 S�+�      �   O   x���v
Q���W((M��L�S*-N-*H-��,.���+VRs�	uV�0�Q� �P�i��I�F`����� s�'�      �   b   x���v
Q���W((M��L�+�,�,�/*Vs�	uV�0�QPw��Tp��MLQr�A�0��̼t��ԼĒT�PbrIf����!5���� �]4     