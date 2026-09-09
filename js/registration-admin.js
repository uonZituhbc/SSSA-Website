/* ==========================================
   SSSA ADMIN REGISTRATIONS
   University of Eldoret
========================================== */


/* ==========================================
   CHECK ADMIN SESSION
========================================== */

async function checkAdminSession() {

    try {

        const {
            data: sessionData,
            error: sessionError
        } = await supabaseClient.auth.getSession();


        if (sessionError || !sessionData.session) {

            window.location.href = "login.html";

            return;

        }


        const user = sessionData.session.user;


        /* ======================================
           VERIFY ADMIN USER
        ====================================== */

        const {
            data: admin,
            error: adminError
        } = await supabaseClient
            .from("admin_users")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();


        if (adminError || !admin) {

            await supabaseClient.auth.signOut();

            window.location.href = "login.html";

            return;

        }


        console.log("✅ Admin verified:", user.email);


        /* ======================================
           LOAD REGISTRATIONS
        ====================================== */

        loadRegistrations();


    } catch (error) {

        console.error(
            "Admin session error:",
            error
        );

        window.location.href = "login.html";

    }

}



/* ==========================================
   LOAD REGISTRATIONS FROM SUPABASE
========================================== */

async function loadRegistrations() {

    const table =
        document.getElementById("registrationTable");


    if (!table) {
        return;
    }


    table.innerHTML = `
        <tr>
            <td colspan="9" class="empty">
                <div class="empty-icon">⏳</div>
                Loading registrations...
            </td>
        </tr>
    `;


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("registrations")
            .select(`
                id,
                full_name,
                registration_number,
                course,
                year_of_study,
                phone_number,
                email,
                membership_fee,
                payment_status,
                payment_reference,
                registration_reference,
                created_at,
                updated_at
            `)
            .order("created_at", {
                ascending: false
            });


        if (error) {

            throw error;

        }


        window.allRegistrations = data || [];


        updateStats();

        renderRegistrations();


    } catch (error) {

        console.error(
            "Error loading registrations:",
            error
        );


        table.innerHTML = `
            <tr>
                <td colspan="9" class="empty">

                    <div class="empty-icon">
                        ⚠️
                    </div>

                    <strong>
                        Unable to load registrations
                    </strong>

                    <p>
                        Please check your database connection
                        and try again.
                    </p>

                </td>
            </tr>
        `;

    }

}



/* ==========================================
   UPDATE STATISTICS
========================================== */

function updateStats() {

    const registrations =
        window.allRegistrations || [];


    const paid =
        registrations.filter(
            registration =>
                String(
                    registration.payment_status || ""
                ).toLowerCase() === "paid"
        ).length;


    const pending =
        registrations.length - paid;


    document.getElementById(
        "totalRegistrations"
    ).textContent =
        registrations.length;


    document.getElementById(
        "paidRegistrations"
    ).textContent =
        paid;


    document.getElementById(
        "pendingRegistrations"
    ).textContent =
        pending;

}



/* ==========================================
   RENDER REGISTRATIONS
========================================== */

function renderRegistrations() {

    const registrations =
        window.allRegistrations || [];


    const searchInput =
        document.getElementById("searchInput");


    const yearFilter =
        document.getElementById("yearFilter");


    const statusFilter =
        document.getElementById("statusFilter");


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const year =
        yearFilter
            ? yearFilter.value
            : "";


    const status =
        statusFilter
            ? statusFilter.value
            : "";


    const filtered =
        registrations.filter(
            registration => {


                /* =========================
                   SEARCH
                ========================= */

                const searchableText = `

                    ${registration.full_name || ""}

                    ${registration.registration_number || ""}

                    ${registration.email || ""}

                    ${registration.phone_number || ""}

                    ${registration.course || ""}

                    ${registration.year_of_study || ""}

                    ${registration.payment_reference || ""}

                    ${registration.registration_reference || ""}

                `.toLowerCase();


                const matchesSearch =
                    !search ||
                    searchableText.includes(search);



                /* =========================
                   YEAR FILTER
                ========================= */

                const matchesYear =
                    !year ||
                    registration.year_of_study === year;



                /* =========================
                   PAYMENT FILTER
                ========================= */

                const registrationStatus =
                    String(
                        registration.payment_status || "Pending"
                    ).toLowerCase() === "paid"
                        ? "Paid"
                        : "Pending";


                const matchesStatus =
                    !status ||
                    registrationStatus === status;


                return (
                    matchesSearch &&
                    matchesYear &&
                    matchesStatus
                );

            }
        );


    displayRegistrations(filtered);

}



/* ==========================================
   DISPLAY TABLE
========================================== */

