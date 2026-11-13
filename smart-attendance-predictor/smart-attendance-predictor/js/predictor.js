// Risk prediction logic
function analyze(att, cond, up, target) {
  att = Number(att); cond = Number(cond); up = Number(up); target = Number(target) || 75;
  if ([att, cond, up].some(n => !isFinite(n) || n < 0)) return { error: 'Enter valid non-negative numbers.' };
  if (att > cond) return { error: 'Classes attended cannot be more than classes conducted.' };
  const pct = cond ? att / cond * 100 : 0;
  const total = cond + up;
  const needed = Math.max(0, Math.ceil(target * total / 100 - 1e-9) - att);
  const maxPct = total ? (att + up) / total * 100 : 0;
  const safeSkips = Math.max(0, Math.min(up, Math.floor(att + up - target * total / 100 + 1e-9)));
  let risk, text;
  if (needed > up) {
    risk = 'High';
    text = 'Even attending all ' + up + ' remaining classes you will reach only ' + maxPct.toFixed(1) + '%. Contact your faculty about condonation.';
  } else if (needed > 0) {
    risk = needed > 0.7 * up ? 'High' : 'Medium';
    text = 'Attend next ' + needed + ' classes to reach ' + target + '%.';
  } else {
    risk = pct < target + 5 ? 'Medium' : 'Low';
    text = safeSkips > 0 ? 'You can safely skip ' + safeSkips + ' more classes and still stay at ' + target + '% or above.' : 'Attend every remaining class to stay at ' + target + '%.';
  }
  return { pct, needed, safeSkips, maxPct, risk, text };
}
