const $ = id => document.getElementById(id);
let cachedDestinations = [];

function handleEmptyContactSupport(e) {
  if (e && e.preventDefault) e.preventDefault();
  const contactSec = document.getElementById("contact");
  if (contactSec) {
    contactSec.scrollIntoView({ behavior: "smooth" });
  } else {
    window.location.hash = "contact";
  }
}

let allToursData = [];
let isToursExpanded = false;
const INITIAL_TOURS_LIMIT = 6;

function renderToursGrid() {
  const grid = $("tourGrid");
  const actionContainer = $("toursActionContainer");
  const seeMoreText = $("seeMoreToursText");
  const seeMoreIcon = $("seeMoreToursIcon");
  if (!grid) return;

  if (allToursData.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: #fff; border-radius: 16px; border: 1px dashed #cbd5e1; margin: 20px 0; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
        <i class="fa-solid fa-compass-drafting" style="font-size: 38px; color: #94a3b8; margin-bottom: 12px;"></i>
        <h3 style="font-size: 20px; color: #1e293b; margin-bottom: 8px; font-weight: 700;">No packages match your search filter</h3>
        <p style="color: #64748b; margin-bottom: 22px; font-size: 14px; max-width: 520px; margin-left: auto; margin-right: auto; line-height: 1.5;">
          Looking for a custom safari or specific dates? Contact our support team for a personalized itinerary, or reset the filters to view all tours.
        </p>
        <div style="display: flex; gap: 12px; justify-content: center; align-items: center; flex-wrap: wrap;">
          <a href="#contact" onclick="handleEmptyContactSupport(event)" style="display: inline-flex; align-items: center; gap: 8px; background: #ec1f23; color: #fff; padding: 10px 24px; border: none; border-radius: 25px; font-weight: 700; font-size: 14px; text-decoration: none; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 3px 12px rgba(236,31,35,0.25);">
            <i class="fa-solid fa-headset"></i> Contact Support
          </a>
          <button onclick="resetSearchFilters()" style="display: inline-flex; align-items: center; gap: 8px; background: #f1f5f9; color: #334155; padding: 10px 24px; border: 1px solid #cbd5e1; border-radius: 25px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s ease;">
            <i class="fa-solid fa-rotate-left"></i> Reset Filter
          </button>
        </div>
      </div>`;
    if (actionContainer) actionContainer.style.display = "none";
    return;
  }

  const shouldLimit = !isToursExpanded && allToursData.length > INITIAL_TOURS_LIMIT;
  const visibleTours = shouldLimit ? allToursData.slice(0, INITIAL_TOURS_LIMIT) : allToursData;

  grid.innerHTML = visibleTours.map((t, index) => {
    const tourImg = t.image || t.imageUrl || '/photos/wild_beest.webp';
    const escapedTitle = escapeHtml(t.title).replace(/'/g, "\\'");
    return `
    <article class="tour-card card-item" data-aos="fade-up" data-aos-duration="800" data-aos-delay="${(index % 3) * 150}">
      <div class="tour-image" onclick="openLightbox('${tourImg}', '${escapedTitle}')" title="Click to view full image">
        <img src="${tourImg}" alt="${escapeHtml(t.title)}" class="card-flyer-img" loading="lazy" decoding="async">
        ${t.featured ? '<span class="tag">Featured</span>' : ''}
        <div class="tour-image-overlay">
          <span class="tour-zoom-badge"><i class="fa-solid fa-magnifying-glass-plus"></i> View Full Image</span>
        </div>
      </div>
      <div class="tour-body">
        <div class="tour-meta"><span>${t.duration} days · ${t.category}</span><span>★ ${t.rating || 5}</span></div>
        <h3>${escapeHtml(t.title)}</h3>
        <p>${escapeHtml(t.shortDescription || t.description || "")}</p>
        <div class="tour-bottom">
          <div class="price">KES ${Number(t.price).toLocaleString()} <small>/ person</small></div>
          <button class="view-btn" onclick="openTour('${t.slug || t.id}')">VIEW TOUR →</button>
        </div>
      </div>
    </article>`;
  }).join("");

  if (actionContainer) {
    if (allToursData.length > INITIAL_TOURS_LIMIT) {
      actionContainer.style.display = "block";
      const remaining = allToursData.length - INITIAL_TOURS_LIMIT;
      if (!isToursExpanded) {
        if (seeMoreText) seeMoreText.textContent = `View More Tours & Packages (${remaining} more)`;
        if (seeMoreIcon) seeMoreIcon.className = "fa-solid fa-chevron-down";
      } else {
        if (seeMoreText) seeMoreText.textContent = "Show Fewer Packages";
        if (seeMoreIcon) seeMoreIcon.className = "fa-solid fa-chevron-up";
      }
    } else {
      actionContainer.style.display = "none";
    }
  }

  if (typeof AOS !== "undefined") AOS.refresh();
}

async function loadTours(shouldScroll = false) {
  const grid = $("tourGrid");
  if (!grid) return;

  const params = new URLSearchParams();
  const destination = $("destination") ? $("destination").value : "";
  const category = $("category") ? $("category").value : "";
  const duration = $("duration") ? $("duration").value : "";
  if (destination) params.set("destination", destination);
  if (category) params.set("category", category);
  if (duration) params.set("duration", duration);

  try {
    const res = await fetch("/api/tours?" + params.toString());
    const tours = await res.json();
    allToursData = Array.isArray(tours) ? tours : [];
    isToursExpanded = false; // Collapse to initial view whenever filters change

    renderToursGrid();

    const emptyState = $("emptyState");
    if (emptyState) emptyState.classList.add("hidden");

    if (!destination && !category && !duration && Array.isArray(tours) && tours.length > 0) {
      updateSearchDropdownsFromData(tours, cachedDestinations);
    }

    if (typeof initScrollReveal === "function") initScrollReveal();

    if (shouldScroll) {
      const toursSec = document.getElementById("tours");
      if (toursSec) {
        toursSec.scrollIntoView({ behavior: "smooth" });
      }
    }
  } catch (err) {
    console.error("Error loading tours:", err);
  }
}

function toggleMoreTours() {
  const grid = $("tourGrid");
  if (!grid) return;

  isToursExpanded = !isToursExpanded;

  if (isToursExpanded) {
    grid.classList.add("expanded-grid");
  } else {
    grid.classList.remove("expanded-grid");
  }

  renderToursGrid();

  if (!isToursExpanded) {
    const toursSec = document.getElementById("tours");
    if (toursSec) {
      toursSec.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

function resetSearchFilters() {
  const dest = $("destination");
  const cat = $("category");
  const dur = $("duration");
  if (dest) dest.value = "";
  if (cat) cat.value = "";
  if (dur) dur.value = "";

  const destText = $("destSelectedText");
  const typeText = $("typeSelectedText");
  if (destText) destText.textContent = "All destinations";
  if (typeText) typeText.textContent = "All types";

  document.querySelectorAll("#destMenu .custom-dropdown-item").forEach(item => {
    if (item.getAttribute("data-val") === "") item.classList.add("selected");
    else item.classList.remove("selected");
  });

  document.querySelectorAll("#typeMenu .custom-dropdown-item").forEach(item => {
    if (item.getAttribute("data-val") === "") item.classList.add("selected");
    else item.classList.remove("selected");
  });

  loadTours(false);
}

let allGalleryItems = [];
let activeGalleryItems = [];
let currentLightboxIndex = 0;
let isGalleryExpanded = false;
let currentGalleryCategory = "all";
const INITIAL_GALLERY_LIMIT = 7;

async function loadGallery() {
  try {
    const res = await fetch("/api/gallery");
    allGalleryItems = await res.json();
    filterGallery("all");
  } catch (err) {
    console.error("Error loading gallery:", err);
  }
}

function filterGallery(category, btnEl) {
  currentGalleryCategory = category || "all";
  isGalleryExpanded = false;

  const buttons = document.querySelectorAll(".gallery-filter-btn");
  if (btnEl) {
    buttons.forEach(btn => btn.classList.remove("active"));
    btnEl.classList.add("active");
  }

  if (currentGalleryCategory === "all") {
    activeGalleryItems = [...allGalleryItems];
  } else {
    activeGalleryItems = allGalleryItems.filter(item => item.category === currentGalleryCategory);
  }

  renderGallery();
}

function renderGallery() {
  const grid = $("galleryGrid");
  const actionsBox = $("galleryActions");
  if (!grid) return;

  if (!activeGalleryItems || activeGalleryItems.length === 0) {
    grid.innerHTML = `<div class="gallery-empty"><p>No photos found in this category.</p></div>`;
    if (actionsBox) actionsBox.innerHTML = "";
    return;
  }

  const shouldLimit = !isGalleryExpanded && activeGalleryItems.length > INITIAL_GALLERY_LIMIT;
  const visibleItems = shouldLimit ? activeGalleryItems.slice(0, INITIAL_GALLERY_LIMIT) : activeGalleryItems;

  grid.innerHTML = visibleItems.map((item, index) => {
    const featClass = item.featured ? `featured-${item.featured}` : "";
    const imgUrl = item.image || item.imageUrl || '/photos/client_1.webp';

    return `
      <figure class="gallery-item ${featClass}" 
              data-category="${escapeHtml(item.category || 'all')}" 
              data-aos="fade-up" 
              data-aos-duration="700" 
              data-aos-delay="${(index % 4) * 80}"
              onclick="openLightbox(${index})">
        <div class="gallery-img-wrapper">
          <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(item.place || 'Gallery Photo')}" loading="lazy">
          <div class="gallery-hover-overlay">
            <i class="fa-solid fa-magnifying-glass-plus"></i>
          </div>
        </div>
      </figure>
    `;
  }).join("");

  if (actionsBox) {
    if (shouldLimit) {
      actionsBox.innerHTML = `
        <button class="gallery-view-all-btn" onclick="expandGallery()">
          <i class="fa-solid fa-images"></i> View All Photos
        </button>
      `;
    } else {
      actionsBox.innerHTML = "";
    }
  }

  if (typeof AOS !== "undefined") AOS.refresh();
}

function expandGallery() {
  isGalleryExpanded = true;
  renderGallery();
}

let isSingleImageMode = false;
let singleImageData = { image: "", title: "", caption: "", tag: "" };

function openLightbox(input, captionParam) {
  let modal = $("galleryLightboxModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "galleryLightboxModal";
    modal.className = "gallery-lightbox-overlay";
    modal.innerHTML = `
      <div class="lightbox-content" onclick="event.stopPropagation()">
        <button class="lightbox-close" onclick="closeLightbox()" aria-label="Close Lightbox">&times;</button>
        <button class="lightbox-nav lightbox-prev" id="lightboxPrevBtn" onclick="navigateLightbox(-1)" aria-label="Previous Image"><i class="fa-solid fa-chevron-left"></i></button>
        <button class="lightbox-nav lightbox-next" id="lightboxNextBtn" onclick="navigateLightbox(1)" aria-label="Next Image"><i class="fa-solid fa-chevron-right"></i></button>
        <div class="lightbox-img-container">
          <img id="lightboxImg" src="" alt="Gallery Photo">
        </div>
        <div class="lightbox-caption-box" id="lightboxCaptionBox">
          <span class="lightbox-tag" id="lightboxTag"></span>
          <h3 id="lightboxTitle"></h3>
          <p id="lightboxCaption"></p>
          <div class="lightbox-counter" id="lightboxCounter"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      const activeModal = $("galleryLightboxModal");
      if (!activeModal || !activeModal.classList.contains("active")) return;
      if (e.key === "Escape") closeLightbox();
      if (!isSingleImageMode) {
        if (e.key === "ArrowLeft") navigateLightbox(-1);
        if (e.key === "ArrowRight") navigateLightbox(1);
      }
    });
  }

  if (typeof input === "number") {
    isSingleImageMode = false;
    currentLightboxIndex = input;
  } else if (typeof input === "string") {
    isSingleImageMode = true;
    singleImageData = {
      image: input,
      title: captionParam || "Supreme Adventures",
      caption: "",
      tag: "FULL VIEW"
    };
  }

  updateLightboxContent();
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function updateLightboxContent() {
  const prevBtn = $("lightboxPrevBtn");
  const nextBtn = $("lightboxNextBtn");
  const imgEl = $("lightboxImg");
  const tagEl = $("lightboxTag");
  const titleEl = $("lightboxTitle");
  const capEl = $("lightboxCaption");
  const counterEl = $("lightboxCounter");

  if (!imgEl) return;

  if (isSingleImageMode) {
    imgEl.src = singleImageData.image;
    imgEl.alt = singleImageData.title || "Full View Image";

    if (tagEl) {
      tagEl.style.display = "none";
    }
    if (titleEl) {
      titleEl.textContent = singleImageData.title;
      titleEl.style.display = "block";
    }
    if (capEl) capEl.style.display = "none";
    if (counterEl) counterEl.style.display = "none";
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
  } else {
    const item = activeGalleryItems[currentLightboxIndex];
    if (!item) return;

    imgEl.src = item.image;
    imgEl.alt = item.place || item.caption || "Gallery Photo";

    if (tagEl) {
      tagEl.style.display = "none";
    }

    if (titleEl) {
      titleEl.textContent = item.place || "Supreme Adventures";
      titleEl.style.display = "block";
    }

    if (capEl) {
      if (item.caption && item.caption !== item.place) {
        capEl.textContent = item.caption;
        capEl.style.display = "block";
      } else {
        capEl.style.display = "none";
      }
    }

    if (counterEl) {
      counterEl.style.display = "none";
    }

    const showNav = activeGalleryItems.length > 1;
    if (prevBtn) prevBtn.style.display = showNav ? "flex" : "none";
    if (nextBtn) nextBtn.style.display = showNav ? "flex" : "none";
  }
}

