// ==========================================
// SSSA ADMIN PAGE SECURITY GUARD
// ==========================================

(async function () {

    console.log("SSSA Admin Security Guard starting...");


    // ==========================================
    // GET CURRENT SESSION
    // ==========================================

    const {
        data,
        error
    } =
    await supabaseClient.auth.getSession();


    // ==========================================
    // SESSION ERROR
    // ==========================================

    if (error) {

        console.error(
            "Session error:",
            error
        );

        redirectToLogin();

        return;
    }


    // ==========================================
    // NO LOGIN SESSION
    // ==========================================

    if (!data.session) {

        console.warn(
            "No authenticated session."
        );

        redirectToLogin();

        return;
    }


    const user =
        data.session.user;


    console.log(
        "Authenticated user:",
        user.id
    );


    // ==========================================
    // VERIFY ADMIN
    // ==========================================

    const {
        data: admin,
        error: adminError
    } =
    await supabaseClient
        .from("admin_users")
        .select("id, user_id")
        .eq(
            "user_id",
            user.id
        )
        .maybeSingle();


    // ==========================================
    // ADMIN CHECK ERROR
    // ==========================================

    if (adminError) {

        console.error(
            "Admin verification error:",
            adminError
        );

        await supabaseClient.auth.signOut();

        redirectToLogin();

        return;
    }


    // ==========================================
    // USER IS NOT ADMIN
    // ==========================================

    if (!admin) {

        console.warn(
            "Authenticated user is not an administrator."
        );

        await supabaseClient.auth.signOut();

        redirectToLogin();

        return;
    }


    // ==========================================
    // ADMIN VERIFIED
    // ==========================================

    console.log(
        "✅ SSSA administrator verified."
    );


    // ==========================================
    // PREVENT PAGE FROM BEING RESTORED
    // AFTER LOGOUT
    // ==========================================

    window.addEventListener(
        "pageshow",
        async function () {

            const {
                data
            } =
            await supabaseClient.auth
                .getSession();


            if (!data.session) {

                redirectToLogin();

            }

        }
    );


    // ==========================================
    // MONITOR AUTH STATE
    // ==========================================

    supabaseClient.auth.onAuthStateChange(
        function (event, session) {

            console.log(
                "Auth state:",
                event
            );


            if (
                event === "SIGNED_OUT" ||
                !session
            ) {

                redirectToLogin();

            }

        }
    );


})();


// ==========================================
// REDIRECT TO LOGIN
// ==========================================

function redirectToLogin() {

    const currentPage =
        window.location.pathname;


    if (
        currentPage.endsWith(
            "/login.html"
        )
    ) {

        return;
    }


    window.location.replace(
        "login.html"
    );

}