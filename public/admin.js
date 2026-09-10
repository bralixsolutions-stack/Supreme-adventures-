let KEY = sessionStorage.getItem("adminKey") || "";
let editingId = null;
let editingDestId = null;
let editingUpcomingId = null;
let confirmCallback = null;

// ==========================================================================
// TOAST NOTIFICATIONS & FEEDBACK MODALS
// ==========================================================================
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const iconClass = type === "success" ? "fa-circle-check" : type === "error" ? "fa-triangle-exclamation" : "fa-circle-info";
  toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${esc(message)}</span>`;
  container.appendChild(toast);

  // Trigger smooth enter transition
  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}

function showFeedbackModal({ type = "success", title = "Success", message = "Operation completed successfully." }) {
  const modal = document.getElementById("feedbackModal");
  const icon = document.getElementById("feedbackIcon");
  const iconI = document.getElementById("feedbackIconI");
  const titleEl = document.getElementById("feedbackTitle");
  const msgEl = document.getElementById("feedbackMessage");

  if (!modal) return;

  icon.className = `feedback-icon ${type}`;
  iconI.className = `fa-solid ${type === "success" ? "fa-circle-check" : type === "error" ? "fa-circle-xmark" : "fa-circle-info"}`;
  titleEl.textContent = title;
  msgEl.textContent = message;

  modal.classList.remove("hidden");
}

function closeFeedbackModal() {
  const modal = document.getElementById("feedbackModal");
  if (modal) modal.classList.add("hidden");
}

function showConfirmModal({
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  confirmClass = "danger",
  iconType = "warning",
  onConfirm
}) {
  const modal = document.getElementById("confirmModal");
  const titleEl = document.getElementById("confirmTitle");
  const msgEl = document.getElementById("confirmMessage");
  const btn = document.getElementById("confirmActionBtn");
  const iconBox = document.getElementById("confirmIcon");
  const iconI = document.getElementById("confirmIconI");

  if (!modal) return;

  titleEl.textContent = title;
  msgEl.textContent = message;
  btn.textContent = confirmText;

  btn.className = `action ${confirmClass}`;
  if (confirmClass === "primary") {
    btn.style.background = "var(--red)";
    btn.style.color = "#ffffff";
    btn.style.borderColor = "var(--red)";
  } else {
    btn.style.background = "";
    btn.style.color = "";
    btn.style.borderColor = "";
  }

  if (iconBox && iconI) {
    iconBox.className = `feedback-icon ${iconType}`;
    if (iconType === "warning" || iconType === "danger" || confirmClass === "danger") {
      iconI.className = "fa-solid fa-triangle-exclamation";
    } else if (iconType === "info" || iconType === "primary") {
      iconI.className = "fa-solid fa-pen-to-square";
    } else {
      iconI.className = "fa-solid fa-circle-question";
    }
  }

  confirmCallback = onConfirm;

  btn.onclick = () => {
    const cb = confirmCallback;
    closeConfirmModal();
    if (typeof cb === "function") {
      cb();
    }
  };

  modal.classList.remove("hidden");
}

function closeConfirmModal() {
  const modal = document.getElementById("confirmModal");
  if (modal) modal.classList.add("hidden");
  confirmCallback = null;
}

// ==========================================================================
// FILE SIZE VALIDATION & CUSTOM DROPZONE HANDLERS (MAX 5MB)
// ==========================================================================
function validateImageFile(fileInput, maxMb = 5) {
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) return true;
  const file = fileInput.files[0];
  const maxBytes = maxMb * 1024 * 1024;

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"];
  const fileName = (file.name || "").toLowerCase();
  const hasValidExt = allowedExtensions.some(ext => fileName.endsWith(ext));
  const hasValidMime = (file.type || "").startsWith("image/");

  if (!hasValidExt || !hasValidMime) {
    fileInput.value = "";
    showToast("Invalid file format. Please upload a genuine image (JPG, PNG, WEBP, GIF, AVIF, SVG).", "error");
    showFeedbackModal({
      type: "error",
      title: "Invalid File Type",
      message: "The selected file is not a supported image format. Please choose an image file (JPG, PNG, WEBP, GIF, AVIF, SVG)."
    });
    return false;
  }

  if (file.size > maxBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    fileInput.value = ""; // Clear invalid file
    showToast(`Image exceeds 5MB limit (${sizeMb} MB). Please choose a smaller photo.`, "error");
    showFeedbackModal({
      type: "error",
      title: "File Exceeds 5MB Limit",
      message: `The selected photo (${sizeMb} MB) exceeds the maximum allowed size of ${maxMb} MB. Please compress or select a smaller image.`
    });
    return false;
  }
  return true;
}

function handleFileInputChange(inputId, pillId, previewCallback) {
  const input = document.getElementById(inputId);
  const pill = document.getElementById(pillId);
  const dropzone = input?.closest(".custom-file-dropzone");
  const inner = dropzone?.querySelector(".file-dropzone-inner");

  if (!input || !input.files || input.files.length === 0) {
    clearFileInput(inputId, pillId, previewCallback);
    return;
  }

  if (!validateImageFile(input)) {
    clearFileInput(inputId, pillId, previewCallback);
    return;
  }

  const file = input.files[0];
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
  
  if (pill) {
    const textEl = pill.querySelector(".pill-text");
    if (textEl) textEl.textContent = `${file.name} (${sizeMb} MB)`;
    pill.classList.remove("hidden");
  }

  if (inner) inner.classList.add("hidden");
  if (dropzone) dropzone.classList.add("has-file");

  if (typeof previewCallback === "function") previewCallback();
}

function clearFileInput(inputId, pillId, previewCallback) {
  const input = document.getElementById(inputId);
  const pill = document.getElementById(pillId);
  const dropzone = input?.closest(".custom-file-dropzone");
  const inner = dropzone?.querySelector(".file-dropzone-inner");

  if (input) input.value = "";
  if (pill) pill.classList.add("hidden");
  if (inner) inner.classList.remove("hidden");
  if (dropzone) dropzone.classList.remove("has-file");

  if (typeof previewCallback === "function") previewCallback();
}

// ==========================================================================
// MOBILE SIDEBAR DRAWER TOGGLE
// ==========================================================================
function toggleAdminSidebar(forceState = null) {
  const sidebar = document.getElementById("adminSidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  if (!sidebar || !backdrop) return;

  const isOpen = sidebar.classList.contains("open");
  const nextState = forceState !== null ? forceState : !isOpen;

  if (nextState) {
    sidebar.classList.add("open");
    backdrop.classList.remove("hidden");
  } else {
    sidebar.classList.remove("open");
    backdrop.classList.add("hidden");
  }
}

// ==========================================================================
// API CLIENT
// ==========================================================================
async function api(url, options={}) {
  options.headers = {...options.headers, "x-admin-key": KEY};
  if (!(options.body instanceof FormData)) options.headers["Content-Type"] = "application/json";
  
  try {
    const r = await fetch(url, options);
    if (r.status === 401) { 
      logout(true); 
      throw new Error("Session expired or unauthorized. Please sign in again."); 
    }
    const data = await r.json();
    if (!r.ok) {
      throw new Error(data.error || `Request failed with status ${r.status}`);
    }
    return data;
  } catch(err) {
    throw err;
  }
}

async function login(){
  const keyInput = document.getElementById("adminKey");
  KEY = keyInput ? keyInput.value.trim() : "";
  if(!KEY){ 
    showToast("Please enter the admin key", "error"); 
    return; 
  }
  try { 
    await api("/api/admin/stats"); 
    sessionStorage.setItem("adminKey", KEY); 
    document.getElementById("login").classList.add("hidden"); 
    document.getElementById("app").classList.remove("hidden"); 
    showToast("Welcome back! Signed in successfully.", "success");
    loadDashboard(); 
  } catch(e){ 
    showFeedbackModal({
      type: "error",
      title: "Sign In Failed",
      message: e.message || "The admin key you entered is invalid. Please check and try again."
    });
  }
}

function performSignOut() {
  KEY = "";
  sessionStorage.removeItem("adminKey");
  localStorage.removeItem("adminKey");

  const appEl = document.getElementById("app");
  const loginEl = document.getElementById("login");
  const keyInput = document.getElementById("adminKey");

  if (appEl) appEl.classList.add("hidden");
  if (loginEl) loginEl.classList.remove("hidden");
  if (keyInput) {
    keyInput.value = "";
    keyInput.focus();
  }

  // Close all open modals & mobile drawer
  document.querySelectorAll(".modal").forEach(m => m.classList.add("hidden"));
  toggleAdminSidebar(false);

  showToast("Signed out successfully", "info");
}

function logout(force = false){
  if (force === true) {
    performSignOut();
    return;
  }

  showConfirmModal({
    title: "Confirm Sign Out",
    message: "Are you sure you want to sign out of the admin portal?",
    confirmText: "Yes, Sign Out",
    confirmClass: "danger",
    iconType: "warning",
    onConfirm: () => {
      performSignOut();
    }
  });
}

// ==========================================================================
// NAVIGATION & BREADCRUMBS
// ==========================================================================
function updateBreadcrumbs(sectionId, subAction = null) {
  const breadcrumbEl = document.getElementById("currentBreadcrumb");
  if (!breadcrumbEl) return;

  const names = {
    dashboard: "Dashboard",
    tours: "Tours & Packages",
    destinations: "Destinations",
    upcoming: "Upcoming Tours & Events",
    gallery: "Photo Gallery"
  };

  const sectionName = names[sectionId] || sectionId[0].toUpperCase() + sectionId.slice(1);
  if (subAction) {
    breadcrumbEl.innerHTML = `<span onclick="showSection('${sectionId}')" style="cursor:pointer;font-weight:normal;">${sectionName}</span> <span class="breadcrumb-separator">/</span> <span class="active">${esc(subAction)}</span>`;
  } else {
    breadcrumbEl.textContent = sectionName;
  }
}

function showSection(id){
  toggleAdminSidebar(false);

  document.querySelectorAll(".section").forEach(s=>s.classList.add("hidden"));
  document.querySelectorAll("aside nav a").forEach(a => a.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.remove("hidden");
  
  const navLink = Array.from(document.querySelectorAll("aside nav a")).find(a => a.getAttribute("onclick")?.includes(`'${id}'`));
  if (navLink) navLink.classList.add("active");

  const titleNames = {
    dashboard: "Dashboard",
    tours: "Tours & Packages",
    destinations: "Destinations",
    upcoming: "Upcoming Tours & Events",
    gallery: "Photo Gallery"
  };

  document.getElementById("title").textContent = titleNames[id] || id[0].toUpperCase() + id.slice(1);
  updateBreadcrumbs(id);

  if(id==="dashboard") loadDashboard(); 
  if(id==="tours") loadTours(); 
  if(id==="destinations") loadDestinations();
  if(id==="upcoming") loadUpcoming();
  if(id==="gallery") loadGallery(); 
}

// ==========================================================================
// DASHBOARD STATS
// ==========================================================================
async function loadDashboard(){
  try {
    const s = await api("/api/admin/stats");
    document.getElementById("stats").innerHTML = [
      ["Tours", s.tours || 0],
      ["Destinations", s.destinations || 0],
      ["Upcoming Tours", s.upcoming || 0],
      ["Gallery Photos", s.gallery || 0],
      ["Featured Packages", s.featured || 0]
    ].map(x => `<div class="stat"><small>${x[0]}</small><strong>${x[1]}</strong></div>`).join("");
  } catch (err) {
    showToast("Failed to refresh stats", "error");
  }
}

// ==========================================================================
// TOURS MANAGEMENT
// ==========================================================================
async function loadTours(){
  try {
    const tours = await fetch("/api/tours").then(r => r.json());
    document.getElementById("tourTable").innerHTML = tours.length ? `
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr><th>Cover</th><th>Tour Title</th><th>Destination</th><th>Duration</th><th>Price</th><th>Featured</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${tours.map(t => `
              <tr>
                <td><img src="${esc(t.image || t.imageUrl || '/photos/wild_beest.webp')}" onerror="this.onerror=null;this.src='/photos/wild_beest.webp';" alt="" style="width:48px;height:36px;object-fit:cover;border-radius:6px;"></td>
                <td><b>${esc(t.title)}</b></td>
                <td>${esc(t.location || t.destination)}</td>
                <td>${t.duration} days</td>
                <td><b>KES ${Number(t.price).toLocaleString()}</b></td>
                <td>${t.featured ? '<span style="color:#ec1f23;font-weight:700;">★ Featured</span>' : 'Standard'}</td>
                <td>
                  <button class="action" onclick='editTour(${JSON.stringify(t).replace(/'/g, "&#39;")})'>Edit</button>
                  <button class="action danger" onclick="deleteTour('${t.id}')">Delete</button>
                </td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>` : "<p style='padding:20px;'>No tours added yet.</p>";
  } catch(err) {
    showToast("Failed to load tours", "error");
  }
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
  document.getElementById("fPrice").value = t?.price || 65000;
  
  clearFileInput("fImageFile", "fImageFileName", null);
  document.getElementById("fImage").value = t?.image || "";
  document.getElementById("fShort").value = t?.shortDescription || "";
  document.getElementById("fDescription").value = t?.description || "";
  document.getElementById("fFeatured").checked = !!t?.featured;
  updateBreadcrumbs("tours", t ? "Edit Tour" : "Add Tour");
  previewTourImage();
}

