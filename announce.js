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
            document.querySelector('match-view').ttz = messageObj.payload.timeToZero / 60;
            break;
        case 'MatchContainerUpdate':
            document.querySelector('match-view').nextNum = messageObj.payload.container.currentMatch.comp_level.toUpperCase() + messageObj.payload.container.currentMatch.match_number;
            console.log();
    }
});
