# マルチステージビルド: Python 3.11ベース
FROM python:3.11-slim as builder

# 作業ディレクトリ設定
WORKDIR /app

# システム依存パッケージのインストール
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Pythonの依存関係をインストール
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# 本番イメージ
FROM python:3.11-slim

# 非rootユーザーを作成
RUN useradd -m -u 1000 appuser

# 作業ディレクトリ設定
WORKDIR /app

# システム依存パッケージのインストール（実行時に必要なもののみ）
RUN apt-get update && apt-get install -y \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# ビルダーステージからPythonパッケージをコピー
COPY --from=builder /root/.local /home/appuser/.local

# アプリケーションコードをコピー
COPY --chown=appuser:appuser . .

# 環境変数設定
ENV PATH=/home/appuser/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

# 非rootユーザーに切り替え
USER appuser

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8080/health')"

# ポート公開
EXPOSE 8080

# uvicornでアプリケーション起動（Cloud Run用）
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1"]
