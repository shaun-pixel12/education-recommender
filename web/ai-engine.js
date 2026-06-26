/**
 * Semiconductor Back-end (PKG) AI Recommendation Engine
 * Client-side heuristic matching logic based on role, keywords, region and type.
 */

// Keyword mapping for specific roles/interests
const roleKeywordMap = {
  "pkg_process": ["Packaging", "Wire Bonding", "Flip Chip", "Molding", "Assembly", "Solder Ball", "OSAT", "Dicing", "Sawing", "Equipment"],
  "pkg_design": ["Simulation", "ANSYS", "ABAQUS", "Warpage", "Co-design", "System Design", "STCO", "Substrate", "PCB"],
  "reliability": ["Reliability", "Failure Analysis", "Delamination", "Micro-crack", "Void", "Inspection", "Metrology", "ESD", "Defect Prevention"],
  "materials": ["Substrate", "PCB", "Solder Ball", "Molding", "Materials", "Epoxy", "DAF", "EMC"],
  "advanced_pkg": ["HBM", "Advanced Packaging", "Chiplet", "TSV", "CoWoS", "Glass Substrate", "FOWLP", "FOPLP", "3D Packaging"]
};

// Korean names for mapping display
const roleNames = {
  "pkg_process": "PKG 공정 기술",
  "pkg_design": "PKG 설계 및 해석",
  "reliability": "품질 및 신뢰성/FA",
  "materials": "소재 기술/PCB",
  "advanced_pkg": "차세대 패키징/HBM"
};

/**
 * Recommends courses based on user input
 * @param {Array} courses List of all available courses
 * @param {Object} preferences User preferences: { role, keywords, region, type }
 * @returns {Array} List of courses with scores and matching reasons
 */
export function recommendCourses(courses, preferences) {
  const { role, keywords = "", region = "all", type = "all" } = preferences;
  
  // Clean and parse keywords
  const userKeywords = keywords
    .toLowerCase()
    .split(/[\s,#+]+/)
    .filter(k => k.trim().length > 0);

  const recommended = courses.map(course => {
    let score = 0;
    const matchReasons = [];
    
    // 1. Role Match
    if (role && roleKeywordMap[role]) {
      const targetKeywords = roleKeywordMap[role];
      const matchingRoleTopics = course.topics.filter(topic => 
        targetKeywords.some(tk => tk.toLowerCase() === topic.toLowerCase())
      );
      
      if (matchingRoleTopics.length > 0) {
        score += matchingRoleTopics.length * 15;
        matchReasons.push(`희망 직무(${roleNames[role]}) 핵심 토픽 [${matchingRoleTopics.slice(0, 2).join(', ')}] 반영`);
      }
    }
    
    // 2. User Input Keyword Match (High weight for exact user interest)
    if (userKeywords.length > 0) {
      let keywordMatches = 0;
      const matchedWords = [];
      
      userKeywords.forEach(kw => {
        // Search in title, description, topics, institution
        const inTitle = course.title.toLowerCase().includes(kw);
        const inDesc = course.description.toLowerCase().includes(kw);
        const inTopics = course.topics.some(topic => topic.toLowerCase().includes(kw));
        const inInstitution = course.institution.toLowerCase().includes(kw);
        
        if (inTitle || inDesc || inTopics || inInstitution) {
          keywordMatches++;
          matchedWords.push(kw);
        }
      });
      
      if (keywordMatches > 0) {
        score += keywordMatches * 30; // Higher weight
        matchReasons.push(`입력하신 관심 키워드 '${matchedWords.join(', ')}'와(과) 높은 연관성`);
      }
    }
    
    // 3. Region Preference Match
    if (region !== "all" && course.region === region) {
      score += 10;
    }
    
    // 4. Type Preference Match
    if (type !== "all" && course.type === type) {
      score += 10;
    }

    // Generate custom AI recommendation reason based on matches
    let aiReason = "";
    if (matchReasons.length > 0) {
      aiReason = matchReasons.join(" | ");
    } else {
      aiReason = `${course.institution}에서 제공하는 우수한 ${course.type} 과정입니다.`;
    }

    return {
      ...course,
      score,
      aiReason
    };
  });

  // Filter by region and type if not "all"
  return recommended
    .filter(course => {
      const regionMatch = (region === "all" || course.region === region);
      const typeMatch = (type === "all" || course.type === type);
      return regionMatch && typeMatch;
    })
    .sort((a, b) => b.score - a.score);
}
