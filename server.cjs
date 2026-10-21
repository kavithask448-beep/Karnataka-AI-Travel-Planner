
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const Groq = require("groq-sdk");

const app = express();
const PORT = 3000;
const MODEL = "openai/gpt-oss-120b";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

if (!process.env.GROQ_API_KEY) {
  console.error("Missing GROQ_API_KEY in your .env file.");
  process.exit(1);
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const INTERESTS = [
  "All places",
  "Nature",
  "Temples",
  "History",
  "Adventure",
  "Beaches",
  "Wildlife",
];

const KEYWORDS = {
  Nature: [
    "nature", "waterfall", "falls", "forest", "hill", "lake",
    "river", "garden", "dam", "valley", "viewpoint", "cave",
    "backwater", "scenic", "landscape"
  ],
  Temples: [
    "temple", "devasthana", "shrine", "matha", "math",
    "shakti peetha", "shakti peeth", "hanuman", "shiva",
    "vishnu", "ganesha", "ganapathi", "durga", "chamundeshwari",
    "subramanya", "basadi", "jain temple"
  ],
  History: [
    "palace", "fort", "museum", "heritage", "historical",
    "historic", "monument", "archaeological", "inscription",
    "ancient", "royal", "kingdom", "memorial", "architecture"
  ],
  Adventure: [
    "trek", "trekking", "rafting", "camping", "adventure",
    "rock climbing", "zipline", "kayaking", "water sports",
    "paragliding", "hiking", "safari"
  ],
  Beaches: [
    "beach", "coast", "coastal", "seashore", "shore",
    "sea", "marine", "island", "lighthouse"
  ],
  Wildlife: [
    "wildlife", "national park", "sanctuary", "tiger reserve",
    "bird sanctuary", "bird watching", "safari", "zoo",
    "elephant", "tiger", "forest reserve", "biosphere"
  ],
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function sameDistrict(a, b) {
  const first = normalize(a);
  const second = normalize(b);

  if (first === second) return true;

  const aliases = [
    ["uttara kannada", "uttar kannada", "north kanara", "north canara"],
    ["dakshina kannada", "south kanara", "south canara"],
    ["bengaluru urban", "bangalore urban", "bengaluru"],
    ["bengaluru rural", "bangalore rural"],
    ["mysuru", "mysore"],
    ["belagavi", "belgaum"],
    ["vijayapura", "bijapur"],
    ["kalaburagi", "gulbarga"],
    ["ballari", "bellary"],
    ["shivamogga", "shimoga"],
    ["chikkamagaluru", "chikmagalur"],
    ["vijayanagara", "vijayanagar"],
  ];

  return aliases.some(
    (group) => group.includes(first) && group.includes(second)
  );
}

function matchesInterest(place, interest) {
  if (!interest || interest === "All places") return true;

  const category = normalize(place.category);

  if (category === normalize(interest)) return true;

  const keywords = KEYWORDS[interest] || [];
  const details = normalize([
    place.name,
    place.category,
    place.description,
    place.location,
  ].join(" "));

  return keywords.some((word) => details.includes(normalize(word)));
}

function cleanPlaces(input, district, interest) {
  if (!Array.isArray(input)) return [];

  const seen = new Set();
  const results = [];

  for (const item of input) {
    if (!item || typeof item.name !== "string") continue;

    const name = item.name.trim();
    if (name.length < 2 || name.length > 150) continue;

    // Reject places explicitly labelled as belonging to another district.
    if (item.district && !sameDistrict(item.district, district)) {
      continue;
    }

    if (!matchesInterest(item, interest)) continue;

    const key = normalize(name);
    if (seen.has(key)) continue;
    seen.add(key);

    results.push({
      name,
      district,
      location:
        typeof item.location === "string" && item.location.trim()
          ? item.location.trim()
          : district,
      category:
        typeof item.category === "string" && item.category.trim()
          ? item.category.trim()
          : interest === "All places"
            ? "Tourist attraction"
            : interest,
      description:
        typeof item.description === "string" && item.description.trim()
          ? item.description.trim()
          : `Explore this attraction in ${district}, Karnataka.`,
    });
  }

  return results;
}

function extractJSON(content) {
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("The AI returned no text.");
  }

  const cleaned = content
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (_) {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }

    throw new Error("The AI returned invalid JSON.");
  }
}

function validateRequest(body = {}) {
  const district =
    typeof body.district === "string" ? body.district.trim() : "";

  if (!district || district.length > 100) {
    throw new Error("Please select a valid Karnataka district.");
  }

  const interest = INTERESTS.find(
    (item) => normalize(item) === normalize(body.interest)
  ) || "All places";

  return {
    district,
    interest,
    days: Math.min(10, Math.max(1, Number(body.days) || 1)),
    people: Math.min(20, Math.max(1, Number(body.people) || 1)),
    language: normalize(body.language).includes("kannada")
      ? "Kannada"
      : "English",
    startingPlace:
      typeof body.startingPlace === "string"
        ? body.startingPlace.trim()
        : "",
    budget: Math.max(0, Number(body.budget) || 0),
  };
}

