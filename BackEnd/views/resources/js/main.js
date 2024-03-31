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


