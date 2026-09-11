/* ==========================================
   SSSA STUDENT PROFILE SYSTEM
   University of Eldoret
========================================== */

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


/* ==========================================
   ELEMENTS
========================================== */

const profileForm =
    document.getElementById("studentProfileForm");

const departmentSelect =
    document.getElementById("department");

const courseSelect =
    document.getElementById("course");

const profilePhoto =
    document.getElementById("profilePhoto");

const profilePreview =
    document.getElementById("profilePreview");

const submitButton =
    document.getElementById("submitProfileBtn");

const profileMessage =
    document.getElementById("profileMessage");


/* ==========================================
   DEPARTMENT → COURSE
========================================== */

if (departmentSelect) {

    departmentSelect.addEventListener(
        "change",
        function () {

            const department =
                this.value;

            courseSelect.innerHTML =
                '<option value="">Select Course / Programme</option>';

            courseSelect.disabled = true;

            if (!department) {

                courseSelect.innerHTML =
                    '<option value="">Select Department First</option>';

                return;
            }

            const courses =
                studentCourses[department];

            if (!courses) return;

            courses.forEach(function (course) {

                const option =
                    document.createElement("option");

                option.value =
                    course;

                option.textContent =
                    course;

                courseSelect.appendChild(option);

            });

            courseSelect.disabled = false;

        }
    );

}


/* ==========================================
   PROFILE PHOTO PREVIEW
========================================== */

if (profilePhoto) {

    profilePhoto.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];

            if (!file) return;


            /* ==============================
               FILE TYPE
            ============================== */

            if (!file.type.startsWith("image/")) {

                showMessage(
                    "Please select a valid image file.",
                    "error"
                );

                this.value = "";

                return;
            }


            /* ==============================
               FILE SIZE
               Maximum = 2MB
            ============================== */

            const maxSize =
                2 * 1024 * 1024;

            if (file.size > maxSize) {

                showMessage(
                    "Profile photo must be smaller than 2MB.",
                    "error"
                );

                this.value = "";

                return;
            }


            /* ==============================
               PREVIEW
            ============================== */

            const reader =
                new FileReader();

            reader.onload =
                function (event) {

                    profilePreview.src =
                        event.target.result;

                    profilePreview.style.display =
                        "block";

                };

            reader.readAsDataURL(file);

        }
    );

}


/* ==========================================
   MESSAGE FUNCTION
========================================== */

function showMessage(message, type) {

    if (!profileMessage) return;

    profileMessage.textContent =
        message;

    profileMessage.className =
        "profile-message " + type;

    profileMessage.style.display =
        "block";
}


/* ==========================================
   PHONE VALIDATION
========================================== */

function validatePhone(phone) {

    const cleanedPhone =
        phone.replace(/\s+/g, "");

    const kenyaPhonePattern =
        /^(07|01)\d{8}$/;

    return kenyaPhonePattern.test(
        cleanedPhone
    );
}


/* ==========================================
   CREATE STUDENT PROFILE
========================================== */

