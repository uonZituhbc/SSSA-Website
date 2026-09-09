/* =========================================
   SSSA LEADERSHIP MANAGEMENT
   Supabase Database + Storage
========================================= */

let leaders = [];
let editingId = null;


/* =========================
   CHECK ADMIN SESSION
========================= */

async function checkAdminSession() {

    const {
        data: sessionData,
        error: sessionError
    } = await supabaseClient.auth.getSession();

    if (sessionError || !sessionData.session) {
        window.location.href = "login.html";
        return false;
    }

    const user = sessionData.session.user;

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
        return false;
    }

    return true;
}


/* =========================
   LOAD LEADERS
========================= */

async function loadLeaders() {

    const grid =
        document.getElementById("leadersGrid");

    grid.innerHTML = `
        <div style="
            grid-column:1/-1;
            text-align:center;
            padding:40px;
        ">
            Loading leaders...
        </div>
    `;

    const {
        data,
        error
    } = await supabaseClient
        .from("leaders")
        .select(`
            id,
            name,
            position,
            photo_url,
            bio,
            display_order,
            created_at,
            updated_at
        `)
        .order("display_order", {
            ascending: true
        })
        .order("created_at", {
            ascending: true
        });

    if (error) {

        console.error("Load leaders error:", error);

        grid.innerHTML = `
            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:40px;
                color:#c62828;
            ">
                Failed to load leaders.
                <br>
                ${escapeHTML(error.message)}
            </div>
        `;

        return;
    }

    leaders = data || [];

    renderLeaders();
}


/* =========================
   OPEN FORM
========================= */

