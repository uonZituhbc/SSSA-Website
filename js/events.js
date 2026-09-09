// ==========================================
// SSSA EVENTS MANAGEMENT
// ADMIN PANEL
// ==========================================

let events = [];
let editingEventId = null;
let editingEventPhotoUrl = "";

// ==========================================
// AUTHENTICATION & ADMIN CHECK
// ==========================================

async function checkAdminAccess() {
    try {
        const {
            data: { session },
            error: sessionError
        } = await supabaseClient.auth.getSession();

        if (sessionError) {
            console.error(sessionError);
            redirectToLogin();
            return false;
        }

        if (!session) {
            redirectToLogin();
            return false;
        }

        const { data: adminUser, error: adminError } =
            await supabaseClient
                .from("admin_users")
                .select("id")
                .eq("user_id", session.user.id)
                .maybeSingle();

        if (adminError) {
            console.error("Admin check error:", adminError);
            alert("Unable to verify administrator access.");
            redirectToLogin();
            return false;
        }

        if (!adminUser) {
            alert("You are not authorized to access this page.");
            await supabaseClient.auth.signOut();
            redirectToLogin();
            return false;
        }

        return true;

    } catch (error) {
        console.error("Authentication error:", error);
        redirectToLogin();
        return false;
    }
}


// ==========================================
// REDIRECT TO LOGIN
// ==========================================

function redirectToLogin() {
    window.location.href = "login.html";
}


// ==========================================
// SIDEBAR
// ==========================================

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    if (sidebar) {
        sidebar.classList.toggle("open");
    }

    if (overlay) {
        overlay.classList.toggle("open");
    }
}


function closeSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    if (sidebar) {
        sidebar.classList.remove("open");
    }

    if (overlay) {
        overlay.classList.remove("open");
    }
}


// ==========================================
// FORM
// ==========================================

