window.addEventListener('load', function () {
    var drums = addDrums()
    var rockn = rockNroll().then(drums)
    var samples = samplesPrompt()
    var played = false

    var button = document.getElementById('restart')
    button.setStatus = function (status) {
        button.disabled = false;
        button.textContent = text();
        function text () {
            switch (status) {
                case 0: return 'Freestyle';
                case 1: return 'Stop';
                default:
                    button.disabled = true;
                    return 'Stopping...';
            }
        }
    }

    button.addEventListener('click', restart())

    var addDrumButton = document.getElementById('add')
    addDrumButton.addEventListener('click', samples.open)
    samples.onAdded(function (selected) {
        rockNroll([addLocation('Samples/' + selected)])
        .then(drums)
    })
    samples.onPreview(function (selected) {
        rockNroll([addLocation('Samples/' + selected)])
        .then(function (instruments) {
            instruments.map(function (instrument) {
                instrument(null, 0)
            })
        })
    })

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
].map(addLocation)

function addLocation (n) {
    return location.href + n
}

var DRUMS = {
    startTime: 1 / 4,
    eighthNoteTime: 1 / 4,
    bars: [{
        0: [0,4],
        1: [2,6],
        2: [0,1,2,3,4,5,6,7]
    }]
}

var maincontext = audioContext()
function rockNroll (files) {
    var sounds = loadSounds(files || FILES)

    return maincontext
    .then(decodeSounds(sounds))
    .app(sources, maincontext)
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
    pad.classList.add('pad')
    pad.activate = activate(pad, 'active')
    pad.addEventListener('mousedown', hit)
    pad.addEventListener('touchstart', hit)
    pad.hit = hit

    function hit (evt) {
        evt && evt.preventDefault()
        instrument(pad, 0)
    }

    return pad
}

function audioContext () {
    return Promise.try(function () {
        window.AudioContext = window.AudioContext || window.webkitAudioContext
        return new AudioContext()
    })
};

var decodeSounds = _.curry(function setupBand (sounds, context) {
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

var decodeAll = _.curry(function decodeSounds (context, buffers) {
    return Promise.all(buffers.map(decode(context)));
})

var decode = _.curry(function decodeSound (context, buffer) {
    return new Promise((res, rej) => {
        context.decodeAudioData(buffer, res, rej)
    })
})

var sources = _.curry(function (context, buffers) {
    return buffers.map(function (buffer) {
        return source(context, buffer)
    })
})

var source = _.curry(function createSource (context, buffer, tab, time) {
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

var play = _.curry(function playSong (music, instruments) {
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

var note = _.curry(function noteTiming (eighth, time, i) {
    return time + i * eighth
})

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