function openForm() {

    editingId = null;

    document.getElementById("formTitle").textContent =
        "Add New Leader";

    clearForm();

    document
        .getElementById("leaderForm")
        .classList.add("show");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================
   CLOSE FORM
========================= */

function closeForm() {

    document
        .getElementById("leaderForm")
        .classList.remove("show");

    clearForm();

    editingId = null;
}


/* =========================
   CLEAR FORM
========================= */

function clearForm() {

    document.getElementById("leaderName").value = "";

    document.getElementById("leaderPosition").value = "";

    document.getElementById("leaderBio").value = "";

    document.getElementById("leaderPhoto").value = "";

    document.getElementById("photoPreview").src = "";

    document.getElementById("photoPreview").style.display =
        "none";
}


/* =========================
   PHOTO PREVIEW
========================= */

function previewPhoto(event) {

    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

        alert("Please select an image file.");

        event.target.value = "";

        return;
    }

    const maxSize = 6 * 1024 * 1024;

    if (file.size > maxSize) {

        alert("Please choose an image smaller than 6MB.");

        event.target.value = "";

        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {

        const preview =
            document.getElementById("photoPreview");

        preview.src = e.target.result;

        preview.style.display = "block";
    };

    reader.readAsDataURL(file);
}


/* =========================
   UPLOAD PHOTO
========================= */

async function uploadLeadershipPhoto(file) {

    if (!file) {
        return null;
    }

    const extension =
        file.name.split(".").pop().toLowerCase();

    const safeExtension =
        extension.replace(/[^a-z0-9]/g, "");

    const uniqueName =
        `leader-${Date.now()}-${crypto.randomUUID()}.${safeExtension}`;

    const filePath =
        uniqueName;

    const {
        data,
        error
    } = await supabaseClient
        .storage
        .from("leadership")
        .upload(
            filePath,
            file,
            {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type
            }
        );

    if (error) {

        console.error(
            "Photo upload error:",
            error
        );

        throw new Error(
            "Photo upload failed: " +
            error.message
        );
    }

    const {
        data: publicData
    } = supabaseClient
        .storage
        .from("leadership")
        .getPublicUrl(data.path);

    if (!publicData || !publicData.publicUrl) {

        throw new Error(
            "Could not create photo URL."
        );
    }

    return publicData.publicUrl;
}


/* =========================
   SAVE LEADER
========================= */

async function saveLeader() {

    const name =
        document
            .getElementById("leaderName")
            .value
            .trim();

    const position =
        document
            .getElementById("leaderPosition")
            .value;

    const bio =
        document
            .getElementById("leaderBio")
            .value
            .trim();

    const photoInput =
        document.getElementById("leaderPhoto");

    const selectedFile =
        photoInput.files[0];


    /* VALIDATION */

    if (!name || !position) {

        alert(
            "Please enter the leader's name and position."
        );

        return;
    }


    /* DISABLE BUTTON */

    const saveButton =
        document.querySelector(
            ".form-actions .btn-primary"
        );

    if (saveButton) {

        saveButton.disabled = true;

        saveButton.textContent =
            "Saving...";
    }


    try {

        let photoUrl = null;


        /* =========================
           EDIT EXISTING LEADER
        ========================= */

        if (editingId) {

            const existingLeader =
                leaders.find(
                    leader =>
                        String(leader.id) ===
                        String(editingId)
                );


            /* Upload new photo only if selected */

            if (selectedFile) {

                photoUrl =
                    await uploadLeadershipPhoto(
                        selectedFile
                    );

            } else {

                photoUrl =
                    existingLeader
                        ? existingLeader.photo_url
                        : null;
            }


            const updateData = {

                name: name,

                position: position,

                bio: bio || null,

                photo_url: photoUrl,

                updated_at:
                    new Date().toISOString()
            };


            const {
                error
            } = await supabaseClient
                .from("leaders")
                .update(updateData)
                .eq("id", editingId);


            if (error) {

                throw new Error(
                    "Failed to update leader: " +
                    error.message
                );
            }


            alert(
                "Leader updated successfully."
            );

        }


        /* =========================
           ADD NEW LEADER
        ========================= */

        else {

            if (selectedFile) {

                photoUrl =
                    await uploadLeadershipPhoto(
                        selectedFile
                    );
            }


            const nextDisplayOrder =
                leaders.length + 1;


            const insertData = {

                name: name,

                position: position,

                bio: bio || null,

                photo_url: photoUrl,

                display_order:
                    nextDisplayOrder
            };


            const {
                error
            } = await supabaseClient
                .from("leaders")
                .insert([insertData]);


            if (error) {

                throw new Error(
                    "Failed to add leader: " +
                    error.message
                );
            }


            alert(
                "Leader added successfully."
            );
        }


        closeForm();

        await loadLeaders();


    } catch (error) {

        console.error(
            "Save leader error:",
            error
        );

        alert(error.message);


    } finally {

        if (saveButton) {

            saveButton.disabled = false;

            saveButton.textContent =
                "Save Leader";
        }
    }
}


/* =========================
   DISPLAY LEADERS
========================= */

function renderLeaders() {

    const grid =
        document.getElementById("leadersGrid");

    const empty =
        document.getElementById("emptyState");


    grid.innerHTML = "";


    if (leaders.length === 0) {

        empty.style.display = "block";

        return;
    }


    empty.style.display = "none";


    leaders.forEach(function(leader) {

        const card =
            document.createElement("div");

        card.className =
            "leader-card";


        let photoHTML;


        if (leader.photo_url) {

            photoHTML = `
                <img
                    src="${escapeHTML(
                        leader.photo_url
                    )}"
                    alt="${escapeHTML(
                        leader.name
                    )}"
                >
            `;

        } else {

            photoHTML = "👤";
        }


        card.innerHTML = `

            <div class="leader-photo">
                ${photoHTML}
            </div>

            <div class="leader-info">

                <h3>
                    ${escapeHTML(
                        leader.name
                    )}
                </h3>

                <div class="position">
                    ${escapeHTML(
                        leader.position
                    )}
                </div>

                <p class="leader-bio">
                    ${escapeHTML(
                        leader.bio ||
                        "No biography added."
                    )}
                </p>

                <div class="card-actions">

                    <button
                        class="btn edit-btn"
                        onclick="editLeader('${leader.id}')"
                    >
                        ✏️ Edit
                    </button>

                    <button
                        class="btn delete-btn"
                        onclick="deleteLeader('${leader.id}')"
                    >
                        🗑️ Delete
                    </button>

                </div>

            </div>
        `;


        grid.appendChild(card);
    });
}


/* =========================
   EDIT LEADER
========================= */

function editLeader(id) {

    const leader =
        leaders.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!leader) return;


    editingId = leader.id;


    document.getElementById("formTitle").textContent =
        "Edit Leader";


    document.getElementById("leaderName").value =
        leader.name || "";


    document.getElementById("leaderPosition").value =
        leader.position || "";


    document.getElementById("leaderBio").value =
        leader.bio || "";


    document.getElementById("leaderPhoto").value =
        "";


    const preview =
        document.getElementById("photoPreview");


    if (leader.photo_url) {

        preview.src =
            leader.photo_url;

        preview.style.display =
            "block";

    } else {

        preview.src = "";

        preview.style.display =
            "none";
    }


    document
        .getElementById("leaderForm")
        .classList.add("show");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================
   DELETE LEADER
========================= */

async function deleteLeader(id) {

    const leader =
        leaders.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!leader) return;


    const confirmed =
        confirm(
            `Delete ${leader.name} from SSSA leadership?`
        );


    if (!confirmed) {
        return;
    }


    try {

        /* Delete database record */

        const {
            error
        } = await supabaseClient
            .from("leaders")
            .delete()
            .eq("id", id);


        if (error) {

            throw new Error(
                "Failed to delete leader: " +
                error.message
            );
        }


        alert(
            "Leader deleted successfully."
        );


        await loadLeaders();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );

        alert(error.message);
    }
}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(text) {

    if (
        text === null ||
        text === undefined
    ) {
        return "";
    }

    const div =
        document.createElement("div");

    div.textContent =
        String(text);

    return div.innerHTML;
}


/* =========================
   LOGOUT
========================= */

async function logout() {

    const {
        error
    } = await supabaseClient
        .auth
        .signOut();


    if (error) {

        console.error(
            "Logout error:",
            error
        );

        return;
    }


    window.location.href =
        "login.html";
}


/* =========================
   INITIALIZE
========================= */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        const authorized =
            await checkAdminSession();

        if (!authorized) return;

        await loadLeaders();

    }
);