var socket = io();

var ppl = {
  1: {
    key: false
  },
  2: {
    key: false
  },
  3: {
    key: false
  },
  4: {
    key: false
  }
};

var myPerson = prompt("id?");

window.addEventListener('keydown', function (e) {
  if(e.keyCode == 71){
    socket.emit("down", myPerson);
  }
}, false);

window.addEventListener('keyup', function (e) {
  if(e.keyCode == 71){
    socket.emit("up", myPerson);
  }
}, false);

socket.on("clientdown", function(id){
  ppl[id].key = true;
  document.getElementById(id).className = "key pressed";
});

socket.on("clientup", function(id){
  ppl[id].key = false;
  document.getElementById(id).className = "key";
});
