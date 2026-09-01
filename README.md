# 我必须知道的东西

## 1. 项目架构
Chrome Extension → FastAPI → MySQL

## 2. API
POST /api/items
GET /api/items

## 3. 数据库
items
id
content
created_at

## 4. 为什么用 MySQL
...

## 5. 为什么以后需要 Redis
...

## 6. 为什么以后需要 MQ
...

## 7. 我自己写过的代码
popup.js
...

## 8. 我目前不会的
...


V1

复制 → 保存 → 查看

你真正理解：

Chrome Extension
JavaScript
HTTP
API
FastAPI
MySQL


V2

搜索 + 分类
加入：
搜索
标签
时间
简单分类

你开始理解数据库查询、索引。

V3

Redis
比如最近访问的数据缓存。
你亲眼看到：
第一次查询
→ MySQL
第二次查询
→ Redis
这时候你学 Redis 会非常快。

V4

MQ + AI
保存之后：
用户复制
 ↓
API
 ↓
MySQL
 ↓
MQ
 ↓
AI Worker
 ↓
分类 / 摘要 / 提取信息
这时候你终于能理解：
为什么消息队列叫“解耦”。
因为保存和 AI 分析已经不需要绑死在一个请求里。
你提出需求
                  ↓
           AI 帮你设计方案
                  ↓
             你理解方案
                  ↓
           AI 写一个小功能
                  ↓
              你运行
                  ↓
             你测试
                  ↓
          出 bug → AI Debug
                  ↓
          你理解为什么修好
                  ↓
              Git commit