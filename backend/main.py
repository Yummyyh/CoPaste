# 主文件，定义路由、中间件等。

import logging
from pathlib import Path

from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

# 启动时自动加载 .env 文件中的环境变量
load_dotenv(Path(__file__).with_name(".env"))

from dify_service import DifyServiceError, analyze_jd
from schemas import AnalyzeRequest, Item, ItemCreate, ItemTagUpdate
import store

logger = logging.getLogger(__name__)

app = FastAPI(title="CoPaste API", version="2.0.0")

# 添加跨域中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 添加复制记录
@app.post("/api/items", response_model=Item, status_code=201)
def create_item(data: ItemCreate, background_tasks: BackgroundTasks) -> Item:
    item = store.add_item(data)
    return item

# 直接分析文本内容，返回结构化结果
@app.post("/api/analyze", response_model=dict)
def analyze_text(data: AnalyzeRequest ) -> dict:
    try:
        return analyze_jd(data.text)
    except DifyServiceError as exc:
        logger.exception("Dify analysis failed for /api/analyze: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# 分析数据库里的记录
@app.post("/api/items/{item_id}/analyze", response_model=dict)
def analyze_item(item_id: int) -> dict:
    item = store.get_item(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="记录不存在")
    try:
        return analyze_jd(item.text)
    except DifyServiceError as exc:
        logger.exception("Dify analysis failed for item %s: %s", item_id, exc)
        raise HTTPException(status_code=502, detail=str(exc)) from exc

# 获取所有复制记录
@app.get("/api/items", response_model=list[Item])
def list_items(
    q: str | None = Query(default=None, description="按文字搜索"),
    tag: str | None = Query(default=None, description="按分类筛选"),
) -> list[Item]:
    keyword = q.strip() if q else None
    category = tag.strip() if tag else None
    return store.get_all_items(q=keyword, tag=category)

# 更新复制记录的标签
@app.patch("/api/items/{item_id}", response_model=Item)
def patch_item_tag(item_id: int, data: ItemTagUpdate) -> Item:
    try:
        item = store.update_item_tag(item_id, data.tag)
    except ValueError:
        raise HTTPException(status_code=400, detail="不支持的标签")
    if item is None:
        raise HTTPException(status_code=404, detail="记录不存在")
    return item
