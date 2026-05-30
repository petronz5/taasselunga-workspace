--
-- PostgreSQL database dump
--

\restrict ll1Jtn5Z2yKMfnIF3fI6Fndaxb5Blgd0QbxRdjOVyy4nUMeoCOJKObUwZCIh7xB

-- Dumped from database version 16.13
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-30 20:08:15

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
-- TOC entry 3417 (class 0 OID 24588)
-- Dependencies: 216
-- Data for Name: order_line; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.order_line (line_id, product_id, quantity) FROM stdin;
\.


--
-- TOC entry 3419 (class 0 OID 24594)
-- Dependencies: 218
-- Data for Name: purchase_order; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.purchase_order (id, order_date, order_number, product_id, product_name, quantity, status, total_amount, unit_price) FROM stdin;
15	2026-05-28 23:22:51.220042	ORD-1780010571053	8	Coca Cola 1.5L	110	CONSEGNATO	192.5	1.75
16	2026-05-28 23:27:05.650322	ORD-1780010825643	5	Penne Rigate De Cecco 500g	1	CONSEGNATO	1.55	1.55
\.


--
-- TOC entry 3425 (class 0 OID 0)
-- Dependencies: 215
-- Name: order_line_line_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.order_line_line_id_seq', 1, false);


--
-- TOC entry 3426 (class 0 OID 0)
-- Dependencies: 217
-- Name: purchase_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.purchase_order_id_seq', 16, true);


-- Completed on 2026-05-30 20:08:15

--
-- PostgreSQL database dump complete
--

\unrestrict ll1Jtn5Z2yKMfnIF3fI6Fndaxb5Blgd0QbxRdjOVyy4nUMeoCOJKObUwZCIh7xB

