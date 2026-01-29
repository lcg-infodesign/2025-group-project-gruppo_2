1. Autori e licenza

  Membri del gruppo: Sara Allegro, Filippo Garbero, Letizia Neri, Vanessa Preite, Enea Tramontana, Cristina Zheng <br>
  Licenza di utilizzo: CC BY 4.0.


2. Obiettivi di conoscenza

  Per la realizzazione di questo progetto, ci siamo posti i seguenti obiettivi: <br>
    1. Visione storica: stimolare una riflessione sulla dimensione temporale e la progressione dei casi, cogliendo pattern e picchi nel lungo periodo.
    2. Responsabilità (source of fire): visualizzare chi o cosa ha generato le morti, riconoscendo le diverse categorie di responsabili e la loro distribuzione.
    3. Analisi territoriale: comprendere, tramite filtri geografici, dove avvengono le uccisioni e come varia la gestione della giustizia nei diversi territori.
    4. Stato dell'impunità: analizzare i gradi di giustizia (completa, parziale, nessuna o sconosciuta) relativi ai responsabili (source of fire).
    5. Dimensione umana: entrare in contatto con le storie individuali che compongono il fenomeno, restituendo dignità alle persone oltre il dato statistico.


3. Analisi dei dati e rielaborazione

  Fonte: Committee to Protect Journalists (CPJ) - cpj.org
  Dati utilizzati: CPJ Journalists Killed (1992-2025)
  Rielaborazione:
    o Integrazione: abbiamo aggiunto una colonna “id” per identificare ogni giornalista tramite un numero univoco, così da rendere immediato 
      il collegamento alla relativa immagine nel codice e facilitarne la visualizzazione nella visione di dettaglio; abbiamo aggiunto una colonna 
      "photoCredit" per affiancare alle immagini prese dal sito di CPJ i relativi crediti di provenienza; abbiamo nominato le caselle vuote nelle 
      colonne "source_of_fire" e "impunity" come "Unknown"
    o Ricerca geopolitica: abbiamo condotto un'analisi approfondita dei contesti storici e geopolitici per interpretare correttamente le dinamiche 
      dietro i picchi di mortalità presenti nel dataset, in modo da fornire all'utente una spiegazione testuale associata ai punti di maggiore interesse
      nella prima visualizzazione d'insieme

      
4. Organizzazione del gruppo

  L’ideazione della struttura generale del progetto è stata sviluppata in modo condiviso: tutti i membri del gruppo hanno contribuito attivamente alla 
  definizione del concept e dell’impostazione complessiva.

  * Sara Allegro ha lavorato alla realizzazione dei prototipi lo-fi e hi-fi su Figma, ha supportato il coordinamento delle attività e ha contribuito allo 
    sviluppo del codice della sezione About.
 
  * Filippo Garbero ha collaborato allo sviluppo del primo grafico e alla realizzazione della sidebar contenente le informazioni e il filtro per paese,
    di cui si è occupato per la sua interezza. È stato di supporto nello sviluppo generale del sito.
 

  * Letizia Neri ha lavorato allo sviluppo di tutte le pagine del sito, contribuendo in particolare al secondo grafico e coordinando il lavoro su HTML,
    CSS e JavaScript. Si è inoltre occupata dell’estrazione delle immagini e dei crediti tramite Python. Una menzione speciale va a Letizia per il ruolo
    centrale nel lavoro sul codice e per l’attività di integrazione, revisione e unificazione dei diversi contributi fino alle fasi finali del progetto.
 

  * Vanessa Preite si è occupata della ricerca storica e geopolitica, dell’elaborazione del dataset in funzione degli obiettivi del progetto, della redazione
    dei testi e dello sviluppo dei grafici prototipali tramite RawGraphs.
 

  * Enea Tramontana ha sviluppato le card dedicate ai singoli giornalisti, lavorando principalmente tramite JavaScript, e ha fornito supporto allo sviluppo
    generale del sito.
 

  * Cristina Zheng ha collaborato allo sviluppo del primo grafico e alla sua animazione, si è occupata della redazione del file README ed è stata di supporto
    nello sviluppo generale del sito

    
5. Scelte Progettuali

  - Interfaccia: abbiamo adottato uno sfondo scuro per sottolineare la serietà del tema. I dot bianchi diventano rossi quando evidenziati, per focalizzare
    l'attenzione sul singolo caso.
  - Beeswarm Chart: scelta per visualizzare la densità temporale senza sovrapposizioni, permettendo di percepire ogni singolo punto come un'unità distinta.
  - Bubble Chart: utilizzata per raggruppare i dot e rendere immediato il confronto visivo tra i diversi stati di impunità.
 
