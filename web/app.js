import { sampleCourses } from './sample-courses.js';
import { recommendCourses } from './ai-engine.js';

// Initial state and database retrieval
// Initial state and database retrieval with smart merge:
// Automatically load fresh crawled data from sample-courses.js while preserving user-created custom courses.
let storedCourses = JSON.parse(localStorage.getItem('pkg_courses'));
let courses = [];
if (!storedCourses) {
  courses = sampleCourses;
} else {
  const sampleIds = new Set(sampleCourses.map(c => c.id));
  const customCourses = storedCourses.filter(c => !sampleIds.has(c.id));
  courses = [...sampleCourses, ...customCourses];
  localStorage.setItem('pkg_courses', JSON.stringify(courses));
}
let bookmarks = JSON.parse(localStorage.getItem('pkg_bookmarks')) || [];
let customSites = JSON.parse(localStorage.getItem('pkg_custom_sites')) || [];
let reviews = JSON.parse(localStorage.getItem('pkg_reviews')) || [
  {
    courseId: "idec-003",
    rating: 5,
    text: "ANSYS를 사용해 Warpage 해석 실무를 직접 해본 것이 패키징 설계 면접에서 정말 큰 강점이 되었습니다. 강추합니다!",
    date: "2026-06-12"
  },
  {
    courseId: "seminarhub-007",
    rating: 4,
    text: "최신 유리기판 공정 트렌드와 HBM4 로드맵을 한눈에 파악하기 매우 유익한 세미나였습니다. 외부 신청도 간편했습니다.",
    date: "2026-06-20"
  }
];
let qna = JSON.parse(localStorage.getItem('pkg_qna')) || [
  {
    courseId: "semi-kr-006",
    title: "비전공자 신입 엔지니어가 수강해도 이해하기 무리 없을까요?",
    text: "HBM이나 Advanced Packaging 기초 개념이 약한 편인데 교육 난이도가 어느 정도인지 궁금합니다.",
    date: "2026-06-18"
  }
];

// Current calendar date pointer
let currentCalendarDate = new Date(2026, 6, 1); // July 2026

// Save utilities
function saveToStorage() {
  localStorage.setItem('pkg_courses', JSON.stringify(courses));
  localStorage.setItem('pkg_bookmarks', JSON.stringify(bookmarks));
  localStorage.setItem('pkg_reviews', JSON.stringify(reviews));
  localStorage.setItem('pkg_qna', JSON.stringify(qna));
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initDashboard();
  initExplore();
  initRecommender();
  initCalendar();
  initReviewsAndQna();
  initAdminStaging();
  initSiteRecommendations();
  initQuickFinder();
  initSidebarToggle();
  updateStats();
});

// 1. Navigation Controller
function initNavigation() {
  const menuItems = document.querySelectorAll('.menu-item');
  const tabContents = document.querySelectorAll('.tab-content');
  const pageTitle = document.getElementById('page-title');

  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabName = item.getAttribute('data-tab');
      
      // Update sidebar highlight
      menuItems.forEach(mi => mi.classList.remove('active'));
      item.classList.add('active');

      // Show target tab
      tabContents.forEach(tc => tc.classList.remove('active'));
      document.getElementById(tabName).classList.add('active');

      // Update Header Title
      pageTitle.textContent = item.textContent.trim();

      // Trigger specific tab refreshes if needed
      if (tabName === 'explore') renderExploreGrid();
      if (tabName === 'calendar') renderCalendar();
      if (tabName === 'dashboard') initDashboard();
      if (tabName === 'site-recommendations') renderSiteRecommendations();
    });
  });
}

