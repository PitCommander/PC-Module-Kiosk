function callKeyboard( caller ) {
  var keyboard = document.querySelector( 'keyboard-view' );
  keyboard.caller = caller;


  document.querySelector( 'kiosk-app' ).page = 'keyboard';
}
