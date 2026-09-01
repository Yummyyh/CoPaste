# 把复制记录存进 MySQL，并按同样的接口读出来。
# V2：自动分类、按关键字/标签查询，并给常用筛选字段加索引。

import os

import pymysql

from schemas import Item, ItemCreate

MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "copaste")

_ready = False

# 规则只标形态；JD/知识 留给你手动改，下一步再交给大模型
ALLOWED_TAGS = ("链接", "代码", "JD", "知识", "其他", "未分类")


def classify_text(text: str) -> str:
    t = text.strip()
    lower = t.lower()
    if lower.startswith(("http://", "https://", "www.")):
        return "链接"
    if any(token in t for token in ("def ", "function ", "const ", "=>", "import ", "{")):
        return "代码"
    return "未分类"


def _connect(*, with_database: bool):
    kwargs = {
        "host": MYSQL_HOST,
        "port": MYSQL_PORT,
        "user": MYSQL_USER,
        "password": MYSQL_PASSWORD,
        "charset": "utf8mb4",
        "cursorclass": pymysql.cursors.DictCursor,
        "autocommit": True,
    }
    if with_database:
        kwargs["database"] = MYSQL_DATABASE
    return pymysql.connect(**kwargs)


def _migrate_v2(cur):
    cur.execute("SHOW COLUMNS FROM items")
    cols = {row["Field"] for row in cur.fetchall()}
    if "tag" not in cols:
        cur.execute(
            "ALTER TABLE items ADD COLUMN tag VARCHAR(32) NOT NULL DEFAULT '未分类'"
        )
    if "created_at" not in cols:
        cur.execute(
            "ALTER TABLE items ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"
        )

    cur.execute("SHOW INDEX FROM items")
    indexes = {row["Key_name"] for row in cur.fetchall()}
    if "idx_items_tag" not in indexes:
        cur.execute("CREATE INDEX idx_items_tag ON items (tag)")
    if "idx_items_created_at" not in indexes:
        cur.execute("CREATE INDEX idx_items_created_at ON items (created_at)")

    cur.execute("UPDATE items SET tag = '未分类' WHERE tag = '文本'")


def _ensure_ready():
    global _ready
    if _ready:
        return

    conn = _connect(with_database=False)
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DATABASE}` CHARACTER SET utf8mb4"
            )
            cur.execute(f"USE `{MYSQL_DATABASE}`")
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS items (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    text TEXT NOT NULL,
                    time VARCHAR(64) NOT NULL,
                    tag VARCHAR(32) NOT NULL DEFAULT '未分类',
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            _migrate_v2(cur)
    finally:
        conn.close()

    _ready = True


def add_item(data: ItemCreate) -> Item:
    _ensure_ready()
    tag = data.tag or classify_text(data.text)
    conn = _connect(with_database=True)
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO items (text, time, tag) VALUES (%s, %s, %s)",
                (data.text, data.time, tag),
            )
            item_id = cur.lastrowid
    finally:
        conn.close()

    return Item(id=item_id, text=data.text, time=data.time, tag=tag)


def get_all_items(q: str | None = None, tag: str | None = None) -> list[Item]:
    _ensure_ready()
    sql = "SELECT id, text, time, tag FROM items WHERE 1=1"
    params: list[str] = []

    if q:
        sql += " AND text LIKE %s"
        params.append(f"%{q}%")
    if tag:
        sql += " AND tag = %s"
        params.append(tag)

    sql += " ORDER BY id DESC"

    conn = _connect(with_database=True)
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()
    finally:
        conn.close()

    return [
        Item(id=row["id"], text=row["text"], time=row["time"], tag=row["tag"])
        for row in rows
    ]


def update_item_tag(item_id: int, tag: str) -> Item | None:
    if tag not in ALLOWED_TAGS:
        raise ValueError("invalid tag")

    _ensure_ready()
    conn = _connect(with_database=True)
    try:
        with conn.cursor() as cur:
            cur.execute("UPDATE items SET tag = %s WHERE id = %s", (tag, item_id))
            if cur.rowcount == 0:
                return None
            cur.execute("SELECT id, text, time, tag FROM items WHERE id = %s", (item_id,))
            row = cur.fetchone()
    finally:
        conn.close()

    if not row:
        return None
    return Item(id=row["id"], text=row["text"], time=row["time"], tag=row["tag"])
