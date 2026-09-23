import 'dotenv/config';
import { extractEventFromInput } from '../lib/ai/extract-event.ts';

async function runTest() {
  console.log('Testing event extraction engine...');

  const sampleRawText = `
Join us for the UNILAG AI & Robotics Hackathon 2026!
Date: October 24, 2026 starting at 9:00 AM.
Location: AI UniPod, Faculty of Engineering, University of Lagos, Akoka, Lagos.
Host: AI UniPod & UNILAG Robotics Club.
This is a 48-hour challenge building autonomous agents and IoT solutions. Admission is completely free!
Register here: https://unipod.unilag.edu.ng/hackathon-2026
`;

  const result = await extractEventFromInput(sampleRawText);
  console.log('Result:', JSON.stringify(result, null, 2));
}

runTest().catch((err) => {
  console.log('Extraction handled error:', err.message);
});
