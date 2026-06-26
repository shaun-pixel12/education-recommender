import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Seed data for the other 16 sites (excluding IDEC, SeminarHub, and KPCA)
const otherSeeds = [
  {
    "id": "idec-003",
    "title": "ANSYS/ABAQUS 활용 반도체 패키지 Warpage 해석 실무",
    "institution": "반도체설계교육센터(IDEC)",
    "region": "국내",
    "type": "교육",
    "period": "2026-07-22 ~ 2026-07-24",
    "url": "https://www.idec.or.kr/edu/apply/list/?&type=list",
    "topics": ["Warpage", "Simulation", "ANSYS", "ABAQUS"],
    "fee": "무료",
    "difficulty": "고급",
    "description": "패키지 신뢰성 확보를 위해 CAE 툴(ANSYS/ABAQUS)을 이용한 Warpage(휘어짐) 불량 분석 및 구조 해석 실습을 진행합니다."
  },
  {
    "id": "ksia-001",
    "title": "반도체 패키징 기술 이해 및 공정 실무",
    "institution": "한국반도체산업협회(KSIA)",
    "region": "국내",
    "type": "교육",
    "period": "2026-07-15 ~ 2026-07-17",
    "url": "https://www.ksia.or.kr",
    "topics": ["Packaging", "Wire Bonding", "Flip Chip", "Molding"],
    "fee": "유료",
    "difficulty": "중급",
    "description": "반도체 패키징 기초 공정부터 플립칩, 와이어 본딩 등 실무 중심의 기술을 학습하고 최신 트렌드를 파악하는 과정입니다."
  },
  {
    "id": "nnfc-002",
    "title": "첨단 패키징 전문 엔지니어 양성 및 장비 실무 교육",
    "institution": "나노종합기술원(NNFC)",
    "region": "국내",
    "type": "교육",
    "period": "2026-08-03 ~ 2026-08-14",
    "url": "https://www.nnfc.re.kr",
    "topics": ["Advanced Packaging", "Equipment", "TSV", "Wafer Test"],
    "fee": "무료",
    "difficulty": "고급",
    "description": "클린룸 내에서 진행되는 첨단 패키징 장비(TSV, 범핑, 백그라인딩 등) 실무 실습 프로그램입니다."
  },
  {
    "id": "kanc-004",
    "title": "반도체 패키징 신뢰성 및 고장분석 기법 교육",
    "institution": "한국나노기술원(KANC)",
    "region": "국내",
    "type": "교육",
    "period": "2026-09-10 ~ 2026-09-12",
    "url": "https://www.kanc.re.kr",
    "topics": ["Reliability", "Failure Analysis", "Delamination", "Micro-crack"],
    "fee": "유료",
    "difficulty": "중급",
    "description": "패키징 공정 후 발생하는 Delamination, Void 등의 불량 원인을 파악하고 SAT, SEM 등 분석 장비를 활용한 고장분석 기법을 다룹니다."
  },
  {
    "id": "semi-kr-006",
    "title": "SEMI 반도체 패키징 기술 교육 (HBM 및 Advanced Packaging)",
    "institution": "SEMI Korea",
    "region": "국내",
    "type": "교육",
    "period": "2026-09-16 ~ 2026-09-18",
    "url": "https://www.semi.org",
    "topics": ["HBM", "Advanced Packaging", "Chiplet", "TSV"],
    "fee": "유료",
    "difficulty": "고급",
    "description": "국내외 최고 전문가들을 초빙하여 HBM, Chiplet, 2.5D/3D 이종 집적 패키징 기술의 흐름과 솔루션을 전달합니다."
  },
  {
    "id": "kmeps-008",
    "title": "반도체 패키징 검사 및 계측 기술 워크숍/정기학술대회",
    "institution": "한국마이크로전자패키징학회(KMEPS)",
    "region": "국내",
    "type": "세미나·컨퍼런스",
    "period": "2026-11-05 ~ 2026-11-07",
    "url": "http://www.kmeps.or.kr",
    "topics": ["Inspection", "Metrology", "Academic", "Defects"],
    "fee": "유료",
    "difficulty": "중급",
    "description": "국내 학계 및 산업계 연구원들이 참여하여 초미세 패키지 측정/검사 및 3D X-Ray 비파괴 검사 기술 성과를 발표합니다."
  },
  {
    "id": "coursera-asu-009",
    "title": "Semiconductor Packaging Specialization (ASU 코스)",
    "institution": "Coursera (Arizona State University)",
    "region": "해외",
    "type": "교육",
    "period": "상시 온라인 (Self-paced)",
    "url": "https://www.coursera.org/specializations/semiconductor-packaging",
    "topics": ["Introduction", "Wafer Dicing", "Interconnects", "Thermal Management"],
    "fee": "유료",
    "difficulty": "초급",
    "description": "ASU 대학과 인텔이 공동 개발한 글로벌 온라인 강의로, 다이싱부터 써멀 매니지먼트까지 패키지 설계의 기본 이론을 다룹니다."
  },
  {
    "id": "semi-u-010",
    "title": "Introduction to IC Packaging / IC Packaging Beginner Certification",
    "institution": "SEMI University (SEMI U)",
    "region": "해외",
    "type": "교육",
    "period": "상시 온라인 (Self-paced)",
    "url": "https://www.semi.org/en/semi-u",
    "topics": ["Basics", "Assembly", "BGA", "WLP"],
    "fee": "유료",
    "difficulty": "초급",
    "description": "SEMI U 글로벌 온라인 프로그램으로 글로벌 기업 엔지니어들이 필수로 수강하는 어셈블리 및 패키지 표준 교육입니다."
  },
  {
    "id": "imaps-011",
    "title": "On-Demand Professional Development (3D Packaging, SiP, FOWLP)",
    "institution": "IMAPS (국제마이크로전자패키징학회)",
    "region": "해외",
    "type": "교육",
    "period": "상시 온라인 (VOD)",
    "url": "https://www.imaps.org",
    "topics": ["SiP", "FOWLP", "3D Packaging", "VOD"],
    "fee": "유료",
    "difficulty": "중급",
    "description": "IMAPS 주관 온라인 VOD 패키지로 FOWLP, 3D 패키징 및 신소재 기술에 대한 글로벌 석학들의 집중 강의를 볼 수 있습니다."
  },
  {
    "id": "ieee-ectc-012",
    "title": "ECTC Professional Development Courses (ECTC 단기 전문 기술 교육 세션)",
    "institution": "IEEE Electronics Packaging Society",
    "region": "해외",
    "type": "세미나·컨퍼런스",
    "period": "2026-05-26 ~ 2026-05-29",
    "url": "https://www.ectc.net",
    "topics": ["ECTC", "Advanced Interconnect", "Reliability", "Materials"],
    "fee": "유료",
    "difficulty": "고급",
    "description": "패키징 분야 최고 권위의 ECTC 컨퍼런스 직전 개설되는 세션으로, 2.5D/3D 본딩 및 마이크로범핑 신뢰성 분야 연구를 강의합니다."
  },
  {
    "id": "semitracks-013",
    "title": "Wafer Level Packaging / Semiconductor Reliability and Failure Analysis",
    "institution": "Semitracks Inc.",
    "region": "해외",
    "type": "교육",
    "period": "2026-07-06 ~ 2026-07-09",
    "url": "https://www.semitracks.com",
    "topics": ["WLP", "Reliability", "Failure Analysis", "ESD"],
    "fee": "유료",
    "difficulty": "중급",
    "description": "글로벌 재직자 대상 라이브/온라인 패키지 신뢰성 전문 교육으로 고장분석 메커니즘과 ESD 방지 대책을 중점 학습합니다."
  },
  {
    "id": "kird-014",
    "title": "반도체 소자 물리 및 후공정/신뢰성 기술 전문 교육",
    "institution": "국가과학기술인력개발원(KIRD)",
    "region": "국내",
    "type": "교육",
    "period": "2026-08-24 ~ 2026-08-26",
    "url": "https://www.kird.re.kr",
    "topics": ["Semiconductor Physics", "Reliability", "Back-end Basics"],
    "fee": "무료",
    "difficulty": "초급",
    "description": "비전공자 및 연구자를 위한 반도체 기초 이론부터 패키지 및 검사 장비의 기초 지식을 배울 수 있는 공공 무료 과정입니다."
  },
  {
    "id": "kontrs-015",
    "title": "반도체 공정/장비 전문인력 양성 및 실습 교육",
    "institution": "나노기술연구협의회(KoNTRS)",
    "region": "국내",
    "type": "교육",
    "period": "2026-07-06 ~ 2026-07-17",
    "url": "https://www.kontrs.or.kr",
    "topics": ["Wafer Process", "Equipment Practical", "Packaging Intro"],
    "fee": "무료",
    "difficulty": "중급",
    "description": "8대 공정 실습과 함께 후공정 패키징 공정 장비의 전반적인 이해와 실무를 익히는 실습 교육 프로그램입니다."
  },
  {
    "id": "champ-016",
    "title": "대중소기업 상생협력 반도체 후공정/테스트 실무자 과정",
    "institution": "국가인적자원개발컨소시엄(CHAMP)",
    "region": "국내",
    "type": "교육",
    "period": "2026-08-18 ~ 2026-08-20",
    "url": "https://www.champ.or.kr",
    "topics": ["OSAT", "Wire Bonding", "Test Practice"],
    "fee": "무료",
    "difficulty": "초급",
    "description": "중소/중견 OSAT 재직자들의 핵심 기술 고도화를 목표로 하는 와이어 본딩 실무 및 최종 파이널 테스트 핸들러 장비 실습 과정입니다."
  },
  {
    "id": "mest-017",
    "title": "Advanced Packaging & STCO (4주 심화 프로그램)",
    "institution": "MEST Center",
    "region": "해외",
    "type": "교육",
    "period": "2026-09-07 ~ 2026-10-02",
    "url": "https://www.mestcenter.org",
    "topics": ["STCO", "Advanced Packaging", "Co-design", "System Design"],
    "fee": "유료",
    "difficulty": "고급",
    "description": "시스템-기술 공동 최적화(STCO) 및 칩렛 연계 차세대 어드밴스드 패키징 고도의 시뮬레이션 및 설계 이론 강좌입니다."
  },
  {
    "id": "pti-018",
    "title": "Flip Chip, Wire Bond, & Package Reliability Industrial Training",
    "institution": "PT International",
    "region": "해외",
    "type": "교육",
    "period": "2026-08-10 ~ 2026-08-12",
    "url": "https://www.ptintl.com",
    "topics": ["Flip Chip", "Wire Bond", "Package Reliability", "Defect Prevention"],
    "fee": "유료",
    "difficulty": "중급",
    "description": "실제 제조라인에서 접하는 플립칩 어셈블리 결함 및 솔더 접합부 신뢰성 문제에 대한 예방과 진단을 중점 교육합니다."
  },
  {
    "id": "islap-019",
    "title": "Semiconductor Legacy & Advanced Packaging (온라인 PDC 강좌)",
    "institution": "IS-LAP 계열 학회",
    "region": "해외",
    "type": "세미나·컨퍼런스",
    "period": "2026-10-21 ~ 2026-10-23",
    "url": "http://www.is-lap.org",
    "topics": ["Legacy Packaging", "Laser Dicing", "FOPLP", "Global Tech Trend"],
    "fee": "유료",
    "difficulty": "중급",
    "description": "레거시 본딩 공정의 문제 해결책과 레이저 가공 솔루션, FOPLP 공정 상용화 현황을 보고하는 국제 기술 심포지엄입니다."
  }
];

