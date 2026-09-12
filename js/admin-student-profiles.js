/* ==========================================
   SSSA ADMIN — STUDENT PROFILES
   University of Eldoret
========================================== */


/* ==========================================
   GLOBAL DATA
========================================== */

let allStudents = [];
let filteredStudents = [];
let selectedStudent = null;


/* ==========================================
   COMPLETE DEPARTMENT & COURSE LIST
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
   DOM ELEMENTS
========================================== */

const studentTableBody =
    document.getElementById("studentsTableBody");

const searchInput =
    document.getElementById("searchInput");

const departmentFilter =
    document.getElementById("departmentFilter");

const courseFilter =
    document.getElementById("courseFilter");

const yearFilter =
    document.getElementById("yearFilter");

const tableCount =
    document.getElementById("tableCount");

const profileModal =
    document.getElementById("profileModal");

const profileModalBody =
    document.getElementById("profileModalBody");


/* ==========================================
   PAGE MESSAGE
========================================== */

function showPageMessage(message, type = "error") {

    let messageBox =
        document.getElementById("studentProfilesMessage");

    if (!messageBox) {

        messageBox =
            document.createElement("div");

        messageBox.id =
            "studentProfilesMessage";

        messageBox.style.padding =
            "14px";

        messageBox.style.margin =
            "20px 0";

        messageBox.style.borderRadius =
            "8px";

        messageBox.style.textAlign =
            "center";

        const main =
            document.querySelector("main");

        if (main) {
            main.prepend(messageBox);
        }
    }

    messageBox.textContent =
        message;

    messageBox.style.display =
        "block";

    if (type === "success") {

        messageBox.style.background =
            "#e8f5e9";

        messageBox.style.color =
            "#2e7d32";

    } else {

        messageBox.style.background =
            "#ffebee";

        messageBox.style.color =
            "#c62828";
    }
}


/* ==========================================
   HIDE MESSAGE
========================================== */

function hidePageMessage() {

    const messageBox =
        document.getElementById(
            "studentProfilesMessage"
        );

    if (messageBox) {
        messageBox.style.display = "none";
    }
}


/* ==========================================
   LOAD STUDENT PROFILES
========================================== */

async function loadStudentProfiles() {

    hidePageMessage();

    if (typeof supabaseClient === "undefined") {

        showPageMessage(
            "Supabase connection is not available."
        );

        return;
    }

    try {

        /* ==========================================
           CHECK ADMIN SESSION
        ========================================== */

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

            window.location.replace("login.html");

            return;
        }


        /* ==========================================
           LOAD ALL STUDENT PROFILES
        ========================================== */

        const {
            data,
            error
        } =
            await supabaseClient
                .from("student_profiles")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (error) {
            throw error;
        }

        allStudents = data || [];

        filteredStudents =
            [...allStudents];


        /* ==========================================
           UPDATE PAGE
        ========================================== */

        updateStatistics();

        populateDepartmentFilter();

        populateCourseFilter();

        renderStudents();

        updateTableCount();


        console.log(
            "✅ Student profiles loaded:",
            allStudents.length
        );

    } catch (error) {

        console.error(
            "Admin student profiles error:",
            error
        );

        showPageMessage(
            error.message ||
            "Unable to load student profiles."
        );

        if (tableCount) {
            tableCount.textContent =
                "Unable to load";
        }
    }
}


/* ==========================================
   UPDATE STATISTICS
========================================== */

function updateStatistics() {

    const total =
        allStudents.length;

    const mathematicsCS =
        allStudents.filter(
            student =>
                student.department ===
                "Mathematics & Computer Science"
        ).length;

    const biological =
        allStudents.filter(
            student =>
                student.department ===
                "Biological Sciences"
        ).length;

    const other =
        allStudents.filter(
            student =>
                student.department !==
                    "Mathematics & Computer Science" &&
                student.department !==
                    "Biological Sciences"
        ).length;


    setStatistic(
        "totalStudents",
        total
    );

    setStatistic(
        "mathStudents",
        mathematicsCS
    );

    setStatistic(
        "biologyStudents",
        biological
    );

    setStatistic(
        "otherStudents",
        other
    );
}


/* ==========================================
   SET STATISTIC
========================================== */

function setStatistic(
    elementId,
    value
) {

    const element =
        document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    }
}


/* ==========================================
   POPULATE DEPARTMENT FILTER
========================================== */

function populateDepartmentFilter() {

    if (!departmentFilter) return;

    const departments =
        Object.keys(studentCourses);

    departmentFilter.innerHTML =
        '<option value="">All Departments</option>';

    departments.forEach(
        function(department) {

            const option =
                document.createElement("option");

            option.value =
                department;

            option.textContent =
                department;

            departmentFilter.appendChild(
                option
            );
        }
    );
}


/* ==========================================
   POPULATE COURSE FILTER
========================================== */

