// ==========================================
// SSSA ADMIN DASHBOARD
// ==========================================


// ==========================================
// CHECK ADMIN SESSION
// ==========================================

async function checkAdminSession() {

    try {

        const {
            data: sessionData,
            error: sessionError
        } = await supabaseClient.auth.getSession();


        if (sessionError) {

            console.error(
                "Session error:",
                sessionError
            );

            window.location.href = "login.html";

            return;
        }


        // No logged-in user

        if (!sessionData.session) {

            window.location.href = "login.html";

            return;
        }


        const user =
            sessionData.session.user;


        console.log(
            "Logged-in user:",
            user.email
        );


        // ======================================
        // CHECK ADMIN USERS TABLE
        // ======================================

        const {
            data: admin,
            error: adminError
        } = await supabaseClient
            .from("admin_users")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();


        if (adminError) {

            console.error(
                "Admin verification error:",
                adminError
            );

            await supabaseClient.auth.signOut();

            window.location.href =
                "login.html";

            return;
        }


        if (!admin) {

            console.error(
                "User is not an administrator."
            );

            await supabaseClient.auth.signOut();

            window.location.href =
                "login.html";

            return;
        }


        console.log(
            "✅ Admin verified."
        );


        // ======================================
        // LOAD DASHBOARD
        // ======================================

        loadDashboardStatistics();

    } catch (error) {

        console.error(
            "Dashboard security error:",
            error
        );

        window.location.href =
            "login.html";
    }
}



// ==========================================
// LOAD DASHBOARD STATISTICS
// ==========================================

async function loadDashboardStatistics() {

    console.log(
        "Loading dashboard statistics..."
    );


    try {

        // ======================================
        // MEMBERS / REGISTRATIONS
        // ======================================

        const membersResult =
            await supabaseClient
                .from("registrations")
                .select("id", {
                    count: "exact",
                    head: true
                });


        if (membersResult.error) {

            console.error(
                "Members count error:",
                membersResult.error
            );

        }


        // ======================================
        // EVENTS
        // ======================================

        const eventsResult =
            await supabaseClient
                .from("events")
                .select("id", {
                    count: "exact",
                    head: true
                });


        if (eventsResult.error) {

            console.error(
                "Events count error:",
                eventsResult.error
            );

        }


        // ======================================
        // ANNOUNCEMENTS
        // ======================================

        const announcementsResult =
            await supabaseClient
                .from("announcements")
                .select("id", {
                    count: "exact",
                    head: true
                });


        if (announcementsResult.error) {

            console.error(
                "Announcements count error:",
                announcementsResult.error
            );

        }


        // ======================================
        // LEADERS
        // ======================================

        const leadersResult =
            await supabaseClient
                .from("leaders")
                .select("id", {
                    count: "exact",
                    head: true
                });


        if (leadersResult.error) {

            console.error(
                "Leaders count error:",
                leadersResult.error
            );

        }


        // ======================================
        // DISPLAY COUNTS
        // ======================================

        document.getElementById("membersCount")
            .textContent =
            membersResult.count ?? 0;


        document.getElementById("eventsCount")
            .textContent =
            eventsResult.count ?? 0;


        document.getElementById("announcementsCount")
            .textContent =
            announcementsResult.count ?? 0;


        document.getElementById("leadersCount")
            .textContent =
            leadersResult.count ?? 0;


        console.log(
            "✅ Dashboard statistics loaded:",
            {
                members: membersResult.count,
                events: eventsResult.count,
                announcements: announcementsResult.count,
                leaders: leadersResult.count
            }
        );


    } catch (error) {

        console.error(
            "❌ Dashboard statistics failed:",
            error
        );

    }

}



// ==========================================
// LOGOUT
// ==========================================

async function logout() {

    try {

        const {
            error
        } =
        await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                "Logout error:",
                error
            );

            return;
        }


        console.log(
            "✅ Admin logged out."
        );


        window.location.href =
            "login.html";


    } catch (error) {

        console.error(
            "Logout failed:",
            error
        );

    }

}



// ==========================================
// MOBILE SIDEBAR
// ==========================================

function toggleSidebar() {

    const sidebar =
        document.querySelector(".sidebar");

    if (sidebar) {

        sidebar.classList.toggle("active");

    }

}


function closeSidebar() {

    const sidebar =
        document.querySelector(".sidebar");

    if (sidebar) {

        sidebar.classList.remove("active");

    }

}



// ==========================================
// CLOSE MOBILE SIDEBAR WHEN LINK CLICKED
// ==========================================

document
    .querySelectorAll(".sidebar-nav a")
    .forEach(function(link) {

        link.addEventListener(
            "click",
            function() {

                if (window.innerWidth <= 800) {

                    closeSidebar();

                }

            }
        );

    });



// ==========================================
// START DASHBOARD
// ==========================================

checkAdminSession();