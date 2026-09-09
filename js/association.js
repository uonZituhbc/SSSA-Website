// ===============================
// ASSOCIATION PAGE
// ===============================

async function loadAssociationInfo() {

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

        return;
    }

    console.log(
        "✅ Association information loaded:",
        data
    );


    // ==========================================
    // ASSOCIATION NAME
    // ==========================================

    const nameElement =
        document.getElementById("association-name");

    if (nameElement) {
        nameElement.textContent = data.name || "";
    }


    // ==========================================
    // DESCRIPTION
    // ==========================================

    const descriptionElement =
    document.getElementById("association-description-main");


    if (descriptionElement) {
        descriptionElement.textContent =
            data.description || "";
    }


    // ==========================================
    // MISSION
    // ==========================================

    const missionElement =
        document.getElementById("association-mission");

    if (missionElement) {
        missionElement.textContent =
            data.mission || "";
    }


    // ==========================================
    // VISION
    // ==========================================

    const visionElement =
        document.getElementById("association-vision");

    if (visionElement) {
        visionElement.textContent =
            data.vision || "";
    }


    // ==========================================
    // OBJECTIVES
    // ==========================================

    const objectivesElement =
        document.getElementById("association-objectives");

    if (objectivesElement) {
        objectivesElement.textContent =
            data.objectives || "";
    }


    // ==========================================
    // LOGO
    // ==========================================

    const logoElement =
        document.getElementById("association-logo");

    if (logoElement && data.logo_url) {

        logoElement.src = data.logo_url;

        logoElement.style.display = "block";

    }


    // Make information available globally
    window.associationInfo = data;
}


// ===============================
// LOAD DATA
// ===============================

loadAssociationInfo();