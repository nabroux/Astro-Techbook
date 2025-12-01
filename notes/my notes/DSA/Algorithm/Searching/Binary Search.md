---
title: "Binary Search"
lang: "zh"
translationKey: "binary-search"
published: false
tags: ["dsa", "algorithm", "searching"]
---
# Binary Search（二分搜尋）

## 標頭與簡介
Binary Search 在已排序陣列或答案具有單調性的情況下，透過反覆切半搜尋範圍，將時間複雜度從 $O(n)$ 降至 $O(\log n)$。直覺像在猜數字遊戲：每次問「太大或太小」，迅速縮小範圍。

## 正式定義與前提條件
- 輸入必須是排序好的或可定義單調性的函數。
- 基本流程：
  1. 設定 `left`, `right` 為搜尋邊界。
  2. 反覆取 `mid = left + (right - left) // 2`。
  3. 根據 `arr[mid]` 與 target 的比較，縮小邊界。
  4. 檢查終止條件（找到或 `left > right`）。

## 圖解 / 步驟說明
以 `[1,3,5,7,9]` 搜尋 7：
| 回合 | left | right | mid | arr[mid] | 行動 |
| --- | --- | --- | --- | --- | --- |
| 1 | 0 | 4 | 2 | 5 | 5 < 7 → left = mid+1 = 3 |
| 2 | 3 | 4 | 3 | 7 | 命中 → return 3 |

## 演算法偽碼與 Python 實作
```
while left <= right:
    mid = left + (right - left) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        left = mid + 1
    else:
        right = mid - 1
return -1
```
```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```
```python
def binary_search_recursive(arr, target, left=0, right=None):
    if right is None:
        right = len(arr) - 1
    if left > right:
        return -1
    mid = left + (right - left) // 2
    if arr[mid] == target:
        return mid
    if arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, right)
    return binary_search_recursive(arr, target, left, mid - 1)
```

## 時間與空間複雜度
- 時間：每輪砍半 → $O(\log n)$；最佳 $O(1)$（第一次即命中）。
- 空間：迭代 $O(1)$；遞迴版本 $O(\log n)$ call stack。

## 常見錯誤與坑
- `mid` 計算使用 `(left + right) // 2` 可能 overflow（C/C++）；建議 `left + (right-left)//2`。
- 邊界條件：使用 `while left < right` vs `<=` 需搭配正確的更新。
- 無限迴圈：未正確移動邊界。
- 重複元素：需要找第一個 >= target 或最後一個 <= target 時需調整條件。

## 變體與延伸
1. **Lower Bound / Upper Bound**：找第一個 >= target 或最後一個 <= target。
2. **Binary Search on Answer**：在單調可行性函數上二分（e.g. 最小可用半徑）。
3. **旋轉排序陣列搜尋**：先判斷哪邊有序再決定縮小哪側。
4. **二分浮點**：用 while 迴圈控制精度（迭代次數固定）。

## 實戰應用情境
- 搜尋排序資料（log 式 index、版本時間戳）。
- 判斷 minimal/maximal feasible value：排程最少時間、最小容量。
- 在 monotonic function (prefix sum, cumulative) 中找 threshold。

## 小結（重點整理）
1. Binary Search 適用於排序或單調條件，時間 $O(\log n)$。
2. 正確處理 `left`, `right`, `mid` 更新，避免 off-by-one。
3. 記得 `mid` 的 overflow 及迴圈條件（`<=` vs `<`）。
4. 延伸應用：lower bound、upper bound、答案二分、旋轉陣列、浮點逼近。
5. 面試答題：先表達前提，再給迭代模板，必要時補充遞迴版本與複雜度。
