// ==========================================
// SSSA ADMIN CONTACT MESSAGES
// ==========================================

let allMessages = [];
let currentMessage = null;


// ==========================================
// LOAD MESSAGES
// ==========================================

async function loadMessages() {

    const messageList = document.getElementById("messageList");

    messageList.innerHTML = `
        <div class="empty-message">
            Loading messages...
        </div>
    `;

    const { data, error } = await supabaseClient
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {

        console.error(error);

        messageList.innerHTML = `
            <div class="empty-message">
                Unable to load messages.
                <br><br>
                ${escapeHtml(error.message)}
            </div>
        `;

        return;
    }

    allMessages = data || [];

    updateStatistics();

    displayMessages();
}


// ==========================================
// STATISTICS
// ==========================================

function updateStatistics() {

    const total = allMessages.length;

    const newMessages = allMessages.filter(
        message => (message.status || "new") === "new"
    ).length;

    const readMessages = allMessages.filter(
        message => message.status === "read"
    ).length;

    const repliedMessages = allMessages.filter(
        message => message.status === "replied"
    ).length;

    document.getElementById("totalMessages").textContent = total;

    document.getElementById("newMessages").textContent = newMessages;

    document.getElementById("readMessages").textContent = readMessages;

    document.getElementById("repliedMessages").textContent =
        repliedMessages;
}


// ==========================================
// DISPLAY MESSAGES
// ==========================================

function displayMessages() {

    const messageList = document.getElementById("messageList");

    const search =
        document.getElementById("searchMessages")
            .value
            .toLowerCase()
            .trim();

    const filter =
        document.getElementById("statusFilter").value;

    const filteredMessages = allMessages.filter(message => {

        const status = message.status || "new";

        const matchesStatus =
            filter === "all" ||
            status === filter;

        const searchableText = `
            ${message.name || ""}
            ${message.email || ""}
            ${message.subject || ""}
            ${message.message || ""}
        `.toLowerCase();

        const matchesSearch =
            searchableText.includes(search);

        return matchesStatus && matchesSearch;

    });

    if (filteredMessages.length === 0) {

        messageList.innerHTML = `
            <div class="empty-message">
                No messages found.
            </div>
        `;

        return;
    }

    messageList.innerHTML =
        filteredMessages
            .map(message => createMessageHTML(message))
            .join("");
}


// ==========================================
// MESSAGE HTML
// ==========================================

function createMessageHTML(message) {

    const status = message.status || "new";

    const statusClass =
        status === "new"
            ? "status-new"
            : status === "read"
                ? "status-read"
                : "status-replied";

    const statusText =
        status.charAt(0).toUpperCase() +
        status.slice(1);

    const preview =
        (message.message || "")
            .substring(0, 180);

    const date =
        message.created_at
            ? new Date(message.created_at)
                .toLocaleString()
            : "Unknown date";

    return `

        <div class="message-item">

            <div class="message-top">

                <div>

                    <div class="sender-name">
                        ${escapeHtml(message.name || "Unknown")}
                    </div>

                    <div class="sender-email">
                        ${escapeHtml(message.email || "")}
                    </div>

                </div>

                <span class="status ${statusClass}">
                    ${statusText}
                </span>

            </div>

            <div class="message-subject">
                ${escapeHtml(message.subject || "No subject")}
            </div>

            <div class="message-preview">

                ${escapeHtml(preview)}

                ${
                    message.message &&
                    message.message.length > 180
                        ? "..."
                        : ""
                }

            </div>

            <div class="message-date">
                ${date}
            </div>

            <div class="message-actions">

                <button
                    class="btn btn-view"
                    onclick="viewMessage('${message.id}')">

                    View

                </button>

                ${
                    status !== "read"
                    ? `
                        <button
                            class="btn btn-read"
                            onclick="changeStatus('${message.id}', 'read')">

                            Mark Read

                        </button>
                    `
                    : ""
                }

                ${
                    status !== "replied"
                    ? `
                        <button
                            class="btn btn-replied"
                            onclick="changeStatus('${message.id}', 'replied')">

                            Mark Replied

                        </button>
                    `
                    : ""
                }

                <button
                    class="btn btn-delete"
                    onclick="deleteMessage('${message.id}')">

                    Delete

                </button>

            </div>

        </div>

    `;
}


