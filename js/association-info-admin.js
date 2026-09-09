// ==========================================
// SSSA ASSOCIATION INFORMATION - ADMIN
// ==========================================

// The association_info table should contain one main record.

let associationId = null;


// ==========================================
// STATUS MESSAGE
// ==========================================

function showStatus(message, type) {

    const statusMessage =
        document.getElementById("statusMessage");

    statusMessage.textContent = message;

    statusMessage.className = "status show " + type;

}


// ==========================================
// LOAD ASSOCIATION INFORMATION
// ==========================================

async function loadAssociationInformation() {

    showStatus(
        "Loading association information...",
        "loading"
    );

    try {

        const { data, error } = await supabaseClient
            .from("association_info")
            .select("*")
            .limit(1)
            .single();


        if (error) {

            console.error(
                "❌ Error loading association information:",
                error
            );

            showStatus(
                "Unable to load association information.",
                "error"
            );

            return;
        }


        if (!data) {

            showStatus(
                "No association information was found.",
                "error"
            );

            return;
        }


        console.log(
            "✅ Association information loaded:",
            data
        );


        // Store the database ID
        associationId = data.id;


        // Fill the form

        document.getElementById("name").value =
            data.name || "";

        document.getElementById("description").value =
            data.description || "";

        document.getElementById("mission").value =
            data.mission || "";

        document.getElementById("vision").value =
            data.vision || "";

        document.getElementById("objectives").value =
            data.objectives || "";

        document.getElementById("logo_url").value =
            data.logo_url || "";


        updateLogoPreview(data.logo_url);


        showStatus(
            "Association information loaded successfully.",
            "success"
        );


        // Hide success message after a few seconds

        setTimeout(function() {

            document.getElementById(
                "statusMessage"
            ).className = "status";

        }, 3000);


    } catch (error) {

        console.error(
            "❌ Unexpected error:",
            error
        );

        showStatus(
            "Something went wrong while loading the information.",
            "error"
        );

    }

}


// ==========================================
// UPDATE ASSOCIATION INFORMATION
// ==========================================

async function saveAssociationInformation(event) {

    event.preventDefault();


    if (!associationId) {

        showStatus(
            "Association information has not loaded yet.",
            "error"
        );

        return;
    }


    const saveButton =
        document.getElementById("saveButton");


    // Get values from the form

    const name =
        document.getElementById("name").value.trim();

    const description =
        document.getElementById("description").value.trim();

    const mission =
        document.getElementById("mission").value.trim();

    const vision =
        document.getElementById("vision").value.trim();

    const objectives =
        document.getElementById("objectives").value.trim();

    const logo_url =
        document.getElementById("logo_url").value.trim();


    // Basic validation

    if (!name || !description || !mission || !vision || !objectives) {

        showStatus(
            "Please fill in all required fields.",
            "error"
        );

        return;
    }


    // Prevent multiple clicks

    saveButton.disabled = true;

    saveButton.textContent = "Saving...";


    showStatus(
        "Saving association information...",
        "loading"
    );


    try {

        const { data, error } = await supabaseClient

            .from("association_info")

            .update({

                name: name,

                description: description,

                mission: mission,

                vision: vision,

                objectives: objectives,

                logo_url: logo_url || null,

                updated_at: new Date().toISOString()

            })

            .eq("id", associationId)

            .select()
            .single();


        if (error) {

            console.error(
                "❌ Error updating association information:",
                error
            );

            showStatus(
                "Update failed: " + error.message,
                "error"
            );

            return;
        }


        console.log(
            "✅ Association information updated:",
            data
        );


        showStatus(
            "Association information updated successfully.",
            "success"
        );


        // Update ID in case the returned record changed

        if (data && data.id) {
            associationId = data.id;
        }


    } catch (error) {

        console.error(
            "❌ Unexpected update error:",
            error
        );

        showStatus(
            "Something went wrong while saving.",
            "error"
        );

    } finally {

        saveButton.disabled = false;

        saveButton.textContent = "Save Changes";

    }

}


// ==========================================
// LOGO PREVIEW
// ==========================================

function updateLogoPreview(url) {

    const preview =
        document.getElementById("logoPreview");


    if (!url) {

        preview.innerHTML = "No logo";

        return;
    }


    preview.innerHTML = "";


    const image =
        document.createElement("img");


    image.src = url;

    image.alt = "Association Logo";


    image.onerror = function() {

        preview.innerHTML =
            "Unable to load logo";

    };


    preview.appendChild(image);

}


// ==========================================
// LOGO URL PREVIEW
// ==========================================

document
    .getElementById("logo_url")
    .addEventListener("input", function() {

        updateLogoPreview(
            this.value.trim()
        );

    });


// ==========================================
// FORM SUBMISSION
// ==========================================

document
    .getElementById("associationInfoForm")
    .addEventListener(
        "submit",
        saveAssociationInformation
    );


// ==========================================
// RELOAD BUTTON
// ==========================================

document
    .getElementById("reloadButton")
    .addEventListener(
        "click",
        loadAssociationInformation
    );


// ==========================================
// INITIAL LOAD
// ==========================================

loadAssociationInformation();