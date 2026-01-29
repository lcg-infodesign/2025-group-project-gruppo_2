import os
import time
import pandas as pd
import requests
from urllib.parse import urlparse
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException

CSV_PATH = "data.csv"
OUT_DIR = "./images"
os.makedirs(OUT_DIR, exist_ok=True)

# Legge CSV
df = pd.read_csv(CSV_PATH)

# Setup Selenium headless con percorso del chromedriver corretto
options = Options()
options.headless = True
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

service = Service(executable_path='/Users/a39339/Desktop/lcg information design/progetto finale/python per immagini/scraping/chromedriver')
driver = webdriver.Chrome(service=service, options=options)

for index, row in df.dropna(subset=["cpj.org_url"]).iterrows():
    url = row["cpj.org_url"]
    entry_id = str(row["id"])  # Usa l'ID come nome file
    print(f"--> Analizzo {url} (ID: {entry_id})")

    try:
        driver.get(url)
        time.sleep(2)  # breve attesa per caricamento JS

        try:
            div = driver.find_element(By.CLASS_NAME, "cpj--page-header--photo")
            img = div.find_element(By.TAG_NAME, "img")
            img_url = img.get_attribute("src")
        except NoSuchElementException:
            img_url = None

        if not img_url:
            print("   ❌ Nessuna immagine trovata")
            continue

        # URL relativo
        if img_url.startswith("/"):
            base = f"{urlparse(url).scheme}://{urlparse(url).netloc}"
            img_url = base + img_url

        # Nome file basato sull'ID e estensione fissa jpg
        filename = f"{entry_id}.jpg"
        filepath = os.path.join(OUT_DIR, filename)

        # Scarica immagine
        img_data = requests.get(img_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10).content
        with open(filepath, "wb") as f:
            f.write(img_data)
        print(f"   ✔ Salvata come {filename}")

    except Exception as e:
        print(f"   ❌ Errore nella pagina {url}: {e}")

driver.quit()
print("\nFatto!")
