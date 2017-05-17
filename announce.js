var zmq = require('zeromq'),
    sock = zmq.socket('sub');

sock.connect('tcp://10.0.0.7:5800');
sock.subscribe('');


console.log('running announce');

sock.on('message', function (message) {
    //console.log(message);
    var messageObj = JSON.parse(message);

    switch (messageObj.id) {
        case 'TimeTick':
            console.log(messageObj.payload.newTime);
            document.querySelector('match-view').ttz = messageObj.payload.newTime;
            break;
    }
});
