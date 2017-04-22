Promise.prototype.log = function (l) {
    return this.then(function (v) {
        console.log(l, v)
        return v
    })
}

Promise.prototype.val = function (v) {
    return this.then(function () {
        return v;
    })
}

Promise.prototype.err = function (l) {
    return this.catch(function (v) {
        console.log(l, v);
    })
}

Promise.prototype.app = function () {
    var fn = arguments[0]
    var qs = Array.prototype.slice.call(arguments, 1);
    return this.then(function (v) {
        return Promise.all(qs)
        .then(function (vs) {
            return fn.apply(null, vs.concat([v]))
        })
    })
}

Promise.flattenAll = function (nested) {
    return Promise.all(nested.flatMap(function (v) {
        return Promise.resolve(v)
    }))
}


Promise.try = function (fn) {
    return new Promise((res, rej) => {
        try {
            res(fn())
        } catch (err) {
            rej(err)
        }
    })
}