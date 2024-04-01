const myModal = new bootstrap.Modal(document.getElementById("myModal"));
// or
const myModalAlternative = new bootstrap.Modal("#myModal", options);

function goBack() {
  window.history.back();
}

// Function to check if a specific cookie exists
function checkCookie(cookieName) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(`${cookieName}=`)) {
      return true;
    }
  }
  return false;
}

// Fungsi untuk mendapatkan nilai cookie berdasarkan nama
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Mendapatkan nilai cookie 'status'
const status = getCookie('status');
console.log("status:", status);
const token = getCookie('token');

// Menampilkan nilai cookie 'status' di elemen HTML
document.addEventListener('DOMContentLoaded', function() {
  const statusElement = document.querySelector('.status');
  if (statusElement) {
    statusElement.textContent = status;
  }
});


// Function to handle actions after DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if token cookie exists
  const tokenExists = checkCookie('token');
  if (tokenExists) {
    console.log('Token exists');
    // Add actions to be performed if token exists
  } else {
    console.log('Token does not exist');
    // Add actions to be performed if token does not exist
    // redirect to login page
    window.location.href = window.location.origin;
  }
});


