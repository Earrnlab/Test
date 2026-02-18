
let activelocation = window.location.pathname;
let  alldata = `
<div class="coins-head">
<p class="p1">Name</p>
<p class="p2">Last Price</p>
<p class="p3">24h change</p>  
</div>

`;
let isBlocked = false;     // global
let countryChecked = false;
function checkOnline() {
  if (!navigator.onLine) {
      console.warn("Internet disconnected.");
      return false;
  }
  return true;
}

async function getUserCountry() {
  try {
    // Step 1: Get user's real IP
    let ipRes = await fetch("https://api.ipify.org?format=json");
    let ipData = await ipRes.json();
    let userIP = ipData.ip;
    // Step 2: Get country from ipwho.is (CORS-friendly)
    let geoRes = await fetch("https://ipwho.is/" + userIP);
    let geoData = await geoRes.json();
    let country = geoData.country_code || null;
    return country;

  } catch (err) {
    console.error("Geo detection failed:", err);
    return null;
  }
}

(async () => {
  if (!checkOnline()) return; 
  let country = await getUserCountry();

  if (["US", "IR", "CU", "CZ"].includes(country)) {
    isBlocked = true;
  }
  countryChecked = true;
})();

if(activelocation.includes('contract.php') || activelocation.includes('contract')){
 alldata = ``;
}

const theme_determ = localStorage.getItem('theme') || 'light';
const fnk_token = 'FNCUSDT'; //populate coins accordingly
const ckb_token = 'CKBUSDT';
const div_ge  = ['BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','DOGEUSDT','LTCUSDT','QNTUSDT','ADAUSDT','XRPUSDT','APTUSDT','TRXUSDT','LINKUSDT','MATICUSDT','BCHUSDT','ICPUSDT','SHIBUSDT','FILUSDT','INJUSDT','DOTUSDT','OPUSDT','TIAUSDT','AVAXUSDT','EGLDUSDT','AAVEUSDT','ARBUSDT','GALAUSDT','APEUSDT','ATOMUSDT','QTUMUSDT','WLDUSDT','FTTUSDT','PEPEUSDT'];
div_ge.forEach(divs =>{
  let symbol2 = divs.substring(0, divs.length-4) + '/' + 'USDT';
  if (symbol2 === 'SOL/USDT') {
    symbol2 = fnk_token.substring(0, fnk_token.length-4) + '/' + 'USDT';
  }else if (symbol2 === 'APT/USDT') {
    symbol2 = ckb_token.substring(0, ckb_token.length-4) + '/' + 'USDT';
  }
  alldata +=` 
  <div class="coins" onclick = changeCoin('${divs}');>
  <div class="logo-name">
    <img src="images/${divs}.png" alt=""><p class="p1">${symbol2}</p>
  </div>
  <p class="p2 ${divs}_p"></p>
  <p class="p3  ${divs}_chng"></p>
</div>

  `;
  document.querySelector('.all-currencies').innerHTML = alldata;

});
let pos_headp = document.querySelector('.pos-head-p');
let pos_heado = document.querySelector('.pos-head-o');
pos_heado.innerHTML = `Orders(0)`;
pos_headp.classList.add('active_p');
pos_headp.addEventListener('click', ()=>{
  pos_headp.classList.add('active_p');
  pos_heado.classList.remove('active_p');
});
pos_heado.addEventListener('click', ()=>{
  pos_heado.classList.add('active_p');
  pos_headp.classList.remove('active_p');
});


/* fetch coins data */
const all_load = document.querySelector('.all-loading');  
const all_load1 = document.querySelector('.all-loading1');
all_load1.style.display = "flex";

function coinDataupdate() {
  // Wait until geolocation detection is done
  if (!countryChecked) {
    return setTimeout(coinDataupdate, 200);
  }
  if (!checkOnline()) return; 
  //sever coins if restricted
  if (isBlocked) {
    fetch("./user_data/api_get_allcoins.php")
      .then(res =>{
        if (!res.ok) throw new Error('Server error');
        return res.json();
      })
      .then(allData => {
          allData.forEach(staticCoin);
          all_load.style.display = 'none';
      })
      .catch(err => {
          console.error("Error fetching Binance data:", err);
          all_load.style.display = 'none';
      });
      return;
  }


  const priorityCoins = ["BTCUSDT", "ETHUSDT", "BNBUSDT"];
  const otherCoins = ['XRPUSDT','DOGEUSDT','LTCUSDT','SOLUSDT','ADAUSDT','QNTUSDT','DOTUSDT','TRXUSDT','LINKUSDT','MATICUSDT','BCHUSDT','ICPUSDT','SHIBUSDT','FILUSDT','INJUSDT','APTUSDT','OPUSDT','TIAUSDT','AVAXUSDT','EGLDUSDT','AAVEUSDT','ARBUSDT','GALAUSDT','APEUSDT','ATOMUSDT','QTUMUSDT','WLDUSDT','FTTUSDT','PEPEUSDT'];

  // 1️⃣ First fetch BTC, ETH, BNB sequentially (to show them first)
  const fetchPriority = priorityCoins.reduce((p, coin) => {
    return p.then(() =>
      fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${coin}`)
        .then(res => res.json())
        .then(data => staticCoin(data))
        .catch(() => console.warn(`${coin} failed`))
    );
  }, Promise.resolve());

  // 2️⃣ Then fetch all other coins in parallel (fast)
  fetchPriority.then(() => {
    return Promise.allSettled(
      otherCoins.map(coin =>
        fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${coin}`)
          .then(res => res.json())
      )
    );
  })
  .then(results => {
    results.forEach(r => {
      if (r.status === "fulfilled") staticCoin(r.value);
    });
  })
  .catch(err => console.error("Unexpected error:", err));
}

coinDataupdate();
setInterval(() => {
  coinDataupdate();
}, 5000);

function staticCoin(data) {
  let price = data.lastPrice;
  let change = parseFloat(data.priceChangePercent).toFixed(2);
  let symbol = data.symbol;
  function subcoins(coin) {
    let subele = document.querySelector(`.${coin}`);
    
    if (change > 0) {
      subele.classList.add('green');
      subele.innerHTML = '+' + parseFloat(change).toFixed(2) + '&#xFE6A' + '&#xa0' + '&#x2197';
    }else{
      subele.classList.add('red');
      subele.innerHTML = parseFloat(change).toFixed(2) + '&#xFE6A' + '&#xa0' +  '&#x2198';

    }
    
  }
  if (activelocation === '/home.php') {
    if (symbol === 'BTCUSDT') {
      subcoins('btc_p');
    }
    if (symbol === 'ETHUSDT') {
      subcoins('eth_p');
    }
    if (symbol === 'BNBUSDT') {
      subcoins('bnb_p');
    }
    
  }
 
  if (price > 100) {
     price = parseFloat(price).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    
  }else if (price > 10) {
    price = parseFloat(price).toFixed(2);
    
  }else if (price > 1) {
    price = parseFloat(price).toFixed(3);
    
  }else if (price > 0.1) {
    price = parseFloat(price).toFixed(4);
    
  }else if (price > 0.01) {
    price = parseFloat(price).toFixed(5);
    
  }
  else{
    price = parseFloat(price).toFixed(8);
  }
let sy_p = symbol.substring(0, symbol.length) + '_p';
let sy_chng = symbol.substring(0, symbol.length) + '_chng';
let p_element = document.querySelector(`.${sy_p}`);
let chng_element = document.querySelector(`.${sy_chng}`);
if (change > 0) {
  change = '+' + change + '&#xFE6A';
  p_element.classList.add('green');
  chng_element.classList.add('chng_g');
  /* This is just for the change percent background prevention in contract page
  if (activelocation === '/contract.php') {
    chng_element.classList.remove('chng_g');
    chng_element.classList.add('green');
  } */
  
}else{
  change ='&#xa0' +  change +  '&#xFE6A';
  p_element.classList.add('red');
  chng_element.classList.add('chng_l');
  /*
  if (activelocation === '/contract.php') {
    chng_element.classList.remove('chng_l');
    chng_element.classList.add('red');
  } */
}
if (symbol === 'SOLUSDT' && coin_name === 'solusdt') {
  onPriceUpdateOnce((modi_price)=>{
    p_element.innerHTML = modi_price;
  })
}else if(symbol === 'APTUSDT' && coin_name === 'aptusdt'){
  onPriceUpdateOnce((modi_price)=>{
    p_element.innerHTML = modi_price;
  })
}else{
  p_element.innerHTML = price;
}
chng_element.innerHTML = change;



}
function changeCoin(coin) {
  //location.href = `/contract.php?c=${coin}`;
  location.href = './contract.php';
  localStorage.setItem('coin_name',coin);

}
let coin_name = localStorage.getItem('coin_name');

if (coin_name == null) {
  coin_name = 'BTCUSDT';
  
}

let coin_per = coin_name.substring(0, coin_name.length-4) + '/' + 'USDT'; //This code determine coin name in the head section
if (coin_per === 'SOL/USDT') {
  coin_per = fnk_token.substring(0, fnk_token.length-4) + '/' + 'USDT';
}else if (coin_per === 'APT/USDT') {
  coin_per = ckb_token.substring(0, ckb_token.length-4) + '/' + 'USDT';
}
document.querySelector('.coin').innerHTML = coin_per;
 
coin_name = coin_name.toLowerCase();




