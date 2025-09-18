# SPEC Tetris MVP

## 1. Rezumat executiv
- MVP-ul Tetris vizează lansarea unei versiuni web, single-player, care rulează în browser pe desktop și mobile.
- Obiectivul este validarea atractivității jocului clasic cu o experiență modernă, cu accent pe stabilitate și ușurință în utilizare.

## 2. Obiective MVP
- Permite jucătorului să joace runde infinite de Tetris cu cel puțin trei niveluri de dificultate (Relaxed, Classic, Expert).
- Asigură diferențiere clară între niveluri prin viteză, frecvență de creștere a nivelului, ghost piece și multiplicatori de scor.
- Garantarea unei experiențe fluide: minim 60 FPS pe hardware moderat și input fără latențe vizibile.
- Salvarea scorului maxim local și afișarea unui tablou de scoruri (local leaderboards) pentru re-jucabilitate.
- Compatibilitate cu browserele moderne (Chrome, Firefox, Edge, Safari) și rezoluții minime 1280x720.
- Testele E2E și smoke tests devin criterii obligatorii de livrare, acoperind toate user-story-urile și mecanicile de joc.

## 3. Public țintă și platforme
- Jucători casual 18-45 ani, familiarizați cu jocurile arcade, care caută o reinterpretare vizuală modernă a Tetris.
- Platformă principală: Web (desktop). Compatibilitate suplimentară: tablete și telefoane mobile moderne.
- MVP-ul poate fi livrat ca PWA pentru acces rapid, dar instalarea nu este obligatorie în prima versiune.

## 4. Experiență utilizator
- Ecran principal cu logo, buton Joacă, selector vizual de dificultate, acces la setări și panou scoruri.
- Jocul se desfășoară într-o fereastră centrală cu matrice 10x20, elemente UI (piesa următoare, scor curent, nivel, scor maxim) adaptate tematicii vizuale.
- Pauză accesibilă prin tastă sau buton dedicat; afișează meniu cu opțiunea de reluare, schimbare dificultate și restart.
- Ecranul de Game Over oferă rezumat scor, istoricul scorurilor, sfaturi și call-to-action pentru reîncepere.

## 5. Mecanică de joc
- Generarea pieselor folosește algoritmul 7-bag pentru distribuție echilibrată.
- Piesele cad cu viteză adaptată nivelului de dificultate, accelerată manual (soft drop) sau instant (hard drop).
- Rotiri în sensul acelor de ceasornic și invers, cu suport pentru Super Rotation System simplificat și ajustări pentru dificultatea Expert.
- Linie completă eliminată crește scorul și poate duce la eliminări multiple (double, triple, Tetris).
- Evoluție nivel: creștere progresivă a vitezei la praguri de linii (ex: la fiecare 10 linii) cu curbe distincte pe dificultate.
- Mod Expert introduce provocări suplimentare (spawn delay redus, penalizare scor pentru inactivitate, ghost piece opțional).

## 6. Control și input
- Desktop: taste săgeți (stânga/dreapta pentru deplasare, sus pentru rotire, jos pentru soft drop), Space pentru hard drop, P pentru pauză, D pentru schimbarea dificultății în pauză.
- Mobile: butoane virtuale pentru rotire și deplasare; gest swipe în jos pentru hard drop; toggle dedicat pentru ghost piece.
- Re-maparea tastelor nu este inclusă în MVP, dar arhitectura input-ului trebuie să o permită ulterior.

## 7. Scoring și progresie
- Formula de scor: liniile curățate multiplicate cu nivelul, bonus pentru Tetris și multiplicatori suplimentari în funcție de dificultate.
- Salvare locală a scorului maxim (localStorage) și listă top 5 scoruri recente, păstrate separat per dificultate.
- Statistici suplimentare: timp jucat, linii totale, număr de Tetris-uri, dificultate preferată, rată de completare linii per sesiune.

## 8. Audio și feedback
- Efecte sonore pentru aterizare piesă, curățare linii, game over, schimbare dificultate.
- Muzică de fundal în loop cu playlist adaptiv per dificultate (Relaxed: ambient, Classic: electro, Expert: drum & bass) și opțiune de mute în setări.
- Feedback vizual: flash pe liniile eliminate, animație pentru hard drop, puls lumini în fundal sincronizat cu ritmul muzicii.

