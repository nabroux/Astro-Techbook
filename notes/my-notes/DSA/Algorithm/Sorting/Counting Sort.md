---
title: "Counting Sort"
lang: "zh"
translationKey: "counting-sort"
published: true
tags: ["todo dsa", "algorithm", "sorting"]
---
# Counting Sort（計數排序）

## 標頭與簡介
Counting Sort 適用於整數且範圍有限的資料。透過計算每個值的出現次數，再累積生成排序結果。直覺像分類考卷，先按分數放入桶中再依序收回。

## 正式定義與前提
- 前提：輸入元素可映射到 0..k 的整數範圍，且 k 不遠大於 n。
- 步驟：
  1. 建立計數陣列 `count[k+1]`，遍歷輸入計次。
  2. 計算 prefix sum，獲得每個值在輸出中的起始位置。
  3. 反向遍歷原陣列，根據 prefix sum 放入輸出並遞減計數（保持穩定）。

## 圖解
對 `[1, 4, 1, 2, 7, 5, 2]`：
1. count: `[0,2,2,0,1,1,0,1]`
2. prefix: `[0,2,4,4,5,6,6,7]`
3. 從尾到頭填入輸出。

## 偽碼與 Python
```
count = [0]*(k+1)
for num in arr:
    count[num] += 1
for i in 1..k:
    count[i] += count[i-1]
output = [0]*n
for i from n-1 downto 0:
    num = arr[i]
    count[num] -= 1
    output[count[num]] = num
return output
```
```python
def counting_sort(nums, max_value):
    count = [0] * (max_value + 1)
    for num in nums:
        count[num] += 1
    for i in range(1, len(count)):
        count[i] += count[i - 1]
    output = [0] * len(nums)
    for num in reversed(nums):
        count[num] -= 1
        output[count[num]] = num
    return output
```

## 複雜度
- 時間：$O(n + k)$（計數 + prefix + 填入）。
- 空間：$O(n + k)$（輸出 + 計數）。

## 常見錯誤
- 忘記處理負數（需偏移）。
- 未反向遍歷導致非穩定。
- k 過大導致空間爆炸。

## 變體與延伸
- Radix Sort：以 Counting Sort 作為每位數的穩定排序子程序。
- Bucket Sort：概念相近但 bucket 可排序內部元素。

## 實戰應用
- 排序年齡、分數等範圍有限數據。
- 作為 Radix Sort 的 building block（排序 32-bit 整數）。
- 統計 histogram、分配 ID。

## 小結（重點整理）
1. Counting Sort 透過計數+prefix 達到 $O(n+k)$，適用於範圍有限的整數。
2. 注意需要額外輸出陣列與計數陣列。
3. 反向迭代可保持穩定性。
4. k 過大時不適用，需考慮 Radix/Bucket 或其他排序。
5. 常用於 Radix Sort、統計類問題。
