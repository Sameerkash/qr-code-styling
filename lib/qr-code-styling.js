(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["QRCodeStyling"] = factory();
	else
		root["QRCodeStyling"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/qrcode-generator/qrcode.js":
/*!*************************************************!*\
  !*** ./node_modules/qrcode-generator/qrcode.js ***!
  \*************************************************/
/***/ ((module, exports) => {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

var qrcode = function() {

  //---------------------------------------------------------------------
  // qrcode
  //---------------------------------------------------------------------

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectionLevel 'L','M','Q','H'
   */
  var qrcode = function(typeNumber, errorCorrectionLevel) {

    var PAD0 = 0xEC;
    var PAD1 = 0x11;

    var _typeNumber = typeNumber;
    var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
    var _modules = null;
    var _moduleCount = 0;
    var _dataCache = null;
    var _dataList = [];

    var _this = {};

    var makeImpl = function(test, maskPattern) {

      _moduleCount = _typeNumber * 4 + 17;
      _modules = function(moduleCount) {
        var modules = new Array(moduleCount);
        for (var row = 0; row < moduleCount; row += 1) {
          modules[row] = new Array(moduleCount);
          for (var col = 0; col < moduleCount; col += 1) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(_moduleCount);

      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);

      if (_typeNumber >= 7) {
        setupTypeNumber(test);
      }

      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
      }

      mapData(_dataCache, maskPattern);
    };

    var setupPositionProbePattern = function(row, col) {

      for (var r = -1; r <= 7; r += 1) {

        if (row + r <= -1 || _moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c += 1) {

          if (col + c <= -1 || _moduleCount <= col + c) continue;

          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    };

    var getBestMaskPattern = function() {

      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i += 1) {

        makeImpl(true, i);

        var lostPoint = QRUtil.getLostPoint(_this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    };

    var setupTimingPattern = function() {

      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) {
          continue;
        }
        _modules[r][6] = (r % 2 == 0);
      }

      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) {
          continue;
        }
        _modules[6][c] = (c % 2 == 0);
      }
    };

    var setupPositionAdjustPattern = function() {

      var pos = QRUtil.getPatternPosition(_typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          var row = pos[i];
          var col = pos[j];

          if (_modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r += 1) {

            for (var c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2
                  || (r == 0 && c == 0) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    };

    var setupTypeNumber = function(test) {

      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
      }

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    };

    var setupTypeInfo = function(test, maskPattern) {

      var data = (_errorCorrectionLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 6) {
          _modules[i][8] = mod;
        } else if (i < 8) {
          _modules[i + 1][8] = mod;
        } else {
          _modules[_moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 8) {
          _modules[8][_moduleCount - i - 1] = mod;
        } else if (i < 9) {
          _modules[8][15 - i - 1 + 1] = mod;
        } else {
          _modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      _modules[_moduleCount - 8][8] = (!test);
    };

    var mapData = function(data, maskPattern) {

      var inc = -1;
      var row = _moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = QRUtil.getMaskFunction(maskPattern);

      for (var col = _moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col -= 1;

        while (true) {

          for (var c = 0; c < 2; c += 1) {

            if (_modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
              }

              var mask = maskFunc(row, col - c);

              if (mask) {
                dark = !dark;
              }

              _modules[row][col - c] = dark;
              bitIndex -= 1;

              if (bitIndex == -1) {
                byteIndex += 1;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || _moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    };

    var createBytes = function(buffer, rsBlocks) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r += 1) {

        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i += 1) {
          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i += 1) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
        }
      }

      var totalCodeCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalCodeCount += rsBlocks[i].totalCount;
      }

      var data = new Array(totalCodeCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < dcdata[r].length) {
            data[index] = dcdata[r][i];
            index += 1;
          }
        }
      }

      for (var i = 0; i < maxEcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < ecdata[r].length) {
            data[index] = ecdata[r][i];
            index += 1;
          }
        }
      }

      return data;
    };

    var createData = function(typeNumber, errorCorrectionLevel, dataList) {

      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

      var buffer = qrBitBuffer();

      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
        data.write(buffer);
      }

      // calc num max data.
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalDataCount += rsBlocks[i].dataCount;
      }

      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw 'code length overflow. ('
          + buffer.getLengthInBits()
          + '>'
          + totalDataCount * 8
          + ')';
      }

      // end code
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD0, 8);

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD1, 8);
      }

      return createBytes(buffer, rsBlocks);
    };

    _this.addData = function(data, mode) {

      mode = mode || 'Byte';

      var newData = null;

      switch(mode) {
      case 'Numeric' :
        newData = qrNumber(data);
        break;
      case 'Alphanumeric' :
        newData = qrAlphaNum(data);
        break;
      case 'Byte' :
        newData = qr8BitByte(data);
        break;
      case 'Kanji' :
        newData = qrKanji(data);
        break;
      default :
        throw 'mode:' + mode;
      }

      _dataList.push(newData);
      _dataCache = null;
    };

    _this.isDark = function(row, col) {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw row + ',' + col;
      }
      return _modules[row][col];
    };

    _this.getModuleCount = function() {
      return _moduleCount;
    };

    _this.make = function() {
      if (_typeNumber < 1) {
        var typeNumber = 1;

        for (; typeNumber < 40; typeNumber++) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
          var buffer = qrBitBuffer();

          for (var i = 0; i < _dataList.length; i++) {
            var data = _dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
            data.write(buffer);
          }

          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
          }

          if (buffer.getLengthInBits() <= totalDataCount * 8) {
            break;
          }
        }

        _typeNumber = typeNumber;
      }

      makeImpl(false, getBestMaskPattern() );
    };

    _this.createTableTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (var r = 0; r < _this.getModuleCount(); r += 1) {

        qrHtml += '<tr>';

        for (var c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ' width: ' + cellSize + 'px;';
          qrHtml += ' height: ' + cellSize + 'px;';
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    };

    _this.createSvgTag = function(cellSize, margin, alt, title) {

      var opts = {};
      if (typeof arguments[0] == 'object') {
        // Called by options.
        opts = arguments[0];
        // overwrite cellSize and margin.
        cellSize = opts.cellSize;
        margin = opts.margin;
        alt = opts.alt;
        title = opts.title;
      }

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      // Compose alt property surrogate
      alt = (typeof alt === 'string') ? {text: alt} : alt || {};
      alt.text = alt.text || null;
      alt.id = (alt.text) ? alt.id || 'qrcode-description' : null;

      // Compose title property surrogate
      title = (typeof title === 'string') ? {text: title} : title || {};
      title.text = title.text || null;
      title.id = (title.text) ? title.id || 'qrcode-title' : null;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var c, mc, r, mr, qrSvg='', rect;

      rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

      qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
      qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : '';
      qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
      qrSvg += ' preserveAspectRatio="xMinYMin meet"';
      qrSvg += (title.text || alt.text) ? ' role="img" aria-labelledby="' +
          escapeXml([title.id, alt.id].join(' ').trim() ) + '"' : '';
      qrSvg += '>';
      qrSvg += (title.text) ? '<title id="' + escapeXml(title.id) + '">' +
          escapeXml(title.text) + '</title>' : '';
      qrSvg += (alt.text) ? '<description id="' + escapeXml(alt.id) + '">' +
          escapeXml(alt.text) + '</description>' : '';
      qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
      qrSvg += '<path d="';

      for (r = 0; r < _this.getModuleCount(); r += 1) {
        mr = r * cellSize + margin;
        for (c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c) ) {
            mc = c*cellSize+margin;
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    };

    _this.createDataURL = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      return createDataURL(size, size, function(x, y) {
        if (min <= x && x < max && min <= y && y < max) {
          var c = Math.floor( (x - min) / cellSize);
          var r = Math.floor( (y - min) / cellSize);
          return _this.isDark(r, c)? 0 : 1;
        } else {
          return 1;
        }
      } );
    };

    _this.createImgTag = function(cellSize, margin, alt) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;

      var img = '';
      img += '<img';
      img += '\u0020src="';
      img += _this.createDataURL(cellSize, margin);
      img += '"';
      img += '\u0020width="';
      img += size;
      img += '"';
      img += '\u0020height="';
      img += size;
      img += '"';
      if (alt) {
        img += '\u0020alt="';
        img += escapeXml(alt);
        img += '"';
      }
      img += '/>';

      return img;
    };

    var escapeXml = function(s) {
      var escaped = '';
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charAt(i);
        switch(c) {
        case '<': escaped += '&lt;'; break;
        case '>': escaped += '&gt;'; break;
        case '&': escaped += '&amp;'; break;
        case '"': escaped += '&quot;'; break;
        default : escaped += c; break;
        }
      }
      return escaped;
    };

    var _createHalfASCII = function(margin) {
      var cellSize = 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r1, r2, p;

      var blocks = {
        '██': '█',
        '█ ': '▀',
        ' █': '▄',
        '  ': ' '
      };

      var blocksLastLineNoMargin = {
        '██': '▀',
        '█ ': '▀',
        ' █': ' ',
        '  ': ' '
      };

      var ascii = '';
      for (y = 0; y < size; y += 2) {
        r1 = Math.floor((y - min) / cellSize);
        r2 = Math.floor((y + 1 - min) / cellSize);
        for (x = 0; x < size; x += 1) {
          p = '█';

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
            p = ' ';
          }

          if (min <= x && x < max && min <= y+1 && y+1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
            p += ' ';
          }
          else {
            p += '█';
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          ascii += (margin < 1 && y+1 >= max) ? blocksLastLineNoMargin[p] : blocks[p];
        }

        ascii += '\n';
      }

      if (size % 2 && margin > 0) {
        return ascii.substring(0, ascii.length - size - 1) + Array(size+1).join('▀');
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.createASCII = function(cellSize, margin) {
      cellSize = cellSize || 1;

      if (cellSize < 2) {
        return _createHalfASCII(margin);
      }

      cellSize -= 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r, p;

      var white = Array(cellSize+1).join('██');
      var black = Array(cellSize+1).join('  ');

      var ascii = '';
      var line = '';
      for (y = 0; y < size; y += 1) {
        r = Math.floor( (y - min) / cellSize);
        line = '';
        for (x = 0; x < size; x += 1) {
          p = 1;

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
            p = 0;
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          line += p ? white : black;
        }

        for (r = 0; r < cellSize; r += 1) {
          ascii += line + '\n';
        }
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.renderTo2dContext = function(context, cellSize) {
      cellSize = cellSize || 2;
      var length = _this.getModuleCount();
      for (var row = 0; row < length; row++) {
        for (var col = 0; col < length; col++) {
          context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
          context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
        }
      }
    }

    return _this;
  };

  //---------------------------------------------------------------------
  // qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytesFuncs = {
    'default' : function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        bytes.push(c & 0xff);
      }
      return bytes;
    }
  };

  qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

  //---------------------------------------------------------------------
  // qrcode.createStringToBytes
  //---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  qrcode.createStringToBytes = function(unicodeData, numChars) {

    // create conversion map.

    var unicodeMap = function() {

      var bin = base64DecodeInputStream(unicodeData);
      var read = function() {
        var b = bin.read();
        if (b == -1) throw 'eof';
        return b;
      };

      var count = 0;
      var unicodeMap = {};
      while (true) {
        var b0 = bin.read();
        if (b0 == -1) break;
        var b1 = read();
        var b2 = read();
        var b3 = read();
        var k = String.fromCharCode( (b0 << 8) | b1);
        var v = (b2 << 8) | b3;
        unicodeMap[k] = v;
        count += 1;
      }
      if (count != numChars) {
        throw count + ' != ' + numChars;
      }

      return unicodeMap;
    }();

    var unknownChar = '?'.charCodeAt(0);

    return function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        if (c < 128) {
          bytes.push(c);
        } else {
          var b = unicodeMap[s.charAt(i)];
          if (typeof b == 'number') {
            if ( (b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }
      return bytes;
    };
  };

  //---------------------------------------------------------------------
  // QRMode
  //---------------------------------------------------------------------

  var QRMode = {
    MODE_NUMBER :    1 << 0,
    MODE_ALPHA_NUM : 1 << 1,
    MODE_8BIT_BYTE : 1 << 2,
    MODE_KANJI :     1 << 3
  };

  //---------------------------------------------------------------------
  // QRErrorCorrectionLevel
  //---------------------------------------------------------------------

  var QRErrorCorrectionLevel = {
    L : 1,
    M : 0,
    Q : 3,
    H : 2
  };

  //---------------------------------------------------------------------
  // QRMaskPattern
  //---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000 : 0,
    PATTERN001 : 1,
    PATTERN010 : 2,
    PATTERN011 : 3,
    PATTERN100 : 4,
    PATTERN101 : 5,
    PATTERN110 : 6,
    PATTERN111 : 7
  };

  //---------------------------------------------------------------------
  // QRUtil
  //---------------------------------------------------------------------

  var QRUtil = function() {

    var PATTERN_POSITION_TABLE = [
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86],
      [6, 34, 62, 90],
      [6, 28, 50, 72, 94],
      [6, 26, 50, 74, 98],
      [6, 30, 54, 78, 102],
      [6, 28, 54, 80, 106],
      [6, 32, 58, 84, 110],
      [6, 30, 58, 86, 114],
      [6, 34, 62, 90, 118],
      [6, 26, 50, 74, 98, 122],
      [6, 30, 54, 78, 102, 126],
      [6, 26, 52, 78, 104, 130],
      [6, 30, 56, 82, 108, 134],
      [6, 34, 60, 86, 112, 138],
      [6, 30, 58, 86, 114, 142],
      [6, 34, 62, 90, 118, 146],
      [6, 30, 54, 78, 102, 126, 150],
      [6, 24, 50, 76, 102, 128, 154],
      [6, 28, 54, 80, 106, 132, 158],
      [6, 32, 58, 84, 110, 136, 162],
      [6, 26, 54, 82, 110, 138, 166],
      [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    var _this = {};

    var getBCHDigit = function(data) {
      var digit = 0;
      while (data != 0) {
        digit += 1;
        data >>>= 1;
      }
      return digit;
    };

    _this.getBCHTypeInfo = function(data) {
      var d = data << 10;
      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
      }
      return ( (data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function(data) {
      var d = data << 12;
      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
      }
      return (data << 12) | d;
    };

    _this.getPatternPosition = function(typeNumber) {
      return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function(maskPattern) {

      switch (maskPattern) {

      case QRMaskPattern.PATTERN000 :
        return function(i, j) { return (i + j) % 2 == 0; };
      case QRMaskPattern.PATTERN001 :
        return function(i, j) { return i % 2 == 0; };
      case QRMaskPattern.PATTERN010 :
        return function(i, j) { return j % 3 == 0; };
      case QRMaskPattern.PATTERN011 :
        return function(i, j) { return (i + j) % 3 == 0; };
      case QRMaskPattern.PATTERN100 :
        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
      case QRMaskPattern.PATTERN101 :
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case QRMaskPattern.PATTERN110 :
        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case QRMaskPattern.PATTERN111 :
        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

      default :
        throw 'bad maskPattern:' + maskPattern;
      }
    };

    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
      var a = qrPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i += 1) {
        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
      }
      return a;
    };

    _this.getLengthInBits = function(mode, type) {

      if (1 <= type && type < 10) {

        // 1 - 9

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 10;
        case QRMode.MODE_ALPHA_NUM : return 9;
        case QRMode.MODE_8BIT_BYTE : return 8;
        case QRMode.MODE_KANJI     : return 8;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 27) {

        // 10 - 26

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 12;
        case QRMode.MODE_ALPHA_NUM : return 11;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 10;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 41) {

        // 27 - 40

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 14;
        case QRMode.MODE_ALPHA_NUM : return 13;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 12;
        default :
          throw 'mode:' + mode;
        }

      } else {
        throw 'type:' + type;
      }
    };

    _this.getLostPoint = function(qrcode) {

      var moduleCount = qrcode.getModuleCount();

      var lostPoint = 0;

      // LEVEL1

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {

          var sameCount = 0;
          var dark = qrcode.isDark(row, col);

          for (var r = -1; r <= 1; r += 1) {

            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c += 1) {

              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrcode.isDark(row + r, col + c) ) {
                sameCount += 1;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      };

      // LEVEL2

      for (var row = 0; row < moduleCount - 1; row += 1) {
        for (var col = 0; col < moduleCount - 1; col += 1) {
          var count = 0;
          if (qrcode.isDark(row, col) ) count += 1;
          if (qrcode.isDark(row + 1, col) ) count += 1;
          if (qrcode.isDark(row, col + 1) ) count += 1;
          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      // LEVEL3

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount - 6; col += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row, col + 1)
              &&  qrcode.isDark(row, col + 2)
              &&  qrcode.isDark(row, col + 3)
              &&  qrcode.isDark(row, col + 4)
              && !qrcode.isDark(row, col + 5)
              &&  qrcode.isDark(row, col + 6) ) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount - 6; row += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row + 1, col)
              &&  qrcode.isDark(row + 2, col)
              &&  qrcode.isDark(row + 3, col)
              &&  qrcode.isDark(row + 4, col)
              && !qrcode.isDark(row + 5, col)
              &&  qrcode.isDark(row + 6, col) ) {
            lostPoint += 40;
          }
        }
      }

      // LEVEL4

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount; row += 1) {
          if (qrcode.isDark(row, col) ) {
            darkCount += 1;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // QRMath
  //---------------------------------------------------------------------

  var QRMath = function() {

    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);

    // initialize tables
    for (var i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4]
        ^ EXP_TABLE[i - 5]
        ^ EXP_TABLE[i - 6]
        ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i] ] = i;
    }

    var _this = {};

    _this.glog = function(n) {

      if (n < 1) {
        throw 'glog(' + n + ')';
      }

      return LOG_TABLE[n];
    };

    _this.gexp = function(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return EXP_TABLE[n];
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrPolynomial
  //---------------------------------------------------------------------

  function qrPolynomial(num, shift) {

    if (typeof num.length == 'undefined') {
      throw num.length + '/' + shift;
    }

    var _num = function() {
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset += 1;
      }
      var _num = new Array(num.length - offset + shift);
      for (var i = 0; i < num.length - offset; i += 1) {
        _num[i] = num[i + offset];
      }
      return _num;
    }();

    var _this = {};

    _this.getAt = function(index) {
      return _num[index];
    };

    _this.getLength = function() {
      return _num.length;
    };

    _this.multiply = function(e) {

      var num = new Array(_this.getLength() + e.getLength() - 1);

      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
        }
      }

      return qrPolynomial(num, 0);
    };

    _this.mod = function(e) {

      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

      var num = new Array(_this.getLength() );
      for (var i = 0; i < _this.getLength(); i += 1) {
        num[i] = _this.getAt(i);
      }

      for (var i = 0; i < e.getLength(); i += 1) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
      }

      // recursive call
      return qrPolynomial(num, 0).mod(e);
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // QRRSBlock
  //---------------------------------------------------------------------

  var QRRSBlock = function() {

    var RS_BLOCK_TABLE = [

      // L
      // M
      // Q
      // H

      // 1
      [1, 26, 19],
      [1, 26, 16],
      [1, 26, 13],
      [1, 26, 9],

      // 2
      [1, 44, 34],
      [1, 44, 28],
      [1, 44, 22],
      [1, 44, 16],

      // 3
      [1, 70, 55],
      [1, 70, 44],
      [2, 35, 17],
      [2, 35, 13],

      // 4
      [1, 100, 80],
      [2, 50, 32],
      [2, 50, 24],
      [4, 25, 9],

      // 5
      [1, 134, 108],
      [2, 67, 43],
      [2, 33, 15, 2, 34, 16],
      [2, 33, 11, 2, 34, 12],

      // 6
      [2, 86, 68],
      [4, 43, 27],
      [4, 43, 19],
      [4, 43, 15],

      // 7
      [2, 98, 78],
      [4, 49, 31],
      [2, 32, 14, 4, 33, 15],
      [4, 39, 13, 1, 40, 14],

      // 8
      [2, 121, 97],
      [2, 60, 38, 2, 61, 39],
      [4, 40, 18, 2, 41, 19],
      [4, 40, 14, 2, 41, 15],

      // 9
      [2, 146, 116],
      [3, 58, 36, 2, 59, 37],
      [4, 36, 16, 4, 37, 17],
      [4, 36, 12, 4, 37, 13],

      // 10
      [2, 86, 68, 2, 87, 69],
      [4, 69, 43, 1, 70, 44],
      [6, 43, 19, 2, 44, 20],
      [6, 43, 15, 2, 44, 16],

      // 11
      [4, 101, 81],
      [1, 80, 50, 4, 81, 51],
      [4, 50, 22, 4, 51, 23],
      [3, 36, 12, 8, 37, 13],

      // 12
      [2, 116, 92, 2, 117, 93],
      [6, 58, 36, 2, 59, 37],
      [4, 46, 20, 6, 47, 21],
      [7, 42, 14, 4, 43, 15],

      // 13
      [4, 133, 107],
      [8, 59, 37, 1, 60, 38],
      [8, 44, 20, 4, 45, 21],
      [12, 33, 11, 4, 34, 12],

      // 14
      [3, 145, 115, 1, 146, 116],
      [4, 64, 40, 5, 65, 41],
      [11, 36, 16, 5, 37, 17],
      [11, 36, 12, 5, 37, 13],

      // 15
      [5, 109, 87, 1, 110, 88],
      [5, 65, 41, 5, 66, 42],
      [5, 54, 24, 7, 55, 25],
      [11, 36, 12, 7, 37, 13],

      // 16
      [5, 122, 98, 1, 123, 99],
      [7, 73, 45, 3, 74, 46],
      [15, 43, 19, 2, 44, 20],
      [3, 45, 15, 13, 46, 16],

      // 17
      [1, 135, 107, 5, 136, 108],
      [10, 74, 46, 1, 75, 47],
      [1, 50, 22, 15, 51, 23],
      [2, 42, 14, 17, 43, 15],

      // 18
      [5, 150, 120, 1, 151, 121],
      [9, 69, 43, 4, 70, 44],
      [17, 50, 22, 1, 51, 23],
      [2, 42, 14, 19, 43, 15],

      // 19
      [3, 141, 113, 4, 142, 114],
      [3, 70, 44, 11, 71, 45],
      [17, 47, 21, 4, 48, 22],
      [9, 39, 13, 16, 40, 14],

      // 20
      [3, 135, 107, 5, 136, 108],
      [3, 67, 41, 13, 68, 42],
      [15, 54, 24, 5, 55, 25],
      [15, 43, 15, 10, 44, 16],

      // 21
      [4, 144, 116, 4, 145, 117],
      [17, 68, 42],
      [17, 50, 22, 6, 51, 23],
      [19, 46, 16, 6, 47, 17],

      // 22
      [2, 139, 111, 7, 140, 112],
      [17, 74, 46],
      [7, 54, 24, 16, 55, 25],
      [34, 37, 13],

      // 23
      [4, 151, 121, 5, 152, 122],
      [4, 75, 47, 14, 76, 48],
      [11, 54, 24, 14, 55, 25],
      [16, 45, 15, 14, 46, 16],

      // 24
      [6, 147, 117, 4, 148, 118],
      [6, 73, 45, 14, 74, 46],
      [11, 54, 24, 16, 55, 25],
      [30, 46, 16, 2, 47, 17],

      // 25
      [8, 132, 106, 4, 133, 107],
      [8, 75, 47, 13, 76, 48],
      [7, 54, 24, 22, 55, 25],
      [22, 45, 15, 13, 46, 16],

      // 26
      [10, 142, 114, 2, 143, 115],
      [19, 74, 46, 4, 75, 47],
      [28, 50, 22, 6, 51, 23],
      [33, 46, 16, 4, 47, 17],

      // 27
      [8, 152, 122, 4, 153, 123],
      [22, 73, 45, 3, 74, 46],
      [8, 53, 23, 26, 54, 24],
      [12, 45, 15, 28, 46, 16],

      // 28
      [3, 147, 117, 10, 148, 118],
      [3, 73, 45, 23, 74, 46],
      [4, 54, 24, 31, 55, 25],
      [11, 45, 15, 31, 46, 16],

      // 29
      [7, 146, 116, 7, 147, 117],
      [21, 73, 45, 7, 74, 46],
      [1, 53, 23, 37, 54, 24],
      [19, 45, 15, 26, 46, 16],

      // 30
      [5, 145, 115, 10, 146, 116],
      [19, 75, 47, 10, 76, 48],
      [15, 54, 24, 25, 55, 25],
      [23, 45, 15, 25, 46, 16],

      // 31
      [13, 145, 115, 3, 146, 116],
      [2, 74, 46, 29, 75, 47],
      [42, 54, 24, 1, 55, 25],
      [23, 45, 15, 28, 46, 16],

      // 32
      [17, 145, 115],
      [10, 74, 46, 23, 75, 47],
      [10, 54, 24, 35, 55, 25],
      [19, 45, 15, 35, 46, 16],

      // 33
      [17, 145, 115, 1, 146, 116],
      [14, 74, 46, 21, 75, 47],
      [29, 54, 24, 19, 55, 25],
      [11, 45, 15, 46, 46, 16],

      // 34
      [13, 145, 115, 6, 146, 116],
      [14, 74, 46, 23, 75, 47],
      [44, 54, 24, 7, 55, 25],
      [59, 46, 16, 1, 47, 17],

      // 35
      [12, 151, 121, 7, 152, 122],
      [12, 75, 47, 26, 76, 48],
      [39, 54, 24, 14, 55, 25],
      [22, 45, 15, 41, 46, 16],

      // 36
      [6, 151, 121, 14, 152, 122],
      [6, 75, 47, 34, 76, 48],
      [46, 54, 24, 10, 55, 25],
      [2, 45, 15, 64, 46, 16],

      // 37
      [17, 152, 122, 4, 153, 123],
      [29, 74, 46, 14, 75, 47],
      [49, 54, 24, 10, 55, 25],
      [24, 45, 15, 46, 46, 16],

      // 38
      [4, 152, 122, 18, 153, 123],
      [13, 74, 46, 32, 75, 47],
      [48, 54, 24, 14, 55, 25],
      [42, 45, 15, 32, 46, 16],

      // 39
      [20, 147, 117, 4, 148, 118],
      [40, 75, 47, 7, 76, 48],
      [43, 54, 24, 22, 55, 25],
      [10, 45, 15, 67, 46, 16],

      // 40
      [19, 148, 118, 6, 149, 119],
      [18, 75, 47, 31, 76, 48],
      [34, 54, 24, 34, 55, 25],
      [20, 45, 15, 61, 46, 16]
    ];

    var qrRSBlock = function(totalCount, dataCount) {
      var _this = {};
      _this.totalCount = totalCount;
      _this.dataCount = dataCount;
      return _this;
    };

    var _this = {};

    var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {

      switch(errorCorrectionLevel) {
      case QRErrorCorrectionLevel.L :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectionLevel.M :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectionLevel.Q :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectionLevel.H :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default :
        return undefined;
      }
    };

    _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {

      var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

      if (typeof rsBlock == 'undefined') {
        throw 'bad rs block @ typeNumber:' + typeNumber +
            '/errorCorrectionLevel:' + errorCorrectionLevel;
      }

      var length = rsBlock.length / 3;

      var list = [];

      for (var i = 0; i < length; i += 1) {

        var count = rsBlock[i * 3 + 0];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];

        for (var j = 0; j < count; j += 1) {
          list.push(qrRSBlock(totalCount, dataCount) );
        }
      }

      return list;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrBitBuffer
  //---------------------------------------------------------------------

  var qrBitBuffer = function() {

    var _buffer = [];
    var _length = 0;

    var _this = {};

    _this.getBuffer = function() {
      return _buffer;
    };

    _this.getAt = function(index) {
      var bufIndex = Math.floor(index / 8);
      return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
    };

    _this.put = function(num, length) {
      for (var i = 0; i < length; i += 1) {
        _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
      }
    };

    _this.getLengthInBits = function() {
      return _length;
    };

    _this.putBit = function(bit) {

      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) {
        _buffer.push(0);
      }

      if (bit) {
        _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
      }

      _length += 1;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrNumber
  //---------------------------------------------------------------------

  var qrNumber = function(data) {

    var _mode = QRMode.MODE_NUMBER;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var data = _data;

      var i = 0;

      while (i + 2 < data.length) {
        buffer.put(strToNum(data.substring(i, i + 3) ), 10);
        i += 3;
      }

      if (i < data.length) {
        if (data.length - i == 1) {
          buffer.put(strToNum(data.substring(i, i + 1) ), 4);
        } else if (data.length - i == 2) {
          buffer.put(strToNum(data.substring(i, i + 2) ), 7);
        }
      }
    };

    var strToNum = function(s) {
      var num = 0;
      for (var i = 0; i < s.length; i += 1) {
        num = num * 10 + chatToNum(s.charAt(i) );
      }
      return num;
    };

    var chatToNum = function(c) {
      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      }
      throw 'illegal char :' + c;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrAlphaNum
  //---------------------------------------------------------------------

  var qrAlphaNum = function(data) {

    var _mode = QRMode.MODE_ALPHA_NUM;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var s = _data;

      var i = 0;

      while (i + 1 < s.length) {
        buffer.put(
          getCode(s.charAt(i) ) * 45 +
          getCode(s.charAt(i + 1) ), 11);
        i += 2;
      }

      if (i < s.length) {
        buffer.put(getCode(s.charAt(i) ), 6);
      }
    };

    var getCode = function(c) {

      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      } else if ('A' <= c && c <= 'Z') {
        return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
      } else {
        switch (c) {
        case ' ' : return 36;
        case '$' : return 37;
        case '%' : return 38;
        case '*' : return 39;
        case '+' : return 40;
        case '-' : return 41;
        case '.' : return 42;
        case '/' : return 43;
        case ':' : return 44;
        default :
          throw 'illegal char :' + c;
        }
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qr8BitByte
  //---------------------------------------------------------------------

  var qr8BitByte = function(data) {

    var _mode = QRMode.MODE_8BIT_BYTE;
    var _data = data;
    var _bytes = qrcode.stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _bytes.length;
    };

    _this.write = function(buffer) {
      for (var i = 0; i < _bytes.length; i += 1) {
        buffer.put(_bytes[i], 8);
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrKanji
  //---------------------------------------------------------------------

  var qrKanji = function(data) {

    var _mode = QRMode.MODE_KANJI;
    var _data = data;

    var stringToBytes = qrcode.stringToBytesFuncs['SJIS'];
    if (!stringToBytes) {
      throw 'sjis not supported.';
    }
    !function(c, code) {
      // self test for sjis support.
      var test = stringToBytes(c);
      if (test.length != 2 || ( (test[0] << 8) | test[1]) != code) {
        throw 'sjis not supported.';
      }
    }('\u53cb', 0x9746);

    var _bytes = stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return ~~(_bytes.length / 2);
    };

    _this.write = function(buffer) {

      var data = _bytes;

      var i = 0;

      while (i + 1 < data.length) {

        var c = ( (0xff & data[i]) << 8) | (0xff & data[i + 1]);

        if (0x8140 <= c && c <= 0x9FFC) {
          c -= 0x8140;
        } else if (0xE040 <= c && c <= 0xEBBF) {
          c -= 0xC140;
        } else {
          throw 'illegal char at ' + (i + 1) + '/' + c;
        }

        c = ( (c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

        buffer.put(c, 13);

        i += 2;
      }

      if (i < data.length) {
        throw 'illegal char at ' + (i + 1);
      }
    };

    return _this;
  };

  //=====================================================================
  // GIF Support etc.
  //

  //---------------------------------------------------------------------
  // byteArrayOutputStream
  //---------------------------------------------------------------------

  var byteArrayOutputStream = function() {

    var _bytes = [];

    var _this = {};

    _this.writeByte = function(b) {
      _bytes.push(b & 0xff);
    };

    _this.writeShort = function(i) {
      _this.writeByte(i);
      _this.writeByte(i >>> 8);
    };

    _this.writeBytes = function(b, off, len) {
      off = off || 0;
      len = len || b.length;
      for (var i = 0; i < len; i += 1) {
        _this.writeByte(b[i + off]);
      }
    };

    _this.writeString = function(s) {
      for (var i = 0; i < s.length; i += 1) {
        _this.writeByte(s.charCodeAt(i) );
      }
    };

    _this.toByteArray = function() {
      return _bytes;
    };

    _this.toString = function() {
      var s = '';
      s += '[';
      for (var i = 0; i < _bytes.length; i += 1) {
        if (i > 0) {
          s += ',';
        }
        s += _bytes[i];
      }
      s += ']';
      return s;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64EncodeOutputStream
  //---------------------------------------------------------------------

  var base64EncodeOutputStream = function() {

    var _buffer = 0;
    var _buflen = 0;
    var _length = 0;
    var _base64 = '';

    var _this = {};

    var writeEncoded = function(b) {
      _base64 += String.fromCharCode(encode(b & 0x3f) );
    };

    var encode = function(n) {
      if (n < 0) {
        // error.
      } else if (n < 26) {
        return 0x41 + n;
      } else if (n < 52) {
        return 0x61 + (n - 26);
      } else if (n < 62) {
        return 0x30 + (n - 52);
      } else if (n == 62) {
        return 0x2b;
      } else if (n == 63) {
        return 0x2f;
      }
      throw 'n:' + n;
    };

    _this.writeByte = function(n) {

      _buffer = (_buffer << 8) | (n & 0xff);
      _buflen += 8;
      _length += 1;

      while (_buflen >= 6) {
        writeEncoded(_buffer >>> (_buflen - 6) );
        _buflen -= 6;
      }
    };

    _this.flush = function() {

      if (_buflen > 0) {
        writeEncoded(_buffer << (6 - _buflen) );
        _buffer = 0;
        _buflen = 0;
      }

      if (_length % 3 != 0) {
        // padding
        var padlen = 3 - _length % 3;
        for (var i = 0; i < padlen; i += 1) {
          _base64 += '=';
        }
      }
    };

    _this.toString = function() {
      return _base64;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64DecodeInputStream
  //---------------------------------------------------------------------

  var base64DecodeInputStream = function(str) {

    var _str = str;
    var _pos = 0;
    var _buffer = 0;
    var _buflen = 0;

    var _this = {};

    _this.read = function() {

      while (_buflen < 8) {

        if (_pos >= _str.length) {
          if (_buflen == 0) {
            return -1;
          }
          throw 'unexpected end of file./' + _buflen;
        }

        var c = _str.charAt(_pos);
        _pos += 1;

        if (c == '=') {
          _buflen = 0;
          return -1;
        } else if (c.match(/^\s$/) ) {
          // ignore if whitespace.
          continue;
        }

        _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
        _buflen += 6;
      }

      var n = (_buffer >>> (_buflen - 8) ) & 0xff;
      _buflen -= 8;
      return n;
    };

    var decode = function(c) {
      if (0x41 <= c && c <= 0x5a) {
        return c - 0x41;
      } else if (0x61 <= c && c <= 0x7a) {
        return c - 0x61 + 26;
      } else if (0x30 <= c && c <= 0x39) {
        return c - 0x30 + 52;
      } else if (c == 0x2b) {
        return 62;
      } else if (c == 0x2f) {
        return 63;
      } else {
        throw 'c:' + c;
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // gifImage (B/W)
  //---------------------------------------------------------------------

  var gifImage = function(width, height) {

    var _width = width;
    var _height = height;
    var _data = new Array(width * height);

    var _this = {};

    _this.setPixel = function(x, y, pixel) {
      _data[y * _width + x] = pixel;
    };

    _this.write = function(out) {

      //---------------------------------
      // GIF Signature

      out.writeString('GIF87a');

      //---------------------------------
      // Screen Descriptor

      out.writeShort(_width);
      out.writeShort(_height);

      out.writeByte(0x80); // 2bit
      out.writeByte(0);
      out.writeByte(0);

      //---------------------------------
      // Global Color Map

      // black
      out.writeByte(0x00);
      out.writeByte(0x00);
      out.writeByte(0x00);

      // white
      out.writeByte(0xff);
      out.writeByte(0xff);
      out.writeByte(0xff);

      //---------------------------------
      // Image Descriptor

      out.writeString(',');
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(_width);
      out.writeShort(_height);
      out.writeByte(0);

      //---------------------------------
      // Local Color Map

      //---------------------------------
      // Raster Data

      var lzwMinCodeSize = 2;
      var raster = getLZWRaster(lzwMinCodeSize);

      out.writeByte(lzwMinCodeSize);

      var offset = 0;

      while (raster.length - offset > 255) {
        out.writeByte(255);
        out.writeBytes(raster, offset, 255);
        offset += 255;
      }

      out.writeByte(raster.length - offset);
      out.writeBytes(raster, offset, raster.length - offset);
      out.writeByte(0x00);

      //---------------------------------
      // GIF Terminator
      out.writeString(';');
    };

    var bitOutputStream = function(out) {

      var _out = out;
      var _bitLength = 0;
      var _bitBuffer = 0;

      var _this = {};

      _this.write = function(data, length) {

        if ( (data >>> length) != 0) {
          throw 'length over';
        }

        while (_bitLength + length >= 8) {
          _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
          length -= (8 - _bitLength);
          data >>>= (8 - _bitLength);
          _bitBuffer = 0;
          _bitLength = 0;
        }

        _bitBuffer = (data << _bitLength) | _bitBuffer;
        _bitLength = _bitLength + length;
      };

      _this.flush = function() {
        if (_bitLength > 0) {
          _out.writeByte(_bitBuffer);
        }
      };

      return _this;
    };

    var getLZWRaster = function(lzwMinCodeSize) {

      var clearCode = 1 << lzwMinCodeSize;
      var endCode = (1 << lzwMinCodeSize) + 1;
      var bitLength = lzwMinCodeSize + 1;

      // Setup LZWTable
      var table = lzwTable();

      for (var i = 0; i < clearCode; i += 1) {
        table.add(String.fromCharCode(i) );
      }
      table.add(String.fromCharCode(clearCode) );
      table.add(String.fromCharCode(endCode) );

      var byteOut = byteArrayOutputStream();
      var bitOut = bitOutputStream(byteOut);

      // clear code
      bitOut.write(clearCode, bitLength);

      var dataIndex = 0;

      var s = String.fromCharCode(_data[dataIndex]);
      dataIndex += 1;

      while (dataIndex < _data.length) {

        var c = String.fromCharCode(_data[dataIndex]);
        dataIndex += 1;

        if (table.contains(s + c) ) {

          s = s + c;

        } else {

          bitOut.write(table.indexOf(s), bitLength);

          if (table.size() < 0xfff) {

            if (table.size() == (1 << bitLength) ) {
              bitLength += 1;
            }

            table.add(s + c);
          }

          s = c;
        }
      }

      bitOut.write(table.indexOf(s), bitLength);

      // end code
      bitOut.write(endCode, bitLength);

      bitOut.flush();

      return byteOut.toByteArray();
    };

    var lzwTable = function() {

      var _map = {};
      var _size = 0;

      var _this = {};

      _this.add = function(key) {
        if (_this.contains(key) ) {
          throw 'dup key:' + key;
        }
        _map[key] = _size;
        _size += 1;
      };

      _this.size = function() {
        return _size;
      };

      _this.indexOf = function(key) {
        return _map[key];
      };

      _this.contains = function(key) {
        return typeof _map[key] != 'undefined';
      };

      return _this;
    };

    return _this;
  };

  var createDataURL = function(width, height, getPixel) {
    var gif = gifImage(width, height);
    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        gif.setPixel(x, y, getPixel(x, y) );
      }
    }

    var b = byteArrayOutputStream();
    gif.write(b);

    var base64 = base64EncodeOutputStream();
    var bytes = b.toByteArray();
    for (var i = 0; i < bytes.length; i += 1) {
      base64.writeByte(bytes[i]);
    }
    base64.flush();

    return 'data:image/gif;base64,' + base64;
  };

  //---------------------------------------------------------------------
  // returns qrcode function.

  return qrcode;
}();

// multibyte support
!function() {

  qrcode.stringToBytesFuncs['UTF-8'] = function(s) {
    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    function toUTF8Array(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6),
              0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
            | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18),
              0x80 | ((charcode>>12) & 0x3f),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
      }
      return utf8;
    }
    return toUTF8Array(s);
  };

}();

(function (factory) {
  if (true) {
      !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
}(function () {
    return qrcode;
}));


/***/ }),

/***/ "./src/constants/cornerDotTypes.ts":
/*!*****************************************!*\
  !*** ./src/constants/cornerDotTypes.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    dot: "dot",
    square: "square"
});


/***/ }),

/***/ "./src/constants/cornerSquareTypes.ts":
/*!********************************************!*\
  !*** ./src/constants/cornerSquareTypes.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    dot: "dot",
    square: "square",
    extraRounded: "extra-rounded"
});


/***/ }),

/***/ "./src/constants/dotTypes.ts":
/*!***********************************!*\
  !*** ./src/constants/dotTypes.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    dots: "dots",
    rounded: "rounded",
    classy: "classy",
    classyRounded: "classy-rounded",
    square: "square",
    extraRounded: "extra-rounded"
});


/***/ }),

/***/ "./src/constants/drawTypes.ts":
/*!************************************!*\
  !*** ./src/constants/drawTypes.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    canvas: "canvas",
    svg: "svg"
});


/***/ }),

/***/ "./src/constants/errorCorrectionLevels.ts":
/*!************************************************!*\
  !*** ./src/constants/errorCorrectionLevels.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    L: "L",
    M: "M",
    Q: "Q",
    H: "H"
});


/***/ }),

/***/ "./src/constants/errorCorrectionPercents.ts":
/*!**************************************************!*\
  !*** ./src/constants/errorCorrectionPercents.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    L: 0.07,
    M: 0.15,
    Q: 0.25,
    H: 0.3
});


/***/ }),

/***/ "./src/constants/gradientTypes.ts":
/*!****************************************!*\
  !*** ./src/constants/gradientTypes.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    radial: "radial",
    linear: "linear"
});


/***/ }),

/***/ "./src/constants/modes.ts":
/*!********************************!*\
  !*** ./src/constants/modes.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    numeric: "Numeric",
    alphanumeric: "Alphanumeric",
    byte: "Byte",
    kanji: "Kanji"
});


/***/ }),

/***/ "./src/constants/qrTypes.ts":
/*!**********************************!*\
  !*** ./src/constants/qrTypes.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var qrTypes = {};
for (var type = 0; type <= 40; type++) {
    qrTypes[type] = type;
}
// 0 types is autodetect
// types = {
//     0: 0,
//     1: 1,
//     ...
//     40: 40
// }
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (qrTypes);


/***/ }),

/***/ "./src/core/QRCanvas.ts":
/*!******************************!*\
  !*** ./src/core/QRCanvas.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tools_calculateImageSize__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tools/calculateImageSize */ "./src/tools/calculateImageSize.ts");
/* harmony import */ var _constants_errorCorrectionPercents__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/errorCorrectionPercents */ "./src/constants/errorCorrectionPercents.ts");
/* harmony import */ var _figures_dot_canvas_QRDot__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../figures/dot/canvas/QRDot */ "./src/figures/dot/canvas/QRDot.ts");
/* harmony import */ var _figures_cornerSquare_canvas_QRCornerSquare__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../figures/cornerSquare/canvas/QRCornerSquare */ "./src/figures/cornerSquare/canvas/QRCornerSquare.ts");
/* harmony import */ var _figures_cornerDot_canvas_QRCornerDot__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../figures/cornerDot/canvas/QRCornerDot */ "./src/figures/cornerDot/canvas/QRCornerDot.ts");
/* harmony import */ var _constants_gradientTypes__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../constants/gradientTypes */ "./src/constants/gradientTypes.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};






var squareMask = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1]
];
var dotMask = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0]
];
var QRCanvas = /** @class */ (function () {
    //TODO don't pass all options to this class
    function QRCanvas(options) {
        this._canvas = document.createElement("canvas");
        this._canvas.width = options.width;
        this._canvas.height = options.height;
        this._options = options;
    }
    Object.defineProperty(QRCanvas.prototype, "context", {
        get: function () {
            return this._canvas.getContext("2d");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(QRCanvas.prototype, "width", {
        get: function () {
            return this._canvas.width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(QRCanvas.prototype, "height", {
        get: function () {
            return this._canvas.height;
        },
        enumerable: false,
        configurable: true
    });
    QRCanvas.prototype.getCanvas = function () {
        return this._canvas;
    };
    QRCanvas.prototype.clear = function () {
        var canvasContext = this.context;
        if (canvasContext) {
            canvasContext.clearRect(0, 0, this._canvas.width, this._canvas.height);
        }
    };
    QRCanvas.prototype.drawQR = function (qr) {
        return __awaiter(this, void 0, void 0, function () {
            var count, minSize, dotSize, drawImageSize, _a, imageOptions, qrOptions, coverLevel, maxHiddenDots;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        count = qr.getModuleCount();
                        minSize = Math.min(this._options.width, this._options.height) - this._options.margin * 2;
                        dotSize = Math.floor(minSize / count);
                        drawImageSize = {
                            hideXDots: 0,
                            hideYDots: 0,
                            width: 0,
                            height: 0
                        };
                        this._qr = qr;
                        if (!this._options.image) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadImage()];
                    case 1:
                        _b.sent();
                        if (!this._image)
                            return [2 /*return*/];
                        _a = this._options, imageOptions = _a.imageOptions, qrOptions = _a.qrOptions;
                        coverLevel = imageOptions.imageSize * _constants_errorCorrectionPercents__WEBPACK_IMPORTED_MODULE_1__["default"][qrOptions.errorCorrectionLevel];
                        maxHiddenDots = Math.floor(coverLevel * count * count);
                        drawImageSize = (0,_tools_calculateImageSize__WEBPACK_IMPORTED_MODULE_0__["default"])({
                            originalWidth: this._image.width,
                            originalHeight: this._image.height,
                            maxHiddenDots: maxHiddenDots,
                            maxHiddenAxisDots: count - 14,
                            dotSize: dotSize
                        });
                        _b.label = 2;
                    case 2:
                        this.clear();
                        this.drawBackground();
                        this.drawDots(function (i, j) {
                            var _a, _b, _c, _d, _e, _f;
                            if (_this._options.imageOptions.hideBackgroundDots) {
                                if (i >= (count - drawImageSize.hideXDots) / 2 &&
                                    i < (count + drawImageSize.hideXDots) / 2 &&
                                    j >= (count - drawImageSize.hideYDots) / 2 &&
                                    j < (count + drawImageSize.hideYDots) / 2) {
                                    return false;
                                }
                            }
                            if (((_a = squareMask[i]) === null || _a === void 0 ? void 0 : _a[j]) || ((_b = squareMask[i - count + 7]) === null || _b === void 0 ? void 0 : _b[j]) || ((_c = squareMask[i]) === null || _c === void 0 ? void 0 : _c[j - count + 7])) {
                                return false;
                            }
                            if (((_d = dotMask[i]) === null || _d === void 0 ? void 0 : _d[j]) || ((_e = dotMask[i - count + 7]) === null || _e === void 0 ? void 0 : _e[j]) || ((_f = dotMask[i]) === null || _f === void 0 ? void 0 : _f[j - count + 7])) {
                                return false;
                            }
                            return true;
                        });
                        this.drawCorners();
                        if (this._options.image) {
                            this.drawImage({ width: drawImageSize.width, height: drawImageSize.height, count: count, dotSize: dotSize });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    QRCanvas.prototype.drawBackground = function () {
        var canvasContext = this.context;
        var options = this._options;
        if (canvasContext) {
            if (options.backgroundOptions.gradient) {
                var gradientOptions = options.backgroundOptions.gradient;
                var gradient_1 = this._createGradient({
                    context: canvasContext,
                    options: gradientOptions,
                    additionalRotation: 0,
                    x: 0,
                    y: 0,
                    size: this._canvas.width > this._canvas.height ? this._canvas.width : this._canvas.height
                });
                gradientOptions.colorStops.forEach(function (_a) {
                    var offset = _a.offset, color = _a.color;
                    gradient_1.addColorStop(offset, color);
                });
                canvasContext.fillStyle = gradient_1;
            }
            else if (options.backgroundOptions.color) {
                canvasContext.fillStyle = options.backgroundOptions.color;
            }
            canvasContext.fillRect(0, 0, this._canvas.width, this._canvas.height);
        }
    };
    QRCanvas.prototype.drawDots = function (filter) {
        var _this = this;
        if (!this._qr) {
            throw "QR code is not defined";
        }
        var canvasContext = this.context;
        if (!canvasContext) {
            throw "QR code is not defined";
        }
        var options = this._options;
        var count = this._qr.getModuleCount();
        if (count > options.width || count > options.height) {
            throw "The canvas is too small.";
        }
        var minSize = Math.min(options.width, options.height) - options.margin * 2;
        var dotSize = Math.floor(minSize / count);
        var xBeginning = Math.floor((options.width - count * dotSize) / 2);
        var yBeginning = Math.floor((options.height - count * dotSize) / 2);
        var dot = new _figures_dot_canvas_QRDot__WEBPACK_IMPORTED_MODULE_2__["default"]({ context: canvasContext, type: options.dotsOptions.type });
        canvasContext.beginPath();
        var _loop_1 = function (i) {
            var _loop_2 = function (j) {
                if (filter && !filter(i, j)) {
                    return "continue";
                }
                if (!this_1._qr.isDark(i, j)) {
                    return "continue";
                }
                dot.draw(xBeginning + i * dotSize, yBeginning + j * dotSize, dotSize, function (xOffset, yOffset) {
                    if (i + xOffset < 0 || j + yOffset < 0 || i + xOffset >= count || j + yOffset >= count)
                        return false;
                    if (filter && !filter(i + xOffset, j + yOffset))
                        return false;
                    return !!_this._qr && _this._qr.isDark(i + xOffset, j + yOffset);
                });
            };
            for (var j = 0; j < count; j++) {
                _loop_2(j);
            }
        };
        var this_1 = this;
        for (var i = 0; i < count; i++) {
            _loop_1(i);
        }
        if (options.dotsOptions.gradient) {
            var gradientOptions = options.dotsOptions.gradient;
            var gradient_2 = this._createGradient({
                context: canvasContext,
                options: gradientOptions,
                additionalRotation: 0,
                x: xBeginning,
                y: yBeginning,
                size: count * dotSize
            });
            gradientOptions.colorStops.forEach(function (_a) {
                var offset = _a.offset, color = _a.color;
                gradient_2.addColorStop(offset, color);
            });
            canvasContext.fillStyle = canvasContext.strokeStyle = gradient_2;
        }
        else if (options.dotsOptions.color) {
            canvasContext.fillStyle = canvasContext.strokeStyle = options.dotsOptions.color;
        }
        canvasContext.fill("evenodd");
    };
    QRCanvas.prototype.drawCorners = function (filter) {
        var _this = this;
        if (!this._qr) {
            throw "QR code is not defined";
        }
        var canvasContext = this.context;
        if (!canvasContext) {
            throw "QR code is not defined";
        }
        var options = this._options;
        var count = this._qr.getModuleCount();
        var minSize = Math.min(options.width, options.height) - options.margin * 2;
        var dotSize = Math.floor(minSize / count);
        var cornersSquareSize = dotSize * 7;
        var cornersDotSize = dotSize * 3;
        var xBeginning = Math.floor((options.width - count * dotSize) / 2);
        var yBeginning = Math.floor((options.height - count * dotSize) / 2);
        [
            [0, 0, 0],
            [1, 0, Math.PI / 2],
            [0, 1, -Math.PI / 2]
        ].forEach(function (_a) {
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            var column = _a[0], row = _a[1], rotation = _a[2];
            if (filter && !filter(column, row)) {
                return;
            }
            var x = xBeginning + column * dotSize * (count - 7);
            var y = yBeginning + row * dotSize * (count - 7);
            if ((_b = options.cornersSquareOptions) === null || _b === void 0 ? void 0 : _b.type) {
                var cornersSquare = new _figures_cornerSquare_canvas_QRCornerSquare__WEBPACK_IMPORTED_MODULE_3__["default"]({ context: canvasContext, type: (_c = options.cornersSquareOptions) === null || _c === void 0 ? void 0 : _c.type });
                canvasContext.beginPath();
                cornersSquare.draw(x, y, cornersSquareSize, rotation);
            }
            else {
                var dot = new _figures_dot_canvas_QRDot__WEBPACK_IMPORTED_MODULE_2__["default"]({ context: canvasContext, type: options.dotsOptions.type });
                canvasContext.beginPath();
                var _loop_3 = function (i) {
                    var _loop_5 = function (j) {
                        if (!((_d = squareMask[i]) === null || _d === void 0 ? void 0 : _d[j])) {
                            return "continue";
                        }
                        dot.draw(x + i * dotSize, y + j * dotSize, dotSize, function (xOffset, yOffset) { var _a; return !!((_a = squareMask[i + xOffset]) === null || _a === void 0 ? void 0 : _a[j + yOffset]); });
                    };
                    for (var j = 0; j < squareMask[i].length; j++) {
                        _loop_5(j);
                    }
                };
                for (var i = 0; i < squareMask.length; i++) {
                    _loop_3(i);
                }
            }
            if ((_e = options.cornersSquareOptions) === null || _e === void 0 ? void 0 : _e.gradient) {
                var gradientOptions = options.cornersSquareOptions.gradient;
                var gradient_3 = _this._createGradient({
                    context: canvasContext,
                    options: gradientOptions,
                    additionalRotation: rotation,
                    x: x,
                    y: y,
                    size: cornersSquareSize
                });
                gradientOptions.colorStops.forEach(function (_a) {
                    var offset = _a.offset, color = _a.color;
                    gradient_3.addColorStop(offset, color);
                });
                canvasContext.fillStyle = canvasContext.strokeStyle = gradient_3;
            }
            else if ((_f = options.cornersSquareOptions) === null || _f === void 0 ? void 0 : _f.color) {
                canvasContext.fillStyle = canvasContext.strokeStyle = options.cornersSquareOptions.color;
            }
            canvasContext.fill("evenodd");
            if ((_g = options.cornersDotOptions) === null || _g === void 0 ? void 0 : _g.type) {
                var cornersDot = new _figures_cornerDot_canvas_QRCornerDot__WEBPACK_IMPORTED_MODULE_4__["default"]({ context: canvasContext, type: (_h = options.cornersDotOptions) === null || _h === void 0 ? void 0 : _h.type });
                canvasContext.beginPath();
                cornersDot.draw(x + dotSize * 2, y + dotSize * 2, cornersDotSize, rotation);
            }
            else {
                var dot = new _figures_dot_canvas_QRDot__WEBPACK_IMPORTED_MODULE_2__["default"]({ context: canvasContext, type: options.dotsOptions.type });
                canvasContext.beginPath();
                var _loop_4 = function (i) {
                    var _loop_6 = function (j) {
                        if (!((_j = dotMask[i]) === null || _j === void 0 ? void 0 : _j[j])) {
                            return "continue";
                        }
                        dot.draw(x + i * dotSize, y + j * dotSize, dotSize, function (xOffset, yOffset) { var _a; return !!((_a = dotMask[i + xOffset]) === null || _a === void 0 ? void 0 : _a[j + yOffset]); });
                    };
                    for (var j = 0; j < dotMask[i].length; j++) {
                        _loop_6(j);
                    }
                };
                for (var i = 0; i < dotMask.length; i++) {
                    _loop_4(i);
                }
            }
            if ((_k = options.cornersDotOptions) === null || _k === void 0 ? void 0 : _k.gradient) {
                var gradientOptions = options.cornersDotOptions.gradient;
                var gradient_4 = _this._createGradient({
                    context: canvasContext,
                    options: gradientOptions,
                    additionalRotation: rotation,
                    x: x + dotSize * 2,
                    y: y + dotSize * 2,
                    size: cornersDotSize
                });
                gradientOptions.colorStops.forEach(function (_a) {
                    var offset = _a.offset, color = _a.color;
                    gradient_4.addColorStop(offset, color);
                });
                canvasContext.fillStyle = canvasContext.strokeStyle = gradient_4;
            }
            else if ((_l = options.cornersDotOptions) === null || _l === void 0 ? void 0 : _l.color) {
                canvasContext.fillStyle = canvasContext.strokeStyle = options.cornersDotOptions.color;
            }
            canvasContext.fill("evenodd");
        });
    };
    QRCanvas.prototype.loadImage = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var options = _this._options;
            var image = new Image();
            if (!options.image) {
                return reject("Image is not defined");
            }
            if (typeof options.imageOptions.crossOrigin === "string") {
                image.crossOrigin = options.imageOptions.crossOrigin;
            }
            _this._image = image;
            image.onload = function () {
                resolve();
            };
            image.src = options.image;
        });
    };
    QRCanvas.prototype.drawImage = function (_a) {
        var width = _a.width, height = _a.height, count = _a.count, dotSize = _a.dotSize;
        var canvasContext = this.context;
        if (!canvasContext) {
            throw "canvasContext is not defined";
        }
        if (!this._image) {
            throw "image is not defined";
        }
        var options = this._options;
        var xBeginning = Math.floor((options.width - count * dotSize) / 2);
        var yBeginning = Math.floor((options.height - count * dotSize) / 2);
        var dx = xBeginning + options.imageOptions.margin + (count * dotSize - width) / 2;
        var dy = yBeginning + options.imageOptions.margin + (count * dotSize - height) / 2;
        var dw = width - options.imageOptions.margin * 2;
        var dh = height - options.imageOptions.margin * 2;
        canvasContext.drawImage(this._image, dx, dy, dw < 0 ? 0 : dw, dh < 0 ? 0 : dh);
    };
    QRCanvas.prototype._createGradient = function (_a) {
        var context = _a.context, options = _a.options, additionalRotation = _a.additionalRotation, x = _a.x, y = _a.y, size = _a.size;
        var gradient;
        if (options.type === _constants_gradientTypes__WEBPACK_IMPORTED_MODULE_5__["default"].radial) {
            gradient = context.createRadialGradient(x + size / 2, y + size / 2, 0, x + size / 2, y + size / 2, size / 2);
        }
        else {
            var rotation = ((options.rotation || 0) + additionalRotation) % (2 * Math.PI);
            var positiveRotation = (rotation + 2 * Math.PI) % (2 * Math.PI);
            var x0 = x + size / 2;
            var y0 = y + size / 2;
            var x1 = x + size / 2;
            var y1 = y + size / 2;
            if ((positiveRotation >= 0 && positiveRotation <= 0.25 * Math.PI) ||
                (positiveRotation > 1.75 * Math.PI && positiveRotation <= 2 * Math.PI)) {
                x0 = x0 - size / 2;
                y0 = y0 - (size / 2) * Math.tan(rotation);
                x1 = x1 + size / 2;
                y1 = y1 + (size / 2) * Math.tan(rotation);
            }
            else if (positiveRotation > 0.25 * Math.PI && positiveRotation <= 0.75 * Math.PI) {
                y0 = y0 - size / 2;
                x0 = x0 - size / 2 / Math.tan(rotation);
                y1 = y1 + size / 2;
                x1 = x1 + size / 2 / Math.tan(rotation);
            }
            else if (positiveRotation > 0.75 * Math.PI && positiveRotation <= 1.25 * Math.PI) {
                x0 = x0 + size / 2;
                y0 = y0 + (size / 2) * Math.tan(rotation);
                x1 = x1 - size / 2;
                y1 = y1 - (size / 2) * Math.tan(rotation);
            }
            else if (positiveRotation > 1.25 * Math.PI && positiveRotation <= 1.75 * Math.PI) {
                y0 = y0 + size / 2;
                x0 = x0 + size / 2 / Math.tan(rotation);
                y1 = y1 - size / 2;
                x1 = x1 - size / 2 / Math.tan(rotation);
            }
            gradient = context.createLinearGradient(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1));
        }
        return gradient;
    };
    return QRCanvas;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRCanvas);


/***/ }),

/***/ "./src/core/QRCodeStyling.ts":
/*!***********************************!*\
  !*** ./src/core/QRCodeStyling.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tools_getMode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tools/getMode */ "./src/tools/getMode.ts");
/* harmony import */ var _tools_merge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../tools/merge */ "./src/tools/merge.ts");
/* harmony import */ var _tools_downloadURI__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../tools/downloadURI */ "./src/tools/downloadURI.ts");
/* harmony import */ var _QRCanvas__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./QRCanvas */ "./src/core/QRCanvas.ts");
/* harmony import */ var _QRSVG__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./QRSVG */ "./src/core/QRSVG.ts");
/* harmony import */ var _constants_drawTypes__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../constants/drawTypes */ "./src/constants/drawTypes.ts");
/* harmony import */ var _QROptions__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./QROptions */ "./src/core/QROptions.ts");
/* harmony import */ var _tools_sanitizeOptions__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../tools/sanitizeOptions */ "./src/tools/sanitizeOptions.ts");
/* harmony import */ var qrcode_generator__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! qrcode-generator */ "./node_modules/qrcode-generator/qrcode.js");
/* harmony import */ var qrcode_generator__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(qrcode_generator__WEBPACK_IMPORTED_MODULE_8__);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};









var QRCodeStyling = /** @class */ (function () {
    function QRCodeStyling(options) {
        this._options = options ? (0,_tools_sanitizeOptions__WEBPACK_IMPORTED_MODULE_7__["default"])((0,_tools_merge__WEBPACK_IMPORTED_MODULE_1__["default"])(_QROptions__WEBPACK_IMPORTED_MODULE_6__["default"], options)) : _QROptions__WEBPACK_IMPORTED_MODULE_6__["default"];
        this.update();
    }
    QRCodeStyling._clearContainer = function (container) {
        if (container) {
            container.innerHTML = "";
        }
    };
    QRCodeStyling.prototype._getQRStylingElement = function (extension) {
        if (extension === void 0) { extension = "png"; }
        return __awaiter(this, void 0, void 0, function () {
            var promise, svg, promise, canvas;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._qr)
                            throw "QR code is empty";
                        if (!(extension.toLowerCase() === "svg")) return [3 /*break*/, 2];
                        promise = void 0, svg = void 0;
                        if (this._svg && this._svgDrawingPromise) {
                            svg = this._svg;
                            promise = this._svgDrawingPromise;
                        }
                        else {
                            svg = new _QRSVG__WEBPACK_IMPORTED_MODULE_4__["default"](this._options);
                            promise = svg.drawQR(this._qr);
                        }
                        return [4 /*yield*/, promise];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, svg];
                    case 2:
                        promise = void 0, canvas = void 0;
                        if (this._canvas && this._canvasDrawingPromise) {
                            canvas = this._canvas;
                            promise = this._canvasDrawingPromise;
                        }
                        else {
                            canvas = new _QRCanvas__WEBPACK_IMPORTED_MODULE_3__["default"](this._options);
                            promise = canvas.drawQR(this._qr);
                        }
                        return [4 /*yield*/, promise];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, canvas];
                }
            });
        });
    };
    QRCodeStyling.prototype.update = function (options) {
        QRCodeStyling._clearContainer(this._container);
        this._options = options ? (0,_tools_sanitizeOptions__WEBPACK_IMPORTED_MODULE_7__["default"])((0,_tools_merge__WEBPACK_IMPORTED_MODULE_1__["default"])(this._options, options)) : this._options;
        if (!this._options.data) {
            return;
        }
        this._qr = qrcode_generator__WEBPACK_IMPORTED_MODULE_8___default()(this._options.qrOptions.typeNumber, this._options.qrOptions.errorCorrectionLevel);
        this._qr.addData(this._options.data, this._options.qrOptions.mode || (0,_tools_getMode__WEBPACK_IMPORTED_MODULE_0__["default"])(this._options.data));
        this._qr.make();
        if (this._options.type === _constants_drawTypes__WEBPACK_IMPORTED_MODULE_5__["default"].canvas) {
            this._canvas = new _QRCanvas__WEBPACK_IMPORTED_MODULE_3__["default"](this._options);
            this._canvasDrawingPromise = this._canvas.drawQR(this._qr);
            this._svgDrawingPromise = undefined;
            this._svg = undefined;
        }
        else {
            this._svg = new _QRSVG__WEBPACK_IMPORTED_MODULE_4__["default"](this._options);
            this._svgDrawingPromise = this._svg.drawQR(this._qr);
            this._canvasDrawingPromise = undefined;
            this._canvas = undefined;
        }
        this.append(this._container);
    };
    QRCodeStyling.prototype.append = function (container) {
        if (!container) {
            return;
        }
        if (typeof container.appendChild !== "function") {
            throw "Container should be a single DOM node";
        }
        if (this._options.type === _constants_drawTypes__WEBPACK_IMPORTED_MODULE_5__["default"].canvas) {
            if (this._canvas) {
                container.appendChild(this._canvas.getCanvas());
            }
        }
        else {
            if (this._svg) {
                container.appendChild(this._svg.getElement());
            }
        }
        this._container = container;
    };
    QRCodeStyling.prototype.getRawData = function (extension) {
        if (extension === void 0) { extension = "png"; }
        return __awaiter(this, void 0, void 0, function () {
            var element, serializer, source;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._qr)
                            throw "QR code is empty";
                        return [4 /*yield*/, this._getQRStylingElement(extension)];
                    case 1:
                        element = _a.sent();
                        if (extension.toLowerCase() === "svg") {
                            serializer = new XMLSerializer();
                            source = serializer.serializeToString(element.getElement());
                            return [2 /*return*/, new Blob(['<?xml version="1.0" standalone="no"?>\r\n' + source], { type: "image/svg+xml" })];
                        }
                        else {
                            return [2 /*return*/, new Promise(function (resolve) {
                                    return element.getCanvas().toBlob(resolve, "image/".concat(extension), 1);
                                })];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    QRCodeStyling.prototype.download = function (downloadOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var extension, name, element, serializer, source, url, url;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._qr)
                            throw "QR code is empty";
                        extension = "png";
                        name = "qr";
                        //TODO remove deprecated code in the v2
                        if (typeof downloadOptions === "string") {
                            extension = downloadOptions;
                            console.warn("Extension is deprecated as argument for 'download' method, please pass object { name: '...', extension: '...' } as argument");
                        }
                        else if (typeof downloadOptions === "object" && downloadOptions !== null) {
                            if (downloadOptions.name) {
                                name = downloadOptions.name;
                            }
                            if (downloadOptions.extension) {
                                extension = downloadOptions.extension;
                            }
                        }
                        return [4 /*yield*/, this._getQRStylingElement(extension)];
                    case 1:
                        element = _a.sent();
                        if (extension.toLowerCase() === "svg") {
                            serializer = new XMLSerializer();
                            source = serializer.serializeToString(element.getElement());
                            source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
                            url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
                            (0,_tools_downloadURI__WEBPACK_IMPORTED_MODULE_2__["default"])(url, "".concat(name, ".svg"));
                        }
                        else {
                            url = element.getCanvas().toDataURL("image/".concat(extension));
                            (0,_tools_downloadURI__WEBPACK_IMPORTED_MODULE_2__["default"])(url, "".concat(name, ".").concat(extension));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return QRCodeStyling;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRCodeStyling);


/***/ }),

/***/ "./src/core/QROptions.ts":
/*!*******************************!*\
  !*** ./src/core/QROptions.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants_qrTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/qrTypes */ "./src/constants/qrTypes.ts");
/* harmony import */ var _constants_drawTypes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/drawTypes */ "./src/constants/drawTypes.ts");
/* harmony import */ var _constants_errorCorrectionLevels__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants/errorCorrectionLevels */ "./src/constants/errorCorrectionLevels.ts");



var defaultOptions = {
    type: _constants_drawTypes__WEBPACK_IMPORTED_MODULE_1__["default"].canvas,
    width: 300,
    height: 300,
    data: "",
    margin: 0,
    qrOptions: {
        typeNumber: _constants_qrTypes__WEBPACK_IMPORTED_MODULE_0__["default"][0],
        mode: undefined,
        errorCorrectionLevel: _constants_errorCorrectionLevels__WEBPACK_IMPORTED_MODULE_2__["default"].Q
    },
    imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        crossOrigin: undefined,
        margin: 0
    },
    dotsOptions: {
        type: "square",
        color: "#000"
    },
    backgroundOptions: {
        color: "#fff"
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (defaultOptions);


/***/ }),

/***/ "./src/core/QRSVG.ts":
/*!***************************!*\
  !*** ./src/core/QRSVG.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tools_calculateImageSize__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../tools/calculateImageSize */ "./src/tools/calculateImageSize.ts");
/* harmony import */ var _constants_errorCorrectionPercents__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/errorCorrectionPercents */ "./src/constants/errorCorrectionPercents.ts");
/* harmony import */ var _figures_dot_svg_QRDot__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../figures/dot/svg/QRDot */ "./src/figures/dot/svg/QRDot.ts");
/* harmony import */ var _figures_cornerSquare_svg_QRCornerSquare__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../figures/cornerSquare/svg/QRCornerSquare */ "./src/figures/cornerSquare/svg/QRCornerSquare.ts");
/* harmony import */ var _figures_cornerDot_svg_QRCornerDot__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../figures/cornerDot/svg/QRCornerDot */ "./src/figures/cornerDot/svg/QRCornerDot.ts");
/* harmony import */ var _constants_gradientTypes__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../constants/gradientTypes */ "./src/constants/gradientTypes.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};






var squareMask = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1]
];
var dotMask = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0]
];
var QRSVG = /** @class */ (function () {
    //TODO don't pass all options to this class
    function QRSVG(options) {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this._element.setAttribute("width", String(options.width));
        this._element.setAttribute("height", String(options.height));
        this._defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        this._element.appendChild(this._defs);
        this._options = options;
    }
    Object.defineProperty(QRSVG.prototype, "width", {
        get: function () {
            return this._options.width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(QRSVG.prototype, "height", {
        get: function () {
            return this._options.height;
        },
        enumerable: false,
        configurable: true
    });
    QRSVG.prototype.getElement = function () {
        return this._element;
    };
    QRSVG.prototype.clear = function () {
        var _a;
        var oldElement = this._element;
        this._element = oldElement.cloneNode(false);
        (_a = oldElement === null || oldElement === void 0 ? void 0 : oldElement.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(this._element, oldElement);
        this._defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        this._element.appendChild(this._defs);
    };
    QRSVG.prototype.drawQR = function (qr) {
        return __awaiter(this, void 0, void 0, function () {
            var count, minSize, dotSize, drawImageSize, _a, imageOptions, qrOptions, coverLevel, maxHiddenDots;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        count = qr.getModuleCount();
                        minSize = Math.min(this._options.width, this._options.height) - this._options.margin * 2;
                        dotSize = Math.floor(minSize / count);
                        drawImageSize = {
                            hideXDots: 0,
                            hideYDots: 0,
                            width: 0,
                            height: 0
                        };
                        this._qr = qr;
                        if (!this._options.image) return [3 /*break*/, 2];
                        //We need it to get image size
                        return [4 /*yield*/, this.loadImage()];
                    case 1:
                        //We need it to get image size
                        _b.sent();
                        if (!this._image)
                            return [2 /*return*/];
                        _a = this._options, imageOptions = _a.imageOptions, qrOptions = _a.qrOptions;
                        coverLevel = imageOptions.imageSize * _constants_errorCorrectionPercents__WEBPACK_IMPORTED_MODULE_1__["default"][qrOptions.errorCorrectionLevel];
                        maxHiddenDots = Math.floor(coverLevel * count * count);
                        drawImageSize = (0,_tools_calculateImageSize__WEBPACK_IMPORTED_MODULE_0__["default"])({
                            originalWidth: this._image.width,
                            originalHeight: this._image.height,
                            maxHiddenDots: maxHiddenDots,
                            maxHiddenAxisDots: count - 14,
                            dotSize: dotSize
                        });
                        _b.label = 2;
                    case 2:
                        this.clear();
                        this.drawBackground();
                        this.drawDots(function (i, j) {
                            var _a, _b, _c, _d, _e, _f;
                            if (_this._options.imageOptions.hideBackgroundDots) {
                                if (i >= (count - drawImageSize.hideXDots) / 2 &&
                                    i < (count + drawImageSize.hideXDots) / 2 &&
                                    j >= (count - drawImageSize.hideYDots) / 2 &&
                                    j < (count + drawImageSize.hideYDots) / 2) {
                                    return false;
                                }
                            }
                            if (((_a = squareMask[i]) === null || _a === void 0 ? void 0 : _a[j]) || ((_b = squareMask[i - count + 7]) === null || _b === void 0 ? void 0 : _b[j]) || ((_c = squareMask[i]) === null || _c === void 0 ? void 0 : _c[j - count + 7])) {
                                return false;
                            }
                            if (((_d = dotMask[i]) === null || _d === void 0 ? void 0 : _d[j]) || ((_e = dotMask[i - count + 7]) === null || _e === void 0 ? void 0 : _e[j]) || ((_f = dotMask[i]) === null || _f === void 0 ? void 0 : _f[j - count + 7])) {
                                return false;
                            }
                            return true;
                        });
                        this.drawCorners();
                        if (this._options.image) {
                            this.drawImage({ width: drawImageSize.width, height: drawImageSize.height, count: count, dotSize: dotSize });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    QRSVG.prototype.drawBackground = function () {
        var _a, _b;
        var element = this._element;
        var options = this._options;
        if (element) {
            var gradientOptions = (_a = options.backgroundOptions) === null || _a === void 0 ? void 0 : _a.gradient;
            var color = (_b = options.backgroundOptions) === null || _b === void 0 ? void 0 : _b.color;
            if (gradientOptions || color) {
                this._createColor({
                    options: gradientOptions,
                    color: color,
                    additionalRotation: 0,
                    x: 0,
                    y: 0,
                    height: options.height,
                    width: options.width,
                    name: "background-color"
                });
            }
        }
    };
    QRSVG.prototype.drawDots = function (filter) {
        var _this = this;
        var _a, _b;
        if (!this._qr) {
            throw "QR code is not defined";
        }
        var options = this._options;
        var count = this._qr.getModuleCount();
        if (count > options.width || count > options.height) {
            throw "The canvas is too small.";
        }
        var minSize = Math.min(options.width, options.height) - options.margin * 2;
        var dotSize = Math.floor(minSize / count);
        var xBeginning = Math.floor((options.width - count * dotSize) / 2);
        var yBeginning = Math.floor((options.height - count * dotSize) / 2);
        var dot = new _figures_dot_svg_QRDot__WEBPACK_IMPORTED_MODULE_2__["default"]({ svg: this._element, type: options.dotsOptions.type });
        this._dotsClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        this._dotsClipPath.setAttribute("id", "clip-path-dot-color");
        this._defs.appendChild(this._dotsClipPath);
        this._createColor({
            options: (_a = options.dotsOptions) === null || _a === void 0 ? void 0 : _a.gradient,
            color: options.dotsOptions.color,
            additionalRotation: 0,
            x: xBeginning,
            y: yBeginning,
            height: count * dotSize,
            width: count * dotSize,
            name: "dot-color"
        });
        var _loop_1 = function (i) {
            var _loop_2 = function (j) {
                if (filter && !filter(i, j)) {
                    return "continue";
                }
                if (!((_b = this_1._qr) === null || _b === void 0 ? void 0 : _b.isDark(i, j))) {
                    return "continue";
                }
                dot.draw(xBeginning + i * dotSize, yBeginning + j * dotSize, dotSize, function (xOffset, yOffset) {
                    if (i + xOffset < 0 || j + yOffset < 0 || i + xOffset >= count || j + yOffset >= count)
                        return false;
                    if (filter && !filter(i + xOffset, j + yOffset))
                        return false;
                    return !!_this._qr && _this._qr.isDark(i + xOffset, j + yOffset);
                });
                if (dot._element && this_1._dotsClipPath) {
                    this_1._dotsClipPath.appendChild(dot._element);
                }
            };
            for (var j = 0; j < count; j++) {
                _loop_2(j);
            }
        };
        var this_1 = this;
        for (var i = 0; i < count; i++) {
            _loop_1(i);
        }
    };
    QRSVG.prototype.drawCorners = function () {
        var _this = this;
        if (!this._qr) {
            throw "QR code is not defined";
        }
        var element = this._element;
        var options = this._options;
        if (!element) {
            throw "Element code is not defined";
        }
        var count = this._qr.getModuleCount();
        var minSize = Math.min(options.width, options.height) - options.margin * 2;
        var dotSize = Math.floor(minSize / count);
        var cornersSquareSize = dotSize * 7;
        var cornersDotSize = dotSize * 3;
        var xBeginning = Math.floor((options.width - count * dotSize) / 2);
        var yBeginning = Math.floor((options.height - count * dotSize) / 2);
        [
            [0, 0, 0],
            [1, 0, Math.PI / 2],
            [0, 1, -Math.PI / 2]
        ].forEach(function (_a) {
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            var column = _a[0], row = _a[1], rotation = _a[2];
            var x = xBeginning + column * dotSize * (count - 7);
            var y = yBeginning + row * dotSize * (count - 7);
            var cornersSquareClipPath = _this._dotsClipPath;
            var cornersDotClipPath = _this._dotsClipPath;
            if (((_b = options.cornersSquareOptions) === null || _b === void 0 ? void 0 : _b.gradient) || ((_c = options.cornersSquareOptions) === null || _c === void 0 ? void 0 : _c.color)) {
                cornersSquareClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
                cornersSquareClipPath.setAttribute("id", "clip-path-corners-square-color-".concat(column, "-").concat(row));
                _this._defs.appendChild(cornersSquareClipPath);
                _this._cornersSquareClipPath = _this._cornersDotClipPath = cornersDotClipPath = cornersSquareClipPath;
                _this._createColor({
                    options: (_d = options.cornersSquareOptions) === null || _d === void 0 ? void 0 : _d.gradient,
                    color: (_e = options.cornersSquareOptions) === null || _e === void 0 ? void 0 : _e.color,
                    additionalRotation: rotation,
                    x: x,
                    y: y,
                    height: cornersSquareSize,
                    width: cornersSquareSize,
                    name: "corners-square-color-".concat(column, "-").concat(row)
                });
            }
            if ((_f = options.cornersSquareOptions) === null || _f === void 0 ? void 0 : _f.type) {
                var cornersSquare = new _figures_cornerSquare_svg_QRCornerSquare__WEBPACK_IMPORTED_MODULE_3__["default"]({ svg: _this._element, type: options.cornersSquareOptions.type });
                cornersSquare.draw(x, y, cornersSquareSize, rotation);
                if (cornersSquare._element && cornersSquareClipPath) {
                    cornersSquareClipPath.appendChild(cornersSquare._element);
                }
            }
            else {
                var dot = new _figures_dot_svg_QRDot__WEBPACK_IMPORTED_MODULE_2__["default"]({ svg: _this._element, type: options.dotsOptions.type });
                var _loop_3 = function (i) {
                    var _loop_5 = function (j) {
                        if (!((_g = squareMask[i]) === null || _g === void 0 ? void 0 : _g[j])) {
                            return "continue";
                        }
                        dot.draw(x + i * dotSize, y + j * dotSize, dotSize, function (xOffset, yOffset) { var _a; return !!((_a = squareMask[i + xOffset]) === null || _a === void 0 ? void 0 : _a[j + yOffset]); });
                        if (dot._element && cornersSquareClipPath) {
                            cornersSquareClipPath.appendChild(dot._element);
                        }
                    };
                    for (var j = 0; j < squareMask[i].length; j++) {
                        _loop_5(j);
                    }
                };
                for (var i = 0; i < squareMask.length; i++) {
                    _loop_3(i);
                }
            }
            if (((_h = options.cornersDotOptions) === null || _h === void 0 ? void 0 : _h.gradient) || ((_j = options.cornersDotOptions) === null || _j === void 0 ? void 0 : _j.color)) {
                cornersDotClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
                cornersDotClipPath.setAttribute("id", "clip-path-corners-dot-color-".concat(column, "-").concat(row));
                _this._defs.appendChild(cornersDotClipPath);
                _this._cornersDotClipPath = cornersDotClipPath;
                _this._createColor({
                    options: (_k = options.cornersDotOptions) === null || _k === void 0 ? void 0 : _k.gradient,
                    color: (_l = options.cornersDotOptions) === null || _l === void 0 ? void 0 : _l.color,
                    additionalRotation: rotation,
                    x: x + dotSize * 2,
                    y: y + dotSize * 2,
                    height: cornersDotSize,
                    width: cornersDotSize,
                    name: "corners-dot-color-".concat(column, "-").concat(row)
                });
            }
            if ((_m = options.cornersDotOptions) === null || _m === void 0 ? void 0 : _m.type) {
                var cornersDot = new _figures_cornerDot_svg_QRCornerDot__WEBPACK_IMPORTED_MODULE_4__["default"]({ svg: _this._element, type: options.cornersDotOptions.type });
                cornersDot.draw(x + dotSize * 2, y + dotSize * 2, cornersDotSize, rotation);
                if (cornersDot._element && cornersDotClipPath) {
                    cornersDotClipPath.appendChild(cornersDot._element);
                }
            }
            else {
                var dot = new _figures_dot_svg_QRDot__WEBPACK_IMPORTED_MODULE_2__["default"]({ svg: _this._element, type: options.dotsOptions.type });
                var _loop_4 = function (i) {
                    var _loop_6 = function (j) {
                        if (!((_o = dotMask[i]) === null || _o === void 0 ? void 0 : _o[j])) {
                            return "continue";
                        }
                        dot.draw(x + i * dotSize, y + j * dotSize, dotSize, function (xOffset, yOffset) { var _a; return !!((_a = dotMask[i + xOffset]) === null || _a === void 0 ? void 0 : _a[j + yOffset]); });
                        if (dot._element && cornersDotClipPath) {
                            cornersDotClipPath.appendChild(dot._element);
                        }
                    };
                    for (var j = 0; j < dotMask[i].length; j++) {
                        _loop_6(j);
                    }
                };
                for (var i = 0; i < dotMask.length; i++) {
                    _loop_4(i);
                }
            }
        });
    };
    QRSVG.prototype.loadImage = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var options = _this._options;
            var image = new Image();
            if (!options.image) {
                return reject("Image is not defined");
            }
            if (typeof options.imageOptions.crossOrigin === "string") {
                image.crossOrigin = options.imageOptions.crossOrigin;
            }
            _this._image = image;
            image.onload = function () {
                resolve();
            };
            image.src = options.image;
        });
    };
    QRSVG.prototype.drawImage = function (_a) {
        var width = _a.width, height = _a.height, count = _a.count, dotSize = _a.dotSize;
        var options = this._options;
        var xBeginning = Math.floor((options.width - count * dotSize) / 2);
        var yBeginning = Math.floor((options.height - count * dotSize) / 2);
        var dx = xBeginning + options.imageOptions.margin + (count * dotSize - width) / 2;
        var dy = yBeginning + options.imageOptions.margin + (count * dotSize - height) / 2;
        var dw = width - options.imageOptions.margin * 2;
        var dh = height - options.imageOptions.margin * 2;
        var image = document.createElementNS("http://www.w3.org/2000/svg", "image");
        image.setAttribute("href", options.image || "");
        image.setAttribute("x", String(dx));
        image.setAttribute("y", String(dy));
        image.setAttribute("width", "".concat(dw, "px"));
        image.setAttribute("height", "".concat(dh, "px"));
        this._element.appendChild(image);
    };
    QRSVG.prototype._createColor = function (_a) {
        var options = _a.options, color = _a.color, additionalRotation = _a.additionalRotation, x = _a.x, y = _a.y, height = _a.height, width = _a.width, name = _a.name;
        var size = width > height ? width : height;
        var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", String(x));
        rect.setAttribute("y", String(y));
        rect.setAttribute("height", String(height));
        rect.setAttribute("width", String(width));
        rect.setAttribute("clip-path", "url('#clip-path-".concat(name, "')"));
        if (options) {
            var gradient_1;
            if (options.type === _constants_gradientTypes__WEBPACK_IMPORTED_MODULE_5__["default"].radial) {
                gradient_1 = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
                gradient_1.setAttribute("id", name);
                gradient_1.setAttribute("gradientUnits", "userSpaceOnUse");
                gradient_1.setAttribute("fx", String(x + width / 2));
                gradient_1.setAttribute("fy", String(y + height / 2));
                gradient_1.setAttribute("cx", String(x + width / 2));
                gradient_1.setAttribute("cy", String(y + height / 2));
                gradient_1.setAttribute("r", String(size / 2));
            }
            else {
                var rotation = ((options.rotation || 0) + additionalRotation) % (2 * Math.PI);
                var positiveRotation = (rotation + 2 * Math.PI) % (2 * Math.PI);
                var x0 = x + width / 2;
                var y0 = y + height / 2;
                var x1 = x + width / 2;
                var y1 = y + height / 2;
                if ((positiveRotation >= 0 && positiveRotation <= 0.25 * Math.PI) ||
                    (positiveRotation > 1.75 * Math.PI && positiveRotation <= 2 * Math.PI)) {
                    x0 = x0 - width / 2;
                    y0 = y0 - (height / 2) * Math.tan(rotation);
                    x1 = x1 + width / 2;
                    y1 = y1 + (height / 2) * Math.tan(rotation);
                }
                else if (positiveRotation > 0.25 * Math.PI && positiveRotation <= 0.75 * Math.PI) {
                    y0 = y0 - height / 2;
                    x0 = x0 - width / 2 / Math.tan(rotation);
                    y1 = y1 + height / 2;
                    x1 = x1 + width / 2 / Math.tan(rotation);
                }
                else if (positiveRotation > 0.75 * Math.PI && positiveRotation <= 1.25 * Math.PI) {
                    x0 = x0 + width / 2;
                    y0 = y0 + (height / 2) * Math.tan(rotation);
                    x1 = x1 - width / 2;
                    y1 = y1 - (height / 2) * Math.tan(rotation);
                }
                else if (positiveRotation > 1.25 * Math.PI && positiveRotation <= 1.75 * Math.PI) {
                    y0 = y0 + height / 2;
                    x0 = x0 + width / 2 / Math.tan(rotation);
                    y1 = y1 - height / 2;
                    x1 = x1 - width / 2 / Math.tan(rotation);
                }
                gradient_1 = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
                gradient_1.setAttribute("id", name);
                gradient_1.setAttribute("gradientUnits", "userSpaceOnUse");
                gradient_1.setAttribute("x1", String(Math.round(x0)));
                gradient_1.setAttribute("y1", String(Math.round(y0)));
                gradient_1.setAttribute("x2", String(Math.round(x1)));
                gradient_1.setAttribute("y2", String(Math.round(y1)));
            }
            options.colorStops.forEach(function (_a) {
                var offset = _a.offset, color = _a.color;
                var stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
                stop.setAttribute("offset", "".concat(100 * offset, "%"));
                stop.setAttribute("stop-color", color);
                gradient_1.appendChild(stop);
            });
            rect.setAttribute("fill", "url('#".concat(name, "')"));
            this._defs.appendChild(gradient_1);
        }
        else if (color) {
            rect.setAttribute("fill", color);
        }
        this._element.appendChild(rect);
    };
    return QRSVG;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRSVG);


/***/ }),

/***/ "./src/figures/cornerDot/canvas/QRCornerDot.ts":
/*!*****************************************************!*\
  !*** ./src/figures/cornerDot/canvas/QRCornerDot.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../constants/cornerDotTypes */ "./src/constants/cornerDotTypes.ts");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var QRCornerDot = /** @class */ (function () {
    function QRCornerDot(_a) {
        var context = _a.context, type = _a.type;
        this._context = context;
        this._type = type;
    }
    QRCornerDot.prototype.draw = function (x, y, size, rotation) {
        var context = this._context;
        var type = this._type;
        var drawFunction;
        switch (type) {
            case _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].square:
                drawFunction = this._drawSquare;
                break;
            case _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].dot:
            default:
                drawFunction = this._drawDot;
        }
        drawFunction.call(this, { x: x, y: y, size: size, context: context, rotation: rotation });
    };
    QRCornerDot.prototype._rotateFigure = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, _b = _a.rotation, rotation = _b === void 0 ? 0 : _b, draw = _a.draw;
        var cx = x + size / 2;
        var cy = y + size / 2;
        context.translate(cx, cy);
        rotation && context.rotate(rotation);
        draw();
        context.closePath();
        rotation && context.rotate(-rotation);
        context.translate(-cx, -cy);
    };
    QRCornerDot.prototype._basicDot = function (args) {
        var size = args.size, context = args.context;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.arc(0, 0, size / 2, 0, Math.PI * 2);
            } }));
    };
    QRCornerDot.prototype._basicSquare = function (args) {
        var size = args.size, context = args.context;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.rect(-size / 2, -size / 2, size, size);
            } }));
    };
    QRCornerDot.prototype._drawDot = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, rotation = _a.rotation;
        this._basicDot({ x: x, y: y, size: size, context: context, rotation: rotation });
    };
    QRCornerDot.prototype._drawSquare = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, rotation = _a.rotation;
        this._basicSquare({ x: x, y: y, size: size, context: context, rotation: rotation });
    };
    return QRCornerDot;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRCornerDot);


/***/ }),

/***/ "./src/figures/cornerDot/svg/QRCornerDot.ts":
/*!**************************************************!*\
  !*** ./src/figures/cornerDot/svg/QRCornerDot.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../constants/cornerDotTypes */ "./src/constants/cornerDotTypes.ts");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var QRCornerDot = /** @class */ (function () {
    function QRCornerDot(_a) {
        var svg = _a.svg, type = _a.type;
        this._svg = svg;
        this._type = type;
    }
    QRCornerDot.prototype.draw = function (x, y, size, rotation) {
        var type = this._type;
        var drawFunction;
        switch (type) {
            case _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].square:
                drawFunction = this._drawSquare;
                break;
            case _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].dot:
            default:
                drawFunction = this._drawDot;
        }
        drawFunction.call(this, { x: x, y: y, size: size, rotation: rotation });
    };
    QRCornerDot.prototype._rotateFigure = function (_a) {
        var _b;
        var x = _a.x, y = _a.y, size = _a.size, _c = _a.rotation, rotation = _c === void 0 ? 0 : _c, draw = _a.draw;
        var cx = x + size / 2;
        var cy = y + size / 2;
        draw();
        (_b = this._element) === null || _b === void 0 ? void 0 : _b.setAttribute("transform", "rotate(".concat((180 * rotation) / Math.PI, ",").concat(cx, ",").concat(cy, ")"));
    };
    QRCornerDot.prototype._basicDot = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                _this._element.setAttribute("cx", String(x + size / 2));
                _this._element.setAttribute("cy", String(y + size / 2));
                _this._element.setAttribute("r", String(size / 2));
            } }));
    };
    QRCornerDot.prototype._basicSquare = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                _this._element.setAttribute("x", String(x));
                _this._element.setAttribute("y", String(y));
                _this._element.setAttribute("width", String(size));
                _this._element.setAttribute("height", String(size));
            } }));
    };
    QRCornerDot.prototype._drawDot = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, rotation = _a.rotation;
        this._basicDot({ x: x, y: y, size: size, rotation: rotation });
    };
    QRCornerDot.prototype._drawSquare = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, rotation = _a.rotation;
        this._basicSquare({ x: x, y: y, size: size, rotation: rotation });
    };
    return QRCornerDot;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRCornerDot);


/***/ }),

/***/ "./src/figures/cornerSquare/canvas/QRCornerSquare.ts":
/*!***********************************************************!*\
  !*** ./src/figures/cornerSquare/canvas/QRCornerSquare.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../constants/cornerSquareTypes */ "./src/constants/cornerSquareTypes.ts");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var QRCornerSquare = /** @class */ (function () {
    function QRCornerSquare(_a) {
        var context = _a.context, type = _a.type;
        this._context = context;
        this._type = type;
    }
    QRCornerSquare.prototype.draw = function (x, y, size, rotation) {
        var context = this._context;
        var type = this._type;
        var drawFunction;
        switch (type) {
            case _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__["default"].square:
                drawFunction = this._drawSquare;
                break;
            case _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__["default"].extraRounded:
                drawFunction = this._drawExtraRounded;
                break;
            case _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__["default"].dot:
            default:
                drawFunction = this._drawDot;
        }
        drawFunction.call(this, { x: x, y: y, size: size, context: context, rotation: rotation });
    };
    QRCornerSquare.prototype._rotateFigure = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, _b = _a.rotation, rotation = _b === void 0 ? 0 : _b, draw = _a.draw;
        var cx = x + size / 2;
        var cy = y + size / 2;
        context.translate(cx, cy);
        rotation && context.rotate(rotation);
        draw();
        context.closePath();
        rotation && context.rotate(-rotation);
        context.translate(-cx, -cy);
    };
    QRCornerSquare.prototype._basicDot = function (args) {
        var size = args.size, context = args.context;
        var dotSize = size / 7;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.arc(0, 0, size / 2, 0, Math.PI * 2);
                context.arc(0, 0, size / 2 - dotSize, 0, Math.PI * 2);
            } }));
    };
    QRCornerSquare.prototype._basicSquare = function (args) {
        var size = args.size, context = args.context;
        var dotSize = size / 7;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.rect(-size / 2, -size / 2, size, size);
                context.rect(-size / 2 + dotSize, -size / 2 + dotSize, size - 2 * dotSize, size - 2 * dotSize);
            } }));
    };
    QRCornerSquare.prototype._basicExtraRounded = function (args) {
        var size = args.size, context = args.context;
        var dotSize = size / 7;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.arc(-dotSize, -dotSize, 2.5 * dotSize, Math.PI, -Math.PI / 2);
                context.lineTo(dotSize, -3.5 * dotSize);
                context.arc(dotSize, -dotSize, 2.5 * dotSize, -Math.PI / 2, 0);
                context.lineTo(3.5 * dotSize, -dotSize);
                context.arc(dotSize, dotSize, 2.5 * dotSize, 0, Math.PI / 2);
                context.lineTo(-dotSize, 3.5 * dotSize);
                context.arc(-dotSize, dotSize, 2.5 * dotSize, Math.PI / 2, Math.PI);
                context.lineTo(-3.5 * dotSize, -dotSize);
                context.arc(-dotSize, -dotSize, 1.5 * dotSize, Math.PI, -Math.PI / 2);
                context.lineTo(dotSize, -2.5 * dotSize);
                context.arc(dotSize, -dotSize, 1.5 * dotSize, -Math.PI / 2, 0);
                context.lineTo(2.5 * dotSize, -dotSize);
                context.arc(dotSize, dotSize, 1.5 * dotSize, 0, Math.PI / 2);
                context.lineTo(-dotSize, 2.5 * dotSize);
                context.arc(-dotSize, dotSize, 1.5 * dotSize, Math.PI / 2, Math.PI);
                context.lineTo(-2.5 * dotSize, -dotSize);
            } }));
    };
    QRCornerSquare.prototype._drawDot = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, rotation = _a.rotation;
        this._basicDot({ x: x, y: y, size: size, context: context, rotation: rotation });
    };
    QRCornerSquare.prototype._drawSquare = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, rotation = _a.rotation;
        this._basicSquare({ x: x, y: y, size: size, context: context, rotation: rotation });
    };
    QRCornerSquare.prototype._drawExtraRounded = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, rotation = _a.rotation;
        this._basicExtraRounded({ x: x, y: y, size: size, context: context, rotation: rotation });
    };
    return QRCornerSquare;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRCornerSquare);


/***/ }),

/***/ "./src/figures/cornerSquare/svg/QRCornerSquare.ts":
/*!********************************************************!*\
  !*** ./src/figures/cornerSquare/svg/QRCornerSquare.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../constants/cornerSquareTypes */ "./src/constants/cornerSquareTypes.ts");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var QRCornerSquare = /** @class */ (function () {
    function QRCornerSquare(_a) {
        var svg = _a.svg, type = _a.type;
        this._svg = svg;
        this._type = type;
    }
    QRCornerSquare.prototype.draw = function (x, y, size, rotation) {
        var type = this._type;
        var drawFunction;
        switch (type) {
            case _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__["default"].square:
                drawFunction = this._drawSquare;
                break;
            case _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__["default"].extraRounded:
                drawFunction = this._drawExtraRounded;
                break;
            case _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_0__["default"].dot:
            default:
                drawFunction = this._drawDot;
        }
        drawFunction.call(this, { x: x, y: y, size: size, rotation: rotation });
    };
    QRCornerSquare.prototype._rotateFigure = function (_a) {
        var _b;
        var x = _a.x, y = _a.y, size = _a.size, _c = _a.rotation, rotation = _c === void 0 ? 0 : _c, draw = _a.draw;
        var cx = x + size / 2;
        var cy = y + size / 2;
        draw();
        (_b = this._element) === null || _b === void 0 ? void 0 : _b.setAttribute("transform", "rotate(".concat((180 * rotation) / Math.PI, ",").concat(cx, ",").concat(cy, ")"));
    };
    QRCornerSquare.prototype._basicDot = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        var dotSize = size / 7;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                _this._element.setAttribute("clip-rule", "evenodd");
                _this._element.setAttribute("d", "M ".concat(x + size / 2, " ").concat(y) + // M cx, y //  Move to top of ring
                    "a ".concat(size / 2, " ").concat(size / 2, " 0 1 0 0.1 0") + // a outerRadius, outerRadius, 0, 1, 0, 1, 0 // Draw outer arc, but don't close it
                    "z" + // Z // Close the outer shape
                    "m 0 ".concat(dotSize) + // m -1 outerRadius-innerRadius // Move to top point of inner radius
                    "a ".concat(size / 2 - dotSize, " ").concat(size / 2 - dotSize, " 0 1 1 -0.1 0") + // a innerRadius, innerRadius, 0, 1, 1, -1, 0 // Draw inner arc, but don't close it
                    "Z" // Z // Close the inner ring. Actually will still work without, but inner ring will have one unit missing in stroke
                );
            } }));
    };
    QRCornerSquare.prototype._basicSquare = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        var dotSize = size / 7;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                _this._element.setAttribute("clip-rule", "evenodd");
                _this._element.setAttribute("d", "M ".concat(x, " ").concat(y) +
                    "v ".concat(size) +
                    "h ".concat(size) +
                    "v ".concat(-size) +
                    "z" +
                    "M ".concat(x + dotSize, " ").concat(y + dotSize) +
                    "h ".concat(size - 2 * dotSize) +
                    "v ".concat(size - 2 * dotSize) +
                    "h ".concat(-size + 2 * dotSize) +
                    "z");
            } }));
    };
    QRCornerSquare.prototype._basicExtraRounded = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        var dotSize = size / 7;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                _this._element.setAttribute("clip-rule", "evenodd");
                _this._element.setAttribute("d", "M ".concat(x, " ").concat(y + 2.5 * dotSize) +
                    "v ".concat(2 * dotSize) +
                    "a ".concat(2.5 * dotSize, " ").concat(2.5 * dotSize, ", 0, 0, 0, ").concat(dotSize * 2.5, " ").concat(dotSize * 2.5) +
                    "h ".concat(2 * dotSize) +
                    "a ".concat(2.5 * dotSize, " ").concat(2.5 * dotSize, ", 0, 0, 0, ").concat(dotSize * 2.5, " ").concat(-dotSize * 2.5) +
                    "v ".concat(-2 * dotSize) +
                    "a ".concat(2.5 * dotSize, " ").concat(2.5 * dotSize, ", 0, 0, 0, ").concat(-dotSize * 2.5, " ").concat(-dotSize * 2.5) +
                    "h ".concat(-2 * dotSize) +
                    "a ".concat(2.5 * dotSize, " ").concat(2.5 * dotSize, ", 0, 0, 0, ").concat(-dotSize * 2.5, " ").concat(dotSize * 2.5) +
                    "M ".concat(x + 2.5 * dotSize, " ").concat(y + dotSize) +
                    "h ".concat(2 * dotSize) +
                    "a ".concat(1.5 * dotSize, " ").concat(1.5 * dotSize, ", 0, 0, 1, ").concat(dotSize * 1.5, " ").concat(dotSize * 1.5) +
                    "v ".concat(2 * dotSize) +
                    "a ".concat(1.5 * dotSize, " ").concat(1.5 * dotSize, ", 0, 0, 1, ").concat(-dotSize * 1.5, " ").concat(dotSize * 1.5) +
                    "h ".concat(-2 * dotSize) +
                    "a ".concat(1.5 * dotSize, " ").concat(1.5 * dotSize, ", 0, 0, 1, ").concat(-dotSize * 1.5, " ").concat(-dotSize * 1.5) +
                    "v ".concat(-2 * dotSize) +
                    "a ".concat(1.5 * dotSize, " ").concat(1.5 * dotSize, ", 0, 0, 1, ").concat(dotSize * 1.5, " ").concat(-dotSize * 1.5));
            } }));
    };
    QRCornerSquare.prototype._drawDot = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, rotation = _a.rotation;
        this._basicDot({ x: x, y: y, size: size, rotation: rotation });
    };
    QRCornerSquare.prototype._drawSquare = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, rotation = _a.rotation;
        this._basicSquare({ x: x, y: y, size: size, rotation: rotation });
    };
    QRCornerSquare.prototype._drawExtraRounded = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, rotation = _a.rotation;
        this._basicExtraRounded({ x: x, y: y, size: size, rotation: rotation });
    };
    return QRCornerSquare;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRCornerSquare);


/***/ }),

/***/ "./src/figures/dot/canvas/QRDot.ts":
/*!*****************************************!*\
  !*** ./src/figures/dot/canvas/QRDot.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../constants/dotTypes */ "./src/constants/dotTypes.ts");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var QRDot = /** @class */ (function () {
    function QRDot(_a) {
        var context = _a.context, type = _a.type;
        this._context = context;
        this._type = type;
    }
    QRDot.prototype.draw = function (x, y, size, getNeighbor) {
        var context = this._context;
        var type = this._type;
        var drawFunction;
        switch (type) {
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].dots:
                drawFunction = this._drawDot;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].classy:
                drawFunction = this._drawClassy;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].classyRounded:
                drawFunction = this._drawClassyRounded;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].rounded:
                drawFunction = this._drawRounded;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].extraRounded:
                drawFunction = this._drawExtraRounded;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].square:
            default:
                drawFunction = this._drawSquare;
        }
        drawFunction.call(this, { x: x, y: y, size: size, context: context, getNeighbor: getNeighbor });
    };
    QRDot.prototype._rotateFigure = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, _b = _a.rotation, rotation = _b === void 0 ? 0 : _b, draw = _a.draw;
        var cx = x + size / 2;
        var cy = y + size / 2;
        context.translate(cx, cy);
        rotation && context.rotate(rotation);
        draw();
        context.closePath();
        rotation && context.rotate(-rotation);
        context.translate(-cx, -cy);
    };
    QRDot.prototype._basicDot = function (args) {
        var size = args.size, context = args.context;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.arc(0, 0, size / 2, 0, Math.PI * 2);
            } }));
    };
    QRDot.prototype._basicSquare = function (args) {
        var size = args.size, context = args.context;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.rect(-size / 2, -size / 2, size, size);
            } }));
    };
    //if rotation === 0 - right side is rounded
    QRDot.prototype._basicSideRounded = function (args) {
        var size = args.size, context = args.context;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.arc(0, 0, size / 2, -Math.PI / 2, Math.PI / 2);
                context.lineTo(-size / 2, size / 2);
                context.lineTo(-size / 2, -size / 2);
                context.lineTo(0, -size / 2);
            } }));
    };
    //if rotation === 0 - top right corner is rounded
    QRDot.prototype._basicCornerRounded = function (args) {
        var size = args.size, context = args.context;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.arc(0, 0, size / 2, -Math.PI / 2, 0);
                context.lineTo(size / 2, size / 2);
                context.lineTo(-size / 2, size / 2);
                context.lineTo(-size / 2, -size / 2);
                context.lineTo(0, -size / 2);
            } }));
    };
    //if rotation === 0 - top right corner is rounded
    QRDot.prototype._basicCornerExtraRounded = function (args) {
        var size = args.size, context = args.context;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.arc(-size / 2, size / 2, size, -Math.PI / 2, 0);
                context.lineTo(-size / 2, size / 2);
                context.lineTo(-size / 2, -size / 2);
            } }));
    };
    QRDot.prototype._basicCornersRounded = function (args) {
        var size = args.size, context = args.context;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.arc(0, 0, size / 2, -Math.PI / 2, 0);
                context.lineTo(size / 2, size / 2);
                context.lineTo(0, size / 2);
                context.arc(0, 0, size / 2, Math.PI / 2, Math.PI);
                context.lineTo(-size / 2, -size / 2);
                context.lineTo(0, -size / 2);
            } }));
    };
    QRDot.prototype._basicCornersExtraRounded = function (args) {
        var size = args.size, context = args.context;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                context.arc(-size / 2, size / 2, size, -Math.PI / 2, 0);
                context.arc(size / 2, -size / 2, size, Math.PI / 2, Math.PI);
            } }));
    };
    QRDot.prototype._drawDot = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context;
        this._basicDot({ x: x, y: y, size: size, context: context, rotation: 0 });
    };
    QRDot.prototype._drawSquare = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context;
        this._basicSquare({ x: x, y: y, size: size, context: context, rotation: 0 });
    };
    QRDot.prototype._drawRounded = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicDot({ x: x, y: y, size: size, context: context, rotation: 0 });
            return;
        }
        if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
            this._basicSquare({ x: x, y: y, size: size, context: context, rotation: 0 });
            return;
        }
        if (neighborsCount === 2) {
            var rotation = 0;
            if (leftNeighbor && topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (topNeighbor && rightNeighbor) {
                rotation = Math.PI;
            }
            else if (rightNeighbor && bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicCornerRounded({ x: x, y: y, size: size, context: context, rotation: rotation });
            return;
        }
        if (neighborsCount === 1) {
            var rotation = 0;
            if (topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (rightNeighbor) {
                rotation = Math.PI;
            }
            else if (bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicSideRounded({ x: x, y: y, size: size, context: context, rotation: rotation });
            return;
        }
    };
    QRDot.prototype._drawExtraRounded = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicDot({ x: x, y: y, size: size, context: context, rotation: 0 });
            return;
        }
        if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
            this._basicSquare({ x: x, y: y, size: size, context: context, rotation: 0 });
            return;
        }
        if (neighborsCount === 2) {
            var rotation = 0;
            if (leftNeighbor && topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (topNeighbor && rightNeighbor) {
                rotation = Math.PI;
            }
            else if (rightNeighbor && bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicCornerExtraRounded({ x: x, y: y, size: size, context: context, rotation: rotation });
            return;
        }
        if (neighborsCount === 1) {
            var rotation = 0;
            if (topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (rightNeighbor) {
                rotation = Math.PI;
            }
            else if (bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicSideRounded({ x: x, y: y, size: size, context: context, rotation: rotation });
            return;
        }
    };
    QRDot.prototype._drawClassy = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicCornersRounded({ x: x, y: y, size: size, context: context, rotation: Math.PI / 2 });
            return;
        }
        if (!leftNeighbor && !topNeighbor) {
            this._basicCornerRounded({ x: x, y: y, size: size, context: context, rotation: -Math.PI / 2 });
            return;
        }
        if (!rightNeighbor && !bottomNeighbor) {
            this._basicCornerRounded({ x: x, y: y, size: size, context: context, rotation: Math.PI / 2 });
            return;
        }
        this._basicSquare({ x: x, y: y, size: size, context: context, rotation: 0 });
    };
    QRDot.prototype._drawClassyRounded = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, context = _a.context, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicCornersRounded({ x: x, y: y, size: size, context: context, rotation: Math.PI / 2 });
            return;
        }
        if (!leftNeighbor && !topNeighbor) {
            this._basicCornerExtraRounded({ x: x, y: y, size: size, context: context, rotation: -Math.PI / 2 });
            return;
        }
        if (!rightNeighbor && !bottomNeighbor) {
            this._basicCornerExtraRounded({ x: x, y: y, size: size, context: context, rotation: Math.PI / 2 });
            return;
        }
        this._basicSquare({ x: x, y: y, size: size, context: context, rotation: 0 });
    };
    return QRDot;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRDot);


/***/ }),

/***/ "./src/figures/dot/svg/QRDot.ts":
/*!**************************************!*\
  !*** ./src/figures/dot/svg/QRDot.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../constants/dotTypes */ "./src/constants/dotTypes.ts");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var QRDot = /** @class */ (function () {
    function QRDot(_a) {
        var svg = _a.svg, type = _a.type;
        this._svg = svg;
        this._type = type;
    }
    QRDot.prototype.draw = function (x, y, size, getNeighbor) {
        var type = this._type;
        var drawFunction;
        switch (type) {
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].dots:
                drawFunction = this._drawDot;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].classy:
                drawFunction = this._drawClassy;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].classyRounded:
                drawFunction = this._drawClassyRounded;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].rounded:
                drawFunction = this._drawRounded;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].extraRounded:
                drawFunction = this._drawExtraRounded;
                break;
            case _constants_dotTypes__WEBPACK_IMPORTED_MODULE_0__["default"].square:
            default:
                drawFunction = this._drawSquare;
        }
        drawFunction.call(this, { x: x, y: y, size: size, getNeighbor: getNeighbor });
    };
    QRDot.prototype._rotateFigure = function (_a) {
        var _b;
        var x = _a.x, y = _a.y, size = _a.size, _c = _a.rotation, rotation = _c === void 0 ? 0 : _c, draw = _a.draw;
        var cx = x + size / 2;
        var cy = y + size / 2;
        draw();
        (_b = this._element) === null || _b === void 0 ? void 0 : _b.setAttribute("transform", "rotate(".concat((180 * rotation) / Math.PI, ",").concat(cx, ",").concat(cy, ")"));
    };
    QRDot.prototype._basicDot = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                _this._element.setAttribute("cx", String(x + size / 2));
                _this._element.setAttribute("cy", String(y + size / 2));
                _this._element.setAttribute("r", String(size / 2));
            } }));
    };
    QRDot.prototype._basicSquare = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                _this._element.setAttribute("x", String(x));
                _this._element.setAttribute("y", String(y));
                _this._element.setAttribute("width", String(size));
                _this._element.setAttribute("height", String(size));
            } }));
    };
    //if rotation === 0 - right side is rounded
    QRDot.prototype._basicSideRounded = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                _this._element.setAttribute("d", "M ".concat(x, " ").concat(y) + //go to top left position
                    "v ".concat(size) + //draw line to left bottom corner
                    "h ".concat(size / 2) + //draw line to left bottom corner + half of size right
                    "a ".concat(size / 2, " ").concat(size / 2, ", 0, 0, 0, 0 ").concat(-size) // draw rounded corner
                );
            } }));
    };
    //if rotation === 0 - top right corner is rounded
    QRDot.prototype._basicCornerRounded = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                _this._element.setAttribute("d", "M ".concat(x, " ").concat(y) + //go to top left position
                    "v ".concat(size) + //draw line to left bottom corner
                    "h ".concat(size) + //draw line to right bottom corner
                    "v ".concat(-size / 2) + //draw line to right bottom corner + half of size top
                    "a ".concat(size / 2, " ").concat(size / 2, ", 0, 0, 0, ").concat(-size / 2, " ").concat(-size / 2) // draw rounded corner
                );
            } }));
    };
    //if rotation === 0 - top right corner is rounded
    QRDot.prototype._basicCornerExtraRounded = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                _this._element.setAttribute("d", "M ".concat(x, " ").concat(y) + //go to top left position
                    "v ".concat(size) + //draw line to left bottom corner
                    "h ".concat(size) + //draw line to right bottom corner
                    "a ".concat(size, " ").concat(size, ", 0, 0, 0, ").concat(-size, " ").concat(-size) // draw rounded top right corner
                );
            } }));
    };
    //if rotation === 0 - left bottom and right top corners are rounded
    QRDot.prototype._basicCornersRounded = function (args) {
        var _this = this;
        var size = args.size, x = args.x, y = args.y;
        this._rotateFigure(__assign(__assign({}, args), { draw: function () {
                _this._element = document.createElementNS("http://www.w3.org/2000/svg", "path");
                _this._element.setAttribute("d", "M ".concat(x, " ").concat(y) + //go to left top position
                    "v ".concat(size / 2) + //draw line to left top corner + half of size bottom
                    "a ".concat(size / 2, " ").concat(size / 2, ", 0, 0, 0, ").concat(size / 2, " ").concat(size / 2) + // draw rounded left bottom corner
                    "h ".concat(size / 2) + //draw line to right bottom corner
                    "v ".concat(-size / 2) + //draw line to right bottom corner + half of size top
                    "a ".concat(size / 2, " ").concat(size / 2, ", 0, 0, 0, ").concat(-size / 2, " ").concat(-size / 2) // draw rounded right top corner
                );
            } }));
    };
    QRDot.prototype._drawDot = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size;
        this._basicDot({ x: x, y: y, size: size, rotation: 0 });
    };
    QRDot.prototype._drawSquare = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size;
        this._basicSquare({ x: x, y: y, size: size, rotation: 0 });
    };
    QRDot.prototype._drawRounded = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicDot({ x: x, y: y, size: size, rotation: 0 });
            return;
        }
        if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
            this._basicSquare({ x: x, y: y, size: size, rotation: 0 });
            return;
        }
        if (neighborsCount === 2) {
            var rotation = 0;
            if (leftNeighbor && topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (topNeighbor && rightNeighbor) {
                rotation = Math.PI;
            }
            else if (rightNeighbor && bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicCornerRounded({ x: x, y: y, size: size, rotation: rotation });
            return;
        }
        if (neighborsCount === 1) {
            var rotation = 0;
            if (topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (rightNeighbor) {
                rotation = Math.PI;
            }
            else if (bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicSideRounded({ x: x, y: y, size: size, rotation: rotation });
            return;
        }
    };
    QRDot.prototype._drawExtraRounded = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicDot({ x: x, y: y, size: size, rotation: 0 });
            return;
        }
        if (neighborsCount > 2 || (leftNeighbor && rightNeighbor) || (topNeighbor && bottomNeighbor)) {
            this._basicSquare({ x: x, y: y, size: size, rotation: 0 });
            return;
        }
        if (neighborsCount === 2) {
            var rotation = 0;
            if (leftNeighbor && topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (topNeighbor && rightNeighbor) {
                rotation = Math.PI;
            }
            else if (rightNeighbor && bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicCornerExtraRounded({ x: x, y: y, size: size, rotation: rotation });
            return;
        }
        if (neighborsCount === 1) {
            var rotation = 0;
            if (topNeighbor) {
                rotation = Math.PI / 2;
            }
            else if (rightNeighbor) {
                rotation = Math.PI;
            }
            else if (bottomNeighbor) {
                rotation = -Math.PI / 2;
            }
            this._basicSideRounded({ x: x, y: y, size: size, rotation: rotation });
            return;
        }
    };
    QRDot.prototype._drawClassy = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicCornersRounded({ x: x, y: y, size: size, rotation: Math.PI / 2 });
            return;
        }
        if (!leftNeighbor && !topNeighbor) {
            this._basicCornerRounded({ x: x, y: y, size: size, rotation: -Math.PI / 2 });
            return;
        }
        if (!rightNeighbor && !bottomNeighbor) {
            this._basicCornerRounded({ x: x, y: y, size: size, rotation: Math.PI / 2 });
            return;
        }
        this._basicSquare({ x: x, y: y, size: size, rotation: 0 });
    };
    QRDot.prototype._drawClassyRounded = function (_a) {
        var x = _a.x, y = _a.y, size = _a.size, getNeighbor = _a.getNeighbor;
        var leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
        var rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
        var topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
        var bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
        var neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
        if (neighborsCount === 0) {
            this._basicCornersRounded({ x: x, y: y, size: size, rotation: Math.PI / 2 });
            return;
        }
        if (!leftNeighbor && !topNeighbor) {
            this._basicCornerExtraRounded({ x: x, y: y, size: size, rotation: -Math.PI / 2 });
            return;
        }
        if (!rightNeighbor && !bottomNeighbor) {
            this._basicCornerExtraRounded({ x: x, y: y, size: size, rotation: Math.PI / 2 });
            return;
        }
        this._basicSquare({ x: x, y: y, size: size, rotation: 0 });
    };
    return QRDot;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (QRDot);


/***/ }),

/***/ "./src/tools/calculateImageSize.ts":
/*!*****************************************!*\
  !*** ./src/tools/calculateImageSize.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ calculateImageSize)
/* harmony export */ });
function calculateImageSize(_a) {
    var originalHeight = _a.originalHeight, originalWidth = _a.originalWidth, maxHiddenDots = _a.maxHiddenDots, maxHiddenAxisDots = _a.maxHiddenAxisDots, dotSize = _a.dotSize;
    var hideDots = { x: 0, y: 0 };
    var imageSize = { x: 0, y: 0 };
    if (originalHeight <= 0 || originalWidth <= 0 || maxHiddenDots <= 0 || dotSize <= 0) {
        return {
            height: 0,
            width: 0,
            hideYDots: 0,
            hideXDots: 0
        };
    }
    var k = originalHeight / originalWidth;
    //Getting the maximum possible axis hidden dots
    hideDots.x = Math.floor(Math.sqrt(maxHiddenDots / k));
    //The count of hidden dot's can't be less than 1
    if (hideDots.x <= 0)
        hideDots.x = 1;
    //Check the limit of the maximum allowed axis hidden dots
    if (maxHiddenAxisDots && maxHiddenAxisDots < hideDots.x)
        hideDots.x = maxHiddenAxisDots;
    //The count of dots should be odd
    if (hideDots.x % 2 === 0)
        hideDots.x--;
    imageSize.x = hideDots.x * dotSize;
    //Calculate opposite axis hidden dots based on axis value.
    //The value will be odd.
    //We use ceil to prevent dots covering by the image.
    hideDots.y = 1 + 2 * Math.ceil((hideDots.x * k - 1) / 2);
    imageSize.y = Math.round(imageSize.x * k);
    //If the result dots count is bigger than max - then decrease size and calculate again
    if (hideDots.y * hideDots.x > maxHiddenDots || (maxHiddenAxisDots && maxHiddenAxisDots < hideDots.y)) {
        if (maxHiddenAxisDots && maxHiddenAxisDots < hideDots.y) {
            hideDots.y = maxHiddenAxisDots;
            if (hideDots.y % 2 === 0)
                hideDots.x--;
        }
        else {
            hideDots.y -= 2;
        }
        imageSize.y = hideDots.y * dotSize;
        hideDots.x = 1 + 2 * Math.ceil((hideDots.y / k - 1) / 2);
        imageSize.x = Math.round(imageSize.y / k);
    }
    return {
        height: imageSize.y,
        width: imageSize.x,
        hideYDots: hideDots.y,
        hideXDots: hideDots.x
    };
}


/***/ }),

/***/ "./src/tools/downloadURI.ts":
/*!**********************************!*\
  !*** ./src/tools/downloadURI.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ downloadURI)
/* harmony export */ });
function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


/***/ }),

/***/ "./src/tools/getMode.ts":
/*!******************************!*\
  !*** ./src/tools/getMode.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getMode)
/* harmony export */ });
/* harmony import */ var _constants_modes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/modes */ "./src/constants/modes.ts");

function getMode(data) {
    switch (true) {
        case /^[0-9]*$/.test(data):
            return _constants_modes__WEBPACK_IMPORTED_MODULE_0__["default"].numeric;
        case /^[0-9A-Z $%*+\-./:]*$/.test(data):
            return _constants_modes__WEBPACK_IMPORTED_MODULE_0__["default"].alphanumeric;
        default:
            return _constants_modes__WEBPACK_IMPORTED_MODULE_0__["default"].byte;
    }
}


/***/ }),

/***/ "./src/tools/merge.ts":
/*!****************************!*\
  !*** ./src/tools/merge.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ mergeDeep)
/* harmony export */ });
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var isObject = function (obj) { return !!obj && typeof obj === "object" && !Array.isArray(obj); };
function mergeDeep(target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    if (!sources.length)
        return target;
    var source = sources.shift();
    if (source === undefined || !isObject(target) || !isObject(source))
        return target;
    target = __assign({}, target);
    Object.keys(source).forEach(function (key) {
        var targetValue = target[key];
        var sourceValue = source[key];
        if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
            target[key] = sourceValue;
        }
        else if (isObject(targetValue) && isObject(sourceValue)) {
            target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
        }
        else {
            target[key] = sourceValue;
        }
    });
    return mergeDeep.apply(void 0, __spreadArray([target], sources, false));
}


/***/ }),

/***/ "./src/tools/sanitizeOptions.ts":
/*!**************************************!*\
  !*** ./src/tools/sanitizeOptions.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ sanitizeOptions)
/* harmony export */ });
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
function sanitizeGradient(gradient) {
    var newGradient = __assign({}, gradient);
    if (!newGradient.colorStops || !newGradient.colorStops.length) {
        throw "Field 'colorStops' is required in gradient";
    }
    if (newGradient.rotation) {
        newGradient.rotation = Number(newGradient.rotation);
    }
    else {
        newGradient.rotation = 0;
    }
    newGradient.colorStops = newGradient.colorStops.map(function (colorStop) { return (__assign(__assign({}, colorStop), { offset: Number(colorStop.offset) })); });
    return newGradient;
}
function sanitizeOptions(options) {
    var newOptions = __assign({}, options);
    newOptions.width = Number(newOptions.width);
    newOptions.height = Number(newOptions.height);
    newOptions.margin = Number(newOptions.margin);
    newOptions.imageOptions = __assign(__assign({}, newOptions.imageOptions), { hideBackgroundDots: Boolean(newOptions.imageOptions.hideBackgroundDots), imageSize: Number(newOptions.imageOptions.imageSize), margin: Number(newOptions.imageOptions.margin) });
    if (newOptions.margin > Math.min(newOptions.width, newOptions.height)) {
        newOptions.margin = Math.min(newOptions.width, newOptions.height);
    }
    newOptions.dotsOptions = __assign({}, newOptions.dotsOptions);
    if (newOptions.dotsOptions.gradient) {
        newOptions.dotsOptions.gradient = sanitizeGradient(newOptions.dotsOptions.gradient);
    }
    if (newOptions.cornersSquareOptions) {
        newOptions.cornersSquareOptions = __assign({}, newOptions.cornersSquareOptions);
        if (newOptions.cornersSquareOptions.gradient) {
            newOptions.cornersSquareOptions.gradient = sanitizeGradient(newOptions.cornersSquareOptions.gradient);
        }
    }
    if (newOptions.cornersDotOptions) {
        newOptions.cornersDotOptions = __assign({}, newOptions.cornersDotOptions);
        if (newOptions.cornersDotOptions.gradient) {
            newOptions.cornersDotOptions.gradient = sanitizeGradient(newOptions.cornersDotOptions.gradient);
        }
    }
    if (newOptions.backgroundOptions) {
        newOptions.backgroundOptions = __assign({}, newOptions.backgroundOptions);
        if (newOptions.backgroundOptions.gradient) {
            newOptions.backgroundOptions.gradient = sanitizeGradient(newOptions.backgroundOptions.gradient);
        }
    }
    return newOptions;
}


/***/ }),

/***/ "./src/types/index.ts":
/*!****************************!*\
  !*** ./src/types/index.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cornerDotTypes: () => (/* reexport safe */ _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_2__["default"]),
/* harmony export */   cornerSquareTypes: () => (/* reexport safe */ _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   dotTypes: () => (/* reexport safe */ _constants_dotTypes__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   drawTypes: () => (/* reexport safe */ _constants_drawTypes__WEBPACK_IMPORTED_MODULE_8__["default"]),
/* harmony export */   errorCorrectionLevels: () => (/* reexport safe */ _constants_errorCorrectionLevels__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   errorCorrectionPercents: () => (/* reexport safe */ _constants_errorCorrectionPercents__WEBPACK_IMPORTED_MODULE_5__["default"]),
/* harmony export */   modes: () => (/* reexport safe */ _constants_modes__WEBPACK_IMPORTED_MODULE_6__["default"]),
/* harmony export */   qrTypes: () => (/* reexport safe */ _constants_qrTypes__WEBPACK_IMPORTED_MODULE_7__["default"])
/* harmony export */ });
/* harmony import */ var _core_QRCodeStyling__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core/QRCodeStyling */ "./src/core/QRCodeStyling.ts");
/* harmony import */ var _constants_dotTypes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants/dotTypes */ "./src/constants/dotTypes.ts");
/* harmony import */ var _constants_cornerDotTypes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants/cornerDotTypes */ "./src/constants/cornerDotTypes.ts");
/* harmony import */ var _constants_cornerSquareTypes__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./constants/cornerSquareTypes */ "./src/constants/cornerSquareTypes.ts");
/* harmony import */ var _constants_errorCorrectionLevels__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./constants/errorCorrectionLevels */ "./src/constants/errorCorrectionLevels.ts");
/* harmony import */ var _constants_errorCorrectionPercents__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./constants/errorCorrectionPercents */ "./src/constants/errorCorrectionPercents.ts");
/* harmony import */ var _constants_modes__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./constants/modes */ "./src/constants/modes.ts");
/* harmony import */ var _constants_qrTypes__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./constants/qrTypes */ "./src/constants/qrTypes.ts");
/* harmony import */ var _constants_drawTypes__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./constants/drawTypes */ "./src/constants/drawTypes.ts");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./types */ "./src/types/index.ts");











/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_core_QRCodeStyling__WEBPACK_IMPORTED_MODULE_0__["default"]);

})();

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQztBQUNoQztBQUNBLGdDQUFnQzs7QUFFaEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNCQUFzQix3QkFBd0I7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxRQUFROztBQUVSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsUUFBUTs7QUFFUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUEsd0JBQXdCLG1CQUFtQjtBQUMzQywwQkFBMEIsbUJBQW1COztBQUU3QztBQUNBOztBQUVBLDJCQUEyQixRQUFROztBQUVuQztBQUNBO0FBQ0E7O0FBRUEsNkJBQTZCLFFBQVE7O0FBRXJDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLHdCQUF3Qix1QkFBdUI7QUFDL0MsMEJBQTBCLHVCQUF1QjtBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSx3QkFBd0IsbUJBQW1CO0FBQzNDLDBCQUEwQix1QkFBdUI7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSx3QkFBd0IsbUJBQW1CO0FBQzNDLDBCQUEwQix1QkFBdUI7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSx3QkFBd0IsbUJBQW1CO0FBQzNDLDBCQUEwQixtQkFBbUI7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esb0JBQW9CLE9BQU87QUFDM0I7QUFDQTtBQUNBLG9CQUFvQixTQUFTO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsU0FBUztBQUM3QjtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IseUJBQXlCO0FBQy9DO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxzQkFBc0IsdUJBQXVCO0FBQzdDLHdCQUF3QixtQkFBbUI7QUFDM0M7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0Esc0JBQXNCLHVCQUF1QjtBQUM3QztBQUNBOztBQUVBLHNCQUFzQixtQkFBbUI7QUFDekM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxzQkFBc0IsWUFBWTs7QUFFbEM7QUFDQTtBQUNBOztBQUVBLHdCQUF3QixXQUFXO0FBQ25DO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxzQkFBc0IsWUFBWTtBQUNsQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNCQUFzQixjQUFjO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0JBQXNCLG1CQUFtQjtBQUN6QztBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixTQUFTO0FBQy9CO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNCQUFzQixjQUFjO0FBQ3BDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLG1CQUFtQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsWUFBWTtBQUNwQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBLDJCQUEyQjtBQUMzQjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHdCQUF3QjtBQUN4Qjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsc0JBQXNCLGVBQWU7QUFDckM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxVQUFVOztBQUVWOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG9CQUFvQixZQUFZO0FBQ2hDLHNCQUFzQixXQUFXO0FBQ2pDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxvQkFBb0Isa0JBQWtCO0FBQ3RDO0FBQ0E7QUFDQTs7QUFFQSwyQkFBMkI7QUFDM0I7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixnQkFBZ0I7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxDQUFDOztBQUVEO0FBQ0EsTUFBTSxJQUEwQztBQUNoRCxNQUFNLGlDQUFPLEVBQUUsb0NBQUUsT0FBTztBQUFBO0FBQUE7QUFBQSxrR0FBQztBQUN6QixJQUFJLEtBQUssRUFFTjtBQUNILENBQUM7QUFDRDtBQUNBLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0dkVELGlFQUFlO0lBQ2IsR0FBRyxFQUFFLEtBQUs7SUFDVixNQUFNLEVBQUUsUUFBUTtDQUNDLEVBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUNIcEIsaUVBQWU7SUFDYixHQUFHLEVBQUUsS0FBSztJQUNWLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLFlBQVksRUFBRSxlQUFlO0NBQ1QsRUFBQzs7Ozs7Ozs7Ozs7Ozs7OztBQ0p2QixpRUFBZTtJQUNiLElBQUksRUFBRSxNQUFNO0lBQ1osT0FBTyxFQUFFLFNBQVM7SUFDbEIsTUFBTSxFQUFFLFFBQVE7SUFDaEIsYUFBYSxFQUFFLGdCQUFnQjtJQUMvQixNQUFNLEVBQUUsUUFBUTtJQUNoQixZQUFZLEVBQUUsZUFBZTtDQUNsQixFQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0FDUGQsaUVBQWU7SUFDYixNQUFNLEVBQUUsUUFBUTtJQUNoQixHQUFHLEVBQUUsS0FBSztDQUNFLEVBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUNDZixpRUFBZTtJQUNiLENBQUMsRUFBRSxHQUFHO0lBQ04sQ0FBQyxFQUFFLEdBQUc7SUFDTixDQUFDLEVBQUUsR0FBRztJQUNOLENBQUMsRUFBRSxHQUFHO0NBQ2tCLEVBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUNQM0IsaUVBQWU7SUFDYixDQUFDLEVBQUUsSUFBSTtJQUNQLENBQUMsRUFBRSxJQUFJO0lBQ1AsQ0FBQyxFQUFFLElBQUk7SUFDUCxDQUFDLEVBQUUsR0FBRztDQUNvQixFQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0FDUDdCLGlFQUFlO0lBQ2IsTUFBTSxFQUFFLFFBQVE7SUFDaEIsTUFBTSxFQUFFLFFBQVE7Q0FDQSxFQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0FDQ25CLGlFQUFlO0lBQ2IsT0FBTyxFQUFFLFNBQVM7SUFDbEIsWUFBWSxFQUFFLGNBQWM7SUFDNUIsSUFBSSxFQUFFLE1BQU07SUFDWixLQUFLLEVBQUUsT0FBTztDQUNOLEVBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUNMWCxJQUFNLE9BQU8sR0FBYSxFQUFFLENBQUM7QUFFN0IsS0FBSyxJQUFJLElBQUksR0FBRyxDQUFDLEVBQUUsSUFBSSxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRTtJQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBa0IsQ0FBQztDQUNwQztBQUVELHdCQUF3QjtBQUV4QixZQUFZO0FBQ1osWUFBWTtBQUNaLFlBQVk7QUFDWixVQUFVO0FBQ1YsYUFBYTtBQUNiLElBQUk7QUFFSixpRUFBZSxPQUFPLEVBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNyQnNDO0FBQ2M7QUFDM0I7QUFDMkI7QUFDVDtBQUVYO0FBR3ZELElBQU0sVUFBVSxHQUFHO0lBQ2pCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ3RCLENBQUM7QUFFRixJQUFNLE9BQU8sR0FBRztJQUNkLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JC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Q0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUN0RSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsQ0FBQztnQkFDeEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxHQUFHLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMvRCxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDeEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzdELE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDO2dCQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLEdBQUcsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDcEUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsR0FBRyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFekMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEdBQUcsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUN0RSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsQ0FBQztnQkFDeEMsT0FBTyxDQUFDLEdBQUcs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Q0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ05pRDtBQUNMO0FBQ1k7QUFDTTtBQUNRO0FBQ0k7QUFDcEM7QUFDSTtBQUNJO0FBRXRCO0FBV3RCO0FBRUYsaUVBQWUsMkRBQWEsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL1FSQ29kZVN0eWxpbmcvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9ub2RlX21vZHVsZXMvcXJjb2RlLWdlbmVyYXRvci9xcmNvZGUuanMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9jb25zdGFudHMvY29ybmVyRG90VHlwZXMudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9jb25zdGFudHMvY29ybmVyU3F1YXJlVHlwZXMudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9jb25zdGFudHMvZG90VHlwZXMudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9jb25zdGFudHMvZHJhd1R5cGVzLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvY29uc3RhbnRzL2Vycm9yQ29ycmVjdGlvbkxldmVscy50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL2NvbnN0YW50cy9lcnJvckNvcnJlY3Rpb25QZXJjZW50cy50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL2NvbnN0YW50cy9ncmFkaWVudFR5cGVzLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvY29uc3RhbnRzL21vZGVzLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvY29uc3RhbnRzL3FyVHlwZXMudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9jb3JlL1FSQ2FudmFzLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvY29yZS9RUkNvZGVTdHlsaW5nLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvY29yZS9RUk9wdGlvbnMudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy9jb3JlL1FSU1ZHLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvZmlndXJlcy9jb3JuZXJEb3QvY2FudmFzL1FSQ29ybmVyRG90LnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvZmlndXJlcy9jb3JuZXJEb3Qvc3ZnL1FSQ29ybmVyRG90LnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvZmlndXJlcy9jb3JuZXJTcXVhcmUvY2FudmFzL1FSQ29ybmVyU3F1YXJlLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvZmlndXJlcy9jb3JuZXJTcXVhcmUvc3ZnL1FSQ29ybmVyU3F1YXJlLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvZmlndXJlcy9kb3QvY2FudmFzL1FSRG90LnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvZmlndXJlcy9kb3Qvc3ZnL1FSRG90LnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvdG9vbHMvY2FsY3VsYXRlSW1hZ2VTaXplLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvdG9vbHMvZG93bmxvYWRVUkkudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy90b29scy9nZXRNb2RlLnRzIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvLi9zcmMvdG9vbHMvbWVyZ2UudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy90b29scy9zYW5pdGl6ZU9wdGlvbnMudHMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy8uL3NyYy90eXBlcy9pbmRleC50cyIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vUVJDb2RlU3R5bGluZy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL1FSQ29kZVN0eWxpbmcvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9RUkNvZGVTdHlsaW5nLy4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIlFSQ29kZVN0eWxpbmdcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wiUVJDb2RlU3R5bGluZ1wiXSA9IGZhY3RvcnkoKTtcbn0pKHRoaXMsICgpID0+IHtcbnJldHVybiAiLCIvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy9cbi8vIFFSIENvZGUgR2VuZXJhdG9yIGZvciBKYXZhU2NyaXB0XG4vL1xuLy8gQ29weXJpZ2h0IChjKSAyMDA5IEthenVoaWtvIEFyYXNlXG4vL1xuLy8gVVJMOiBodHRwOi8vd3d3LmQtcHJvamVjdC5jb20vXG4vL1xuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxuLy8gIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4vL1xuLy8gVGhlIHdvcmQgJ1FSIENvZGUnIGlzIHJlZ2lzdGVyZWQgdHJhZGVtYXJrIG9mXG4vLyBERU5TTyBXQVZFIElOQ09SUE9SQVRFRFxuLy8gIGh0dHA6Ly93d3cuZGVuc28td2F2ZS5jb20vcXJjb2RlL2ZhcXBhdGVudC1lLmh0bWxcbi8vXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgcXJjb2RlID0gZnVuY3Rpb24oKSB7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gcXJjb2RlXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLyoqXG4gICAqIHFyY29kZVxuICAgKiBAcGFyYW0gdHlwZU51bWJlciAxIHRvIDQwXG4gICAqIEBwYXJhbSBlcnJvckNvcnJlY3Rpb25MZXZlbCAnTCcsJ00nLCdRJywnSCdcbiAgICovXG4gIHZhciBxcmNvZGUgPSBmdW5jdGlvbih0eXBlTnVtYmVyLCBlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xuXG4gICAgdmFyIFBBRDAgPSAweEVDO1xuICAgIHZhciBQQUQxID0gMHgxMTtcblxuICAgIHZhciBfdHlwZU51bWJlciA9IHR5cGVOdW1iZXI7XG4gICAgdmFyIF9lcnJvckNvcnJlY3Rpb25MZXZlbCA9IFFSRXJyb3JDb3JyZWN0aW9uTGV2ZWxbZXJyb3JDb3JyZWN0aW9uTGV2ZWxdO1xuICAgIHZhciBfbW9kdWxlcyA9IG51bGw7XG4gICAgdmFyIF9tb2R1bGVDb3VudCA9IDA7XG4gICAgdmFyIF9kYXRhQ2FjaGUgPSBudWxsO1xuICAgIHZhciBfZGF0YUxpc3QgPSBbXTtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgdmFyIG1ha2VJbXBsID0gZnVuY3Rpb24odGVzdCwgbWFza1BhdHRlcm4pIHtcblxuICAgICAgX21vZHVsZUNvdW50ID0gX3R5cGVOdW1iZXIgKiA0ICsgMTc7XG4gICAgICBfbW9kdWxlcyA9IGZ1bmN0aW9uKG1vZHVsZUNvdW50KSB7XG4gICAgICAgIHZhciBtb2R1bGVzID0gbmV3IEFycmF5KG1vZHVsZUNvdW50KTtcbiAgICAgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgbW9kdWxlQ291bnQ7IHJvdyArPSAxKSB7XG4gICAgICAgICAgbW9kdWxlc1tyb3ddID0gbmV3IEFycmF5KG1vZHVsZUNvdW50KTtcbiAgICAgICAgICBmb3IgKHZhciBjb2wgPSAwOyBjb2wgPCBtb2R1bGVDb3VudDsgY29sICs9IDEpIHtcbiAgICAgICAgICAgIG1vZHVsZXNbcm93XVtjb2xdID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1vZHVsZXM7XG4gICAgICB9KF9tb2R1bGVDb3VudCk7XG5cbiAgICAgIHNldHVwUG9zaXRpb25Qcm9iZVBhdHRlcm4oMCwgMCk7XG4gICAgICBzZXR1cFBvc2l0aW9uUHJvYmVQYXR0ZXJuKF9tb2R1bGVDb3VudCAtIDcsIDApO1xuICAgICAgc2V0dXBQb3NpdGlvblByb2JlUGF0dGVybigwLCBfbW9kdWxlQ291bnQgLSA3KTtcbiAgICAgIHNldHVwUG9zaXRpb25BZGp1c3RQYXR0ZXJuKCk7XG4gICAgICBzZXR1cFRpbWluZ1BhdHRlcm4oKTtcbiAgICAgIHNldHVwVHlwZUluZm8odGVzdCwgbWFza1BhdHRlcm4pO1xuXG4gICAgICBpZiAoX3R5cGVOdW1iZXIgPj0gNykge1xuICAgICAgICBzZXR1cFR5cGVOdW1iZXIodGVzdCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChfZGF0YUNhY2hlID09IG51bGwpIHtcbiAgICAgICAgX2RhdGFDYWNoZSA9IGNyZWF0ZURhdGEoX3R5cGVOdW1iZXIsIF9lcnJvckNvcnJlY3Rpb25MZXZlbCwgX2RhdGFMaXN0KTtcbiAgICAgIH1cblxuICAgICAgbWFwRGF0YShfZGF0YUNhY2hlLCBtYXNrUGF0dGVybik7XG4gICAgfTtcblxuICAgIHZhciBzZXR1cFBvc2l0aW9uUHJvYmVQYXR0ZXJuID0gZnVuY3Rpb24ocm93LCBjb2wpIHtcblxuICAgICAgZm9yICh2YXIgciA9IC0xOyByIDw9IDc7IHIgKz0gMSkge1xuXG4gICAgICAgIGlmIChyb3cgKyByIDw9IC0xIHx8IF9tb2R1bGVDb3VudCA8PSByb3cgKyByKSBjb250aW51ZTtcblxuICAgICAgICBmb3IgKHZhciBjID0gLTE7IGMgPD0gNzsgYyArPSAxKSB7XG5cbiAgICAgICAgICBpZiAoY29sICsgYyA8PSAtMSB8fCBfbW9kdWxlQ291bnQgPD0gY29sICsgYykgY29udGludWU7XG5cbiAgICAgICAgICBpZiAoICgwIDw9IHIgJiYgciA8PSA2ICYmIChjID09IDAgfHwgYyA9PSA2KSApXG4gICAgICAgICAgICAgIHx8ICgwIDw9IGMgJiYgYyA8PSA2ICYmIChyID09IDAgfHwgciA9PSA2KSApXG4gICAgICAgICAgICAgIHx8ICgyIDw9IHIgJiYgciA8PSA0ICYmIDIgPD0gYyAmJiBjIDw9IDQpICkge1xuICAgICAgICAgICAgX21vZHVsZXNbcm93ICsgcl1bY29sICsgY10gPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfbW9kdWxlc1tyb3cgKyByXVtjb2wgKyBjXSA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZ2V0QmVzdE1hc2tQYXR0ZXJuID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBtaW5Mb3N0UG9pbnQgPSAwO1xuICAgICAgdmFyIHBhdHRlcm4gPSAwO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDg7IGkgKz0gMSkge1xuXG4gICAgICAgIG1ha2VJbXBsKHRydWUsIGkpO1xuXG4gICAgICAgIHZhciBsb3N0UG9pbnQgPSBRUlV0aWwuZ2V0TG9zdFBvaW50KF90aGlzKTtcblxuICAgICAgICBpZiAoaSA9PSAwIHx8IG1pbkxvc3RQb2ludCA+IGxvc3RQb2ludCkge1xuICAgICAgICAgIG1pbkxvc3RQb2ludCA9IGxvc3RQb2ludDtcbiAgICAgICAgICBwYXR0ZXJuID0gaTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGF0dGVybjtcbiAgICB9O1xuXG4gICAgdmFyIHNldHVwVGltaW5nUGF0dGVybiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICBmb3IgKHZhciByID0gODsgciA8IF9tb2R1bGVDb3VudCAtIDg7IHIgKz0gMSkge1xuICAgICAgICBpZiAoX21vZHVsZXNbcl1bNl0gIT0gbnVsbCkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIF9tb2R1bGVzW3JdWzZdID0gKHIgJSAyID09IDApO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBjID0gODsgYyA8IF9tb2R1bGVDb3VudCAtIDg7IGMgKz0gMSkge1xuICAgICAgICBpZiAoX21vZHVsZXNbNl1bY10gIT0gbnVsbCkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIF9tb2R1bGVzWzZdW2NdID0gKGMgJSAyID09IDApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgc2V0dXBQb3NpdGlvbkFkanVzdFBhdHRlcm4gPSBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHBvcyA9IFFSVXRpbC5nZXRQYXR0ZXJuUG9zaXRpb24oX3R5cGVOdW1iZXIpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvcy5sZW5ndGg7IGkgKz0gMSkge1xuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcG9zLmxlbmd0aDsgaiArPSAxKSB7XG5cbiAgICAgICAgICB2YXIgcm93ID0gcG9zW2ldO1xuICAgICAgICAgIHZhciBjb2wgPSBwb3Nbal07XG5cbiAgICAgICAgICBpZiAoX21vZHVsZXNbcm93XVtjb2xdICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGZvciAodmFyIHIgPSAtMjsgciA8PSAyOyByICs9IDEpIHtcblxuICAgICAgICAgICAgZm9yICh2YXIgYyA9IC0yOyBjIDw9IDI7IGMgKz0gMSkge1xuXG4gICAgICAgICAgICAgIGlmIChyID09IC0yIHx8IHIgPT0gMiB8fCBjID09IC0yIHx8IGMgPT0gMlxuICAgICAgICAgICAgICAgICAgfHwgKHIgPT0gMCAmJiBjID09IDApICkge1xuICAgICAgICAgICAgICAgIF9tb2R1bGVzW3JvdyArIHJdW2NvbCArIGNdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfbW9kdWxlc1tyb3cgKyByXVtjb2wgKyBjXSA9IGZhbHNlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBzZXR1cFR5cGVOdW1iZXIgPSBmdW5jdGlvbih0ZXN0KSB7XG5cbiAgICAgIHZhciBiaXRzID0gUVJVdGlsLmdldEJDSFR5cGVOdW1iZXIoX3R5cGVOdW1iZXIpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE4OyBpICs9IDEpIHtcbiAgICAgICAgdmFyIG1vZCA9ICghdGVzdCAmJiAoIChiaXRzID4+IGkpICYgMSkgPT0gMSk7XG4gICAgICAgIF9tb2R1bGVzW01hdGguZmxvb3IoaSAvIDMpXVtpICUgMyArIF9tb2R1bGVDb3VudCAtIDggLSAzXSA9IG1vZDtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxODsgaSArPSAxKSB7XG4gICAgICAgIHZhciBtb2QgPSAoIXRlc3QgJiYgKCAoYml0cyA+PiBpKSAmIDEpID09IDEpO1xuICAgICAgICBfbW9kdWxlc1tpICUgMyArIF9tb2R1bGVDb3VudCAtIDggLSAzXVtNYXRoLmZsb29yKGkgLyAzKV0gPSBtb2Q7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBzZXR1cFR5cGVJbmZvID0gZnVuY3Rpb24odGVzdCwgbWFza1BhdHRlcm4pIHtcblxuICAgICAgdmFyIGRhdGEgPSAoX2Vycm9yQ29ycmVjdGlvbkxldmVsIDw8IDMpIHwgbWFza1BhdHRlcm47XG4gICAgICB2YXIgYml0cyA9IFFSVXRpbC5nZXRCQ0hUeXBlSW5mbyhkYXRhKTtcblxuICAgICAgLy8gdmVydGljYWxcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTU7IGkgKz0gMSkge1xuXG4gICAgICAgIHZhciBtb2QgPSAoIXRlc3QgJiYgKCAoYml0cyA+PiBpKSAmIDEpID09IDEpO1xuXG4gICAgICAgIGlmIChpIDwgNikge1xuICAgICAgICAgIF9tb2R1bGVzW2ldWzhdID0gbW9kO1xuICAgICAgICB9IGVsc2UgaWYgKGkgPCA4KSB7XG4gICAgICAgICAgX21vZHVsZXNbaSArIDFdWzhdID0gbW9kO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9tb2R1bGVzW19tb2R1bGVDb3VudCAtIDE1ICsgaV1bOF0gPSBtb2Q7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gaG9yaXpvbnRhbFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNTsgaSArPSAxKSB7XG5cbiAgICAgICAgdmFyIG1vZCA9ICghdGVzdCAmJiAoIChiaXRzID4+IGkpICYgMSkgPT0gMSk7XG5cbiAgICAgICAgaWYgKGkgPCA4KSB7XG4gICAgICAgICAgX21vZHVsZXNbOF1bX21vZHVsZUNvdW50IC0gaSAtIDFdID0gbW9kO1xuICAgICAgICB9IGVsc2UgaWYgKGkgPCA5KSB7XG4gICAgICAgICAgX21vZHVsZXNbOF1bMTUgLSBpIC0gMSArIDFdID0gbW9kO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9tb2R1bGVzWzhdWzE1IC0gaSAtIDFdID0gbW9kO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGZpeGVkIG1vZHVsZVxuICAgICAgX21vZHVsZXNbX21vZHVsZUNvdW50IC0gOF1bOF0gPSAoIXRlc3QpO1xuICAgIH07XG5cbiAgICB2YXIgbWFwRGF0YSA9IGZ1bmN0aW9uKGRhdGEsIG1hc2tQYXR0ZXJuKSB7XG5cbiAgICAgIHZhciBpbmMgPSAtMTtcbiAgICAgIHZhciByb3cgPSBfbW9kdWxlQ291bnQgLSAxO1xuICAgICAgdmFyIGJpdEluZGV4ID0gNztcbiAgICAgIHZhciBieXRlSW5kZXggPSAwO1xuICAgICAgdmFyIG1hc2tGdW5jID0gUVJVdGlsLmdldE1hc2tGdW5jdGlvbihtYXNrUGF0dGVybik7XG5cbiAgICAgIGZvciAodmFyIGNvbCA9IF9tb2R1bGVDb3VudCAtIDE7IGNvbCA+IDA7IGNvbCAtPSAyKSB7XG5cbiAgICAgICAgaWYgKGNvbCA9PSA2KSBjb2wgLT0gMTtcblxuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuXG4gICAgICAgICAgZm9yICh2YXIgYyA9IDA7IGMgPCAyOyBjICs9IDEpIHtcblxuICAgICAgICAgICAgaWYgKF9tb2R1bGVzW3Jvd11bY29sIC0gY10gPT0gbnVsbCkge1xuXG4gICAgICAgICAgICAgIHZhciBkYXJrID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgaWYgKGJ5dGVJbmRleCA8IGRhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZGFyayA9ICggKCAoZGF0YVtieXRlSW5kZXhdID4+PiBiaXRJbmRleCkgJiAxKSA9PSAxKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHZhciBtYXNrID0gbWFza0Z1bmMocm93LCBjb2wgLSBjKTtcblxuICAgICAgICAgICAgICBpZiAobWFzaykge1xuICAgICAgICAgICAgICAgIGRhcmsgPSAhZGFyaztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIF9tb2R1bGVzW3Jvd11bY29sIC0gY10gPSBkYXJrO1xuICAgICAgICAgICAgICBiaXRJbmRleCAtPSAxO1xuXG4gICAgICAgICAgICAgIGlmIChiaXRJbmRleCA9PSAtMSkge1xuICAgICAgICAgICAgICAgIGJ5dGVJbmRleCArPSAxO1xuICAgICAgICAgICAgICAgIGJpdEluZGV4ID0gNztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJvdyArPSBpbmM7XG5cbiAgICAgICAgICBpZiAocm93IDwgMCB8fCBfbW9kdWxlQ291bnQgPD0gcm93KSB7XG4gICAgICAgICAgICByb3cgLT0gaW5jO1xuICAgICAgICAgICAgaW5jID0gLWluYztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgY3JlYXRlQnl0ZXMgPSBmdW5jdGlvbihidWZmZXIsIHJzQmxvY2tzKSB7XG5cbiAgICAgIHZhciBvZmZzZXQgPSAwO1xuXG4gICAgICB2YXIgbWF4RGNDb3VudCA9IDA7XG4gICAgICB2YXIgbWF4RWNDb3VudCA9IDA7XG5cbiAgICAgIHZhciBkY2RhdGEgPSBuZXcgQXJyYXkocnNCbG9ja3MubGVuZ3RoKTtcbiAgICAgIHZhciBlY2RhdGEgPSBuZXcgQXJyYXkocnNCbG9ja3MubGVuZ3RoKTtcblxuICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCByc0Jsb2Nrcy5sZW5ndGg7IHIgKz0gMSkge1xuXG4gICAgICAgIHZhciBkY0NvdW50ID0gcnNCbG9ja3Nbcl0uZGF0YUNvdW50O1xuICAgICAgICB2YXIgZWNDb3VudCA9IHJzQmxvY2tzW3JdLnRvdGFsQ291bnQgLSBkY0NvdW50O1xuXG4gICAgICAgIG1heERjQ291bnQgPSBNYXRoLm1heChtYXhEY0NvdW50LCBkY0NvdW50KTtcbiAgICAgICAgbWF4RWNDb3VudCA9IE1hdGgubWF4KG1heEVjQ291bnQsIGVjQ291bnQpO1xuXG4gICAgICAgIGRjZGF0YVtyXSA9IG5ldyBBcnJheShkY0NvdW50KTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRjZGF0YVtyXS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgIGRjZGF0YVtyXVtpXSA9IDB4ZmYgJiBidWZmZXIuZ2V0QnVmZmVyKClbaSArIG9mZnNldF07XG4gICAgICAgIH1cbiAgICAgICAgb2Zmc2V0ICs9IGRjQ291bnQ7XG5cbiAgICAgICAgdmFyIHJzUG9seSA9IFFSVXRpbC5nZXRFcnJvckNvcnJlY3RQb2x5bm9taWFsKGVjQ291bnQpO1xuICAgICAgICB2YXIgcmF3UG9seSA9IHFyUG9seW5vbWlhbChkY2RhdGFbcl0sIHJzUG9seS5nZXRMZW5ndGgoKSAtIDEpO1xuXG4gICAgICAgIHZhciBtb2RQb2x5ID0gcmF3UG9seS5tb2QocnNQb2x5KTtcbiAgICAgICAgZWNkYXRhW3JdID0gbmV3IEFycmF5KHJzUG9seS5nZXRMZW5ndGgoKSAtIDEpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVjZGF0YVtyXS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgIHZhciBtb2RJbmRleCA9IGkgKyBtb2RQb2x5LmdldExlbmd0aCgpIC0gZWNkYXRhW3JdLmxlbmd0aDtcbiAgICAgICAgICBlY2RhdGFbcl1baV0gPSAobW9kSW5kZXggPj0gMCk/IG1vZFBvbHkuZ2V0QXQobW9kSW5kZXgpIDogMDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgdG90YWxDb2RlQ291bnQgPSAwO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByc0Jsb2Nrcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0b3RhbENvZGVDb3VudCArPSByc0Jsb2Nrc1tpXS50b3RhbENvdW50O1xuICAgICAgfVxuXG4gICAgICB2YXIgZGF0YSA9IG5ldyBBcnJheSh0b3RhbENvZGVDb3VudCk7XG4gICAgICB2YXIgaW5kZXggPSAwO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1heERjQ291bnQ7IGkgKz0gMSkge1xuICAgICAgICBmb3IgKHZhciByID0gMDsgciA8IHJzQmxvY2tzLmxlbmd0aDsgciArPSAxKSB7XG4gICAgICAgICAgaWYgKGkgPCBkY2RhdGFbcl0ubGVuZ3RoKSB7XG4gICAgICAgICAgICBkYXRhW2luZGV4XSA9IGRjZGF0YVtyXVtpXTtcbiAgICAgICAgICAgIGluZGV4ICs9IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWF4RWNDb3VudDsgaSArPSAxKSB7XG4gICAgICAgIGZvciAodmFyIHIgPSAwOyByIDwgcnNCbG9ja3MubGVuZ3RoOyByICs9IDEpIHtcbiAgICAgICAgICBpZiAoaSA8IGVjZGF0YVtyXS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRhdGFbaW5kZXhdID0gZWNkYXRhW3JdW2ldO1xuICAgICAgICAgICAgaW5kZXggKz0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfTtcblxuICAgIHZhciBjcmVhdGVEYXRhID0gZnVuY3Rpb24odHlwZU51bWJlciwgZXJyb3JDb3JyZWN0aW9uTGV2ZWwsIGRhdGFMaXN0KSB7XG5cbiAgICAgIHZhciByc0Jsb2NrcyA9IFFSUlNCbG9jay5nZXRSU0Jsb2Nrcyh0eXBlTnVtYmVyLCBlcnJvckNvcnJlY3Rpb25MZXZlbCk7XG5cbiAgICAgIHZhciBidWZmZXIgPSBxckJpdEJ1ZmZlcigpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGFMaXN0Lmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHZhciBkYXRhID0gZGF0YUxpc3RbaV07XG4gICAgICAgIGJ1ZmZlci5wdXQoZGF0YS5nZXRNb2RlKCksIDQpO1xuICAgICAgICBidWZmZXIucHV0KGRhdGEuZ2V0TGVuZ3RoKCksIFFSVXRpbC5nZXRMZW5ndGhJbkJpdHMoZGF0YS5nZXRNb2RlKCksIHR5cGVOdW1iZXIpICk7XG4gICAgICAgIGRhdGEud3JpdGUoYnVmZmVyKTtcbiAgICAgIH1cblxuICAgICAgLy8gY2FsYyBudW0gbWF4IGRhdGEuXG4gICAgICB2YXIgdG90YWxEYXRhQ291bnQgPSAwO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByc0Jsb2Nrcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0b3RhbERhdGFDb3VudCArPSByc0Jsb2Nrc1tpXS5kYXRhQ291bnQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgPiB0b3RhbERhdGFDb3VudCAqIDgpIHtcbiAgICAgICAgdGhyb3cgJ2NvZGUgbGVuZ3RoIG92ZXJmbG93LiAoJ1xuICAgICAgICAgICsgYnVmZmVyLmdldExlbmd0aEluQml0cygpXG4gICAgICAgICAgKyAnPidcbiAgICAgICAgICArIHRvdGFsRGF0YUNvdW50ICogOFxuICAgICAgICAgICsgJyknO1xuICAgICAgfVxuXG4gICAgICAvLyBlbmQgY29kZVxuICAgICAgaWYgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSArIDQgPD0gdG90YWxEYXRhQ291bnQgKiA4KSB7XG4gICAgICAgIGJ1ZmZlci5wdXQoMCwgNCk7XG4gICAgICB9XG5cbiAgICAgIC8vIHBhZGRpbmdcbiAgICAgIHdoaWxlIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgJSA4ICE9IDApIHtcbiAgICAgICAgYnVmZmVyLnB1dEJpdChmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHBhZGRpbmdcbiAgICAgIHdoaWxlICh0cnVlKSB7XG5cbiAgICAgICAgaWYgKGJ1ZmZlci5nZXRMZW5ndGhJbkJpdHMoKSA+PSB0b3RhbERhdGFDb3VudCAqIDgpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBidWZmZXIucHV0KFBBRDAsIDgpO1xuXG4gICAgICAgIGlmIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgPj0gdG90YWxEYXRhQ291bnQgKiA4KSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYnVmZmVyLnB1dChQQUQxLCA4KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNyZWF0ZUJ5dGVzKGJ1ZmZlciwgcnNCbG9ja3MpO1xuICAgIH07XG5cbiAgICBfdGhpcy5hZGREYXRhID0gZnVuY3Rpb24oZGF0YSwgbW9kZSkge1xuXG4gICAgICBtb2RlID0gbW9kZSB8fCAnQnl0ZSc7XG5cbiAgICAgIHZhciBuZXdEYXRhID0gbnVsbDtcblxuICAgICAgc3dpdGNoKG1vZGUpIHtcbiAgICAgIGNhc2UgJ051bWVyaWMnIDpcbiAgICAgICAgbmV3RGF0YSA9IHFyTnVtYmVyKGRhdGEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0FscGhhbnVtZXJpYycgOlxuICAgICAgICBuZXdEYXRhID0gcXJBbHBoYU51bShkYXRhKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdCeXRlJyA6XG4gICAgICAgIG5ld0RhdGEgPSBxcjhCaXRCeXRlKGRhdGEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0thbmppJyA6XG4gICAgICAgIG5ld0RhdGEgPSBxckthbmppKGRhdGEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQgOlxuICAgICAgICB0aHJvdyAnbW9kZTonICsgbW9kZTtcbiAgICAgIH1cblxuICAgICAgX2RhdGFMaXN0LnB1c2gobmV3RGF0YSk7XG4gICAgICBfZGF0YUNhY2hlID0gbnVsbDtcbiAgICB9O1xuXG4gICAgX3RoaXMuaXNEYXJrID0gZnVuY3Rpb24ocm93LCBjb2wpIHtcbiAgICAgIGlmIChyb3cgPCAwIHx8IF9tb2R1bGVDb3VudCA8PSByb3cgfHwgY29sIDwgMCB8fCBfbW9kdWxlQ291bnQgPD0gY29sKSB7XG4gICAgICAgIHRocm93IHJvdyArICcsJyArIGNvbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfbW9kdWxlc1tyb3ddW2NvbF07XG4gICAgfTtcblxuICAgIF90aGlzLmdldE1vZHVsZUNvdW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX21vZHVsZUNvdW50O1xuICAgIH07XG5cbiAgICBfdGhpcy5tYWtlID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoX3R5cGVOdW1iZXIgPCAxKSB7XG4gICAgICAgIHZhciB0eXBlTnVtYmVyID0gMTtcblxuICAgICAgICBmb3IgKDsgdHlwZU51bWJlciA8IDQwOyB0eXBlTnVtYmVyKyspIHtcbiAgICAgICAgICB2YXIgcnNCbG9ja3MgPSBRUlJTQmxvY2suZ2V0UlNCbG9ja3ModHlwZU51bWJlciwgX2Vycm9yQ29ycmVjdGlvbkxldmVsKTtcbiAgICAgICAgICB2YXIgYnVmZmVyID0gcXJCaXRCdWZmZXIoKTtcblxuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX2RhdGFMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IF9kYXRhTGlzdFtpXTtcbiAgICAgICAgICAgIGJ1ZmZlci5wdXQoZGF0YS5nZXRNb2RlKCksIDQpO1xuICAgICAgICAgICAgYnVmZmVyLnB1dChkYXRhLmdldExlbmd0aCgpLCBRUlV0aWwuZ2V0TGVuZ3RoSW5CaXRzKGRhdGEuZ2V0TW9kZSgpLCB0eXBlTnVtYmVyKSApO1xuICAgICAgICAgICAgZGF0YS53cml0ZShidWZmZXIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciB0b3RhbERhdGFDb3VudCA9IDA7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByc0Jsb2Nrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdG90YWxEYXRhQ291bnQgKz0gcnNCbG9ja3NbaV0uZGF0YUNvdW50O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChidWZmZXIuZ2V0TGVuZ3RoSW5CaXRzKCkgPD0gdG90YWxEYXRhQ291bnQgKiA4KSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBfdHlwZU51bWJlciA9IHR5cGVOdW1iZXI7XG4gICAgICB9XG5cbiAgICAgIG1ha2VJbXBsKGZhbHNlLCBnZXRCZXN0TWFza1BhdHRlcm4oKSApO1xuICAgIH07XG5cbiAgICBfdGhpcy5jcmVhdGVUYWJsZVRhZyA9IGZ1bmN0aW9uKGNlbGxTaXplLCBtYXJnaW4pIHtcblxuICAgICAgY2VsbFNpemUgPSBjZWxsU2l6ZSB8fCAyO1xuICAgICAgbWFyZ2luID0gKHR5cGVvZiBtYXJnaW4gPT0gJ3VuZGVmaW5lZCcpPyBjZWxsU2l6ZSAqIDQgOiBtYXJnaW47XG5cbiAgICAgIHZhciBxckh0bWwgPSAnJztcblxuICAgICAgcXJIdG1sICs9ICc8dGFibGUgc3R5bGU9XCInO1xuICAgICAgcXJIdG1sICs9ICcgYm9yZGVyLXdpZHRoOiAwcHg7IGJvcmRlci1zdHlsZTogbm9uZTsnO1xuICAgICAgcXJIdG1sICs9ICcgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsnO1xuICAgICAgcXJIdG1sICs9ICcgcGFkZGluZzogMHB4OyBtYXJnaW46ICcgKyBtYXJnaW4gKyAncHg7JztcbiAgICAgIHFySHRtbCArPSAnXCI+JztcbiAgICAgIHFySHRtbCArPSAnPHRib2R5Pic7XG5cbiAgICAgIGZvciAodmFyIHIgPSAwOyByIDwgX3RoaXMuZ2V0TW9kdWxlQ291bnQoKTsgciArPSAxKSB7XG5cbiAgICAgICAgcXJIdG1sICs9ICc8dHI+JztcblxuICAgICAgICBmb3IgKHZhciBjID0gMDsgYyA8IF90aGlzLmdldE1vZHVsZUNvdW50KCk7IGMgKz0gMSkge1xuICAgICAgICAgIHFySHRtbCArPSAnPHRkIHN0eWxlPVwiJztcbiAgICAgICAgICBxckh0bWwgKz0gJyBib3JkZXItd2lkdGg6IDBweDsgYm9yZGVyLXN0eWxlOiBub25lOyc7XG4gICAgICAgICAgcXJIdG1sICs9ICcgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsnO1xuICAgICAgICAgIHFySHRtbCArPSAnIHBhZGRpbmc6IDBweDsgbWFyZ2luOiAwcHg7JztcbiAgICAgICAgICBxckh0bWwgKz0gJyB3aWR0aDogJyArIGNlbGxTaXplICsgJ3B4Oyc7XG4gICAgICAgICAgcXJIdG1sICs9ICcgaGVpZ2h0OiAnICsgY2VsbFNpemUgKyAncHg7JztcbiAgICAgICAgICBxckh0bWwgKz0gJyBiYWNrZ3JvdW5kLWNvbG9yOiAnO1xuICAgICAgICAgIHFySHRtbCArPSBfdGhpcy5pc0RhcmsociwgYyk/ICcjMDAwMDAwJyA6ICcjZmZmZmZmJztcbiAgICAgICAgICBxckh0bWwgKz0gJzsnO1xuICAgICAgICAgIHFySHRtbCArPSAnXCIvPic7XG4gICAgICAgIH1cblxuICAgICAgICBxckh0bWwgKz0gJzwvdHI+JztcbiAgICAgIH1cblxuICAgICAgcXJIdG1sICs9ICc8L3Rib2R5Pic7XG4gICAgICBxckh0bWwgKz0gJzwvdGFibGU+JztcblxuICAgICAgcmV0dXJuIHFySHRtbDtcbiAgICB9O1xuXG4gICAgX3RoaXMuY3JlYXRlU3ZnVGFnID0gZnVuY3Rpb24oY2VsbFNpemUsIG1hcmdpbiwgYWx0LCB0aXRsZSkge1xuXG4gICAgICB2YXIgb3B0cyA9IHt9O1xuICAgICAgaWYgKHR5cGVvZiBhcmd1bWVudHNbMF0gPT0gJ29iamVjdCcpIHtcbiAgICAgICAgLy8gQ2FsbGVkIGJ5IG9wdGlvbnMuXG4gICAgICAgIG9wdHMgPSBhcmd1bWVudHNbMF07XG4gICAgICAgIC8vIG92ZXJ3cml0ZSBjZWxsU2l6ZSBhbmQgbWFyZ2luLlxuICAgICAgICBjZWxsU2l6ZSA9IG9wdHMuY2VsbFNpemU7XG4gICAgICAgIG1hcmdpbiA9IG9wdHMubWFyZ2luO1xuICAgICAgICBhbHQgPSBvcHRzLmFsdDtcbiAgICAgICAgdGl0bGUgPSBvcHRzLnRpdGxlO1xuICAgICAgfVxuXG4gICAgICBjZWxsU2l6ZSA9IGNlbGxTaXplIHx8IDI7XG4gICAgICBtYXJnaW4gPSAodHlwZW9mIG1hcmdpbiA9PSAndW5kZWZpbmVkJyk/IGNlbGxTaXplICogNCA6IG1hcmdpbjtcblxuICAgICAgLy8gQ29tcG9zZSBhbHQgcHJvcGVydHkgc3Vycm9nYXRlXG4gICAgICBhbHQgPSAodHlwZW9mIGFsdCA9PT0gJ3N0cmluZycpID8ge3RleHQ6IGFsdH0gOiBhbHQgfHwge307XG4gICAgICBhbHQudGV4dCA9IGFsdC50ZXh0IHx8IG51bGw7XG4gICAgICBhbHQuaWQgPSAoYWx0LnRleHQpID8gYWx0LmlkIHx8ICdxcmNvZGUtZGVzY3JpcHRpb24nIDogbnVsbDtcblxuICAgICAgLy8gQ29tcG9zZSB0aXRsZSBwcm9wZXJ0eSBzdXJyb2dhdGVcbiAgICAgIHRpdGxlID0gKHR5cGVvZiB0aXRsZSA9PT0gJ3N0cmluZycpID8ge3RleHQ6IHRpdGxlfSA6IHRpdGxlIHx8IHt9O1xuICAgICAgdGl0bGUudGV4dCA9IHRpdGxlLnRleHQgfHwgbnVsbDtcbiAgICAgIHRpdGxlLmlkID0gKHRpdGxlLnRleHQpID8gdGl0bGUuaWQgfHwgJ3FyY29kZS10aXRsZScgOiBudWxsO1xuXG4gICAgICB2YXIgc2l6ZSA9IF90aGlzLmdldE1vZHVsZUNvdW50KCkgKiBjZWxsU2l6ZSArIG1hcmdpbiAqIDI7XG4gICAgICB2YXIgYywgbWMsIHIsIG1yLCBxclN2Zz0nJywgcmVjdDtcblxuICAgICAgcmVjdCA9ICdsJyArIGNlbGxTaXplICsgJywwIDAsJyArIGNlbGxTaXplICtcbiAgICAgICAgJyAtJyArIGNlbGxTaXplICsgJywwIDAsLScgKyBjZWxsU2l6ZSArICd6ICc7XG5cbiAgICAgIHFyU3ZnICs9ICc8c3ZnIHZlcnNpb249XCIxLjFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCInO1xuICAgICAgcXJTdmcgKz0gIW9wdHMuc2NhbGFibGUgPyAnIHdpZHRoPVwiJyArIHNpemUgKyAncHhcIiBoZWlnaHQ9XCInICsgc2l6ZSArICdweFwiJyA6ICcnO1xuICAgICAgcXJTdmcgKz0gJyB2aWV3Qm94PVwiMCAwICcgKyBzaXplICsgJyAnICsgc2l6ZSArICdcIiAnO1xuICAgICAgcXJTdmcgKz0gJyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPVwieE1pbllNaW4gbWVldFwiJztcbiAgICAgIHFyU3ZnICs9ICh0aXRsZS50ZXh0IHx8IGFsdC50ZXh0KSA/ICcgcm9sZT1cImltZ1wiIGFyaWEtbGFiZWxsZWRieT1cIicgK1xuICAgICAgICAgIGVzY2FwZVhtbChbdGl0bGUuaWQsIGFsdC5pZF0uam9pbignICcpLnRyaW0oKSApICsgJ1wiJyA6ICcnO1xuICAgICAgcXJTdmcgKz0gJz4nO1xuICAgICAgcXJTdmcgKz0gKHRpdGxlLnRleHQpID8gJzx0aXRsZSBpZD1cIicgKyBlc2NhcGVYbWwodGl0bGUuaWQpICsgJ1wiPicgK1xuICAgICAgICAgIGVzY2FwZVhtbCh0aXRsZS50ZXh0KSArICc8L3RpdGxlPicgOiAnJztcbiAgICAgIHFyU3ZnICs9IChhbHQudGV4dCkgPyAnPGRlc2NyaXB0aW9uIGlkPVwiJyArIGVzY2FwZVhtbChhbHQuaWQpICsgJ1wiPicgK1xuICAgICAgICAgIGVzY2FwZVhtbChhbHQudGV4dCkgKyAnPC9kZXNjcmlwdGlvbj4nIDogJyc7XG4gICAgICBxclN2ZyArPSAnPHJlY3Qgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIGZpbGw9XCJ3aGl0ZVwiIGN4PVwiMFwiIGN5PVwiMFwiLz4nO1xuICAgICAgcXJTdmcgKz0gJzxwYXRoIGQ9XCInO1xuXG4gICAgICBmb3IgKHIgPSAwOyByIDwgX3RoaXMuZ2V0TW9kdWxlQ291bnQoKTsgciArPSAxKSB7XG4gICAgICAgIG1yID0gciAqIGNlbGxTaXplICsgbWFyZ2luO1xuICAgICAgICBmb3IgKGMgPSAwOyBjIDwgX3RoaXMuZ2V0TW9kdWxlQ291bnQoKTsgYyArPSAxKSB7XG4gICAgICAgICAgaWYgKF90aGlzLmlzRGFyayhyLCBjKSApIHtcbiAgICAgICAgICAgIG1jID0gYypjZWxsU2l6ZSttYXJnaW47XG4gICAgICAgICAgICBxclN2ZyArPSAnTScgKyBtYyArICcsJyArIG1yICsgcmVjdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcXJTdmcgKz0gJ1wiIHN0cm9rZT1cInRyYW5zcGFyZW50XCIgZmlsbD1cImJsYWNrXCIvPic7XG4gICAgICBxclN2ZyArPSAnPC9zdmc+JztcblxuICAgICAgcmV0dXJuIHFyU3ZnO1xuICAgIH07XG5cbiAgICBfdGhpcy5jcmVhdGVEYXRhVVJMID0gZnVuY3Rpb24oY2VsbFNpemUsIG1hcmdpbikge1xuXG4gICAgICBjZWxsU2l6ZSA9IGNlbGxTaXplIHx8IDI7XG4gICAgICBtYXJnaW4gPSAodHlwZW9mIG1hcmdpbiA9PSAndW5kZWZpbmVkJyk/IGNlbGxTaXplICogNCA6IG1hcmdpbjtcblxuICAgICAgdmFyIHNpemUgPSBfdGhpcy5nZXRNb2R1bGVDb3VudCgpICogY2VsbFNpemUgKyBtYXJnaW4gKiAyO1xuICAgICAgdmFyIG1pbiA9IG1hcmdpbjtcbiAgICAgIHZhciBtYXggPSBzaXplIC0gbWFyZ2luO1xuXG4gICAgICByZXR1cm4gY3JlYXRlRGF0YVVSTChzaXplLCBzaXplLCBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIGlmIChtaW4gPD0geCAmJiB4IDwgbWF4ICYmIG1pbiA8PSB5ICYmIHkgPCBtYXgpIHtcbiAgICAgICAgICB2YXIgYyA9IE1hdGguZmxvb3IoICh4IC0gbWluKSAvIGNlbGxTaXplKTtcbiAgICAgICAgICB2YXIgciA9IE1hdGguZmxvb3IoICh5IC0gbWluKSAvIGNlbGxTaXplKTtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuaXNEYXJrKHIsIGMpPyAwIDogMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH07XG5cbiAgICBfdGhpcy5jcmVhdGVJbWdUYWcgPSBmdW5jdGlvbihjZWxsU2l6ZSwgbWFyZ2luLCBhbHQpIHtcblxuICAgICAgY2VsbFNpemUgPSBjZWxsU2l6ZSB8fCAyO1xuICAgICAgbWFyZ2luID0gKHR5cGVvZiBtYXJnaW4gPT0gJ3VuZGVmaW5lZCcpPyBjZWxsU2l6ZSAqIDQgOiBtYXJnaW47XG5cbiAgICAgIHZhciBzaXplID0gX3RoaXMuZ2V0TW9kdWxlQ291bnQoKSAqIGNlbGxTaXplICsgbWFyZ2luICogMjtcblxuICAgICAgdmFyIGltZyA9ICcnO1xuICAgICAgaW1nICs9ICc8aW1nJztcbiAgICAgIGltZyArPSAnXFx1MDAyMHNyYz1cIic7XG4gICAgICBpbWcgKz0gX3RoaXMuY3JlYXRlRGF0YVVSTChjZWxsU2l6ZSwgbWFyZ2luKTtcbiAgICAgIGltZyArPSAnXCInO1xuICAgICAgaW1nICs9ICdcXHUwMDIwd2lkdGg9XCInO1xuICAgICAgaW1nICs9IHNpemU7XG4gICAgICBpbWcgKz0gJ1wiJztcbiAgICAgIGltZyArPSAnXFx1MDAyMGhlaWdodD1cIic7XG4gICAgICBpbWcgKz0gc2l6ZTtcbiAgICAgIGltZyArPSAnXCInO1xuICAgICAgaWYgKGFsdCkge1xuICAgICAgICBpbWcgKz0gJ1xcdTAwMjBhbHQ9XCInO1xuICAgICAgICBpbWcgKz0gZXNjYXBlWG1sKGFsdCk7XG4gICAgICAgIGltZyArPSAnXCInO1xuICAgICAgfVxuICAgICAgaW1nICs9ICcvPic7XG5cbiAgICAgIHJldHVybiBpbWc7XG4gICAgfTtcblxuICAgIHZhciBlc2NhcGVYbWwgPSBmdW5jdGlvbihzKSB7XG4gICAgICB2YXIgZXNjYXBlZCA9ICcnO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHZhciBjID0gcy5jaGFyQXQoaSk7XG4gICAgICAgIHN3aXRjaChjKSB7XG4gICAgICAgIGNhc2UgJzwnOiBlc2NhcGVkICs9ICcmbHQ7JzsgYnJlYWs7XG4gICAgICAgIGNhc2UgJz4nOiBlc2NhcGVkICs9ICcmZ3Q7JzsgYnJlYWs7XG4gICAgICAgIGNhc2UgJyYnOiBlc2NhcGVkICs9ICcmYW1wOyc7IGJyZWFrO1xuICAgICAgICBjYXNlICdcIic6IGVzY2FwZWQgKz0gJyZxdW90Oyc7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0IDogZXNjYXBlZCArPSBjOyBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGVzY2FwZWQ7XG4gICAgfTtcblxuICAgIHZhciBfY3JlYXRlSGFsZkFTQ0lJID0gZnVuY3Rpb24obWFyZ2luKSB7XG4gICAgICB2YXIgY2VsbFNpemUgPSAxO1xuICAgICAgbWFyZ2luID0gKHR5cGVvZiBtYXJnaW4gPT0gJ3VuZGVmaW5lZCcpPyBjZWxsU2l6ZSAqIDIgOiBtYXJnaW47XG5cbiAgICAgIHZhciBzaXplID0gX3RoaXMuZ2V0TW9kdWxlQ291bnQoKSAqIGNlbGxTaXplICsgbWFyZ2luICogMjtcbiAgICAgIHZhciBtaW4gPSBtYXJnaW47XG4gICAgICB2YXIgbWF4ID0gc2l6ZSAtIG1hcmdpbjtcblxuICAgICAgdmFyIHksIHgsIHIxLCByMiwgcDtcblxuICAgICAgdmFyIGJsb2NrcyA9IHtcbiAgICAgICAgJ+KWiOKWiCc6ICfilognLFxuICAgICAgICAn4paIICc6ICfiloAnLFxuICAgICAgICAnIOKWiCc6ICfiloQnLFxuICAgICAgICAnICAnOiAnICdcbiAgICAgIH07XG5cbiAgICAgIHZhciBibG9ja3NMYXN0TGluZU5vTWFyZ2luID0ge1xuICAgICAgICAn4paI4paIJzogJ+KWgCcsXG4gICAgICAgICfiloggJzogJ+KWgCcsXG4gICAgICAgICcg4paIJzogJyAnLFxuICAgICAgICAnICAnOiAnICdcbiAgICAgIH07XG5cbiAgICAgIHZhciBhc2NpaSA9ICcnO1xuICAgICAgZm9yICh5ID0gMDsgeSA8IHNpemU7IHkgKz0gMikge1xuICAgICAgICByMSA9IE1hdGguZmxvb3IoKHkgLSBtaW4pIC8gY2VsbFNpemUpO1xuICAgICAgICByMiA9IE1hdGguZmxvb3IoKHkgKyAxIC0gbWluKSAvIGNlbGxTaXplKTtcbiAgICAgICAgZm9yICh4ID0gMDsgeCA8IHNpemU7IHggKz0gMSkge1xuICAgICAgICAgIHAgPSAn4paIJztcblxuICAgICAgICAgIGlmIChtaW4gPD0geCAmJiB4IDwgbWF4ICYmIG1pbiA8PSB5ICYmIHkgPCBtYXggJiYgX3RoaXMuaXNEYXJrKHIxLCBNYXRoLmZsb29yKCh4IC0gbWluKSAvIGNlbGxTaXplKSkpIHtcbiAgICAgICAgICAgIHAgPSAnICc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1pbiA8PSB4ICYmIHggPCBtYXggJiYgbWluIDw9IHkrMSAmJiB5KzEgPCBtYXggJiYgX3RoaXMuaXNEYXJrKHIyLCBNYXRoLmZsb29yKCh4IC0gbWluKSAvIGNlbGxTaXplKSkpIHtcbiAgICAgICAgICAgIHAgKz0gJyAnO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHAgKz0gJ+KWiCc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gT3V0cHV0IDIgY2hhcmFjdGVycyBwZXIgcGl4ZWwsIHRvIGNyZWF0ZSBmdWxsIHNxdWFyZS4gMSBjaGFyYWN0ZXIgcGVyIHBpeGVscyBnaXZlcyBvbmx5IGhhbGYgd2lkdGggb2Ygc3F1YXJlLlxuICAgICAgICAgIGFzY2lpICs9IChtYXJnaW4gPCAxICYmIHkrMSA+PSBtYXgpID8gYmxvY2tzTGFzdExpbmVOb01hcmdpbltwXSA6IGJsb2Nrc1twXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzY2lpICs9ICdcXG4nO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2l6ZSAlIDIgJiYgbWFyZ2luID4gMCkge1xuICAgICAgICByZXR1cm4gYXNjaWkuc3Vic3RyaW5nKDAsIGFzY2lpLmxlbmd0aCAtIHNpemUgLSAxKSArIEFycmF5KHNpemUrMSkuam9pbign4paAJyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhc2NpaS5zdWJzdHJpbmcoMCwgYXNjaWkubGVuZ3RoLTEpO1xuICAgIH07XG5cbiAgICBfdGhpcy5jcmVhdGVBU0NJSSA9IGZ1bmN0aW9uKGNlbGxTaXplLCBtYXJnaW4pIHtcbiAgICAgIGNlbGxTaXplID0gY2VsbFNpemUgfHwgMTtcblxuICAgICAgaWYgKGNlbGxTaXplIDwgMikge1xuICAgICAgICByZXR1cm4gX2NyZWF0ZUhhbGZBU0NJSShtYXJnaW4pO1xuICAgICAgfVxuXG4gICAgICBjZWxsU2l6ZSAtPSAxO1xuICAgICAgbWFyZ2luID0gKHR5cGVvZiBtYXJnaW4gPT0gJ3VuZGVmaW5lZCcpPyBjZWxsU2l6ZSAqIDIgOiBtYXJnaW47XG5cbiAgICAgIHZhciBzaXplID0gX3RoaXMuZ2V0TW9kdWxlQ291bnQoKSAqIGNlbGxTaXplICsgbWFyZ2luICogMjtcbiAgICAgIHZhciBtaW4gPSBtYXJnaW47XG4gICAgICB2YXIgbWF4ID0gc2l6ZSAtIG1hcmdpbjtcblxuICAgICAgdmFyIHksIHgsIHIsIHA7XG5cbiAgICAgIHZhciB3aGl0ZSA9IEFycmF5KGNlbGxTaXplKzEpLmpvaW4oJ+KWiOKWiCcpO1xuICAgICAgdmFyIGJsYWNrID0gQXJyYXkoY2VsbFNpemUrMSkuam9pbignICAnKTtcblxuICAgICAgdmFyIGFzY2lpID0gJyc7XG4gICAgICB2YXIgbGluZSA9ICcnO1xuICAgICAgZm9yICh5ID0gMDsgeSA8IHNpemU7IHkgKz0gMSkge1xuICAgICAgICByID0gTWF0aC5mbG9vciggKHkgLSBtaW4pIC8gY2VsbFNpemUpO1xuICAgICAgICBsaW5lID0gJyc7XG4gICAgICAgIGZvciAoeCA9IDA7IHggPCBzaXplOyB4ICs9IDEpIHtcbiAgICAgICAgICBwID0gMTtcblxuICAgICAgICAgIGlmIChtaW4gPD0geCAmJiB4IDwgbWF4ICYmIG1pbiA8PSB5ICYmIHkgPCBtYXggJiYgX3RoaXMuaXNEYXJrKHIsIE1hdGguZmxvb3IoKHggLSBtaW4pIC8gY2VsbFNpemUpKSkge1xuICAgICAgICAgICAgcCA9IDA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gT3V0cHV0IDIgY2hhcmFjdGVycyBwZXIgcGl4ZWwsIHRvIGNyZWF0ZSBmdWxsIHNxdWFyZS4gMSBjaGFyYWN0ZXIgcGVyIHBpeGVscyBnaXZlcyBvbmx5IGhhbGYgd2lkdGggb2Ygc3F1YXJlLlxuICAgICAgICAgIGxpbmUgKz0gcCA/IHdoaXRlIDogYmxhY2s7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHIgPSAwOyByIDwgY2VsbFNpemU7IHIgKz0gMSkge1xuICAgICAgICAgIGFzY2lpICs9IGxpbmUgKyAnXFxuJztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gYXNjaWkuc3Vic3RyaW5nKDAsIGFzY2lpLmxlbmd0aC0xKTtcbiAgICB9O1xuXG4gICAgX3RoaXMucmVuZGVyVG8yZENvbnRleHQgPSBmdW5jdGlvbihjb250ZXh0LCBjZWxsU2l6ZSkge1xuICAgICAgY2VsbFNpemUgPSBjZWxsU2l6ZSB8fCAyO1xuICAgICAgdmFyIGxlbmd0aCA9IF90aGlzLmdldE1vZHVsZUNvdW50KCk7XG4gICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBsZW5ndGg7IHJvdysrKSB7XG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IGxlbmd0aDsgY29sKyspIHtcbiAgICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IF90aGlzLmlzRGFyayhyb3csIGNvbCkgPyAnYmxhY2snIDogJ3doaXRlJztcbiAgICAgICAgICBjb250ZXh0LmZpbGxSZWN0KHJvdyAqIGNlbGxTaXplLCBjb2wgKiBjZWxsU2l6ZSwgY2VsbFNpemUsIGNlbGxTaXplKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfdGhpcztcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBxcmNvZGUuc3RyaW5nVG9CeXRlc1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHFyY29kZS5zdHJpbmdUb0J5dGVzRnVuY3MgPSB7XG4gICAgJ2RlZmF1bHQnIDogZnVuY3Rpb24ocykge1xuICAgICAgdmFyIGJ5dGVzID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdmFyIGMgPSBzLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGJ5dGVzLnB1c2goYyAmIDB4ZmYpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH1cbiAgfTtcblxuICBxcmNvZGUuc3RyaW5nVG9CeXRlcyA9IHFyY29kZS5zdHJpbmdUb0J5dGVzRnVuY3NbJ2RlZmF1bHQnXTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBxcmNvZGUuY3JlYXRlU3RyaW5nVG9CeXRlc1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gdW5pY29kZURhdGEgYmFzZTY0IHN0cmluZyBvZiBieXRlIGFycmF5LlxuICAgKiBbMTZiaXQgVW5pY29kZV0sWzE2Yml0IEJ5dGVzXSwgLi4uXG4gICAqIEBwYXJhbSBudW1DaGFyc1xuICAgKi9cbiAgcXJjb2RlLmNyZWF0ZVN0cmluZ1RvQnl0ZXMgPSBmdW5jdGlvbih1bmljb2RlRGF0YSwgbnVtQ2hhcnMpIHtcblxuICAgIC8vIGNyZWF0ZSBjb252ZXJzaW9uIG1hcC5cblxuICAgIHZhciB1bmljb2RlTWFwID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBiaW4gPSBiYXNlNjREZWNvZGVJbnB1dFN0cmVhbSh1bmljb2RlRGF0YSk7XG4gICAgICB2YXIgcmVhZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYiA9IGJpbi5yZWFkKCk7XG4gICAgICAgIGlmIChiID09IC0xKSB0aHJvdyAnZW9mJztcbiAgICAgICAgcmV0dXJuIGI7XG4gICAgICB9O1xuXG4gICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgdmFyIHVuaWNvZGVNYXAgPSB7fTtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHZhciBiMCA9IGJpbi5yZWFkKCk7XG4gICAgICAgIGlmIChiMCA9PSAtMSkgYnJlYWs7XG4gICAgICAgIHZhciBiMSA9IHJlYWQoKTtcbiAgICAgICAgdmFyIGIyID0gcmVhZCgpO1xuICAgICAgICB2YXIgYjMgPSByZWFkKCk7XG4gICAgICAgIHZhciBrID0gU3RyaW5nLmZyb21DaGFyQ29kZSggKGIwIDw8IDgpIHwgYjEpO1xuICAgICAgICB2YXIgdiA9IChiMiA8PCA4KSB8IGIzO1xuICAgICAgICB1bmljb2RlTWFwW2tdID0gdjtcbiAgICAgICAgY291bnQgKz0gMTtcbiAgICAgIH1cbiAgICAgIGlmIChjb3VudCAhPSBudW1DaGFycykge1xuICAgICAgICB0aHJvdyBjb3VudCArICcgIT0gJyArIG51bUNoYXJzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdW5pY29kZU1hcDtcbiAgICB9KCk7XG5cbiAgICB2YXIgdW5rbm93bkNoYXIgPSAnPycuY2hhckNvZGVBdCgwKTtcblxuICAgIHJldHVybiBmdW5jdGlvbihzKSB7XG4gICAgICB2YXIgYnl0ZXMgPSBbXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB2YXIgYyA9IHMuY2hhckNvZGVBdChpKTtcbiAgICAgICAgaWYgKGMgPCAxMjgpIHtcbiAgICAgICAgICBieXRlcy5wdXNoKGMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBiID0gdW5pY29kZU1hcFtzLmNoYXJBdChpKV07XG4gICAgICAgICAgaWYgKHR5cGVvZiBiID09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBpZiAoIChiICYgMHhmZikgPT0gYikge1xuICAgICAgICAgICAgICAvLyAxYnl0ZVxuICAgICAgICAgICAgICBieXRlcy5wdXNoKGIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gMmJ5dGVzXG4gICAgICAgICAgICAgIGJ5dGVzLnB1c2goYiA+Pj4gOCk7XG4gICAgICAgICAgICAgIGJ5dGVzLnB1c2goYiAmIDB4ZmYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBieXRlcy5wdXNoKHVua25vd25DaGFyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBieXRlcztcbiAgICB9O1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFFSTW9kZVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBRUk1vZGUgPSB7XG4gICAgTU9ERV9OVU1CRVIgOiAgICAxIDw8IDAsXG4gICAgTU9ERV9BTFBIQV9OVU0gOiAxIDw8IDEsXG4gICAgTU9ERV84QklUX0JZVEUgOiAxIDw8IDIsXG4gICAgTU9ERV9LQU5KSSA6ICAgICAxIDw8IDNcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBRUkVycm9yQ29ycmVjdGlvbkxldmVsXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIFFSRXJyb3JDb3JyZWN0aW9uTGV2ZWwgPSB7XG4gICAgTCA6IDEsXG4gICAgTSA6IDAsXG4gICAgUSA6IDMsXG4gICAgSCA6IDJcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBRUk1hc2tQYXR0ZXJuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIFFSTWFza1BhdHRlcm4gPSB7XG4gICAgUEFUVEVSTjAwMCA6IDAsXG4gICAgUEFUVEVSTjAwMSA6IDEsXG4gICAgUEFUVEVSTjAxMCA6IDIsXG4gICAgUEFUVEVSTjAxMSA6IDMsXG4gICAgUEFUVEVSTjEwMCA6IDQsXG4gICAgUEFUVEVSTjEwMSA6IDUsXG4gICAgUEFUVEVSTjExMCA6IDYsXG4gICAgUEFUVEVSTjExMSA6IDdcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBRUlV0aWxcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgUVJVdGlsID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgUEFUVEVSTl9QT1NJVElPTl9UQUJMRSA9IFtcbiAgICAgIFtdLFxuICAgICAgWzYsIDE4XSxcbiAgICAgIFs2LCAyMl0sXG4gICAgICBbNiwgMjZdLFxuICAgICAgWzYsIDMwXSxcbiAgICAgIFs2LCAzNF0sXG4gICAgICBbNiwgMjIsIDM4XSxcbiAgICAgIFs2LCAyNCwgNDJdLFxuICAgICAgWzYsIDI2LCA0Nl0sXG4gICAgICBbNiwgMjgsIDUwXSxcbiAgICAgIFs2LCAzMCwgNTRdLFxuICAgICAgWzYsIDMyLCA1OF0sXG4gICAgICBbNiwgMzQsIDYyXSxcbiAgICAgIFs2LCAyNiwgNDYsIDY2XSxcbiAgICAgIFs2LCAyNiwgNDgsIDcwXSxcbiAgICAgIFs2LCAyNiwgNTAsIDc0XSxcbiAgICAgIFs2LCAzMCwgNTQsIDc4XSxcbiAgICAgIFs2LCAzMCwgNTYsIDgyXSxcbiAgICAgIFs2LCAzMCwgNTgsIDg2XSxcbiAgICAgIFs2LCAzNCwgNjIsIDkwXSxcbiAgICAgIFs2LCAyOCwgNTAsIDcyLCA5NF0sXG4gICAgICBbNiwgMjYsIDUwLCA3NCwgOThdLFxuICAgICAgWzYsIDMwLCA1NCwgNzgsIDEwMl0sXG4gICAgICBbNiwgMjgsIDU0LCA4MCwgMTA2XSxcbiAgICAgIFs2LCAzMiwgNTgsIDg0LCAxMTBdLFxuICAgICAgWzYsIDMwLCA1OCwgODYsIDExNF0sXG4gICAgICBbNiwgMzQsIDYyLCA5MCwgMTE4XSxcbiAgICAgIFs2LCAyNiwgNTAsIDc0LCA5OCwgMTIyXSxcbiAgICAgIFs2LCAzMCwgNTQsIDc4LCAxMDIsIDEyNl0sXG4gICAgICBbNiwgMjYsIDUyLCA3OCwgMTA0LCAxMzBdLFxuICAgICAgWzYsIDMwLCA1NiwgODIsIDEwOCwgMTM0XSxcbiAgICAgIFs2LCAzNCwgNjAsIDg2LCAxMTIsIDEzOF0sXG4gICAgICBbNiwgMzAsIDU4LCA4NiwgMTE0LCAxNDJdLFxuICAgICAgWzYsIDM0LCA2MiwgOTAsIDExOCwgMTQ2XSxcbiAgICAgIFs2LCAzMCwgNTQsIDc4LCAxMDIsIDEyNiwgMTUwXSxcbiAgICAgIFs2LCAyNCwgNTAsIDc2LCAxMDIsIDEyOCwgMTU0XSxcbiAgICAgIFs2LCAyOCwgNTQsIDgwLCAxMDYsIDEzMiwgMTU4XSxcbiAgICAgIFs2LCAzMiwgNTgsIDg0LCAxMTAsIDEzNiwgMTYyXSxcbiAgICAgIFs2LCAyNiwgNTQsIDgyLCAxMTAsIDEzOCwgMTY2XSxcbiAgICAgIFs2LCAzMCwgNTgsIDg2LCAxMTQsIDE0MiwgMTcwXVxuICAgIF07XG4gICAgdmFyIEcxNSA9ICgxIDw8IDEwKSB8ICgxIDw8IDgpIHwgKDEgPDwgNSkgfCAoMSA8PCA0KSB8ICgxIDw8IDIpIHwgKDEgPDwgMSkgfCAoMSA8PCAwKTtcbiAgICB2YXIgRzE4ID0gKDEgPDwgMTIpIHwgKDEgPDwgMTEpIHwgKDEgPDwgMTApIHwgKDEgPDwgOSkgfCAoMSA8PCA4KSB8ICgxIDw8IDUpIHwgKDEgPDwgMikgfCAoMSA8PCAwKTtcbiAgICB2YXIgRzE1X01BU0sgPSAoMSA8PCAxNCkgfCAoMSA8PCAxMikgfCAoMSA8PCAxMCkgfCAoMSA8PCA0KSB8ICgxIDw8IDEpO1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICB2YXIgZ2V0QkNIRGlnaXQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgZGlnaXQgPSAwO1xuICAgICAgd2hpbGUgKGRhdGEgIT0gMCkge1xuICAgICAgICBkaWdpdCArPSAxO1xuICAgICAgICBkYXRhID4+Pj0gMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkaWdpdDtcbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0QkNIVHlwZUluZm8gPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgZCA9IGRhdGEgPDwgMTA7XG4gICAgICB3aGlsZSAoZ2V0QkNIRGlnaXQoZCkgLSBnZXRCQ0hEaWdpdChHMTUpID49IDApIHtcbiAgICAgICAgZCBePSAoRzE1IDw8IChnZXRCQ0hEaWdpdChkKSAtIGdldEJDSERpZ2l0KEcxNSkgKSApO1xuICAgICAgfVxuICAgICAgcmV0dXJuICggKGRhdGEgPDwgMTApIHwgZCkgXiBHMTVfTUFTSztcbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0QkNIVHlwZU51bWJlciA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBkID0gZGF0YSA8PCAxMjtcbiAgICAgIHdoaWxlIChnZXRCQ0hEaWdpdChkKSAtIGdldEJDSERpZ2l0KEcxOCkgPj0gMCkge1xuICAgICAgICBkIF49IChHMTggPDwgKGdldEJDSERpZ2l0KGQpIC0gZ2V0QkNIRGlnaXQoRzE4KSApICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gKGRhdGEgPDwgMTIpIHwgZDtcbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0UGF0dGVyblBvc2l0aW9uID0gZnVuY3Rpb24odHlwZU51bWJlcikge1xuICAgICAgcmV0dXJuIFBBVFRFUk5fUE9TSVRJT05fVEFCTEVbdHlwZU51bWJlciAtIDFdO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRNYXNrRnVuY3Rpb24gPSBmdW5jdGlvbihtYXNrUGF0dGVybikge1xuXG4gICAgICBzd2l0Y2ggKG1hc2tQYXR0ZXJuKSB7XG5cbiAgICAgIGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMDAwIDpcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIGopIHsgcmV0dXJuIChpICsgaikgJSAyID09IDA7IH07XG4gICAgICBjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjAwMSA6XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBqKSB7IHJldHVybiBpICUgMiA9PSAwOyB9O1xuICAgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4wMTAgOlxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaSwgaikgeyByZXR1cm4gaiAlIDMgPT0gMDsgfTtcbiAgICAgIGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMDExIDpcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIGopIHsgcmV0dXJuIChpICsgaikgJSAzID09IDA7IH07XG4gICAgICBjYXNlIFFSTWFza1BhdHRlcm4uUEFUVEVSTjEwMCA6XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBqKSB7IHJldHVybiAoTWF0aC5mbG9vcihpIC8gMikgKyBNYXRoLmZsb29yKGogLyAzKSApICUgMiA9PSAwOyB9O1xuICAgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4xMDEgOlxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaSwgaikgeyByZXR1cm4gKGkgKiBqKSAlIDIgKyAoaSAqIGopICUgMyA9PSAwOyB9O1xuICAgICAgY2FzZSBRUk1hc2tQYXR0ZXJuLlBBVFRFUk4xMTAgOlxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaSwgaikgeyByZXR1cm4gKCAoaSAqIGopICUgMiArIChpICogaikgJSAzKSAlIDIgPT0gMDsgfTtcbiAgICAgIGNhc2UgUVJNYXNrUGF0dGVybi5QQVRURVJOMTExIDpcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIGopIHsgcmV0dXJuICggKGkgKiBqKSAlIDMgKyAoaSArIGopICUgMikgJSAyID09IDA7IH07XG5cbiAgICAgIGRlZmF1bHQgOlxuICAgICAgICB0aHJvdyAnYmFkIG1hc2tQYXR0ZXJuOicgKyBtYXNrUGF0dGVybjtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0RXJyb3JDb3JyZWN0UG9seW5vbWlhbCA9IGZ1bmN0aW9uKGVycm9yQ29ycmVjdExlbmd0aCkge1xuICAgICAgdmFyIGEgPSBxclBvbHlub21pYWwoWzFdLCAwKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXJyb3JDb3JyZWN0TGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgYSA9IGEubXVsdGlwbHkocXJQb2x5bm9taWFsKFsxLCBRUk1hdGguZ2V4cChpKV0sIDApICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYTtcbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0TGVuZ3RoSW5CaXRzID0gZnVuY3Rpb24obW9kZSwgdHlwZSkge1xuXG4gICAgICBpZiAoMSA8PSB0eXBlICYmIHR5cGUgPCAxMCkge1xuXG4gICAgICAgIC8vIDEgLSA5XG5cbiAgICAgICAgc3dpdGNoKG1vZGUpIHtcbiAgICAgICAgY2FzZSBRUk1vZGUuTU9ERV9OVU1CRVIgICAgOiByZXR1cm4gMTA7XG4gICAgICAgIGNhc2UgUVJNb2RlLk1PREVfQUxQSEFfTlVNIDogcmV0dXJuIDk7XG4gICAgICAgIGNhc2UgUVJNb2RlLk1PREVfOEJJVF9CWVRFIDogcmV0dXJuIDg7XG4gICAgICAgIGNhc2UgUVJNb2RlLk1PREVfS0FOSkkgICAgIDogcmV0dXJuIDg7XG4gICAgICAgIGRlZmF1bHQgOlxuICAgICAgICAgIHRocm93ICdtb2RlOicgKyBtb2RlO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSBpZiAodHlwZSA8IDI3KSB7XG5cbiAgICAgICAgLy8gMTAgLSAyNlxuXG4gICAgICAgIHN3aXRjaChtb2RlKSB7XG4gICAgICAgIGNhc2UgUVJNb2RlLk1PREVfTlVNQkVSICAgIDogcmV0dXJuIDEyO1xuICAgICAgICBjYXNlIFFSTW9kZS5NT0RFX0FMUEhBX05VTSA6IHJldHVybiAxMTtcbiAgICAgICAgY2FzZSBRUk1vZGUuTU9ERV84QklUX0JZVEUgOiByZXR1cm4gMTY7XG4gICAgICAgIGNhc2UgUVJNb2RlLk1PREVfS0FOSkkgICAgIDogcmV0dXJuIDEwO1xuICAgICAgICBkZWZhdWx0IDpcbiAgICAgICAgICB0aHJvdyAnbW9kZTonICsgbW9kZTtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPCA0MSkge1xuXG4gICAgICAgIC8vIDI3IC0gNDBcblxuICAgICAgICBzd2l0Y2gobW9kZSkge1xuICAgICAgICBjYXNlIFFSTW9kZS5NT0RFX05VTUJFUiAgICA6IHJldHVybiAxNDtcbiAgICAgICAgY2FzZSBRUk1vZGUuTU9ERV9BTFBIQV9OVU0gOiByZXR1cm4gMTM7XG4gICAgICAgIGNhc2UgUVJNb2RlLk1PREVfOEJJVF9CWVRFIDogcmV0dXJuIDE2O1xuICAgICAgICBjYXNlIFFSTW9kZS5NT0RFX0tBTkpJICAgICA6IHJldHVybiAxMjtcbiAgICAgICAgZGVmYXVsdCA6XG4gICAgICAgICAgdGhyb3cgJ21vZGU6JyArIG1vZGU7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgJ3R5cGU6JyArIHR5cGU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIF90aGlzLmdldExvc3RQb2ludCA9IGZ1bmN0aW9uKHFyY29kZSkge1xuXG4gICAgICB2YXIgbW9kdWxlQ291bnQgPSBxcmNvZGUuZ2V0TW9kdWxlQ291bnQoKTtcblxuICAgICAgdmFyIGxvc3RQb2ludCA9IDA7XG5cbiAgICAgIC8vIExFVkVMMVxuXG4gICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBtb2R1bGVDb3VudDsgcm93ICs9IDEpIHtcbiAgICAgICAgZm9yICh2YXIgY29sID0gMDsgY29sIDwgbW9kdWxlQ291bnQ7IGNvbCArPSAxKSB7XG5cbiAgICAgICAgICB2YXIgc2FtZUNvdW50ID0gMDtcbiAgICAgICAgICB2YXIgZGFyayA9IHFyY29kZS5pc0Rhcmsocm93LCBjb2wpO1xuXG4gICAgICAgICAgZm9yICh2YXIgciA9IC0xOyByIDw9IDE7IHIgKz0gMSkge1xuXG4gICAgICAgICAgICBpZiAocm93ICsgciA8IDAgfHwgbW9kdWxlQ291bnQgPD0gcm93ICsgcikge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgYyA9IC0xOyBjIDw9IDE7IGMgKz0gMSkge1xuXG4gICAgICAgICAgICAgIGlmIChjb2wgKyBjIDwgMCB8fCBtb2R1bGVDb3VudCA8PSBjb2wgKyBjKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAociA9PSAwICYmIGMgPT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKGRhcmsgPT0gcXJjb2RlLmlzRGFyayhyb3cgKyByLCBjb2wgKyBjKSApIHtcbiAgICAgICAgICAgICAgICBzYW1lQ291bnQgKz0gMTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzYW1lQ291bnQgPiA1KSB7XG4gICAgICAgICAgICBsb3N0UG9pbnQgKz0gKDMgKyBzYW1lQ291bnQgLSA1KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8vIExFVkVMMlxuXG4gICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBtb2R1bGVDb3VudCAtIDE7IHJvdyArPSAxKSB7XG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IG1vZHVsZUNvdW50IC0gMTsgY29sICs9IDEpIHtcbiAgICAgICAgICB2YXIgY291bnQgPSAwO1xuICAgICAgICAgIGlmIChxcmNvZGUuaXNEYXJrKHJvdywgY29sKSApIGNvdW50ICs9IDE7XG4gICAgICAgICAgaWYgKHFyY29kZS5pc0Rhcmsocm93ICsgMSwgY29sKSApIGNvdW50ICs9IDE7XG4gICAgICAgICAgaWYgKHFyY29kZS5pc0Rhcmsocm93LCBjb2wgKyAxKSApIGNvdW50ICs9IDE7XG4gICAgICAgICAgaWYgKHFyY29kZS5pc0Rhcmsocm93ICsgMSwgY29sICsgMSkgKSBjb3VudCArPSAxO1xuICAgICAgICAgIGlmIChjb3VudCA9PSAwIHx8IGNvdW50ID09IDQpIHtcbiAgICAgICAgICAgIGxvc3RQb2ludCArPSAzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBMRVZFTDNcblxuICAgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgbW9kdWxlQ291bnQ7IHJvdyArPSAxKSB7XG4gICAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IG1vZHVsZUNvdW50IC0gNjsgY29sICs9IDEpIHtcbiAgICAgICAgICBpZiAocXJjb2RlLmlzRGFyayhyb3csIGNvbClcbiAgICAgICAgICAgICAgJiYgIXFyY29kZS5pc0Rhcmsocm93LCBjb2wgKyAxKVxuICAgICAgICAgICAgICAmJiAgcXJjb2RlLmlzRGFyayhyb3csIGNvbCArIDIpXG4gICAgICAgICAgICAgICYmICBxcmNvZGUuaXNEYXJrKHJvdywgY29sICsgMylcbiAgICAgICAgICAgICAgJiYgIHFyY29kZS5pc0Rhcmsocm93LCBjb2wgKyA0KVxuICAgICAgICAgICAgICAmJiAhcXJjb2RlLmlzRGFyayhyb3csIGNvbCArIDUpXG4gICAgICAgICAgICAgICYmICBxcmNvZGUuaXNEYXJrKHJvdywgY29sICsgNikgKSB7XG4gICAgICAgICAgICBsb3N0UG9pbnQgKz0gNDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IG1vZHVsZUNvdW50OyBjb2wgKz0gMSkge1xuICAgICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBtb2R1bGVDb3VudCAtIDY7IHJvdyArPSAxKSB7XG4gICAgICAgICAgaWYgKHFyY29kZS5pc0Rhcmsocm93LCBjb2wpXG4gICAgICAgICAgICAgICYmICFxcmNvZGUuaXNEYXJrKHJvdyArIDEsIGNvbClcbiAgICAgICAgICAgICAgJiYgIHFyY29kZS5pc0Rhcmsocm93ICsgMiwgY29sKVxuICAgICAgICAgICAgICAmJiAgcXJjb2RlLmlzRGFyayhyb3cgKyAzLCBjb2wpXG4gICAgICAgICAgICAgICYmICBxcmNvZGUuaXNEYXJrKHJvdyArIDQsIGNvbClcbiAgICAgICAgICAgICAgJiYgIXFyY29kZS5pc0Rhcmsocm93ICsgNSwgY29sKVxuICAgICAgICAgICAgICAmJiAgcXJjb2RlLmlzRGFyayhyb3cgKyA2LCBjb2wpICkge1xuICAgICAgICAgICAgbG9zdFBvaW50ICs9IDQwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBMRVZFTDRcblxuICAgICAgdmFyIGRhcmtDb3VudCA9IDA7XG5cbiAgICAgIGZvciAodmFyIGNvbCA9IDA7IGNvbCA8IG1vZHVsZUNvdW50OyBjb2wgKz0gMSkge1xuICAgICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBtb2R1bGVDb3VudDsgcm93ICs9IDEpIHtcbiAgICAgICAgICBpZiAocXJjb2RlLmlzRGFyayhyb3csIGNvbCkgKSB7XG4gICAgICAgICAgICBkYXJrQ291bnQgKz0gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIHJhdGlvID0gTWF0aC5hYnMoMTAwICogZGFya0NvdW50IC8gbW9kdWxlQ291bnQgLyBtb2R1bGVDb3VudCAtIDUwKSAvIDU7XG4gICAgICBsb3N0UG9pbnQgKz0gcmF0aW8gKiAxMDtcblxuICAgICAgcmV0dXJuIGxvc3RQb2ludDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9KCk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gUVJNYXRoXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIFFSTWF0aCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIEVYUF9UQUJMRSA9IG5ldyBBcnJheSgyNTYpO1xuICAgIHZhciBMT0dfVEFCTEUgPSBuZXcgQXJyYXkoMjU2KTtcblxuICAgIC8vIGluaXRpYWxpemUgdGFibGVzXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA4OyBpICs9IDEpIHtcbiAgICAgIEVYUF9UQUJMRVtpXSA9IDEgPDwgaTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDg7IGkgPCAyNTY7IGkgKz0gMSkge1xuICAgICAgRVhQX1RBQkxFW2ldID0gRVhQX1RBQkxFW2kgLSA0XVxuICAgICAgICBeIEVYUF9UQUJMRVtpIC0gNV1cbiAgICAgICAgXiBFWFBfVEFCTEVbaSAtIDZdXG4gICAgICAgIF4gRVhQX1RBQkxFW2kgLSA4XTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyNTU7IGkgKz0gMSkge1xuICAgICAgTE9HX1RBQkxFW0VYUF9UQUJMRVtpXSBdID0gaTtcbiAgICB9XG5cbiAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgIF90aGlzLmdsb2cgPSBmdW5jdGlvbihuKSB7XG5cbiAgICAgIGlmIChuIDwgMSkge1xuICAgICAgICB0aHJvdyAnZ2xvZygnICsgbiArICcpJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIExPR19UQUJMRVtuXTtcbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V4cCA9IGZ1bmN0aW9uKG4pIHtcblxuICAgICAgd2hpbGUgKG4gPCAwKSB7XG4gICAgICAgIG4gKz0gMjU1O1xuICAgICAgfVxuXG4gICAgICB3aGlsZSAobiA+PSAyNTYpIHtcbiAgICAgICAgbiAtPSAyNTU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBFWFBfVEFCTEVbbl07XG4gICAgfTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfSgpO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIHFyUG9seW5vbWlhbFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGZ1bmN0aW9uIHFyUG9seW5vbWlhbChudW0sIHNoaWZ0KSB7XG5cbiAgICBpZiAodHlwZW9mIG51bS5sZW5ndGggPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG51bS5sZW5ndGggKyAnLycgKyBzaGlmdDtcbiAgICB9XG5cbiAgICB2YXIgX251bSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG9mZnNldCA9IDA7XG4gICAgICB3aGlsZSAob2Zmc2V0IDwgbnVtLmxlbmd0aCAmJiBudW1bb2Zmc2V0XSA9PSAwKSB7XG4gICAgICAgIG9mZnNldCArPSAxO1xuICAgICAgfVxuICAgICAgdmFyIF9udW0gPSBuZXcgQXJyYXkobnVtLmxlbmd0aCAtIG9mZnNldCArIHNoaWZ0KTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtLmxlbmd0aCAtIG9mZnNldDsgaSArPSAxKSB7XG4gICAgICAgIF9udW1baV0gPSBudW1baSArIG9mZnNldF07XG4gICAgICB9XG4gICAgICByZXR1cm4gX251bTtcbiAgICB9KCk7XG5cbiAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgIF90aGlzLmdldEF0ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIHJldHVybiBfbnVtW2luZGV4XTtcbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0TGVuZ3RoID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX251bS5sZW5ndGg7XG4gICAgfTtcblxuICAgIF90aGlzLm11bHRpcGx5ID0gZnVuY3Rpb24oZSkge1xuXG4gICAgICB2YXIgbnVtID0gbmV3IEFycmF5KF90aGlzLmdldExlbmd0aCgpICsgZS5nZXRMZW5ndGgoKSAtIDEpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF90aGlzLmdldExlbmd0aCgpOyBpICs9IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBlLmdldExlbmd0aCgpOyBqICs9IDEpIHtcbiAgICAgICAgICBudW1baSArIGpdIF49IFFSTWF0aC5nZXhwKFFSTWF0aC5nbG9nKF90aGlzLmdldEF0KGkpICkgKyBRUk1hdGguZ2xvZyhlLmdldEF0KGopICkgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcXJQb2x5bm9taWFsKG51bSwgMCk7XG4gICAgfTtcblxuICAgIF90aGlzLm1vZCA9IGZ1bmN0aW9uKGUpIHtcblxuICAgICAgaWYgKF90aGlzLmdldExlbmd0aCgpIC0gZS5nZXRMZW5ndGgoKSA8IDApIHtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmF0aW8gPSBRUk1hdGguZ2xvZyhfdGhpcy5nZXRBdCgwKSApIC0gUVJNYXRoLmdsb2coZS5nZXRBdCgwKSApO1xuXG4gICAgICB2YXIgbnVtID0gbmV3IEFycmF5KF90aGlzLmdldExlbmd0aCgpICk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF90aGlzLmdldExlbmd0aCgpOyBpICs9IDEpIHtcbiAgICAgICAgbnVtW2ldID0gX3RoaXMuZ2V0QXQoaSk7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZS5nZXRMZW5ndGgoKTsgaSArPSAxKSB7XG4gICAgICAgIG51bVtpXSBePSBRUk1hdGguZ2V4cChRUk1hdGguZ2xvZyhlLmdldEF0KGkpICkgKyByYXRpbyk7XG4gICAgICB9XG5cbiAgICAgIC8vIHJlY3Vyc2l2ZSBjYWxsXG4gICAgICByZXR1cm4gcXJQb2x5bm9taWFsKG51bSwgMCkubW9kKGUpO1xuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gUVJSU0Jsb2NrXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIFFSUlNCbG9jayA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIFJTX0JMT0NLX1RBQkxFID0gW1xuXG4gICAgICAvLyBMXG4gICAgICAvLyBNXG4gICAgICAvLyBRXG4gICAgICAvLyBIXG5cbiAgICAgIC8vIDFcbiAgICAgIFsxLCAyNiwgMTldLFxuICAgICAgWzEsIDI2LCAxNl0sXG4gICAgICBbMSwgMjYsIDEzXSxcbiAgICAgIFsxLCAyNiwgOV0sXG5cbiAgICAgIC8vIDJcbiAgICAgIFsxLCA0NCwgMzRdLFxuICAgICAgWzEsIDQ0LCAyOF0sXG4gICAgICBbMSwgNDQsIDIyXSxcbiAgICAgIFsxLCA0NCwgMTZdLFxuXG4gICAgICAvLyAzXG4gICAgICBbMSwgNzAsIDU1XSxcbiAgICAgIFsxLCA3MCwgNDRdLFxuICAgICAgWzIsIDM1LCAxN10sXG4gICAgICBbMiwgMzUsIDEzXSxcblxuICAgICAgLy8gNFxuICAgICAgWzEsIDEwMCwgODBdLFxuICAgICAgWzIsIDUwLCAzMl0sXG4gICAgICBbMiwgNTAsIDI0XSxcbiAgICAgIFs0LCAyNSwgOV0sXG5cbiAgICAgIC8vIDVcbiAgICAgIFsxLCAxMzQsIDEwOF0sXG4gICAgICBbMiwgNjcsIDQzXSxcbiAgICAgIFsyLCAzMywgMTUsIDIsIDM0LCAxNl0sXG4gICAgICBbMiwgMzMsIDExLCAyLCAzNCwgMTJdLFxuXG4gICAgICAvLyA2XG4gICAgICBbMiwgODYsIDY4XSxcbiAgICAgIFs0LCA0MywgMjddLFxuICAgICAgWzQsIDQzLCAxOV0sXG4gICAgICBbNCwgNDMsIDE1XSxcblxuICAgICAgLy8gN1xuICAgICAgWzIsIDk4LCA3OF0sXG4gICAgICBbNCwgNDksIDMxXSxcbiAgICAgIFsyLCAzMiwgMTQsIDQsIDMzLCAxNV0sXG4gICAgICBbNCwgMzksIDEzLCAxLCA0MCwgMTRdLFxuXG4gICAgICAvLyA4XG4gICAgICBbMiwgMTIxLCA5N10sXG4gICAgICBbMiwgNjAsIDM4LCAyLCA2MSwgMzldLFxuICAgICAgWzQsIDQwLCAxOCwgMiwgNDEsIDE5XSxcbiAgICAgIFs0LCA0MCwgMTQsIDIsIDQxLCAxNV0sXG5cbiAgICAgIC8vIDlcbiAgICAgIFsyLCAxNDYsIDExNl0sXG4gICAgICBbMywgNTgsIDM2LCAyLCA1OSwgMzddLFxuICAgICAgWzQsIDM2LCAxNiwgNCwgMzcsIDE3XSxcbiAgICAgIFs0LCAzNiwgMTIsIDQsIDM3LCAxM10sXG5cbiAgICAgIC8vIDEwXG4gICAgICBbMiwgODYsIDY4LCAyLCA4NywgNjldLFxuICAgICAgWzQsIDY5LCA0MywgMSwgNzAsIDQ0XSxcbiAgICAgIFs2LCA0MywgMTksIDIsIDQ0LCAyMF0sXG4gICAgICBbNiwgNDMsIDE1LCAyLCA0NCwgMTZdLFxuXG4gICAgICAvLyAxMVxuICAgICAgWzQsIDEwMSwgODFdLFxuICAgICAgWzEsIDgwLCA1MCwgNCwgODEsIDUxXSxcbiAgICAgIFs0LCA1MCwgMjIsIDQsIDUxLCAyM10sXG4gICAgICBbMywgMzYsIDEyLCA4LCAzNywgMTNdLFxuXG4gICAgICAvLyAxMlxuICAgICAgWzIsIDExNiwgOTIsIDIsIDExNywgOTNdLFxuICAgICAgWzYsIDU4LCAzNiwgMiwgNTksIDM3XSxcbiAgICAgIFs0LCA0NiwgMjAsIDYsIDQ3LCAyMV0sXG4gICAgICBbNywgNDIsIDE0LCA0LCA0MywgMTVdLFxuXG4gICAgICAvLyAxM1xuICAgICAgWzQsIDEzMywgMTA3XSxcbiAgICAgIFs4LCA1OSwgMzcsIDEsIDYwLCAzOF0sXG4gICAgICBbOCwgNDQsIDIwLCA0LCA0NSwgMjFdLFxuICAgICAgWzEyLCAzMywgMTEsIDQsIDM0LCAxMl0sXG5cbiAgICAgIC8vIDE0XG4gICAgICBbMywgMTQ1LCAxMTUsIDEsIDE0NiwgMTE2XSxcbiAgICAgIFs0LCA2NCwgNDAsIDUsIDY1LCA0MV0sXG4gICAgICBbMTEsIDM2LCAxNiwgNSwgMzcsIDE3XSxcbiAgICAgIFsxMSwgMzYsIDEyLCA1LCAzNywgMTNdLFxuXG4gICAgICAvLyAxNVxuICAgICAgWzUsIDEwOSwgODcsIDEsIDExMCwgODhdLFxuICAgICAgWzUsIDY1LCA0MSwgNSwgNjYsIDQyXSxcbiAgICAgIFs1LCA1NCwgMjQsIDcsIDU1LCAyNV0sXG4gICAgICBbMTEsIDM2LCAxMiwgNywgMzcsIDEzXSxcblxuICAgICAgLy8gMTZcbiAgICAgIFs1LCAxMjIsIDk4LCAxLCAxMjMsIDk5XSxcbiAgICAgIFs3LCA3MywgNDUsIDMsIDc0LCA0Nl0sXG4gICAgICBbMTUsIDQzLCAxOSwgMiwgNDQsIDIwXSxcbiAgICAgIFszLCA0NSwgMTUsIDEzLCA0NiwgMTZdLFxuXG4gICAgICAvLyAxN1xuICAgICAgWzEsIDEzNSwgMTA3LCA1LCAxMzYsIDEwOF0sXG4gICAgICBbMTAsIDc0LCA0NiwgMSwgNzUsIDQ3XSxcbiAgICAgIFsxLCA1MCwgMjIsIDE1LCA1MSwgMjNdLFxuICAgICAgWzIsIDQyLCAxNCwgMTcsIDQzLCAxNV0sXG5cbiAgICAgIC8vIDE4XG4gICAgICBbNSwgMTUwLCAxMjAsIDEsIDE1MSwgMTIxXSxcbiAgICAgIFs5LCA2OSwgNDMsIDQsIDcwLCA0NF0sXG4gICAgICBbMTcsIDUwLCAyMiwgMSwgNTEsIDIzXSxcbiAgICAgIFsyLCA0MiwgMTQsIDE5LCA0MywgMTVdLFxuXG4gICAgICAvLyAxOVxuICAgICAgWzMsIDE0MSwgMTEzLCA0LCAxNDIsIDExNF0sXG4gICAgICBbMywgNzAsIDQ0LCAxMSwgNzEsIDQ1XSxcbiAgICAgIFsxNywgNDcsIDIxLCA0LCA0OCwgMjJdLFxuICAgICAgWzksIDM5LCAxMywgMTYsIDQwLCAxNF0sXG5cbiAgICAgIC8vIDIwXG4gICAgICBbMywgMTM1LCAxMDcsIDUsIDEzNiwgMTA4XSxcbiAgICAgIFszLCA2NywgNDEsIDEzLCA2OCwgNDJdLFxuICAgICAgWzE1LCA1NCwgMjQsIDUsIDU1LCAyNV0sXG4gICAgICBbMTUsIDQzLCAxNSwgMTAsIDQ0LCAxNl0sXG5cbiAgICAgIC8vIDIxXG4gICAgICBbNCwgMTQ0LCAxMTYsIDQsIDE0NSwgMTE3XSxcbiAgICAgIFsxNywgNjgsIDQyXSxcbiAgICAgIFsxNywgNTAsIDIyLCA2LCA1MSwgMjNdLFxuICAgICAgWzE5LCA0NiwgMTYsIDYsIDQ3LCAxN10sXG5cbiAgICAgIC8vIDIyXG4gICAgICBbMiwgMTM5LCAxMTEsIDcsIDE0MCwgMTEyXSxcbiAgICAgIFsxNywgNzQsIDQ2XSxcbiAgICAgIFs3LCA1NCwgMjQsIDE2LCA1NSwgMjVdLFxuICAgICAgWzM0LCAzNywgMTNdLFxuXG4gICAgICAvLyAyM1xuICAgICAgWzQsIDE1MSwgMTIxLCA1LCAxNTIsIDEyMl0sXG4gICAgICBbNCwgNzUsIDQ3LCAxNCwgNzYsIDQ4XSxcbiAgICAgIFsxMSwgNTQsIDI0LCAxNCwgNTUsIDI1XSxcbiAgICAgIFsxNiwgNDUsIDE1LCAxNCwgNDYsIDE2XSxcblxuICAgICAgLy8gMjRcbiAgICAgIFs2LCAxNDcsIDExNywgNCwgMTQ4LCAxMThdLFxuICAgICAgWzYsIDczLCA0NSwgMTQsIDc0LCA0Nl0sXG4gICAgICBbMTEsIDU0LCAyNCwgMTYsIDU1LCAyNV0sXG4gICAgICBbMzAsIDQ2LCAxNiwgMiwgNDcsIDE3XSxcblxuICAgICAgLy8gMjVcbiAgICAgIFs4LCAxMzIsIDEwNiwgNCwgMTMzLCAxMDddLFxuICAgICAgWzgsIDc1LCA0NywgMTMsIDc2LCA0OF0sXG4gICAgICBbNywgNTQsIDI0LCAyMiwgNTUsIDI1XSxcbiAgICAgIFsyMiwgNDUsIDE1LCAxMywgNDYsIDE2XSxcblxuICAgICAgLy8gMjZcbiAgICAgIFsxMCwgMTQyLCAxMTQsIDIsIDE0MywgMTE1XSxcbiAgICAgIFsxOSwgNzQsIDQ2LCA0LCA3NSwgNDddLFxuICAgICAgWzI4LCA1MCwgMjIsIDYsIDUxLCAyM10sXG4gICAgICBbMzMsIDQ2LCAxNiwgNCwgNDcsIDE3XSxcblxuICAgICAgLy8gMjdcbiAgICAgIFs4LCAxNTIsIDEyMiwgNCwgMTUzLCAxMjNdLFxuICAgICAgWzIyLCA3MywgNDUsIDMsIDc0LCA0Nl0sXG4gICAgICBbOCwgNTMsIDIzLCAyNiwgNTQsIDI0XSxcbiAgICAgIFsxMiwgNDUsIDE1LCAyOCwgNDYsIDE2XSxcblxuICAgICAgLy8gMjhcbiAgICAgIFszLCAxNDcsIDExNywgMTAsIDE0OCwgMTE4XSxcbiAgICAgIFszLCA3MywgNDUsIDIzLCA3NCwgNDZdLFxuICAgICAgWzQsIDU0LCAyNCwgMzEsIDU1LCAyNV0sXG4gICAgICBbMTEsIDQ1LCAxNSwgMzEsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDI5XG4gICAgICBbNywgMTQ2LCAxMTYsIDcsIDE0NywgMTE3XSxcbiAgICAgIFsyMSwgNzMsIDQ1LCA3LCA3NCwgNDZdLFxuICAgICAgWzEsIDUzLCAyMywgMzcsIDU0LCAyNF0sXG4gICAgICBbMTksIDQ1LCAxNSwgMjYsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDMwXG4gICAgICBbNSwgMTQ1LCAxMTUsIDEwLCAxNDYsIDExNl0sXG4gICAgICBbMTksIDc1LCA0NywgMTAsIDc2LCA0OF0sXG4gICAgICBbMTUsIDU0LCAyNCwgMjUsIDU1LCAyNV0sXG4gICAgICBbMjMsIDQ1LCAxNSwgMjUsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDMxXG4gICAgICBbMTMsIDE0NSwgMTE1LCAzLCAxNDYsIDExNl0sXG4gICAgICBbMiwgNzQsIDQ2LCAyOSwgNzUsIDQ3XSxcbiAgICAgIFs0MiwgNTQsIDI0LCAxLCA1NSwgMjVdLFxuICAgICAgWzIzLCA0NSwgMTUsIDI4LCA0NiwgMTZdLFxuXG4gICAgICAvLyAzMlxuICAgICAgWzE3LCAxNDUsIDExNV0sXG4gICAgICBbMTAsIDc0LCA0NiwgMjMsIDc1LCA0N10sXG4gICAgICBbMTAsIDU0LCAyNCwgMzUsIDU1LCAyNV0sXG4gICAgICBbMTksIDQ1LCAxNSwgMzUsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDMzXG4gICAgICBbMTcsIDE0NSwgMTE1LCAxLCAxNDYsIDExNl0sXG4gICAgICBbMTQsIDc0LCA0NiwgMjEsIDc1LCA0N10sXG4gICAgICBbMjksIDU0LCAyNCwgMTksIDU1LCAyNV0sXG4gICAgICBbMTEsIDQ1LCAxNSwgNDYsIDQ2LCAxNl0sXG5cbiAgICAgIC8vIDM0XG4gICAgICBbMTMsIDE0NSwgMTE1LCA2LCAxNDYsIDExNl0sXG4gICAgICBbMTQsIDc0LCA0NiwgMjMsIDc1LCA0N10sXG4gICAgICBbNDQsIDU0LCAyNCwgNywgNTUsIDI1XSxcbiAgICAgIFs1OSwgNDYsIDE2LCAxLCA0NywgMTddLFxuXG4gICAgICAvLyAzNVxuICAgICAgWzEyLCAxNTEsIDEyMSwgNywgMTUyLCAxMjJdLFxuICAgICAgWzEyLCA3NSwgNDcsIDI2LCA3NiwgNDhdLFxuICAgICAgWzM5LCA1NCwgMjQsIDE0LCA1NSwgMjVdLFxuICAgICAgWzIyLCA0NSwgMTUsIDQxLCA0NiwgMTZdLFxuXG4gICAgICAvLyAzNlxuICAgICAgWzYsIDE1MSwgMTIxLCAxNCwgMTUyLCAxMjJdLFxuICAgICAgWzYsIDc1LCA0NywgMzQsIDc2LCA0OF0sXG4gICAgICBbNDYsIDU0LCAyNCwgMTAsIDU1LCAyNV0sXG4gICAgICBbMiwgNDUsIDE1LCA2NCwgNDYsIDE2XSxcblxuICAgICAgLy8gMzdcbiAgICAgIFsxNywgMTUyLCAxMjIsIDQsIDE1MywgMTIzXSxcbiAgICAgIFsyOSwgNzQsIDQ2LCAxNCwgNzUsIDQ3XSxcbiAgICAgIFs0OSwgNTQsIDI0LCAxMCwgNTUsIDI1XSxcbiAgICAgIFsyNCwgNDUsIDE1LCA0NiwgNDYsIDE2XSxcblxuICAgICAgLy8gMzhcbiAgICAgIFs0LCAxNTIsIDEyMiwgMTgsIDE1MywgMTIzXSxcbiAgICAgIFsxMywgNzQsIDQ2LCAzMiwgNzUsIDQ3XSxcbiAgICAgIFs0OCwgNTQsIDI0LCAxNCwgNTUsIDI1XSxcbiAgICAgIFs0MiwgNDUsIDE1LCAzMiwgNDYsIDE2XSxcblxuICAgICAgLy8gMzlcbiAgICAgIFsyMCwgMTQ3LCAxMTcsIDQsIDE0OCwgMTE4XSxcbiAgICAgIFs0MCwgNzUsIDQ3LCA3LCA3NiwgNDhdLFxuICAgICAgWzQzLCA1NCwgMjQsIDIyLCA1NSwgMjVdLFxuICAgICAgWzEwLCA0NSwgMTUsIDY3LCA0NiwgMTZdLFxuXG4gICAgICAvLyA0MFxuICAgICAgWzE5LCAxNDgsIDExOCwgNiwgMTQ5LCAxMTldLFxuICAgICAgWzE4LCA3NSwgNDcsIDMxLCA3NiwgNDhdLFxuICAgICAgWzM0LCA1NCwgMjQsIDM0LCA1NSwgMjVdLFxuICAgICAgWzIwLCA0NSwgMTUsIDYxLCA0NiwgMTZdXG4gICAgXTtcblxuICAgIHZhciBxclJTQmxvY2sgPSBmdW5jdGlvbih0b3RhbENvdW50LCBkYXRhQ291bnQpIHtcbiAgICAgIHZhciBfdGhpcyA9IHt9O1xuICAgICAgX3RoaXMudG90YWxDb3VudCA9IHRvdGFsQ291bnQ7XG4gICAgICBfdGhpcy5kYXRhQ291bnQgPSBkYXRhQ291bnQ7XG4gICAgICByZXR1cm4gX3RoaXM7XG4gICAgfTtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgdmFyIGdldFJzQmxvY2tUYWJsZSA9IGZ1bmN0aW9uKHR5cGVOdW1iZXIsIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XG5cbiAgICAgIHN3aXRjaChlcnJvckNvcnJlY3Rpb25MZXZlbCkge1xuICAgICAgY2FzZSBRUkVycm9yQ29ycmVjdGlvbkxldmVsLkwgOlxuICAgICAgICByZXR1cm4gUlNfQkxPQ0tfVEFCTEVbKHR5cGVOdW1iZXIgLSAxKSAqIDQgKyAwXTtcbiAgICAgIGNhc2UgUVJFcnJvckNvcnJlY3Rpb25MZXZlbC5NIDpcbiAgICAgICAgcmV0dXJuIFJTX0JMT0NLX1RBQkxFWyh0eXBlTnVtYmVyIC0gMSkgKiA0ICsgMV07XG4gICAgICBjYXNlIFFSRXJyb3JDb3JyZWN0aW9uTGV2ZWwuUSA6XG4gICAgICAgIHJldHVybiBSU19CTE9DS19UQUJMRVsodHlwZU51bWJlciAtIDEpICogNCArIDJdO1xuICAgICAgY2FzZSBRUkVycm9yQ29ycmVjdGlvbkxldmVsLkggOlxuICAgICAgICByZXR1cm4gUlNfQkxPQ0tfVEFCTEVbKHR5cGVOdW1iZXIgLSAxKSAqIDQgKyAzXTtcbiAgICAgIGRlZmF1bHQgOlxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBfdGhpcy5nZXRSU0Jsb2NrcyA9IGZ1bmN0aW9uKHR5cGVOdW1iZXIsIGVycm9yQ29ycmVjdGlvbkxldmVsKSB7XG5cbiAgICAgIHZhciByc0Jsb2NrID0gZ2V0UnNCbG9ja1RhYmxlKHR5cGVOdW1iZXIsIGVycm9yQ29ycmVjdGlvbkxldmVsKTtcblxuICAgICAgaWYgKHR5cGVvZiByc0Jsb2NrID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRocm93ICdiYWQgcnMgYmxvY2sgQCB0eXBlTnVtYmVyOicgKyB0eXBlTnVtYmVyICtcbiAgICAgICAgICAgICcvZXJyb3JDb3JyZWN0aW9uTGV2ZWw6JyArIGVycm9yQ29ycmVjdGlvbkxldmVsO1xuICAgICAgfVxuXG4gICAgICB2YXIgbGVuZ3RoID0gcnNCbG9jay5sZW5ndGggLyAzO1xuXG4gICAgICB2YXIgbGlzdCA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG5cbiAgICAgICAgdmFyIGNvdW50ID0gcnNCbG9ja1tpICogMyArIDBdO1xuICAgICAgICB2YXIgdG90YWxDb3VudCA9IHJzQmxvY2tbaSAqIDMgKyAxXTtcbiAgICAgICAgdmFyIGRhdGFDb3VudCA9IHJzQmxvY2tbaSAqIDMgKyAyXTtcblxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNvdW50OyBqICs9IDEpIHtcbiAgICAgICAgICBsaXN0LnB1c2gocXJSU0Jsb2NrKHRvdGFsQ291bnQsIGRhdGFDb3VudCkgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbGlzdDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9KCk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gcXJCaXRCdWZmZXJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgcXJCaXRCdWZmZXIgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBfYnVmZmVyID0gW107XG4gICAgdmFyIF9sZW5ndGggPSAwO1xuXG4gICAgdmFyIF90aGlzID0ge307XG5cbiAgICBfdGhpcy5nZXRCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfYnVmZmVyO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRBdCA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICB2YXIgYnVmSW5kZXggPSBNYXRoLmZsb29yKGluZGV4IC8gOCk7XG4gICAgICByZXR1cm4gKCAoX2J1ZmZlcltidWZJbmRleF0gPj4+ICg3IC0gaW5kZXggJSA4KSApICYgMSkgPT0gMTtcbiAgICB9O1xuXG4gICAgX3RoaXMucHV0ID0gZnVuY3Rpb24obnVtLCBsZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgX3RoaXMucHV0Qml0KCAoIChudW0gPj4+IChsZW5ndGggLSBpIC0gMSkgKSAmIDEpID09IDEpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBfdGhpcy5nZXRMZW5ndGhJbkJpdHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfbGVuZ3RoO1xuICAgIH07XG5cbiAgICBfdGhpcy5wdXRCaXQgPSBmdW5jdGlvbihiaXQpIHtcblxuICAgICAgdmFyIGJ1ZkluZGV4ID0gTWF0aC5mbG9vcihfbGVuZ3RoIC8gOCk7XG4gICAgICBpZiAoX2J1ZmZlci5sZW5ndGggPD0gYnVmSW5kZXgpIHtcbiAgICAgICAgX2J1ZmZlci5wdXNoKDApO1xuICAgICAgfVxuXG4gICAgICBpZiAoYml0KSB7XG4gICAgICAgIF9idWZmZXJbYnVmSW5kZXhdIHw9ICgweDgwID4+PiAoX2xlbmd0aCAlIDgpICk7XG4gICAgICB9XG5cbiAgICAgIF9sZW5ndGggKz0gMTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIHFyTnVtYmVyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIHFyTnVtYmVyID0gZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgdmFyIF9tb2RlID0gUVJNb2RlLk1PREVfTlVNQkVSO1xuICAgIHZhciBfZGF0YSA9IGRhdGE7XG5cbiAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgIF90aGlzLmdldE1vZGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfbW9kZTtcbiAgICB9O1xuXG4gICAgX3RoaXMuZ2V0TGVuZ3RoID0gZnVuY3Rpb24oYnVmZmVyKSB7XG4gICAgICByZXR1cm4gX2RhdGEubGVuZ3RoO1xuICAgIH07XG5cbiAgICBfdGhpcy53cml0ZSA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuXG4gICAgICB2YXIgZGF0YSA9IF9kYXRhO1xuXG4gICAgICB2YXIgaSA9IDA7XG5cbiAgICAgIHdoaWxlIChpICsgMiA8IGRhdGEubGVuZ3RoKSB7XG4gICAgICAgIGJ1ZmZlci5wdXQoc3RyVG9OdW0oZGF0YS5zdWJzdHJpbmcoaSwgaSArIDMpICksIDEwKTtcbiAgICAgICAgaSArPSAzO1xuICAgICAgfVxuXG4gICAgICBpZiAoaSA8IGRhdGEubGVuZ3RoKSB7XG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCAtIGkgPT0gMSkge1xuICAgICAgICAgIGJ1ZmZlci5wdXQoc3RyVG9OdW0oZGF0YS5zdWJzdHJpbmcoaSwgaSArIDEpICksIDQpO1xuICAgICAgICB9IGVsc2UgaWYgKGRhdGEubGVuZ3RoIC0gaSA9PSAyKSB7XG4gICAgICAgICAgYnVmZmVyLnB1dChzdHJUb051bShkYXRhLnN1YnN0cmluZyhpLCBpICsgMikgKSwgNyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHN0clRvTnVtID0gZnVuY3Rpb24ocykge1xuICAgICAgdmFyIG51bSA9IDA7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgbnVtID0gbnVtICogMTAgKyBjaGF0VG9OdW0ocy5jaGFyQXQoaSkgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudW07XG4gICAgfTtcblxuICAgIHZhciBjaGF0VG9OdW0gPSBmdW5jdGlvbihjKSB7XG4gICAgICBpZiAoJzAnIDw9IGMgJiYgYyA8PSAnOScpIHtcbiAgICAgICAgcmV0dXJuIGMuY2hhckNvZGVBdCgwKSAtICcwJy5jaGFyQ29kZUF0KDApO1xuICAgICAgfVxuICAgICAgdGhyb3cgJ2lsbGVnYWwgY2hhciA6JyArIGM7XG4gICAgfTtcblxuICAgIHJldHVybiBfdGhpcztcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBxckFscGhhTnVtXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIHFyQWxwaGFOdW0gPSBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICB2YXIgX21vZGUgPSBRUk1vZGUuTU9ERV9BTFBIQV9OVU07XG4gICAgdmFyIF9kYXRhID0gZGF0YTtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgX3RoaXMuZ2V0TW9kZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9tb2RlO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRMZW5ndGggPSBmdW5jdGlvbihidWZmZXIpIHtcbiAgICAgIHJldHVybiBfZGF0YS5sZW5ndGg7XG4gICAgfTtcblxuICAgIF90aGlzLndyaXRlID0gZnVuY3Rpb24oYnVmZmVyKSB7XG5cbiAgICAgIHZhciBzID0gX2RhdGE7XG5cbiAgICAgIHZhciBpID0gMDtcblxuICAgICAgd2hpbGUgKGkgKyAxIDwgcy5sZW5ndGgpIHtcbiAgICAgICAgYnVmZmVyLnB1dChcbiAgICAgICAgICBnZXRDb2RlKHMuY2hhckF0KGkpICkgKiA0NSArXG4gICAgICAgICAgZ2V0Q29kZShzLmNoYXJBdChpICsgMSkgKSwgMTEpO1xuICAgICAgICBpICs9IDI7XG4gICAgICB9XG5cbiAgICAgIGlmIChpIDwgcy5sZW5ndGgpIHtcbiAgICAgICAgYnVmZmVyLnB1dChnZXRDb2RlKHMuY2hhckF0KGkpICksIDYpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZ2V0Q29kZSA9IGZ1bmN0aW9uKGMpIHtcblxuICAgICAgaWYgKCcwJyA8PSBjICYmIGMgPD0gJzknKSB7XG4gICAgICAgIHJldHVybiBjLmNoYXJDb2RlQXQoMCkgLSAnMCcuY2hhckNvZGVBdCgwKTtcbiAgICAgIH0gZWxzZSBpZiAoJ0EnIDw9IGMgJiYgYyA8PSAnWicpIHtcbiAgICAgICAgcmV0dXJuIGMuY2hhckNvZGVBdCgwKSAtICdBJy5jaGFyQ29kZUF0KDApICsgMTA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzd2l0Y2ggKGMpIHtcbiAgICAgICAgY2FzZSAnICcgOiByZXR1cm4gMzY7XG4gICAgICAgIGNhc2UgJyQnIDogcmV0dXJuIDM3O1xuICAgICAgICBjYXNlICclJyA6IHJldHVybiAzODtcbiAgICAgICAgY2FzZSAnKicgOiByZXR1cm4gMzk7XG4gICAgICAgIGNhc2UgJysnIDogcmV0dXJuIDQwO1xuICAgICAgICBjYXNlICctJyA6IHJldHVybiA0MTtcbiAgICAgICAgY2FzZSAnLicgOiByZXR1cm4gNDI7XG4gICAgICAgIGNhc2UgJy8nIDogcmV0dXJuIDQzO1xuICAgICAgICBjYXNlICc6JyA6IHJldHVybiA0NDtcbiAgICAgICAgZGVmYXVsdCA6XG4gICAgICAgICAgdGhyb3cgJ2lsbGVnYWwgY2hhciA6JyArIGM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIHFyOEJpdEJ5dGVcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgcXI4Qml0Qnl0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgIHZhciBfbW9kZSA9IFFSTW9kZS5NT0RFXzhCSVRfQllURTtcbiAgICB2YXIgX2RhdGEgPSBkYXRhO1xuICAgIHZhciBfYnl0ZXMgPSBxcmNvZGUuc3RyaW5nVG9CeXRlcyhkYXRhKTtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgX3RoaXMuZ2V0TW9kZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9tb2RlO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRMZW5ndGggPSBmdW5jdGlvbihidWZmZXIpIHtcbiAgICAgIHJldHVybiBfYnl0ZXMubGVuZ3RoO1xuICAgIH07XG5cbiAgICBfdGhpcy53cml0ZSA9IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfYnl0ZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgYnVmZmVyLnB1dChfYnl0ZXNbaV0sIDgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gcXJLYW5qaVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBxckthbmppID0gZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgdmFyIF9tb2RlID0gUVJNb2RlLk1PREVfS0FOSkk7XG4gICAgdmFyIF9kYXRhID0gZGF0YTtcblxuICAgIHZhciBzdHJpbmdUb0J5dGVzID0gcXJjb2RlLnN0cmluZ1RvQnl0ZXNGdW5jc1snU0pJUyddO1xuICAgIGlmICghc3RyaW5nVG9CeXRlcykge1xuICAgICAgdGhyb3cgJ3NqaXMgbm90IHN1cHBvcnRlZC4nO1xuICAgIH1cbiAgICAhZnVuY3Rpb24oYywgY29kZSkge1xuICAgICAgLy8gc2VsZiB0ZXN0IGZvciBzamlzIHN1cHBvcnQuXG4gICAgICB2YXIgdGVzdCA9IHN0cmluZ1RvQnl0ZXMoYyk7XG4gICAgICBpZiAodGVzdC5sZW5ndGggIT0gMiB8fCAoICh0ZXN0WzBdIDw8IDgpIHwgdGVzdFsxXSkgIT0gY29kZSkge1xuICAgICAgICB0aHJvdyAnc2ppcyBub3Qgc3VwcG9ydGVkLic7XG4gICAgICB9XG4gICAgfSgnXFx1NTNjYicsIDB4OTc0Nik7XG5cbiAgICB2YXIgX2J5dGVzID0gc3RyaW5nVG9CeXRlcyhkYXRhKTtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgX3RoaXMuZ2V0TW9kZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9tb2RlO1xuICAgIH07XG5cbiAgICBfdGhpcy5nZXRMZW5ndGggPSBmdW5jdGlvbihidWZmZXIpIHtcbiAgICAgIHJldHVybiB+fihfYnl0ZXMubGVuZ3RoIC8gMik7XG4gICAgfTtcblxuICAgIF90aGlzLndyaXRlID0gZnVuY3Rpb24oYnVmZmVyKSB7XG5cbiAgICAgIHZhciBkYXRhID0gX2J5dGVzO1xuXG4gICAgICB2YXIgaSA9IDA7XG5cbiAgICAgIHdoaWxlIChpICsgMSA8IGRhdGEubGVuZ3RoKSB7XG5cbiAgICAgICAgdmFyIGMgPSAoICgweGZmICYgZGF0YVtpXSkgPDwgOCkgfCAoMHhmZiAmIGRhdGFbaSArIDFdKTtcblxuICAgICAgICBpZiAoMHg4MTQwIDw9IGMgJiYgYyA8PSAweDlGRkMpIHtcbiAgICAgICAgICBjIC09IDB4ODE0MDtcbiAgICAgICAgfSBlbHNlIGlmICgweEUwNDAgPD0gYyAmJiBjIDw9IDB4RUJCRikge1xuICAgICAgICAgIGMgLT0gMHhDMTQwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93ICdpbGxlZ2FsIGNoYXIgYXQgJyArIChpICsgMSkgKyAnLycgKyBjO1xuICAgICAgICB9XG5cbiAgICAgICAgYyA9ICggKGMgPj4+IDgpICYgMHhmZikgKiAweEMwICsgKGMgJiAweGZmKTtcblxuICAgICAgICBidWZmZXIucHV0KGMsIDEzKTtcblxuICAgICAgICBpICs9IDI7XG4gICAgICB9XG5cbiAgICAgIGlmIChpIDwgZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgJ2lsbGVnYWwgY2hhciBhdCAnICsgKGkgKyAxKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9O1xuXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIEdJRiBTdXBwb3J0IGV0Yy5cbiAgLy9cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBieXRlQXJyYXlPdXRwdXRTdHJlYW1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgYnl0ZUFycmF5T3V0cHV0U3RyZWFtID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgX2J5dGVzID0gW107XG5cbiAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgIF90aGlzLndyaXRlQnl0ZSA9IGZ1bmN0aW9uKGIpIHtcbiAgICAgIF9ieXRlcy5wdXNoKGIgJiAweGZmKTtcbiAgICB9O1xuXG4gICAgX3RoaXMud3JpdGVTaG9ydCA9IGZ1bmN0aW9uKGkpIHtcbiAgICAgIF90aGlzLndyaXRlQnl0ZShpKTtcbiAgICAgIF90aGlzLndyaXRlQnl0ZShpID4+PiA4KTtcbiAgICB9O1xuXG4gICAgX3RoaXMud3JpdGVCeXRlcyA9IGZ1bmN0aW9uKGIsIG9mZiwgbGVuKSB7XG4gICAgICBvZmYgPSBvZmYgfHwgMDtcbiAgICAgIGxlbiA9IGxlbiB8fCBiLmxlbmd0aDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgX3RoaXMud3JpdGVCeXRlKGJbaSArIG9mZl0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBfdGhpcy53cml0ZVN0cmluZyA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBfdGhpcy53cml0ZUJ5dGUocy5jaGFyQ29kZUF0KGkpICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIF90aGlzLnRvQnl0ZUFycmF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX2J5dGVzO1xuICAgIH07XG5cbiAgICBfdGhpcy50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHMgPSAnJztcbiAgICAgIHMgKz0gJ1snO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfYnl0ZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgcyArPSAnLCc7XG4gICAgICAgIH1cbiAgICAgICAgcyArPSBfYnl0ZXNbaV07XG4gICAgICB9XG4gICAgICBzICs9ICddJztcbiAgICAgIHJldHVybiBzO1xuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gYmFzZTY0RW5jb2RlT3V0cHV0U3RyZWFtXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIGJhc2U2NEVuY29kZU91dHB1dFN0cmVhbSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIF9idWZmZXIgPSAwO1xuICAgIHZhciBfYnVmbGVuID0gMDtcbiAgICB2YXIgX2xlbmd0aCA9IDA7XG4gICAgdmFyIF9iYXNlNjQgPSAnJztcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgdmFyIHdyaXRlRW5jb2RlZCA9IGZ1bmN0aW9uKGIpIHtcbiAgICAgIF9iYXNlNjQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShlbmNvZGUoYiAmIDB4M2YpICk7XG4gICAgfTtcblxuICAgIHZhciBlbmNvZGUgPSBmdW5jdGlvbihuKSB7XG4gICAgICBpZiAobiA8IDApIHtcbiAgICAgICAgLy8gZXJyb3IuXG4gICAgICB9IGVsc2UgaWYgKG4gPCAyNikge1xuICAgICAgICByZXR1cm4gMHg0MSArIG47XG4gICAgICB9IGVsc2UgaWYgKG4gPCA1Mikge1xuICAgICAgICByZXR1cm4gMHg2MSArIChuIC0gMjYpO1xuICAgICAgfSBlbHNlIGlmIChuIDwgNjIpIHtcbiAgICAgICAgcmV0dXJuIDB4MzAgKyAobiAtIDUyKTtcbiAgICAgIH0gZWxzZSBpZiAobiA9PSA2Mikge1xuICAgICAgICByZXR1cm4gMHgyYjtcbiAgICAgIH0gZWxzZSBpZiAobiA9PSA2Mykge1xuICAgICAgICByZXR1cm4gMHgyZjtcbiAgICAgIH1cbiAgICAgIHRocm93ICduOicgKyBuO1xuICAgIH07XG5cbiAgICBfdGhpcy53cml0ZUJ5dGUgPSBmdW5jdGlvbihuKSB7XG5cbiAgICAgIF9idWZmZXIgPSAoX2J1ZmZlciA8PCA4KSB8IChuICYgMHhmZik7XG4gICAgICBfYnVmbGVuICs9IDg7XG4gICAgICBfbGVuZ3RoICs9IDE7XG5cbiAgICAgIHdoaWxlIChfYnVmbGVuID49IDYpIHtcbiAgICAgICAgd3JpdGVFbmNvZGVkKF9idWZmZXIgPj4+IChfYnVmbGVuIC0gNikgKTtcbiAgICAgICAgX2J1ZmxlbiAtPSA2O1xuICAgICAgfVxuICAgIH07XG5cbiAgICBfdGhpcy5mbHVzaCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICBpZiAoX2J1ZmxlbiA+IDApIHtcbiAgICAgICAgd3JpdGVFbmNvZGVkKF9idWZmZXIgPDwgKDYgLSBfYnVmbGVuKSApO1xuICAgICAgICBfYnVmZmVyID0gMDtcbiAgICAgICAgX2J1ZmxlbiA9IDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChfbGVuZ3RoICUgMyAhPSAwKSB7XG4gICAgICAgIC8vIHBhZGRpbmdcbiAgICAgICAgdmFyIHBhZGxlbiA9IDMgLSBfbGVuZ3RoICUgMztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYWRsZW47IGkgKz0gMSkge1xuICAgICAgICAgIF9iYXNlNjQgKz0gJz0nO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIF90aGlzLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gX2Jhc2U2NDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIF90aGlzO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGJhc2U2NERlY29kZUlucHV0U3RyZWFtXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIGJhc2U2NERlY29kZUlucHV0U3RyZWFtID0gZnVuY3Rpb24oc3RyKSB7XG5cbiAgICB2YXIgX3N0ciA9IHN0cjtcbiAgICB2YXIgX3BvcyA9IDA7XG4gICAgdmFyIF9idWZmZXIgPSAwO1xuICAgIHZhciBfYnVmbGVuID0gMDtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgX3RoaXMucmVhZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICB3aGlsZSAoX2J1ZmxlbiA8IDgpIHtcblxuICAgICAgICBpZiAoX3BvcyA+PSBfc3RyLmxlbmd0aCkge1xuICAgICAgICAgIGlmIChfYnVmbGVuID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhyb3cgJ3VuZXhwZWN0ZWQgZW5kIG9mIGZpbGUuLycgKyBfYnVmbGVuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGMgPSBfc3RyLmNoYXJBdChfcG9zKTtcbiAgICAgICAgX3BvcyArPSAxO1xuXG4gICAgICAgIGlmIChjID09ICc9Jykge1xuICAgICAgICAgIF9idWZsZW4gPSAwO1xuICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfSBlbHNlIGlmIChjLm1hdGNoKC9eXFxzJC8pICkge1xuICAgICAgICAgIC8vIGlnbm9yZSBpZiB3aGl0ZXNwYWNlLlxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgX2J1ZmZlciA9IChfYnVmZmVyIDw8IDYpIHwgZGVjb2RlKGMuY2hhckNvZGVBdCgwKSApO1xuICAgICAgICBfYnVmbGVuICs9IDY7XG4gICAgICB9XG5cbiAgICAgIHZhciBuID0gKF9idWZmZXIgPj4+IChfYnVmbGVuIC0gOCkgKSAmIDB4ZmY7XG4gICAgICBfYnVmbGVuIC09IDg7XG4gICAgICByZXR1cm4gbjtcbiAgICB9O1xuXG4gICAgdmFyIGRlY29kZSA9IGZ1bmN0aW9uKGMpIHtcbiAgICAgIGlmICgweDQxIDw9IGMgJiYgYyA8PSAweDVhKSB7XG4gICAgICAgIHJldHVybiBjIC0gMHg0MTtcbiAgICAgIH0gZWxzZSBpZiAoMHg2MSA8PSBjICYmIGMgPD0gMHg3YSkge1xuICAgICAgICByZXR1cm4gYyAtIDB4NjEgKyAyNjtcbiAgICAgIH0gZWxzZSBpZiAoMHgzMCA8PSBjICYmIGMgPD0gMHgzOSkge1xuICAgICAgICByZXR1cm4gYyAtIDB4MzAgKyA1MjtcbiAgICAgIH0gZWxzZSBpZiAoYyA9PSAweDJiKSB7XG4gICAgICAgIHJldHVybiA2MjtcbiAgICAgIH0gZWxzZSBpZiAoYyA9PSAweDJmKSB7XG4gICAgICAgIHJldHVybiA2MztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93ICdjOicgKyBjO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gZ2lmSW1hZ2UgKEIvVylcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgZ2lmSW1hZ2UgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG5cbiAgICB2YXIgX3dpZHRoID0gd2lkdGg7XG4gICAgdmFyIF9oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdmFyIF9kYXRhID0gbmV3IEFycmF5KHdpZHRoICogaGVpZ2h0KTtcblxuICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgX3RoaXMuc2V0UGl4ZWwgPSBmdW5jdGlvbih4LCB5LCBwaXhlbCkge1xuICAgICAgX2RhdGFbeSAqIF93aWR0aCArIHhdID0gcGl4ZWw7XG4gICAgfTtcblxuICAgIF90aGlzLndyaXRlID0gZnVuY3Rpb24ob3V0KSB7XG5cbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBHSUYgU2lnbmF0dXJlXG5cbiAgICAgIG91dC53cml0ZVN0cmluZygnR0lGODdhJyk7XG5cbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBTY3JlZW4gRGVzY3JpcHRvclxuXG4gICAgICBvdXQud3JpdGVTaG9ydChfd2lkdGgpO1xuICAgICAgb3V0LndyaXRlU2hvcnQoX2hlaWdodCk7XG5cbiAgICAgIG91dC53cml0ZUJ5dGUoMHg4MCk7IC8vIDJiaXRcbiAgICAgIG91dC53cml0ZUJ5dGUoMCk7XG4gICAgICBvdXQud3JpdGVCeXRlKDApO1xuXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gR2xvYmFsIENvbG9yIE1hcFxuXG4gICAgICAvLyBibGFja1xuICAgICAgb3V0LndyaXRlQnl0ZSgweDAwKTtcbiAgICAgIG91dC53cml0ZUJ5dGUoMHgwMCk7XG4gICAgICBvdXQud3JpdGVCeXRlKDB4MDApO1xuXG4gICAgICAvLyB3aGl0ZVxuICAgICAgb3V0LndyaXRlQnl0ZSgweGZmKTtcbiAgICAgIG91dC53cml0ZUJ5dGUoMHhmZik7XG4gICAgICBvdXQud3JpdGVCeXRlKDB4ZmYpO1xuXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gSW1hZ2UgRGVzY3JpcHRvclxuXG4gICAgICBvdXQud3JpdGVTdHJpbmcoJywnKTtcbiAgICAgIG91dC53cml0ZVNob3J0KDApO1xuICAgICAgb3V0LndyaXRlU2hvcnQoMCk7XG4gICAgICBvdXQud3JpdGVTaG9ydChfd2lkdGgpO1xuICAgICAgb3V0LndyaXRlU2hvcnQoX2hlaWdodCk7XG4gICAgICBvdXQud3JpdGVCeXRlKDApO1xuXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgLy8gTG9jYWwgQ29sb3IgTWFwXG5cbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBSYXN0ZXIgRGF0YVxuXG4gICAgICB2YXIgbHp3TWluQ29kZVNpemUgPSAyO1xuICAgICAgdmFyIHJhc3RlciA9IGdldExaV1Jhc3RlcihsendNaW5Db2RlU2l6ZSk7XG5cbiAgICAgIG91dC53cml0ZUJ5dGUobHp3TWluQ29kZVNpemUpO1xuXG4gICAgICB2YXIgb2Zmc2V0ID0gMDtcblxuICAgICAgd2hpbGUgKHJhc3Rlci5sZW5ndGggLSBvZmZzZXQgPiAyNTUpIHtcbiAgICAgICAgb3V0LndyaXRlQnl0ZSgyNTUpO1xuICAgICAgICBvdXQud3JpdGVCeXRlcyhyYXN0ZXIsIG9mZnNldCwgMjU1KTtcbiAgICAgICAgb2Zmc2V0ICs9IDI1NTtcbiAgICAgIH1cblxuICAgICAgb3V0LndyaXRlQnl0ZShyYXN0ZXIubGVuZ3RoIC0gb2Zmc2V0KTtcbiAgICAgIG91dC53cml0ZUJ5dGVzKHJhc3Rlciwgb2Zmc2V0LCByYXN0ZXIubGVuZ3RoIC0gb2Zmc2V0KTtcbiAgICAgIG91dC53cml0ZUJ5dGUoMHgwMCk7XG5cbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBHSUYgVGVybWluYXRvclxuICAgICAgb3V0LndyaXRlU3RyaW5nKCc7Jyk7XG4gICAgfTtcblxuICAgIHZhciBiaXRPdXRwdXRTdHJlYW0gPSBmdW5jdGlvbihvdXQpIHtcblxuICAgICAgdmFyIF9vdXQgPSBvdXQ7XG4gICAgICB2YXIgX2JpdExlbmd0aCA9IDA7XG4gICAgICB2YXIgX2JpdEJ1ZmZlciA9IDA7XG5cbiAgICAgIHZhciBfdGhpcyA9IHt9O1xuXG4gICAgICBfdGhpcy53cml0ZSA9IGZ1bmN0aW9uKGRhdGEsIGxlbmd0aCkge1xuXG4gICAgICAgIGlmICggKGRhdGEgPj4+IGxlbmd0aCkgIT0gMCkge1xuICAgICAgICAgIHRocm93ICdsZW5ndGggb3Zlcic7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoX2JpdExlbmd0aCArIGxlbmd0aCA+PSA4KSB7XG4gICAgICAgICAgX291dC53cml0ZUJ5dGUoMHhmZiAmICggKGRhdGEgPDwgX2JpdExlbmd0aCkgfCBfYml0QnVmZmVyKSApO1xuICAgICAgICAgIGxlbmd0aCAtPSAoOCAtIF9iaXRMZW5ndGgpO1xuICAgICAgICAgIGRhdGEgPj4+PSAoOCAtIF9iaXRMZW5ndGgpO1xuICAgICAgICAgIF9iaXRCdWZmZXIgPSAwO1xuICAgICAgICAgIF9iaXRMZW5ndGggPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgX2JpdEJ1ZmZlciA9IChkYXRhIDw8IF9iaXRMZW5ndGgpIHwgX2JpdEJ1ZmZlcjtcbiAgICAgICAgX2JpdExlbmd0aCA9IF9iaXRMZW5ndGggKyBsZW5ndGg7XG4gICAgICB9O1xuXG4gICAgICBfdGhpcy5mbHVzaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoX2JpdExlbmd0aCA+IDApIHtcbiAgICAgICAgICBfb3V0LndyaXRlQnl0ZShfYml0QnVmZmVyKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH07XG5cbiAgICB2YXIgZ2V0TFpXUmFzdGVyID0gZnVuY3Rpb24obHp3TWluQ29kZVNpemUpIHtcblxuICAgICAgdmFyIGNsZWFyQ29kZSA9IDEgPDwgbHp3TWluQ29kZVNpemU7XG4gICAgICB2YXIgZW5kQ29kZSA9ICgxIDw8IGx6d01pbkNvZGVTaXplKSArIDE7XG4gICAgICB2YXIgYml0TGVuZ3RoID0gbHp3TWluQ29kZVNpemUgKyAxO1xuXG4gICAgICAvLyBTZXR1cCBMWldUYWJsZVxuICAgICAgdmFyIHRhYmxlID0gbHp3VGFibGUoKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGVhckNvZGU7IGkgKz0gMSkge1xuICAgICAgICB0YWJsZS5hZGQoU3RyaW5nLmZyb21DaGFyQ29kZShpKSApO1xuICAgICAgfVxuICAgICAgdGFibGUuYWRkKFN0cmluZy5mcm9tQ2hhckNvZGUoY2xlYXJDb2RlKSApO1xuICAgICAgdGFibGUuYWRkKFN0cmluZy5mcm9tQ2hhckNvZGUoZW5kQ29kZSkgKTtcblxuICAgICAgdmFyIGJ5dGVPdXQgPSBieXRlQXJyYXlPdXRwdXRTdHJlYW0oKTtcbiAgICAgIHZhciBiaXRPdXQgPSBiaXRPdXRwdXRTdHJlYW0oYnl0ZU91dCk7XG5cbiAgICAgIC8vIGNsZWFyIGNvZGVcbiAgICAgIGJpdE91dC53cml0ZShjbGVhckNvZGUsIGJpdExlbmd0aCk7XG5cbiAgICAgIHZhciBkYXRhSW5kZXggPSAwO1xuXG4gICAgICB2YXIgcyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoX2RhdGFbZGF0YUluZGV4XSk7XG4gICAgICBkYXRhSW5kZXggKz0gMTtcblxuICAgICAgd2hpbGUgKGRhdGFJbmRleCA8IF9kYXRhLmxlbmd0aCkge1xuXG4gICAgICAgIHZhciBjID0gU3RyaW5nLmZyb21DaGFyQ29kZShfZGF0YVtkYXRhSW5kZXhdKTtcbiAgICAgICAgZGF0YUluZGV4ICs9IDE7XG5cbiAgICAgICAgaWYgKHRhYmxlLmNvbnRhaW5zKHMgKyBjKSApIHtcblxuICAgICAgICAgIHMgPSBzICsgYztcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgYml0T3V0LndyaXRlKHRhYmxlLmluZGV4T2YocyksIGJpdExlbmd0aCk7XG5cbiAgICAgICAgICBpZiAodGFibGUuc2l6ZSgpIDwgMHhmZmYpIHtcblxuICAgICAgICAgICAgaWYgKHRhYmxlLnNpemUoKSA9PSAoMSA8PCBiaXRMZW5ndGgpICkge1xuICAgICAgICAgICAgICBiaXRMZW5ndGggKz0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGFibGUuYWRkKHMgKyBjKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzID0gYztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBiaXRPdXQud3JpdGUodGFibGUuaW5kZXhPZihzKSwgYml0TGVuZ3RoKTtcblxuICAgICAgLy8gZW5kIGNvZGVcbiAgICAgIGJpdE91dC53cml0ZShlbmRDb2RlLCBiaXRMZW5ndGgpO1xuXG4gICAgICBiaXRPdXQuZmx1c2goKTtcblxuICAgICAgcmV0dXJuIGJ5dGVPdXQudG9CeXRlQXJyYXkoKTtcbiAgICB9O1xuXG4gICAgdmFyIGx6d1RhYmxlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciBfbWFwID0ge307XG4gICAgICB2YXIgX3NpemUgPSAwO1xuXG4gICAgICB2YXIgX3RoaXMgPSB7fTtcblxuICAgICAgX3RoaXMuYWRkID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIGlmIChfdGhpcy5jb250YWlucyhrZXkpICkge1xuICAgICAgICAgIHRocm93ICdkdXAga2V5OicgKyBrZXk7XG4gICAgICAgIH1cbiAgICAgICAgX21hcFtrZXldID0gX3NpemU7XG4gICAgICAgIF9zaXplICs9IDE7XG4gICAgICB9O1xuXG4gICAgICBfdGhpcy5zaXplID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfc2l6ZTtcbiAgICAgIH07XG5cbiAgICAgIF90aGlzLmluZGV4T2YgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgcmV0dXJuIF9tYXBba2V5XTtcbiAgICAgIH07XG5cbiAgICAgIF90aGlzLmNvbnRhaW5zID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgX21hcFtrZXldICE9ICd1bmRlZmluZWQnO1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH07XG5cbiAgICByZXR1cm4gX3RoaXM7XG4gIH07XG5cbiAgdmFyIGNyZWF0ZURhdGFVUkwgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0LCBnZXRQaXhlbCkge1xuICAgIHZhciBnaWYgPSBnaWZJbWFnZSh3aWR0aCwgaGVpZ2h0KTtcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGhlaWdodDsgeSArPSAxKSB7XG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4ICs9IDEpIHtcbiAgICAgICAgZ2lmLnNldFBpeGVsKHgsIHksIGdldFBpeGVsKHgsIHkpICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGIgPSBieXRlQXJyYXlPdXRwdXRTdHJlYW0oKTtcbiAgICBnaWYud3JpdGUoYik7XG5cbiAgICB2YXIgYmFzZTY0ID0gYmFzZTY0RW5jb2RlT3V0cHV0U3RyZWFtKCk7XG4gICAgdmFyIGJ5dGVzID0gYi50b0J5dGVBcnJheSgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGJhc2U2NC53cml0ZUJ5dGUoYnl0ZXNbaV0pO1xuICAgIH1cbiAgICBiYXNlNjQuZmx1c2goKTtcblxuICAgIHJldHVybiAnZGF0YTppbWFnZS9naWY7YmFzZTY0LCcgKyBiYXNlNjQ7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gcmV0dXJucyBxcmNvZGUgZnVuY3Rpb24uXG5cbiAgcmV0dXJuIHFyY29kZTtcbn0oKTtcblxuLy8gbXVsdGlieXRlIHN1cHBvcnRcbiFmdW5jdGlvbigpIHtcblxuICBxcmNvZGUuc3RyaW5nVG9CeXRlc0Z1bmNzWydVVEYtOCddID0gZnVuY3Rpb24ocykge1xuICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTg3Mjk0MDUvaG93LXRvLWNvbnZlcnQtdXRmOC1zdHJpbmctdG8tYnl0ZS1hcnJheVxuICAgIGZ1bmN0aW9uIHRvVVRGOEFycmF5KHN0cikge1xuICAgICAgdmFyIHV0ZjggPSBbXTtcbiAgICAgIGZvciAodmFyIGk9MDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgY2hhcmNvZGUgPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgaWYgKGNoYXJjb2RlIDwgMHg4MCkgdXRmOC5wdXNoKGNoYXJjb2RlKTtcbiAgICAgICAgZWxzZSBpZiAoY2hhcmNvZGUgPCAweDgwMCkge1xuICAgICAgICAgIHV0ZjgucHVzaCgweGMwIHwgKGNoYXJjb2RlID4+IDYpLFxuICAgICAgICAgICAgICAweDgwIHwgKGNoYXJjb2RlICYgMHgzZikpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNoYXJjb2RlIDwgMHhkODAwIHx8IGNoYXJjb2RlID49IDB4ZTAwMCkge1xuICAgICAgICAgIHV0ZjgucHVzaCgweGUwIHwgKGNoYXJjb2RlID4+IDEyKSxcbiAgICAgICAgICAgICAgMHg4MCB8ICgoY2hhcmNvZGU+PjYpICYgMHgzZiksXG4gICAgICAgICAgICAgIDB4ODAgfCAoY2hhcmNvZGUgJiAweDNmKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc3Vycm9nYXRlIHBhaXJcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaSsrO1xuICAgICAgICAgIC8vIFVURi0xNiBlbmNvZGVzIDB4MTAwMDAtMHgxMEZGRkYgYnlcbiAgICAgICAgICAvLyBzdWJ0cmFjdGluZyAweDEwMDAwIGFuZCBzcGxpdHRpbmcgdGhlXG4gICAgICAgICAgLy8gMjAgYml0cyBvZiAweDAtMHhGRkZGRiBpbnRvIHR3byBoYWx2ZXNcbiAgICAgICAgICBjaGFyY29kZSA9IDB4MTAwMDAgKyAoKChjaGFyY29kZSAmIDB4M2ZmKTw8MTApXG4gICAgICAgICAgICB8IChzdHIuY2hhckNvZGVBdChpKSAmIDB4M2ZmKSk7XG4gICAgICAgICAgdXRmOC5wdXNoKDB4ZjAgfCAoY2hhcmNvZGUgPj4xOCksXG4gICAgICAgICAgICAgIDB4ODAgfCAoKGNoYXJjb2RlPj4xMikgJiAweDNmKSxcbiAgICAgICAgICAgICAgMHg4MCB8ICgoY2hhcmNvZGU+PjYpICYgMHgzZiksXG4gICAgICAgICAgICAgIDB4ODAgfCAoY2hhcmNvZGUgJiAweDNmKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB1dGY4O1xuICAgIH1cbiAgICByZXR1cm4gdG9VVEY4QXJyYXkocyk7XG4gIH07XG5cbn0oKTtcblxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgIGRlZmluZShbXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfVxufShmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHFyY29kZTtcbn0pKTtcbiIsImltcG9ydCB7IENvcm5lckRvdFR5cGVzIH0gZnJvbSBcIi4uL3R5cGVzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZG90OiBcImRvdFwiLFxuICBzcXVhcmU6IFwic3F1YXJlXCJcbn0gYXMgQ29ybmVyRG90VHlwZXM7XG4iLCJpbXBvcnQgeyBDb3JuZXJTcXVhcmVUeXBlcyB9IGZyb20gXCIuLi90eXBlc1wiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGRvdDogXCJkb3RcIixcbiAgc3F1YXJlOiBcInNxdWFyZVwiLFxuICBleHRyYVJvdW5kZWQ6IFwiZXh0cmEtcm91bmRlZFwiXG59IGFzIENvcm5lclNxdWFyZVR5cGVzO1xuIiwiaW1wb3J0IHsgRG90VHlwZXMgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBkb3RzOiBcImRvdHNcIixcbiAgcm91bmRlZDogXCJyb3VuZGVkXCIsXG4gIGNsYXNzeTogXCJjbGFzc3lcIixcbiAgY2xhc3N5Um91bmRlZDogXCJjbGFzc3ktcm91bmRlZFwiLFxuICBzcXVhcmU6IFwic3F1YXJlXCIsXG4gIGV4dHJhUm91bmRlZDogXCJleHRyYS1yb3VuZGVkXCJcbn0gYXMgRG90VHlwZXM7XG4iLCJpbXBvcnQgeyBEcmF3VHlwZXMgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBjYW52YXM6IFwiY2FudmFzXCIsXG4gIHN2ZzogXCJzdmdcIlxufSBhcyBEcmF3VHlwZXM7XG4iLCJpbXBvcnQgeyBFcnJvckNvcnJlY3Rpb25MZXZlbCB9IGZyb20gXCIuLi90eXBlc1wiO1xuXG5pbnRlcmZhY2UgRXJyb3JDb3JyZWN0aW9uTGV2ZWxzIHtcbiAgW2tleTogc3RyaW5nXTogRXJyb3JDb3JyZWN0aW9uTGV2ZWw7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgTDogXCJMXCIsXG4gIE06IFwiTVwiLFxuICBROiBcIlFcIixcbiAgSDogXCJIXCJcbn0gYXMgRXJyb3JDb3JyZWN0aW9uTGV2ZWxzO1xuIiwiaW50ZXJmYWNlIEVycm9yQ29ycmVjdGlvblBlcmNlbnRzIHtcbiAgW2tleTogc3RyaW5nXTogbnVtYmVyO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIEw6IDAuMDcsXG4gIE06IDAuMTUsXG4gIFE6IDAuMjUsXG4gIEg6IDAuM1xufSBhcyBFcnJvckNvcnJlY3Rpb25QZXJjZW50cztcbiIsImltcG9ydCB7IEdyYWRpZW50VHlwZXMgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICByYWRpYWw6IFwicmFkaWFsXCIsXG4gIGxpbmVhcjogXCJsaW5lYXJcIlxufSBhcyBHcmFkaWVudFR5cGVzO1xuIiwiaW1wb3J0IHsgTW9kZSB9IGZyb20gXCIuLi90eXBlc1wiO1xuXG5pbnRlcmZhY2UgTW9kZXMge1xuICBba2V5OiBzdHJpbmddOiBNb2RlO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG51bWVyaWM6IFwiTnVtZXJpY1wiLFxuICBhbHBoYW51bWVyaWM6IFwiQWxwaGFudW1lcmljXCIsXG4gIGJ5dGU6IFwiQnl0ZVwiLFxuICBrYW5qaTogXCJLYW5qaVwiXG59IGFzIE1vZGVzO1xuIiwiaW1wb3J0IHsgVHlwZU51bWJlciB9IGZyb20gXCIuLi90eXBlc1wiO1xuXG5pbnRlcmZhY2UgVHlwZXNNYXAge1xuICBba2V5OiBudW1iZXJdOiBUeXBlTnVtYmVyO1xufVxuXG5jb25zdCBxclR5cGVzOiBUeXBlc01hcCA9IHt9O1xuXG5mb3IgKGxldCB0eXBlID0gMDsgdHlwZSA8PSA0MDsgdHlwZSsrKSB7XG4gIHFyVHlwZXNbdHlwZV0gPSB0eXBlIGFzIFR5cGVOdW1iZXI7XG59XG5cbi8vIDAgdHlwZXMgaXMgYXV0b2RldGVjdFxuXG4vLyB0eXBlcyA9IHtcbi8vICAgICAwOiAwLFxuLy8gICAgIDE6IDEsXG4vLyAgICAgLi4uXG4vLyAgICAgNDA6IDQwXG4vLyB9XG5cbmV4cG9ydCBkZWZhdWx0IHFyVHlwZXM7XG4iLCJpbXBvcnQgY2FsY3VsYXRlSW1hZ2VTaXplIGZyb20gXCIuLi90b29scy9jYWxjdWxhdGVJbWFnZVNpemVcIjtcbmltcG9ydCBlcnJvckNvcnJlY3Rpb25QZXJjZW50cyBmcm9tIFwiLi4vY29uc3RhbnRzL2Vycm9yQ29ycmVjdGlvblBlcmNlbnRzXCI7XG5pbXBvcnQgUVJEb3QgZnJvbSBcIi4uL2ZpZ3VyZXMvZG90L2NhbnZhcy9RUkRvdFwiO1xuaW1wb3J0IFFSQ29ybmVyU3F1YXJlIGZyb20gXCIuLi9maWd1cmVzL2Nvcm5lclNxdWFyZS9jYW52YXMvUVJDb3JuZXJTcXVhcmVcIjtcbmltcG9ydCBRUkNvcm5lckRvdCBmcm9tIFwiLi4vZmlndXJlcy9jb3JuZXJEb3QvY2FudmFzL1FSQ29ybmVyRG90XCI7XG5pbXBvcnQgeyBSZXF1aXJlZE9wdGlvbnMgfSBmcm9tIFwiLi9RUk9wdGlvbnNcIjtcbmltcG9ydCBncmFkaWVudFR5cGVzIGZyb20gXCIuLi9jb25zdGFudHMvZ3JhZGllbnRUeXBlc1wiO1xuaW1wb3J0IHsgUVJDb2RlLCBHcmFkaWVudCwgRmlsdGVyRnVuY3Rpb24gfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuY29uc3Qgc3F1YXJlTWFzayA9IFtcbiAgWzEsIDEsIDEsIDEsIDEsIDEsIDFdLFxuICBbMSwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gIFsxLCAwLCAwLCAwLCAwLCAwLCAxXSxcbiAgWzEsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICBbMSwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gIFsxLCAwLCAwLCAwLCAwLCAwLCAxXSxcbiAgWzEsIDEsIDEsIDEsIDEsIDEsIDFdXG5dO1xuXG5jb25zdCBkb3RNYXNrID0gW1xuICBbMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gIFswLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgWzAsIDAsIDEsIDEsIDEsIDAsIDBdLFxuICBbMCwgMCwgMSwgMSwgMSwgMCwgMF0sXG4gIFswLCAwLCAxLCAxLCAxLCAwLCAwXSxcbiAgWzAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICBbMCwgMCwgMCwgMCwgMCwgMCwgMF1cbl07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFFSQ2FudmFzIHtcbiAgX2NhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XG4gIF9vcHRpb25zOiBSZXF1aXJlZE9wdGlvbnM7XG4gIF9xcj86IFFSQ29kZTtcbiAgX2ltYWdlPzogSFRNTEltYWdlRWxlbWVudDtcblxuICAvL1RPRE8gZG9uJ3QgcGFzcyBhbGwgb3B0aW9ucyB0byB0aGlzIGNsYXNzXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFJlcXVpcmVkT3B0aW9ucykge1xuICAgIHRoaXMuX2NhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG4gICAgdGhpcy5fY2FudmFzLndpZHRoID0gb3B0aW9ucy53aWR0aDtcbiAgICB0aGlzLl9jYW52YXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQ7XG4gICAgdGhpcy5fb3B0aW9ucyA9IG9wdGlvbnM7XG4gIH1cblxuICBnZXQgY29udGV4dCgpOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgfVxuXG4gIGdldCB3aWR0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9jYW52YXMud2lkdGg7XG4gIH1cblxuICBnZXQgaGVpZ2h0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2NhbnZhcy5oZWlnaHQ7XG4gIH1cblxuICBnZXRDYW52YXMoKTogSFRNTENhbnZhc0VsZW1lbnQge1xuICAgIHJldHVybiB0aGlzLl9jYW52YXM7XG4gIH1cblxuICBjbGVhcigpOiB2b2lkIHtcbiAgICBjb25zdCBjYW52YXNDb250ZXh0ID0gdGhpcy5jb250ZXh0O1xuXG4gICAgaWYgKGNhbnZhc0NvbnRleHQpIHtcbiAgICAgIGNhbnZhc0NvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMuX2NhbnZhcy53aWR0aCwgdGhpcy5fY2FudmFzLmhlaWdodCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZHJhd1FSKHFyOiBRUkNvZGUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBjb3VudCA9IHFyLmdldE1vZHVsZUNvdW50KCk7XG4gICAgY29uc3QgbWluU2l6ZSA9IE1hdGgubWluKHRoaXMuX29wdGlvbnMud2lkdGgsIHRoaXMuX29wdGlvbnMuaGVpZ2h0KSAtIHRoaXMuX29wdGlvbnMubWFyZ2luICogMjtcbiAgICBjb25zdCBkb3RTaXplID0gTWF0aC5mbG9vcihtaW5TaXplIC8gY291bnQpO1xuICAgIGxldCBkcmF3SW1hZ2VTaXplID0ge1xuICAgICAgaGlkZVhEb3RzOiAwLFxuICAgICAgaGlkZVlEb3RzOiAwLFxuICAgICAgd2lkdGg6IDAsXG4gICAgICBoZWlnaHQ6IDBcbiAgICB9O1xuXG4gICAgdGhpcy5fcXIgPSBxcjtcblxuICAgIGlmICh0aGlzLl9vcHRpb25zLmltYWdlKSB7XG4gICAgICBhd2FpdCB0aGlzLmxvYWRJbWFnZSgpO1xuICAgICAgaWYgKCF0aGlzLl9pbWFnZSkgcmV0dXJuO1xuICAgICAgY29uc3QgeyBpbWFnZU9wdGlvbnMsIHFyT3B0aW9ucyB9ID0gdGhpcy5fb3B0aW9ucztcbiAgICAgIGNvbnN0IGNvdmVyTGV2ZWwgPSBpbWFnZU9wdGlvbnMuaW1hZ2VTaXplICogZXJyb3JDb3JyZWN0aW9uUGVyY2VudHNbcXJPcHRpb25zLmVycm9yQ29ycmVjdGlvbkxldmVsXTtcbiAgICAgIGNvbnN0IG1heEhpZGRlbkRvdHMgPSBNYXRoLmZsb29yKGNvdmVyTGV2ZWwgKiBjb3VudCAqIGNvdW50KTtcblxuICAgICAgZHJhd0ltYWdlU2l6ZSA9IGNhbGN1bGF0ZUltYWdlU2l6ZSh7XG4gICAgICAgIG9yaWdpbmFsV2lkdGg6IHRoaXMuX2ltYWdlLndpZHRoLFxuICAgICAgICBvcmlnaW5hbEhlaWdodDogdGhpcy5faW1hZ2UuaGVpZ2h0LFxuICAgICAgICBtYXhIaWRkZW5Eb3RzLFxuICAgICAgICBtYXhIaWRkZW5BeGlzRG90czogY291bnQgLSAxNCxcbiAgICAgICAgZG90U2l6ZVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMuZHJhd0JhY2tncm91bmQoKTtcbiAgICB0aGlzLmRyYXdEb3RzKChpOiBudW1iZXIsIGo6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgICAgaWYgKHRoaXMuX29wdGlvbnMuaW1hZ2VPcHRpb25zLmhpZGVCYWNrZ3JvdW5kRG90cykge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgaSA+PSAoY291bnQgLSBkcmF3SW1hZ2VTaXplLmhpZGVYRG90cykgLyAyICYmXG4gICAgICAgICAgaSA8IChjb3VudCArIGRyYXdJbWFnZVNpemUuaGlkZVhEb3RzKSAvIDIgJiZcbiAgICAgICAgICBqID49IChjb3VudCAtIGRyYXdJbWFnZVNpemUuaGlkZVlEb3RzKSAvIDIgJiZcbiAgICAgICAgICBqIDwgKGNvdW50ICsgZHJhd0ltYWdlU2l6ZS5oaWRlWURvdHMpIC8gMlxuICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHNxdWFyZU1hc2tbaV0/LltqXSB8fCBzcXVhcmVNYXNrW2kgLSBjb3VudCArIDddPy5bal0gfHwgc3F1YXJlTWFza1tpXT8uW2ogLSBjb3VudCArIDddKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRvdE1hc2tbaV0/LltqXSB8fCBkb3RNYXNrW2kgLSBjb3VudCArIDddPy5bal0gfHwgZG90TWFza1tpXT8uW2ogLSBjb3VudCArIDddKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gICAgdGhpcy5kcmF3Q29ybmVycygpO1xuXG4gICAgaWYgKHRoaXMuX29wdGlvbnMuaW1hZ2UpIHtcbiAgICAgIHRoaXMuZHJhd0ltYWdlKHsgd2lkdGg6IGRyYXdJbWFnZVNpemUud2lkdGgsIGhlaWdodDogZHJhd0ltYWdlU2l6ZS5oZWlnaHQsIGNvdW50LCBkb3RTaXplIH0pO1xuICAgIH1cbiAgfVxuXG4gIGRyYXdCYWNrZ3JvdW5kKCk6IHZvaWQge1xuICAgIGNvbnN0IGNhbnZhc0NvbnRleHQgPSB0aGlzLmNvbnRleHQ7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG5cbiAgICBpZiAoY2FudmFzQ29udGV4dCkge1xuICAgICAgaWYgKG9wdGlvbnMuYmFja2dyb3VuZE9wdGlvbnMuZ3JhZGllbnQpIHtcbiAgICAgICAgY29uc3QgZ3JhZGllbnRPcHRpb25zID0gb3B0aW9ucy5iYWNrZ3JvdW5kT3B0aW9ucy5ncmFkaWVudDtcbiAgICAgICAgY29uc3QgZ3JhZGllbnQgPSB0aGlzLl9jcmVhdGVHcmFkaWVudCh7XG4gICAgICAgICAgY29udGV4dDogY2FudmFzQ29udGV4dCxcbiAgICAgICAgICBvcHRpb25zOiBncmFkaWVudE9wdGlvbnMsXG4gICAgICAgICAgYWRkaXRpb25hbFJvdGF0aW9uOiAwLFxuICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgeTogMCxcbiAgICAgICAgICBzaXplOiB0aGlzLl9jYW52YXMud2lkdGggPiB0aGlzLl9jYW52YXMuaGVpZ2h0ID8gdGhpcy5fY2FudmFzLndpZHRoIDogdGhpcy5fY2FudmFzLmhlaWdodFxuICAgICAgICB9KTtcblxuICAgICAgICBncmFkaWVudE9wdGlvbnMuY29sb3JTdG9wcy5mb3JFYWNoKCh7IG9mZnNldCwgY29sb3IgfTogeyBvZmZzZXQ6IG51bWJlcjsgY29sb3I6IHN0cmluZyB9KSA9PiB7XG4gICAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKG9mZnNldCwgY29sb3IpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjYW52YXNDb250ZXh0LmZpbGxTdHlsZSA9IGdyYWRpZW50O1xuICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmJhY2tncm91bmRPcHRpb25zLmNvbG9yKSB7XG4gICAgICAgIGNhbnZhc0NvbnRleHQuZmlsbFN0eWxlID0gb3B0aW9ucy5iYWNrZ3JvdW5kT3B0aW9ucy5jb2xvcjtcbiAgICAgIH1cbiAgICAgIGNhbnZhc0NvbnRleHQuZmlsbFJlY3QoMCwgMCwgdGhpcy5fY2FudmFzLndpZHRoLCB0aGlzLl9jYW52YXMuaGVpZ2h0KTtcbiAgICB9XG4gIH1cblxuICBkcmF3RG90cyhmaWx0ZXI/OiBGaWx0ZXJGdW5jdGlvbik6IHZvaWQge1xuICAgIGlmICghdGhpcy5fcXIpIHtcbiAgICAgIHRocm93IFwiUVIgY29kZSBpcyBub3QgZGVmaW5lZFwiO1xuICAgIH1cblxuICAgIGNvbnN0IGNhbnZhc0NvbnRleHQgPSB0aGlzLmNvbnRleHQ7XG5cbiAgICBpZiAoIWNhbnZhc0NvbnRleHQpIHtcbiAgICAgIHRocm93IFwiUVIgY29kZSBpcyBub3QgZGVmaW5lZFwiO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zO1xuICAgIGNvbnN0IGNvdW50ID0gdGhpcy5fcXIuZ2V0TW9kdWxlQ291bnQoKTtcblxuICAgIGlmIChjb3VudCA+IG9wdGlvbnMud2lkdGggfHwgY291bnQgPiBvcHRpb25zLmhlaWdodCkge1xuICAgICAgdGhyb3cgXCJUaGUgY2FudmFzIGlzIHRvbyBzbWFsbC5cIjtcbiAgICB9XG5cbiAgICBjb25zdCBtaW5TaXplID0gTWF0aC5taW4ob3B0aW9ucy53aWR0aCwgb3B0aW9ucy5oZWlnaHQpIC0gb3B0aW9ucy5tYXJnaW4gKiAyO1xuICAgIGNvbnN0IGRvdFNpemUgPSBNYXRoLmZsb29yKG1pblNpemUgLyBjb3VudCk7XG4gICAgY29uc3QgeEJlZ2lubmluZyA9IE1hdGguZmxvb3IoKG9wdGlvbnMud2lkdGggLSBjb3VudCAqIGRvdFNpemUpIC8gMik7XG4gICAgY29uc3QgeUJlZ2lubmluZyA9IE1hdGguZmxvb3IoKG9wdGlvbnMuaGVpZ2h0IC0gY291bnQgKiBkb3RTaXplKSAvIDIpO1xuICAgIGNvbnN0IGRvdCA9IG5ldyBRUkRvdCh7IGNvbnRleHQ6IGNhbnZhc0NvbnRleHQsIHR5cGU6IG9wdGlvbnMuZG90c09wdGlvbnMudHlwZSB9KTtcblxuICAgIGNhbnZhc0NvbnRleHQuYmVnaW5QYXRoKCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgY291bnQ7IGorKykge1xuICAgICAgICBpZiAoZmlsdGVyICYmICFmaWx0ZXIoaSwgaikpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX3FyLmlzRGFyayhpLCBqKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGRvdC5kcmF3KFxuICAgICAgICAgIHhCZWdpbm5pbmcgKyBpICogZG90U2l6ZSxcbiAgICAgICAgICB5QmVnaW5uaW5nICsgaiAqIGRvdFNpemUsXG4gICAgICAgICAgZG90U2l6ZSxcbiAgICAgICAgICAoeE9mZnNldDogbnVtYmVyLCB5T2Zmc2V0OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICAgICAgICAgIGlmIChpICsgeE9mZnNldCA8IDAgfHwgaiArIHlPZmZzZXQgPCAwIHx8IGkgKyB4T2Zmc2V0ID49IGNvdW50IHx8IGogKyB5T2Zmc2V0ID49IGNvdW50KSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBpZiAoZmlsdGVyICYmICFmaWx0ZXIoaSArIHhPZmZzZXQsIGogKyB5T2Zmc2V0KSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuICEhdGhpcy5fcXIgJiYgdGhpcy5fcXIuaXNEYXJrKGkgKyB4T2Zmc2V0LCBqICsgeU9mZnNldCk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmRvdHNPcHRpb25zLmdyYWRpZW50KSB7XG4gICAgICBjb25zdCBncmFkaWVudE9wdGlvbnMgPSBvcHRpb25zLmRvdHNPcHRpb25zLmdyYWRpZW50O1xuICAgICAgY29uc3QgZ3JhZGllbnQgPSB0aGlzLl9jcmVhdGVHcmFkaWVudCh7XG4gICAgICAgIGNvbnRleHQ6IGNhbnZhc0NvbnRleHQsXG4gICAgICAgIG9wdGlvbnM6IGdyYWRpZW50T3B0aW9ucyxcbiAgICAgICAgYWRkaXRpb25hbFJvdGF0aW9uOiAwLFxuICAgICAgICB4OiB4QmVnaW5uaW5nLFxuICAgICAgICB5OiB5QmVnaW5uaW5nLFxuICAgICAgICBzaXplOiBjb3VudCAqIGRvdFNpemVcbiAgICAgIH0pO1xuXG4gICAgICBncmFkaWVudE9wdGlvbnMuY29sb3JTdG9wcy5mb3JFYWNoKCh7IG9mZnNldCwgY29sb3IgfTogeyBvZmZzZXQ6IG51bWJlcjsgY29sb3I6IHN0cmluZyB9KSA9PiB7XG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcChvZmZzZXQsIGNvbG9yKTtcbiAgICAgIH0pO1xuXG4gICAgICBjYW52YXNDb250ZXh0LmZpbGxTdHlsZSA9IGNhbnZhc0NvbnRleHQuc3Ryb2tlU3R5bGUgPSBncmFkaWVudDtcbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMuZG90c09wdGlvbnMuY29sb3IpIHtcbiAgICAgIGNhbnZhc0NvbnRleHQuZmlsbFN0eWxlID0gY2FudmFzQ29udGV4dC5zdHJva2VTdHlsZSA9IG9wdGlvbnMuZG90c09wdGlvbnMuY29sb3I7XG4gICAgfVxuXG4gICAgY2FudmFzQ29udGV4dC5maWxsKFwiZXZlbm9kZFwiKTtcbiAgfVxuXG4gIGRyYXdDb3JuZXJzKGZpbHRlcj86IEZpbHRlckZ1bmN0aW9uKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9xcikge1xuICAgICAgdGhyb3cgXCJRUiBjb2RlIGlzIG5vdCBkZWZpbmVkXCI7XG4gICAgfVxuXG4gICAgY29uc3QgY2FudmFzQ29udGV4dCA9IHRoaXMuY29udGV4dDtcblxuICAgIGlmICghY2FudmFzQ29udGV4dCkge1xuICAgICAgdGhyb3cgXCJRUiBjb2RlIGlzIG5vdCBkZWZpbmVkXCI7XG4gICAgfVxuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG5cbiAgICBjb25zdCBjb3VudCA9IHRoaXMuX3FyLmdldE1vZHVsZUNvdW50KCk7XG4gICAgY29uc3QgbWluU2l6ZSA9IE1hdGgubWluKG9wdGlvbnMud2lkdGgsIG9wdGlvbnMuaGVpZ2h0KSAtIG9wdGlvbnMubWFyZ2luICogMjtcbiAgICBjb25zdCBkb3RTaXplID0gTWF0aC5mbG9vcihtaW5TaXplIC8gY291bnQpO1xuICAgIGNvbnN0IGNvcm5lcnNTcXVhcmVTaXplID0gZG90U2l6ZSAqIDc7XG4gICAgY29uc3QgY29ybmVyc0RvdFNpemUgPSBkb3RTaXplICogMztcbiAgICBjb25zdCB4QmVnaW5uaW5nID0gTWF0aC5mbG9vcigob3B0aW9ucy53aWR0aCAtIGNvdW50ICogZG90U2l6ZSkgLyAyKTtcbiAgICBjb25zdCB5QmVnaW5uaW5nID0gTWF0aC5mbG9vcigob3B0aW9ucy5oZWlnaHQgLSBjb3VudCAqIGRvdFNpemUpIC8gMik7XG5cbiAgICBbXG4gICAgICBbMCwgMCwgMF0sXG4gICAgICBbMSwgMCwgTWF0aC5QSSAvIDJdLFxuICAgICAgWzAsIDEsIC1NYXRoLlBJIC8gMl1cbiAgICBdLmZvckVhY2goKFtjb2x1bW4sIHJvdywgcm90YXRpb25dKSA9PiB7XG4gICAgICBpZiAoZmlsdGVyICYmICFmaWx0ZXIoY29sdW1uLCByb3cpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgeCA9IHhCZWdpbm5pbmcgKyBjb2x1bW4gKiBkb3RTaXplICogKGNvdW50IC0gNyk7XG4gICAgICBjb25zdCB5ID0geUJlZ2lubmluZyArIHJvdyAqIGRvdFNpemUgKiAoY291bnQgLSA3KTtcblxuICAgICAgaWYgKG9wdGlvbnMuY29ybmVyc1NxdWFyZU9wdGlvbnM/LnR5cGUpIHtcbiAgICAgICAgY29uc3QgY29ybmVyc1NxdWFyZSA9IG5ldyBRUkNvcm5lclNxdWFyZSh7IGNvbnRleHQ6IGNhbnZhc0NvbnRleHQsIHR5cGU6IG9wdGlvbnMuY29ybmVyc1NxdWFyZU9wdGlvbnM/LnR5cGUgfSk7XG5cbiAgICAgICAgY2FudmFzQ29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgY29ybmVyc1NxdWFyZS5kcmF3KHgsIHksIGNvcm5lcnNTcXVhcmVTaXplLCByb3RhdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkb3QgPSBuZXcgUVJEb3QoeyBjb250ZXh0OiBjYW52YXNDb250ZXh0LCB0eXBlOiBvcHRpb25zLmRvdHNPcHRpb25zLnR5cGUgfSk7XG5cbiAgICAgICAgY2FudmFzQ29udGV4dC5iZWdpblBhdGgoKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNxdWFyZU1hc2subGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNxdWFyZU1hc2tbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmICghc3F1YXJlTWFza1tpXT8uW2pdKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkb3QuZHJhdyhcbiAgICAgICAgICAgICAgeCArIGkgKiBkb3RTaXplLFxuICAgICAgICAgICAgICB5ICsgaiAqIGRvdFNpemUsXG4gICAgICAgICAgICAgIGRvdFNpemUsXG4gICAgICAgICAgICAgICh4T2Zmc2V0OiBudW1iZXIsIHlPZmZzZXQ6IG51bWJlcik6IGJvb2xlYW4gPT4gISFzcXVhcmVNYXNrW2kgKyB4T2Zmc2V0XT8uW2ogKyB5T2Zmc2V0XVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuY29ybmVyc1NxdWFyZU9wdGlvbnM/LmdyYWRpZW50KSB7XG4gICAgICAgIGNvbnN0IGdyYWRpZW50T3B0aW9ucyA9IG9wdGlvbnMuY29ybmVyc1NxdWFyZU9wdGlvbnMuZ3JhZGllbnQ7XG4gICAgICAgIGNvbnN0IGdyYWRpZW50ID0gdGhpcy5fY3JlYXRlR3JhZGllbnQoe1xuICAgICAgICAgIGNvbnRleHQ6IGNhbnZhc0NvbnRleHQsXG4gICAgICAgICAgb3B0aW9uczogZ3JhZGllbnRPcHRpb25zLFxuICAgICAgICAgIGFkZGl0aW9uYWxSb3RhdGlvbjogcm90YXRpb24sXG4gICAgICAgICAgeCxcbiAgICAgICAgICB5LFxuICAgICAgICAgIHNpemU6IGNvcm5lcnNTcXVhcmVTaXplXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGdyYWRpZW50T3B0aW9ucy5jb2xvclN0b3BzLmZvckVhY2goKHsgb2Zmc2V0LCBjb2xvciB9OiB7IG9mZnNldDogbnVtYmVyOyBjb2xvcjogc3RyaW5nIH0pID0+IHtcbiAgICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3Aob2Zmc2V0LCBjb2xvcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNhbnZhc0NvbnRleHQuZmlsbFN0eWxlID0gY2FudmFzQ29udGV4dC5zdHJva2VTdHlsZSA9IGdyYWRpZW50O1xuICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmNvcm5lcnNTcXVhcmVPcHRpb25zPy5jb2xvcikge1xuICAgICAgICBjYW52YXNDb250ZXh0LmZpbGxTdHlsZSA9IGNhbnZhc0NvbnRleHQuc3Ryb2tlU3R5bGUgPSBvcHRpb25zLmNvcm5lcnNTcXVhcmVPcHRpb25zLmNvbG9yO1xuICAgICAgfVxuXG4gICAgICBjYW52YXNDb250ZXh0LmZpbGwoXCJldmVub2RkXCIpO1xuXG4gICAgICBpZiAob3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucz8udHlwZSkge1xuICAgICAgICBjb25zdCBjb3JuZXJzRG90ID0gbmV3IFFSQ29ybmVyRG90KHsgY29udGV4dDogY2FudmFzQ29udGV4dCwgdHlwZTogb3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucz8udHlwZSB9KTtcblxuICAgICAgICBjYW52YXNDb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICBjb3JuZXJzRG90LmRyYXcoeCArIGRvdFNpemUgKiAyLCB5ICsgZG90U2l6ZSAqIDIsIGNvcm5lcnNEb3RTaXplLCByb3RhdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkb3QgPSBuZXcgUVJEb3QoeyBjb250ZXh0OiBjYW52YXNDb250ZXh0LCB0eXBlOiBvcHRpb25zLmRvdHNPcHRpb25zLnR5cGUgfSk7XG5cbiAgICAgICAgY2FudmFzQ29udGV4dC5iZWdpblBhdGgoKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRvdE1hc2subGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGRvdE1hc2tbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmICghZG90TWFza1tpXT8uW2pdKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkb3QuZHJhdyhcbiAgICAgICAgICAgICAgeCArIGkgKiBkb3RTaXplLFxuICAgICAgICAgICAgICB5ICsgaiAqIGRvdFNpemUsXG4gICAgICAgICAgICAgIGRvdFNpemUsXG4gICAgICAgICAgICAgICh4T2Zmc2V0OiBudW1iZXIsIHlPZmZzZXQ6IG51bWJlcik6IGJvb2xlYW4gPT4gISFkb3RNYXNrW2kgKyB4T2Zmc2V0XT8uW2ogKyB5T2Zmc2V0XVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuY29ybmVyc0RvdE9wdGlvbnM/LmdyYWRpZW50KSB7XG4gICAgICAgIGNvbnN0IGdyYWRpZW50T3B0aW9ucyA9IG9wdGlvbnMuY29ybmVyc0RvdE9wdGlvbnMuZ3JhZGllbnQ7XG4gICAgICAgIGNvbnN0IGdyYWRpZW50ID0gdGhpcy5fY3JlYXRlR3JhZGllbnQoe1xuICAgICAgICAgIGNvbnRleHQ6IGNhbnZhc0NvbnRleHQsXG4gICAgICAgICAgb3B0aW9uczogZ3JhZGllbnRPcHRpb25zLFxuICAgICAgICAgIGFkZGl0aW9uYWxSb3RhdGlvbjogcm90YXRpb24sXG4gICAgICAgICAgeDogeCArIGRvdFNpemUgKiAyLFxuICAgICAgICAgIHk6IHkgKyBkb3RTaXplICogMixcbiAgICAgICAgICBzaXplOiBjb3JuZXJzRG90U2l6ZVxuICAgICAgICB9KTtcblxuICAgICAgICBncmFkaWVudE9wdGlvbnMuY29sb3JTdG9wcy5mb3JFYWNoKCh7IG9mZnNldCwgY29sb3IgfTogeyBvZmZzZXQ6IG51bWJlcjsgY29sb3I6IHN0cmluZyB9KSA9PiB7XG4gICAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKG9mZnNldCwgY29sb3IpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjYW52YXNDb250ZXh0LmZpbGxTdHlsZSA9IGNhbnZhc0NvbnRleHQuc3Ryb2tlU3R5bGUgPSBncmFkaWVudDtcbiAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucz8uY29sb3IpIHtcbiAgICAgICAgY2FudmFzQ29udGV4dC5maWxsU3R5bGUgPSBjYW52YXNDb250ZXh0LnN0cm9rZVN0eWxlID0gb3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucy5jb2xvcjtcbiAgICAgIH1cblxuICAgICAgY2FudmFzQ29udGV4dC5maWxsKFwiZXZlbm9kZFwiKTtcbiAgICB9KTtcbiAgfVxuXG4gIGxvYWRJbWFnZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG4gICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuXG4gICAgICBpZiAoIW9wdGlvbnMuaW1hZ2UpIHtcbiAgICAgICAgcmV0dXJuIHJlamVjdChcIkltYWdlIGlzIG5vdCBkZWZpbmVkXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMuaW1hZ2VPcHRpb25zLmNyb3NzT3JpZ2luID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGltYWdlLmNyb3NzT3JpZ2luID0gb3B0aW9ucy5pbWFnZU9wdGlvbnMuY3Jvc3NPcmlnaW47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2ltYWdlID0gaW1hZ2U7XG4gICAgICBpbWFnZS5vbmxvYWQgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH07XG4gICAgICBpbWFnZS5zcmMgPSBvcHRpb25zLmltYWdlO1xuICAgIH0pO1xuICB9XG5cbiAgZHJhd0ltYWdlKHtcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgY291bnQsXG4gICAgZG90U2l6ZVxuICB9OiB7XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbiAgICBjb3VudDogbnVtYmVyO1xuICAgIGRvdFNpemU6IG51bWJlcjtcbiAgfSk6IHZvaWQge1xuICAgIGNvbnN0IGNhbnZhc0NvbnRleHQgPSB0aGlzLmNvbnRleHQ7XG5cbiAgICBpZiAoIWNhbnZhc0NvbnRleHQpIHtcbiAgICAgIHRocm93IFwiY2FudmFzQ29udGV4dCBpcyBub3QgZGVmaW5lZFwiO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5faW1hZ2UpIHtcbiAgICAgIHRocm93IFwiaW1hZ2UgaXMgbm90IGRlZmluZWRcIjtcbiAgICB9XG5cbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5fb3B0aW9ucztcbiAgICBjb25zdCB4QmVnaW5uaW5nID0gTWF0aC5mbG9vcigob3B0aW9ucy53aWR0aCAtIGNvdW50ICogZG90U2l6ZSkgLyAyKTtcbiAgICBjb25zdCB5QmVnaW5uaW5nID0gTWF0aC5mbG9vcigob3B0aW9ucy5oZWlnaHQgLSBjb3VudCAqIGRvdFNpemUpIC8gMik7XG4gICAgY29uc3QgZHggPSB4QmVnaW5uaW5nICsgb3B0aW9ucy5pbWFnZU9wdGlvbnMubWFyZ2luICsgKGNvdW50ICogZG90U2l6ZSAtIHdpZHRoKSAvIDI7XG4gICAgY29uc3QgZHkgPSB5QmVnaW5uaW5nICsgb3B0aW9ucy5pbWFnZU9wdGlvbnMubWFyZ2luICsgKGNvdW50ICogZG90U2l6ZSAtIGhlaWdodCkgLyAyO1xuICAgIGNvbnN0IGR3ID0gd2lkdGggLSBvcHRpb25zLmltYWdlT3B0aW9ucy5tYXJnaW4gKiAyO1xuICAgIGNvbnN0IGRoID0gaGVpZ2h0IC0gb3B0aW9ucy5pbWFnZU9wdGlvbnMubWFyZ2luICogMjtcblxuICAgIGNhbnZhc0NvbnRleHQuZHJhd0ltYWdlKHRoaXMuX2ltYWdlLCBkeCwgZHksIGR3IDwgMCA/IDAgOiBkdywgZGggPCAwID8gMCA6IGRoKTtcbiAgfVxuXG4gIF9jcmVhdGVHcmFkaWVudCh7XG4gICAgY29udGV4dCxcbiAgICBvcHRpb25zLFxuICAgIGFkZGl0aW9uYWxSb3RhdGlvbixcbiAgICB4LFxuICAgIHksXG4gICAgc2l6ZVxuICB9OiB7XG4gICAgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgIG9wdGlvbnM6IEdyYWRpZW50O1xuICAgIGFkZGl0aW9uYWxSb3RhdGlvbjogbnVtYmVyO1xuICAgIHg6IG51bWJlcjtcbiAgICB5OiBudW1iZXI7XG4gICAgc2l6ZTogbnVtYmVyO1xuICB9KTogQ2FudmFzR3JhZGllbnQge1xuICAgIGxldCBncmFkaWVudDtcblxuICAgIGlmIChvcHRpb25zLnR5cGUgPT09IGdyYWRpZW50VHlwZXMucmFkaWFsKSB7XG4gICAgICBncmFkaWVudCA9IGNvbnRleHQuY3JlYXRlUmFkaWFsR3JhZGllbnQoeCArIHNpemUgLyAyLCB5ICsgc2l6ZSAvIDIsIDAsIHggKyBzaXplIC8gMiwgeSArIHNpemUgLyAyLCBzaXplIC8gMik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHJvdGF0aW9uID0gKChvcHRpb25zLnJvdGF0aW9uIHx8IDApICsgYWRkaXRpb25hbFJvdGF0aW9uKSAlICgyICogTWF0aC5QSSk7XG4gICAgICBjb25zdCBwb3NpdGl2ZVJvdGF0aW9uID0gKHJvdGF0aW9uICsgMiAqIE1hdGguUEkpICUgKDIgKiBNYXRoLlBJKTtcbiAgICAgIGxldCB4MCA9IHggKyBzaXplIC8gMjtcbiAgICAgIGxldCB5MCA9IHkgKyBzaXplIC8gMjtcbiAgICAgIGxldCB4MSA9IHggKyBzaXplIC8gMjtcbiAgICAgIGxldCB5MSA9IHkgKyBzaXplIC8gMjtcblxuICAgICAgaWYgKFxuICAgICAgICAocG9zaXRpdmVSb3RhdGlvbiA+PSAwICYmIHBvc2l0aXZlUm90YXRpb24gPD0gMC4yNSAqIE1hdGguUEkpIHx8XG4gICAgICAgIChwb3NpdGl2ZVJvdGF0aW9uID4gMS43NSAqIE1hdGguUEkgJiYgcG9zaXRpdmVSb3RhdGlvbiA8PSAyICogTWF0aC5QSSlcbiAgICAgICkge1xuICAgICAgICB4MCA9IHgwIC0gc2l6ZSAvIDI7XG4gICAgICAgIHkwID0geTAgLSAoc2l6ZSAvIDIpICogTWF0aC50YW4ocm90YXRpb24pO1xuICAgICAgICB4MSA9IHgxICsgc2l6ZSAvIDI7XG4gICAgICAgIHkxID0geTEgKyAoc2l6ZSAvIDIpICogTWF0aC50YW4ocm90YXRpb24pO1xuICAgICAgfSBlbHNlIGlmIChwb3NpdGl2ZVJvdGF0aW9uID4gMC4yNSAqIE1hdGguUEkgJiYgcG9zaXRpdmVSb3RhdGlvbiA8PSAwLjc1ICogTWF0aC5QSSkge1xuICAgICAgICB5MCA9IHkwIC0gc2l6ZSAvIDI7XG4gICAgICAgIHgwID0geDAgLSBzaXplIC8gMiAvIE1hdGgudGFuKHJvdGF0aW9uKTtcbiAgICAgICAgeTEgPSB5MSArIHNpemUgLyAyO1xuICAgICAgICB4MSA9IHgxICsgc2l6ZSAvIDIgLyBNYXRoLnRhbihyb3RhdGlvbik7XG4gICAgICB9IGVsc2UgaWYgKHBvc2l0aXZlUm90YXRpb24gPiAwLjc1ICogTWF0aC5QSSAmJiBwb3NpdGl2ZVJvdGF0aW9uIDw9IDEuMjUgKiBNYXRoLlBJKSB7XG4gICAgICAgIHgwID0geDAgKyBzaXplIC8gMjtcbiAgICAgICAgeTAgPSB5MCArIChzaXplIC8gMikgKiBNYXRoLnRhbihyb3RhdGlvbik7XG4gICAgICAgIHgxID0geDEgLSBzaXplIC8gMjtcbiAgICAgICAgeTEgPSB5MSAtIChzaXplIC8gMikgKiBNYXRoLnRhbihyb3RhdGlvbik7XG4gICAgICB9IGVsc2UgaWYgKHBvc2l0aXZlUm90YXRpb24gPiAxLjI1ICogTWF0aC5QSSAmJiBwb3NpdGl2ZVJvdGF0aW9uIDw9IDEuNzUgKiBNYXRoLlBJKSB7XG4gICAgICAgIHkwID0geTAgKyBzaXplIC8gMjtcbiAgICAgICAgeDAgPSB4MCArIHNpemUgLyAyIC8gTWF0aC50YW4ocm90YXRpb24pO1xuICAgICAgICB5MSA9IHkxIC0gc2l6ZSAvIDI7XG4gICAgICAgIHgxID0geDEgLSBzaXplIC8gMiAvIE1hdGgudGFuKHJvdGF0aW9uKTtcbiAgICAgIH1cblxuICAgICAgZ3JhZGllbnQgPSBjb250ZXh0LmNyZWF0ZUxpbmVhckdyYWRpZW50KE1hdGgucm91bmQoeDApLCBNYXRoLnJvdW5kKHkwKSwgTWF0aC5yb3VuZCh4MSksIE1hdGgucm91bmQoeTEpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ3JhZGllbnQ7XG4gIH1cbn1cbiIsImltcG9ydCBnZXRNb2RlIGZyb20gXCIuLi90b29scy9nZXRNb2RlXCI7XG5pbXBvcnQgbWVyZ2VEZWVwIGZyb20gXCIuLi90b29scy9tZXJnZVwiO1xuaW1wb3J0IGRvd25sb2FkVVJJIGZyb20gXCIuLi90b29scy9kb3dubG9hZFVSSVwiO1xuaW1wb3J0IFFSQ2FudmFzIGZyb20gXCIuL1FSQ2FudmFzXCI7XG5pbXBvcnQgUVJTVkcgZnJvbSBcIi4vUVJTVkdcIjtcbmltcG9ydCBkcmF3VHlwZXMgZnJvbSBcIi4uL2NvbnN0YW50cy9kcmF3VHlwZXNcIjtcblxuaW1wb3J0IGRlZmF1bHRPcHRpb25zLCB7IFJlcXVpcmVkT3B0aW9ucyB9IGZyb20gXCIuL1FST3B0aW9uc1wiO1xuaW1wb3J0IHNhbml0aXplT3B0aW9ucyBmcm9tIFwiLi4vdG9vbHMvc2FuaXRpemVPcHRpb25zXCI7XG5pbXBvcnQgeyBFeHRlbnNpb24sIFFSQ29kZSwgT3B0aW9ucywgRG93bmxvYWRPcHRpb25zIH0gZnJvbSBcIi4uL3R5cGVzXCI7XG5pbXBvcnQgcXJjb2RlIGZyb20gXCJxcmNvZGUtZ2VuZXJhdG9yXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFFSQ29kZVN0eWxpbmcge1xuICBfb3B0aW9uczogUmVxdWlyZWRPcHRpb25zO1xuICBfY29udGFpbmVyPzogSFRNTEVsZW1lbnQ7XG4gIF9jYW52YXM/OiBRUkNhbnZhcztcbiAgX3N2Zz86IFFSU1ZHO1xuICBfcXI/OiBRUkNvZGU7XG4gIF9jYW52YXNEcmF3aW5nUHJvbWlzZT86IFByb21pc2U8dm9pZD47XG4gIF9zdmdEcmF3aW5nUHJvbWlzZT86IFByb21pc2U8dm9pZD47XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucz86IFBhcnRpYWw8T3B0aW9ucz4pIHtcbiAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucyA/IHNhbml0aXplT3B0aW9ucyhtZXJnZURlZXAoZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpIGFzIFJlcXVpcmVkT3B0aW9ucykgOiBkZWZhdWx0T3B0aW9ucztcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgc3RhdGljIF9jbGVhckNvbnRhaW5lcihjb250YWluZXI/OiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGlmIChjb250YWluZXIpIHtcbiAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9nZXRRUlN0eWxpbmdFbGVtZW50KGV4dGVuc2lvbjogRXh0ZW5zaW9uID0gXCJwbmdcIik6IFByb21pc2U8UVJDYW52YXMgfCBRUlNWRz4ge1xuICAgIGlmICghdGhpcy5fcXIpIHRocm93IFwiUVIgY29kZSBpcyBlbXB0eVwiO1xuXG4gICAgaWYgKGV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpID09PSBcInN2Z1wiKSB7XG4gICAgICBsZXQgcHJvbWlzZSwgc3ZnOiBRUlNWRztcblxuICAgICAgaWYgKHRoaXMuX3N2ZyAmJiB0aGlzLl9zdmdEcmF3aW5nUHJvbWlzZSkge1xuICAgICAgICBzdmcgPSB0aGlzLl9zdmc7XG4gICAgICAgIHByb21pc2UgPSB0aGlzLl9zdmdEcmF3aW5nUHJvbWlzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN2ZyA9IG5ldyBRUlNWRyh0aGlzLl9vcHRpb25zKTtcbiAgICAgICAgcHJvbWlzZSA9IHN2Zy5kcmF3UVIodGhpcy5fcXIpO1xuICAgICAgfVxuXG4gICAgICBhd2FpdCBwcm9taXNlO1xuXG4gICAgICByZXR1cm4gc3ZnO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcHJvbWlzZSwgY2FudmFzOiBRUkNhbnZhcztcblxuICAgICAgaWYgKHRoaXMuX2NhbnZhcyAmJiB0aGlzLl9jYW52YXNEcmF3aW5nUHJvbWlzZSkge1xuICAgICAgICBjYW52YXMgPSB0aGlzLl9jYW52YXM7XG4gICAgICAgIHByb21pc2UgPSB0aGlzLl9jYW52YXNEcmF3aW5nUHJvbWlzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbnZhcyA9IG5ldyBRUkNhbnZhcyh0aGlzLl9vcHRpb25zKTtcbiAgICAgICAgcHJvbWlzZSA9IGNhbnZhcy5kcmF3UVIodGhpcy5fcXIpO1xuICAgICAgfVxuXG4gICAgICBhd2FpdCBwcm9taXNlO1xuXG4gICAgICByZXR1cm4gY2FudmFzO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZShvcHRpb25zPzogUGFydGlhbDxPcHRpb25zPik6IHZvaWQge1xuICAgIFFSQ29kZVN0eWxpbmcuX2NsZWFyQ29udGFpbmVyKHRoaXMuX2NvbnRhaW5lcik7XG4gICAgdGhpcy5fb3B0aW9ucyA9IG9wdGlvbnMgPyBzYW5pdGl6ZU9wdGlvbnMobWVyZ2VEZWVwKHRoaXMuX29wdGlvbnMsIG9wdGlvbnMpIGFzIFJlcXVpcmVkT3B0aW9ucykgOiB0aGlzLl9vcHRpb25zO1xuXG4gICAgaWYgKCF0aGlzLl9vcHRpb25zLmRhdGEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9xciA9IHFyY29kZSh0aGlzLl9vcHRpb25zLnFyT3B0aW9ucy50eXBlTnVtYmVyLCB0aGlzLl9vcHRpb25zLnFyT3B0aW9ucy5lcnJvckNvcnJlY3Rpb25MZXZlbCk7XG4gICAgdGhpcy5fcXIuYWRkRGF0YSh0aGlzLl9vcHRpb25zLmRhdGEsIHRoaXMuX29wdGlvbnMucXJPcHRpb25zLm1vZGUgfHwgZ2V0TW9kZSh0aGlzLl9vcHRpb25zLmRhdGEpKTtcbiAgICB0aGlzLl9xci5tYWtlKCk7XG5cbiAgICBpZiAodGhpcy5fb3B0aW9ucy50eXBlID09PSBkcmF3VHlwZXMuY2FudmFzKSB7XG4gICAgICB0aGlzLl9jYW52YXMgPSBuZXcgUVJDYW52YXModGhpcy5fb3B0aW9ucyk7XG4gICAgICB0aGlzLl9jYW52YXNEcmF3aW5nUHJvbWlzZSA9IHRoaXMuX2NhbnZhcy5kcmF3UVIodGhpcy5fcXIpO1xuICAgICAgdGhpcy5fc3ZnRHJhd2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLl9zdmcgPSB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3N2ZyA9IG5ldyBRUlNWRyh0aGlzLl9vcHRpb25zKTtcbiAgICAgIHRoaXMuX3N2Z0RyYXdpbmdQcm9taXNlID0gdGhpcy5fc3ZnLmRyYXdRUih0aGlzLl9xcik7XG4gICAgICB0aGlzLl9jYW52YXNEcmF3aW5nUHJvbWlzZSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuX2NhbnZhcyA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICB0aGlzLmFwcGVuZCh0aGlzLl9jb250YWluZXIpO1xuICB9XG5cbiAgYXBwZW5kKGNvbnRhaW5lcj86IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgaWYgKCFjb250YWluZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGNvbnRhaW5lci5hcHBlbmRDaGlsZCAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aHJvdyBcIkNvbnRhaW5lciBzaG91bGQgYmUgYSBzaW5nbGUgRE9NIG5vZGVcIjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fb3B0aW9ucy50eXBlID09PSBkcmF3VHlwZXMuY2FudmFzKSB7XG4gICAgICBpZiAodGhpcy5fY2FudmFzKSB7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9jYW52YXMuZ2V0Q2FudmFzKCkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5fc3ZnKSB7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9zdmcuZ2V0RWxlbWVudCgpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9jb250YWluZXIgPSBjb250YWluZXI7XG4gIH1cblxuICBhc3luYyBnZXRSYXdEYXRhKGV4dGVuc2lvbjogRXh0ZW5zaW9uID0gXCJwbmdcIik6IFByb21pc2U8QmxvYiB8IG51bGw+IHtcbiAgICBpZiAoIXRoaXMuX3FyKSB0aHJvdyBcIlFSIGNvZGUgaXMgZW1wdHlcIjtcbiAgICBjb25zdCBlbGVtZW50ID0gYXdhaXQgdGhpcy5fZ2V0UVJTdHlsaW5nRWxlbWVudChleHRlbnNpb24pO1xuXG4gICAgaWYgKGV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpID09PSBcInN2Z1wiKSB7XG4gICAgICBjb25zdCBzZXJpYWxpemVyID0gbmV3IFhNTFNlcmlhbGl6ZXIoKTtcbiAgICAgIGNvbnN0IHNvdXJjZSA9IHNlcmlhbGl6ZXIuc2VyaWFsaXplVG9TdHJpbmcoKGVsZW1lbnQgYXMgdW5rbm93biBhcyBRUlNWRykuZ2V0RWxlbWVudCgpKTtcblxuICAgICAgcmV0dXJuIG5ldyBCbG9iKFsnPD94bWwgdmVyc2lvbj1cIjEuMFwiIHN0YW5kYWxvbmU9XCJub1wiPz5cXHJcXG4nICsgc291cmNlXSwgeyB0eXBlOiBcImltYWdlL3N2Zyt4bWxcIiB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PlxuICAgICAgICAoZWxlbWVudCBhcyB1bmtub3duIGFzIFFSQ2FudmFzKS5nZXRDYW52YXMoKS50b0Jsb2IocmVzb2x2ZSwgYGltYWdlLyR7ZXh0ZW5zaW9ufWAsIDEpXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGRvd25sb2FkKGRvd25sb2FkT3B0aW9ucz86IFBhcnRpYWw8RG93bmxvYWRPcHRpb25zPiB8IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5fcXIpIHRocm93IFwiUVIgY29kZSBpcyBlbXB0eVwiO1xuICAgIGxldCBleHRlbnNpb24gPSBcInBuZ1wiIGFzIEV4dGVuc2lvbjtcbiAgICBsZXQgbmFtZSA9IFwicXJcIjtcblxuICAgIC8vVE9ETyByZW1vdmUgZGVwcmVjYXRlZCBjb2RlIGluIHRoZSB2MlxuICAgIGlmICh0eXBlb2YgZG93bmxvYWRPcHRpb25zID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBleHRlbnNpb24gPSBkb3dubG9hZE9wdGlvbnMgYXMgRXh0ZW5zaW9uO1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBcIkV4dGVuc2lvbiBpcyBkZXByZWNhdGVkIGFzIGFyZ3VtZW50IGZvciAnZG93bmxvYWQnIG1ldGhvZCwgcGxlYXNlIHBhc3Mgb2JqZWN0IHsgbmFtZTogJy4uLicsIGV4dGVuc2lvbjogJy4uLicgfSBhcyBhcmd1bWVudFwiXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvd25sb2FkT3B0aW9ucyA9PT0gXCJvYmplY3RcIiAmJiBkb3dubG9hZE9wdGlvbnMgIT09IG51bGwpIHtcbiAgICAgIGlmIChkb3dubG9hZE9wdGlvbnMubmFtZSkge1xuICAgICAgICBuYW1lID0gZG93bmxvYWRPcHRpb25zLm5hbWU7XG4gICAgICB9XG4gICAgICBpZiAoZG93bmxvYWRPcHRpb25zLmV4dGVuc2lvbikge1xuICAgICAgICBleHRlbnNpb24gPSBkb3dubG9hZE9wdGlvbnMuZXh0ZW5zaW9uO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGVsZW1lbnQgPSBhd2FpdCB0aGlzLl9nZXRRUlN0eWxpbmdFbGVtZW50KGV4dGVuc2lvbik7XG5cbiAgICBpZiAoZXh0ZW5zaW9uLnRvTG93ZXJDYXNlKCkgPT09IFwic3ZnXCIpIHtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZXIgPSBuZXcgWE1MU2VyaWFsaXplcigpO1xuICAgICAgbGV0IHNvdXJjZSA9IHNlcmlhbGl6ZXIuc2VyaWFsaXplVG9TdHJpbmcoKGVsZW1lbnQgYXMgdW5rbm93biBhcyBRUlNWRykuZ2V0RWxlbWVudCgpKTtcblxuICAgICAgc291cmNlID0gJzw/eG1sIHZlcnNpb249XCIxLjBcIiBzdGFuZGFsb25lPVwibm9cIj8+XFxyXFxuJyArIHNvdXJjZTtcbiAgICAgIGNvbnN0IHVybCA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUklDb21wb25lbnQoc291cmNlKTtcbiAgICAgIGRvd25sb2FkVVJJKHVybCwgYCR7bmFtZX0uc3ZnYCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHVybCA9IChlbGVtZW50IGFzIHVua25vd24gYXMgUVJDYW52YXMpLmdldENhbnZhcygpLnRvRGF0YVVSTChgaW1hZ2UvJHtleHRlbnNpb259YCk7XG4gICAgICBkb3dubG9hZFVSSSh1cmwsIGAke25hbWV9LiR7ZXh0ZW5zaW9ufWApO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHFyVHlwZXMgZnJvbSBcIi4uL2NvbnN0YW50cy9xclR5cGVzXCI7XG5pbXBvcnQgZHJhd1R5cGVzIGZyb20gXCIuLi9jb25zdGFudHMvZHJhd1R5cGVzXCI7XG5pbXBvcnQgZXJyb3JDb3JyZWN0aW9uTGV2ZWxzIGZyb20gXCIuLi9jb25zdGFudHMvZXJyb3JDb3JyZWN0aW9uTGV2ZWxzXCI7XG5pbXBvcnQgeyBEb3RUeXBlLCBPcHRpb25zLCBUeXBlTnVtYmVyLCBFcnJvckNvcnJlY3Rpb25MZXZlbCwgTW9kZSwgRHJhd1R5cGUsIEdyYWRpZW50IH0gZnJvbSBcIi4uL3R5cGVzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWlyZWRPcHRpb25zIGV4dGVuZHMgT3B0aW9ucyB7XG4gIHR5cGU6IERyYXdUeXBlO1xuICB3aWR0aDogbnVtYmVyO1xuICBoZWlnaHQ6IG51bWJlcjtcbiAgbWFyZ2luOiBudW1iZXI7XG4gIGRhdGE6IHN0cmluZztcbiAgcXJPcHRpb25zOiB7XG4gICAgdHlwZU51bWJlcjogVHlwZU51bWJlcjtcbiAgICBtb2RlPzogTW9kZTtcbiAgICBlcnJvckNvcnJlY3Rpb25MZXZlbDogRXJyb3JDb3JyZWN0aW9uTGV2ZWw7XG4gIH07XG4gIGltYWdlT3B0aW9uczoge1xuICAgIGhpZGVCYWNrZ3JvdW5kRG90czogYm9vbGVhbjtcbiAgICBpbWFnZVNpemU6IG51bWJlcjtcbiAgICBjcm9zc09yaWdpbj86IHN0cmluZztcbiAgICBtYXJnaW46IG51bWJlcjtcbiAgfTtcbiAgZG90c09wdGlvbnM6IHtcbiAgICB0eXBlOiBEb3RUeXBlO1xuICAgIGNvbG9yOiBzdHJpbmc7XG4gICAgZ3JhZGllbnQ/OiBHcmFkaWVudDtcbiAgfTtcbiAgYmFja2dyb3VuZE9wdGlvbnM6IHtcbiAgICBjb2xvcjogc3RyaW5nO1xuICAgIGdyYWRpZW50PzogR3JhZGllbnQ7XG4gIH07XG59XG5cbmNvbnN0IGRlZmF1bHRPcHRpb25zOiBSZXF1aXJlZE9wdGlvbnMgPSB7XG4gIHR5cGU6IGRyYXdUeXBlcy5jYW52YXMsXG4gIHdpZHRoOiAzMDAsXG4gIGhlaWdodDogMzAwLFxuICBkYXRhOiBcIlwiLFxuICBtYXJnaW46IDAsXG4gIHFyT3B0aW9uczoge1xuICAgIHR5cGVOdW1iZXI6IHFyVHlwZXNbMF0sXG4gICAgbW9kZTogdW5kZWZpbmVkLFxuICAgIGVycm9yQ29ycmVjdGlvbkxldmVsOiBlcnJvckNvcnJlY3Rpb25MZXZlbHMuUVxuICB9LFxuICBpbWFnZU9wdGlvbnM6IHtcbiAgICBoaWRlQmFja2dyb3VuZERvdHM6IHRydWUsXG4gICAgaW1hZ2VTaXplOiAwLjQsXG4gICAgY3Jvc3NPcmlnaW46IHVuZGVmaW5lZCxcbiAgICBtYXJnaW46IDBcbiAgfSxcbiAgZG90c09wdGlvbnM6IHtcbiAgICB0eXBlOiBcInNxdWFyZVwiLFxuICAgIGNvbG9yOiBcIiMwMDBcIlxuICB9LFxuICBiYWNrZ3JvdW5kT3B0aW9uczoge1xuICAgIGNvbG9yOiBcIiNmZmZcIlxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBkZWZhdWx0T3B0aW9ucztcbiIsImltcG9ydCBjYWxjdWxhdGVJbWFnZVNpemUgZnJvbSBcIi4uL3Rvb2xzL2NhbGN1bGF0ZUltYWdlU2l6ZVwiO1xuaW1wb3J0IGVycm9yQ29ycmVjdGlvblBlcmNlbnRzIGZyb20gXCIuLi9jb25zdGFudHMvZXJyb3JDb3JyZWN0aW9uUGVyY2VudHNcIjtcbmltcG9ydCBRUkRvdCBmcm9tIFwiLi4vZmlndXJlcy9kb3Qvc3ZnL1FSRG90XCI7XG5pbXBvcnQgUVJDb3JuZXJTcXVhcmUgZnJvbSBcIi4uL2ZpZ3VyZXMvY29ybmVyU3F1YXJlL3N2Zy9RUkNvcm5lclNxdWFyZVwiO1xuaW1wb3J0IFFSQ29ybmVyRG90IGZyb20gXCIuLi9maWd1cmVzL2Nvcm5lckRvdC9zdmcvUVJDb3JuZXJEb3RcIjtcbmltcG9ydCB7IFJlcXVpcmVkT3B0aW9ucyB9IGZyb20gXCIuL1FST3B0aW9uc1wiO1xuaW1wb3J0IGdyYWRpZW50VHlwZXMgZnJvbSBcIi4uL2NvbnN0YW50cy9ncmFkaWVudFR5cGVzXCI7XG5pbXBvcnQgeyBRUkNvZGUsIEZpbHRlckZ1bmN0aW9uLCBHcmFkaWVudCB9IGZyb20gXCIuLi90eXBlc1wiO1xuXG5jb25zdCBzcXVhcmVNYXNrID0gW1xuICBbMSwgMSwgMSwgMSwgMSwgMSwgMV0sXG4gIFsxLCAwLCAwLCAwLCAwLCAwLCAxXSxcbiAgWzEsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICBbMSwgMCwgMCwgMCwgMCwgMCwgMV0sXG4gIFsxLCAwLCAwLCAwLCAwLCAwLCAxXSxcbiAgWzEsIDAsIDAsIDAsIDAsIDAsIDFdLFxuICBbMSwgMSwgMSwgMSwgMSwgMSwgMV1cbl07XG5cbmNvbnN0IGRvdE1hc2sgPSBbXG4gIFswLCAwLCAwLCAwLCAwLCAwLCAwXSxcbiAgWzAsIDAsIDAsIDAsIDAsIDAsIDBdLFxuICBbMCwgMCwgMSwgMSwgMSwgMCwgMF0sXG4gIFswLCAwLCAxLCAxLCAxLCAwLCAwXSxcbiAgWzAsIDAsIDEsIDEsIDEsIDAsIDBdLFxuICBbMCwgMCwgMCwgMCwgMCwgMCwgMF0sXG4gIFswLCAwLCAwLCAwLCAwLCAwLCAwXVxuXTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUVJTVkcge1xuICBfZWxlbWVudDogU1ZHRWxlbWVudDtcbiAgX2RlZnM6IFNWR0VsZW1lbnQ7XG4gIF9kb3RzQ2xpcFBhdGg/OiBTVkdFbGVtZW50O1xuICBfY29ybmVyc1NxdWFyZUNsaXBQYXRoPzogU1ZHRWxlbWVudDtcbiAgX2Nvcm5lcnNEb3RDbGlwUGF0aD86IFNWR0VsZW1lbnQ7XG4gIF9vcHRpb25zOiBSZXF1aXJlZE9wdGlvbnM7XG4gIF9xcj86IFFSQ29kZTtcbiAgX2ltYWdlPzogSFRNTEltYWdlRWxlbWVudDtcblxuICAvL1RPRE8gZG9uJ3QgcGFzcyBhbGwgb3B0aW9ucyB0byB0aGlzIGNsYXNzXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFJlcXVpcmVkT3B0aW9ucykge1xuICAgIHRoaXMuX2VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInN2Z1wiKTtcbiAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIFN0cmluZyhvcHRpb25zLndpZHRoKSk7XG4gICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgU3RyaW5nKG9wdGlvbnMuaGVpZ2h0KSk7XG4gICAgdGhpcy5fZGVmcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwiZGVmc1wiKTtcbiAgICB0aGlzLl9lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX2RlZnMpO1xuXG4gICAgdGhpcy5fb3B0aW9ucyA9IG9wdGlvbnM7XG4gIH1cblxuICBnZXQgd2lkdGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fb3B0aW9ucy53aWR0aDtcbiAgfVxuXG4gIGdldCBoZWlnaHQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fb3B0aW9ucy5oZWlnaHQ7XG4gIH1cblxuICBnZXRFbGVtZW50KCk6IFNWR0VsZW1lbnQge1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50O1xuICB9XG5cbiAgY2xlYXIoKTogdm9pZCB7XG4gICAgY29uc3Qgb2xkRWxlbWVudCA9IHRoaXMuX2VsZW1lbnQ7XG4gICAgdGhpcy5fZWxlbWVudCA9IG9sZEVsZW1lbnQuY2xvbmVOb2RlKGZhbHNlKSBhcyBTVkdFbGVtZW50O1xuICAgIG9sZEVsZW1lbnQ/LnBhcmVudE5vZGU/LnJlcGxhY2VDaGlsZCh0aGlzLl9lbGVtZW50LCBvbGRFbGVtZW50KTtcbiAgICB0aGlzLl9kZWZzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJkZWZzXCIpO1xuICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5fZGVmcyk7XG4gIH1cblxuICBhc3luYyBkcmF3UVIocXI6IFFSQ29kZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNvdW50ID0gcXIuZ2V0TW9kdWxlQ291bnQoKTtcbiAgICBjb25zdCBtaW5TaXplID0gTWF0aC5taW4odGhpcy5fb3B0aW9ucy53aWR0aCwgdGhpcy5fb3B0aW9ucy5oZWlnaHQpIC0gdGhpcy5fb3B0aW9ucy5tYXJnaW4gKiAyO1xuICAgIGNvbnN0IGRvdFNpemUgPSBNYXRoLmZsb29yKG1pblNpemUgLyBjb3VudCk7XG4gICAgbGV0IGRyYXdJbWFnZVNpemUgPSB7XG4gICAgICBoaWRlWERvdHM6IDAsXG4gICAgICBoaWRlWURvdHM6IDAsXG4gICAgICB3aWR0aDogMCxcbiAgICAgIGhlaWdodDogMFxuICAgIH07XG5cbiAgICB0aGlzLl9xciA9IHFyO1xuXG4gICAgaWYgKHRoaXMuX29wdGlvbnMuaW1hZ2UpIHtcbiAgICAgIC8vV2UgbmVlZCBpdCB0byBnZXQgaW1hZ2Ugc2l6ZVxuICAgICAgYXdhaXQgdGhpcy5sb2FkSW1hZ2UoKTtcbiAgICAgIGlmICghdGhpcy5faW1hZ2UpIHJldHVybjtcbiAgICAgIGNvbnN0IHsgaW1hZ2VPcHRpb25zLCBxck9wdGlvbnMgfSA9IHRoaXMuX29wdGlvbnM7XG4gICAgICBjb25zdCBjb3ZlckxldmVsID0gaW1hZ2VPcHRpb25zLmltYWdlU2l6ZSAqIGVycm9yQ29ycmVjdGlvblBlcmNlbnRzW3FyT3B0aW9ucy5lcnJvckNvcnJlY3Rpb25MZXZlbF07XG4gICAgICBjb25zdCBtYXhIaWRkZW5Eb3RzID0gTWF0aC5mbG9vcihjb3ZlckxldmVsICogY291bnQgKiBjb3VudCk7XG5cbiAgICAgIGRyYXdJbWFnZVNpemUgPSBjYWxjdWxhdGVJbWFnZVNpemUoe1xuICAgICAgICBvcmlnaW5hbFdpZHRoOiB0aGlzLl9pbWFnZS53aWR0aCxcbiAgICAgICAgb3JpZ2luYWxIZWlnaHQ6IHRoaXMuX2ltYWdlLmhlaWdodCxcbiAgICAgICAgbWF4SGlkZGVuRG90cyxcbiAgICAgICAgbWF4SGlkZGVuQXhpc0RvdHM6IGNvdW50IC0gMTQsXG4gICAgICAgIGRvdFNpemVcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuY2xlYXIoKTtcbiAgICB0aGlzLmRyYXdCYWNrZ3JvdW5kKCk7XG4gICAgdGhpcy5kcmF3RG90cygoaTogbnVtYmVyLCBqOiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICAgIGlmICh0aGlzLl9vcHRpb25zLmltYWdlT3B0aW9ucy5oaWRlQmFja2dyb3VuZERvdHMpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGkgPj0gKGNvdW50IC0gZHJhd0ltYWdlU2l6ZS5oaWRlWERvdHMpIC8gMiAmJlxuICAgICAgICAgIGkgPCAoY291bnQgKyBkcmF3SW1hZ2VTaXplLmhpZGVYRG90cykgLyAyICYmXG4gICAgICAgICAgaiA+PSAoY291bnQgLSBkcmF3SW1hZ2VTaXplLmhpZGVZRG90cykgLyAyICYmXG4gICAgICAgICAgaiA8IChjb3VudCArIGRyYXdJbWFnZVNpemUuaGlkZVlEb3RzKSAvIDJcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzcXVhcmVNYXNrW2ldPy5bal0gfHwgc3F1YXJlTWFza1tpIC0gY291bnQgKyA3XT8uW2pdIHx8IHNxdWFyZU1hc2tbaV0/LltqIC0gY291bnQgKyA3XSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmIChkb3RNYXNrW2ldPy5bal0gfHwgZG90TWFza1tpIC0gY291bnQgKyA3XT8uW2pdIHx8IGRvdE1hc2tbaV0/LltqIC0gY291bnQgKyA3XSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICAgIHRoaXMuZHJhd0Nvcm5lcnMoKTtcblxuICAgIGlmICh0aGlzLl9vcHRpb25zLmltYWdlKSB7XG4gICAgICB0aGlzLmRyYXdJbWFnZSh7IHdpZHRoOiBkcmF3SW1hZ2VTaXplLndpZHRoLCBoZWlnaHQ6IGRyYXdJbWFnZVNpemUuaGVpZ2h0LCBjb3VudCwgZG90U2l6ZSB9KTtcbiAgICB9XG4gIH1cblxuICBkcmF3QmFja2dyb3VuZCgpOiB2b2lkIHtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudDtcbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5fb3B0aW9ucztcblxuICAgIGlmIChlbGVtZW50KSB7XG4gICAgICBjb25zdCBncmFkaWVudE9wdGlvbnMgPSBvcHRpb25zLmJhY2tncm91bmRPcHRpb25zPy5ncmFkaWVudDtcbiAgICAgIGNvbnN0IGNvbG9yID0gb3B0aW9ucy5iYWNrZ3JvdW5kT3B0aW9ucz8uY29sb3I7XG5cbiAgICAgIGlmIChncmFkaWVudE9wdGlvbnMgfHwgY29sb3IpIHtcbiAgICAgICAgdGhpcy5fY3JlYXRlQ29sb3Ioe1xuICAgICAgICAgIG9wdGlvbnM6IGdyYWRpZW50T3B0aW9ucyxcbiAgICAgICAgICBjb2xvcjogY29sb3IsXG4gICAgICAgICAgYWRkaXRpb25hbFJvdGF0aW9uOiAwLFxuICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgeTogMCxcbiAgICAgICAgICBoZWlnaHQ6IG9wdGlvbnMuaGVpZ2h0LFxuICAgICAgICAgIHdpZHRoOiBvcHRpb25zLndpZHRoLFxuICAgICAgICAgIG5hbWU6IFwiYmFja2dyb3VuZC1jb2xvclwiXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGRyYXdEb3RzKGZpbHRlcj86IEZpbHRlckZ1bmN0aW9uKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9xcikge1xuICAgICAgdGhyb3cgXCJRUiBjb2RlIGlzIG5vdCBkZWZpbmVkXCI7XG4gICAgfVxuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG4gICAgY29uc3QgY291bnQgPSB0aGlzLl9xci5nZXRNb2R1bGVDb3VudCgpO1xuXG4gICAgaWYgKGNvdW50ID4gb3B0aW9ucy53aWR0aCB8fCBjb3VudCA+IG9wdGlvbnMuaGVpZ2h0KSB7XG4gICAgICB0aHJvdyBcIlRoZSBjYW52YXMgaXMgdG9vIHNtYWxsLlwiO1xuICAgIH1cblxuICAgIGNvbnN0IG1pblNpemUgPSBNYXRoLm1pbihvcHRpb25zLndpZHRoLCBvcHRpb25zLmhlaWdodCkgLSBvcHRpb25zLm1hcmdpbiAqIDI7XG4gICAgY29uc3QgZG90U2l6ZSA9IE1hdGguZmxvb3IobWluU2l6ZSAvIGNvdW50KTtcbiAgICBjb25zdCB4QmVnaW5uaW5nID0gTWF0aC5mbG9vcigob3B0aW9ucy53aWR0aCAtIGNvdW50ICogZG90U2l6ZSkgLyAyKTtcbiAgICBjb25zdCB5QmVnaW5uaW5nID0gTWF0aC5mbG9vcigob3B0aW9ucy5oZWlnaHQgLSBjb3VudCAqIGRvdFNpemUpIC8gMik7XG4gICAgY29uc3QgZG90ID0gbmV3IFFSRG90KHsgc3ZnOiB0aGlzLl9lbGVtZW50LCB0eXBlOiBvcHRpb25zLmRvdHNPcHRpb25zLnR5cGUgfSk7XG5cbiAgICB0aGlzLl9kb3RzQ2xpcFBhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImNsaXBQYXRoXCIpO1xuICAgIHRoaXMuX2RvdHNDbGlwUGF0aC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImNsaXAtcGF0aC1kb3QtY29sb3JcIik7XG4gICAgdGhpcy5fZGVmcy5hcHBlbmRDaGlsZCh0aGlzLl9kb3RzQ2xpcFBhdGgpO1xuXG4gICAgdGhpcy5fY3JlYXRlQ29sb3Ioe1xuICAgICAgb3B0aW9uczogb3B0aW9ucy5kb3RzT3B0aW9ucz8uZ3JhZGllbnQsXG4gICAgICBjb2xvcjogb3B0aW9ucy5kb3RzT3B0aW9ucy5jb2xvcixcbiAgICAgIGFkZGl0aW9uYWxSb3RhdGlvbjogMCxcbiAgICAgIHg6IHhCZWdpbm5pbmcsXG4gICAgICB5OiB5QmVnaW5uaW5nLFxuICAgICAgaGVpZ2h0OiBjb3VudCAqIGRvdFNpemUsXG4gICAgICB3aWR0aDogY291bnQgKiBkb3RTaXplLFxuICAgICAgbmFtZTogXCJkb3QtY29sb3JcIlxuICAgIH0pO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGNvdW50OyBqKyspIHtcbiAgICAgICAgaWYgKGZpbHRlciAmJiAhZmlsdGVyKGksIGopKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9xcj8uaXNEYXJrKGksIGopKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBkb3QuZHJhdyhcbiAgICAgICAgICB4QmVnaW5uaW5nICsgaSAqIGRvdFNpemUsXG4gICAgICAgICAgeUJlZ2lubmluZyArIGogKiBkb3RTaXplLFxuICAgICAgICAgIGRvdFNpemUsXG4gICAgICAgICAgKHhPZmZzZXQ6IG51bWJlciwgeU9mZnNldDogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gICAgICAgICAgICBpZiAoaSArIHhPZmZzZXQgPCAwIHx8IGogKyB5T2Zmc2V0IDwgMCB8fCBpICsgeE9mZnNldCA+PSBjb3VudCB8fCBqICsgeU9mZnNldCA+PSBjb3VudCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgaWYgKGZpbHRlciAmJiAhZmlsdGVyKGkgKyB4T2Zmc2V0LCBqICsgeU9mZnNldCkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiAhIXRoaXMuX3FyICYmIHRoaXMuX3FyLmlzRGFyayhpICsgeE9mZnNldCwgaiArIHlPZmZzZXQpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoZG90Ll9lbGVtZW50ICYmIHRoaXMuX2RvdHNDbGlwUGF0aCkge1xuICAgICAgICAgIHRoaXMuX2RvdHNDbGlwUGF0aC5hcHBlbmRDaGlsZChkb3QuX2VsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZHJhd0Nvcm5lcnMoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9xcikge1xuICAgICAgdGhyb3cgXCJRUiBjb2RlIGlzIG5vdCBkZWZpbmVkXCI7XG4gICAgfVxuXG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2VsZW1lbnQ7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG5cbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgIHRocm93IFwiRWxlbWVudCBjb2RlIGlzIG5vdCBkZWZpbmVkXCI7XG4gICAgfVxuXG4gICAgY29uc3QgY291bnQgPSB0aGlzLl9xci5nZXRNb2R1bGVDb3VudCgpO1xuICAgIGNvbnN0IG1pblNpemUgPSBNYXRoLm1pbihvcHRpb25zLndpZHRoLCBvcHRpb25zLmhlaWdodCkgLSBvcHRpb25zLm1hcmdpbiAqIDI7XG4gICAgY29uc3QgZG90U2l6ZSA9IE1hdGguZmxvb3IobWluU2l6ZSAvIGNvdW50KTtcbiAgICBjb25zdCBjb3JuZXJzU3F1YXJlU2l6ZSA9IGRvdFNpemUgKiA3O1xuICAgIGNvbnN0IGNvcm5lcnNEb3RTaXplID0gZG90U2l6ZSAqIDM7XG4gICAgY29uc3QgeEJlZ2lubmluZyA9IE1hdGguZmxvb3IoKG9wdGlvbnMud2lkdGggLSBjb3VudCAqIGRvdFNpemUpIC8gMik7XG4gICAgY29uc3QgeUJlZ2lubmluZyA9IE1hdGguZmxvb3IoKG9wdGlvbnMuaGVpZ2h0IC0gY291bnQgKiBkb3RTaXplKSAvIDIpO1xuXG4gICAgW1xuICAgICAgWzAsIDAsIDBdLFxuICAgICAgWzEsIDAsIE1hdGguUEkgLyAyXSxcbiAgICAgIFswLCAxLCAtTWF0aC5QSSAvIDJdXG4gICAgXS5mb3JFYWNoKChbY29sdW1uLCByb3csIHJvdGF0aW9uXSkgPT4ge1xuICAgICAgY29uc3QgeCA9IHhCZWdpbm5pbmcgKyBjb2x1bW4gKiBkb3RTaXplICogKGNvdW50IC0gNyk7XG4gICAgICBjb25zdCB5ID0geUJlZ2lubmluZyArIHJvdyAqIGRvdFNpemUgKiAoY291bnQgLSA3KTtcbiAgICAgIGxldCBjb3JuZXJzU3F1YXJlQ2xpcFBhdGggPSB0aGlzLl9kb3RzQ2xpcFBhdGg7XG4gICAgICBsZXQgY29ybmVyc0RvdENsaXBQYXRoID0gdGhpcy5fZG90c0NsaXBQYXRoO1xuXG4gICAgICBpZiAob3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9ucz8uZ3JhZGllbnQgfHwgb3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9ucz8uY29sb3IpIHtcbiAgICAgICAgY29ybmVyc1NxdWFyZUNsaXBQYXRoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJjbGlwUGF0aFwiKTtcbiAgICAgICAgY29ybmVyc1NxdWFyZUNsaXBQYXRoLnNldEF0dHJpYnV0ZShcImlkXCIsIGBjbGlwLXBhdGgtY29ybmVycy1zcXVhcmUtY29sb3ItJHtjb2x1bW59LSR7cm93fWApO1xuICAgICAgICB0aGlzLl9kZWZzLmFwcGVuZENoaWxkKGNvcm5lcnNTcXVhcmVDbGlwUGF0aCk7XG4gICAgICAgIHRoaXMuX2Nvcm5lcnNTcXVhcmVDbGlwUGF0aCA9IHRoaXMuX2Nvcm5lcnNEb3RDbGlwUGF0aCA9IGNvcm5lcnNEb3RDbGlwUGF0aCA9IGNvcm5lcnNTcXVhcmVDbGlwUGF0aDtcblxuICAgICAgICB0aGlzLl9jcmVhdGVDb2xvcih7XG4gICAgICAgICAgb3B0aW9uczogb3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9ucz8uZ3JhZGllbnQsXG4gICAgICAgICAgY29sb3I6IG9wdGlvbnMuY29ybmVyc1NxdWFyZU9wdGlvbnM/LmNvbG9yLFxuICAgICAgICAgIGFkZGl0aW9uYWxSb3RhdGlvbjogcm90YXRpb24sXG4gICAgICAgICAgeCxcbiAgICAgICAgICB5LFxuICAgICAgICAgIGhlaWdodDogY29ybmVyc1NxdWFyZVNpemUsXG4gICAgICAgICAgd2lkdGg6IGNvcm5lcnNTcXVhcmVTaXplLFxuICAgICAgICAgIG5hbWU6IGBjb3JuZXJzLXNxdWFyZS1jb2xvci0ke2NvbHVtbn0tJHtyb3d9YFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuY29ybmVyc1NxdWFyZU9wdGlvbnM/LnR5cGUpIHtcbiAgICAgICAgY29uc3QgY29ybmVyc1NxdWFyZSA9IG5ldyBRUkNvcm5lclNxdWFyZSh7IHN2ZzogdGhpcy5fZWxlbWVudCwgdHlwZTogb3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9ucy50eXBlIH0pO1xuXG4gICAgICAgIGNvcm5lcnNTcXVhcmUuZHJhdyh4LCB5LCBjb3JuZXJzU3F1YXJlU2l6ZSwgcm90YXRpb24pO1xuXG4gICAgICAgIGlmIChjb3JuZXJzU3F1YXJlLl9lbGVtZW50ICYmIGNvcm5lcnNTcXVhcmVDbGlwUGF0aCkge1xuICAgICAgICAgIGNvcm5lcnNTcXVhcmVDbGlwUGF0aC5hcHBlbmRDaGlsZChjb3JuZXJzU3F1YXJlLl9lbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZG90ID0gbmV3IFFSRG90KHsgc3ZnOiB0aGlzLl9lbGVtZW50LCB0eXBlOiBvcHRpb25zLmRvdHNPcHRpb25zLnR5cGUgfSk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzcXVhcmVNYXNrLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzcXVhcmVNYXNrW2ldLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBpZiAoIXNxdWFyZU1hc2tbaV0/LltqXSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZG90LmRyYXcoXG4gICAgICAgICAgICAgIHggKyBpICogZG90U2l6ZSxcbiAgICAgICAgICAgICAgeSArIGogKiBkb3RTaXplLFxuICAgICAgICAgICAgICBkb3RTaXplLFxuICAgICAgICAgICAgICAoeE9mZnNldDogbnVtYmVyLCB5T2Zmc2V0OiBudW1iZXIpOiBib29sZWFuID0+ICEhc3F1YXJlTWFza1tpICsgeE9mZnNldF0/LltqICsgeU9mZnNldF1cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmIChkb3QuX2VsZW1lbnQgJiYgY29ybmVyc1NxdWFyZUNsaXBQYXRoKSB7XG4gICAgICAgICAgICAgIGNvcm5lcnNTcXVhcmVDbGlwUGF0aC5hcHBlbmRDaGlsZChkb3QuX2VsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucz8uZ3JhZGllbnQgfHwgb3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucz8uY29sb3IpIHtcbiAgICAgICAgY29ybmVyc0RvdENsaXBQYXRoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJjbGlwUGF0aFwiKTtcbiAgICAgICAgY29ybmVyc0RvdENsaXBQYXRoLnNldEF0dHJpYnV0ZShcImlkXCIsIGBjbGlwLXBhdGgtY29ybmVycy1kb3QtY29sb3ItJHtjb2x1bW59LSR7cm93fWApO1xuICAgICAgICB0aGlzLl9kZWZzLmFwcGVuZENoaWxkKGNvcm5lcnNEb3RDbGlwUGF0aCk7XG4gICAgICAgIHRoaXMuX2Nvcm5lcnNEb3RDbGlwUGF0aCA9IGNvcm5lcnNEb3RDbGlwUGF0aDtcblxuICAgICAgICB0aGlzLl9jcmVhdGVDb2xvcih7XG4gICAgICAgICAgb3B0aW9uczogb3B0aW9ucy5jb3JuZXJzRG90T3B0aW9ucz8uZ3JhZGllbnQsXG4gICAgICAgICAgY29sb3I6IG9wdGlvbnMuY29ybmVyc0RvdE9wdGlvbnM/LmNvbG9yLFxuICAgICAgICAgIGFkZGl0aW9uYWxSb3RhdGlvbjogcm90YXRpb24sXG4gICAgICAgICAgeDogeCArIGRvdFNpemUgKiAyLFxuICAgICAgICAgIHk6IHkgKyBkb3RTaXplICogMixcbiAgICAgICAgICBoZWlnaHQ6IGNvcm5lcnNEb3RTaXplLFxuICAgICAgICAgIHdpZHRoOiBjb3JuZXJzRG90U2l6ZSxcbiAgICAgICAgICBuYW1lOiBgY29ybmVycy1kb3QtY29sb3ItJHtjb2x1bW59LSR7cm93fWBcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLmNvcm5lcnNEb3RPcHRpb25zPy50eXBlKSB7XG4gICAgICAgIGNvbnN0IGNvcm5lcnNEb3QgPSBuZXcgUVJDb3JuZXJEb3QoeyBzdmc6IHRoaXMuX2VsZW1lbnQsIHR5cGU6IG9wdGlvbnMuY29ybmVyc0RvdE9wdGlvbnMudHlwZSB9KTtcblxuICAgICAgICBjb3JuZXJzRG90LmRyYXcoeCArIGRvdFNpemUgKiAyLCB5ICsgZG90U2l6ZSAqIDIsIGNvcm5lcnNEb3RTaXplLCByb3RhdGlvbik7XG5cbiAgICAgICAgaWYgKGNvcm5lcnNEb3QuX2VsZW1lbnQgJiYgY29ybmVyc0RvdENsaXBQYXRoKSB7XG4gICAgICAgICAgY29ybmVyc0RvdENsaXBQYXRoLmFwcGVuZENoaWxkKGNvcm5lcnNEb3QuX2VsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkb3QgPSBuZXcgUVJEb3QoeyBzdmc6IHRoaXMuX2VsZW1lbnQsIHR5cGU6IG9wdGlvbnMuZG90c09wdGlvbnMudHlwZSB9KTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRvdE1hc2subGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGRvdE1hc2tbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmICghZG90TWFza1tpXT8uW2pdKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkb3QuZHJhdyhcbiAgICAgICAgICAgICAgeCArIGkgKiBkb3RTaXplLFxuICAgICAgICAgICAgICB5ICsgaiAqIGRvdFNpemUsXG4gICAgICAgICAgICAgIGRvdFNpemUsXG4gICAgICAgICAgICAgICh4T2Zmc2V0OiBudW1iZXIsIHlPZmZzZXQ6IG51bWJlcik6IGJvb2xlYW4gPT4gISFkb3RNYXNrW2kgKyB4T2Zmc2V0XT8uW2ogKyB5T2Zmc2V0XVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKGRvdC5fZWxlbWVudCAmJiBjb3JuZXJzRG90Q2xpcFBhdGgpIHtcbiAgICAgICAgICAgICAgY29ybmVyc0RvdENsaXBQYXRoLmFwcGVuZENoaWxkKGRvdC5fZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBsb2FkSW1hZ2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zO1xuICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblxuICAgICAgaWYgKCFvcHRpb25zLmltYWdlKSB7XG4gICAgICAgIHJldHVybiByZWplY3QoXCJJbWFnZSBpcyBub3QgZGVmaW5lZFwiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmltYWdlT3B0aW9ucy5jcm9zc09yaWdpbiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBpbWFnZS5jcm9zc09yaWdpbiA9IG9wdGlvbnMuaW1hZ2VPcHRpb25zLmNyb3NzT3JpZ2luO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9pbWFnZSA9IGltYWdlO1xuICAgICAgaW1hZ2Uub25sb2FkID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9O1xuICAgICAgaW1hZ2Uuc3JjID0gb3B0aW9ucy5pbWFnZTtcbiAgICB9KTtcbiAgfVxuXG4gIGRyYXdJbWFnZSh7XG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIGNvdW50LFxuICAgIGRvdFNpemVcbiAgfToge1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgY291bnQ6IG51bWJlcjtcbiAgICBkb3RTaXplOiBudW1iZXI7XG4gIH0pOiB2b2lkIHtcbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5fb3B0aW9ucztcbiAgICBjb25zdCB4QmVnaW5uaW5nID0gTWF0aC5mbG9vcigob3B0aW9ucy53aWR0aCAtIGNvdW50ICogZG90U2l6ZSkgLyAyKTtcbiAgICBjb25zdCB5QmVnaW5uaW5nID0gTWF0aC5mbG9vcigob3B0aW9ucy5oZWlnaHQgLSBjb3VudCAqIGRvdFNpemUpIC8gMik7XG4gICAgY29uc3QgZHggPSB4QmVnaW5uaW5nICsgb3B0aW9ucy5pbWFnZU9wdGlvbnMubWFyZ2luICsgKGNvdW50ICogZG90U2l6ZSAtIHdpZHRoKSAvIDI7XG4gICAgY29uc3QgZHkgPSB5QmVnaW5uaW5nICsgb3B0aW9ucy5pbWFnZU9wdGlvbnMubWFyZ2luICsgKGNvdW50ICogZG90U2l6ZSAtIGhlaWdodCkgLyAyO1xuICAgIGNvbnN0IGR3ID0gd2lkdGggLSBvcHRpb25zLmltYWdlT3B0aW9ucy5tYXJnaW4gKiAyO1xuICAgIGNvbnN0IGRoID0gaGVpZ2h0IC0gb3B0aW9ucy5pbWFnZU9wdGlvbnMubWFyZ2luICogMjtcblxuICAgIGNvbnN0IGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJpbWFnZVwiKTtcbiAgICBpbWFnZS5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIG9wdGlvbnMuaW1hZ2UgfHwgXCJcIik7XG4gICAgaW1hZ2Uuc2V0QXR0cmlidXRlKFwieFwiLCBTdHJpbmcoZHgpKTtcbiAgICBpbWFnZS5zZXRBdHRyaWJ1dGUoXCJ5XCIsIFN0cmluZyhkeSkpO1xuICAgIGltYWdlLnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIGAke2R3fXB4YCk7XG4gICAgaW1hZ2Uuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIGAke2RofXB4YCk7XG5cbiAgICB0aGlzLl9lbGVtZW50LmFwcGVuZENoaWxkKGltYWdlKTtcbiAgfVxuXG4gIF9jcmVhdGVDb2xvcih7XG4gICAgb3B0aW9ucyxcbiAgICBjb2xvcixcbiAgICBhZGRpdGlvbmFsUm90YXRpb24sXG4gICAgeCxcbiAgICB5LFxuICAgIGhlaWdodCxcbiAgICB3aWR0aCxcbiAgICBuYW1lXG4gIH06IHtcbiAgICBvcHRpb25zPzogR3JhZGllbnQ7XG4gICAgY29sb3I/OiBzdHJpbmc7XG4gICAgYWRkaXRpb25hbFJvdGF0aW9uOiBudW1iZXI7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIG5hbWU6IHN0cmluZztcbiAgfSk6IHZvaWQge1xuICAgIGNvbnN0IHNpemUgPSB3aWR0aCA+IGhlaWdodCA/IHdpZHRoIDogaGVpZ2h0O1xuICAgIGNvbnN0IHJlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInJlY3RcIik7XG4gICAgcmVjdC5zZXRBdHRyaWJ1dGUoXCJ4XCIsIFN0cmluZyh4KSk7XG4gICAgcmVjdC5zZXRBdHRyaWJ1dGUoXCJ5XCIsIFN0cmluZyh5KSk7XG4gICAgcmVjdC5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgU3RyaW5nKGhlaWdodCkpO1xuICAgIHJlY3Quc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgU3RyaW5nKHdpZHRoKSk7XG4gICAgcmVjdC5zZXRBdHRyaWJ1dGUoXCJjbGlwLXBhdGhcIiwgYHVybCgnI2NsaXAtcGF0aC0ke25hbWV9JylgKTtcblxuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICBsZXQgZ3JhZGllbnQ6IFNWR0VsZW1lbnQ7XG4gICAgICBpZiAob3B0aW9ucy50eXBlID09PSBncmFkaWVudFR5cGVzLnJhZGlhbCkge1xuICAgICAgICBncmFkaWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwicmFkaWFsR3JhZGllbnRcIik7XG4gICAgICAgIGdyYWRpZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIG5hbWUpO1xuICAgICAgICBncmFkaWVudC5zZXRBdHRyaWJ1dGUoXCJncmFkaWVudFVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIik7XG4gICAgICAgIGdyYWRpZW50LnNldEF0dHJpYnV0ZShcImZ4XCIsIFN0cmluZyh4ICsgd2lkdGggLyAyKSk7XG4gICAgICAgIGdyYWRpZW50LnNldEF0dHJpYnV0ZShcImZ5XCIsIFN0cmluZyh5ICsgaGVpZ2h0IC8gMikpO1xuICAgICAgICBncmFkaWVudC5zZXRBdHRyaWJ1dGUoXCJjeFwiLCBTdHJpbmcoeCArIHdpZHRoIC8gMikpO1xuICAgICAgICBncmFkaWVudC5zZXRBdHRyaWJ1dGUoXCJjeVwiLCBTdHJpbmcoeSArIGhlaWdodCAvIDIpKTtcbiAgICAgICAgZ3JhZGllbnQuc2V0QXR0cmlidXRlKFwiclwiLCBTdHJpbmcoc2l6ZSAvIDIpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHJvdGF0aW9uID0gKChvcHRpb25zLnJvdGF0aW9uIHx8IDApICsgYWRkaXRpb25hbFJvdGF0aW9uKSAlICgyICogTWF0aC5QSSk7XG4gICAgICAgIGNvbnN0IHBvc2l0aXZlUm90YXRpb24gPSAocm90YXRpb24gKyAyICogTWF0aC5QSSkgJSAoMiAqIE1hdGguUEkpO1xuICAgICAgICBsZXQgeDAgPSB4ICsgd2lkdGggLyAyO1xuICAgICAgICBsZXQgeTAgPSB5ICsgaGVpZ2h0IC8gMjtcbiAgICAgICAgbGV0IHgxID0geCArIHdpZHRoIC8gMjtcbiAgICAgICAgbGV0IHkxID0geSArIGhlaWdodCAvIDI7XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIChwb3NpdGl2ZVJvdGF0aW9uID49IDAgJiYgcG9zaXRpdmVSb3RhdGlvbiA8PSAwLjI1ICogTWF0aC5QSSkgfHxcbiAgICAgICAgICAocG9zaXRpdmVSb3RhdGlvbiA+IDEuNzUgKiBNYXRoLlBJICYmIHBvc2l0aXZlUm90YXRpb24gPD0gMiAqIE1hdGguUEkpXG4gICAgICAgICkge1xuICAgICAgICAgIHgwID0geDAgLSB3aWR0aCAvIDI7XG4gICAgICAgICAgeTAgPSB5MCAtIChoZWlnaHQgLyAyKSAqIE1hdGgudGFuKHJvdGF0aW9uKTtcbiAgICAgICAgICB4MSA9IHgxICsgd2lkdGggLyAyO1xuICAgICAgICAgIHkxID0geTEgKyAoaGVpZ2h0IC8gMikgKiBNYXRoLnRhbihyb3RhdGlvbik7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpdmVSb3RhdGlvbiA+IDAuMjUgKiBNYXRoLlBJICYmIHBvc2l0aXZlUm90YXRpb24gPD0gMC43NSAqIE1hdGguUEkpIHtcbiAgICAgICAgICB5MCA9IHkwIC0gaGVpZ2h0IC8gMjtcbiAgICAgICAgICB4MCA9IHgwIC0gd2lkdGggLyAyIC8gTWF0aC50YW4ocm90YXRpb24pO1xuICAgICAgICAgIHkxID0geTEgKyBoZWlnaHQgLyAyO1xuICAgICAgICAgIHgxID0geDEgKyB3aWR0aCAvIDIgLyBNYXRoLnRhbihyb3RhdGlvbik7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpdmVSb3RhdGlvbiA+IDAuNzUgKiBNYXRoLlBJICYmIHBvc2l0aXZlUm90YXRpb24gPD0gMS4yNSAqIE1hdGguUEkpIHtcbiAgICAgICAgICB4MCA9IHgwICsgd2lkdGggLyAyO1xuICAgICAgICAgIHkwID0geTAgKyAoaGVpZ2h0IC8gMikgKiBNYXRoLnRhbihyb3RhdGlvbik7XG4gICAgICAgICAgeDEgPSB4MSAtIHdpZHRoIC8gMjtcbiAgICAgICAgICB5MSA9IHkxIC0gKGhlaWdodCAvIDIpICogTWF0aC50YW4ocm90YXRpb24pO1xuICAgICAgICB9IGVsc2UgaWYgKHBvc2l0aXZlUm90YXRpb24gPiAxLjI1ICogTWF0aC5QSSAmJiBwb3NpdGl2ZVJvdGF0aW9uIDw9IDEuNzUgKiBNYXRoLlBJKSB7XG4gICAgICAgICAgeTAgPSB5MCArIGhlaWdodCAvIDI7XG4gICAgICAgICAgeDAgPSB4MCArIHdpZHRoIC8gMiAvIE1hdGgudGFuKHJvdGF0aW9uKTtcbiAgICAgICAgICB5MSA9IHkxIC0gaGVpZ2h0IC8gMjtcbiAgICAgICAgICB4MSA9IHgxIC0gd2lkdGggLyAyIC8gTWF0aC50YW4ocm90YXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgZ3JhZGllbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImxpbmVhckdyYWRpZW50XCIpO1xuICAgICAgICBncmFkaWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBuYW1lKTtcbiAgICAgICAgZ3JhZGllbnQuc2V0QXR0cmlidXRlKFwiZ3JhZGllbnRVbml0c1wiLCBcInVzZXJTcGFjZU9uVXNlXCIpO1xuICAgICAgICBncmFkaWVudC5zZXRBdHRyaWJ1dGUoXCJ4MVwiLCBTdHJpbmcoTWF0aC5yb3VuZCh4MCkpKTtcbiAgICAgICAgZ3JhZGllbnQuc2V0QXR0cmlidXRlKFwieTFcIiwgU3RyaW5nKE1hdGgucm91bmQoeTApKSk7XG4gICAgICAgIGdyYWRpZW50LnNldEF0dHJpYnV0ZShcIngyXCIsIFN0cmluZyhNYXRoLnJvdW5kKHgxKSkpO1xuICAgICAgICBncmFkaWVudC5zZXRBdHRyaWJ1dGUoXCJ5MlwiLCBTdHJpbmcoTWF0aC5yb3VuZCh5MSkpKTtcbiAgICAgIH1cblxuICAgICAgb3B0aW9ucy5jb2xvclN0b3BzLmZvckVhY2goKHsgb2Zmc2V0LCBjb2xvciB9OiB7IG9mZnNldDogbnVtYmVyOyBjb2xvcjogc3RyaW5nIH0pID0+IHtcbiAgICAgICAgY29uc3Qgc3RvcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwic3RvcFwiKTtcbiAgICAgICAgc3RvcC5zZXRBdHRyaWJ1dGUoXCJvZmZzZXRcIiwgYCR7MTAwICogb2Zmc2V0fSVgKTtcbiAgICAgICAgc3RvcC5zZXRBdHRyaWJ1dGUoXCJzdG9wLWNvbG9yXCIsIGNvbG9yKTtcbiAgICAgICAgZ3JhZGllbnQuYXBwZW5kQ2hpbGQoc3RvcCk7XG4gICAgICB9KTtcblxuICAgICAgcmVjdC5zZXRBdHRyaWJ1dGUoXCJmaWxsXCIsIGB1cmwoJyMke25hbWV9JylgKTtcbiAgICAgIHRoaXMuX2RlZnMuYXBwZW5kQ2hpbGQoZ3JhZGllbnQpO1xuICAgIH0gZWxzZSBpZiAoY29sb3IpIHtcbiAgICAgIHJlY3Quc2V0QXR0cmlidXRlKFwiZmlsbFwiLCBjb2xvcik7XG4gICAgfVxuXG4gICAgdGhpcy5fZWxlbWVudC5hcHBlbmRDaGlsZChyZWN0KTtcbiAgfVxufVxuIiwiaW1wb3J0IGNvcm5lckRvdFR5cGVzIGZyb20gXCIuLi8uLi8uLi9jb25zdGFudHMvY29ybmVyRG90VHlwZXNcIjtcbmltcG9ydCB7IENvcm5lckRvdFR5cGUsIFJvdGF0ZUZpZ3VyZUFyZ3NDYW52YXMsIEJhc2ljRmlndXJlRHJhd0FyZ3NDYW52YXMsIERyYXdBcmdzQ2FudmFzIH0gZnJvbSBcIi4uLy4uLy4uL3R5cGVzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFFSQ29ybmVyRG90IHtcbiAgX2NvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgX3R5cGU6IENvcm5lckRvdFR5cGU7XG5cbiAgY29uc3RydWN0b3IoeyBjb250ZXh0LCB0eXBlIH06IHsgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEOyB0eXBlOiBDb3JuZXJEb3RUeXBlIH0pIHtcbiAgICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcbiAgICB0aGlzLl90eXBlID0gdHlwZTtcbiAgfVxuXG4gIGRyYXcoeDogbnVtYmVyLCB5OiBudW1iZXIsIHNpemU6IG51bWJlciwgcm90YXRpb246IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLl9jb250ZXh0O1xuICAgIGNvbnN0IHR5cGUgPSB0aGlzLl90eXBlO1xuICAgIGxldCBkcmF3RnVuY3Rpb247XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgY29ybmVyRG90VHlwZXMuc3F1YXJlOlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3U3F1YXJlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgY29ybmVyRG90VHlwZXMuZG90OlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd0RvdDtcbiAgICB9XG5cbiAgICBkcmF3RnVuY3Rpb24uY2FsbCh0aGlzLCB7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uIH0pO1xuICB9XG5cbiAgX3JvdGF0ZUZpZ3VyZSh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uID0gMCwgZHJhdyB9OiBSb3RhdGVGaWd1cmVBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgY29uc3QgY3ggPSB4ICsgc2l6ZSAvIDI7XG4gICAgY29uc3QgY3kgPSB5ICsgc2l6ZSAvIDI7XG5cbiAgICBjb250ZXh0LnRyYW5zbGF0ZShjeCwgY3kpO1xuICAgIHJvdGF0aW9uICYmIGNvbnRleHQucm90YXRlKHJvdGF0aW9uKTtcbiAgICBkcmF3KCk7XG4gICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICByb3RhdGlvbiAmJiBjb250ZXh0LnJvdGF0ZSgtcm90YXRpb24pO1xuICAgIGNvbnRleHQudHJhbnNsYXRlKC1jeCwgLWN5KTtcbiAgfVxuXG4gIF9iYXNpY0RvdChhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCBjb250ZXh0IH0gPSBhcmdzO1xuXG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIGNvbnRleHQuYXJjKDAsIDAsIHNpemUgLyAyLCAwLCBNYXRoLlBJICogMik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfYmFzaWNTcXVhcmUoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJnc0NhbnZhcyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgY29udGV4dCB9ID0gYXJncztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICBjb250ZXh0LnJlY3QoLXNpemUgLyAyLCAtc2l6ZSAvIDIsIHNpemUsIHNpemUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2RyYXdEb3QoeyB4LCB5LCBzaXplLCBjb250ZXh0LCByb3RhdGlvbiB9OiBEcmF3QXJnc0NhbnZhcyk6IHZvaWQge1xuICAgIHRoaXMuX2Jhc2ljRG90KHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb24gfSk7XG4gIH1cblxuICBfZHJhd1NxdWFyZSh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uIH06IERyYXdBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgdGhpcy5fYmFzaWNTcXVhcmUoeyB4LCB5LCBzaXplLCBjb250ZXh0LCByb3RhdGlvbiB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IGNvcm5lckRvdFR5cGVzIGZyb20gXCIuLi8uLi8uLi9jb25zdGFudHMvY29ybmVyRG90VHlwZXNcIjtcbmltcG9ydCB7IENvcm5lckRvdFR5cGUsIFJvdGF0ZUZpZ3VyZUFyZ3MsIEJhc2ljRmlndXJlRHJhd0FyZ3MsIERyYXdBcmdzIH0gZnJvbSBcIi4uLy4uLy4uL3R5cGVzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFFSQ29ybmVyRG90IHtcbiAgX2VsZW1lbnQ/OiBTVkdFbGVtZW50O1xuICBfc3ZnOiBTVkdFbGVtZW50O1xuICBfdHlwZTogQ29ybmVyRG90VHlwZTtcblxuICBjb25zdHJ1Y3Rvcih7IHN2ZywgdHlwZSB9OiB7IHN2ZzogU1ZHRWxlbWVudDsgdHlwZTogQ29ybmVyRG90VHlwZSB9KSB7XG4gICAgdGhpcy5fc3ZnID0gc3ZnO1xuICAgIHRoaXMuX3R5cGUgPSB0eXBlO1xuICB9XG5cbiAgZHJhdyh4OiBudW1iZXIsIHk6IG51bWJlciwgc2l6ZTogbnVtYmVyLCByb3RhdGlvbjogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgdHlwZSA9IHRoaXMuX3R5cGU7XG4gICAgbGV0IGRyYXdGdW5jdGlvbjtcblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSBjb3JuZXJEb3RUeXBlcy5zcXVhcmU6XG4gICAgICAgIGRyYXdGdW5jdGlvbiA9IHRoaXMuX2RyYXdTcXVhcmU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBjb3JuZXJEb3RUeXBlcy5kb3Q6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3RG90O1xuICAgIH1cblxuICAgIGRyYXdGdW5jdGlvbi5jYWxsKHRoaXMsIHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfSk7XG4gIH1cblxuICBfcm90YXRlRmlndXJlKHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gPSAwLCBkcmF3IH06IFJvdGF0ZUZpZ3VyZUFyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCBjeCA9IHggKyBzaXplIC8gMjtcbiAgICBjb25zdCBjeSA9IHkgKyBzaXplIC8gMjtcblxuICAgIGRyYXcoKTtcbiAgICB0aGlzLl9lbGVtZW50Py5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIiwgYHJvdGF0ZSgkeygxODAgKiByb3RhdGlvbikgLyBNYXRoLlBJfSwke2N4fSwke2N5fSlgKTtcbiAgfVxuXG4gIF9iYXNpY0RvdChhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCB4LCB5IH0gPSBhcmdzO1xuXG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImNpcmNsZVwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJjeFwiLCBTdHJpbmcoeCArIHNpemUgLyAyKSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwiY3lcIiwgU3RyaW5nKHkgKyBzaXplIC8gMikpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcInJcIiwgU3RyaW5nKHNpemUgLyAyKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfYmFzaWNTcXVhcmUoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgeCwgeSB9ID0gYXJncztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJyZWN0XCIpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcInhcIiwgU3RyaW5nKHgpKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ5XCIsIFN0cmluZyh5KSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgU3RyaW5nKHNpemUpKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIiwgU3RyaW5nKHNpemUpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9kcmF3RG90KHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfTogRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICB0aGlzLl9iYXNpY0RvdCh7IHgsIHksIHNpemUsIHJvdGF0aW9uIH0pO1xuICB9XG5cbiAgX2RyYXdTcXVhcmUoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9OiBEcmF3QXJncyk6IHZvaWQge1xuICAgIHRoaXMuX2Jhc2ljU3F1YXJlKHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfSk7XG4gIH1cbn1cbiIsImltcG9ydCBjb3JuZXJTcXVhcmVUeXBlcyBmcm9tIFwiLi4vLi4vLi4vY29uc3RhbnRzL2Nvcm5lclNxdWFyZVR5cGVzXCI7XG5pbXBvcnQgeyBDb3JuZXJTcXVhcmVUeXBlLCBSb3RhdGVGaWd1cmVBcmdzQ2FudmFzLCBCYXNpY0ZpZ3VyZURyYXdBcmdzQ2FudmFzLCBEcmF3QXJnc0NhbnZhcyB9IGZyb20gXCIuLi8uLi8uLi90eXBlc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBRUkNvcm5lclNxdWFyZSB7XG4gIF9jb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gIF90eXBlOiBDb3JuZXJTcXVhcmVUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKHsgY29udGV4dCwgdHlwZSB9OiB7IGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDsgdHlwZTogQ29ybmVyU3F1YXJlVHlwZSB9KSB7XG4gICAgdGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG4gICAgdGhpcy5fdHlwZSA9IHR5cGU7XG4gIH1cblxuICBkcmF3KHg6IG51bWJlciwgeTogbnVtYmVyLCBzaXplOiBudW1iZXIsIHJvdGF0aW9uOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5fY29udGV4dDtcbiAgICBjb25zdCB0eXBlID0gdGhpcy5fdHlwZTtcbiAgICBsZXQgZHJhd0Z1bmN0aW9uO1xuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIGNvcm5lclNxdWFyZVR5cGVzLnNxdWFyZTpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd1NxdWFyZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGNvcm5lclNxdWFyZVR5cGVzLmV4dHJhUm91bmRlZDpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd0V4dHJhUm91bmRlZDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGNvcm5lclNxdWFyZVR5cGVzLmRvdDpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGRyYXdGdW5jdGlvbiA9IHRoaXMuX2RyYXdEb3Q7XG4gICAgfVxuXG4gICAgZHJhd0Z1bmN0aW9uLmNhbGwodGhpcywgeyB4LCB5LCBzaXplLCBjb250ZXh0LCByb3RhdGlvbiB9KTtcbiAgfVxuXG4gIF9yb3RhdGVGaWd1cmUoeyB4LCB5LCBzaXplLCBjb250ZXh0LCByb3RhdGlvbiA9IDAsIGRyYXcgfTogUm90YXRlRmlndXJlQXJnc0NhbnZhcyk6IHZvaWQge1xuICAgIGNvbnN0IGN4ID0geCArIHNpemUgLyAyO1xuICAgIGNvbnN0IGN5ID0geSArIHNpemUgLyAyO1xuXG4gICAgY29udGV4dC50cmFuc2xhdGUoY3gsIGN5KTtcbiAgICByb3RhdGlvbiAmJiBjb250ZXh0LnJvdGF0ZShyb3RhdGlvbik7XG4gICAgZHJhdygpO1xuICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgcm90YXRpb24gJiYgY29udGV4dC5yb3RhdGUoLXJvdGF0aW9uKTtcbiAgICBjb250ZXh0LnRyYW5zbGF0ZSgtY3gsIC1jeSk7XG4gIH1cblxuICBfYmFzaWNEb3QoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJnc0NhbnZhcyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgY29udGV4dCB9ID0gYXJncztcbiAgICBjb25zdCBkb3RTaXplID0gc2l6ZSAvIDc7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgY29udGV4dC5hcmMoMCwgMCwgc2l6ZSAvIDIsIDAsIE1hdGguUEkgKiAyKTtcbiAgICAgICAgY29udGV4dC5hcmMoMCwgMCwgc2l6ZSAvIDIgLSBkb3RTaXplLCAwLCBNYXRoLlBJICogMik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfYmFzaWNTcXVhcmUoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJnc0NhbnZhcyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgY29udGV4dCB9ID0gYXJncztcbiAgICBjb25zdCBkb3RTaXplID0gc2l6ZSAvIDc7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgY29udGV4dC5yZWN0KC1zaXplIC8gMiwgLXNpemUgLyAyLCBzaXplLCBzaXplKTtcbiAgICAgICAgY29udGV4dC5yZWN0KC1zaXplIC8gMiArIGRvdFNpemUsIC1zaXplIC8gMiArIGRvdFNpemUsIHNpemUgLSAyICogZG90U2l6ZSwgc2l6ZSAtIDIgKiBkb3RTaXplKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9iYXNpY0V4dHJhUm91bmRlZChhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCBjb250ZXh0IH0gPSBhcmdzO1xuICAgIGNvbnN0IGRvdFNpemUgPSBzaXplIC8gNztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICBjb250ZXh0LmFyYygtZG90U2l6ZSwgLWRvdFNpemUsIDIuNSAqIGRvdFNpemUsIE1hdGguUEksIC1NYXRoLlBJIC8gMik7XG4gICAgICAgIGNvbnRleHQubGluZVRvKGRvdFNpemUsIC0zLjUgKiBkb3RTaXplKTtcbiAgICAgICAgY29udGV4dC5hcmMoZG90U2l6ZSwgLWRvdFNpemUsIDIuNSAqIGRvdFNpemUsIC1NYXRoLlBJIC8gMiwgMCk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKDMuNSAqIGRvdFNpemUsIC1kb3RTaXplKTtcbiAgICAgICAgY29udGV4dC5hcmMoZG90U2l6ZSwgZG90U2l6ZSwgMi41ICogZG90U2l6ZSwgMCwgTWF0aC5QSSAvIDIpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbygtZG90U2l6ZSwgMy41ICogZG90U2l6ZSk7XG4gICAgICAgIGNvbnRleHQuYXJjKC1kb3RTaXplLCBkb3RTaXplLCAyLjUgKiBkb3RTaXplLCBNYXRoLlBJIC8gMiwgTWF0aC5QSSk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKC0zLjUgKiBkb3RTaXplLCAtZG90U2l6ZSk7XG5cbiAgICAgICAgY29udGV4dC5hcmMoLWRvdFNpemUsIC1kb3RTaXplLCAxLjUgKiBkb3RTaXplLCBNYXRoLlBJLCAtTWF0aC5QSSAvIDIpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyhkb3RTaXplLCAtMi41ICogZG90U2l6ZSk7XG4gICAgICAgIGNvbnRleHQuYXJjKGRvdFNpemUsIC1kb3RTaXplLCAxLjUgKiBkb3RTaXplLCAtTWF0aC5QSSAvIDIsIDApO1xuICAgICAgICBjb250ZXh0LmxpbmVUbygyLjUgKiBkb3RTaXplLCAtZG90U2l6ZSk7XG4gICAgICAgIGNvbnRleHQuYXJjKGRvdFNpemUsIGRvdFNpemUsIDEuNSAqIGRvdFNpemUsIDAsIE1hdGguUEkgLyAyKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oLWRvdFNpemUsIDIuNSAqIGRvdFNpemUpO1xuICAgICAgICBjb250ZXh0LmFyYygtZG90U2l6ZSwgZG90U2l6ZSwgMS41ICogZG90U2l6ZSwgTWF0aC5QSSAvIDIsIE1hdGguUEkpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbygtMi41ICogZG90U2l6ZSwgLWRvdFNpemUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2RyYXdEb3QoeyB4LCB5LCBzaXplLCBjb250ZXh0LCByb3RhdGlvbiB9OiBEcmF3QXJnc0NhbnZhcyk6IHZvaWQge1xuICAgIHRoaXMuX2Jhc2ljRG90KHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb24gfSk7XG4gIH1cblxuICBfZHJhd1NxdWFyZSh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uIH06IERyYXdBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgdGhpcy5fYmFzaWNTcXVhcmUoeyB4LCB5LCBzaXplLCBjb250ZXh0LCByb3RhdGlvbiB9KTtcbiAgfVxuXG4gIF9kcmF3RXh0cmFSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb24gfTogRHJhd0FyZ3NDYW52YXMpOiB2b2lkIHtcbiAgICB0aGlzLl9iYXNpY0V4dHJhUm91bmRlZCh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgY29ybmVyU3F1YXJlVHlwZXMgZnJvbSBcIi4uLy4uLy4uL2NvbnN0YW50cy9jb3JuZXJTcXVhcmVUeXBlc1wiO1xuaW1wb3J0IHsgQ29ybmVyU3F1YXJlVHlwZSwgRHJhd0FyZ3MsIEJhc2ljRmlndXJlRHJhd0FyZ3MsIFJvdGF0ZUZpZ3VyZUFyZ3MgfSBmcm9tIFwiLi4vLi4vLi4vdHlwZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUVJDb3JuZXJTcXVhcmUge1xuICBfZWxlbWVudD86IFNWR0VsZW1lbnQ7XG4gIF9zdmc6IFNWR0VsZW1lbnQ7XG4gIF90eXBlOiBDb3JuZXJTcXVhcmVUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKHsgc3ZnLCB0eXBlIH06IHsgc3ZnOiBTVkdFbGVtZW50OyB0eXBlOiBDb3JuZXJTcXVhcmVUeXBlIH0pIHtcbiAgICB0aGlzLl9zdmcgPSBzdmc7XG4gICAgdGhpcy5fdHlwZSA9IHR5cGU7XG4gIH1cblxuICBkcmF3KHg6IG51bWJlciwgeTogbnVtYmVyLCBzaXplOiBudW1iZXIsIHJvdGF0aW9uOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCB0eXBlID0gdGhpcy5fdHlwZTtcbiAgICBsZXQgZHJhd0Z1bmN0aW9uO1xuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIGNvcm5lclNxdWFyZVR5cGVzLnNxdWFyZTpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd1NxdWFyZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGNvcm5lclNxdWFyZVR5cGVzLmV4dHJhUm91bmRlZDpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd0V4dHJhUm91bmRlZDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGNvcm5lclNxdWFyZVR5cGVzLmRvdDpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGRyYXdGdW5jdGlvbiA9IHRoaXMuX2RyYXdEb3Q7XG4gICAgfVxuXG4gICAgZHJhd0Z1bmN0aW9uLmNhbGwodGhpcywgeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9KTtcbiAgfVxuXG4gIF9yb3RhdGVGaWd1cmUoeyB4LCB5LCBzaXplLCByb3RhdGlvbiA9IDAsIGRyYXcgfTogUm90YXRlRmlndXJlQXJncyk6IHZvaWQge1xuICAgIGNvbnN0IGN4ID0geCArIHNpemUgLyAyO1xuICAgIGNvbnN0IGN5ID0geSArIHNpemUgLyAyO1xuXG4gICAgZHJhdygpO1xuICAgIHRoaXMuX2VsZW1lbnQ/LnNldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiLCBgcm90YXRlKCR7KDE4MCAqIHJvdGF0aW9uKSAvIE1hdGguUEl9LCR7Y3h9LCR7Y3l9KWApO1xuICB9XG5cbiAgX2Jhc2ljRG90KGFyZ3M6IEJhc2ljRmlndXJlRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpemUsIHgsIHkgfSA9IGFyZ3M7XG4gICAgY29uc3QgZG90U2l6ZSA9IHNpemUgLyA3O1xuXG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInBhdGhcIik7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwiY2xpcC1ydWxlXCIsIFwiZXZlbm9kZFwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgXCJkXCIsXG4gICAgICAgICAgYE0gJHt4ICsgc2l6ZSAvIDJ9ICR7eX1gICsgLy8gTSBjeCwgeSAvLyAgTW92ZSB0byB0b3Agb2YgcmluZ1xuICAgICAgICAgICAgYGEgJHtzaXplIC8gMn0gJHtzaXplIC8gMn0gMCAxIDAgMC4xIDBgICsgLy8gYSBvdXRlclJhZGl1cywgb3V0ZXJSYWRpdXMsIDAsIDEsIDAsIDEsIDAgLy8gRHJhdyBvdXRlciBhcmMsIGJ1dCBkb24ndCBjbG9zZSBpdFxuICAgICAgICAgICAgYHpgICsgLy8gWiAvLyBDbG9zZSB0aGUgb3V0ZXIgc2hhcGVcbiAgICAgICAgICAgIGBtIDAgJHtkb3RTaXplfWAgKyAvLyBtIC0xIG91dGVyUmFkaXVzLWlubmVyUmFkaXVzIC8vIE1vdmUgdG8gdG9wIHBvaW50IG9mIGlubmVyIHJhZGl1c1xuICAgICAgICAgICAgYGEgJHtzaXplIC8gMiAtIGRvdFNpemV9ICR7c2l6ZSAvIDIgLSBkb3RTaXplfSAwIDEgMSAtMC4xIDBgICsgLy8gYSBpbm5lclJhZGl1cywgaW5uZXJSYWRpdXMsIDAsIDEsIDEsIC0xLCAwIC8vIERyYXcgaW5uZXIgYXJjLCBidXQgZG9uJ3QgY2xvc2UgaXRcbiAgICAgICAgICAgIGBaYCAvLyBaIC8vIENsb3NlIHRoZSBpbm5lciByaW5nLiBBY3R1YWxseSB3aWxsIHN0aWxsIHdvcmsgd2l0aG91dCwgYnV0IGlubmVyIHJpbmcgd2lsbCBoYXZlIG9uZSB1bml0IG1pc3NpbmcgaW4gc3Ryb2tlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfYmFzaWNTcXVhcmUoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgeCwgeSB9ID0gYXJncztcbiAgICBjb25zdCBkb3RTaXplID0gc2l6ZSAvIDc7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwicGF0aFwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJjbGlwLXJ1bGVcIiwgXCJldmVub2RkXCIpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcbiAgICAgICAgICBcImRcIixcbiAgICAgICAgICBgTSAke3h9ICR7eX1gICtcbiAgICAgICAgICAgIGB2ICR7c2l6ZX1gICtcbiAgICAgICAgICAgIGBoICR7c2l6ZX1gICtcbiAgICAgICAgICAgIGB2ICR7LXNpemV9YCArXG4gICAgICAgICAgICBgemAgK1xuICAgICAgICAgICAgYE0gJHt4ICsgZG90U2l6ZX0gJHt5ICsgZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGBoICR7c2l6ZSAtIDIgKiBkb3RTaXplfWAgK1xuICAgICAgICAgICAgYHYgJHtzaXplIC0gMiAqIGRvdFNpemV9YCArXG4gICAgICAgICAgICBgaCAkey1zaXplICsgMiAqIGRvdFNpemV9YCArXG4gICAgICAgICAgICBgemBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9iYXNpY0V4dHJhUm91bmRlZChhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCB4LCB5IH0gPSBhcmdzO1xuICAgIGNvbnN0IGRvdFNpemUgPSBzaXplIC8gNztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJwYXRoXCIpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcImNsaXAtcnVsZVwiLCBcImV2ZW5vZGRcIik7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFxuICAgICAgICAgIFwiZFwiLFxuICAgICAgICAgIGBNICR7eH0gJHt5ICsgMi41ICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGB2ICR7MiAqIGRvdFNpemV9YCArXG4gICAgICAgICAgICBgYSAkezIuNSAqIGRvdFNpemV9ICR7Mi41ICogZG90U2l6ZX0sIDAsIDAsIDAsICR7ZG90U2l6ZSAqIDIuNX0gJHtkb3RTaXplICogMi41fWAgK1xuICAgICAgICAgICAgYGggJHsyICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGBhICR7Mi41ICogZG90U2l6ZX0gJHsyLjUgKiBkb3RTaXplfSwgMCwgMCwgMCwgJHtkb3RTaXplICogMi41fSAkey1kb3RTaXplICogMi41fWAgK1xuICAgICAgICAgICAgYHYgJHstMiAqIGRvdFNpemV9YCArXG4gICAgICAgICAgICBgYSAkezIuNSAqIGRvdFNpemV9ICR7Mi41ICogZG90U2l6ZX0sIDAsIDAsIDAsICR7LWRvdFNpemUgKiAyLjV9ICR7LWRvdFNpemUgKiAyLjV9YCArXG4gICAgICAgICAgICBgaCAkey0yICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGBhICR7Mi41ICogZG90U2l6ZX0gJHsyLjUgKiBkb3RTaXplfSwgMCwgMCwgMCwgJHstZG90U2l6ZSAqIDIuNX0gJHtkb3RTaXplICogMi41fWAgK1xuICAgICAgICAgICAgYE0gJHt4ICsgMi41ICogZG90U2l6ZX0gJHt5ICsgZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGBoICR7MiAqIGRvdFNpemV9YCArXG4gICAgICAgICAgICBgYSAkezEuNSAqIGRvdFNpemV9ICR7MS41ICogZG90U2l6ZX0sIDAsIDAsIDEsICR7ZG90U2l6ZSAqIDEuNX0gJHtkb3RTaXplICogMS41fWAgK1xuICAgICAgICAgICAgYHYgJHsyICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGBhICR7MS41ICogZG90U2l6ZX0gJHsxLjUgKiBkb3RTaXplfSwgMCwgMCwgMSwgJHstZG90U2l6ZSAqIDEuNX0gJHtkb3RTaXplICogMS41fWAgK1xuICAgICAgICAgICAgYGggJHstMiAqIGRvdFNpemV9YCArXG4gICAgICAgICAgICBgYSAkezEuNSAqIGRvdFNpemV9ICR7MS41ICogZG90U2l6ZX0sIDAsIDAsIDEsICR7LWRvdFNpemUgKiAxLjV9ICR7LWRvdFNpemUgKiAxLjV9YCArXG4gICAgICAgICAgICBgdiAkey0yICogZG90U2l6ZX1gICtcbiAgICAgICAgICAgIGBhICR7MS41ICogZG90U2l6ZX0gJHsxLjUgKiBkb3RTaXplfSwgMCwgMCwgMSwgJHtkb3RTaXplICogMS41fSAkey1kb3RTaXplICogMS41fWBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9kcmF3RG90KHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfTogRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICB0aGlzLl9iYXNpY0RvdCh7IHgsIHksIHNpemUsIHJvdGF0aW9uIH0pO1xuICB9XG5cbiAgX2RyYXdTcXVhcmUoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9OiBEcmF3QXJncyk6IHZvaWQge1xuICAgIHRoaXMuX2Jhc2ljU3F1YXJlKHsgeCwgeSwgc2l6ZSwgcm90YXRpb24gfSk7XG4gIH1cblxuICBfZHJhd0V4dHJhUm91bmRlZCh7IHgsIHksIHNpemUsIHJvdGF0aW9uIH06IERyYXdBcmdzKTogdm9pZCB7XG4gICAgdGhpcy5fYmFzaWNFeHRyYVJvdW5kZWQoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IGRvdFR5cGVzIGZyb20gXCIuLi8uLi8uLi9jb25zdGFudHMvZG90VHlwZXNcIjtcbmltcG9ydCB7XG4gIERvdFR5cGUsXG4gIEdldE5laWdoYm9yLFxuICBSb3RhdGVGaWd1cmVBcmdzQ2FudmFzLFxuICBCYXNpY0ZpZ3VyZURyYXdBcmdzQ2FudmFzLFxuICBEcmF3QXJnc0NhbnZhc1xufSBmcm9tIFwiLi4vLi4vLi4vdHlwZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUVJEb3Qge1xuICBfY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICBfdHlwZTogRG90VHlwZTtcblxuICBjb25zdHJ1Y3Rvcih7IGNvbnRleHQsIHR5cGUgfTogeyBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7IHR5cGU6IERvdFR5cGUgfSkge1xuICAgIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xuICAgIHRoaXMuX3R5cGUgPSB0eXBlO1xuICB9XG5cbiAgZHJhdyh4OiBudW1iZXIsIHk6IG51bWJlciwgc2l6ZTogbnVtYmVyLCBnZXROZWlnaGJvcjogR2V0TmVpZ2hib3IpOiB2b2lkIHtcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5fY29udGV4dDtcbiAgICBjb25zdCB0eXBlID0gdGhpcy5fdHlwZTtcbiAgICBsZXQgZHJhd0Z1bmN0aW9uO1xuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIGRvdFR5cGVzLmRvdHM6XG4gICAgICAgIGRyYXdGdW5jdGlvbiA9IHRoaXMuX2RyYXdEb3Q7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBkb3RUeXBlcy5jbGFzc3k6XG4gICAgICAgIGRyYXdGdW5jdGlvbiA9IHRoaXMuX2RyYXdDbGFzc3k7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBkb3RUeXBlcy5jbGFzc3lSb3VuZGVkOlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3Q2xhc3N5Um91bmRlZDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRvdFR5cGVzLnJvdW5kZWQ6XG4gICAgICAgIGRyYXdGdW5jdGlvbiA9IHRoaXMuX2RyYXdSb3VuZGVkO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgZG90VHlwZXMuZXh0cmFSb3VuZGVkOlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3RXh0cmFSb3VuZGVkO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgZG90VHlwZXMuc3F1YXJlOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd1NxdWFyZTtcbiAgICB9XG5cbiAgICBkcmF3RnVuY3Rpb24uY2FsbCh0aGlzLCB7IHgsIHksIHNpemUsIGNvbnRleHQsIGdldE5laWdoYm9yIH0pO1xuICB9XG5cbiAgX3JvdGF0ZUZpZ3VyZSh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uID0gMCwgZHJhdyB9OiBSb3RhdGVGaWd1cmVBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgY29uc3QgY3ggPSB4ICsgc2l6ZSAvIDI7XG4gICAgY29uc3QgY3kgPSB5ICsgc2l6ZSAvIDI7XG5cbiAgICBjb250ZXh0LnRyYW5zbGF0ZShjeCwgY3kpO1xuICAgIHJvdGF0aW9uICYmIGNvbnRleHQucm90YXRlKHJvdGF0aW9uKTtcbiAgICBkcmF3KCk7XG4gICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICByb3RhdGlvbiAmJiBjb250ZXh0LnJvdGF0ZSgtcm90YXRpb24pO1xuICAgIGNvbnRleHQudHJhbnNsYXRlKC1jeCwgLWN5KTtcbiAgfVxuXG4gIF9iYXNpY0RvdChhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCBjb250ZXh0IH0gPSBhcmdzO1xuXG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIGNvbnRleHQuYXJjKDAsIDAsIHNpemUgLyAyLCAwLCBNYXRoLlBJICogMik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfYmFzaWNTcXVhcmUoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJnc0NhbnZhcyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgY29udGV4dCB9ID0gYXJncztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICBjb250ZXh0LnJlY3QoLXNpemUgLyAyLCAtc2l6ZSAvIDIsIHNpemUsIHNpemUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy9pZiByb3RhdGlvbiA9PT0gMCAtIHJpZ2h0IHNpZGUgaXMgcm91bmRlZFxuICBfYmFzaWNTaWRlUm91bmRlZChhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCBjb250ZXh0IH0gPSBhcmdzO1xuXG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIGNvbnRleHQuYXJjKDAsIDAsIHNpemUgLyAyLCAtTWF0aC5QSSAvIDIsIE1hdGguUEkgLyAyKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oLXNpemUgLyAyLCBzaXplIC8gMik7XG4gICAgICAgIGNvbnRleHQubGluZVRvKC1zaXplIC8gMiwgLXNpemUgLyAyKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oMCwgLXNpemUgLyAyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vaWYgcm90YXRpb24gPT09IDAgLSB0b3AgcmlnaHQgY29ybmVyIGlzIHJvdW5kZWRcbiAgX2Jhc2ljQ29ybmVyUm91bmRlZChhcmdzOiBCYXNpY0ZpZ3VyZURyYXdBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgY29uc3QgeyBzaXplLCBjb250ZXh0IH0gPSBhcmdzO1xuXG4gICAgdGhpcy5fcm90YXRlRmlndXJlKHtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICBkcmF3OiAoKSA9PiB7XG4gICAgICAgIGNvbnRleHQuYXJjKDAsIDAsIHNpemUgLyAyLCAtTWF0aC5QSSAvIDIsIDApO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyhzaXplIC8gMiwgc2l6ZSAvIDIpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbygtc2l6ZSAvIDIsIHNpemUgLyAyKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oLXNpemUgLyAyLCAtc2l6ZSAvIDIpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbygwLCAtc2l6ZSAvIDIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy9pZiByb3RhdGlvbiA9PT0gMCAtIHRvcCByaWdodCBjb3JuZXIgaXMgcm91bmRlZFxuICBfYmFzaWNDb3JuZXJFeHRyYVJvdW5kZWQoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJnc0NhbnZhcyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgY29udGV4dCB9ID0gYXJncztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICBjb250ZXh0LmFyYygtc2l6ZSAvIDIsIHNpemUgLyAyLCBzaXplLCAtTWF0aC5QSSAvIDIsIDApO1xuICAgICAgICBjb250ZXh0LmxpbmVUbygtc2l6ZSAvIDIsIHNpemUgLyAyKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oLXNpemUgLyAyLCAtc2l6ZSAvIDIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2Jhc2ljQ29ybmVyc1JvdW5kZWQoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJnc0NhbnZhcyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgY29udGV4dCB9ID0gYXJncztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICBjb250ZXh0LmFyYygwLCAwLCBzaXplIC8gMiwgLU1hdGguUEkgLyAyLCAwKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oc2l6ZSAvIDIsIHNpemUgLyAyKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oMCwgc2l6ZSAvIDIpO1xuICAgICAgICBjb250ZXh0LmFyYygwLCAwLCBzaXplIC8gMiwgTWF0aC5QSSAvIDIsIE1hdGguUEkpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbygtc2l6ZSAvIDIsIC1zaXplIC8gMik7XG4gICAgICAgIGNvbnRleHQubGluZVRvKDAsIC1zaXplIC8gMik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfYmFzaWNDb3JuZXJzRXh0cmFSb3VuZGVkKGFyZ3M6IEJhc2ljRmlndXJlRHJhd0FyZ3NDYW52YXMpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpemUsIGNvbnRleHQgfSA9IGFyZ3M7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgY29udGV4dC5hcmMoLXNpemUgLyAyLCBzaXplIC8gMiwgc2l6ZSwgLU1hdGguUEkgLyAyLCAwKTtcbiAgICAgICAgY29udGV4dC5hcmMoc2l6ZSAvIDIsIC1zaXplIC8gMiwgc2l6ZSwgTWF0aC5QSSAvIDIsIE1hdGguUEkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2RyYXdEb3QoeyB4LCB5LCBzaXplLCBjb250ZXh0IH06IERyYXdBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgdGhpcy5fYmFzaWNEb3QoeyB4LCB5LCBzaXplLCBjb250ZXh0LCByb3RhdGlvbjogMCB9KTtcbiAgfVxuXG4gIF9kcmF3U3F1YXJlKHsgeCwgeSwgc2l6ZSwgY29udGV4dCB9OiBEcmF3QXJnc0NhbnZhcyk6IHZvaWQge1xuICAgIHRoaXMuX2Jhc2ljU3F1YXJlKHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb246IDAgfSk7XG4gIH1cblxuICBfZHJhd1JvdW5kZWQoeyB4LCB5LCBzaXplLCBjb250ZXh0LCBnZXROZWlnaGJvciB9OiBEcmF3QXJnc0NhbnZhcyk6IHZvaWQge1xuICAgIGNvbnN0IGxlZnROZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKC0xLCAwKSA6IDA7XG4gICAgY29uc3QgcmlnaHROZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDEsIDApIDogMDtcbiAgICBjb25zdCB0b3BOZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDAsIC0xKSA6IDA7XG4gICAgY29uc3QgYm90dG9tTmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigwLCAxKSA6IDA7XG5cbiAgICBjb25zdCBuZWlnaGJvcnNDb3VudCA9IGxlZnROZWlnaGJvciArIHJpZ2h0TmVpZ2hib3IgKyB0b3BOZWlnaGJvciArIGJvdHRvbU5laWdoYm9yO1xuXG4gICAgaWYgKG5laWdoYm9yc0NvdW50ID09PSAwKSB7XG4gICAgICB0aGlzLl9iYXNpY0RvdCh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uOiAwIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChuZWlnaGJvcnNDb3VudCA+IDIgfHwgKGxlZnROZWlnaGJvciAmJiByaWdodE5laWdoYm9yKSB8fCAodG9wTmVpZ2hib3IgJiYgYm90dG9tTmVpZ2hib3IpKSB7XG4gICAgICB0aGlzLl9iYXNpY1NxdWFyZSh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uOiAwIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChuZWlnaGJvcnNDb3VudCA9PT0gMikge1xuICAgICAgbGV0IHJvdGF0aW9uID0gMDtcblxuICAgICAgaWYgKGxlZnROZWlnaGJvciAmJiB0b3BOZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IE1hdGguUEkgLyAyO1xuICAgICAgfSBlbHNlIGlmICh0b3BOZWlnaGJvciAmJiByaWdodE5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gTWF0aC5QSTtcbiAgICAgIH0gZWxzZSBpZiAocmlnaHROZWlnaGJvciAmJiBib3R0b21OZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IC1NYXRoLlBJIC8gMjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fYmFzaWNDb3JuZXJSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb24gfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG5laWdoYm9yc0NvdW50ID09PSAxKSB7XG4gICAgICBsZXQgcm90YXRpb24gPSAwO1xuXG4gICAgICBpZiAodG9wTmVpZ2hib3IpIHtcbiAgICAgICAgcm90YXRpb24gPSBNYXRoLlBJIC8gMjtcbiAgICAgIH0gZWxzZSBpZiAocmlnaHROZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IE1hdGguUEk7XG4gICAgICB9IGVsc2UgaWYgKGJvdHRvbU5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gLU1hdGguUEkgLyAyO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9iYXNpY1NpZGVSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb24gfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgX2RyYXdFeHRyYVJvdW5kZWQoeyB4LCB5LCBzaXplLCBjb250ZXh0LCBnZXROZWlnaGJvciB9OiBEcmF3QXJnc0NhbnZhcyk6IHZvaWQge1xuICAgIGNvbnN0IGxlZnROZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKC0xLCAwKSA6IDA7XG4gICAgY29uc3QgcmlnaHROZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDEsIDApIDogMDtcbiAgICBjb25zdCB0b3BOZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDAsIC0xKSA6IDA7XG4gICAgY29uc3QgYm90dG9tTmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigwLCAxKSA6IDA7XG5cbiAgICBjb25zdCBuZWlnaGJvcnNDb3VudCA9IGxlZnROZWlnaGJvciArIHJpZ2h0TmVpZ2hib3IgKyB0b3BOZWlnaGJvciArIGJvdHRvbU5laWdoYm9yO1xuXG4gICAgaWYgKG5laWdoYm9yc0NvdW50ID09PSAwKSB7XG4gICAgICB0aGlzLl9iYXNpY0RvdCh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uOiAwIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChuZWlnaGJvcnNDb3VudCA+IDIgfHwgKGxlZnROZWlnaGJvciAmJiByaWdodE5laWdoYm9yKSB8fCAodG9wTmVpZ2hib3IgJiYgYm90dG9tTmVpZ2hib3IpKSB7XG4gICAgICB0aGlzLl9iYXNpY1NxdWFyZSh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uOiAwIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChuZWlnaGJvcnNDb3VudCA9PT0gMikge1xuICAgICAgbGV0IHJvdGF0aW9uID0gMDtcblxuICAgICAgaWYgKGxlZnROZWlnaGJvciAmJiB0b3BOZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IE1hdGguUEkgLyAyO1xuICAgICAgfSBlbHNlIGlmICh0b3BOZWlnaGJvciAmJiByaWdodE5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gTWF0aC5QSTtcbiAgICAgIH0gZWxzZSBpZiAocmlnaHROZWlnaGJvciAmJiBib3R0b21OZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IC1NYXRoLlBJIC8gMjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fYmFzaWNDb3JuZXJFeHRyYVJvdW5kZWQoeyB4LCB5LCBzaXplLCBjb250ZXh0LCByb3RhdGlvbiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobmVpZ2hib3JzQ291bnQgPT09IDEpIHtcbiAgICAgIGxldCByb3RhdGlvbiA9IDA7XG5cbiAgICAgIGlmICh0b3BOZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IE1hdGguUEkgLyAyO1xuICAgICAgfSBlbHNlIGlmIChyaWdodE5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gTWF0aC5QSTtcbiAgICAgIH0gZWxzZSBpZiAoYm90dG9tTmVpZ2hib3IpIHtcbiAgICAgICAgcm90YXRpb24gPSAtTWF0aC5QSSAvIDI7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2Jhc2ljU2lkZVJvdW5kZWQoeyB4LCB5LCBzaXplLCBjb250ZXh0LCByb3RhdGlvbiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBfZHJhd0NsYXNzeSh7IHgsIHksIHNpemUsIGNvbnRleHQsIGdldE5laWdoYm9yIH06IERyYXdBcmdzQ2FudmFzKTogdm9pZCB7XG4gICAgY29uc3QgbGVmdE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoLTEsIDApIDogMDtcbiAgICBjb25zdCByaWdodE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMSwgMCkgOiAwO1xuICAgIGNvbnN0IHRvcE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMCwgLTEpIDogMDtcbiAgICBjb25zdCBib3R0b21OZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDAsIDEpIDogMDtcblxuICAgIGNvbnN0IG5laWdoYm9yc0NvdW50ID0gbGVmdE5laWdoYm9yICsgcmlnaHROZWlnaGJvciArIHRvcE5laWdoYm9yICsgYm90dG9tTmVpZ2hib3I7XG5cbiAgICBpZiAobmVpZ2hib3JzQ291bnQgPT09IDApIHtcbiAgICAgIHRoaXMuX2Jhc2ljQ29ybmVyc1JvdW5kZWQoeyB4LCB5LCBzaXplLCBjb250ZXh0LCByb3RhdGlvbjogTWF0aC5QSSAvIDIgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFsZWZ0TmVpZ2hib3IgJiYgIXRvcE5laWdoYm9yKSB7XG4gICAgICB0aGlzLl9iYXNpY0Nvcm5lclJvdW5kZWQoeyB4LCB5LCBzaXplLCBjb250ZXh0LCByb3RhdGlvbjogLU1hdGguUEkgLyAyIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghcmlnaHROZWlnaGJvciAmJiAhYm90dG9tTmVpZ2hib3IpIHtcbiAgICAgIHRoaXMuX2Jhc2ljQ29ybmVyUm91bmRlZCh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uOiBNYXRoLlBJIC8gMiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9iYXNpY1NxdWFyZSh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uOiAwIH0pO1xuICB9XG5cbiAgX2RyYXdDbGFzc3lSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgZ2V0TmVpZ2hib3IgfTogRHJhd0FyZ3NDYW52YXMpOiB2b2lkIHtcbiAgICBjb25zdCBsZWZ0TmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigtMSwgMCkgOiAwO1xuICAgIGNvbnN0IHJpZ2h0TmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigxLCAwKSA6IDA7XG4gICAgY29uc3QgdG9wTmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigwLCAtMSkgOiAwO1xuICAgIGNvbnN0IGJvdHRvbU5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMCwgMSkgOiAwO1xuXG4gICAgY29uc3QgbmVpZ2hib3JzQ291bnQgPSBsZWZ0TmVpZ2hib3IgKyByaWdodE5laWdoYm9yICsgdG9wTmVpZ2hib3IgKyBib3R0b21OZWlnaGJvcjtcblxuICAgIGlmIChuZWlnaGJvcnNDb3VudCA9PT0gMCkge1xuICAgICAgdGhpcy5fYmFzaWNDb3JuZXJzUm91bmRlZCh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uOiBNYXRoLlBJIC8gMiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIWxlZnROZWlnaGJvciAmJiAhdG9wTmVpZ2hib3IpIHtcbiAgICAgIHRoaXMuX2Jhc2ljQ29ybmVyRXh0cmFSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgY29udGV4dCwgcm90YXRpb246IC1NYXRoLlBJIC8gMiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXJpZ2h0TmVpZ2hib3IgJiYgIWJvdHRvbU5laWdoYm9yKSB7XG4gICAgICB0aGlzLl9iYXNpY0Nvcm5lckV4dHJhUm91bmRlZCh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uOiBNYXRoLlBJIC8gMiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9iYXNpY1NxdWFyZSh7IHgsIHksIHNpemUsIGNvbnRleHQsIHJvdGF0aW9uOiAwIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgZG90VHlwZXMgZnJvbSBcIi4uLy4uLy4uL2NvbnN0YW50cy9kb3RUeXBlc1wiO1xuaW1wb3J0IHsgRG90VHlwZSwgR2V0TmVpZ2hib3IsIERyYXdBcmdzLCBCYXNpY0ZpZ3VyZURyYXdBcmdzLCBSb3RhdGVGaWd1cmVBcmdzIH0gZnJvbSBcIi4uLy4uLy4uL3R5cGVzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFFSRG90IHtcbiAgX2VsZW1lbnQ/OiBTVkdFbGVtZW50O1xuICBfc3ZnOiBTVkdFbGVtZW50O1xuICBfdHlwZTogRG90VHlwZTtcblxuICBjb25zdHJ1Y3Rvcih7IHN2ZywgdHlwZSB9OiB7IHN2ZzogU1ZHRWxlbWVudDsgdHlwZTogRG90VHlwZSB9KSB7XG4gICAgdGhpcy5fc3ZnID0gc3ZnO1xuICAgIHRoaXMuX3R5cGUgPSB0eXBlO1xuICB9XG5cbiAgZHJhdyh4OiBudW1iZXIsIHk6IG51bWJlciwgc2l6ZTogbnVtYmVyLCBnZXROZWlnaGJvcjogR2V0TmVpZ2hib3IpOiB2b2lkIHtcbiAgICBjb25zdCB0eXBlID0gdGhpcy5fdHlwZTtcbiAgICBsZXQgZHJhd0Z1bmN0aW9uO1xuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIGRvdFR5cGVzLmRvdHM6XG4gICAgICAgIGRyYXdGdW5jdGlvbiA9IHRoaXMuX2RyYXdEb3Q7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBkb3RUeXBlcy5jbGFzc3k6XG4gICAgICAgIGRyYXdGdW5jdGlvbiA9IHRoaXMuX2RyYXdDbGFzc3k7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBkb3RUeXBlcy5jbGFzc3lSb3VuZGVkOlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3Q2xhc3N5Um91bmRlZDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRvdFR5cGVzLnJvdW5kZWQ6XG4gICAgICAgIGRyYXdGdW5jdGlvbiA9IHRoaXMuX2RyYXdSb3VuZGVkO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgZG90VHlwZXMuZXh0cmFSb3VuZGVkOlxuICAgICAgICBkcmF3RnVuY3Rpb24gPSB0aGlzLl9kcmF3RXh0cmFSb3VuZGVkO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgZG90VHlwZXMuc3F1YXJlOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZHJhd0Z1bmN0aW9uID0gdGhpcy5fZHJhd1NxdWFyZTtcbiAgICB9XG5cbiAgICBkcmF3RnVuY3Rpb24uY2FsbCh0aGlzLCB7IHgsIHksIHNpemUsIGdldE5laWdoYm9yIH0pO1xuICB9XG5cbiAgX3JvdGF0ZUZpZ3VyZSh7IHgsIHksIHNpemUsIHJvdGF0aW9uID0gMCwgZHJhdyB9OiBSb3RhdGVGaWd1cmVBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgY3ggPSB4ICsgc2l6ZSAvIDI7XG4gICAgY29uc3QgY3kgPSB5ICsgc2l6ZSAvIDI7XG5cbiAgICBkcmF3KCk7XG4gICAgdGhpcy5fZWxlbWVudD8uc2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIsIGByb3RhdGUoJHsoMTgwICogcm90YXRpb24pIC8gTWF0aC5QSX0sJHtjeH0sJHtjeX0pYCk7XG4gIH1cblxuICBfYmFzaWNEb3QoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgeCwgeSB9ID0gYXJncztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJjaXJjbGVcIik7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwiY3hcIiwgU3RyaW5nKHggKyBzaXplIC8gMikpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcImN5XCIsIFN0cmluZyh5ICsgc2l6ZSAvIDIpKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJyXCIsIFN0cmluZyhzaXplIC8gMikpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2Jhc2ljU3F1YXJlKGFyZ3M6IEJhc2ljRmlndXJlRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpemUsIHgsIHkgfSA9IGFyZ3M7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwicmVjdFwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ4XCIsIFN0cmluZyh4KSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwieVwiLCBTdHJpbmcoeSkpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcIndpZHRoXCIsIFN0cmluZyhzaXplKSk7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIFN0cmluZyhzaXplKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvL2lmIHJvdGF0aW9uID09PSAwIC0gcmlnaHQgc2lkZSBpcyByb3VuZGVkXG4gIF9iYXNpY1NpZGVSb3VuZGVkKGFyZ3M6IEJhc2ljRmlndXJlRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpemUsIHgsIHkgfSA9IGFyZ3M7XG5cbiAgICB0aGlzLl9yb3RhdGVGaWd1cmUoe1xuICAgICAgLi4uYXJncyxcbiAgICAgIGRyYXc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwicGF0aFwiKTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgXCJkXCIsXG4gICAgICAgICAgYE0gJHt4fSAke3l9YCArIC8vZ28gdG8gdG9wIGxlZnQgcG9zaXRpb25cbiAgICAgICAgICAgIGB2ICR7c2l6ZX1gICsgLy9kcmF3IGxpbmUgdG8gbGVmdCBib3R0b20gY29ybmVyXG4gICAgICAgICAgICBgaCAke3NpemUgLyAyfWAgKyAvL2RyYXcgbGluZSB0byBsZWZ0IGJvdHRvbSBjb3JuZXIgKyBoYWxmIG9mIHNpemUgcmlnaHRcbiAgICAgICAgICAgIGBhICR7c2l6ZSAvIDJ9ICR7c2l6ZSAvIDJ9LCAwLCAwLCAwLCAwICR7LXNpemV9YCAvLyBkcmF3IHJvdW5kZWQgY29ybmVyXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvL2lmIHJvdGF0aW9uID09PSAwIC0gdG9wIHJpZ2h0IGNvcm5lciBpcyByb3VuZGVkXG4gIF9iYXNpY0Nvcm5lclJvdW5kZWQoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgeCwgeSB9ID0gYXJncztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJwYXRoXCIpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcbiAgICAgICAgICBcImRcIixcbiAgICAgICAgICBgTSAke3h9ICR7eX1gICsgLy9nbyB0byB0b3AgbGVmdCBwb3NpdGlvblxuICAgICAgICAgICAgYHYgJHtzaXplfWAgKyAvL2RyYXcgbGluZSB0byBsZWZ0IGJvdHRvbSBjb3JuZXJcbiAgICAgICAgICAgIGBoICR7c2l6ZX1gICsgLy9kcmF3IGxpbmUgdG8gcmlnaHQgYm90dG9tIGNvcm5lclxuICAgICAgICAgICAgYHYgJHstc2l6ZSAvIDJ9YCArIC8vZHJhdyBsaW5lIHRvIHJpZ2h0IGJvdHRvbSBjb3JuZXIgKyBoYWxmIG9mIHNpemUgdG9wXG4gICAgICAgICAgICBgYSAke3NpemUgLyAyfSAke3NpemUgLyAyfSwgMCwgMCwgMCwgJHstc2l6ZSAvIDJ9ICR7LXNpemUgLyAyfWAgLy8gZHJhdyByb3VuZGVkIGNvcm5lclxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy9pZiByb3RhdGlvbiA9PT0gMCAtIHRvcCByaWdodCBjb3JuZXIgaXMgcm91bmRlZFxuICBfYmFzaWNDb3JuZXJFeHRyYVJvdW5kZWQoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgeCwgeSB9ID0gYXJncztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJwYXRoXCIpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcbiAgICAgICAgICBcImRcIixcbiAgICAgICAgICBgTSAke3h9ICR7eX1gICsgLy9nbyB0byB0b3AgbGVmdCBwb3NpdGlvblxuICAgICAgICAgICAgYHYgJHtzaXplfWAgKyAvL2RyYXcgbGluZSB0byBsZWZ0IGJvdHRvbSBjb3JuZXJcbiAgICAgICAgICAgIGBoICR7c2l6ZX1gICsgLy9kcmF3IGxpbmUgdG8gcmlnaHQgYm90dG9tIGNvcm5lclxuICAgICAgICAgICAgYGEgJHtzaXplfSAke3NpemV9LCAwLCAwLCAwLCAkey1zaXplfSAkey1zaXplfWAgLy8gZHJhdyByb3VuZGVkIHRvcCByaWdodCBjb3JuZXJcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vaWYgcm90YXRpb24gPT09IDAgLSBsZWZ0IGJvdHRvbSBhbmQgcmlnaHQgdG9wIGNvcm5lcnMgYXJlIHJvdW5kZWRcbiAgX2Jhc2ljQ29ybmVyc1JvdW5kZWQoYXJnczogQmFzaWNGaWd1cmVEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2l6ZSwgeCwgeSB9ID0gYXJncztcblxuICAgIHRoaXMuX3JvdGF0ZUZpZ3VyZSh7XG4gICAgICAuLi5hcmdzLFxuICAgICAgZHJhdzogKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJwYXRoXCIpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZShcbiAgICAgICAgICBcImRcIixcbiAgICAgICAgICBgTSAke3h9ICR7eX1gICsgLy9nbyB0byBsZWZ0IHRvcCBwb3NpdGlvblxuICAgICAgICAgICAgYHYgJHtzaXplIC8gMn1gICsgLy9kcmF3IGxpbmUgdG8gbGVmdCB0b3AgY29ybmVyICsgaGFsZiBvZiBzaXplIGJvdHRvbVxuICAgICAgICAgICAgYGEgJHtzaXplIC8gMn0gJHtzaXplIC8gMn0sIDAsIDAsIDAsICR7c2l6ZSAvIDJ9ICR7c2l6ZSAvIDJ9YCArIC8vIGRyYXcgcm91bmRlZCBsZWZ0IGJvdHRvbSBjb3JuZXJcbiAgICAgICAgICAgIGBoICR7c2l6ZSAvIDJ9YCArIC8vZHJhdyBsaW5lIHRvIHJpZ2h0IGJvdHRvbSBjb3JuZXJcbiAgICAgICAgICAgIGB2ICR7LXNpemUgLyAyfWAgKyAvL2RyYXcgbGluZSB0byByaWdodCBib3R0b20gY29ybmVyICsgaGFsZiBvZiBzaXplIHRvcFxuICAgICAgICAgICAgYGEgJHtzaXplIC8gMn0gJHtzaXplIC8gMn0sIDAsIDAsIDAsICR7LXNpemUgLyAyfSAkey1zaXplIC8gMn1gIC8vIGRyYXcgcm91bmRlZCByaWdodCB0b3AgY29ybmVyXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfZHJhd0RvdCh7IHgsIHksIHNpemUgfTogRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICB0aGlzLl9iYXNpY0RvdCh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiAwIH0pO1xuICB9XG5cbiAgX2RyYXdTcXVhcmUoeyB4LCB5LCBzaXplIH06IERyYXdBcmdzKTogdm9pZCB7XG4gICAgdGhpcy5fYmFzaWNTcXVhcmUoeyB4LCB5LCBzaXplLCByb3RhdGlvbjogMCB9KTtcbiAgfVxuXG4gIF9kcmF3Um91bmRlZCh7IHgsIHksIHNpemUsIGdldE5laWdoYm9yIH06IERyYXdBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgbGVmdE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoLTEsIDApIDogMDtcbiAgICBjb25zdCByaWdodE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMSwgMCkgOiAwO1xuICAgIGNvbnN0IHRvcE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMCwgLTEpIDogMDtcbiAgICBjb25zdCBib3R0b21OZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDAsIDEpIDogMDtcblxuICAgIGNvbnN0IG5laWdoYm9yc0NvdW50ID0gbGVmdE5laWdoYm9yICsgcmlnaHROZWlnaGJvciArIHRvcE5laWdoYm9yICsgYm90dG9tTmVpZ2hib3I7XG5cbiAgICBpZiAobmVpZ2hib3JzQ291bnQgPT09IDApIHtcbiAgICAgIHRoaXMuX2Jhc2ljRG90KHsgeCwgeSwgc2l6ZSwgcm90YXRpb246IDAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG5laWdoYm9yc0NvdW50ID4gMiB8fCAobGVmdE5laWdoYm9yICYmIHJpZ2h0TmVpZ2hib3IpIHx8ICh0b3BOZWlnaGJvciAmJiBib3R0b21OZWlnaGJvcikpIHtcbiAgICAgIHRoaXMuX2Jhc2ljU3F1YXJlKHsgeCwgeSwgc2l6ZSwgcm90YXRpb246IDAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG5laWdoYm9yc0NvdW50ID09PSAyKSB7XG4gICAgICBsZXQgcm90YXRpb24gPSAwO1xuXG4gICAgICBpZiAobGVmdE5laWdoYm9yICYmIHRvcE5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gTWF0aC5QSSAvIDI7XG4gICAgICB9IGVsc2UgaWYgKHRvcE5laWdoYm9yICYmIHJpZ2h0TmVpZ2hib3IpIHtcbiAgICAgICAgcm90YXRpb24gPSBNYXRoLlBJO1xuICAgICAgfSBlbHNlIGlmIChyaWdodE5laWdoYm9yICYmIGJvdHRvbU5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gLU1hdGguUEkgLyAyO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9iYXNpY0Nvcm5lclJvdW5kZWQoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobmVpZ2hib3JzQ291bnQgPT09IDEpIHtcbiAgICAgIGxldCByb3RhdGlvbiA9IDA7XG5cbiAgICAgIGlmICh0b3BOZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IE1hdGguUEkgLyAyO1xuICAgICAgfSBlbHNlIGlmIChyaWdodE5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gTWF0aC5QSTtcbiAgICAgIH0gZWxzZSBpZiAoYm90dG9tTmVpZ2hib3IpIHtcbiAgICAgICAgcm90YXRpb24gPSAtTWF0aC5QSSAvIDI7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2Jhc2ljU2lkZVJvdW5kZWQoeyB4LCB5LCBzaXplLCByb3RhdGlvbiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBfZHJhd0V4dHJhUm91bmRlZCh7IHgsIHksIHNpemUsIGdldE5laWdoYm9yIH06IERyYXdBcmdzKTogdm9pZCB7XG4gICAgY29uc3QgbGVmdE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoLTEsIDApIDogMDtcbiAgICBjb25zdCByaWdodE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMSwgMCkgOiAwO1xuICAgIGNvbnN0IHRvcE5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMCwgLTEpIDogMDtcbiAgICBjb25zdCBib3R0b21OZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDAsIDEpIDogMDtcblxuICAgIGNvbnN0IG5laWdoYm9yc0NvdW50ID0gbGVmdE5laWdoYm9yICsgcmlnaHROZWlnaGJvciArIHRvcE5laWdoYm9yICsgYm90dG9tTmVpZ2hib3I7XG5cbiAgICBpZiAobmVpZ2hib3JzQ291bnQgPT09IDApIHtcbiAgICAgIHRoaXMuX2Jhc2ljRG90KHsgeCwgeSwgc2l6ZSwgcm90YXRpb246IDAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG5laWdoYm9yc0NvdW50ID4gMiB8fCAobGVmdE5laWdoYm9yICYmIHJpZ2h0TmVpZ2hib3IpIHx8ICh0b3BOZWlnaGJvciAmJiBib3R0b21OZWlnaGJvcikpIHtcbiAgICAgIHRoaXMuX2Jhc2ljU3F1YXJlKHsgeCwgeSwgc2l6ZSwgcm90YXRpb246IDAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG5laWdoYm9yc0NvdW50ID09PSAyKSB7XG4gICAgICBsZXQgcm90YXRpb24gPSAwO1xuXG4gICAgICBpZiAobGVmdE5laWdoYm9yICYmIHRvcE5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gTWF0aC5QSSAvIDI7XG4gICAgICB9IGVsc2UgaWYgKHRvcE5laWdoYm9yICYmIHJpZ2h0TmVpZ2hib3IpIHtcbiAgICAgICAgcm90YXRpb24gPSBNYXRoLlBJO1xuICAgICAgfSBlbHNlIGlmIChyaWdodE5laWdoYm9yICYmIGJvdHRvbU5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gLU1hdGguUEkgLyAyO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9iYXNpY0Nvcm5lckV4dHJhUm91bmRlZCh7IHgsIHksIHNpemUsIHJvdGF0aW9uIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChuZWlnaGJvcnNDb3VudCA9PT0gMSkge1xuICAgICAgbGV0IHJvdGF0aW9uID0gMDtcblxuICAgICAgaWYgKHRvcE5laWdoYm9yKSB7XG4gICAgICAgIHJvdGF0aW9uID0gTWF0aC5QSSAvIDI7XG4gICAgICB9IGVsc2UgaWYgKHJpZ2h0TmVpZ2hib3IpIHtcbiAgICAgICAgcm90YXRpb24gPSBNYXRoLlBJO1xuICAgICAgfSBlbHNlIGlmIChib3R0b21OZWlnaGJvcikge1xuICAgICAgICByb3RhdGlvbiA9IC1NYXRoLlBJIC8gMjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fYmFzaWNTaWRlUm91bmRlZCh7IHgsIHksIHNpemUsIHJvdGF0aW9uIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIF9kcmF3Q2xhc3N5KHsgeCwgeSwgc2l6ZSwgZ2V0TmVpZ2hib3IgfTogRHJhd0FyZ3MpOiB2b2lkIHtcbiAgICBjb25zdCBsZWZ0TmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigtMSwgMCkgOiAwO1xuICAgIGNvbnN0IHJpZ2h0TmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigxLCAwKSA6IDA7XG4gICAgY29uc3QgdG9wTmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigwLCAtMSkgOiAwO1xuICAgIGNvbnN0IGJvdHRvbU5laWdoYm9yID0gZ2V0TmVpZ2hib3IgPyArZ2V0TmVpZ2hib3IoMCwgMSkgOiAwO1xuXG4gICAgY29uc3QgbmVpZ2hib3JzQ291bnQgPSBsZWZ0TmVpZ2hib3IgKyByaWdodE5laWdoYm9yICsgdG9wTmVpZ2hib3IgKyBib3R0b21OZWlnaGJvcjtcblxuICAgIGlmIChuZWlnaGJvcnNDb3VudCA9PT0gMCkge1xuICAgICAgdGhpcy5fYmFzaWNDb3JuZXJzUm91bmRlZCh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiBNYXRoLlBJIC8gMiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIWxlZnROZWlnaGJvciAmJiAhdG9wTmVpZ2hib3IpIHtcbiAgICAgIHRoaXMuX2Jhc2ljQ29ybmVyUm91bmRlZCh7IHgsIHksIHNpemUsIHJvdGF0aW9uOiAtTWF0aC5QSSAvIDIgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFyaWdodE5laWdoYm9yICYmICFib3R0b21OZWlnaGJvcikge1xuICAgICAgdGhpcy5fYmFzaWNDb3JuZXJSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgcm90YXRpb246IE1hdGguUEkgLyAyIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2Jhc2ljU3F1YXJlKHsgeCwgeSwgc2l6ZSwgcm90YXRpb246IDAgfSk7XG4gIH1cblxuICBfZHJhd0NsYXNzeVJvdW5kZWQoeyB4LCB5LCBzaXplLCBnZXROZWlnaGJvciB9OiBEcmF3QXJncyk6IHZvaWQge1xuICAgIGNvbnN0IGxlZnROZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKC0xLCAwKSA6IDA7XG4gICAgY29uc3QgcmlnaHROZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDEsIDApIDogMDtcbiAgICBjb25zdCB0b3BOZWlnaGJvciA9IGdldE5laWdoYm9yID8gK2dldE5laWdoYm9yKDAsIC0xKSA6IDA7XG4gICAgY29uc3QgYm90dG9tTmVpZ2hib3IgPSBnZXROZWlnaGJvciA/ICtnZXROZWlnaGJvcigwLCAxKSA6IDA7XG5cbiAgICBjb25zdCBuZWlnaGJvcnNDb3VudCA9IGxlZnROZWlnaGJvciArIHJpZ2h0TmVpZ2hib3IgKyB0b3BOZWlnaGJvciArIGJvdHRvbU5laWdoYm9yO1xuXG4gICAgaWYgKG5laWdoYm9yc0NvdW50ID09PSAwKSB7XG4gICAgICB0aGlzLl9iYXNpY0Nvcm5lcnNSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgcm90YXRpb246IE1hdGguUEkgLyAyIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghbGVmdE5laWdoYm9yICYmICF0b3BOZWlnaGJvcikge1xuICAgICAgdGhpcy5fYmFzaWNDb3JuZXJFeHRyYVJvdW5kZWQoeyB4LCB5LCBzaXplLCByb3RhdGlvbjogLU1hdGguUEkgLyAyIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghcmlnaHROZWlnaGJvciAmJiAhYm90dG9tTmVpZ2hib3IpIHtcbiAgICAgIHRoaXMuX2Jhc2ljQ29ybmVyRXh0cmFSb3VuZGVkKHsgeCwgeSwgc2l6ZSwgcm90YXRpb246IE1hdGguUEkgLyAyIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2Jhc2ljU3F1YXJlKHsgeCwgeSwgc2l6ZSwgcm90YXRpb246IDAgfSk7XG4gIH1cbn1cbiIsImludGVyZmFjZSBJbWFnZVNpemVPcHRpb25zIHtcbiAgb3JpZ2luYWxIZWlnaHQ6IG51bWJlcjtcbiAgb3JpZ2luYWxXaWR0aDogbnVtYmVyO1xuICBtYXhIaWRkZW5Eb3RzOiBudW1iZXI7XG4gIG1heEhpZGRlbkF4aXNEb3RzPzogbnVtYmVyO1xuICBkb3RTaXplOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBJbWFnZVNpemVSZXN1bHQge1xuICBoZWlnaHQ6IG51bWJlcjtcbiAgd2lkdGg6IG51bWJlcjtcbiAgaGlkZVlEb3RzOiBudW1iZXI7XG4gIGhpZGVYRG90czogbnVtYmVyO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjYWxjdWxhdGVJbWFnZVNpemUoe1xuICBvcmlnaW5hbEhlaWdodCxcbiAgb3JpZ2luYWxXaWR0aCxcbiAgbWF4SGlkZGVuRG90cyxcbiAgbWF4SGlkZGVuQXhpc0RvdHMsXG4gIGRvdFNpemVcbn06IEltYWdlU2l6ZU9wdGlvbnMpOiBJbWFnZVNpemVSZXN1bHQge1xuICBjb25zdCBoaWRlRG90cyA9IHsgeDogMCwgeTogMCB9O1xuICBjb25zdCBpbWFnZVNpemUgPSB7IHg6IDAsIHk6IDAgfTtcblxuICBpZiAob3JpZ2luYWxIZWlnaHQgPD0gMCB8fCBvcmlnaW5hbFdpZHRoIDw9IDAgfHwgbWF4SGlkZGVuRG90cyA8PSAwIHx8IGRvdFNpemUgPD0gMCkge1xuICAgIHJldHVybiB7XG4gICAgICBoZWlnaHQ6IDAsXG4gICAgICB3aWR0aDogMCxcbiAgICAgIGhpZGVZRG90czogMCxcbiAgICAgIGhpZGVYRG90czogMFxuICAgIH07XG4gIH1cblxuICBjb25zdCBrID0gb3JpZ2luYWxIZWlnaHQgLyBvcmlnaW5hbFdpZHRoO1xuXG4gIC8vR2V0dGluZyB0aGUgbWF4aW11bSBwb3NzaWJsZSBheGlzIGhpZGRlbiBkb3RzXG4gIGhpZGVEb3RzLnggPSBNYXRoLmZsb29yKE1hdGguc3FydChtYXhIaWRkZW5Eb3RzIC8gaykpO1xuICAvL1RoZSBjb3VudCBvZiBoaWRkZW4gZG90J3MgY2FuJ3QgYmUgbGVzcyB0aGFuIDFcbiAgaWYgKGhpZGVEb3RzLnggPD0gMCkgaGlkZURvdHMueCA9IDE7XG4gIC8vQ2hlY2sgdGhlIGxpbWl0IG9mIHRoZSBtYXhpbXVtIGFsbG93ZWQgYXhpcyBoaWRkZW4gZG90c1xuICBpZiAobWF4SGlkZGVuQXhpc0RvdHMgJiYgbWF4SGlkZGVuQXhpc0RvdHMgPCBoaWRlRG90cy54KSBoaWRlRG90cy54ID0gbWF4SGlkZGVuQXhpc0RvdHM7XG4gIC8vVGhlIGNvdW50IG9mIGRvdHMgc2hvdWxkIGJlIG9kZFxuICBpZiAoaGlkZURvdHMueCAlIDIgPT09IDApIGhpZGVEb3RzLngtLTtcbiAgaW1hZ2VTaXplLnggPSBoaWRlRG90cy54ICogZG90U2l6ZTtcbiAgLy9DYWxjdWxhdGUgb3Bwb3NpdGUgYXhpcyBoaWRkZW4gZG90cyBiYXNlZCBvbiBheGlzIHZhbHVlLlxuICAvL1RoZSB2YWx1ZSB3aWxsIGJlIG9kZC5cbiAgLy9XZSB1c2UgY2VpbCB0byBwcmV2ZW50IGRvdHMgY292ZXJpbmcgYnkgdGhlIGltYWdlLlxuICBoaWRlRG90cy55ID0gMSArIDIgKiBNYXRoLmNlaWwoKGhpZGVEb3RzLnggKiBrIC0gMSkgLyAyKTtcbiAgaW1hZ2VTaXplLnkgPSBNYXRoLnJvdW5kKGltYWdlU2l6ZS54ICogayk7XG4gIC8vSWYgdGhlIHJlc3VsdCBkb3RzIGNvdW50IGlzIGJpZ2dlciB0aGFuIG1heCAtIHRoZW4gZGVjcmVhc2Ugc2l6ZSBhbmQgY2FsY3VsYXRlIGFnYWluXG4gIGlmIChoaWRlRG90cy55ICogaGlkZURvdHMueCA+IG1heEhpZGRlbkRvdHMgfHwgKG1heEhpZGRlbkF4aXNEb3RzICYmIG1heEhpZGRlbkF4aXNEb3RzIDwgaGlkZURvdHMueSkpIHtcbiAgICBpZiAobWF4SGlkZGVuQXhpc0RvdHMgJiYgbWF4SGlkZGVuQXhpc0RvdHMgPCBoaWRlRG90cy55KSB7XG4gICAgICBoaWRlRG90cy55ID0gbWF4SGlkZGVuQXhpc0RvdHM7XG4gICAgICBpZiAoaGlkZURvdHMueSAlIDIgPT09IDApIGhpZGVEb3RzLngtLTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGlkZURvdHMueSAtPSAyO1xuICAgIH1cbiAgICBpbWFnZVNpemUueSA9IGhpZGVEb3RzLnkgKiBkb3RTaXplO1xuICAgIGhpZGVEb3RzLnggPSAxICsgMiAqIE1hdGguY2VpbCgoaGlkZURvdHMueSAvIGsgLSAxKSAvIDIpO1xuICAgIGltYWdlU2l6ZS54ID0gTWF0aC5yb3VuZChpbWFnZVNpemUueSAvIGspO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBoZWlnaHQ6IGltYWdlU2l6ZS55LFxuICAgIHdpZHRoOiBpbWFnZVNpemUueCxcbiAgICBoaWRlWURvdHM6IGhpZGVEb3RzLnksXG4gICAgaGlkZVhEb3RzOiBoaWRlRG90cy54XG4gIH07XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkb3dubG9hZFVSSSh1cmk6IHN0cmluZywgbmFtZTogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgbGluay5kb3dubG9hZCA9IG5hbWU7XG4gIGxpbmsuaHJlZiA9IHVyaTtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKTtcbiAgbGluay5jbGljaygpO1xuICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGxpbmspO1xufVxuIiwiaW1wb3J0IG1vZGVzIGZyb20gXCIuLi9jb25zdGFudHMvbW9kZXNcIjtcbmltcG9ydCB7IE1vZGUgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0TW9kZShkYXRhOiBzdHJpbmcpOiBNb2RlIHtcbiAgc3dpdGNoICh0cnVlKSB7XG4gICAgY2FzZSAvXlswLTldKiQvLnRlc3QoZGF0YSk6XG4gICAgICByZXR1cm4gbW9kZXMubnVtZXJpYztcbiAgICBjYXNlIC9eWzAtOUEtWiAkJSorXFwtLi86XSokLy50ZXN0KGRhdGEpOlxuICAgICAgcmV0dXJuIG1vZGVzLmFscGhhbnVtZXJpYztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIG1vZGVzLmJ5dGU7XG4gIH1cbn1cbiIsImltcG9ydCB7IFVua25vd25PYmplY3QgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuY29uc3QgaXNPYmplY3QgPSAob2JqOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IGJvb2xlYW4gPT4gISFvYmogJiYgdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiAmJiAhQXJyYXkuaXNBcnJheShvYmopO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtZXJnZURlZXAodGFyZ2V0OiBVbmtub3duT2JqZWN0LCAuLi5zb3VyY2VzOiBVbmtub3duT2JqZWN0W10pOiBVbmtub3duT2JqZWN0IHtcbiAgaWYgKCFzb3VyY2VzLmxlbmd0aCkgcmV0dXJuIHRhcmdldDtcbiAgY29uc3Qgc291cmNlID0gc291cmNlcy5zaGlmdCgpO1xuICBpZiAoc291cmNlID09PSB1bmRlZmluZWQgfHwgIWlzT2JqZWN0KHRhcmdldCkgfHwgIWlzT2JqZWN0KHNvdXJjZSkpIHJldHVybiB0YXJnZXQ7XG4gIHRhcmdldCA9IHsgLi4udGFyZ2V0IH07XG4gIE9iamVjdC5rZXlzKHNvdXJjZSkuZm9yRWFjaCgoa2V5OiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICBjb25zdCB0YXJnZXRWYWx1ZSA9IHRhcmdldFtrZXldO1xuICAgIGNvbnN0IHNvdXJjZVZhbHVlID0gc291cmNlW2tleV07XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0YXJnZXRWYWx1ZSkgJiYgQXJyYXkuaXNBcnJheShzb3VyY2VWYWx1ZSkpIHtcbiAgICAgIHRhcmdldFtrZXldID0gc291cmNlVmFsdWU7XG4gICAgfSBlbHNlIGlmIChpc09iamVjdCh0YXJnZXRWYWx1ZSkgJiYgaXNPYmplY3Qoc291cmNlVmFsdWUpKSB7XG4gICAgICB0YXJnZXRba2V5XSA9IG1lcmdlRGVlcChPYmplY3QuYXNzaWduKHt9LCB0YXJnZXRWYWx1ZSksIHNvdXJjZVZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2VWYWx1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBtZXJnZURlZXAodGFyZ2V0LCAuLi5zb3VyY2VzKTtcbn1cbiIsImltcG9ydCB7IFJlcXVpcmVkT3B0aW9ucyB9IGZyb20gXCIuLi9jb3JlL1FST3B0aW9uc1wiO1xuaW1wb3J0IHsgR3JhZGllbnQgfSBmcm9tIFwiLi4vdHlwZXNcIjtcblxuZnVuY3Rpb24gc2FuaXRpemVHcmFkaWVudChncmFkaWVudDogR3JhZGllbnQpOiBHcmFkaWVudCB7XG4gIGNvbnN0IG5ld0dyYWRpZW50ID0geyAuLi5ncmFkaWVudCB9O1xuXG4gIGlmICghbmV3R3JhZGllbnQuY29sb3JTdG9wcyB8fCAhbmV3R3JhZGllbnQuY29sb3JTdG9wcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBcIkZpZWxkICdjb2xvclN0b3BzJyBpcyByZXF1aXJlZCBpbiBncmFkaWVudFwiO1xuICB9XG5cbiAgaWYgKG5ld0dyYWRpZW50LnJvdGF0aW9uKSB7XG4gICAgbmV3R3JhZGllbnQucm90YXRpb24gPSBOdW1iZXIobmV3R3JhZGllbnQucm90YXRpb24pO1xuICB9IGVsc2Uge1xuICAgIG5ld0dyYWRpZW50LnJvdGF0aW9uID0gMDtcbiAgfVxuXG4gIG5ld0dyYWRpZW50LmNvbG9yU3RvcHMgPSBuZXdHcmFkaWVudC5jb2xvclN0b3BzLm1hcCgoY29sb3JTdG9wOiB7IG9mZnNldDogbnVtYmVyOyBjb2xvcjogc3RyaW5nIH0pID0+ICh7XG4gICAgLi4uY29sb3JTdG9wLFxuICAgIG9mZnNldDogTnVtYmVyKGNvbG9yU3RvcC5vZmZzZXQpXG4gIH0pKTtcblxuICByZXR1cm4gbmV3R3JhZGllbnQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNhbml0aXplT3B0aW9ucyhvcHRpb25zOiBSZXF1aXJlZE9wdGlvbnMpOiBSZXF1aXJlZE9wdGlvbnMge1xuICBjb25zdCBuZXdPcHRpb25zID0geyAuLi5vcHRpb25zIH07XG5cbiAgbmV3T3B0aW9ucy53aWR0aCA9IE51bWJlcihuZXdPcHRpb25zLndpZHRoKTtcbiAgbmV3T3B0aW9ucy5oZWlnaHQgPSBOdW1iZXIobmV3T3B0aW9ucy5oZWlnaHQpO1xuICBuZXdPcHRpb25zLm1hcmdpbiA9IE51bWJlcihuZXdPcHRpb25zLm1hcmdpbik7XG4gIG5ld09wdGlvbnMuaW1hZ2VPcHRpb25zID0ge1xuICAgIC4uLm5ld09wdGlvbnMuaW1hZ2VPcHRpb25zLFxuICAgIGhpZGVCYWNrZ3JvdW5kRG90czogQm9vbGVhbihuZXdPcHRpb25zLmltYWdlT3B0aW9ucy5oaWRlQmFja2dyb3VuZERvdHMpLFxuICAgIGltYWdlU2l6ZTogTnVtYmVyKG5ld09wdGlvbnMuaW1hZ2VPcHRpb25zLmltYWdlU2l6ZSksXG4gICAgbWFyZ2luOiBOdW1iZXIobmV3T3B0aW9ucy5pbWFnZU9wdGlvbnMubWFyZ2luKVxuICB9O1xuXG4gIGlmIChuZXdPcHRpb25zLm1hcmdpbiA+IE1hdGgubWluKG5ld09wdGlvbnMud2lkdGgsIG5ld09wdGlvbnMuaGVpZ2h0KSkge1xuICAgIG5ld09wdGlvbnMubWFyZ2luID0gTWF0aC5taW4obmV3T3B0aW9ucy53aWR0aCwgbmV3T3B0aW9ucy5oZWlnaHQpO1xuICB9XG5cbiAgbmV3T3B0aW9ucy5kb3RzT3B0aW9ucyA9IHtcbiAgICAuLi5uZXdPcHRpb25zLmRvdHNPcHRpb25zXG4gIH07XG4gIGlmIChuZXdPcHRpb25zLmRvdHNPcHRpb25zLmdyYWRpZW50KSB7XG4gICAgbmV3T3B0aW9ucy5kb3RzT3B0aW9ucy5ncmFkaWVudCA9IHNhbml0aXplR3JhZGllbnQobmV3T3B0aW9ucy5kb3RzT3B0aW9ucy5ncmFkaWVudCk7XG4gIH1cblxuICBpZiAobmV3T3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9ucykge1xuICAgIG5ld09wdGlvbnMuY29ybmVyc1NxdWFyZU9wdGlvbnMgPSB7XG4gICAgICAuLi5uZXdPcHRpb25zLmNvcm5lcnNTcXVhcmVPcHRpb25zXG4gICAgfTtcbiAgICBpZiAobmV3T3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9ucy5ncmFkaWVudCkge1xuICAgICAgbmV3T3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9ucy5ncmFkaWVudCA9IHNhbml0aXplR3JhZGllbnQobmV3T3B0aW9ucy5jb3JuZXJzU3F1YXJlT3B0aW9ucy5ncmFkaWVudCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKG5ld09wdGlvbnMuY29ybmVyc0RvdE9wdGlvbnMpIHtcbiAgICBuZXdPcHRpb25zLmNvcm5lcnNEb3RPcHRpb25zID0ge1xuICAgICAgLi4ubmV3T3B0aW9ucy5jb3JuZXJzRG90T3B0aW9uc1xuICAgIH07XG4gICAgaWYgKG5ld09wdGlvbnMuY29ybmVyc0RvdE9wdGlvbnMuZ3JhZGllbnQpIHtcbiAgICAgIG5ld09wdGlvbnMuY29ybmVyc0RvdE9wdGlvbnMuZ3JhZGllbnQgPSBzYW5pdGl6ZUdyYWRpZW50KG5ld09wdGlvbnMuY29ybmVyc0RvdE9wdGlvbnMuZ3JhZGllbnQpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChuZXdPcHRpb25zLmJhY2tncm91bmRPcHRpb25zKSB7XG4gICAgbmV3T3B0aW9ucy5iYWNrZ3JvdW5kT3B0aW9ucyA9IHtcbiAgICAgIC4uLm5ld09wdGlvbnMuYmFja2dyb3VuZE9wdGlvbnNcbiAgICB9O1xuICAgIGlmIChuZXdPcHRpb25zLmJhY2tncm91bmRPcHRpb25zLmdyYWRpZW50KSB7XG4gICAgICBuZXdPcHRpb25zLmJhY2tncm91bmRPcHRpb25zLmdyYWRpZW50ID0gc2FuaXRpemVHcmFkaWVudChuZXdPcHRpb25zLmJhY2tncm91bmRPcHRpb25zLmdyYWRpZW50KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3T3B0aW9ucztcbn1cbiIsImV4cG9ydCBpbnRlcmZhY2UgVW5rbm93bk9iamVjdCB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbn1cblxuZXhwb3J0IHR5cGUgRG90VHlwZSA9IFwiZG90c1wiIHwgXCJyb3VuZGVkXCIgfCBcImNsYXNzeVwiIHwgXCJjbGFzc3ktcm91bmRlZFwiIHwgXCJzcXVhcmVcIiB8IFwiZXh0cmEtcm91bmRlZFwiO1xuZXhwb3J0IHR5cGUgQ29ybmVyRG90VHlwZSA9IFwiZG90XCIgfCBcInNxdWFyZVwiO1xuZXhwb3J0IHR5cGUgQ29ybmVyU3F1YXJlVHlwZSA9IFwiZG90XCIgfCBcInNxdWFyZVwiIHwgXCJleHRyYS1yb3VuZGVkXCI7XG5leHBvcnQgdHlwZSBFeHRlbnNpb24gPSBcInN2Z1wiIHwgXCJwbmdcIiB8IFwianBlZ1wiIHwgXCJ3ZWJwXCI7XG5leHBvcnQgdHlwZSBHcmFkaWVudFR5cGUgPSBcInJhZGlhbFwiIHwgXCJsaW5lYXJcIjtcbmV4cG9ydCB0eXBlIERyYXdUeXBlID0gXCJjYW52YXNcIiB8IFwic3ZnXCI7XG5cbmV4cG9ydCB0eXBlIEdyYWRpZW50ID0ge1xuICB0eXBlOiBHcmFkaWVudFR5cGU7XG4gIHJvdGF0aW9uPzogbnVtYmVyO1xuICBjb2xvclN0b3BzOiB7XG4gICAgb2Zmc2V0OiBudW1iZXI7XG4gICAgY29sb3I6IHN0cmluZztcbiAgfVtdO1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBEb3RUeXBlcyB7XG4gIFtrZXk6IHN0cmluZ106IERvdFR5cGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgR3JhZGllbnRUeXBlcyB7XG4gIFtrZXk6IHN0cmluZ106IEdyYWRpZW50VHlwZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb3JuZXJEb3RUeXBlcyB7XG4gIFtrZXk6IHN0cmluZ106IENvcm5lckRvdFR5cGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29ybmVyU3F1YXJlVHlwZXMge1xuICBba2V5OiBzdHJpbmddOiBDb3JuZXJTcXVhcmVUeXBlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdUeXBlcyB7XG4gIFtrZXk6IHN0cmluZ106IERyYXdUeXBlO1xufVxuXG5leHBvcnQgdHlwZSBUeXBlTnVtYmVyID1cbiAgfCAwXG4gIHwgMVxuICB8IDJcbiAgfCAzXG4gIHwgNFxuICB8IDVcbiAgfCA2XG4gIHwgN1xuICB8IDhcbiAgfCA5XG4gIHwgMTBcbiAgfCAxMVxuICB8IDEyXG4gIHwgMTNcbiAgfCAxNFxuICB8IDE1XG4gIHwgMTZcbiAgfCAxN1xuICB8IDE4XG4gIHwgMTlcbiAgfCAyMFxuICB8IDIxXG4gIHwgMjJcbiAgfCAyM1xuICB8IDI0XG4gIHwgMjVcbiAgfCAyNlxuICB8IDI3XG4gIHwgMjhcbiAgfCAyOVxuICB8IDMwXG4gIHwgMzFcbiAgfCAzMlxuICB8IDMzXG4gIHwgMzRcbiAgfCAzNVxuICB8IDM2XG4gIHwgMzdcbiAgfCAzOFxuICB8IDM5XG4gIHwgNDA7XG5cbmV4cG9ydCB0eXBlIEVycm9yQ29ycmVjdGlvbkxldmVsID0gXCJMXCIgfCBcIk1cIiB8IFwiUVwiIHwgXCJIXCI7XG5leHBvcnQgdHlwZSBNb2RlID0gXCJOdW1lcmljXCIgfCBcIkFscGhhbnVtZXJpY1wiIHwgXCJCeXRlXCIgfCBcIkthbmppXCI7XG5leHBvcnQgaW50ZXJmYWNlIFFSQ29kZSB7XG4gIGFkZERhdGEoZGF0YTogc3RyaW5nLCBtb2RlPzogTW9kZSk6IHZvaWQ7XG4gIG1ha2UoKTogdm9pZDtcbiAgZ2V0TW9kdWxlQ291bnQoKTogbnVtYmVyO1xuICBpc0Rhcmsocm93OiBudW1iZXIsIGNvbDogbnVtYmVyKTogYm9vbGVhbjtcbiAgY3JlYXRlSW1nVGFnKGNlbGxTaXplPzogbnVtYmVyLCBtYXJnaW4/OiBudW1iZXIpOiBzdHJpbmc7XG4gIGNyZWF0ZVN2Z1RhZyhjZWxsU2l6ZT86IG51bWJlciwgbWFyZ2luPzogbnVtYmVyKTogc3RyaW5nO1xuICBjcmVhdGVTdmdUYWcob3B0cz86IHsgY2VsbFNpemU/OiBudW1iZXI7IG1hcmdpbj86IG51bWJlcjsgc2NhbGFibGU/OiBib29sZWFuIH0pOiBzdHJpbmc7XG4gIGNyZWF0ZURhdGFVUkwoY2VsbFNpemU/OiBudW1iZXIsIG1hcmdpbj86IG51bWJlcik6IHN0cmluZztcbiAgY3JlYXRlVGFibGVUYWcoY2VsbFNpemU/OiBudW1iZXIsIG1hcmdpbj86IG51bWJlcik6IHN0cmluZztcbiAgY3JlYXRlQVNDSUkoY2VsbFNpemU/OiBudW1iZXIsIG1hcmdpbj86IG51bWJlcik6IHN0cmluZztcbiAgcmVuZGVyVG8yZENvbnRleHQoY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBjZWxsU2l6ZT86IG51bWJlcik6IHZvaWQ7XG59XG5cbmV4cG9ydCB0eXBlIE9wdGlvbnMgPSB7XG4gIHR5cGU/OiBEcmF3VHlwZTtcbiAgd2lkdGg/OiBudW1iZXI7XG4gIGhlaWdodD86IG51bWJlcjtcbiAgbWFyZ2luPzogbnVtYmVyO1xuICBkYXRhPzogc3RyaW5nO1xuICBpbWFnZT86IHN0cmluZztcbiAgcXJPcHRpb25zPzoge1xuICAgIHR5cGVOdW1iZXI/OiBUeXBlTnVtYmVyO1xuICAgIG1vZGU/OiBNb2RlO1xuICAgIGVycm9yQ29ycmVjdGlvbkxldmVsPzogRXJyb3JDb3JyZWN0aW9uTGV2ZWw7XG4gIH07XG4gIGltYWdlT3B0aW9ucz86IHtcbiAgICBoaWRlQmFja2dyb3VuZERvdHM/OiBib29sZWFuO1xuICAgIGltYWdlU2l6ZT86IG51bWJlcjtcbiAgICBjcm9zc09yaWdpbj86IHN0cmluZztcbiAgICBtYXJnaW4/OiBudW1iZXI7XG4gIH07XG4gIGRvdHNPcHRpb25zPzoge1xuICAgIHR5cGU/OiBEb3RUeXBlO1xuICAgIGNvbG9yPzogc3RyaW5nO1xuICAgIGdyYWRpZW50PzogR3JhZGllbnQ7XG4gIH07XG4gIGNvcm5lcnNTcXVhcmVPcHRpb25zPzoge1xuICAgIHR5cGU/OiBDb3JuZXJTcXVhcmVUeXBlO1xuICAgIGNvbG9yPzogc3RyaW5nO1xuICAgIGdyYWRpZW50PzogR3JhZGllbnQ7XG4gIH07XG4gIGNvcm5lcnNEb3RPcHRpb25zPzoge1xuICAgIHR5cGU/OiBDb3JuZXJEb3RUeXBlO1xuICAgIGNvbG9yPzogc3RyaW5nO1xuICAgIGdyYWRpZW50PzogR3JhZGllbnQ7XG4gIH07XG4gIGJhY2tncm91bmRPcHRpb25zPzoge1xuICAgIGNvbG9yPzogc3RyaW5nO1xuICAgIGdyYWRpZW50PzogR3JhZGllbnQ7XG4gIH07XG59O1xuXG5leHBvcnQgdHlwZSBGaWx0ZXJGdW5jdGlvbiA9IChpOiBudW1iZXIsIGo6IG51bWJlcikgPT4gYm9vbGVhbjtcblxuZXhwb3J0IHR5cGUgRG93bmxvYWRPcHRpb25zID0ge1xuICBuYW1lPzogc3RyaW5nO1xuICBleHRlbnNpb24/OiBFeHRlbnNpb247XG59O1xuXG5leHBvcnQgdHlwZSBEcmF3QXJncyA9IHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG4gIHNpemU6IG51bWJlcjtcbiAgcm90YXRpb24/OiBudW1iZXI7XG4gIGdldE5laWdoYm9yPzogR2V0TmVpZ2hib3I7XG59O1xuXG5leHBvcnQgdHlwZSBCYXNpY0ZpZ3VyZURyYXdBcmdzID0ge1xuICB4OiBudW1iZXI7XG4gIHk6IG51bWJlcjtcbiAgc2l6ZTogbnVtYmVyO1xuICByb3RhdGlvbj86IG51bWJlcjtcbn07XG5cbmV4cG9ydCB0eXBlIFJvdGF0ZUZpZ3VyZUFyZ3MgPSB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xuICBzaXplOiBudW1iZXI7XG4gIHJvdGF0aW9uPzogbnVtYmVyO1xuICBkcmF3OiAoKSA9PiB2b2lkO1xufTtcblxuZXhwb3J0IHR5cGUgRHJhd0FyZ3NDYW52YXMgPSBEcmF3QXJncyAmIHtcbiAgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xufTtcblxuZXhwb3J0IHR5cGUgQmFzaWNGaWd1cmVEcmF3QXJnc0NhbnZhcyA9IEJhc2ljRmlndXJlRHJhd0FyZ3MgJiB7XG4gIGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbn07XG5cbmV4cG9ydCB0eXBlIFJvdGF0ZUZpZ3VyZUFyZ3NDYW52YXMgPSBSb3RhdGVGaWd1cmVBcmdzICYge1xuICBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG59O1xuXG5leHBvcnQgdHlwZSBHZXROZWlnaGJvciA9ICh4OiBudW1iZXIsIHk6IG51bWJlcikgPT4gYm9vbGVhbjtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgUVJDb2RlU3R5bGluZyBmcm9tIFwiLi9jb3JlL1FSQ29kZVN0eWxpbmdcIjtcbmltcG9ydCBkb3RUeXBlcyBmcm9tIFwiLi9jb25zdGFudHMvZG90VHlwZXNcIjtcbmltcG9ydCBjb3JuZXJEb3RUeXBlcyBmcm9tIFwiLi9jb25zdGFudHMvY29ybmVyRG90VHlwZXNcIjtcbmltcG9ydCBjb3JuZXJTcXVhcmVUeXBlcyBmcm9tIFwiLi9jb25zdGFudHMvY29ybmVyU3F1YXJlVHlwZXNcIjtcbmltcG9ydCBlcnJvckNvcnJlY3Rpb25MZXZlbHMgZnJvbSBcIi4vY29uc3RhbnRzL2Vycm9yQ29ycmVjdGlvbkxldmVsc1wiO1xuaW1wb3J0IGVycm9yQ29ycmVjdGlvblBlcmNlbnRzIGZyb20gXCIuL2NvbnN0YW50cy9lcnJvckNvcnJlY3Rpb25QZXJjZW50c1wiO1xuaW1wb3J0IG1vZGVzIGZyb20gXCIuL2NvbnN0YW50cy9tb2Rlc1wiO1xuaW1wb3J0IHFyVHlwZXMgZnJvbSBcIi4vY29uc3RhbnRzL3FyVHlwZXNcIjtcbmltcG9ydCBkcmF3VHlwZXMgZnJvbSBcIi4vY29uc3RhbnRzL2RyYXdUeXBlc1wiO1xuXG5leHBvcnQgKiBmcm9tIFwiLi90eXBlc1wiO1xuXG5leHBvcnQge1xuICBkb3RUeXBlcyxcbiAgY29ybmVyRG90VHlwZXMsXG4gIGNvcm5lclNxdWFyZVR5cGVzLFxuICBlcnJvckNvcnJlY3Rpb25MZXZlbHMsXG4gIGVycm9yQ29ycmVjdGlvblBlcmNlbnRzLFxuICBtb2RlcyxcbiAgcXJUeXBlcyxcbiAgZHJhd1R5cGVzXG59O1xuXG5leHBvcnQgZGVmYXVsdCBRUkNvZGVTdHlsaW5nO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9