function displayRegistrations(registrations) {

    const table =
        document.getElementById(
            "registrationTable"
        );


    const resultCount =
        document.getElementById(
            "resultCount"
        );


    if (!table) {
        return;
    }


    if (resultCount) {

        resultCount.textContent =
            `${registrations.length} ${
                registrations.length === 1
                    ? "registration"
                    : "registrations"
            }`;

    }


    if (registrations.length === 0) {

        table.innerHTML = `
            <tr>

                <td
                    colspan="9"
                    class="empty"
                >

                    <div class="empty-icon">
                        📝
                    </div>

                    <p>
                        No registrations found.
                    </p>

                </td>

            </tr>
        `;

        return;

    }


    table.innerHTML = "";


    registrations.forEach(
        (registration, index) => {


            const row =
                document.createElement("tr");


            const paymentStatus =
                String(
                    registration.payment_status ||
                    "Pending"
                ).toLowerCase() === "paid"
                    ? "Paid"
                    : "Pending";


            const statusClass =
                paymentStatus === "Paid"
                    ? "status-paid"
                    : "status-pending";


            const safeName =
                escapeHTML(
                    registration.full_name ||
                    "Unknown"
                );


            const safeAdmission =
                escapeHTML(
                    registration.registration_number ||
                    "-"
                );


            const safeEmail =
                escapeHTML(
                    registration.email ||
                    "-"
                );


            const safePhone =
                escapeHTML(
                    registration.phone_number ||
                    "-"
                );


            const safeCourse =
                escapeHTML(
                    registration.course ||
                    "-"
                );


            const safeYear =
                escapeHTML(
                    registration.year_of_study ||
                    "-"
                );


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>


                <td>
                    <strong>
                        ${safeName}
                    </strong>
                </td>


                <td>
                    ${safeAdmission}
                </td>


                <td>
                    ${safeEmail}
                </td>


                <td>
                    ${safePhone}
                </td>


                <td>
                    ${safeCourse}
                </td>


                <td>
                    ${safeYear}
                </td>


                <td>

                    <span
                        class="status ${statusClass}"
                    >
                        ${paymentStatus}
                    </span>

                </td>


                <td>

                    <div class="actions">

                        ${
                            paymentStatus === "Paid"

                            ? `
                                <button
                                    class="btn btn-pending"
                                    onclick="updatePaymentStatus(
                                        '${registration.id}',
                                        'Pending'
                                    )"
                                >
                                    Mark Pending
                                </button>
                              `

                            : `
                                <button
                                    class="btn btn-paid"
                                    onclick="updatePaymentStatus(
                                        '${registration.id}',
                                        'Paid'
                                    )"
                                >
                                    Mark Paid
                                </button>
                              `
                        }


                        <button
                            class="btn btn-delete"
                            onclick="deleteRegistration(
                                '${registration.id}'
                            )"
                        >
                            Delete
                        </button>

                    </div>

                </td>

            `;


            table.appendChild(row);

        }
    );

}



/* ==========================================
   UPDATE PAYMENT STATUS
========================================== */

async function updatePaymentStatus(
    id,
    newStatus
) {

    const confirmed =
        confirm(
            `Change payment status to ${newStatus}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } = await supabaseClient
            .from("registrations")
            .update({

                payment_status: newStatus,

                updated_at:
                    new Date().toISOString()

            })
            .eq("id", id);


        if (error) {

            throw error;

        }


        alert(
            `Payment status changed to ${newStatus}.`
        );


        await loadRegistrations();


    } catch (error) {

        console.error(
            "Payment status update error:",
            error
        );


        alert(
            "Unable to update payment status."
        );

    }

}



/* ==========================================
   DELETE REGISTRATION
========================================== */

async function deleteRegistration(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this registration? This action cannot be undone."
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } = await supabaseClient
            .from("registrations")
            .delete()
            .eq("id", id);


        if (error) {

            throw error;

        }


        alert(
            "Registration deleted successfully."
        );


        await loadRegistrations();


    } catch (error) {

        console.error(
            "Delete registration error:",
            error
        );


        alert(
            "Unable to delete registration."
        );

    }

}



/* ==========================================
   LOGOUT
========================================== */

async function logout() {

    try {

        const {
            error
        } = await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                "Logout error:",
                error
            );

            alert(
                "Unable to logout."
            );

            return;

        }


        window.location.href =
            "login.html";


    } catch (error) {

        console.error(
            "Logout failed:",
            error
        );

    }

}



/* ==========================================
   MOBILE SIDEBAR
========================================== */

function openSidebar() {

    document
        .getElementById("sidebar")
        ?.classList.add("active");


    document
        .getElementById("overlay")
        ?.classList.add("active");

}


function closeSidebar() {

    document
        .getElementById("sidebar")
        ?.classList.remove("active");


    document
        .getElementById("overlay")
        ?.classList.remove("active");

}



/* ==========================================
   HTML SECURITY
========================================== */

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value ?? "";


    return div.innerHTML;

}



/* ==========================================
   START
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        checkAdminSession();

    }
);