function navigateLightbox(direction) {
  if (isSingleImageMode || activeGalleryItems.length === 0) return;
  currentLightboxIndex = (currentLightboxIndex + direction + activeGalleryItems.length) % activeGalleryItems.length;
  updateLightboxContent();
}

function closeLightbox() {
  const modal = $("galleryLightboxModal");
  if (modal) modal.classList.remove("active");
  const lb = $("imageLightbox");
  if (lb) lb.classList.add("hidden");
  const tourModal = $("tourModal");
  if (!tourModal || tourModal.classList.contains("hidden")) {
    document.body.style.overflow = "";
  }
}

function bookOnWhatsApp(title, location, duration, price, inclusions, exclusions) {
  let incList = (Array.isArray(inclusions) && inclusions.length > 0) ? inclusions : [];
  let excList = (Array.isArray(exclusions) && exclusions.length > 0) ? exclusions : [];

  const inclusionsFormatted = incList.length > 0 ? `\n\n✅ *What's Included:*\n${incList.map(item => `  • ${item}`).join("\n")}` : "";
  const exclusionsFormatted = excList.length > 0 ? `\n\n❌ *Exclusions:*\n${excList.map(item => `  • ${item}`).join("\n")}` : "";

  const message = `Hello Supreme Adventures! 👋\n\nI would like to book:\n📌 *Trip:* ${title}\n📍 *Location:* ${location}\n📅 *Duration/Date:* ${duration}\n💰 *Price:* KES ${Number(price).toLocaleString()} / person${inclusionsFormatted}${exclusionsFormatted}\n\nPlease confirm availability and booking details!`;

  window.open(`https://wa.me/254759080100?text=${encodeURIComponent(message)}`, '_blank');
}

