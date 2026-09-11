const profileResult = document.getElementById("profileResult");
const profileMessage = document.getElementById("profileMessage");
const loadingMessage = document.getElementById("loadingMessage");

const editProfileBtn = document.getElementById("editProfileBtn");
const editProfileForm = document.getElementById("editProfileForm");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const logoutBtn = document.getElementById("logoutBtn");

const editDepartment = document.getElementById("editDepartment");
const editCourse = document.getElementById("editCourse");

let currentProfile = null;


/* =========================
   COURSE LIST
========================= */

const studentCourses = {

    "Mathematics & Computer Science": [
        "Mathematics",
        "Actuarial Science",
        "Applied Statistics with Computing",
        "Computer Science",
        "Information Technology",
        "Informatics"
    ],

    "Biological Sciences": [
        "Botany",
        "Zoology",
        "Microbiology",
        "Biotechnology and Biosafety",
        "Applied Animal Laboratory Science",
        "Entomology and Parasitology",
        "Ethnobotany"
    ],

    "Chemistry & Biochemistry": [
        "Chemistry",
        "Biochemistry",
        "Analytical Chemistry with Computing"
    ],

    "Physics": [
        "Physics"
    ]
};


/* =========================
   MESSAGE
========================= */

function showMessage(message, type) {

    if (!profileMessage) return;

    profileMessage.textContent = message;

    profileMessage.className =
        "profile-message " + type;

    profileMessage.style.display = "block";
}


function hideMessage() {

    if (!profileMessage) return;

    profileMessage.style.display = "none";
}


/* =========================
   LOAD COURSES
========================= */

function loadCourses(department, selectedCourse = "") {

    if (!editCourse) return;

    editCourse.innerHTML =
        '<option value="">Select Course</option>';

    const courses = studentCourses[department] || [];

    courses.forEach(function(course) {

        const option =
            document.createElement("option");

        option.value = course;
        option.textContent = course;

        if (course === selectedCourse) {
            option.selected = true;
        }

        editCourse.appendChild(option);
    });
}


/* =========================
   DISPLAY PROFILE
========================= */

function displayProfile(data) {

    currentProfile = data;

    document.getElementById("studentName").textContent =
        data.full_name;

    document.getElementById("studentAdmission").textContent =
        data.admission_number;

    document.getElementById("detailName").textContent =
        data.full_name;

    document.getElementById("detailAdmission").textContent =
        data.admission_number;

    document.getElementById("detailDepartment").textContent =
        data.department;

    document.getElementById("detailCourse").textContent =
        data.course;

    document.getElementById("detailYear").textContent =
        data.year_of_study;

    document.getElementById("detailPhone").textContent =
        data.phone_number;

    document.getElementById("detailEmail").textContent =
        data.email;


    /* PROFILE PHOTO */

    const photo =
        document.getElementById("profilePhoto");

    const placeholder =
        document.getElementById("photoPlaceholder");

    if (data.profile_photo_url) {

        photo.src = data.profile_photo_url;

        photo.style.display = "block";

        placeholder.style.display = "none";

    } else {

        photo.style.display = "none";

        placeholder.style.display = "flex";

        const firstLetter =
            data.full_name
                ? data.full_name.charAt(0).toUpperCase()
                : "S";

        placeholder.textContent = firstLetter;
    }


    /* EDIT FORM */

    document.getElementById("editFullName").value =
        data.full_name || "";

    document.getElementById("editPhone").value =
        data.phone_number || "";

    editDepartment.value =
        data.department || "";

    loadCourses(
        data.department,
        data.course
    );

    document.getElementById("editYear").value =
        data.year_of_study || "";


    profileResult.style.display = "block";

    if (loadingMessage) {
        loadingMessage.style.display = "none";
    }
}


/* =========================
   LOAD MY PROFILE
========================= */

