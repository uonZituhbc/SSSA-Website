// ==========================================
// SSSA WEBSITE SETTINGS
// UNIVERSITY OF ELDORET
// ==========================================

let settingsId = null;


// ==========================================
// LOAD SETTINGS WHEN PAGE OPENS
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    loadSettings();

    const saveButton =
        document.getElementById("saveSettings");

    if (saveButton) {
        saveButton.addEventListener(
            "click",
            saveSettings
        );
    }

});


// ==========================================
// LOAD SETTINGS FROM SUPABASE
// ==========================================

async function loadSettings() {

    const status =
        document.getElementById("settingsStatus");

    if (status) {
        status.textContent = "Loading settings...";
        status.className = "";
    }


    const { data, error } =
        await supabaseClient
            .from("website_settings")
            .select("*")
            .limit(1)
            .maybeSingle();


    if (error) {

        console.error(
            "Error loading website settings:",
            error
        );

        showStatus(
            "Unable to load website settings.",
            "error"
        );

        return;
    }


    if (!data) {

        showStatus(
            "No website settings found.",
            "error"
        );

        return;
    }


    settingsId = data.id;


    // GENERAL INFORMATION

    document.getElementById(
        "associationName"
    ).value =
        data.association_name || "";


    document.getElementById(
        "universityName"
    ).value =
        data.university_name || "";


    document.getElementById(
        "location"
    ).value =
        data.location || "";


    // CONTACT INFORMATION

    document.getElementById(
        "officialEmail"
    ).value =
        data.email || "";


    document.getElementById(
        "officialPhone"
    ).value =
        data.phone || "";


    // WEBSITE INFORMATION

    document.getElementById(
        "websiteTitle"
    ).value =
        data.website_title || "";


    document.getElementById(
        "websiteDescription"
    ).value =
        data.website_description || "";


    showStatus(
        "Settings loaded successfully.",
        "success"
    );

}


// ==========================================
// SAVE SETTINGS
// ==========================================

async function saveSettings() {

    const saveButton =
        document.getElementById(
            "saveSettings"
        );


    const associationName =
        document.getElementById(
            "associationName"
        ).value.trim();


    const universityName =
        document.getElementById(
            "universityName"
        ).value.trim();


    const email =
        document.getElementById(
            "officialEmail"
        ).value.trim();


    const phone =
        document.getElementById(
            "officialPhone"
        ).value.trim();


    const location =
        document.getElementById(
            "location"
        ).value.trim();


    const websiteTitle =
        document.getElementById(
            "websiteTitle"
        ).value.trim();


    const websiteDescription =
        document.getElementById(
            "websiteDescription"
        ).value.trim();


    // ======================================
    // BASIC VALIDATION
    // ======================================

    if (
        !associationName ||
        !universityName ||
        !email ||
        !phone
    ) {

        showStatus(
            "Please fill in all required fields.",
            "error"
        );

        return;
    }


    // ======================================
    // DISABLE BUTTON
    // ======================================

    saveButton.disabled = true;

    saveButton.textContent =
        "Saving...";


    showStatus(
        "Saving settings...",
        ""
    );


    // ======================================
    // DATA TO SAVE
    // ======================================

    const settingsData = {

        association_name:
            associationName,

        university_name:
            universityName,

        email:
            email,

        phone:
            phone,

        location:
            location,

        website_title:
            websiteTitle,

        website_description:
            websiteDescription,

        updated_at:
            new Date().toISOString()

    };


    // ======================================
    // UPDATE EXISTING SETTINGS
    // ======================================

    let error;


    if (settingsId) {

        const result =
            await supabaseClient
                .from("website_settings")
                .update(settingsData)
                .eq("id", settingsId);

        error = result.error;

    }

    // ======================================
    // CREATE SETTINGS IF NONE EXIST
    // ======================================

    else {

        const result =
            await supabaseClient
                .from("website_settings")
                .insert(settingsData)
                .select()
                .single();

        error = result.error;

        if (!error && result.data) {
            settingsId = result.data.id;
        }

    }


    // ======================================
    // HANDLE ERROR
    // ======================================

    if (error) {

        console.error(
            "Error saving settings:",
            error
        );


        showStatus(
            "Unable to save settings: " +
            error.message,
            "error"
        );


        saveButton.disabled = false;

        saveButton.textContent =
            "💾 Save Settings";

        return;
    }


    // ======================================
    // SUCCESS
    // ======================================

    showStatus(
        "✓ Website settings saved successfully.",
        "success"
    );


    saveButton.disabled = false;

    saveButton.textContent =
        "💾 Save Settings";

}


// ==========================================
// STATUS MESSAGE
// ==========================================

function showStatus(message, type) {

    const status =
        document.getElementById(
            "settingsStatus"
        );


    if (!status) return;


    status.textContent = message;

    status.className = type;

}