// 2. Dashboard Controller
function initDashboard() {
  updateStats();
  
  // Render Top Featured Courses (highest level courses or first two)
  const featuredContainer = document.getElementById('dashboard-featured-courses');
  if (featuredContainer) {
    featuredContainer.innerHTML = '';
    const featured = courses.slice(0, 2);
    featured.forEach(course => {
      featuredContainer.appendChild(createCourseCard(course));
    });
  }

  // Render Bookmarks
  renderDashboardBookmarks();

  // Hook up trend tags click
  const trendTags = document.querySelectorAll('.trend-tag');
  trendTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const keyword = tag.getAttribute('data-keyword');
      if (keyword) {
        // 1. Switch to explore tab
        const exploreTabBtn = document.querySelector('.menu-item[data-tab="explore"]');
        if (exploreTabBtn) {
          exploreTabBtn.click();
        }
        
        // 2. Set search input value and trigger search
        const searchInput = document.getElementById('explore-search');
        if (searchInput) {
          searchInput.value = keyword;
          exploreFilters.search = keyword;
          renderExploreGrid();
        }
      }
    });
  });

  // Hook up stat cards click
  const statCards = document.querySelectorAll('.stat-card');
  statCards.forEach(card => {
    card.addEventListener('click', () => {
      const type = card.getAttribute('data-filter-type');
      const val = card.getAttribute('data-filter-val');
      
      // 1. Switch to explore tab
      const exploreTabBtn = document.querySelector('.menu-item[data-tab="explore"]');
      if (exploreTabBtn) {
        exploreTabBtn.click();
      }
      
      // 2. Reset other filters and search query
      const searchInput = document.getElementById('explore-search');
      if (searchInput) {
        searchInput.value = '';
        exploreFilters.search = '';
      }
      
      if (type === 'all') {
        exploreFilters.region = 'all';
        exploreFilters.type = 'all';
        exploreFilters.level = 'all';
      } else if (type === 'region') {
        exploreFilters.region = val;
        exploreFilters.type = 'all';
        exploreFilters.level = 'all';
      } else if (type === 'type') {
        exploreFilters.region = 'all';
        exploreFilters.type = val;
        exploreFilters.level = 'all';
      }
      
      // 3. Update the filter button styles on the Explore page
      const regionBtns = document.querySelectorAll('#explore .btn-filter[data-region]');
      regionBtns.forEach(btn => {
        if (btn.getAttribute('data-region') === exploreFilters.region) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      
      const typeBtns = document.querySelectorAll('#explore .btn-filter[data-type]');
      typeBtns.forEach(btn => {
        if (btn.getAttribute('data-type') === exploreFilters.type) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      
      const levelBtns = document.querySelectorAll('#explore .btn-filter[data-level]');
      levelBtns.forEach(btn => {
        if (btn.getAttribute('data-level') === exploreFilters.level) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      
      // 4. Render grid
      renderExploreGrid();
    });
  });
}

function updateStats() {
  document.getElementById('stat-total-courses').textContent = courses.length;
  document.getElementById('stat-domestic-courses').textContent = courses.filter(c => c.region === '국내').length;
  document.getElementById('stat-global-courses').textContent = courses.filter(c => c.region === '해외').length;
  document.getElementById('stat-seminar-count').textContent = courses.filter(c => c.type === '세미나·컨퍼런스').length;
}

function renderDashboardBookmarks() {
  const container = document.getElementById('dashboard-bookmarks-list');
  container.innerHTML = '';

  const bookmarkedCourses = courses.filter(c => bookmarks.includes(c.id));

  if (bookmarkedCourses.length === 0) {
    container.innerHTML = `<span style="color: var(--color-text-muted); font-size: 13px;">북마크된 과정이 없습니다.</span>`;
    return;
  }

  bookmarkedCourses.forEach(c => {
    const item = document.createElement('div');
    item.className = 'glass-card';
    item.style.padding = '12px';
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    item.style.cursor = 'pointer';

    item.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 13px; font-weight: 600; color: #fff;">${c.title}</span>
        <span style="font-size: 11px; color: var(--color-text-muted);">${c.institution} | ${c.period}</span>
      </div>
      <button class="bookmark-btn active" style="background:none; border:none; color:#ef4444; cursor:pointer;">❤️</button>
    `;

    // Click bookmark to toggle off
    item.querySelector('.bookmark-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      bookmarks = bookmarks.filter(id => id !== c.id);
      saveToStorage();
      renderDashboardBookmarks();
      initDashboard();
    });

    item.addEventListener('click', () => {
      openDetailModal(c);
    });

    container.appendChild(item);
  });
}

// 3. Explore Tab Controller
let exploreFilters = {
  search: '',
  region: 'all',
  type: 'all',
  level: 'all'
};

function initExplore() {
  const searchInput = document.getElementById('explore-search');
  searchInput.addEventListener('input', (e) => {
    exploreFilters.search = e.target.value;
    renderExploreGrid();
  });

  const filterButtons = document.querySelectorAll('.btn-filter[data-region], .btn-filter[data-type], .btn-filter[data-level]');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const parent = e.target.parentElement;
      parent.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      if (e.target.hasAttribute('data-region')) {
        exploreFilters.region = e.target.getAttribute('data-region');
      } else if (e.target.hasAttribute('data-type')) {
        exploreFilters.type = e.target.getAttribute('data-type');
      } else if (e.target.hasAttribute('data-level')) {
        exploreFilters.level = e.target.getAttribute('data-level');
      }

      renderExploreGrid();
    });
  });

  renderExploreGrid();
}

function renderExploreGrid() {
  const grid = document.getElementById('explore-courses-grid');
  grid.innerHTML = '';

  const filtered = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(exploreFilters.search.toLowerCase()) ||
                          course.institution.toLowerCase().includes(exploreFilters.search.toLowerCase()) ||
                          course.topics.some(t => t.toLowerCase().includes(exploreFilters.search.toLowerCase()));
    
    const matchesRegion = exploreFilters.region === 'all' || course.region === exploreFilters.region;
    const matchesType = exploreFilters.type === 'all' || course.type === exploreFilters.type;
    const matchesLevel = exploreFilters.level === 'all' || course.difficulty === exploreFilters.level;

    return matchesSearch && matchesRegion && matchesType && matchesLevel;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-muted);">조건에 부합하는 교육과정이 존재하지 않습니다.</div>`;
    return;
  }

  filtered.forEach(course => {
    grid.appendChild(createCourseCard(course));
  });
}

// Course Card component builder (Unified Card view with Dual-Track Shortcut Link)
function createCourseCard(course, aiScore = null, aiReason = null) {
  const card = document.createElement('div');
  card.className = `glass-card course-card ${aiScore !== null ? 'ai-recommendation-card' : ''}`;
  
  const isBookmarked = bookmarks.includes(course.id);
  const regionClass = course.region === '국내' ? 'badge-region-domestic' : 'badge-region-global';
  const typeClass = course.type === '교육' ? 'badge-type-edu' : 'badge-type-semi';

  card.innerHTML = `
    <div>
      <div class="card-header">
        <div class="badge-container">
          <span class="badge ${regionClass}">${course.region}</span>
          <span class="badge ${typeClass}">${course.type}</span>
          <span class="badge" style="background: rgba(255,255,255,0.06); color: #fff;">${course.difficulty}</span>
        </div>
        <button class="bookmark-btn ${isBookmarked ? 'active' : ''}">
          ${isBookmarked ? '❤️' : '🤍'}
        </button>
      </div>
      
      <h3 class="course-title" title="${course.title}">${course.title}</h3>
      
      <div class="course-meta">
        <div class="meta-item">
          <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span>${course.institution}</span>
        </div>
        <div class="meta-item">
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span>${course.period}</span>
        </div>
      </div>

      <div class="course-topics">
        ${course.topics.slice(0, 3).map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
        ${course.topics.length > 3 ? `<span class="topic-tag">+${course.topics.length - 3}</span>` : ''}
      </div>
    </div>

    <div>
      ${aiScore !== null ? `
        <div class="ai-reason-badge">
          <span>⚡ AI 적합도: <strong>${aiScore}점</strong></span>
          <span>|</span>
          <span>${aiReason}</span>
        </div>
      ` : ''}
      
      <div class="card-footer">
        <span class="course-fee">${course.fee}</span>
        <!-- Dual-Track External Link Shortcut Button -->
        <a class="btn-shortcut-link" href="${course.url}" target="_blank" title="교육 바로가기 (외부 링크)">
          <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
      </div>
    </div>
  `;

  // Bookmarking handler
  const bookmarkBtn = card.querySelector('.bookmark-btn');
  bookmarkBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (bookmarks.includes(course.id)) {
      bookmarks = bookmarks.filter(id => id !== course.id);
      bookmarkBtn.textContent = '🤍';
      bookmarkBtn.classList.remove('active');
    } else {
      bookmarks.push(course.id);
      bookmarkBtn.textContent = '❤️';
      bookmarkBtn.classList.add('active');
    }
    saveToStorage();
    renderDashboardBookmarks();
  });

  // Shortcut Link stops propagation
  card.querySelector('.btn-shortcut-link').addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Card click opens modal
  card.addEventListener('click', () => {
    openDetailModal(course);
  });

  return card;
}

// 4. AI Recommendation Controller
function initRecommender() {
  const submitBtn = document.getElementById('btn-recommender-submit');
  
  submitBtn.addEventListener('click', () => {
    const role = document.getElementById('recommender-role').value;
    const keywords = document.getElementById('recommender-keywords').value;
    const regionEl = document.querySelector('input[name="recommender-region"]:checked');
    const typeEl = document.querySelector('input[name="recommender-type"]:checked');

    const preferences = {
      role,
      keywords,
      region: regionEl ? regionEl.value : 'all',
      type: typeEl ? typeEl.value : 'all'
    };

    const results = recommendCourses(courses, preferences);
    renderRecommendationResults(results);
  });
}

function renderRecommendationResults(results) {
  const section = document.getElementById('ai-recommender-results-section');
  const grid = document.getElementById('ai-recommendation-results');
  
  grid.innerHTML = '';
  section.style.display = 'block';

  if (results.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-text-muted);">추천 조건에 매칭되는 교육이 없습니다.</div>`;
    return;
  }

  // Show top recommended courses
  results.slice(0, 4).forEach(item => {
    grid.appendChild(createCourseCard(item, item.score, item.aiReason));
  });

  // Smooth scroll to results
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 5. Calendar Controller
let calendarRegionFilter = 'all';

function initCalendar() {
  document.getElementById('cal-prev-btn').addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
  });

  document.getElementById('cal-next-btn').addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
  });

  const regionFilterButtons = document.querySelectorAll('#calendar [id^="cal-filter-"]');
  regionFilterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      regionFilterButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      if (e.target.id === 'cal-filter-all') calendarRegionFilter = 'all';
      else if (e.target.id === 'cal-filter-domestic') calendarRegionFilter = '국내';
      else if (e.target.id === 'cal-filter-global') calendarRegionFilter = '해외';

      renderCalendar();
    });
  });

  renderCalendar();
}

