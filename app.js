const COUNTIES = ["Nairobi","Mombasa","Kisumu","Kiambu","Nakuru","Uasin Gishu","Machakos","Kajiado","Kilifi","Nyeri","Kakamega","Meru","Kisii","Kericho","Bungoma"];
const INTERESTS = ["Afrobeats","Football","Church","Hiking","Business","Fashion","Food","Travel","Gaming","Poetry","Gym","Farming"];
const TRIBES = ["Kikuyu","Luo","Kalenjin","Kamba","Luhya","Kisii","Meru","Mijikenda","Somali","Maasai","Other"];
const RELIGIONS = ["Christian","Muslim","Other","Prefer not to say"];
const SAMPLE_PHOTOS = [
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=80"
];
const SEED = [
  { name: "Amina Otieno", age: 26, county: "Nairobi", tribe: "Luo", religion: "Christian", bio: "Westlands weekends, chai dates, and someone who can keep up on the dance floor.", interests: ["Afrobeats","Food","Travel"], lat: -1.268, lng: 36.811 },
  { name: "Brian Mwangi", age: 29, county: "Kiambu", tribe: "Kikuyu", religion: "Christian", bio: "Builder by day, hiking Ngong by weekend. Looking for a calm soul with fire.", interests: ["Hiking","Gym","Business"], lat: -1.171, lng: 36.835 },
  { name: "Zawadi Ali", age: 24, county: "Mombasa", tribe: "Mijikenda", religion: "Muslim", bio: "Coastal girl. Swahili food, ocean walks, no time-wasters.", interests: ["Food","Travel","Fashion"], lat: -4.043, lng: 39.668 },
  { name: "Faith Chebet", age: 27, county: "Uasin Gishu", tribe: "Kalenjin", religion: "Christian", bio: "Eldoret mornings. Church mode on Sundays. Ambition the rest of the week.", interests: ["Church","Gym","Business"], lat: 0.514, lng: 35.270 },
  { name: "Kevin Omondi", age: 31, county: "Kisumu", tribe: "Luo", religion: "Christian", bio: "Lakeside sunsets and long conversations. Let's start with ugali and debate.", interests: ["Football","Food","Poetry"], lat: -0.091, lng: 34.768 },
  { name: "Njeri Kamau", age: 23, county: "Nairobi", tribe: "Kikuyu", religion: "Christian", bio: "Student mode in Upperhill. Soft life energy, serious about growth.", interests: ["Fashion","Poetry","Travel"], lat: -1.292, lng: 36.822 },
  { name: "Hassan Mohamed", age: 28, county: "Nairobi", tribe: "Somali", religion: "Muslim", bio: "Eastleigh to CBD. Family first, business second, jokes always.", interests: ["Business","Food","Gym"], lat: -1.273, lng: 36.847 },
  { name: "Mercy Atieno", age: 25, county: "Kisumu", tribe: "Luo", religion: "Christian", bio: "Nurse with a loud laugh. Want someone kind more than flashy.", interests: ["Church","Food","Hiking"], lat: -0.102, lng: 34.754 }
].map((p, i) => ({ ...p, id: "seed-" + i, photo: SAMPLE_PHOTOS[i % SAMPLE_PHOTOS.length], premium: i % 3 === 0 }));

const store = {
  get users() { return JSON.parse(localStorage.getItem("kc_users") || "null") || seedUsers(); },
  set users(v) { localStorage.setItem("kc_users", JSON.stringify(v)); },
  get session() { return JSON.parse(localStorage.getItem("kc_session") || "null"); },
  set session(v) { v ? localStorage.setItem("kc_session", JSON.stringify(v)) : localStorage.removeItem("kc_session"); },
  get likes() { return JSON.parse(localStorage.getItem("kc_likes") || "{}"); },
  set likes(v) { localStorage.setItem("kc_likes", JSON.stringify(v)); },
  get passes() { return JSON.parse(localStorage.getItem("kc_passes") || "{}"); },
  set passes(v) { localStorage.setItem("kc_passes", JSON.stringify(v)); },
  get chats() { return JSON.parse(localStorage.getItem("kc_chats") || "{}"); },
  set chats(v) { localStorage.setItem("kc_chats", JSON.stringify(v)); },
  get reports() { return JSON.parse(localStorage.getItem("kc_reports") || "[]"); },
  set reports(v) { localStorage.setItem("kc_reports", JSON.stringify(v)); }
};

