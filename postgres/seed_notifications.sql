--
-- PostgreSQL database dump
--

\restrict 9hr6qwARZFDklvz6O6VKqwrriGhmtrDnDEuiM8x5HbZ2kDxXXPKkfjVOrAr4yZg

-- Dumped from database version 16.13
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-30 20:07:40

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
-- TOC entry 3410 (class 0 OID 24577)
-- Dependencies: 216
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.notifications (id, target_role, title, message, is_read, created_at) FROM stdin;
143	POS	Richiesta di rifornimento inviata	La richiesta di rifornimento per Latte Parmalat 1L è stata inviata al magazzino centrale.	t	2026-05-28 23:28:46.924278
141	INVENTORY	Nuova richiesta POS	Il punto vendita 1 ha richiesto 5 unità di Latte Parmalat 1L.	t	2026-05-28 23:28:46.830359
142	INVENTORY	Nuova richiesta di rifornimento	Il punto vendita ha richiesto rifornimento per Latte Parmalat 1L.	t	2026-05-28 23:28:46.871699
145	POS	Spedizione in arrivo	La spedizione per Latte Parmalat 1L è stata preparata dal magazzino centrale ed è in arrivo al punto vendita.	t	2026-05-28 23:29:30.425347
144	PROCUREMENT	Stock basso	ATTENZIONE: Latte Parmalat 1L è sceso sotto la soglia minima. Giacenza attuale: 196.	t	2026-05-28 23:29:30.361463
149	POS	Merce spedita al punto vendita	Antonio ha spedito 10 unità di Prosciutto Cotto Rovagnati 100g al punto vendita.	t	2026-05-28 23:34:23.242613
150	INVENTORY	Nuova richiesta POS	Il punto vendita 1 ha richiesto 2 unità di Mozzarella Santa Lucia 125g.	t	2026-05-28 23:37:45.415369
151	PROCUREMENT	Sollecito rifornimento da magazzino	Antonio richiede urgentemente un rifornimento di Prosciutto Cotto Rovagnati 100g. Giacenza attuale: 90, soglia minima: 200.	t	2026-05-29 17:53:01.023271
136	PROCUREMENT	Ordine inviato	Nuovo ordine creato: ORD-1780010571053 - Importo: 192.50	t	2026-05-28 23:22:51.474199
135	INVENTORY	Nuovo ordine in arrivo	Nuovo ordine creato: ORD-1780010571053 - Importo: 192.50	t	2026-05-28 23:22:51.465937
138	PROCUREMENT	Ordine inviato	Nuovo ordine creato: ORD-1780010825643 - Importo: 1.55	t	2026-05-28 23:27:05.691942
137	INVENTORY	Nuovo ordine in arrivo	Nuovo ordine creato: ORD-1780010825643 - Importo: 1.55	t	2026-05-28 23:27:05.681687
139	PROCUREMENT	Merce ricevuta in deposito	Antonio ha confermato la ricezione di 1 unità di Penne Rigate De Cecco 500g per l'ordine ORD-1780010825643.	t	2026-05-28 23:27:24.600076
140	PROCUREMENT	Sollecito approvvigionamento	Antonio segnala prodotto sotto soglia: Uova AIA x10. Giacenza attuale: 95, soglia minima: 200.	t	2026-05-28 23:27:48.044624
148	PROCUREMENT	Stock basso	ATTENZIONE: Prosciutto Cotto Rovagnati 100g è sceso sotto la soglia minima. Giacenza attuale: 90.	t	2026-05-28 23:34:23.146014
147	PROCUREMENT	Stock basso	ATTENZIONE: Prosciutto Cotto Rovagnati 100g è sceso sotto la soglia minima. Giacenza attuale: 100.	t	2026-05-28 23:31:13.850649
146	PROCUREMENT	Sollecito rifornimento da magazzino	Antonio richiede urgentemente un rifornimento di Prosciutto Cotto Rovagnati 100g. Giacenza attuale: 130, soglia minima: 200.	t	2026-05-28 23:30:58.180355
\.


--
-- TOC entry 3416 (class 0 OID 0)
-- Dependencies: 215
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.notifications_id_seq', 151, true);


-- Completed on 2026-05-30 20:07:40

--
-- PostgreSQL database dump complete
--

\unrestrict 9hr6qwARZFDklvz6O6VKqwrriGhmtrDnDEuiM8x5HbZ2kDxXXPKkfjVOrAr4yZg

