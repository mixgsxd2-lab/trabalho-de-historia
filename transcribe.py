"""Gera static/transcript.json a partir de static/audio/podcast.mp3 (Whisper).
Roda no build do Render. Pula se o arquivo já existir."""
import json
import os

BASE = os.path.dirname(os.path.abspath(__file__))
AUDIO = os.path.join(BASE, "static", "audio", "podcast.mp3")
SAIDA = os.path.join(BASE, "static", "transcript.json")

if os.path.exists(SAIDA):
    print("transcript.json já existe, nada a fazer.")
    raise SystemExit(0)

from faster_whisper import WhisperModel

modelo = WhisperModel(os.environ.get("WHISPER_MODEL", "base"), compute_type="int8")
segmentos, _ = modelo.transcribe(AUDIO, language="pt", vad_filter=True)
dados = [
    {"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip()}
    for s in segmentos
]
with open(SAIDA, "w", encoding="utf-8") as f:
    json.dump(dados, f, ensure_ascii=False, indent=1)
print(f"{len(dados)} trechos transcritos.")
