## Video Chat Application — Project Progress

Overview

This project is a real-time video communication system inspired by Google Meet.
The architecture is based on WebRTC with Mesh Model.

This document tracks week-by-week progress.

<hr>

### Week 1 — Requirement Analysis & Environment Setup ✅

Objective

Lock decisions early to avoid architectural rework later.
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

Screen sharing
Recording
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
