var app;
var session;
var extendedExecution;
var tracking = false;
var watchId;
var storage;

var server;
var deviceId;

function alert(msg){
  navigator.notification.alert(""+msg);
}

function exitFromApp()
{
  stopTracking();
  navigator.app.exitApp();
}

function cancelExtendedExecution(){
  session.close();
}

function requestExtendedExecution(){
  session = new extendedExecution.ExtendedExecutionSession();
  session.description = "Background location tracking";
  session.reason = extendedExecution.ExtendedExecutionReason.locationTracking;
  session.onrevoked = function (args) {
      alert("requestExtendedExecution: Background mode revoked: " + args.reason);
  };
  session.requestExtensionAsync().done(
      function success() {
          //alert("requestExtendedExecution: Successfully enabled background mode");
      },
      function error(error) {
          alert("requestExtendedExecution: Could not enable background mode: " + error);
      }
  );
}

function onPositionReceived(position) {
  var url = 'http://'+server+'?id='+deviceId+'&timestamp='+(new Date().getTime())+'&lat='+position.coords.latitude+'&lon='+position.coords.longitude;

  doGet(url, function(){}, function(){alert('failed:'+url)});
  document.getElementById("loc").innerHTML=position.timestamp+ '<br/>'+
    'Latitude: '          + position.coords.latitude          + '<br/>' +
    'Longitude: '         + position.coords.longitude         + '<br/>' +
    'Altitude: '          + position.coords.altitude          + '<br/>' +
    'Accuracy: '          + position.coords.accuracy          + '<br/>' +
    'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '<br/>' +
    'Heading: '           + position.coords.heading           + '<br/>' +
    'Speed: '             + position.coords.speed             + '<br/>';
};

function onPositionError(error) {
  alert('code: '    + error.code    + '\n' +
        'message: ' + error.message + '\n');
}


function startTracking(){
  if (tracking) return;
  watchId = navigator.geolocation.watchPosition(onPositionReceived, onPositionError);
  requestExtendedExecution();
  tracking = true;
}

function stopTracking(){
  if (!tracking) return;
  navigator.geolocation.clearWatch(watchId);
  cancelExtendedExecution();
  tracking = false;
}

function refreshUI(){
  document.getElementById("startstop").innerHTML = tracking?"Stop":"Start";
  document.getElementById("server").disabled = tracking;
  document.getElementById("deviceId").disabled = tracking;
}

function startStop(){
  tracking?stopTracking():startTracking();
  refreshUI()
}

function doGet(url,callback,error){
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() { 
      if (xmlHttp.readyState == 4){
        if (xmlHttp.status == 200)
          callback(xmlHttp.responseText);
        else
          error(xmlHttp.status);
      }
  }
  xmlHttp.open("GET", url, true); // true for asynchronous 
  xmlHttp.send(null);
}

function loadStore(){
  server = storage.getItem("server");
  if (server==null) server = "demo.traccar.org:5055";
  deviceId = storage.getItem("deviceId");
  if (deviceId==null) deviceId = "123456";
  document.getElementById("server").value = server;
  document.getElementById("deviceId").value = deviceId;
}

function saveStore(){
  server = document.getElementById("server").value;
  deviceId = document.getElementById("deviceId").value;
  storage.setItem("server", server);
  storage.setItem("deviceId", deviceId);
}

document.addEventListener('deviceready', function() {
  app = WinJS.Application;
  storage = window.localStorage;
  extendedExecution = Windows.ApplicationModel.ExtendedExecution;
  document.getElementById("exit").onclick = exitFromApp;
  document.getElementById("startstop").onclick = startStop;
  document.getElementById("server").onchange = saveStore;
  document.getElementById("deviceId").onchange = saveStore;
  loadStore();
});
