fn main() {
    let bible = include_str!("../data/bible.txt");
    let source = search::Source::new(bible.to_owned());
}

mod search {
    use std::collections::BTreeMap;

    type TextIndex = BTreeMap<String, Vec<usize>>;

    pub struct Source {
        lines: Vec<String>,
        index: TextIndex,
    }
    impl Source {
        pub fn new(text: String) -> Self {
            let lines: Vec<String> = text.lines().map(|l| l.to_lowercase()).collect();
            Source {
                index: indexing::build_btree_index_for(&lines),
                lines,
            }
        }

        pub fn search(&self, term: &str) -> Vec<String> {
            match self.index.get(&term.to_lowercase()) {
                Some(line_numbers) => line_numbers
                    .into_iter()
                    .map(|n| self.lines.get(*n))
                    .filter_map(|x| x)
                    .map(|s| s.clone()).collect::<Vec<String>>(),
                None => vec![]
            }
        }
    }

    pub mod indexing {
        use regex::Regex;
        use std::collections::BTreeMap;
        use std::slice::Chunks;
        use rayon::prelude::*;

        type Line = Vec<String>;
        type Chunk = Vec<Line>;

        pub fn tokenize(lines: &Vec<String>) -> Vec<Chunk> {
            let splitter: Regex = Regex::new(r"\W").unwrap();
            let tokenized: Vec<Line> = lines.iter()
                .map(|line|
                    splitter.split(line).map(|s| s.to_owned()).collect())
                .collect();

            let chunks_of_lines = lines.chunks(lines.len()/32);
            chunks_of_lines.into_iter().map(|s| {
                s.iter()
                    .map(|line|
                        splitter.split(line).map(|s| s.to_owned()).collect())
                    .collect()
            }).collect()
        }

        pub fn build_btree_index_for(data: &Vec<String>) -> BTreeMap<String, Vec<usize>> {
            let tokens = tokenize(data);

            let mut indexes: Vec<BTreeMap<String, Vec<usize>>> = tokens.par_iter().map(|chunk| {
                let mut index: BTreeMap<String, Vec<usize>> = BTreeMap::new();
                let mut i: usize = 0;
                for line in chunk {
                    for word in line {
                        match index.get_mut(&word.to_lowercase()) {
                            Some(lines) => { lines.push(i); },
                            None => { index.insert((*word).to_lowercase(), vec![i]); }
                        };
                    }
                    i += 1;
                }
                index
            }).collect();
            if indexes.is_empty() {
                BTreeMap::new()
            } else {
                let mut last = indexes.pop().unwrap();
                while !indexes.is_empty() {
                    last.extend(indexes.pop().unwrap());
                }
                last
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::search;

    #[test]
    pub fn tokenize() {
        let bible = include_str!("../data/bible.txt");
        let lines: Vec<String> = bible.lines().map(|l| l.to_lowercase()).collect();
        let tokenized = search::indexing::tokenize(&lines);
    }

    #[test]
    pub fn chunky() {
        let i = (0..25).collect::<Vec<_>>();

        for chunk in i.chunks(10) {
            println!("{:02?}", chunk);
        }
        let bible = include_str!("../data/bible.txt");
        let lines: Vec<String> = bible.lines().map(|l| l.to_lowercase()).collect();
        for chunk in lines.chunks(5).take(2) {
            println!("{:?}\n\n", chunk);
        }
    }

    #[test]
    pub fn index_works() {
        let bible = include_str!("../data/bible.txt");
        let source = crate::search::Source::new(bible.to_owned());

        let lines_with_him = source.search("Him");
        for line in lines_with_him {
            assert!(line.contains("him"), "Did not find 'Him' in {}", line);
        }
    }
}