if (profileForm) {

    profileForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* ==============================
               CHECK SUPABASE
            ============================== */

            if (
                typeof supabaseClient ===
                "undefined"
            ) {

                showMessage(
                    "Database connection is not available. Please check the Supabase connection.",
                    "error"
                );

                return;
            }


            /* ==============================
               GET FORM DATA
            ============================== */

            const fullName =
                document
                    .getElementById("fullName")
                    .value
                    .trim();

            const admissionNumber =
                document
                    .getElementById("admissionNumber")
                    .value
                    .trim();

            const department =
                departmentSelect.value;

            const course =
                courseSelect.value;

            const yearOfStudy =
                document
                    .getElementById("yearOfStudy")
                    .value;

            const phoneNumber =
                document
                    .getElementById("phoneNumber")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim()
                    .toLowerCase();


            /* ==============================
               REQUIRED FIELD VALIDATION
            ============================== */

            if (
                !fullName ||
                !admissionNumber ||
                !department ||
                !course ||
                !yearOfStudy ||
                !phoneNumber ||
                !email
            ) {

                showMessage(
                    "Please complete all required fields.",
                    "error"
                );

                return;
            }


            /* ==============================
               PHONE VALIDATION
            ============================== */

            if (!validatePhone(phoneNumber)) {

                showMessage(
                    "Please enter a valid Kenyan phone number, e.g. 0712345678.",
                    "error"
                );

                return;
            }


            /* ==============================
               EMAIL VALIDATION
            ============================== */

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {

                showMessage(
                    "Please enter a valid email address.",
                    "error"
                );

                return;
            }


            /* ==============================
               BUTTON LOADING
            ============================== */

            submitButton.disabled =
                true;

            submitButton.textContent =
                "Saving Profile...";


            try {

                /* ==============================
                   PROFILE PHOTO
                ============================== */

                let profilePhotoURL = null;


                if (
                    profilePhoto &&
                    profilePhoto.files.length > 0
                ) {

                    const file =
                        profilePhoto.files[0];


                    /* ==============================
                       FILE EXTENSION
                    ============================== */

                    const fileExtension =
                        file.name
                            .split(".")
                            .pop()
                            .toLowerCase();


                    /* ==============================
                       SAFE ADMISSION NUMBER
                    ============================== */

                    const safeAdmission =
                        admissionNumber.replace(
                            /[^a-zA-Z0-9_-]/g,
                            ""
                        );


                    /* ==============================
                       UNIQUE FILE NAME
                    ============================== */

                    const fileName =
                        safeAdmission +
                        "_" +
                        Date.now() +
                        "." +
                        fileExtension;


                    const filePath =
                        "profiles/" +
                        fileName;


                    /* ==============================
                       UPLOAD PHOTO
                    ============================== */

                    submitButton.textContent =
                        "Uploading Photo...";


                    const {
                        data: uploadData,
                        error: uploadError
                    } =
                        await supabaseClient
                            .storage
                            .from(
                                "student-profiles"
                            )
                            .upload(
                                filePath,
                                file,
                                {
                                    cacheControl:
                                        "3600",

                                    contentType:
                                        file.type,

                                    upsert:
                                        false
                                }
                            );


                    if (uploadError) {

                        console.error(
                            "Photo upload error:",
                            uploadError
                        );

                        throw new Error(
                            "Profile photo upload failed: " +
                            uploadError.message
                        );
                    }


                    console.log(
                        "Photo uploaded:",
                        uploadData
                    );


                    /* ==============================
                       GET PUBLIC PHOTO URL
                    ============================== */

                    const {
                        data: publicUrlData
                    } =
                        supabaseClient
                            .storage
                            .from(
                                "student-profiles"
                            )
                            .getPublicUrl(
                                filePath
                            );


                    profilePhotoURL =
                        publicUrlData.publicUrl;


                    console.log(
                        "Profile photo URL:",
                        profilePhotoURL
                    );

                }


                /* ==============================
                   SAVE PROFILE
                   
                   IMPORTANT:
                   
                   We intentionally DO NOT use
                   .select() after insert.

                   The visitor is allowed to
                   INSERT a new profile but is
                   NOT allowed to SELECT profiles.

                   user_id remains NULL.

                   The Auth trigger will later
                   connect this profile to the
                   student's Auth account.
                ============================== */

                submitButton.textContent =
                    "Saving Profile...";


                const {
                    error: insertError
                } =
                    await supabaseClient
                        .from(
                            "student_profiles"
                        )
                        .insert({

                            full_name:
                                fullName,

                            admission_number:
                                admissionNumber,

                            department:
                                department,

                            course:
                                course,

                            year_of_study:
                                yearOfStudy,

                            phone_number:
                                phoneNumber,

                            email:
                                email,

                            profile_photo_url:
                                profilePhotoURL

                        });


                if (insertError) {

                    console.error(
                        "Profile database error:",
                        insertError
                    );

                    throw insertError;
                }


                /* ==============================
                   SUCCESS
                ============================== */

                showMessage(
                    "Profile created successfully! Redirecting you to create your student account...",
                    "success"
                );


                submitButton.textContent =
                    "Profile Created";


                /* ==============================
                   REDIRECT TO ACCOUNT CREATION
                ============================== */

                setTimeout(function () {

                    window.location.href =
                        "student-signup.html";

                }, 2000);

            } catch (error) {

                console.error(
                    "Student profile error:",
                    error
                );


                /* ==============================
                   DUPLICATE ADMISSION NUMBER
                ============================== */

                if (
                    error.code === "23505"
                ) {

                    showMessage(
                        "A student profile with this admission number already exists.",
                        "error"
                    );

                } else {

                    showMessage(
                        error.message ||
                        "Something went wrong while saving your profile.",
                        "error"
                    );

                }


                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Create My Profile";

            }

        }
    );

}