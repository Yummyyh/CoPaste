# 主文件，定义路由、中间件等。

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from schemas import Item, ItemCreate, ItemTagUpdate
import store

app = FastAPI(title="CoPaste API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/items", response_model=Item, status_code=201)
def create_item(data: ItemCreate) -> Item:
    return store.add_item(data)


@app.get("/api/items", response_model=list[Item])
def list_items(
    q: str | None = Query(default=None, description="按文字搜索"),
    tag: str | None = Query(default=None, description="按分类筛选"),
) -> list[Item]:
    keyword = q.strip() if q else None
    category = tag.strip() if tag else None
    return store.get_all_items(q=keyword, tag=category)


@app.patch("/api/items/{item_id}", response_model=Item)
def patch_item_tag(item_id: int, data: ItemTagUpdate) -> Item:
    try:
        item = store.update_item_tag(item_id, data.tag)
    except ValueError:
        raise HTTPException(status_code=400, detail="不支持的标签")
    if item is None:
        raise HTTPException(status_code=404, detail="记录不存在")
    return item
