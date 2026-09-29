import json
import os

from flask import Flask, jsonify, render_template

BASE = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__)

IMG_EXT = (".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/images")
def images():
    pasta = os.path.join(BASE, "static", "img")
    arquivos = sorted(f for f in os.listdir(pasta) if f.lower().endswith(IMG_EXT))
    return jsonify([f"/static/img/{f}" for f in arquivos])


@app.route("/api/transcript")
def transcript():
    caminho = os.path.join(BASE, "static", "transcript.json")
    if not os.path.exists(caminho):
        return jsonify([])
    with open(caminho, encoding="utf-8") as f:
        return jsonify(json.load(f))


@app.route("/healthz")
def healthz():
    return "ok"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