function openForm() {

    editingEventId = null;
    editingEventPhotoUrl = "";

    const formTitle = document.getElementById("formTitle");

    if (formTitle) {
        formTitle.textContent = "Add New Event";
    }

    clearForm();

    const form = document.getElementById("eventForm");

    if (form) {
        form.classList.add("show");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function closeForm() {

    const form = document.getElementById("eventForm");

    if (form) {
        form.classList.remove("show");
    }

    editingEventId = null;
    editingEventPhotoUrl = "";

    clearForm();
}


function clearForm() {

    const title = document.getElementById("eventTitle");
    const date = document.getElementById("eventDate");
    const time = document.getElementById("eventTime");
    const venue = document.getElementById("eventVenue");
    const status = document.getElementById("eventStatus");
    const description = document.getElementById("eventDescription");
    const photo = document.getElementById("eventPhoto");
    const preview = document.getElementById("photoPreview");

    if (title) title.value = "";
    if (date) date.value = "";
    if (time) time.value = "";
    if (venue) venue.value = "";

    if (status) {
        status.value = "upcoming";
    }

    if (description) {
        description.value = "";
    }

    if (photo) {
        photo.value = "";
    }

    if (preview) {
        preview.src = "";
        preview.style.display = "none";
    }
}


// ==========================================
// PHOTO PREVIEW
// ==========================================

function previewPhoto(event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        event.target.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {

        const preview =
            document.getElementById("photoPreview");

        if (!preview) {
            return;
        }

        preview.src = e.target.result;
        preview.style.display = "block";
    };

    reader.readAsDataURL(file);
}


// ==========================================
// LOAD EVENTS
// ==========================================

async function loadEvents() {

    const grid =
        document.getElementById("eventsGrid");

    const empty =
        document.getElementById("emptyState");

    if (grid) {
        grid.innerHTML = `
            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:40px;
                color:#667085;
            ">
                Loading events...
            </div>
        `;
    }

    try {

        const { data, error } =
            await supabaseClient
                .from("events")
                .select(`
                    id,
                    title,
                    description,
                    event_date,
                    location,
                    cover_photo_url,
                    created_at,
                    updated_at
                `)
                .order("event_date", {
                    ascending: true
                })
                .order("created_at", {
                    ascending: true
                });

        if (error) {
            console.error("Load events error:", error);

            if (grid) {
                grid.innerHTML = "";
            }

            alert("Failed to load events.");
            return;
        }

        events = data || [];

        renderEvents();

    } catch (error) {

        console.error(error);

        if (grid) {
            grid.innerHTML = "";
        }

        alert("Something went wrong while loading events.");
    }
}


// ==========================================
// SAVE EVENT
// ==========================================

async function saveEvent() {

    const title =
        document
            .getElementById("eventTitle")
            .value
            .trim();

    const date =
        document
            .getElementById("eventDate")
            .value;

    const venue =
        document
            .getElementById("eventVenue")
            .value
            .trim();

    const description =
        document
            .getElementById("eventDescription")
            .value
            .trim();

    const photoInput =
        document.getElementById("eventPhoto");

    // ======================================
    // VALIDATION
    // ======================================

    if (!title || !date || !venue) {

        alert(
            "Please enter the event title, date and venue."
        );

        return;
    }

    const saveButton =
        document.querySelector(
            '#eventForm .btn-primary'
        );

    const originalButtonText =
        saveButton
            ? saveButton.textContent
            : "Save Event";

    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";
    }

    try {

        let photoUrl = editingEventPhotoUrl;

        // ==================================
        // UPLOAD NEW PHOTO
        // ==================================

        if (
            photoInput &&
            photoInput.files &&
            photoInput.files[0]
        ) {

            const file =
                photoInput.files[0];

            if (!file.type.startsWith("image/")) {
                throw new Error(
                    "Please select a valid image."
                );
            }

            const extension =
                file.name
                    .split(".")
                    .pop()
                    .toLowerCase();

            const fileName =
                `event-${Date.now()}-${crypto.randomUUID()}.${extension}`;

            const filePath =
                fileName;

            const {
                data: uploadData,
                error: uploadError
            } =
                await supabaseClient
                    .storage
                    .from("events")
                    .upload(
                        filePath,
                        file,
                        {
                            cacheControl: "3600",
                            upsert: false
                        }
                    );

            if (uploadError) {
                console.error(
                    "Photo upload error:",
                    uploadError
                );

                throw new Error(
                    "Event photo upload failed."
                );
            }

            const {
                data: publicUrlData
            } =
                supabaseClient
                    .storage
                    .from("events")
                    .getPublicUrl(
                        uploadData.path
                    );

            photoUrl =
                publicUrlData.publicUrl;
        }


        // ==================================
        // EVENT DATA
        // ==================================

        const eventData = {

            title: title,

            description:
                description || null,

            event_date:
                date,

            location:
                venue,

            cover_photo_url:
                photoUrl || null,

            updated_at:
                new Date().toISOString()
        };


        // ==================================
        // UPDATE EXISTING EVENT
        // ==================================

        if (editingEventId) {

            const {
                error
            } =
                await supabaseClient
                    .from("events")
                    .update(eventData)
                    .eq("id", editingEventId);

            if (error) {
                console.error(
                    "Update event error:",
                    error
                );

                throw new Error(
                    "Failed to update event."
                );
            }

            alert(
                "Event updated successfully."
            );

        }

        // ==================================
        // CREATE NEW EVENT
        // ==================================

        else {

            const {
                error
            } =
                await supabaseClient
                    .from("events")
                    .insert([
                        eventData
                    ]);

            if (error) {
                console.error(
                    "Create event error:",
                    error
                );

                throw new Error(
                    "Failed to create event."
                );
            }

            alert(
                "Event added successfully."
            );
        }


        // ==================================
        // REFRESH
        // ==================================

        closeForm();

        await loadEvents();

    } catch (error) {

        console.error(
            "Save event error:",
            error
        );

        alert(
            error.message ||
            "Unable to save event."
        );

    } finally {

        if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent =
                originalButtonText;
        }
    }
}


// ==========================================
// RENDER EVENTS
// ==========================================