## 9. Cerințe tehnice
- Stack recomandat: Next.js 14 (App Router), TypeScript strict, Redux Toolkit pentru stare, RTK Query pentru date.
- Motor de joc bazat pe buclă proprie cu requestAnimationFrame pentru randare și actualizare logică.
- Stocare locală pentru scoruri; opțional, pregătire interfață API pentru scoruri globale (nu în MVP).
- Testare automată: Vitest pentru unit/integration, Playwright pentru e2e; suite smoke tests dedicate pentru verificări rapide post-deployment.

## 10. Arhitectură propusă
- Componente principale React: GameCanvas, NextPiece, ScorePanel, ControlsOverlay, DifficultyBadge, BackgroundAnimator.
- Stare centralizată cu slice-uri: gameSlice (stare joc), settingsSlice (sunet și control), difficultySlice (configurație curentă), scoresApi (scoruri locale/remote).
- Servicii utilitare: TetriminoFactory, CollisionDetector, LineClearEvaluator, DifficultyManager (curbe viteză, scoring), SmokeTestRunner (hook Playwright).
- Integrare cu Material UI pentru componente (butoane, dialoguri, tipografie) și sistem de theming personalizat.

## 11. Date și stocare
- Structură Score:
  - id (UUID string)
  - value (număr total puncte)
  - linesCleared (număr linii)
  - levelReached (nivel maxim atins)
  - difficulty (Relaxed | Classic | Expert)
  - timestamp (ISO string)
- Persistență locală via localStorage; adaptor RTK Query pentru citire/scriere.
- În scenarii viitoare: conectare la PostgreSQL prin Prisma pentru leaderboards globale.

## 12. UX și UI
- Direcție artistică originală, neon synthwave + forme geometrice dinamice, pentru a diferenția vizual jocul de versiunile clasice.
- Layout responsiv cu coloană suplimentară care arată piesa următoare și statistici, plus decoruri animate adaptate dificultății.
- Particule și gradienti animați pentru evenimente-cheie (clear, Tetris, schimbare dificultate) fără a compromite performanța.
- Ecran pauză afișează controale și opțiune de sunet, cu fundal animat adaptat dificultății curente.
- Setări: volum muzică/efecte, activare sau dezactivare ghost piece, alegere temă vizuală secundară (cityscape, aurora, grid minimal).

## 13. Metrici de succes
- Timp mediu de sesiune peste 5 minute în primele 2 săptămâni.
- Rată de revenire a utilizatorilor (day-7 retention) de minim 20% pentru trafic organic.
- Zero crash-uri raportate și input lag sub 100 ms pe dispozitive țintă.
- Rată de trecere pentru smoke tests și e2e > 99% pe ultimele 30 de build-uri.

## 14. Non-obiective (out of scope MVP)
- Multiplayer sau competiții live.
- Leaderboard global cu back-end persistent.
- Skins personalizabile pentru piese.
- Achievements, quest-uri, progresie meta.
- Moduri alternative (Marathon, Sprint, Ultra).

## 15. Riscuri și mitigări
- Performanță slabă pe mobile: optimizare Canvas, limitarea transparențelor, testare pe dispozitive reale.
- Input lag: folosirea handler-elor dedicate și debounce minim.
- Complexitate rotiri SRS: implementare incrementală, testare unit pentru cazuri colț și T-spins.
- Lipsă sunet pe mobile: fallback pentru play la prima interacțiune utilizator.
- Inconsistență între dificultăți: parametri documentați central și suite automate (unit + e2e + smoke) care validează fiecare nivel.

## 16. Plan de implementare
1. Faza 0 – Bootstrap și infrastructură (1 săptămână)
   - Configurare proiect Next.js cu TypeScript strict și integrare MUI.
   - Setare Redux Toolkit și RTK Query; definire store și provider.
   - Stabilire pipeline lint, test, typecheck, plus plan pentru suite smoke și e2e în CI.
2. Faza 1 – Motor de joc de bază (2 săptămâni)
   - Implementare matrice joc și generare piese cu algoritm 7-bag.
   - Logica de mișcare, coliziune, rotire (SRS simplificat), clearing linii, cu parametri ajustabili în funcție de dificultate.
   - Buclă de joc cu requestAnimationFrame și adaptare la tick rate.
   - Teste unitare pentru logică piesă și clearing, acoperind toate nivelurile de dificultate.
3. Faza 2 – UI și control (1-1.5 săptămâni)
   - Implementare componente UI (GameCanvas, ScorePanel, NextPiece, ControlsOverlay, DifficultyBadge) cu layout-uri adaptate dificultății.
   - Mapare controale tastatură și integrare input mobil.
   - Gestionare stări (pauză, game over) și feedback vizual de bază, plus teme vizuale dinamice.
   - Teste React Testing Library pentru componente cheie și flux complet de joc, scenarii separate per dificultate.
