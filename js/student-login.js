/* ==========================================
   SSSA STUDENT LOGIN
   University of Eldoret
========================================== */

const loginForm =
    document.getElementById("studentLoginForm");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");


function showLoginMessage(message, type) {

    if (!loginMessage) return;

    loginMessage.textContent = message;

    loginMessage.className =
        "login-message " + type;

    loginMessage.style.display =
        "block";
}


/* =========================
   LOGIN
========================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            if (typeof supabaseClient === "undefined") {

                showLoginMessage(
                    "Supabase connection is not available.",
                    "error"
                );

                return;
            }


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim()
                    .toLowerCase();

            const password =
                document
                    .getElementById("password")
                    .value;


            if (!email || !password) {

                showLoginMessage(
                    "Please enter your email and password.",
                    "error"
                );

                return;
            }


            loginButton.disabled = true;

            loginButton.textContent =
                "Logging in...";


            try {

                /* =========================
                   SIGN IN
                ========================= */

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth.signInWithPassword({

                        email: email,

                        password: password

                    });


                if (error) {
                    throw error;
                }


                if (!data || !data.user) {

                    throw new Error(
                        "Login succeeded but no user account was returned."
                    );
                }


                /* =========================
                   VERIFY SESSION
                ========================= */

                const {
                    data: sessionData,
                    error: sessionError
                } =
                    await supabaseClient.auth.getSession();


                if (sessionError) {
                    throw sessionError;
                }


                if (
                    !sessionData ||
                    !sessionData.session
                ) {

                    throw new Error(
                        "Login succeeded, but the authentication session could not be established. Please try again."
                    );
                }


                console.log(
                    "Student authenticated:",
                    sessionData.session.user.id
                );


                showLoginMessage(
                    "Login successful! Opening your student profile...",
                    "success"
                );


                /* =========================
                   REDIRECT
                ========================= */

                window.location.replace(
                    "student-profile-view.html"
                );

            } catch (error) {

                console.error(
                    "Student login error:",
                    error
                );


                let message =
                    error.message ||
                    "Login failed. Please check your email and password.";


                if (
                    message
                        .toLowerCase()
                        .includes("invalid login credentials")
                ) {

                    message =
                        "Invalid login credentials. Please make sure you are using the exact email and password used when creating your student account.";

                }


                showLoginMessage(
                    message,
                    "error"
                );


                loginButton.disabled = false;

                loginButton.textContent =
                    "Login";
            }

        }
    );
}