function renderEvents() {

    const grid =
        document.getElementById("eventsGrid");

    const empty =
        document.getElementById("emptyState");

    if (!grid || !empty) {
        return;
    }

    grid.innerHTML = "";


    // ======================================
    // EMPTY
    // ======================================

    if (events.length === 0) {

        empty.style.display = "block";

        return;
    }

    empty.style.display = "none";


    // ======================================
    // DISPLAY
    // ======================================

    events.forEach(function(eventItem) {

        const card =
            document.createElement("div");

        card.className = "event-card";


        // ==================================
        // PHOTO
        // ==================================

        let photoHTML = "📅";

        if (eventItem.cover_photo_url) {

            photoHTML = `
                <img
                    src="${escapeHTML(
                        eventItem.cover_photo_url
                    )}"
                    alt="${escapeHTML(
                        eventItem.title
                    )}"
                >
            `;
        }


        // ==================================
        // STATUS
        // ==================================

        const eventDate =
            new Date(
                eventItem.event_date +
                "T00:00:00"
            );

        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );

        const isPast =
            eventDate < today;

        const statusText =
            isPast
                ? "Past Event"
                : "Upcoming";

        const statusClass =
            isPast
                ? "status-past"
                : "";


        // ==================================
        // CARD
        // ==================================

        card.innerHTML = `

            <div class="event-image">

                ${photoHTML}

                <span class="status-badge ${statusClass}">
                    ${statusText}
                </span>

            </div>

            <div class="event-info">

                <h3>
                    ${escapeHTML(
                        eventItem.title
                    )}
                </h3>

                <div class="event-detail">

                    📅

                    <span>
                        ${formatDate(
                            eventItem.event_date
                        )}
                    </span>

                </div>

                <div class="event-detail">

                    📍

                    <span>
                        ${escapeHTML(
                            eventItem.location ||
                            "Location TBA"
                        )}
                    </span>

                </div>

                <p class="event-description">

                    ${escapeHTML(
                        eventItem.description ||
                        "No description added."
                    )}

                </p>

                <div class="card-actions">

                    <button
                        class="btn edit-btn"
                        onclick="editEvent('${eventItem.id}')">

                        ✏️ Edit

                    </button>

                    <button
                        class="btn delete-btn"
                        onclick="deleteEvent('${eventItem.id}')">

                        🗑️ Delete

                    </button>

                </div>

            </div>
        `;

        grid.appendChild(card);
    });
}


// ==========================================
// EDIT EVENT
// ==========================================

function editEvent(id) {

    const eventItem =
        events.find(
            event => String(event.id) === String(id)
        );

    if (!eventItem) {
        alert("Event not found.");
        return;
    }

    editingEventId =
        eventItem.id;

    editingEventPhotoUrl =
        eventItem.cover_photo_url || "";


    document.getElementById(
        "formTitle"
    ).textContent =
        "Edit Event";


    document.getElementById(
        "eventTitle"
    ).value =
        eventItem.title || "";


    document.getElementById(
        "eventDate"
    ).value =
        eventItem.event_date || "";


    document.getElementById(
        "eventVenue"
    ).value =
        eventItem.location || "";


    document.getElementById(
        "eventDescription"
    ).value =
        eventItem.description || "";


    // Time/status are not stored
    // in the current events table.

    const preview =
        document.getElementById(
            "photoPreview"
        );

    if (
        preview &&
        eventItem.cover_photo_url
    ) {

        preview.src =
            eventItem.cover_photo_url;

        preview.style.display =
            "block";

    } else if (preview) {

        preview.src = "";

        preview.style.display =
            "none";
    }


    const form =
        document.getElementById(
            "eventForm"
        );

    if (form) {
        form.classList.add("show");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==========================================
// DELETE EVENT
// ==========================================

async function deleteEvent(id) {

    const eventItem =
        events.find(
            event => String(event.id) === String(id)
        );

    if (!eventItem) {
        alert("Event not found.");
        return;
    }


    const confirmed =
        confirm(
            `Delete "${eventItem.title}"?`
        );

    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("events")
                .delete()
                .eq("id", eventItem.id);


        if (error) {

            console.error(
                "Delete event error:",
                error
            );

            alert(
                "Failed to delete event."
            );

            return;
        }


        // Remove local copy

        events =
            events.filter(
                event =>
                    String(event.id) !==
                    String(id)
            );


        renderEvents();

        alert(
            "Event deleted successfully."
        );

    } catch (error) {

        console.error(error);

        alert(
            "Something went wrong while deleting the event."
        );
    }
}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateString) {

    if (!dateString) {
        return "Date TBA";
    }

    const date =
        new Date(
            dateString +
            "T00:00:00"
        );

    return date.toLocaleDateString(
        "en-KE",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        String(text ?? "");

    return div.innerHTML;
}


// ==========================================
// LOGOUT
// ==========================================

async function logout() {

    try {

        await supabaseClient.auth.signOut();

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    } finally {

        window.location.href =
            "login.html";
    }
}


// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const authorized =
            await checkAdminAccess();

        if (!authorized) {
            return;
        }

        await loadEvents();
    }
);