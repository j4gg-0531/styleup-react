drop extension if exists "pg_net";

create sequence "public"."historial_citas_id_seq";

create sequence "public"."seq_citas";

create sequence "public"."seq_especialidades";

create sequence "public"."seq_estados";


  create table "public"."barberos" (
    "cedula_barbero" character varying(10) not null,
    "nombre" character varying(100) not null,
    "apellido" character varying(100) not null,
    "telefono" character varying(20),
    "correo" character varying(150) not null,
    "contrasena" character varying(255) not null,
    "id_especialidad" integer,
    "fecha_registro" timestamp without time zone default now(),
    "direccion" character varying(200),
    "ciudad" character varying(100),
    "telegram_chat_id" character varying(50)
      );



  create table "public"."citas" (
    "id_cita" character varying(15) not null,
    "cedula_cliente" character varying(10) not null,
    "cedula_barbero" character varying(10) not null,
    "fecha" date not null,
    "hora" time without time zone not null,
    "id_especialidad" integer not null,
    "estado" character varying(20) not null default 'Pendiente'::character varying
      );



  create table "public"."clientes" (
    "cedula_cliente" character varying(10) not null,
    "nombre" character varying(100) not null,
    "apellido" character varying(100) not null,
    "telefono" character varying(20),
    "correo" character varying(150) not null,
    "contrasena" character varying(255) not null,
    "fecha_registro" timestamp without time zone default now(),
    "telegram_chat_id" character varying(50)
      );



  create table "public"."especialidades" (
    "id_especialidad" integer not null default nextval('public.seq_especialidades'::regclass),
    "especialidad" character varying(100) not null,
    "tiempo_estimado" integer not null
      );



  create table "public"."estados" (
    "id_estado" integer not null default nextval('public.seq_estados'::regclass),
    "estado" character varying(50) not null
      );



  create table "public"."historial_citas" (
    "id" integer not null default nextval('public.historial_citas_id_seq'::regclass),
    "id_cita" character varying(15) not null,
    "cedula_cliente" character varying(10) not null,
    "fecha" timestamp without time zone default now()
      );



  create table "public"."horario_barbero" (
    "cedula_barbero" character varying(10) not null,
    "id_estado" integer not null,
    "hora_inicio" time without time zone not null,
    "hora_fin" time without time zone not null,
    "fecha" date not null
      );



  create table "public"."precios_barbero" (
    "cedula_barbero" character varying(10) not null,
    "id_especialidad" integer not null,
    "precio" numeric(10,2) not null,
    "moneda" character varying(5) not null default 'COP'::character varying,
    "fecha_actualizacion" timestamp without time zone default now()
      );


alter sequence "public"."historial_citas_id_seq" owned by "public"."historial_citas"."id";

CREATE UNIQUE INDEX barberos_correo_key ON public.barberos USING btree (correo);

CREATE UNIQUE INDEX barberos_pkey ON public.barberos USING btree (cedula_barbero);

CREATE UNIQUE INDEX citas_pkey ON public.citas USING btree (id_cita);

CREATE UNIQUE INDEX clientes_correo_key ON public.clientes USING btree (correo);

CREATE UNIQUE INDEX clientes_pkey ON public.clientes USING btree (cedula_cliente);

CREATE UNIQUE INDEX especialidades_pkey ON public.especialidades USING btree (id_especialidad);

CREATE UNIQUE INDEX estados_pkey ON public.estados USING btree (id_estado);

CREATE UNIQUE INDEX historial_citas_pkey ON public.historial_citas USING btree (id);

CREATE UNIQUE INDEX horario_barbero_pkey ON public.horario_barbero USING btree (cedula_barbero, fecha);

CREATE UNIQUE INDEX precios_barbero_pkey ON public.precios_barbero USING btree (cedula_barbero, id_especialidad);

alter table "public"."barberos" add constraint "barberos_pkey" PRIMARY KEY using index "barberos_pkey";

alter table "public"."citas" add constraint "citas_pkey" PRIMARY KEY using index "citas_pkey";

