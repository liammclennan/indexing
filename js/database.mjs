import _ from 'lodash';

import logger from './logger.mjs';
import big_database from './data/index.mjs';

const search_term = process.argv[2]; // node database.mjs 'and nothing'
const exp = new RegExp(`^.*\\b${search_term}\\b.*`, 'i');


const small_database = [
  `Call me Ishmael. Some years ago—never mind how long precisely—having`,
  `little or no money in my purse, and nothing particular to interest me`,
  `on shore, I thought I would sail about a little and see the watery part`,
  `of the world. `
];

let find_lines_containing = (data, term) => {
  const result = data.filter(line => contains(line, term));
  return {
    message: "Small database search. Found {Occurrances} occurrances of {Found} in {Elapsed}ms. Searched {Lines} lines.",     
    Occurrances: result.length,
    Found: term, 
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
  const result = data.filter(line => contains(line, term));
  return {
    message: "No index search. Found {Occurrances} occurrances of {Found} in {Elapsed}ms. Searched {Lines} lines.",
    Occurrances: result.length,
    Found: term, 
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
  const result = (index && index[term]) 
    ? index[term].map(i => data[i])
    : data.filter(line => contains(line, term));
  return {
    message: "{Indexed}. Found {Occurrances} occurrances of {Found} in {Elapsed}ms. Searched {Lines} lines.",
    Occurrances: result.length,
    Found: term, 
    Result: result.slice(0,2),
    Lines: data.length,
    Indexed: index && index[term] ? "Indexed search" : "Full search"
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
  
*/
const build_full_index = (data) => {
  return data.reduce((p,c,i) => {
    const unique_words = _.uniq(c.split(/\W/).map(w => w.toLowerCase())).filter(s => s);
    for (const word of unique_words) {
      p = _.merge(p, { [word]: (p[word] || []).concat([i]) });
    }
    return p;
  }, {});
};

const cp_index = build_full_index(big_database);
time_and_log(
  find_lines_containing.bind(this, big_database, search_term)
);
time_and_log(
  find_lines_containing.bind(this, big_database, search_term, cp_index)
);









function contains(big_string, little_string) {
  return exp.test(big_string);
};

function time_and_log(f) {
  const start = process.hrtime();
  const result = f();
  const Elapsed = process.hrtime(start)[1]/1000000;
  const message = result.message;
  delete result.message;
  delete result.index;
  logger.info(message, _.assign(result, {Elapsed}));
}