function editTour(t){ openTourForm(t); }
function closeTourForm(){ 
  document.getElementById("tourForm").classList.add("hidden"); 
  updateBreadcrumbs("tours");
}

function previewTourImage(){
  const fileInput = document.getElementById("fImageFile");
  if (fileInput.files[0] && !validateImageFile(fileInput)) {
    document.getElementById("tourPreview").classList.add("hidden");
    return;
  }

  const file = fileInput.files[0];
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
  const fileInput = document.getElementById("fImageFile");
  if (!validateImageFile(fileInput)) return;

  const file = fileInput.files[0];
  const id = document.getElementById("tourId").value;
  const isEdit = !!id;

  showConfirmModal({
    title: isEdit ? "Confirm Tour Update" : "Confirm New Tour",
    message: isEdit 
      ? `Are you sure you want to update "${g("fTitle")}" on the dashboard?` 
      : `Are you sure you want to add "${g("fTitle")}" to public tours?`,
    confirmText: isEdit ? "Yes, Update Tour" : "Yes, Add Tour",
    confirmClass: "primary",
    iconType: "info",
    onConfirm: async () => {
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

      try {
        await api(id ? "/api/admin/tours/" + id : "/api/admin/tours", {
          method: id ? "PUT" : "POST",
          body: formData
        });

        closeTourForm();
        showToast(id ? "Tour updated successfully!" : "Tour added successfully!", "success");
        loadTours();
        loadDashboard();
      } catch(err) {
        showFeedbackModal({
          type: "error",
          title: "Failed to Save Tour",
          message: err.message || "An error occurred while saving the tour."
        });
      }
    }
  });
}

