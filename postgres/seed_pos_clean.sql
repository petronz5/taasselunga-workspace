--
-- PostgreSQL database dump
--

\restrict tu8H6WxFtAsgehK2BGmmJaqqJpdXSDKbAtpiyWtF4PufdAEGi7XqM6Vu3Q9zzT0

-- Dumped from database version 16.14
-- Dumped by pg_dump version 18.3

-- Started on 2026-06-05 23:47:07

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
7	110	100	7	1
1	110	100	1	1
2	85	100	2	1
3	200	100	3	1
4	150	100	4	1
5	120	100	5	1
6	95	100	6	1
8	75	100	8	1
9	60	100	9	1
10	150	100	10	1
11	150	100	11	1
12	130	100	12	1
13	200	100	13	1
14	80	100	14	1
15	200	100	15	1
16	150	100	16	1
17	120	100	17	1
\.


--
-- TOC entry 3434 (class 0 OID 0)
-- Dependencies: 215
-- Name: replenishment_request_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.replenishment_request_request_id_seq', 41, true);


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


-- Completed on 2026-06-05 23:47:07

--
-- PostgreSQL database dump complete
--

\unrestrict tu8H6WxFtAsgehK2BGmmJaqqJpdXSDKbAtpiyWtF4PufdAEGi7XqM6Vu3Q9zzT0