function renderCalendar() {
  const monthTitle = document.getElementById('cal-month-title');
  const grid = document.getElementById('calendar-grid-container');
  
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  monthTitle.textContent = `${year}년 ${month + 1}월`;
  grid.innerHTML = '';

  // Day labels
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  daysOfWeek.forEach(day => {
    const el = document.createElement('div');
    el.className = 'calendar-day-label';
    el.textContent = day;
    grid.appendChild(el);
  });

  // Date generation bounds
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  // Prev month dates padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day other-month';
    dayEl.innerHTML = `<div class="calendar-date-number">${prevMonthTotalDays - i}</div>`;
    grid.appendChild(dayEl);
  }

  // Current month dates
  for (let date = 1; date <= totalDays; date++) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    
    // Check if today
    const checkDate = new Date(year, month, date);
    const today = new Date();
    if (checkDate.toDateString() === today.toDateString()) {
      dayEl.classList.add('today');
    }

    dayEl.innerHTML = `<div class="calendar-date-number">${date}</div>`;

    // Filter courses active on this day
    const dayCourses = courses.filter(course => {
      if (calendarRegionFilter !== 'all' && course.region !== calendarRegionFilter) {
        return false;
      }
      
      // Parse dates (supports standard format YYYY-MM-DD)
      if (course.period.includes('~')) {
        const [startStr, endStr] = course.period.split('~').map(s => s.trim());
        const start = new Date(startStr);
        const end = new Date(endStr);
        // Normalize time
        checkDate.setHours(0,0,0,0);
        start.setHours(0,0,0,0);
        end.setHours(0,0,0,0);
        return checkDate >= start && checkDate <= end;
      }
      return false;
    });

    dayCourses.forEach(course => {
      const eventEl = document.createElement('div');
      eventEl.className = `calendar-event ${course.type === '교육' ? 'calendar-event-edu' : 'calendar-event-semi'}`;
      eventEl.textContent = course.title;
      eventEl.title = `${course.title} (${course.institution})`;
      
      eventEl.addEventListener('click', (e) => {
        e.stopPropagation();
        openDetailModal(course);
      });
      dayEl.appendChild(eventEl);
    });

    grid.appendChild(dayEl);
  }

  // Next month padding to fill grid
  const totalCells = firstDayIndex + totalDays;
  const nextMonthPadding = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= nextMonthPadding; i++) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day other-month';
    dayEl.innerHTML = `<div class="calendar-date-number">${i}</div>`;
    grid.appendChild(dayEl);
  }
}

