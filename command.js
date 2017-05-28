var zmq = require( 'zeromq' ),
  sock = zmq.socket( 'pub' );

//using 5802 to allow testing without conflicting port bindings.
sock.bind( 'tcp://*:5802' );

function sendPacket( packet ) {
  var stringPacket = JSON.stringify( packet );
  console.log( stringPacket );
  sock.send( stringPacket );
}

function sendChecklistItem( type, name, value ) {
  var packetID = '';

  if ( type == 'Safety' ) {
    packetID = 'SAFETY_LIST_ADD';
  } else if ( type == 'Match' ) {
    packetID = 'MATCH_LIST_ADD';
  }

  var message = {
    id: packetID,
    payload: {
      name: name,
      value: value
    }
  };

  sendPacket( message );
}

function sendChecklistRequest( type ) {
  var message = {};

  if ( type == 'safety' ) {
    message = {
      id: 'FETCH_SAFETY_LIST'
    }
  } else if ( type == 'match' ) {
    message = {
      id: 'FETCH_MATCH_LIST'
    }
  }

  sendPacket( message );
}

function sendTvPacket( name, selected, mute, volume, power ) {
  var message = {
    id: 'TV_SET',
    payload: {
      name: name,
      selected: selected,
      mute: mute,
      volume: volume,
      power: power
    }
  }

  sendPacket( message );
}

sock.on( 'message', function( message ) {
  var checklists = document.querySelectorAll( 'checklist-view' );
  var matchChecklist = checklists[ 0 ];
  var safetyChecklist = checklists[ 1 ];

  var messageObj = JSON.parse( message );
  var data = messageObj.payload;

  switch ( messageObj.id ) {
    case 'MATCH_LIST_DATA':
      matchChecklist.set( 'items', data );
      break;
    case 'SAFETY_LIST_DATA':
      safetyChecklist.set( 'items', data );
      break;

  }
} )
