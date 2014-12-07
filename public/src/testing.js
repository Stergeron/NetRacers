var socket = io.connect('http://localhost:8888/');

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

window.addEventListener('keydown', function (e) {
  if(e.keycode == 71){
    alert("yo yo");
  }
}, false);
