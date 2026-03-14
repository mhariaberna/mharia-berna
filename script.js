// --- GLOBAL VARIABLES & SELECTIONS ---
let currentImgIdx = 0;
let currentVidIdx = 0;

const allGalleryImgs = document.querySelectorAll('.art-card img');
const allGalleryVids = document.querySelectorAll('.video-wrapper video');

// --- REVEAL ON SCROLL LOGIC ---
const observerOptions = { threshold: 0.15 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, observerOptions);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// --- CREATIVE PROCESS VIDEO SLIDER (Infinite Carousel) ---
const videoSlider = document.getElementById('videoSlider');
let isSliderAnimating = false;

function moveVideoSlider(direction) {
    if (isSliderAnimating) return;
    
    // Stop all slider videos before moving
    document.querySelectorAll('.video-slide video').forEach(v => {
        v.pause();
        v.currentTime = 0;
    });

    isSliderAnimating = true;
    const visibleVideos = window.innerWidth > 1000 ? 3 : 1;
    const shiftPercentage = 100 / visibleVideos;
    
    if (direction === 1) {
        // Slide Next
        videoSlider.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        videoSlider.style.transform = `translateX(-${shiftPercentage}%)`;
        
        setTimeout(() => {
            videoSlider.appendChild(videoSlider.firstElementChild);
            videoSlider.style.transition = 'none';
            videoSlider.style.transform = 'translateX(0)';
            isSliderAnimating = false;
        }, 600);
    } else {
        // Slide Prev
        videoSlider.prepend(videoSlider.lastElementChild);
        videoSlider.style.transition = 'none';
        videoSlider.style.transform = `translateX(-${shiftPercentage}%)`;
        
        void videoSlider.offsetWidth; // Force reflow
        
        videoSlider.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        videoSlider.style.transform = 'translateX(0)';
        
        setTimeout(() => {
            isSliderAnimating = false;
        }, 600);
    }
}

// Mobile Swipe Support for Video Slider
const sliderContainer = document.getElementById('videoSliderContainer');
let sliderStartX = 0;
sliderContainer.addEventListener('touchstart', e => {
    if (window.innerWidth > 1000) return;
    sliderStartX = e.touches[0].clientX;
}, {passive: true});
sliderContainer.addEventListener('touchend', e => {
    if (window.innerWidth > 1000) return;
    let deltaX = e.changedTouches[0].clientX - sliderStartX;
    if (deltaX < -50) moveVideoSlider(1); // Swipe left -> next
    if (deltaX > 50) moveVideoSlider(-1); // Swipe right -> prev
}, {passive: true});

// --- IMAGE LIGHTBOX LOGIC ---
function openLightbox(element) {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const clickedImg = element.querySelector('img');
    
    currentImgIdx = Array.from(allGalleryImgs).indexOf(clickedImg);
    lbImg.src = clickedImg.src;
    
    lb.style.display = "flex";
    document.body.classList.add('no-scroll');
    setTimeout(() => lb.classList.add('active'), 10);
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    lb.classList.remove('active');
    document.body.classList.remove('no-scroll');
    setTimeout(() => lb.style.display = "none", 400);
}

function navigateImages(step) {
    currentImgIdx = (currentImgIdx + step + allGalleryImgs.length) % allGalleryImgs.length;
    document.getElementById('lightbox-img').src = allGalleryImgs[currentImgIdx].src;
}

// --- VIDEO LIGHTBOX LOGIC ---
function toggleFullScreen(videoElement) {
    const lb = document.getElementById('videoLightbox');
    const lbVideo = document.getElementById('lightboxVideo');
    const canvas = document.getElementById('paintCanvas');

    currentVidIdx = Array.from(allGalleryVids).indexOf(videoElement);
    lbVideo.src = videoElement.querySelector('source').src;
    lbVideo.load();

    // Mobile specific: Remove controls & loop it natively
    if (window.innerWidth <= 1000) {
        lbVideo.removeAttribute('controls');
        lbVideo.loop = true;
    } else {
        lbVideo.setAttribute('controls', 'controls');
        lbVideo.loop = false;
    }

    lb.style.display = "flex";
    lb.appendChild(canvas); // Move fairy dust canvas into lightbox for effect
    document.body.classList.add('no-scroll');

    setTimeout(() => {
        lb.classList.add('active');
        lbVideo.play();
    }, 10);
}

