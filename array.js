Array.prototype.do = function (fn) {
    return this.map(function (v, i, arr) {
        fn(v, i, arr)
        return v
    })
}

Array.prototype.flatMap = function (fn) {
    return flatten(this).map(fn)
}

function flatten (arr) {
    return arr.reduce(function (p, c) {
        if (Array.isArray(c)) {
            return p.concat(flatten(c))
        }
        return p.concat(c)
    }, [])
}