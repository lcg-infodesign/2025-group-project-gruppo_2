import os
import time
import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException

CSV_PATH = "/Users/a39339/Desktop/lcg information design/progetto finale/2025-group-project-gruppo_2/assets/data.csv"

# =========================
# LETTURA CSV (forzando la virgola)
# =========================
df = pd.read_csv(
    CSV_PATH,
    sep=",",
    on_bad_lines="skip",
    dtype=str   # evita problemi con numeri / NaN
)

# Controllo colonne
print("Colonne trovate:", df.columns.tolist())

# Crea colonna photoCredit se non esiste
if "photoCredit" not in df.columns:
    df["photoCredit"] = ""

# =========================
# SETUP SELENIUM
# =========================
options = Options()
options.headless = True
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

service = Service(
    executable_path="/Users/a39339/Desktop/lcg information design/progetto finale/python per immagini/scraping/chromedriver"
)

driver = webdriver.Chrome(service=service, options=options)

# =========================
# CICLO SULLE RIGHE
# =========================

URL_COLUMN_INDEX = 21  # 22ª colonna

for index, row in df.iterrows():

    # sicurezza: salta righe senza abbastanza colonne
    if len(row) <= URL_COLUMN_INDEX:
        continue

    url = row.iloc[URL_COLUMN_INDEX]

    if pd.isna(url) or str(url).strip() == "":
        continue

    entry_id = row.get("id", "NO_ID")

    print(f"--> Analizzo {url} (ID: {entry_id})")

    try:
        driver.get(url)
        time.sleep(2)

        try:
            elem = driver.find_element(By.ID, "photoCredit")
            credit_text = elem.text.strip()
            df.at[index, "photoCredit"] = credit_text
            print(f"   ✔ Trovato: {credit_text}")

        except NoSuchElementException:
            print("   ❌ Nessun photoCredit trovato")

    except Exception as e:
        print(f"   ❌ Errore nella pagina {url}: {e}")

# =========================
# SALVATAGGIO CSV
# =========================
driver.quit()

df.to_csv(CSV_PATH, index=False, sep=",")

print("\n✅ FATTO! CSV aggiornato con photoCredit.")