function populateCourseFilter() {

    if (!courseFilter) return;

    const selectedDepartment =
        departmentFilter
            ? departmentFilter.value
            : "";


    courseFilter.innerHTML =
        '<option value="">All Courses</option>';


    let courses = [];


    /* ==========================================
       IF A DEPARTMENT IS SELECTED
    ========================================== */

    if (
        selectedDepartment &&
        studentCourses[selectedDepartment]
    ) {

        courses =
            studentCourses[selectedDepartment];

    } else {

        /* ==========================================
           SHOW ALL COURSES
        ========================================== */

        courses =
            Object.values(studentCourses)
                .flat();
    }


    courses.forEach(
        function(course) {

            const option =
                document.createElement("option");

            option.value =
                course;

            option.textContent =
                course;

            courseFilter.appendChild(
                option
            );
        }
    );
}


/* ==========================================
   APPLY FILTERS
========================================== */

function applyFilters() {

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const department =
        departmentFilter
            ? departmentFilter.value
            : "";


    const course =
        courseFilter
            ? courseFilter.value
            : "";


    const year =
        yearFilter
            ? yearFilter.value
            : "";


    filteredStudents =
        allStudents.filter(
            function(student) {

                const name =
                    (student.full_name || "")
                        .toLowerCase();

                const admission =
                    (student.admission_number || "")
                        .toLowerCase();

                const email =
                    (student.email || "")
                        .toLowerCase();

                const phone =
                    (student.phone_number || "")
                        .toLowerCase();


                const matchesSearch =
                    !search ||
                    name.includes(search) ||
                    admission.includes(search) ||
                    email.includes(search) ||
                    phone.includes(search);


                const matchesDepartment =
                    !department ||
                    student.department ===
                        department;


                const matchesCourse =
                    !course ||
                    student.course ===
                        course;


                const matchesYear =
                    !year ||
                    student.year_of_study ===
                        year;


                return (
                    matchesSearch &&
                    matchesDepartment &&
                    matchesCourse &&
                    matchesYear
                );
            }
        );


    renderStudents();

    updateTableCount();
}


/* ==========================================
   DEPARTMENT CHANGE
========================================== */

function handleDepartmentChange() {

    /*
       Rebuild the course list whenever
       the department changes.
    */

    populateCourseFilter();

    /*
       Reset selected course because the
       previous course may belong to another
       department.
    */

    if (courseFilter) {
        courseFilter.value = "";
    }

    applyFilters();
}


/* ==========================================
   UPDATE TABLE COUNT
========================================== */

function updateTableCount() {

    if (!tableCount) return;

    const count =
        filteredStudents.length;

    const total =
        allStudents.length;


    if (count === total) {

        tableCount.textContent =
            `${total} Student${total === 1 ? "" : "s"}`;

    } else {

        tableCount.textContent =
            `${count} of ${total} Students`;
    }
}


/* ==========================================
   RENDER STUDENTS TABLE
========================================== */

