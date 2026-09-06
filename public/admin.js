let KEY = sessionStorage.getItem("adminKey") || "";
let editingId = null;
let editingDestId = null;
let editingUpcomingId = null;

async function api(url, options={}) {
  options.headers = {...options.headers, "x-admin-key": KEY};
  if (!(options.body instanceof FormData)) options.headers["Content-Type"] = "application/json";
  const r = await fetch(url, options);
  if (r.status === 401) { logout(); throw new Error("Unauthorized"); }
  return r.json();
}

async function login(){
  KEY = document.getElementById("adminKey").value.trim();
  if(!KEY){ alert("Please enter the admin key"); return; }
  try { 
    await api("/api/admin/stats"); 
    sessionStorage.setItem("adminKey", KEY); 
    document.getElementById("login").classList.add("hidden"); 
    document.getElementById("app").classList.remove("hidden"); 
    loadDashboard(); 
  } catch(e){ alert("Invalid admin key"); }
}

function logout(){sessionStorage.removeItem("adminKey");location.reload()}

function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.add("hidden"));
  document.querySelectorAll("aside nav a").forEach(a => a.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.remove("hidden");
  const navLink = Array.from(document.querySelectorAll("aside nav a")).find(a => a.getAttribute("onclick")?.includes(id));
  if (navLink) navLink.classList.add("active");
  document.getElementById("title").textContent = id === "upcoming" ? "Upcoming Tours & Events" : id[0].toUpperCase() + id.slice(1);
  if(id==="dashboard") loadDashboard(); 
  if(id==="tours") loadTours(); 
  if(id==="destinations") loadDestinations();
  if(id==="upcoming") loadUpcoming();
  if(id==="gallery") loadGallery(); 
}

async function loadDashboard(){
  const s = await api("/api/admin/stats");
  document.getElementById("stats").innerHTML = [
    ["Tours", s.tours || 0],
    ["Destinations", s.destinations || 0],
    ["Upcoming Tours", s.upcoming || 0],
    ["Gallery Photos", s.gallery || 0],
    ["Featured Packages", s.featured || 0]
  ].map(x => `<div class="stat"><small>${x[0]}</small><strong>${x[1]}</strong></div>`).join("");
}

async function loadTours(){
  const tours = await fetch("/api/tours").then(r => r.json());
  document.getElementById("tourTable").innerHTML = tours.length ? `
    <table class="table">
      <tr><th>Cover</th><th>Tour Title</th><th>Destination</th><th>Duration</th><th>Price</th><th>Featured</th><th>Actions</th></tr>
      ${tours.map(t => `
        <tr>
          <td><img src="${esc(t.image)}" alt="" style="width:48px;height:36px;object-fit:cover;border-radius:6px;"></td>
          <td><b>${esc(t.title)}</b></td>
          <td>${esc(t.location || t.destination)}</td>
          <td>${t.duration} days</td>
          <td><b>$${t.price}</b></td>
          <td>${t.featured ? '<span style="color:#ec1f23;font-weight:700;">★ Featured</span>' : 'Standard'}</td>
          <td>
            <button class="action" onclick='editTour(${JSON.stringify(t).replace(/'/g, "&#39;")})'>Edit</button>
            <button class="action danger" onclick="deleteTour('${t.id}')">Delete</button>
          </td>
        </tr>`).join("")}
    </table>` : "<p style='padding:20px;'>No tours added yet.</p>";
}

async function loadDestinations(){
  const dests = await api("/api/admin/destinations");
  document.getElementById("destTable").innerHTML = dests.length ? `
    <table class="table">
      <tr><th>Cover</th><th>Destination Name</th><th>Slug</th><th>Description</th><th>Actions</th></tr>
      ${dests.map(d => `
        <tr>
          <td><img src="${esc(d.image)}" alt="" style="width:48px;height:36px;object-fit:cover;border-radius:6px;"></td>
          <td><b>${esc(d.name)}</b></td>
          <td><code>${esc(d.slug)}</code></td>
          <td><small>${esc(d.description || "No description")}</small></td>
          <td>
            <button class="action" onclick='editDestination(${JSON.stringify(d).replace(/'/g, "&#39;")})'>Edit</button>
            <button class="action danger" onclick="deleteDestination('${d.id}')">Delete</button>
          </td>
        </tr>`).join("")}
    </table>` : "<p style='padding:20px;'>No destinations added yet.</p>";
}

