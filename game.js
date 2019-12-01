window.onload = function(){
  var game = new GF();

  game.start();
};

var GF = function(){
  var canvas, ctx, w, h;
  var frameCount = 0;
  var lastTime;
  var fpsContainer;
  var fps;
  var inputStates = {};
  var mousePos = {x:0, y:0}
  var mousePosContainer;
  var gamepad;
  var ongoingTouches = []

  var measureFPS = function(newTime){
    if(lastTime === undefined){
      lastTime = newTime;
      return;
    }
    var diffTime = newTime - lastTime;

    if(diffTime >= 1000){
      fps = frameCount;
      frameCount = 0;
      lastTime = newTime;
    }

    fpsContainer.innerHTML = 'FPS: ' + fps;
    frameCount++
  }
  function clearCanvas(){
    ctx.clearRect(0, 0, w, h)
  }
  function drawBackground(){
    mousePosContainer.innerHTML = "mouse x: " +  Math.floor(mousePos.x) + " mouse y: " + Math.floor(mousePos.y)

    if (inputStates.left) {
      ctx.fillText("left", 150, 20);
    }
    if (inputStates.up) {
      ctx.fillText("up", 150, 50);
    }
    if (inputStates.right) {
      ctx.fillText("right", 150, 80);
    }
    if (inputStates.down) {
     ctx.fillText("down", 150, 120);
    }
    if (inputStates.space) {
     ctx.fillText("space bar", 140, 150);
    }
  }
  var mainLoop = function(time){
    measureFPS(time);

    clearCanvas();
    drawBackground();
    scanGamePads();
    checkButtons(gamepad);
    checkAxes(gamepad)
    requestAnimationFrame(mainLoop);

  };

  var start = function(){
    var metaDataContainer = document.createElement('div');
    fpsContainer = document.createElement('div');
    mousePosContainer = document.createElement('div');
    metaDataContainer.appendChild(fpsContainer);
    metaDataContainer.appendChild(mousePosContainer);
    document.body.appendChild(metaDataContainer);

    canvas = document.querySelector("#gameCanvas");
    w = canvas.width;
    h = canvas.height;
    ctx = canvas.getContext('2d');
    ctx.font="20px Arial";

    canvas.addEventListener('mousemove', function(event){
      mousePos = getMousePos(canvas, event);
    }, false);
    canvas.addEventListener('mousedown', function(event){
      inputStates.mousedown = true;
      inputStates.mouseButton = event.button;
    }, false);
    canvas.addEventListener('mouseup',function(event){
      inputStates.mousedown = false;
    }, false);

    canvas.addEventListener("touchstart", function(event){
      event.preventDefault();
      var touches = event.changedTouches;

      for(var i = 0; i < touches.length; i++){
        ongoingTouches.push(touches[i]);
      }
    }, false)
    canvas.addEventListener("touchend", function(event){

    }, false)
    canvas.addEventListener("touchcancel", function(event){

    }, false)
    canvas.addEventListener("touchmove", function(event){
      event.preventDefault();
      var touches = event.changedTouches;
      for(var i = 0; i < touches.length; i++){
        dx = touches[i].pageX - ongoingTouches[i].pageX;
        dy = touches[i].pageY - ongoingTouches[i].pageY;
        // console.log("x: " + dx)
        // console.log("y: " + dy)
        inputStates.angle = Math.atan2(-dy, dx)*(180/Math.PI);
        console.log(inputStates.angle)


        //debug drawing code
        ctx.beginPath();
        ctx.moveTo(ongoingTouches[i].pageX, ongoingTouches[i].pageY);
        ctx.lineTo(touches[i].pageX, touches[i].pageY);
        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 4;
        ctx.stroke();
      }

    }, false)

    window.addEventListener("gamepadconnected", function(event){
      var gamepad = event.gamepad;
      var index = gamepad.index;
      var id = gamepad.id;
      var nbButtons = gamepad.buttons.length;
      var nbAxes = gamepad.axes.length
      console.log("Gamepad No. " + index + " with id " + id + " is connected. It has " + nbButtons + " buttons and " + nbAxes + " axes." )
    })
    window.addEventListener("gamepaddisconnected", function(event){
      var gamepad = event.gamepad;
      var index = gamepad.index;

      console.log("Gamepad No. " + index + " has been disconnected." )
    })
    window.addEventListener('keydown', function(event){
      if (event.keyCode === 37) {
        inputStates.left = true;
      } else if (event.keyCode === 38) {
        inputStates.up = true;
      } else if (event.keyCode === 39) {
        inputStates.right = true;
      } else if (event.keyCode === 40) {
        inputStates.down = true;
      } else if (event.keyCode === 32) {
        inputStates.space = true;
      }
    }, false);
    window.addEventListener('keyup', function(event){
      if (event.keyCode === 37) {
        inputStates.left = false;
      } else if (event.keyCode === 38) {
        inputStates.up = false;
      } else if (event.keyCode === 39) {
        inputStates.right = false;
      } else if (event.keyCode === 40) {
        inputStates.down = false;
      } else if (event.keyCode === 32) {
        inputStates.space = false;
      }
    }, false);
    requestAnimationFrame(mainLoop);
  };
  function scanGamePads(){
    var gamepads = navigator.getGamepads();
    for(var i=0; i<gamepads.length; i++){
      if(gamepads[i] !== null){
        gamepad = gamepads[i];
      }
    }
  }
  function checkButtons(gamepad){
    if(gamepad === undefined) return;
    if(!gamepad.connected) return;
    for(var i = 0; i < gamepad.buttons.length; i++){


      var b = gamepad.buttons[i];
      if(b.pressed){
        console.log("Button " + i + " is pressed.");
        if(b.value !== undefined){
          console.log("Its value is: " + b.value)
        }
      }
    }
  }
  function checkAxes(gamepad){
    if(gamepad === undefined) return;
    if(!gamepad.connected) return;
    inputStates.left = inputStates.right = inputStates.up = inputStates.down = false;

    // for(var i=0; i<gamepad.axes.length; i++){
    //   var axisValue = gamepad.axes[i];
    // }
    if(gamepad.axes[0] > 0.5){
      inputStates.right = true;
      inputStates.left = false;
    }else if(gamepad.axes[0] < -0.5){
      inputStates.left = true;
      inputStates.right = false
    }
    if(gamepad.axes[1] > 0.5){
      inputStates.down = true;
      inputStates.up = false;
    }else if(gamepad.axes[1] < -0.5){
      inputStates.up = true;
      inputStates.down = false
    }
    inputStates.angle = Math.atan2(-gamepad.axes[1], gamepad.axes[0])*(180/Math.PI);

  }
  function getMousePos(canvas, event){
    var rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }

  return {
    start: start
  };
}
