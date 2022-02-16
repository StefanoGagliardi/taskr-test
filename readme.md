# Studio di Taskr

**Motivazione:**

Durante lo studio del sorgente di NextJs, ho appreso che la compilazione di Typescript, dei vari scripts ecc viene gestita con un Task manager (come gulp).
Essendo un mega progetto, con tanti packages e tante dipendenze, usano come macro gestore dei package: LERNA.

Lerna fortunatamente ho avuto modo di studiarlo recentemente.

Per gestire invece gli script, build e dist nel singolo package (es: /package/next/) si utilizza il task manager: [Taskr](https://github.com/lukeed/taskr).

La differenza principale con altri task mangare come appunto Gulp, è che questo nasce con la filosofia della "concorrenza" per ottimizzare i tempi,
un progetto come Next ogni volta chissa quanto ci mette a compilare (anche solamente il dev magari). Compilando in parrallelo ove possibile (salvo dipendenze)
permette di abbattere i tempi, forse overkill per vitals ora, ma col tempoi se cresce paggherà, per citare l'autore:

"Taskr is a highly performant task runner, much like Gulp or Grunt, but written with concurrency in mind."

**Progressi:**

Ho provato l'integrazione diretta nel Lerna di Vitals, sono riuscito a farla girare ma non al 100% come volevo:

1. Una seconda mega ottimizzazione portata a e da Next (con l'avvento della V.12) è il cambio di compilatore da **Babel** a **SWC**.

   [**SWC**](https://swc.rs/) - Speedy Web Compiler  
    SWC è un compilatore Typescript / javacript scritto in [RUST](https://www.rust-lang.org/it).  
    **Compare to Babel**: SWC is 20x faster than Babel on a single thread and 70x faster on four cores.

2. Vercel ha fatto un plugin (un file js) per Taskr per integrare SWC (i plugin di taskr sono caricati dal package.json) durante la compilazione.

   2.1 Problema è che non convertiva a es2015 (ma teneva ancora gli import '' from '') e questo dava problemi poi a voler lanciare lo script dentro bin.

   Probabile che la soluzione sia semplice, sarà un opzione di SWC quando viene richiamato **(taskr-swc.js)**.

   2.2 Ho provato con Babel (utilizzo standard) ma gestendo le dipendenze con Lerna ho avuuto problemi di versioning sul pacchetto `@babel/core` (richiedeva la ^7.1.1 ma veniva caricata la 6.23.3).

Quindi ora provo a rifare le compilazioni senza LERNA e varie in mezzo.

**Step operativi:**

1. Copiare i file del progetto
2. Installare le deps (prima babel)  
    `npm i @babel/core @babel/cli @babel/preset-typescript`  
    `npm i taskr @taskr/babel @taskr/watch @taskr/clear @taskr/esnext`  
    `npm i node-notifier node-notifier -D`  