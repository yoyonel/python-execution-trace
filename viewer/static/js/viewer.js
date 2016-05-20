var codemirror = null;
var runStates = null;
var stateIdx = -1;
var runIdx = -1;
var varStateTemplate = Handlebars.compile($("#var-state-template").html());


function initSourceViewer() {
    codemirror = CodeMirror.fromTextArea(document.getElementById('source-viewer'), {
        mode: "python",
        theme: "default",
        lineNumbers: true,
        readOnly: 'nocursor',
        styleActiveLine: true
    });
}

function initStateViewer() {
    stateIdx = 0;
    runIdx = 0;
}

function getCurrentRunStates() {
    return runStates[runIdx].data;
}

function renderState() {
    var currentRunStates = getCurrentRunStates();
    var currentState = currentRunStates[stateIdx].state;
    // Off by 1 because of how Python counts lines.
    var lineno = currentRunStates[stateIdx].lineno - 1;

    $('.state-viewer').empty();

    var vars = Object.keys(currentState);
    vars.sort();

    for (i = 0; i < vars.length; i++) {
        var value = formatStateValue(currentState[vars[i]])
        var html = varStateTemplate({
                               name: vars[i],
                               value: value
                           });
        $('.state-viewer').append(html);
    }

    highlightLine(lineno);
}

function highlightLine(lineno) {
    codemirror.setCursor({line: lineno});
}

function nextStep() {
    var aux = stateIdx + 1;

    if (aux >= getCurrentRunStates().length) {
        return;
    }

    stateIdx = aux;
    renderState();
}

function prevStep() {
    var aux = stateIdx - 1;

    if (aux < 0) {
        return;
    }

    stateIdx = aux;
    renderState();
}

function keyHandler(event) {
    if (event.code == "ArrowUp") {
        prevStep();
        return;
    }
    if (event.code == "ArrowDown") {
        nextStep();
        return
    }
}

function formatStateValue(value) {
    // remove leading and ending `"`, if any.
    if (value[0] == '"' && value[value.length - 1]) {
        return value.slice(1, value.length - 1);
    }
    return value;
}


document.onkeydown = keyHandler;

$.getJSON("source.json", function(data) {
    $('#source-viewer').text(data.source);

    $.getJSON("state.json", function(data) {
        runStates = data.data;

        initStateViewer();
        initSourceViewer();

        renderState();
    });
});