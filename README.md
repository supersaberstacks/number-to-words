# Number to Words

Type a number, read it in English. No build step, no dependencies, no server.

**[Try it →](https://supersaberstacks.github.io/number-to-words/)**

```
1234567     →  one million, two hundred thirty-four thousand, five hundred sixty-seven
3.14159     →  three point one four one five nine
-42         →  negative forty-two
1e100       →  ten duotrigintillion
1e3003      →  one millinillion
```

## Really large numbers

The number never becomes a JavaScript `Number`, which loses precision past about 15
digits. Input stays a string, gets split into three-digit groups, and each group's
scale name is **generated** rather than looked up in a fixed table.

That generation uses the [Conway–Wechsler system](https://en.wikipedia.org/wiki/Names_of_large_numbers),
which defines a valid name for every *n*-th "-illion" by composing Latin prefixes. So
there is no ceiling — the 1000th illion is a `millinillion`, and the scale name for a
googolplex is a single 767-letter word the code builds on demand.

The first twenty scales use their settled dictionary spellings (`quindecillion`, not
the strict-rules `quinquadecillion`); past that, the rules generate the names.

A 5,000-digit number converts in about 2 ms.

## Features

- Live conversion as you type
- Negatives, decimals, and scientific notation (`1e100`)
- Tolerates pasted commas, spaces, and underscores
- **Speak** button using the browser's speech synthesis, chunked at comma boundaries so
  long numbers don't hit the browser's utterance-length cutoff
- Copy to clipboard
- Light and dark themes, following your system setting

## Running it

Open `index.html` in a browser. That's the whole thing.

```
index.html   the page and its UI logic
words.js     the conversion logic, usable on its own
```

`words.js` works in Node too:

```js
const { numberToWords, illionName } = require('./words.js');

numberToWords('1e100');   // 'ten duotrigintillion'
illionName(1000n);        // 'millinillion'
```

## Notes

Output uses the short scale (a billion is 10⁹) and US convention, with no "and" before
the tens. Groups are separated by commas, which makes long numbers far easier to read.

Speech quality depends on the voices installed on your system, not on this code.
