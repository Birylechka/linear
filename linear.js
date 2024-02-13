const canvas = document.getElementById("curve-track"); 
const ctx = canvas.getContext("2d"); 

let points = [{ x: 0, y: 256 }, { x: 0, y: 256 }, { x: 256, y: 0 }, { x: 256, y: 0 }];

let selectedPoint = null; 
let isDragging = false; 
let isSplitting = true;

function drawCurve(tension) { 

	ctx.clearRect(0, 0, canvas.width, canvas.height); 

  if (points.length >= 2) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    var t = (tension != null) ? tension : 1;

    for (let i = 1; i < points.length - 2; i ++) {

      var p0 = (i > 0) ? points[i - 1] : points[0];
      var p1 = points[i];
      var p2 = points[i + 1];
      var p3 = (i != points.length - 2) ? points[i + 2] : p2;

      var cp1x = p1.x + (p2.x - p0.x) / 6 * t;
      var cp1y = p1.y + (p2.y - p0.y) / 6 * t;

      var cp2x = p2.x - (p3.x - p1.x) / 6 * t;
      var cp2y = p2.y - (p3.y - p1.y) / 6  * t;

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);

    }

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

    for (let i = 0; i < points.length; i++) {
      ctx.beginPath();
      ctx.arc(points[0].x, points[0].y, 3, 0, Math.PI * 2);
      ctx.arc(points[i].x, points[i].y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "blue";
      ctx.fill();
  }
  ctx.beginPath();
  let pointEnd=points.length-1;
  ctx.arc(points[pointEnd].x, points[pointEnd].y, 3, 0, Math.PI * 2);
  ctx.fillStyle = "blue";
  ctx.fill();
} 


function checkPointHit(x, y) {

	for (let i = 2; i < points.length-2; i++) {
		const dist = Math.sqrt((points[i].x - x)**2 + (points[i].y - y)**2);
		if (dist <= 5) {
       return i; 
    }
}
   return null;      
  } 


function pointToLineDistance(point, lineStart, lineEnd) {
      const dx = lineEnd.x - lineStart.x;
      const dy = lineEnd.y - lineStart.y;
      const u = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy);
      const closestX = lineStart.x + u * dx;
      const closestY = lineStart.y + u * dy;
      const distance = Math.sqrt((point.x - closestX)**2 + (point.y - closestY)**2);
      return distance;  
}


function onMouseDown(e) { 
  e.preventDefault();
	const mouseX = e.clientX - canvas.getBoundingClientRect().left; 
	const mouseY = e.clientY - canvas.getBoundingClientRect().top; 

	selectedPoint = checkPointHit(mouseX, mouseY); 
  
	isDragging = selectedPoint !== null; 

  if (isSplitting) {
    isSplitting = false;
  } else {
    let closestSegment = null;
    let closestDistance = Infinity;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      
      const distance = pointToLineDistance({ x: mouseX, y: mouseY }, p1, p2);
       
      if (distance < closestDistance) {
        closestSegment = i;
        closestDistance = distance;
        
      }
    }

    points.splice(closestSegment + 1, 0, {x: mouseX, y: mouseY});
    isSplitting = true;  }
  drawCurve();
}

function onMouseMove(e) { 
  e.preventDefault();
	if (isDragging && selectedPoint !== null) {
		const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
  if (mouseX >= 0 && mouseY >= 0 && mouseX < 256 && mouseY < 256) {
    points[selectedPoint].x = mouseX;
    points[selectedPoint].y = mouseY;
    drawCurve(); 
    isSplitting = true;
  }  
  else {
    points.splice(selectedPoint, 1);
    selectedPoint = null;
    drawCurve(); 
  }
	} 
} 

function onMouseUp() { 
	isDragging = false; 
} 

canvas.addEventListener("mousedown", onMouseDown); 
canvas.addEventListener("mousemove", onMouseMove); 
canvas.addEventListener("mouseup", onMouseUp); 

drawCurve(); 

let currentChannelPointerObjectClicked = null;
let currentChannelPointerXPos = 0;
let isChannelPointerClicked = false;

function getOnlyNumbers(str) {

  let onlyNumberValues = str.toString().replace(/\D/g, '');
  if(onlyNumberValues.length == 0) onlyNumberValues = 0;

  return onlyNumberValues;
}

function handleChannelOutputEvents(e, dest, obj) {

  if(dest == "mousedown") {

  e.preventDefault();
  let x1 = parseInt(getOnlyNumbers(document.getElementById("channelPointer1Position").style.left));
  let x2 = parseInt(getOnlyNumbers(document.getElementById("channelPointer2Position").style.left));

  if(e.layerX >= (x1-57) && e.layerX <= (x1+15-57)) {
    currentChannelPointerObjectClicked = "channelPointer1Position";
  } else if(e.layerX >= (x2-57) && e.layerX <= (x2+15-57)) {

  currentChannelPointerObjectClicked = "channelPointer2Position";
  }
  currentChannelPointerXPos = e.clientX;
  isChannelPointerClicked = true;
  return false;
  }

  if(dest == "mouseup") {
  e.preventDefault();
  isChannelPointerClicked = false;
  return false;
  }

  if(dest == "mouseout") {
  e.preventDefault();
  isChannelPointerClicked = false;
  return false;               
}

  if(dest == "mousemove") {

  e.preventDefault();

  if(isChannelPointerClicked == true) {

  if(currentChannelPointerObjectClicked !== null && currentChannelPointerObjectClicked !== undefined) {

  if(currentChannelPointerObjectClicked == "channelPointer1Position" || currentChannelPointerObjectClicked == "channelPointer2Position") {
    let dif = e.clientX - currentChannelPointerXPos;
    console.log(dif);
    currentChannelPointerXPos = e.clientX;
    let cp = parseInt(getOnlyNumbers(document.getElementById(currentChannelPointerObjectClicked).style.left));
    cp += dif;

    if(cp < 57) cp = 57;
    if(cp > 312) cp = 312;
    document.getElementById(currentChannelPointerObjectClicked).style.left = cp+"px";

    if(currentChannelPointerObjectClicked == "channelPointer1Position") {
      imageLayers[currentImageLayerIndex].layerAdjustmentSettings.outputPoint1 = cp;
    }

    if(currentChannelPointerObjectClicked == "channelPointer2Position") {
      imageLayers[currentImageLayerIndex].layerAdjustmentSettings.outputPoint2 = cp;
    }
  }
}
}

return false;
}
}