async function askGroqForPlaces(district, interest, days, language) {
  const categoryRule =
    interest === "All places"
      ? "Include a mix of popular attractions and lesser-known places."
      : `Return only real destinations relevant to ${interest}. Do not fill the list with unrelated places.`;

  const prompt = `
Find real tourist destinations located in ${district}, Karnataka.

Selected interest: ${interest}
Trip duration: ${days} days.

${categoryRule}

Rules:
1. Never invent destinations.
2. Do not include places from another district.
3. For Temples, return actual temples, shrines or recognized religious sites.
4. For Beaches, return actual beaches or coastal attractions.
5. Return fewer places if necessary; accuracy is more important than quantity.
6. Keep every description under 15 words.
7. ${language === "Kannada"
    ? "Write descriptions in simple Kannada."
    : "Write descriptions in simple English."}

Return only one valid JSON object with this structure:
{
  "places": [
    {
      "name": "Place name",
      "district": "${district}",
      "location": "Town or area",
      "category": "${interest}",
      "description": "Short description"
    }
  ],
  "hiddenPlaces": [
    {
      "name": "Lesser-known place name",
      "district": "${district}",
      "location": "Town or area",
      "category": "${interest}",
      "description": "Short description"
    }
  ]
}

Return at most 5 popular places and 3 hidden places.
No Markdown or text outside the JSON.
`;

  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "Return concise, accurate tourism information. Follow the requested JSON format. Do not invent facts.",
          },
          { role: "user", content: prompt },
        ],
        reasoning_effort: "low",
        temperature: 0.1,
        max_completion_tokens: 12000,
      });

      const choice = completion.choices?.[0];
      const content = choice?.message?.content;

      if (typeof content !== "string" || !content.trim()) {
        const reason = choice?.finish_reason || "unknown";
        const usage = completion.usage;

        console.error(
          `Groq empty response. Attempt ${attempt}/3. Finish reason: ${reason}. ` +
          `Token usage: ${JSON.stringify(usage || {})}`
        );

        lastError = new Error(`Empty response; finish reason: ${reason}`);

        if (reason === "length") {
          // Do not repeat the identical request if it exhausted its output.
          // A later attempt uses a smaller response target.
          if (attempt < 3) await sleep(500);
          continue;
        }

        if (attempt < 3) await sleep(attempt * 700);
        continue;
      }

      let data;

      try {
        data = extractJSON(content);
      } catch (error) {
        console.error(
          `Groq invalid JSON on attempt ${attempt}/3: ${error.message}`
        );
        lastError = error;

        if (attempt < 3) await sleep(attempt * 700);
        continue;
      }

      const places = cleanPlaces(data.places, district, interest);
      const popularNames = new Set(
        places.map((place) => normalize(place.name))
      );

      const hiddenPlaces = cleanPlaces(
        data.hiddenPlaces,
        district,
        interest
      ).filter((place) => !popularNames.has(normalize(place.name)));

      if (!places.length && !hiddenPlaces.length) {
        lastError = new Error(
          `No matching places returned for ${district} (${interest}).`
        );

        if (attempt < 3) await sleep(attempt * 700);
        continue;
      }

      return { places, hiddenPlaces };
    } catch (error) {
      lastError = error;
      const status = error.status || error.statusCode;

      console.error(
        `Groq request failed on attempt ${attempt}/3:`,
        status || error.message
      );

      // Authentication, permission and invalid-request errors need fixing,
      // not repeated retries.
      if ([400, 401, 403, 404].includes(status)) break;

      if (attempt < 3) await sleep(attempt * 700);
    }
  }

  console.error("Discovery failed:", lastError?.message || "Unknown error");

  throw new Error(
    `Unable to generate ${interest} destinations for ${district}. ` +
    `Please try again.`
  );
}

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Karnataka AI Travel Planner API is running.",
    provider: "Groq",
    model: MODEL,
  });
});

app.post("/api/discover-places", async (req, res) => {
  try {
    const { district, interest, days, language } =
      validateRequest(req.body);

    const result = await askGroqForPlaces(
      district,
      interest,
      days,
      language
    );

    res.json({
      success: true,
      district,
      interest,
      days,
      count: result.places.length,
      places: result.places,
      hiddenPlaces: result.hiddenPlaces,
      note:
        "AI-generated suggestions. Verify locations and opening hours before travelling.",
    });
  } catch (error) {
    console.error("Groq discover places error:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
      places: [],
      hiddenPlaces: [],
    });
  }
});