async function openTour(slug) {
  const res = await fetch("/api/tours/" + encodeURIComponent(slug));
  const t = await res.json();
  const tourImg = t.image || t.imageUrl || '/photos/wild_beest.webp';
  const tourTitleEscaped = escapeHtml(t.title).replace(/'/g, "\\'");
  const tourLocEscaped = escapeHtml(t.location || t.destination || "").replace(/'/g, "\\'");

  $("modalContent").innerHTML = `
    <div class="modal-clear-image-container" onclick="openLightbox('${tourImg}', '${tourTitleEscaped}')" title="Click to view full screen">
      <img src="${tourImg}" alt="${escapeHtml(t.title)}" class="modal-clear-img">
      <span class="zoom-badge"><i class="fa-solid fa-magnifying-glass-plus"></i> View Full Screen</span>
    </div>
    <div class="modal-body compact-modal-body">
      <div class="modal-header-compact">
        <p class="eyebrow dark"><i class="fa-solid fa-location-dot"></i> ${escapeHtml((t.location || t.destination || "").toUpperCase())} · <i class="fa-solid fa-clock"></i> ${t.duration} DAYS</p>
        <h2>${escapeHtml(t.title)}</h2>
        <div class="tour-meta compact-meta"><span>Group size: up to ${t.groupSize || 7}</span><span>Price: <b>KES ${Number(t.price).toLocaleString()}</b> / person</span></div>
      </div>
      <p class="modal-desc">${escapeHtml(t.description || t.shortDescription || "")}</p>
      
      <button class="modal-book-now-whatsapp-btn" onclick="bookOnWhatsApp('${tourTitleEscaped}', '${tourLocEscaped}', '${t.duration} Days', '${t.price}')">
        <i class="fa-brands fa-whatsapp"></i> Book Now
      </button>
    </div>`;
  $("tourModal").classList.remove("hidden");
}

async function submitBooking(e, tourId, tourTitle) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  data.tourId = tourId;
  data.tourTitle = tourTitle;

  try {
    await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.error("Server booking log error", err);
  }

  // Directly redirect user to WhatsApp 254759080100 with pre-filled enquiry details
  const text = `Hello Supreme Adventures! 👋%0A%0AI would like to book/enquire about:%0A📌 *Package:* ${encodeURIComponent(tourTitle)}%0A👤 *Name:* ${encodeURIComponent(data.name || 'Not provided')}%0A📅 *Travel Date:* ${encodeURIComponent(data.travelDate || 'Flexible')}%0A👥 *Guests:* ${encodeURIComponent(data.guests || '1')}%0A📞 *Phone:* ${encodeURIComponent(data.phone || 'Not provided')}%0A✉️ *Email:* ${encodeURIComponent(data.email || 'Not provided')}%0A📝 *Notes:* ${encodeURIComponent(data.message || 'None')}`;

  window.open(`https://wa.me/254759080100?text=${text}`, '_blank');
  closeModal();
}

function closeModal() { $("tourModal").classList.add("hidden"); }
function openBooking() { document.getElementById("tours").scrollIntoView({ behavior: "smooth" }); }

function escapeHtml(s = "") {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
}

// Header scroll glassmorphism state change
function handleHeaderScroll() {
  const header = $("siteHeader");
  if (header) {
    if (window.scrollY > 15) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
}

window.addEventListener("scroll", handleHeaderScroll);
handleHeaderScroll();

// Mobile Navigation Toggle
const menuBtn = $("menuBtn");
const mainNav = $("mainNav");

if (menuBtn && mainNav) {
  menuBtn.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });

  mainNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
    });
  });
}

// Dynamic Hero Slider Implementation
let currentHeroIndex = 0;
let heroTimer = null;

