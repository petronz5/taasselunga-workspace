--
-- PostgreSQL database dump
--

\restrict 8GwK23hVvksuplV9lQTydG5N7WGmmGpypjhDiQIMSo3xscrZp4hd6NQbskDuFGj

-- Dumped from database version 16.13
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-25 20:56:14

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
-- TOC entry 3424 (class 0 OID 16435)
-- Dependencies: 216
-- Data for Name: replenishment_request; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.replenishment_request (request_id, product_id, request_date, requested_quantity, status_name, store_id) FROM stdin;
\.


--
-- TOC entry 3426 (class 0 OID 16441)
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
-- TOC entry 3428 (class 0 OID 41052)
-- Dependencies: 220
-- Data for Name: store_stock; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.store_stock (stock_id, store_id, product_id, available_quantity, minimum_level) FROM stdin;
1	1	1	40	15
2	1	2	35	15
3	1	3	8	15
4	1	4	5	20
5	1	5	25	15
6	1	6	30	15
7	1	7	50	20
8	1	8	6	20
9	1	9	28	15
10	1	10	18	10
11	1	11	7	12
12	1	12	20	10
13	1	13	15	10
14	1	14	4	15
15	1	15	22	10
16	1	16	14	8
17	1	17	17	8
\.


--
-- TOC entry 3434 (class 0 OID 0)
-- Dependencies: 215
-- Name: replenishment_request_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.replenishment_request_request_id_seq', 7, true);


--
-- TOC entry 3435 (class 0 OID 0)
-- Dependencies: 217
-- Name: sale_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.sale_id_seq', 6, true);


--
-- TOC entry 3436 (class 0 OID 0)
-- Dependencies: 219
-- Name: store_stock_stock_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.store_stock_stock_id_seq', 17, true);


-- Completed on 2026-05-25 20:56:15

--
-- PostgreSQL database dump complete
--

\unrestrict 8GwK23hVvksuplV9lQTydG5N7WGmmGpypjhDiQIMSo3xscrZp4hd6NQbskDuFGj