// 6. Detailed Modal Controller
function openDetailModal(course) {
  const overlay = document.getElementById('detail-modal-overlay');
  const title = document.getElementById('modal-title');
  const badges = document.getElementById('modal-badges');
  const description = document.getElementById('modal-description');
  const institution = document.getElementById('modal-institution');
  const difficulty = document.getElementById('modal-difficulty');
  const fee = document.getElementById('modal-fee');
  const period = document.getElementById('modal-period');
  const topics = document.getElementById('modal-topics');
  const applyLink = document.getElementById('modal-apply-link');

  // Load content
  title.textContent = course.title;
  description.textContent = course.description;
  institution.textContent = course.institution;
  difficulty.textContent = course.difficulty;
  fee.textContent = course.fee;
  period.textContent = course.period;
  applyLink.href = course.url;

  // Render Badges
  const regionClass = course.region === '국내' ? 'badge-region-domestic' : 'badge-region-global';
  const typeClass = course.type === '교육' ? 'badge-type-edu' : 'badge-type-semi';
  badges.innerHTML = `
    <span class="badge ${regionClass}">${course.region}</span>
    <span class="badge ${typeClass}">${course.type}</span>
  `;

  // Render Topics
  topics.innerHTML = course.topics.map(t => `<span class="topic-tag">${t}</span>`).join('');

  // Open modal
  overlay.classList.add('active');

  // Close handlers
  const closeModal = () => overlay.classList.remove('active');
  document.getElementById('modal-close-btn').onclick = closeModal;
  document.getElementById('modal-cancel-btn').onclick = closeModal;
  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal();
  };
}

// 7. Reviews & Q&A Board Controller
function initReviewsAndQna() {
  populateCourseSelects();

  // Submit Review
  const reviewForm = document.getElementById('review-form');
  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const courseId = document.getElementById('review-course-select').value;
    const rating = parseInt(document.getElementById('review-rating').value);
    const text = document.getElementById('review-text').value;

    reviews.unshift({
      courseId,
      rating,
      text,
      date: new Date().toISOString().split('T')[0]
    });

    saveToStorage();
    renderReviews();
    reviewForm.reset();
  });

  // Submit Q&A
  const qnaForm = document.getElementById('qna-form');
  qnaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const courseId = document.getElementById('qna-course-select').value;
    const title = document.getElementById('qna-title').value;
    const text = document.getElementById('qna-text').value;

    qna.unshift({
      courseId,
      title,
      text,
      date: new Date().toISOString().split('T')[0]
    });

    saveToStorage();
    renderQna();
    qnaForm.reset();
  });

  renderReviews();
  renderQna();
}

function populateCourseSelects() {
  const reviewSelect = document.getElementById('review-course-select');
  const qnaSelect = document.getElementById('qna-course-select');
  
  const options = courses.map(c => `<option value="${c.id}">${c.title} (${c.institution})</option>`).join('');
  
  reviewSelect.innerHTML = options;
  qnaSelect.innerHTML = options;
}

