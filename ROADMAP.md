

* Basic operations
    * [ ] update(e.g. set) operation
        * [ ] passes all tests
        * [ ] performance pass
    * [x] ~~nth(e.g. get) operation~~
        * [x] passes all tests
        * [ ] performance pass - 50%
    * [x] ~~append(e.g. push) operation~~
        * [x] passes all tests
        * [ ] performance pass - 80%
    * [x] ~~appendAll(e.g. concat) operation~~
        * [x] passes all tests
        * [ ] performance pass
    * [ ] prepend(e.g. unshift) operation
        * [ ] passes all tests
        * [ ] performance pass
    * [x] ~~drop operation~~
        * [x] passes all tests
        * [ ] performance pass
    * [x] ~~take operation~~
        * [x] passes all tests
        * [ ] performance pass
    * [x] ~~iterator~~
        * [x] passes all tests
        * [x] performance pass
    * [x] ~~reverse iterator~~
        * [x] passes all tests
        * [x] performance pass
    
* Performance
    * [x] implement movable 'focus' from 2015 paper(fast prepend or mid array updates)
    * [x] focus 'transience' (deferred 'path' updates to only update tree every 32nd append)
    * [ ] focus 'occulance' (shared focus w/ end index lensing allowing faster mutable appends)
    * [x] remove closures
    * [x] switch statements instead of loops where possible
    * [x] inline happy paths
        * [x] append: 90%
        * [ ] prepend: 0%
        * [ ] appendAll: 0%
        * [ ] take: 0%
        * [ ] drop: 0%
        * [ ] update: 0%
    * [x] shared iterable conveyance(reducing object creation every loop's next()... )
    * [x] inlined 'reduce' iteration
    * [x] inlined short-circuitable(e.g. find) iteration
    
    
* Documention
    * [ ] public api
    * [ ] examples
    * [ ] contrib guide