module.exports = math;

function math() {

}

math.prototype.map = function (para, orMin, orMax, tarMin, tarMax) {
  var ratio = (para - orMin) / (orMax - orMin);
  var tarValue = ratio * (tarMax - tarMin) + tarMin;
  return tarValue;
};

math.prototype.constrain = function (item, min, max) {
  if (item < min) return min;
  else if (item > max) return max;
  else return item;
};

math.prototype.dist = function (point1X, point1Y, point2X, point2Y) {
  var dX = point1X - point2X;
  var dY = point1Y - point2Y;
  var dis = Math.sqrt((Math.pow(dX, 2) + Math.pow(dY, 2)));
  return dis;
};

math.prototype.lerp = function (start, stop, amt) {
  var value = (stop - start) * amt + start;
  return value;
};