function initHeroSlider() {
  const slidesContainer = $("heroSlides");
  const dotsContainer = $("heroDots");
  if (!slidesContainer || typeof HERO_PACKAGES === "undefined" || !HERO_PACKAGES.length) return;

  // Render Background Slides
  slidesContainer.innerHTML = HERO_PACKAGES.map((pkg, idx) => `
    <div class="hero-slide ${idx === 0 ? "active" : ""}" style="background-image: url('${pkg.image}')"></div>
  `).join("");

  // Render Navigation Dots
  if (dotsContainer) {
    dotsContainer.innerHTML = HERO_PACKAGES.map((pkg, idx) => `
      <button class="hero-dot ${idx === 0 ? "active" : ""}" aria-label="Go to slide ${idx + 1}" onclick="goToHeroSlide(${idx})"></button>
    `).join("");
  }

  // Prev / Next button listeners
  const prevBtn = $("heroPrevBtn");
  const nextBtn = $("heroNextBtn");
  if (prevBtn) prevBtn.addEventListener("click", () => prevHeroSlide());
  if (nextBtn) nextBtn.addEventListener("click", () => nextHeroSlide(true));

  // Defer the first hero animation until after the preloader finishes.
  // The preloader dismiss script will call window._startHeroAfterPreloader().
  window._startHeroAfterPreloader = function () {
    updateHeroContent(0);
    startHeroTimer();
  };
}

let heroTimeouts = [];

function clearHeroTypewriters() {
  heroTimeouts.forEach(t => clearTimeout(t));
  heroTimeouts = [];
}

function typeWriterEffect(elementId, text, showCursor = false, speedMs = 30, onComplete = null) {
  const element = $(elementId);
  if (!element) {
    if (onComplete) onComplete();
    return;
  }

  element.innerHTML = showCursor ? '<span class="typewriter-cursor">|</span>' : '';
  let i = 0;

  function type() {
    if (i <= text.length) {
      const sub = escapeHtml(text.substring(0, i));
      element.innerHTML = sub + (showCursor ? '<span class="typewriter-cursor">|</span>' : '');
      i++;
      const t = setTimeout(type, speedMs);
      heroTimeouts.push(t);
    } else {
      if (showCursor) {
        element.innerHTML = escapeHtml(text);
      }
      if (onComplete) onComplete();
    }
  }
  type();
}

function runFullHeroTypewriter(pkg) {
  clearHeroTypewriters();

  // 1. Type "Safari ya"
  typeWriterEffect("heroScriptTag", "Safari ya", false, 40, () => {
    // 2. Type Destination Title (e.g., MAASAI MARA)
    typeWriterEffect("heroDestinationTitle", pkg.destination.toUpperCase(), false, 30, () => {
      // 3. Type Subheading (e.g., Maasai Mara Wildlife Safari)
      typeWriterEffect("heroTitle", pkg.title, true, 20);
    });
  });
}

function updateHeroContent(index) {
  const pkg = HERO_PACKAGES[index];
  if (!pkg) return;

  currentHeroIndex = index;

  const heroContent = document.querySelector(".hero-content");
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");
  const tagline = $("heroTagline");

  clearHeroTypewriters();

  // Blank out typewriter title elements immediately so previous text never flashes during wave entrance
  ["heroScriptTag", "heroDestinationTitle", "heroTitle"].forEach(id => {
    const el = $(id);
    if (el) el.innerHTML = "";
  });

  // Step 1: Trigger smooth wave reset & fade out
  if (heroContent) {
    heroContent.classList.add("changing");
    heroContent.classList.remove("wave-animate");
  }

  setTimeout(() => {
    // Step 2: Switch active background slide and navigation dot
    slides.forEach((s, i) => s.classList.toggle("active", i === index));
    dots.forEach((d, i) => d.classList.toggle("active", i === index));

    if (tagline) tagline.textContent = pkg.tagline;

    // Step 3: Trigger wave entrance animation & sequential typewriter for headers
    if (heroContent) {
      heroContent.classList.remove("changing");
      void heroContent.offsetWidth; // Force reflow for wave animation
      heroContent.classList.add("wave-animate");
    }

    runFullHeroTypewriter(pkg);
  }, 180);
}

function nextHeroSlide(isManual = false) {
  const nextIdx = (currentHeroIndex + 1) % HERO_PACKAGES.length;
  updateHeroContent(nextIdx);
  if (isManual) startHeroTimer();
}

function prevHeroSlide() {
  const prevIdx = (currentHeroIndex - 1 + HERO_PACKAGES.length) % HERO_PACKAGES.length;
  updateHeroContent(prevIdx);
  startHeroTimer();
}

function goToHeroSlide(index) {
  updateHeroContent(index);
  startHeroTimer();
}

function startHeroTimer() {
  stopHeroTimer();
  heroTimer = setInterval(() => nextHeroSlide(false), 6500);
}

function stopHeroTimer() {
  if (heroTimer) {
    clearInterval(heroTimer);
    heroTimer = null;
  }
}

