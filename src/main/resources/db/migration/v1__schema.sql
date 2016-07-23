--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.3
-- Dumped by pg_dump version 9.5.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: routing; Type: SCHEMA; Schema: -; Owner: eduardo
--

CREATE SCHEMA routing;


ALTER SCHEMA routing OWNER TO eduardo;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry, geography, and raster spatial types and functions';


--
-- Name: pgrouting; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS pgrouting WITH SCHEMA public;


--
-- Name: EXTENSION pgrouting; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgrouting IS 'pgRouting Extension';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE ar_internal_metadata OWNER TO postgres;

--
-- Name: line_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE line_groups (
    id integer NOT NULL,
    name character varying,
    city character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE line_groups OWNER TO postgres;

--
-- Name: line_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE line_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE line_groups_id_seq OWNER TO postgres;

--
-- Name: line_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE line_groups_id_seq OWNED BY line_groups.id;


--
-- Name: lines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE lines (
    id integer NOT NULL,
    identifier character varying,
    name character varying,
    line_group_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    timetable_link character varying,
    itinerary_link character varying,
    path character varying[] DEFAULT '{}'::character varying[]
);


ALTER TABLE lines OWNER TO postgres;

--
-- Name: lines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE lines_id_seq OWNER TO postgres;

--
-- Name: lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE lines_id_seq OWNED BY lines.id;


--
-- Name: points; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE points (
    id integer NOT NULL,
    "position" geography(Point,4326),
    name character varying,
    notable_name character varying,
    notable boolean,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    waypoint boolean DEFAULT false,
    heading numeric(16,5)
);


ALTER TABLE points OWNER TO postgres;

--
-- Name: points_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE points_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE points_id_seq OWNER TO postgres;

--
-- Name: points_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE points_id_seq OWNED BY points.id;


--
-- Name: route_points; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE route_points (
    id integer NOT NULL,
    route_id integer,
    point_id integer,
    "order" integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    polyline_index integer,
    closest_way bigint
);


ALTER TABLE route_points OWNER TO postgres;

--
-- Name: route_points_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE route_points_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE route_points_id_seq OWNER TO postgres;

--
-- Name: route_points_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE route_points_id_seq OWNED BY route_points.id;


--
-- Name: routes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE routes (
    id integer NOT NULL,
    observation character varying,
    route geometry(LineString,4326),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    line_id integer,
    origin character varying,
    destination character varying
);


ALTER TABLE routes OWNER TO postgres;

--
-- Name: routes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE routes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE routes_id_seq OWNER TO postgres;

--
-- Name: routes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE routes_id_seq OWNED BY routes.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE schema_migrations (
    version character varying NOT NULL
);


ALTER TABLE schema_migrations OWNER TO postgres;

--
-- Name: timetables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE timetables (
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    sunday boolean,
    monday boolean,
    tuesday boolean,
    wednesday boolean,
    thursday boolean,
    friday boolean,
    saturday boolean,
    "time" time without time zone NOT NULL,
    route_id integer
);


ALTER TABLE timetables OWNER TO postgres;

--
-- Name: timetables_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE timetables_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE timetables_id_seq OWNER TO postgres;

--
-- Name: timetables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE timetables_id_seq OWNED BY timetables.id;


SET search_path = routing, pg_catalog;

--
-- Name: osm_nodes; Type: TABLE; Schema: routing; Owner: postgres
--

CREATE TABLE osm_nodes (
    node_id bigint NOT NULL,
    osm_id bigint,
    lon numeric(11,8),
    lat numeric(11,8),
    numofuse integer,
    the_geom public.geometry(Point,4326)
);


ALTER TABLE osm_nodes OWNER TO postgres;

--
-- Name: osm_nodes_node_id_seq; Type: SEQUENCE; Schema: routing; Owner: postgres
--

CREATE SEQUENCE osm_nodes_node_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE osm_nodes_node_id_seq OWNER TO postgres;

--
-- Name: osm_nodes_node_id_seq; Type: SEQUENCE OWNED BY; Schema: routing; Owner: postgres
--

ALTER SEQUENCE osm_nodes_node_id_seq OWNED BY osm_nodes.node_id;


--
-- Name: osm_relations; Type: TABLE; Schema: routing; Owner: postgres
--

CREATE TABLE osm_relations (
    relation_id bigint,
    type_id integer,
    class_id integer,
    name text
);


ALTER TABLE osm_relations OWNER TO postgres;

--
-- Name: osm_way_classes; Type: TABLE; Schema: routing; Owner: postgres
--

CREATE TABLE osm_way_classes (
    class_id integer NOT NULL,
    type_id integer,
    name text,
    priority double precision,
    default_maxspeed integer
);


ALTER TABLE osm_way_classes OWNER TO postgres;

--
-- Name: osm_way_tags; Type: TABLE; Schema: routing; Owner: postgres
--

CREATE TABLE osm_way_tags (
    class_id integer,
    way_id bigint
);


ALTER TABLE osm_way_tags OWNER TO postgres;

--
-- Name: osm_way_types; Type: TABLE; Schema: routing; Owner: postgres
--

CREATE TABLE osm_way_types (
    type_id integer NOT NULL,
    name text
);


ALTER TABLE osm_way_types OWNER TO postgres;

--
-- Name: relations_ways; Type: TABLE; Schema: routing; Owner: postgres
--

CREATE TABLE relations_ways (
    relation_id bigint,
    way_id bigint,
    type character varying(200)
);


ALTER TABLE relations_ways OWNER TO postgres;

--
-- Name: ways; Type: TABLE; Schema: routing; Owner: postgres
--

CREATE TABLE ways (
    gid bigint NOT NULL,
    class_id integer NOT NULL,
    length double precision,
    length_m double precision,
    name text,
    source bigint,
    target bigint,
    x1 double precision,
    y1 double precision,
    x2 double precision,
    y2 double precision,
    cost double precision,
    reverse_cost double precision,
    cost_s double precision,
    reverse_cost_s double precision,
    rule text,
    one_way integer,
    maxspeed_forward integer,
    maxspeed_backward integer,
    osm_id bigint,
    source_osm bigint,
    target_osm bigint,
    priority double precision DEFAULT 1,
    the_geom public.geometry(LineString,4326)
);


ALTER TABLE ways OWNER TO postgres;

--
-- Name: ways_gid_seq; Type: SEQUENCE; Schema: routing; Owner: postgres
--

CREATE SEQUENCE ways_gid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE ways_gid_seq OWNER TO postgres;

--
-- Name: ways_gid_seq; Type: SEQUENCE OWNED BY; Schema: routing; Owner: postgres
--

ALTER SEQUENCE ways_gid_seq OWNED BY ways.gid;


--
-- Name: ways_vertices_pgr; Type: TABLE; Schema: routing; Owner: postgres
--

CREATE TABLE ways_vertices_pgr (
    id bigint NOT NULL,
    osm_id bigint,
    cnt integer,
    chk integer,
    ein integer,
    eout integer,
    lon numeric(11,8),
    lat numeric(11,8),
    the_geom public.geometry(Point,4326)
);


ALTER TABLE ways_vertices_pgr OWNER TO postgres;

--
-- Name: ways_vertices_pgr_id_seq; Type: SEQUENCE; Schema: routing; Owner: postgres
--

CREATE SEQUENCE ways_vertices_pgr_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE ways_vertices_pgr_id_seq OWNER TO postgres;

--
-- Name: ways_vertices_pgr_id_seq; Type: SEQUENCE OWNED BY; Schema: routing; Owner: postgres
--

ALTER SEQUENCE ways_vertices_pgr_id_seq OWNED BY ways_vertices_pgr.id;


SET search_path = public, pg_catalog;

--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY line_groups ALTER COLUMN id SET DEFAULT nextval('line_groups_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY lines ALTER COLUMN id SET DEFAULT nextval('lines_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY points ALTER COLUMN id SET DEFAULT nextval('points_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY route_points ALTER COLUMN id SET DEFAULT nextval('route_points_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY routes ALTER COLUMN id SET DEFAULT nextval('routes_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY timetables ALTER COLUMN id SET DEFAULT nextval('timetables_id_seq'::regclass);


SET search_path = routing, pg_catalog;

--
-- Name: node_id; Type: DEFAULT; Schema: routing; Owner: postgres
--

ALTER TABLE ONLY osm_nodes ALTER COLUMN node_id SET DEFAULT nextval('osm_nodes_node_id_seq'::regclass);


--
-- Name: gid; Type: DEFAULT; Schema: routing; Owner: postgres
--

ALTER TABLE ONLY ways ALTER COLUMN gid SET DEFAULT nextval('ways_gid_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: routing; Owner: postgres
--

ALTER TABLE ONLY ways_vertices_pgr ALTER COLUMN id SET DEFAULT nextval('ways_vertices_pgr_id_seq'::regclass);


SET search_path = public, pg_catalog;

--
-- Name: ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: line_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY line_groups
    ADD CONSTRAINT line_groups_pkey PRIMARY KEY (id);


--
-- Name: lines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY lines
    ADD CONSTRAINT lines_pkey PRIMARY KEY (id);


--
-- Name: points_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY points
    ADD CONSTRAINT points_pkey PRIMARY KEY (id);


--
-- Name: route_points_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY route_points
    ADD CONSTRAINT route_points_pkey PRIMARY KEY (id);


--
-- Name: routes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY routes
    ADD CONSTRAINT routes_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: timetables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY timetables
    ADD CONSTRAINT timetables_pkey PRIMARY KEY (id);


SET search_path = routing, pg_catalog;

--
-- Name: node_id; Type: CONSTRAINT; Schema: routing; Owner: postgres
--

ALTER TABLE ONLY osm_nodes
    ADD CONSTRAINT node_id UNIQUE (osm_id);


--
-- Name: osm_nodes_pkey; Type: CONSTRAINT; Schema: routing; Owner: postgres
--

ALTER TABLE ONLY osm_nodes
    ADD CONSTRAINT osm_nodes_pkey PRIMARY KEY (node_id);


--
-- Name: osm_way_classes_pkey; Type: CONSTRAINT; Schema: routing; Owner: postgres
--

ALTER TABLE ONLY osm_way_classes
    ADD CONSTRAINT osm_way_classes_pkey PRIMARY KEY (class_id);


--
-- Name: osm_way_types_pkey; Type: CONSTRAINT; Schema: routing; Owner: postgres
--

ALTER TABLE ONLY osm_way_types
    ADD CONSTRAINT osm_way_types_pkey PRIMARY KEY (type_id);


--
-- Name: vertex_id; Type: CONSTRAINT; Schema: routing; Owner: postgres
--

ALTER TABLE ONLY ways_vertices_pgr
    ADD CONSTRAINT vertex_id UNIQUE (osm_id);


--
-- Name: ways_pkey; Type: CONSTRAINT; Schema: routing; Owner: postgres
--

ALTER TABLE ONLY ways
    ADD CONSTRAINT ways_pkey PRIMARY KEY (gid);


--
-- Name: ways_vertices_pgr_pkey; Type: CONSTRAINT; Schema: routing; Owner: postgres
--

ALTER TABLE ONLY ways_vertices_pgr
    ADD CONSTRAINT ways_vertices_pgr_pkey PRIMARY KEY (id);


SET search_path = public, pg_catalog;

--
-- Name: index_lines_on_line_group_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_lines_on_line_group_id ON lines USING btree (line_group_id);


--
-- Name: index_route_points_on_point_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_route_points_on_point_id ON route_points USING btree (point_id);


--
-- Name: index_route_points_on_route_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_route_points_on_route_id ON route_points USING btree (route_id);


--
-- Name: index_routes_on_line_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_routes_on_line_id ON routes USING btree (line_id);


--
-- Name: index_timetables_on_route_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX index_timetables_on_route_id ON timetables USING btree (route_id);


SET search_path = routing, pg_catalog;

--
-- Name: ways_gdx; Type: INDEX; Schema: routing; Owner: postgres
--

CREATE INDEX ways_gdx ON ways USING gist (the_geom);


--
-- Name: ways_source_idx; Type: INDEX; Schema: routing; Owner: postgres
--

CREATE INDEX ways_source_idx ON ways USING btree (source);


--
-- Name: ways_source_osm_idx; Type: INDEX; Schema: routing; Owner: postgres
--

CREATE INDEX ways_source_osm_idx ON ways USING btree (source_osm);


--
-- Name: ways_target_idx; Type: INDEX; Schema: routing; Owner: postgres
--

CREATE INDEX ways_target_idx ON ways USING btree (target);


--
-- Name: ways_target_osm_idx; Type: INDEX; Schema: routing; Owner: postgres
--

CREATE INDEX ways_target_osm_idx ON ways USING btree (target_osm);


--
-- Name: ways_vertices_pgr_gdx; Type: INDEX; Schema: routing; Owner: postgres
--

CREATE INDEX ways_vertices_pgr_gdx ON ways_vertices_pgr USING gist (the_geom);


--
-- Name: ways_vertices_pgr_osm_id_idx; Type: INDEX; Schema: routing; Owner: postgres
--

CREATE INDEX ways_vertices_pgr_osm_id_idx ON ways_vertices_pgr USING btree (osm_id);


SET search_path = public, pg_catalog;

--
-- Name: fk_rails_0c08ddb811; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY route_points
    ADD CONSTRAINT fk_rails_0c08ddb811 FOREIGN KEY (closest_way) REFERENCES routing.ways(gid);


--
-- Name: fk_rails_0f75196a8c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY lines
    ADD CONSTRAINT fk_rails_0f75196a8c FOREIGN KEY (line_group_id) REFERENCES line_groups(id);


--
-- Name: fk_rails_20979e2594; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY routes
    ADD CONSTRAINT fk_rails_20979e2594 FOREIGN KEY (line_id) REFERENCES lines(id);


--
-- Name: fk_rails_23b66d0c28; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY timetables
    ADD CONSTRAINT fk_rails_23b66d0c28 FOREIGN KEY (route_id) REFERENCES routes(id);


--
-- Name: fk_rails_521d5f75d4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY route_points
    ADD CONSTRAINT fk_rails_521d5f75d4 FOREIGN KEY (point_id) REFERENCES points(id);


--
-- Name: fk_rails_a59d378d3c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY route_points
    ADD CONSTRAINT fk_rails_a59d378d3c FOREIGN KEY (route_id) REFERENCES routes(id);


--
-- Name: public; Type: ACL; Schema: -; Owner: eduardo
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM eduardo;
GRANT ALL ON SCHEMA public TO eduardo;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

