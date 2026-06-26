---
name: pkg_domain_specialist
description: Specialist in Semiconductor Back-end (Packaging & Testing) domain terminology and educational mapping.
---

# Semiconductor Back-end (PKG) Domain Specialist Skill

This skill provides a structured knowledge base of semiconductor back-end (packaging, testing, and advanced packaging) technologies, processes, defects, and classification rules. It is used to power the search, categorization, and AI recommendation matching rules.

## 1. Key Terminology & Processes

### Traditional Packaging Processes
- **Backgrinding (백그라인딩)**: Wafer thinning.
- **Dicing/Sawing (다이싱/쏘잉)**: Wafer singulation (Blade, Laser, Stealth dicing).
- **Die Attach/Die Bonding (다이 어태치/다이 본딩)**: Mounting die onto leadframes or substrates using epoxy or film (DAF).
- **Wire Bonding (와이어 본딩)**: Electrical connection using gold, copper, or aluminum wire.
- **Flip Chip Bonding (플립칩 본딩)**: Solder bumps on die directly connected to substrate, providing shorter interconnects.
- **Underfill (언더필)**: Dispensing epoxy resin under the flip chip to distribute thermal stress.
- **Molding/Encapsulation (몰딩/에폭시 성형)**: Protecting the die and wires with Epoxy Molding Compound (EMC).
- **Solder Ball Attach (솔더볼 부착)**: Ball grid array (BGA) package ball placement.
- **Singulation (싱귤레이션)**: Cutting individual packages from the strip.

### Advanced Packaging Technologies
- **2.5D / 3D Packaging**: Integration of multiple dies on an interposer or stacked vertically.
- **TSV (Through-Silicon Via, 실리콘 관통 전극)**: Vertical electrical connections passing through a silicon die (critical for HBM).
- **HBM (High Bandwidth Memory, 고대역폭 메모리)**: Vertically stacked DRAM dies connected via TSV and microbumps.
- **CoWoS (Chip-on-Wafer-on-Substrate)**: TSMC's 2.5D wafer-level packaging.
- **FOWLP (Fan-Out Wafer-Level Packaging)**: Extending connections outside the die area without a substrate.
- **FOPLP (Fan-Out Panel-Level Packaging)**: Packaging on a larger panel format to reduce costs.
- **Chiplet / Heterogeneous Integration (이종 집적)**: Combining multiple separately manufactured dies (processor, memory, etc.) in a single package.

### Testing Processes
- **Wafer Test / Probe Test (웨이퍼 테스트 / 프로브 테스트)**: Electrical testing on wafer level using probe cards.
- **Final Test (파이널 테스트)**: Package-level testing before shipping.
- **Burn-In Test (번인 테스트)**: High-temperature, high-voltage stress testing to screen infant mortality failures.
- **Reliability Test (신뢰성 테스트)**: Thermal cycling, moisture resistance (MSL), electromigration testing.

## 2. Typical Packaging Defects (불량 유형)
- **Warpage (휘어짐)**: Dimensional deformation due to Coefficient of Thermal Expansion (CTE) mismatch.
- **Void (기포/공극)**: Trapped air or gas in underfill, molding (EMC), or solder joint.
- **Delamination (박리)**: Separation of interfaces (e.g., between die and mold compound, or substrate).
- **Wire Sweep (와이어 쓸림)**: Displacement of bonding wire during EMC molding flow.
- **Micro-crack (미세 균열)**: Cracking in die, substrate, or solder bumps.
- **Solder Bridging (솔더 브릿징)**: Short circuit between adjacent solder joints.

## 3. Categorization & Metadata Classification

### Regional Categorization (`region`)
- **국내 (Domestic)**: Courses or events physically hosted in Korea or organized by Korean institutions (e.g., KSIA, IDEC, MEST Center, KIRD, CHAMP, NNFC, KoPEA).
- **해외 (Global)**: Courses or events hosted globally, online global courses, or organized by global associations (e.g., SEMI U, Coursera/ASU, PT International, IS-LAP, IMAPS, IEEE ECTC).

### Educational Type Categorization (`type`)
- **교육 (Training)**: Structured, multi-day courses, hands-on workshops, or university/on-demand lectures focused on learning specific skills (e.g., SEMI U, MEST, KIRD, CHAMP).
- **세미나·컨퍼런스 (Seminar/Conference)**: Forums, symposia, summits, and short seminars presenting recent research, industry trends, and networking (e.g., IS-LAP, IEEE ECTC, SEMICON Korea, IMAPS).