// Single Unconfusing CTA: Direct Book Now Action for current hero package
function bookCurrentHeroPackage() {
  const pkg = HERO_PACKAGES[currentHeroIndex];
  if (!pkg) return;

  const pkgTitleEscaped = escapeHtml(pkg.title).replace(/'/g, "\\'");
  const pkgDestEscaped = escapeHtml(pkg.destination).replace(/'/g, "\\'");

  $("modalContent").innerHTML = `
    <div class="modal-clear-image-container" onclick="openLightbox('${pkg.image}', '${pkgTitleEscaped}')" title="Click to view full screen">
      <img src="${pkg.image}" alt="${escapeHtml(pkg.title)}" class="modal-clear-img">
      <span class="zoom-badge"><i class="fa-solid fa-magnifying-glass-plus"></i> View Full Screen</span>
    </div>
    <div class="modal-body compact-modal-body">
      <div class="modal-header-compact">
        <p class="eyebrow dark"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(pkg.destination.toUpperCase())} · <i class="fa-solid fa-clock"></i> ${pkg.duration}</p>
        <h2>${escapeHtml(pkg.title)}</h2>
        <div class="tour-meta compact-meta">
          <span>Category: <b>${escapeHtml(pkg.category)}</b></span>
          <span>Price: <b>KES ${Number(pkg.price).toLocaleString()}</b> / person</span>
        </div>
      </div>
      <p class="modal-desc">${escapeHtml(pkg.tagline)}</p>
      
      <button class="modal-book-now-whatsapp-btn" onclick="bookOnWhatsApp('${pkgTitleEscaped}', '${pkgDestEscaped}', '${pkg.duration}', '${pkg.price}')">
        <i class="fa-brands fa-whatsapp"></i> Book Now
      </button>
    </div>`;
  $("tourModal").classList.remove("hidden");
}

function setupDropdown({ menuId, triggerId, selectId, textId, items, iconClass }) {
  const menu = $(menuId);
  const trigger = $(triggerId);
  const select = $(selectId);
  const label = $(textId);

  if (!menu || !trigger || !select) return;

  const currentVal = select.value || "";

  // Synchronize native select options
  select.innerHTML = items.map(itemText => {
    const isAll = itemText.startsWith("All");
    const val = isAll ? "" : itemText;
    const isSelected = val === currentVal;
    return `<option value="${escapeHtml(val)}" ${isSelected ? 'selected' : ''}>${escapeHtml(itemText)}</option>`;
  }).join("");

  // Populate custom dropdown menu items
  menu.innerHTML = items.map(itemText => {
    const isAll = itemText.startsWith("All");
    const val = isAll ? "" : itemText;
    const isSelected = val === currentVal;
    return `
      <div class="custom-dropdown-item ${isSelected ? 'selected' : ''}" data-val="${escapeHtml(val)}" data-label="${escapeHtml(itemText)}">
        <div class="icon-badge"><i class="${iconClass}"></i></div>
        <span>${escapeHtml(itemText)}</span>
      </div>
    `;
  }).join("");

  // Update label text if needed
  if (label) {
    const selectedItem = items.find(i => (i.startsWith("All") ? "" : i) === currentVal);
    label.textContent = selectedItem || items[0] || "";
  }

  // Trigger click handler
  trigger.onclick = (e) => {
    e.stopPropagation();
    document.querySelectorAll(".custom-dropdown-menu").forEach(m => {
      if (m !== menu) m.classList.add("hidden");
    });
    document.querySelectorAll(".custom-trigger").forEach(t => {
      if (t !== trigger) t.classList.remove("open");
    });
    menu.classList.toggle("hidden");
    trigger.classList.toggle("open");
  };

  // Item click handlers
  menu.querySelectorAll(".custom-dropdown-item").forEach(item => {
    item.onclick = (e) => {
      e.stopPropagation();
      const val = item.getAttribute("data-val");
      const text = item.getAttribute("data-label");

      select.value = val;
      if (label) label.textContent = text;

      menu.querySelectorAll(".custom-dropdown-item").forEach(i => i.classList.remove("selected"));
      item.classList.add("selected");

      menu.classList.add("hidden");
      trigger.classList.remove("open");

      loadTours(false);
    };
  });
}

function updateSearchDropdownsFromData(tours = [], destinations = []) {
  // 1. Compile Admin-Controlled Destinations from database
  if (Array.isArray(destinations) && destinations.length > 0) {
    cachedDestinations = destinations;
  }
  const destSource = (Array.isArray(destinations) && destinations.length > 0)
    ? destinations
    : (Array.isArray(cachedDestinations) && cachedDestinations.length > 0 ? cachedDestinations : []);

  let destItems = [];
  if (destSource.length > 0) {
    destItems = destSource
      .filter(d => d && d.name && d.showInSearch !== false)
      .map(d => d.name.trim());
  } else if (typeof DESTINATIONS !== "undefined" && Array.isArray(DESTINATIONS)) {
    destItems = DESTINATIONS.filter(d => d && d !== "All destinations");
  }

  const sortedDests = ["All destinations", ...Array.from(new Set(destItems)).sort((a, b) => a.localeCompare(b))];

  // 2. Compile Unique Trip Types / Categories from live DB + seed fallbacks
  const baseTypes = ["Safari", "Beach", "Culture", "Wildlife", "Adventure", "Overland Truck Party"];
  const typeSet = new Set(baseTypes);

  if (Array.isArray(tours)) {
    tours.forEach(t => {
      if (t.category && t.category.trim()) {
        typeSet.add(t.category.trim());
      }
    });
  }

  const sortedTypes = ["All types", ...Array.from(typeSet).sort((a, b) => a.localeCompare(b))];

  // 3. Compile Unique Durations
  const durationSelect = $("duration");
  if (durationSelect && Array.isArray(tours) && tours.length > 0) {
    const currentDurVal = durationSelect.value;
    const durSet = new Set();
    tours.forEach(t => {
      const d = parseInt(t.duration, 10);
      if (!isNaN(d) && d > 0) durSet.add(d);
    });

    const sortedDurs = Array.from(durSet).sort((a, b) => a - b);
    let durOptionsHtml = `<option value="">Any duration</option>`;
    sortedDurs.forEach(d => {
      if (d < 5) {
        durOptionsHtml += `<option value="${d}" ${currentDurVal === String(d) ? 'selected' : ''}>${d} days</option>`;
      }
    });
    durOptionsHtml += `<option value="5" ${currentDurVal === '5' ? 'selected' : ''}>5+ days</option>`;
    durationSelect.innerHTML = durOptionsHtml;
  }

  // 4. Update custom destination dropdown & select
  setupDropdown({
    menuId: "destMenu",
    triggerId: "destTrigger",
    selectId: "destination",
    textId: "destSelectedText",
    items: sortedDests,
    iconClass: "fa-solid fa-location-dot"
  });

  // 5. Update custom category dropdown & select
  setupDropdown({
    menuId: "typeMenu",
    triggerId: "typeTrigger",
    selectId: "category",
    textId: "typeSelectedText",
    items: sortedTypes,
    iconClass: "fa-solid fa-compass"
  });
}

async function initCustomDropdowns() {
  document.onclick = () => {
    document.querySelectorAll(".custom-dropdown-menu").forEach(m => m.classList.add("hidden"));
    document.querySelectorAll(".custom-trigger").forEach(t => t.classList.remove("open"));
  };

  try {
    const [toursRes, destsRes] = await Promise.all([
      fetch("/api/tours").then(r => r.json()).catch(() => []),
      fetch("/api/destinations").then(r => r.json()).catch(() => [])
    ]);
    if (Array.isArray(destsRes) && destsRes.length > 0) {
      cachedDestinations = destsRes;
    }
    updateSearchDropdownsFromData(
      Array.isArray(toursRes) ? toursRes : [],
      Array.isArray(destsRes) ? destsRes : []
    );
  } catch (err) {
    console.warn("Could not dynamically load search dropdown options:", err);
  }
}

let upcomingCarouselInterval = null;

function scrollUpcoming(direction) {
  const grid = $("upcomingGrid");
  if (!grid) return;
  const firstCard = grid.querySelector(".upcoming-card");
  const scrollAmount = firstCard ? firstCard.offsetWidth + 18 : 320;
  grid.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
}

function initUpcomingCarousel() {
  const grid = $("upcomingGrid");
  if (!grid) return;

  if (upcomingCarouselInterval) clearInterval(upcomingCarouselInterval);

  let isInteracting = false;
  grid.addEventListener("mouseenter", () => { isInteracting = true; });
  grid.addEventListener("mouseleave", () => { isInteracting = false; });
  grid.addEventListener("touchstart", () => { isInteracting = true; }, { passive: true });
  grid.addEventListener("touchend", () => {
    setTimeout(() => { isInteracting = false; }, 3000);
  }, { passive: true });

  upcomingCarouselInterval = setInterval(() => {
    if (window.innerWidth > 768 || isInteracting) return;
    const firstCard = grid.querySelector(".upcoming-card");
    if (!firstCard) return;
    const cardWidth = firstCard.offsetWidth + 18;
    const maxScroll = grid.scrollWidth - grid.clientWidth;
    if (grid.scrollLeft >= maxScroll - 10) {
      grid.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      grid.scrollBy({ left: cardWidth, behavior: "smooth" });
    }
  }, 3500);
}

let upcomingToursData = typeof UPCOMING_TOURS !== "undefined" ? UPCOMING_TOURS : [];

async function renderUpcomingTours() {
  const grid = $("upcomingGrid");
  if (!grid) return;

  try {
    const res = await fetch("/api/upcoming");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        upcomingToursData = data;
      }
    }
  } catch (e) {
    console.warn("Using local upcoming data", e);
  }

  if (!upcomingToursData || upcomingToursData.length === 0) return;

  grid.innerHTML = upcomingToursData.map((t, index) => {
    const upImg = t.image || t.imageUrl || '/packages/lake_Bogoria.webp';
    return `
    <div class="upcoming-card card-item" data-aos="fade-up" data-aos-duration="800" data-aos-delay="${(index % 3) * 150}" onclick="openUpcomingTour('${t.id}')">
      <div class="upcoming-image-box">
        <img src="${upImg}" alt="${escapeHtml(t.title)}" class="card-flyer-img" loading="lazy" decoding="async">
        <div class="upcoming-location-badge">
          <i class="fa-solid fa-location-dot"></i> <span>${escapeHtml(t.location || t.title)}</span>
        </div>
      </div>
    </div>
  `;
  }).join("");
  if (typeof AOS !== "undefined") AOS.refresh();
  initUpcomingCarousel();
}