// Fallback seeds for IDEC, SeminarHub, and KPCA in case scraper fails
const fallbacks = {
  idec: {
    "id": "idec-003",
    "title": "ANSYS/ABAQUS 활용 반도체 패키지 Warpage 해석 실무",
    "institution": "반도체설계교육센터(IDEC)",
    "region": "국내",
    "type": "교육",
    "period": "2026-07-22 ~ 2026-07-24",
    "url": "https://www.idec.or.kr/edu/apply/list/?&type=list",
    "topics": ["Warpage", "Simulation", "ANSYS", "ABAQUS"],
    "fee": "무료",
    "difficulty": "고급",
    "description": "패키지 신뢰성 확보를 위해 CAE 툴(ANSYS/ABAQUS)을 이용한 Warpage(휘어짐) 불량 분석 및 구조 해석 실습을 진행합니다."
  },
  seminarhub: {
    "id": "seminarhub-007",
    "title": "차세대 반도체 패키징/HBM 기술 세미나 및 유리기판 컨퍼런스",
    "institution": "세미나허브(Seminarhub)",
    "region": "국내",
    "type": "세미나·컨퍼런스",
    "period": "2026-10-14 ~ 2026-10-15",
    "url": "https://www.seminarhub.co.kr/search.php?findword=반도체",
    "topics": ["HBM", "Glass Substrate", "CoWoS", "Trend"],
    "fee": "유료",
    "difficulty": "초급",
    "description": "HBM4 트렌드 및 최신 화두인 유리기판(Glass Substrate) 공정 기술과 사업화 전략을 공유하는 전문 컨퍼런스입니다."
  },
  kpca: {
    "id": "kpca-005",
    "title": "반도체 패키징 및 PCB 실무 이론/공정 실습",
    "institution": "한국PCB&반도체패키징산업협회(KPCA)",
    "region": "국내",
    "type": "교육",
    "period": "2026-07-29 ~ 2026-07-31",
    "url": "http://www.kpca.or.kr/seminar/cont1",
    "topics": ["Substrate", "PCB", "Solder Ball", "Molding"],
    "fee": "유료",
    "difficulty": "초급",
    "description": "서브스트레이트 기판(FC-BGA 등) 제조 공정과 패키징 소재(EMC, 솔더볼) 연계 교육 과정입니다."
  }
};

