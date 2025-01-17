# TdA 2025 - Nic nechceme

- **Název týmu**: Nic nechceme
- **Členové**:  Matyáš Klimeš, Immamadin Babayev, Štěpán Helbich
- **Rok**: 2025

## Spuštění aplikace
- je potřeba mít nainstalováno:
    - Node.js v22.12.0
    - npm (většinou se instaluje s node.js)
    - docker (pokud spouštíme v kontejneru)


### local
nejdřív je potřeba aplikaci sestavit
```bash
  npm run build
```

spuštění aplikace lokálně (port 3000):
```bash
  npm start
```

### docker
nejdřív je potřeba kontejner sestavit:
```bash
  docker build . -t TdA2025
```

spuštění kontejneru
```bash
  docker run -p 3000:3000 TdA2025:latest
```

## Tech Stack

- Next.js - framework
- Mantine UI - UI knihovna
- MongoDB - databáze (zabudovaná přímo v aplikaci)
projekt používá typescript


## Vlastnosti

- Má robots.txt a generuje sitemapu pro všechny úlohy
- Možnost hrát proti základnímu "rule-based" botovi
- Aplikace odpovídá s nastavenými bezpečnostními hlavičkami