//disable pinch zooming in electron
const {webFrame} = require('electron');
webFrame.setZoomFactor(1);
webFrame.setZoomLevelLimits(1, 1);
window.$ = window.jQuery = require('jquery');
const Highcharts = require('highcharts');
require('highcharts/highcharts-more')(Highcharts);
require('highcharts/modules/solid-gauge')(Highcharts);
const zmq = require('zeromq');


let checklists = document.querySelectorAll('checklist-view');
let matchView = document.querySelector('match-view');
let batteryPage = document.querySelector('battery-view');
let badToast = document.querySelector('.badToast');
let goodToast = document.querySelector('.goodToast');

let teamNum = 401;
let tz = "America/New_York";

let CURRENT_IP = '127.0.0.1';
//192.168.15.227


subSock = zmq.socket('sub');
subSock.connect('tcp://' + CURRENT_IP + ':5800');
subSock.subscribe('');
subSock.on('message', function (message) {
    message = JSON.parse(message);
    let data = message.payload;

    matchView = document.querySelector('match-view');
    batteryPage = document.querySelector('battery-view');
    checklists = document.querySelectorAll('checklist-view');
    let matchChecklist = checklists[0];
    let safetyChecklist = checklists[1];

    switch (message.id) {
        case 'TimeTick':
            try {
                handleTimeTick(data)
            } catch (err) {
            }
            break;
        case 'GeneralContainerUpdate':
            data = data.container;
            try {
                handleGeneralContainer(data);
            } catch (err) {
            }
            break;
        case 'MatchContainerUpdate':
            data = data.container;
            try {
                handleMatchContainer(data);
            } catch (err) {
            }
            break;
        case 'MatchChecklistContainerUpdate':
            data = data.container;
            try {
                handleMatchChecklist(data);
            } catch (err) {
            }
            break;
        case 'SafetyChecklistContainerUpdate':
            data = data.container;
            try {
                handleMatchChecklist(data);
            } catch (err) {
            }
            break;
        case 'BatteryContainerUpdate':
            data = data.container;
            try {
                handleBatteryStatus(data);
            } catch (err) {
            }
            break;
    }
});

reqSock = zmq.socket('req');
reqSock.connect('tcp://' + CURRENT_IP + ':5801');
reqSock.on('message', function (message) {
    checklists = document.querySelectorAll('checklist-view');
    let matchChecklist = checklists[0];
    let safetyChecklist = checklists[1];

    badToast = document.querySelector('.badToast');
    goodToast = document.querySelector('.goodToast');

    let messageObj = JSON.parse(message);
    let data = messageObj.payload;

    switch (messageObj.id) {
        case 'GENERAL_ACK':
            break;
        case 'GENERAL_SUCCESS':
            try {
                goodToast.text = data.message;
                goodToast.open();
            } catch (err) {
            }
            break;
        case 'GENERAL_FAIL':
            try {
                badToast.text = data.message;
                badToast.open();
            } catch (err) {
            }
            break;
        case 'CHECKLIST_DATA_MATCH':
            try {
                matchChecklist.set('items', data.boxes);
            } catch (err) {
            }
            break;
        case 'CHECKLIST_DATA_SAFETY':
            try {
                safetyChecklist.set('items', data.boxes);
            } catch (err) {
            }
            break;
        case 'GENERALC_DATA':
            try {
                handleGeneralContainer(data);
            } catch (err) {
            }
            break;
        case 'MATCH_DATA':
            try {
                handleMatchContainer(data)
            } catch (err) {
            }
            break;
    }
});

function sendPacket(packet) {
    let stringPacket = JSON.stringify(packet);
    reqSock.send(stringPacket);
}

function addChecklistItem(caller, text, persist) {
    let packetBase = "CHECKLIST_ADD_";
    let packetPerm = (persist) ? "PERSISTENT_" : "";
    let packetType = (caller === 'Safety') ? "SAFETY" : "MATCH";
    let packetID = packetBase + packetPerm + packetType;
    let message = {
        id: packetID,
        payload: {
            name: text,
            value: false,
            persist: persist
        }
    };

    sendPacket(message);
}

function removeChecklistItem(caller, text) {
    let packetBase = "CHECKLIST_REMOVE_";
    let packetType = (caller === 'Safety') ? "SAFETY" : "MATCH";
    let packetID = packetBase + packetType;
    let message = {
        id: packetID,
        payload: {
            name: text
        }
    };

    sendPacket(message);
}

