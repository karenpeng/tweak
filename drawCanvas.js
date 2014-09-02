module.exports = LittleCanvas;

var map = require('./map');
var constrain = require('./constrain');

function LittleCanvas(beginPointX, beginPointY) {
  this.width = 320;
  this.height = 240;
  this.radius = 5;
  this.beginX = beginPointX + this.radius;
  this.beginY = beginPointY + this.radius + 10;
  this.endX = beginPointX + this.width - this.radius;
  this.endY = beginPointY + this.height - this.radius - 10;
  this.time = 0;
  this.isDrawingStart = false;
  this.isDrawingDone = false;
  this.path = new paper.Path();
  this.interval = 20;
  this.stop = 0;

  //making begin and end point
  this.beginP = new paper.Path.Circle(this.beginX, this.beginY, this.radius);
  this.endP = new paper.Path.Circle(this.endX, this.endY, this.radius);
  this.beginP.strokeColor = 'white';
  this.endP.strokeColor = 'white';

  //making draw area
  this.drawArea = new paper.Path.Rectangle(beginPointX, beginPointY,
    this.width,
    this.height);
  this.drawArea.strokeColor = 'white';

  //set hitOptions for edite
  this.hitOptions = {
    segments: true,
    stroke: true,
    fill: false,
    tolerance: 8
  };

  //making interval x path
  this.verticalPaths = [];
  for (var i = this.beginX; i <= beginPointX + this.width; i += this.interval) {
    var verticalPath = new paper.Path.Line(i, beginPointY, i, beginPointY +
      this.height);
    //verticalPath.strokeColor = 'black';
    this.verticalPaths.push(verticalPath);
  }
}

LittleCanvas.prototype.onMouseDown = function (e) {
  if (this.drawArea.bounds.contains(e.point)) {
    if (isDrawingMode) {
      if (this.beginP.bounds.contains(e.point)) {
        this.beginP.fillColor = 'blue';
        this.path.strokeColor = {
          gradient: {
            stops: ['blue', 'red', 'yellow']
          },
          origin: [this.beginX, this.beginY],
          destination: [this.endX, this.endY]
        };
        this.path.strokeWidth = 4;
        this.path.add(new paper.Point(this.beginX - this.radius, this.beginY));
        this.isDrawingStart = true;
      }
    } else {
      this.hitSegment = null;
      var hitResult = paper.project.hitTest(e.point, this.hitOptions);
      if (!hitResult) {
        return;
      }
      if (e.modifiers.shift) {
        if (hitResult.type === 'segment') {
          hitResult.segment.remove();
        }
        return;
      }
      if (hitResult) {
        if (hitResult.type === 'segment') {
          this.hitSegment = hitResult.segment;
          //console.log(this.hitSegment)
        } else if (hitResult.type === 'stroke') {
          var location = hitResult.location;
          this.hitSegment = this.path.insert(location.index + 1, e.point);
          this.path.smooth();
        }
      }
    }
  }
};

LittleCanvas.prototype.onMouseDrag = function (e) {
  var that = this;
  if (this.drawArea.bounds.contains(e.point)) {
    if (isDrawingMode) {
      this.path.segments.forEach(function (s, index) {
        if (s.point.x >= e.point.x) {
          that.path.removeSegment(index);
        }
      });
      this.path.add(e.point);
      if (this.endP.bounds.contains(e.point)) {
        this.endP.fillColor = "yellow";
      }
    } else if (this.hitSegment) {
      var index = this.hitSegment.index;
      this.hitSegment.point.y += e.delta.y;
      this.hitSegment.point.x += e.delta.x;
      this.hitSegment.point.x = constrain(this.hitSegment.point.x, this.path.segments[
          index - 1].point.x + 0.0000001, this.path.segments[index + 1]
        .point.x -
        0.0000001);
      this.path.smooth();
    }
  }
};

LittleCanvas.prototype.onMouseUp = function (e) {
  if (this.isDrawingStart) {
    if (isDrawingMode) {
      if (!this.endP.bounds.contains(e.point)) {
        this.path.add(new paper.Point(this.endX, this.endY));
      }
      this.endP.fillColor = 'yellow';
      this.path.firstSegment.point.x = this.beginX;
      this.path.firstSegment.point.y = this.beginY;
      this.path.lastSegment.point.x = this.endX;
      this.path.lastSegment.point.y = this.endY;
      this.isDrawingDone = true;
      this.isDrawingStart = false;
    }
  }
  if (this.path) {
    this.path.smooth();
    for (var i = 0; i < this.path.segments.length - 1; i++) {
      if (this.path.segments[i].point.x >= this.path.segments[i + 1].point.x) {
        this.path.removeSegment(i + 1);
        console.log("delete the " + i + 1 + "th segments");
      }
    }
    this.path.simplify();
  }
};

LittleCanvas.prototype.getValue = function () {
  this.value = [];
  var that = this;
  this.verticalPaths.forEach(function (pa) {
    var intersections = that.path.getIntersections(pa);
    intersections.forEach(function (intersection) {
      that.value.push([intersection.point.x, intersection.point.y]);
    });
  });
};

LittleCanvas.prototype.setInput = function (property, start, end,
  totalSeconds) {
  this.property = property;
  this.block = Math.floor(60 / this.verticalPaths.length * totalSeconds);
  if (this.boo) {
    this.boo.remove();
  }
  switch (this.property) {
  case 'y':
    //making moving ball
    this.boo = new paper.Path.Circle(this.beginX + this.width, this.beginY,
      this.radius);
    this.start = start + this.beginY;
    this.end = end + this.beginY;
    break;
  case 'x':
    this.boo = new paper.Path.Circle(this.beginX + this.width, (this.endY -
      this.beginY) / 2, this.radius);
    this.start = start + this.width + this.beginX;
    this.end = end + this.width + this.beginX;
    break;
  case 'size':
    this.boo = new paper.Path.Circle(this.beginX + this.width, (this.endY -
      this.beginY) / 2, this.radius);
    break;
  default:
    this.boo = new paper.Path.Circle(this.beginX + this.width, this.beginY,
      this.radius);
  }
  this.boo.fillColor = 'white';
};

LittleCanvas.prototype.mapValue = function (frameCount) {
  if (frameCount % this.block === 0 && this.value.length !== 0) {
    switch (this.property) {
    case 'y':
      this.boo.position.y = map(this.value[this.time][1], this.beginY, this.endY,
        this.start, this.end);
      break;
    case 'x':
      this.boo.position.x = map(this.value[this.time][1], this.beginY, this.endY,
        this.start, this.end);
      break;
    case 'size':
      this.boo.bounds.width = this.value[this.time][1] / 2;
      this.boo.bounds.height = this.value[this.time][1] / 2;
      break;
    default:
      //do nothing;
    }
    if (this.time < this.value.length - 1) {
      this.time++;
    } else {
      this.stop++;
      if (this.stop > 10) {
        this.time = 0;
        this.stop = 0;
      }
    }
  }
};