function renderReviews() {
  const container = document.getElementById('reviews-list');
  container.innerHTML = '';

  if (reviews.length === 0) {
    container.innerHTML = '<span style="color: var(--color-text-muted); font-size: 13px;">등록된 리뷰가 없습니다.</span>';
    return;
  }

  reviews.forEach(r => {
    const course = courses.find(c => c.id === r.courseId) || { title: '삭제된 교육' };
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    
    const div = document.createElement('div');
    div.className = 'review-item';
    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span style="font-size: 12px; font-weight: 600; color: var(--color-primary);">${course.title}</span>
        <span class="rating-stars" style="font-size: 12px;">${stars}</span>
      </div>
      <p style="font-size: 13px; color: var(--color-text-main); margin-bottom: 4px;">${r.text}</p>
      <span style="font-size: 11px; color: var(--color-text-muted);">${r.date} | 수강생</span>
    `;
    container.appendChild(div);
  });
}

function renderQna() {
  const container = document.getElementById('qna-list');
  container.innerHTML = '';

  if (qna.length === 0) {
    container.innerHTML = '<span style="color: var(--color-text-muted); font-size: 13px;">등록된 질문이 없습니다.</span>';
    return;
  }

  qna.forEach(q => {
    const course = courses.find(c => c.id === q.courseId) || { title: '알 수 없음' };
    
    const div = document.createElement('div');
    div.className = 'qna-item';
    div.innerHTML = `
      <div style="font-size: 11px; color: var(--color-text-muted); margin-bottom: 4px;">대상: ${course.title}</div>
      <h4 style="font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 4px;">Q. ${q.title}</h4>
      <p style="font-size: 13px; color: var(--color-text-muted); padding-left: 12px; border-left: 2px solid var(--color-primary); margin-bottom: 6px;">${q.text}</p>
      <span style="font-size: 11px; color: var(--color-text-muted);">${q.date}</span>
    `;
    container.appendChild(div);
  });
}

// 8. Admin Panel Sync & Merge Staging data
let stagedCoursesList = [];

function initAdminStaging() {
  const dropzone = document.getElementById('json-dropzone');
  const inputArea = document.getElementById('json-input-area');
  const textarea = document.getElementById('json-textarea');
  const cancelBtn = document.getElementById('btn-cancel-json');
  const parseBtn = document.getElementById('btn-parse-json');

  dropzone.addEventListener('click', () => {
    dropzone.style.display = 'none';
    inputArea.style.display = 'flex';
  });

  cancelBtn.addEventListener('click', () => {
    inputArea.style.display = 'none';
    dropzone.style.display = 'block';
    textarea.value = '';
  });

  parseBtn.addEventListener('click', () => {
    try {
      const data = JSON.parse(textarea.value);
      if (!Array.isArray(data)) {
        alert("JSON 데이터는 배열 형태이어야 합니다.");
        return;
      }
      
      // Basic schema validator
      const isValid = data.every(item => item.id && item.title && item.institution && item.region && item.type);
      if (!isValid) {
        alert("필수 스키마 필드(id, title, institution, region, type)가 누락되었습니다.");
        return;
      }

      stagedCoursesList = data;
      renderStagingTable();
      
      document.getElementById('staging-review-section').style.display = 'block';
    } catch (err) {
      alert("JSON 파싱 에러: " + err.message);
    }
  });

  // Merge staged courses
  const approveBtn = document.getElementById('btn-admin-approve-all');
  const rejectBtn = document.getElementById('btn-admin-reject-all');

  approveBtn.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.staging-checkbox:checked');
    if (checkboxes.length === 0) {
      alert("승인할 항목을 선택해주세요.");
      return;
    }

    let mergeCount = 0;
    checkboxes.forEach(cb => {
      const courseId = cb.getAttribute('data-id');
      const stagedCourse = stagedCoursesList.find(c => c.id === courseId);
      
      if (stagedCourse) {
        // Upsert logic
        const index = courses.findIndex(c => c.id === courseId);
        if (index > -1) {
          courses[index] = stagedCourse;
        } else {
          courses.push(stagedCourse);
        }
        mergeCount++;
      }
    });

    saveToStorage();
    updateStats();
    populateCourseSelects();
    renderExploreGrid();
    
    alert(`성공적으로 ${mergeCount}개의 교육을 통합 데이터베이스에 병합하였습니다!`);
    
    // Reset admin view
    document.getElementById('staging-review-section').style.display = 'none';
    inputArea.style.display = 'none';
    dropzone.style.display = 'block';
    textarea.value = '';
    stagedCoursesList = [];
  });

  rejectBtn.addEventListener('click', () => {
    if (confirm("모든 대기 데이터를 초기화하시겠습니까?")) {
      document.getElementById('staging-review-section').style.display = 'none';
      inputArea.style.display = 'none';
      dropzone.style.display = 'block';
      textarea.value = '';
      stagedCoursesList = [];
    }
  });

  const resetDbBtn = document.getElementById('btn-admin-reset-db');
  if (resetDbBtn) {
    resetDbBtn.addEventListener('click', () => {
      if (confirm("정말 최신 기성/크롤링 데이터셋(sample-courses.js) 기준으로 로컬 데이터베이스를 초기화하시겠습니까? (기본적으로 작성한 리뷰나 Q&A는 유지됩니다)")) {
        localStorage.removeItem('pkg_courses');
        location.reload();
      }
    });
  }
}

function renderStagingTable() {
  const tbody = document.getElementById('staging-table-body');
  tbody.innerHTML = '';

  stagedCoursesList.forEach(course => {
    const isExisting = courses.some(c => c.id === course.id);
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
      <td><strong>${course.title}</strong></td>
      <td>${course.institution}</td>
      <td><span class="badge ${course.region === '국내' ? 'badge-region-domestic' : 'badge-region-global'}">${course.region}</span></td>
      <td><span class="badge ${course.type === '교육' ? 'badge-type-edu' : 'badge-type-semi'}">${course.type}</span></td>
      <td>${course.fee}</td>
      <td><span class="badge-status ${isExisting ? 'badge-status-updated' : 'badge-status-new'}">${isExisting ? '업데이트 예정' : '신규 추가'}</span></td>
      <td><input type="checkbox" class="staging-checkbox" data-id="${course.id}" checked style="width: 18px; height: 18px; cursor: pointer;"></td>
    `;
    
    tbody.appendChild(tr);
  });
}

// 9. Site Recommendations Controller
const defaultSites = [
  {
    name: "반도체설계교육센터(IDEC)",
    url: "https://www.idec.or.kr",
    region: "국내",
    description: "반도체 설계 및 관련 공정 실무/이론 교육 전문 기관. 대학생 및 대학원생 대상 무료 수강이 다양하게 제공됩니다."
  },
  {
    name: "세미나허브(Seminarhub)",
    url: "https://www.seminarhub.co.kr",
    region: "국내",
    description: "HBM, 차세대 패키징, 유리기판 등 반도체 최신 산업 트렌드 및 기술 비즈니스 세미나 전문 기업."
  },
  {
    name: "한국PCB&반도체패키징산업협회(KPCA)",
    url: "http://www.kpca.or.kr",
    region: "국내",
    description: "반도체 패키지 기판(FC-BGA 등) 및 기판 동도금/회로공정 특화 교육 안내 및 접수."
  },
  {
    name: "한국반도체산업협회(KSIA)",
    url: "https://www.ksia.or.kr",
    region: "국내",
    description: "반도체 종합 교육 및 재직자 패키징/조립/범핑 공정 실무 단기 아카데미 운영."
  },
  {
    name: "나노종합기술원(NNFC)",
    url: "https://www.nnfc.re.kr",
    region: "국내",
    description: "클린룸 내 첨단 패키징 장비(TSV, bumping 등) 및 신뢰성 공정 장비 실무 교육 과정."
  },
  {
    name: "한국나노기술원(KANC)",
    url: "https://www.kanc.re.kr",
    region: "국내",
    description: "나노 소자 및 반도체 신뢰성/불량 분석 장비(SEM, SAT 등) 중심 기술 지원 및 고장분석 교육."
  },
  {
    name: "국가과학기술인력개발원(KIRD)",
    url: "https://www.kird.re.kr",
    region: "국내",
    description: "비전공자 및 연구자를 위한 기초 반도체 소자 물리/신뢰성 기초 과학기술 인력 무료 교육."
  },
  {
    name: "나노기술연구협의회(KoNTRS)",
    url: "https://www.kontrs.or.kr",
    region: "국내",
    description: "8대 공정 기초 이론 및 종합 실습 트레이닝 프로그램 지원."
  },
  {
    name: "SEMI University (SEMI U)",
    url: "https://www.semi.org/en/products-services/semi-u",
    region: "해외",
    description: "글로벌 반도체 장비 협회(SEMI)가 제공하는 표준 패키징, 어셈블리 및 최신 패키지 기술 온라인 강좌."
  },
  {
    name: "Coursera (ASU Specialization)",
    url: "https://www.coursera.org/specializations/semiconductor-packaging",
    region: "해외",
    description: "아리조나 주립대(ASU)와 인텔이 협력하여 만든 글로벌 온라인 반도체 패키징 기초 스페셜 과정."
  }
];

