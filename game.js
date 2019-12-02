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
  var inputStateContainer;
  var mousePos = {x:0, y:0}
  var mousePosContainer;
  var gamepad;
  var ongoingTouches = []
  var delay = 1000 / 60;
  var timeSinceRedraw =0;
  var gamePadContainer

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
    timeSinceRedraw += diffTime;
    fpsContainer.innerHTML = 'FPS: ' + fps;
    frameCount++
  }
  function clearCanvas(){
    ctx.clearRect(0, 0, w, h)
  }
  function drawBackground(){
    mousePosContainer.innerHTML = "mouse x: " +  Math.floor(mousePos.x) + " mouse y: " + Math.floor(mousePos.y)

    var keyDivs = document.getElementsByClassName("inputStates");
    for(var i=0; i<keyDivs.length; i++){
      keyDivs[i].style["border-color"] = "black"
    }

    if (inputStates.left) {
      keyDivs[0].style["border-color"] = "red"
    }
    if (inputStates.up) {
      keyDivs[1].style["border-color"] = "red"
    }
    if (inputStates.right) {
      keyDivs[2].style["border-color"] = "red"
    }
    if (inputStates.down) {
     keyDivs[3].style["border-color"] = "red"
    }
    if (inputStates.space) {

    }
  }
  var mainLoop = function(time){
    measureFPS(time);
    if(timeSinceRedraw > delay){
      clearCanvas();
      drawBackground();
      timeSinceRedraw = 0;
    }


    scanGamePads();
    checkButtons(gamepad);
    checkAxes(gamepad)
    requestAnimationFrame(mainLoop);

  };

  var start = function(){
    var metaDataContainer = document.querySelector("#metaDataContainer");
    fpsContainer = document.createElement('div');
    mousePosContainer = document.createElement('div');
    metaDataContainer.appendChild(fpsContainer);
    metaDataContainer.appendChild(mousePosContainer);

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
      event.preventDefault();
      var touches = event.changedTouches;
      inputStates.left = inputStates.right = inputStates.up = inputStates.down = false;
      for(var i=0; i<touches.length; i++){
        ongoingTouches.splice(i, 1);
      }
    }, false)
    canvas.addEventListener("touchcancel", function(event){

    }, false)
    canvas.addEventListener("touchmove", function(event){
      event.preventDefault();
      var touches = event.changedTouches;
      var slice = (180/8);
      for(var i = 0; i < touches.length; i++){
        dx = touches[i].pageX - ongoingTouches[i].pageX;
        dy = touches[i].pageY - ongoingTouches[i].pageY;
        inputStates.angle = Math.atan2(-dy, dx)*(180/Math.PI);
        if(((inputStates.angle < slice && inputStates.angle > 0) || (inputStates.angle > -slice && inputStates.angle < 0)) && dx > 40){
          inputStates.right = true;
          inputStates.left = false;
        } else if(((inputStates.angle < -3*slice && inputStates.angle >= -180) || (inputStates.angle > 3*slice && inputStates.angle <= 180))  && dx < -40){
          inputStates.right = false;
          inputStates.left = true;
        }
        if(inputStates.angle > 3*slice && inputStates.angle < 5*slice && dy < -40){
          inputStates.up = true;
          inputStates.down = false;
        }
        if(inputStates.angle > -5*slice && inputStates.angle < -3*slice && dy > 40){
          inputStates.up = false;
          inputStates.down = true;
        }
      }

    }, false)

    window.addEventListener("gamepadconnected", function(event){
      var gamepad = event.gamepad;
      var index = gamepad.index;
      var id = gamepad.id;
      var nbButtons = gamepad.buttons.length;
      var nbAxes = gamepad.axes.length
      gamePadContainer = document.querySelector('#gamePadStatesContainer')

      gamePadContainer.innerHTML = "Gamepad No. " + index + " with id " + id + " is connected. It has " + nbButtons + " buttons and " + nbAxes + " axes."
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
      var buttonText;
      if(b.pressed){
        buttonText = "Button " + i + " is pressed.";
        if(b.value !== undefined){
          buttonText += " Its value is: " + b.value;
        }
        gamePadContainer.innerHTML = buttonText;
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
