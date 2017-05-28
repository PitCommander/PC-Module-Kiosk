const {
  webFrame
} = require( 'electron' );
webFrame.setZoomFactor( 1 );
webFrame.setZoomLevelLimits( 1, 1 );

var zmq = require( 'zeromq' ),
  sock = zmq.socket( 'sub' );

sock.connect( 'tcp://10.0.0.4:5800' );
sock.subscribe( '' );

sock.on( 'message', function( message ) {
  //console.log(message);
  var messageObj = JSON.parse( message );

  switch ( messageObj.id ) {
    case 'TimeTick':

      var seconds = messageObj.payload.timeToZero % 60;
      var minutes = Math.floor( messageObj.payload.timeToZero / 60 );
      var hours = Math.floor( minutes / 60 );
      var timeString = '';

      if ( hours != 0 ) {
        minutes = minutes % 60;

        timeString = hours + 'h ' + minutes + 'm ' + seconds + 's';
      } else {
        timeString = minutes + 'm ' + seconds + 's';
      }

      document.querySelector( 'match-view' ).ttz = timeString;
      break;
    case 'MatchContainerUpdate':
      var data = messageObj.payload.container;
      document.querySelector( 'match-view' ).nextNum = data.currentMatch.comp_level.toUpperCase() + data.currentMatch.match_number;
      document.querySelector( 'match-view' ).record = data.wins + "-" + data.losses + "-" + data.ties;


      var date = new Date( data.currentMatch.time * 1000 );
      var predictedDate = new Date( ( data.currentMatch.time + 500 ) * 1000 );
      document.querySelector( 'match-view' ).scheduledTime = date.toLocaleTimeString( [], {
        hour: '2-digit',
        minute: '2-digit'
      } );
      document.querySelector( 'match-view' ).predictedTime = predictedDate.toLocaleTimeString();

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

        document.querySelector( 'match-view' ).bumperColor = 'red';
      } else if ( bluePos != -1 ) {
        ally1 = blueTeam[ 0 ].split( 'c' )[ 1 ];
        ally2 = blueTeam[ 1 ].split( 'c' )[ 1 ];
        ally3 = blueTeam[ 2 ].split( 'c' )[ 1 ];

        oppo1 = redTeam[ 0 ].split( 'c' )[ 1 ];
        oppo2 = redTeam[ 1 ].split( 'c' )[ 1 ];
        oppo3 = redTeam[ 2 ].split( 'c' )[ 1 ];

        document.querySelector( 'match-view' ).bumperColor = 'blue';
      }

      var allyString = ally1 + ' ' + ally2 + ' ' + ally3;
      var oppoString = oppo1 + ' ' + oppo2 + ' ' + oppo3;

      document.querySelector( 'match-view' ).allies = allyString;
      document.querySelector( 'match-view' ).oppo = oppoString;
  }
} );