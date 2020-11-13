SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    content character varying NOT NULL,
    "postId" uuid NOT NULL,
    "userId" uuid NOT NULL
);


--
-- Name: follower; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.follower (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "amFollowerId" uuid,
    "followedById" uuid
);


--
-- Name: image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "postId" uuid,
    uri character varying NOT NULL,
    "userId" uuid,
    "messageId" uuid
);


--
-- Name: like; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."like" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "postId" uuid NOT NULL,
    "userId" uuid NOT NULL
);


--
-- Name: message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    message character varying NOT NULL,
    "userId" uuid,
    "sentById" uuid,
    "threadId" uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: post; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying,
    text character varying NOT NULL,
    "userId" uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: thread; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.thread (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now(),
    "userId" uuid,
    last_message character varying
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email text NOT NULL,
    password character varying NOT NULL,
    confirmed boolean DEFAULT false NOT NULL,
    "profileImgUrl" character varying,
    count integer DEFAULT 0 NOT NULL,
    username text NOT NULL
);


--
-- Name: user_followers_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_followers_user (
    "userId_1" uuid NOT NULL,
    "userId_2" uuid NOT NULL
);


--
-- Name: user_following_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_following_user (
    "userId_1" uuid NOT NULL,
    "userId_2" uuid NOT NULL
);


--
-- Name: user_thread_invitations_thread; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_thread_invitations_thread (
    "userId" uuid NOT NULL,
    "threadId" uuid NOT NULL
);


--
-- Name: user_thread_invitations_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_thread_invitations_user (
    "userId_1" uuid NOT NULL,
    "userId_2" uuid NOT NULL
);


--
-- Name: comment PK_0b0e4bbc8415ec426f87f3a88e2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY (id);


--
-- Name: user_following_user PK_2c183a6c043a59133b516d5daa9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_following_user
    ADD CONSTRAINT "PK_2c183a6c043a59133b516d5daa9" PRIMARY KEY ("userId_1", "userId_2");


--
-- Name: follower PK_69e733c097e58ee41a00ccb02d5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.follower
    ADD CONSTRAINT "PK_69e733c097e58ee41a00ccb02d5" PRIMARY KEY (id);


--
-- Name: user_thread_invitations_user PK_7976081102299957540c6dc1d5d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_thread_invitations_user
    ADD CONSTRAINT "PK_7976081102299957540c6dc1d5d" PRIMARY KEY ("userId_1", "userId_2");


--
-- Name: user_thread_invitations_thread PK_8274e65f87421109e32dba0dc87; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_thread_invitations_thread
    ADD CONSTRAINT "PK_8274e65f87421109e32dba0dc87" PRIMARY KEY ("userId", "threadId");


--
-- Name: user_followers_user PK_980ff03f415077df184596dcf73; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_followers_user
    ADD CONSTRAINT "PK_980ff03f415077df184596dcf73" PRIMARY KEY ("userId_1", "userId_2");


--
-- Name: message PK_ba01f0a3e0123651915008bc578; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY (id);


--
-- Name: post PK_be5fda3aac270b134ff9c21cdee; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY (id);


--
-- Name: product PK_bebc9158e480b949565b4dc7a82; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY (id);


--
-- Name: thread PK_cabc0f3f27d7b1c70cf64623e02; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thread
    ADD CONSTRAINT "PK_cabc0f3f27d7b1c70cf64623e02" PRIMARY KEY (id);


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: image PK_d6db1ab4ee9ad9dbe86c64e4cc3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT "PK_d6db1ab4ee9ad9dbe86c64e4cc3" PRIMARY KEY (id);


--
-- Name: like PK_eff3e46d24d416b52a7e0ae4159; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."like"
    ADD CONSTRAINT "PK_eff3e46d24d416b52a7e0ae4159" PRIMARY KEY (id);


--
-- Name: user UQ_78a916df40e02a9deb1c4b75edb; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE (username);


--
-- Name: user UQ_e12875dfb3b1d92d7d7c5377e22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: IDX_110f993e5e9213a7a44f172b26; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_110f993e5e9213a7a44f172b26" ON public.user_followers_user USING btree ("userId_2");


--
-- Name: IDX_147ef355adf8a337b32016ae2f; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_147ef355adf8a337b32016ae2f" ON public.user_thread_invitations_user USING btree ("userId_2");


--
-- Name: IDX_2107c51cd7db9efac1a4ddb7b4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_2107c51cd7db9efac1a4ddb7b4" ON public.user_thread_invitations_thread USING btree ("threadId");


--
-- Name: IDX_26312a1e34901011fc6f63545e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_26312a1e34901011fc6f63545e" ON public.user_followers_user USING btree ("userId_1");