app.post("/api/day-itinerary", (req, res) => {
  try {
    const {
      district,
      days,
      people,
      language,
      startingPlace,
      interest,
    } = validateRequest(req.body);

    const submitted = [
      ...(Array.isArray(req.body.places) ? req.body.places : []),
      ...(Array.isArray(req.body.hiddenPlaces)
        ? req.body.hiddenPlaces
        : []),
    ];

    const places = cleanPlaces(submitted, district, interest);

    if (!places.length) {
      return res.status(400).json({
        success: false,
        error: "No suitable places provided. Discover places first.",
        itinerary: [],
      });
    }

    const itinerary = [];
    const perDay = Math.max(1, Math.ceil(places.length / days));
    let index = 0;

    for (let day = 1; day <= days; day++) {
      const visits = [];

      for (
        let count = 0;
        count < perDay && index < places.length;
        count++, index++
      ) {
        visits.push({
          name: places[index].name,
          location: places[index].location,
          category: places[index].category,
          description: places[index].description,
        });
      }

      if (visits.length) {
        itinerary.push({
          day,
          title: `Day ${day} - Explore ${district}`,
          visits,
          notes:
            day === 1 && startingPlace
              ? `Start from ${startingPlace}. Check distances and opening hours.`
              : "Group nearby attractions together to reduce travel time.",
        });
      }
    }

    res.json({
      success: true,
      startingPlace,
      district,
      days,
      people,
      itinerary,
      note:
        language === "Kannada"
          ? "ಇದು ಅಂದಾಜು ಪ್ರವಾಸ ಯೋಜನೆ. ಪ್ರಯಾಣಕ್ಕೂ ಮೊದಲು ಸ್ಥಳ ಮತ್ತು ಸಮಯವನ್ನು ಪರಿಶೀಲಿಸಿ."
          : "Suggested itinerary. Verify locations, travel times and opening hours.",
    });
  } catch (error) {
    console.error("Day itinerary error:", error.message);

    res.status(400).json({
      success: false,
      error: error.message,
      itinerary: [],
    });
  }
});

app.post("/api/plan-trip", (req, res) => {
  try {
    const {
      district,
      days,
      people,
      language,
      startingPlace,
      budget,
      interest,
    } = validateRequest(req.body);

    // Approximate costs in INR, not live prices.
    const transport = people * days * 250;
    const food = people * days * 250;
    const accommodation = Math.ceil(people / 2) * days * 500;
    const entryFees = people * days * 100;
    const other = people * days * 100;

    const total =
      transport + food + accommodation + entryFees + other;

    const submitted = [
      ...(Array.isArray(req.body.places) ? req.body.places : []),
      ...(Array.isArray(req.body.hiddenPlaces)
        ? req.body.hiddenPlaces
        : []),
    ];

    const places = cleanPlaces(submitted, district, interest);
    const perDay = Math.max(1, Math.ceil(places.length / days));
    const itinerary = [];

    for (let day = 1; day <= days; day++) {
      const visits = places
        .slice((day - 1) * perDay, day * perDay)
        .map((place) => ({
          name: place.name,
          location: place.location,
          category: place.category,
          description: place.description,
        }));

      itinerary.push({
        day,
        title: `Day ${day} - Explore ${district}`,
        visits,
        notes:
          day === 1 && startingPlace
            ? `Start from ${startingPlace}. Check travel distances.`
            : "Group nearby places together and confirm opening hours.",
      });
    }

    res.json({
      success: true,
      startingPlace,
      district,
      budget,
      days,
      people,
      interest,
      language,
      itinerary,
      expenses: {
        transport,
        food,
        accommodation,
        entryFees,
        other,
        total,
        estimatedTotal: total,
        budgetDifference: budget > 0 ? budget - total : null,
        withinBudget: budget > 0 ? total <= budget : null,
        currency: "INR",
      },
      expenseSummary: {
        transport,
        food,
        accommodation,
        entryFees,
        other,
        total,
        estimatedTotal: total,
        currency: "INR",
      },
      note:
        language === "Kannada"
          ? "ಇವು ಅಂದಾಜು ವೆಚ್ಚಗಳು ಮಾತ್ರ. ನಿಜವಾದ ವೆಚ್ಚಗಳು ಬದಲಾಗಬಹುದು."
          : "These are estimates, not live prices. Actual costs may differ.",
    });
  } catch (error) {
    console.error("Plan trip error:", error.message);

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found.",
  });
});

app.listen(PORT, () => {
  console.log(
    `Karnataka AI Travel Planner API running at http://localhost:${PORT}`
  );
  console.log(`AI provider: Groq | Model: ${MODEL}`);
});
