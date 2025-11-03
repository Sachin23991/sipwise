<!-- SIPWISE — Animated SIP/VoIP Toolkit README
     Style: Beautiful, animated (SVG + GIF + modern badges), informative, playful, and professional.
     All SVGs are inline, badges from Shields.io, GIFs from your .github/assets folder.
-->

<!-- Animated header: Waving, gradient SIPWISE logo -->
<p align="center">
  <svg width="820" height="140" viewBox="0 0 820 140" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
    <defs>
      <linearGradient id="g1" x1="0" x2="1">
        <stop offset="0%" stop-color="#00c6ff"/>
        <stop offset="50%" stop-color="#0072ff"/>
        <stop offset="100%" stop-color="#8a2be2"/>
      </linearGradient>
      <filter id="f1" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="b"/>
        <feBlend in="SourceGraphic" in2="b"/>
      </filter>
    </defs>
    <text x="50%" y="50%" text-anchor="middle" font-family="Segoe UI, Roboto, sans-serif" font-size="40" font-weight="700" fill="url(#g1)" filter="url(#f1)">
      SIPWISE
    </text>
    <rect x="170" y="78" width="480" height="6" rx="3" fill="url(#g1)">
      <animate attributeName="x" values="170;150;170" dur="3.5s" repeatCount="indefinite" />
      <animate attributeName="width" values="480;520;480" dur="3.5s" repeatCount="indefinite" />
    </rect>
    <g transform="translate(80,95)">
      <circle cx="0" cy="0" r="4" fill="#00c6ff">
        <animate attributeName="cx" from="0" to="740" dur="4.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;.3;1" dur="4.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="0" cy="0" r="4" fill="#0072ff" transform="translate(0,-14)">
        <animate attributeName="cx" from="0" to="740" dur="5.1s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;.25;1" dur="5.1s" repeatCount="indefinite"/>
      </circle>
    </g>
  </svg>
</p>
<p align="center">
  <svg width="520" height="40" viewBox="0 0 520 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="subg" x1="0" x2="1"><stop offset="0%" stop-color="#43e97b"/><stop offset="100%" stop-color="#38f9d7"/></linearGradient></defs><text x="50%" y="50%" text-anchor="middle" font-family="Segoe UI, Roboto, sans-serif" font-size="22" font-weight="500" fill="url(#subg)"><animate attributeName="opacity" values="0;1;0.7;1" dur="3s" repeatCount="indefinite"/>THE MODERN, VISUAL SIP/VoIP TOOLKIT</text></svg>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-alpha-orange?style=for-the-badge&logo=github" alt="status"/>
  <img src="https://img.shields.io/badge/language-VoIP%20%7C%20SIP-blue?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/licence-MIT-green?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/-INSTALL%20%26%20TEST-07c4ff?style=for-the-badge&logo=docker" alt="Install & Test Badge"/>
</p>

---

<p align="center">
  <img alt="sipwise-demo" src="https://raw.githubusercontent.com/Sachin23991/sipwise/main/.github/assets/animated-demo.gif" style="max-width:720px; width:90%; border-radius:12px; box-shadow: 0 10px 30px rgba(2,6,23,0.25)"/>
</p>
<p align="center">
  <sub><b>Animated demo – see SIPWISE in action!</b></sub>
</p>

---

## Table of Contents
- [Features](#features)
- [Quickstart](#quickstart)
- [Usage examples](#usage-examples)
- [Architecture overview](#architecture-overview)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)

---

## Features

<table align="center">
  <tr>
    <td align="center"><img src="https://cdn.jsdelivr.net/gh/feathericons/feather/icons/activity.svg" width="40"/><br/><b>Animated Call Flows</b><br/><sub>Watch SIP flows unfold live.</sub></td>
    <td align="center"><img src="https://cdn.jsdelivr.net/gh/feathericons/feather/icons/terminal.svg" width="40"/><br/><b>CLI & Dockerized UX</b><br/><sub>Test probes in your terminal. 🚀</sub></td>
    <td align="center"><img src="https://cdn.jsdelivr.net/gh/feathericons/feather/icons/monitor.svg" width="40"/><br/><b>Visual Tracing</b><br/><sub>See every SIP message, visually.</sub></td>
    <td align="center"><img src="https://cdn.jsdelivr.net/gh/feathericons/feather/icons/cpu.svg" width="40"/><br/><b>Plug & Play</b><br/><sub>Adapter for PBX and media gateways.</sub></td>
  </tr>
</table>

- **Signal flow visualizations:** Animated SIP INVITE, 200 OK, ACK as SVGs.
- **SIP endpoint probe, NAT diagnostics, call tracing.**
- **Docker-friendly, lightweight, extensible.**
- **Observability:** Logs, pcap helpers, live visual traces.

---

## Why animations?
- *Visualize call flow and SIP timing instantly.*
- *See state machines directly in README/docs.*
- *Fun, intuitive onboarding for beginners and pros.*

---

## Quickstart

<details>
  <summary><b>Prerequisites</b></summary>
<ul>
  <li>Docker / Docker Compose (recommended)</li>
  <li>Node.js 18+ (tooling UI, optional)</li>
  <li>Any SIP softphone or pjsua for tests</li>
</ul>
</details>

**Quick start with Docker:**
