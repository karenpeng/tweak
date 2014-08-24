// var drawCanvas = document.createElement('canvas');
// drawCanvas.setAttribute('id', 'drawCanvas' + itr);
// drawCanvas.setAttribute('height', '200px');
// drawCanvas.setAttribute('style', 'padding:5px; margin:0;');
// canvasGroup.appendChild(drawCanvas);

// var canvasId = 'drawCanvas' + itr;
// paper.setup(canvasId);
//console.log(paper.projects)

//with(paper) {

function littleCanvas(beginPointX, beginPointY, map, constrain) {
  this.width = 320;
  this.height = 240;
  this.radius = 5;
  this.beginX = beginPointX + this.radius;
  this.beginY = beginPointY + this.radius;
  this.endX = beginPointX + this.width - this.radius;
  this.endY = beginPointY + this.height - this.radius;
  this.interval = 6;
  this.time = 0;
  this.isDrawingDone = false;

  //making begin and end point
  this.beginP = new paper.Path.Circle(this.beginX, this.beginY, this.radius);
  this.endP = new paper.Path.Circle(this.endX, this.endY, this.radius);
  this.beginP.strokeColor = 'black';
  this.endP.strokeColor = 'black';

  //making draw area
  this.drawArea = new paper.Path.Rectangle(this.beginPointX, this.beginPointY,
    this.width,
    this.height);
  this.drawArea.strokeColor = 'black';

  //making interval x path
  this.verticalPaths = [];
  for (var i = this.beginX; i <= this.endX; i += this.interval) {
    var verticalPath = new paper.Path.Line(new paper.Point(i, 0), new paper
      .Point(
        i, this.height));
    //verticalPath.strokeColor = 'black';
    this.verticalPaths.push(verticalPath);
  }

  //making moving ball
  this.boo = new paper.Path.Circle(this.beginPointX + this.width + this.radius,
    this.beginY,
    this.radius);
  this.boo.fillColor = 'blue';

  //set hitOptions for edite
  this.hitOptions = {
    segments: true,
    stroke: true,
    fill: false,
    tolerance: 5
  };
}

littleCanvas.prototype.onMouseDown = function (e) {
  if (isDrawingMode) {
    if (this.beginP.bounds.contains(e.point)) {
      this.beginP.fillColor = 'blue';
      this.path = new paper.Path();
      this.path.strokeColor = {
        gradient: {
          stops: ['blue', 'green', 'yellow']
        },
        origin: [0, 0],
        destination: [this.width, 0]
      };
      this.path.strokeWidth = 8;
      this.path.add(new paper.Point(this.beginX, this.beginY));
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
      } else if (hitResult.type === 'stroke') {
        var location = hitResult.location;
        this.hitSegment = this.path.insert(location.index + 1, e.point);
        this.path.smooth();
      }
    }
  }
};

littleCanvas.prototype.onMouseDrag = function (e) {
  if (isDrawingMode) {
    if (this.drawArea.bounds.contains(e.point)) {
      this.path.segments.forEach(function (s, index) {
        if (s.point.x >= e.point.x) {
          this.path.removeSegment(index);
        }
      });
      this.path.add(e.point);
      if (this.endP.bounds.contains(e.point)) {
        this.endP.fillColor = "yellow";
      }
    }
  } else if (this.hitSegment) {
    var index = this.hitSegment.index;
    this.hitSegment.point.x += e.delta.x;
    this.hitSegment.point.x = constrain(this.hitSegment.point.x, this.path.segments[
        index - 1].point.x + 0.0000001, this.path.segments[index + 1].point.x -
      0.0000001);
    this.hitSegment.point.y += e.delta.y;
    this.path.smooth();
  }
};

littleCanvas.prototype.onMouseUp = function (e) {
  if (isDrawingMode) {
    if (!this.endP.bounds.contains(e.point)) {
      this.path.add(new paper.Point(this.endX, this.endY));
    }
    this.endP.fillColor = 'yellow';
    this.path.smooth();
    this.path.simplify();
    this.path.firstSegment.point.x = beginX;
    this.path.firstSegment.point.y = beginY;
    this.path.lastSegment.point.x = endX;
    this.path.lastSegment.point.y = endY;
    this.isDrawingDone = true;
  }
};

littleCanvas.prototype.onMouseMove = function (e) {
  if (!isDrawingMode) {
    paper.project.activeLayer.selected = false;
    if (e.item) {
      e.item.selected = true;
    }
  }
};

littleCanvas.prototype.getValue = function () {
  this.value = [];
  this.verticalPaths.forEach(function (pa) {
    var intersections = this.path.getIntersections(pa);
    intersections.forEach(function (intersection) {
      this.value.push([intersection.point.x, intersection.point.y]);
    });
  });
};

littleCanvas.prototype.mapValue = function () {
  this.boo.position.y = this.value[time][1];
  this.boo.fillColor.hue = map(this.boo.position.y, this.beginY, this.endY, 240,
    60);
  this.time++;
  if (this.time >= this.value.length) this.time = 0;
};

//TODO:

//1.hooking up for use, css3!!!!

//3.i think it should involves live coding, the code control all the canvas

//4.generative design? Or just a ball?

//  }
//  whatever();

//console.log(paperScrope.project)
module.exports = littleCanvas;