function deleteTour(id){
  showConfirmModal({
    title: "Delete Tour",
    message: "Are you sure you want to delete this tour listing? This action cannot be undone.",
    confirmText: "Yes, Delete Tour",
    confirmClass: "danger",
    iconType: "warning",
    onConfirm: async () => {
      try {
        await api("/api/admin/tours/" + id, { method: "DELETE" });
        showToast("Tour deleted successfully", "success");
        loadTours();
        loadDashboard();
      } catch(err) {
        showToast(err.message || "Failed to delete tour", "error");
      }
    }
  });
}

// ==========================================================================
// DESTINATIONS MANAGEMENT
// ==========================================================================
async function loadDestinations(){
  try {
    const dests = await api("/api/admin/destinations");
    document.getElementById("destTable").innerHTML = dests.length ? `
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr><th>Cover</th><th>Destination Name</th><th>Slug</th><th>Search Bar</th><th>Description</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${dests.map(d => `
              <tr>
                <td><img src="${esc(d.image || d.imageUrl || '/photos/zanzibar.webp')}" onerror="this.onerror=null;this.src='/photos/zanzibar.webp';" alt="" style="width:48px;height:36px;object-fit:cover;border-radius:6px;"></td>
                <td><b>${esc(d.name)}</b></td>
                <td><code>${esc(d.slug)}</code></td>
                <td>
                  <button class="action ${d.showInSearch !== false ? 'success' : 'secondary'}" 
                    style="padding: 4px 10px; font-size: 11px; border-radius: 12px; cursor: pointer;"
                    onclick="toggleDestinationSearch('${d.id}')"
                    title="Click to toggle visibility in search bar dropdown">
                    <i class="fa-solid ${d.showInSearch !== false ? 'fa-check' : 'fa-eye-slash'}"></i> 
                    ${d.showInSearch !== false ? 'Visible' : 'Hidden'}
                  </button>
                </td>
                <td><small>${esc(d.description || "No description")}</small></td>
                <td>
                  <button class="action" onclick='editDestination(${JSON.stringify(d).replace(/'/g, "&#39;")})'>Edit</button>
                  <button class="action danger" onclick="deleteDestination('${d.id}')">Delete</button>
                </td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>` : "<p style='padding:20px;'>No destinations added yet.</p>";
  } catch(err) {
    showToast("Failed to load destinations", "error");
  }
}

async function toggleDestinationSearch(id) {
  try {
    await api(`/api/admin/destinations/${id}/toggle-search`, { method: "PATCH" });
    showToast("Search dropdown destination updated", "success");
    loadDestinations();
  } catch(err) {
    showToast("Failed to toggle search status", "error");
  }
}

function openDestForm(d=null){
  editingDestId = d?.id || "";
  document.getElementById("destForm").classList.remove("hidden");
  document.getElementById("destFormTitle").textContent = d ? "Edit Destination" : "Add Destination";
  document.getElementById("destId").value = editingDestId;
  document.getElementById("dName").value = d?.name || "";
  document.getElementById("dSlug").value = d?.slug || "";
  document.getElementById("dShowInSearch").checked = d ? (d.showInSearch !== false) : true;
  
  clearFileInput("dImageFile", "dImageFileName", null);
  document.getElementById("dImageUrl").value = d?.image || "";
  document.getElementById("dDescription").value = d?.description || "";
  updateBreadcrumbs("destinations", d ? "Edit Destination" : "Add Destination");
  previewDestImage();
}

function editDestination(d){ openDestForm(d); }
function closeDestForm(){ 
  document.getElementById("destForm").classList.add("hidden"); 
  updateBreadcrumbs("destinations");
}

function previewDestImage(){
  const fileInput = document.getElementById("dImageFile");
  if (fileInput.files[0] && !validateImageFile(fileInput)) {
    document.getElementById("destPreview").classList.add("hidden");
    return;
  }

  const file = fileInput.files[0];
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
  const fileInput = document.getElementById("dImageFile");
  if (!validateImageFile(fileInput)) return;

  const file = fileInput.files[0];
  const id = document.getElementById("destId").value;
  const isEdit = !!id;

  showConfirmModal({
    title: isEdit ? "Confirm Destination Update" : "Confirm New Destination",
    message: isEdit 
      ? `Are you sure you want to update destination "${g("dName")}"?` 
      : `Are you sure you want to add "${g("dName")}" as a new destination?`,
    confirmText: isEdit ? "Yes, Update Destination" : "Yes, Add Destination",
    confirmClass: "primary",
    iconType: "info",
    onConfirm: async () => {
      const formData = new FormData();
      formData.append("name", g("dName"));
      formData.append("slug", g("dSlug"));
      formData.append("description", g("dDescription"));
      formData.append("showInSearch", document.getElementById("dShowInSearch").checked ? "true" : "false");
      if (file) formData.append("image", file);
      if (g("dImageUrl")) formData.append("imageUrl", g("dImageUrl"));

      try {
        await api(id ? "/api/admin/destinations/" + id : "/api/admin/destinations", {
          method: id ? "PUT" : "POST",
          body: formData
        });

        closeDestForm();
        showToast(id ? "Destination updated successfully!" : "Destination added successfully!", "success");
        loadDestinations();
        loadDashboard();
      } catch(err) {
        showFeedbackModal({
          type: "error",
          title: "Failed to Save Destination",
          message: err.message || "An error occurred while saving the destination."
        });
      }
    }
  });
}

function deleteDestination(id){
  showConfirmModal({
    title: "Delete Destination",
    message: "Are you sure you want to delete this destination card? This action cannot be undone.",
    confirmText: "Yes, Delete Destination",
    confirmClass: "danger",
    iconType: "warning",
    onConfirm: async () => {
      try {
        await api("/api/admin/destinations/" + id, { method: "DELETE" });
        showToast("Destination deleted successfully", "success");
        loadDestinations();
        loadDashboard();
      } catch(err) {
        showToast(err.message || "Failed to delete destination", "error");
      }
    }
  });
}

// ==========================================================================
// UPCOMING TOURS & EVENTS MANAGEMENT
// ==========================================================================
async function loadUpcoming(){
  try {
    const upcoming = await fetch("/api/upcoming").then(r => r.json());
    document.getElementById("upcomingTable").innerHTML = upcoming.length ? `
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr><th>Cover</th><th>Title / Event</th><th>Location</th><th>Date</th><th>Category</th><th>Price</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${upcoming.map(u => `
              <tr>
                <td><img src="${esc(u.image || u.imageUrl || '/packages/lake_Bogoria.webp')}" onerror="this.onerror=null;this.src='/packages/lake_Bogoria.webp';" alt="" style="width:48px;height:36px;object-fit:cover;border-radius:6px;"></td>
                <td><b>${esc(u.title)}</b><br><small style="color:var(--muted)">${esc(u.subtitle || "")}</small></td>
                <td>${esc(u.location || "-")}</td>
                <td><small>${esc(u.date || "-")}</small></td>
                <td><span style="font-size:12px;background:#eee;padding:2px 6px;border-radius:4px;">${esc(u.category || "Safari")}</span></td>
                <td><b>KES ${Number(u.price || 0).toLocaleString()}</b></td>
                <td>
                  <button class="action" onclick='editUpcoming(${JSON.stringify(u).replace(/'/g, "&#39;")})'>Edit</button>
                  <button class="action danger" onclick="deleteUpcoming('${u.id}')">Delete</button>
                </td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>` : "<p style='padding:20px;'>No upcoming tours or events added yet.</p>";
  } catch(err) {
    showToast("Failed to load upcoming tours", "error");
  }
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
  document.getElementById("uPrice").value = u?.price !== undefined ? u.price : 45000;
  document.getElementById("uCategory").value = u?.category || "Safari";
  
  clearFileInput("uImageFile", "uImageFileName", null);
  document.getElementById("uImageUrl").value = u?.image || "";
  document.getElementById("uDescription").value = u?.description || "";
  updateBreadcrumbs("upcoming", u ? "Edit Event" : "Add Event");
  previewUpcomingImage();
}