function initSiteRecommendations() {
  // Setup Custom recommendation form submit
  const form = document.getElementById('custom-site-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('custom-site-name').value;
      const url = document.getElementById('custom-site-url').value;
      const dept = document.getElementById('custom-site-dept').value;
      const user = document.getElementById('custom-site-user').value;
      const desc = document.getElementById('custom-site-desc').value;
      
      customSites.unshift({
        name,
        url,
        dept,
        user,
        description: desc,
        date: new Date().toISOString().split('T')[0]
      });
      
      localStorage.setItem('pkg_custom_sites', JSON.stringify(customSites));
      renderSiteRecommendations();
      form.reset();
    });
  }
}

function renderSiteRecommendations() {
  const defaultGrid = document.getElementById('default-sites-grid');
  const customGrid = document.getElementById('custom-sites-grid');
  
  if (defaultGrid) {
    defaultGrid.innerHTML = defaultSites.map(site => `
      <div class="glass-card site-card" onclick="window.open('${site.url}', '_blank')">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <span class="badge ${site.region === '국내' ? 'badge-region-domestic' : 'badge-region-global'}">${site.region}</span>
          <span style="font-size: 16px; color: var(--color-primary); cursor: pointer;">🔗</span>
        </div>
        <h3 style="font-size: 15px; font-weight: 700; color: var(--color-text-main); margin-bottom: 8px;">${site.name}</h3>
        <p style="font-size: 12px; color: var(--color-text-muted); line-height: 1.5; flex-grow: 1;">${site.description}</p>
      </div>
    `).join('');
  }
  
  if (customGrid) {
    if (customSites.length === 0) {
      customGrid.innerHTML = `<span style="color: var(--color-text-muted); font-size: 13px; grid-column: 1/-1; text-align: center; padding: 20px; display: block; width: 100%;">아직 추천 등록된 사이트가 없습니다. 첫 추천 사이트를 등록해보세요!</span>`;
      return;
    }
    
    customGrid.innerHTML = customSites.map((site, index) => `
      <div class="glass-card site-card" onclick="window.open('${site.url}', '_blank')">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);">사내 추천</span>
          <button class="delete-site-btn" data-index="${index}" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 11px; font-weight: 600;">삭제</button>
        </div>
        <h3 style="font-size: 15px; font-weight: 700; color: var(--color-text-main); margin-bottom: 4px;">${site.name}</h3>
        <span style="font-size: 11px; color: var(--color-text-muted); margin-bottom: 8px; display: block;">추천인: ${site.user} (${site.dept})</span>
        <p style="font-size: 12px; color: var(--color-text-muted); line-height: 1.5; flex-grow: 1;">${site.description}</p>
      </div>
    `).join('');
    
    // Hook up delete buttons
    customGrid.querySelectorAll('.delete-site-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'));
        if (confirm("정말 이 추천 사이트를 삭제하시겠습니까?")) {
          customSites.splice(idx, 1);
          localStorage.setItem('pkg_custom_sites', JSON.stringify(customSites));
          renderSiteRecommendations();
        }
      });
    });
  }
}

// 10. Quick Finder Wizard Controller
let quickFinderState = {
  step: 1,
  answers: {
    role: '',
    experience: '',
    focus: '',
    schedule: ''
  }
};

