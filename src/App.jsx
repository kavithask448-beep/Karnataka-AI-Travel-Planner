
import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3000";

const DISTRICTS = [
  "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural",
  "Bengaluru Urban", "Bidar", "Chamarajanagar",
  "Chikkaballapura", "Chikkamagaluru", "Chitradurga",
  "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag",
  "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar",
  "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara",
  "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada",
  "Vijayanagara", "Vijayapura", "Yadgir",
];

const INTERESTS = [
  "All places", "Nature", "Temples", "History",
  "Adventure", "Beaches", "Wildlife",
];

const translations = {
  en: {
    switchLanguage: "ಕನ್ನಡ",
    nav: "Explore Karnataka",
    tagline: "DISCOVER THE HIDDEN BEAUTY OF KARNATAKA",
    heroTitle: "Every place has a story. Let's discover yours.",
    heroDescription:
      "Discover tourist places, hidden gems, and plan your trip around Karnataka.",
    plannerTitle: "Plan Your Karnataka Trip",
    startingPlace: "Starting place",
    startingPlaceholder: "Enter your village, town, or city",
    district: "Select destination district",
    districtPlaceholder: "Choose a district",
    budget: "Your total budget (₹)",
    days: "Number of days",
    people: "Number of people",
    interest: "What would you like to explore?",
    generate: "Generate My Itinerary",
    loading: "Generating your trip...",
    placesTitle: "Tourist Places",
    hiddenTitle: "Hidden Gems",
    itineraryTitle: "Your Day-by-Day Itinerary",
    day: "Day",
    expenseTitle: "Estimated Trip Expenses",
    food: "Food",
    travel: "Travel",
    room: "Room rent",
    entry: "Entry fees",
    other: "Other expenses",
    total: "Estimated total",
    tips: "Travel Tips",
    location: "Location",
    failed:
      "Unable to generate your trip. Please check that the backend server is running and try again.",
    required: "Please fill in all the required details.",
    noPlaces: "No places were returned. Please try again.",
    itineraryUnavailable:
      "The day-by-day itinerary could not be loaded. Your other trip details are still available.",
    noItinerary:
      "No day-by-day itinerary was returned. Please try generating your trip again.",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    estimatedNote:
      "Travel costs and timings are estimates. Please verify routes, opening hours, and entry fees before travelling.",
  },

  kn: {
    switchLanguage: "English",
    nav: "ಕರ್ನಾಟಕವನ್ನು ಅನ್ವೇಷಿಸಿ",
    tagline: "ಕರ್ನಾಟಕದ ಸುಂದರ ತಾಣಗಳನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ",
    heroTitle: "ಪ್ರತಿಯೊಂದು ಸ್ಥಳಕ್ಕೂ ಒಂದು ಕಥೆಯಿದೆ.",
    heroDescription:
      "ಪ್ರವಾಸಿ ತಾಣಗಳು ಮತ್ತು ಗುಪ್ತ ಸ್ಥಳಗಳನ್ನು ಕಂಡುಹಿಡಿದು ನಿಮ್ಮ ಪ್ರವಾಸವನ್ನು ಯೋಜಿಸಿ.",
    plannerTitle: "ನಿಮ್ಮ ಕರ್ನಾಟಕ ಪ್ರವಾಸವನ್ನು ಯೋಜಿಸಿ",
    startingPlace: "ಪ್ರಾರಂಭಿಸುವ ಸ್ಥಳ",
    startingPlaceholder: "ನಿಮ್ಮ ಊರು ಅಥವಾ ನಗರವನ್ನು ನಮೂದಿಸಿ",
    district: "ಗಮ್ಯ ಜಿಲ್ಲೆಯ ಆಯ್ಕೆ",
    districtPlaceholder: "ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    budget: "ನಿಮ್ಮ ಒಟ್ಟು ಬಜೆಟ್ (₹)",
    days: "ಪ್ರವಾಸದ ದಿನಗಳ ಸಂಖ್ಯೆ",
    people: "ಪ್ರಯಾಣಿಸುವ ಜನರ ಸಂಖ್ಯೆ",
    interest: "ನೀವು ಏನನ್ನು ಅನ್ವೇಷಿಸಲು ಬಯಸುತ್ತೀರಿ?",
    generate: "ನನ್ನ ಪ್ರವಾಸ ಯೋಜಿಸಿ",
    loading: "ನಿಮ್ಮ ಪ್ರವಾಸವನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...",
    placesTitle: "ಪ್ರವಾಸಿ ತಾಣಗಳು",
    hiddenTitle: "ಗುಪ್ತ ಸ್ಥಳಗಳು",
    itineraryTitle: "ದಿನವಾರು ಪ್ರವಾಸ ಯೋಜನೆ",
    day: "ದಿನ",
    expenseTitle: "ಅಂದಾಜು ಪ್ರವಾಸ ವೆಚ್ಚ",
    food: "ಆಹಾರ",
    travel: "ಪ್ರಯಾಣ",
    room: "ಕೊಠಡಿ ಬಾಡಿಗೆ",
    entry: "ಪ್ರವೇಶ ಶುಲ್ಕ",
    other: "ಇತರೆ ವೆಚ್ಚಗಳು",
    total: "ಅಂದಾಜು ಒಟ್ಟು",
    tips: "ಪ್ರಯಾಣ ಸಲಹೆಗಳು",
    location: "ಸ್ಥಳ",
    failed:
      "ಪ್ರವಾಸ ಯೋಜಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಸರ್ವರ್ ಚಾಲನೆಯಲ್ಲಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.",
    required: "ದಯವಿಟ್ಟು ಅಗತ್ಯವಿರುವ ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ.",
    noPlaces: "ಸ್ಥಳಗಳು ಸಿಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    itineraryUnavailable:
      "ದಿನವಾರು ಪ್ರವಾಸ ಯೋಜನೆಯನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಇತರ ವಿವರಗಳು ಲಭ್ಯವಿವೆ.",
    noItinerary:
      "ದಿನವಾರು ಪ್ರವಾಸ ಯೋಜನೆ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    morning: "ಬೆಳಗ್ಗೆ",
    afternoon: "ಮಧ್ಯಾಹ್ನ",
    evening: "ಸಂಜೆ",
    estimatedNote:
      "ಪ್ರಯಾಣದ ವೆಚ್ಚ ಮತ್ತು ಸಮಯ ಅಂದಾಜು ಮಾತ್ರ. ಪ್ರಯಾಣಿಸುವ ಮೊದಲು ಮಾರ್ಗ, ಸಮಯ ಮತ್ತು ಪ್ರವೇಶ ಶುಲ್ಕಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
  },
};

