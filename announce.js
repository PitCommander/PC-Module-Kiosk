//disable pinch zooming in electron
const {
  webFrame
} = require( 'electron' );
webFrame.setZoomFactor( 1 );
webFrame.setZoomLevelLimits( 1, 1 );

//ZMQ subscriber setup, change IP to correct server IP as needed
var zmq = require( 'zeromq' ),
  sock = zmq.socket( 'sub' );

sock.connect( 'tcp://10.0.0.4:5800' );
sock.subscribe( '' );

//Message handler. Switch statement calls cases based on message type.
sock.on( 'message', function( message ) {
  var message = JSON.parse( message );
  var data = message.payload;
  var checklists = document.querySelectorAll( 'checklist-view' );
  var matchChecklist = checklists[ 0 ];
  var safetyChecklist = checklists[ 1 ];
  var matchView = document.querySelector( 'match-view' );

  switch ( message.id ) {
    case 'TimeTick':
      handleTimeTick( data, matchView )
      break;
    case 'MatchContainerUpdate':
      data = data.container;
      handleMatchContainer( data, matchView );
      break;
    case 'MatchChecklistContainerUpdate':
      data = data.container;
      handleMatchChecklist( data, matchChecklist );
      break;
    case 'SafetyChecklistContainerUpdate':
      data = data.container;
      handleMatchChecklist( data, safetyChecklist );
      break;
  }
} );

//Handles TimeTick announcements. This should only be time to zero updates on the match-view page.
function handleTimeTick( data, matchView ) {
  var seconds = data.timeToZero % 60;
  var minutes = Math.floor( data.timeToZero / 60 );
  var hours = Math.floor( minutes / 60 );
  var timeString = '';

  if ( hours != 0 ) {
    minutes = minutes % 60;
    timeString = hours + 'h ' + minutes + 'm ' + seconds + 's';
  } else {
    timeString = minutes + 'm ' + seconds + 's';
  }
  matchView.ttz = timeString;
}

//Handles match container updates.
//This updates the next match, team record, scheduled time, predicted time, ally, and oppo fields on the match-view page.
function handleMatchContainer( data, matchView ) {
  matchView.nextNum = data.currentMatch.comp_level.toUpperCase() + data.currentMatch.match_number;
  matchView.record = data.wins + "-" + data.losses + "-" + data.ties;


  var date = new Date( data.currentMatch.time * 1000 );
  var predictedDate = new Date( ( data.currentMatch.time + 500 ) * 1000 );
  matchView.scheduledTime = date.toLocaleTimeString( [], {
    hour: '2-digit',
    minute: '2-digit'
  } );
  matchView.predictedTime = predictedDate.toLocaleTimeString();

  var redTeam = data.currentMatch.redTeams;
  var blueTeam = data.currentMatch.blueTeams;
  var redPos = redTeam.indexOf( 'frc401' );
  var bluePos = blueTeam.indexOf( 'frc401' );
  var ally1, ally2, ally3, oppo1, oppo2, oppo3 = '';

  if ( redPos != -1 ) {
    ally1 = redTeam[ 0 ].split( 'c' )[ 1 ];
    ally2 = redTeam[ 1 ].split( 'c' )[ 1 ];
    ally3 = redTeam[ 2 ].split( 'c' )[ 1 ];
    oppo1 = blueTeam[ 0 ].split( 'c' )[ 1 ];
    oppo2 = blueTeam[ 1 ].split( 'c' )[ 1 ];
    oppo3 = blueTeam[ 2 ].split( 'c' )[ 1 ];
    matchView.bumperColor = 'red';
  } else if ( bluePos != -1 ) {
    ally1 = blueTeam[ 0 ].split( 'c' )[ 1 ];
    ally2 = blueTeam[ 1 ].split( 'c' )[ 1 ];
    ally3 = blueTeam[ 2 ].split( 'c' )[ 1 ];
    oppo1 = redTeam[ 0 ].split( 'c' )[ 1 ];
    oppo2 = redTeam[ 1 ].split( 'c' )[ 1 ];
    oppo3 = redTeam[ 2 ].split( 'c' )[ 1 ];
    matchView.bumperColor = 'blue';
  }

  var allyString = ally1 + ' ' + ally2 + ' ' + ally3;
  var oppoString = oppo1 + ' ' + oppo2 + ' ' + oppo3;

  matchView.allies = allyString;
  matchView.oppo = oppoString;
}

function handleMatchChecklist( data, matchChecklist ) {
  matchChecklist.set( 'items', data.boxes );
}

function handleSafetyChecklist( data, safetyChecklist ) {
  safetyChecklist.set( 'items', data.boxes );
}
