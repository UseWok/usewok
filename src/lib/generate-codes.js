// Génère des codes uniques aléatoires
function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateCodesForPlan(planId, billing, count = 1000) {
  const codes = new Set();
  while (codes.size < count) {
    codes.add(generateCode());
  }
  return Array.from(codes).map(code => ({
    code,
    plan_id: planId,
    billing,
    used: false
  }));
}

export function generateAllCodes() {
  const plans = ['essential', 'advanced', 'expert', 'supreme'];
  const billings = ['monthly', 'yearly'];
  const allCodes = [];

  for (const plan of plans) {
    for (const billing of billings) {
      const codes = generateCodesForPlan(plan, billing, 1000);
      allCodes.push(...codes);
    }
  }

  return allCodes;
}

// Export formaté pour copier-coller dans Google Sheet
export function exportAsText() {
  const plans = ['essential', 'advanced', 'expert', 'supreme'];
  const billings = ['monthly', 'yearly'];
  let output = '';

  for (const plan of plans) {
    for (const billing of billings) {
      const codes = generateCodesForPlan(plan, billing, 1000);
      output += `\n=== ${plan.toUpperCase()} - ${billing === 'monthly' ? 'MENSUEL' : 'ANNUEL'} ===\n`;
      output += codes.map(c => c.code).join('\n');
      output += '\n';
    }
  }

  return output;
}