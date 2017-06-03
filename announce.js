//disable pinch zooming in electron
const {
  webFrame
} = require( 'electron' );
webFrame.setZoomFactor( 1 );
webFrame.setZoomLevelLimits( 1, 1 );

//ZMQ subscriber setup, change IP to correct server IP as needed
var zmq = require( 'zeromq' ),
  sock = zmq.socket( 'sub' );

sock.connect( 'tcp://10.0.0.7:5800' );
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
  matchView.nextNum = data.currentMatch.matchNumber;
  matchView.record = data.wins + "-" + data.losses + "-" + data.ties;
  matchView.bumperColor = data.currentMatch.bumperColor.toLocaleLowerCase();
  matchView.allies = data.currentMatch.allies.filter( ignoreOurTeam );
  matchView.oppo = data.currentMatch.opponents;

  var date = new Date( data.currentMatch.scheduledTime * 1000 );
  var predictedDate = new Date( ( data.currentMatch.predictedTime ) * 1000 );
  matchView.scheduledTime = date.toLocaleTimeString( [], {
    hour: '2-digit',
    minute: '2-digit'
  } );
  matchView.predictedTime = predictedDate.toLocaleTimeString( [], {
    hour: '2-digit',
    minute: '2-digit'
  } );
}

function handleMatchChecklist( data, matchChecklist ) {
  matchChecklist.set( 'items', data.boxes );
}

function handleSafetyChecklist( data, safetyChecklist ) {
  safetyChecklist.set( 'items', data.boxes );
}

function ignoreOurTeam( value ) {
  return value != 401;
}
