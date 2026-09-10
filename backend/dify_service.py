# **封装调用 Dify 工作流的 Python 服务文件**，专门用来把 JD（岗位描述）文本丢给 Dify 工作流做解析，返回结构化的分析结果。

import json
import logging
import os 
from pathlib import Path

import httpx
from dotenv import load_dotenv


load_dotenv(Path(__file__).with_name(".env"))
logger = logging.getLogger(__name__)

class DifyServiceError(Exception):
    pass

# 读取环境变量 .env 里面的配置；如果.env没读到DIFY_API_URL，就使用默认兜底地址
DIFY_API_URL = os.getenv(
    "DIFY_API_URL", "https://api.dify.ai/v1/workflows/run"
)
DIFY_API_KEY = os.getenv("DIFY_API_KEY")

# 调用Dify工作流分析JD文本，返回字典
def analyze_jd(jd_content: str, resume_content: str = "", url: str = "") -> dict:
    if not DIFY_API_KEY:
        raise DifyServiceError("DIFY_API_KEY is not configured on the backend")

    try:
        response = httpx.post(
            DIFY_API_URL,
            headers={
                "Authorization": f"Bearer {DIFY_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "inputs": {
                    "JD_content": jd_content,
                    "URL": url,
                    "Resume_content": resume_content,
                },
                "response_mode": "blocking",
                "user": "copaste-user",
            },
            timeout=60.0, # 请求超时60秒，Dify工作流跑太久直接超时报错
        )
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            detail = response.text.strip()
            raise DifyServiceError(
                f"Dify returned HTTP {response.status_code}: {detail}"
            ) from exc
        # 把返回的http响应体解析成json字典
        payload = response.json()
        raw = payload["data"]["outputs"]["JD_Summarize"]
        logger.warning(
            "Dify JD_Summarize raw output: type=%s content=%r",
            type(raw).__name__,
            raw,
        )

        # Dify may return the structured output as an object or as a JSON string.
        if isinstance(raw, dict):
            return raw
        if not isinstance(raw, str):
            raise ValueError("JD_Summarize must be a JSON object or string")
        if "<think>" in raw and "</think>" in raw:
            raw = raw.split("</think>", 1)[1]
        # Normalize typographic quotes before parsing a stringified JSON result.
        return json.loads(raw.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'").strip())
    
  
    # 捕获所有可能出错类型: 网络异常、字典key不存在、类型错误、json解析失败
    # 包装成自定义异常 DifyServiceError向上抛出，from exc保留原始异常栈
    # 自定义异常目的：**统一错误出口、业务语义明确、分层解耦，`from exc`保留原始报错方便调试  
    except (httpx.HTTPError, KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
        raise DifyServiceError(f"Dify analysis failed: {exc}") from exc