var _ = (function () {

    return {
        first: first,
        curry: curry,
        pipe: pipe,
        throttle: throttle,
        debounce: debounce
    }

    function first (arr) {
        if (!arr) return null;
        return arr[0]
    }

    function curry (fn) {
        var arity = fn.length

        return function curryN () {
            var args = Array.prototype.slice.call(arguments, 0);

            if (args.length >= arity) {
            return fn.apply(null, args)
            } else {
            return function () {
                var args2 = Array.prototype.slice.call(arguments, 0);
                return curryN.apply(null, args.concat(args2)); 
            }
            }
        }
    }

    function pipe () {
        var fns = Array.prototype.slice.call(arguments, 0);
        return function (v) {
            return fns.reduce(function (acc, fn) {
                return fn(acc)
            }, v)        
        }
    }

    function throttle (fn, time) {
        var throttled = false;
        return function (evt) {
            if (!throttled) {
                throttled = true;
                fn(evt)
            }
            setTimeout(function() {
                throttled = false;
            }, time)
        }
    }

    function debounce (fn, time) {
        var timer;
        return function (evt) {
            clearTimeout(timer)
            setTimeout(function () {
                fn(evt)
            }, time)
        }
    }
})()

function activate (element, name) {
    var add = function () {
        element.classList.add(name)
    }
    var remove = _.debounce(function () {
        element.classList.remove(name)
    }, 200)
    return _.pipe(add, remove)
}

function active (element, name) {
    return {
        isOn: function () {
            return element.classList.contains(name)
        },
        on: function () {
            element.classList.add(name)
        },
        off: function () {
            element.classList.remove(name)
        }
    }
}