'use strict';

const packages = {
  yogurt: {
    title: 'Frozen Yogurt Only',
    description: 'Frozen yogurt served from the Spoiled cart with a toppings bar.',
    image: 'assets/froyo.webp',
    alt: 'Spoiled frozen yogurt in a serving cup'
  },
  drinks: {
    title: 'Frozen Yogurt + Drinks',
    description: 'Frozen yogurt and toppings, with matcha and coffee for your guests.',
    image: 'assets/cart.webp',
    alt: 'Illustration of the Spoiled catering cart'
  }
};

function setStatus(status, message, isError = false) {
  status.textContent = message;
  status.classList.toggle('error', isError);
}

function clearErrors(form, status) {
  for (const field of form.querySelectorAll('[aria-invalid]')) {
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-errormessage');
  }
  setStatus(status, '');
}

function showError(field, status, message) {
  setStatus(status, message, true);
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-errormessage', status.id);
  field.focus();
}

function localDateString(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function setupBooking(form) {
  const eventDate = form.elements.eventDate;
  const guests = form.elements.guests;
  const occasion = form.elements.occasion;
  const status = document.querySelector('#booking-status');
  const packageImage = document.querySelector('#package-image');
  const addonList = document.querySelector('#addon-list');
  const addonSummary = document.querySelector('#summary-addons');
  eventDate.min = localDateString(new Date());

  function updatePreview() {
    const selection = form.elements.package.value;
    const selectedPackage = packages[selection];
    packageImage.src = selectedPackage.image;
    packageImage.alt = selectedPackage.alt;
    packageImage.classList.toggle('cart-image', selection === 'drinks');
    document.querySelector('#package-description').textContent = selectedPackage.description;
    document.querySelector('#summary-package').textContent = selectedPackage.title;
    document.querySelector('#summary-date').textContent = eventDate.value
      ? new Date(eventDate.value + 'T12:00:00').toLocaleDateString('en-GB', { dateStyle: 'long' })
      : 'Select a date';
    document.querySelector('#summary-guests').textContent = guests.value || 'Enter guest count';
    document.querySelector('#summary-occasion').textContent = occasion.value || 'Select an occasion';

    addonList.replaceChildren();
    for (const selected of form.querySelectorAll('input[name="addons"]:checked')) {
      const item = document.createElement('li');
      item.textContent = selected.value;
      addonList.append(item);
    }
    addonSummary.hidden = addonList.childElementCount === 0;
  }

  form.addEventListener('input', () => {
    clearErrors(form, status);
    updatePreview();
  });
  form.addEventListener('reset', () => {
    clearErrors(form, status);
    requestAnimationFrame(updatePreview);
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearErrors(form, status);
    eventDate.min = localDateString(new Date());
    if (!eventDate.value || eventDate.validity.rangeUnderflow) {
      showError(eventDate, status, 'Choose today or a future event date.');
    } else if (!guests.validity.valid) {
      showError(guests, status, 'Enter a whole number from 20 to 1,000 for your guest count.');
    } else if (!occasion.value) {
      showError(occasion, status, 'Select the type of occasion.');
    } else {
      updatePreview();
      setStatus(status, 'Your request is ready to review. This demo keeps it on this page.');
      form.dispatchEvent(new Event('booking:prepared'));
    }
  });

  updatePreview();
}

function setupAccount(form) {
  const status = document.querySelector('#account-status');
  const email = form.elements.email;
  const password = form.elements.password;
  const fullName = form.elements.fullName;
  const confirmation = form.elements.confirmPassword;
  const showPassword = document.querySelector('#show-password');
  if (showPassword) {
    showPassword.addEventListener('change', () => {
      const type = showPassword.checked ? 'text' : 'password';
      password.type = type;
      if (confirmation) {
        confirmation.type = type;
      }
    });
  }

  form.addEventListener('input', () => clearErrors(form, status));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearErrors(form, status);
    if (fullName && !fullName.value.trim()) {
      showError(fullName, status, 'Enter your full name.');
    } else if (!email.validity.valid) {
      showError(email, status, 'Enter a valid email address.');
    } else if (password.value.trim().length < 8) {
      showError(password, status, 'Enter a password with at least 8 characters.');
    } else if (confirmation && confirmation.value !== password.value) {
      showError(confirmation, status, 'The passwords must match.');
    } else {
      password.value = '';
      if (confirmation) confirmation.value = '';
      setStatus(status, 'Your sample details passed validation. This page is a class demo.');
    }
  });
}

const bookingForm = document.querySelector('#booking-form');
const accountForm = document.querySelector('#account-form');
if (bookingForm) {
  setupBooking(bookingForm);
  bookingForm.querySelector('[type="submit"]').disabled = false;
}
if (accountForm) {
  setupAccount(accountForm);
  accountForm.querySelector('[type="submit"]').disabled = false;
}