function extractDays(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.itinerary)) return data.itinerary;
  if (Array.isArray(data?.days)) return data.days;
  if (Array.isArray(data?.dayItinerary)) return data.dayItinerary;
  if (Array.isArray(data?.schedule)) return data.schedule;
  return [];
}

function getDayActivities(day) {
  if (Array.isArray(day)) return day;
  if (typeof day === "string") return [day];
  if (!day || typeof day !== "object") return [];

  const list =
    day.visits ??
    day.places ??
    day.destinations ??
    day.activities ??
    day.schedule ??
    day.stops;

  if (Array.isArray(list)) return list;

  const slots = [
    ["morning", day.morning],
    ["afternoon", day.afternoon],
    ["evening", day.evening],
  ];

  const activities = slots
    .filter(([, value]) => value)
    .map(([time, activity]) => ({ time, activity }));

  if (activities.length > 0) return activities;

  if (day.name || day.title || day.place) return [day];

  return [];
}

function App() {
  const [language, setLanguage] = useState("en");
  const [startingPlace, setStartingPlace] = useState("");
  const [district, setDistrict] = useState("");
  const [budget, setBudget] = useState("5000");
  const [days, setDays] = useState("2");
  const [people, setPeople] = useState("2");
  const [interest, setInterest] = useState("All places");

  const [places, setPlaces] = useState([]);
  const [hiddenPlaces, setHiddenPlaces] = useState([]);
  const [dayItinerary, setDayItinerary] = useState([]);
  const [itineraryError, setItineraryError] = useState("");
  const [expense, setExpense] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const t = translations[language];

  async function postJSON(endpoint, data) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || t.failed);
    }

    return result;
  }

  async function generateTrip(event) {
    event.preventDefault();

    setError("");
    setItineraryError("");
    setPlaces([]);
    setHiddenPlaces([]);
    setDayItinerary([]);
    setExpense(null);

    if (
      !startingPlace.trim() ||
      !district ||
      !budget ||
      !Number.isFinite(Number(budget)) ||
      Number(budget) <= 0 ||
      !days ||
      Number(days) < 1 ||
      Number(days) > 10 ||
      !people ||
      Number(people) < 1 ||
      Number(people) > 20
    ) {
      setError(t.required);
      return;
    }

    setLoading(true);

    try {
      // STEP 1: Discover tourist places and hidden gems.
      const placesData = await postJSON("/api/discover-places", {
        district,
        days: Number(days),
        people: Number(people),
        interest,
        language,
      });

      const selectedDistrict = placesData.district || district;

      const popular = Array.isArray(placesData.places)
        ? placesData.places.slice(0, 10)
        : [];

      const hidden = Array.isArray(placesData.hiddenPlaces)
        ? placesData.hiddenPlaces.slice(0, 5)
        : [];

      if (popular.length === 0 && hidden.length === 0) {
        throw new Error(t.noPlaces);
      }

      setPlaces(popular);
      setHiddenPlaces(hidden);

      // STEP 2: Create the day-by-day itinerary.
      try {
        const itineraryData = await postJSON("/api/day-itinerary", {
          startingPlace: startingPlace.trim(),
          district: selectedDistrict,
          days: Number(days),
          people: Number(people),
          interest,
          language,
          places: popular,
          hiddenPlaces: hidden,
        });

        const arrangedDays = extractDays(itineraryData);
        setDayItinerary(arrangedDays);

        if (arrangedDays.length === 0) {
          setItineraryError(t.noItinerary);
        }
      } catch (itineraryErr) {
        console.error("Day itinerary error:", itineraryErr);
        setItineraryError(
          `${t.itineraryUnavailable} ${itineraryErr.message || ""}`
        );
      }

      // STEP 3: Calculate expenses.
      const tripData = await postJSON("/api/plan-trip", {
        startingPlace: startingPlace.trim(),
        district: selectedDistrict,
        budget: Number(budget),
        days: Number(days),
        people: Number(people),
        interest,
        language,
        places: popular,
        hiddenPlaces: hidden,
      });

      // Preserve the response structure from the backend.
      setExpense(tripData);
      console.log("Trip expense response:", tripData);
    } catch (err) {
      console.error("Generate trip error:", err);
      setError(err.message || t.failed);
    } finally {
      setLoading(false);
    }
  }

  function getExpenseRows(breakdown) {
    if (!breakdown || typeof breakdown !== "object") return [];

    const fields = [
      { label: t.food, value: breakdown.food },
      {
        label: t.travel,
        value: breakdown.transport ?? breakdown.travel,
      },
      {
        label: t.room,
        value:
          breakdown.accommodation ??
          breakdown.roomRent ??
          breakdown.room,
      },
      {
        label: t.entry,
        value: breakdown.entryFees ?? breakdown.entry,
      },
      {
        label: t.other,
        value: breakdown.other ?? breakdown.otherExpenses,
      },
    ];

    return fields.filter(
      (item) =>
        item.value !== undefined &&
        item.value !== null &&
        Number.isFinite(Number(item.value))
    );
  }

  function formatMoney(value) {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      !Number.isFinite(Number(value))
    ) {
      return "Not available";
    }

    return `₹${Number(value).toLocaleString("en-IN")}`;
  }

  function getActivityName(activity) {
    if (typeof activity === "string") return activity;
    if (typeof activity === "number") return String(activity);
    if (!activity || typeof activity !== "object") {
      return "Visit destination";
    }

    return (
      activity.name ||
      activity.title ||
      activity.place ||
      activity.destination ||
      activity.activity ||
      activity.description ||
      "Visit destination"
    );
  }

  function getActivityLocation(activity) {
    if (activity && typeof activity === "object") {
      return activity.location || activity.address || "";
    }
    return "";
  }

  function getTimeLabel(activity) {
    if (!activity || typeof activity !== "object") return "";

    const time = String(
      activity.time || activity.period || ""
    ).toLowerCase();

    if (time === "morning") return t.morning;
    if (time === "afternoon") return t.afternoon;
    if (time === "evening") return t.evening;

    return time;
  }

  // The backend may return the costs in different response fields.
  const expenseDetails = expense
    ? (
        expense.expenses ||
        expense.expenseSummary ||
        expense.budgetBreakdown ||
        expense
      )
    : null;

  const expenseTotal = expenseDetails
    ? (
        expenseDetails.total ??
        expenseDetails.estimatedTotal ??
        expenseDetails.estimatedTotalCost ??
        expense.total ??
        expense.estimatedTotal ??
        expense.estimatedTotalCost
      )
    : undefined;

  const travelTips = Array.isArray(expense?.travelTips)
    ? expense.travelTips
    : Array.isArray(expenseDetails?.travelTips)
      ? expenseDetails.travelTips
      : [];

  const expenseSummary =
    expense?.summary || expenseDetails?.summary || "";

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">{t.nav}</div>
        <button
          type="button"
          className="language-button"
          onClick={() =>
            setLanguage(language === "en" ? "kn" : "en")
          }
        >
          {t.switchLanguage}
        </button>
      </nav>

      <header className="hero">
        <p className="hero-tagline">{t.tagline}</p>
        <h1>{t.heroTitle}</h1>
        <p>{t.heroDescription}</p>
      </header>

      <main className="planner">
        <div className="section-heading">
          <h2>{t.plannerTitle}</h2>
        </div>

        <form className="planner-form" onSubmit={generateTrip}>
          <label htmlFor="startingPlace">{t.startingPlace}</label>
          <input
            id="startingPlace"
            type="text"
            value={startingPlace}
            onChange={(event) => setStartingPlace(event.target.value)}
            placeholder={t.startingPlaceholder}
            required
          />

          <label htmlFor="district">{t.district}</label>
          <select
            id="district"
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
            required
          >
            <option value="">{t.districtPlaceholder}</option>
            {DISTRICTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label htmlFor="budget">{t.budget}</label>
          <input
            id="budget"
            type="number"
            min="1"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            required
          />

          <label htmlFor="days">{t.days}</label>
          <select
            id="days"
            value={days}
            onChange={(event) => setDays(event.target.value)}
            required
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((day) => (
              <option key={day} value={day}>
                {day} {day === 1 ? "day" : "days"}
              </option>
            ))}
          </select>

          <label htmlFor="people">{t.people}</label>
          <select
            id="people"
            value={people}
            onChange={(event) => setPeople(event.target.value)}
            required
          >
            {Array.from({ length: 20 }, (_, index) => index + 1).map(
              (count) => (
                <option key={count} value={count}>
                  {count} {count === 1 ? "person" : "people"}
                </option>
              )
            )}
          </select>

          <label htmlFor="interest">{t.interest}</label>
          <select
            id="interest"
            value={interest}
            onChange={(event) => setInterest(event.target.value)}
            required
          >
            {INTERESTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button
            className="generate-button"
            type="submit"
            disabled={loading}
          >
            {loading ? t.loading : t.generate}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        {(places.length > 0 || hiddenPlaces.length > 0) && (
          <section className="trip-result">
            <div className="section-heading">
              <h2>{district} — {t.placesTitle}</h2>
              <p>{places.length} places found</p>
            </div>

            <div className="places-grid">
              {places.map((place, index) => (
                <article
                  className="place-card"
                  key={`${place.name || place.title || "place"}-${index}`}
                >
                  <h3>
                    {index + 1}.{" "}
                    {place.name || place.title || "Tourist place"}
                  </h3>
                  {(place.description || place.details) && (
                    <p>{place.description || place.details}</p>
                  )}
                  {(place.location || place.address) && (
                    <p>
                      <strong>{t.location}:</strong>{" "}
                      {place.location || place.address}
                    </p>
                  )}
                </article>
              ))}
            </div>

            {hiddenPlaces.length > 0 && (
              <>
                <div className="section-heading">
                  <h2>{t.hiddenTitle} — {district}</h2>
                </div>
                <div className="places-grid">
                  {hiddenPlaces.map((place, index) => (
                    <article
                      className="place-card"
                      key={`${place.name || place.title || "hidden"}-${index}`}
                    >
                      <h3>
                        {place.name || place.title || "Hidden place"}
                      </h3>
                      {(place.description || place.details) && (
                        <p>{place.description || place.details}</p>
                      )}
                      {(place.location || place.address) && (
                        <p>
                          <strong>{t.location}:</strong>{" "}
                          {place.location || place.address}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {dayItinerary.length > 0 && (
          <section className="trip-result day-itinerary">
            <div className="section-heading">
              <h2>{t.itineraryTitle}</h2>
              <p>
                {days} {Number(days) === 1 ? "day" : "days"} · {district}
              </p>
            </div>

            <div className="places-grid">
              {dayItinerary.map((day, index) => {
                const activities = getDayActivities(day);
                const dayNumber =
                  day?.dayNumber ?? day?.day ?? day?.number ?? index + 1;
                const dayTitle =
                  day?.title || day?.theme || day?.heading || "";

                return (
                  <article className="place-card" key={`day-${index}`}>
                    <h3>
                      {t.day} {dayNumber}
                      {dayTitle ? ` — ${dayTitle}` : ""}
                    </h3>

                    {day?.description && <p>{day.description}</p>}

                    {activities.length > 0 ? (
                      <ul>
                        {activities.map((activity, activityIndex) => (
                          <li key={`activity-${index}-${activityIndex}`}>
                            {getTimeLabel(activity) && (
                              <strong>{getTimeLabel(activity)}: </strong>
                            )}
                            {getActivityName(activity)}
                            {getActivityLocation(activity) && (
                              <span> ({getActivityLocation(activity)})</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>{t.noItinerary}</p>
                    )}

                    {day?.notes && <p>{day.notes}</p>}
                  </article>
                );
              })}
            </div>
            <p>{t.estimatedNote}</p>
          </section>
        )}

        {itineraryError &&
          (places.length > 0 || hiddenPlaces.length > 0) && (
            <p className="error-message">{itineraryError}</p>
          )}

        {expense && (
          <section className="expense-breakdown">
            <div className="section-heading">
              <h2>{t.expenseTitle}</h2>
            </div>

            {expenseSummary && <p>{expenseSummary}</p>}

            <div className="expense-list">
              {getExpenseRows(expenseDetails).map((item) => (
                <div className="expense-row" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{formatMoney(item.value)}</strong>
                </div>
              ))}
            </div>

            <div className="expense-total">
              <span>{t.total}</span>
              <strong>{formatMoney(expenseTotal)}</strong>
            </div>

            <p>
              Estimated for {days} {Number(days) === 1 ? "day" : "days"} and{" "}
              {people} {Number(people) === 1 ? "person" : "people"}.
            </p>

            {travelTips.length > 0 && (
              <div className="travel-tips">
                <h3>{t.tips}</h3>
                <ul>
                  {travelTips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
