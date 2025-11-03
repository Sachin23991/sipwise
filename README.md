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


<p align="center">
  <svg height="140" width="700" viewBox="0 0 700 140">
    <rect width="700" height="140" rx="10" fill="#23272e"/>
    <text x="32" y="50" fill="#ffba08" font-size="18" font-family="monospace">$ docker compose up</text>
    <text x="32" y="80" fill="#00ff99" font-size="18" font-family="monospace">$ ./bin/sipwise inspect --target sip:bob@voip.local</text>
    <rect x="550" y="68" width="15" height="18" fill="#ffba08">
      <animate attributeName="opacity" values="1;0;1" dur="0.9s" repeatCount="indefinite"/>
    </rect>
  </svg>
</p>

---

## 🛡️ Animated Call Flow

<p align="center">
  <svg width="820" height="240" viewBox="0 0 820 240" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#222"/></marker>
    </defs>
    <g font-family="Segoe UI" font-size="14">
      <text x="60" y="40">UAC (caller)</text>
      <text x="360" y="40">Proxy</text>
      <text x="660" y="40">UAS (callee)</text>
    </g>
    <circle cx="60" cy="60" r="8" fill="#00c6ff">
      <animate attributeName="r" values="8;12;8" dur="0.8s" repeatCount="indefinite"/>
    </circle>
    <circle cx="360" cy="60" r="8" fill="#0072ff">
      <animate attributeName="r" values="8;13;8" dur="1.0s" repeatCount="indefinite"/>
    </circle>
    <circle cx="660" cy="60" r="8" fill="#8a2be2">
      <animate attributeName="r" values="8;12;8" dur="1.2s" repeatCount="indefinite"/>
    </circle>
    <line x1="140" y1="80" x2="340" y2="80" stroke="#00c6ff" stroke-width="2" marker-end="url(#arrow)"/>
    <text x="230" y="72" fill="#00c6ff" font-size="12" text-anchor="middle">INVITE</text>
    <line x1="360" y1="80" x2="640" y2="80" stroke="#00c6ff" stroke-width="2" marker-end="url(#arrow)"/>
    <text x="500" y="72" fill="#00c6ff" font-size="12" text-anchor="middle">INVITE</text>
    <g>
      <text x="500" y="102" font-size="12">100 Trying</text>
      <circle cx="500" cy="120" r="6" fill="#ffd54f">
        <animate attributeName="r" values="6;12;6" dur="1.1s" repeatCount="indefinite"/>
      </circle>
    </g>
    <line x1="640" y1="140" x2="360" y2="140" stroke="#7fffd4" stroke-width="3" marker-end="url(#arrow)">
      <animate attributeName="stroke-width" values="1;4;1" dur="1.6s" repeatCount="indefinite"/>
    </line>
    <text x="500" y="134" fill="#7fffd4" font-size="12" text-anchor="middle">200 OK</text>
    <line x1="360" y1="160" x2="140" y2="160" stroke="#8a2be2" stroke-width="2" marker-end="url(#arrow)"/>
    <text x="250" y="154" fill="#8a2be2" font-size="12" text-anchor="middle">ACK</text>
  </svg>
</p>

---

## 💡 Usage

| Command | Description |
|---|---|
| `sipwise probe --target sip:bob@example.net --timeout 3s` | Probe SIP endpoint |
| `sipwise trace --call-id "abc123" --output call1.pcap` | Trace a call and save PCAP |
| `sipwise emulate --user alice --domain example.org` | Emulate a SIP endpoint |

---

## ⚙️ Configuration

<details>
<summary>Show config YAML/environment variables</summary>

