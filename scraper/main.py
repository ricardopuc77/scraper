import requests
import json
import traceback
import re
from bs4 import BeautifulSoup
from ingest import insertar_to_db

URLS = [
    # Despacho del Gobernador
    "https://www.yucatan.gob.mx/gobierno/detalle.php?id_d=1",
    # Secretaría General de Gobierno
    "https://www.yucatan.gob.mx/gobierno/detalle.php?id_d=2",
    # Secretaría de Administración y Finanzas
    "https://www.yucatan.gob.mx/gobierno/detalle.php?id_d=3",
    # Consejería Jurídica
    "https://www.yucatan.gob.mx/gobierno/detalle.php?id_d=55",
    # Secretaría de Salud
    "https://www.yucatan.gob.mx/gobierno/detalle.php?id_d=15",
    # Secretaría de Educación
    "https://www.yucatan.gob.mx/gobierno/detalle.php?id_d=10",
    # Secretaría del Bienestar
    "https://www.yucatan.gob.mx/gobierno/detalle.php?id_d=7",
    # Secretaría de Infraestructura para el Bienestar
    "https://www.yucatan.gob.mx/gobierno/detalle.php?id_d=8",
    # Secretaría de las Juventudes
    "https://www.yucatan.gob.mx/gobierno/detalle.php?id_d=95",
    # Secretaría de Seguridad Pública
    "https://www.yucatan.gob.mx/gobierno/detalle.php?id_d=14",
    # Secretaría de Economía y Trabajo
    "https://www.yucatan.gob.mx/gobierno/detalle.php?id_d=5",
    # Secretaría de Fomento Turístico
    "https://www.yucatan.gob.mx/gobierno/detalle.php?id_d=16",
    # Secretaría de Desarrollo Rural
    "https://www.yucatan.gob.mx/gobierno/detalle.php?id_d=6",
    # Secretaría de Desarrollo Sustentable
    "https://www.yucatan.gob.mx/gobierno/detalle.php?id_d=9",
    # Secretaría de la Contraloría General
    "https://www.yucatan.gob.mx/gobierno/detalle.php?id_d=4",
    # Secretaría de la Ciencia, Humanidades, Tecnología e Innovación
    "https://www.yucatan.gob.mx/gobierno/detalle.php?id_d=73",
    # Secretaría de la Cultura y las Artes
    "https://www.yucatan.gob.mx/gobierno/detalle.php?id_d=38",
    # Secretaría de Pesca y Acuacultura Sustentables
    "https://www.yucatan.gob.mx/gobierno/detalle.php?id_d=83",
    # Secretaría de las Mujeres
    "https://www.yucatan.gob.mx/gobierno/detalle.php?id_d=74"
]
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

ADDRESS_RE = re.compile(r"Yucat[aá]n", re.IGNORECASE)
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")


def fetch_html(url: str) -> str:
    resp = requests.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    resp.encoding = resp.apparent_encoding
    return resp.text


def save_raw_html(html: str, path="page.html"):
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)


def clean_text(s):
    if not s:
        return None
    return " ".join(s.split()).strip()


def save_json(data, path="funcionarios.json"):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def is_valid_address(text: str):
    return bool(text and ADDRESS_RE.search(text))


def extract_email(soup):
    cuerpo = soup.find("div", id="cuerpo")
    if not cuerpo:
        return None

    # Busca todos los <p class="text-center"> dentro de #cuerpo
    ps = cuerpo.find_all("p", class_="text-center")
    for p in ps:
        text = p.get_text(" ", strip=True)
        match = EMAIL_RE.search(text)
        if match:
            return match.group(0)
    return None


def parse_u_block(u):
    direccion = telefono = None

    for div in u.find_all("div", recursive=False):
        txt = " ".join(div.get_text(" ", strip=True).split())
        if not txt:
            continue

        if is_valid_address(txt):
            direccion = txt
            continue

        if re.search(r"\d{2,4}[-\s]?\d{2,4}", txt):  # patrón simple para teléfono
            telefono = txt
            continue

    return direccion, telefono


def parse_page(html: str, url: str):
    soup = BeautifulSoup(html, 'lxml')
    chart = soup.find("div", id="chart")
    titulo = soup.select_one(".titulo")
    dependencia = titulo.find('a').get_text(strip=True)
    email = extract_email(soup)
    if not chart:
        print("No se encontro el div chart")
        return []

    entidades = chart.select(".entidad")
    # print(f"Encontradas {len(entidades)} entidades dentro de #chart")
    resultados = []
    if entidades:
        # print("Preview de la primera entidad:")
        # print(entidades[0].get_text(" ", strip=True)[:400], "...")

        for ent in entidades:
            nombre = ent.select_one(".n")
            puesto = ent.select_one(".p")
            area = ent.select_one('.a')

            direccion = telefono = None

            u = ent.select_one(".u")
            if u:
                direccion, telefono = parse_u_block(u)

            item = {
                "nombre": clean_text(nombre.get_text(strip=True) if nombre else None),
                "puesto": clean_text(puesto.get_text(strip=True) if puesto else None),
                "area": clean_text(area.get_text(strip=True) if area else None),
                "institucion": dependencia,
                "direccion": direccion,
                "telefono": telefono,
                "correo": email,
                "source_url": url
            }
            resultados.append(item)

    # print(resultados)
    return resultados


def run_secuencial(urls):
    all_rows = []
    for url in urls:
        try:
            html = fetch_html(url)
            rows = parse_page(html, url)
            all_rows.extend(rows)
            print(f"[OK] {url} -> {len(rows)} funcionarios")
        except Exception as e:
            print(f"[ERROR] {url}: {e}")
            traceback.print_exc()
    return all_rows


def main():
    data = run_secuencial(URLS)
    save_json(data, "funcionarios.json")

    insertar_to_db()


if __name__ == "__main__":
    main()
