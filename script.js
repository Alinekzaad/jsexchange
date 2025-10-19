// Elements 
const cur1 = document.getElementById("currency-one");
const amt1 = document.getElementById("amount-one");
const cur2 = document.getElementById("currency-two");
const amt2 = document.getElementById("amount-two");
const rateEl = document.getElementById("rate");
const swapBtn = document.getElementById("swap");

// Cache for API results
const cache = new Map();
const TTL = 10 * 60 * 1000;

async function getRates(base) {
  const key = `rates:${base}`;
  const now = Date.now();

  if (cache.has(key) && now - cache.get(key).ts < TTL) {
    return cache.get(key).data;
  }

  const res = await fetch(`https://api.vatcomply.com/rates?base=${base}`);
  if (!res.ok) throw new Error("Failed to fetch rates");
  const data = await res.json();
  cache.set(key, { ts: now, data });
  return data;
}

// beräkning övre till nedre
async function recalcForward() {
  const base = cur1.value;
  const quote = cur2.value;
  const val = parseFloat(amt1.value);
  if (isNaN(val)) {
    amt2.value = "";
    return;
  }

  try {
    const { rates } = await getRates(base);
    const rate = base === quote ? 1 : rates[quote];
    amt2.value = (val * rate).toFixed(2);
    rateEl.textContent = `1 ${base} = ${rate.toFixed(4)} ${quote}`;
  } catch (err) {
    rateEl.textContent = "Could not fetch exchange rate";
    console.error(err);
  }
}

// beräkning nedre till övre
async function recalcBackward() {
  const base = cur2.value;
  const quote = cur1.value;
  const val = parseFloat(amt2.value);
  if (isNaN(val)) {
    amt1.value = "";
    return;
  }

  try {
    const { rates } = await getRates(base);
    const rate = base === quote ? 1 : rates[quote];
    amt1.value = (val * rate).toFixed(2);
    rateEl.textContent = `1 ${base} = ${rate.toFixed(4)} ${quote}`;
  } catch (err) {
    rateEl.textContent = "Could not fetch exchange rate";
    console.error(err);
  }
}

// Events 
cur1.addEventListener("change", recalcForward);
cur2.addEventListener("change", recalcForward);
amt1.addEventListener("input", recalcForward);
amt2.addEventListener("input", recalcBackward);

swapBtn.addEventListener("click", () => {
  // Byt valutor
  const tmp = cur1.value;
  cur1.value = cur2.value;
  cur2.value = tmp;

  // Byt beloppen
  const tmpAmt = amt1.value;
  amt1.value = amt2.value;
  amt2.value = tmpAmt;

  recalcForward();
});

//  Init 
recalcForward();