function initQuickFinder() {
  const heroCtaBtn = document.getElementById('btn-hero-cta');
  const modal = document.getElementById('quick-finder-modal-overlay');
  const closeBtn = document.getElementById('quick-finder-close-btn');
  const cancelBtn = document.getElementById('quick-finder-cancel-btn');
  const prevBtn = document.getElementById('quick-finder-prev-btn');
  const exploreBtn = document.getElementById('quick-finder-explore-btn');
  
  if (!modal) return;

  // Open wizard modal
  if (heroCtaBtn) {
    heroCtaBtn.addEventListener('click', () => {
      openQuickFinder();
    });
  }

  // Close wizard modal
  closeBtn.addEventListener('click', closeQuickFinder);
  cancelBtn.addEventListener('click', closeQuickFinder);
  
  // Previous step click
  prevBtn.addEventListener('click', () => {
    if (quickFinderState.step > 1) {
      quickFinderState.step--;
      renderWizardStep();
    }
  });

  // Explore all results click
  exploreBtn.addEventListener('click', () => {
    closeQuickFinder();
    
    // Switch to explore tab
    const exploreTabBtn = document.querySelector('.menu-item[data-tab="explore"]');
    if (exploreTabBtn) {
      exploreTabBtn.click();
    }

    // Set search box to their interest focus
    const focusVal = quickFinderState.answers.focus;
    const searchInput = document.getElementById('explore-search');
    if (searchInput && focusVal) {
      // Clean filters
      exploreFilters.region = 'all';
      exploreFilters.type = 'all';
      exploreFilters.level = 'all';
      
      // Update UI active classes
      const filterBtns = document.querySelectorAll('#explore .btn-filter');
      filterBtns.forEach(btn => {
        if (btn.getAttribute('data-region') === 'all' || btn.getAttribute('data-type') === 'all' || btn.getAttribute('data-level') === 'all') {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      const searchKeywords = {
        "설계 및 해석": "설계",
        "공정 기술": "공정",
        "소재 기술": "소재",
        "품질 및 신뢰성": "신뢰성",
        "최신 기술 트렌드": "HBM"
      };
      const searchKeyword = searchKeywords[focusVal] || focusVal;

      searchInput.value = searchKeyword;
      exploreFilters.search = searchKeyword;
      renderExploreGrid();
    }
  });

  // Bind option buttons click
  const optionButtons = modal.querySelectorAll('.wizard-option-btn');
  optionButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const step = quickFinderState.step;
      const value = btn.getAttribute('data-value');
      
      // Save answer
      if (step === 1) quickFinderState.answers.role = value;
      else if (step === 2) quickFinderState.answers.experience = value;
      else if (step === 3) quickFinderState.answers.focus = value;
      else if (step === 4) quickFinderState.answers.schedule = value;

      // Toggle active visual class on sibling buttons in the current step
      const stepContainer = document.getElementById(`wizard-step-${step}`);
      stepContainer.querySelectorAll('.wizard-option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      // Auto proceed to next step after short delay
      setTimeout(() => {
        if (quickFinderState.step < 4) {
          quickFinderState.step++;
          renderWizardStep();
        } else if (quickFinderState.step === 4) {
          // Last question answered, show results
          quickFinderState.step = 5;
          renderWizardStep();
          renderQuickFinderResults();
        }
      }, 250);
    });
  });
}

function openQuickFinder() {
  const modal = document.getElementById('quick-finder-modal-overlay');
  if (!modal) return;
  
  // Reset state
  quickFinderState.step = 1;
  quickFinderState.answers = {
    role: '',
    experience: '',
    focus: '',
    schedule: ''
  };

  // Clear selections
  modal.querySelectorAll('.wizard-option-btn').forEach(btn => btn.classList.remove('selected'));
  
  // Render step 1
  renderWizardStep();
  
  modal.classList.add('active');
}

function closeQuickFinder() {
  const modal = document.getElementById('quick-finder-modal-overlay');
  if (modal) {
    modal.classList.remove('active');
  }
}

function renderWizardStep() {
  const step = quickFinderState.step;
  
  // Show only current step content
  for (let s = 1; s <= 5; s++) {
    const el = document.getElementById(`wizard-step-${s}`);
    if (el) {
      el.style.display = (s === step) ? 'block' : 'none';
    }
  }

  // Update Progress line
  const progressLine = document.getElementById('wizard-progress-line');
  if (progressLine) {
    progressLine.style.width = `${(step / 5) * 100}%`;
  }

  // Update step indicators active style
  for (let s = 1; s <= 5; s++) {
    const ind = document.getElementById(`step-indicator-${s}`);
    if (ind) {
      if (s === step) {
        ind.classList.add('active');
        ind.style.color = 'var(--color-primary)';
      } else {
        ind.classList.remove('active');
        ind.style.color = '';
      }
    }
  }

  // Toggle footer buttons
  const prevBtn = document.getElementById('quick-finder-prev-btn');
  const cancelBtn = document.getElementById('quick-finder-cancel-btn');
  const exploreBtn = document.getElementById('quick-finder-explore-btn');

  if (step === 1) {
    if (prevBtn) prevBtn.style.display = 'none';
    if (cancelBtn) {
      cancelBtn.style.display = 'inline-block';
      cancelBtn.textContent = '닫기';
    }
    if (exploreBtn) exploreBtn.style.display = 'none';
  } else if (step > 1 && step < 5) {
    if (prevBtn) prevBtn.style.display = 'inline-block';
    if (cancelBtn) {
      cancelBtn.style.display = 'inline-block';
      cancelBtn.textContent = '닫기';
    }
    if (exploreBtn) exploreBtn.style.display = 'none';
  } else if (step === 5) {
    if (prevBtn) prevBtn.style.display = 'inline-block';
    if (cancelBtn) {
      cancelBtn.style.display = 'inline-block';
      cancelBtn.textContent = '종료';
    }
    if (exploreBtn) exploreBtn.style.display = 'inline-block';
  }
}

