
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


if(activelocation.includes('trade.php') || activelocation.includes('trade')){
  alldata = ``;
  
}
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
pos_headp.innerHTML = `Open Orders(0)`;
pos_heado.innerHTML = `Holdings`;
pos_headp.classList.add('active_p');
pos_headp.addEventListener('click', ()=>{
  pos_headp.classList.add('active_p');
  pos_heado.classList.remove('active_p');
  document.querySelector('.no-record').innerHTML = `<img src="images/norecord.png" alt=""><p>No Record</p>`;
  show_holdings.innerHTML = '';
});
let show_holdings = document.querySelector('.show_holdings');
pos_heado.addEventListener('click', ()=>{
  pos_heado.classList.add('active_p');
  pos_headp.classList.remove('active_p');
   let coin = (coin_name.replace("usdt", "")).toLocaleUpperCase();
    if (coin === 'SOL') {
      coin = 'FNC';
    }else if (coin === 'APT') {
      coin = 'CKB';
    }
    (async () => {
    const balance = await returnHoldings();
    onPriceUpdateOnce((price)=>{
      if (balance * price > 0.1) {
        show_holdings.innerHTML = ` <div class="holding-card">
        <span>Symbol</span>
        <span class="coin-name">${coin}</span>
        <span >Amount</span>
        <span class="coin-amount">${balance}</span>
      </div>`;
      document.querySelector('.no-record').innerHTML = '';
      }else{
        document.querySelector('.no-record').innerHTML = `<img src="images/norecord.png" alt=""><p>No Record</p>`;
      }
    })
  })();
});
/* fetch coins data */

