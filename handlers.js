function callKeyboard( caller ) {
  var keyboard = document.querySelector( 'keyboard-view' );
  keyboard.caller = caller;
  keyboard.itemText = '';
  keyboard.selected = 'single';
  document.querySelector( 'kiosk-app' ).page = 'keyboard';
}