alter table "public"."clientes" add constraint "clientes_pkey" PRIMARY KEY using index "clientes_pkey";

alter table "public"."especialidades" add constraint "especialidades_pkey" PRIMARY KEY using index "especialidades_pkey";

alter table "public"."estados" add constraint "estados_pkey" PRIMARY KEY using index "estados_pkey";

alter table "public"."historial_citas" add constraint "historial_citas_pkey" PRIMARY KEY using index "historial_citas_pkey";

alter table "public"."horario_barbero" add constraint "horario_barbero_pkey" PRIMARY KEY using index "horario_barbero_pkey";

alter table "public"."precios_barbero" add constraint "precios_barbero_pkey" PRIMARY KEY using index "precios_barbero_pkey";

alter table "public"."barberos" add constraint "barberos_correo_key" UNIQUE using index "barberos_correo_key";

alter table "public"."barberos" add constraint "barberos_id_especialidad_fkey" FOREIGN KEY (id_especialidad) REFERENCES public.especialidades(id_especialidad) not valid;

alter table "public"."barberos" validate constraint "barberos_id_especialidad_fkey";

alter table "public"."citas" add constraint "citas_cedula_barbero_fkey" FOREIGN KEY (cedula_barbero) REFERENCES public.barberos(cedula_barbero) not valid;

alter table "public"."citas" validate constraint "citas_cedula_barbero_fkey";

alter table "public"."citas" add constraint "citas_cedula_cliente_fkey" FOREIGN KEY (cedula_cliente) REFERENCES public.clientes(cedula_cliente) not valid;

alter table "public"."citas" validate constraint "citas_cedula_cliente_fkey";

alter table "public"."citas" add constraint "citas_estado_check" CHECK (((estado)::text = ANY ((ARRAY['Pendiente'::character varying, 'Completada'::character varying, 'Cancelada'::character varying])::text[]))) not valid;

alter table "public"."citas" validate constraint "citas_estado_check";

alter table "public"."citas" add constraint "citas_id_especialidad_fkey" FOREIGN KEY (id_especialidad) REFERENCES public.especialidades(id_especialidad) not valid;

alter table "public"."citas" validate constraint "citas_id_especialidad_fkey";

alter table "public"."clientes" add constraint "clientes_correo_key" UNIQUE using index "clientes_correo_key";

alter table "public"."historial_citas" add constraint "historial_citas_cedula_cliente_fkey" FOREIGN KEY (cedula_cliente) REFERENCES public.clientes(cedula_cliente) not valid;

alter table "public"."historial_citas" validate constraint "historial_citas_cedula_cliente_fkey";

alter table "public"."historial_citas" add constraint "historial_citas_id_cita_fkey" FOREIGN KEY (id_cita) REFERENCES public.citas(id_cita) not valid;

alter table "public"."historial_citas" validate constraint "historial_citas_id_cita_fkey";

alter table "public"."horario_barbero" add constraint "horario_barbero_cedula_barbero_fkey" FOREIGN KEY (cedula_barbero) REFERENCES public.barberos(cedula_barbero) not valid;

alter table "public"."horario_barbero" validate constraint "horario_barbero_cedula_barbero_fkey";

alter table "public"."horario_barbero" add constraint "horario_barbero_id_estado_fkey" FOREIGN KEY (id_estado) REFERENCES public.estados(id_estado) not valid;

alter table "public"."horario_barbero" validate constraint "horario_barbero_id_estado_fkey";

alter table "public"."precios_barbero" add constraint "precios_barbero_cedula_barbero_fkey" FOREIGN KEY (cedula_barbero) REFERENCES public.barberos(cedula_barbero) not valid;

alter table "public"."precios_barbero" validate constraint "precios_barbero_cedula_barbero_fkey";

alter table "public"."precios_barbero" add constraint "precios_barbero_id_especialidad_fkey" FOREIGN KEY (id_especialidad) REFERENCES public.especialidades(id_especialidad) not valid;