function openUpcomingTour(id) {
  const pkg = upcomingToursData.find(item => item.id === id);
  if (!pkg) return;
  const pkgImg = pkg.image || pkg.imageUrl || '/packages/lake_Bogoria.webp';

  $("modalContent").innerHTML = `
    <div class="modal-clear-image-container" onclick="openLightbox('${pkgImg}', '${escapeHtml(pkg.title).replace(/'/g, "\\'")}')" title="Click to view full screen">
      <img src="${pkgImg}" alt="${escapeHtml(pkg.title)}" class="modal-clear-img">
      <span class="zoom-badge"><i class="fa-solid fa-magnifying-glass-plus"></i> View Full Screen</span>
    </div>
    <div class="modal-body compact-modal-body text-center">
      <div class="modal-header-compact">
        <p class="eyebrow dark"><i class="fa-solid fa-location-dot"></i> ${escapeHtml((pkg.location || "").toUpperCase())} · <i class="fa-solid fa-calendar-days"></i> ${escapeHtml(pkg.date || "")}</p>
        <h2 style="margin: 6px 0 10px; font-size: 24px; text-transform: uppercase;">${escapeHtml(pkg.title)}</h2>
        <div class="tour-meta compact-meta" style="justify-content: center; gap: 16px; margin-bottom: 12px;">
          <span>Category: <b>${escapeHtml(pkg.category || "Safari")}</b></span>
          <span>Starting at: <b>KES ${Number(pkg.price || 0).toLocaleString()}</b> / person</span>
        </div>
      </div>
      <p class="modal-desc" style="margin: 10px 0 20px; font-size: 14.5px; color: #403D3D;">${escapeHtml(pkg.description || pkg.subtitle || "")}</p>
      
      <button class="modal-book-now-whatsapp-btn" onclick="bookOnWhatsApp('${escapeHtml(pkg.title).replace(/'/g, "\\'")}', '${escapeHtml(pkg.location || "").replace(/'/g, "\\'")}', '${escapeHtml(pkg.date || "")}', '${pkg.price || 0}')">
        <i class="fa-brands fa-whatsapp"></i> Book Now
      </button>
    </div>`;
  $("tourModal").classList.remove("hidden");
}

const searchBtnEl = $("searchBtn");
if (searchBtnEl) {
  searchBtnEl.addEventListener("click", () => {
    loadTours(true);
  });
}

["destination", "category", "duration"].forEach(id => {
  const el = $(id);
  if (el) el.addEventListener("change", () => loadTours(false));
});

const tourModalEl = $("tourModal");
if (tourModalEl) {
  tourModalEl.addEventListener("click", e => { if (e.target.id === "tourModal") closeModal(); });
}
const inquireModalEl = $("inquireModal");
if (inquireModalEl) {
  inquireModalEl.addEventListener("click", e => { if (e.target.id === "inquireModal") closeInquireModal(); });
}

function openInquireModal() {
  const modal = $("inquireModal");
  if (modal) {
    modal.classList.remove("hidden");
    setupInquiryValidation();
  }
}

function closeInquireModal() {
  const modal = $("inquireModal");
  if (modal) modal.classList.add("hidden");
}

function setupInquiryValidation() {
  const form = $("inquireForm");
  if (!form) return;

  const btn = form.querySelector(".submit-inquiry-btn");
  if (!btn) return;

  function validate() {
    const name = $("inquireName") ? $("inquireName").value.trim() : "";
    const email = $("inquireEmail") ? $("inquireEmail").value.trim() : "";
    const phone = $("inquirePhone") ? $("inquirePhone").value.trim() : "";
    const subject = $("inquireSubject") ? $("inquireSubject").value.trim() : "";
    const message = $("inquireMessage") ? $("inquireMessage").value.trim() : "";
    const consent = $("inquireConsent") ? $("inquireConsent").checked : false;

    const isEmailValid = email.includes("@") && email.includes(".");

    const isReady = !!(name && isEmailValid && phone && subject && message && consent);

    if (isReady) {
      btn.classList.add("ready");
      btn.removeAttribute("disabled");
    } else {
      btn.classList.remove("ready");
      btn.setAttribute("disabled", "true");
    }
  }

  form.querySelectorAll("input, textarea").forEach(input => {
    input.removeEventListener("input", validate);
    input.removeEventListener("change", validate);
    input.addEventListener("input", validate);
    input.addEventListener("change", validate);
  });

  validate();
}

