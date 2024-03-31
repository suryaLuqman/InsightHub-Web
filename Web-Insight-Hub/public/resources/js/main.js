
const myModal = new bootstrap.Modal(
    document.getElementById('myModal'),
);
// or
const myModalAlternative = new bootstrap.Modal('#myModal', options);



function goBack() {
    window.history.back();
}



function loginUser() {
    const email = $('#loginEmail').val();
    const password = $('#loginPassword').val();
    console.log("Data yang akan dikirim:", { email, password});

    const formData = {
        email: email,
        password: password,
    };

    // Menampilkan animasi loading
    $('#loadingOverlay').removeClass('d-none');

    // Mendapatkan url utama
    const origin = window.location.origin;

    $.ajax({
        url: `${origin}/login`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        dataType: 'json',
        success: function(data) {
            console.log("Data dari server (success):", data);
            if (data.success) {
                // Redirect ke halaman dashboard
                window.location.href = '/dashboard/' + data.data.profile.profile.first_name;
            } else {
                const Message = data.message;
                const error = data.error;
                const errorMessage = error ? Message + error : Message;
                console.error('Login error:', errorMessage);
                $('#loginErrorAlert').text(errorMessage).removeClass('d-none');
            }
        },
        error: function(xhr, status, error) {
            const errorData = xhr.responseJSON ? xhr.responseJSON : 'Login failed. Please try again later.';
            console.error('Login error:', errorData);
            console.error("Data dari server (error):", errorData);

            // Cetak data yang akan dikirimkan ke server pada respon error
            console.log("Data yang akan dikirimkan ke server:", formData);

            if (errorData.error) {
                $('#loginErrorAlert').html(`<i class="fas fa-exclamation-triangle"></i> ${errorData.message} Error: ${errorData.error}`).removeClass('d-none')
                console.error('ini jalan if atas');            
            } else {
                $('#loginErrorAlert').html(`<i class="fas fa-exclamation-triangle"></i> ${errorData.message}`).removeClass('d-none');
                console.error('ini jalan else bawah');
            }
        },
        complete: function() {
            // Sembunyikan animasi loading
            setTimeout(function() {
                // Hapus kelas 'd-none' untuk memunculkan spinner
                $('#loadingOverlay').removeClass('d-none');
            }, 3000);
        }
    });
}




function registerUser() {
    const email = $('#registerEmail').val();
    const phone = $('#registerPhone').val();
    const password = $('#registerPassword').val();
    const nama = $('#registerNama').val();
    const status = $('#status').val();
    console.log("Data yang akan dikirim:", { email, password, nama, no_hp: phone, status});

        const formData = {
            email: email,
            nama: nama,
            password: password,
            phone: phone,
            status: status
        };

        const dataLogin = {
            email: email,
            password: password
        }
    // Menampilkan animasi loading
    $('#loadingOverlay').removeClass('d-none');

    // Mendapatkan url utama
    const origin = window.location.origin;

    $.ajax({
        url: `${origin}/register`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        dataType: 'json',
        success: function(data) {
            console.log("Data dari server (success):", data);
            if (data.success) {
                    $.ajax({
                        url: `${origin}/login`,
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(dataLogin),
                        dataType: 'json',
                        success: function(data) {
                            console.log("Data dari server (success):", data);
                            if (data.success) {
                                // Redirect ke halaman dashboard
                                window.location.href = '/dashboard/' + data.data.profile.profile.first_name;
                            } else {
                                const Message = data.message;
                                const error = data.error;
                                const errorMessage = error ? Message + error : Message;
                                console.error('Login error:', errorMessage);
                                $('#registerErrorAlert').text(errorMessage).removeClass('d-none');
                            }
                        },
                        error: function(xhr, status, error) {
                            const errorData = xhr.responseJSON ? xhr.responseJSON : 'Login failed. Please try again later.';
                            console.error('Login error:', errorData);
                            console.error("Data dari server (error):", errorData);

                            // Cetak data yang akan dikirimkan ke server pada respon error
                            console.log("Data yang akan dikirimkan ke server:", formData);

                            if (errorData.error) {
                                $('#registerErrorAlert').html(`<i class="fas fa-exclamation-triangle"></i> ${errorData.message} Error: ${errorData.error}`).removeClass('d-none')
                                console.error('ini jalan if atas');            
                            } else {
                                $('#registerErrorAlert').html(`<i class="fas fa-exclamation-triangle"></i> ${errorData.message}`).removeClass('d-none');
                                console.error('ini jalan else bawah');
                            }
                        }
                    });
            } else {
                console.log("Data dari server (error):", data);
                const Message = data.message;
                const error = data.error;
                const errorMessage = error ? Message + error : Message;
                console.error('Registration error:', errorMessage);
                $('#registerErrorAlert').text(errorMessage).removeClass('d-none');
            }
        },
        error: function(xhr, status, error) {
            const errorData = xhr.responseJSON ? xhr.responseJSON : 'Registration failed. Please try again later.';
            console.error('Registration error:', errorData);
                // Cetak status code
            console.log("HTTP status code:", xhr.status);
            // Cetak data yang akan dikirimkan ke server pada respon error
            console.log("Data yang akan dikirimkan ke server:", formData);

            if (errorData.error) {
                $('#registerErrorAlert').html(`<i class="fas fa-exclamation-triangle"></i> ${errorData.message} Error: ${errorData.error}`).removeClass('d-none')
                console.error('ini jalan if atas');            
            } else {
                $('#registerErrorAlert').html(`<i class="fas fa-exclamation-triangle"></i> ${errorData.message}`).removeClass('d-none');
                console.error('ini jalan else bawah');
            }
        },
        complete: function() {
            // Sembunyikan animasi loading
            // $('#loadingOverlay').addClass('d-none');
                    // Tetapkan timeout untuk spinner selama 3 detik
            setTimeout(function() {
                // Hapus kelas 'd-none' untuk memunculkan spinner
                $('#loadingOverlay').removeClass('d-none');
            }, 3000);
        }
    });

}