alter table "public"."precios_barbero" validate constraint "precios_barbero_id_especialidad_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fn_actualizar_fecha_precio()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.fecha_actualizacion := NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_auto_id_cita()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.id_cita IS NULL OR NEW.id_cita = '' THEN
        NEW.id_cita := 'CIT' || LPAD(nextval('seq_citas')::TEXT, 7, '0');
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_historial_cita()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO Historial_citas (id_cita, cedula_cliente, fecha)
    VALUES (NEW.id_cita, NEW.cedula_cliente, NOW());
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_validar_cedula_barbero()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF LENGTH(NEW.cedula_barbero) < 6 OR LENGTH(NEW.cedula_barbero) > 10 THEN
        RAISE EXCEPTION 'La cédula del barbero debe tener entre 6 y 10 caracteres';
    END IF;
    IF NOT NEW.cedula_barbero ~ '^[0-9]+$' THEN
        RAISE EXCEPTION 'La cédula del barbero solo debe contener números';
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_validar_cedula_cliente()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF LENGTH(NEW.cedula_cliente) < 6 OR LENGTH(NEW.cedula_cliente) > 10 THEN
        RAISE EXCEPTION 'La cédula debe tener entre 6 y 10 caracteres';
    END IF;
    IF NOT NEW.cedula_cliente ~ '^[0-9]+$' THEN
        RAISE EXCEPTION 'La cédula solo debe contener números';
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_validar_correo_barbero()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NOT NEW.correo ~ '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$' THEN
        RAISE EXCEPTION 'Formato de correo inválido (barbero)';
    END IF;
    IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND OLD.correo <> NEW.correo) THEN
        IF EXISTS (
            SELECT 1 FROM Barberos
            WHERE correo = NEW.correo
              AND cedula_barbero <> NEW.cedula_barbero
        ) THEN
            RAISE EXCEPTION 'El correo ya está registrado por otro barbero';
        END IF;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_validar_correo_cliente()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NOT NEW.correo ~ '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$' THEN
        RAISE EXCEPTION 'Formato de correo inválido (cliente)';
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_validar_fecha_cita()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.fecha < CURRENT_DATE THEN
        RAISE EXCEPTION 'No se pueden crear citas en fechas pasadas';
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_validar_horario()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.hora_inicio >= NEW.hora_fin THEN
        RAISE EXCEPTION 'La hora de inicio debe ser menor que la hora de fin';
    END IF;
    RETURN NEW;
END;
$function$
;

create or replace view "public"."vw_barberos_detallados" as  SELECT b.cedula_barbero,
    b.nombre,
    b.apellido,
    b.telefono,
    b.correo,
    b.ciudad,
    e.especialidad,
    e.tiempo_estimado,
    h.hora_inicio,
    h.hora_fin,
    h.fecha,
    s.estado
   FROM (((public.barberos b
     JOIN public.especialidades e ON ((b.id_especialidad = e.id_especialidad)))
     LEFT JOIN public.horario_barbero h ON (((b.cedula_barbero)::text = (h.cedula_barbero)::text)))
     LEFT JOIN public.estados s ON ((h.id_estado = s.id_estado)));


create or replace view "public"."vw_citas_detalladas" as  SELECT c.id_cita,
    c.fecha,
    c.hora,
    c.estado,
    cl.cedula_cliente,
    (((cl.nombre)::text || ' '::text) || (cl.apellido)::text) AS cliente,
    b.cedula_barbero,
    (((b.nombre)::text || ' '::text) || (b.apellido)::text) AS barbero,
    e.especialidad,
    e.tiempo_estimado,
    p.precio,
    p.moneda
   FROM ((((public.citas c
     JOIN public.clientes cl ON (((c.cedula_cliente)::text = (cl.cedula_cliente)::text)))
     JOIN public.barberos b ON (((c.cedula_barbero)::text = (b.cedula_barbero)::text)))
     JOIN public.especialidades e ON ((c.id_especialidad = e.id_especialidad)))
     LEFT JOIN public.precios_barbero p ON ((((p.cedula_barbero)::text = (b.cedula_barbero)::text) AND (p.id_especialidad = e.id_especialidad))));


