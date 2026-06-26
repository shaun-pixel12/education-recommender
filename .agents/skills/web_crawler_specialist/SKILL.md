---
name: web_crawler_specialist
description: Specialist in selectors, URLs, and strategies for scraping semiconductor education and conference platforms.
---

# Web Crawler Specialist Skill for Semiconductor Education

This skill contains the scraping target specifications, CSS selectors, URL endpoints, and strategies for gathering data from major semiconductor education and conference platforms.

## 1. Scraping Target Platforms & Selectors

### Domestic Platforms (국내)

1. **KSIA (한국반도체산업협회 교육)**
   - **URL**: `https://www.ksia.or.kr/` (또는 `https://www.semicon.or.kr/` 교육 페이지)
   - **Target**: 반도체 후공정/패키징 재직자 교육 과정 목록
   - **Selectors**:
     - Card Container: `.edu-list-wrap .list-item`
     - Title: `.title a`
     - Date: `.date`
     - Status: `.status-badge`

2. **IDEC (반도체설계교육센터)**
   - **URL**: `https://www.idec.or.kr/education/`
   - **Target**: 설계 및 후공정 연계 교육 과정
   - **Selectors**:
     - Table Row: `table.tbl_board_list tbody tr`
     - Title: `td.title a`
     - Instructor: `td.instructor`
     - Schedule: `td.date`

3. **MEST Center (반도체 전문 교육)**
   - **URL**: `https://www.mest.or.kr/`
   - **Target**: 후공정 장비, 패키징 소재 단기 교육 과정
   - **Selectors**:
     - Item: `.course-card`
     - Title: `.course-title`
     - Period: `.course-period`

4. **SeminarHub (세미나허브)**
   - **URL**: `https://www.seminarhub.co.kr/`
   - **Target**: 반도체 후공정/패키징 최신 기술 세미나
   - **Selectors**:
     - Item: `.seminar-box`
     - Title: `.seminar-title`
     - Date: `.seminar-date`

5. **KIRD (국가과학기술인력개발원)**
   - **URL**: `https://www.kird.re.kr/`
   - **Target**: 반도체 및 첨단 패키징 R&D 교육
   - **Selectors**:
     - Card: `.card-list .item`
     - Title: `.item-title`
     - Type: `.badge-type`

6. **CHAMP (대기업 협력 컨소시엄 공동훈련센터)**
   - **URL**: `https://www.champ.or.kr/`
   - **Target**: 대기업/중소기업 재직자 패키징/테스트 실무 교육
   - **Selectors**:
     - List Row: `.tbl-list tr`
     - Title: `.subject a`
     - Period: `.duration`

### Global Platforms (해외)

1. **SEMI University (SEMI U)**
   - **URL**: `https://www.semi.org/en/products-services/semi-u`
   - **Target**: Advanced Packaging, Chiplet, Heterogeneous Integration online courses
   - **Selectors**:
     - Container: `.course-card`
     - Title: `h3.course-name`
     - Category: `.course-category`

2. **Coursera (ASU Advanced Packaging)**
   - **URL**: `https://www.coursera.org/` (Search: "semiconductor packaging")
   - **Target**: Arizona State University (ASU) & Intel cooperative courses
   - **Selectors**:
     - Card: `[data-testid="product-card"]`
     - Title: `.cds-CommonCard-title`
     - Platform/Uni: `.cds-CommonCard-partnerNames`

3. **IEEE ECTC (Electronic Components and Technology Conference)**
   - **URL**: `https://www.ectc.net/`
   - **Target**: Packaging, Substrates, Interconnections conference details
   - **Selectors**:
     - Session Item: `.session-title`
     - Date: `.session-date`

4. **IS-LAP (International Symposium on Laser and Packaging)**
   - **URL**: `https://www.islap.org/`
   - **Target**: Laser dicing, wafer level packaging symposium
   - **Selectors**:
     - Program Row: `.program-schedule tr`
     - Title: `.presentation-title`

## 2. Crawling Implementation Strategy

1. **Local Staging File**: Crawled courses must be stored in `staging_courses.json` with a standardized schema:
   ```json
   {
     "id": "unique-id",
     "title": "Course Title",
     "institution": "Organizing Body",
     "region": "국내" | "해외",
     "type": "교육" | "세미나·컨퍼런스",
     "period": "2026-XX-XX ~ 2026-XX-XX",
     "url": "https://...",
     "topics": ["Packaging", "HBM", "TSV"],
     "fee": "Free" | "Paid"
   }
   ```
2. **Offline Fallback**: Since external sites might have dynamic structures or block scrapers, the script must support a mock/seed generator fallback to populate `staging_courses.json` with realistic 2026 courses when a network request fails.