function closeVideoLightbox() {
    const lb = document.getElementById('videoLightbox');
    const lbVideo = document.getElementById('lightboxVideo');
    const canvas = document.getElementById('paintCanvas');

    lbVideo.pause();
    lb.classList.remove('active');
    document.body.classList.remove('no-scroll');

    setTimeout(() => {
        lb.style.display = "none";
        document.body.appendChild(canvas); // Return canvas to main body
    }, 400);
}

function navigateVideos(step) {
    currentVidIdx = (currentVidIdx + step + allGalleryVids.length) % allGalleryVids.length;
    const lbVideo = document.getElementById('lightboxVideo');
    lbVideo.src = allGalleryVids[currentVidIdx].querySelector('source').src;
    lbVideo.load();
    lbVideo.play();
}

// --- GLOBAL EVENT LISTENERS (Background & Keys) ---
document.getElementById("videoLightbox").addEventListener("click", function(e){
    if(e.target.id === "videoLightbox" && window.innerWidth > 1000) closeVideoLightbox();
});

document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        closeLightbox();
        closeVideoLightbox();
    }
});

document.querySelectorAll('.video-wrapper video').forEach(video => {
    video.onclick = function() { toggleFullScreen(this); };
});

// --- FAIRY DUST MAGIC TRAIL ---
const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize);
resize();

document.addEventListener('mousemove', (e) => {
    for(let i = 0; i < 3; i++) {
        particles.push({
            x: e.clientX, y: e.clientY,
            vx: (Math.random() - 0.5) * 1.5, 
            vy: (Math.random() - 0.5) * 1.5 + 0.5, 
            size: Math.random() * 2.5 + 0.5, life: 1, 
            color: Math.random() > 0.4 ? '212, 163, 115' : '255, 255, 255' 
        });
    }
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.life})`;
        ctx.shadowBlur = 8; ctx.shadowColor = `rgb(${p.color})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy; p.life -= 0.02; 
    });
    particles = particles.filter(p => p.life > 0);
    requestAnimationFrame(draw);
}
draw();

// --- CONTACT FORM SUBMISSION ---
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = document.getElementById('submitBtn');
    const thankYou = document.getElementById('thankYouMessage');
    const formData = new FormData(form);

    submitBtn.textContent = "Sending...";
    submitBtn.style.opacity = "0.5";

    try {
        const response = await fetch("https://formspree.io/f/xkoqokyg", {
            method: "POST",
            body: formData,
            headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
            form.style.display = 'none';
            thankYou.style.display = 'flex';
        } else {
            alert("Oops! There was a problem.");
            submitBtn.textContent = "Submit Inquiry";
            submitBtn.style.opacity = "1";
        }
    } catch (error) {
        alert("Connectivity error.");
        submitBtn.textContent = "Submit Inquiry";
        submitBtn.style.opacity = "1";
    }
});

function resetForm() {
    const form = document.getElementById('contactForm');
    const thankYou = document.getElementById('thankYouMessage');
    thankYou.style.display = 'none';
    form.style.display = 'flex';
    form.reset();
}

// --- VIDEO HOVER PREVIEWS ---
document.querySelectorAll('.video-wrapper video').forEach(video => {
    video.muted = true;
    video.addEventListener("mouseenter", () => { video.currentTime = 0; video.play(); });
    video.addEventListener("mouseleave", () => { video.pause(); video.currentTime = 0; });
});