async function loadGallery(){
  const images = await api("/api/admin/gallery");
  document.getElementById("galleryTable").innerHTML = images.length ? `
    <div class="admin-gallery-grid">
      ${images.map(image => `
        <article class="admin-gallery-card">
          <img src="${esc(image.image)}" alt="${esc(image.place)}">
          <div>
            <strong>${esc(image.place)}</strong>
            <p>${esc(image.caption || "")}</p>
            <button class="action" onclick='editGalleryCaption(${JSON.stringify(image).replace(/'/g, "&#39;")})'>Edit caption</button>
            <button class="action danger" onclick="deleteGalleryImage('${image.id}')">Delete</button>
          </div>
        </article>`).join("")}
    </div>` : "<p style='padding:20px;'>No gallery images yet.</p>";
}

function openTourForm(t=null){
  editingId = t?.id || "";
  document.getElementById("tourForm").classList.remove("hidden");
  document.getElementById("formTitle").textContent = t ? "Edit Tour / Package" : "Add Tour / Package";
  document.getElementById("tourId").value = editingId;
  document.getElementById("fTitle").value = t?.title || "";
  document.getElementById("fSlug").value = t?.slug || "";
  document.getElementById("fDestination").value = t?.destination || "Kenya";
  document.getElementById("fLocation").value = t?.location || "";
  document.getElementById("fCategory").value = t?.category || "Safari";
  document.getElementById("fDuration").value = t?.duration || 3;
  document.getElementById("fPrice").value = t?.price || 500;
  document.getElementById("fImageFile").value = "";
  document.getElementById("fImage").value = t?.image || "";
  document.getElementById("fShort").value = t?.shortDescription || "";
  document.getElementById("fDescription").value = t?.description || "";
  document.getElementById("fFeatured").checked = !!t?.featured;
  previewTourImage();
}

function editTour(t){ openTourForm(t); }
function closeTourForm(){ document.getElementById("tourForm").classList.add("hidden"); }

function previewTourImage(){
  const file = document.getElementById("fImageFile").files[0];
  const url = g("fImage").trim();
  const preview = document.getElementById("tourPreview");
  const img = document.getElementById("tourPreviewImage");

  if (file) {
    img.src = URL.createObjectURL(file);
    preview.classList.remove("hidden");
  } else if (url) {
    img.src = url;
    preview.classList.remove("hidden");
  } else {
    img.removeAttribute("src");
    preview.classList.add("hidden");
  }
}

async function saveTour(e){
  e.preventDefault();
  const file = document.getElementById("fImageFile").files[0];
  const id = document.getElementById("tourId").value;

  const formData = new FormData();
  formData.append("title", g("fTitle"));
  formData.append("slug", g("fSlug"));
  formData.append("destination", g("fDestination"));
  formData.append("location", g("fLocation"));
  formData.append("category", g("fCategory"));
  formData.append("duration", g("fDuration"));
  formData.append("price", g("fPrice"));
  formData.append("shortDescription", g("fShort"));
  formData.append("description", g("fDescription"));
  formData.append("featured", document.getElementById("fFeatured").checked);
  if (file) formData.append("imageFile", file);
  if (g("fImage")) formData.append("image", g("fImage"));

  await api(id ? "/api/admin/tours/" + id : "/api/admin/tours", {
    method: id ? "PUT" : "POST",
    body: formData
  });

  closeTourForm();
  loadTours();
  loadDashboard();
}

async function deleteTour(id){
  if(confirm("Delete this tour?")){
    await api("/api/admin/tours/" + id, { method: "DELETE" });
    loadTours();
    loadDashboard();
  }
}

function openDestForm(d=null){
  editingDestId = d?.id || "";
  document.getElementById("destForm").classList.remove("hidden");
  document.getElementById("destFormTitle").textContent = d ? "Edit Destination" : "Add Destination";
  document.getElementById("destId").value = editingDestId;
  document.getElementById("dName").value = d?.name || "";
  document.getElementById("dSlug").value = d?.slug || "";
  document.getElementById("dImageFile").value = "";
  document.getElementById("dImageUrl").value = d?.image || "";
  document.getElementById("dDescription").value = d?.description || "";
  previewDestImage();
}

function editDestination(d){ openDestForm(d); }
function closeDestForm(){ document.getElementById("destForm").classList.add("hidden"); }

