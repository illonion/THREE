function registerSocketEventLoggers(socket) {
    socket.onopen = () => { console.log('Successfully Connected'); };
    socket.onclose = event => { console.log('Socket Closed Connection: ', event); socket.send('Client Closed!'); };
    socket.onerror = error => { console.log('Socket Error: ', error); };
}

function createTosuWsSocket(path = "/ws") {
    let socket = new ReconnectingWebSocket('ws://' + location.host + path);
    registerSocketEventLoggers(socket);
    return socket;
}

const delay = async time => new Promise(resolve => setTimeout(resolve, time));

// Get Cookie
function getCookie(cname) {
    let name = cname + "="
    let ca = document.cookie.split(';')
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) == ' ') c = c.substring(1)
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function displayTimeMs(element, time) {
    const totalSeconds = Math.round(time / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    element.innerText = `${minutes}:${seconds.toString().padStart(2, '0')}`
}