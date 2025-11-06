"""
メール送信サービス

ユーザー承認・却下通知を管理
"""
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.core.config import settings
from typing import List


# メール接続設定
conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)


async def send_approval_email(user_email: str, user_name: str):
    """
    ユーザー承認メールを送信

    Args:
        user_email: 送信先メールアドレス
        user_name: ユーザー名
    """
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        print(f"⚠️ メール設定が未完了のため、承認メールは送信されません（{user_email}）")
        return

    html = f"""
    <html>
        <body>
            <h2>マザーAI - アカウント承認通知</h2>
            <p>こんにちは、{user_name}様</p>
            <p>マザーAIへの申請が承認されました。</p>
            <p>以下のURLからログインしてご利用いただけます：</p>
            <p><a href="http://localhost:3347/login">http://localhost:3347/login</a></p>
            <br>
            <p>マザーAIチーム</p>
        </body>
    </html>
    """

    message = MessageSchema(
        subject="【マザーAI】アカウントが承認されました",
        recipients=[user_email],
        body=html,
        subtype="html",
    )

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"✓ 承認メールを送信しました: {user_email}")
    except Exception as e:
        print(f"✗ メール送信エラー: {str(e)}")


async def send_rejection_email(user_email: str, user_name: str, reason: str = ""):
    """
    ユーザー却下メールを送信

    Args:
        user_email: 送信先メールアドレス
        user_name: ユーザー名
        reason: 却下理由
    """
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        print(f"⚠️ メール設定が未完了のため、却下メールは送信されません（{user_email}）")
        return

    reason_text = f"<p><strong>却下理由：</strong>{reason}</p>" if reason else ""

    html = f"""
    <html>
        <body>
            <h2>マザーAI - 申請結果通知</h2>
            <p>こんにちは、{user_name}様</p>
            <p>誠に申し訳ございませんが、マザーAIへの申請は承認されませんでした。</p>
            {reason_text}
            <p>ご不明な点がございましたら、お問い合わせください。</p>
            <br>
            <p>マザーAIチーム</p>
        </body>
    </html>
    """

    message = MessageSchema(
        subject="【マザーAI】申請結果のお知らせ",
        recipients=[user_email],
        body=html,
        subtype="html",
    )

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"✓ 却下メールを送信しました: {user_email}")
    except Exception as e:
        print(f"✗ メール送信エラー: {str(e)}")


async def send_admin_notification(applicant_name: str, applicant_email: str, purpose: str):
    """
    新規申請を管理者に通知

    Args:
        applicant_name: 申請者名
        applicant_email: 申請者メールアドレス
        purpose: 利用目的
    """
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        print(f"⚠️ メール設定が未完了のため、管理者通知は送信されません")
        return

    html = f"""
    <html>
        <body>
            <h2>マザーAI - 新規申請通知</h2>
            <p>新しいユーザー申請がありました。</p>
            <ul>
                <li><strong>名前：</strong>{applicant_name}</li>
                <li><strong>メール：</strong>{applicant_email}</li>
                <li><strong>利用目的：</strong>{purpose}</li>
            </ul>
            <p>管理画面から審査を行ってください。</p>
            <p><a href="http://localhost:3347/admin/applications">管理画面へ</a></p>
        </body>
    </html>
    """

    message = MessageSchema(
        subject="【マザーAI】新規ユーザー申請",
        recipients=[settings.MAIL_FROM],  # 管理者アドレス
        body=html,
        subtype="html",
    )

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"✓ 管理者通知メールを送信しました")
    except Exception as e:
        print(f"✗ メール送信エラー: {str(e)}")
