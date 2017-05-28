var zmq = require( 'zeromq' ),
  sock = zmq.socket( 'req' );

sock.connect( 'tcp://172.0.0.2:5801' );

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

function sendChecklistRequest() {
  var message = {
    id: 'FETCH_CHECKLIST'
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

function sendPacket( packet ) {
  var stringPacket = JSON.stringify( packet );
  console.log( stringPacket );
  sock.send( stringPacket );
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