/*
 * numberToWords — converts an arbitrarily large decimal number string into English words.
 *
 * Large scale names use the Conway–Wechsler system, which generates a valid name for
 * every "-illion" rather than stopping at a hardcoded list, so there is no practical
 * ceiling on the size of the number.
 */
(function (root) {
  'use strict';

  var SMALL = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
    'eighteen', 'nineteen'];

  var TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  var DIGIT_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

  // --- Conway–Wechsler prefix tables ------------------------------------------------

  // Prefixes for values 0-9 when they stand as a whole -illion group.
  var CW_SMALL = ['n', 'm', 'b', 'tr', 'quadr', 'quint', 'sext', 'sept', 'oct', 'non'];

  var CW_UNITS = ['', 'un', 'duo', 'tre', 'quattuor', 'quinqua', 'se', 'septe', 'octo', 'nove'];

  var CW_TENS = ['', 'deci', 'viginti', 'triginta', 'quadraginta', 'quinquaginta',
    'sexaginta', 'septuaginta', 'octoginta', 'nonaginta'];
  var CW_TENS_MARK = ['', 'n', 'ms', 'ns', 'ns', 'ns', 'n', 'n', 'mx', ''];

  var CW_HUNDREDS = ['', 'centi', 'ducenti', 'trecenti', 'quadringenti', 'quingenti',
    'sescenti', 'septingenti', 'octingenti', 'nongenti'];
  var CW_HUNDREDS_MARK = ['', 'nx', 'n', 'ns', 'ns', 'ns', 'n', 'n', 'mx', ''];

  // Builds the prefix for a single 3-digit Conway–Wechsler group (0-999).
  function cwPrefix(g) {
    if (g < 10) return CW_SMALL[g];

    var u = g % 10;
    var t = Math.floor(g / 10) % 10;
    var h = Math.floor(g / 100);
    var out = '';

    if (u) {
      out = CW_UNITS[u];
      // The unit prefix may absorb a letter from whatever component follows it.
      var mark = t ? CW_TENS_MARK[t] : CW_HUNDREDS_MARK[h];
      if (u === 3) {
        if (mark.indexOf('s') >= 0 || mark.indexOf('x') >= 0) out += 's';
      } else if (u === 6) {
        if (mark.indexOf('s') >= 0) out += 's';
        else if (mark.indexOf('x') >= 0) out += 'x';
      } else if (u === 7 || u === 9) {
        if (mark.indexOf('m') >= 0) out += 'm';
        else if (mark.indexOf('n') >= 0) out += 'n';
      }
    }

    out += CW_TENS[t] + CW_HUNDREDS[h];
    return out.replace(/[aeiou]$/, '');
  }

  // The first twenty scales have settled dictionary spellings that differ slightly from
  // what the Conway–Wechsler rules generate (quindecillion, not quinquadecillion).
  var COMMON_ILLIONS = ['', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion',
    'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion',
    'duodecillion', 'tredecillion', 'quattuordecillion', 'quindecillion', 'sexdecillion',
    'septendecillion', 'octodecillion', 'novemdecillion', 'vigintillion'];

  // Name of the n-th -illion: 1 -> million, 2 -> billion, 1000 -> millinillion, ...
  // n is a BigInt so the scale itself can be astronomically large.
  function illionName(n) {
    if (n <= 20n) return COMMON_ILLIONS[Number(n)];
    if (n < 1000n) return cwPrefix(Number(n)) + 'illion';

    var groups = [];
    var x = n;
    while (x > 0n) {
      groups.unshift(Number(x % 1000n));
      x = x / 1000n;
    }
    return groups.map(cwPrefix).join('illi') + 'illion';
  }

  // --- Number rendering -------------------------------------------------------------

  function threeDigitsToWords(n) {
    var parts = [];
    var h = Math.floor(n / 100);
    var r = n % 100;

    if (h) parts.push(SMALL[h] + ' hundred');
    if (r < 20) {
      if (r) parts.push(SMALL[r]);
    } else {
      var t = Math.floor(r / 10);
      var o = r % 10;
      parts.push(o ? TENS[t] + '-' + SMALL[o] : TENS[t]);
    }
    return parts.join(' ');
  }

  // digits: a string of decimal digits (no sign, no point).
  function integerToWords(digits) {
    var trimmed = digits.replace(/^0+/, '');
    if (trimmed === '') return 'zero';

    var count = Math.ceil(trimmed.length / 3);
    var padded = trimmed.padStart(count * 3, '0');
    var parts = [];

    for (var i = 0; i < count; i++) {
      var g = parseInt(padded.slice(i * 3, i * 3 + 3), 10);
      if (!g) continue;

      var index = count - 1 - i; // 0 = units, 1 = thousands, 2 = millions, ...
      var scale = '';
      if (index === 1) scale = ' thousand';
      else if (index >= 2) scale = ' ' + illionName(BigInt(index - 1));

      parts.push(threeDigitsToWords(g) + scale);
    }
    return parts.join(', ');
  }

  function fractionToWords(digits) {
    var words = [];
    for (var i = 0; i < digits.length; i++) {
      words.push(DIGIT_WORDS[+digits[i]]);
    }
    return words.join(' ');
  }

  // Rewrites 1.23e45 style input as plain digits. Returns null if not exponential.
  function expandExponential(s) {
    var m = /^([+-]?)(\d*)(?:\.(\d*))?[eE]([+-]?\d+)$/.exec(s);
    if (!m) return null;

    var sign = m[1] === '-' ? '-' : '';
    var intPart = m[2] || '';
    var fracPart = m[3] || '';
    if (!intPart && !fracPart) return null;

    var exp = parseInt(m[4], 10);
    if (!isFinite(exp) || Math.abs(exp) > 100000) return null;

    var digits = intPart + fracPart;
    var point = intPart.length + exp; // digits before the decimal point

    if (point <= 0) return sign + '0.' + '0'.repeat(-point) + digits;
    if (point >= digits.length) return sign + digits + '0'.repeat(point - digits.length);
    return sign + digits.slice(0, point) + '.' + digits.slice(point);
  }

  // Groups the integer part with commas for the numeral echo.
  function groupDigits(digits) {
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Parses user input, tolerating commas, spaces, underscores and exponent notation.
   * Returns { sign, integer, fraction } or null when the input is not a number.
   */
  function parseNumber(input) {
    var s = String(input).replace(/[\s,_]/g, '');
    if (s === '') return null;

    var expanded = expandExponential(s);
    if (expanded !== null) s = expanded;

    var m = /^([+-]?)(\d*)(?:\.(\d*))?$/.exec(s);
    if (!m) return null;

    var intPart = m[2] || '';
    var fracPart = m[3] || '';
    if (intPart === '' && fracPart === '') return null;

    return {
      sign: m[1] === '-' ? '-' : '',
      integer: intPart === '' ? '0' : intPart,
      fraction: fracPart.replace(/0+$/, '')
    };
  }

  function numberToWords(input) {
    var parsed = parseNumber(input);
    if (!parsed) return null;

    var words = integerToWords(parsed.integer);
    if (parsed.fraction) words += ' point ' + fractionToWords(parsed.fraction);

    var isZero = /^0*$/.test(parsed.integer) && !parsed.fraction;
    if (parsed.sign === '-' && !isZero) words = 'negative ' + words;

    return words;
  }

  function formatNumeral(input) {
    var parsed = parseNumber(input);
    if (!parsed) return null;
    return parsed.sign + groupDigits(parsed.integer.replace(/^0+(?=\d)/, '')) +
      (parsed.fraction ? '.' + parsed.fraction : '');
  }

  var api = {
    numberToWords: numberToWords,
    formatNumeral: formatNumeral,
    parseNumber: parseNumber,
    illionName: illionName,
    integerToWords: integerToWords
  };

  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NumberWords = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
