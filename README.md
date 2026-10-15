# Number to Words

Type a number and read it in English. No build step, no dependencies, no server.

**Where it lives:** <https://supersaberstacks.github.io/number-to-words/> (GitHub Pages; not in a container).

```
1234567     →  one million, two hundred thirty-four thousand, five hundred sixty-seven
3.14159     →  three point one four one five nine
-42         →  negative forty-two
1e100       →  ten duotrigintillion
1e3003      →  one millinillion
```

## Using it

- It converts live as you type.
- Negatives, decimals and scientific notation (`1e100`) all work.
- Pasted commas, spaces and underscores are fine.
- **Speak** reads it aloud with the browser's speech, in chunks at the commas so long numbers don't hit the
  browser's length limit.
- **Copy** puts the words on the clipboard.
- Light and dark themes follow your system setting.

## Setting it up

Open `index.html` in a browser. That's the whole thing.

## Development

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

### Really large numbers

The number never becomes a JavaScript `Number`, which loses precision past about 15 digits. The input stays a
string, gets split into three-digit groups, and each group's scale name is **generated** rather than looked up in a
fixed table.

That uses the [Conway–Wechsler system](https://en.wikipedia.org/wiki/Names_of_large_numbers), which gives a valid
name for every *n*-th "-illion" by putting Latin prefixes together. So there's no ceiling: the 1000th illion is a
`millinillion`, and the scale name for a googolplex is a single 767-letter word the code builds when asked.

The first twenty scales use their settled dictionary spellings (`quindecillion`, not the strict-rules
`quinquadecillion`); past that, the rules make the names.

A 5,000-digit number converts in about 2 ms.

## Notes and limits

The output uses the short scale (a billion is 10⁹) and the US convention, with no "and" before the tens. Groups are
separated by commas, which makes long numbers far easier to read.

Speech quality depends on the voices installed on your system, not on this code.
