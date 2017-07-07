//disable pinch zooming in electron
const {
  webFrame
} = require('electron');
webFrame.setZoomFactor(1);
webFrame.setZoomLevelLimits(1, 1);

window.$ = window.jQuery = require('jquery');
var Highcharts = require('highcharts');
Highcharts.setOptions(hcOptions);

//ZMQ subscriber setup, change IP to correct server IP as needed
var zmq = require('zeromq'),
  sock = zmq.socket('sub');

sock.connect('tcp://10.0.0.5:5800');
sock.subscribe('');

//Message handler. Switch statement calls cases based on message type.
sock.on('message', function (message) {
  var message = JSON.parse(message);
  var data = message.payload;
  var checklists = document.querySelectorAll('checklist-view');
  var matchChecklist = checklists[0];
  var safetyChecklist = checklists[1];
  var matchView = document.querySelector('match-view');

  switch (message.id) {
  case 'TimeTick':
    try {
      handleTimeTick(data, matchView)
    } catch (err) {}
    break;
  case 'MatchContainerUpdate':
    data = data.container;
    try {
      handleMatchContainer(data, matchView);
    } catch (err) {}
    break;
  case 'MatchChecklistContainerUpdate':
    data = data.container;
    try {
      handleMatchChecklist(data, matchChecklist);
    } catch (err) {}
    break;
  case 'SafetyChecklistContainerUpdate':
    data = data.container;
    try {
      handleMatchChecklist(data, safetyChecklist);
    } catch (err) {}
    break;
  }
});

//Handles TimeTick announcements. This should only be time to zero updates on the match-view page.
function handleTimeTick(data, matchView) {
  var seconds = data.timeToZero % 60;
  var minutes = Math.floor(data.timeToZero / 60);
  var hours = Math.floor(minutes / 60);
  var timeString = '';

  if (hours != 0) {
    minutes = minutes % 60;
    timeString = hours + 'h ' + minutes + 'm ' + seconds + 's';
  } else {
    timeString = minutes + 'm ' + seconds + 's';
  }
  matchView.ttz = timeString;
}

//Handles match container updates.
//This updates the next match, team record, scheduled time, predicted time, ally, and oppo fields on the match-view page.
function handleMatchContainer(data, matchView) {
  matchView.nextNum = data.currentMatch.matchNumber;
  matchView.record = data.wins + "-" + data.losses + "-" + data.ties;
  matchView.bumperColor = data.currentMatch.bumperColor.toLocaleLowerCase();
  matchView.allies = data.currentMatch.allies.filter(ignoreOurTeam);
  matchView.oppo = data.currentMatch.opponents;

  var date = new Date(data.currentMatch.scheduledTime * 1000);
  var predictedDate = new Date((data.currentMatch.predictedTime) * 1000);
  matchView.scheduledTime = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  matchView.predictedTime = predictedDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function handleMatchChecklist(data, matchChecklist) {
  matchChecklist.set('items', data.boxes);
}

function handleSafetyChecklist(data, safetyChecklist) {
  safetyChecklist.set('items', data.boxes);
}

function ignoreOurTeam(value) {
  return value != 401;
}

function createCharts() {}

var hcOptions = {
  chart: {
    type: 'solidgauge'
  },

  title: null,

  pane: {
    center: ['50%', '85%'],
    size: '140%',
    startAngle: -90,
    endAngle: 90,
    background: {
      backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
      innerRadius: '60%',
      outerRadius: '100%',
      shape: 'arc'
    }
  },

  tooltip: {
    enabled: false
  },

  // the value axis
  yAxis: {
    min: 0,
    max: 100,
    title: {
      text: 'Battery Charge'
    },
    stops: [
            [0.4, '#DF5353'], // green
            [0.6, '#DDDF0D'], // yellow
            [0.9, '#55BF3B'] // red
        ],
    lineWidth: 0,
    minorTickInterval: null,
    tickAmount: 2,
    title: {
      y: -70
    },
    labels: {
      y: 16
    }
  },

  plotOptions: {
    solidgauge: {
      dataLabels: {
        y: 5,
        borderWidth: 0,
        useHTML: true
      }
    }
  },
  credits: {
    enabled: false
  },

  series: [{
    name: 'Charge',
    data: [80],
    dataLabels: {
      format: '<div style="text-align:center"><span style="font-size:25px;color:' +
        ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
        '<span style="font-size:12px;color:silver">%</span></div>'
    },
    tooltip: {
      valueSuffix: ' %'
    }
    }]
};
