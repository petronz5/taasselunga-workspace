--
-- PostgreSQL database dump
--

\restrict IJIgpSce41vYhxXv49ACrTkYPG1HPrbyRJzDKXfWCbkH2G0rbf4OUlHIONy1uzM

-- Dumped from database version 16.13
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-15 13:22:07

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3417 (class 0 OID 16435)
-- Dependencies: 216
-- Data for Name: replenishment_request; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.replenishment_request (request_id, product_id, request_date, requested_quantity, status_name, store_id) FROM stdin;
1	3	2026-05-14 13:51:30.732741	30	INVIATA	1
2	6	2026-05-14 13:51:30.732741	25	INVIATA	1
3	9	2026-05-14 13:51:30.732741	40	INVIATA	2
4	10	2026-05-14 13:51:30.732741	35	IN_PREPARAZIONE	2
5	12	2026-05-14 13:51:30.732741	50	INVIATA	3
6	14	2026-05-14 13:51:30.732741	45	CONSEGNATA	3
7	17	2026-05-14 13:51:30.732741	30	INVIATA	1
\.


--
-- TOC entry 3419 (class 0 OID 16441)
-- Dependencies: 218
-- Data for Name: sale; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sale (id, cashier_name, product_id, quantity, sale_date, total_amount) FROM stdin;
1	Mario	1	2	2026-05-14 13:51:22.677815	2.6
2	Giulia	4	3	2026-05-14 13:51:22.677815	3.6
3	Mario	3	3	2026-05-14 13:51:22.677815	4.47
4	Sara	9	2	2026-05-14 13:51:22.677815	2.7
5	Luca	14	5	2026-05-14 13:51:22.677815	16
6	Giulia	17	3	2026-05-14 13:51:22.677815	10.47
\.


--
-- TOC entry 3425 (class 0 OID 0)
-- Dependencies: 215
-- Name: replenishment_request_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.replenishment_request_request_id_seq', 7, true);


--
-- TOC entry 3426 (class 0 OID 0)
-- Dependencies: 217
-- Name: sale_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.sale_id_seq', 6, true);


-- Completed on 2026-05-15 13:22:07

--
-- PostgreSQL database dump complete
--

\unrestrict IJIgpSce41vYhxXv49ACrTkYPG1HPrbyRJzDKXfWCbkH2G0rbf4OUlHIONy1uzM