// ==========================================
// VIEW MESSAGE
// ==========================================

async function viewMessage(id) {

    const message =
        allMessages.find(item => item.id == id);

    if (!message) return;

    currentMessage = message;

    document.getElementById("modalSubject").textContent =
        message.subject || "No subject";

    document.getElementById("modalName").textContent =
        message.name || "";

    document.getElementById("modalEmail").textContent =
        message.email || "";

    document.getElementById("modalDate").textContent =
        message.created_at
            ? new Date(message.created_at).toLocaleString()
            : "";

    document.getElementById("modalMessage").textContent =
        message.message || "";


    // ==========================================
    // REPLY BY EMAIL
    // ==========================================

    const replyButton =
        document.getElementById("replyButton");

    const studentEmail =
        String(message.email || "").trim();

    const originalSubject =
        String(message.subject || "SSSA Contact").trim();


    if (studentEmail) {

        const replySubject =
            `Re: ${originalSubject}`;

        const replyBody =
            `Hello ${message.name || "there"},\n\n` +
            "Thank you for contacting the School of Science Students Association (SSSA).\n\n" +
            "Regards,\n" +
            "SSSA Administration";


        replyButton.href =
            `mailto:${encodeURIComponent(studentEmail)}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`;


        replyButton.style.display = "inline-block";

    } else {

        // Hide the button if the student did not provide an email

        replyButton.removeAttribute("href");

        replyButton.style.display = "none";

    }


    // ==========================================
    // SHOW MODAL
    // ==========================================

    document.getElementById("messageModal").style.display =
        "block";


    // ==========================================
    // AUTOMATICALLY MARK NEW AS READ
    // ==========================================

    if ((message.status || "new") === "new") {

        await changeStatus(id, "read", false);

    }

}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeMessage() {

    document.getElementById("messageModal").style.display =
        "none";

}


// ==========================================
// CHANGE STATUS
// ==========================================

async function changeStatus(id, newStatus, reload = true) {

    const { error } = await supabaseClient
        .from("contact_messages")
        .update({
            status: newStatus,
            updated_at: new Date().toISOString()
        })
        .eq("id", id);

    if (error) {

        console.error(error);

        alert("Unable to update message status.");

        return;

    }

    const message =
        allMessages.find(item => item.id == id);

    if (message) {

        message.status = newStatus;

        message.updated_at =
            new Date().toISOString();

    }

    updateStatistics();

    if (reload) {

        displayMessages();

    }

}


// ==========================================
// DELETE MESSAGE
// ==========================================

async function deleteMessage(id) {

    const confirmed =
        confirm(
            "Are you sure you want to permanently delete this message?"
        );

    if (!confirmed) return;

    const { error } = await supabaseClient
        .from("contact_messages")
        .delete()
        .eq("id", id);

    if (error) {

        console.error(error);

        alert(
            "Unable to delete message.\n\n" +
            error.message
        );

        return;

    }

    allMessages =
        allMessages.filter(
            message => message.id != id
        );

    updateStatistics();

    displayMessages();

}


// ==========================================
// SEARCH
// ==========================================

document
    .getElementById("searchMessages")
    .addEventListener(
        "input",
        displayMessages
    );


document
    .getElementById("statusFilter")
    .addEventListener(
        "change",
        displayMessages
    );


// ==========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ==========================================

window.addEventListener("click", function(event) {

    const modal =
        document.getElementById("messageModal");

    if (event.target === modal) {

        closeMessage();

    }

});


// ==========================================
// SECURITY HELPER
// ==========================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// INITIAL LOAD
// ==========================================

loadMessages();