function editUpcoming(u){ openUpcomingForm(u); }
function closeUpcomingForm(){ 
  document.getElementById("upcomingForm").classList.add("hidden"); 
  updateBreadcrumbs("upcoming");
}

function previewUpcomingImage(){
  const fileInput = document.getElementById("uImageFile");
  if (fileInput.files[0] && !validateImageFile(fileInput)) {
    document.getElementById("upcomingPreview").classList.add("hidden");
    return;
  }

  const file = fileInput.files[0];
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
  const fileInput = document.getElementById("uImageFile");
  if (!validateImageFile(fileInput)) return;

  const file = fileInput.files[0];
  const url = g("uImageUrl").trim();
  const id = document.getElementById("upId").value;
  const isEdit = !!id;

  showConfirmModal({
    title: isEdit ? "Confirm Event Update" : "Confirm New Event",
    message: isEdit 
      ? `Are you sure you want to update upcoming event "${g("uTitle")}"?` 
      : `Are you sure you want to add "${g("uTitle")}" to upcoming tours?`,
    confirmText: isEdit ? "Yes, Update Event" : "Yes, Add Event",
    confirmClass: "primary",
    iconType: "info",
    onConfirm: async () => {
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

      try {
        await api(id ? "/api/admin/upcoming/" + id : "/api/admin/upcoming", {
          method: id ? "PUT" : "POST",
          body: formData
        });

        closeUpcomingForm();
        showToast(id ? "Upcoming tour updated successfully!" : "Upcoming tour added successfully!", "success");
        loadUpcoming();
        loadDashboard();
      } catch(err) {
        showFeedbackModal({
          type: "error",
          title: "Failed to Save Upcoming Event",
          message: err.message || "An error occurred while saving the upcoming tour."
        });
      }
    }
  });
}

