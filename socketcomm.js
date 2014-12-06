var socketio = require('socket.io');
var uuid = require('node-uuid');

function startsocket (server) {
    console.log("call startsocket");
    var io = socketio.listen(server);

    var currentpos = {};

    io.on('connection', function(socket){
        var name;
        var id = uuid.v4();
        
        console.log('a user connected');

        socket.on('disconnect', function(){
            console.log('disconnected user', name);
            delete currentpos[id];
            socket.broadcast.emit('endother', {name: name});
        });
        socket.on('newmarker', function(o){
            for (var one in currentpos) {
                if (currentpos[one])
                    socket.emit('newother', currentpos[one]);
            }
          
            console.log("newmarker", o);
            o.id = id;
            o.userid = id;
            socket.broadcast.emit('newother', o);
            currentpos[id] = o;
            name = o.name;
        });
        socket.on('updatemarker', function(o){
            console.log("updatemarker", o);
            o.id = id;
            o.userid = id;
            socket.broadcast.emit('updateother', o);
            currentpos[id] = o;
        });
        socket.on('sendmessage', function(o){
            socket.broadcast.emit('message', o);
        });
    });
}

module.exports = startsocket;
