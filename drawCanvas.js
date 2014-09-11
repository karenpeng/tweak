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

  this.isDrawingStart = false;
  this.isDrawingDone = false;
  this.path = new paper.Path();
  var interval = 5;
  this.time = 0;
  this.stop = 0;
  this.texts = [];

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
  for (var i = this.beginX; i <= beginPointX + this.width; i += interval) {
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

LittleCanvas.prototype.modify = function () {
  console.log("origin segments length of " + this.path.segments.length);
  for (var j = 0; j < this.path.segments.length - 1;) {
    if (this.path.segments[j].point.x >= this.path.segments[j + 1].point.x) {
      this.path.removeSegment(j + 1);
      console.log("delete the " + j + "th segment");
      j = 0;
    } else {
      j++;
    }
  }
  console.log("modified segments length of " + this.path.segments.length);

  for (var i = 1; i < this.path.segments.length - 1; i++) {
    var p = this.path.segments[i].point;
    var pNxt = this.path.segments[i + 1].point;
    var pPre = this.path.segments[i - 1].point;

    var hdlIn = {
      x: p.x + this.path.segments[i].handleIn.x,
      y: p.y + this.path.segments[i].handleIn.y,
    };

    //actually this is a function called angleBetween in processing
    var hdlInVctr = new PVector(hdlIn.x - p.x, hdlIn.y - p.y);
    var pointsInVctr = new PVector(pPre.x - p.x, pPre.y - p.y);
    var hdlInDis = hdlInVctr.mag();
    var pointsInDis = pointsInVctr.mag();
    var thetaIn = Math.acos(hdlInVctr.dot(pointsInVctr) /
      (hdlInDis * pointsInDis));
    console.log("point " + i + " has a handleIn angle value of " +
      thetaIn + ", a handleIn dist of " + hdlInDis);

    var hdlInOri = null;
    var timerIn = 0;
    if (timerIn === 0) {
      hdlInOri = {
        x: hdlIn.x,
        y: hdlIn.y
      };
      timerIn++;
    }

    var hdlOut = {
      x: p.x + this.path.segments[i].handleOut.x,
      y: p.y + this.path.segments[i].handleOut.y
    };
    //
    //actually this is a function called angleBetween in processing
    var hdlOutVctr = new PVector((hdlOut.x - p.x), (hdlOut.y - p.y));
    var pointsVctr = new PVector((pNxt.x - p.x), (pNxt.y - p.y));
    var hdlOutDis = hdlOutVctr.mag();
    var pointsDis = pointsVctr.mag();
    var thetaOut = Math.acos(hdlOutVctr.dot(pointsVctr) /
      (hdlOutDis * pointsDis));
    //
    console.log("point " + i + " has a handleOut angle value of " +
      thetaOut + ", a handleOut dist of " + hdlOutDis);

    var hdlOutOri = null;
    var timerOut = 0;
    if (timerOut === 0) {
      hdlOutOri = {
        x: hdlOut.x,
        y: hdlOut.y
      };
      timerOut++;
    }

    var angle = 0.001;

    while (hdlInDis > 30 && hdlOutDis > 30) {
      console.log("modifying " + i + "th point's handleIn distance " + hdlInDis);
      this.path.segments[i].handleIn.x = math.lerp(hdlIn.x, p.x, angle) - p.x;
      this.path.segments[i].handleIn.y = math.lerp(hdlIn.y, p.y, angle) - p.y;
      hdlIn = {
        x: p.x + this.path.segments[i].handleIn.x,
        y: p.y + this.path.segments[i].handleIn.y,
      };
      hdlInVctr = new PVector(hdlIn.x - p.x, hdlIn.y - p.y);
      hdlInDis = hdlInVctr.mag();
      console.log("modifying " + i + "th point's handleOut distance " +
        hdlOutDis);
      this.path.segments[i].handleOut.x = math.lerp(hdlOutOri.x, p.x, angle) -
        p.x;
      this.path.segments[i].handleOut.y = math.lerp(hdlOutOri.y, p.y, angle) -
        p.y;
      hdlOut = {
        x: p.x + this.path.segments[i].handleOut.x,
        y: p.y + this.path.segments[i].handleOut.y
      };
      hdlOutVctr = new PVector((hdlOut.x - p.x), (hdlOut.y - p.y));
      hdlOutDis = hdlOutVctr.mag();
      angle += 0.01;
    }

    /*
    while(thetaIn > 0.2 && thetaOut > 0.2){
      //rotate?
    }
*/

    var angleIn = 0.001;

    while (thetaIn > 0.15 && hdlInDis > 20 || hdlInDis > 50) {
      console.log("modifying " + i + "th point's handleIn distance " + hdlInDis);
      this.path.segments[i].handleIn.x = math.lerp(hdlIn.x, p.x, angleIn) - p.x;
      this.path.segments[i].handleIn.y = math.lerp(hdlIn.y, p.y, angleIn) - p.y;
      angleIn += 0.001;
      hdlIn = {
        x: p.x + this.path.segments[i].handleIn.x,
        y: p.y + this.path.segments[i].handleIn.y,
      };
      hdlInVctr = new PVector(hdlIn.x - p.x, hdlIn.y - p.y);
      hdlInDis = hdlInVctr.mag();
    }

    var angleOut = 0.01;

    while (thetaOut > 0.15 && hdlOutDis > 20 || hdlOutDis > 50) {
      console.log("modifying " + i + "th point's handleOut distance " +
        hdlOutDis);
      this.path.segments[i].handleOut.x = math.lerp(hdlOutOri.x, p.x, angleOut) -
        p.x;
      this.path.segments[i].handleOut.y = math.lerp(hdlOutOri.y, p.y, angleOut) -
        p.y;
      angleOut += 0.01;
      hdlOut = {
        x: p.x + this.path.segments[i].handleOut.x,
        y: p.y + this.path.segments[i].handleOut.y
      };
      hdlOutVctr = new PVector((hdlOut.x - p.x), (hdlOut.y - p.y));
      hdlOutDis = hdlOutVctr.mag();
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
      this.path.smooth();
      this.path.simplify();
      this.modify();

      var that = this;
      this.path.segments.forEach(function (s, index) {
        var t = new paper.PointText({
          point: s.point,
          fillColor: 'white',
          fontSize: 10,
          content: index,
        });
        that.texts.push(t);
        that.textGroup.addChild(t);
      });
    } else {
      this.path.smooth();
      this.path.simplify();
      this.modify();
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
  console.log("return location data amount of " + this.value.length);
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