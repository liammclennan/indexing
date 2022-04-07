import logger from './logger.mjs';
import lines from './data/index.mjs';

const contains = (big_string, little_string) => {
  const exp = new RegExp(`^.*\\b${little_string}\\b.*`, 'i');
  return exp.test(big_string);
};

const small_database = [
  `Call me Ishmael. Some years ago—never mind how long precisely—having`,
  `little or no money in my purse, and nothing particular to interest me`,
  `on shore, I thought I would sail about a little and see the watery part`,
  `of the world. `
];

const find_lines_containing = (data, term, index) => {
  const start = process.hrtime();
  const result = (index) 
    ? index.map(i => data[i])
    : data.filter(line => contains(line, term));
  const timing = process.hrtime(start);
  logger.info("Found {Occurrances} occurrances of {Found} in {Elapsed}us. Searched {Lines} lines.", {     
    Occurrances: result.length,
    Found: term, 
    Elapsed: timing[1]/1000, 
    Result: result.slice(0,2),
    Lines: data.length
  });
  return result;
}

const build_index_for = (term) => {
  return lines.reduce((p, c, i) => {
    return contains(c, term) ? p.concat([i]) : p;
  }, []);
};

const whale_index = build_index_for('whale');
find_lines_containing(lines, 'whale', whale_index);

