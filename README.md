P2P Video Streaming via WebSocket Server with KD-tree Optimization

Disclaimer: This is only for test purposes. A complex approach on a CDN like chain among peers.

## Table of Contents
- Overview
- Features
- Issues
- Demo
- Installation

## Overview

This repository hosts a P2P (Peer-to-Peer) video streaming application that utilizes a WebSocket server as the point of contact and WebRTC for transferring video parts between peers. The project aims to enable efficient real-time video streaming between users, minimizing latency and bandwidth usage. The application optimizes peer selection using a KD-tree data structure to efficiently find and connect to the closest peers for improved video delivery.

## Features

- P2P video streaming using WebRTC technology using a custom RPC Worker module.
- WebSocket server acts as the central point of contact for peers to establish connections.
- Low-latency video transmission between peers.
- Dynamic selection of the closest peer using KD-tree optimization for optimal video delivery.
- Support for high-quality video formats.
- Scalable architecture for handling multiple simultaneous connections.

## Issues

- Not handling multiple peers at same time (> 2) - Could be a STUN Server problem, the connection is closed when a second data channel is created.

## Demo

[Provide a link to a live demo or a video showcasing your application in action.]

### Installation

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/thealmarques/p2p-abr-players.git
   cd p2p-abr-players
   cd websockets-server
   yarn
   cd ../
   yarn
   yarn start