function initiateOrederbook() {
  if (!countryChecked) {
    return setTimeout(initiateOrederbook, 200);
  }
  if (!checkOnline()) return; 
  if (isBlocked) {
    // BLOCKED USERS → Use PHP REST orderbook every 2 seconds
    setInterval(() => {
        fetch(`./user_data/api_orderb.php?symbol=${coin_name.toUpperCase()}`)
            .then(r => r.json())
            .then(ob_data => {
                if (!ob_data || !ob_data.asks || !ob_data.bids) return;

                // Convert to same structure as Binance WS
                ob_data = { a: ob_data.asks, b: ob_data.bids };

                updateOrderbook(ob_data); // reuse same logic
            })
            .catch(e => console.error("Order proxy error:", e));
    }, 5000);

  } else {
      // NON-BLOCKED USERS → Direct Binance WebSocket
      const ws_ord = new WebSocket(`wss://fstream.binance.com/ws/${coin_name.toLowerCase()}@depth10`);

      ws_ord.onmessage = (e) => {
          const ob_data = JSON.parse(e.data);
          updateOrderbook(ob_data);
      };

      ws_ord.onerror = (e) => console.error("WS depth error:", e);
  }
}
initiateOrederbook();

function updateOrderbook(ob_data) {
  // STOP making requests if offline
  if (!navigator.onLine) return;

  if (!ob_data || !ob_data.a || !ob_data.b) return;
  if (ob_data.a.length < 6 || ob_data.b.length < 6) return;

  all_load1.style.display = 'none';

  const asks = ob_data.a.slice(0, 6);
  const bids = ob_data.b.slice(0, 6);

  const formatPrice = (price) => {
    const p = parseFloat(price);
    if (p > 50) {
      return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (p > 1) {
      return p.toFixed(3);
    } else if (p > 0.1) {
      return p.toFixed(5);
    }
    return p.toFixed(6);
  };

  const formatQty = (qty) => {
    const q = parseFloat(qty);
    return q > 10 ? q.toFixed(2) : q.toFixed(5);
  };

  // Build ASKS HTML
  let ask_total = `<div class="head"><p class="coin-price">Price</p><p class="qnt">Quantity</p></div>`;
  for (let i = 0; i < asks.length; i++) {
    ask_total += `<div class="div-${i}"><p>${formatPrice(asks[i][0])}</p><p class="qnt ord_quantity_d">${formatQty(asks[i][1])}</p></div>`;
  }
  document.querySelector('.asks').innerHTML = ask_total;

  // Build BIDS HTML
  let bid_total = ``;
  let lastAskQty = 0, lastBidQty = 0;

  for (let i = 0; i < bids.length; i++) {
    const bidQty = parseFloat(formatQty(bids[i][1]));
    const askQty = parseFloat(formatQty(asks[i][1]));

    if (i === 5) {
      lastBidQty = bidQty;
      lastAskQty = askQty;
    }

    bid_total += `<div class="div-${i}"><p>${formatPrice(bids[i][0])}</p><p class="qnt ord_quantity_d">${formatQty(bids[i][1])}</p></div>`;
  }

  document.querySelector('.bids').innerHTML = bid_total;

  // CLASS TOGGLE
  if (lastBidQty > lastAskQty) {
    document.querySelector('.asks').classList.add('first-aback');
    document.querySelector('.bids').classList.add('first-bback');
    document.querySelector('.asks').classList.remove('second-aback');
    document.querySelector('.bids').classList.remove('second-bback');
  } else {
    document.querySelector('.asks').classList.add('second-aback');
    document.querySelector('.bids').classList.add('second-bback');
    document.querySelector('.asks').classList.remove('first-aback');
    document.querySelector('.bids').classList.remove('first-bback');
  }
}


let price = 0;
let old_p = 0;
const priceEmitter = new EventTarget();
const pirce_el = document.querySelector('.order-book .price');
let latestPrice = null;
// Step 2: Start WebSocket for live trades
function startJSWebSocketTradeFeed() {
  if (!countryChecked) {
    return setTimeout(startJSWebSocketTradeFeed, 200);
  }
  if (!checkOnline()) return; 
  // If blocked → PHP proxy fetch instead of websocket
  if (isBlocked) {
    setInterval(() => {
      fetch(`./user_data/api_ws_price.php?symbol=${coin_name}`)
        .then(res => res.json())
        .then(data => {
          if (data.price) {
            latestPrice = parseFloat(data.price);
          }
        })
        .catch(err => {
          console.error("PHP trade feed failed:", err);
        });
    }, 1000);

    return; // STOP normal websocket
  }
  // Not blocked
  // Step 1: Load initial snapshot quickly from Binance REST API
  fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${coin_name.toUpperCase()}`)
  .then(r => r.json())
  .then(d => {
    latestPrice = parseFloat(d.price);

    // If SOL/APT → send to PHP immediately for edited price
    if (coin_name === 'solusdt' || coin_name === 'aptusdt') {
      const req = new XMLHttpRequest();
      req.open("POST", "./user_data/price.php", true);
      req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      req.onload = () => {
        let finalPrice = parseFloat(req.responseText);
        if (!isNaN(finalPrice)) updatePriceUI(finalPrice);
      };
      req.send("price=" + latestPrice + "&Coin=" + coin_name);
    } else {
      updatePriceUI(latestPrice);
    }
  })
  .catch(() => {});
  // Step 2: Start WebSocket for live trades
  const ws_price = new WebSocket(`wss://stream.binance.com:9443/ws/${coin_name}@trade`);
  ws_price.onmessage = (e) => {
    const data_ob = JSON.parse(e.data);
    if (data_ob && data_ob.p) {
      latestPrice = parseFloat(data_ob.p);
    }
  };
}
startJSWebSocketTradeFeed();


// Send once every 1.3 seconds
setInterval(() => {
  if (latestPrice !== null) {
    if (coin_name === 'solusdt' || coin_name === 'aptusdt') {
      const req = new XMLHttpRequest();
      req.open("POST", "./user_data/price.php", true);
      req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      req.onload = () => {
        let finalPrice = parseFloat(req.responseText);
        if (!isNaN(finalPrice)) updatePriceUI(finalPrice);
      };
      req.send("price=" + latestPrice + "&Coin=" + coin_name);
    } else {
      // Other coins → update directly
      updatePriceUI(latestPrice);
    }
  }
}, 1000);
// Utility function to update UI + dispatch event
function updatePriceUI(finalPrice) {
    // Update price color 
  if (finalPrice !== old_p) {
    pirce_el.style.color = finalPrice > old_p ? '#01bd8d' : '#f65354';
  }
  old_p = finalPrice;

  // Format display
  pirce_el.innerHTML = finalPrice > 50 ?  parseFloat(finalPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : finalPrice > 1 ? finalPrice.toFixed(3)
                        : finalPrice > 0.1 ? finalPrice.toFixed(5)
                        : finalPrice.toFixed(8);

  // Dispatch price update
  const priceEvent = new CustomEvent('priceUpdate', { detail: finalPrice });
  priceEmitter.dispatchEvent(priceEvent);
}
function onPriceUpdateOnce(callback) {
  priceEmitter.addEventListener('priceUpdate', (event) => {
    callback(event.detail); // Pass the price to the callback
  },{ once: true });
}
function onPriceUpdate(callback) {
  priceEmitter.addEventListener('priceUpdate', (event) => {
    callback(event.detail); // Pass the price to the callback
  });
}

document.querySelector('.coin_details').addEventListener('click', ()=>{
  document.querySelector('.contract-sidebar').style.width = '300px';
  document.querySelector('.close-cont-side').style.display = 'flex';
  document.querySelector('.cont-search').style.display = 'flex';
});
document.querySelector('.close-cont-side').addEventListener('click',()=>{
  document.querySelector('.contract-sidebar',).style.width = 0;
  document.querySelector('.close-cont-side').style.display = 'none';
  document.querySelector('.cont-search').style.display = 'none';

});
//lever management
const leverOverlay = document.querySelector(".lever-overlay");
const leverDisplay = document.getElementById("leverDisplay");
const leverText = leverDisplay.querySelector(".lever-text");

if (leverOverlay) {
  const r = leverOverlay.querySelector("input[type=range]");
  const fill = leverOverlay.querySelector(".fill");
  const thumb = leverOverlay.querySelector(".thumb");
  const tip = leverOverlay.querySelector(".tooltip");
  const val = leverOverlay.querySelector(".value");
  const lever_marks = [...leverOverlay.querySelectorAll(".mark")];
  let leverage_storage = localStorage.getItem("userLeverage") || "50";
  r.value = leverage_storage;
  val.textContent = leverage_storage + "x";
  tip.textContent = leverage_storage + "x";
  leverText.textContent = leverage_storage + "x";
  const SNAP_VALUES = [1, 50, 100, 150, 200];

  function percent(v){
    return (v - 1) / 199 * 100;
  }

  function snapValue(v){
    let closest = v;
    let minDiff = Infinity;

    SNAP_VALUES.forEach(s=>{
      const d = Math.abs(s - v);
      if(d < minDiff && d <= 3){
        minDiff = d;
        closest = s;
      }
    });

    return closest;
  }

  function update(show){
    const value = Number(r.value);
    const p = percent(value);

    const track = leverOverlay.querySelector(".track");
    const trackW = track.clientWidth;
    const thumbW = 16;

    const px = (p / 100) * trackW;
    const left = Math.min(trackW - thumbW, Math.max(0, px - thumbW / 2));

    fill.style.width = p + "%";
    thumb.style.left = left + "px";
    tip.style.left = px + "px";

    tip.textContent = value + "x";
    val.textContent = value + "x";
    tip.style.display = show ? "block" : "none";

    lever_marks.forEach(m=>{
      const mv = Number(m.dataset.v);
      const mLeft = parseFloat(m.style.left);
      const mPx = (mLeft / 100) * trackW;
      const thumbCenter = left + thumbW / 2;

      const isOverlapping = Math.abs(thumbCenter - mPx) < thumbW;

      if (value === mv) {
        m.style.visibility = "hidden";
        const span = m.querySelector("span");
        span.style.visibility = "visible";
        span.style.opacity = "1";
      } else {
        m.style.visibility = "visible";
        m.classList.toggle("active", mv <= value);
      }
    });
  }
  

  function step(d){
    r.value = Math.min(200, Math.max(1, Number(r.value) + d));
    update(true);
    // Hide tooltip after 800ms
    clearTimeout(r._tipTimeout);
    r._tipTimeout = setTimeout(() => {
      tip.style.display = "none";
    }, 800);
  }

  function closeSheet(){
    leverOverlay.style.display="none";
  }


  /* EVENTS */
  r.addEventListener("input", ()=>{ update(true); });

  function endDrag(){
    r.value = snapValue(Number(r.value));
    update(false);
  }

  r.addEventListener("change", endDrag);
  r.addEventListener("mouseup", endDrag);
  r.addEventListener("touchend", endDrag);
  r.addEventListener("mouseleave", ()=>tip.style.display="none");

  // Add click event for the close button
  const closeBtn = leverOverlay.querySelector(".close");
  if (closeBtn) closeBtn.addEventListener("click", closeSheet);
  leverOverlay.addEventListener('click', (e)=>{
    if (e.target.id === 'leverOverlay') {
      closeSheet();
    }
  })

  /* INIT */
  update(false);

  // Optional: add step buttons
  const stepButtons = leverOverlay.querySelectorAll(".control button");
  if(stepButtons.length === 2){
    stepButtons[0].addEventListener("click", ()=>step(-1));
    stepButtons[1].addEventListener("click", ()=>step(1));
  }
  // Confirm button
  const confirmBtn = leverOverlay.querySelector(".confirm");
  confirmBtn.addEventListener("click", () => {
    leverage = r.value; // get current slider value
    localStorage.setItem("userLeverage", leverage); 
    leverText.textContent = leverage + "x"; 
    val.textContent = leverage + "x";       
    tip.textContent = leverage + "x";     
    leverOverlay.style.display = "none";    
  });
  leverDisplay.addEventListener('click', ()=>{
    leverOverlay.style.display = 'flex';
    let leverage_storage = localStorage.getItem("userLeverage") || "50";
    r.value = leverage_storage;
    val.textContent = leverage_storage + "x";
    tip.textContent = leverage_storage + "x";
   update(false);
  });
}


function getUserLeverage() {
  return Number(localStorage.getItem('userLeverage') || "50");
}

let m_l_p = document.querySelector('.m-l-p');
let mr_p = document.querySelector('.market-p input');
let c_b = document.querySelector('.b-value .c-b-value');
let coin_amount_f = document.querySelector('.coin-amount input');
let coin_name_for_plholder = coin_name.substring(0, coin_name.length-4);
if (coin_name_for_plholder === 'sol') {
  coin_name_for_plholder = fnk_token.substring(0, fnk_token.length-4);
}else if (coin_name_for_plholder === 'apt') {
  coin_name_for_plholder = ckb_token.substring(0, ckb_token.length-4);
}
coin_amount_f.setAttribute('placeholder',`Amount ${coin_name_for_plholder.toLocaleUpperCase()}`);
let usdt_amount_f = document.querySelector('.usdt-amount input');
function loadChanges() {
  if (!countryChecked) {
    return setTimeout(loadChanges, 200);
  }
  if (!checkOnline()) return; 

  const urlBlocked   = `./user_data/api_get_changes.php?symbol=${coin_name.toUpperCase()}`;
  const urlDirect    = `https://api.binance.com/api/v3/ticker/24hr?symbol=${coin_name.toUpperCase()}`;

  const finalURL = isBlocked ? urlBlocked : urlDirect;

  fetch(finalURL)
    .then(res => res.json())
    .then(data => {

      // Your original code EXACTLY preserved
      let changges = parseFloat(data.priceChangePercent).toFixed(2);
      let change_el = document.querySelector('.contract_head .changes');

      if (changges > 0) {
        change_el.classList.add('cc-g');
      } else {
        change_el.classList.add('cc-l');
      }

      changges = changges + '%';
      change_el.innerText = changges;

      if (m_l_p.value === 'market') {
        mr_p.setAttribute('readonly', '');
        mr_p.classList.add('mrk_h');
        mr_p.setAttribute('placeholder', 'Current best price');
      }

      m_l_p.addEventListener('change', () => {
        if (m_l_p.value === 'market') {
          mr_p.setAttribute('readonly', '');
          mr_p.classList.add('mrk_h');
          mr_p.setAttribute('type', 'text');
          mr_p.value = 'Current best price';

        } else {
          mr_p.removeAttribute('readonly', '');
          mr_p.classList.remove('mrk_h');
          mr_p.setAttribute('type', 'number');
          mr_p.value = parseFloat(data.lastPrice);
        }
      });

    })
    .catch(err => {
      console.error("Ticker fetch error:", err);
    });
}
loadChanges();


async function fetchFundingData() {
  // PHP proxy (for blocked countries)
  const urlBlocked = `./user_data/api_get_funding.php?symbol=${coin_name.toUpperCase()}`;

  // Direct Binance API
  const urlDirect = `https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${coin_name.toUpperCase()}`;

  const finalURL = isBlocked ? urlBlocked : urlDirect;

  try {
    const resp = await fetch(finalURL);
    const data = await resp.json();
    return data;

  } catch (err) {
    console.error("Error fetching funding data", err);
    return null;
  }
}


function formatTime(ms) {
  const total = Math.max(ms, 0);
  const sec = Math.floor((total / 1000) % 60);
  const min = Math.floor((total / (1000 * 60)) % 60);
  const hrs = Math.floor(total / (1000 * 60 * 60));
  return `${hrs.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function updateCountdown() {
  if (!nextFundingTime) return;
  const now = Date.now();
  const remaining = nextFundingTime - now;

  const valueElement = document.querySelector('.fund-rate .value');
  if (valueElement) {
    valueElement.innerText =
      `${currentFunding} / ${formatTime(remaining)}`;
  }
}

async function initFunding() {
  if (!countryChecked) {
    return setTimeout(initFunding, 200);
  }
  if (!checkOnline()) return; 
  const d = await fetchFundingData();
  const valueElement = document.querySelector('.fund-rate .value');

  if (d && d.nextFundingTime && valueElement) {
    nextFundingTime = d.nextFundingTime;
    const fr = parseFloat(d.lastFundingRate) * 100;
    currentFunding = `${fr.toFixed(4)}%`;  // store formatted funding

    valueElement.innerText = `${currentFunding} / Loading...`;
  } else if (valueElement) {
    valueElement.innerText = `N/A / --:--:--`;
  }

  setInterval(updateCountdown, 1000);
}

let nextFundingTime = null;
let currentFunding = "0.0000%";

initFunding();

 

//insert position
var insert_httr = new XMLHttpRequest();
function insert_xmlhttpr() {
  insert_httr.open("POST","./user_data/insert_p.php",true);
  insert_httr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
}

 // check_position
 var checkp_httr = new XMLHttpRequest();
 function checkp_xmlhttpr() {
   checkp_httr.open("POST","./user_data/check_p.php",true);
   checkp_httr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
 }

 // third reques
 var up_httr = new XMLHttpRequest();
 function up_xmlhttpr() {
   up_httr.open("POST","./user_data/update_b.php",true);
   up_httr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
 }

// database reques getting all positions
var httpr = new XMLHttpRequest();
function httpXmlrequest() {
  httpr.open("POST","./user_data/cont_o.php",true);
  httpr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
}
//get balance
var httpr_getb = new XMLHttpRequest();
function getConb() {
  httpr_getb.open("POST","./user_data/get_b.php",true);
  httpr_getb.setRequestHeader("Content-type","application/x-www-form-urlencoded");
}

async function returContBalane() {
  all_load.style.display = 'flex';
  getConb();
  return new Promise((resolve, reject) => {
    httpr_getb.onload = () => {
      let response = JSON.parse(httpr_getb.responseText);
      if (response) {
        all_load.style.display = 'none';
      }
      const balance = parseFloat(response[0]);
      resolve(balance);
    };
    httpr_getb.onerror = () => reject("Failed to load balance");
    httpr_getb.send("cont_b=");
  });
}
let cachedBalance = null;

let userLeverage = getUserLeverage();
(async () => {
   cachedBalance = await returContBalane();
  c_b.innerHTML = cachedBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const max_open = document.querySelector('.max-open-usdt .value');
  max_open.innerText = (userLeverage * cachedBalance).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " USDT";
})();
async function refreshCachedBalance() {
  cachedBalance = await returContBalane();
  return cachedBalance; // in case you need it immediately
}

// position sizing slider
const slider = document.getElementById("diamondSlider");
const marks = document.querySelectorAll(".slider-container .mark");
const sliderValue = document.getElementById("sliderValue");

let hideTimeout = null;

function updateSlider(showTooltip = true) {
  let val = (slider.value - slider.min) / (slider.max - slider.min);
  let percent = val * 100;
  slider.style.background = theme_determ === 'light'
  ? `linear-gradient(to right, #000 0%, #000 ${percent}%, #ddd ${percent}%, #ddd 100%)`
  : `linear-gradient(to right, #fff 0%, #fff ${percent}%, #555 ${percent}%, #555 100%)`;

  // Update marks
  marks.forEach((mark, index) => {
    let markVal = (index / (marks.length - 1)) * 100;
    if (percent >= markVal) {
      mark.classList.add("active");
    } else {
      mark.classList.remove("active");
    }

    // Hide mark if thumb is on it
    if (percent === markVal) {
      mark.classList.add("hidden");
    } else {
      mark.classList.remove("hidden");
    }
  });

  // Tooltip
  sliderValue.textContent = slider.value + "%";
  if (percent < 4) {
    sliderValue.style.left = `4%`;
  }else if (percent > 93) {
    sliderValue.style.left = `93%`;
  }else{
    sliderValue.style.left = `${percent}%`;
  }

  if (slider.value > 0 && showTooltip) {
    sliderValue.classList.add("show");
  }
}

  // Show tooltip while dragging
  slider.addEventListener("input", () => {
    clearTimeout(hideTimeout);
    updateSlider(true);
  });

  // Hide tooltip after release (always)
  function hideTooltipAfterRelease() {
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      sliderValue.classList.remove("show");
    }, 1000); // hides 1s after release
  }

  slider.addEventListener("change", hideTooltipAfterRelease);
  slider.addEventListener("mouseup", hideTooltipAfterRelease);   // mouse release
  slider.addEventListener("touchend", hideTooltipAfterRelease); // mobile release

updateSlider(false);
//position sizing slider end here
//Reset slider here
function resetSlider() {
  // Reset slider value
  slider.value = 0;
  asset_clicked = false;
  coin_amount_f.value = '';
  usdt_amount_f.value = '';

  // Reset background (default = all gray)
   slider.style.background = theme_determ === 'light'
  ? `linear-gradient(to right, #ddd 0%, #ddd 100%)`
  : `linear-gradient(to right, #555 0%, #555 100%)`;

  // Reset marks (remove active + hidden)
  marks.forEach(mark => {
    mark.classList.remove("active", "hidden");
  });

  // Reset tooltip
  sliderValue.textContent = "0%";
  sliderValue.classList.remove("show");
  sliderValue.style.left = "4%";

  // Cancel any hide timers
  clearTimeout(hideTimeout);
}
//Reset slider end here
const cost_usdt = document.querySelector('.cost-usdt .value');
cost_usdt.innerText = "0.00" +" USDT";

let asset_clicked = false;
let service_fee =0;
let asset_ratio;
function assetRatio(ratio) {
  if (ratio < 1 && !cachedBalance) {
    return; // do nothing
  }
  asset_clicked = true;
  let c_b_value = cachedBalance;
  asset_ratio = ratio;
  c_b_value = c_b_value * ratio /100;
  cost_usdt.innerText = c_b_value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " USDT";
  usdt_amount_f.value = c_b_value.toFixed(2) + ' USDT';
  onPriceUpdateOnce((price)=>{
    let coin_amount = c_b_value / price;
    if (coin_amount < 10) {
    coin_amount = parseFloat(coin_amount).toFixed(8);
    
    }else{
    coin_amount = parseFloat(coin_amount).toFixed(5);
    }
    let fielld_lab = coin_name;
    if (fielld_lab === 'solusdt') {
      fielld_lab = fnk_token;
      coin_amount_f.value = coin_amount + ` ${(fielld_lab.replace('USDT', ''))}`;
    }else if (fielld_lab === 'aptusdt') {
      fielld_lab = ckb_token;
      coin_amount_f.value = coin_amount + ` ${(fielld_lab.replace('USDT', ''))}`;
    }else{
      coin_amount_f.value = coin_amount + ` ${(coin_name.replace('usdt', '')).toUpperCase()}`;
    }
  })
  
}

let lastVibrated = null;
const milestones = [25, 50, 75, 100];

slider.addEventListener("input", () => {
  const value = parseInt(slider.value);
  assetRatio(value); // your existing call

  // convert to % (if slider min=0 and max=100 you can just use value directly)
  const percent = Math.round((value - slider.min) / (slider.max - slider.min) * 100);

  // milestone vibration
  if (navigator.vibrate) {
    milestones.forEach(level => {
      if (percent === level && lastVibrated !== level) {
        navigator.vibrate(60); // short buzz
        lastVibrated = level;
      }
    });

    if (!milestones.includes(percent)) {
      lastVibrated = null;
    }
  }
});

const contr_ins = document.querySelector('.contr-instr');
function contractInst(instruc) {
  contr_ins.innerText = instruc;
  contr_ins.style.display = 'flex';
  setTimeout(() => {
    contr_ins.style.display = 'none';
  }, 2000);
  
}
const long_p = document.querySelector('.long-p');
const short_p = document.querySelector('.short-p');
long_p.addEventListener('click', () =>{
  onPriceUpdateOnce((price)=>{
    let lever = getUserLeverage();
    if (!Number.isFinite(lever) || lever < 1 || lever > 200) {
      lever = 50;
    }
    let total_c_balance = cachedBalance;
    if (total_c_balance <= 0) {
      contractInst('Insufficient balance to open a position.');
      return;
    }
    if (asset_ratio > 100) {
      contractInst('Something went wrong, try again!');
      return;
    }
    if(!asset_clicked){
      contractInst('Select the percentage of your balance to use');
      return;
    }
    if ((total_c_balance * asset_ratio /100) * lever  >= 5 && total_c_balance) {
      if (coin_amount_f.value !== '') {
        checkp_xmlhttpr();
        all_load.style.display = 'flex';
        checkp_httr.onload =()=>{
        let check_p = JSON.parse(checkp_httr.responseText);
        check_p = check_p[0]; 
        if (check_p === '0') {
          asset_clicked = false;
          let margin = total_c_balance * parseFloat(asset_ratio) /100;
          service_fee = (margin * lever) * 0.1/100;
          total_c_balance = total_c_balance - margin; 
          margin = margin -service_fee;
          //update cont balance
          up_xmlhttpr();
          up_httr.onload = ()=>{
            let up_res = JSON.parse(up_httr.responseText);
            up_res = up_res['0'];
            if (up_res === 's') {
              c_b.innerHTML = parseFloat(total_c_balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              refreshCachedBalance(); // refresh cached balance
              //let purchased_amount = parseFloat(coin_amount_f.value);
              let purchased_amount = margin / price;
              let entry_price = margin / purchased_amount;
              let size_usdt = margin * lever;
              let total_purchased_amnt = size_usdt / entry_price;
              let liq_p = (size_usdt - (margin + total_c_balance)) / total_purchased_amnt;
              if (liq_p > 50) {
                liq_p = parseFloat(liq_p).toFixed(2);
                
              }else if(liq_p > 1){
                liq_p = parseFloat(liq_p).toFixed(3);
              }else{ liq_p = parseFloat(liq_p).toFixed(7); }
              if (entry_price > 50 ) {
                entry_price = parseFloat(entry_price).toFixed(2);
                
              }else if(entry_price > 1){
                entry_price = parseFloat(entry_price).toFixed(3);
              }else{ entry_price = parseFloat(entry_price).toFixed(7); }
              let dirrection = 'Long';
              // insert position
              insert_xmlhttpr();
              insert_httr.onload = ()=>{
                let insert_res = JSON.parse(insert_httr.responseText);
                if (insert_res) {
                  all_load.style.display = 'none';
                }
                insert_res = insert_res['0'];
                if (insert_res === 's') {
                  contractInst('success');
                  resetSlider();
                  activePosition();
                }
    
              }
              insert_httr.send("long="+dirrection+"&margin="+margin.toFixed(2)+"&entry_price="+entry_price+"&size_usdt="+size_usdt.toFixed(2)+"&lever="+lever+"&service_fee="+service_fee.toFixed(2)+"&total_purchased_amnt="+total_purchased_amnt+"&liq_p="+liq_p+"&trade_coin="+coin_name);
              
              
            }

          }
          up_httr.send("update_cont="+total_c_balance);
          
        }else{
          all_load.style.display = 'none';
          contractInst(`You have a running ${coin_name} positiion`);
          
        }


        } 
        checkp_httr.send("check_long="+coin_name+"&direc="+'Long');
        
      }
      else{
        contractInst('Position failed, please try again');
      }
        
      
      
    }
    else{
      contractInst('Order notional cannot be less than 5 USDT.');
    }
    
  })
});

 short_p.addEventListener('click', () =>{
  onPriceUpdateOnce((price)=>{
    let lever = getUserLeverage();
    if (!Number.isFinite(lever) || lever < 1 || lever > 200) {
      lever = 50;
    }
    let total_c_balance = cachedBalance;
    if (total_c_balance <= 0) {
      contractInst('Insufficient balance to open a position.');
      return;
    }
    if (asset_ratio > 100) {
      contractInst('Something went wrong, try again!');
      return;
    }
    if(!asset_clicked){
      contractInst('Select the percentage of your balance to use');
      return;
    }
    if ((total_c_balance * asset_ratio /100) * lever  >= 5 && total_c_balance) {
      if (coin_amount_f.value !== '') {
        all_load.style.display = 'flex';
        checkp_xmlhttpr();
        checkp_httr.onload =()=>{
          let check_p = JSON.parse(checkp_httr.responseText);
          check_p = check_p[0];
          if (check_p === '0') {
            asset_clicked = false;
            let margin = total_c_balance * parseFloat(asset_ratio) /100;
            service_fee = (margin * lever) * 0.1/100;
            total_c_balance = total_c_balance - margin; 
            margin = margin -service_fee;
            // update cont balance
            up_xmlhttpr();
            up_httr.onload = ()=>{
              let up_respon = JSON.parse(up_httr.responseText);
              up_respon = up_respon['0'];
              if (up_respon === 's') {
                c_b.innerHTML = parseFloat(total_c_balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                refreshCachedBalance(); // refresh cached balance
                let purchased_amount = margin / price;
                let entry_price = margin / purchased_amount;
                let size_usdt = margin * lever;
                let total_purchased_amnt = size_usdt / entry_price;
                let liq_p = (size_usdt + margin + total_c_balance) / total_purchased_amnt;
          
                if (liq_p > 50) {
                  liq_p = parseFloat(liq_p).toFixed(2)
                  
                }else if(liq_p > 1){
                  liq_p = parseFloat(liq_p).toFixed(3);
                }else if(liq_p < 1){
                  liq_p = parseFloat(liq_p).toFixed(7);
                }
                if (entry_price > 50) {
                  entry_price = parseFloat(entry_price).toFixed(2)
                  
                }else if(entry_price > 1){
                  entry_price = parseFloat(entry_price).toFixed(3);
                }else if(entry_price < 1){
                  entry_price = parseFloat(entry_price).toFixed(7);
                }
                  let dirrection = 'Short';
                // insert position
                  insert_xmlhttpr();
                  insert_httr.onload = ()=>{
                    let insert_resp = JSON.parse(insert_httr.responseText);
                    if (insert_resp) {
                      all_load.style.display = 'none';
                    }
                    insert_resp = insert_resp['0'];
                    if (insert_resp === 's') {
                      contractInst('Success');
                      resetSlider();
                      activePosition();
                    }
      
                  }
                  insert_httr.send("long="+dirrection+"&margin="+margin.toFixed(2)+"&entry_price="+entry_price+"&size_usdt="+size_usdt.toFixed(2)+"&lever="+lever+"&service_fee="+service_fee.toFixed(2)+"&total_purchased_amnt="+total_purchased_amnt+"&liq_p="+liq_p+"&trade_coin="+coin_name);
                  
              }
            }
            up_httr.send("update_cont="+total_c_balance);
          }
          else{
            all_load.style.display = 'none';
            contractInst(`You have a running ${coin_name} positiio`);
            
          }
          
        } 
        checkp_httr.send("check_long="+coin_name+"&direc="+'Short');
        
      }
      else{
        contractInst('Positioin failed, please try again');
      }
      
      
    }
    else{
      contractInst('Order notional cannot be less than 5 USDT.');
    }
      
    
  })
 });
/* ---------- price infrastructure ---------- */

const latestPrices    = {};  // raw Binance
const displayedPrices = {};  // edited (PHP) – used for UI & PNL
const subscribedCoins = new Set();

function subscribeToCoinPrice(trade_coin) {
  if (subscribedCoins.has(trade_coin)) return;
  subscribedCoins.add(trade_coin);

  const useCustom = (trade_coin === 'SOLUSDT' || trade_coin === 'APTUSDT');

  // -----------------------------------------------------
  // BLOCKED USERS → use  proxy instead of WebSocket
  // -----------------------------------------------------
  if (isBlocked) {
    // 1-second polling from Binance → via PHP
    setInterval(() => {
      fetch(`./user_data/api_price_snapshot.php?symbol=${trade_coin}`)
        .then(r => r.json())
        .then(d => {
          if (!d.price) return;
          const raw = parseFloat(d.price);
          latestPrices[trade_coin] = raw;

          if (useCustom) {
            const req = new XMLHttpRequest();
            req.open("POST", "./user_data/price.php", true);
            req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            req.onload = () => {
              const edited = parseFloat(req.responseText);
              if (!isNaN(edited)) displayedPrices[trade_coin] = edited;
            };
            req.send("price=" + raw + "&Coin=" + trade_coin.toLowerCase());
          } else {
            displayedPrices[trade_coin] = raw;
          }

        });
    }, 1000);

    return;
  }

  // -----------------------------------------------------
  // NON-BLOCKED USERS → DIRECT BINANCE WEBSOCKET
  // -----------------------------------------------------
  const ws = new WebSocket(
    `wss://stream.binance.com:9443/ws/${trade_coin.toLowerCase()}@trade`
  );

  ws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d && d.p) {
      const raw = parseFloat(d.p);
      latestPrices[trade_coin] = raw;
      if (!useCustom) displayedPrices[trade_coin] = raw;
    }
  };

  if (useCustom) {
    setInterval(() => {
      const latest = latestPrices[trade_coin];
      if (!latest) return;

      const req = new XMLHttpRequest();
      req.open("POST", "./user_data/price.php", true);
      req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      req.onload = () => {
        const edited = parseFloat(req.responseText);
        if (!isNaN(edited)) displayedPrices[trade_coin] = edited;
      };
      req.send("price=" + latest + "&Coin=" + trade_coin.toLowerCase());
    }, 1000);
  }
}
//initia quick price loading
function loadInitialPrice(trade_coin) {
  const useCustom = (trade_coin === 'SOLUSDT' || trade_coin === 'APTUSDT');

  const url = isBlocked
    ? `./user_data/api_price_snapshot.php?symbol=${trade_coin}`
    : `https://api.binance.com/api/v3/ticker/price?symbol=${trade_coin}`;

  fetch(url)
    .then(r => r.json())
    .then(d => {
      const raw = parseFloat(d.price);
      if (isNaN(raw)) return;

      latestPrices[trade_coin] = raw;

      if (useCustom) {
        const req = new XMLHttpRequest();
        req.open("POST", "./user_data/price.php", true);
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        req.onload = () => {
          const edited = parseFloat(req.responseText);
          if (!isNaN(edited)) displayedPrices[trade_coin] = edited;
        };
        req.send("price=" + raw + "&Coin=" + trade_coin.toLowerCase());
      } else {
        displayedPrices[trade_coin] = raw;
      }
    });
}


/* ---------- global position list & renderer ---------- */

let positionsList = [];            // in‑memory cache of positions
let pnlLoopStarted = false;        // ensure RAF loop only starts once

function renderPositions(arr, onePair = '') {
  const container = document.querySelector('.all-positions');
  container.innerHTML = '';        // wipe old nodes

  const frag = document.createDocumentFragment();

  arr.forEach((p) => {
    if (onePair && p.trade_coin !== onePair) return;
    const {
      direction,
      margin,
      entry_price,
      size_usdt,
      lever,
      service_fee,
      total_purchased_amnt,
      liq_p,
      trade_coin
    } = p;
    let coin_label = trade_coin;
    if (coin_label === 'SOLUSDT') coin_label = fnk_token;
    else if (coin_label === 'APTUSDT') coin_label = ckb_token;
    let lever_crossm = 'Cross ' + lever + 'X';
    const dirLong = direction === 'Long';

    const unique_id = `pos-${trade_coin}-${direction.toLowerCase()}`;
    const html = `
      <div class="pos-1" id="${unique_id}">
        <div class="pos-tit ${dirLong ? 'long_p_t' : 'short_p_t'}">
          <p><span>${direction}</span> <span>${coin_label}</span>
             <span>Perp</span><span>${lever_crossm}</p></div>

        <div class="f-r">
          <div class="left"><p class="pos-lab dashed_border">Unrealized&#8239;PNL&#8239;(USDT)</p>
              <p class="u-pnl ${dirLong ? 'u-pnl-l' : 'u-pnl-sh'}"><i class="fas fa-spinner fa-pulse"></i></p></div>
              <div aria-hidden="true"></div>
          <div class="right"><p class="pos-lab">ROI</p>
              <p class="roe ${dirLong ? 'roe-l' : 'roe-sh'}"><i class="fas fa-spinner fa-pulse"></i></p></div>
        </div>

        <div class="details s-r">
        <div class="col left-col size-usdt"><p class="pos-lab dashed_border">Size&#8239;(USDT)</p>
            <p class="size-usdtv p-value">${parseFloat(size_usdt).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
           <div class="col center-col" style="text-align:start;"><p class="pos-lab">Margin&#8239;(USDT)</p>
              <p class="margin p-value ${dirLong ? 'long-margin' : 'margin-sh'}">
              ${parseFloat(margin).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          <div class="col right"><p class="pos-lab dashed_border">Margin Ratio</p>
              <p class="service-fee p-value ${dirLong ? 'long-fee' : 'fee-short'}"></p></div>
        </div>

        <div class="details t-r">
          <div class="col left-col"><p class="pos-lab dashed_border">Entry&#8239;Price(USDT)</p>
              <p class="ent-price p-value">${parseFloat(entry_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</p></div>
          <div class="col center-col" style="text-align:start;"><p class="pos-lab">Mark&#8239;Price(USDT)</p>
              <p class="mark-price p-value">---</p></div>
          <div class="col right"><p class="pos-lab dashed_border">Liq.Price(USDT)</p>
              <p class="lip-price p-value"></p></div>
        </div>

        <div class="close-p-bt">
          <button class="flsh_close" onclick="openTpsl()">Stop profit & Loss</button>
          <button class="reg_close"
                  onclick="showConfirm('${direction}','${trade_coin}')">
                  Close Position</button>
        </div>
        <div class="pos-border"></div>
      </div>
    `;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    frag.appendChild(wrapper.firstElementChild);
  });

  container.appendChild(frag);
}
//let total_cont_balance = null;
// Grab the checkbox
const hidePairsCheckbox = document.getElementById('hidePairsCheckbox');
/* ---------- main fetch‑&‑render ---------- */
function activePosition() {
  contr_ins.style.display = 'none';
  all_load.style.display   = 'flex';
  if (!countryChecked) {
    return setTimeout(activePosition, 200);
  }
  if (!checkOnline()) return;

  httpXmlrequest();
  httpr.onload =async () => {
    all_load.style.display = 'none';
    //await refreshContractBalance(true);   // force a fresh query
    positionsList = JSON.parse(httpr.responseText).map((p) => ({
      ...p,
      trade_coin: p.trade_coin.toUpperCase(),
      margin:              parseFloat(p.margin),
      size_usdt:           parseFloat(p.size_usdt),
      total_purchased_amnt:parseFloat(p.total_purchased_amnt),
      liq_p:               parseFloat(p.liq_p)
    }));

    pos_headp.innerHTML =
      `Positions(${positionsList.length})`;

    if (!positionsList.length) {
     document.querySelector('.checkbox-wrapper').style.display = 'none';
     document.querySelector('.border-pAndhead').style.display = 'none';
     document.querySelector('.close-allp').style.display = 'none';
      document.querySelector('.all-positions').innerHTML =
      `<div class="no-record"><img src="images/norecord.png" alt=""><p>No open positions</p> 
        <div class="cont_copy">
         <span>Let Top Traders Trade for You</span>
         <button onclick="window.location.href='./pages/copy_trade.php'">Copy Trading</button>
        </div>
        </div>`;
      return;
    }

    // subscribe per coin
    //loadInitialPrices(positionsList);
    positionsList.forEach(p => {
      loadInitialPrice(p.trade_coin);  
      subscribeToCoinPrice(p.trade_coin);
    });
    //show hideother pairs, close all buttons, border
    document.querySelector('.checkbox-wrapper').style.display = 'block';
    document.querySelector('.border-pAndhead').style.display = 'block';
    // render DOM And keep the hidepair checkbox as it was
    const wasChecked = localStorage.getItem('hidePairsChecked') === 'true';
    hidePairsCheckbox.checked = wasChecked;   // keeps the UI in sync
    if (wasChecked) {
      renderPositions(positionsList, coin_name.toUpperCase());
      document.querySelector('.close-allp').style.display = 'none';
    }else{renderPositions(positionsList);  document.querySelector('.close-allp').style.display = 'block';}

    // start RAF loop once
    if (!pnlLoopStarted) {
      pnlLoopStarted = true;
      requestAnimationFrame(updatePnlLoop);
    }
  };

  httpr.send('get_positions=');
}

/* ---------- RAF loop for live PNL ---------- */
const LIQUIDATION_INTERVAL = 5000;
let lastLiquidationTime = 0;
maintenanceMarginRatio = 0.005;
async function updatePnlLoop() {
  if (!positionsList || positionsList.length === 0) {
    pnlLoopStarted = false;
    return;
  }
  let total_used_margin = 0;
  let total_unrealized_pnl = 0;
  let total_position_size = 0;
  const allPricesReady = positionsList.every(pos => typeof displayedPrices[pos.trade_coin] === 'number');
  if (!allPricesReady) {
    //contractInst(`Loading prices…`);
    requestAnimationFrame(updatePnlLoop);
    return;
  }
  if (cachedBalance === null) {
    requestAnimationFrame(updatePnlLoop);
    return;
  }

  positionsList.forEach((pos) => {
    const price = displayedPrices[pos.trade_coin];
    if (typeof price !== 'number') return;

    const container = document.getElementById(
      `pos-${pos.trade_coin}-${pos.direction.toLowerCase()}`
    );
    if (!container) return;

    const pnlEl  = container.querySelector('.u-pnl');
    const roeEl  = container.querySelector('.roe');
    const markEl = container.querySelector('.mark-price');
    //const liqEl = container.querySelector('.lip-price');
    const margRatioel = container.querySelector('.service-fee');

    let pnl = 0;
    let liqPrice = 0
    if (pos.direction === 'Long') {
      pnl =  pos.total_purchased_amnt * price - pos.size_usdt;
      //liqPrice = (pos.size_usdt - (pos.margin + cachedBalance)) / pos.total_purchased_amnt;
    } else {
      pnl = pos.size_usdt - pos.total_purchased_amnt * price;
      //liqPrice = (pos.size_usdt + pos.margin + cachedBalance) / pos.total_purchased_amnt;
    }

    //maargin ratio
    const unrealizedLoss = pnl < 0 ? -pnl : 0;
    let marginR = ((pos.size_usdt* maintenanceMarginRatio + unrealizedLoss ) / cachedBalance) * 100;
    if (marginR > 100) marginR = 100;
    margRatioel.textContent = marginR.toFixed(2)+ '%';
    // Change color depending on risk
    if (marginR < 50) {
      margRatioel.style.color = '#00c087';
    } else if (marginR < 80) {
      margRatioel.style.color = '#ffb400';
    } else {
      margRatioel.style.color = '#ff4d4f';
    }

    const roe = (pnl / pos.margin) * 100;

    // Color
    const green = '#01bd8d', red = '#f65354',
          neutral = theme_determ === 'light' ? '#333' : '#ccc';
    const col = pnl > 0 ? green : pnl < 0 ? red : neutral;
    pnlEl.style.color = roeEl.style.color = col;

    // Numbers
    pnlEl.textContent = pnl.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    roeEl.textContent = roe.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + '%';


    // Mark Price formatting
    markEl.textContent =
      price > 50 ? price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : price > 1 ? price.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
      : price.toLocaleString('en-US', { minimumFractionDigits: 7, maximumFractionDigits: 7 });
     /*
    liqEl.textContent =
      liqPrice > 50 ? liqPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : liqPrice > 1 ? liqPrice.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
      : liqPrice.toLocaleString('en-US', { minimumFractionDigits: 7, maximumFractionDigits: 7 }); */
    // Track for liquidation logic
    total_used_margin += pos.margin;
    total_unrealized_pnl += pnl;
    total_position_size += pos.size_usdt;
  });

  //  Liquidation check logic
  const maintenance_margin = total_position_size * maintenanceMarginRatio;
  const equity = cachedBalance + total_used_margin + total_unrealized_pnl;
  const riskBuffer = equity - maintenance_margin;
  positionsList.forEach((pos) => {
    const price = displayedPrices[pos.trade_coin];
    if (typeof price !== 'number') return;

    const liqEl = document.querySelector(
      `#pos-${pos.trade_coin}-${pos.direction.toLowerCase()} .lip-price`
    );
    if (!liqEl) return;

    let liqPrice;

    if (riskBuffer <= 0) {
      liqPrice = price; // already liquidatable
    } else {
      if (pos.direction === 'Long') {
        liqPrice = price - (riskBuffer / pos.total_purchased_amnt);
      } else {
        liqPrice = price + (riskBuffer / pos.total_purchased_amnt);
      }
    }

    // formatting (keep your existing logic)
    liqEl.textContent =
      liqPrice > 50 ? liqPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : liqPrice > 1 ? liqPrice.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
      : liqPrice.toLocaleString('en-US', { minimumFractionDigits: 7, maximumFractionDigits: 7 });
  });

  //console.log("equity=", equity,"maintenance_margin=", maintenance_margin);
  if (equity <= maintenance_margin*1.05) {
    const now = Date.now();
    if (now - lastLiquidationTime >= LIQUIDATION_INTERVAL) {
      lastLiquidationTime = now;
      fetch('./user_data/liquidation_check.php', { method: 'POST' })
      .then(r => r.json())
      .then(d => {
        if (d.status === 'liquidated') {
          c_b.textContent = d.contract;
          activePosition();
          refreshCachedBalance();
        }
      });

      
    }

  }
  requestAnimationFrame(updatePnlLoop); 
} 
document.querySelector('.close-allp').addEventListener('click', ()=>{
  showConfirm('all');
});

let currentPosition = { direction: null, coin: null };

function showConfirm(direction, trade_coin) {
  const confirmBtn = document.querySelector(".confirm-btn");
  const confirmMessage = document.getElementById("confirmMessage"); 
  if (direction === 'all') {
    confirmBtn.onclick = function() {
        confirmClose('all');
    };
    document.getElementById("positionLabel").innerHTML = `Close All Positions`; 
    confirmMessage.textContent = "Are you sure you want to close all positions?";
    document.getElementById("confirmDialog").style.display = "flex";
    return;
  }
  currentPosition = { direction, coin: trade_coin.toLowerCase() };
  const label = document.getElementById("positionLabel");
  let coinFclose = trade_coin;
  if (trade_coin === "SOLUSDT") {
    coinFclose = fnk_token;
  }else if(trade_coin === "APTUSDT"){
    coinFclose = ckb_token
  }

  const dirClass = direction.toLowerCase() === 'short' ? 'short-dir' : 'long-dir';
  label.innerHTML = `${coinFclose.toUpperCase()} <span class="${dirClass}">${direction}</span>`;
  confirmMessage.textContent = "Are you sure you want to close this position?";
  confirmBtn.onclick = function() {
     confirmClose('single');
  };

  document.getElementById("confirmDialog").style.display = "flex";
}

function hideConfirm() {
  document.getElementById("confirmDialog").style.display = "none";
}
function confirmClose(mode) {
    hideConfirm();
    if (mode === 'all') {
        closeAllPositions();
    } else {
        closePosition(currentPosition.coin, currentPosition.direction);
    }
}

function overlayClick(event) {
  if (event.target.id === "confirmDialog") {
    hideConfirm();
  }
}
let close_request = false;

function closePosition(trade_coin, direction) {
  if (close_request) return;

  close_request = true;
  document.querySelector('.close-allp').disabled = true;
  document.querySelectorAll('.reg_close').forEach(btn => btn.disabled = true);

  all_load.style.display = 'flex';

  let price = displayedPrices[trade_coin.toUpperCase()];
  if (!price || isNaN(price)) {
    contractInst('Please wait for price to load and try again!');
    console.error("Invalid price for", trade_coin);
    resetCloseState(); //Reset on error
    return;
  }

  const req = new XMLHttpRequest();
  req.open("POST", "./user_data/positions.php", true);
  req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  req.onload = () => {
    let res;
    try {
      res = JSON.parse(req.responseText);
    } catch {
      console.error("Invalid response from server");
      resetCloseState();
      return;
    }

    if (!res || !res.margin) {
      console.error("Position not found or response invalid");
      resetCloseState();
      return;
    }

    let { margin, size_usdt, total_purchased_amnt, liq_p } = res;
    margin = parseFloat(margin);
    size_usdt = parseFloat(size_usdt);
    total_purchased_amnt = parseFloat(total_purchased_amnt);
    liq_p = parseFloat(liq_p);

    let un_pnl = 0;
    if (direction === 'Long') {
      un_pnl = (price > liq_p ? total_purchased_amnt * price : total_purchased_amnt * liq_p) - size_usdt;
    } else {
      un_pnl = size_usdt - (price < liq_p ? total_purchased_amnt * price : total_purchased_amnt * liq_p);
    }

    const roe = (un_pnl / margin * 100).toFixed(2);

    let cont_balance = cachedBalance;
    cont_balance += un_pnl + margin;
    if (cont_balance < 0) cont_balance = 0;
    up_xmlhttpr();
    up_httr.onload = () => {
      if (JSON.parse(up_httr.responseText)[0] === 's') {
        c_b.innerHTML = cont_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        refreshCachedBalance();
        const closeReq = new XMLHttpRequest();
        closeReq.open("POST", "./user_data/positions_close.php", true);
        closeReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        closeReq.onload = () => {
          try {
            const closeRes = JSON.parse(closeReq.responseText);
            if (closeRes.status === 's') {
              activePosition();
            }
          } catch (e) {
            console.error("Failed to parse close response");
          }
          resetCloseState();
        };

        closeReq.onerror = resetCloseState;
        closeReq.send(
          `close_position=1&direction=${direction}&trade_coin=${trade_coin}&pnl=${un_pnl.toFixed(2)}&roe=${roe}`
        );
      } else {
        console.error("Contract balance update failed");
        resetCloseState();
      }
    };

    up_httr.onerror = resetCloseState;
    up_httr.send("update_cont=" + cont_balance);
  
  };

  req.onerror = resetCloseState;
  req.send("get_position=" + trade_coin + "&direction=" + direction);
}

// Helper to reset state and re-enable UI
function resetCloseState() {
  resetSlider();
  close_request = false;
  document.querySelector('.close-allp').disabled = false;
  document.querySelectorAll('.reg_close').forEach(btn => btn.disabled = false);
  all_load.style.display = 'none';

}
//close all positions
function closeAllPositions() {
    if (close_request) return;

    close_request = true;
    document.querySelector('.close-allp').disabled = true;
    document.querySelectorAll('.reg_close').forEach(btn => btn.disabled = true);
    all_load.style.display = 'flex';

    // 1. Get all active positions from server
    const req = new XMLHttpRequest();
    req.open("POST", "./user_data/positions_all.php", true);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    req.onload = () => {
        let positions;
        try {
            positions = JSON.parse(req.responseText);
        } catch {
            console.error("Invalid positions_all.php response");
            resetCloseState();
            return;
        }

        if (!Array.isArray(positions) || positions.length === 0) {
            console.warn("No active positions found.");
            resetCloseState();
            return;
        }

        let totalUnrealized = 0;
        const closedData = [];

        positions.forEach(pos => {
            let { trade_coin, direction, margin, size_usdt, total_purchased_amnt, liq_p } = pos;
            trade_coin = trade_coin.toLowerCase();
            let price = displayedPrices[trade_coin.toUpperCase()];
            if (!price || isNaN(price)) {
                console.error("Invalid price for", trade_coin);
                return;
            }

            margin = parseFloat(margin);
            size_usdt = parseFloat(size_usdt);
            total_purchased_amnt = parseFloat(total_purchased_amnt);
            liq_p = parseFloat(liq_p);

            let un_pnl = 0;
            if (direction === 'Long') {
                un_pnl = (price > liq_p ? total_purchased_amnt * price : total_purchased_amnt * liq_p) - size_usdt;
            } else {
                un_pnl = size_usdt - (price < liq_p ? total_purchased_amnt * price : total_purchased_amnt * liq_p);
            }

            const roe = (un_pnl / margin * 100).toFixed(2);
            totalUnrealized += (un_pnl + margin);

            closedData.push({
                trade_coin,
                direction,
                pnl: un_pnl.toFixed(2),
                roe
            });
        });
        // 2. Get and update contract balance first
        let cont_balance = cachedBalance;
        cont_balance += totalUnrealized;
        if (cont_balance < 0) cont_balance = 0;
        up_xmlhttpr();
        up_httr.onload = () => {
            if (JSON.parse(up_httr.responseText)[0] === 's') {
                c_b.innerHTML = cont_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                refreshCachedBalance();

                // 3. Close all positions in DB
                const closeReq = new XMLHttpRequest();
                closeReq.open("POST", "./user_data/positions_close_all.php", true);
                closeReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                closeReq.onload = () => {
                    try {
                        const closeRes = JSON.parse(closeReq.responseText);
                        if (closeRes.status === 's') {
                            activePosition();
                        }
                    } catch (e) {
                        console.error("Failed to parse close all response");
                    }
                    resetCloseState();
                };
                closeReq.onerror = resetCloseState;
                closeReq.send("close_all=1&positions=" + encodeURIComponent(JSON.stringify(closedData)));
            } else {
                console.error("Contract balance update failed");
                resetCloseState();
            }
        };
        up_httr.onerror = resetCloseState;
        up_httr.send("update_cont=" + cont_balance);
        
    };
    req.onerror = resetCloseState;
    req.send("get_all=1");
}
/*---------------------------------------------------------------------------------------------------------- */
activePosition();

// Manage the checkbox
hidePairsCheckbox.addEventListener('change', () => {
  localStorage.setItem('hidePairsChecked', hidePairsCheckbox.checked);
  if (hidePairsCheckbox.checked) {
   renderPositions(positionsList,coin_name.toUpperCase());
   document.querySelector('.close-allp').style.display = 'none';
  } else {
    renderPositions(positionsList);
    document.querySelector('.close-allp').style.display = 'block';
  }
});



const trans_bt = document.querySelector('.transfer-cont');
trans_bt.addEventListener('click', ()=>{
  location.href = './pages/transfer.php?source=contract';
});

const trade_chart = document.querySelector('.trade_chart');
trade_chart.addEventListener('click', ()=>{
  all_load.style.display = 'flex';
  location.href = `./pages/chart.php?${coin_name}`;
});

const chart_theme = theme_determ === 'light' ? '#f7f7f7' : '#2C2C34';
const chart_text = theme_determ === 'light' ? '#696969ff' : '#B0B0B0';
const chart_grids = theme_determ === 'light' ? '#eae9e9ff' : '#32323aff';
const cont_chart = document.querySelector('.new_chart');
const chart = LightweightCharts.createChart(document.getElementById('chart'), {
    layout: {
      textColor: `${chart_text}`,
      background: {
        color: `${chart_theme}`,
      },
      fontSize: 11,
    },
    grid: {
      vertLines: {
        color: `${chart_grids}`,
      },
      horzLines: {
        color: `${chart_grids}`,
      },
    },
    rightPriceScale: {
      borderColor: 'transparent',
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
      entireTextOnly: true,
      drawTicks: false,
      mode: 1, // Lock scale mode
      width: 60, 
    },
    timeScale: {
      borderColor: 'transparent',
      timeVisible: true, 
      secondsVisible: false,
      ticksVisible: true,
      rightOffset: 12,
      barSpacing: 8,
      minBarSpacing: 2, // Allows tighter zoom
      fixLeftEdge: false, // Required for zooming
      fixRightEdge: false, // Required for zooming
      lockVisibleTimeRangeOnResize: true,
      tickMarkFormatter: (time, tickMarkType, locale) => {
      const d = new Date(time * 1000); // if time is UNIX seconds
      const dd = ('0' + d.getDate()).slice(-2);
      const hh = ('0' + d.getHours()).slice(-2);
      const min = ('0' + d.getMinutes()).slice(-2);
      return `${dd} ${hh}:${min}`;
      },
    },
     // ===== Mobile-Friendly Interaction Settings =====
  interaction: {
    hover: true,
    mouseWheel: {
      enabled: true,
      speed: 0.5,
      axis: 'x', // X-axis zoom only
    },
    horzTouchDrag: true,  // Allow horizontal scrolling
    vertTouchDrag: false, // Block vertical dragging
    pinch: {
      enabled: true,      // ENABLE PINCH ZOOM
      axis: 'x',          // Restrict to horizontal zoom
    },
    scrollVertically: false,
    scrollHorizontally: true,
  },

  // ===== Scale Handling =====
  handleScale: {
    axisPressedMouseMove: {
      time: true,  // Allow touch-drag scaling on time axis
      price: false, // Keep price axis locked
    },
    mouseWheel: true,  // Allow mouse wheel zoom
    pinch: true,       // Allow pinch zoom
  },

  // ===== Mobile Optimization =====
  kineticScroll: {
    touch: true,  // Smooth scrolling for touch devices
    mouse: false,
  },
});


const cont_chrt_load = document.querySelector('.cont_chr_loading');
if (cont_chart) {
  let fetchCandlestickData;
  const binanceApiUrl = "https://api.binance.com/api/v3/klines";
  const symbol = coin_name.toUpperCase();
  let socket = null;
  //chart here
  const candleSeries = chart.addCandlestickSeries();
  
  if (symbol === 'SOLUSDT' || symbol === 'APTUSDT') {
    fetchCandlestickData = async function(change_int) {
      if (!countryChecked) {
       return setTimeout(fetchCandlestickData, 200);
      }
      cont_chrt_load.style.display = 'block';
      let interval = '';
      if (change_int) {
        interval = change_int;
      }else{
        const interval_v = localStorage.getItem('interval');
        if (interval_v) {
         const intervalMap = {
            '1m': 'o_m',
            '5m': 'f_m',
            '15m': 'ft_m',
            '1h': 'oh',
            '4h': 'fh',
            '1d': 'od'
          };

          interval = interval_v; // set interval

          const className = intervalMap[interval_v];
          if (className) {
            const elem = document.querySelector(`.${className}`);
            if (elem) {
                elem.classList.add('ative_int');
            }
          }

        }else{
          interval = '15m';
          if (document.querySelector('.ft_m')) {
            document.querySelector('.ft_m').classList.add('ative_int');
          }
        }
      }
      let cdata = [];
      let httpr_cdata = new XMLHttpRequest();
      httpr_cdata.open("POST","./user_data/a_provide_cdata.php",true);
      httpr_cdata.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      httpr_cdata.onload = async ()=>{
        let cdata_resp = JSON.parse(httpr_cdata.responseText);
        cdata_resp = cdata_resp.status;
        if (cdata_resp === 'success' || cdata_resp === "denied") {
          let httpr_ajdata = new XMLHttpRequest();
          httpr_ajdata.open("POST","./user_data/data_adjustment.php",true);
          httpr_ajdata.setRequestHeader("Content-type","application/x-www-form-urlencoded");
          httpr_ajdata.onload = async ()=>{
            const db_data = httpr_ajdata.responseText;
            if (db_data) {
              cont_chrt_load.style.display = 'none';
              cdata = db_data.trim().split('\n').map((row) => {
                const [time, open, high, low, close] = row.split(',');
                return{
                    time: time /1000,
                    open: open *1,
                    high: high *1,
                    low: low *1,
                    close: close *1,
                }
              });
              candleSeries.setData(cdata);   // Set the data to the chart
              if (!isBlocked) {
                startWebSocket(interval);
              }else {
               chartCoinsSocket(interval);     //update the chart in real time
              }

            }else{
              if (socket) {
                socket.close();
              }
              fetchCandlestickData(interval);
            }
          }
          httpr_ajdata.send("coin_name="+symbol+"&interval="+interval);
        }else{
          if (socket) {
            socket.close();
          }
          fetchCandlestickData(interval); // if data not updated request again.
        }
      }
      httpr_cdata.send("coin_name="+symbol+"&interval="+interval);
    }
    fetchCandlestickData();
  }else{
    fetchCandlestickData = async function(change_int){
      if (!countryChecked) {
       return setTimeout(fetchCandlestickData, 200);
      }
      cont_chrt_load.style.display = 'block';
      let interval = '';
      if (change_int) {
        interval = change_int;
      }else{
        const interval_v = localStorage.getItem('interval');
        if (interval_v) {
         const intervalMap = {
            '1m': 'o_m',
            '5m': 'f_m',
            '15m': 'ft_m',
            '1h': 'oh',
            '4h': 'fh',
            '1d': 'od'
          };

          interval = interval_v; // set interval

          const className = intervalMap[interval_v];
          if (className) {
            const elem = document.querySelector(`.${className}`);
            if (elem) {
                elem.classList.add('ative_int');
            }
          }
        }else{
          interval = '15m';
          if (document.querySelector('.ft_m')) {
            document.querySelector('.ft_m').classList.add('ative_int');
          }
        }
      }
      try {
        const url = isBlocked
        ? `./user_data/api_candles.php?symbol=${symbol}&interval=${interval}`
        : `${binanceApiUrl}?symbol=${symbol}&interval=${interval}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data) {
          cont_chrt_load.style.display = 'none';
        }
        const formattedData = data.map(d => ({
          time: d[0] / 1000,  // Convert to UNIX timestamp in seconds
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        }));

        candleSeries.setData(formattedData);


        if (!isBlocked) {
          startWebSocket(interval);
        }else{
         chartCoinsSocket(interval);
        }

      } catch (error) {
        console.error('Error fetching candlestick data:', error);
      }
    }
    fetchCandlestickData();

  }
  function changeInterval(interval) {
    localStorage.setItem('interval', interval);
    const intervalMap = {
      '1m': '.o_m',
      '5m': '.f_m',
      '15m': '.ft_m',
      '1h': '.oh',
      '4h': '.fh',
      '1d': '.od',
    };
    Object.values(intervalMap).forEach(selector => {
      document.querySelector(selector)?.classList.remove('ative_int');
    });
    document.querySelector(intervalMap[interval])?.classList.add('ative_int');
    if (socket) {
      socket.close();
      socket.onmessage = null;
      socket = null;
    }
    fetchCandlestickData(interval);
  }

  async function startWebSocket(interval) {
      let symbol = coin_name.toLowerCase();

      const stream = `${symbol.toLowerCase()}@kline_${interval}`;
      socket = new WebSocket(`wss://stream.binance.com:9443/ws/${stream}`);

      const needsCustom =
        symbol.toLowerCase() === "solusdt" ||
        symbol.toLowerCase() === "aptusdt";

      let open = 0, high = 0, low = 0;
      let highLowChecked = false;

      if (needsCustom) {
        const lastClose = await getLastClose(symbol, interval);
        if (lastClose) {
          open = high = low = lastClose;
        }
      }

      socket.onmessage = async (event) => {
        const obj = JSON.parse(event.data);
        const k = obj.k;
        let close = parseFloat(k.c);
        const time = k.t / 1000;

        // ---------------- CUSTOM ----------------
        if (needsCustom) {

          if (!highLowChecked) {
            highLowChecked = true;
            const hl = await getLiveHighLow(symbol, interval);
            if (hl && hl.timestamp === k.T) {
              high = hl.high;
              low = hl.low;
            }
            
          }

          
          close = await modifyPrice(close, symbol);
          if (!open) open = high = low = close;
          if (close > high) high = close;
          if (close < low) low = close;

          candleSeries.update({
            time,
            open,
            high,
            low,
            close
          });

          if (k.x) {
            open = high = low = close;
          }

          return;
        }

        // ---------------- RAW ----------------
        candleSeries.update({
          time,
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close
        });
      };

      socket.onerror = () => {};
      socket.onclose = () => console.log("WS closed");
  }


  function chartCoinsSocket(interval) {
    // Determine WebSocket URL dynamically
    let wsProtocol, wsHost, wsPort;

    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        // Local development
        wsProtocol = "ws";          // Localhost doesn't need SSL
        wsHost = "localhost";
        wsPort = 8765;              // Your local Node.js port
    } else {
        // Production (your VPS domain)
        wsProtocol = "wss";         // Use secure WebSocket for HTTPS
        wsHost = window.location.hostname;  // e.g. nawbit.com
        wsPort = "";                 // No port if using standard 443 with proxy
    }

    // Build WebSocket URL
    const wsUrl = wsPort ? `${wsProtocol}://${wsHost}:${wsPort}/ws` : `${wsProtocol}://${wsHost}/ws`;
    socket = new WebSocket(wsUrl);


    socket.onopen = function () {
      // Send coin + interval
      socket.send(JSON.stringify({
        symbol: coin_name,
        interval: interval
      }));
    };

    // Receive candle updates from Python
    socket.onmessage = function (event) {
      const candlestick = JSON.parse(event.data);

      const candlestickData = {
        time: candlestick.time,
        open: candlestick.open,
        high: candlestick.high,
        low: candlestick.low,
        close: candlestick.close,
      };

      // Update chart here
      candleSeries.update(candlestickData);
    };
    socket.onclose = function () {
      console.log('Node WebSocket connection closed');
    };

    socket.onerror = function (err) {
      console.error("WebSocket error:", err);
    };
 }

}
// new code here
async function getLastClose(symbol, interval) {
  const res = await fetch("./user_data/last_close.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `coin=${symbol}&interval=${interval}`
  });

  const data = await res.json();
  return typeof data.close === "number" ? data.close : null;
}
async function getLiveHighLow(symbol, interval) {
  const res = await fetch("./user_data/h_l.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `coin=${symbol}&interval=${interval}`
  });

  try{
    const data = await res.json();
    return data?.high ? data : null;
  } catch {
     return null;
  }
}

