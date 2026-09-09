# 数据格式说明书：扩展和 API 收发的 JSON 结构。

from pydantic import BaseModel, Field
from datetime import datetime

class ItemCreate(BaseModel):
    text: str = Field(..., min_length=1)
    time: str
    tag: str | None = None


class Item(BaseModel):
    id: int
    text: str
    time: str
    tag: str
    created_at: datetime | None = None


class ItemTagUpdate(BaseModel):
    tag: str


class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1)
