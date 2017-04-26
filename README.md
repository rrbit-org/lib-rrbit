# lib-rrbit
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
is a set core operations and helpers for use on 
Vectors(i.e Arrays) implementing a Relaxed-Radix-Balance technique from the
[2015 paper](https://pdfs.semanticscholar.org/b26a/3dc9050f54a37197ed44711c0e42063e9b96.pdf)


this library adopts a Bring-Your-Own base factory(class) to easily allow 
seamless integrations across multiple environments.

If your looking for a immutable collection implementation, considering looking at our sister
project instead: [rrbit-js](http://github.com/rrbit-org/rrbit-js)


## About
lib-rrbit aims to ease your transition to immutable collections, by letting you decide
the API for you needs, while handling all the bit-fiddling and dark magic of persistence 
algorithms behind the scenes. A typical well rounded List class can be quickly put together
in less than 300 LOC, while adding around 10k(unminified) to your project.

Want your List's to return Optionals or Maybes instead of nulls? try it!

Need a List API that mimic's your your platform's (e.g. Java's ArrayList or Elm's Array), knock it out
in an afternoon!

This project hope to bring more options to JS that help make it easy to focus on 
business logic and worry less about shared mutable state




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
counterparts on almost all operations save append. With a suitable 
Builder class or helper to convert from your favorite collection type, even 
this limitation can be mitigated


##### comparisons with other frameworks

|framework                                 | ops per sec     |     type    |
|------------------------------------------|----------------:|:-----------:|
|native push 1k immutable with es6 spread  |     335.75 op/s | push/append |
|immutable-js append 1k                    |    1815.33 op/s | push/append |
|mori vector append 1k                     |    4395.11 op/s | push/append |
|rrbit 1k                                  |    3407.20 op/s | push/append |
|rrbit 1k (Occulance enabled)              |    8012.65 op/s | push/append |
|rrbit 1k (Builder mode)                   |   19410.27 op/s | push/append |
|rrbit 1k (Cassowry: Occulance enabled)    |   22929.65 op/s | push/append |
|rrbit 1k (Cassowry: Builder mode)         |   69948.84 op/s | push/append |
|native mutating push 1k(max possible)     |  203927.41 op/s | push/append |
|--------------------------------------------------------------------------|
|mori iteration speed                      |    18052.66 op/s| for of loop |
|immutable-js iteration speed              |    18811.21 op/s| for of loop |
|rrbit iteration speed                     |    33367.63 op/s| for of loop |
|native array iteration speed              |    17023.14 op/s| for of loop |
|native forEach speed                      |    79403.02 op/s|     forEach |
|rrbit reduce                              |    63164.88 op/s|      reduce |
|lodash v4 forEach                         |    73609.82 op/s|     forEach |
|native for loop                           |  1203400.09 op/s|         for |
|rrbit cassowry reduce speed               |  1751116.63 op/s|      reduce |
|--------------------------------------------------------------------------|
|native push 1k immutable with es6 spread  |      352.55 op/s| unshift/prepend |
|immutable-js unshift 1k                   |      947.95 op/s| unshift/prepend |
|mori prepend 1k                           |     2598.45 op/s| unshift/prepend |
|native mutating unshift 1k                |     8237.15 op/s| unshift/prepend |
|rrbit (Cassowry: prepend) 1k              |    17420.03 op/s| unshift/prepend |
|--------------------------------------------------------------------------|
|native slice half                         |    28064.72 op/s | take/slice |
|rrbit take                                |  1361882.81 op/s | take/slice |
|immutable-js take half                    |  2100578.67 op/s | take/slice |
|mori take half                            |  2396771.15 op/s | take/slice |
|rrbit (Cassowry) take                     |  3260573.92 op/s | take/slice |
|--------------------------------------------------------------------------|
|native slice 25%                          |   890715.24 op/s | drop/slice |
|immutable-js drop 25%                     |  1065168.44 op/s | drop/slice |
|rrbit (Cassowry) drop 25%                 |  1710561.14 op/s | drop/slice |
|mori drop    25%                          |  1970101.65 op/s | drop/slice |
