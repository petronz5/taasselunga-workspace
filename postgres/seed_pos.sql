--
-- PostgreSQL database dump
--

\restrict RCJeagNTziDZhXKEWIgP3k0xX2XYMk5PfzAGUI2tzx60VfyLcT7DAX4KqFGbB9v

-- Dumped from database version 16.13
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-31 23:20:43

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
-- TOC entry 3424 (class 0 OID 24637)
-- Dependencies: 216
-- Data for Name: replenishment_request; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.replenishment_request (request_id, product_id, request_date, requested_quantity, status_name, store_id) FROM stdin;
\.


--
-- TOC entry 3426 (class 0 OID 24643)
-- Dependencies: 218
-- Data for Name: sale; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sale (id, cashier_name, product_id, quantity, sale_date, total_amount) FROM stdin;
\.


--
-- TOC entry 3428 (class 0 OID 24649)
-- Dependencies: 220
-- Data for Name: store_stock; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.store_stock (stock_id, available_quantity, minimum_level, product_id, store_id) FROM stdin;
2	140	100	2	1
15	164	100	15	1
17	170	100	17	1
6	130	100	6	1
14	110	100	14	1
10	188	100	10	1
9	110	100	9	1
16	151	100	16	1
7	59	100	7	1
5	110	100	5	1
8	121	100	8	1
13	196	100	13	1
3	202	100	3	1
4	146	100	4	1
12	161	100	12	1
1	109	100	1	1
11	200	100	11	1
18	31	\N	51	1
\.


--
-- TOC entry 3434 (class 0 OID 0)
-- Dependencies: 215
-- Name: replenishment_request_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.replenishment_request_request_id_seq', 1, false);


--
-- TOC entry 3435 (class 0 OID 0)
-- Dependencies: 217
-- Name: sale_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.sale_id_seq', 1, false);


--
-- TOC entry 3436 (class 0 OID 0)
-- Dependencies: 219
-- Name: store_stock_stock_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.store_stock_stock_id_seq', 18, true);


-- Completed on 2026-05-31 23:20:43

--
-- PostgreSQL database dump complete
--

\unrestrict RCJeagNTziDZhXKEWIgP3k0xX2XYMk5PfzAGUI2tzx60VfyLcT7DAX4KqFGbB9v

