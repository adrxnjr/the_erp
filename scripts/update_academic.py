with open('frontend/src/pages/AcademicPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

fallback_syllabi_code = '''const DEFAULT_SYLLABI: SyllabusItem[] = [
  {
    id: "syl-001",
    subject_name: "Mathematics",
    subject_code: "MATH",
    wing_name: "Senior Secondary Wing",
    grade_range: "Grades 10 to 12",
    academic_year: "2026-2027",
    total_units: 6,
    total_hours: 160,
    overview: "Comprehensive CBSE curriculum covering Differential Calculus, Quadratic Equations, Trigonometry, Coordinate Geometry, and Probability Theory.",
    units: [
      { unit_number: 1, title: "Real Numbers & Polynomials", term: "Term 1", hours: 25, topics: ["Euclid Division Lemma", "Fundamental Theorem of Arithmetic", "Zeroes of Polynomials"] },
      { unit_number: 2, title: "Linear Equations & Arithmetic Progressions", term: "Term 1", hours: 30, topics: ["Pair of Linear Equations", "nth Term of an AP", "Sum of First n Terms"] },
      { unit_number: 3, title: "Coordinate Geometry & Triangles", term: "Term 1", hours: 25, topics: ["Distance Formula", "Section Formula", "Similarity of Triangles"] },
      { unit_number: 4, title: "Introduction to Trigonometry", term: "Term 2", hours: 30, topics: ["Trigonometric Ratios", "Trigonometric Identities", "Heights & Distances Applications"] },
      { unit_number: 5, title: "Circles & Surface Areas", term: "Term 2", hours: 25, topics: ["Tangents to a Circle", "Surface Areas of Combinations", "Frustum of a Cone"] },
      { unit_number: 6, title: "Statistics & Probability", term: "Term 2", hours: 25, topics: ["Mean, Median and Mode", "Cumulative Frequency Graph", "Classical Probability"] }
    ],
    textbooks: ["NCERT Mathematics Class 10", "R.D. Sharma Mathematics Volume 1 & 2", "CBSE Mathematics Exemplar"],
    learning_outcomes: [
      "Master algebraic factorisation and quadratic graphing",
      "Prove geometric theorems on similar triangles and circle tangents",
      "Solve real-world trigonometric heights and distance models",
      "Calculate standard deviation and empirical probability distributions"
    ],
    coordinator_name: "Dr. Arthur Vance (Senior Secondary Coordinator)",
    status: "Approved & Published"
  },
  {
    id: "syl-002",
    subject_name: "Computer Science",
    subject_code: "CS",
    wing_name: "Senior Secondary Wing",
    grade_range: "Grades 10 to 12",
    academic_year: "2026-2027",
    total_units: 5,
    total_hours: 140,
    overview: "Computational thinking, Python object-oriented programming, relational SQL database structures, and foundational neural networks.",
    units: [
      { unit_number: 1, title: "Python Programming & Functions", term: "Term 1", hours: 25, topics: ["Control Structures", "Functions & Scope", "String & List Manipulations"] },
      { unit_number: 2, title: "Data Structures - Stacks & Queues", term: "Term 1", hours: 30, topics: ["Stack Operations using Lists", "Queue Implementations", "Algorithm Complexity"] },
      { unit_number: 3, title: "Relational Databases & SQL", term: "Term 2", hours: 30, topics: ["Relational Data Model", "DDL and DML Commands", "Aggregate Functions & Joins"] },
      { unit_number: 4, title: "Computer Networks & Cyber Ethics", term: "Term 2", hours: 25, topics: ["Transmission Media", "Network Devices & Topologies", "Cyber Safety & Intellectual Property"] },
      { unit_number: 5, title: "Introduction to Artificial Intelligence", term: "Term 2", hours: 30, topics: ["Machine Learning Workflow", "Prompt Engineering", "Ethics of Generative AI"] }
    ],
    textbooks: ["Computer Science with Python by Sumita Arora", "NCERT Informatics Practices", "Python Cookbook 3rd Edition"],
    learning_outcomes: [
      "Develop modular object-oriented Python scripts with error handling",
      "Execute ACID compliant SQL table queries, constraints, and joins",
      "Understand network topologies, DNS, and SSL security protocols",
      "Build basic decision tree and linear regression models"
    ],
    coordinator_name: "Dr. Arthur Vance (Senior Secondary Coordinator)",
    status: "Approved & Published"
  },
  {
    id: "syl-003",
    subject_name: "General Science",
    subject_code: "SCI",
    wing_name: "Middle School Wing",
    grade_range: "Grades 6 to 9",
    academic_year: "2026-2027",
    total_units: 6,
    total_hours: 150,
    overview: "Integrated natural sciences incorporating Physics (Forces & Energy), Chemistry (Matter & Atomic Structure), and Biology (Cell Biology & Ecosystems).",
    units: [
      { unit_number: 1, title: "Cell Structure & Functions", term: "Term 1", hours: 25, topics: ["Plant vs Animal Cells", "Cell Organelles", "Cell Division (Mitosis)"] },
      { unit_number: 2, title: "Force, Motion & Laws of Gravitation", term: "Term 1", hours: 28, topics: ["Newton's Three Laws of Motion", "Universal Law of Gravitation", "Mass vs Weight"] },
      { unit_number: 3, title: "Atoms, Molecules & Chemical Reactions", term: "Term 1", hours: 25, topics: ["Chemical Formulae", "Mole Concept", "Balancing Chemical Equations"] },
      { unit_number: 4, title: "Plant Physiology & Photosynthesis", term: "Term 2", hours: 22, topics: ["Xylem and Phloem Transport", "Chloroplast Function", "Stomatal Gas Exchange"] },
      { unit_number: 5, title: "Sound Waves & Light Optics", term: "Term 2", hours: 26, topics: ["Propagation of Sound", "Reflection & Refraction", "Structure of the Human Eye"] },
      { unit_number: 6, title: "Natural Resources & Conservation", term: "Term 2", hours: 24, topics: ["Biogeochemical Cycles", "Air and Water Pollution", "Ozone Layer Depletion"] }
    ],
    textbooks: ["NCERT Science Class 8 & 9", "Lakhmir Singh & Manjit Kaur Science Series", "Practical Science Laboratory Manual"],
    learning_outcomes: [
      "Conduct safe titration and precipitate chemical reactions in the lab",
      "Construct ray diagrams for concave and convex spherical lenses",
      "Explain respiration and cardiovascular circulation in vertebrates",
      "Calculate gravitational potential and kinetic energy vectors"
    ],
    coordinator_name: "Mrs. Rachel Green (Middle School Coordinator)",
    status: "Approved & Published"
  },
  {
    id: "syl-004",
    subject_name: "English Literature",
    subject_code: "ENG",
    wing_name: "Middle School Wing",
    grade_range: "Grades 6 to 9",
    academic_year: "2026-2027",
    total_units: 4,
    total_hours: 120,
    overview: "Literary appreciation, poetic verse forms, rhetorical composition, formal correspondence, and dramatic monologue analysis.",
    units: [
      { unit_number: 1, title: "Prose Reading - World Classic Short Stories", term: "Term 1", hours: 30, topics: ["Character Arc Analysis", "Setting and Mood", "Narrative Point of View"] },
      { unit_number: 2, title: "Poetic Devices & Metaphorical Analysis", term: "Term 1", hours: 25, topics: ["Rhyme Schemes", "Simile, Metaphor & Personification", "Alliteration & Symbolism"] },
      { unit_number: 3, title: "Advanced Writing - Editorial & Argumentative", term: "Term 2", hours: 35, topics: ["Formal Letter Formats", "Newspaper Articles", "Debate & Speech Delivery"] },
      { unit_number: 4, title: "Dramatic Arts - Shakespearean Scenes", term: "Term 2", hours: 30, topics: ["The Merchant of Venice Excerpts", "Stage Directions", "Soliloquy Interpretation"] }
    ],
    textbooks: ["First Flight Literature Reader", "Footprints without Feet Supplementary Reader", "Wren & Martin High School English Grammar"],
    learning_outcomes: [
      "Critique character motivation and thematic conflict in classic prose",
      "Compose persuasive articles following standard ICSE/CBSE formats",
      "Identify iambic pentameter, alliteration, and hyperbole in verse",
      "Deliver dramatic readings with expressive diction and cadence"
    ],
    coordinator_name: "Mrs. Rachel Green (Middle School Coordinator)",
    status: "Approved & Published"
  },
  {
    id: "syl-005",
    subject_name: "Environmental Studies",
    subject_code: "EVS",
    wing_name: "Primary Wing",
    grade_range: "Grades 1 to 5",
    academic_year: "2026-2027",
    total_units: 4,
    total_hours: 100,
    overview: "Experiential natural science focusing on community awareness, weather patterns, animal habitats, and healthy living.",
    units: [
      { unit_number: 1, title: "Living Things & Habitats", term: "Term 1", hours: 25, topics: ["Plants Around Us", "Animal Homes", "Care for Domestic Pets"] },
      { unit_number: 2, title: "Weather, Water Cycle & Seasons", term: "Term 1", hours: 25, topics: ["Rainy, Summer, Winter Seasons", "Saving Drinking Water", "Rainwater Harvesting Basics"] },
      { unit_number: 3, title: "Healthy Food, Nutrition & Hygiene", term: "Term 2", hours: 25, topics: ["Balanced Diet Pyramid", "Handwashing & Oral Hygiene", "Safe Street Food Habits"] },
      { unit_number: 4, title: "Community Helpers & Civic Duty", term: "Term 2", hours: 25, topics: ["Doctors, Police & Firefighters", "Traffic Signals", "Keeping Public Parks Clean"] }
    ],
    textbooks: ["NCERT Looking Around Primary EVS", "Oxford Environmental Studies Book 4"],
    learning_outcomes: [
      "Differentiate between herbivores, carnivores, and omnivores",
      "Trace the evaporation and condensation cycle in nature",
      "Practice personal hygiene and balanced nutritional habits",
      "Identify major public civic institutions in the local neighborhood"
    ],
    coordinator_name: "Ms. Sarah Jenkins (Primary Wing Coordinator)",
    status: "Approved & Published"
  },
  {
    id: "syl-006",
    subject_name: "Primary Mathematics",
    subject_code: "MATH",
    wing_name: "Primary Wing",
    grade_range: "Grades 1 to 5",
    academic_year: "2026-2027",
    total_units: 4,
    total_hours: 110,
    overview: "Foundational numeracy, multiplication tables, metric measurement units, currency calculations, and geometric shapes.",
    units: [
      { unit_number: 1, title: "Number Systems & Place Values", term: "Term 1", hours: 30, topics: ["Numbers up to 10,000", "Ascending & Descending Order", "Place Value Abacus"] },
      { unit_number: 2, title: "Multiplication Tables & Basic Division", term: "Term 1", hours: 30, topics: ["Tables from 2 to 12", "Repeated Subtraction as Division", "Word Problems"] },
      { unit_number: 3, title: "Length, Weight & Capacity Metrics", term: "Term 2", hours: 25, topics: ["Ruler Measurement in cm", "Kilograms vs Grams", "Liters & Milliliters Measuring Jug"] },
      { unit_number: 4, title: "Currency, Time & Basic 2D Shapes", term: "Term 2", hours: 25, topics: ["Rupee Notes & Coins", "Reading Clocks & Half-Hours", "Circles, Squares, Rectangles & Triangles"] }
    ],
    textbooks: ["Math-Magic Class 4 NCERT", "Target Mental Math Primary Edition"],
    learning_outcomes: [
      "Perform rapid mental addition and multiplication up to 12x12",
      "Convert centimeters to meters and grams to kilograms",
      "Read analog and digital clocks to the exact minute",
      "Calculate change and bills in Indian Rupees and paise"
    ],
    coordinator_name: "Ms. Sarah Jenkins (Primary Wing Coordinator)",
    status: "Approved & Published"
  }
];
'''

# Insert DEFAULT_SYLLABI before AcademicPage component
target_comp = "export const AcademicPage: React.FC = () => {"
content = content.replace(target_comp, fallback_syllabi_code + "\n" + target_comp, 1)

# Update fetch to fall back to DEFAULT_SYLLABI if syllRes.data is empty
target_set = "setSyllabi(Array.isArray(syllRes.data) ? syllRes.data : []);"
replacement_set = "const fetchedSyllabi = Array.isArray(syllRes.data) && syllRes.data.length > 0 ? syllRes.data : DEFAULT_SYLLABI;\n      setSyllabi(fetchedSyllabi);"
content = content.replace(target_set, replacement_set, 1)

with open('frontend/src/pages/AcademicPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated AcademicPage.tsx successfully!")