function previewDestImage(){
  const file = document.getElementById("dImageFile").files[0];
  const url = g("dImageUrl").trim();
  const preview = document.getElementById("destPreview");
  const img = document.getElementById("destPreviewImage");

  if (file) {
    img.src = URL.createObjectURL(file);
    preview.classList.remove("hidden");
  } else if (url) {
    img.src = url;
    preview.classList.remove("hidden");
  } else {
    img.removeAttribute("src");
    preview.classList.add("hidden");
  }
}

async function saveDestination(e){
  e.preventDefault();
  const file = document.getElementById("dImageFile").files[0];
  const id = document.getElementById("destId").value;

  const formData = new FormData();
  formData.append("name", g("dName"));
  formData.append("slug", g("dSlug"));
  formData.append("description", g("dDescription"));
  if (file) formData.append("image", file);
  if (g("dImageUrl")) formData.append("imageUrl", g("dImageUrl"));

  await api(id ? "/api/admin/destinations/" + id : "/api/admin/destinations", {
    method: id ? "PUT" : "POST",
    body: formData
  });

  closeDestForm();
  loadDestinations();
  loadDashboard();
}

async function deleteDestination(id){
  if(confirm("Delete this destination?")){
    await api("/api/admin/destinations/" + id, { method: "DELETE" });
    loadDestinations();
    loadDashboard();
  }
}

async function loadUpcoming(){
  const upcoming = await fetch("/api/upcoming").then(r => r.json());
  document.getElementById("upcomingTable").innerHTML = upcoming.length ? `
    <table class="table">
      <tr><th>Cover</th><th>Title / Event</th><th>Location</th><th>Date</th><th>Category</th><th>Price</th><th>Actions</th></tr>
      ${upcoming.map(u => `
        <tr>
          <td><img src="${esc(u.image)}" alt="" style="width:48px;height:36px;object-fit:cover;border-radius:6px;"></td>
          <td><b>${esc(u.title)}</b><br><small style="color:var(--muted)">${esc(u.subtitle || "")}</small></td>
          <td>${esc(u.location || "-")}</td>
          <td><small>${esc(u.date || "-")}</small></td>
          <td><span style="font-size:12px;background:#eee;padding:2px 6px;border-radius:4px;">${esc(u.category || "Safari")}</span></td>
          <td><b>$${u.price || 0}</b></td>
          <td>
            <button class="action" onclick='editUpcoming(${JSON.stringify(u).replace(/'/g, "&#39;")})'>Edit</button>
            <button class="action danger" onclick="deleteUpcoming('${u.id}')">Delete</button>
          </td>
        </tr>`).join("")}
    </table>` : "<p style='padding:20px;'>No upcoming tours or events added yet.</p>";
}

function openUpcomingForm(u=null){
  editingUpcomingId = u?.id || "";
  document.getElementById("upcomingForm").classList.remove("hidden");
  document.getElementById("upcomingFormTitle").textContent = u ? "Edit Upcoming Tour / Event" : "Add Upcoming Tour / Event";
  document.getElementById("upId").value = editingUpcomingId;
  document.getElementById("uTitle").value = u?.title || "";
  document.getElementById("uSubtitle").value = u?.subtitle || "";
  document.getElementById("uLocation").value = u?.location || "";
  document.getElementById("uDate").value = u?.date || "";
  document.getElementById("uPrice").value = u?.price !== undefined ? u.price : 350;
  document.getElementById("uCategory").value = u?.category || "Safari";
  document.getElementById("uImageFile").value = "";
  document.getElementById("uImageUrl").value = u?.image || "";
  document.getElementById("uDescription").value = u?.description || "";
  previewUpcomingImage();
}

function editUpcoming(u){ openUpcomingForm(u); }
function closeUpcomingForm(){ document.getElementById("upcomingForm").classList.add("hidden"); }

function previewUpcomingImage(){
  const file = document.getElementById("uImageFile").files[0];
  const url = g("uImageUrl").trim();
  const preview = document.getElementById("upcomingPreview");
  const img = document.getElementById("upcomingPreviewImage");

  if (file) {
    img.src = URL.createObjectURL(file);
    preview.classList.remove("hidden");
  } else if (url) {
    img.src = url;
    preview.classList.remove("hidden");
  } else {
    img.removeAttribute("src");
    preview.classList.add("hidden");
  }
}

