'use strict';
const uWS = require('uWebSockets.js');
const abconv = require('arraybuffer-to-string');
const axios = require('axios')
const five = require('johnny-five');
const { Servo } = require('johnny-five');
const myBoard = new five.Board({ port: 'COM4' });
const delay = ms => new Promise(res => setTimeout(res, ms));

const websocketURL = ''; // Websocket URL (example: wss://websocketurl/ws)
const port = 3000; // Port
const discordWebhook = '' // Discord Webhook URL (optional)

function getTimeStamp() {
    let date = new Date();
    let year = date.getFullYear();
    let month0 = date.getMonth();
    let month1 = month0 + 1;
    let day = date.getDate();
    let timeLocal = date.toLocaleTimeString();
    return 'TIME: ' + timeLocal + ' • DATE: ' + month1 + '/' + day + '/' + year;
}

function sendWebook() {
    let embed = [
        {
            title: '[Gate Opened] - ' + getTimeStamp(),
        }
    ];

    let data = JSON.stringify({ embeds: embed });

    var config = {
        method: 'POST',
        url: discordWebhook,
        headers: { 'Content-Type': 'application/json' },
        data: data,
    };

    axios(config)
        .catch((error) => {
            console.log(error);
            return error;
        });
}

myBoard.on('ready', function () {
    const app = uWS.App().ws('/ws', {
        compression: 0,
        maxPayloadLength: 16 * 1024 * 1024,
        idleTimeout: 60,
        message: (ws, data) => {
            let msg = abconv(data);
            if (msg == 'open') {
                async function openGate() {
                    await console.log('Opening gate...');
                    const servo = new Servo(8);
                    await servo.to(15);
                    await delay(1500);
                    await servo.to(80);
                }
                openGate();
                if (discordWebhook != '') {
                    sendWebook();
                }
            }
        }
    }).any('/*', (res, req) => {
        res.end(`
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <title>Gate Opener</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.2/css/all.css" integrity="sha384-oS3vJWv+0UjzBfQzYUhtDYW+Pj2yciDJxpsK1OYPAYjqT085Qq/1cq5FLXAZQ7Ay" crossorigin="anonymous">
                <link href="https://fonts.googleapis.com/css?family=Open+Sans+Condensed:300,700" rel="stylesheet">
                <style type="text/css">
                    body{
                        display: flex;
                        height: 75vh;
                        justify-content: center;
                        align-items: center;
                        background-color: #1F639C;
                        background-image: url() no-repeat;
                        font-family: Open Sans, sans-serif;
                    }
                    .button{
                        display: inline-block;
                        width: 350px;
                        height: 100px;
                        border: 2px solid #fff;
                        color: #fff;
                        font-size: 20px;
                        font-weight: bold;
                        text-transform: uppercase;
                        text-align: center;
                        text-decoration: none;
                        line-height: 50px;
                        box-sizing: border-box;
                        border-radius: 25px;
                        background-color: transparent;
                        outline: none;
                        transition: all ease 0.1s;
                    }
                    .active{
                        font-size: 0;
                        width: 100px;
                        height: 100px;
                        border-radius: 50%;
                        border-bottom-color: transparent;
                        border-left-color: transparent;
                        border-right-color: transparent;
                        animation: rotate 1s ease 0.1s infinite;
                    }
                    @keyframes rotate{
                        from {
                            transform: rotate(0turn);
                        }
                        to {
                            transform: rotate(1turn);
                        }
                    }
                    .footer{
                        text-align: center;
                        color: #fff;
                        position: absolute;
                        bottom: 0;
                        width: 100%;
                        height: 2.5rem;
                        font-size: 10px;
                    }
                    .hr{
                        color: #fff;
                        width: 200px;
                        height: .005px;
                    }
                </style>
            </head>
            <body>
                <button class="button">Press to open gate</button>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
                <script type="text/javascript">
                    $(document).ready(function() {
                        $(".button").click(function() {
                            websocketMessage();
                            $(this).addClass("active");
                            setTimeout(function() {
                                $(".button").removeClass("active");
                            }, 3000);
                        });
                    });
                    function websocketMessage() {
                        if ("WebSocket" in window) {
                            let ws = new WebSocket("${websocketURL}");
                            ws.onopen = function() {
                                ws.send("open");
                            }
                        }
                    }
                </script>
                <footer class="footer">
                    <hr class="hr">
                    <p>Developed by: kpabellan</p>
                </footer>
            </body>
        </html>
        `);
    }).listen(port, token => {
        token ? console.log(`Listening to port: ${port}`) : console.log(`Failed to listen to port: ${port}`);
    });
});