// Helper function to extract topics based on title text
function analyzeTopics(title) {
  const topics = [];
  const keywordMap = {
    "HBM": "HBM",
    "유리기판": "Glass Substrate",
    "Glass": "Glass Substrate",
    "패키징": "Packaging",
    "Packaging": "Packaging",
    "본딩": "Bonding",
    "Bonding": "Bonding",
    "신뢰성": "Reliability",
    "Reliability": "Reliability",
    "검사": "Inspection",
    "공정": "Process",
    "설계": "Design",
    "SRAM": "SRAM",
    "메모리": "Memory",
    "Memory": "Memory",
    "Layout": "Layout",
    "CMOS": "CMOS",
    "FPGA": "FPGA",
    "Verilog": "Verilog",
    "Analog": "Analog",
    "PMIC": "PMIC",
    "RFIC": "RFIC",
    "TCAD": "TCAD",
    "시뮬레이션": "Simulation",
    "Simulation": "Simulation",
    "테스트": "Test",
    "PCB": "PCB",
    "회로": "Circuit",
    "AI": "AI",
    "인터포저": "Interposer",
    "TGV": "TGV"
  };

  for (const [key, val] of Object.entries(keywordMap)) {
    if (title.toUpperCase().includes(key.toUpperCase())) {
      if (!topics.includes(val)) topics.push(val);
    }
  }
  if (topics.length === 0) {
    topics.push("Semiconductor");
  }
  return topics;
}

