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

    mod indexing {
        use regex::Regex;
        use std::collections::BTreeMap;

        pub fn build_btree_index_for(data: &Vec<String>) -> BTreeMap<String, Vec<usize>> {
            let splitter: Regex = Regex::new(r"\W").unwrap();
            let mut index: BTreeMap<String, Vec<usize>> = BTreeMap::new();
            let mut i: usize = 0;
            for line in data {
                let words: Vec<&str> = splitter.split(line).collect();
                for word in words {
                    match index.get_mut(&word.to_lowercase()) {
                        Some(lines) => { lines.push(i); },
                        None => { index.insert((*word).to_lowercase(), vec![i]); }
                    };
                }
                i += 1;
            }
            index
        }
    }
}

#[cfg(test)]
mod tests {
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