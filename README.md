# Fritsche Photos

Portfólio do fotógrafo Victor (Fritz). Site em Angular publicado no GitHub Pages:
https://garciaa43.github.io/fritsche-photos/

## Adicionar ou trocar fotos

Os **originais ficam fora do projeto**, na pasta `fritsche-originais`, ao lado
desta pasta (na Área de Trabalho). Eles nunca vão para o Git.

1. Crie uma subpasta por álbum dentro de `fritsche-originais`. Número (ordem) e
   data são opcionais:

   ```
   fritsche-originais/
     01 — Trackside — 2025-05-10/
     20 — Casamento Ana e João — 2026-12-01/
     Skate na Pista X/
   ```

2. Copie as fotos (JPG ou PNG) para a pasta do álbum. Pode ter subpastas.
3. Rode:

   ```bash
   npm run fotos
   ```

   Ele gera, para cada foto nova, uma miniatura (800 px) e uma versão grande
   (2200 px) em `public/fotos/`, e atualiza a lista de álbuns. Fotos já
   processadas são puladas, fotos repetidas entram uma vez só e fotos apagadas
   dos originais saem do site.

Para usar outra pasta de originais: `npm run fotos -- "D:\Fotos do Fritz"`.

Cada foto ocupa cerca de 400 KB no site. O GitHub Pages aceita até 1 GB, o que
dá umas 2.400 fotos.

## Textos

Tudo fica em `src/app/data/conteudo.ts`: Sobre, frases da página inicial, fotos
da abertura e do mosaico (pelo nome do arquivo original), WhatsApp, mensagem
pronta e Instagram (em `CONTATO`), números do contador e
local/descrição de cada álbum (em `ajustes`).

## Publicar

```bash
npm run publicar
```

Gera o site e envia para a branch `gh-pages`. Em 1 ou 2 minutos o link é
atualizado. Rode pelo cmd ou pelo terminal do VS Code.

## Desenvolvimento

```bash
npm start
```

Abre em `http://localhost:4200/`.
