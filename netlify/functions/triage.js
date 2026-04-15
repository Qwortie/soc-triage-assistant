exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch(e) {
    return { statusCode: 400, body: "Invalid request body" };
  }

  const { alertData } = payload;
  if (!alertData) {
    return { statusCode: 400, body: "Missing alertData" };
  }

  const systemPrompt = `You are an experienced SOC Tier-1 analyst assistant. You will be given Splunk alert data and must produce a structured triage report in valid JSON.

Your output must be a single JSON object with exactly these fields:

{
  "verdict": "Confirmed Threat | Suspected Threat | Likely False Positive | Requires Investigation",
  "confidence": "High | Medium | Low",
  "verdict_justification": "2-3 sentences explaining your verdict based on the alert data",
  "mitre_tactic": "The ATT&CK tactic name",
  "mitre_technique": "The technique name",
  "mitre_id": "T-number e.g. T1059.001",
  "mitre_url": "https://attack.mitre.org/techniques/TXXX/",
  "severity": "Critical | High | Medium | Low",
  "summary": "One sentence plain-English summary of what happened",
  "affected_host": "hostname or IP from the alert",
  "affected_user": "username from the alert or Unknown",
  "iocs": ["list", "of", "defanged", "IOCs", "from", "the", "alert"],
  "containment_actions": [
    "Specific action 1",
    "Specific action 2",
    "Specific action 3"
  ],
  "escalate_to_ir": true or false,
  "escalation_reason": "Why escalation is needed, or null if not needed",
  "analyst_notes": "Any important caveats, context, or things to verify manually",
  "awareness_training": true or false
}

Rules:
- Defang all IOCs: IPs use [.] notation, URLs use hxxp/hxxps
- Be specific — reference actual values from the alert data
- If data is missing for a field, use null or "Unknown"
- Return ONLY the JSON object, no markdown, no explanation`;

  const userPrompt = `Triage this Splunk alert and produce a SOC ticket:\n\n${alertData}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { statusCode: response.status, body: JSON.stringify({ error: data }) };
    }

    const text = data.content && data.content[0] && data.content[0].text
      ? data.content[0].text.trim()
      : "";

    // Strip any accidental markdown fences
    const clean = text.replace(/```json|```/g, "").trim();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result: clean })
    };

  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
