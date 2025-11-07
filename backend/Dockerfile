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
# pip依存関係解決を高速化
ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1
RUN pip install --user --no-cache-dir -r requirements.txt

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
    PYTHONDONTWRITEBYTECODE=1

# 非rootユーザーに切り替え
USER appuser

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8080/health')"

# ポート公開
EXPOSE 8080

# uvicornでアプリケーション起動（Cloud Run用）
# PORTはCloud Runが自動的に設定するため、環境変数を参照
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1
