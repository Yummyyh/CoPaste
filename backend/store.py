# 把复制记录存进 MySQL，并按同样的接口读出来。
# V2：自动分类、按关键字/标签查询，并给常用筛选字段加索引。

import os
import time

import pymysql

from schemas import Item, ItemCreate
from datetime import date, timedelta

MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "copaste")

#开头_ 这个文件内的私有变量 数据库还未初始化
_ready = False

ALLOWED_TAGS = ( "JD", "未分类")


# 关键词分类
def classify_text(text: str) -> str:
    t = text.strip()
    if any(token in t for token in ("职位 ", "岗位")):
        return "JD"
    return "未分类"


# 后台分类
'''
def classify_by_keywords(text: str) -> str:
    t = text.lower()
    if any(word in t for word in ("招聘", "岗位", "职位", "任职", "职责")):
        return "JD"
    return "未分类"

# 请求已经返回后才跑：不挡住复制
def classify_in_background(item_id: int, text: str) -> None:
    time.sleep(1)
    tag = classify_by_keywords(text)
    update_item_tag_if_unclassified(item_id, tag)
'''

# 连接数据库
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

# 迁移数据库 v3：分类规则更新：仅保留未分类、JD
def _migrate_v3(cur):
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
    # 为 tag 和 created_at（创建时间）创建索引
    if "idx_items_tag" not in indexes:
        cur.execute("CREATE INDEX idx_items_tag ON items (tag)")
    if "idx_items_created_at" not in indexes:
        cur.execute("CREATE INDEX idx_items_created_at ON items (created_at)")


    cur.execute("UPDATE items SET tag = '未分类' WHERE tag IN ('代码', '知识', '其他')")


# 确保数据库准备好了
def _ensure_ready():
    global _ready
    if _ready:
        return

    conn = _connect(with_database=False)
    try:
        # `with`写法好处：代码块结束后游标自动关闭
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
            _migrate_v3(cur)
        conn.commit()
    finally:
        conn.close()

    _ready = True


# 添加复制记录
def add_item(data: ItemCreate) -> Item:
    _ensure_ready()
    tag = data.tag or classify_text(data.text)
    conn = _connect(with_database=True)
    # 插入复制记录
    try:
        # with 用于自动关闭连接
        with conn.cursor() as cur:
            cur.execute("INSERT INTO items (text, time, tag) VALUES (%s, %s, %s)", (data.text, data.time, tag))
            # 获取插入的记录ID
            item_id = cur.lastrowid
    # 最后关闭连接
    finally:
        conn.close()
    # 返回插入的记录
    return Item(id=item_id, text=data.text, time=data.time, tag=tag)

# 获取所有复制记录
def get_all_items(
    q: str | None = None,
    tag: str | None = None,
    sort: str = "newest",
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[Item]:
    _ensure_ready()

    if sort not in {"newest", "oldest"}:
        raise ValueError("invalid sort")

    sql = """
        SELECT id, text, time, tag, created_at
        FROM items
        WHERE 1=1
    """
    params: list[str | date] = []

    # 加入动态拼接查询条件
    if q:
        # 模糊查询
        sql += " AND text LIKE %s"
        params.append(f"%{q}%")
    if tag:
        # 精确查询
        sql += " AND tag = %s"
        params.append(tag)
    if start_date:
        sql += " AND created_at >= %s"
        params.append(start_date)
    if end_date:
        sql += " AND created_at <= %s"
        params.append(end_date + timedelta(days=1))  # 包含结束日期

    order = "DESC" if sort == "newest" else "ASC"
    sql += f" ORDER BY created_at {order}, id {order}"

    conn = _connect(with_database=True)
    try:
        # with 用于自动关闭连接
        with conn.cursor() as cur:
            # 执行查询
            cur.execute(sql, params)
            rows = cur.fetchall()
    # 最后关闭连接
    finally:
        conn.close()

    # 返回查询结果
    return [
        Item(
            id=row["id"],
            text=row["text"],
            time=row["time"],
            tag=row["tag"],
            created_at=row["created_at"],
        )
        for row in rows
    ]


def get_item(item_id: int) -> Item | None:
    _ensure_ready()
    conn = _connect(with_database=True)
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, text, time, tag, created_at FROM items WHERE id = %s",
                (item_id,),
            )
            row = cur.fetchone()
    finally:
        conn.close()

    if not row:
        return None
    return Item(
        id=row["id"],
        text=row["text"],
        time=row["time"],
        tag=row["tag"],
        created_at=row["created_at"],
    )

# 更新复制记录的标签
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


# 只改仍是「未分类」的记录，避免盖掉你刚手动改的标签
def update_item_tag_if_unclassified(item_id: int, tag: str) -> None:
    if tag not in ALLOWED_TAGS:
        return

    _ensure_ready()
    conn = _connect(with_database=True)
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE items SET tag = %s WHERE id = %s AND tag = '未分类'",
                (tag, item_id),
            )
    finally:
        conn.close()
