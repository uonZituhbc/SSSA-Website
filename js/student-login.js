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

    loginMessage.textContent = message;

    loginMessage.className =
        "login-message " + type;

    loginMessage.style.display =
        "block";
}


loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        if (
            typeof supabaseClient ===
            "undefined"
        ) {

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


        loginButton.disabled = true;

        loginButton.textContent =
            "Logging in...";


        try {

            const { data, error } =
                await supabaseClient.auth.signInWithPassword({

                    email: email,

                    password: password

                });


            if (error) {
                throw error;
            }


            showLoginMessage(
                "Login successful! Redirecting...",
                "success"
            );


            console.log(
                "Student logged in:",
                data.user
            );


            setTimeout(function() {

                window.location.href =
                    "student-profile-view.html";

            }, 1200);


        } catch (error) {

            console.error(
                "Student login error:",
                error
            );


            showLoginMessage(
                error.message ||
                "Login failed. Please check your email and password.",
                "error"
            );


            loginButton.disabled = false;

            loginButton.textContent =
                "Login";
        }

    }
);