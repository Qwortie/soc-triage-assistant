# 🛡️ SOC Triage Assistant

![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)
![AI](https://img.shields.io/badge/AI-Claude-orange?style=flat-square)
![Deploy](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=flat-square)
![Framework](https://img.shields.io/badge/Framework-MITRE%20ATT%26CK-B22222?style=flat-square)

An AI-powered SOC analyst tool that takes a Splunk alert — either pasted as raw JSON or entered via a structured form — and generates a complete triage report in seconds. Built to accelerate Tier-1 SOC workflows by automating the initial analysis step.

**Live demo:** [soc-triage.netlify.app](https://soc-triage-qwort.netlify.app/)

---

## 🎯 What It Does

Paste a Splunk alert and get back:

- **Verdict** — Confirmed Threat / Suspected Threat / Likely False Positive
- **MITRE ATT&CK mapping** — tactic, technique, and ID with direct link
- **IOC extraction** — all indicators defanged per threat intel standards
- **Containment actions** — numbered, specific, immediately actionable
- **Escalation decision** — should this go to the IR team?
- **Analyst notes** — caveats and things to verify manually
- **Exportable .md ticket** — ready to commit to your SOC ticket log

---

## 🏗️ Architecture

```
Browser (index.html)
       ↓  POST /alert data
Netlify Function (triage.js)     ← API key stored as env variable
       ↓  POST /v1/messages
Claude API (claude-haiku)
       ↓  Structured JSON response
Browser renders triage report
```

The Claude API key is never exposed in the browser — all API calls are proxied through a Netlify serverless function.

---

## 🧪 Sample Alerts

The tool includes four preloaded sample alerts for demo purposes:

| Sample | MITRE Technique | Event ID |
|---|---|---|
| Password Spray | T1110.003 | 4625 |
| Kerberoasting | T1558.003 | 4769 |
| Encoded PowerShell | T1059.001 | Sysmon EID 1 |
| LSASS Memory Access | T1003.001 | Sysmon EID 10 |

---

## 🚀 Deployment

### Prerequisites
- Netlify account (free tier works)
- Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

### Steps

1. Fork or clone this repo
2. Deploy to Netlify (drag and drop the folder, or connect via GitHub)
3. In Netlify → Site configuration → Environment variables, add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your API key
4. Trigger a redeploy

### Local Development
```bash
npm install -g netlify-cli
netlify dev
# Visit http://localhost:8888
```

---

## 📁 Repository Structure

```
soc-triage-assistant/
├── index.html                    # Frontend — form, JSON input, results UI
├── README.md
└── netlify/
    └── functions/
        └── triage.js             # Serverless proxy — calls Claude API
```

---

## 🔗 Related Repositories

- [SOC-Home-Lab](https://github.com/Qwortie/SOC-Home-Lab) — Lab environment these alerts come from
- [splunk-detection-rules](https://github.com/Qwortie/splunk-detection-rules) — SPL rules that generate these alerts
- [Phishing-tickets](https://github.com/Qwortie/Phishing-tickets) — Manual ticket format this tool automates
