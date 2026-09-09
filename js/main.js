// ==========================================
// SSSA MAIN JAVASCRIPT
// ==========================================

// Mobile navigation
function toggleMenu() {
    const navLinks = document.querySelector(".nav-links");

    if (navLinks) {
        navLinks.classList.toggle("active");
    }
}


// Automatically update copyright year
const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


// Close mobile menu when a navigation link is clicked
document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        const navLinks = document.querySelector(".nav-links");

        if (navLinks) {
            navLinks.classList.remove("active");
        }
    });
});


/* ==========================================
   HOMEPAGE ANNOUNCEMENTS
========================================== */

async function loadHomeAnnouncements() {

    const container =
        document.getElementById("homeAnnouncements");

    if (!container) return;


    try {

        const { data, error } = await supabaseClient

            .from("announcements")

            .select(`
                id,
                title,
                content,
                published,
                created_at
            `)

            .eq("published", true)

            .order("created_at", {
                ascending: false
            })

            .limit(3);


        if (error) {
            throw error;
        }


        if (!data || data.length === 0) {

            container.innerHTML = `
                <p class="no-home-announcements">
                    No announcements available at the moment.
                </p>
            `;

            return;
        }


        container.innerHTML = "";


        data.forEach(announcement => {

            const card =
                document.createElement("article");

            card.className =
                "home-announcement-card";


            card.innerHTML = `

                <h3>
                    ${escapeHomeHTML(announcement.title)}
                </h3>

                <div class="home-announcement-date">
                    ${formatHomeAnnouncementDate(
                        announcement.created_at
                    )}
                </div>

                <div class="home-announcement-content">
                    ${escapeHomeHTML(announcement.content)}
                </div>

            `;


            container.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Error loading homepage announcements:",
            error
        );

        container.innerHTML = `
            <p class="home-announcement-error">
                Unable to load announcements.
            </p>
        `;
    }
}


/* ==========================================
   FORMAT ANNOUNCEMENT DATE
========================================== */

function formatHomeAnnouncementDate(dateString) {

    if (!dateString) return "";


    return new Date(dateString).toLocaleDateString(
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

function escapeHomeHTML(value) {

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
   LOAD HOMEPAGE DATA
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadHomeAnnouncements();

    }
);