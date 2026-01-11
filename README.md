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
