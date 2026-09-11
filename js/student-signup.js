/* ==========================================
   SSSA STUDENT ACCOUNT CREATION
   University of Eldoret
========================================== */


/* ==========================================
   ELEMENTS
========================================== */

const signupForm =
    document.getElementById("studentSignupForm");

const signupButton =
    document.getElementById("signupButton");

const signupMessage =
    document.getElementById("signupMessage");


/* ==========================================
   MESSAGE
========================================== */

function showSignupMessage(message, type) {

    if (!signupMessage) return;

    signupMessage.textContent =
        message;

    signupMessage.className =
        "signup-message " + type;

    signupMessage.style.display =
        "block";
}


/* ==========================================
   FORM SUBMISSION
========================================== */

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            /* ==============================
               CHECK SUPABASE
            ============================== */

            if (
                typeof supabaseClient ===
                "undefined"
            ) {

                showSignupMessage(
                    "Supabase connection is not available.",
                    "error"
                );

                return;
            }


            /* ==============================
               GET VALUES
            ============================== */

            const admissionNumber =
                document
                    .getElementById("admissionNumber")
                    .value
                    .trim();

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

            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;


            /* ==============================
               VALIDATION
            ============================== */

            if (
                !admissionNumber ||
                !email ||
                !password ||
                !confirmPassword
            ) {

                showSignupMessage(
                    "Please complete all fields.",
                    "error"
                );

                return;
            }


            if (password.length < 6) {

                showSignupMessage(
                    "Password must contain at least 6 characters.",
                    "error"
                );

                return;
            }


            if (password !== confirmPassword) {

                showSignupMessage(
                    "Passwords do not match.",
                    "error"
                );

                return;
            }


            /* ==============================
               BUTTON
            ============================== */

            signupButton.disabled =
                true;

            signupButton.textContent =
                "Checking Student Profile...";


            try {

                /* ==========================================
                   VERIFY STUDENT PROFILE
                   
                   We use the secure RPC instead of directly
                   reading student_profiles.

                   The RPC checks:
                   - admission number
                   - email
                   - profile is not already linked
                ========================================== */

                const {
                    data: verification,
                    error: verificationError
                } =
                    await supabaseClient.rpc(
                        "verify_student_for_signup",
                        {
                            p_admission_number:
                                admissionNumber,

                            p_email:
                                email
                        }
                    );


                if (verificationError) {

                    console.error(
                        "Student verification error:",
                        verificationError
                    );

                    throw verificationError;
                }


                /* ==============================
                   PROFILE NOT VALID
                ============================== */

                if (
                    !verification ||
                    verification.success !== true
                ) {

                    showSignupMessage(
                        "We could not verify your student profile. Make sure your admission number and email exactly match the profile you created.",
                        "error"
                    );

                    signupButton.disabled =
                        false;

                    signupButton.textContent =
                        "Create Account";

                    return;
                }


                /* ==============================
                   CREATE ACCOUNT
                ============================== */

                signupButton.textContent =
                    "Creating Account...";


                const {
                    data: authData,
                    error: authError
                } =
                    await supabaseClient.auth.signUp({

                        email:
                            email,

                        password:
                            password

                    });


                if (authError) {

                    throw authError;
                }


                if (!authData || !authData.user) {

                    throw new Error(
                        "The student account could not be created."
                    );
                }


                /* ==========================================
                   ACCOUNT CREATED
                   
                   The database trigger:
                   
                   on_auth_user_created_link_student
                   
                   automatically links:
                   
                   student_profiles.user_id
                         ↓
                   auth.users.id
                ========================================== */


                /* ==============================
                   EMAIL CONFIRMATION
                ============================== */

                if (
                    authData.session === null
                ) {

                    showSignupMessage(
                        "Account created successfully! Please check your email and click the verification link before logging in.",
                        "success"
                    );

                } else {

                    showSignupMessage(
                        "Account created successfully! You can now access your student profile.",
                        "success"
                    );

                }


                signupButton.textContent =
                    "Account Created";


                /* ==============================
                   REDIRECT TO LOGIN
                ============================== */

                setTimeout(function() {

                    window.location.href =
                        "student-login.html";

                }, 3500);


            } catch (error) {

                console.error(
                    "Student signup error:",
                    error
                );


                /* ==============================
                   FRIENDLY ERRORS
                ============================== */

                let message =
                    error.message ||
                    "Unable to create student account.";


                if (
                    message
                        .toLowerCase()
                        .includes("already registered")
                ) {

                    message =
                        "An account with this email already exists. Please login instead.";

                }


                showSignupMessage(
                    message,
                    "error"
                );


                signupButton.disabled =
                    false;

                signupButton.textContent =
                    "Create Account";

            }

        }
    );

}
