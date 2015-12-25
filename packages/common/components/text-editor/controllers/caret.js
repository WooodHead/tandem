import BaseObject from 'common/object/base';

class Caret extends BaseObject {

  constructor({ editor, marker, notifier }) {
    super({
      editor   : editor,
      marker   : marker,
      notifier : notifier
    });
  }

  get position() {
    return this.marker.position;
  }

  setPosition(position) {
    this.marker.setSelection(position);
  }

  moveLeft() {
    this.setPosition(this.position - 1);
  }

  moveRight() {
    this.setPosition(this.position + 1);
  }

  moveUp() {
    this.moveLine(-1);
  }

  moveDown() {
    this.moveLine(1);
  }

  moveToLinePosition(position) {
    var cline = this._getLine();

    var newLineToken = cline.tokens.find(function(token) {
      return token.type === 'newLine';
    });

    var eol        = newLineToken ? cline.length - 1 : cline.length;

    // TODO - scan position until new line
    this.setPosition(
      cline.getPosition() + Math.max(0, Math.min(eol, position))
    );
  }

  /**
   * TODO - kinda works
   */

  moveToToken(delta) {

    var neg = delta < 0;

    // never should be rounded, but just in case...
    var rest = Math.round(Math.abs(delta));
    var pos  = this.position;

    while(rest--)  {
      pos = this.editor.scanPosition(pos, /[^\s]/, neg) + (neg ? 1 : -1); // skip ws
      pos = this.editor.scanPosition(pos, /\s/, neg) + (neg ? 1 : -1);
    }

    this.setPosition(pos);
  }

  moveLine(delta) {
    var nline = this._getLine(delta);
    var cline = this._getLine();

    if (nline === cline) {
      // this.setPosition(Infinity * delta);
    } else {
      console.log(this.editor.textRuler)
    }

    // TODO - need to calculate character width here
    this.setPosition(nline === cline ? Infinity * delta : nline.getPosition() + (this.position - cline.getPosition()));
  }

  _getLine(shift = 0) {
    return this.editor.lines[
      Math.max(0, Math.min(this.editor.lines.length - 1, this.getCell().row + shift))
    ];
  }

  removeCharsUntilEndOfLine() {
    var line = this._getLine();

    this.editor.splice(this.position, line.getPosition() + line.length - this.position);
  }

  getLine() {
    return this.editor.lines[this.getCell().row];
  }

  removeNextCharacter() {
    this.editor.splice(this.position, 1);
  }

  getCell() {
    return this.editor.getCellFromPosition(this.position);
  }

  notify(message) {

    var k = message.keyCode;

    if (message.ctrlKey) {
      if (k === 65) {
        this.moveToLinePosition(0);
      } else if (k === 69) {
        this.moveToLinePosition(Infinity);
      } else if (k === 68) {
        this.removeNextCharacter();
      } else if (k === 75) {
        this.removeCharsUntilEndOfLine();
      }
      return;
    }

    if (message.altKey) {
      if (k === 37) {
        this.moveToToken(-1);
      } else if (k == 39) {
        this.moveToToken(1);
      }
      return;
    }

    if (message.type === 'input') {
      // this.addCharacter(message.text);
    } else if (message.type === 'keyCommand') {

      var handlers = {
        40: this.moveDown,
        39: this.moveRight,
        38: this.moveUp,
        37: this.moveLeft
      };

      var handler = handlers[message.type];

      if (handler) {
        // necessary to prevent scrolling
        message.preventDefault();
        handlers[message.type].call(this);
      }
    }


  }
}

export default Caret;