--
-- Name: IDX_7642a95915ec98698382b77b3b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_7642a95915ec98698382b77b3b" ON public.user_thread_invitations_thread USING btree ("userId");


--
-- Name: IDX_9691163a986dfb589a90dea3d5; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_9691163a986dfb589a90dea3d5" ON public.user_following_user USING btree ("userId_1");


--
-- Name: IDX_a89f5a432c1edcd03a3b655532; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_a89f5a432c1edcd03a3b655532" ON public.user_following_user USING btree ("userId_2");


--
-- Name: IDX_b6f2e6e252f1f5bc6090c7e58a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_b6f2e6e252f1f5bc6090c7e58a" ON public.user_thread_invitations_user USING btree ("userId_1");


--
-- Name: user_followers_user FK_110f993e5e9213a7a44f172b264; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_followers_user
    ADD CONSTRAINT "FK_110f993e5e9213a7a44f172b264" FOREIGN KEY ("userId_2") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: user_thread_invitations_user FK_147ef355adf8a337b32016ae2ff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_thread_invitations_user
    ADD CONSTRAINT "FK_147ef355adf8a337b32016ae2ff" FOREIGN KEY ("userId_2") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: message FK_16dc5617e9947f29b7bb1cb2410; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT "FK_16dc5617e9947f29b7bb1cb2410" FOREIGN KEY ("sentById") REFERENCES public."user"(id);


--
-- Name: user_thread_invitations_thread FK_2107c51cd7db9efac1a4ddb7b4d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_thread_invitations_thread
    ADD CONSTRAINT "FK_2107c51cd7db9efac1a4ddb7b4d" FOREIGN KEY ("threadId") REFERENCES public.thread(id) ON DELETE CASCADE;


--
-- Name: user_followers_user FK_26312a1e34901011fc6f63545e2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_followers_user
    ADD CONSTRAINT "FK_26312a1e34901011fc6f63545e2" FOREIGN KEY ("userId_1") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: like FK_3acf7c55c319c4000e8056c1279; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."like"
    ADD CONSTRAINT "FK_3acf7c55c319c4000e8056c1279" FOREIGN KEY ("postId") REFERENCES public.post(id);


--
-- Name: message FK_446251f8ceb2132af01b68eb593; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT "FK_446251f8ceb2132af01b68eb593" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: thread FK_57782d1d6ab602aa9ff43cf30a2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.thread
    ADD CONSTRAINT "FK_57782d1d6ab602aa9ff43cf30a2" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: post FK_5c1cf55c308037b5aca1038a131; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT "FK_5c1cf55c308037b5aca1038a131" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: image FK_72da7f42d43f0be3b3ef35692a0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT "FK_72da7f42d43f0be3b3ef35692a0" FOREIGN KEY ("postId") REFERENCES public.post(id);


--
-- Name: user_thread_invitations_thread FK_7642a95915ec98698382b77b3bd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_thread_invitations_thread
    ADD CONSTRAINT "FK_7642a95915ec98698382b77b3bd" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: comment FK_94a85bb16d24033a2afdd5df060; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "FK_94a85bb16d24033a2afdd5df060" FOREIGN KEY ("postId") REFERENCES public.post(id);


--
-- Name: user_following_user FK_9691163a986dfb589a90dea3d5f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_following_user
    ADD CONSTRAINT "FK_9691163a986dfb589a90dea3d5f" FOREIGN KEY ("userId_1") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: message FK_97e5c5b5590c682a6c487816b6b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT "FK_97e5c5b5590c682a6c487816b6b" FOREIGN KEY ("threadId") REFERENCES public.thread(id);


--
-- Name: user_following_user FK_a89f5a432c1edcd03a3b6555321; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_following_user
    ADD CONSTRAINT "FK_a89f5a432c1edcd03a3b6555321" FOREIGN KEY ("userId_2") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: user_thread_invitations_user FK_b6f2e6e252f1f5bc6090c7e58a2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_thread_invitations_user
    ADD CONSTRAINT "FK_b6f2e6e252f1f5bc6090c7e58a2" FOREIGN KEY ("userId_1") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: comment FK_c0354a9a009d3bb45a08655ce3b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: image FK_dc40417dfa0c7fbd70b8eb880cc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT "FK_dc40417dfa0c7fbd70b8eb880cc" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: like FK_e8fb739f08d47955a39850fac23; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."like"
    ADD CONSTRAINT "FK_e8fb739f08d47955a39850fac23" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: image FK_f69c7f02013805481ec0edcf3ea; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT "FK_f69c7f02013805481ec0edcf3ea" FOREIGN KEY ("messageId") REFERENCES public.message(id);


--
-- PostgreSQL database dump complete
--


--
-- Dbmate schema migrations
--

