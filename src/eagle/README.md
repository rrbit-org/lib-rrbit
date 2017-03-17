# Eagle

Based on the [2015 Paper](https://pdfs.semanticscholar.org/b26a/3dc9050f54a37197ed44711c0e42063e9b96.pdf). 

### focus 
The Eagle branch utilizes a movable 'focus' for fast appends at head, tail or anyhwere else.

### transience
Further on the 'focus' optimization, the current focus leaf can be 
detached from the tree while in 'transient' mode, mitigating the 
need for a path update (update all parent trees) until the focused
branch is full or focus has moved