// --- DESKTOP CLICK NAVIGATION (Restricted to Desktop) ---
const imgLB = document.getElementById('lightbox');
imgLB.addEventListener("click", function(e){
    if (window.innerWidth <= 1000) return; // Disable on mobile so it doesn't interrupt swipe
    if(e.target.id === "lightbox-img") return;
    const screenX = e.clientX;
    const screenWidth = window.innerWidth;
    if(screenX < screenWidth / 2) navigateImages(-1);
    else navigateImages(1);
});

const vidLB = document.getElementById('videoLightbox');
vidLB.addEventListener("click", function(e){
    if (window.innerWidth <= 1000) return; // Disable on mobile so it doesn't interrupt swipe
    if(e.target.id === "lightboxVideo") return;
    const screenX = e.clientX;
    const screenWidth = window.innerWidth;
    if(screenX < screenWidth / 2) navigateVideos(-1);
    else navigateVideos(1);
});

// --- MOBILE MAGNET SWIPE ENGINE ---
function setupMagnetSwipe(lightboxId, contentSelector, type) {
    const lb = document.getElementById(lightboxId);
    const content = lb.querySelector(contentSelector);
    let startY = 0, startX = 0;
    let isDragging = false;
    let swipeDir = '';

    lb.addEventListener('touchstart', (e) => {
        if (window.innerWidth > 1000) return; // Desktop uses clicks/buttons
        if (e.touches.length > 1) return; // Ignore multi-touch
        isDragging = true;
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
        content.style.transition = 'none'; // Instant follow
        swipeDir = '';
    }, {passive: false});

    lb.addEventListener('touchmove', (e) => {
        if (!isDragging || window.innerWidth > 1000) return;
        
        const deltaY = e.touches[0].clientY - startY;
        const deltaX = e.touches[0].clientX - startX;

        // Lock in a direction (Vertical or Horizontal)
        if (!swipeDir) {
            if (Math.abs(deltaY) > Math.abs(deltaX)) swipeDir = 'v';
            else swipeDir = 'h';
        }

        // Apply physical drag translations to the image/video
        if (swipeDir === 'v') {
            e.preventDefault(); // Prevents page refresh/scrolling
            content.style.transform = `translateY(${deltaY}px) scale(1)`;
        } else if (swipeDir === 'h') {
            e.preventDefault();
            content.style.transform = `translateX(${deltaX}px) scale(1)`;
            content.style.opacity = 1 - (Math.abs(deltaX) / window.innerWidth); // Fades out gently as you pull left/right
        }
    }, {passive: false});

    lb.addEventListener('touchend', (e) => {
        if (!isDragging || window.innerWidth > 1000) return;
        isDragging = false;
        
        const deltaY = e.changedTouches[0].clientY - startY;
        const deltaX = e.changedTouches[0].clientX - startX;
        
        // Restore transition for smooth snapping
        content.style.transition = 'transform 0.4s cubic-bezier(0.2, 1, 0.3, 1), opacity 0.4s ease';
        
        if (swipeDir === 'v') {
            if (deltaY < -100) { // Swiped Up drastically -> Next
                type === 'img' ? navigateImages(1) : navigateVideos(1);
            } else if (deltaY > 100) { // Swiped Down drastically -> Prev
                type === 'img' ? navigateImages(-1) : navigateVideos(-1);
            }
        } else if (swipeDir === 'h') {
            if (Math.abs(deltaX) > 80) { // Swiped Left/Right drastically -> Close
                type === 'img' ? closeLightbox() : closeVideoLightbox();
            }
        }
        
        // Snap back to center
        content.style.transform = 'translateY(0) translateX(0) scale(1)';
        content.style.opacity = '1';
        
        setTimeout(() => {
            // Remove hardcoded transform after transition completes to not mess up active scaling
            if (!isDragging) content.style.transform = ''; 
        }, 400);
    });
}

// Bind the magnet swipe engine
setupMagnetSwipe('lightbox', '.lightbox-content', 'img');
setupMagnetSwipe('videoLightbox', '.video-lightbox-wrapper', 'vid');