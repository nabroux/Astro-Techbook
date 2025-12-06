---
title: "Bubble Sort"
lang: "zh"
translationKey: "bubble-sort"
published: true
tags: ["todo dsa", "algorithm", "sorting"]
---
# Bubble Sort（氣泡排序）

## 標頭與簡介
Bubble Sort 透過重複比較相鄰元素並交換，使較大的元素逐步「冒泡」到陣列尾端。直覺像將重物慢慢往上推。

## 正式定義與前提條件
- 步驟：
  1. 迭代 n-1 輪。
  2. 每輪從開頭到 `n - i - 1`，若相鄰元素順序錯誤則交換。
  3. 若整輪沒有交換即可提前結束。
- 適用任何可比較元素；穩定排序。

## 圖解 / 步驟
以 `[5, 1, 4, 2]`：第一輪比較 (5,1)→交換，(5,4)→交換，(5,2)→交換 ⇒ 5 到尾端。

## 偽碼與 Python
```
for i in 0..n-2:
    swapped = false
    for j in 0..n-i-2:
        if arr[j] > arr[j+1]: swap
        swapped = true
    if not swapped: break
```
```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
```

## 複雜度
- 時間：平均/最壞 $O(n^2)$，最佳 $O(n)$（已排序且 swap flag 提前退出）。
- 空間：$O(1)$，原地排序。

## 常見錯誤
- 忘記縮短內迴圈範圍，導致多餘比較。
- 忘記 swapped flag 造成最佳情況仍 $O(n^2)$。

## 變體
- 雙向 Bubble（Cocktail Sort）：同時從左右冒泡。
- Counting swap 次數用於 inversion count（僅適用小 n）。

## 實戰情境
- 只適用於教學或超小輸入。實務 rarely 使用。

## 小結
1. Bubble Sort 重複交換相鄰元素，簡單但效率低。
2. 平均/最差 $O(n^2)$，空間 $O(1)$。
3. 可以透過 swap flag 在已排序陣列達 $O(n)$。
4. 主要用於教學示例或 quick check，不應用於大型資料。
5. 穩定排序，可作為理解其他排序的起點。
