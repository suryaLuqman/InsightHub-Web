const myModal = new bootstrap.Modal(
	document.getElementById('myModal'),
);
// or
const myModalAlternative = new bootstrap.Modal('#myModal', options);

function loginUser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('https://insight-hub-api.vercel.app/api/v1/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Login failed.');
        }
        return response.json();
    })
    .then(data => {
        // Set expiration time for the cookie (e.g., 1 day)
        const expiryDate = new Date(Date.now() + 86400000); // 86400000 milliseconds = 1 day

        // Simpan token dalam cookie dengan waktu kedaluwarsa
        document.cookie = `token=${data.token}; expires=${expiryDate.toUTCString()}; path=/`;

        // Redirect ke halaman setelah login sukses
        window.location.href = '/halaman-utama-not-found';
    })
    .catch(error => {
        console.error('Login error:', error);
    });
}

function registerUser() {
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const username = document.getElementById('registerUsername').value;

    fetch('https://insight-hub-api.vercel.app/api/v1/auth/register/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, username, no_hp: phone }) // Sertakan username di dalam body request
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Registration failed.');
        }
        return response.json(); // Mengambil data JSON dari respons
    })
    .then(data => {
        console.log("Data dari server:", data); // Mencetak data JSON ke konsol
        // Periksa nilai success dalam data JSON yang diterima dari server
        if (data.success) {
            // Jika registrasi sukses, set cookie dan redirect ke halaman utama
            const expiryDate = new Date(Date.now() + 86400000); // 86400000 milliseconds = 1 day
            document.cookie = `token=${data.token}; expires=${expiryDate.toUTCString()}; path=/`;
            window.location.href = '/halaman-utama-not-found';
        } else {
            // Jika registrasi gagal, tampilkan pesan error
            const errorMessage = data.message;
            console.error('Registration error:', errorMessage);

            // Tambahkan notifikasi alert Bootstrap dengan pesan error
            const alertElement = document.createElement('div');
            alertElement.classList.add('alert', 'alert-danger');
            alertElement.textContent = errorMessage;

            const modalBody = document.querySelector('.modal-body');
            modalBody.appendChild(alertElement);
        }
    })
    .catch(error => {
        console.error('Registration error:', error);
        // Tampilkan pesan error dari respons jika tersedia
        const errorMessage = error.message ? error.message : 'Registration failed. Please try again later.';
        console.error('Error message from server:', errorMessage);

        // Tambahkan notifikasi alert Bootstrap ketika registrasi gagal
        const alertElement = document.createElement('div');
        alertElement.classList.add('alert', 'alert-danger');
        alertElement.textContent = errorMessage;

        const modalBody = document.querySelector('.modal-body');
        modalBody.appendChild(alertElement);
    });
}




