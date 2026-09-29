"""Gera static/transcript.json a partir de static/transcript.txt (uma frase por linha).
Os tempos são estimados: proporcionais ao tamanho do texto e ajustados às pausas
detectadas no áudio (silencedetect do ffmpeg, passado em um arquivo 'start/end t')."""
import json, sys

linhas = [l.strip() for l in open("static/transcript.txt", encoding="utf-8") if l.strip()]
dur = float(sys.argv[2])
pausas, ini = [], None
for l in open(sys.argv[1]):
    k, t = l.split(); t = float(t)
    if k == "start": ini = t
    elif ini is not None: pausas.append((ini + t) / 2); ini = None
pausas = [p for p in pausas if 1 < p < dur - 1]

pesos = [len(l) + 6 for l in linhas]
total = sum(pesos); n = len(linhas)
alvo, acc = [], 0
for p in pesos[:-1]:
    acc += p; alvo.append(acc / total * dur)

# DP: escolhe n-1 pausas crescentes mais próximas dos alvos
m = len(pausas); INF = 1e18
custo = [[INF] * m for _ in range(n - 1)]
volta = [[-1] * m for _ in range(n - 1)]
for j in range(m): custo[0][j] = (pausas[j] - alvo[0]) ** 2
for i in range(1, n - 1):
    best, bj = INF, -1
    for j in range(m):
        if j > 0 and custo[i - 1][j - 1] < best: best, bj = custo[i - 1][j - 1], j - 1
        if bj >= 0: custo[i][j] = best + (pausas[j] - alvo[i]) ** 2; volta[i][j] = bj
j = min(range(m), key=lambda j: custo[n - 2][j]); cortes = []
for i in range(n - 2, -1, -1):
    cortes.append(pausas[j]); j = volta[i][j]
cortes = [0.0] + cortes[::-1] + [dur]
out = [{"start": round(cortes[i], 2), "end": round(cortes[i + 1], 2), "text": linhas[i]} for i in range(n)]
json.dump(out, open("static/transcript.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(n, "trechos")
