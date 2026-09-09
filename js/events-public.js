// ==========================================
// SSSA PUBLIC EVENTS + GALLERY
// UNIVERSITY OF ELDORET
// ==========================================


// ==========================================
// LOAD EVENTS
// ==========================================

async function loadPublicEvents() {

    const upcomingContainer =
        document.getElementById("upcomingEvents");

    if (!upcomingContainer) {
        console.error("upcomingEvents container not found.");
        return;
    }

    upcomingContainer.innerHTML = `
        <p style="text-align:center; width:100%;">
            Loading SSSA events...
        </p>
    `;

    const { data, error } = await supabaseClient
        .from("events")
        .select(`
            id,
            title,
            description,
            event_date,
            location,
            cover_photo_url
        `)
        .order("event_date", {
            ascending: true
        });

    if (error) {

        console.error(
            "Error loading events:",
            error
        );

        upcomingContainer.innerHTML = `
            <p style="text-align:center; width:100%;">
                Unable to load events at the moment.
            </p>
        `;

        return;
    }

    if (!data || data.length === 0) {

        upcomingContainer.innerHTML = `
            <div style="text-align:center; width:100%; padding:40px 20px;">
                <h3>No upcoming events</h3>
                <p>
                    SSSA events will appear here when they are published.
                </p>
            </div>
        `;

        loadEventGallery([]);

        return;
    }

    upcomingContainer.innerHTML = "";

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const upcomingEvents = data.filter(event => {

        const eventDate = new Date(event.event_date);

        eventDate.setHours(0, 0, 0, 0);

        return eventDate >= today;

    });

    if (upcomingEvents.length === 0) {

        upcomingContainer.innerHTML = `
            <div style="text-align:center; width:100%; padding:40px 20px;">
                <h3>No upcoming events</h3>
                <p>
                    Check back later for new SSSA activities.
                </p>
            </div>
        `;

    } else {

        upcomingEvents.forEach(event => {

            const date = new Date(event.event_date);

            const day = String(
                date.getDate()
            ).padStart(2, "0");

            const month = date.toLocaleDateString(
                "en-US",
                {
                    month: "short"
                }
            );

            const formattedDate =
                date.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    }
                );

            const card =
                document.createElement("article");

            card.className = "event-card";

            card.innerHTML = `

                ${
                    event.cover_photo_url
                    ? `
                        <div class="event-image">
                            <img
                                src="${escapeHTML(event.cover_photo_url)}"
                                alt="${escapeHTML(event.title)}"
                                loading="lazy"
                            >
                        </div>
                    `
                    : ""
                }

                <div class="event-date">

                    <strong>
                        ${day}
                    </strong>

                    <span>
                        ${month}
                    </span>

                </div>

                <div class="event-content">

                    <span class="event-category">
                        SSSA EVENT
                    </span>

                    <h3>
                        ${escapeHTML(event.title)}
                    </h3>

                    <p>
                        ${
                            event.description
                            ? escapeHTML(event.description)
                            : "Join SSSA for this upcoming activity."
                        }
                    </p>

                    <div class="event-meta">

                        <span>
                            📅 ${formattedDate}
                        </span>

                        ${
                            event.location
                            ? `
                                <span>
                                    📍 ${escapeHTML(event.location)}
                                </span>
                            `
                            : ""
                        }

                    </div>

                </div>

            `;

            upcomingContainer.appendChild(card);

        });

    }

    // Load gallery using the same events
    loadEventGallery(data);
}


// ==========================================
// LOAD EVENT GALLERY
// ==========================================

function loadEventGallery(events) {

    const gallery =
        document.getElementById("eventGallery");

    if (!gallery) {
        console.error("eventGallery not found.");
        return;
    }

    gallery.innerHTML = "";

    // Only events that have photos
    const photos = events.filter(
        event =>
            event.cover_photo_url
    );

    if (photos.length === 0) {

        gallery.innerHTML = `

            <div class="gallery-placeholder">

                <span>📸</span>

                <p>
                    SSSA event photos will appear here.
                </p>

            </div>

        `;

        return;
    }

    photos.forEach(event => {

        const galleryItem =
            document.createElement("div");

        galleryItem.className =
            "gallery-item";

        galleryItem.innerHTML = `

            <img
                src="${escapeHTML(event.cover_photo_url)}"
                alt="${escapeHTML(event.title)}"
                loading="lazy"
            >

            <div class="gallery-caption">

                <strong>
                    ${escapeHTML(event.title)}
                </strong>

                <span>
                    SSSA Event
                </span>

            </div>

        `;

        gallery.appendChild(galleryItem);

    });
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    if (!value) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadPublicEvents();

    }
);