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
  const timing = process.hrtime(start);
  const message = result.message;
  delete result.message;
  logger.info(message, result);
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
  const result = (index) 
    ? index.map(i => data[i])
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

const build_index_for = (term) => {
  return big_database.reduce((p, c, i) => {
    return contains(c, term) ? p.concat([i]) : p;
  }, []);
};

const term_index = build_index_for(search_term);

time_and_log(
  find_lines_containing.bind(this, big_database, search_term, term_index)
);



function contains(big_string, little_string) {
  const exp = new RegExp(`^.*\\b${little_string}\\b.*`, 'i');
  return exp.test(big_string);
};