// Helper to verify if course is related to Packaging (PKG) or Back-end (후공정)
function isBackEndRelated(title, description) {
  const lowercaseTitle = (title || "").toLowerCase();
  const lowercaseDesc = (description || "").toLowerCase();
  
  // Specific packaging & back-end terms
  const backEndKeywords = [
    "패키징", "패키지", "packaging", "package", "pkg",
    "후공정", "back-end", "backend",
    "hbm", "cowos", "sip", "chiplet", "tsv", "tgv", "interposer", "인터포저",
    "본딩", "bonding", "본더", "bonder", "어셈블리", "assembly",
    "서브스트레이트", "substrate", "기판", "pcb", "fc-bga", "fcbga", "solder", "솔더",
    "범핑", "bumping", "범프", "bump", "bga",
    "신뢰성", "reliability", "고장분석", "failure analysis", "delamination", "박리", "void", "보이드", "warpage", "워피지", "휨", "크랙", "crack",
    "emc", "molding", "몰딩", "osat", "kmeps", "imaps", "ectc", "kpca", "유리기판", "glass substrate"
  ];
  
  return backEndKeywords.some(keyword => 
    lowercaseTitle.includes(keyword) || lowercaseDesc.includes(keyword)
  );
}

// Scrape IDEC (Design and 연계 교육)
async function scrapeIDEC(page) {
  console.log("[CRAWL] Connecting to IDEC...");
  const results = [];
  const urls = [
    { url: 'https://www.idec.or.kr/edu/apply/list/?&type=list', target: '석박사과정 우선 교육' },
    { url: 'https://www.idec.or.kr/edu/apply/lst2/?&type=lst2', target: '재직자 우선 교육' }
  ];

  for (const item of urls) {
    try {
      console.log(`[CRAWL] IDEC: Navigating to ${item.url}...`);
      await page.goto(item.url, { waitUntil: 'networkidle', timeout: 30000 });
      
      const rowsData = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table.tbl2 tr')).slice(1);
        return rows.map((row, index) => {
          const cols = row.querySelectorAll('td');
          if (cols.length < 5) return null;
          
          const campus = cols[0].innerText.trim();
          const mode = cols[1].innerText.trim();
          const titleEl = cols[2].querySelector('b') || cols[2];
          const title = titleEl ? titleEl.innerText.trim() : '';
          
          // Dates: first span is course period, second is registration period
          const dateSpans = cols[3].querySelectorAll('span');
          const coursePeriod = dateSpans[0] ? dateSpans[0].innerText.trim() : '';
          
          const status = cols[4].innerText.trim();
          
          const onclickAttr = row.getAttribute('onclick') || '';
          const match = onclickAttr.match(/href='([^']+)'/);
          const path = match ? match[1] : '';

          return { campus, mode, title, coursePeriod, status, path, index };
        }).filter(Boolean);
      });

      console.log(`[PARSING] IDEC: Found ${rowsData.length} raw rows.`);

      rowsData.forEach((row, idx) => {
        if (!row.title) return;
        
        // Map difficulty based on title
        let difficulty = "중급";
        if (row.title.includes("기초") || row.title.includes("개요")) difficulty = "초급";
        else if (row.title.includes("핵심") || row.title.includes("해석") || row.title.includes("심화")) difficulty = "고급";
        
        const topics = analyzeTopics(row.title);
        topics.push("IDEC");

        results.push({
          "id": `idec-scraped-${item.target === '재직자 우선 교육' ? 'acad' : 'univ'}-${idx}`,
          "title": row.title,
          "institution": `반도체설계교육센터(IDEC) - ${item.target}`,
          "region": "국내",
          "type": "교육",
          "period": row.coursePeriod || "상시 교육",
          "url": row.path ? `https://www.idec.or.kr${row.path}` : item.url,
          "topics": topics,
          "fee": "무료",
          "difficulty": difficulty,
          "description": `[${row.campus} / ${row.mode}] ${row.title} 실무 과정입니다. 상태: ${row.status}. 수강신청을 통해 교육 기회를 확보하세요.`
        });
      });

    } catch (err) {
      console.error(`IDEC Scrape Error for ${item.target}:`, err.message);
    }
  }

  return results;
}

