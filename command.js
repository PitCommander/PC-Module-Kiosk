var zmq = require('zeromq'),
  sock = zmq.socket('pub');

//using 5802 to allow testing without conflicting port bindings.
sock.bind('tcp://*:5802');

function sendPacket(packet) {
  var stringPacket = JSON.stringify(packet);
  console.log(stringPacket);
  sock.send(stringPacket);
}


function addChecklistItem(type, name, persist) {
  var packetID = '';
  if (type == 'Safety') {
    packetID = 'CHECKLIST_ADD_SAFETY';
  } else if (type == 'Match') {
    packetID = 'CHECKLIST_ADD_MATCH';
  }

  var message = {
    id: packetID,
    payload: {
      name: name,
      value: false,
      persist: persist
    }
  };

  sendPacket(message);
}

function sendChecklistItem(type, name, value) {
  var packetID = '';
  if (type == 'Safety') {
    packetID = 'CHECKLIST_SET_SAFETY';
  } else if (type == 'Match') {
    packetID = 'CHECKLIST_SET_MATCH';
  }

  var message = {
    id: packetID,
    payload: {
      name: name,
      value: value
    }
  };

  sendPacket(message);
}

function sendChecklistRequest(type) {
  var message = {}

  if (type == 'Safety') {
    message = {
      id: 'CHECKLIST_FETCH_SAFETY'
    }
  } else if (type == 'Match') {
    message = {
      id: 'CHECKLIST_FETCH_MATCH'
    }
  }

  sendPacket(message);
}

function sendTvPacket(name, selected, mute, volume, power) {
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

  sendPacket(message);
}

sock.on('message', function (message) {
  var checklists = document.querySelectorAll('checklist-view');
  var matchChecklist = checklists[0];
  var safetyChecklist = checklists[1];

  var badToast = document.querySelector('.badToast');
  var goodToast = document.querySelector('.goodToast');

  var messageObj = JSON.parse(message);
  var data = messageObj.payload;

  switch (messageObj.id) {
  case 'GENERAL_ACK':
    console.log(data);
    break;
  case 'GENERAL_SUCCESS':
    goodToast.text = data;
    goodToast.open();
    break;
  case 'GENERAL_FAIL':
    badToast.text = data;
    badToast.open();
    break;
  case 'CHECKLIST_DATA_MATCH':
    matchChecklist.set('items', data.boxes);
    break;
  case 'CHECKLIST_DATA_SAFETY':
    safetyChecklist.set('items', data.boxes);
    break;

  }
})