const all_load = document.querySelector('.all-loading');
const all_load1 = document.querySelector('.all-loading1');
all_load1.style.display= 'flex';

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
  
}else{
  change ='&#xa0' +  change +  '&#xFE6A';
  p_element.classList.add('red');
  chng_element.classList.add('chng_l');
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
  location.href = './trade.php';
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


const open_sptEl = document.querySelector('.open_spot');
const buy_dirEl = document.querySelector('.buy-direc');
const sell_dirEl = document.querySelector('.sell-direc');
buy_dirEl.classList.add('active_buy');
open_sptEl.classList.add('active_buy');
let spot_direction = 'buy';
let coin_for_sptbtn = coin_name;
if (coin_for_sptbtn === 'solusdt') {
  coin_for_sptbtn = fnk_token.toLocaleLowerCase();
}else if (coin_for_sptbtn === 'aptusdt') {
  coin_for_sptbtn = ckb_token.toLocaleLowerCase();
}
open_sptEl.innerText = 'Buy' + ' ' + (coin_for_sptbtn.substring(0, coin_for_sptbtn.length-4)).toUpperCase();


document.querySelector('.coin_details').addEventListener('click', ()=>{
  document.querySelector('.contract-sidebar',).style.width = '300px';
  document.querySelector('.close-cont-side').style.display = 'flex';
  document.querySelector('.cont-search').style.display = 'flex';
});
document.querySelector('.close-cont-side').addEventListener('click',()=>{
  document.querySelector('.contract-sidebar',).style.width = 0;
  document.querySelector('.close-cont-side').style.display = 'none';
  document.querySelector('.cont-search').style.display = 'none';

});
let m_l_p = document.querySelector('.m-l-p');
let lever_f = document.querySelector('.lever .lever');
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
 
//get balance
var httpr_getb = new XMLHttpRequest();
function getConb() {
  httpr_getb.open("POST","./user_data/spot_o.php",true);
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
(async () => {
  const balance = await returContBalane();
  c_b.innerHTML = balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
})();
//get coin holdings
let httpr_holding = new XMLHttpRequest();
function getHodingsreq() {
  httpr_holding.open("POST","./user_data/spot_sells.php",true);
  httpr_holding.setRequestHeader("Content-type","application/x-www-form-urlencoded");
}
async function returnHoldings() {
  all_load.style.display = 'flex';
  getHodingsreq();
  return new Promise((resolve, reject) => {
    httpr_holding.onload = () => {
      let response = JSON.parse(httpr_holding.responseText);
      if (response) {
        all_load.style.display = 'none';
      }
      const holdings = parseFloat(response[0]);
      resolve(holdings);
    };
    httpr_holding.onerror = () => reject("Failed to load balance");
    httpr_holding.send("coinholdings="+coin_name);
  });
}

let asset_clicked = false;
let service_fee =0;
let asset_ratio;
function assetRatio(ratio) {
  let c_b_value;
  (async () => {
    asset_clicked = true;
    if (spot_direction === 'buy') {
      c_b_value = await returContBalane();
    }else if (spot_direction === 'sell') {
      c_b_value = await returnHoldings();
    }
    if (ratio === 25) {
      asset_ratio = 25;
      c_b_value = c_b_value*25/100;
      document.querySelector('.btn-group .t-f').classList.add('ativ-ratio');
      document.querySelector('.btn-group .f').classList.remove('ativ-ratio');
      document.querySelector('.btn-group .s-f').classList.remove('ativ-ratio');
      document.querySelector('.btn-group .h').classList.remove('ativ-ratio');
    }else if (ratio === 50) {
      asset_ratio = 50;
      c_b_value = c_b_value*50/100;
      document.querySelector('.btn-group .f').classList.add('ativ-ratio');
      document.querySelector('.btn-group .t-f').classList.remove('ativ-ratio');
      document.querySelector('.btn-group .s-f').classList.remove('ativ-ratio');
      document.querySelector('.btn-group .h').classList.remove('ativ-ratio');
      
    }else if (ratio === 75) {
      asset_ratio = 75;
      c_b_value = c_b_value*75/100;
      document.querySelector('.btn-group .s-f').classList.add('ativ-ratio');
      document.querySelector('.btn-group .f').classList.remove('ativ-ratio');
      document.querySelector('.btn-group .t-f').classList.remove('ativ-ratio');
      document.querySelector('.btn-group .h').classList.remove('ativ-ratio');
      
    }else if (ratio === 100) {
      asset_ratio = 99;
      c_b_value = c_b_value*97.5/100;
      document.querySelector('.btn-group .h').classList.add('ativ-ratio');
      document.querySelector('.btn-group .f').classList.remove('ativ-ratio');
      document.querySelector('.btn-group .t-f').classList.remove('ativ-ratio');
      document.querySelector('.btn-group .s-f').classList.remove('ativ-ratio');
      
    }
    //service_fee = parseFloat(c_b_value * 5.5/100).toFixed(2);
    //service_fee = parseFloat(service_fee);
    //c_b_value = c_b_value - service_fee;
   if (spot_direction === 'buy') {
      usdt_amount_f.value = c_b_value.toFixed(2);
      onPriceUpdateOnce((price)=>{
        let coin_amount = c_b_value / price;
        if (coin_amount < 10) {
        coin_amount = parseFloat(coin_amount).toFixed(8);
        
        }else{
        coin_amount = parseFloat(coin_amount).toFixed(5);
        }
        coin_amount_f.value = coin_amount;
      })
    }else if (spot_direction === 'sell') {
      coin_amount_f.value = c_b_value;
      onPriceUpdateOnce((p)=>{
        usdt_amount_f.value = (c_b_value * p).toFixed(2);
      })
    }
  })();
}
//spot operations
let balance_div = document.querySelector('.balance');
buy_dirEl.addEventListener('click', ()=>{
  coin_amount_f.value = '';
  usdt_amount_f.value = '';
  asset_clicked = false;
  spot_direction = 'buy';
  buy_dirEl.classList.add('active_buy');
  open_sptEl.classList.remove('active_sell');
  open_sptEl.classList.add('active_buy');
  open_sptEl.innerText = 'Buy' + ' ' + (coin_for_sptbtn.substring(0, coin_for_sptbtn.length-4)).toUpperCase();
  sell_dirEl.classList.remove('active_sell');
  (async () => {
    const balance = await returContBalane();
    balance_div.innerHTML = `<p class="blnc">Balance</p>
        <div class="b-value transfer-cont">
          <p class="c-b-value">${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} </p>
          <p>USDT</p>
          <i class="fa fa-exchange"></i>
        </div>`;
  })();
  

});
sell_dirEl.addEventListener('click', ()=>{
  coin_amount_f.value = '';
  usdt_amount_f.value = '';
  asset_clicked = false;
  spot_direction = 'sell';
  sell_dirEl.classList.add('active_sell');
  open_sptEl.classList.add('active_sell');
  open_sptEl.classList.remove('active_buy');
  open_sptEl.innerText = 'Sell' + ' ' + (coin_for_sptbtn.substring(0, coin_for_sptbtn.length-4)).toUpperCase();
  buy_dirEl.classList.remove('active_buy');
  (async () => {
    const holdings = await returnHoldings();
    let realholdings = holdings;
    if (holdings >= 1) {
      realholdings = realholdings.toFixed(4);
    }else if (holdings > 0) {
      realholdings = realholdings.toFixed(8);
    }
    let coin = (coin_name.replace("usdt", "")).toLocaleUpperCase();
    if (coin === 'SOL') {
      coin = 'FNC';
    }else if (coin === 'APT') {
      coin = 'CKB';
    }
    balance_div.innerHTML = `<p class="blnc">Balance</p>
          <div class="b-value transfer-cont">
            <p class="c-b-value">${realholdings} </p>
            <p>${coin}</p>
            <i class="fa fa-exchange"></i>
          </div>`;
})();
});

open_sptEl.addEventListener('click', ()=>{
  let new_c_b = document.querySelector('.b-value .c-b-value');
  if (spot_direction === 'buy') {
     (async () => {
    let balance = await returContBalane();
    if (balance >=  1) {
      if (asset_clicked) {
        asset_clicked = false;
        onPriceUpdateOnce((price)=>{
          total_purchase = (balance * (asset_ratio/100)) / price;
          balance = balance - balance * asset_ratio /100;
          getConb();
          all_load.style.display = 'flex';
          httpr_getb.onload = ()=>{
            let resp = JSON.parse(httpr_getb.responseText);
            resp = resp[0];
            if (resp === 'success') {
              all_load.style.display = 'none';
              new_c_b.innerHTML = balance.toFixed(2);
              coin_amount_f.value = '';
              usdt_amount_f.value = '';
              contractInst('Success!');
            }
          }
          httpr_getb.send('update_b='+balance+'&purchase='+total_purchase+'&coin='+coin_name);
          
        })
      }else{
        contractInst(`Select the percentage of your balance to use`);
      }
    }else{
      contractInst(`Insufficient balance to Buy.`);
    }
  })();
  }else if (spot_direction === 'sell') {
    (async () => {
      let holdings = await returnHoldings();
      onPriceUpdateOnce((price)=>{
          if (holdings *price >=  0.5) {
          if (asset_clicked) {
            asset_clicked = false;
              total_usdt = (holdings * asset_ratio /100) * price;
              holdings = holdings - holdings * asset_ratio /100;
              getHodingsreq();
              all_load.style.display = 'flex';
              httpr_holding.onload = ()=>{
                let resp = JSON.parse(httpr_holding.responseText);
                resp = resp[0];
                if (resp === 'success') {
                  all_load.style.display = 'none';
                  if (holdings > 1) {
                    new_c_b.innerHTML = holdings.toFixed(3);
                  }else if (holdings > 0) {
                    new_c_b.innerText = holdings.toFixed(8);
                  }
                  coin_amount_f.value = '';
                  usdt_amount_f.value = '';
                  contractInst('Success!');
                }
              }
              httpr_holding.send('update_spot='+total_usdt+'&holdings='+holdings+'&coin='+coin_name);
          }else{
            contractInst(`Select the percentage of your balance to use`);
          }
        }else{
          contractInst(`Insufficient balance to sell.`);
        }
      })
   
    })();
  }
});

const contr_ins = document.querySelector('.spot-instr');
function contractInst(instruc) {
  contr_ins.innerText = instruc;
  contr_ins.style.display = 'flex';
  setTimeout(() => {
  contr_ins.style.display = 'none';
}, 2000);

}
let pos_num = 0;
function checkHistreco() {
  if (pos_num === 0) {
    document.querySelector('.no-record').innerHTML = `<img src="images/norecord.png" alt=""><p>No Record</p>`;
   }else{
    document.querySelector('.no-record').innerHTML = ``;
   }
  
}
checkHistreco();
const trans_bt = document.querySelector('.transfer-cont');
trans_bt.addEventListener('click', ()=>{
  location.href = './pages/transfer.php?source=trade';
});
const trade_chart = document.querySelector('.trade_chart');
trade_chart.addEventListener('click', ()=>{
  all_load.style.display = 'flex';
  location.href = `./pages/chart.php?${coin_name}`;
});
setTimeout(() => {
  if (all_load.style.display === 'flex') {
    all_load.innerHTML = ' <i>Request timed out </i>';
    setInterval(() => {
      all_load.style.display = 'none';
    }, 1300);
  }
}, 10000);

const theme_determ = localStorage.getItem('theme') || 'light';
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
if (theme_determ === 'dark') {
  trade_chrimg.src = 'images/qushi1_dark.png';
}
