# User Analysis

## Summary

The primary design priority for this application is **unambiguous clarity around required user actions**. The system monitors real-time road incidents; a single missed alert or delayed reaction can lead to severe traffic disruption or direct risks to civilian safety on the road.

---

## Tooling & Technology

* **Research:** Google / Gemini
* **UX Strategy & Design:** Claude Design
* **Interface & Prototyping (Figma):**
* User Persona
* Mood Board
* Low-Fidelity Prototypes
* AI Prompts

---

## Demographic Profile

Public demographic data for **Traffic Operational Staff (道路監視オペレーター)** is not published directly in Japan. Therefore, this project uses the closely related role of **Traffic Patrol Officer (道路パトロール隊員)** as a benchmark, given their shared operational domain and responsibilities.

* **Average Age:** 56.6 years old (Generation X)
* **Gender Ratio:** Historically male-dominated, with an ongoing national initiative (since 2020) to increase female representation.

### Key Human Factors & Constraints

1. **Lower Digital Literacy:** Technology was introduced later in their careers (late 1980s onwards), resulting in a lower baseline comfort with modern digital interfaces.
2. **Visual Acuity Declines:** Age-related presbyopia and vision changes require high-contrast, large-format UI elements.
3. **Reduced Motor Precision:** Formative exposure to physical media (TVs, CD players, physical switches) influences their mental models. Touch and cursor dexterity are reduced compared to younger cohorts.

---

## Core Job Responsibilities

1. **Alert:** Receive and monitor real-time notifications of road events via display systems.
2. **Review:** Evaluate incoming incidents using live CCTV and sensor data.
3. **Respond:** Dispatch safety teams immediately upon incident confirmation.

---

## Attention Span & Cognitive Load

Operating in a 24/7 control center demands two distinct modes of attention:

### Sustained Attention (Continuous Monitoring)

* **Context:** Prolonged monitoring over 8 hour shifts.
* **Risk:** Shift work and circadian rhythm disruption impair sleep quality, significantly degrading prolonged visual alertness over time.

### Focused Attention (Emergency Intervention)

* **Context:** Immediate reaction when an anomaly or incident triggers an alert.
* **Benchmark:** Clinical research approved by the National Library of Medicine (published in *Frontiers*) indicates that adults aged 56–85 average a focused attention span (**A-Span**) of **67.0 seconds**.
* **Design Requirement:** The UI must clearly distinguish between routine monitoring (Sustained) and critical alerts (Focused), enabling complete incident assessment and action within that ~67-second window.

---

## Communication Protocols

* **Routine Operations:** Direct communication between staff members is minimal during standard road monitoring.
* **Emergency Operations:** Communication becomes critical during focused attention windows. Unclear handoffs or ambiguous status updates risk duplicated efforts or missed dispatches.
* **Design Requirement:** When an incident triggers, the system must either streamline inter-operator communication or present explicit, predefined actions to take immediately.

---

## Resources
**Studies**
* [Quantifying attention span across the lifespan](https://pmc.ncbi.nlm.nih.gov/articles/PMC10621754/#S25)
* [What Is Attention Span and Can You Increase It?](https://www.brain-zone.net/learn/focus/science/attention-span-can-you-increase)

**Generations**
* [世代別比較とは？　団塊・バブル・就職氷河期・ミレニアル・Z世代を経営、マーケティング、人材戦略で整理する](https://befits.jp/2026/04/27/post-861/)

**Age**
* [道路パトロール隊員](https://shigoto.mhlw.go.jp/User/Occupation/Detail/199)
* [IT企業の社員平均年齢の特徴と企業選びの重要ポイント](https://x-hours.com/articles/17523)

**Gender Ratio**
* [女性活躍推進法にもとづく行動計画](https://www.patrol.co.jp/action_plan/)

**Gen X**
* [購入時に参考にしているのは「店頭の情報」「家族・親族」― Z世代～X世代への情報の影響力に関するアンケート調査 ―](https://prtimes.jp/main/html/rd/p/000000585.000018991.html)