async function saveUpcoming(e){
  e.preventDefault();
  const file = document.getElementById("uImageFile").files[0];
  const url = g("uImageUrl").trim();
  const id = document.getElementById("upId").value;

  const formData = new FormData();
  formData.append("title", g("uTitle"));
  formData.append("subtitle", g("uSubtitle"));
  formData.append("location", g("uLocation"));
  formData.append("date", g("uDate"));
  formData.append("price", g("uPrice"));
  formData.append("category", g("uCategory"));
  formData.append("description", g("uDescription"));
  if (file) formData.append("image", file);
  if (url) formData.append("imageUrl", url);

  await api(id ? "/api/admin/upcoming/" + id : "/api/admin/upcoming", {
    method: id ? "PUT" : "POST",
    body: formData
  });

  closeUpcomingForm();
  loadUpcoming();
  loadDashboard();
}

async function deleteUpcoming(id){
  if(confirm("Delete this upcoming tour/event?")){
    await api("/api/admin/upcoming/" + id, { method: "DELETE" });
    loadUpcoming();
    loadDashboard();
  }
}

function openGalleryForm(){
  document.getElementById("galleryForm").classList.remove("hidden");
  document.getElementById("gPlace").value = "";
  document.getElementById("gImage").value = "";
  document.getElementById("gImageUrl").value = "";
  document.getElementById("gCaption").value = "";
  previewGalleryImage();
}

function closeGalleryForm(){ document.getElementById("galleryForm").classList.add("hidden"); }

async function saveGalleryImage(e){
  e.preventDefault();
  const file = document.getElementById("gImage").files[0];
  const url = g("gImageUrl").trim();
  if(!file && !url){ alert("Choose an image file or enter an image URL"); return; }
  
  const body = new FormData();
  body.append("place", g("gPlace"));
  if(file) body.append("image", file);
  if(url) body.append("imageUrl", url);
  body.append("caption", g("gCaption"));

  await api("/api/admin/gallery", { method: "POST", body });
  closeGalleryForm();
  loadGallery();
}

async function deleteGalleryImage(id){
  if(confirm("Delete this gallery image?")){
    await api("/api/admin/gallery/" + id, { method: "DELETE" });
    loadGallery();
  }
}

async function editGalleryCaption(image){
  const caption = prompt("Edit gallery caption:", image.caption || "");
  if(caption !== null){
    await api("/api/admin/gallery/" + image.id, { method: "PUT", body: JSON.stringify({ caption }) });
    loadGallery();
  }
}

function previewGalleryImage(){
  const file = document.getElementById("gImage").files[0];
  const url = g("gImageUrl").trim();
  const preview = document.getElementById("galleryPreview");
  const image = document.getElementById("galleryPreviewImage");
  if(file){ image.src = URL.createObjectURL(file); preview.classList.remove("hidden"); }
  else if(url){ image.src = url; preview.classList.remove("hidden"); }
  else{ image.removeAttribute("src"); preview.classList.add("hidden"); }
}

function openChangePasswordModal(){
  document.getElementById("changePasswordModal").classList.remove("hidden");
  document.getElementById("cpCurrent").value = "";
  document.getElementById("cpNew").value = "";
  document.getElementById("cpConfirm").value = "";
  const err = document.getElementById("cpError");
  if (err) { err.textContent = ""; err.classList.add("hidden"); }
}

function closeChangePasswordModal(){
  document.getElementById("changePasswordModal").classList.add("hidden");
}

async function changePassword(e){
  e.preventDefault();
  const current = document.getElementById("cpCurrent").value;
  const newPass = document.getElementById("cpNew").value;
  const confirmPass = document.getElementById("cpConfirm").value;
  const errEl = document.getElementById("cpError");

  if(newPass !== confirmPass){
    errEl.textContent = "New passwords do not match.";
    errEl.classList.remove("hidden");
    return;
  }

  if(newPass.length < 4){
    errEl.textContent = "Password must be at least 4 characters long.";
    errEl.classList.remove("hidden");
    return;
  }

  try {
    const res = await api("/api/admin/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: current, newPassword: newPass })
    });
    if(res.error){
      errEl.textContent = res.error;
      errEl.classList.remove("hidden");
      return;
    }
    KEY = newPass;
    sessionStorage.setItem("adminKey", KEY);
    alert("Password updated successfully! Please keep your new password safe.");
    closeChangePasswordModal();
  } catch(err){
    errEl.textContent = err.message || "Failed to update password.";
    errEl.classList.remove("hidden");
  }
}

function g(id){ return document.getElementById(id) ? document.getElementById(id).value : ""; }
function esc(s=""){ return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c])); }

if(KEY){
  document.getElementById("login").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  loadDashboard();
}