function deleteUpcoming(id){
  showConfirmModal({
    title: "Delete Upcoming Event",
    message: "Are you sure you want to delete this upcoming tour / event? This action cannot be undone.",
    confirmText: "Yes, Delete Event",
    confirmClass: "danger",
    iconType: "warning",
    onConfirm: async () => {
      try {
        await api("/api/admin/upcoming/" + id, { method: "DELETE" });
        showToast("Upcoming tour deleted successfully", "success");
        loadUpcoming();
        loadDashboard();
      } catch(err) {
        showToast(err.message || "Failed to delete upcoming tour", "error");
      }
    }
  });
}

// ==========================================================================
// GALLERY MANAGEMENT
// ==========================================================================
async function loadGallery(){
  try {
    const images = await api("/api/admin/gallery");
    document.getElementById("galleryTable").innerHTML = images.length ? `
      <div class="admin-gallery-grid">
        ${images.map(image => `
          <article class="admin-gallery-card">
            <div class="admin-gallery-img-wrap">
              <img src="${esc(image.image || image.imageUrl || '/photos/client_1.webp')}" onerror="this.onerror=null;this.src='/photos/client_1.webp';" alt="${esc(image.place)}" loading="lazy">
              <span class="admin-gallery-badge">${esc(image.place)}</span>
            </div>
            <div class="admin-gallery-body">
              <p class="admin-gallery-caption">${esc(image.caption || "No caption")}</p>
              <div class="admin-gallery-actions">
                <button class="action" onclick='editGalleryCaption(${JSON.stringify(image).replace(/'/g, "&#39;")})' title="Edit Caption"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                <button class="action danger" onclick="deleteGalleryImage('${image.id}')" title="Delete Photo"><i class="fa-solid fa-trash-can"></i> Delete</button>
              </div>
            </div>
          </article>`).join("")}
      </div>` : "<p style='padding:20px;'>No gallery images yet.</p>";
  } catch(err) {
    showToast("Failed to load gallery", "error");
  }
}

