---
title: "Linear Search"
lang: "zh"
translationKey: "linear-search"
published: true
tags: ["dsa", "algorithm", "searching"]
---
# Linear Search（線性搜尋）

## 簡介
用逐一掃描的方式在序列中尋找目標，適用於未排序資料或小型輸入。直覺像翻閱書本直到找到特定段落。

## 正式定義與前提條件
- 對每個元素依序比較，若找到等於 target 的值則回傳索引；若遍歷完畢仍未找到則回傳 -1。
- 不需要排序或任何前置條件，支援各種容器（Array、Linked List）。

## 圖解 / 步驟說明
以 `[4, 2, 9, 7]` 找 9：
1. 比較 index 0：4 ≠ 9。
2. 比較 index 1：2 ≠ 9。
3. 比較 index 2：9 = 目標 → 回傳 2。

## 偽碼與 Python 實作
```
for i from 0 to n-1:
    if arr[i] == target:
        return i
return -1
```
```python
def linear_search(arr, target):
    for i, value in enumerate(arr):
        if value == target:
            return i
    return -1
```

## 時間與空間複雜度
- 時間：最差 / 平均 $O(n)$，最佳 $O(1)$（第一個元素即命中）。
- 空間：$O(1)$，僅使用常數變數。

## 常見錯誤與坑
- 忘了處理空陣列。
- Linked List 上未檢查 `None` 造成 NullPointer。
- 找到後忘記提前返回，導致多餘計算。

## 變體與延伸
- 搜尋多個出現：可收集所有索引。
- 判斷元素是否存在（布林回傳）。
- 線性搜尋 + guard（sentinel）減少邊界檢查。

## 實戰應用情境
- 小資料集合或 seldom search 的容器。
- 指標跳轉昂貴的結構（單向 list）。
- 初步檢查 caches（e.g. LRU list）再 fallback 至 hash table。

## 小結（重點整理）
1. Linear Search 逐一比較，無需排序或事前資訊。
2. 時間複雜度 $O(n)$，空間 $O(1)$。
3. 適合小資料或一次性搜尋，否則應選擇更快結構。
4. 注意空集合與找到即返回。
5. 常在較複雜演算法中當作 fallback（例如 hash miss 後在 bucket 內線性搜尋）。
