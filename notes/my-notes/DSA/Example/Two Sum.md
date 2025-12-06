---
title: Two Sum
lang: zh
translationKey: two-sum
published: true
tags:
  - dsa
  - example
  - hashmap
---
# Two Sum

## 1. 題目重述（Problem Restatement）
給定整數陣列 `nums` 與目標 `target`，找出兩個索引 `i, j`（i ≠ j），使 `nums[i] + nums[j] = target`。回傳任一組索引即可。假設只有唯一解，元素可為正、負或零。

## 2. 範例理解
- Input: `nums = [2,7,11,15]`, `target=9` → 2 + 7 = 9，因此輸出 `[0,1]`。
- Input: `nums = [3,2,4]`, `target=6` → 2 + 4 = 6，輸出 `[1,2]`。
- 關鍵在於找到互補值 `target - nums[i]` 是否已出現。

## 3. 暴力解（Brute Force 思路）
- 兩層迴圈：檢查每對 (i,j) 是否相加為 target。
- Python：
```python
for i in range(len(nums)):
    for j in range(i + 1, len(nums)):
        if nums[i] + nums[j] == target:
            return [i, j]
```
- 複雜度：時間 $O(n^2)$，空間 $O(1)$。
- 缺點：當 n 很大（1e5）會 TLE。

## 4. 最佳化思路（High-level Idea）
- 使用 Hash Map 儲存「值 -> 索引」。
- 逐一遍歷，檢查 `target - nums[i]` 是否已在 map 中；若是即回傳。
- 單次遍歷即可，時間降至 $O(n)$，空間 $O(n)$。

## 5. 正式解法（Detailed Solution）
```python
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    raise ValueError("No solution")
```
- `seen` 儲存已走過元素的索引。
- 先查補值再放入 map，避免與同一元素配對。

## 6. 複雜度分析
- 時間：一次遍歷 → $O(n)$。
- 空間：Hash Map 最多存 n 項 → $O(n)$。

## 7. 常見錯誤與陷阱
- 先把 `num` 放進 map 再查補值會回傳同一索引。
- 忘記處理負數或零（其實 hash map 自動處理，主要是觀念）。
- 當結果不唯一時要確保回傳任一合法組合。

## 8. 延伸思考
- 若需回傳所有組合：必須處理重複值，可使用 dictionary + list。
- 若陣列已排序，可用 Two Pointers（無需 hash）。
- 若需要持續查詢（online），可考慮將數值存入 hash set，逐次輸出。

## 9. 小結（重點整理）
1. 暴力雙迴圈 $O(n^2)$，無法應付大輸入。
2. 使用 Hash Map 紀錄值到索引，補值匹配可降為 $O(n)$。
3. 查補值要在寫入前，以避免重複使用同一元素。
4. 當資料已排序可選擇 Two Pointers。
5. 類似題：Two Sum II、3Sum、4Sum，概念可延伸。
