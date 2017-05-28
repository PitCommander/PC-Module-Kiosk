var zmq = require( 'zeromq' ),
  sock = zmq.socket( 'pub' );

//using 5802 to allow testing without conflicting port bindings.
sock.bind( 'tcp://*:5802' );

function sendPacket( packet ) {
  var stringPacket = JSON.stringify( packet );
  //console.log( stringPacket );
  sock.send( stringPacket );
}

function addCheclistItem() {}

function sendChecklistItem( name, value ) {
  var message = {
    id: 'CHECKLIST_ADD',
    payload: {
      name: name,
      value: value
    }
  };

  sendPacket( message );
}

function sendChecklistRequest( type ) {

  if ( type == 'safety' ) {
    var message = {
      id: 'FETCH_SAFETY'
    }
  } else if ( type == 'match' ) {
    var message = {
      id: 'FETCH_CHECKLIST'
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
  var messageObj = JSON.parse( message );

  switch ( messageObj.id ) {
    case 'CHECKLIST_DATA':
      var data = messageObj.payload;
      var checklist = document.querySelector( 'checklist-view' );

      checklist.set( 'items', data );
  }
} )