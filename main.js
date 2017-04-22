window.addEventListener('load', function () {
    var rockn = rockNroll()
    var played = false;

    var button = document.getElementById('restart')
    button.setStatus = function (status) {
        button.textContent = text();
        function text () {
            switch (status) {
                case 0: return 'Freestyle';
                case 1: return 'Stop';
                case 2: return 'Stopping';
            }
        }
    }
    button.addEventListener('click', throttle(restart(), 300))

    function start () {
        if (played) return
        played = true;

        rockn
        .then(play(DRUMS))
        .log('Rock On 🎸')
        .err('Rock Off 🔕')
    }

    function restart () {
        var playing = false;

        function start () {
            if (playing) {
                button.setStatus(1);
                return rockn
                .then(play(DRUMS))
                .then(start)
            } else {
                button.setStatus(0);
            }
        }

        function stop () {
            button.setStatus(2);
        }

        return function toggle () {
            playing = !playing
            if (playing) start()
            else stop()
        }
    }
})

var FILES = [
    'sounds/kick.wav',
    'sounds/snare.wav',
    'sounds/hihat.wav'
].map(function (n) {
    return location.href + n
})

var DRUMS = {
    startTime: 1 / 4,
    eighthNoteTime: 1 / 4,
    bars: [{
        0: [0,4],
        1: [2,6],
        2: [0,1,2,3,4,5,6,7]
    }]
}

function rockNroll () {
    var context = audioContext()
    var sounds = loadSounds(FILES)

    return context
    .then(decodeSounds(sounds))
    .app(sources, context)
    .then(addDrums())
}

function addDrums () {
    var kit = document.getElementById('kit')
    var onkey = keystroke()

    return function (instruments) {
        return instruments
        .map(createPad)
        .map(function (pad, i) {
            onkey(i, pad.hit)
            kit.appendChild(pad)
            return instruments[i](pad)
        })
    }
}

function createPad (instrument) {
    var pad = document.createElement('div')
    var throttled = throttle(hit, 200)
    pad.classList.add('pad')
    pad.activate = activatePad(pad)
    pad.addEventListener('mousedown', throttled)
    pad.addEventListener('touchstart', throttled)
    pad.hit = hit

    function hit () {
        instrument(pad, 0)
    }

    return pad
}

function activatePad (pad) {
    var add = function () {
        pad.classList.add('active')
    }
    var remove = debounce(function () {
        pad.classList.remove('active')
    }, 200)
    return pipe(add, remove)
}

function audioContext () {
    return Promise.try(function () {
        window.AudioContext = window.AudioContext || window.webkitAudioContext
        return new AudioContext()
    })
};

var decodeSounds = curry(function setupBand (sounds, context) {
    return sounds.then(decodeAll(context))
})

function loadSounds (files) {
    return Promise.all(files.map(loadSound));
}

function loadSound (url) {
    return new Promise((res, rej) => {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.onload = function () {
            res(request.response);
        };
        request.onerror = rej;
        request.send();
    })
}

var decodeAll = curry(function decodeSounds (context, buffers) {
    return Promise.all(buffers.map(decode(context)));
})

var decode = curry(function decodeSound (context, buffer) {
    return new Promise((res, rej) => {
        context.decodeAudioData(buffer, res, rej)
    })
})

var sources = curry(function (context, buffers) {
    return buffers.map(function (buffer) {
        return source(context, buffer)
    })
})

var source = curry(function createSource (context, buffer, tab, time) {
    var source = context.createBufferSource()
    source.buffer = buffer
    source.connect(context.destination)
    return new Promise((res, rej) => {
        setTimeout(function() {
            tab && tab.activate()
            source.start(0)
            res()
        }, time * 1000)
    })
})

var play = curry(function playSong (music, instruments) {
    var startTime = music.startTime || 0;
    var eighthNoteTime = music.eighthNoteTime || 1 / 2;
    var bars = music.bars || [];

    return Promise.flattenAll(bars.map(function (bar, i) {
        var noteTime = note(eighthNoteTime, startTime + i * 8 * eighthNoteTime);

        return Object.keys(bar)
        .map(function (i) {
            return bar[i]
            .map(noteTime)
            .map(instruments[i])
        })
    }))
})

var note = curry(function noteTiming (eighth, time, i) {
    return time + i * eighth
})

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

    function flatMap (arr) {
        return arr.reduce(function (p, c) {
            if (Array.isArray(c)) {
                return p.concat(flatMap(c))
            }
            return p.concat(c)
        }, [])
    }

    return Promise.all(flatMap(nested).map(function (v) {
        return Promise.resolve(v)
    }))
}

Array.prototype.do = function (fn) {
    return this.map(function (v, i, arr) {
        fn(v, i, arr);
        return v;
    })
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

function debounce (fn, time) {
    var timer;
    return function () {
        clearTimeout(timer)
        setTimeout(fn, time)
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
    return function () {
        if (!throttled) {
            throttled = true;
            fn()
        }
        setTimeout(function() {
            throttled = false;
        }, time)
    }
}

function keystroke (l) {
    l = l || {}

    document.addEventListener('keydown', function (evt) {
        if (typeof l[evt.which] === 'function') {
            l[evt.which]()
        }
    })

    return function (key, fn) {
        l[KEYCODES[key]] = fn;
    }
}

var KEYCODES = {
    0: 65, //a
    1: 83, //s
    2: 68, //d
    3: 70, //f
}
