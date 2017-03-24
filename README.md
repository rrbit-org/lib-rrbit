# lib-rrbit
is a set core operations and helpers for use on 
Vectors(i.e Arrays) implementing a Relaxed-Radix-Balance technique from the
[2015 paper](https://pdfs.semanticscholar.org/b26a/3dc9050f54a37197ed44711c0e42063e9b96.pdf)


this library adopts a Bring-Your-Own base class style to easily allow 
seamless integrations across multiple environments.

If your looking for a immutable collection library, considering looking at our sister
project instead: [rrbit-js](http://github.com/rrbit-org/rrbit-js)






### Advantages
Every data structure has advantages and disadvantages depending on the use case.
RRB data structures offer several unique advantages:
+ **immutable**
every operations returns a new Vector
+ **structural sharing**
Vectors safely share internal data, minimizing memory usage. __Great for historical
use cases(e.g. undo/redo stacks)__
+ **efficient prepend AND appends**
Vectors apply changes to an internal local cache or "focus" before merging them 
into the trie. instead of using a "tail" or "head", we use a movable "focus"

__Great for queues__
+ **fast splitting**
slicing operations only require a trimming of indexes, no array copy required!
+ **fast concat**
appending operations can often be completed with only and index update,
requiring extremely little to no array copying


### Operations
rrbit only provides a few operations to perform on Vectors efficiently. All other
collection operations can be build from these: 

1. append - adds a single element
2. update - updates a single
3. take - keep first n elements, deleting everything after
4. drop - delete first n elements, keeping the rest
5. nth - get the element at given position
6. appendAll - join two RRB Vectors together efficiently


### Performance
RRB Vectors are able to keep up with or outperform their mutable Array
counterparts on almost all operations accept append. With a suitable 
Builder class or helper to convert from your favorite collection type, even 
this limitation can be solved


##### append/push comparisons with other frameworks

|framework                                 | ops per sec     |     type    |
|------------------------------------------|----------------:|:-----------:|
|immutable-js append 1k                    |    1815.33 op/s | push/append |
|mori vector append 1k                     |    4395.11 op/s | push/append |
|rrbit 1k                                  |    3407.20 op/s | push/append |
|rrbit 1k (Builder mode)                   |   19410.27 op/s | push/append |
|native push 1k mutating(max possible)     |  203927.41 op/s | push/append |
|--------------------------------------------------------------------------|
|mori iteration speed                      |    18052.66 op/s| for of loop |
|immutable-js iteration speed              |    18811.21 op/s| for of loop |
|rrbit iteration speed                     |    33367.63 op/s| for of loop |
|native array iteration speed              |    17023.14 op/s| for of loop |
|native forEach speed                      |    79403.02 op/s|     forEach |
|rrbit iteration speed                     |   631643.88 op/s|      reduce |
|--------------------------------------------------------------------------|
