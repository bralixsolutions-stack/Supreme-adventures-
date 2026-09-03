let KEY = sessionStorage.getItem("adminKey") || "";
let editingId = null;
let editingDestId = null;

async function api(url, options={}) {
  options.headers = {...options.headers, "x-admin-key": KEY};
  if (!(options.body instanceof FormData)) options.headers["Content-Type"] = "application/json";
  const r = await fetch(url, options);
  if (r.status === 401) { logout(); throw new Error("Unauthorized"); }
  return r.json();
}

async function login(){
  KEY = document.getElementById("adminKey").value;
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
  const target = document.getElementById(id);
  if (target) target.classList.remove("hidden");
  document.getElementById("title").textContent = id[0].toUpperCase() + id.slice(1);
  if(id==="dashboard") loadDashboard(); 
  if(id==="tours") loadTours(); 
  if(id==="destinations") loadDestinations();
  if(id==="gallery") loadGallery(); 
  if(id==="bookings") loadBookings(); 
  if(id==="enquiries") loadEnquiries();
}

async function loadDashboard(){
  const s = await api("/api/admin/stats");
  document.getElementById("stats").innerHTML = [
    ["Tours", s.tours],
    ["Destinations", s.destinations || 0],
    ["Featured", s.featured],
    ["Bookings", s.bookings],
    ["Enquiries", s.enquiries]
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

async function loadBookings(){
  const b = await api("/api/admin/bookings");
  document.getElementById("bookingTable").innerHTML = b.length ? `
    <table class="table">
      <tr><th>Name</th><th>Tour</th><th>Date</th><th>Guests</th><th>Status</th></tr>
      ${b.map(x => `<tr><td>${esc(x.name)}</td><td>${esc(x.tourTitle)}</td><td>${esc(x.travelDate)}</td><td>${x.guests||""}</td><td>${x.status}</td></tr>`).join("")}
    </table>` : "<p style='padding:20px;'>No bookings yet.</p>";
}

async function loadEnquiries(){
  const b = await api("/api/admin/enquiries");
  document.getElementById("enquiryTable").innerHTML = b.length ? `
    <table class="table">
      <tr><th>Name</th><th>Email</th><th>Message</th><th>Status</th></tr>
      ${b.map(x => `<tr><td>${esc(x.name)}</td><td>${esc(x.email)}</td><td>${esc(x.message)}</td><td>${x.status}</td></tr>`).join("")}
    </table>` : "<p style='padding:20px;'>No enquiries yet.</p>";
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

function g(id){ return document.getElementById(id) ? document.getElementById(id).value : ""; }
function esc(s=""){ return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c])); }

if(KEY){
  document.getElementById("login").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  loadDashboard();
}
