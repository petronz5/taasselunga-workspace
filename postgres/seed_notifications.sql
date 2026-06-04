--
-- PostgreSQL database dump
--

\restrict aOFUH8K4eYAvvhkmdVGcaXtk0UVTXtGYLgWTyeoklk9SeSge07xoo4XdnDJ3whH

-- Dumped from database version 16.13
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-31 23:21:00

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 216 (class 1259 OID 24577)
-- Name: notifications; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    target_role character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO root;

--
-- TOC entry 215 (class 1259 OID 24576)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO root;

--
-- TOC entry 3419 (class 0 OID 0)
-- Dependencies: 215
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 3264 (class 2604 OID 24580)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 3413 (class 0 OID 24577)
-- Dependencies: 216
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.notifications (id, target_role, title, message, is_read, created_at) FROM stdin;
4	PROCUREMENT	Ordine inviato	Nuovo ordine creato: ORD-1780255300165 - Importo: 28.50	t	2026-05-31 19:21:41.455324
6	PROCUREMENT	Ordine inviato	Nuovo ordine creato: ORD-1780255315651 - Importo: 1.30	t	2026-05-31 19:21:55.921835
8	PROCUREMENT	Ordine inviato	Nuovo ordine creato: ORD-1780255328275 - Importo: 1.90	t	2026-05-31 19:22:08.286056
1	INVENTORY	Nuovo ordine in arrivo	Nuovo ordine creato: ORD-1780255300165 - Importo: 28.50	t	2026-05-31 19:21:41.442955
5	INVENTORY	Nuovo ordine in arrivo	Nuovo ordine creato: ORD-1780255315651 - Importo: 1.30	t	2026-05-31 19:21:55.915288
7	INVENTORY	Nuovo ordine in arrivo	Nuovo ordine creato: ORD-1780255328275 - Importo: 1.90	t	2026-05-31 19:22:08.277847
3	PROCUREMENT	Ordine inviato	Nuovo ordine creato: ORD-1780255301451 - Importo: 28.50	t	2026-05-31 19:21:41.454464
2	INVENTORY	Nuovo ordine in arrivo	Nuovo ordine creato: ORD-1780255301451 - Importo: 28.50	t	2026-05-31 19:21:41.440052
9	PROCUREMENT	Merce ricevuta in deposito	Antonio ha confermato la ricezione di 1 unità di Salame Milano 100g per l'ordine ORD-1780255328275.	f	2026-05-31 19:22:59.588303
10	PROCUREMENT	Merce ricevuta in deposito	Antonio ha confermato la ricezione di 1 unità di Latte Parmalat 1L per l'ordine ORD-1780255315651.	f	2026-05-31 19:23:00.835155
11	PROCUREMENT	Merce ricevuta in deposito	Antonio ha confermato la ricezione di 15 unità di Salame Milano 100g per l'ordine ORD-1780255301451.	f	2026-05-31 19:23:01.93815
12	PROCUREMENT	Merce ricevuta in deposito	Antonio ha confermato la ricezione di 15 unità di Salame Milano 100g per l'ordine ORD-1780255300165.	f	2026-05-31 19:23:03.103675
13	POS	Merce spedita al punto vendita	Il magazzino ha spedito 31 unità di Salame Milano 100g al punto vendita Taasselunga Torino - Via Po.	t	2026-05-31 19:23:47.31748
\.


--
-- TOC entry 3420 (class 0 OID 0)
-- Dependencies: 215
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.notifications_id_seq', 13, true);


--
-- TOC entry 3268 (class 2606 OID 24586)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


-- Completed on 2026-05-31 23:21:00

--
-- PostgreSQL database dump complete
--

\unrestrict aOFUH8K4eYAvvhkmdVGcaXtk0UVTXtGYLgWTyeoklk9SeSge07xoo4XdnDJ3whH