create or replace view "public"."vw_disponibilidad_barberos" as  SELECT b.cedula_barbero,
    (((b.nombre)::text || ' '::text) || (b.apellido)::text) AS barbero,
    e.especialidad,
    h.fecha,
    h.hora_inicio,
    h.hora_fin,
    s.estado,
        CASE
            WHEN ((s.estado)::text = 'Disponible'::text) THEN 'Sí'::text
            ELSE 'No'::text
        END AS puede_agendar
   FROM (((public.barberos b
     JOIN public.especialidades e ON ((b.id_especialidad = e.id_especialidad)))
     LEFT JOIN public.horario_barbero h ON (((b.cedula_barbero)::text = (h.cedula_barbero)::text)))
     LEFT JOIN public.estados s ON ((h.id_estado = s.id_estado)))
  WHERE (h.fecha >= CURRENT_DATE);


create or replace view "public"."vw_historial_citas" as  SELECT h.id,
    h.id_cita,
    h.fecha,
    c.cedula_cliente,
    (((c.nombre)::text || ' '::text) || (c.apellido)::text) AS cliente
   FROM (public.historial_citas h
     JOIN public.clientes c ON (((h.cedula_cliente)::text = (c.cedula_cliente)::text)));


grant delete on table "public"."barberos" to "anon";

grant insert on table "public"."barberos" to "anon";

grant references on table "public"."barberos" to "anon";

grant select on table "public"."barberos" to "anon";

grant trigger on table "public"."barberos" to "anon";

grant truncate on table "public"."barberos" to "anon";

grant update on table "public"."barberos" to "anon";

grant delete on table "public"."barberos" to "authenticated";

grant insert on table "public"."barberos" to "authenticated";

grant references on table "public"."barberos" to "authenticated";

grant select on table "public"."barberos" to "authenticated";

grant trigger on table "public"."barberos" to "authenticated";

grant truncate on table "public"."barberos" to "authenticated";

grant update on table "public"."barberos" to "authenticated";

grant delete on table "public"."barberos" to "service_role";

grant insert on table "public"."barberos" to "service_role";

grant references on table "public"."barberos" to "service_role";

grant select on table "public"."barberos" to "service_role";

grant trigger on table "public"."barberos" to "service_role";

grant truncate on table "public"."barberos" to "service_role";

grant update on table "public"."barberos" to "service_role";

grant delete on table "public"."citas" to "anon";

grant insert on table "public"."citas" to "anon";

grant references on table "public"."citas" to "anon";

grant select on table "public"."citas" to "anon";

grant trigger on table "public"."citas" to "anon";

grant truncate on table "public"."citas" to "anon";

grant update on table "public"."citas" to "anon";

grant delete on table "public"."citas" to "authenticated";

grant insert on table "public"."citas" to "authenticated";

grant references on table "public"."citas" to "authenticated";

grant select on table "public"."citas" to "authenticated";

grant trigger on table "public"."citas" to "authenticated";

grant truncate on table "public"."citas" to "authenticated";

grant update on table "public"."citas" to "authenticated";

grant delete on table "public"."citas" to "service_role";

grant insert on table "public"."citas" to "service_role";

grant references on table "public"."citas" to "service_role";

grant select on table "public"."citas" to "service_role";

grant trigger on table "public"."citas" to "service_role";

grant truncate on table "public"."citas" to "service_role";

grant update on table "public"."citas" to "service_role";

grant delete on table "public"."clientes" to "anon";

grant insert on table "public"."clientes" to "anon";

grant references on table "public"."clientes" to "anon";

grant select on table "public"."clientes" to "anon";

grant trigger on table "public"."clientes" to "anon";

grant truncate on table "public"."clientes" to "anon";

grant update on table "public"."clientes" to "anon";

grant delete on table "public"."clientes" to "authenticated";

grant insert on table "public"."clientes" to "authenticated";

grant references on table "public"."clientes" to "authenticated";

grant select on table "public"."clientes" to "authenticated";

grant trigger on table "public"."clientes" to "authenticated";