4. Faza 3 – Audio, scoruri, testare avansată și polish (1 săptămână)
   - Integrare efecte sonore și muzică, setări volum și playlist-uri dinamice.
   - Persistență scoruri locale per dificultate și afișare leaderboard.
   - Optimizări performanță, polishing UI, corectare bug-uri.
   - Definire și implementare suite E2E care acoperă toate user-story-urile și mecanicile (drop, rotire, clearing, dificultăți, pauză).
   - Construire suite smoke tests automate pentru verificări rapide după build/deploy.
5. Faza 4 – QA și pregătire lansare (0.5 săptămână)
   - Playtesting intern, ajustări finale de balans (viteze, scoring) pe fiecare dificultate.
   - Rulare completă pipeline (lint, typecheck, unit, e2e) plus execuție suite smoke tests pentru validarea build-urilor rapide.
   - Pregătire materiale de lansare (descriere, capturi ecran) evidențiind estetica originală.

## 17. Livrabile finale
- Aplicație Tetris MVP deployată (preprod sau public).
- Suită de teste automate acoperind logica de bază și fluxul principal, inclusiv E2E exhaustive pe toate user-story-urile și nivelurile de dificultate.
- Documentație de configurare și operare (README actualizat, ghid QA) care descrie și lista de smoke tests obligatorii.

## 18. Următorii pași post-MVP
- Analiza feedback utilizatori și priorizare backlog extins (moduri de joc, leaderboard global).
- Integrare analytics pentru tracking metrici.
- Explorare monetizare (reclame non-intruzive, cosmetic shop) după validarea MVP.

## 19. User stories și plan de testare

### User stories (cu criterii de acceptare)
1. **US-01 – Lansare joc & start rapid**
   - Ca jucător nou vreau să intru pe homepage și să pornesc jocul în mai puțin de 5 secunde.
   - Criterii: pagina se încarcă fără erori, butonul Joacă este vizibil, jocul începe pe dificultatea implicită dacă nu aleg alta.
   - E2E: E2E-01 StartGame@Classic.
2. **US-02 – Alegere dificultate**
   - Ca jucător vreau să selectez dificultatea Relaxed, Classic sau Expert înainte de a începe jocul.
   - Criterii: selectorul este navigabil tastatură și touch, setarea selectată se propagă la motorul de joc, UI-ul reflectă tema dificultății.
   - E2E: E2E-02 SelectDifficulty@Relaxed; E2E-03 SelectDifficulty@Expert.
3. **US-03 – Control piese (desktop)**
   - Ca jucător desktop vreau să pot mișca, roti și drop-ui piesele fără latență perceptibilă.
   - Criterii: input săgeți și Space reacționează sub 100 ms, piesele nu depășesc marginile, hard drop finalizează imediat deplasarea.
   - E2E: E2E-04 PieceControl@Desktop.
4. **US-04 – Control piese (mobile)**
   - Ca jucător mobil vreau să folosesc butoane virtuale și gesturi pentru aceleași acțiuni.
   - Criterii: overlay-ul mobil apare sub 768px, gest swipe în jos produce hard drop, erorile de touch sunt prevenite cu debounce.
   - E2E: E2E-05 PieceControl@Mobile.
5. **US-05 – Clearing linii și scor**
   - Ca jucător vreau confirmare vizuală/audio când curăț linii și actualizare corectă de scor.
   - Criterii: animația de clear rulează, scorul crește conform formulei, multiplicatorul dificultății se aplică.
   - E2E: E2E-06 Scoring@MultiLine.
6. **US-06 – Progresie nivel & curbe dificultate**
   - Ca jucător vreau ca viteza pieselor să crească în mod predictibil și diferențiat per dificultate.
   - Criterii: la pragurile de linii viteza se actualizează conform tabelului DifficultyManager, UI-ul afișează nivelul curent.
   - E2E: E2E-07 LevelProgression@Expert.
7. **US-07 – Pauză și rezumare**
   - Ca jucător vreau să pot pune pauză și să reiau jocul fără a pierde progresul.
   - Criterii: apăsarea P sau butonul Pauză opresc căderea pieselor, meniul pauză permite schimbarea dificultății, reluarea restartează timerul fără glitch.
   - E2E: E2E-08 PauseMenu@DifficultySwitch.
8. **US-08 – Game Over & restart**
   - Ca jucător vreau să primesc sumar de scor și opțiune rapidă de restart.
   - Criterii: ecranul Game Over afișează scor, linii, dificultate, butonul Restart resetează logică și UI.
   - E2E: E2E-09 GameOver@Restart.
