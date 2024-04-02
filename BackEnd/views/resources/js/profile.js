document.addEventListener("DOMContentLoaded", function () {
  const editButton = document.getElementById("editButton");
  const saveButton = document.getElementById("saveButton");
  const cancelButton = document.getElementById("cancelButton");

  // Event listener untuk tombol "Edit"
  editButton.addEventListener("click", function (event) {
    event.preventDefault(); // Mencegah peristiwa standar form

    // Aktifkan mode pengeditan
    $("#namaInput").prop("readonly", false);
    $('#namaInput').removeProp('readonly');
    $("#statusInput").prop("readonly", false);

    // Tampilkan tombol "Simpan" dan "Cancel"
    $("#saveButton").removeClass("d-none");
    $("#cancelButton").removeClass("d-none");

    // Sembunyikan tombol "Edit"
    $("#editButton").addClass("d-none");
  });

  // Event listener untuk tombol "Simpan"
  saveButton.addEventListener("click", function () {
    // Lakukan pengiriman data yang diperbarui ke server melalui AJAX

    // Setelah berhasil menyimpan, matikan mode pengeditan
    $("#namaInput").prop("readonly", true);
    $("#statusInput").prop("readonly", true);

    // Sembunyikan tombol "Simpan" dan "Cancel", tampilkan tombol "Edit"
    $("#saveButton").addClass("d-none");
    $("#cancelButton").addClass("d-none");
    $("#editButton").removeClass("d-none");

    // Mendapatkan url utama dari env
    const urlAPI = "<%= urlAPI %>";
    const endPointLogin = "/api/v1/auth/test";
    const updateProfile = urlAPI + endPointLogin;
    $.ajax({
      url: updateProfile,
      type: "POST",
      data: {
        nama: $("#namaInput").val(),
        status: $("#statusInput").val(),
        id: $("#idInput").val(),
      },
      success: function (data) {
        console.log("Data dari server (success):", data);
        if (data.success) {
          $("#ProfileAlert").text(data.message).removeClass("d-none");
        } else {
          const Message = data.message;
          const error = data.error;
          const errorMessage = error ? Message + error : Message;
          console.error("Login error:", errorMessage);
          $("#ProfileAlert").text(errorMessage).removeClass("d-none");
        }
      },
      error: function (xhr, status, error) {
        const errorData = xhr.responseJSON
          ? xhr.responseJSON
          : "Login failed. Please try again later.";
        console.error("Login error:", errorData);
        console.error("Data dari server (error):", errorData);

        console.log("Data yang akan dikirimkan ke server:", formData);

        if (errorData.error) {
          $("#ProfileAlert")
            .html(
              `<i class="fas fa-exclamation-triangle"></i> ${errorData.message} Error: ${errorData.error}`
            )
            .removeClass("d-none");
          console.error("ini jalan if atas 1");
        } else {
          $("#ProfileAlert")
            .html(
              `<i class="fas fa-exclamation-triangle"></i> ${errorData.message}`
            )
            .removeClass("d-none");
          console.error("ini jalan else bawah 1");
        }
      },
      complete: function (xhr, status) {
        if (status === "success") {
          setTimeout(function () {
            // Hapus kelas 'd-none' untuk memunculkan spinner selama 3 detik jika berhasil
            $("#loadingOverlay").removeClass("d-none");
            setTimeout(function () {
              $("#loadingOverlay").addClass("d-none");
            }, 5000);
          }, 0); // Timeout 0 ms agar dijalankan setelah penyelesaian AJAX
        } else {
          // Hapus kelas 'd-none' untuk memunculkan spinner selama 1 detik jika gagal
          setTimeout(function () {
            $("#loadingOverlay").removeClass("d-none");
            setTimeout(function () {
              $("#loadingOverlay").addClass("d-none");
            }, 500);
          }, 0);
        }
      },
    });
  });

  // Event listener untuk tombol "Cancel"
  cancelButton.addEventListener("click", function () {
    // Batal pengeditan dan kembalikan ke mode sebelumnya
    $("#namaInput").prop("readonly", true);
    $("#statusInput").prop("readonly", true);

    // Sembunyikan tombol "Simpan" dan "Cancel", tampilkan tombol "Edit"
    $("#saveButton").addClass("d-none");
    $("#cancelButton").addClass("d-none");
    $("#editButton").removeClass("d-none");
  });
});