function openGalleryForm(){
  document.getElementById("galleryForm").classList.remove("hidden");
  document.getElementById("gPlace").value = "";
  
  clearFileInput("gImage", "gImageFileName", null);
  document.getElementById("gImageUrl").value = "";
  document.getElementById("gCaption").value = "";
  updateBreadcrumbs("gallery", "Add Photo");
  previewGalleryImage();
}

function closeGalleryForm(){ 
  document.getElementById("galleryForm").classList.add("hidden"); 
  updateBreadcrumbs("gallery");
}

function previewGalleryImage(){
  const fileInput = document.getElementById("gImage");
  if (fileInput.files[0] && !validateImageFile(fileInput)) {
    document.getElementById("galleryPreview").classList.add("hidden");
    return;
  }

  const file = fileInput.files[0];
  const url = g("gImageUrl").trim();
  const preview = document.getElementById("galleryPreview");
  const image = document.getElementById("galleryPreviewImage");
  if(file){ image.src = URL.createObjectURL(file); preview.classList.remove("hidden"); }
  else if(url){ image.src = url; preview.classList.remove("hidden"); }
  else{ image.removeAttribute("src"); preview.classList.add("hidden"); }
}

async function saveGalleryImage(e){
  e.preventDefault();
  const fileInput = document.getElementById("gImage");
  if (!validateImageFile(fileInput)) return;

  const file = fileInput.files[0];
  const url = g("gImageUrl").trim();
  if(!file && !url){ 
    showToast("Choose an image file or enter an image URL", "error"); 
    return; 
  }

  showConfirmModal({
    title: "Confirm Photo Upload",
    message: `Are you sure you want to publish this photo for "${g("gPlace")}" to the gallery?`,
    confirmText: "Yes, Upload Photo",
    confirmClass: "primary",
    iconType: "info",
    onConfirm: async () => {
      const body = new FormData();
      body.append("place", g("gPlace"));
      if(file) body.append("image", file);
      if(url) body.append("imageUrl", url);
      body.append("caption", g("gCaption"));

      try {
        await api("/api/admin/gallery", { method: "POST", body });
        closeGalleryForm();
        showToast("Gallery photo added successfully!", "success");
        loadGallery();
        loadDashboard();
      } catch(err) {
        showFeedbackModal({
          type: "error",
          title: "Failed to Add Photo",
          message: err.message || "An error occurred while uploading the gallery image."
        });
      }
    }
  });
}