async function modifyPrice(price, symbol) {
  try {
    const res = await fetch("./user_data/price.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `price=${price}&Coin=${symbol}`
    });

    const text = await res.text();
    return parseFloat(text) || price;
  } catch {
    return price;
  }
}
//new code end here



const tpsl_el = document.querySelector('.set_tp_sl');
const tpsl_overl = document.querySelector('.tpsl_overlay');
async function openTpsl() {
  //tpsl_el.style.display = 'block';
  tpsl_overl.style.display = 'flex';
}
tpsl_overl.addEventListener('click', (event)=>{
  if (event.target.id === "tpslOverlayid") {
    tpsl_overl.style.display = 'none';
  }
});
document.querySelector('.close_tpsl').addEventListener('click', ()=>{
  tpsl_overl.style.display = 'none';
});
document.querySelector('.conf_tpsl').addEventListener('click', ()=>{
  tpsl_overl.style.display = 'none';
})
const contr_rec = document.querySelector('.contract-records');
contr_rec.addEventListener('click', ()=>{
  all_load.style.display = 'flex';
  location.href = './pages/trade_rec.php';
});


function mobileChart() {
  if (!countryChecked) {
    return setTimeout(mobileChart, 200)
  }
  
  //mobile contrat page chart
let mobsize_coin = coin_name.toUpperCase();
if (mobsize_coin === 'SOLUSDT') {
  mobsize_coin = fnk_token;
}else if (mobsize_coin === 'APTUSDT') {
  mobsize_coin = ckb_token;
}else{
  mobsize_coin = mobsize_coin;
}
mobsize_coin = mobsize_coin.toUpperCase() + ' Perp Chart';
const intervalBar = document.getElementById('intervalBar');
const mob_chart = document.getElementById('chart');

// Save the default HTML (so we can restore it later)
let defaultIntervalHTML = intervalBar.innerHTML;
//  On page load — set initial collapsed state if chart is hidden
if (window.getComputedStyle(mob_chart).display === 'none') {
  cont_chrt_load.style.display = 'none';
  intervalBar.style.visibility = "visible";
  intervalBar.innerHTML = `<p>${mobsize_coin}</p> <i class="fa-solid fa-caret-up cont_chrt_arrow"></i>`;
  intervalBar.classList.add('collapsed');
  
}
// Handle clicks on the down arrow
intervalBar.addEventListener('click', (e) => {
  const isArrowDown = e.target.classList.contains('fa-caret-down');
  const isArrowUp = e.target.classList.contains('fa-caret-up');
  const isWholeBarClick = e.target.closest('#intervalBar') && intervalBar.classList.contains('collapsed');

  //  When clicking the down arrow → collapse chart
  if (isArrowDown) {
    defaultIntervalHTML = intervalBar.innerHTML;
    mob_chart.style.display = 'none'; // hide chart
    intervalBar.innerHTML = `<p>${mobsize_coin}</p> <i class="fa-solid fa-caret-up cont_chrt_arrow"></i>`;
    intervalBar.classList.add('collapsed');
  }

  //  When clicking up arrow or whole bar (collapsed) → expand chart
  if (isArrowUp || isWholeBarClick) {
    console.log("chart resize");
    mob_chart.style.display = 'block'; // show chart again
    //chart.timeScale().fitContent();
    chart.resize(mob_chart.clientWidth, mob_chart.clientHeight);
    intervalBar.innerHTML = defaultIntervalHTML; // restore intervals
    
    intervalBar.classList.remove('collapsed');

  }
});
}
mobileChart();


const trade_chrimg = document.querySelector('.trade_chart');
const contrec_img = document.querySelector('.contract-records img');
if (theme_determ === 'dark') {
  trade_chrimg.src = 'images/qushi1_dark.png';
  contrec_img.src = 'images/clock_dark.png';
}




 


