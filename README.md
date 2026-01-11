## Video Chat Application — Project Progress

Overview

This project is a real-time video communication system inspired by Google Meet.
The architecture is based on WebRTC with Mesh Model.

This document tracks week-by-week progress.

<hr>

### Week 1 — Requirement Analysis & Environment Setup ✅

Objective

No WebRTC or signaling logic was implemented in this phase.

#### Decisions Finalized

Architecture: Mesh
Maximum participants per room: 10
Core features (initial):
Video
Audio
Mute / Unmute
Join / Leave

#### Conditional features:

Screen sharing<br>
Recording<br>
Chat

#### Environment Setup

VPS provisioned with Ubuntu
Node.js LTS installed
Backend initialized using ESM (ECMAScript Modules)
Git repository initialized
Nginx installed and configured (reserved for later reverse proxy usage)

#### Deliverables Achieved

Clean backend project structure
README defining scope and constraints
Backend server boots successfully

<hr>

### Week 2–3 — WebRTC Fundamentals & Local Connection Demo ✅

Objective

Building conceptual and practical understanding of WebRTC by establishing peer-to-peer media flow in a controlled local environment. No production signaling, no TURN/STUN.

### Scope of Work

- Studied WebRTC architecture:
- Peer-to-peer model
- SDP (Session Description Protocol)
- ICE candidates
- Media tracks vs streams
- Understood browser APIs:
 - *getUserMedia*
 - *RTCPeerConnection*
 - *MediaStream*

Implemented local-only WebRTC demo (same machine / same browser context)

### Implementation Details

Camera and microphone access tested using getUserMedia<br>
Created two RTCPeerConnection instances locally to simulate caller–callee<br>
Manual offer/answer exchange performed within the same application<br>
Media tracks added explicitly to peer connections<br>
Video rendered using video elements with srcObject<br>

### Key Learnings

Difference between tracks and streams<br>
Importance of proper SDP exchange order<br>
ICE candidate gathering behavior<br>
Autoplay and mute constraints in browsers<br>
Why signaling is mandatory for real-world calls<br>


<br>


### Week 4–5 — Signaling Server, Authentication & Real-Time Messaging ✅

### Objective

Transition from a local-only WebRTC demo to a real-world multi-user system by implementing signaling, authentication, and real-time messaging. This phase focused on enabling actual peer discovery and connection establishment across different devices and networks.

### Scope of Work

Designed and implemented a WebSocket-based signaling server using Node.js<br>
Implemented room-based signaling logic for multi-user communication<br>
Added real-time text chat using WebSocket alongside video calls<br>

### Implementation Details

WebSocket server created to handle:

Client connections and disconnections<br>
Room join/leave events<br>
Exchange of SDP offers and answers<br>
ICE candidate forwarding between peers<br>

### Key Learnings

Why WebRTC requires an external signaling mechanism<br>
Difference between signaling data and media data<br>
Handling multiple peer connections in a mesh topology<br>
Challenges of synchronizing SDP and ICE exchange in multi-user scenarios<br>

### Deliverables Achieved

Functional signaling server using WebSocket<br>
Authenticated multi-user room support<br>
Successful peer-to-peer connections across different devices and networks<br>

repo link : https://github.com/myselfprincee/vido-backend