9. **US-09 – Leaderboard local**
   - Ca jucător vreau să văd și să salvez scorurile mele pe dificultăți.
   - Criterii: după game over rezultatul este persistat per dificultate, lista top 5 se actualizează, datele se restituie după refresh.
   - E2E: E2E-10 Leaderboard@Persistence.
10. **US-10 – Setări audio și ghost piece**
    - Ca jucător vreau să reglez volumul și să activez/dezactivez ghost piece.
    - Criterii: slider volum controlează atât muzica cât și efectele (cu preview), ghost piece alternează vizibil overlay-ul piesei curente.
    - E2E: E2E-11 Settings@AudioGhost.
11. **US-11 – Teme vizuale dinamice**
    - Ca jucător vreau să aleg teme vizuale care schimbă fundalul și animațiile.
    - Criterii: selecția temei actualizează imediat culorile, se păstrează după refresh, performanța rămâne peste 60 FPS.
    - E2E: E2E-12 ThemeSwitch@Persistence.
12. **US-12 – Stabilitate și încărcare rapidă**
    - Ca product owner vreau ca aplicația să treacă smoke tests după fiecare build.
    - Criterii: pagina se redă fără erori console, store-ul Redux se hidratează, jocul poate porni fără interacțiuni suplimentare.
    - E2E: acoperită de E2E-01 StartGame@Classic și smoke ST-01 BootSmoke.

### Scenarii E2E (Playwright)
- E2E-01 StartGame@Classic: Given homepage loaded, When utilizatorul apasă Joacă, Then jocul începe pe Classic cu theme implicită și HUD complet.
- E2E-02 SelectDifficulty@Relaxed: Given homepage, When selectez Relaxed și pornesc jocul, Then viteza inițială corespunde curbei Relaxed și tema Relaxed se aplică.
- E2E-03 SelectDifficulty@Expert: Given homepage, When selectez Expert și pornesc jocul, Then spawn delay-ul redus și HUD Expert sunt active.
- E2E-04 PieceControl@Desktop: Simulează input tastatură (stânga/dreapta, rotire, hard drop) și validează pozițiile finale ale pieselor.
- E2E-05 PieceControl@Mobile: Rulează în viewport mobil, folosește tap pe controale virtuale și swipe pentru hard drop, verifică coliziunile.
- E2E-06 Scoring@MultiLine: Generează clearing de două linii, confirmă scorul și animațiile.
- E2E-07 LevelProgression@Expert: Joacă până la prag de nivel pe Expert, măsoară modificarea vitezei spawn și actualizarea UI.
- E2E-08 PauseMenu@DifficultySwitch: Pune pauză, schimbă dificultatea, revine și confirmă noii parametri de joc.
- E2E-09 GameOver@Restart: Forțează game over, verifică sumarul și restart curat al jocului.
- E2E-10 Leaderboard@Persistence: Obține scor, confirmă salvare în localStorage, reîncarcă și validează persistența.
- E2E-11 Settings@AudioGhost: Ajustează volumul și ghost piece, verifică efectele audio/vizuale în timp real.
- E2E-12 ThemeSwitch@Persistence: Schimbă tema vizuală, reîncarcă pagina și confirmă păstrarea preferinței.

### Suite smoke (executate pe fiecare build)
- ST-01 BootSmoke: încărcare homepage, verificare absență erori console, store Redux inițializat, canvas randat corect.
- ST-02 QuickStart: pornește jocul pe Classic, rulează 10 tick-uri simulate, confirmă că nu apar excepții și FPS > 55.
- ST-03 ControlsSanity: aplică un set minim de input (stânga, rotire, hard drop) și verifică poziția finală vs. snapshot logic.
- ST-04 PauseResume: intră în pauză și revine în 3 secunde, confirmă că timerul și piesa activă continuă corect.
- ST-05 LocalStorageHealth: scrie/șterge scor de test per dificultate și verifică fallback-ul la valori implicite.

### Mapare stories → acoperire test
- Relaxed flow: US-02, US-05, US-06 acoperite de E2E-02, E2E-06, E2E-07.
- Classic flow: US-01, US-03, US-08, US-12 prin E2E-01, E2E-04, E2E-09, ST-01, ST-02.
- Expert flow: US-02, US-06, US-07 prin E2E-03, E2E-07, E2E-08.
- Mobile & accesibilitate: US-04, US-10 prin E2E-05, E2E-11.
- Experiență vizuală: US-11 prin E2E-12, cu ST-02 monitorizând performanța temelor.
