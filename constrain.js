module.exports = function (item, min, max) {
  if (item < min) return min;
  else if (item > max) return max;
  else return item;
};