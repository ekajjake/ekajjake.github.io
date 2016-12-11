var h = 400;
var w = 1.618 * h;
var middleX = w/2;
var middleY = h/2
var inset = 50;
var smoothness = 3000;
var steps = 15;
var heightInfluence = 10;
var ridgeDrift = -3.5;
var ridgeJitter = 1.75;
var shadeScale = 2;

document.getElementById("smoothness").value = smoothness;
document.getElementById("steps").value = steps;
document.getElementById("heightInfluence").value = heightInfluence;

var jitter = function(x, y) {
   var base = w - 2 * inset;
   var height = h - 2 * inset;
   
   var randInward = 
      Math.random()
      * (base / smoothness);

   randInward *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
   
   var randUpward = 
      Math.random() 
      * ((height / smoothness) + y / (heightInfluence));
   
   randUpward *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
   
   return {x: randInward, y: randUpward};
}

var buildMountain = function() {
   var m = {};
   m.edge = [];
   m.ridge = [];
   var edge = d3.path();
   var ridge = d3.path();
   var xStart = 0 + inset;
   var yStart = h - inset;
   var yTop = 0 + inset;
   var yEnd = h - inset;
   var xEnd = w - inset;
   var xRes = Math.abs((middleX - xStart) / steps);
   var yRes = Math.abs((yTop - yStart) / steps);

   var ridgeX = 0;
   var ridgeY = 0;

   var x = xStart;
   var y = yStart;

   edge.moveTo(x, y)
   m.edge.push({x: x, y: y});

   while (y > yTop) {
      var j = jitter(x, y);
      x += xRes + j.x;
      y -= yRes + j.y;
      edge.lineTo(x, y);
      m.edge.push({x: x, y: y});
   }

   ridgeX = x;
   ridgeY = y;
   m.peakX = x;
   m.peakY = y;

   ridge.moveTo(ridgeX, ridgeY);
   m.ridge.push({x: ridgeX, y: ridgeY});

   while (ridgeY < yEnd) {
      var j = jitter(ridgeX, ridgeY);
      ridgeX += (xRes / ridgeDrift) + (j.x * ridgeJitter);
      ridgeY += yRes + j.y;
      ridge.lineTo(ridgeX, ridgeY);
      m.ridge.push({x: ridgeX, y: ridgeY});
   }

   while (y < yEnd) {
      var j = jitter(x, y);
      x += xRes + j.x;
      y += yRes + j.y;
      edge.lineTo(x, y)
      m.edge.push({x: x, y: y});
   }

   m.edgeString = edge.toString();
   m.ridgeString = ridge.toString();
   m.ridge.reverse();

   return m;
}

var generateShading = function(m) {
   var shade = d3.path();

   for (var i = 0; i < m.ridge.length; i++) {
      if (m.ridge[i].y !== m.peakY && m.ridge[i] && m.edge[i] &&
          m.edge[i].x < m.ridge[i].x) {
         shade.moveTo(m.edge[i].x, m.edge[i].y);
         shade.lineTo(m.ridge[i].x - 
               ((m.ridge[i].x - m.edge[i].x) / shadeScale), m.edge[i].y);
      }
   }

   return shade.toString();
}

var svg = d3.select("#mountain")
            .append("svg")
            .attr("height", h + inset)
            .attr("width", w + inset);

var mountain = buildMountain();
mountain.shading = generateShading(mountain);

var edges = svg.append("path")
               .attr("d", mountain.edgeString)
               .attr("stroke", "black")
               .attr("stroke-width", 8)
               .attr("fill", "none")
               .attr("id", "edge");

var middleRidge = svg.append("path")
               .attr("d", mountain.ridgeString)
               .attr("stroke", "black")
               .attr("stroke-width", 5)
               .attr("fill", "none")
               .attr("id", "ridge");

var shading = svg.append("path")
               .attr("d", mountain.shading)
               .attr("stroke", "black")
               .attr("stroke-width", 1)
               .attr("fill", "none")
               .attr("id", "shading");


function regenerate() {
   mountain = buildMountain();
   mountain.shading = generateShading(mountain);
   d3.select("#edge").attr("d", mountain.edgeString);
   d3.select("#ridge").attr("d", mountain.ridgeString);
   d3.select("#shading").attr("d", mountain.shading);
}

function changeSmooth(val) {
   smoothness = val;
   regenerate();
}

function changeSteps(val) {
   steps = val;
   regenerate();
}

function changeHI(val) {
   heightInfluence = val;
   regenerate();
}
