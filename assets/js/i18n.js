/* =========================================================
   Alesia Katharina Kirstein — Portfolio i18n (EN / DE)
   Language switch in the header (next to "Contacts").
   English is the canonical content in the HTML; this script
   swaps visible text to German when DE is selected and
   restores the original English when EN is selected.
   ========================================================= */
(function () {
  "use strict";

  var KEY = "ak-lang";

  // Normalise text for matching: unify curly quotes -> ASCII, collapse whitespace.
  function norm(s) {
    return (s || "")
      .replace(/[\u2018\u2019\u201a\u201b]/g, "'")
      .replace(/[\u201c\u201d\u201e\u201f]/g, '"')
      .replace(/\s+/g, " ")
      .trim();
  }

  /* -------------------------------------------------------
     Dictionary. One entry per line:  English ~|~ Deutsch
     The English side is matched against the element's text
     content (normalised). The German side may contain HTML.
     ------------------------------------------------------- */
  var RAW = [
    /* ---- Navigation / shared ---- */
    "About me ~|~ Über mich",
    "Work at SAP ~|~ Arbeit bei SAP",
    "Work at DHBW ~|~ Studium an der DHBW",
    "Contacts ~|~ Kontakt",
    "Contact ~|~ Kontakt",
    "Contact me ~|~ Kontaktiere mich",
    "designed with care ~|~ mit Sorgfalt gestaltet",
    "Learn more → ~|~ Mehr erfahren →",
    "Back to timeline ~|~ Zurück zur Timeline",
    "← Back to timeline ~|~ ← Zurück zur Timeline",
    "← Back to Work at DHBW ~|~ ← Zurück zum Studium an der DHBW",
    "Let's talk ~|~ Lass uns reden",

    /* ---- Home (index) ---- */
    "Welcome to my portfolio ~|~ Willkommen in meinem Portfolio",
    "Hello, I'm ~|~ Hallo, ich bin",
    "I design digital experiences with clarity, emotion and purpose. ~|~ Ich gestalte digitale Erlebnisse <br /> mit <b>Klarheit</b>, <b>Emotion</b> und <b>Zielstrebigkeit</b>.",

    /* ---- About ---- */
    "01 · About me ~|~ 01 · Über mich",

    "I'm always eager to learn, embrace new challenges and discover new possibilities along my journey at SAP. ~|~ Ich bin stets motiviert zu lernen, neue Herausforderungen anzunehmen und auf meinem Weg bei SAP neue Möglichkeiten zu entdecken.",
    "UX/UI Design & Development ~|~ UX/UI-Design & Entwicklung",
    "Softskill ~|~ Softskill",
    "Cloud ERP Design Product Team ~|~ Cloud ERP Design Product Team",
    "Experience by CLM ~|~ Experience by CLM",
    "CS Japan Growth Office ~|~ CS Japan Growth Office",
    "UX/UI Design ~|~ UX/UI-Design",

    "My name is Alesia Katharina Kirstein, and I'm a SAP STAR Student pursuing a cooperative degree in Digital Media at DHBW Mannheim. ~|~ Mein Name ist <strong>Alesia Katharina Kirstein</strong>, und ich bin <strong>SAP STAR Studentin</strong> in einem dualen Studium in <strong>Digitale Medien an der DHBW Mannheim</strong>.",
    "Driven by curiosity, I enjoy exploring new ideas, discovering different perspectives and finding creative ways to solve challenges. I'm passionate about understanding how creativity, technology and business come together to create meaningful impact. ~|~ Getrieben von Neugier entdecke ich gerne neue Ideen, verschiedene Perspektiven und kreative Wege, Herausforderungen zu lösen. Mich begeistert es zu verstehen, wie Kreativität, Technologie und Business zusammenwirken, um echten Mehrwert zu schaffen.",
    "Throughout my practical phases at SAP, I've gained experience in concept development, project work, UX/UI design and workflow optimization. Each experience has broadened my perspective and inspired me to explore new opportunities. ~|~ In meinen Praxisphasen bei SAP habe ich Erfahrung in <strong>Konzeptentwicklung, Projektarbeit, UX/UI-Design und Workflow-Optimierung</strong> gesammelt. Jede Erfahrung hat meinen Blick erweitert und mich inspiriert, neue Möglichkeiten zu entdecken.",
    "Journey & Skills ~|~ Werdegang & Skills",
    "Where I come from and what I bring. ~|~ Woher ich komme und was ich mitbringe.",
    "Education ~|~ Ausbildung",
    "From high school to my current studies ~|~ Vom Abitur bis zu meinem aktuellen Studium",
    "Cooperative bachelor's degree · Digital Media ~|~ Duales Bachelorstudium · Digitale Medien",
    "SAP STAR Student in a dual study program, combining academic studies with practical phases at SAP. ~|~ SAP STAR Studentin im dualen Studium, das akademisches Lernen mit Praxisphasen bei SAP verbindet.",
    "Abitur ~|~ Abitur",
    "Abitur (high school diploma) ~|~ Abitur (allgemeine Hochschulreife)",
    "Language and creative focus, with first experiences in design and design tools that sparked my path towards UX. ~|~ Sprachlicher und kreativer Schwerpunkt, mit ersten Erfahrungen in Design und Design-Tools, die meinen Weg zum UX entfacht haben.",
    "Internships & holiday work ~|~ Praktika & Ferienarbeit",
    "Where I gained hands-on experience early on ~|~ Wo ich früh praktische Erfahrung gesammelt habe",
    "Reworking an outdated website, UX & UI ~|~ Überarbeitung einer veralteten Website, UX & UI",
    "Workshops, talks & first insights ~|~ Workshops, Vorträge & erste Einblicke",
    "Spatial thinking & visual aesthetics ~|~ Räumliches Denken & visuelle Ästhetik",
    "Customer service & office work ~|~ Kundenservice & Büroarbeit",
    "Marketing, product design & 3D printing ~|~ Marketing, Produktdesign & 3D-Druck",
    "Manufacturing ~|~ Fertigung",
    "Experience at SAP ~|~ Erfahrung bei SAP",
    "My practical phases as a SAP STAR Student ~|~ Meine Praxisphasen als SAP STAR Studentin",
    "Drafted the specification for the Smart Link feature and designed the team logo — creating a visual identity that represents the team's brand and design vision. ~|~ Habe die Spezifikation für das <strong>Smart Link</strong>-Feature erstellt und das Team-Logo gestaltet — eine visuelle Identität, die die Marke und Designvision des Teams repräsentiert.",
    "Ran a Design Thinking phase to solve an internal workflow issue — developers had to switch between gCTS and GitHub to view a README. I designed and implemented a dedicated README tab directly inside gCTS. ~|~ Habe eine <strong>Design-Thinking</strong>-Phase durchgeführt, um ein internes Workflow-Problem zu lösen — Entwickler:innen mussten zwischen gCTS und GitHub wechseln, um eine README anzuzeigen. Ich habe einen eigenen README-Tab direkt in gCTS entworfen und implementiert.",
    "Customer Experience Cross Team ~|~ Customer Experience Cross Team",
    "UX Research & AI Tooling ~|~ UX Research & KI-Tooling",
    "Examined the efficiency of an AI-powered Research Lab my team was developing — conducting expert interviews, comparing AI tools and building a prototype with an AI-supported report template. ~|~ Habe die Effizienz eines KI-gestützten <strong>Research Labs</strong> untersucht, das mein Team entwickelte — mit Experteninterviews, Vergleich von KI-Tools und einem Prototyp mit KI-gestütztem Report-Template.",
    "Presales & Visual Communication ~|~ Presales & Visuelle Kommunikation",
    "Joined the team in Tokyo to work at the SAP Experience Center — supporting live customer sessions, preparing Immersive Room presentations and gaining first hands-on experience in a presales environment. ~|~ Bin zum Team in Tokio gestoßen, um im <strong>SAP Experience Center</strong> zu arbeiten — mit Unterstützung bei Live-Kundensessions, Vorbereitung von Immersive-Room-Präsentationen und ersten praktischen Erfahrungen im Presales-Umfeld.",
    "My strengths ~|~ Meine Stärken",
    "What I bring as a designer & in a team ~|~ Was ich als Designerin & im Team mitbringe",
    "Communication & openness ~|~ Kommunikation & Offenheit",
    "Active listening ~|~ Aktives Zuhören",
    "Friendly & respectful ~|~ Freundlich & respektvoll",
    "Curiosity & new ideas ~|~ Neugier & neue Ideen",
    "Expert ~|~ Experte",
    "Advanced ~|~ Fortgeschritten",
    "Drawing & designing ~|~ Zeichnen & Gestalten",
    "Passion ~|~ Leidenschaft",
    "Drawing ~|~ Zeichnen",
    "Concept Design ~|~ Konzeptdesign",
    "Communication ~|~ Kommunikation",
    "New ideas ~|~ Neue Ideen",

    /* ---- Contact ---- */
    "Get in touch ~|~ Kontakt aufnehmen",
    "Good things start with a conversation. ~|~ Good things start <br><span class=\"script\">with a conversation.</span>",
    "Whether it's a brief message, a coffee corner meeting, or a question about what comes next after my studies. I look forward to any honest exchange — let's talk! ~|~ Ob eine kurze Nachricht, ein Coffee-Corner-Treffen oder eine Frage dazu, was nach meinem Studium kommt. Ich freue mich über jeden ehrlichen Austausch — lass uns reden!",
    "How to reach me ~|~ So <strong><span class=\"script\">erreichst</span></strong> du mich",
    "Pick whichever feels right — I'll get back to you soon. ~|~ Wähle, was sich richtig anfühlt — ich melde mich bald.",
    "Quick chat during work hours ~|~ Kurzer Chat während der Arbeitszeit",
    "Let's connect professionally ~|~ Lass uns vernetzen",
    "Send me a message ~|~ Schreib mir eine <span class=\"script\">Nachricht</span>",
    "Your Name ~|~ Dein Name",
    "Email ~|~ E-Mail",
    "Subject ~|~ Betreff",
    "Message ~|~ Nachricht",
    "Send Message ~|~ Nachricht senden",

    /* ---- Work at SAP (timeline) ---- */
    "02 · My work at SAP ~|~ 02 · Meine Arbeit bei SAP",
    "My work at SAP ~|~ Meine Arbeit bei SAP",
    "A timeline through my stations at SAP, from the first concept rounds to independent Design-Thinking projects. Click on a station to learn more. ~|~ Eine Timeline durch meine Stationen bei SAP – von den ersten Konzeptrunden bis zu eigenständigen Design-Thinking-Projekten. Klicke auf eine Station, um mehr zu erfahren.",
    "Station 04 · July 2026–today ~|~ Station 04 · Juli 2026–heute",
    "Concept work · Specification · Branding ~|~ Konzeptarbeit · Spezifikation · Branding",
    "Responsible for the specification of the Smart Link feature and the development of the team logo, which is used internally today. ~|~ Verantwortlich für die Spezifikation des Smart-Link-Features und die Entwicklung des Team-Logos, das heute intern genutzt wird.",
    "Design Concept ~|~ Designkonzept",
    "Team Branding ~|~ Team-Branding",
    "Design Thinking · Workflow Optimization ~|~ Design Thinking · Workflow-Optimierung",
    "A Design Thinking phase to optimize an internal workflow, with a README-tab prototype directly in gCTS. ~|~ Eine Design-Thinking-Phase zur Optimierung eines internen Workflows, mit einem README-Tab-Prototyp direkt in gCTS.",
    "Practical phase · AI in User Research ~|~ Praxisphase · KI in der User Research",
    "Analysis and further development of the SAP Research LAB with an AI-supported report template, from expert interviews to the final prototype. ~|~ Analyse und Weiterentwicklung des SAP Research LAB mit einem KI-gestützten Report-Template – von Experteninterviews bis zum finalen Prototyp.",
    "AI Research ~|~ KI-Research",
    "Practical phase · Presales · Experience Center · Tokyo, Japan ~|~ Praxisphase · Presales · Experience Center · Tokio, Japan",
    "Joining the team in Tokyo to create impactful solutions for the Experience Center, with a strong focus on customers and Presales, helping bring SAP's innovations to life. ~|~ Ich stoße zum Team in Tokio, um wirkungsvolle Lösungen für das Experience Center zu schaffen – mit starkem Fokus auf Kund:innen und Presales und dem Ziel, SAPs Innovationen zum Leben zu erwecken.",
    "Customer Engagement ~|~ Kundenbindung",
    "Outlook ~|~ Ausblick",
    "And now: the next step at SAP. ~|~ Und jetzt: der nächste Schritt bei SAP.",
    "These three stations were just the beginning. I want to keep working on products that genuinely make everyday work easier for real people, with clarity, empathy and an eye for detail. ~|~ Diese Stationen waren erst der Anfang. Ich möchte weiter an Produkten arbeiten, die echten Menschen den Arbeitsalltag wirklich erleichtern – mit Klarheit, Empathie und Blick fürs Detail.",

    /* ---- Work at DHBW (overview) ---- */
    "03 · My studies at DHBW ~|~ 03 · Mein Studium an der DHBW",
    "Cross-Media Campaign ~|~ Cross-Media-Kampagne",
    "\"Precision begins in the Core.\" A holistic campaign across flyers, Instagram & posters. ~|~ „Präzision beginnt im Core.“ Eine ganzheitliche Kampagne über Flyer, Instagram & Poster.",
    "Brand & Business Plan ~|~ Marke & Businessplan",
    "\"Your game night. Always and everywhere.\" A games brand that connects families across any distance. ~|~ „Dein Spieleabend. Immer und überall.“ Eine Spielemarke, die Familien über jede Distanz verbindet.",
    "Accessible Smart Tourism ~|~ Barrierefreier Smart Tourism",
    "\"Accessibility everywhere.\" An inclusive travel app for independent city tourism in Speyer. ~|~ „Barrierefreiheit überall.“ Eine inklusive Reise-App für selbstständigen Städtetourismus in Speyer.",
    "Bachelor Thesis ~|~ Bachelorarbeit",
    "Topic and key message of your bachelor thesis. ~|~ Thema und Kernbotschaft meiner Bachelorarbeit.",
    "→ More DHBW projects coming. Antara, Flamigo & Voyama are online — click to explore. ~|~ → Weitere DHBW-Projekte folgen. Antara, Flamigo & Voyama sind online — klick dich rein.",

    /* ---- Antara ---- */
    "Work at DHBW · Cross-Media Campaign ~|~ Studium an der DHBW · Cross-Media-Kampagne",
    "Antara Campaign ~|~ Antara <span class=\"script\">Kampagne</span>",
    "A holistic cross-media campaign for Antara, a scientifically grounded movement concept that teaches people to consciously perceive, stabilize, and specifically strengthen their core. ~|~ Eine ganzheitliche Cross-Media-Kampagne für Antara, ein wissenschaftlich fundiertes Bewegungskonzept, das Menschen lehrt, ihre Körpermitte bewusst wahrzunehmen, zu stabilisieren und gezielt zu stärken.",
    "Precision starts in the core. ~|~ Präzision beginnt im Core.",
    "Module: Cross-Media (DHBW) ~|~ <strong>Modul:</strong> Cross-Media (DHBW)",
    "Role: Concept · Copy · Design ~|~ <strong>Rolle:</strong> Konzept · Copy · Design",
    "Media: Flyer · Instagram · Poster ~|~ <strong>Medien:</strong> Flyer · Instagram · Poster",
    "Starting Point & Brief ~|~ Ausgangssituation & Aufgabenstellung",
    "Antara is a scientifically grounded movement concept centered on the core system, posture, and the deep stabilizing muscles. In times of physical inactivity, stress, and sedentary work, Antara conveys a calm, precise, and sustainable understanding of training for body and mind. ~|~ Antara ist ein wissenschaftlich fundiertes Bewegungskonzept rund um das <strong>Core-System</strong>, die Körperhaltung und die tiefe Stabilisationsmuskulatur. In einer Zeit von Bewegungsmangel, Stress und sitzenden Tätigkeiten vermittelt Antara ein ruhiges, präzises und nachhaltiges Trainingsverständnis für Körper und Geist.",
    "In the Cross-Media module, the task was to conceive and design a campaign that is coherent in content and visuals across three communication channels, coordinated between online and offline media, strategically grounded and built around the target audience. ~|~ Im Modul <strong>Cross-Media</strong> bestand die Aufgabe darin, eine inhaltlich und visuell stimmige Kampagne über drei Kommunikationskanäle zu konzipieren und gestalterisch umzusetzen – abgestimmt über Online- und Offline-Medien, strategisch begründet und zielgruppenorientiert aufgebaut.",
    "Campaign Goal ~|~ Kampagnenziel",
    "Position Antara as an intelligent, high-quality, and modern training concept ~|~ Antara als intelligentes, hochwertiges und modernes Trainingskonzept positionieren",
    "Enable people to learn principles through training & apply them independently ~|~ Menschen befähigen, Prinzipien durch Training zu erlernen & eigenständig anzuwenden",
    "Attract new participants and increase brand awareness ~|~ Neue Teilnehmende gewinnen und die Markenbekanntheit steigern",
    "Communicate the values of calm, quality, effectiveness & competence ~|~ Die Werte Ruhe, Qualität, Wirksamkeit & Kompetenz vermitteln",
    "02 · Target Audience & Persona ~|~ 02 · Zielgruppe & Persona",
    "Who moves with Antara? ~|~ Wer bewegt sich mit Antara?",
    "Women & men between 30 and 55 years old ~|~ Frauen & Männer zwischen 30 und 55 Jahren",
    "Employed, preferably in physiotherapy or related fields ~|~ Berufstätig, bevorzugt in Physiotherapie oder verwandten Bereichen",
    "Health-conscious ~|~ Gesundheitsbewusst",
    "Basic training in fitness, gymnastics, etc. ~|~ Grundausbildung in Fitness, Gymnastik etc.",
    "Interest in holistic movement & sustainable training ~|~ Interesse an ganzheitlicher Bewegung & nachhaltigem Training",
    "Wants to alleviate back & posture problems and pass knowledge to others preventatively ~|~ Möchte Rücken- & Haltungsprobleme lindern und Wissen präventiv weitergeben",
    "Seeks guidance, continuing education & independent application ~|~ Sucht Anleitung, Weiterbildung & eigenständige Anwendung",
    "03 · Core Idea ~|~ 03 · Leitidee",
    "\"Precision starts in the Core!\" ~|~ „Präzision beginnt im <span class=\"accent\">Core</span>!“",
    "Conscious, controlled, and correctly executed movement emerges from a precisely trained Core System. Quality is not created through intensity, but through accuracy, awareness, and understanding. ~|~ Bewusste, kontrollierte und korrekt ausgeführte Bewegung entsteht aus einem präzise trainierten Core-System. Qualität entsteht nicht durch Intensität, sondern durch Genauigkeit, Bewusstsein und Verständnis.",
    "Targeted training of deep core muscles as the foundation for every movement ~|~ Gezieltes Training der tiefen Core-Muskulatur als Grundlage jeder Bewegung",
    "Quality & precision instead of quick, superficial execution ~|~ Qualität & Präzision statt schneller, oberflächlicher Ausführung",
    "Consciously learned body control instead of mere imitation ~|~ Bewusst erlernte Körperkontrolle statt bloßer Nachahmung",
    "Sustainable stability through knowledge, awareness, and repetition ~|~ Nachhaltige Stabilität durch Wissen, Bewusstsein und Wiederholung",
    "Wave-like, round forms show: hard training ≠ pain & rigidity ~|~ Wellenförmige, runde Formen zeigen: hartes Training ≠ Schmerz & Starrheit",
    "04 · Media Selection ~|~ 04 · Medienauswahl",
    "Three Channels, One Synergy ~|~ Drei Kanäle, eine Synergie",
    "Information & Takeaway ~|~ Information & Mitnahme",
    "Low-barrier first contact ~|~ Niederschwelliger Erstkontakt",
    "Ideal for studios, physiotherapy clinics & waiting areas ~|~ Ideal für Studios, Physiopraxen & Wartebereiche",
    "Presents the Antara principle as a learnable concept ~|~ Präsentiert das Antara-Prinzip als erlernbares Konzept",
    "With sticker as a reminder → double media effect ~|~ Mit Sticker als Erinnerung → doppelter Medieneffekt",
    "Knowledge sharing + trust building · Gatefold · 210 × 297 mm ~|~ Wissensvermittlung + Vertrauensaufbau · Gatefold · 210 × 297 mm",
    "Instagram Advertising ~|~ Instagram-Werbung",
    "Image & Emotion ~|~ Image & Emotion",
    "Target audience is active there ~|~ Zielgruppe ist dort aktiv",
    "Conveys body awareness, calm, and mindfulness ~|~ Vermittelt Körpergefühl, Ruhe und Achtsamkeit",
    "Translates flyer content into emotional imagery ~|~ Übersetzt Flyer-Inhalte in emotionale Bildsprache",
    "Direct shortcut to website & profile ~|~ Direkte Verknüpfung zu Website & Profil",
    "Attention + image + emotional depth · Format 1:1 ~|~ Aufmerksamkeit + Image + emotionale Tiefe · Format 1:1",
    "Presence & Reinforcement ~|~ Präsenz & Verstärkung",
    "High visibility in the studio ~|~ Hohe Sichtbarkeit im Studio",
    "Strengthens brand presence on-site ~|~ Stärkt die Markenpräsenz vor Ort",
    "Functions as a reminder for shared knowledge ~|~ Dient als Erinnerung an vermitteltes Wissen",
    "Distilled to core idea and visual ~|~ Reduziert auf Kernidee und Visual",
    "Brand anchoring + orientation · Portrait format · 420 × 594 mm ~|~ Markenverankerung + Orientierung · Hochformat · 420 × 594 mm",
    "The combination of flyer, Instagram & poster enables a holistic approach: from first contact through emotional engagement to lasting brand awareness in physical spaces. Antara's target audience makes conscious, informed decisions, so the campaign combines calm print communication with a present yet restrained digital approach. Rather than loud fitness marketing, high-quality, thoughtful concept communication takes center stage. ~|~ Die Kombination aus Flyer, Instagram & Poster ermöglicht einen ganzheitlichen Ansatz: vom Erstkontakt über emotionale Bindung bis zur nachhaltigen Markenbekanntheit im physischen Raum. Antaras Zielgruppe trifft bewusste, informierte Entscheidungen – deshalb verbindet die Kampagne ruhige Print-Kommunikation mit einem präsenten, aber zurückhaltenden digitalen Auftritt. Statt lautem Fitness-Marketing steht hochwertige, durchdachte Konzept-Kommunikation im Mittelpunkt.",
    "Vision Made Visible ~|~ Vision sichtbar gemacht",
    "Mockups provide a better sense of the campaign vision. They serve as illustrations and for purely visual representation. ~|~ Mockups vermitteln ein besseres Gefühl für die Kampagnenvision. Sie dienen der Veranschaulichung und rein visuellen Darstellung.",
    "06 · Conclusion ~|~ 06 · Fazit",
    "Movement can be more than just training. ~|~ Bewegung kann mehr sein als nur Training.",
    "The cross-media campaign places people and body awareness at the center, presenting Antara as a calm, precise concept that creates lasting impact because it educates without overwhelming. The core idea \"Precision starts in the core.\" runs consistently through all media. ~|~ Die Cross-Media-Kampagne stellt den Menschen und das Körperbewusstsein in den Mittelpunkt und präsentiert Antara als ruhiges, präzises Konzept, das nachhaltig wirkt, weil es bildet, ohne zu überfordern. Die Leitidee „Präzision beginnt im Core.“ zieht sich konsequent durch alle Medien.",
    "Through the combination of information, inspiration, and presence, a cohesive campaign emerges that builds trust and provides guidance: it not only creates awareness but communicates values, knowledge, and a long-term understanding of healthy movement. ~|~ Durch die Kombination aus Information, Inspiration und Präsenz entsteht eine stimmige Kampagne, die Vertrauen schafft und Orientierung gibt: Sie erzeugt nicht nur Aufmerksamkeit, sondern vermittelt Werte, Wissen und ein langfristiges Verständnis für gesunde Bewegung.",
    "Campaign Concept ~|~ Kampagnenkonzept",
    "Copy Strategy ~|~ Copy-Strategie",

    /* ---- Flamigo ---- */
    "Work at DHBW · Media Project: Basics ~|~ Studium an der DHBW · Medienprojekt: Grundlagen",
    "Flamigo Game Night ~|~ Flamigo <span class=\"script\">Game Night</span>",
    "Brand, Corporate Design & Business Plan for a fictional start-up: an app full of online mini-games that brings families and friends together playfully, across any distance, across all generations. ~|~ Marke, Corporate Design & Businessplan für ein fiktives Start-up: eine App voller Online-Minispiele, die Familien und Freunde spielerisch zusammenbringt – über jede Distanz, über alle Generationen hinweg.",
    "\"Your game night. Always and everywhere.\" ~|~ „Dein Spieleabend. Immer und überall.“",
    "Module: Media Project Basics (DHBW) ~|~ <strong>Modul:</strong> Medienprojekt Grundlagen (DHBW)",
    "Role: Team Leadership · Concept · Corporate Design ~|~ <strong>Rolle:</strong> Teamleitung · Konzept · Corporate Design",
    "Deliverables: Brand · Business Plan · Flyer ~|~ <strong>Ergebnisse:</strong> Marke · Businessplan · Flyer",
    "Background & Brief ~|~ Ausgangssituation & Aufgabe",
    "In the Media Project: Basics module, the task was to develop a company as a founding team, from the initial idea through the brand to a complete business plan. The result is Flamigo e.U., a young games start-up based in Mannheim. ~|~ Im Modul <strong>Medienprojekt: Grundlagen</strong> bestand die Aufgabe darin, als Gründungsteam ein Unternehmen zu entwickeln – von der ersten Idee über die Marke bis zum vollständigen Businessplan. Das Ergebnis ist <strong>Flamigo e.U.</strong>, ein junges Spiele-Start-up mit Sitz in Mannheim.",
    "The starting point: In an increasingly digital world, families experience a sense of distance and loneliness. Grandparents and grandchildren in particular lose contact while young adults move away for work or studies. Flamigo addresses this with an app full of creative mini-games that brings generations together again, supported by a consistent, playful corporate design and a viable business plan. ~|~ Der Ausgangspunkt: In einer zunehmend digitalen Welt erleben Familien Distanz und Einsamkeit. Besonders Großeltern und Enkelkinder verlieren den Kontakt, während junge Erwachsene für Beruf oder Studium wegziehen. Flamigo begegnet dem mit einer App voller kreativer Minispiele, die <strong>Generationen wieder zusammenbringt</strong> – getragen von einem konsistenten, verspielten Corporate Design und einem tragfähigen Businessplan.",
    "Project Goals ~|~ Projektziele",
    "Develop a credible start-up with a clear vision & positioning ~|~ Ein glaubwürdiges Start-up mit klarer Vision & Positionierung entwickeln",
    "Design a playful, family-friendly brand (logo, color palette, flyer) ~|~ Eine verspielte, familienfreundliche Marke gestalten (Logo, Farbpalette, Flyer)",
    "Create a complete business plan across ten chapters ~|~ Einen vollständigen Businessplan über zehn Kapitel erstellen",
    "Convey the values of closeness, togetherness & intergenerational play ~|~ Die Werte Nähe, Zusammenhalt & generationsübergreifendes Spielen vermitteln",
    "accessible ~|~ zugänglich",
    "playful ~|~ verspielt",
    "interactive ~|~ interaktiv",
    "family-oriented ~|~ familienorientiert",
    "Who plays with Flamigo? ~|~ Wer spielt mit Flamigo?",
    "Families with children, from toddlers to grandparents ~|~ Familien mit Kindern – von Kleinkindern bis zu Großeltern",
    "Teenagers & young adults who move away for studies or work ~|~ Jugendliche & junge Erwachsene, die für Studium oder Beruf wegziehen",
    "Grandparents who want to stay part of their grandchildren's daily lives ~|~ Großeltern, die Teil des Alltags ihrer Enkel bleiben möchten",
    "Friend groups who want to stay in touch across distance ~|~ Freundesgruppen, die über Distanz in Kontakt bleiben wollen",
    "People who intentionally seek shared, screen-light quality time ~|~ Menschen, die bewusst gemeinsame, bildschirmarme Quality-Time suchen",
    "Game fans who love classic board games — now also digitally ~|~ Spielefans, die klassische Brettspiele lieben — jetzt auch digital",
    "Users with a sense for closeness, togetherness & small daily rituals ~|~ Nutzer:innen mit Sinn für Nähe, Zusammenhalt & kleine Alltagsrituale",
    "True connection knows no distance. ~|~ Echte Verbindung kennt keine <span class=\"accent\">Distanz</span>.",
    "Flamigo brings families and friends together across any distance — playfully, intuitively, and with heart. Every shared game night creates moments of laughter, togetherness, and closeness, no matter how far apart people are. ~|~ Flamigo bringt Familien und Freunde über jede Distanz zusammen — spielerisch, intuitiv und mit Herz. Jeder gemeinsame Spieleabend schafft Momente voller Lachen, Zusammenhalt und Nähe, egal wie weit entfernt man ist.",
    "Promoting togetherness instead of digital loneliness ~|~ Zusammenhalt fördern statt digitaler Einsamkeit",
    "Intergenerational play, from toddlers to grandparents ~|~ Generationsübergreifendes Spielen – von Kleinkindern bis zu Großeltern",
    "Daily challenges & points as small rituals of connection ~|~ Tägliche Challenges & Punkte als kleine Rituale der Verbundenheit",
    "The bridge between digital mini-games and real board games ~|~ Die Brücke zwischen digitalen Minispielen und echten Brettspielen",
    "Playful, warm visual language instead of loud gaming marketing ~|~ Verspielte, warme Bildsprache statt lautem Gaming-Marketing",
    "04 · The Product ~|~ 04 · Das Produkt",
    "One App, Three Experience Layers ~|~ Eine App, drei Erlebnisebenen",
    "Online Mini-Games ~|~ Online-Minispiele",
    "Play & Connect ~|~ Spielen & Verbinden",
    "Diverse mini-games for shared game nights ~|~ Vielfältige Minispiele für gemeinsame Spieleabende",
    "Daily challenges & point system for family and friends ~|~ Tägliche Challenges & Punktesystem für Familie und Freunde",
    "New games & content every month ~|~ Jeden Monat neue Spiele & Inhalte",
    "Intuitive to use, even for toddlers & older users ~|~ Intuitiv bedienbar, auch für Kleinkinder & ältere Nutzer:innen",
    "Freemium model · Free basic, premium optional ~|~ Freemium-Modell · Basis kostenlos, Premium optional",
    "Board Game Bridge ~|~ Brettspiel-Brücke",
    "Digital meets analog ~|~ Digital trifft analog",
    "Recommendations & sales of curated board games ~|~ Empfehlungen & Verkauf kuratierter Brettspiele",
    "Partnerships with sustainable, regional manufacturers ~|~ Partnerschaften mit nachhaltigen, regionalen Herstellern",
    "Own board game versions of popular app games planned ~|~ Eigene Brettspiel-Versionen beliebter App-Spiele geplant",
    "Seamless transition from the app to the living room table ~|~ Nahtloser Übergang von der App zum Wohnzimmertisch",
    "Hybrid approach · digitally & physically connected ~|~ Hybrider Ansatz · digital & physisch verbunden",
    "Family Features ~|~ Familien-Features",
    "Closeness in everyday life ~|~ Nähe im Alltag",
    "Custom backgrounds, filters, stickers & avatars ~|~ Eigene Hintergründe, Filter, Sticker & Avatare",
    "Shared real-time shopping list & family calendar ~|~ Gemeinsame Echtzeit-Einkaufsliste & Familienkalender",
    "Shared savings book & task distribution ~|~ Gemeinsames Sparbuch & Aufgabenverteilung",
    "Exclusive premium content for personalized experiences ~|~ Exklusive Premium-Inhalte für personalisierte Erlebnisse",
    "Premium subscription · personalized family world ~|~ Premium-Abo · personalisierte Familienwelt",
    "The interplay of mini-games, the bridge to board games, and practical family features makes Flamigo more than just a games app: a platform emerges that translates initial playful contact into real, lasting connection while making family life a little easier along the way. ~|~ Das Zusammenspiel aus Minispielen, der Brücke zu Brettspielen und praktischen Familien-Features macht Flamigo zu mehr als nur einer Spiele-App: Es entsteht eine Plattform, die ersten spielerischen Kontakt in echte, dauerhafte Verbindung übersetzt und den Familienalltag nebenbei ein wenig leichter macht.",
    "Our Games ~|~ Unsere Spiele",
    "Ludo ~|~ Mensch ärgere dich nicht",
    "Nine Men's Morris ~|~ Mühle",
    "Chess ~|~ Schach",
    "Categories ~|~ Stadt-Land-Fluss",
    "05 · Corporate Design ~|~ 05 · Corporate Design",
    "A Brand with Heart & Wings ~|~ Eine Marke mit Herz & Flügeln",
    "Playful, warm & distinctive ~|~ Verspielt, warm & unverwechselbar",
    "The Flamigo bird combines two silhouettes into one figure — a symbol of closeness and togetherness. The word mark takes the name in vibrant magenta, while \"go\" in bold blue stands for movement and the start of shared play. ~|~ Der Flamigo-Vogel vereint zwei Silhouetten zu einer Figur — ein Symbol für Nähe und Zusammenhalt. Die Wortmarke nimmt den Namen in kräftigem Magenta auf, während „go“ in kräftigem Blau für Bewegung und den Start des gemeinsamen Spiels steht.",
    "Round, soft shapes, floating bubbles, and a delicate world map in the background tell the core message: connection across any distance. ~|~ Runde, weiche Formen, schwebende Bubbles und eine zarte Weltkarte im Hintergrund erzählen die Kernbotschaft: Verbindung über jede Distanz.",
    "Blue ~|~ Blau",
    "Lilac ~|~ Flieder",
    "06 · Flyer ~|~ 06 · Flyer",
    "The Brand Made Tangible ~|~ Die Marke zum Anfassen",
    "As the central print medium, a gatefold flyer was created that tells the story of vision, benefits, team, and game selection, consistently using the Flamigo visual world of bubbles, waves, and world map. ~|~ Als zentrales Printmedium entstand ein Gatefold-Flyer, der die Geschichte von Vision, Nutzen, Team und Spieleauswahl erzählt – konsequent in der Flamigo-Bildwelt aus Bubbles, Wellen und Weltkarte.",
    "07 · My Role ~|~ 07 · Meine Rolle",
    "Team Lead & CEO of Flamigo ~|~ Teamleitung & CEO von Flamigo",
    "Team Lead ~|~ Teamleitung",
    "Leadership of the five-person team, coordination of work packages, and point of contact for all project-related questions. ~|~ Leitung des fünfköpfigen Teams, Koordination der Arbeitspakete und Ansprechpartnerin für alle projektbezogenen Fragen.",
    "Responsibility for vision, strategic direction, and the coherent overall presentation of the Flamigo brand. ~|~ Verantwortung für Vision, strategische Ausrichtung und den stimmigen Gesamtauftritt der Marke Flamigo.",
    "Flyer Design ~|~ Flyer-Design",
    "Independent design and creation of the depicted gatefold flyer, from layout through visual language to copy. ~|~ Eigenständige Gestaltung und Umsetzung des gezeigten Gatefold-Flyers – von Layout über Bildsprache bis zur Copy.",
    "As Team Lead and CEO, I led the five-person team, refined our shared vision, and ensured that the brand, business plan, and media came together cohesively. My focus was on bringing creative ideas and strategic thinking together. ~|~ Als <strong>Teamleitung und CEO</strong> habe ich das fünfköpfige Team geführt, unsere gemeinsame Vision geschärft und dafür gesorgt, dass Marke, Businessplan und Medien stimmig zusammenkommen. Mein Fokus lag darauf, kreative Ideen und strategisches Denken zu verbinden.",
    "Creatively, I designed the flyer shown completely myself (concept, layout, visual language, and copy), translating the Flamigo brand world into a tangible print medium. ~|~ Kreativ habe ich den <strong>gezeigten Flyer</strong> vollständig selbst gestaltet (Konzept, Layout, Bildsprache und Copy) und die Markenwelt von Flamigo in ein greifbares Printmedium übersetzt.",
    "\"Connection across any distance\" was not only Flamigo's core idea, but also my expectation for teamwork: close, open, and with a shared goal in mind. ~|~ „Verbindung über jede Distanz“ war nicht nur Flamigos Leitidee, sondern auch mein Anspruch an die Teamarbeit: eng, offen und mit einem gemeinsamen Ziel vor Augen.",
    "08 · Conclusion ~|~ 08 · Fazit",
    "From an idea emerges a brand that connects. ~|~ Aus einer Idee entsteht eine Marke, die verbindet.",
    "Flamigo shows how a coherent overall concept emerges from a clear vision: a warm, playful brand, a viable business plan, and a flyer that makes the idea tangible. The core idea of bringing families together across any distance runs consistently through logo, color palette, language, and every medium. ~|~ Flamigo zeigt, wie aus einer klaren Vision ein stimmiges Gesamtkonzept entsteht: eine warme, verspielte Marke, ein tragfähiger Businessplan und ein Flyer, der die Idee greifbar macht. Die Leitidee, Familien über jede Distanz zusammenzubringen, zieht sich konsequent durch Logo, Farbpalette, Sprache und jedes Medium.",
    "As team leader, I co-led concept, corporate design, and creative implementation, and experienced how strategic thinking and emotional design intertwine to create a brand that not only stands out but creates closeness. ~|~ Als Teamleitung habe ich Konzept, Corporate Design und kreative Umsetzung mitverantwortet und erlebt, wie strategisches Denken und emotionales Design ineinandergreifen – zu einer Marke, die nicht nur auffällt, sondern Nähe schafft.",
    "Start-up Concept ~|~ Start-up-Konzept",
    "Business Plan ~|~ Businessplan",
    "Team Leadership ~|~ Teamleitung",

    /* ---- Voyama ---- */
    "Work at DHBW · Accessibility & Digitalization in Smart Tourism ~|~ Studium an der DHBW · Barrierefreiheit & Digitalisierung im Smart Tourism",
    "Voyama accessible ~|~ Voyama <span class=\"script\">barrierefrei</span>",
    "A digital concept & app prototype for inclusive city tourism: individual tour guides, low-barrier routes, and personal assistance so that everyone can experience Speyer in a self-determined way. ~|~ Ein digitales Konzept & App-Prototyp für inklusiven Städtetourismus: individuelle Tourguides, barrierearme Routen und persönliche Assistenz, damit alle Menschen Speyer selbstbestimmt erleben können.",
    "\"Accessibility everywhere, because freedom and independence are not a luxury.\" ~|~ „Barrierefreiheit überall, weil Freiheit und Unabhängigkeit kein Luxus ist.“",
    "Module: Smart Tourism (DHBW) ~|~ <strong>Modul:</strong> Smart Tourism (DHBW)",
    "Focus: Concept · UX/UI · Prototype ~|~ <strong>Fokus:</strong> Konzept · UX/UI · Prototyp",
    "Location: Speyer ~|~ <strong>Ort:</strong> Speyer",
    "01 · Starting Point ~|~ 01 · Ausgangslage",
    "Problem & Task ~|~ Problemstellung & Aufgabe",
    "Travelling with mobility, sensory, or cognitive impairments is severely complicated in many tourist cities. Historic old towns with cobblestones, steep alleys, inaccessible sights, and a lack of support prevent inclusion and independence. ~|~ Reisen mit Mobilitäts-, Sinnes- oder kognitiven Einschränkungen sind in vielen touristischen Städten stark erschwert. Historische Altstädte mit Kopfsteinpflaster, steilen Gassen, unzugänglichen Sehenswürdigkeiten und fehlender Betreuung verhindern <strong>Inklusion und Selbstständigkeit</strong>.",
    "Using Speyer as an example (with its UNESCO World Heritage cathedral, the Jewish quarter, and the Rhine promenade), the task was to develop a digital system of app and communication campaign that offers people with reduced mobility personalized support: from navigation to individually tailored experience tours with assistance. ~|~ Am Beispiel <strong>Speyer</strong> (mit dem UNESCO-Weltkulturerbe Dom, dem Jüdischen Viertel und der Rheinuferpromenade) bestand die Aufgabe darin, ein digitales System aus App und Kommunikationskampagne zu entwickeln, das mobilitätseingeschränkten Menschen personalisierte Unterstützung bietet: von der Navigation bis zu individuell zugeschnittenen Erlebnistouren mit Assistenz.",
    "Concept Goal ~|~ Konzeptziel",
    "Independent travel for all, regardless of restrictions ~|~ Selbstständiges Reisen für alle, unabhängig von Einschränkungen",
    "Bundle navigation, information & personal support in one app ~|~ Navigation, Information & persönliche Unterstützung in einer App bündeln",
    "Accessibility as accessible, inclusive & comfortable user experience ~|~ Barrierefreiheit als zugängliches, inklusives & komfortables Nutzererlebnis",
    "Empowerment & cultural participation instead of physical barriers ~|~ Empowerment & kulturelle Teilhabe statt physischer Barrieren",
    "Inclusion ~|~ Inklusion",
    "Empathy ~|~ Empathie",
    "Transparency ~|~ Transparenz",
    "Reliability ~|~ Verlässlichkeit",
    "Who does Voyama travel with? ~|~ Für wen reist Voyama mit?",
    "People with reduced mobility (wheelchair, difficulty walking) ~|~ Mobilitätseingeschränkte Menschen (Rollstuhl, Gehprobleme)",
    "Older travellers who depend on low-barrier environments ~|~ Ältere Reisende, die auf barrierearme Umgebungen angewiesen sind",
    "People with visual or hearing impairments ~|~ Menschen mit Seh- oder Höreinschränkungen",
    "Neurodivergent travellers (autism, learning disability, Down syndrome) ~|~ Neurodivergente Reisende (Autismus, Lernbehinderung, Downsyndrom)",
    "Companions & carers who are relieved of some burden ~|~ Begleit- & Betreuungspersonen, die entlastet werden",
    "Travellers without company who want to be out and about independently ~|~ Reisende ohne Begleitung, die selbstständig unterwegs sein möchten",
    "People interested in culture & history who wish to take part ~|~ Kultur- & Geschichtsinteressierte mit Wunsch nach Teilhabe",
    "03 · Vision & Core Idea ~|~ 03 · Vision & Leitidee",
    "A world of tourism where no one stands before a barrier. ~|~ Eine Tourismuswelt, in der niemand vor einer <span class=\"accent\">Barriere</span> steht.",
    "Using digital technologies, Voyama designs travel so that everyone, regardless of physical limitations, can experience culture and recreation in a self-determined way. Not technology for its own sake, but used meaningfully: user-centered, empathetic, and reliable. ~|~ Voyama gestaltet Reisen mithilfe digitaler Technologien so, dass alle Menschen, unabhängig von körperlichen Einschränkungen, Kultur und Erholung selbstbestimmt erleben können. Nicht Technik um ihrer selbst willen, sondern sinnvoll eingesetzt: nutzerzentriert, empathisch und verlässlich.",
    "We design for everyone, not for the majority ~|~ Wir gestalten für alle, nicht für die Mehrheit",
    "We understand needs before we develop solutions ~|~ Wir verstehen Bedürfnisse, bevor wir Lösungen entwickeln",
    "Digital assistance meets physical accessibility ~|~ Digitale Assistenz trifft physische Zugänglichkeit",
    "Information in plain language, with image, audio & sign language ~|~ Informationen in einfacher Sprache, mit Bild, Audio & Gebärde",
    "Trust, accessibility, and competence as a brand promise ~|~ Vertrauen, Zugänglichkeit und Kompetenz als Markenversprechen",
    "04 · Core Features ~|~ 04 · Kernfunktionen",
    "Three Building Blocks for Inclusive Travel ~|~ Drei Bausteine für inklusives Reisen",
    "Individual Tour Guides ~|~ Individuelle Tourguides",
    "Experience & Assistance ~|~ Erleben & Assistenz",
    "Tour suggestions tailored to specific impairments ~|~ Tourvorschläge, zugeschnitten auf Einschränkungen",
    "e.g. \"Step-free through Speyer\" ~|~ „Stufenfrei durch Speyer“",
    "Matching with trained, bookable companions ~|~ Matching mit geschulten, buchbaren Begleitpersonen",
    "Information about sights in simplified language ~|~ Infos zu Sehenswürdigkeiten in vereinfachter Sprache",
    "Navigation, information & support bundled ~|~ Navigation, Information & Unterstützung gebündelt",
    "Accessible Routes ~|~ Barrierefreie Routen",
    "Navigation & Orientation ~|~ Navigation & Orientierung",
    "Filters: no slopes > 5%, wheelchair-accessible paths ~|~ Filter: keine Steigungen > 5 %, rollstuhlgerechte Wege",
    "Elevators, restrooms & rest areas in view ~|~ Aufzüge, Toiletten & Ruhezonen im Blick",
    "Avoidance of cobblestones ~|~ Vermeidung von Kopfsteinpflaster",
    "AI-powered evaluation of maps & location data ~|~ KI-gestützte Auswertung von Karten & Standortdaten",
    "Accessibility-friendly rating of places ~|~ Barrierefreundliche Bewertung von Orten",
    "Participation & Trust ~|~ Teilhabe & Vertrauen",
    "Ratings from people with impairments ~|~ Bewertungen von Menschen mit Einschränkungen",
    "\"How well did you get through the old town?\" ~|~ „Wie gut kamst du durch die Altstadt?“",
    "Sharing accessible insider tips ~|~ Barrierefreie Insider-Tipps teilen",
    "Real experiences instead of anonymous stars ~|~ Echte Erfahrungen statt anonymer Sterne",
    "Knowledge from the community for the community ~|~ Wissen aus der Community für die Community",
    "From tour guides, route planning, and community emerges a system that not only navigates, but accompanies: it combines digital assistance with genuine, physical accessibility and turns a challenging city trip into an independent experience with more security, more freedom, and more cultural participation. ~|~ Aus Tourguides, Routenplanung und Community entsteht ein System, das nicht nur navigiert, sondern begleitet: Es verbindet digitale Assistenz mit echter, physischer Zugänglichkeit und macht aus einer herausfordernden Städtereise ein selbstständiges Erlebnis – mit mehr Sicherheit, mehr Freiheit und mehr kultureller Teilhabe.",
    "05 · App-Design ~|~ 05 · App-Design",
    "The Prototype Overview ~|~ Der Prototyp im Überblick",
    "A clear, trustworthy UI in signal red & navy: large surfaces, calm typography, and easily readable contrasts, consistently designed for accessibility. ~|~ Ein klares, vertrauensvolles UI in Signalrot & Navy: große Flächen, ruhige Typografie und gut lesbare Kontraste, konsequent auf Zugänglichkeit ausgelegt.",
    "HomeQuick access & recommendations ~|~ <strong>Home</strong>Schnellzugriff & Empfehlungen",
    "ToursPopular & all tours ~|~ <strong>Touren</strong>Beliebte & alle Touren",
    "Tour detailItinerary & accessibility ~|~ <strong>Tour-Detail</strong>Ablauf & Barrierefreiheit",
    "PlacesCafés, museums & more ~|~ <strong>Orte</strong>Cafés, Museen & mehr",
    "Screens serve as a prototype for the visual representation of the app concept. ~|~ Screens dienen als Prototyp zur visuellen Darstellung des App-Konzepts.",
    "06 · My Role ~|~ 06 · Meine Rolle",
    "Content & Marketing in the Team ~|~ Content & Marketing im Team",
    "Developing the texts and brand message, understandable, empathetic, and in accessible, plain language. ~|~ Entwicklung der Texte und Markenbotschaft, verständlich, empathisch und in zugänglicher, leichter Sprache.",
    "Communication Concept ~|~ Kommunikationskonzept",
    "Building the campaign along the Lasswell formula: Who says what in which channel to whom, with what effect? ~|~ Aufbau der Kampagne entlang der Lasswell-Formel: Wer sagt was in welchem Kanal zu wem, mit welchem Effekt?",
    "Channels & Reach ~|~ Channels & Reach",
    "Planning distribution via app, website, social media, accessible audio guides, and print media. ~|~ Planung der Verbreitung über App, Website, Social Media, barrierefreie Audioguides und Printmedien.",
    "In the Voyama team I was responsible for Content & Marketing. My focus was on translating the idea of accessible travel into a clear, credible language and positioning the brand so that it comes across as technologically competent, socially relevant, and humanly approachable. ~|~ Im Voyama-Team habe ich den Bereich <strong>Content & Marketing</strong> verantwortet. Mein Fokus lag darauf, die Idee des barrierefreien Reisens in eine klare, glaubwürdige Sprache zu übersetzen und die Marke so zu positionieren, dass sie technologisch kompetent, gesellschaftlich relevant und menschlich nahbar wirkt.",
    "To achieve this, I built the communication strategy along the Lasswell formula and defined the appropriate channels, from the app through social media to accessible print and audio formats in simplified language. ~|~ Dafür habe ich die Kommunikationsstrategie entlang der <strong>Lasswell-Formel</strong> aufgebaut und die passenden Kanäle definiert – von der App über Social Media bis zu barrierefreien Print- und Audioformaten in einfacher Sprache.",
    "The guiding principle of my communication: \"Accessibility everywhere, because freedom and independence are not a luxury.\" The message should convey trust, accessibility, and competence, and encourage independent travel. ~|~ Der Leitsatz meiner Kommunikation: „Barrierefreiheit überall, weil Freiheit und Unabhängigkeit kein Luxus ist.“ Die Botschaft soll Vertrauen, Zugänglichkeit und Kompetenz vermitteln und zum selbstständigen Reisen ermutigen.",
    "07 · Conclusion ~|~ 07 · Fazit",
    "Travel should be possible for everyone. ~|~ Reisen sollte für alle möglich sein.",
    "Voyama shows how digitalization creates social value: A well-thought-out concept, a clear brand position, and an accessible app prototype make accessible travel tangible. The guiding idea, freedom and independence for all, guides every feature, every screen, and every design decision. ~|~ Voyama zeigt, wie Digitalisierung gesellschaftlichen Mehrwert schafft: Ein durchdachtes Konzept, eine klare Markenpositionierung und ein barrierefreier App-Prototyp machen barrierefreies Reisen greifbar. Die Leitidee – Freiheit und Unabhängigkeit für alle – leitet jedes Feature, jeden Screen und jede Designentscheidung.",
    "The result is a brand that appears technologically competent, socially relevant, and humanly approachable, proving that good design enables participation. ~|~ Das Ergebnis ist eine Marke, die technologisch kompetent, gesellschaftlich relevant und menschlich nahbar wirkt – und beweist, dass gutes Design Teilhabe ermöglicht.",
    "Accessibility ~|~ Barrierefreiheit",
    "UX/UI Design ~|~ UX/UI-Design",
    "App Prototype ~|~ App-Prototyp",
    "Concept ~|~ Konzept",

    /* ---- Night of the Graduates ---- */
    "Work at DHBW · Print & Digital Media ~|~ Studium an der DHBW · Print- & Digitale Medien",
    "Print & Digital Media ~|~ Print- & Digitale Medien",
    "Print media for the annual DHBW graduation ceremony — poster, program booklet & Save the Date postcards. ~|~ Printmedien für die jährliche Abschlussfeier der DHBW — Plakat, Programmheft & Save-the-Date-Postkarten.",
    "01 · Background ~|~ 01 · Hintergrund",
    "Companion for the Evening ~|~ Begleiter durch den Abend",
    "First Point of Contact ~|~ Erster Kontaktpunkt",
    "Print & digital media for the annual graduation ceremony of DHBW Mannheim — from Save the Date postcards and the program booklet to its promotional poster, all themed around Artificial Intelligence. ~|~ Print- & digitale Medien für die jährliche Abschlussfeier der DHBW Mannheim — von Save-the-Date-Postkarten über das Programmheft bis zu dessen Plakat, durchgängig rund um das Thema Künstliche Intelligenz.",
    "\"How will you shape your evening?\" ~|~ „Wie gestalten Sie Ihren Abend?“",
    "Module: Media Project: Systems 2 (DHBW) ~|~ <strong>Modul:</strong> Medienprojekt: Systeme 2 (DHBW)",
    "Role: Print Design · Layout · Prepress ~|~ <strong>Rolle:</strong> Printdesign · Layout · Druckvorstufe",
    "Deliverables: Poster · Program Booklet · Save the Date ~|~ <strong>Ergebnisse:</strong> Plakat · Programmheft · Save the Date",
    "Team: Alexa Scherf · Elisa Bloeck · Alesia Kirstein · Maxim Monetkin · Cosima Kremser ~|~ <strong>Team:</strong> Alexa Scherf · Elisa Bloeck · Alesia Kirstein · Maxim Monetkin · Cosima Kremser",
    "Event: 20 November 2026 · Mannheimer Rosengarten ~|~ <strong>Event:</strong> 20. November 2026 · Mannheimer Rosengarten",
    "Background & Assignment ~|~ Hintergrund & Aufgabe",
    "The \"Night of the Graduates\" (NotG) is the annual graduation ceremony of DHBW Mannheim, held at the Mannheimer Rosengarten with several thousand guests. Graduates receive their certificates, attend a festive Grand Opening with speeches, the SAP Symphony Orchestra, and enjoy live music, DJs, and walking acts across multiple stages. ~|~ Die <strong>„Night of the Graduates“</strong> (NotG) ist die jährliche Abschlussfeier der <strong>DHBW Mannheim</strong> und findet im Mannheimer Rosengarten mit mehreren tausend Gästen statt. Die Absolvent:innen erhalten ihre Zeugnisse, erleben ein festliches Grand Opening mit Reden und dem SAP Sinfonieorchester und genießen Live-Musik, DJs und Walking Acts auf mehreren Bühnen.",
    "The 2026 edition is themed around Artificial Intelligence, reflecting the growing significance of AI in science, industry, and society. As part of the Print & Digital Media Team (5 members), I was responsible for designing and producing key print media — working with the corporate design team's style guide, coordinating with Heidelberger Druckmaschinen for professional printing, and ensuring all media maintained a consistent visual identity. ~|~ Die Ausgabe 2026 steht unter dem Leitthema <strong>Künstliche Intelligenz</strong> und spiegelt die wachsende Bedeutung von KI in Wissenschaft, Wirtschaft und Gesellschaft wider. Als Teil des <strong>Print- & Digitale-Medien-Teams</strong> (5 Mitglieder) war ich für die Gestaltung und Produktion zentraler Printmedien verantwortlich — auf Basis des Styleguides des Corporate-Design-Teams, in Abstimmung mit Heidelberger Druckmaschinen für den professionellen Druck und mit dem Ziel eines durchgängig einheitlichen Erscheinungsbilds.",
    "Project Goals ~|~ Projektziele",
    "Create a cohesive print & digital media portfolio for the NotG 2026 ~|~ Ein stimmiges Print- & Digitalmedien-Portfolio für die NotG 2026 schaffen",
    "Integrate the AI theme consistently across all media ~|~ Das KI-Leitthema konsequent über alle Medien hinweg integrieren",
    "Ensure print-readiness with spot colors and professional prepress ~|~ Druckreife mit Sonderfarben und professioneller Druckvorstufe sicherstellen",
    "Accompany the audience along the entire event journey ~|~ Das Publikum entlang der gesamten Event-Journey begleiten",
    "print design ~|~ Printdesign",
    "event communication ~|~ Eventkommunikation",
    "prepress ~|~ Druckvorstufe",
    "team collaboration ~|~ Teamarbeit",
    "Guiding Theme 2026 ~|~ Leitthema 2026",
    "A night shaped by Artificial Intelligence ~|~ Ein Abend im Zeichen <span class=\"accent\">Künstlicher Intelligenz</span>",
    "The entire media portfolio revolves around AI — translated into a glowing network of light that runs through poster, program booklet and screens alike. The motif is woven in subtly but unmistakably, framing the evening without ever overshadowing the graduates it celebrates. ~|~ Das gesamte Medienportfolio dreht sich um KI — übersetzt in ein leuchtendes Netz aus Licht, das sich durch Plakat, Programmheft und Bildschirme zieht. Das Motiv ist dezent, aber unverkennbar eingewoben und rahmt den Abend, ohne je die Absolvent:innen zu überstrahlen, die gefeiert werden.",
    "02 · My Role ~|~ 02 · Meine Rolle",
    "Print Design & Production ~|~ Printdesign & Produktion",
    "Poster ~|~ Plakat",
    "Developed a new concept and layout for the program booklet poster, building on the existing design language. Optimized color values and prepared final print files. ~|~ Neues Konzept und Layout für das Programmheft-Plakat entwickelt, aufbauend auf der bestehenden Designsprache. Farbwerte optimiert und finale Druckdaten vorbereitet.",
    "Program Booklet ~|~ Programmheft",
    "Integrated all texts and data provided by university communications, optimized the color systems (CMYK & spot colors), and prepared the booklet for professional printing at HDM. ~|~ Alle von der Hochschulkommunikation gelieferten Texte und Daten integriert, die Farbsysteme (CMYK & Sonderfarben) optimiert und das Heft für den professionellen Druck bei HDM aufbereitet.",
    "Save the Date Postcards ~|~ Save-the-Date-Postkarten",
    "Technical color optimization and precise preparation of the final print data for the Save the Date postcards sent to all graduates. ~|~ Technische Farboptimierung und präzise Vorbereitung der finalen Druckdaten für die Save-the-Date-Postkarten, die an alle Absolvent:innen versendet wurden.",
    "Within the Print & Digital Media Team, I focused on the poster, program booklet, and Save the Date postcards — and co-developed the typographic treatment for the event film title. My work spanned the entire production chain — from initial layout concepts through color calibration to final prepress files ready for offset printing at Heidelberger Druckmaschinen. ~|~ Im Print- & Digitale-Medien-Team lag mein Fokus auf <strong>Plakat, Programmheft und Save-the-Date-Postkarten</strong> — außerdem habe ich die typografische Gestaltung des Event-Filmtitels mitentwickelt. Meine Arbeit umfasste die gesamte Produktionskette — von ersten Layoutkonzepten über die Farbkalibrierung bis zu finalen Druckvorstufendaten, bereit für den Offsetdruck bei Heidelberger Druckmaschinen.",
    "A key challenge was working with spot colors alongside CMYK — ensuring the AI-themed net pattern and event branding translated faithfully from screen to print. Through multiple proof rounds and on-site visits at HDM, I gained hands-on experience in professional print production and quality assurance. ~|~ Eine zentrale Herausforderung war die Arbeit mit <strong>Sonderfarben</strong> neben CMYK — um sicherzustellen, dass das KI-inspirierte Netzmuster und das Event-Branding originalgetreu vom Bildschirm in den Druck übertragen werden. Durch mehrere Proof-Runden und Vor-Ort-Besuche bei HDM habe ich praktische Erfahrung in professioneller Druckproduktion und Qualitätssicherung gesammelt.",
    "03 · Print Media ~|~ 03 · Printmedien",
    "The Deliverables ~|~ Die Ergebnisse",
    "A selection of the print media I designed and produced for the Night of the Graduates 2026. ~|~ Eine Auswahl der Printmedien, die ich für die Night of the Graduates 2026 gestaltet und produziert habe.",
    "Program Booklet Poster ~|~ Programmheft-Plakat",
    "Information & Orientation ~|~ Information & Orientierung",
    "Postcards ~|~ Postkarten",
    "04 · Conclusion ~|~ 04 · Fazit",
    "From screen to print — bringing an event to life. ~|~ Vom Bildschirm in den Druck — ein Event zum Leben erwecken.",
    "The Night of the Graduates project gave me a deep understanding of professional print production: working with spot colors, coordinating with Heidelberger Druckmaschinen, and ensuring every detail — from color accuracy to paper choice — serves the overall event experience. Seeing thousands of guests interact with media I helped create was an incredibly rewarding experience. ~|~ Das Projekt Night of the Graduates hat mir ein tiefes Verständnis professioneller Druckproduktion vermittelt: die Arbeit mit Sonderfarben, die Abstimmung mit Heidelberger Druckmaschinen und die Sorgfalt für jedes Detail — von der Farbgenauigkeit bis zur Papierwahl — im Dienst des gesamten Event-Erlebnisses. Tausende Gäste mit Medien interagieren zu sehen, an denen ich mitgewirkt habe, war eine unglaublich bereichernde Erfahrung.",
    "Through the agile team structure and close collaboration with the corporate design and marketing teams, I strengthened my skills in layout design, prepress workflows, and cross-functional communication — all within a real-world, high-stakes production environment. ~|~ Durch die agile Teamstruktur und die enge Zusammenarbeit mit dem Corporate-Design- und Marketing-Team habe ich meine Fähigkeiten in Layoutgestaltung, Druckvorstufen-Workflows und bereichsübergreifender Kommunikation gestärkt — in einem realen Produktionsumfeld mit hohem Anspruch.",
    "Print Design ~|~ Printdesign",
    "Event Communication ~|~ Eventkommunikation",
    "Prepress ~|~ Druckvorstufe",
    "Team Collaboration ~|~ Teamarbeit",
    "Spot Colors ~|~ Sonderfarben",

    /* ---- SAP Station 1 ---- */
    "Station 01 · Work at SAP ~|~ Station 01 · Arbeit bei SAP",
    "Role: Concept work · Specification · Branding ~|~ <strong>Rolle:</strong> Konzeptarbeit · Spezifikation · Branding",
    "Team: Cloud ERP DCT ~|~ <strong>Team:</strong> Cloud ERP DCT",
    "Focus: Smart Link Feature ~|~ <strong>Fokus:</strong> Smart-Link-Feature",
    "My role in the team ~|~ Meine Rolle im Team",
    "As part of the Cloud ERP Design Concepts Team (DCT), I was responsible for creating the specification for the Smart Link feature. This included documenting conceptual and functional requirements and working closely with the guidelines. I also had to proactively reach out to people to clarify open questions and gather the information needed. Through this, I learned how to communicate clearly, work independently, and translate design concepts into structured requirements. I also gained a better understanding of how specifications serve as an important interface between Design and Development. ~|~ Als Teil des Cloud ERP Design Concepts Team (DCT) war ich für die Erstellung der Spezifikation des <strong>Smart-Link-Features</strong> verantwortlich. Dazu gehörte, konzeptionelle und funktionale Anforderungen zu dokumentieren und eng mit den Guidelines zu arbeiten. Außerdem musste ich proaktiv auf Menschen zugehen, um offene Fragen zu klären und die nötigen Informationen zu sammeln. Dabei habe ich gelernt, klar zu kommunizieren, eigenständig zu arbeiten und Designkonzepte in strukturierte Anforderungen zu übersetzen. Ich habe außerdem besser verstanden, wie Spezifikationen als wichtige Schnittstelle zwischen Design und Entwicklung dienen.",
    "Branding for the team ~|~ Branding für das Team",
    "In addition, I developed the team logo, a visual element that represents the team and its identity. Throughout the process, I created and presented several different versions and approaches to incorporate the ideas and expectations of the team members. This required me to actively listen to different perspectives, explain my reasoning, and adapt my approach based on the feedback I received. The goal was not simply to create a logo, but to find a solution that everyone could identify with and feel comfortable using. This experience strengthened my ability to communicate ideas, handle different opinions, and find common ground. ~|~ Zusätzlich habe ich das Team-Logo entwickelt – ein visuelles Element, das das Team und seine Identität repräsentiert. Im Prozess habe ich mehrere Versionen und Ansätze erstellt und präsentiert, um die Ideen und Erwartungen der Teammitglieder einzubeziehen. Das erforderte, verschiedenen Perspektiven aktiv zuzuhören, meine Überlegungen zu erklären und meinen Ansatz anhand des Feedbacks anzupassen. Ziel war nicht einfach, ein Logo zu erstellen, sondern eine Lösung zu finden, mit der sich alle identifizieren und wohlfühlen. Diese Erfahrung hat meine Fähigkeit gestärkt, Ideen zu kommunizieren, mit unterschiedlichen Meinungen umzugehen und gemeinsame Nenner zu finden.",
    "What I took away ~|~ Was ich mitgenommen habe",
    "How to prepare technical specifications in a way that connects design concepts with development requirements ~|~ Wie man technische Spezifikationen so aufbereitet, dass sie Designkonzepte mit Entwicklungsanforderungen verbinden",
    "How to proactively communicate and collaborate with different people to clarify questions, gather information, and move tasks forward ~|~ Wie man proaktiv mit unterschiedlichen Menschen kommuniziert und zusammenarbeitet, um Fragen zu klären, Informationen zu sammeln und Aufgaben voranzubringen",
    "How to consider and balance different perspectives when developing solutions within a team ~|~ Wie man bei der Lösungsentwicklung im Team verschiedene Perspektiven berücksichtigt und abwägt",
    "Gained hands-on experience in UX Design, branding, and working with design guidelines in a professional environment ~|~ Praktische Erfahrung in UX-Design, Branding und der Arbeit mit Design-Guidelines in einem professionellen Umfeld gesammelt",
    "Strengthened my ability to work independently, structure complex information, and take ownership of tasks ~|~ Meine Fähigkeit gestärkt, eigenständig zu arbeiten, komplexe Informationen zu strukturieren und Verantwortung für Aufgaben zu übernehmen",
    "Specification ~|~ Spezifikation",
    "Takeaways ~|~ Fazit",
    "What I learned at this station ~|~ Was ich an dieser Station gelernt habe",
    "This station gave me a solid foundation in translating design concepts into structured, development-ready documentation. I learned how to navigate a professional design environment, work with guidelines and stakeholders, and take a branding project from first ideas to a finished result that the team uses today. ~|~ Diese Station hat mir eine solide Grundlage gegeben, um Designkonzepte in strukturierte, entwicklungsreife Dokumentation zu übersetzen. Ich habe gelernt, mich in einem professionellen Designumfeld zurechtzufinden, mit Guidelines und Stakeholdern zu arbeiten und ein Branding-Projekt von den ersten Ideen bis zum fertigen Ergebnis zu bringen, das das Team heute nutzt.",
    "This station challenged me to work through the full Design Thinking cycle on my own — from understanding a real developer pain point to designing and handing off a concrete solution. Along the way, I picked up new technical skills and learned what it means to take ownership of a project from start to finish. ~|~ Diese Station hat mich herausgefordert, den gesamten Design-Thinking-Zyklus eigenständig zu durchlaufen – vom Verstehen eines echten Developer Pain Points bis zum Gestalten und Übergeben einer konkreten Lösung. Dabei habe ich neue technische Fähigkeiten erworben und gelernt, was es bedeutet, ein Projekt von Anfang bis Ende zu verantworten.",
    "Hard Skills ~|~ Hard Skills",
    "Soft Skills ~|~ Soft Skills",
    "Writing structured specifications that bridge design and development ~|~ Strukturierte Spezifikationen schreiben, die Design und Entwicklung verbinden",
    "UX Design and working with professional design guidelines ~|~ UX-Design und Arbeit mit professionellen Design-Guidelines",
    "Brand development: from moodboard to final team logo ~|~ Markenentwicklung: vom Moodboard bis zum finalen Team-Logo",
    "Using Figma in a professional design workflow ~|~ Figma in einem professionellen Design-Workflow einsetzen",
    "Proactively reaching out to stakeholders and clarifying open questions ~|~ Proaktiv auf Stakeholder zugehen und offene Fragen klären",
    "Balancing different perspectives and finding common ground ~|~ Unterschiedliche Perspektiven abwägen und gemeinsame Nenner finden",
    "Communicating design ideas and reasoning clearly ~|~ Designideen und Begründungen klar kommunizieren",
    "Working independently and taking ownership of tasks ~|~ Eigenständig arbeiten und Verantwortung für Aufgaben übernehmen",
    "Feedback on my work ~|~ Feedback zu meiner Arbeit",
    "Alesia showed good initiative in finding the research questions, setting up the user interviews, and doing scientific research for the theory part. She followed all the steps for a user-centred design with enough attention to the details and outcomes. She used different sources of inspiration for drafting the initial designs. She practised the SAP culture of networking by talking to most of the team members and got a good understanding of the work that we do in the team. ~|~ Alesia zeigte viel Eigeninitiative bei der Erarbeitung der Forschungsfragen, der Organisation der Nutzerinterviews und der wissenschaftlichen Recherche für den Theorieteil. Sie folgte allen Schritten eines nutzerzentrierten Designs mit ausreichend Aufmerksamkeit für Details und Ergebnisse. Für die ersten Entwürfe nutzte sie verschiedene Inspirationsquellen. Sie lebte die SAP-Kultur des Netzwerkens, indem sie mit den meisten Teammitgliedern sprach, und entwickelte ein gutes Verständnis für unsere Arbeit im Team.",

    /* ---- SAP Station 2 ---- */
    "Station 02 · Work at SAP ~|~ Station 02 · Arbeit bei SAP",
    "A Design Thinking project focused on improving the developer experience within gCTS. ~|~ Ein Design-Thinking-Projekt mit Fokus auf die Verbesserung der Developer Experience in gCTS.",
    "Role: Design Thinking · Workflow Optimization ~|~ <strong>Rolle:</strong> Design Thinking · Workflow-Optimierung",
    "Team: eXperiences by CLM ~|~ <strong>Team:</strong> eXperiences by CLM",
    "Focus: Developer experience in gCTS ~|~ <strong>Fokus:</strong> Developer Experience in gCTS",
    "The problem ~|~ Das Problem",
    "While working with gCTS, developers had to switch between gCTS and GitHub to access the README file of a repository. This small but recurring interruption added unnecessary context switches to their workflow. I used Design Thinking methods to better understand the existing workflow, identify pain points, and explore where the experience could be improved. ~|~ Bei der Arbeit mit gCTS mussten Entwickler:innen zwischen gCTS und GitHub wechseln, um auf die <strong>README-Datei eines Repositorys</strong> zuzugreifen. Diese kleine, aber wiederkehrende Unterbrechung sorgte für unnötige Kontextwechsel im Workflow. Ich habe <strong>Design-Thinking</strong>-Methoden genutzt, um den bestehenden Workflow besser zu verstehen, Pain Points zu identifizieren und zu erkunden, wo das Erlebnis verbessert werden kann.",
    "From insight to solution ~|~ Von der Erkenntnis zur Lösung",
    "Based on the findings, I planned and worked through the different stages of the DLD process, from defining the problem and exploring ideas to developing and refining the final concept. ~|~ Auf Basis der Erkenntnisse habe ich die verschiedenen Phasen des <strong>DLD-Prozesses</strong> geplant und durchlaufen – vom Definieren des Problems über das Erkunden von Ideen bis zum Entwickeln und Verfeinern des finalen Konzepts.",
    "I explored different approaches for improving the workflow and developed a solution that integrates a dedicated README tab directly into gCTS. The Markdown content is automatically converted into HTML and displayed seamlessly within the existing interface. The final concept reduces unnecessary context switches and provides developers with easier access to the information they need, creating a more seamless experience within gCTS. ~|~ Ich habe verschiedene Ansätze zur Verbesserung des Workflows erkundet und eine Lösung entwickelt, die einen <strong>eigenen README-Tab direkt in gCTS</strong> integriert. Der Markdown-Inhalt wird automatisch in HTML umgewandelt und nahtlos in der bestehenden Oberfläche angezeigt. Das finale Konzept reduziert unnötige Kontextwechsel und bietet Entwickler:innen einfacheren Zugang zu den benötigten Informationen – für ein nahtloseres Erlebnis in gCTS.",
    "Applying Design Thinking methods across Discovery, Design and Development ~|~ Design-Thinking-Methoden über Discovery, Design und Development hinweg anwenden",
    "Prototyping UI concepts and interaction flows ~|~ UI-Konzepte und Interaktionsabläufe prototypisch umsetzen",
    "Working with gCTS, Git and SAPUI5 ~|~ Arbeiten mit gCTS, Git und SAPUI5",
    "Creating implementation-ready handoff documentation ~|~ Umsetzungsreife Handoff-Dokumentation erstellen",
    "Quickly learning unfamiliar technologies and complex topics ~|~ Sich schnell in unbekannte Technologien und komplexe Themen einarbeiten",
    "Proactively approaching stakeholders and team members ~|~ Proaktiv auf Stakeholder und Teammitglieder zugehen",
    "Working independently and taking responsibility for each project phase ~|~ Eigenständig arbeiten und Verantwortung für jede Projektphase übernehmen",
    "Integrating into a new team through open and active communication ~|~ Sich durch offene und aktive Kommunikation in ein neues Team integrieren",
    "Alesia has a very quick grasp of new concepts. Although she had no previous experience with SAPUI5, Git, or JavaScript, she got up to speed very quickly. She also understood the complex topic of gCTS very well within a short amount of time. Alesia was always motivated and interested in learning new things, regularly asking questions and actively engaging in discussions. Her communicative and open personality also helped her integrate very well into the team. She was reliable and responsible, completing all tasks very quickly. In addition, she already had very good knowledge of Figma, CSS, and design. ~|~ Alesia erfasst neue Konzepte sehr schnell. Obwohl sie zuvor keine Erfahrung mit SAPUI5, Git oder JavaScript hatte, hat sie sich sehr schnell eingearbeitet. Auch das komplexe Thema gCTS hat sie in kurzer Zeit sehr gut verstanden. Alesia war stets motiviert und daran interessiert, Neues zu lernen, stellte regelmäßig Fragen und beteiligte sich aktiv an Diskussionen. Ihre kommunikative und offene Art half ihr, sich sehr gut ins Team zu integrieren. Sie war zuverlässig und verantwortungsbewusst und erledigte alle Aufgaben sehr zügig. Zudem verfügte sie bereits über sehr gute Kenntnisse in Figma, CSS und Design.",
    "From 04.08.2025 – 24.10.2025, Alesia completed her second practical phase at eXperiences by CLM. During this time, she was able to gain insights into the broad range of tasks involved in the daily work of a UX Designer at eXperiences by CLM and a UI Developer at gCTS. Alesia always completed her tasks to my fullest satisfaction, with great enthusiasm and a high level of independent commitment. I came to know and appreciate her as a responsible, dedicated, and always reliable trainee. Through the results she achieved in the wide range of tasks assigned to her, she was able to contribute added value to our department. In addition to acquiring professional qualifications, Alesia is characterized by her cheerful nature, friendliness, and strong ability to work in a team. I consider her to be exceptionally well-suited as a trainee and would recommend her at any time as an asset to SAP. ~|~ Vom 04.08.2025 – 24.10.2025 absolvierte Alesia ihre zweite Praxisphase bei eXperiences by CLM. In dieser Zeit konnte sie Einblicke in das breite Aufgabenspektrum des Arbeitsalltags einer UX Designerin bei eXperiences by CLM und einer UI-Entwicklerin bei gCTS gewinnen. Alesia erledigte ihre Aufgaben stets zu meiner vollsten Zufriedenheit, mit großer Begeisterung und einem hohen Maß an eigenständigem Engagement. Ich habe sie als verantwortungsvolle, engagierte und stets zuverlässige Praktikantin kennen- und schätzen gelernt. Durch die Ergebnisse, die sie in den vielfältigen ihr übertragenen Aufgaben erzielte, konnte sie einen Mehrwert für unsere Abteilung leisten. Neben dem Erwerb fachlicher Qualifikationen zeichnet sich Alesia durch ihre fröhliche Art, Freundlichkeit und ausgeprägte Teamfähigkeit aus. Ich halte sie für außerordentlich gut als Praktikantin geeignet und würde sie jederzeit als Bereicherung für SAP empfehlen.",
    "Jürgen Quentel (responsible for students) ~|~ Jürgen Quentel (verantwortlich für Studierende)",
    "Alesia successfully fulfilled her responsibilities in full. During her practical assignment, she was able to gain experience with the different DLD phases (Discovery, Design & Development) and worked independently and responsibly in each phase. It is particularly worth highlighting that she proactively approached stakeholders and the team. I wish her all the best for her future endeavors. ~|~ Alesia hat ihre Aufgaben vollständig und erfolgreich erfüllt. Während ihres Praxiseinsatzes konnte sie Erfahrungen mit den verschiedenen DLD-Phasen (Discovery, Design & Development) sammeln und arbeitete in jeder Phase eigenständig und verantwortungsbewusst. Besonders hervorzuheben ist, dass sie proaktiv auf Stakeholder und das Team zugegangen ist. Ich wünsche ihr alles Gute für ihren weiteren Weg.",

    /* ---- SAP Station 3 ---- */
    "Station 03 · Work at SAP ~|~ Station 03 · Arbeit bei SAP",
    "Third practical phase and second project paper: analyzing SAP's Research LAB and exploring how Artificial Intelligence can support and improve user research workflows. ~|~ Dritte Praxisphase und zweite Projektarbeit: Analyse des SAP Research LAB und Erforschung, wie Künstliche Intelligenz User-Research-Workflows unterstützen und verbessern kann.",
    "Role: UX Research · AI Tooling · Projektarbeit 2 ~|~ <strong>Rolle:</strong> UX Research · KI-Tooling · Projektarbeit 2",
    "Team: CX Cross ~|~ <strong>Team:</strong> CX Cross",
    "Focus: AI in User Research ~|~ <strong>Fokus:</strong> KI in der User Research",
    "The Research LAB ~|~ Das Research LAB",
    "My team, CX Cross, develops and maintains the Research LAB — an internal platform at SAP that supports user researchers in planning, conducting and documenting their studies. During this practical phase, I had the opportunity to write my second project paper (Projektarbeit 2) about this very tool: I analyzed the existing Research LAB, explored how Artificial Intelligence could enhance its workflows, and developed a concrete concept to integrate AI into the research process. ~|~ Mein Team, <strong>CX Cross</strong>, entwickelt und pflegt das <strong>Research LAB</strong> — eine interne Plattform bei SAP, die User Researcher beim Planen, Durchführen und Dokumentieren ihrer Studien unterstützt. Während dieser Praxisphase hatte ich die Möglichkeit, meine <strong>zweite Projektarbeit (Projektarbeit 2)</strong> über genau dieses Tool zu schreiben: Ich habe das bestehende Research LAB analysiert, untersucht, wie Künstliche Intelligenz die Workflows verbessern kann, und ein konkretes Konzept zur Integration von KI in den Forschungsprozess entwickelt.",
    "From research to prototype ~|~ Von der Forschung zum Prototyp",
    "I started by conducting expert interviews with researchers across SAP to understand how the Research LAB was being used, what worked well, and where the biggest pain points were. This gave me a clear picture of the status quo and helped me define the requirements for an AI-supported solution. ~|~ Zunächst habe ich <strong>Experteninterviews</strong> mit Forschenden bei SAP geführt, um zu verstehen, wie das Research LAB genutzt wird, was gut funktioniert und wo die größten Pain Points liegen. Das gab mir ein klares Bild des Status quo und half mir, die Anforderungen für eine KI-gestützte Lösung zu definieren.",
    "In parallel, I carried out a structured comparison of different AI research tools, evaluating them against criteria like usefulness, ease of integration and data privacy — a critical factor when dealing with user research data at SAP. ~|~ Parallel dazu habe ich einen <strong>strukturierten Vergleich verschiedener KI-Research-Tools</strong> durchgeführt und sie anhand von Kriterien wie Nutzen, Integrierbarkeit und Datenschutz bewertet — ein entscheidender Faktor beim Umgang mit User-Research-Daten bei SAP.",
    "The Research LAB brings together all workspaces, an integrated Joule assistant for context-specific questions, and a dedicated chat for broader research inquiries — everything researchers need in one place. ~|~ Das Research LAB bringt alle Workspaces zusammen, einen integrierten <strong>Joule-Assistenten</strong> für kontextspezifische Fragen und einen eigenen Chat für allgemeine Research-Anfragen — alles, was Forschende brauchen, an einem Ort.",
    "Based on these findings, I designed an AI-supported research report template that automates parts of the documentation process and helps researchers structure their insights more efficiently. The template was integrated into a working prototype within the existing Research LAB, complete with a feedback loop involving the user research team to validate and refine the concept. ~|~ Auf Basis dieser Erkenntnisse habe ich ein <strong>KI-gestütztes Research-Report-Template</strong> gestaltet, das Teile des Dokumentationsprozesses automatisiert und Forschenden hilft, ihre Erkenntnisse effizienter zu strukturieren. Das Template wurde in einen <strong>funktionierenden Prototyp</strong> im bestehenden Research LAB integriert, inklusive einer Feedbackschleife mit dem User-Research-Team, um das Konzept zu validieren und zu verfeinern.",
    "User Research ~|~ User Research",
    "Projektarbeit 2 ~|~ Projektarbeit 2",
    "This station deepened my understanding of how AI can support and improve user research processes. I learned to conduct expert interviews, evaluate tools critically, and turn research insights into a working prototype — all while navigating topics like data privacy and stakeholder alignment. ~|~ Diese Station hat mein Verständnis dafür vertieft, wie KI User-Research-Prozesse unterstützen und verbessern kann. Ich habe gelernt, Experteninterviews zu führen, Tools kritisch zu bewerten und Research-Erkenntnisse in einen funktionierenden Prototyp umzusetzen – und dabei Themen wie Datenschutz und Stakeholder-Abstimmung zu berücksichtigen.",
    "Planning and conducting expert interviews for requirements analysis ~|~ Experteninterviews für die Anforderungsanalyse planen und durchführen",
    "Structured evaluation of AI tools regarding usefulness, integration and data privacy ~|~ Strukturierte Bewertung von KI-Tools hinsichtlich Nutzen, Integration und Datenschutz",
    "Designing an AI-supported research report template ~|~ Ein KI-gestütztes Research-Report-Template gestalten",
    "Prototyping and integrating new features into an existing product ~|~ Neue Features prototypisch umsetzen und in ein bestehendes Produkt integrieren",
    "Synthesizing insights from different stakeholders into a coherent concept ~|~ Erkenntnisse verschiedener Stakeholder zu einem schlüssigen Konzept zusammenführen",
    "Managing an independent research project from start to finish ~|~ Ein eigenständiges Research-Projekt von Anfang bis Ende leiten",
    "Translating findings into actionable design decisions ~|~ Erkenntnisse in umsetzbare Designentscheidungen übersetzen",
    "Iterating on solutions based on continuous team feedback ~|~ Lösungen auf Basis von kontinuierlichem Teamfeedback iterativ verbessern",

    /* ---- SAP Station 4 ---- */
    "Station 04 · Work at SAP ~|~ Station 04 · Arbeit bei SAP",
    "CS Japan Growth Office ~|~ CS Japan Growth Office",
    "Fourth practical phase in Tokyo, Japan — creating customer-facing materials, developing the Autonomous Enterprise presentation and joining real customer meetings. ~|~ Vierte Praxisphase in Tokio, Japan – Erstellung von Kundenmaterialien, Entwicklung der Experience-Center-Präsentation und Teilnahme an echten Kundenmeetings.",
    "Role: Presales · Visual Communication · Customer Engagement ~|~ <strong>Rolle:</strong> Presales · Visuelle Kommunikation · Customer Engagement",
    "Team: CS Japan Growth Office ~|~ <strong>Team:</strong> CS Japan Growth Office",
    "Location: Tokyo, Japan ~|~ <strong>Ort:</strong> Tokio, Japan",
    "My role in the team ~|~ Meine Rolle im Team",
    "For my fourth practical phase, I joined the CS Japan Growth Office in Tokyo — a rotation that took me far outside my usual environment. The team focuses on Presales and the Experience Center, working directly with customers to showcase SAP's solutions. My role was to create visual communication materials and customer-facing content that helps bring SAP's innovations to life. ~|~ Für meine vierte Praxisphase bin ich dem <strong>CS Japan Growth Office</strong> in Tokio beigetreten – eine Rotation, die mich weit aus meinem gewohnten Umfeld herausgeführt hat. Das Team konzentriert sich auf <strong>Presales</strong> und das <strong>Experience Center</strong> und arbeitet direkt mit Kund:innen zusammen, um SAPs Lösungen zu präsentieren. Meine Aufgabe war es, visuelle Kommunikationsmaterialien und kundengerichtete Inhalte zu erstellen, die SAPs Innovationen erlebbar machen.",
    "What I worked on ~|~ Woran ich gearbeitet habe",
    "One of my main tasks was designing a PowerPoint template for the team — a reusable, branded foundation for presentations used in customer meetings and internal communication. I also created an email banner to give the team a consistent and professional visual identity across their outgoing communications. ~|~ Eine meiner Hauptaufgaben war die Gestaltung eines <strong>PowerPoint-Templates</strong> für das Team – eine wiederverwendbare, gebrandete Grundlage für Präsentationen in Kundenmeetings und interner Kommunikation. Außerdem habe ich einen <strong>E-Mail-Banner</strong> erstellt, um dem Team eine einheitliche und professionelle visuelle Identität in der externen Kommunikation zu geben.",
    "A key project was the SAP Experience Center Tokyo slide deck — a dual-purpose presentation designed to work for two audiences from a single source. For customers, the deck delivers an immersive, visually rich experience inspired by Tokyo's neon aesthetics and Japanese cultural elements. For internal employees, the same deck switches to a clean, information-focused layout. One design system, two communication modes. ~|~ Ein zentrales Projekt war das <strong>SAP Experience Center Tokyo Slide Deck</strong> — eine <strong>Dual-Purpose-Präsentation</strong>, die aus einer einzigen Quelle für zwei Zielgruppen funktioniert. Für Kund:innen bietet das Deck ein immersives, visuell reiches Erlebnis, inspiriert von Tokios Neon-Ästhetik und japanischen Kulturelementen. Für interne Mitarbeitende wechselt dasselbe Deck zu einem klaren, informationsorientierten Layout. Ein Designsystem, zwei Kommunikationsmodi.",
    "Beyond creating materials, I had the opportunity to participate in real customer meetings — experiencing first-hand how Presales conversations work, how customers respond to visual storytelling, and how the materials I created came to life in practice. ~|~ Über das Erstellen von Materialien hinaus hatte ich die Gelegenheit, an <strong>echten Kundenmeetings teilzunehmen</strong> — und aus erster Hand zu erleben, wie Presales-Gespräche ablaufen, wie Kund:innen auf visuelles Storytelling reagieren und wie meine Materialien in der Praxis zum Leben erwachten.",
    "Dual-Purpose Deck ~|~ Dual-Purpose Deck",
    "Visual Communication ~|~ Visuelle Kommunikation",
    "Tokyo, Japan ~|~ Tokio, Japan",
    "This rotation broadened my perspective far beyond design — I experienced what it means to work directly with customers in a Presales context, create materials that need to communicate complex ideas clearly, and grow both professionally and personally in a completely new cultural environment. ~|~ Diese Rotation hat meinen Blick weit über Design hinaus erweitert – ich habe erlebt, was es bedeutet, direkt mit Kund:innen im Presales-Kontext zu arbeiten, Materialien zu erstellen, die komplexe Ideen klar vermitteln müssen, und sowohl beruflich als auch persönlich in einem völlig neuen kulturellen Umfeld zu wachsen.",
    "Designing professional, reusable presentation templates in PowerPoint ~|~ Professionelle, wiederverwendbare Präsentations-Templates in PowerPoint gestalten",
    "Creating branded visual assets like email banners for team communication ~|~ Gebrandete visuelle Assets wie E-Mail-Banner für die Teamkommunikation erstellen",
    "Developing a dual-purpose slide deck for customers and internal teams ~|~ Ein Dual-Purpose Slide Deck für Kund:innen und interne Teams entwickeln",
    "Understanding SAP's product portfolio from a Presales perspective ~|~ SAPs Produktportfolio aus einer Presales-Perspektive verstehen",
    "Participating in real customer meetings and observing Presales dynamics ~|~ An echten Kundenmeetings teilnehmen und Presales-Dynamiken beobachten",
    "Cross-cultural collaboration in a Japanese business environment ~|~ Kulturübergreifende Zusammenarbeit in einem japanischen Geschäftsumfeld",
    "Translating complex technology into clear, visual stories for diverse audiences ~|~ Komplexe Technologie in klare, visuelle Geschichten für unterschiedliche Zielgruppen übersetzen",
    "Adapting to a new country, culture and work style with openness and resilience ~|~ Sich mit Offenheit und Resilienz an ein neues Land, eine neue Kultur und einen neuen Arbeitsstil anpassen",

    /* ---- STAR Projects card (Work at SAP) ---- */
    "A student AI community at SAP: brand, concept & social media. Build. Learn. Share. → ~|~ Eine studentische KI-Community bei SAP: Marke, Konzept & Social Media. Build. Learn. Share. →",

    /* ---- AI@STAR ---- */
    "Work at SAP · STAR Project ~|~ Arbeit bei SAP · STAR-Projekt",
    "A student-led AI community at SAP that helps STAR students build real, hands-on AI skills — through workshops, a playground to experiment, and mentoring that turns curiosity into capability. ~|~ Eine studentisch getragene KI-Community bei SAP, die STAR-Studierenden hilft, echte, praxisnahe KI-Kompetenzen aufzubauen – durch Workshops, einen Playground zum Experimentieren und Mentoring, das Neugier in Können verwandelt.",
    "Type: Student AI Community (SAP) ~|~ <strong>Art:</strong> Studentische KI-Community (SAP)",
    "Role: Design Lead ~|~ <strong>Rolle:</strong> Design Lead",
    "Scope: Brand · Concept · Social Media ~|~ <strong>Umfang:</strong> Marke · Konzept · Social Media",
    "← Back to Work at SAP ~|~ ← Zurück zur Arbeit bei SAP",

    "01 · Starting Point & Idea ~|~ 01 · Ausgangspunkt & Idee",
    "All in on AI. ~|~ Voll auf KI.",
    "AI is reshaping how everyone works — and students have always been the ones to adopt new tools first. AI@STAR turns that instinct into a structured community: a place where STAR students at SAP build real AI skills together instead of experimenting in isolation. ~|~ KI verändert, wie alle arbeiten – und Studierende waren schon immer die Ersten, die neue Tools ausprobieren. <strong>AI@STAR</strong> macht aus diesem Instinkt eine strukturierte Community: einen Ort, an dem STAR-Studierende bei SAP gemeinsam echte KI-Kompetenzen aufbauen, statt isoliert zu experimentieren.",
    "The idea is simple but ambitious: give students the space, the guidance and the visibility to go from curious to genuinely AI-ready — and to make that growth count, both for them and for SAP. ~|~ Die Idee ist einfach, aber ambitioniert: Studierenden den Raum, die Begleitung und die Sichtbarkeit geben, um von <strong>neugierig</strong> zu wirklich <strong>AI-ready</strong> zu werden – und dieses Wachstum zählbar zu machen, für sie und für SAP.",
    "As Design Lead, I shaped the brand identity, the visual language and the full social-media campaign that gives AI@STAR its voice: confident, future-facing and unmistakably SAP. ~|~ Als <strong>Design Lead</strong> habe ich die Markenidentität, die visuelle Sprache und die gesamte Social-Media-Kampagne gestaltet, die AI@STAR ihre Stimme geben: selbstbewusst, zukunftsgerichtet und unverkennbar SAP.",
    "What AI@STAR stands for ~|~ Wofür AI@STAR steht",
    "Make broad AI upskilling accessible to every STAR student ~|~ Breites KI-Upskilling für jede:n STAR-Studierende:n zugänglich machen",
    "Create a safe playground to build & experiment with AI tools ~|~ Einen sicheren Playground zum Bauen & Experimentieren mit KI-Tools schaffen",
    "Turn individual learning into a shared, visible community ~|~ Individuelles Lernen in eine gemeinsame, sichtbare Community verwandeln",
    "Help students reach a real, demonstrable AI level ~|~ Studierenden helfen, ein echtes, nachweisbares KI-Niveau zu erreichen",
    "Create tangible value for SAP through AI-ready talent ~|~ Durch AI-ready Talente greifbaren Mehrwert für SAP schaffen",

    "02 · The Concept ~|~ 02 · Das Konzept",
    "Four core AI skills, three ways to grow. ~|~ Vier zentrale KI-Skills, drei Wege zu wachsen.",
    "AI@STAR is built on Four Core AI Skills and brought to life through three connected pillars — all held together by mentoring and powered by the AI@STAR Workshops and Playground. ~|~ AI@STAR basiert auf <strong>vier zentralen KI-Skills</strong> und wird über drei verbundene Säulen zum Leben erweckt – zusammengehalten durch Mentoring und getragen von den AI@STAR Workshops und dem Playground.",
    "Learn ~|~ Lernen",
    "Build ~|~ Bauen",
    "Share ~|~ Teilen",
    "Broad AI upskilling — building a shared foundation of knowledge every student can rely on. ~|~ Breites KI-Upskilling – eine gemeinsame Wissensbasis, auf die sich alle verlassen können.",
    "Develop tools that support STAR goals, putting new skills straight into practice. ~|~ Tools entwickeln, die STAR-Ziele unterstützen, und neue Skills direkt in die Praxis bringen.",
    "Amplify impact and make skills visible — so learning benefits the whole community. ~|~ Wirkung verstärken und Skills sichtbar machen – damit Lernen der ganzen Community nützt.",

    "03 · How It Works ~|~ 03 · So funktioniert's",
    "Three pillars, one community ~|~ Drei Säulen, eine Community",
    "Broad AI Upskilling ~|~ Breites KI-Upskilling",
    "Apply & Create ~|~ Anwenden & Erschaffen",
    "Amplify & Make Visible ~|~ Verstärken & Sichtbar machen",
    "Hands-on workshops on real AI tools & workflows ~|~ Praxisnahe Workshops zu echten KI-Tools & Workflows",
    "A shared baseline for every STAR student ~|~ Eine gemeinsame Basis für jede:n STAR-Studierende:n",
    "From first contact to confident everyday use ~|~ Vom ersten Kontakt bis zur sicheren alltäglichen Nutzung",
    "Low-barrier, peer-to-peer and practical ~|~ Niederschwellig, von Peer zu Peer und praxisnah",
    "Foundation · Knowledge · Confidence ~|~ Basis · Wissen · Sicherheit",
    "A playground to experiment without fear of failure ~|~ Ein Playground zum Experimentieren ohne Angst vor Fehlern",
    "Develop tools that support concrete STAR goals ~|~ Tools entwickeln, die konkrete STAR-Ziele unterstützen",
    "Turn learning into working prototypes ~|~ Lernen in funktionierende Prototypen verwandeln",
    "Skills proven through real output ~|~ Skills, die sich an echten Ergebnissen beweisen",
    "Practice · Prototyping · Impact ~|~ Praxis · Prototyping · Wirkung",
    "Make individual skills visible across the community ~|~ Individuelle Skills in der Community sichtbar machen",
    "Mentoring that passes knowledge forward ~|~ Mentoring, das Wissen weitergibt",
    "A social presence that sparks conversation ~|~ Ein Social-Auftritt, der Gespräche anstößt",
    "Growth that benefits students & SAP alike ~|~ Wachstum, das Studierenden & SAP gleichermaßen nützt",
    "Community · Mentoring · Visibility ~|~ Community · Mentoring · Sichtbarkeit",
    "Learn, Build and Share aren't separate steps — they reinforce each other. Together they turn a loose interest in AI into a community that keeps leveling up, with every student both learning and teaching. ~|~ Lernen, Bauen und Teilen sind keine getrennten Schritte – sie verstärken sich gegenseitig. Zusammen machen sie aus losem Interesse an KI eine Community, die stetig besser wird, in der alle zugleich lernen und lehren.",

    "04 · Social Media Campaign ~|~ 04 · Social-Media-Kampagne",
    "Giving AI@STAR a voice ~|~ AI@STAR eine Stimme geben",
    "A series of social posts built around the questions every student is already asking — designed in the AI@STAR brand world of deep navy, holographic gradients and sharp, confident type. ~|~ Eine Reihe von Social-Posts rund um die Fragen, die sich alle Studierenden ohnehin stellen – gestaltet in der AI@STAR-Markenwelt aus tiefem Navy, holografischen Verläufen und klarer, selbstbewusster Typografie.",

    "05 · Brand in the Wild ~|~ 05 · Marke zum Anfassen",
    "A brand students want to stick on their laptop ~|~ Eine Marke, die Studierende aufs Laptop kleben wollen",
    "Beyond the screen, AI@STAR lives as a holographic sticker — a small, tangible badge of belonging to the Student AI Community. The gradient catches the light just like the digital brand, carrying \"Build. Learn. Share.\" out into the real world. ~|~ Über den Bildschirm hinaus lebt AI@STAR als holografischer Sticker – ein kleines, greifbares Zeichen der Zugehörigkeit zur <strong>Student AI Community</strong>. Der Verlauf fängt das Licht genau wie die digitale Marke und trägt „Build. Learn. Share.“ in die echte Welt.",
    "It's a reminder that AI@STAR is not a one-off campaign, but an identity students carry with them — on laptops, in hallways and across the SAP community. ~|~ Er erinnert daran, dass AI@STAR keine einmalige Kampagne ist, sondern eine Identität, die Studierende mit sich tragen – auf Laptops, in Fluren und in der gesamten SAP-Community.",

    "What I take away from this project. ~|~ Was ich aus diesem Projekt mitnehme.",
    "AI@STAR let me build a brand from the ground up — from a single idea to a complete visual identity, concept model and social-media campaign. I learned how to translate a fast-moving, hype-prone topic like AI into a clear, confident voice that feels credible rather than loud. Leading the design gave me ownership over every touchpoint, from the logo and holographic sticker to the posts that start the conversation — and showed me how design can turn a community idea into something students actually want to join. ~|~ AI@STAR ließ mich eine Marke von Grund auf aufbauen – von einer einzigen Idee bis zu einer vollständigen visuellen Identität, einem Konzeptmodell und einer Social-Media-Kampagne. Ich habe gelernt, ein schnelllebiges, hype-anfälliges Thema wie KI in eine klare, selbstbewusste Stimme zu übersetzen, die glaubwürdig statt laut wirkt. Die Design-Leitung gab mir Verantwortung für jeden Touchpoint – vom Logo über den holografischen Sticker bis zu den Posts, die das Gespräch eröffnen – und zeigte mir, wie Design aus einer Community-Idee etwas macht, dem Studierende wirklich beitreten wollen.",
    "Brand Identity ~|~ Markenidentität",
    "Community Building ~|~ Community-Aufbau",
    "Visual Design ~|~ Visuelles Design",
    "Design Lead ~|~ Design Lead"
  ];

  var map = new Map();
  for (var r = 0; r < RAW.length; r++) {
    var line = RAW[r];
    var idx = line.indexOf("~|~");
    if (idx < 0) continue;
    var en = norm(line.slice(0, idx));
    var de = line.slice(idx + 3).trim();
    if (en) map.set(en, de);
  }

  // Elements whose text we attempt to translate.
  var SEL = "h1,h2,h3,h4,h5,h6,p,li,span,a,button,label,figcaption,blockquote,footer,strong,em";

  function setDE() {
    // Walk deepest elements first so the innermost matching element wins.
    // This keeps structure intact, e.g. a nav <li> containing an <a>:
    // the <a> is translated (href preserved) and the <li> is left alone.
    var nodes = Array.prototype.slice.call(document.querySelectorAll(SEL)).reverse();
    var done = [];
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      // never touch the language switch button itself
      if (el.closest && el.closest(".lang-switch")) continue;
      var de = map.get(norm(el.textContent));
      if (de === undefined) continue;
      // if an inner element was already translated, don't clobber the parent
      var skip = false;
      for (var j = 0; j < done.length; j++) {
        if (el.contains(done[j])) { skip = true; break; }
      }
      if (skip) continue;
      if (el.getAttribute("data-en-html") === null) {
        el.setAttribute("data-en-html", el.innerHTML);
      }
      el.innerHTML = de;
      done.push(el);
    }
  }

  function setEN() {
    var saved = document.querySelectorAll("[data-en-html]");
    for (var i = 0; i < saved.length; i++) {
      saved[i].innerHTML = saved[i].getAttribute("data-en-html");
    }
  }

  function updateButtons(lang) {
    var btns = document.querySelectorAll(".lang-switch");
    btns.forEach(function (wrap) {
      wrap.querySelectorAll("[data-lang]").forEach(function (opt) {
        opt.classList.toggle("is-active", opt.getAttribute("data-lang") === lang);
      });
      var btn = wrap.querySelector(".lang-btn");
      if (btn) btn.setAttribute("data-current", lang);
    });
  }

  function apply(lang) {
    if (lang === "de") setDE();
    else { lang = "en"; setEN(); }
    document.documentElement.lang = lang;
    updateButtons(lang);
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }

  function current() {
    var l;
    try { l = localStorage.getItem(KEY); } catch (e) {}
    return l === "de" ? "de" : "en";
  }

  function wire() {
    document.querySelectorAll(".lang-switch .lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        apply(current() === "de" ? "en" : "de");
      });
    });
    // allow clicking a specific EN / DE label directly
    document.querySelectorAll(".lang-switch [data-lang]").forEach(function (opt) {
      opt.addEventListener("click", function (e) {
        e.stopPropagation();
        apply(opt.getAttribute("data-lang"));
      });
    });
    apply(current());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }
})();