function deleteGalleryImage(id){
  showConfirmModal({
    title: "Delete Gallery Photo",
    message: "Are you sure you want to delete this photo from the gallery? This action cannot be undone.",
    confirmText: "Yes, Delete Photo",
    confirmClass: "danger",
    iconType: "warning",
    onConfirm: async () => {
      try {
        await api("/api/admin/gallery/" + id, { method: "DELETE" });
        showToast("Gallery photo deleted", "success");
        loadGallery();
        loadDashboard();
      } catch(err) {
        showToast(err.message || "Failed to delete gallery photo", "error");
      }
    }
  });
}

async function editGalleryCaption(image){
  const caption = prompt("Edit gallery caption:", image.caption || "");
  if(caption !== null){
    showConfirmModal({
      title: "Confirm Caption Update",
      message: `Are you sure you want to update the caption for "${image.place}"?`,
      confirmText: "Yes, Update Caption",
      confirmClass: "primary",
      iconType: "info",
      onConfirm: async () => {
        try {
          await api("/api/admin/gallery/" + image.id, { method: "PUT", body: JSON.stringify({ caption }) });
          showToast("Caption updated successfully!", "success");
          loadGallery();
        } catch(err) {
          showToast("Failed to update caption", "error");
        }
      }
    });
  }
}

// ==========================================================================
// CHANGE PASSWORD MODAL
// ==========================================================================
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

  if(newPass.length < 6){
    errEl.textContent = "Password must be at least 6 characters long.";
    errEl.classList.remove("hidden");
    return;
  }

  showConfirmModal({
    title: "Confirm Password Change",
    message: "Are you sure you want to update your admin portal password? You will use the new password on your next sign-in.",
    confirmText: "Yes, Update Password",
    confirmClass: "primary",
    iconType: "info",
    onConfirm: async () => {
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
        closeChangePasswordModal();
        showFeedbackModal({
          type: "success",
          title: "Password Updated",
          message: "Your admin password has been changed successfully. Please keep your new password safe."
        });
        showToast("Password updated successfully!", "success");
      } catch(err){
        errEl.textContent = err.message || "Failed to update password.";
        errEl.classList.remove("hidden");
      }
    }
  });
}

function g(id){ return document.getElementById(id) ? document.getElementById(id).value : ""; }
function esc(s=""){ return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c])); }

// ==========================================================================
// AUTO-LOGIN INIT
// ==========================================================================
if(KEY){
  document.getElementById("login").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  loadDashboard();
}
