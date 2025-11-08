"""
デプロイメントサービス

GitHub、Vercel、Google Cloud Runへのデプロイを管理
"""

import os
import subprocess
import tempfile
import shutil
from typing import Dict, Any, Optional
from pathlib import Path
import httpx


class GitHubService:
    """GitHub リポジトリ操作サービス"""

    def __init__(self, access_token: Optional[str] = None):
        self.access_token = access_token or os.getenv("GITHUB_ACCESS_TOKEN")
        self.api_base = "https://api.github.com"

    async def create_repository(self, repo_name: str, private: bool = False) -> Dict[str, Any]:
        """GitHubリポジトリを作成"""
        if not self.access_token:
            raise ValueError("GitHub Access Tokenが設定されていません")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.api_base}/user/repos",
                headers={
                    "Authorization": f"Bearer {self.access_token}",
                    "Accept": "application/vnd.github.v3+json",
                },
                json={
                    "name": repo_name,
                    "private": private,
                    "auto_init": False,
                }
            )

            if response.status_code == 201:
                return response.json()
            else:
                raise Exception(f"GitHubリポジトリ作成失敗: {response.text}")

    def push_code(self, local_path: str, repo_url: str, branch: str = "main") -> str:
        """ローカルのコードをGitHubにプッシュ"""
        try:
            # Gitリポジトリを初期化
            subprocess.run(["git", "init"], cwd=local_path, check=True)
            subprocess.run(["git", "add", "."], cwd=local_path, check=True)
            subprocess.run(
                ["git", "commit", "-m", "Initial commit by マザーAI"],
                cwd=local_path,
                check=True
            )
            subprocess.run(
                ["git", "branch", "-M", branch],
                cwd=local_path,
                check=True
            )
            subprocess.run(
                ["git", "remote", "add", "origin", repo_url],
                cwd=local_path,
                check=True
            )
            subprocess.run(
                ["git", "push", "-u", "origin", branch],
                cwd=local_path,
                check=True
            )

            # 最新のコミットハッシュを取得
            result = subprocess.run(
                ["git", "rev-parse", "HEAD"],
                cwd=local_path,
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            raise Exception(f"Gitプッシュ失敗: {str(e)}")


class VercelService:
    """Vercel デプロイサービス"""

    def __init__(self, access_token: Optional[str] = None):
        self.access_token = access_token or os.getenv("VERCEL_ACCESS_TOKEN")
        self.api_base = "https://api.vercel.com"

    async def deploy_project(
        self,
        project_name: str,
        github_repo: str,
        framework: str = "vite"
    ) -> Dict[str, Any]:
        """Vercelにプロジェクトをデプロイ"""
        if not self.access_token:
            raise ValueError("Vercel Access Tokenが設定されていません")

        async with httpx.AsyncClient() as client:
            # プロジェクトを作成
            response = await client.post(
                f"{self.api_base}/v9/projects",
                headers={
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json",
                },
                json={
                    "name": project_name,
                    "framework": framework,
                    "gitRepository": {
                        "repo": github_repo,
                        "type": "github",
                    },
                }
            )

            if response.status_code in [200, 201]:
                project_data = response.json()

                # デプロイをトリガー
                deploy_response = await client.post(
                    f"{self.api_base}/v13/deployments",
                    headers={
                        "Authorization": f"Bearer {self.access_token}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "name": project_name,
                        "gitSource": {
                            "type": "github",
                            "repo": github_repo,
                            "ref": "main",
                        },
                    }
                )

                if deploy_response.status_code in [200, 201]:
                    deployment_data = deploy_response.json()
                    return {
                        "project": project_data,
                        "deployment": deployment_data,
                        "url": deployment_data.get("url"),
                    }
                else:
                    raise Exception(f"Vercelデプロイ失敗: {deploy_response.text}")
            else:
                raise Exception(f"Vercelプロジェクト作成失敗: {response.text}")


class CloudRunService:
    """Google Cloud Run デプロイサービス"""

    def __init__(self, project_id: Optional[str] = None):
        self.project_id = project_id or os.getenv("GCP_PROJECT_ID")
        self.region = os.getenv("GCP_REGION", "asia-northeast1")

    def deploy_service(
        self,
        service_name: str,
        source_path: str,
        port: int = 8000
    ) -> Dict[str, Any]:
        """Cloud Runにサービスをデプロイ"""
        if not self.project_id:
            raise ValueError("GCP Project IDが設定されていません")

        try:
            # gcloud コマンドでデプロイ
            result = subprocess.run(
                [
                    "gcloud", "run", "deploy", service_name,
                    "--source", source_path,
                    "--platform", "managed",
                    "--region", self.region,
                    "--allow-unauthenticated",
                    "--project", self.project_id,
                    "--port", str(port),
                ],
                capture_output=True,
                text=True,
                check=True
            )

            # デプロイされたURLを取得
            url_result = subprocess.run(
                [
                    "gcloud", "run", "services", "describe", service_name,
                    "--platform", "managed",
                    "--region", self.region,
                    "--project", self.project_id,
                    "--format", "value(status.url)",
                ],
                capture_output=True,
                text=True,
                check=True
            )

            service_url = url_result.stdout.strip()

            return {
                "status": "success",
                "service_name": service_name,
                "url": service_url,
                "region": self.region,
            }
        except subprocess.CalledProcessError as e:
            raise Exception(f"Cloud Runデプロイ失敗: {e.stderr}")


class DeploymentService:
    """統合デプロイメントサービス"""

    def __init__(self):
        self.github = GitHubService()
        self.vercel = VercelService()
        self.cloud_run = CloudRunService()

    async def deploy_full_stack_app(
        self,
        project_name: str,
        frontend_code: Dict[str, str],
        backend_code: Dict[str, str],
    ) -> Dict[str, Any]:
        """
        フルスタックアプリケーションをデプロイ

        1. GitHubリポジトリを作成
        2. フロントエンドをVercelにデプロイ
        3. バックエンドをCloud Runにデプロイ
        """
        try:
            # 一時ディレクトリを作成
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = Path(temp_dir)

                # フロントエンドのコードを書き込み
                frontend_path = temp_path / "frontend"
                frontend_path.mkdir()
                for file_path, content in frontend_code.items():
                    file_full_path = frontend_path / file_path
                    file_full_path.parent.mkdir(parents=True, exist_ok=True)
                    file_full_path.write_text(content)

                # バックエンドのコードを書き込み
                backend_path = temp_path / "backend"
                backend_path.mkdir()
                for file_path, content in backend_code.items():
                    file_full_path = backend_path / file_path
                    file_full_path.parent.mkdir(parents=True, exist_ok=True)
                    file_full_path.write_text(content)

                # Step 1: GitHubリポジトリを作成
                repo_data = await self.github.create_repository(
                    repo_name=project_name,
                    private=False
                )
                repo_url = repo_data["clone_url"]
                repo_full_name = repo_data["full_name"]

                # Step 2: コードをプッシュ
                commit_hash = self.github.push_code(
                    local_path=str(temp_path),
                    repo_url=repo_url
                )

                # Step 3: Vercelにデプロイ
                vercel_result = await self.vercel.deploy_project(
                    project_name=f"{project_name}-frontend",
                    github_repo=repo_full_name,
                )

                # Step 4: Cloud Runにデプロイ
                cloud_run_result = self.cloud_run.deploy_service(
                    service_name=f"{project_name}-backend",
                    source_path=str(backend_path),
                )

                return {
                    "status": "success",
                    "github": {
                        "repository": repo_full_name,
                        "url": repo_data["html_url"],
                        "commit": commit_hash,
                    },
                    "frontend": {
                        "url": vercel_result["url"],
                        "deployment_id": vercel_result["deployment"].get("id"),
                    },
                    "backend": {
                        "url": cloud_run_result["url"],
                        "service_name": cloud_run_result["service_name"],
                    },
                }

        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
            }


def get_deployment_service() -> DeploymentService:
    """デプロイメントサービスのシングルトンインスタンスを取得"""
    return DeploymentService()
