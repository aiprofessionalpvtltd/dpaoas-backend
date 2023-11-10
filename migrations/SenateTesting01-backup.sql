PGDMP     %    %        
    
    {            SenateTesting01    14.9    14.9 E    C           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            D           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            E           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            F           1262    25294    SenateTesting01    DATABASE     u   CREATE DATABASE "SenateTesting01" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'English_United States.1252';
 !   DROP DATABASE "SenateTesting01";
                postgres    false            ]           1247    25388    enum_userSessions_status    TYPE     W   CREATE TYPE public."enum_userSessions_status" AS ENUM (
    'Success',
    'Failed'
);
 -   DROP TYPE public."enum_userSessions_status";
       public          postgres    false            H           1247    25305    enum_users_status    TYPE     ]   CREATE TYPE public.enum_users_status AS ENUM (
    'active',
    'inactive',
    'locked'
);
 $   DROP TYPE public.enum_users_status;
       public          postgres    false            �            1259    25364    modules    TABLE     �   CREATE TABLE public.modules (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.modules;
       public         heap    postgres    false            �            1259    25371    modulesPermissions    TABLE     �   CREATE TABLE public."modulesPermissions" (
    id integer NOT NULL,
    module_id integer,
    permission_id integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 (   DROP TABLE public."modulesPermissions";
       public         heap    postgres    false            �            1259    25370    modulesPermissions_id_seq    SEQUENCE     �   CREATE SEQUENCE public."modulesPermissions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public."modulesPermissions_id_seq";
       public          postgres    false    222            G           0    0    modulesPermissions_id_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public."modulesPermissions_id_seq" OWNED BY public."modulesPermissions".id;
          public          postgres    false    221            �            1259    25363    modules_id_seq    SEQUENCE     �   CREATE SEQUENCE public.modules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.modules_id_seq;
       public          postgres    false    220            H           0    0    modules_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.modules_id_seq OWNED BY public.modules.id;
          public          postgres    false    219            �            1259    25323    permissions    TABLE     �   CREATE TABLE public.permissions (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.permissions;
       public         heap    postgres    false            �            1259    25322    permissions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.permissions_id_seq;
       public          postgres    false    214            I           0    0    permissions_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;
          public          postgres    false    213            �            1259    25296    roles    TABLE     �   CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255),
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.roles;
       public         heap    postgres    false            �            1259    25347    rolesPermissions    TABLE     �   CREATE TABLE public."rolesPermissions" (
    id integer NOT NULL,
    role_id integer,
    permission_id integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
 &   DROP TABLE public."rolesPermissions";
       public         heap    postgres    false            �            1259    25346    rolesPermissions_id_seq    SEQUENCE     �   CREATE SEQUENCE public."rolesPermissions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public."rolesPermissions_id_seq";
       public          postgres    false    218            J           0    0    rolesPermissions_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public."rolesPermissions_id_seq" OWNED BY public."rolesPermissions".id;
          public          postgres    false    217            �            1259    25295    roles_id_seq    SEQUENCE     �   CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.roles_id_seq;
       public          postgres    false    210            K           0    0    roles_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;
          public          postgres    false    209            �            1259    25394    userSessions    TABLE     `  CREATE TABLE public."userSessions" (
    id integer NOT NULL,
    "userId" integer,
    "ipAddress" character varying(255),
    "loggedInAt" timestamp with time zone,
    tokens character varying(255),
    status public."enum_userSessions_status" NOT NULL,
    "updatedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL
);
 "   DROP TABLE public."userSessions";
       public         heap    postgres    false    861            �            1259    25393    userSessions_id_seq    SEQUENCE     �   CREATE SEQUENCE public."userSessions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public."userSessions_id_seq";
       public          postgres    false    224            L           0    0    userSessions_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public."userSessions_id_seq" OWNED BY public."userSessions".id;
          public          postgres    false    223            �            1259    25312    users    TABLE     �  CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "phoneNo" character varying(255) NOT NULL,
    gender character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    status public.enum_users_status DEFAULT 'active'::public.enum_users_status,
    "loginAttempts" integer DEFAULT 3,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
    DROP TABLE public.users;
       public         heap    postgres    false    840    840            �            1259    25330 
   usersRoles    TABLE     �   CREATE TABLE public."usersRoles" (
    id integer NOT NULL,
    user_id integer,
    role_id integer,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);
     DROP TABLE public."usersRoles";
       public         heap    postgres    false            �            1259    25329    usersRoles_id_seq    SEQUENCE     �   CREATE SEQUENCE public."usersRoles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public."usersRoles_id_seq";
       public          postgres    false    216            M           0    0    usersRoles_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public."usersRoles_id_seq" OWNED BY public."usersRoles".id;
          public          postgres    false    215            �            1259    25311    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          postgres    false    212            N           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public          postgres    false    211            �           2604    25367 
   modules id    DEFAULT     h   ALTER TABLE ONLY public.modules ALTER COLUMN id SET DEFAULT nextval('public.modules_id_seq'::regclass);
 9   ALTER TABLE public.modules ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    220    219    220            �           2604    25374    modulesPermissions id    DEFAULT     �   ALTER TABLE ONLY public."modulesPermissions" ALTER COLUMN id SET DEFAULT nextval('public."modulesPermissions_id_seq"'::regclass);
 F   ALTER TABLE public."modulesPermissions" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    221    222    222            �           2604    25326    permissions id    DEFAULT     p   ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);
 =   ALTER TABLE public.permissions ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    213    214    214            �           2604    25299    roles id    DEFAULT     d   ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);
 7   ALTER TABLE public.roles ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    210    209    210            �           2604    25350    rolesPermissions id    DEFAULT     ~   ALTER TABLE ONLY public."rolesPermissions" ALTER COLUMN id SET DEFAULT nextval('public."rolesPermissions_id_seq"'::regclass);
 D   ALTER TABLE public."rolesPermissions" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    218    217    218            �           2604    25397    userSessions id    DEFAULT     v   ALTER TABLE ONLY public."userSessions" ALTER COLUMN id SET DEFAULT nextval('public."userSessions_id_seq"'::regclass);
 @   ALTER TABLE public."userSessions" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    224    223    224            �           2604    25315    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    212    211    212            �           2604    25333    usersRoles id    DEFAULT     r   ALTER TABLE ONLY public."usersRoles" ALTER COLUMN id SET DEFAULT nextval('public."usersRoles_id_seq"'::regclass);
 >   ALTER TABLE public."usersRoles" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    215    216    216            <          0    25364    modules 
   TABLE DATA           E   COPY public.modules (id, name, "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    220   �R       >          0    25371    modulesPermissions 
   TABLE DATA           f   COPY public."modulesPermissions" (id, module_id, permission_id, "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    222   �R       6          0    25323    permissions 
   TABLE DATA           I   COPY public.permissions (id, name, "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    214   �R       2          0    25296    roles 
   TABLE DATA           P   COPY public.roles (id, name, description, "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    210   S       :          0    25347    rolesPermissions 
   TABLE DATA           b   COPY public."rolesPermissions" (id, role_id, permission_id, "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    218   aS       @          0    25394    userSessions 
   TABLE DATA           {   COPY public."userSessions" (id, "userId", "ipAddress", "loggedInAt", tokens, status, "updatedAt", "createdAt") FROM stdin;
    public          postgres    false    224   ~S       4          0    25312    users 
   TABLE DATA           �   COPY public.users (id, name, "phoneNo", gender, email, password, status, "loginAttempts", "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    212   �S       8          0    25330 
   usersRoles 
   TABLE DATA           V   COPY public."usersRoles" (id, user_id, role_id, "createdAt", "updatedAt") FROM stdin;
    public          postgres    false    216   BT       O           0    0    modulesPermissions_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public."modulesPermissions_id_seq"', 1, false);
          public          postgres    false    221            P           0    0    modules_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.modules_id_seq', 1, false);
          public          postgres    false    219            Q           0    0    permissions_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.permissions_id_seq', 1, false);
          public          postgres    false    213            R           0    0    rolesPermissions_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public."rolesPermissions_id_seq"', 1, false);
          public          postgres    false    217            S           0    0    roles_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.roles_id_seq', 1, true);
          public          postgres    false    209            T           0    0    userSessions_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public."userSessions_id_seq"', 1, false);
          public          postgres    false    223            U           0    0    usersRoles_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public."usersRoles_id_seq"', 1, true);
          public          postgres    false    215            V           0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 1, true);
          public          postgres    false    211            �           2606    25376 *   modulesPermissions modulesPermissions_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public."modulesPermissions"
    ADD CONSTRAINT "modulesPermissions_pkey" PRIMARY KEY (id);
 X   ALTER TABLE ONLY public."modulesPermissions" DROP CONSTRAINT "modulesPermissions_pkey";
       public            postgres    false    222            �           2606    25369    modules modules_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.modules DROP CONSTRAINT modules_pkey;
       public            postgres    false    220            �           2606    25328    permissions permissions_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.permissions DROP CONSTRAINT permissions_pkey;
       public            postgres    false    214            �           2606    25352 &   rolesPermissions rolesPermissions_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public."rolesPermissions"
    ADD CONSTRAINT "rolesPermissions_pkey" PRIMARY KEY (id);
 T   ALTER TABLE ONLY public."rolesPermissions" DROP CONSTRAINT "rolesPermissions_pkey";
       public            postgres    false    218            �           2606    25303    roles roles_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_pkey;
       public            postgres    false    210            �           2606    25401    userSessions userSessions_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public."userSessions"
    ADD CONSTRAINT "userSessions_pkey" PRIMARY KEY (id);
 L   ALTER TABLE ONLY public."userSessions" DROP CONSTRAINT "userSessions_pkey";
       public            postgres    false    224            �           2606    25335    usersRoles usersRoles_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public."usersRoles"
    ADD CONSTRAINT "usersRoles_pkey" PRIMARY KEY (id);
 H   ALTER TABLE ONLY public."usersRoles" DROP CONSTRAINT "usersRoles_pkey";
       public            postgres    false    216            �           2606    25321    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    212            �           2606    25377 4   modulesPermissions modulesPermissions_module_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."modulesPermissions"
    ADD CONSTRAINT "modulesPermissions_module_id_fkey" FOREIGN KEY (module_id) REFERENCES public.modules(id);
 b   ALTER TABLE ONLY public."modulesPermissions" DROP CONSTRAINT "modulesPermissions_module_id_fkey";
       public          postgres    false    220    3226    222            �           2606    25382 8   modulesPermissions modulesPermissions_permission_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."modulesPermissions"
    ADD CONSTRAINT "modulesPermissions_permission_id_fkey" FOREIGN KEY (permission_id) REFERENCES public.permissions(id);
 f   ALTER TABLE ONLY public."modulesPermissions" DROP CONSTRAINT "modulesPermissions_permission_id_fkey";
       public          postgres    false    214    3220    222            �           2606    25358 4   rolesPermissions rolesPermissions_permission_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."rolesPermissions"
    ADD CONSTRAINT "rolesPermissions_permission_id_fkey" FOREIGN KEY (permission_id) REFERENCES public.permissions(id);
 b   ALTER TABLE ONLY public."rolesPermissions" DROP CONSTRAINT "rolesPermissions_permission_id_fkey";
       public          postgres    false    3220    214    218            �           2606    25353 .   rolesPermissions rolesPermissions_role_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."rolesPermissions"
    ADD CONSTRAINT "rolesPermissions_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public.roles(id);
 \   ALTER TABLE ONLY public."rolesPermissions" DROP CONSTRAINT "rolesPermissions_role_id_fkey";
       public          postgres    false    218    3216    210            �           2606    25402 %   userSessions userSessions_userId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."userSessions"
    ADD CONSTRAINT "userSessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id);
 S   ALTER TABLE ONLY public."userSessions" DROP CONSTRAINT "userSessions_userId_fkey";
       public          postgres    false    224    3218    212            �           2606    25341 "   usersRoles usersRoles_role_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."usersRoles"
    ADD CONSTRAINT "usersRoles_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public.roles(id);
 P   ALTER TABLE ONLY public."usersRoles" DROP CONSTRAINT "usersRoles_role_id_fkey";
       public          postgres    false    210    216    3216            �           2606    25336 "   usersRoles usersRoles_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."usersRoles"
    ADD CONSTRAINT "usersRoles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id);
 P   ALTER TABLE ONLY public."usersRoles" DROP CONSTRAINT "usersRoles_user_id_fkey";
       public          postgres    false    216    212    3218            <      x������ � �      >      x������ � �      6      x������ � �      2   E   x�3����M�KLO-VH�-�ɯL�RK9���uuM��ͬL��L�L�L�Hq��qqq �      :      x������ � �      @      x������ � �      4   �   x�}ɻ�0 ���+�����2i0���@'�
k�2(�|���Ng8���zo�������[�բ���q��@��"�i2㪻�}�W>��73����)Yt-sUw���R��+5�äs�~���q!F���P��q�*d�?E�1!�(/2      8   .   x�3�4B##c]CC]CC+c3+K=#CmS<R\1z\\\ z��     