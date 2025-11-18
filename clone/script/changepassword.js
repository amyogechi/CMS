// Configuration constants
const VALIDATION_CONFIG = {
  MIN_PASSWORD_LENGTH: 6,
};

const ERROR_MESSAGES = {
  CURRENT_PASSWORD_REQUIRED: 'Current password is required',
  NEW_PASSWORD_REQUIRED: 'New password is required',
  NEW_PASSWORD_TOO_SHORT: `New password must be at least ${VALIDATION_CONFIG.MIN_PASSWORD_LENGTH} characters long`,
  PASSWORDS_MISMATCH: 'New passwords do not match',
  SAME_PASSWORD: 'New password must be different from current password',
};

// Toggle password visibility functions
function toggleCurrentPassword() {
  const passwordField = document.getElementById('currentPassword');
  const toggleIcon = document.querySelectorAll('.eye')[0];

  if (passwordField) {
    if (passwordField.type === 'password') {
      passwordField.type = 'text';
      toggleIcon.textContent = '🔐';
    } else {
      passwordField.type = 'password';
      toggleIcon.textContent = '👁️';
    }
  }
}

function toggleNewPassword() {
  const passwordField = document.getElementById('newPassword');
  const toggleIcon = document.querySelectorAll('.eye')[1];

  if (passwordField) {
    if (passwordField.type === 'password') {
      passwordField.type = 'text';
      toggleIcon.textContent = '🔐';
    } else {
      passwordField.type = 'password';
      toggleIcon.textContent = '👁️';
    }
  }
}

function toggleConfirmNewPassword() {
  const passwordField = document.getElementById('confirmNewPassword');
  const toggleIcon = document.querySelectorAll('.eye')[2];

  if (passwordField) {
    if (passwordField.type === 'password') {
      passwordField.type = 'text';
      toggleIcon.textContent = '🔐';
    } else {
      passwordField.type = 'password';
      toggleIcon.textContent = '👁️';
    }
  }
}

// Error management functions
function addFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  field.classList.add('error');

  let errorElement = document.getElementById(`${fieldId}-error`);
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.id = `${fieldId}-error`;
    errorElement.className = 'field-error';
    errorElement.style.color = '#ff4757';
    errorElement.style.fontSize = '0.85em';
    errorElement.style.marginTop = '5px';

    const container = field.closest('.form-group') || field.parentNode;
    container.appendChild(errorElement);
  }

  errorElement.textContent = message;
  errorElement.style.display = 'block';
  errorElement.style.opacity = '1';
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(`${fieldId}-error`);

  if (field) field.classList.remove('error');
  if (errorElement) errorElement.style.display = 'none';
}

function clearAllFieldErrors() {
  document.querySelectorAll('.field-error').forEach(error => {
    error.style.display = 'none';
  });

  document.querySelectorAll('.error').forEach(field => {
    field.classList.remove('error');
  });

  const strengthElement = document.getElementById('passwordStrength');
  if (strengthElement) strengthElement.innerHTML = '';
}

// Password strength indicator
function showPasswordStrength(password) {
  let strengthElement = document.getElementById('passwordStrength');

  if (!strengthElement) {
    strengthElement = document.createElement('div');
    strengthElement.id = 'passwordStrength';
    strengthElement.style.marginTop = '10px';
    const passwordContainer = document.getElementById('newPassword').closest('.form-group');
    passwordContainer.appendChild(strengthElement);
  }

  if (!password) {
    strengthElement.innerHTML = '';
    return;
  }

  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

  const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#ff4757', '#ff6348', '#ffa502', '#2ed573', '#20bf6b'];

  const level = Math.min(strength, 4);

  strengthElement.innerHTML = `
    <div style="height: 4px; background: #e0e0e0; border-radius: 2px; overflow: hidden; margin-bottom: 5px;">
      <div style="width: ${(strength / 5) * 100}%; height: 100%; background-color: ${strengthColors[level]};"></div>
    </div>
    <span style="color: ${strengthColors[level]}; font-size: 0.85em; font-weight: 600;">${strengthLevels[level]}</span>
  `;
}

// Validation
function validateChangePasswordForm() {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;

  clearAllFieldErrors();

  let isValid = true;

  if (!currentPassword) {
    addFieldError('currentPassword', ERROR_MESSAGES.CURRENT_PASSWORD_REQUIRED);
    isValid = false;
  }

  if (!newPassword) {
    addFieldError('newPassword', ERROR_MESSAGES.NEW_PASSWORD_REQUIRED);
    isValid = false;
  } else if (newPassword.length < VALIDATION_CONFIG.MIN_PASSWORD_LENGTH) {
    addFieldError('newPassword', ERROR_MESSAGES.NEW_PASSWORD_TOO_SHORT);
    isValid = false;
  } else if (newPassword === currentPassword) {
    addFieldError('newPassword', ERROR_MESSAGES.SAME_PASSWORD);
    isValid = false;
  }

  if (newPassword !== confirmNewPassword) {
    addFieldError('confirmNewPassword', ERROR_MESSAGES.PASSWORDS_MISMATCH);
    isValid = false;
  }

  return isValid;
}

// Set up handlers
function setupFieldInteractionHandlers() {
  const fields = ['currentPassword', 'newPassword', 'confirmNewPassword'];

  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('input', () => {
        clearFieldError(fieldId);
        if (fieldId === 'newPassword') showPasswordStrength(field.value);
      });
    }
  });
}


// Form submission handler (WITH EMAIL HEADER ADDED)
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('changePasswordForm');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validateChangePasswordForm()) return;

      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;

      Swal.fire({
        title: 'Updating Password...',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading()
      });

      try {
        const response = await fetch("/api/change-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "email": sessionStorage.getItem("email") // or localStorage
          },
          body: JSON.stringify({ currentPassword, newPassword })
        });
        const result = await response.json();
        Swal.close();

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Password Updated Successfully!',
          }).then(() => {
            form.reset();
            window.location.href = '/';
          });

        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: result.message
          });
        }

      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Connection Error',
          text: 'Could not connect to server.'
        });
      }
    });
  }

  setupFieldInteractionHandlers();
});
