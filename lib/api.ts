// Mock API functions for Twilio integration

export async function bridgeCall(agentNumber: string, customerNumber: string): Promise<void> {
  const response = await fetch('https://nehes-israel-system-backend.onrender.com/trigger_target_call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent: agentNumber,
      numbers: [customerNumber]
    }),
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} - ${await response.text()}`);
  }
}

export async function fetchCallHistory(): Promise<CallRecord[]> {
  const response = await fetch('https://nehes-israel-system-backend.onrender.com/call_history');
  if (!response.ok) {
    throw new Error(`API error: ${response.status} - ${await response.text()}`);
  }
  const data = await response.json();
  // If your backend returns `call_sid` instead of `id`, remap here if needed
  // But if using the code I provided earlier ("id" is call_sid, everything else matches), this is fine!
  return data;
}

export interface Lead {
  id: string;
  phoneNumber: string;
  name: string;
}

export interface TripleCallResult {
  success: boolean;
  message: string;
  leads: Lead[];
}

export async function tripleCallLeads(agentNumber: string): Promise<TripleCallResult> {
  // Numbers to dial (you can fetch from CRM/API elsewhere—hardcoded for this example)
  const leads: Lead[] = [
    { id: "lead1", phoneNumber: "+972502300180", name: "Ziv" },
    { id: "lead2", phoneNumber: "+972544831148", name: "Yoni" },
    { id: "lead3", phoneNumber: "+972543567634", name: "Shay" },
  ];

  const response = await fetch('https://nehes-israel-system-backend.onrender.com/trigger_target_call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent: agentNumber,
      numbers: leads.map((lead) => lead.phoneNumber),
      // numbers: [leads[1].phoneNumber],
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} - ${await response.text()}`);
  }

  // Optionally, you can parse backend response if you want more info
  return {
    success: true,
    message: `Successfully initiated calls to ${leads.length} leads`,
    leads: leads,
  };
}

// export async function fetchCallHistory(): Promise<CallRecord[]> {
//   // Mock data - in production this would fetch from Google Sheets
//   return [
//     {
//       id: "1",
//       timestamp: new Date().toISOString(),
//       agentNumber: "+1234567890",
//       customerNumber: "+1987654321",
//       status: "connected",
//       duration: 120,
//     },
//     {
//       id: "2",
//       timestamp: new Date(Date.now() - 3600000).toISOString(),
//       agentNumber: "+1234567890",
//       customerNumber: "+1555123456",
//       status: "connected",
//       duration: 45,
//     },
//     {
//       id: "3",
//       timestamp: new Date(Date.now() - 7200000).toISOString(),
//       agentNumber: "+1234567890",
//       customerNumber: "+1555789012",
//       status: "dropped",
//       duration: 0,
//     },
//     {
//       id: "4",
//       timestamp: new Date(Date.now() - 86400000).toISOString(),
//       agentNumber: "+1987654321",
//       customerNumber: "+1555345678",
//       status: "connected",
//       duration: 300,
//     },
//     {
//       id: "5",
//       timestamp: new Date(Date.now() - 172800000).toISOString(),
//       agentNumber: "+1987654321",
//       customerNumber: "+1555901234",
//       status: "dropped",
//       duration: 5,
//     },
//   ]
// }

export interface CallRecord {
  id: string
  timestamp: string
  agentNumber: string
  customerNumber: string
  // status: "connected" | "dropped"
  status: string
  duration: number
}

export interface Lead {
  id: string
  phoneNumber: string
  name: string
}

export interface TripleCallResult {
  success: boolean
  message: string
  leads: Lead[]
}