function seedUsers() {
  const users = SEED.map(u => ({ ...u, email: u.name.split(" ")[0].toLowerCase() + "@demo.ke", password: "demo123" }));
  localStorage.setItem("kc_users", JSON.stringify(users));
  return users;
}
function haversine(a, b) {
  if (!a || !b || a.lat == null || b.lat == null) return null;
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
  const s = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1-s)));
}
function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2400);
}
let view = "home", chatWith = null;
const filters = { county: "", maxKm: 400, minAge: 18, maxAge: 45, religion: "", interest: "" };
function me() { const s = store.session; return s ? store.users.find(u => u.id === s.id) : null; }
function setMe(patch) {
  const users = store.users;
  const i = users.findIndex(u => u.id === store.session.id);
  users[i] = { ...users[i], ...patch };
  store.users = users;
}
function render() {
  const root = document.getElementById("app");
  const user = me();
  root.innerHTML = `<div class="wrap"><header class="topbar"><div class="brand" onclick="go('home')"><div class="logo">KC</div><div><h1>Kenya Connect</h1><span>Location-based matchmaking</span></div></div><nav class="nav">${user ? `<button class="btn ghost" onclick="go('discover')">Discover</button><button class="btn ghost" onclick="go('matches')">Matches</button><button class="btn ghost" onclick="go('profile')">Profile</button><button class="btn" onclick="logout()">Log out</button>` : `<button class="btn ghost" onclick="go('login')">Log in</button><button class="btn primary" onclick="go('register')">Join free</button>`}</nav></header>${screens[view](user)}</div>`;
}
const screens = {
  home() {
    return `<section class="hero"><div><h2>Meet someone close — Nairobi to Mombasa, and everywhere in between.</h2><p>Create a profile, share your location, and match with people nearby. Filter by county, age, faith, tribe, and the life you’re actually living.</p><div class="cta-row"><button class="btn primary" onclick="go('${me() ? "discover" : "register"}')">Start matching</button><button class="btn" onclick="go('login')">I already have an account</button></div><div class="stats"><div><strong>47</strong>counties ready</div><div><strong>GPS</strong>nearby first</div><div><strong>M-Pesa</strong>premium ready</div></div></div><div class="phone"><div class="card-preview"><div class="meta"><h3>Amina, 26</h3><p>2 km · Westlands, Nairobi</p></div></div></div></section><section class="grid-3"><div class="feature"><h3>Location first</h3><p>We rank people by distance using your coordinates, then county and town.</p></div><div class="feature"><h3>Kenyan filters</h3><p>County, tribe, church or mosque, student vs professional mode.</p></div><div class="feature"><h3>Safer by design</h3><p>Report, block, and keep chats inside the app until you trust someone.</p></div></section>`;
  },
  register() {
    return `<div class="auth-card"><h2>Create your profile</h2><p class="hint">Demo accounts stay in this browser only.</p><form onsubmit="handleRegister(event)"><label>Full name</label><input name="name" required placeholder="e.g. Wanjiku Achieng" /><div class="row-2"><div><label>Age</label><input name="age" type="number" min="18" max="80" required /></div><div><label>County</label><select name="county">${COUNTIES.map(c=>`<option>${c}</option>`).join("")}</select></div></div><div class="row-2"><div><label>Tribe</label><select name="tribe">${TRIBES.map(c=>`<option>${c}</option>`).join("")}</select></div><div><label>Religion</label><select name="religion">${RELIGIONS.map(c=>`<option>${c}</option>`).join("")}</select></div></div><label>Email</label><input name="email" type="email" required /><label>Password</label><input name="password" type="password" required minlength="6" /><label>Bio</label><textarea name="bio" placeholder="Who are you when the Wi-Fi is off?"></textarea><label>Interests</label><select name="interest">${INTERESTS.map(c=>`<option>${c}</option>`).join("")}</select><button class="btn primary" style="width:100%;margin-top:16px">Create account</button></form></div>`;
  },
  login() {
    return `<div class="auth-card"><h2>Welcome back</h2><form onsubmit="handleLogin(event)"><label>Email</label><input name="email" type="email" required /><label>Password</label><input name="password" type="password" required /><button class="btn primary" style="width:100%;margin-top:16px">Log in</button></form><p class="hint">Demo: amina@demo.ke / demo123</p></div>`;
  },
  profile(user) {
    if (!user) return screens.login();
    return `<div class="panel"><h2>Your profile</h2><p class="hint">${user.lat ? `Location on · ${user.county}` : "Location not set yet"}</p><img class="avatar" style="width:100%;height:220px;border-radius:18px;object-fit:cover" src="${user.photo || SAMPLE_PHOTOS[0]}" alt="" /><form onsubmit="handleProfile(event)"><label>Photo URL</label><input name="photo" value="${user.photo || ""}" /><label>Bio</label><textarea name="bio">${user.bio || ""}</textarea><div class="row-2"><div><label>County</label><select name="county">${COUNTIES.map(c=>`<option ${c===user.county?"selected":""}>${c}</option>`).join("")}</select></div><div><label>Mode</label><select name="mode"><option ${user.mode==="student"?"selected":""}>student</option><option ${user.mode==="professional"?"selected":""}>professional</option><option ${user.mode==="church"?"selected":""}>church</option></select></div></div><button class="btn primary" style="width:100%;margin-top:14px">Save profile</button></form><div class="cta-row" style="margin-top:12px"><button class="btn" onclick="enableLocation()">Enable GPS</button><button class="btn" onclick="togglePremium()">${user.premium ? "Premium active" : "Unlock premium (demo)"}</button></div></div>`;
  },
  discover(user) {
    if (!user) return screens.login();
    const people = candidates(user);
    const card = people[0];
    return `<div class="discover"><aside class="filters"><h3>Filters</h3><label>County</label><select onchange="filters.county=this.value;render()"><option value="">Anywhere in Kenya</option>${COUNTIES.map(c=>`<option ${filters.county===c?"selected":""} value="${c}">${c}</option>`).join("")}</select><label>Max distance (km): ${filters.maxKm}</label><input type="range" min="5" max="600" value="${filters.maxKm}" oninput="filters.maxKm=+this.value;render()" /><label>Age ${filters.minAge}–${filters.maxAge}</label><input type="range" min="18" max="60" value="${filters.maxAge}" oninput="filters.maxAge=+this.value;render()" /><label>Religion</label><select onchange="filters.religion=this.value;render()"><option value="">Any</option>${RELIGIONS.map(c=>`<option ${filters.religion===c?"selected":""}>${c}</option>`).join("")}</select><label>Interest</label><select onchange="filters.interest=this.value;render()"><option value="">Any</option>${INTERESTS.map(c=>`<option ${filters.interest===c?"selected":""}>${c}</option>`).join("")}</select>${user.lat ? `<p class="hint">Using your GPS pin in ${user.county}.</p>` : `<p class="hint">Turn on GPS in Profile for real distances.</p>`}</aside><div class="swipe-stage">${card ? profileCard(user, card) : `<div class="empty">Hakuna mtu nearby with those filters. Widen the radius.</div>`}</div></div>`;
  },
  matches(user) {
    if (!user) return screens.login();
    const matches = getMatches(user);
    return `<div class="panel wide"><h2>Matches</h2><div class="list" style="margin-top:14px">${matches.length ? matches.map(p => `<div class="match-row" onclick="openChat('${p.id}')"><img class="avatar" src="${p.photo}" alt="" /><div class="grow"><strong>${p.name}, ${p.age}</strong><div class="muted">${p.county} · ${haversine(user,p) ?? "?"} km</div></div><button class="btn">Chat</button></div>`).join("") : `<div class="empty">No matches yet. Like someone who likes you back.</div>`}</div></div>`;
  },
  chat(user) {
    if (!user || !chatWith) return screens.matches(user);
    const other = store.users.find(u => u.id === chatWith);
    const key = chatKey(user.id, other.id);
    const msgs = store.chats[key] || [];
    return `<div class="panel wide chat-box"><div class="match-row" style="cursor:default"><img class="avatar" src="${other.photo}" alt="" /><div class="grow"><strong>${other.name}</strong><div class="muted">${other.county}</div></div><button class="btn danger" onclick="reportUser('${other.id}')">Report</button></div><div class="msgs">${msgs.map(m => `<div class="bubble ${m.from===user.id?"me":"them"}">${escapeHtml(m.text)}</div>`).join("") || `<p class="muted">Say hi. Keep it respectful.</p>`}</div><form onsubmit="sendChat(event)" style="display:flex;gap:8px"><input name="text" required placeholder="Write a message..." /><button class="btn primary">Send</button></form></div>`;
  }
};
function profileCard(user, p) {
  const km = haversine(user, p);
  return `<div><article class="profile-card"><div class="photo" style="background-image:url('${p.photo}')"><div class="badge">${km == null ? p.county : km + " km · " + p.county}</div></div><div class="pc-body"><h3>${p.name}, ${p.age}</h3><div class="sub">${p.tribe} · ${p.religion}${p.premium ? " · Premium" : ""}</div><p>${escapeHtml(p.bio)}</p><div class="tags" style="margin-top:10px">${(p.interests||[]).map(t=>`<span class="tag">${t}</span>`).join("")}</div></div></article><div class="actions"><button class="fab no" onclick="swipe('${p.id}', false)">✕</button><button class="fab yes" onclick="swipe('${p.id}', true)">♥</button></div></div>`;
}
function candidates(user) {
  const likes = store.likes[user.id] || [];
  const passes = store.passes[user.id] || [];
  return store.users.filter(u => u.id !== user.id).filter(u => !likes.includes(u.id) && !passes.includes(u.id)).filter(u => !filters.county || u.county === filters.county).filter(u => u.age >= filters.minAge && u.age <= filters.maxAge).filter(u => !filters.religion || u.religion === filters.religion).filter(u => !filters.interest || (u.interests||[]).includes(filters.interest)).filter(u => { const km = haversine(user, u); return km == null || km <= filters.maxKm; }).sort((a,b) => (haversine(user,a) ?? 999) - (haversine(user,b) ?? 999));
}
function getMatches(user) {
  const mine = store.likes[user.id] || [];
  return store.users.filter(u => mine.includes(u.id) && (store.likes[u.id] || []).includes(user.id));
}
function chatKey(a,b) { return [a,b].sort().join(":"); }
function go(v) { view = v; render(); }
function logout() { store.session = null; view = "home"; render(); }
function handleRegister(e) {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target));
  const users = store.users;
  if (users.some(u => u.email === f.email)) return toast("Email already used");
  const user = { id: "u-" + Date.now(), name: f.name, age: +f.age, county: f.county, tribe: f.tribe, religion: f.religion, email: f.email, password: f.password, bio: f.bio, interests: [f.interest], photo: SAMPLE_PHOTOS[Math.floor(Math.random()*SAMPLE_PHOTOS.length)], mode: "professional", premium: false };
  users.push(user); store.users = users; store.session = { id: user.id };
  toast("Karibu. Turn on GPS next."); view = "profile"; render();
}
function handleLogin(e) {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target));
  const user = store.users.find(u => u.email === f.email && u.password === f.password);
  if (!user) return toast("Wrong email or password");
  store.session = { id: user.id }; view = "discover"; render();
}
function handleProfile(e) {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target));
  setMe({ photo: f.photo, bio: f.bio, county: f.county, mode: f.mode });
  toast("Profile saved"); render();
}
function enableLocation() {
  if (!navigator.geolocation) return toast("Geolocation not supported");
  navigator.geolocation.getCurrentPosition(pos => { setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude }); toast("Location saved"); render(); }, () => toast("Location permission denied"));
}
function togglePremium() {
  const user = me();
  setMe({ premium: !user.premium });
  toast(user.premium ? "Premium off" : "Premium unlocked in this demo. Hook M-Pesa later.");
  render();
}
function swipe(id, liked) {
  const user = me();
  if (liked) {
    const likes = store.likes; likes[user.id] = [...(likes[user.id]||[]), id]; store.likes = likes;
    const theyLike = (store.likes[id] || []).includes(user.id);
    toast(theyLike ? "It's a match!" : "Liked");
    if (theyLike) {
      const chats = store.chats; const key = chatKey(user.id, id);
      chats[key] = chats[key] || [{ from: id, text: "Hey, we matched" }];
      store.chats = chats;
    }
  } else {
    const passes = store.passes; passes[user.id] = [...(passes[user.id]||[]), id]; store.passes = passes;
  }
  render();
}
function openChat(id) { chatWith = id; view = "chat"; render(); }
function sendChat(e) {
  e.preventDefault();
  const text = new FormData(e.target).get("text");
  const user = me();
  const key = chatKey(user.id, chatWith);
  const chats = store.chats;
  chats[key] = [...(chats[key]||[]), { from: user.id, text, at: Date.now() }];
  store.chats = chats; render();
}
function reportUser(id) {
  const reason = prompt("Why are you reporting this profile?");
  if (!reason) return;
  store.reports = [...store.reports, { from: me().id, target: id, reason, at: Date.now() }];
  toast("Report saved. Thank you.");
}
function escapeHtml(s="") { return String(s).replace(/[&<>"']/g, c => ({ "&":"&","<":"<",">":">","\"":""","'":"&#39;" }[c])); }
window.go = go; window.logout = logout; window.handleRegister = handleRegister; window.handleLogin = handleLogin; window.handleProfile = handleProfile; window.enableLocation = enableLocation; window.togglePremium = togglePremium; window.swipe = swipe; window.openChat = openChat; window.sendChat = sendChat; window.reportUser = reportUser; window.filters = filters; window.render = render;
render();
