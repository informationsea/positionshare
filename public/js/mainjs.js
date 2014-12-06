var socket = io();
var myname;

function initialize(name) {
    console.log("initialize", name);
    myname = name;
    var mapOptions = {
        center: new google.maps.LatLng(38.2566959,140.8341774),
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"),
                                  mapOptions);

    /*
     var marker = new google.maps.Marker({
     position: new google.maps.LatLng(38.2566959,140.8341774),
     map: map,
     title: "Lab",
     clickable: true
     });

     

     google.maps.event.addListener(marker, 'click', function() {
     infowindow.open(map, marker);
     });
     */

    var infowindow = new google.maps.InfoWindow({content: "PLACEHOLDER"});
    function onclickmarker() {
        console.log(this);
        infowindow.setContent(this.title);
        infowindow.open(map, this);
    }

    var markers = {};

    var isfirst = true;
    var watchId = 0;

    socket.on('connect', function(){
        console.log("connected");
        watchId = navigator.geolocation.watchPosition(
            function(position) {
                console.log(position, new Date().toString());
                if (isfirst) {
                    map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
                    socket.emit('newmarker', {'pos':[position.coords.latitude, position.coords.longitude], 'name':name} );
                    markers[name] = new google.maps.Marker({
                        position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                        map: map,
                        title: "You",
                        clickable: true
                    });
                    google.maps.event.addListener(markers[name], 'click', onclickmarker);

                    isfirst = false;
                } else {
                    socket.emit('updatemarker', {'pos':[position.coords.latitude, position.coords.longitude], 'name':name} );
                    markers[name].setPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
                }
                
                /*
                 var marker = new google.maps.Marker({
                 position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                 map: map,
                 title: "Here",
                 clickable: true
                 });
                 google.maps.event.addListener(marker, 'click', onclickmarker);
                 */
                var now = new Date();
                document.getElementById("status").innerText = "position is updated at "+(now.toTimeString());
            },
            function(e) {
                var now = new Date();
                document.getElementById("status").innerText = "CANNOT DETECT POSITION "+(now.toTimeString()+" "+e.message);
            },
            {enableHighAccuracy: true, maximumAge: 30000, timeout: 60000}
        );
        
        document.getElementById("status").innerText = "connected to server";
    });

    socket.on('disconnect', function(){
        isfirst = true;
        console.log("disconnected");
        navigator.geolocation.clearWatch(watchId);
        for (var one in markers) {
            markers[one].setVisible(false);
        }
        document.getElementById("status").innerText = "ERROR DISCONNECTED!!!";
    });

    socket.on('newother', function(o) {
        if (o.name == name) return;

        console.log("newother", o);
        markers[o.name] = new google.maps.Marker({
            position: new google.maps.LatLng(o.pos[0], o.pos[1]),
            map: map,
            title: o.name,
            clickable: true
        });
        google.maps.event.addListener(markers[o.name], 'click', onclickmarker);

    });

    socket.on('updateother', function(o) {
        if (o.name == name) return;
        if (o.name in markers) {
            markers[o.name].setPosition(new google.maps.LatLng(o.pos[0], o.pos[1]));
            console.log("updateother", o);

        }
    });

    socket.on('endother', function(o) {
        if (o.name == name) return;
        console.log("endother", o);
        if (o.name in markers)
            markers[o.name].setVisible(false);
    });
    
    socket.on('message', function(o){
        console.log('message', o);
        document.getElementById("messagearea").innerText = o.name + ": " + o.message + "\n" + document.getElementById("messagearea").innerText;
    });
}

function sendmessage() {
    var message = document.getElementById("comment").value;
    if (!message) {
        alert("No message...");
        return;
    }
    document.getElementById("messagearea").innerText = myname + ": " + message + "\n" + document.getElementById("messagearea").innerText;
    document.getElementById("comment").value = "";
    socket.emit("sendmessage", {message:message, name:myname});
}