grant truncate on table "public"."clientes" to "authenticated";

grant update on table "public"."clientes" to "authenticated";

grant delete on table "public"."clientes" to "service_role";

grant insert on table "public"."clientes" to "service_role";

grant references on table "public"."clientes" to "service_role";

grant select on table "public"."clientes" to "service_role";

grant trigger on table "public"."clientes" to "service_role";

grant truncate on table "public"."clientes" to "service_role";

grant update on table "public"."clientes" to "service_role";

grant delete on table "public"."especialidades" to "anon";

grant insert on table "public"."especialidades" to "anon";

grant references on table "public"."especialidades" to "anon";

grant select on table "public"."especialidades" to "anon";

grant trigger on table "public"."especialidades" to "anon";

grant truncate on table "public"."especialidades" to "anon";

grant update on table "public"."especialidades" to "anon";

grant delete on table "public"."especialidades" to "authenticated";

grant insert on table "public"."especialidades" to "authenticated";

grant references on table "public"."especialidades" to "authenticated";

grant select on table "public"."especialidades" to "authenticated";

grant trigger on table "public"."especialidades" to "authenticated";

grant truncate on table "public"."especialidades" to "authenticated";

grant update on table "public"."especialidades" to "authenticated";

grant delete on table "public"."especialidades" to "service_role";

grant insert on table "public"."especialidades" to "service_role";

grant references on table "public"."especialidades" to "service_role";

grant select on table "public"."especialidades" to "service_role";

grant trigger on table "public"."especialidades" to "service_role";

grant truncate on table "public"."especialidades" to "service_role";

grant update on table "public"."especialidades" to "service_role";

grant delete on table "public"."estados" to "anon";

grant insert on table "public"."estados" to "anon";

grant references on table "public"."estados" to "anon";

grant select on table "public"."estados" to "anon";

grant trigger on table "public"."estados" to "anon";

grant truncate on table "public"."estados" to "anon";

grant update on table "public"."estados" to "anon";

grant delete on table "public"."estados" to "authenticated";

grant insert on table "public"."estados" to "authenticated";

grant references on table "public"."estados" to "authenticated";

grant select on table "public"."estados" to "authenticated";

grant trigger on table "public"."estados" to "authenticated";

grant truncate on table "public"."estados" to "authenticated";

grant update on table "public"."estados" to "authenticated";

grant delete on table "public"."estados" to "service_role";

grant insert on table "public"."estados" to "service_role";

grant references on table "public"."estados" to "service_role";

grant select on table "public"."estados" to "service_role";

grant trigger on table "public"."estados" to "service_role";

grant truncate on table "public"."estados" to "service_role";

grant update on table "public"."estados" to "service_role";

grant delete on table "public"."historial_citas" to "anon";

grant insert on table "public"."historial_citas" to "anon";

grant references on table "public"."historial_citas" to "anon";

grant select on table "public"."historial_citas" to "anon";

grant trigger on table "public"."historial_citas" to "anon";

grant truncate on table "public"."historial_citas" to "anon";

grant update on table "public"."historial_citas" to "anon";

grant delete on table "public"."historial_citas" to "authenticated";

grant insert on table "public"."historial_citas" to "authenticated";

grant references on table "public"."historial_citas" to "authenticated";

grant select on table "public"."historial_citas" to "authenticated";

grant trigger on table "public"."historial_citas" to "authenticated";

grant truncate on table "public"."historial_citas" to "authenticated";

grant update on table "public"."historial_citas" to "authenticated";

grant delete on table "public"."historial_citas" to "service_role";

grant insert on table "public"."historial_citas" to "service_role";

grant references on table "public"."historial_citas" to "service_role";

grant select on table "public"."historial_citas" to "service_role";

grant trigger on table "public"."historial_citas" to "service_role";

grant truncate on table "public"."historial_citas" to "service_role";

grant update on table "public"."historial_citas" to "service_role";

grant delete on table "public"."horario_barbero" to "anon";

grant insert on table "public"."horario_barbero" to "anon";