function sendChecklistItem(type, name, value) {
    let packetID = '';
    if (type === 'Safety') {
        packetID = 'CHECKLIST_SET_SAFETY';
    } else if (type === 'Match') {
        packetID = 'CHECKLIST_SET_MATCH';
    }

    let message = {
        id: packetID,
        payload: {
            name: name,
            value: value
        }
    };

    sendPacket(message);
}

function sendChecklistRequest(type) {
    let message = {};

    if (type === 'Safety') {
        message = {
            id: 'CHECKLIST_FETCH_SAFETY'
        }
    } else if (type === 'Match') {
        message = {
            id: 'CHECKLIST_FETCH_MATCH'
        }
    }

    sendPacket(message);
}

function sendGeneralContainerRequest() {
    sendPacket({id: 'GENERAL_FETCH'});
}

function sendMatchContainerRequest() {
    sendPacket({id: 'MATCH_FETCH'});
}

function sendTvRequest() {
    sendPacket({id: 'TV_FETCH'});
}

function sendTvMute(name) {
    let message = {
        id: 'TV_MUTE_TOGGLE',
        payload: {
            name: name
        }
    }
}

function sendTvPower(name, power) {
    let message = {
        id: 'TV_POWER_SET',
        payload: {
            name: name,
            power: power
        }
    };

    sendPacket(message);
}

function sendTvVolume(name, volume) {
    let message = {
        id: 'TV_VOLUME_SET',
        payload: {
            name: name,
            volume: volume
        }
    };

    console.log(message);
    sendPacket(message);
}

function sendTvContent(name, content) {
    let message = {
        id: 'TV_CONTENT_SET',
        payload: {
            name: name,
            content: content
        }
    };
    sendPacket(message);
}

function handleTimeTick(data) {
    let seconds = data.timeToZero % 60;
    let minutes = Math.floor(data.timeToZero / 60);
    let hours = Math.floor(minutes / 60);
    let timeString = '';

    if (hours !== 0) {
        minutes = minutes % 60;
        timeString = hours + 'h ' + minutes + 'm ' + seconds + 's';
    } else {
        timeString = minutes + 'm ' + seconds + 's';
    }
    matchView.ttz = timeString;
}

function handleMatchContainer(data) {
    matchView.nextNum = data.currentMatch.matchNumber;
    matchView.record = data.wins + "-" + data.losses + "-" + data.ties;
    matchView.bumperColor = data.currentMatch.bumperColor.toLocaleLowerCase();
    matchView.allies = data.currentMatch.allies.filter(ignoreOurTeam);
    matchView.oppo = data.currentMatch.opponents;

    let date = new Date(data.currentMatch.scheduledTime * 1000);
    let predictedDate = new Date((data.currentMatch.predictedTime) * 1000);
    matchView.scheduledTime = date.toLocaleTimeString([], {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit'
    });
    matchView.predictedTime = predictedDate.toLocaleTimeString([], {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit'
    });
}

function handleGeneralContainer(data) {
    teamNum = data.teamNumber;
    tz = data.timeZone;
}

function handleMatchChecklist(data) {
    matchChecklist.set('items', data.boxes);
}

function handleSafetyChecklist(data) {
    safetyChecklist.set('items', data.boxes);
}

function ignoreOurTeam(value) {
    return value !== teamNum;
}

function handleBatteryStatus(data) {
    batteryPage.items = data.batteries;
}

let hcOptions = {
    chart: {
        type: 'solidgauge',
        width: 480,
    },

    pane: {
        center: ['50%', '85%'],
        size: '140%',
        startAngle: -80,
        endAngle: 80,
        background: {
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
            innerRadius: '60%',
            outerRadius: '100%',
            shape: 'arc'
        }
    },

    yAxis: {
        min: 0,
        max: 100,
        title: {
            text: 'Battery Charge',
            y: -70
        },
        stops: [
            [0.4, '#DF5353'], // green
            [0.6, '#DDDF0D'], // yellow
            [0.9, '#55BF3B'] // red
        ],
        lineWidth: 0,
        minorTickInterval: 5,
        tickAmount: 11,
        tickLength: 30,
        zIndex: 10,
        labels: {
            y: 16
        }
    },

    plotOptions: {
        series: {
            enableMouseTracking: false
        },

        solidgauge: {
            dataLabels: {
                y: 5,
                borderWidth: 0,
                useHTML: true,
                zIndex: 100
            }
        }
    },
    credits: {
        enabled: false
    },

    series: [{
        name: 'Charge',
        dataLabels: {
            format: '<div style="text-align:center"><span style="font-size:35px;color:' +
            ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
            '<span style="font-size:12px;color:silver">%</span></div>'
        }
    }]
};