function renderStudents() {

    if (!studentTableBody) return;


    studentTableBody.innerHTML = "";


    if (
        filteredStudents.length === 0
    ) {

        studentTableBody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="
                        text-align:center;
                        padding:40px;
                        color:#777;
                    ">

                    <div style="
                        font-size:35px;
                        margin-bottom:10px;
                    ">
                        🎓
                    </div>

                    <strong>
                        No student profiles found
                    </strong>

                    <div style="
                        margin-top:6px;
                        font-size:14px;
                    ">
                        Try changing your search
                        or filters.
                    </div>

                </td>
            </tr>
        `;

        return;
    }


    filteredStudents.forEach(
        function(student) {

            const row =
                document.createElement("tr");


            const initial =
                getInitial(
                    student.full_name
                );


            const photo =
                student.profile_photo_url
                    ? `
                        <img
                            src="${escapeHtml(
                                student.profile_photo_url
                            )}"
                            alt="Student profile"
                            style="
                                width:42px;
                                height:42px;
                                border-radius:50%;
                                object-fit:cover;
                            "
                        >
                    `
                    : `
                        <div style="
                            width:42px;
                            height:42px;
                            border-radius:50%;
                            background:#064789;
                            color:white;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            font-weight:bold;
                        ">
                            ${escapeHtml(initial)}
                        </div>
                    `;


            row.innerHTML = `

                <td>

                    <div style="
                        display:flex;
                        align-items:center;
                        gap:10px;
                    ">

                        ${photo}

                        <div>

                            <strong>
                                ${escapeHtml(
                                    student.full_name ||
                                    "Unnamed Student"
                                )}
                            </strong>

                            <small style="
                                display:block;
                                color:#777;
                                margin-top:3px;
                            ">
                                ${escapeHtml(
                                    student.email || ""
                                )}
                            </small>

                        </div>

                    </div>

                </td>


                <td>
                    ${escapeHtml(
                        student.admission_number ||
                        "—"
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        student.department ||
                        "—"
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        student.course ||
                        "—"
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        student.year_of_study ||
                        "—"
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        student.phone_number ||
                        "—"
                    )}
                </td>


                <td>

                    <button
                        type="button"
                        class="view-student-btn"
                        data-id="${escapeHtml(
                            student.id
                        )}"
                        style="
                            background:#064789;
                            color:white;
                            border:none;
                            padding:8px 13px;
                            border-radius:6px;
                            cursor:pointer;
                            font-weight:bold;
                        "
                    >
                        View
                    </button>

                </td>

            `;


            studentTableBody.appendChild(row);

        }
    );


    /*
       Add View button events.
    */

    document
        .querySelectorAll(".view-student-btn")
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        const studentId =
                            this.dataset.id;


                        const student =
                            allStudents.find(
                                item =>
                                    String(item.id) ===
                                    String(studentId)
                            );


                        if (student) {

                            openStudentModal(
                                student
                            );
                        }
                    }
                );
            }
        );
}


/* ==========================================
   OPEN STUDENT PROFILE MODAL
========================================== */

function openStudentModal(student) {

    selectedStudent =
        student;


    if (!profileModal) return;


    const initial =
        getInitial(
            student.full_name
        );


    const photoHTML =
        student.profile_photo_url
            ? `
                <img
                    src="${escapeHtml(
                        student.profile_photo_url
                    )}"
                    alt="Student profile"
                    style="
                        width:110px;
                        height:110px;
                        border-radius:50%;
                        object-fit:cover;
                        display:block;
                        margin:0 auto 15px;
                        border:4px solid #064789;
                    "
                >
            `
            : `
                <div style="
                    width:110px;
                    height:110px;
                    border-radius:50%;
                    background:#064789;
                    color:white;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:42px;
                    font-weight:bold;
                    margin:0 auto 15px;
                ">
                    ${escapeHtml(initial)}
                </div>
            `;


    if (profileModalBody) {

        profileModalBody.innerHTML = `

            <div style="
                text-align:center;
                margin-bottom:25px;
            ">

                ${photoHTML}

                <h3 style="
                    margin:5px 0;
                    color:#064789;
                        ">
                    ${escapeHtml(
                        student.full_name ||
                        "Unnamed Student"
                    )}
                </h3>

                <p style="
                    margin:0;
                    color:#777;
                ">
                    Student Profile
                </p>

            </div>


            <div style="
                display:grid;
                grid-template-columns:
                    repeat(
                        auto-fit,
                        minmax(220px, 1fr)
                    );
                gap:15px;
            ">

                ${createProfileDetail(
                    "Admission Number",
                    student.admission_number
                )}

                ${createProfileDetail(
                    "Department",
                    student.department
                )}

                ${createProfileDetail(
                    "Course / Programme",
                    student.course
                )}

                ${createProfileDetail(
                    "Year of Study",
                    student.year_of_study
                )}

                ${createProfileDetail(
                    "Phone Number",
                    student.phone_number
                )}

                ${createProfileDetail(
                    "Email Address",
                    student.email
                )}

            </div>


            <div style="
                margin-top:25px;
                padding:14px;
                background:#f5f7fa;
                border-radius:8px;
                font-size:13px;
                color:#666;
                word-break:break-all;
            ">

                <strong>
                    Profile ID:
                </strong>

                ${escapeHtml(
                    student.id || "—"
                )}

            </div>

        `;
    }


    profileModal.style.display = "flex";
}


/* ==========================================
   PROFILE DETAIL
========================================== */

function createProfileDetail(
    label,
    value
) {

    return `

        <div style="
            padding:14px;
            background:#f8f9fa;
            border-radius:8px;
            border:1px solid #e5e7eb;
        ">

            <div style="
                font-size:12px;
                color:#777;
                margin-bottom:5px;
                font-weight:bold;
                text-transform:uppercase;
            ">
                ${escapeHtml(label)}
            </div>

            <div style="
                font-size:15px;
                color:#222;
                word-break:break-word;
            ">
                ${escapeHtml(value || "—")}
            </div>

        </div>

    `;
}


/* ==========================================
   CLOSE STUDENT PROFILE MODAL
========================================== */

function closeProfileModal() {

    if (profileModal) {

        profileModal.style.display =
            "none";
    }

    selectedStudent = null;
}


/* ==========================================
   MAKE CLOSE FUNCTION AVAILABLE TO HTML
========================================== */

window.closeProfileModal =
    closeProfileModal;


/* ==========================================
   INITIAL LETTER
========================================== */

function getInitial(name) {

    if (!name) return "S";

    return name
        .trim()
        .charAt(0)
        .toUpperCase();
}


/* ==========================================
   HTML ESCAPE
========================================== */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
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
   SEARCH
========================================== */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        applyFilters
    );
}


/* ==========================================
   DEPARTMENT FILTER
========================================== */

if (departmentFilter) {

    departmentFilter.addEventListener(
        "change",
        handleDepartmentChange
    );
}


/* ==========================================
   COURSE FILTER
========================================== */

if (courseFilter) {

    courseFilter.addEventListener(
        "change",
        applyFilters
    );
}


/* ==========================================
   YEAR FILTER
========================================== */

if (yearFilter) {

    yearFilter.addEventListener(
        "change",
        applyFilters
    );
}


/* ==========================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
========================================== */

if (profileModal) {

    profileModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                profileModal
            ) {

                closeProfileModal();
            }
        }
    );
}


/* ==========================================
   ESCAPE KEY
========================================== */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            closeProfileModal();
        }
    }
);


/* ==========================================
   START ADMIN STUDENT PROFILES
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadStudentProfiles();

    }
);