grant references on table "public"."horario_barbero" to "anon";

grant select on table "public"."horario_barbero" to "anon";

grant trigger on table "public"."horario_barbero" to "anon";

grant truncate on table "public"."horario_barbero" to "anon";

grant update on table "public"."horario_barbero" to "anon";

grant delete on table "public"."horario_barbero" to "authenticated";

grant insert on table "public"."horario_barbero" to "authenticated";

grant references on table "public"."horario_barbero" to "authenticated";

grant select on table "public"."horario_barbero" to "authenticated";

grant trigger on table "public"."horario_barbero" to "authenticated";

grant truncate on table "public"."horario_barbero" to "authenticated";

grant update on table "public"."horario_barbero" to "authenticated";

grant delete on table "public"."horario_barbero" to "service_role";

grant insert on table "public"."horario_barbero" to "service_role";

grant references on table "public"."horario_barbero" to "service_role";

grant select on table "public"."horario_barbero" to "service_role";

grant trigger on table "public"."horario_barbero" to "service_role";

grant truncate on table "public"."horario_barbero" to "service_role";

grant update on table "public"."horario_barbero" to "service_role";

grant delete on table "public"."precios_barbero" to "anon";

grant insert on table "public"."precios_barbero" to "anon";

grant references on table "public"."precios_barbero" to "anon";

grant select on table "public"."precios_barbero" to "anon";

grant trigger on table "public"."precios_barbero" to "anon";

grant truncate on table "public"."precios_barbero" to "anon";

grant update on table "public"."precios_barbero" to "anon";

grant delete on table "public"."precios_barbero" to "authenticated";

grant insert on table "public"."precios_barbero" to "authenticated";

grant references on table "public"."precios_barbero" to "authenticated";

grant select on table "public"."precios_barbero" to "authenticated";

grant trigger on table "public"."precios_barbero" to "authenticated";

grant truncate on table "public"."precios_barbero" to "authenticated";

grant update on table "public"."precios_barbero" to "authenticated";

grant delete on table "public"."precios_barbero" to "service_role";

grant insert on table "public"."precios_barbero" to "service_role";

grant references on table "public"."precios_barbero" to "service_role";

grant select on table "public"."precios_barbero" to "service_role";

grant trigger on table "public"."precios_barbero" to "service_role";

grant truncate on table "public"."precios_barbero" to "service_role";

grant update on table "public"."precios_barbero" to "service_role";

CREATE TRIGGER trg_validar_cedula_barbero BEFORE INSERT OR UPDATE ON public.barberos FOR EACH ROW EXECUTE FUNCTION public.fn_validar_cedula_barbero();

CREATE TRIGGER trg_validar_correo_barbero BEFORE INSERT OR UPDATE ON public.barberos FOR EACH ROW EXECUTE FUNCTION public.fn_validar_correo_barbero();

CREATE TRIGGER trg_auto_id_cita BEFORE INSERT ON public.citas FOR EACH ROW EXECUTE FUNCTION public.fn_auto_id_cita();

CREATE TRIGGER trg_historial_cita AFTER INSERT ON public.citas FOR EACH ROW EXECUTE FUNCTION public.fn_historial_cita();

CREATE TRIGGER trg_validar_fecha_cita BEFORE INSERT OR UPDATE ON public.citas FOR EACH ROW EXECUTE FUNCTION public.fn_validar_fecha_cita();

CREATE TRIGGER trg_validar_cedula_cliente BEFORE INSERT OR UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.fn_validar_cedula_cliente();

CREATE TRIGGER trg_validar_correo_cliente BEFORE INSERT OR UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.fn_validar_correo_cliente();

CREATE TRIGGER trg_validar_horario BEFORE INSERT OR UPDATE ON public.horario_barbero FOR EACH ROW EXECUTE FUNCTION public.fn_validar_horario();

CREATE TRIGGER trg_actualizar_fecha_precio BEFORE UPDATE ON public.precios_barbero FOR EACH ROW EXECUTE FUNCTION public.fn_actualizar_fecha_precio();


