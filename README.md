<!--
  SIPWISE — BEAUTIFUL, ANIMATED, AND FULLY INFORMATIVE README
  Paste this as your README.md. All SVGs and images are GitHub-safe.
  Replace image paths with your own if needed!
-->

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
  <img src="https://img.shields.io/badge/SIP-Animated%20Flows-blueviolet?style=for-the-badge"/>
  <img src="https://img.shields.io/github/stars/Sachin23991/sipwise?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge"/>
</p>

---

## 🚀 Features

<table>
  <tr>
    <td align="center">
      <img src="https://raw.githubusercontent.com/Sachin23991/sipwise/main/.github/assets/animated-demo.gif" width="90" />
      <br/><b>Animated Call Flows</b>
      <br/><sub>See visually how SIP packets move!</sub>
    </td>
    <td align="center"><img src="https://cdn.jsdelivr.net/gh/feathericons/feather/icons/eye.svg" width="36"/>
      <br/><b>Deep Tracing</b><br/><sub>Step inside every message</sub>
    </td>
    <td align="center"><img src="https://cdn.jsdelivr.net/gh/feathericons/feather/icons/box.svg" width="36"/>
      <br/><b>Container Ready</b><br/><sub>Runs anywhere, anytime</sub>
    </td>
    <td align="center"><img src="https://cdn.jsdelivr.net/gh/feathericons/feather/icons/bar-chart-2.svg" width="36"/>
      <br/><b>Observability</b><br/><sub>Metrics & visual logs</sub>
    </td>
  </tr>
</table>

- **Signal flow visualizations:** SIP INVITE, 200 OK, ACK as SVG animations.
- **Probes, NAT diagnose, call tracing.**
- **Lightweight, Docker-friendly, extensible.**
- **Logs, pcap helpers, live traces.**

---

## 📦 Quickstart