async function loadMyProfile() {

    hideMessage();

    if (typeof supabaseClient === "undefined") {

        showMessage(
            "Supabase connection is not available.",
            "error"
        );

        return;
    }


    try {

        const {
            data: { user },
            error: authError
        } = await supabaseClient.auth.getUser();


        if (authError) {
            throw authError;
        }


        /* NOT LOGGED IN */

        if (!user) {

            showMessage(
                "You must be logged in to view your student profile.",
                "error"
            );

            setTimeout(function() {

                window.location.href =
                    "student-login.html";

            }, 1500);

            return;
        }


        /* GET ONLY THE LOGGED-IN STUDENT */

        const {
            data,
            error
        } = await supabaseClient
            .from("student_profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();


        if (error) {
            throw error;
        }


        if (!data) {

            if (loadingMessage) {
                loadingMessage.style.display = "none";
            }

            showMessage(
                "Your student profile could not be found. Please contact SSSA administration.",
                "error"
            );

            return;
        }


        displayProfile(data);


        showMessage(
            "Your student profile loaded successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Student profile loading error:",
            error
        );

        if (loadingMessage) {
            loadingMessage.style.display = "none";
        }

        showMessage(
            error.message ||
            "Unable to load your student profile.",
            "error"
        );
    }
}


/* =========================
   EDIT PROFILE
========================= */

if (editProfileBtn) {

    editProfileBtn.addEventListener(
        "click",
        function() {

            editProfileForm.style.display =
                "block";

            editProfileBtn.style.display =
                "none";

            editProfileForm.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    );
}


/* =========================
   CANCEL EDIT
========================= */

if (cancelEditBtn) {

    cancelEditBtn.addEventListener(
        "click",
        function() {

            editProfileForm.style.display =
                "none";

            editProfileBtn.style.display =
                "inline-block";

            if (currentProfile) {
                displayProfile(currentProfile);
            }
        }
    );
}


/* =========================
   DEPARTMENT → COURSE
========================= */

if (editDepartment) {

    editDepartment.addEventListener(
        "change",
        function() {

            loadCourses(
                editDepartment.value
            );
        }
    );
}


/* =========================
   SAVE PROFILE
========================= */

if (editProfileForm) {

    editProfileForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            try {

                const {
                    data: { user },
                    error: authError
                } = await supabaseClient.auth.getUser();


                if (authError) {
                    throw authError;
                }


                if (!user) {

                    showMessage(
                        "Your session has expired. Please login again.",
                        "error"
                    );

                    return;
                }


                const fullName =
                    document
                        .getElementById("editFullName")
                        .value
                        .trim();

                const phone =
                    document
                        .getElementById("editPhone")
                        .value
                        .trim();

                const department =
                    editDepartment.value;

                const course =
                    editCourse.value;

                const year =
                    document
                        .getElementById("editYear")
                        .value;


                if (
                    !fullName ||
                    !phone ||
                    !department ||
                    !course ||
                    !year
                ) {

                    showMessage(
                        "Please complete all editable fields.",
                        "error"
                    );

                    return;
                }


                const saveButton =
                    editProfileForm.querySelector(
                        ".save-btn"
                    );

                saveButton.disabled = true;

                saveButton.textContent =
                    "Saving...";


                const {
                    data,
                    error
                } = await supabaseClient
                    .from("student_profiles")
                    .update({

                        full_name: fullName,

                        phone_number: phone,

                        department: department,

                        course: course,

                        year_of_study: year,

                        updated_at:
                            new Date().toISOString()

                    })
                    .eq("user_id", user.id)
                    .select()
                    .single();


                if (error) {
                    throw error;
                }


                currentProfile = data;

                displayProfile(data);


                editProfileForm.style.display =
                    "none";

                editProfileBtn.style.display =
                    "inline-block";


                showMessage(
                    "Your student profile has been updated successfully.",
                    "success"
                );


                saveButton.disabled = false;

                saveButton.textContent =
                    "💾 Save Changes";

            } catch (error) {

                console.error(
                    "Profile update error:",
                    error
                );

                showMessage(
                    error.message ||
                    "Unable to update your profile.",
                    "error"
                );

                const saveButton =
                    editProfileForm.querySelector(
                        ".save-btn"
                    );

                saveButton.disabled = false;

                saveButton.textContent =
                    "💾 Save Changes";
            }
        }
    );
}


/* =========================
   LOGOUT
========================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function() {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );

            if (!confirmed) return;


            try {

                const {
                    error
                } =
                    await supabaseClient.auth.signOut();


                if (error) {
                    throw error;
                }


                window.location.href =
                    "student-login.html";

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                showMessage(
                    "Unable to logout. Please try again.",
                    "error"
                );
            }
        }
    );
}


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    loadMyProfile
);