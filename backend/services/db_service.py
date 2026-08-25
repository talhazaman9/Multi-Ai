import sqlite3
import uuid
import json
import os
from typing import List, Dict, Any, Optional
from config import settings

class DBService:
    def __init__(self, db_path: str = settings.DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _get_conn(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS conversations (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id TEXT PRIMARY KEY,
                    conversation_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS documents (
                    id TEXT PRIMARY KEY,
                    filename TEXT NOT NULL,
                    file_path TEXT NOT NULL,
                    file_type TEXT NOT NULL,
                    file_size INTEGER NOT NULL,
                    chunks_count INTEGER NOT NULL,
                    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()

    def create_conversation(self, title: str = "New Conversation") -> str:
        conv_id = str(uuid.uuid4())
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO conversations (id, title) VALUES (?, ?)", (conv_id, title))
            conn.commit()
        return conv_id

    def list_conversations(self) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT id, title, created_at, updated_at FROM conversations ORDER BY updated_at DESC")
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def get_conversation_messages(self, conv_id: str) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT id, role, content, timestamp FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC", (conv_id,))
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def add_message(self, conv_id: str, role: str, content: str) -> str:
        msg_id = str(uuid.uuid4())
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)",
                           (msg_id, conv_id, role, content))
            # Auto update title if first message
            cursor.execute("SELECT COUNT(*) FROM messages WHERE conversation_id = ?", (conv_id,))
            count = cursor.fetchone()[0]
            if count <= 2 and role == "user":
                title = content[:30] + ("..." if len(content) > 30 else "")
                cursor.execute("UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (title, conv_id))
            else:
                cursor.execute("UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (conv_id,))
            conn.commit()
        return msg_id

    def delete_conversation(self, conv_id: str):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM messages WHERE conversation_id = ?", (conv_id,))
            cursor.execute("DELETE FROM conversations WHERE id = ?", (conv_id,))
            conn.commit()

    def add_document_record(self, doc_id: str, filename: str, file_path: str, file_type: str, file_size: int, chunks_count: int):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO documents (id, filename, file_path, file_type, file_size, chunks_count)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (doc_id, filename, file_path, file_type, file_size, chunks_count))
            conn.commit()

    def list_documents(self) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT id, filename, file_type, file_size, chunks_count, uploaded_at FROM documents ORDER BY uploaded_at DESC")
            return [dict(r) for r in cursor.fetchall()]

    def delete_document_record(self, doc_id: str):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
            conn.commit()

    def export_conversations_to_dataframe(self):
        import pandas as pd
        with self._get_conn() as conn:
            return pd.read_sql_query("SELECT * FROM conversations", conn)

    def export_messages_to_dataframe(self, conv_id: Optional[str] = None):
        import pandas as pd
        with self._get_conn() as conn:
            query = "SELECT * FROM messages WHERE conversation_id = ?" if conv_id else "SELECT * FROM messages"
            params = (conv_id,) if conv_id else ()
            return pd.read_sql_query(query, conn, params=params)

db_service = DBService()
