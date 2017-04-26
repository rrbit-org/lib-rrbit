

* Basic operations
    * [x] ~~update(e.g. set) operation~~
        * [x] passes all tests
        * [x] performance pass
    * [x] ~~nth(e.g. get) operation~~
        * [x] passes all tests
        * [x] performance pass
    * [x] ~~append(e.g. push) operation~~
        * [x] passes all tests
        * [x] performance pass
    * [x] ~~appendAll(e.g. concat) operation~~
        * [x] passes all tests
        * [x] performance pass
    * [ ] prepend(e.g. unshift) operation
        * [ ] passes all tests
        * [ ] performance pass
    * [] ~~drop operation~~
        * [] passes all tests
        * [ ] performance pass
    * [x] ~~take operation~~
        * [x] passes all tests
        * [ ] performance pass
    * [ ] reduce
            * [ ] passes all tests
            * [ ] performance pass
    * [ ] reduceRight
            * [ ] passes all tests
            * [ ] performance pass
    * [ ] iterator
        * [ ] passes all tests
        * [ ] performance pass
    * [ ] reverse iterator
        * [ ] passes all tests
        * [ ] performance pass
    
* Performance
    * [x] implement fast append 'tail'
    * [x] implement fast prepend 'head'
    * [x] focus 'transience' (deferred 'path' updates to only update tree every 32nd append)
    * [x] focus 'occulance' (shared focus w/ end index lensing allowing faster mutable appends)
    * [x] remove closures
    * [x] switch statements instead of loops where possible
    * [x] inline happy paths
        * [x] append: 90%
        * [x] prepend: 0%
        * [x] appendAll: 0%
        * [x] take: 0%
        * [ ] drop: 0%
        * [x] update: 0%
    * [x] shared iterable conveyance(reducing object creation every loop's next()... )
    * [ ] inlined 'reduce' iteration
    * [ ] inlined short-circuitable(e.g. find) iteration
    
    
* Documention
    * [ ] public api
    * [ ] examples
    * [ ] contrib guide