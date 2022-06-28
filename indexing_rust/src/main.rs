use std::collections::BTreeMap;
use regex::Regex;

fn main() {
    let bible = include_str!("../data/bible.txt");
    // let excerpt = "1:33 And I knew him not: but he that sent me to baptize with water,\n the same said unto me, Upon whom thou shalt see the Spirit descending,\n and remaining on him, the same is he which baptizeth with the Holy\n Ghost.";

    println!("Search for {} in bible found {:?}", "him", find_lines_containing(bible, "him").len());

    println!("{:?}", find_lines_using_index(bible, build_index_for(bible, "him")));
}

fn find_lines_containing<'a>(data: &'a str, term: &str) -> Vec<&'a str> {
    let word_finder: Regex = Regex::new(&*format!(r"(?i)^.*\b{}\b.*$$", term)).unwrap();
    data.lines().filter(|line| word_finder.is_match(line)).collect::<Vec<&str>>()
}

fn find_lines_using_index<'a>(data: &'a str, index: Vec<usize>) -> Vec<&'a str> {
    let lines: Vec<&str> = data.lines().collect();
    index.iter().map(|i| lines[*i]).collect::<Vec<&'a str>>()
}

fn build_index_for(data: &str, term: &str) -> Vec<usize> {
    let word_finder: Regex = Regex::new(&*format!(r"(?i)^.*\b{}\b.*$$", term)).unwrap();
    let mut index: Vec<usize> = vec![];
    let mut i: usize = 0;
    for line in data.lines() {
        if word_finder.is_match(line) {
            index.push(i);
        }
        i += 1;
    }
    index
}

fn build_btree_index_for(data: &str) -> BTreeMap<String, Vec<usize>> {
    let splitter: Regex = Regex::new(r"\W").unwrap();
    let mut index: BTreeMap<String, Vec<usize>> = BTreeMap::new();
    let mut i: usize = 0;
    for line in data.lines() {
        let words: Vec<&str> = splitter.split(line).collect();
        for word in words {
            match index.get_mut(word) {
                Some(lines) => { lines.push(i); },
                None => { index.insert((*word).to_owned(), vec![i]); }
            };
        }
        i += 1;
    }
    index
}

#[cfg(test)]
mod tests {
    use super::{*};

    #[test]
    pub fn scan_bible() {
        let bible = include_str!("../data/bible.txt");
        let lines_containing_him = find_lines_containing(bible, "him");
        assert_eq!(lines_containing_him.len(), 5967);
    }

    #[test]
    pub fn build_index() {
        let bible = include_str!("../data/bible.txt");
        let bible_index_him = build_index_for(bible, "him");
        assert_eq!(bible_index_him.len(), 5967);
    }

    #[test]
    pub fn build_btree_index() {
        let bible = include_str!("../data/bible.txt");
        let bible_index = build_btree_index_for(bible);
        assert_eq!(bible_index.len(), 14169);
        let lines_with_him = bible_index.get("him").unwrap();
        assert_eq!(lines_with_him.len(), 6649);
    }

    #[test]
    pub fn search_with_index() {
        let bible = include_str!("../data/bible.txt");
        let lines_containing_him = find_lines_using_index(bible, build_index_for(bible, "him"));
        assert_eq!(lines_containing_him.len(), 5967);
    }
}