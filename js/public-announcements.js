/* ==========================================
   PUBLIC ANNOUNCEMENTS
   SSSA | University of Eldoret
========================================== */

let announcements = [];


/* ==========================================
   LOAD PUBLISHED ANNOUNCEMENTS
========================================== */

async function loadAnnouncements() {

    const loading = document.getElementById("announcementLoading");
    const list = document.getElementById("announcementList");
    const empty = document.getElementById("announcementEmpty");
    const errorBox = document.getElementById("announcementError");

    try {

        loading.style.display = "block";
        list.style.display = "none";
        empty.style.display = "none";
        errorBox.style.display = "none";

        const { data, error } = await supabaseClient

            .from("announcements")

            .select(`
                id,
                title,
                content,
                published,
                created_at,
                updated_at
            `)

            .eq("published", true)

            .order("created_at", {
                ascending: false
            });


        if (error) {
            throw error;
        }


        announcements = data || [];


        loading.style.display = "none";


        if (announcements.length === 0) {

            empty.style.display = "block";

            return;
        }


        renderAnnouncements();


    } catch (error) {

        console.error(
            "Error loading announcements:",
            error
        );

        loading.style.display = "none";

        errorBox.textContent =
            "Unable to load announcements. Please try again later.";

        errorBox.style.display = "block";
    }
}


/* ==========================================
   RENDER ANNOUNCEMENTS
========================================== */

function renderAnnouncements() {

    const list =
        document.getElementById("announcementList");

    if (!list) return;


    list.innerHTML = "";


    announcements.forEach(announcement => {

        const card =
            document.createElement("article");

        card.className = "announcement-card";


        card.innerHTML = `

            <h2>
                ${escapeHTML(announcement.title)}
            </h2>

            <div class="announcement-date">
                ${formatDate(announcement.created_at)}
            </div>

            <div class="announcement-content">
                ${escapeHTML(announcement.content)}
            </div>

        `;


        list.appendChild(card);
    });


    list.style.display = "grid";
}


/* ==========================================
   FORMAT DATE
========================================== */

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(dateString);


    return date.toLocaleDateString(
        "en-KE",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ==========================================
   INITIALIZE
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadAnnouncements();

    }
);