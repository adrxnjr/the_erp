import sqlite3
import uuid
import json

conn = sqlite3.connect('backend/school_erp.db')
c = conn.cursor()

syllabi_data = [
    (
        "syl-001",
        "Mathematics",
        "MATH",
        "Senior Secondary Wing",
        "Grades 10 to 12",
        "2026-2027",
        6,
        160,
        "Comprehensive CBSE curriculum covering Differential Calculus, Quadratic Equations, Trigonometry, Coordinate Geometry, and Probability Theory.",
        json.dumps([
            {"unit_number": 1, "title": "Real Numbers & Polynomials", "term": "Term 1", "hours": 25, "topics": ["Euclid Division Lemma", "Fundamental Theorem of Arithmetic", "Zeroes of Polynomials"]},
            {"unit_number": 2, "title": "Linear Equations & Arithmetic Progressions", "term": "Term 1", "hours": 30, "topics": ["Pair of Linear Equations", "nth Term of an AP", "Sum of First n Terms"]},
            {"unit_number": 3, "title": "Coordinate Geometry & Triangles", "term": "Term 1", "hours": 25, "topics": ["Distance Formula", "Section Formula", "Similarity of Triangles"]},
            {"unit_number": 4, "title": "Introduction to Trigonometry", "term": "Term 2", "hours": 30, "topics": ["Trigonometric Ratios", "Trigonometric Identities", "Heights & Distances Applications"]},
            {"unit_number": 5, "title": "Circles & Surface Areas", "term": "Term 2", "hours": 25, "topics": ["Tangents to a Circle", "Surface Areas of Combinations", "Frustum of a Cone"]},
            {"unit_number": 6, "title": "Statistics & Probability", "term": "Term 2", "hours": 25, "topics": ["Mean, Median and Mode", "Cumulative Frequency Graph", "Classical Probability"]}
        ]),
        json.dumps(["NCERT Mathematics Class 10", "R.D. Sharma Mathematics Volume 1 & 2", "CBSE Mathematics Exemplar"]),
        json.dumps([
            "Master algebraic factorisation and quadratic graphing",
            "Prove geometric theorems on similar triangles and circle tangents",
            "Solve real-world trigonometric heights and distance models",
            "Calculate standard deviation and empirical probability distributions"
        ]),
        "Dr. Arthur Vance (Senior Secondary Coordinator)",
        "Approved & Published",
        1
    ),
    (
        "syl-002",
        "Computer Science",
        "CS",
        "Senior Secondary Wing",
        "Grades 10 to 12",
        "2026-2027",
        5,
        140,
        "Computational thinking, Python object-oriented programming, relational SQL database structures, and foundational neural networks.",
        json.dumps([
            {"unit_number": 1, "title": "Python Programming & Functions", "term": "Term 1", "hours": 25, "topics": ["Control Structures", "Functions & Scope", "String & List Manipulations"]},
            {"unit_number": 2, "title": "Data Structures - Stacks & Queues", "term": "Term 1", "hours": 30, "topics": ["Stack Operations using Lists", "Queue Implementations", "Algorithm Complexity"]},
            {"unit_number": 3, "title": "Relational Databases & SQL", "term": "Term 2", "hours": 30, "topics": ["Relational Data Model", "DDL and DML Commands", "Aggregate Functions & Joins"]},
            {"unit_number": 4, "title": "Computer Networks & Cyber Ethics", "term": "Term 2", "hours": 25, "topics": ["Transmission Media", "Network Devices & Topologies", "Cyber Safety & Intellectual Property"]},
            {"unit_number": 5, "title": "Introduction to Artificial Intelligence", "term": "Term 2", "hours": 30, "topics": ["Machine Learning Workflow", "Prompt Engineering", "Ethics of Generative AI"]}
        ]),
        json.dumps(["Computer Science with Python by Sumita Arora", "NCERT Informatics Practices", "Python Cookbook 3rd Edition"]),
        json.dumps([
            "Develop modular object-oriented Python scripts with error handling",
            "Execute ACID compliant SQL table queries, constraints, and joins",
            "Understand network topologies, DNS, and SSL security protocols",
            "Build basic decision tree and linear regression models"
        ]),
        "Dr. Arthur Vance (Senior Secondary Coordinator)",
        "Approved & Published",
        1
    ),
    (
        "syl-003",
        "General Science",
        "SCI",
        "Middle School Wing",
        "Grades 6 to 9",
        "2026-2027",
        6,
        150,
        "Integrated natural sciences incorporating Physics (Forces & Energy), Chemistry (Matter & Atomic Structure), and Biology (Cell Biology & Ecosystems).",
        json.dumps([
            {"unit_number": 1, "title": "Cell Structure & Functions", "term": "Term 1", "hours": 25, "topics": ["Plant vs Animal Cells", "Cell Organelles", "Cell Division (Mitosis)"]},
            {"unit_number": 2, "title": "Force, Motion & Laws of Gravitation", "term": "Term 1", "hours": 28, "topics": ["Newton's Three Laws of Motion", "Universal Law of Gravitation", "Mass vs Weight"]},
            {"unit_number": 3, "title": "Atoms, Molecules & Chemical Reactions", "term": "Term 1", "hours": 25, "topics": ["Chemical Formulae", "Mole Concept", "Balancing Chemical Equations"]},
            {"unit_number": 4, "title": "Plant Physiology & Photosynthesis", "term": "Term 2", "hours": 22, "topics": ["Xylem and Phloem Transport", "Chloroplast Function", "Stomatal Gas Exchange"]},
            {"unit_number": 5, "title": "Sound Waves & Light Optics", "term": "Term 2", "hours": 26, "topics": ["Propagation of Sound", "Reflection & Refraction", "Structure of the Human Eye"]},
            {"unit_number": 6, "title": "Natural Resources & Conservation", "term": "Term 2", "hours": 24, "topics": ["Biogeochemical Cycles", "Air and Water Pollution", "Ozone Layer Depletion"]}
        ]),
        json.dumps(["NCERT Science Class 8 & 9", "Lakhmir Singh & Manjit Kaur Science Series", "Practical Science Laboratory Manual"]),
        json.dumps([
            "Conduct safe titration and precipitate chemical reactions in the lab",
            "Construct ray diagrams for concave and convex spherical lenses",
            "Explain respiration and cardiovascular circulation in vertebrates",
            "Calculate gravitational potential and kinetic energy vectors"
        ]),
        "Mrs. Rachel Green (Middle School Coordinator)",
        "Approved & Published",
        1
    ),
    (
        "syl-004",
        "English Literature",
        "ENG",
        "Middle School Wing",
        "Grades 6 to 9",
        "2026-2027",
        4,
        120,
        "Literary appreciation, poetic verse forms, rhetorical composition, formal correspondence, and dramatic monologue analysis.",
        json.dumps([
            {"unit_number": 1, "title": "Prose Reading - World Classic Short Stories", "term": "Term 1", "hours": 30, "topics": ["Character Arc Analysis", "Setting and Mood", "Narrative Point of View"]},
            {"unit_number": 2, "title": "Poetic Devices & Metaphorical Analysis", "term": "Term 1", "hours": 25, "topics": ["Rhyme Schemes", "Simile, Metaphor & Personification", "Alliteration & Symbolism"]},
            {"unit_number": 3, "title": "Advanced Writing - Editorial & Argumentative", "term": "Term 2", "hours": 35, "topics": ["Formal Letter Formats", "Newspaper Articles", "Debate & Speech Delivery"]},
            {"unit_number": 4, "title": "Dramatic Arts - Shakespearean Scenes", "term": "Term 2", "hours": 30, "topics": ["The Merchant of Venice Excerpts", "Stage Directions", "Soliloquy Interpretation"]}
        ]),
        json.dumps(["First Flight Literature Reader", "Footprints without Feet Supplementary Reader", "Wren & Martin High School English Grammar"]),
        json.dumps([
            "Critique character motivation and thematic conflict in classic prose",
            "Compose persuasive articles following standard ICSE/CBSE formats",
            "Identify iambic pentameter, alliteration, and hyperbole in verse",
            "Deliver dramatic readings with expressive diction and cadence"
        ]),
        "Mrs. Rachel Green (Middle School Coordinator)",
        "Approved & Published",
        1
    ),
    (
        "syl-005",
        "Environmental Studies",
        "EVS",
        "Primary Wing",
        "Grades 1 to 5",
        "2026-2027",
        4,
        100,
        "Experiential natural science focusing on community awareness, weather patterns, animal habitats, and healthy living.",
        json.dumps([
            {"unit_number": 1, "title": "Living Things & Habitats", "term": "Term 1", "hours": 25, "topics": ["Plants Around Us", "Animal Homes", "Care for Domestic Pets"]},
            {"unit_number": 2, "title": "Weather, Water Cycle & Seasons", "term": "Term 1", "hours": 25, "topics": ["Rainy, Summer, Winter Seasons", "Saving Drinking Water", "Rainwater Harvesting Basics"]},
            {"unit_number": 3, "title": "Healthy Food, Nutrition & Hygiene", "term": "Term 2", "hours": 25, "topics": ["Balanced Diet Pyramid", "Handwashing & Oral Hygiene", "Safe Street Food Habits"]},
            {"unit_number": 4, "title": "Community Helpers & Civic Duty", "term": "Term 2", "hours": 25, "topics": ["Doctors, Police & Firefighters", "Traffic Signals", "Keeping Public Parks Clean"]}
        ]),
        json.dumps(["NCERT Looking Around Primary EVS", "Oxford Environmental Studies Book 4"]),
        json.dumps([
            "Differentiate between herbivores, carnivores, and omnivores",
            "Trace the evaporation and condensation cycle in nature",
            "Practice personal hygiene and balanced nutritional habits",
            "Identify major public civic institutions in the local neighborhood"
        ]),
        "Ms. Sarah Jenkins (Primary Wing Coordinator)",
        "Approved & Published",
        1
    ),
    (
        "syl-006",
        "Primary Mathematics",
        "MATH",
        "Primary Wing",
        "Grades 1 to 5",
        "2026-2027",
        4,
        110,
        "Foundational numeracy, multiplication tables, metric measurement units, currency calculations, and geometric shapes.",
        json.dumps([
            {"unit_number": 1, "title": "Number Systems & Place Values", "term": "Term 1", "hours": 30, "topics": ["Numbers up to 10,000", "Ascending & Descending Order", "Place Value Abacus"]},
            {"unit_number": 2, "title": "Multiplication Tables & Basic Division", "term": "Term 1", "hours": 30, "topics": ["Tables from 2 to 12", "Repeated Subtraction as Division", "Word Problems"]},
            {"unit_number": 3, "title": "Length, Weight & Capacity Metrics", "term": "Term 2", "hours": 25, "topics": ["Ruler Measurement in cm", "Kilograms vs Grams", "Liters & Milliliters Measuring Jug"]},
            {"unit_number": 4, "title": "Currency, Time & Basic 2D Shapes", "term": "Term 2", "hours": 25, "topics": ["Rupee Notes & Coins", "Reading Clocks & Half-Hours", "Circles, Squares, Rectangles & Triangles"]}
        ]),
        json.dumps(["Math-Magic Class 4 NCERT", "Target Mental Math Primary Edition"]),
        json.dumps([
            "Perform rapid mental addition and multiplication up to 12x12",
            "Convert centimeters to meters and grams to kilograms",
            "Read analog and digital clocks to the exact minute",
            "Calculate change and bills in Indian Rupees and paise"
        ]),
        "Ms. Sarah Jenkins (Primary Wing Coordinator)",
        "Approved & Published",
        1
    )
]

for row in syllabi_data:
    c.execute('''
        INSERT OR REPLACE INTO syllabi (
            id, subject_name, subject_code, wing_name, grade_range, academic_year,
            total_units, total_hours, overview, units, textbooks, learning_outcomes,
            coordinator_name, status, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', row)

conn.commit()
conn.close()
print("Seeded 6 comprehensive syllabi into SQLite successfully!")