async function submitInquiry(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));

  const consentBox = $("inquireConsent");
  if (consentBox && !consentBox.checked) {
    alert("Please check the box to agree to be contacted by Supreme Adventures.");
    return;
  }

  try {
    await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        source: "Inquire Now Form"
      })
    });
  } catch (err) {
    console.error("Error logging enquiry to backend:", err);
  }

  const text = `Hello Supreme Adventures! 👋\n\n*NEW TRIP INQUIRY*\n👤 *Name:* ${data.name || 'Not provided'}\n✉️ *Email:* ${data.email || 'Not provided'}\n📞 *Phone:* ${data.phone || 'Not provided'}\n📅 *Subject / Trip Dates:* ${data.subject || 'General Inquiry'}\n\n📝 *Inquiry Details:*\n${data.message || 'None'}\n\n✅ *Consent:* Agreed to be contacted by Supreme Adventures.`;

  window.open(`https://wa.me/254759080100?text=${encodeURIComponent(text)}`, '_blank');

  form.reset();
  setupInquiryValidation();
  closeInquireModal();
}

function openWhatsAppDestination(destName) {
  const message = `Hello Supreme Adventures! 👋\n\nI am interested in learning more and planning a trip to *${destName}*. Could you please share available packages, pricing, and custom itineraries?`;
  window.open(`https://wa.me/254759080100?text=${encodeURIComponent(message)}`, '_blank');
}

/* ==========================================================================
   Popular Destinations - 3D Parabolic Dome Carousel System
   ========================================================================== */
let currentDomeCenter = 2; // Default center apex index
let domeAutoPlayTimer = null;

function updateDomePositions() {
  const cards = document.querySelectorAll('#destinationsDome .destination-card');
  const dots = document.querySelectorAll('#domePagination .dot');
  const total = cards.length;

  if (!total) return;

  cards.forEach((card) => {
    const idx = parseInt(card.getAttribute('data-index'), 10);

    // Shortest circular signed distance from currentDomeCenter to idx
    let diff = (idx - currentDomeCenter) % total;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    // Map diff to posIndex:
    // diff = 0 -> pos 2 (Apex)
    // diff = -1 -> pos 1, diff = -2 -> pos 0, diff < -2 -> pos -1 (offscreen left)
    // diff = 1 -> pos 3, diff = 2 -> pos 4, diff > 2 -> pos 5 (offscreen right)
    let posIndex;
    if (diff === 0) posIndex = 2;
    else if (diff === -1) posIndex = 1;
    else if (diff === -2) posIndex = 0;
    else if (diff < -2) posIndex = -1;
    else if (diff === 1) posIndex = 3;
    else if (diff === 2) posIndex = 4;
    else posIndex = 5;

    const prevPos = parseInt(card.getAttribute('data-pos'), 10);

    // If flipping between off-screen boundaries (-1 <-> 5), silence CSS transition so card does not fly across screen
    if ((prevPos === -1 && posIndex === 5) || (prevPos === 5 && posIndex === -1)) {
      card.classList.add('no-transition');
      card.setAttribute('data-pos', posIndex);
      void card.offsetWidth; // force synchronous reflow
      requestAnimationFrame(() => {
        card.classList.remove('no-transition');
      });
    } else {
      card.setAttribute('data-pos', posIndex);
    }
  });

  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentDomeCenter);
  });
}

function rotateDome(direction) {
  const cards = document.querySelectorAll('#destinationsDome .destination-card');
  const total = cards.length || 10;
  currentDomeCenter = (currentDomeCenter + direction + total) % total;
  updateDomePositions();
  resetDomeTimer();
}

function setDomeApex(index) {
  const cards = document.querySelectorAll('#destinationsDome .destination-card');
  const total = cards.length || 10;
  currentDomeCenter = ((index % total) + total) % total;
  updateDomePositions();
  resetDomeTimer();
}

function handleDomeCardClick(index, destName) {
  if (currentDomeCenter === index) {
    openWhatsAppDestination(destName);
  } else {
    setDomeApex(index);
  }
}

function startDomeAutoPlay() {
  stopDomeAutoPlay();
  domeAutoPlayTimer = setInterval(() => { rotateDome(1); }, 3000);
}

function stopDomeAutoPlay() {
  if (domeAutoPlayTimer) {
    clearInterval(domeAutoPlayTimer);
    domeAutoPlayTimer = null;
  }
}

function resetDomeTimer() {
  startDomeAutoPlay();
}

async function loadDestinations() {
  const dome = $("destinationsDome");
  const pagination = $("domePagination");
  if (!dome) return;

  try {
    const res = await fetch("/api/destinations");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        cachedDestinations = data;
        
        dome.innerHTML = data.map((d, idx) => {
          const initialPos = idx < 6 ? idx : -1;
          const imgSrc = d.image || d.imageUrl || '/photos/mara_2.jpg';
          const name = d.name || d.title || 'Destination';
          return `
            <div class="destination-card" data-index="${idx}" data-pos="${initialPos}"
              onclick="handleDomeCardClick(${idx}, '${escapeHtml(name).replace(/'/g, "\\'")}')">
              <div class="dest-img-box">
                <img src="${imgSrc}" onerror="this.onerror=null;this.src='/photos/mara_2.jpg';" alt="${escapeHtml(name)}" width="300" height="400" loading="lazy" decoding="async">
              </div>
              <div class="dest-card-info">
                <h3>${escapeHtml(name)}</h3>
              </div>
            </div>
          `;
        }).join("");

        if (pagination) {
          pagination.innerHTML = data.map((d, idx) => {
            const name = d.name || d.title || 'Destination';
            return `<span class="dot ${idx === currentDomeCenter ? 'active' : ''}" onclick="setDomeApex(${idx})" aria-label="${escapeHtml(name)}" title="${escapeHtml(name)}"></span>`;
          }).join("");
        }

        currentDomeCenter = Math.min(2, Math.max(0, data.length - 1));
        updateDomePositions();
        startDomeAutoPlay();
      }
    }
  } catch (err) {
    console.warn("Could not dynamically load destinations:", err);
  }
}