function renderQuickFinderResults() {
  const container = document.getElementById('quick-finder-results-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  const matches = calculateQuickFinderMatches();
  const topMatches = matches.slice(0, 3);
  
  if (topMatches.length === 0) {
    container.innerHTML = `<span style="color: var(--color-text-muted); font-size: 13px; text-align: center; padding: 20px; display: block;">일치하는 교육과정이 존재하지 않습니다.</span>`;
    return;
  }

  topMatches.forEach(course => {
    const item = document.createElement('div');
    item.className = 'quick-finder-result-item';
    
    const isDomestic = course.region === '국내';
    const regionBadgeClass = isDomestic ? 'badge-region-domestic' : 'badge-region-global';
    
    item.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 4px; max-width: 80%;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="badge ${regionBadgeClass}" style="padding: 2px 6px; font-size: 10px;">${course.region}</span>
          <span class="suitability-badge">${course.suitabilityScore}% 매칭</span>
        </div>
        <span style="font-size: 13px; font-weight: 700; color: #fff; margin-top: 4px; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${course.title}">${course.title}</span>
        <span style="font-size: 11px; color: var(--color-text-muted);">${course.institution} | ${course.period}</span>
      </div>
      <div style="font-size: 13px; font-weight: 600; color: var(--color-primary);">${course.fee}</div>
    `;
    
    // Open detailed course modal on click
    item.addEventListener('click', () => {
      // Close Quick Finder
      closeQuickFinder();
      // Open Course Detail Modal
      openDetailModal(course);
    });

    container.appendChild(item);
  });
}

function calculateQuickFinderMatches() {
  const { role, experience, focus, schedule } = quickFinderState.answers;
  
  // Define mappings
  const roleKeywords = {
    "PKG 설계": ["설계", "Design", "Warpage", "해석", "ANSYS", "ABAQUS", "시뮬레이션", "기판", "SI", "PI", "Substrate"],
    "PKG 공정 개발": ["공정", "Process", "Bonding", "본딩", "Molding", "몰딩", "Flip Chip", "플립칩", "Sawing", "TSV", "FOWLP", "이종집적"],
    "설비/장비 기술": ["장비", "설비", "Equipment", "수율", "스마트 팩토리"],
    "신뢰성/불량 분석": ["신뢰성", "Reliability", "불량", "Void", "Delamination", "수명", "고장", "SAT", "SEM", "분석"],
    "소재/재료 개발": ["소재", "재료", "Material", "EMC", "Underfill", "기판", "Epoxy", "Solder"],
    "생산 관리/수율": ["생산", "수율", "Yield", "Factory", "스마트"]
  };

  const focusKeywords = {
    "설계 및 해석": ["설계", "해석", "시뮬레이션", "Design", "ANSYS", "ABAQUS"],
    "공정 기술": ["공정", "본딩", "몰딩", "TSV", "FOWLP", "패키징", "Bonding", "Molding"],
    "소재 기술": ["소재", "기판", "EMC", "Underfill", "재료", "Epoxy", "Substrate"],
    "품질 및 신뢰성": ["신뢰성", "불량", "고장", "수명", "분석", "Reliability", "Void", "Delamination"],
    "최신 기술 트렌드": ["HBM", "CoWoS", "유리기판", "TSV", "세미나", "컨퍼런스", "Glass"]
  };

  const scored = courses.map(course => {
    let score = 0;
    
    // A. Role Match (30 pts)
    if (role && roleKeywords[role]) {
      const keywords = roleKeywords[role];
      const matchTitle = keywords.some(k => course.title.toLowerCase().includes(k.toLowerCase()));
      const matchTopics = course.topics.some(t => keywords.some(k => t.toLowerCase().includes(k.toLowerCase())));
      if (matchTitle || matchTopics) {
        score += 30;
      } else {
        score += 10;
      }
    }
    
    // B. Experience Level Match (30 pts)
    if (experience) {
      if (experience === 'junior_1') {
        if (course.difficulty === '초급') score += 30;
        else if (course.difficulty === '중급') score += 15;
      } else if (experience === 'junior_2') {
        if (course.difficulty === '중급') score += 30;
        else score += 15;
      } else if (experience === 'senior') {
        if (course.difficulty === '고급') score += 30;
        else if (course.difficulty === '중급') score += 20;
      } else if (experience === 'expert') {
        if (course.difficulty === '고급') score += 30;
        else score += 10;
      }
    }
    
    // C. Focus Area Match (30 pts)
    if (focus && focusKeywords[focus]) {
      const keywords = focusKeywords[focus];
      const matchTitle = keywords.some(k => course.title.toLowerCase().includes(k.toLowerCase()));
      const matchTopics = course.topics.some(t => keywords.some(k => t.toLowerCase().includes(k.toLowerCase())));
      if (matchTitle || matchTopics) {
        score += 30;
      } else {
        score += 5;
      }
    }
    
    // D. Schedule Match (10 pts)
    if (schedule) {
      if (schedule === 'this_month') {
        if (course.period.includes('2026-06') || course.period.includes('2026-07')) score += 10;
        else if (course.period.includes('2026-08')) score += 5;
      } else if (schedule === 'next_month') {
        if (course.period.includes('2026-07') || course.period.includes('2026-08')) score += 10;
        else if (course.period.includes('2026-09')) score += 5;
      } else if (schedule === 'quarter') {
        if (course.period.includes('2026-07') || course.period.includes('2026-08') || course.period.includes('2026-09')) score += 10;
      } else if (schedule === 'anytime') {
        score += 10;
      }
    }
    
    score = Math.min(100, score);
    score = Math.max(40, score);

    return {
      ...course,
      suitabilityScore: score
    };
  });

  return scored.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}

function initSidebarToggle() {
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const aside = document.querySelector('aside');
  const backdrop = document.getElementById('sidebar-backdrop');
  
  if (toggleBtn && aside && backdrop) {
    toggleBtn.addEventListener('click', () => {
      // Toggle collapsed for desktop, active for mobile drawer
      if (window.innerWidth <= 1024) {
        aside.classList.toggle('active');
        backdrop.classList.toggle('active');
        aside.classList.remove('collapsed'); // reset desktop class
      } else {
        aside.classList.toggle('collapsed');
        aside.classList.remove('active'); // reset mobile class
        backdrop.classList.remove('active');
      }
    });
    
    // Close sidebar drawer when clicking backdrop
    backdrop.addEventListener('click', () => {
      aside.classList.remove('active');
      backdrop.classList.remove('active');
    });

    // Close sidebar drawer when selecting a tab in mobile drawer
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
          aside.classList.remove('active');
          backdrop.classList.remove('active');
        }
      });
    });
  }
}
