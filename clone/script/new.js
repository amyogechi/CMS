// Configuration constants
const VALIDATION_CONFIG = {
  MIN_DETAILS_LENGTH: 10,
  MAX_TITLE_LENGTH: 200,
  MAX_DETAILS_LENGTH: 1000,
  MAX_NAME_LENGTH: 50
};
const ERROR_MESSAGES = {
  NAME_REQUIRED: 'Name is required',
  NAME_TOO_LONG: `Name must be less than ${VALIDATION_CONFIG.MAX_NAME_LENGTH} characters`,
  MATRIC_REQUIRED: 'Matric number is required',
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  DEPARTMENT_REQUIRED: 'Department is required',
  TITLE_REQUIRED: 'Complaint title is required',
  TITLE_TOO_LONG: `Title must be less than ${VALIDATION_CONFIG.MAX_TITLE_LENGTH} characters`,
  DETAILS_REQUIRED: 'Complaint details are required',
  DETAILS_TOO_SHORT: `Please provide more details (at least ${VALIDATION_CONFIG.MIN_DETAILS_LENGTH} characters)`,
  DETAILS_TOO_LONG: `Details must be less than ${VALIDATION_CONFIG.MAX_DETAILS_LENGTH} characters`,
  NOT_LOGGED_IN: 'Please login to submit a complaint',
  UNAUTHORIZED: 'You must be logged in as a student to submit complaints'
};
// Enhanced form validation with real-time feedback
function validateComplaintForm() {
  const anonymous = document.getElementById('name')
  const name = document.getElementById('name')
  const regno = document.getElementById('matric');
  const email = document.getElementById('email');
  const department = document.getElementById('department');
  const title = document.getElementById('title');
  const details = document.getElementById('details');

  const nameError = document.getElementById("nameError");
  const matricError = document.getElementById("matricError");
  const complaintForm = document.getElementById('complaintForm');
  const emailError = document.getElementById("emailError");
  const deptError = document.getElementById("deptError");
  const titleError = document.getElementById("titleError");
  const detailsError = document.getElementById("detailsError");

  // clearAllFieldErrors();

  complaintForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let isValid = true;

    if (name.value.trim() === "") {
      nameError.textContent = ERROR_MESSAGES.NAME_REQUIRED;
      nameError.style.display = "block";
      isValid = false;
    } else if (name.value.trim().length > VALIDATION_CONFIG.MAX_NAME_LENGTH) {
      nameError.textContent = ERROR_MESSAGES.NAME_TOO_LONG;
      nameError.style.display = "block";
      isValid = false;
    } else {
      isValid = true
      nameError.style.display = "none";
    }

    if (regno.value.trim() === '') {
      matricError.textContent = ERROR_MESSAGES.MATRIC_REQUIRED;
      isValid = false;
      matricError.style.display = 'block';
    } else {
      isValid = true
      matricError.style.display = 'none';
    }

    let emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,}$/;
    if (!email.value.match(emailPattern) || email.value.trim() === '') {
      emailError.style.display = "block";
      isValid = false;
    } else {
      isValid = true;
      emailError.style.display = "none"
    }

    if (department.value.trim() === '') {
      deptError.textContent = ERROR_MESSAGES.DEPARTMENT_REQUIRED
      deptError.style.display = 'block';
      isValid = false;
    } else {
      isValid = true;
      deptError.style.display = 'none'
    }

    if (title.value.trim() === '') {
      titleError.textContent = ERROR_MESSAGES.TITLE_REQUIRED
      titleError.style.display = 'block';
      isValid = false;
    } else {
      isValid = true;
      titleError.style.display = 'none'
    }

    if (details.value.trim() === '') {
      detailsError.textContent = ERROR_MESSAGES.DETAILS_REQUIRED
      detailsError.style.display = 'block';
      isValid = false;
    } else {
      isValid = true;
      detailsError.style.display = 'none'
    }

    return isValid;
  })

}
// Show user info if available
const userInfoDiv = document.getElementById('userInfo');
const userEmail = localStorage.getItem('email') || localStorage.getItem('username');
if (userEmail) {
  userInfoDiv.textContent = `Logged in as: ${userEmail}`;
}

document.getElementById('logoutBtn').onclick = function () {
  Swal.fire({
    title: 'Are you sure you want to logout?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e74c3c',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, logout',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.clear();
      window.location.href = "/" // redirect after canceled
    }
  });
};


 document.addEventListener("DOMContentLoaded", () => {
  const complaintForm = document.getElementById("complaintForm");
  const anonymousCheckbox = document.getElementById("anonymousCheckbox");
  const personalInfoSection = document.getElementById("personalInfoSection");

  // Toggle personal info visibility for anonymous submissions
  anonymousCheckbox.addEventListener("change", () => {
    if (anonymousCheckbox.checked) {
      personalInfoSection.classList.add("hidden");
      personalInfoSection.querySelectorAll("input").forEach(input => input.value = "");
    } else {
      personalInfoSection.classList.remove("hidden");
    }
  });

  // Form submit
  complaintForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const isAnonymous = anonymousCheckbox.checked;

    // Collect form data
    const complaintData = {
      anonymous: isAnonymous,
      title: document.getElementById("title").value.trim(),
      details: document.getElementById("details").value.trim(),
    };

    // Include personal info only if not anonymous
    if (!isAnonymous) {
      complaintData.name = document.getElementById("name").value.trim();
      complaintData.regno = document.getElementById("matric").value.trim();
      complaintData.email = document.getElementById("email").value.trim();
      complaintData.department = document.getElementById("department").value.trim();
    }

    // Simple validation
    if (!complaintData.title || !complaintData.details) {
      Swal.fire("Error", "All fields are required!", "error");
      return;
    }

    if (!isAnonymous) {
      if (!complaintData.name || !complaintData.regno || !complaintData.email || !complaintData.department) {
        Swal.fire("Error", "All personal fields are required!", "error");
        return;
      }
    }

    // Send to server
    try {
      const response = await fetch("/submit-complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(complaintData)
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
        title: result.message,
        text: `Check back here anytime to see the status
            `,
        cancelButtonText: 'Done',
        timer: 10000,
        })
        complaintForm.reset();
        personalInfoSection.classList.remove("hidden");
      } else {
        Swal.fire("❌ Error", result.message, "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("⚠️ Error", "Could not connect to server.", "error");
    }
  });
});

