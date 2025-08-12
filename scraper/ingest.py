import os
import re
import hashlib
import json
from typing import Optional, Dict, List

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()
ENGINE = create_engine(os.getenv("DATABASE_URL"),
                       pool_pre_ping=True, future=True)

RE_DIR_YUC = re.compile(r"Yucat[aá]n", re.IGNORECASE)


def is_valid_address(s: Optional[str]) -> bool:
    return bool(s and RE_DIR_YUC.search(s))

# --- helpers genéricos: get_or_create por nombre (catálogos) y url (source_pages) ---


def get_or_create_catalog_id(conn, table: str, nombre: Optional[str]) -> Optional[int]:
    if not nombre:
        return None
    sql = text(f"""
        INSERT INTO {table} (nombre)
        VALUES (:nombre)
        ON CONFLICT (nombre) DO UPDATE SET nombre = EXCLUDED.nombre
        RETURNING id;
    """)
    row = conn.execute(sql, {"nombre": nombre}).first()
    return row[0] if row else None


def get_or_create_source_page_id(conn, url: str, institucion_id: Optional[int], email: Optional[str]) -> int:
    sql = text("""
        INSERT INTO source_pages (url, institucion_id, email)
        VALUES (:url, :inst_id, :email)
        ON CONFLICT (url) DO UPDATE SET
            institucion_id = EXCLUDED.institucion_id,
            email = EXCLUDED.email
        RETURNING id;
    """)
    row = conn.execute(
        sql, {"url": url, "inst_id": institucion_id, "email": email}).first()
    return row[0]


def generar_nombre_placeholder(row: dict) -> str:
    base = f"{row.get('telefono', '')}|{row.get('direccion', '')}|{row.get('institucion', '')}|{row.get('puesto', '')}"
    # hash de 8 caracteres
    h = hashlib.sha1(base.encode("utf-8")).hexdigest()[:10]
    return f"SIN NOMBRE {h}"


def insert_funcionario_if_new(conn, row: Dict, source_page_id: int,
                              puesto_id: Optional[int], area_id: Optional[int],
                              institucion_id: Optional[int]) -> Optional[int]:
    nombre = row.get("nombre")
    direccion = row.get("direccion")
    telefono = row.get("telefono")

    # Validaciones mínimas
    if not is_valid_address(direccion):
        direccion = None

    # Determinar status según nombre
    if not nombre or str(nombre).strip().lower() in ("none", ""):
        nombre = generar_nombre_placeholder(row)
        status = 3
    else:
        status = 1
        nombre = str(nombre).strip()

    sql = text("""
        INSERT INTO funcionarios
            (nombre, direccion, telefono, puesto_id, area_id, institucion_id, source_page_id, status)
        VALUES
            (:nombre, :direccion, :telefono, :puesto_id, :area_id, :institucion_id, :source_page_id, :status)
        ON CONFLICT (lower(nombre), puesto_id, institucion_id, source_page_id, status) DO NOTHING
        RETURNING id;
    """)

    params = {
        "nombre": nombre,
        "direccion": direccion,
        "telefono": telefono,
        "puesto_id": puesto_id,
        "area_id": area_id,
        "institucion_id": institucion_id,
        "source_page_id": source_page_id,
        "status": status
    }
    new_row = conn.execute(sql, params).first()
    return new_row[0] if new_row else None


def ingest_rows(rows: List[Dict]) -> int:
    """
    rows: lista de dicts con llaves:
      nombre, puesto, area, institucion, direccion, telefono, correo, source_url
    """
    if not rows:
        return 0

    # datos comunes por página
    source_url = rows[0].get("source_url")
    inst_name = rows[0].get("institucion")
    page_email = rows[0].get("correo")

    inserted = 0
    with ENGINE.begin() as conn:  # transacción automática
        institucion_id_page = get_or_create_catalog_id(
            conn, "instituciones", inst_name)
        source_page_id = get_or_create_source_page_id(
            conn, source_url, institucion_id_page, page_email)

        for r in rows:
            puesto_id = get_or_create_catalog_id(
                conn, "puestos",       r.get("puesto"))
            area_id = get_or_create_catalog_id(
                conn, "areas",         r.get("area"))
            institucion_id = get_or_create_catalog_id(
                conn, "instituciones", r.get("institucion"))

            new_id = insert_funcionario_if_new(
                conn, r, source_page_id,
                puesto_id, area_id, institucion_id
            )
            if new_id:
                inserted += 1

    return inserted


def insertar_to_db():
    with open("funcionarios.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    from collections import defaultdict
    by_url = defaultdict(list)
    for item in data:
        by_url[item["source_url"]].append(item)

    total = 0
    for url, group in by_url.items():
        n = ingest_rows(group)
        print(f"[DB] {url}: insertados {n}/{len(group)}")
        total += n
