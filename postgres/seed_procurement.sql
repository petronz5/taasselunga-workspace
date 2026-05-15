--
-- PostgreSQL database dump
--

\restrict ZLSCsvD5oZZ7H6UmfOUFa6mBtAtKzgJfSiFY8bykaKD0PpMqDTcKSObt0beFfjQ

-- Dumped from database version 16.13
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-15 13:22:21

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
-- TOC entry 3424 (class 0 OID 16388)
-- Dependencies: 216
-- Data for Name: order_line; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.order_line (line_id, product_id, quantity) FROM stdin;
1	3	100
2	6	80
3	9	120
4	10	90
5	12	100
6	14	70
7	17	60
\.


--
-- TOC entry 3426 (class 0 OID 16394)
-- Dependencies: 218
-- Data for Name: purchase_order; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.purchase_order (id, order_date, order_number, status, supplier_name, total_amount) FROM stdin;
1	2026-05-14	PO-2026-0001	IN_ATTESA	Parmalat S.p.A.	520
2	2026-05-14	PO-2026-0002	INVIATO	Barilla G. e R. Fratelli	780
3	2026-05-14	PO-2026-0003	IN_ATTESA	AIA Alimentari	340
4	2026-05-14	PO-2026-0004	COMPLETATO	Mutti S.p.A.	430
5	2026-05-14	PO-2026-0005	BOZZA	Ferrero Distribuzione	610
6	2026-05-15	ORD-AUTO-1c5e9555	IN_ATTESA	Fornitore Da Assegnare	0
\.


--
-- TOC entry 3428 (class 0 OID 16402)
-- Dependencies: 220
-- Data for Name: supplier; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.supplier (id, contact, email, name, phone, reliability) FROM stdin;
1	Marco Bianchi	forniture@parmalat.it	Parmalat S.p.A.	+39 0521 123456	96
2	Giulia Rossi	ordini@barilla.it	Barilla G. e R. Fratelli	+39 0521 2621	98
3	Luca Ferrero	commerciale@levissima.it	Levissima	+39 0342 900111	94
4	Sara Conti	supply@aia.it	AIA Alimentari	+39 045 8097511	92
5	Paolo Galli	ordini@mutti.it	Mutti S.p.A.	+39 0521 652511	97
6	Elena Costa	b2b@ferrero.com	Ferrero Distribuzione	+39 0173 295111	99
7	Davide Romano	pgitalia@suppliers.com	Procter & Gamble Italia	+39 06 50971	95
\.


--
-- TOC entry 3434 (class 0 OID 0)
-- Dependencies: 215
-- Name: order_line_line_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.order_line_line_id_seq', 7, true);


--
-- TOC entry 3435 (class 0 OID 0)
-- Dependencies: 217
-- Name: purchase_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.purchase_order_id_seq', 5, true);


--
-- TOC entry 3436 (class 0 OID 0)
-- Dependencies: 219
-- Name: supplier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.supplier_id_seq', 7, true);


-- Completed on 2026-05-15 13:22:21

--
-- PostgreSQL database dump complete
--

\unrestrict ZLSCsvD5oZZ7H6UmfOUFa6mBtAtKzgJfSiFY8bykaKD0PpMqDTcKSObt0beFfjQ

