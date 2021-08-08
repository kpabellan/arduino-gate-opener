# Arduino Gate Opener

A personal project that opens a gate with an Arduino. The way this works is I have a webpage which contains a button that sends a message to a websocket server. The websocket server then sends instructions for the servo on the Arduino and the servo then rotates to activate a click on the gate opener, allowing the gate to be opened remotely through a webpage.