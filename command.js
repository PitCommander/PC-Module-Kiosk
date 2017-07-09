var zmq = require( 'zeromq' ),
  sock = zmq.socket( 'req' );

sock.connect( 'tcp://192.168.15.227:5801' );

function sendPacket( packet ) {
  var stringPacket = JSON.stringify( packet );
  //console.log( stringPacket );
  sock.send( stringPacket );
}


function addChecklistItem( caller, text, persist ) {
  var packetBase = "CHECKLIST_ADD_";
  var packetPerm = ( persist ) ? "PERSISTENT_" : "";
  var packetType = ( caller === 'Safety' ) ? "SAFETY" : "MATCH";
  var packetID = packetBase + packetPerm + packetType;
  var message = {
    id: packetID,
    payload: {
      name: text,
      value: false,
      persist: persist
    }
  };

  sendPacket( message );
}

function removeChecklistItem( caller, text ) {
  var packetBase = "CHECKLIST_REMOVE_";
  var packetType = ( caller === 'Safety' ) ? "SAFETY" : "MATCH";
  var packetID = packetBase + packetType;
  var message = {
    id: packetID,
    payload: {
      name: text
    }
  };

  sendPacket( message );
}

function sendChecklistItem( type, name, value ) {
  var packetID = '';
  if ( type == 'Safety' ) {
    packetID = 'CHECKLIST_SET_SAFETY';
  } else if ( type == 'Match' ) {
    packetID = 'CHECKLIST_SET_MATCH';
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
  var message = {}

  if ( type == 'Safety' ) {
    message = {
      id: 'CHECKLIST_FETCH_SAFETY'
    }
  } else if ( type == 'Match' ) {
    message = {
      id: 'CHECKLIST_FETCH_MATCH'
    }
  }

  sendPacket( message );
}

function sendTvPacket( name, selected, volume, power ) {
  var message = {
    id: 'TV_SET',
    payload: {
      name: name,
      selected: selected,
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

  var badToast = document.querySelector( '.badToast' );
  var goodToast = document.querySelector( '.goodToast' );

  var messageObj = JSON.parse( message );
  var data = messageObj.payload;

  switch ( messageObj.id ) {
    case 'GENERAL_ACK':
      //console.log( data.message );
      break;
    case 'GENERAL_SUCCESS':
      try {
        goodToast.text = data.message;
        goodToast.open();
      } catch ( err ) {}
      break;
    case 'GENERAL_FAIL':
      try {
        badToast.text = data.message;
        badToast.open();
      } catch ( err ) {}
      break;
    case 'CHECKLIST_DATA_MATCH':
      try {
        matchChecklist.set( 'items', data.boxes );
      } catch ( err ) {}
      break;
    case 'CHECKLIST_DATA_SAFETY':
      try {
        safetyChecklist.set( 'items', data.boxes );
      } catch ( err ) {}
      break;

  }
} )
