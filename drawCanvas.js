module.exports = LittleCanvas;

var mMath = require('./math');
var math = new mMath();
var PVector = require('./pvector');

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
  this.interval = 5;
  this.stop = 0;
  this.texts = [];
  this.textNum = 0;

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

  //group items
  this.boundGroup = new paper.Group();
  this.pathGroup = new paper.Group();
  this.textGroup = new paper.Group();

  this.pathGroup.addChild(this.path);

  this.boundGroup.addChild(this.drawArea);
  this.boundGroup.addChild(this.beginP);
  this.boundGroup.addChild(this.endP);

  //set hitOptions for edite
  this.hitOptions = {
    segments: true,
    stroke: true,
    fill: false,
    tolerance: 5
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
      //only modify points on the path
      if (hitResult.item.parent === this.pathGroup) {
        if (hitResult.type === 'segment') {
          this.hitSegment = hitResult.segment;
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
      this.hitSegment.point.x = math.constrain(this.hitSegment.point.x, this.path
        .segments[
          index - 1].point.x + 0.0000001, this.path.segments[index + 1]
        .point.x -
        0.0000001);
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
    //}
    if (this.path) {
      this.path.smooth();
      this.path.simplify();
      for (var i = 0; i < this.path.segments.length - 1; i++) {
        var p = this.path.segments[i].point;
        var pNxt = this.path.segments[i + 1].point;
        if (p.x >= pNxt.x) {
          this.path.removeSegment(i + 1);
          console.log("delete the " + i + "th segment");
        } else {
          var hdlOut = this.path.segments[i].handleOut;
          //TODO:need to store the first value pf hdlOut.x and gdlOut.y

          //
          //actually this is a function called angleBetween in processing
          var hdlOutVctr = new PVector((hdlOut.x - p.x), (hdlOut.y - p.y));
          var pointsVctr = new PVector(pNxt.x - p.x, pNxt.y - p.y);
          var hdlOutDis = hdlOutVctr.mag();
          var pointsDis = pointsVctr.mag();
          var thetaOut = Math.acos(hdlOutVctr.dot(pointsVctr) /
            (hdlOutDis * pointsDis));
          //
          console.log("point " + i + " has a handleOut angle value of " +
            thetaOut + ", a handleOut dist of " + hdlOutDis);

          while (thetaOut > 1 && hdlOutDis > 200) {
            console.log("modifying" + i + "th point's handleOut");
            hdlOut.x = math.lerp(orgHdlOut[0], p.x, 0.0001);
            hdlOut.y = math.lerp(orgHdlOut[1], p.y, 0.0001);
          }

          var hdlIn = this.path.segments[i + 1].handleIn;
          //
          //actually this is a function called angleBetween in processing
          var hdlInVctr = new PVector((hdlIn.x - p.x), (hdlIn.y - p.y));
          var pointsVctrReverse = new PVector(p.x - pNxt.x, p.y - pNxt.y);
          var hdlInDis = hdlInVctr.mag();
          var pointsReverseDis = pointsVctrReverse.mag();
          var thetaIn = Math.acos(hdlInVctr.dot(pointsVctrReverse) /
            (hdlInDis * pointsReverseDis));
          while (thetaIn > 1 && hdlInDis > 200) {
            console.log("modifying" + (i + 1) + "th point's handleIn");
            hdlIn.x = math.lerp(hdlIn.x, p.x, 0.0001);
            hdlIn.y = math.lerp(hdlIn.y, p.y, 0.0001);
          }

          console.log("point " + i + " has a handleIn angle value of " +
            thetaIn + ", a handleIn dist of " + hdlInDis);
        }
      }
      this.path.smooth();
      this.path.simplify();

      var that = this;
      this.path.segments.forEach(function (s) {
        var t = new paper.PointText({
          point: s.point,
          fillColor: 'white',
          fontSize: 10,
          content: that.textNum,
        });
        that.texts.push(t);
        that.textNum++;
        that.textGroup.addChild(t);
      });
    }
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
  //console.log("return location data amount of " + this.value.length);
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
      this.boo.position.y = math.map(this.value[this.time][1], this.beginY,
        this.endY,
        this.start, this.end);
      break;
    case 'x':
      this.boo.position.x = math.map(this.value[this.time][1], this.beginY,
        this.endY,
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
      if (this.stop > 30) {
        this.time = 0;
        this.stop = 0;
      }
    }
  }
};