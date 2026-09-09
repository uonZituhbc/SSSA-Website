// ==========================================
// SSSA STUDENT REGISTRATION
// UNIVERSITY OF ELDORET
// ==========================================

const REGISTRATION_FEE = 300;


// ==========================================
// REGISTRATION FORM
// ==========================================

const registrationForm =
    document.getElementById("registrationForm");

const registrationMessage =
    document.getElementById("registrationMessage");


// ==========================================
// SUBMIT REGISTRATION
// ==========================================

if (registrationForm) {

    registrationForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            // ==========================================
            // GET FORM VALUES
            // ==========================================

            const fullName =
                document
                    .getElementById("fullName")
                    .value
                    .trim();

            const registrationNumber =
                document
                    .getElementById("registrationNumber")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const phone =
                document
                    .getElementById("phone")
                    .value
                    .trim();

            const course =
                document
                    .getElementById("course")
                    .value;

            const yearOfStudy =
                document
                    .getElementById("yearOfStudy")
                    .value;

            const terms =
                document
                    .getElementById("terms")
                    .checked;


            // ==========================================
            // VALIDATION
            // ==========================================

            if (
                !fullName ||
                !registrationNumber ||
                !email ||
                !phone ||
                !course ||
                !yearOfStudy
            ) {

                showMessage(
                    "Please complete all required fields.",
                    "error"
                );

                return;
            }


            if (!terms) {

                showMessage(
                    "Please confirm that the information provided is correct.",
                    "error"
                );

                return;
            }


            // ==========================================
            // FORMAT PHONE NUMBER
            // ==========================================

            const mpesaPhone =
                formatKenyanPhone(phone);


            if (!mpesaPhone) {

                showMessage(
                    "Please enter a valid Kenyan M-Pesa phone number.",
                    "error"
                );

                return;
            }


            // ==========================================
            // DISABLE BUTTON
            // ==========================================

            const submitButton =
                registrationForm.querySelector(
                    "button[type='submit']"
                );


            submitButton.disabled = true;

            submitButton.textContent =
                "Processing...";


            showMessage(
                "Checking your registration...",
                "info"
            );


            try {

                // ==========================================
                // CHECK EXISTING REGISTRATION
                // ==========================================

                const {
                    data: existingRegistration,
                    error: checkError
                } =
                    await supabaseClient
                        .from("registrations")
                        .select(
                            "id, payment_status"
                        )
                        .eq(
                            "registration_number",
                            registrationNumber
                        )
                        .maybeSingle();


                if (checkError) {

                    throw checkError;

                }


                // ==========================================
                // EXISTING REGISTRATION
                // ==========================================

                if (existingRegistration) {

                    if (
                        existingRegistration.payment_status ===
                        "paid"
                    ) {

                        throw new Error(
                            "This registration number is already registered and paid."
                        );

                    }


                    throw new Error(
                        "A registration with this registration number already exists."
                    );

                }


                // ==========================================
                // CREATE REGISTRATION REFERENCE
                // ==========================================

                const registrationReference =
                    generateRegistrationReference();


                // ==========================================
                // SAVE REGISTRATION
                // ==========================================

                showMessage(
                    "Saving your registration...",
                    "info"
                );


                const {
                    data: registrationData,
                    error: registrationError
                } =
                    await supabaseClient
                        .from("registrations")
                        .insert([

                            {

                                full_name:
                                    fullName,

                                // Student's actual university
                                // registration number
                                registration_number:
                                    registrationNumber,

                                // Leave the existing SSSA
                                // registration_no field alone
                                // unless your system defines
                                // how it should be generated.

                                course:
                                    course,

                                year_of_study:
                                    yearOfStudy,

                                phone_number:
                                    mpesaPhone,

                                email:
                                    email,

                                membership_fee:
                                    REGISTRATION_FEE,

                                payment_status:
                                    "pending",

                                payment_reference:
                                    null,

                                registration_reference:
                                    registrationReference,

                                updated_at:
                                    new Date().toISOString()

                            }

                        ])
                        .select()
                        .single();


                if (registrationError) {

                    throw registrationError;

                }


                console.log(
                    "Registration created:",
                    registrationData
                );


                // ==========================================
                // START M-PESA PAYMENT
                // ==========================================

                showMessage(
                    "Sending M-Pesa payment request...",
                    "info"
                );


                const {
                    data: paymentData,
                    error: paymentError
                } =
                    await supabaseClient.functions.invoke(
                        "mpesa-stk-push",
                        {
                            body: {

                                phone:
                                    mpesaPhone,

                                amount:
                                    REGISTRATION_FEE,

                                registrationId:
                                    registrationData.id,

                                registrationReference:
                                    registrationReference

                            }
                        }
                    );


                // ==========================================
                // CHECK FUNCTION ERROR
                // ==========================================

                if (paymentError) {

                    console.error(
                        "M-Pesa function error:",
                        paymentError
                    );

                    throw new Error(
                        "Unable to start M-Pesa payment. Please try again."
                    );

                }


                console.log(
                    "M-Pesa response:",
                    paymentData
                );


                // ==========================================
                // CHECK PAYMENT RESPONSE
                // ==========================================

                if (
                    !paymentData ||
                    !paymentData.success
                ) {

                    throw new Error(
                        paymentData?.error ||
                        "M-Pesa payment could not be started."
                    );

                }


                // ==========================================
                // GET CHECKOUT REQUEST ID
                // ==========================================

                const checkoutRequestID =
                    paymentData?.data?.CheckoutRequestID ||
                    null;


                const merchantRequestID =
                    paymentData?.data?.MerchantRequestID ||
                    null;


                // ==========================================
                // SAVE PAYMENT REFERENCE
                // ==========================================

                if (checkoutRequestID) {

                    const {
                        error: updatePaymentError
                    } =
                        await supabaseClient
                            .from("registrations")
                            .update({

                                payment_reference:
                                    checkoutRequestID,

                                updated_at:
                                    new Date().toISOString()

                            })
                            .eq(
                                "id",
                                registrationData.id
                            );


                    if (updatePaymentError) {

                        console.error(
                            "Payment reference update error:",
                            updatePaymentError
                        );

                    }

                }


                // ==========================================
                // SUCCESS MESSAGE
                // ==========================================

                showMessage(
                    "M-Pesa prompt sent to your phone. Please enter your M-Pesa PIN to complete the payment.",
                    "success"
                );


                console.log(
                    "Merchant Request ID:",
                    merchantRequestID
                );


                console.log(
                    "Checkout Request ID:",
                    checkoutRequestID
                );


                // ==========================================
                // RESET BUTTON
                // ==========================================

                submitButton.disabled = false;

                submitButton.textContent =
                    "Register & Pay KSh 300 →";


            } catch (error) {

                // ==========================================
                // ERROR HANDLING
                // ==========================================

                console.error(
                    "Registration error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Something went wrong. Please try again.",
                    "error"
                );


                submitButton.disabled = false;

                submitButton.textContent =
                    "Register & Pay KSh 300 →";

            }

        }
    );

}


