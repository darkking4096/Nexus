"""
Instagram client powered by Instagrapi
Provides business account validation and session management
"""

from flask import Flask, request, jsonify
from instagrapi import Client
import json
import os
from datetime import datetime
from typing import Optional, Dict, Any


class InstaClient:
    """Wrapper around Instagrapi Client for authentication and account validation"""

    def __init__(self):
        self.client: Optional[Client] = None
        self.logged_in = False

    def connect(self, username: str, password: str) -> Dict[str, Any]:
        """
        Authenticate with Instagram and return account info + session

        Returns:
            {
                "account_info": {...},
                "session_data": {...},
                "is_business": bool,
                "is_creator": bool
            }
        """
        try:
            self.client = Client()
            self.client.login(username, password)
            self.logged_in = True

            account_info = self.get_account_info_internal()
            session_data = self.client.get_settings()

            return {
                "account_info": account_info,
                "session_data": session_data,
                "is_business": account_info.get("is_business", False),
                "is_creator": account_info.get("is_creator", False),
            }
        except Exception as e:
            raise Exception(f"Login failed: {str(e)}")

    def get_account_info_internal(self) -> Dict[str, Any]:
        """Get current user's account information"""
        if not self.client or not self.logged_in:
            raise Exception("Not authenticated")

        try:
            user_id = self.client.user_id
            user_info = self.client.user_info(user_id)

            return {
                "instagram_id": user_id,
                "instagram_username": user_info.username,
                "bio": user_info.biography,
                "followers_count": user_info.follower_count,
                "profile_picture_url": user_info.profile_pic_url,
                "is_business": user_info.is_business,
                "is_creator": user_info.is_creator,
            }
        except Exception as e:
            raise Exception(f"Failed to get account info: {str(e)}")

    def is_business_or_creator(self, account_type: str) -> bool:
        """Validate that account is business or creator type"""
        return account_type in ["BUSINESS", "CREATOR"]

    def close(self):
        """Cleanup client"""
        if self.client:
            try:
                self.client.logout()
            except:
                pass
        self.logged_in = False


# Flask app
app = Flask(__name__)
insta = InstaClient()


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "service": "instagrapi-bridge"}), 200


@app.route("/connect", methods=["POST"])
def connect():
    """
    POST /connect
    Body: { "username": "...", "password": "..." }
    Response: { "account_info": {...}, "session_data": {...}, ... }
    """
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"error": "Missing username or password"}), 400

        result = insta.connect(username, password)
        return jsonify(result), 200

    except Exception as e:
        insta.close()
        return jsonify({"error": str(e)}), 401


@app.route("/account", methods=["POST"])
def account():
    """
    POST /account
    Body: { "username": "..." }
    Response: { "account_info": {...} }

    Note: Requires prior authentication (not standalone)
    """
    try:
        if not insta.logged_in:
            return jsonify({"error": "Not authenticated"}), 401

        account_info = insta.get_account_info_internal()
        return jsonify(account_info), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/logout", methods=["POST"])
def logout():
    """Cleanup and logout"""
    try:
        insta.close()
        return jsonify({"status": "logged out"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Development: run on port 5001
    # Production: use gunicorn or similar
    port = int(os.getenv("INSTA_SERVICE_PORT", 5001))
    app.run(host="localhost", port=port, debug=False)
