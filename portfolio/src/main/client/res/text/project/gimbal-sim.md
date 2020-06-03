---
name: Gimbal Simulator
languages:
  - TypeScript
  - Rust
technologies:
  - WebGL
  - React
  - Docker
  - Webpack
year: 2020
---
[CUAir](cuair.org)'s plane has a gimbal to make sure that the camera is pointing
at the things we want to take pictures of. However, debugging the software which
controls that gimbal has historically been a laborious task that requires you to
have the actual gimbal. The plane's software has a simulated
mode, but if it does not detect a gimbal peripheral, then it simply won't
simulate it.

This project, a collaboration between myself, Owen Sorber, and Samantha Cobado,
is composed of three parts. 

### The Virtual Gimbal (Rust)
I was in charge of this part. The virtual gimbal is a process that implements
the serial protocol used to communicate with the real gimbal, and then pretends
to be a USB device using a [pseudo-terminal](https://linux.die.net/man/7/pty).
The plane firmware thinks it is communicating with a real gimbal, sends
instructions to rotate, and the virtual gimbal simulates the time it would take
for a physical gimbal to accelerate and rotate according to those commands.

### The Backend Server (Rust)
I was in charge of this part, too. The backend server receives telemetry
information from the plane firmware over UDP and makes this available to the
front-end over HTTP using [server-sent
events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events).

### The Frontend GUI (TypeScript)
This is where the collaboration happened. The frontend uses WebGL to render a
virtual world from the camera's point of view. This makes it possible for
engineers working on the gimbal to see how it would behave in real time without
having to have the physical device.