function initDomeCarousel() {
  const domeElem = document.getElementById('destinationsDome');
  if (domeElem) {
    domeElem.addEventListener('mouseenter', stopDomeAutoPlay);
    domeElem.addEventListener('mouseleave', startDomeAutoPlay);
    updateDomePositions();
    startDomeAutoPlay();
  }
}

function initAOS() {
  if (typeof AOS !== "undefined") {
    AOS.init({
      // Core animation settings
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
      // Additional performance tweaks
      debounceDelay: 50, // debounce resize events
      throttleDelay: 99, // throttle scroll events
      mirror: false, // do not animate out of view elements
      anchorPlacement: "top-bottom"
    });
    // Refresh AOS on viewport resize to recalculate positions
    window.addEventListener("resize", () => {
      if (typeof AOS !== "undefined") {
        AOS.refresh();
      }
    });
  }
}

initHeroSlider();
initCustomDropdowns();
loadDestinations();
renderUpcomingTours();
loadTours();
loadGallery();
initScrollReveal();
setupInquiryValidation();
initDomeCarousel();
initAOS();

function initScrollReveal() {
  const elements = document.querySelectorAll(
    ".reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale, .upcoming-card, .tour-card, .gallery-item"
  );

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  elements.forEach((el, index) => {
    if (!el.style.transitionDelay && !el.classList.contains("delay-100") && !el.classList.contains("delay-200") && !el.classList.contains("delay-300")) {
      const delay = (index % 4) * 0.12;
      el.style.transitionDelay = `${delay}s`;
    }
    observer.observe(el);
  });

  if (typeof AOS !== "undefined") {
    AOS.refresh();
  }
}



document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeLightbox();
    closeModal();
    closeInquireModal();
  }
});

// Mobile Reviews Slider Smooth Scroll, Auto Animation & Dots Synchronization
let currentReviewIndex = 0;
let reviewAutoTimer = null;
let userInteractedTimeout = null;

function scrollToReview(index, userAction = true) {
  const grid = document.querySelector(".reviews-grid");
  if (!grid) return;
  const cards = grid.querySelectorAll(".review-card");
  if (cards[index]) {
    currentReviewIndex = index;
    // Container-only horizontal scroll (prevents vertical window page jumping)
    const cardLeft = cards[index].offsetLeft;
    const cardWidth = cards[index].offsetWidth;
    const gridWidth = grid.offsetWidth;
    const targetScrollLeft = cardLeft - (gridWidth - cardWidth) / 2;

    grid.scrollTo({
      left: targetScrollLeft,
      behavior: "smooth"
    });
  }
  if (userAction) {
    pauseAndResetAutoReviewSlider();
  }
}

function nextReviewCard() {
  const grid = document.querySelector(".reviews-grid");
  if (!grid) return;

  // Only auto-advance if the reviews section is currently visible in the viewport
  const rect = grid.getBoundingClientRect();
  const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
  if (!isVisible) return;

  const cards = grid.querySelectorAll(".review-card");
  if (cards.length === 0) return;
  const nextIdx = (currentReviewIndex + 1) % cards.length;
  scrollToReview(nextIdx, false);
}

function startAutoReviewSlider() {
  if (reviewAutoTimer) clearInterval(reviewAutoTimer);
  if (window.innerWidth <= 992) {
    reviewAutoTimer = setInterval(() => {
      nextReviewCard();
    }, 3800);
  }
}

function pauseAndResetAutoReviewSlider() {
  if (reviewAutoTimer) {
    clearInterval(reviewAutoTimer);
    reviewAutoTimer = null;
  }
  if (userInteractedTimeout) clearTimeout(userInteractedTimeout);
  userInteractedTimeout = setTimeout(() => {
    startAutoReviewSlider();
  }, 6000);
}

// Navigation Bar Scrollspy: Dynamic Section Highlight
function initNavScrollspy() {
  const navLinks = document.querySelectorAll('#mainNav a[href^="#"]');
  if (navLinks.length === 0) return;

  const sectionsMap = [];
  navLinks.forEach(link => {
    const hash = link.getAttribute("href");
    if (hash && hash !== "#" && !link.classList.contains("nav-cta")) {
      const section = document.querySelector(hash);
      if (section) {
        sectionsMap.push({ hash, element: section, link });
      }
    }
  });

  if (sectionsMap.length === 0) return;

  function updateActiveNav() {
    const scrollPosition = window.scrollY + 130; // Offset for fixed header height

    // Check if scrolled near the bottom of the page
    const isAtBottom = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 80);

    let activeSection = null;

    if (isAtBottom) {
      activeSection = sectionsMap[sectionsMap.length - 1];
    } else {
      for (let i = 0; i < sectionsMap.length; i++) {
        const item = sectionsMap[i];
        const top = item.element.offsetTop;
        const height = item.element.offsetHeight;

        if (scrollPosition >= top && scrollPosition < top + height) {
          activeSection = item;
          break;
        } else if (scrollPosition >= top) {
          activeSection = item;
        }
      }
    }

    navLinks.forEach(link => {
      if (!link.classList.contains("nav-cta")) {
        link.classList.remove("active");
      }
    });

    if (activeSection && activeSection.link) {
      activeSection.link.classList.add("active");
    }
  }

  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();
}

document.addEventListener("DOMContentLoaded", () => {
  initNavScrollspy();

  const grid = document.querySelector(".reviews-grid");
  const dots = document.querySelectorAll(".reviews-dot");

  if (grid) {
    grid.addEventListener("scroll", () => {
      const cards = grid.querySelectorAll(".review-card");
      const gridCenter = grid.scrollLeft + grid.offsetWidth / 2;

      let closestIndex = 0;
      let minDistance = Infinity;

      cards.forEach((card, idx) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - gridCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = idx;
        }
      });

      currentReviewIndex = closestIndex;
      dots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === closestIndex);
      });
    }, { passive: true });

    grid.addEventListener("touchstart", pauseAndResetAutoReviewSlider, { passive: true });
    grid.addEventListener("mouseenter", pauseAndResetAutoReviewSlider, { passive: true });

    startAutoReviewSlider();

    window.addEventListener("resize", () => {
      if (window.innerWidth > 992 && reviewAutoTimer) {
        clearInterval(reviewAutoTimer);
        reviewAutoTimer = null;
      } else if (window.innerWidth <= 992 && !reviewAutoTimer) {
        startAutoReviewSlider();
      }
    });
  }
});