// ==========================================
// FORMAT KENYAN PHONE NUMBER
// ==========================================

function formatKenyanPhone(phone) {

    let number =
        phone
            .replace(/\s+/g, "")
            .replace(/-/g, "");


    // ==========================================
    // 07XXXXXXXX
    // ==========================================

    if (
        number.startsWith("07") &&
        number.length === 10
    ) {

        return (
            "254" +
            number.substring(1)
        );

    }


    // ==========================================
    // 01XXXXXXXX
    // ==========================================

    if (
        number.startsWith("01") &&
        number.length === 10
    ) {

        return (
            "254" +
            number.substring(1)
        );

    }


    // ==========================================
    // +2547XXXXXXXX
    // ==========================================

    if (
        number.startsWith("+254") &&
        number.length === 13
    ) {

        return number.substring(1);

    }


    // ==========================================
    // 2547XXXXXXXX
    // ==========================================

    if (
        number.startsWith("254") &&
        number.length === 12
    ) {

        return number;

    }


    return null;
}


// ==========================================
// GENERATE REGISTRATION REFERENCE
// ==========================================

function generateRegistrationReference() {

    const random =
        Math.floor(
            100000 +
            Math.random() * 900000
        );


    return (
        `SSSA-s${new Date().getFullYear()}-${random}`
    );
}


// ==========================================
// DISPLAY MESSAGE
// ==========================================

function showMessage(
    message,
    type
) {

    if (!registrationMessage) {
        return;
    }


    registrationMessage.textContent =
        message;


    registrationMessage.className =
        "registration-message " +
        type;
}