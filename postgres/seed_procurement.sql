--
-- PostgreSQL database dump
--

\restrict J2YiX5FPZckThjMYQWGqPWDmfU9vTWZYidoqhE6lRBhhvUDvGSX7q3ANzCDxacn

-- Dumped from database version 16.13
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-31 23:20:29

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
4	2026-05-31 19:22:08.271841	ORD-1780255328275	51	Salame Milano 100g	1	CONSEGNATO	1.9	1.9
3	2026-05-31 19:21:55.908118	ORD-1780255315651	1	Latte Parmalat 1L	1	CONSEGNATO	1.3	1.3
2	2026-05-31 19:21:41.349591	ORD-1780255301451	51	Salame Milano 100g	15	CONSEGNATO	28.5	1.9
1	2026-05-31 19:21:41.061701	ORD-1780255300165	51	Salame Milano 100g	15	CONSEGNATO	28.5	1.9
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

SELECT pg_catalog.setval('public.purchase_order_id_seq', 4, true);


-- Completed on 2026-05-31 23:20:29

--
-- PostgreSQL database dump complete
--

\unrestrict J2YiX5FPZckThjMYQWGqPWDmfU9vTWZYidoqhE6lRBhhvUDvGSX7q3ANzCDxacn

