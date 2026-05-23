--
-- PostgreSQL database dump
--

\restrict dezLpcvGR8t4hkVKCgG5hLSv1GzcK2beQ0IjaN83wEXxWs1JPKHP7hWt9yfvems

-- Dumped from database version 16.13
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-15 13:54:50

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
-- TOC entry 3425 (class 0 OID 16410)
-- Dependencies: 216
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.product (id, category, image_url, name, price, barcode) FROM stdin;
1	Latticini	latte-parmalat.jpg	Latte Parmalat 1L	1.3	8002270014901
2	Latticini	yogurt-muller.jpg	Yogurt Muller Bianco 500g	1.89	4008452023412
3	Latticini	mozzarella-santa-lucia.jpg	Mozzarella Santa Lucia 125g	1.49	8000430133033
4	Pasta	spaghetti-barilla.jpg	Spaghetti Barilla 500g	1.2	8013312101017
5	Pasta	penne-de-cecco.jpg	Penne Rigate De Cecco 500g	1.55	8001250120413
6	Pasta e Riso	riso-scotti.jpg	Riso Scotti Carnaroli 1kg	3.49	8001860212001
7	Bevande	acqua-levissima.jpg	Acqua Levissima 1.5L	0.45	8002270112341
8	Bevande	coca-cola.jpg	Coca Cola 1.5L	1.75	5449000000996
9	Bevande	succo-yoga-pesca.jpg	Succo Yoga Pesca 1L	1.35	8003440123450
10	Freschi	uova-aia.jpg	Uova AIA x10	2.8	8006520312456
11	Freschi	prosciutto-rovagnati.jpg	Prosciutto Cotto Rovagnati 100g	2.99	8003310011222
12	Conserve	salsa-mutti.jpg	Salsa Mutti 300g	1.1	8005110123456
13	Scatolame	tonno-rio-mare.jpg	Tonno Rio Mare 3x80g	4.99	8000300123456
14	Snack	pan-di-stelle.jpg	Biscotti Pan di Stelle 350g	3.2	8013312012344
15	Snack	patatine-san-carlo.jpg	Patatine San Carlo Classica 180g	2.1	8006520123456
16	Casa	detersivo-dash.jpg	Detersivo Dash Liquido 1.5L	6.99	8001090123456
17	Casa	carta-regina.jpg	Carta Igienica Regina 4 rotoli	3.49	8004230123456
\.


--
-- TOC entry 3427 (class 0 OID 16418)
-- Dependencies: 218
-- Data for Name: stock; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.stock (stock_id, available_quantity, product_id, minimum_level) FROM stdin;
1	25	1	10
2	18	2	10
3	9	3	15
4	80	4	20
5	60	5	20
6	14	6	25
7	120	7	30
8	70	8	20
9	11	9	20
10	8	10	15
11	22	11	10
12	12	12	20
13	45	13	15
14	5	14	10
15	35	15	15
16	20	16	8
17	7	17	12
\.


--
-- TOC entry 3429 (class 0 OID 16424)
-- Dependencies: 220
-- Data for Name: stock_movement; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.stock_movement (movement_id, movement_quantity, "timestamp", type, stock_id) FROM stdin;
\.


--
-- TOC entry 3435 (class 0 OID 0)
-- Dependencies: 215
-- Name: product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.product_id_seq', 17, true);


--
-- TOC entry 3436 (class 0 OID 0)
-- Dependencies: 219
-- Name: stock_movement_movement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.stock_movement_movement_id_seq', 1, false);


--
-- TOC entry 3437 (class 0 OID 0)
-- Dependencies: 217
-- Name: stock_stock_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.stock_stock_id_seq', 17, true);


-- Completed on 2026-05-15 13:54:51

--
-- PostgreSQL database dump complete
--

\unrestrict dezLpcvGR8t4hkVKCgG5hLSv1GzcK2beQ0IjaN83wEXxWs1JPKHP7hWt9yfvems

