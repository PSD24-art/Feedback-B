// let str = "abbccaba";

// function lengthOfLongestSubstring(s) {
//   let charset = new Set();
//   let left = 0;
//   let max = 0;

//   for (let right = 0; right < s.length; right++) {
//     while (charset.has(s[right])) {
//       charset.delete(s[left]);
//       left++;
//     }

//     charset.add(s[right]);
//     max = Math.max(max, right - left + 1);
//   }

//   return max;
// }

// console.log(lengthOfLongestSubstring(str));

// let nums = [2, 1, 5, 1, 3, 2];

// let k = 3;

// function maxSum(arr, k) {
//   let left = 0;
//   let max = 0;
//   let sum = 0;
//   for (let right = 0; right < arr.length; right++) {
//     sum += arr[right];
//     if (right >= k - 1) {
//       max = Math.max(max, sum);

//       sum -= arr[left];
//       left++;
//     }
//   }

//   return max;
// }

// console.log(maxSum(nums, k));

// let nums = [-1, 0, 3, 5, 9, 12];

// let target = 9;

// function binarySearch(arr, t) {
//   let left = 0;
//   let right = arr.length - 1;

//   while (left <= right) {
//     let mid = Math.floor((left + right) / 2);

//     if (arr[mid] === t) {
//       return mid;
//     }

//     if (arr[mid] < t) {
//       left = mid + 1;
//     } else {
//       right = mid - 1;
//     }
//   }
//   return -1;
// }

// console.log(binarySearch(nums, target));

// const array = [
//   [1, 3],
//   [2, 6],
//   [8, 10],
//   [15, 18],
// ];

// function mergeOverlapping(arr) {
//   let start = arr[0][0];
//   let end = arr[0][1];

//   let res = [];

//   for (let i = 1; i < arr.length; i++) {
//     if (end > arr[i][0]) {
//       end = arr[i][1];
//     } else {
//       res.push([start, end]);
//       start = arr[i][0];
//       end = arr[i][1];
//     }
//   }
//   res.push([start, end]);

//   return res;
// }

// console.log(mergeOverlapping(array));

// const mat = [
//   [1, 2, 3],
//   [4, 5, 6],
//   [7, 8, 9],
// ];

// function rotateBy90(m) {
//   let res = [];
//   for (let j = 0; j < m.length; j++) {
//     let arr = [];

//     for (let i = m.length - 1; i >= 0; i--) {
//       arr.push(m[i][j]);
//     }

//     res.push(arr);
//   }
//   return res;
// }

// console.log(rotateBy90(mat));

// console.log(10 === "10");
