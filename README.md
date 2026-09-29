# Podcast — Holocausto: o pós-guerra

Site em Flask com player (play/pause, velocidade 1x/2x), transcrição sincronizada e fundo cinza com imagens em rotação.

- Áudio: `static/audio/podcast.mp3`
- Imagens de fundo: qualquer arquivo em `static/img/` (jpg, png, webp, svg) entra sozinho. Troque os SVG por fotos reais.
- Transcrição: `static/transcript.json`, gerada com Whisper no build (`transcribe.py`). Se o arquivo existir, é reaproveitado.

Local: `pip install -r requirements.txt && python app.py`

Render: New > Blueprint apontando para este repositório (usa `render.yaml`).
