var Samples = [
    'clap-analog.wav',
    'clap-808.wav',
    'clap-crushed.wav',
    'clap-fat.wav',
    'clap-slapper.wav',
    'clap-tape.wav',
    'cowbell-808.wav',
    'crash-808.wav',
    'crash-acoustic.wav',
    'crash-noise.wav',
    'crash-tape.wav',
    'hihat-808.wav',
    'hihat-acoustic01.wav',
    'hihat-acoustic02.wav',
    'hihat-analog.wav',
    'hihat-digital.wav',
    'hihat-dist01.wav',
    'hihat-dist02.wav',
    'hihat-electro.wav',
    'hihat-plain.wav',
    'hihat-reso.wav',
    'hihat-ring.wav',
    'kick-808.wav',
    'kick-acoustic01.wav',
    'kick-acoustic02.wav',
    'kick-big.wav',
    'kick-classic.wav',
    'kick-cultivator.wav',
    'kick-deep.wav',
    'kick-dry.wav',
    'kick-electro01.wav',
    'kick-electro02.wav',
    'kick-floppy.wav',
    'kick-gritty.wav',
    'kick-heavy.wav',
    'kick-newwave.wav',
    'kick-oldschool.wav',
    'kick-plain.wav',
    'kick-slapback.wav',
    'kick-softy.wav',
    'kick-stomp.wav',
    'kick-tape.wav',
    'kick-thump.wav',
    'kick-tight.wav',
    'kick-tron.wav',
    'kick-vinyl01.wav',
    'kick-vinyl02.wav',
    'kick-zapper.wav',
    'openhat-808.wav',
    'openhat-acoustic01.wav',
    'openhat-analog.wav',
    'openhat-slick.wav',
    'openhat-tight.wav',
    'perc-808.wav',
    'perc-chirpy.wav',
    'perc-hollow.wav',
    'perc-laser.wav',
    'perc-metal.wav',
    'perc-nasty.wav',
    'perc-short.wav',
    'perc-tambo.wav',
    'perc-tribal.wav',
    'perc-weirdo.wav',
    'ride-acoustic01.wav',
    'ride-acoustic02.wav',
    'shaker-analog.wav',
    'shaker-shuffle.wav',
    'shaker-suckup.wav',
    'snare-808.wav',
    'snare-acoustic01.wav',
    'snare-acoustic02.wav',
    'snare-analog.wav',
    'snare-big.wav',
    'snare-block.wav',
    'snare-brute.wav',
    'snare-dist01.wav',
    'snare-dist02.wav',
    'snare-dist03.wav',
    'snare-electro.wav',
    'snare-lofi01.wav',
    'snare-lofi02.wav',
    'snare-modular.wav',
    'snare-noise.wav',
    'snare-pinch.wav',
    'snare-punch.wav',
    'snare-smasher.wav',
    'snare-sumo.wav',
    'snare-tape.wav',
    'snare-vinyl01.wav',
    'snare-vinyl02.wav',
    'tom-808.wav',
    'tom-acoustic01.wav',
    'tom-acoustic02.wav',
    'tom-analog.wav',
    'tom-chiptune.wav',
    'tom-fm.wav',
    'tom-lofi.wav',
    'tom-rototom.wav',
    'tom-short.wav'
]

function samplesDisplay () {
    return '<h1>Samples</h1><ul>'+Samples.map(function (s) {
        return '<li sound="'+s+'">'+
                s.replace('.wav','')+
            '</li>'
    }).join('')+'</ul>'
}

function samplesPrompt () {
    var changed, added, preview, selected = {}
    var modal = document.createElement('div')
    var modalDisplay = active(modal, 'active')
    modal.classList.add('dialog')
    document.body.appendChild(modal)
    modal.innerHTML = samplesDisplay()
    modal.addEventListener('click', function (evt) {
        evt.stopPropagation()
        var sound = evt.target.getAttribute('sound')
        if (!sound) return
        selected[sound] = true
        modalDisplay.off()
        changed && changed(selected)
        added && added(sound)
    });
    
    [].slice.call(modal.querySelectorAll('li'), 0)
    .map(function (li) {
        li.addEventListener('mouseenter', function () {
            if (!preview) return
            preview(li.getAttribute('sound'))
        })
    })

    return {
        selected: function () {
            return selected;
        },
        onChange: function (fn) {
            if (typeof fn === 'function') changed = fn
        },
        onAdded: function (fn) {
            if (typeof fn === 'function') added = fn
        },
        onPreview: function (fn) {
            if (typeof fn === 'function') preview = fn
        },
        open: modalDisplay.on,
        close: modalDisplay.off
    }
}