// Scrape SeminarHub
async function scrapeSeminarHub(page) {
  console.log("[CRAWL] Connecting to SeminarHub...");
  const results = [];
  const searchUrl = 'https://www.seminarhub.co.kr/search.php?findword=반도체';
  
  try {
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });
    
    const itemsData = await page.evaluate(() => {
      // Find all items under search results. They are in <li> inside the results
      const txtWraps = Array.from(document.querySelectorAll('.txt_wrap'));
      return txtWraps.map((wrap, idx) => {
        const anchor = wrap.querySelector('a');
        const paragraph = wrap.querySelector('p');
        if (!anchor || !paragraph) return null;
        
        const title = paragraph.innerText.trim();
        const href = anchor.getAttribute('href') || '';
        
        // Traverse up to find mode (.top em)
        const parentLi = wrap.closest('li');
        let mode = "온/오프라인";
        if (parentLi) {
          const topEm = parentLi.querySelector('.top em');
          if (topEm) mode = topEm.innerText.trim();
        }

        return { title, href, mode, idx };
      }).filter(Boolean);
    });

    console.log(`[PARSING] SeminarHub: Found ${itemsData.length} raw search items.`);

    itemsData.forEach(item => {
      // Clean href
      let fullUrl = item.href;
      if (fullUrl && !fullUrl.startsWith('http')) {
        fullUrl = `https://www.seminarhub.co.kr${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
      }
      
      // Parse date from title: e.g. [3.18] 2026 반도체 유리기판...
      let period = "일정 안내 참조";
      let year = "2026";
      if (item.title.includes("2025")) year = "2025";
      
      const dateMatch = item.title.match(/\[(\d{1,2})\.(\d{1,2})\]/);
      if (dateMatch) {
        const month = dateMatch[1].padStart(2, '0');
        const day = dateMatch[2].padStart(2, '0');
        period = `${year}-${month}-${day} ~ ${year}-${month}-${day}`;
      }

      // Filter out books or materials (usually has "자료집" in title/url)
      if (item.title.includes("자료집") || fullUrl.includes("ca_id=20")) {
        return;
      }

      const topics = analyzeTopics(item.title);
      topics.push("Seminarhub");

      results.push({
        "id": `seminarhub-scraped-${item.idx}`,
        "title": item.title.replace(/^\[\d+\.\d+\]\s*/, ''), // strip date prefix from title if present
        "institution": "세미나허브(Seminarhub)",
        "region": "국내",
        "type": "세미나·컨퍼런스",
        "period": period,
        "url": fullUrl || searchUrl,
        "topics": topics,
        "fee": "유료",
        "difficulty": item.title.includes("HBM") || item.title.includes("본딩") ? "중급" : "초급",
        "description": `[${item.mode}] ${item.title}. 세미나허브 주관 반도체 최신 기술 핵심 전략 세미나 컨퍼런스 정보입니다.`
      });
    });

  } catch (err) {
    console.error("SeminarHub Scrape Error:", err.message);
  }

  return results;
}

// Scrape KPCA
async function scrapeKPCA(page) {
  console.log("[CRAWL] Connecting to KPCA...");
  const results = [];
  const listUrl = 'http://www.kpca.or.kr/seminar/cont1';
  
  try {
    await page.goto(listUrl, { waitUntil: 'networkidle', timeout: 30000 });
    
    const itemsData = await page.evaluate(() => {
      // Find all anchors linking to details
      const detailLinks = Array.from(document.querySelectorAll('a')).filter(a => a.href.includes('viewMode=view'));
      return detailLinks.map((a, idx) => {
        const parentLi = a.closest('li') || a.closest('tr') || a.closest('.item') || a.parentElement.parentElement.parentElement;
        const outerText = parentLi ? parentLi.innerText.trim() : '';
        const href = a.href;
        return { outerText, href, idx };
      });
    });

    console.log(`[PARSING] KPCA: Found ${itemsData.length} raw elements.`);

    itemsData.forEach(item => {
      if (!item.outerText) return;
      
      const lines = item.outerText.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) return;
      
      // Parse status
      const status = lines[0]; // e.g. 모집중, 마감
      const title = lines[1];  // e.g. 2026년 반도체패키징 이론 및 실습교육 안내 건
      
      let dateText = "";
      let locText = "";
      
      lines.forEach(line => {
        if (line.startsWith("일시:")) {
          dateText = line.replace("일시:", "").trim();
        } else if (line.startsWith("장소:")) {
          locText = line.replace("장소:", "").trim();
        }
      });
      
      // Format date: e.g. "2026년 8월 5일(수) ~ 7(금)" -> "2026-08-05 ~ 2026-08-07"
      let period = dateText || "일정 참조";
      if (dateText) {
        const m = dateText.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일.*~\s*(?:(\d{1,2})월\s*)?(\d{1,2})일?/);
        if (m) {
          const year = m[1];
          const month = m[2].padStart(2, '0');
          const startDay = m[3].padStart(2, '0');
          const endMonth = m[4] ? m[4].padStart(2, '0') : month;
          const endDay = m[5].padStart(2, '0');
          period = `${year}-${month}-${startDay} ~ ${year}-${endMonth}-${endDay}`;
        } else {
          // single date: e.g. 2026년 6월 18일(목)
          const mSingle = dateText.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
          if (mSingle) {
            const year = mSingle[1];
            const month = mSingle[2].padStart(2, '0');
            const day = mSingle[3].padStart(2, '0');
            period = `${year}-${month}-${day} ~ ${year}-${month}-${day}`;
          }
        }
      }

      // Avoid old years (e.g. 2025) unless they are in late 2025/2026
      if (period.startsWith("2025") && !period.includes("2025-11") && !period.includes("2025-12")) {
        return;
      }

      const topics = analyzeTopics(title);
      topics.push("PCB");
      topics.push("KPCA");

      results.push({
        "id": `kpca-scraped-${item.idx}`,
        "title": title.replace(/\s*안내\s*건$/, ''), // Clean title
        "institution": "한국PCB&반도체패키징산업협회(KPCA)",
        "region": "국내",
        "type": "교육",
        "period": period,
        "url": item.href || listUrl,
        "topics": topics,
        "fee": "유료",
        "difficulty": title.includes("공정") || title.includes("이해") ? "초급" : "중급",
        "description": `[상태: ${status}] ${title}. 장소: ${locText || 'KPCA 교육장'}. 반도체 패키징 및 전자회로 기판(PCB) 엔지니어를 위한 특화 교육입니다.`
      });
    });

  } catch (err) {
    console.error("KPCA Scrape Error:", err.message);
  }

  return results;
}

async function run() {
  console.log("=================================================");
  console.log("  Starting REAL Semiconductor PKG Scraper... ");
  console.log("=================================================");
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'ko-KR',
    viewport: { width: 1280, height: 800 }
  });
  
  const page = await context.newPage();
  
  let scrapedCourses = [];

  // Scrape IDEC
  let idecCourses = await scrapeIDEC(page);
  idecCourses = idecCourses.filter(course => isBackEndRelated(course.title, course.description));
  if (idecCourses.length > 0) {
    console.log(`[SUCCESS] Scraped ${idecCourses.length} back-end relevant courses from IDEC.`);
    scrapedCourses = scrapedCourses.concat(idecCourses);
  } else {
    console.log(`[FALLBACK] Using IDEC seed data.`);
    scrapedCourses.push(fallbacks.idec);
  }

  // Scrape SeminarHub
  let shCourses = await scrapeSeminarHub(page);
  shCourses = shCourses.filter(course => isBackEndRelated(course.title, course.description));
  if (shCourses.length > 0) {
    console.log(`[SUCCESS] Scraped ${shCourses.length} back-end relevant seminars from SeminarHub.`);
    scrapedCourses = scrapedCourses.concat(shCourses);
  } else {
    console.log(`[FALLBACK] Using SeminarHub seed data.`);
    scrapedCourses.push(fallbacks.seminarhub);
  }

  // Scrape KPCA
  let kpcaCourses = await scrapeKPCA(page);
  kpcaCourses = kpcaCourses.filter(course => isBackEndRelated(course.title, course.description));
  if (kpcaCourses.length > 0) {
    console.log(`[SUCCESS] Scraped ${kpcaCourses.length} back-end relevant courses from KPCA.`);
    scrapedCourses = scrapedCourses.concat(kpcaCourses);
  } else {
    console.log(`[FALLBACK] Using KPCA seed data.`);
    scrapedCourses.push(fallbacks.kpca);
  }

  await browser.close();

  // Merge scraped courses with other seeds
  const finalStaged = [...scrapedCourses, ...otherSeeds];
  
  // Tag all items with scrape timestamps
  const finalStagedWithMetadata = finalStaged.map((course, idx) => ({
    ...course,
    // Ensure standard sequential staging ids for cleanliness
    scrapedAt: new Date().toISOString().split('T')[0]
  }));

  const outputPath = path.join(__dirname, 'staging_courses.json');
  fs.writeFileSync(outputPath, JSON.stringify(finalStagedWithMetadata, null, 2), 'utf-8');
  
  // Also write directly to the web app's default sample-courses.js
  const sampleCoursesPath = path.join(__dirname, '..', 'web', 'sample-courses.js');
  const jsContent = `export const sampleCourses = ${JSON.stringify(finalStagedWithMetadata, null, 2)};\n`;
  fs.writeFileSync(sampleCoursesPath, jsContent, 'utf-8');
  
  console.log("=================================================");
  console.log(`[COMPLETED] Successfully staged ${finalStagedWithMetadata.length} integrated courses!`);
  console.log(`[OUTPUT] Written to: ${outputPath}`);
  console.log(`[OUTPUT] Updated web app database: ${sampleCoursesPath}`);
  console.log("=================================================");
}

run().catch(err => {
  console.error("Crawler execution error:", err);
  process.exit(1);
});
