--
-- PostgreSQL database dump
--

\restrict JcxYxO14ZdUUN4WygQRZCkxqYcDTYulK79U0t0vbAFbvlZMI7m3a2jwNTdSFX4v

-- Dumped from database version 16.14
-- Dumped by pg_dump version 18.3

-- Started on 2026-06-05 23:46:51

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3410 (class 0 OID 24577)
-- Dependencies: 216
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.notifications (id, target_role, title, message, is_read, created_at) FROM stdin;
\.


--
-- TOC entry 3416 (class 0 OID 0)
-- Dependencies: 215
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.notifications_id_seq', 149, true);


-- Completed on 2026-06-05 23:46:51

--
-- PostgreSQL database dump complete
--

\unrestrict JcxYxO14ZdUUN4WygQRZCkxqYcDTYulK79U0t0vbAFbvlZMI7m3a2jwNTdSFX4v

