import _ from 'lodash';

import logger from './logger.mjs';
import big_database from './data/index.mjs';

const search_term = process.argv[2]; // node database.mjs 'and nothing'

const small_database = [
  `Call me Ishmael. Some years ago—never mind how long precisely—having`,
  `little or no money in my purse, and nothing particular to interest me`,
  `on shore, I thought I would sail about a little and see the watery part`,
  `of the world. `
];

let time_and_log = (f) => {
  const start = process.hrtime();
  const result = f();
  const elapsed = process.hrtime(start)[1]/1000000;
  const message = result.message;
  delete result.message;
  delete result.index;
  logger.info(message, _.assign(result, {elapsed}));
} 

let find_lines_containing = (data, term) => {
  const start = process.hrtime();
  const result = data.filter(line => contains(line, term));
  const timing = process.hrtime(start);
  return {
    message: "Small database search. Found {Occurrances} occurrances of {Found} in {Elapsed}us. Searched {Lines} lines.",     
    Occurrances: result.length,
    Found: term, 
    Elapsed: timing[1]/1000, 
    Result: result.slice(0,2),
    Lines: data.length
  };
};

time_and_log(
  find_lines_containing.bind(this, small_database, search_term)
);









/*

*/
find_lines_containing = (data, term) => {
  const start = process.hrtime();
  const result = data.filter(line => contains(line, term));
  const timing = process.hrtime(start);
  return {
    message: "No index search. Found {Occurrances} occurrances of {Found} in {Elapsed}us. Searched {Lines} lines.",
    Occurrances: result.length,
    Found: term, 
    Elapsed: timing[1]/1000, 
    Result: result.slice(0,2),
    Lines: data.length
  };
};

time_and_log(
  find_lines_containing.bind(this, big_database, search_term)
);






/*


*/
find_lines_containing = (data, term, index) => {
  const start = process.hrtime();
  const result = (index && index[term]) 
    ? index[term].map(i => data[i])
    : data.filter(line => contains(line, term));
  const timing = process.hrtime(start);
  return {
    message: "Indexed search. Found {Occurrances} occurrances of {Found} in {Elapsed}us. Searched {Lines} lines.",
    Occurrances: result.length,
    Found: term, 
    Elapsed: timing[1]/1000, 
    Result: result.slice(0,2),
    Lines: data.length
  };
};

const build_index_for = (data, term) => {
  return {
    [term]: data.reduce((p, c, i) => {
      return contains(c, term) ? p.concat([i]) : p;
    }, [])
  };
};

const term_index = build_index_for(big_database, search_term);

time_and_log(
  find_lines_containing.bind(this, big_database, search_term, term_index)
);









/* 
  Processes approximately 500 lines/s
*/
const build_full_index = (data) => {
  const index = data.reduce((p,c,i) => {
    const unique_words = _.uniq(c.split(/\W/).map(w => w.toLowerCase())).filter(s => s);
    for (const word of unique_words) {
      p = _.merge(p, { [word]: (p[word] || []).concat([i]) });
    }
    return p;
  }, {});
  
  return {
    message: "Built index with {Entries} entries for {Lines} lines.",
    Lines: data.length,
    Entries: Object.keys(index).length,
    index
  };
};

function contains(big_string, little_string) {
  const exp = new RegExp(`^.*\\b${little_string}\\b.*`, 'i');
  return exp.test(big_string);
};

const cp_index = build_full_index(big_database);
time_and_log(
  find_lines_containing.bind(this, big_database, search_term)
);
time_and_log(
  find_lines_containing.bind(this, big_database, search_term, cp_index)
);