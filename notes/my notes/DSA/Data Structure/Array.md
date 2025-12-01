---
title: Array
lang: zh
translationKey: array
published: false
tags:
  - dsa
  - data structure
---
# Array（陣列）

## 定義與直覺
- **正式定義**：Array 是一塊連續的記憶體區域，存放相同型別的元素，透過索引（index）在 $O(1)$ 時間存取。
- **直覺類比**：像一排編號好的信箱或書櫃，每個格子大小固定，能直接跳到目標格子。
- **與 ArrayList / Linked List 的取捨**：Array 需要事先知道大小，插入刪除昂貴；Linked List 插入刪除快但無法隨機存取。對 CPU 快取友善，適合大量順序讀取。

## 結構圖解
```
index:  0    1    2    3    4
value: [10][23][31][42][55]
```
- 節點不存在，僅固定大小格子。
- 若實作動態陣列（如 Python list）會在容量不足時 realloc，摺疊成 amortized $O(1)$ append。

## 基本操作與時間複雜度
| 操作 | 描述 | 時間複雜度 | 原因 |
| --- | --- | --- | --- |
| 讀取 `arr[i]` | 依 index 取值 | $O(1)$ | 直接位移到 offset。
| 搜尋 | 找到特定值 | $O(n)$ | 需要線性掃描。
| 插入頭 | 在位置 0 插入 | $O(n)$ | 後面元素需右移。
| 插入尾 | 尾部 append | $O(1)$ amortized | 若容量足夠直接放入。
| 插入中間 | 任意 index 插入 | $O(n)$ | 需搬移後段元素。
| 刪除頭/中/尾 | 移除元素 | $O(n)$ | 需左移填補空洞。

## 程式碼模板（Python）
```python
class ArrayWrapper:
    def __init__(self, capacity):
        self.data = [None] * capacity
        self.size = 0

    def _check_bounds(self, index):
        if index < 0 or index >= self.size:
            raise IndexError("index out of range")

    def append(self, value):
        if self.size == len(self.data):
            self._resize()
        self.data[self.size] = value
        self.size += 1

    def prepend(self, value):
        self.insert(0, value)

    def insert(self, index, value):
        if self.size == len(self.data):
            self._resize()
        if index < 0 or index > self.size:
            raise IndexError("insert position invalid")
        for i in range(self.size, index, -1):
            self.data[i] = self.data[i - 1]
        self.data[index] = value
        self.size += 1

    def delete(self, index):
        self._check_bounds(index)
        for i in range(index, self.size - 1):
            self.data[i] = self.data[i + 1]
        self.data[self.size - 1] = None
        self.size -= 1

    def search(self, value):
        for i in range(self.size):
            if self.data[i] == value:
                return i
        return -1

    def _resize(self):
        new_data = [None] * (len(self.data) * 2 or 1)
        for i in range(self.size):
            new_data[i] = self.data[i]
        self.data = new_data
```

## 常見面試考題型態
- 陣列旋轉 / 反轉：要求 in-place 交換，考記憶體操作。
- Two Sum / Subarray Sum：考 hash map 或 prefix sum 結合陣列。
- Sliding Window：連續子陣列最大/最小、最長字串等。
- Binary Search on Array：適用已排序陣列或答案單調性問題。

## 和其他資料結構比較
- **Array vs Linked List**：Array 快速隨機存取，List 適合頻繁插入刪除。
- **Array vs Hash Table**：Hash Table 提供平均 $O(1)$ 搜尋但需 hashing；Array 須靠 index。
- **Array vs Tree**：樹支援階層資料與範圍查詢；Array 只是一維結構。

## 實戰觀點 & 使用情境
- 底層儲存，如 socket buffer、ring buffer、動態陣列實作。
- 數據分析中的向量、Tensor 核心皆為 Array。
- 現代語言內建 list 仍以 array 為核心，理解可優化 cache locality、減少 resize。

## 小結（重點整理）
1. Array 是固定順序的連續記憶體，支援 $O(1)$ 隨機存取。
2. 插入刪除需搬移元素，最差 $O(n)$。
3. 透過動態擴容可達 amortized $O(1)$ append。
4. 套用 Sliding Window、Prefix Sum、Binary Search 都以 Array 為基礎。
5. 理解 cache locality、邊界檢查與 index 計算是寫高效程式的關鍵。
