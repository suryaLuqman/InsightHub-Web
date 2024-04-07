// Fungsi untuk mengurangi kualitas gambar
function compressImage(dataURL, quality) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const image = new Image();

  const deferred = $.Deferred();

  image.onload = function () {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    // Tentukan tipe gambar output berdasarkan ekstensi file
    let outputType;
    if (dataURL.endsWith('.png')) {
      outputType = 'image/png';
    } else if (dataURL.endsWith('.svg')) {
      // Jika SVG, tidak perlu dikompresi, tetap gunakan SVG asli
      deferred.resolve(dataURL);
      return;
    } else {
      // Default ke JPEG untuk format lain seperti jpg, jpeg
      outputType = 'image/jpeg';
    }

    // Menggunakan tipe gambar yang sesuai untuk output
    const newDataURL = canvas.toDataURL(outputType, quality);
    deferred.resolve(newDataURL);
  };

  image.src = dataURL;

  return deferred.promise();
}

// Fungsi untuk mengubah data URL menjadi Blob
function dataURLToBlob(dataURL) {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(":")[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
}

document.addEventListener("DOMContentLoaded", function () {
  const editButton = document.getElementById("editButton");
  const saveButton = document.getElementById("saveButton");
  const cancelButton = document.getElementById("cancelButton");

  editButton.addEventListener("click", function (event) {
      event.preventDefault();

      $("#namaInput").prop("readonly", false);
      $("#statusInput").prop("readonly", false);

      $("#saveButton").removeClass("d-none");
      $("#cancelButton").removeClass("d-none");
      $("#uploadPicButton").removeClass("d-none");
      $("#deletePicButton").removeClass("d-none");
      $("#buttonGantiPassword").removeClass("d-none");

      $("#editButton").addClass("d-none");
  });

  let profileImageDataURL;

  document.getElementById("profileImageInput").addEventListener("change", function (e) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = function () {
          document.querySelector(".rounded-circle").src = reader.result;
          document.getElementById("profileImage").src = reader.result;
          profileImageDataURL = reader.result;
      };

      if (file) {
          reader.readAsDataURL(file);
      }
  });

  document.getElementById("uploadPicButton").addEventListener("click", function () {
      document.getElementById("profileImageInput").click();
  });

  saveButton.addEventListener("click", function () {
      $("#namaInput").prop("readonly", true);
      $("#statusInput").prop("readonly", true);

      $("#saveButton").addClass("d-none");
      $("#cancelButton").addClass("d-none");
      $("#uploadPicButton").addClass("d-none");
      $("#deletePicButton").addClass("d-none");
      $("#buttonGantiPassword").addClass("d-none");
      $("#editButton").removeClass("d-none");

      if (!profileImageDataURL) {
          console.error("No image selected.");
          return;
      }

      compressImage(profileImageDataURL, 0.5) // Ubah nilai kualitas sesuai kebutuhan
      .then(function (compressedDataURL) {
          const formData = new FormData();
          formData.append("first_name", $("#namaInput").val());
          formData.append("status", $("#statusInput").val());

          // Ubah data URL menjadi Blob dan tambahkan ke FormData
          const imageBlob = dataURLToBlob(compressedDataURL);
          formData.append("profile_picture", imageBlob);

  
          console.log("Data yang akan dikirimkan ke server:", formData);
  
          // Menampilkan animasi loading
          $("#loadingOverlay").removeClass("d-none");

          const endPointUpdate = "/api/v1/auth/profile/update";
          const updateProfileURL = urlAPI + endPointUpdate;
          console.log("=token =",token);
  
          $.ajax({
              url: updateProfileURL,
              type: "PUT", // Ganti metode menjadi PUT
              headers: {
                  Authorization: `Bearer ${token}`,
              },
                  data: formData,
                  processData: false,
                  contentType: false,
                  success: function (data) {
                      console.log("Data dari server (success):", data);
                      $("#ProfileAlert").text(data.message).removeClass("d-none");
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
  });

  // Event listener untuk tombol "Cancel"
  cancelButton.addEventListener("click", function () {
      // Batal pengeditan dan kembalikan ke mode sebelumnya
      $("#namaInput").prop("readonly", true);
      $("#statusInput").prop("readonly", true);

      // Sembunyikan tombol "Simpan" dan "Cancel", tampilkan tombol "Edit"
      $("#saveButton").addClass("d-none");
      $("#cancelButton").addClass("d-none");
      $("#uploadPicButton").addClass("d-none");
      $("#deletePicButton").addClass("d-none");
      $("#buttonGantiPassword").addClass("d-none");
      $("#editButton").removeClass("d-none");
      document.querySelector(".rounded-circle").src =
          "/resources/images/user.jpg";
      document.getElementById("profileImage").src = "/resources/images/user.jpg";
  });
});

$(document).ready(function () {
  $("#simpanPassword").click(function (event) {
    event.preventDefault();
    const password = $("#passwordBaru").val();
    console.log("passwordBaru:", password);
    const confirm_password = $("#konfirmasiPassword").val();
    console.log("konfirmasiPassword:", confirm_password);
    const endPointLogin = "/api/v1/auth/change-password";
    const updateProfile = urlAPI + endPointLogin;

    // Tampilkan overlay loading saat AJAX sedang berlangsung
    $("#loadingOverlay").removeClass("d-none");
    const data = {
      password: password,
      confirm_password: confirm_password,
    };
    $.ajax({
      url: `${updateProfile}?token=${token}`, // Perhatikan penambahan token ke URL
      type: "POST",
      data: JSON.stringify(data),
      dataType: "json", // Ubah dataType menjadi "json"
      contentType: "application/json", // Tambah contentType
      success: function (data) {
        console.log("Data dari server (success):", data);
        if (data.status) {
          // Periksa status dari respons
          // Tampilkan pesan sukses di dalam modal
          $("#gantiPasswordAlert").append(
            `<div class="alert alert-success">${data.message}</div>`
          );
          setTimeout(function () {
            //   reload halaman setelah 2 detik
            window.location.reload();
          }, 1000);
        } else {
          console.log("Data dari server (error atas):", data);
          // Tampilkan pesan error di dalam modal
          $("#gantiPasswordAlert").append(
            `<div class="alert alert-danger"> ${data.message} Error: ${data.err}</div>`
          );
        }
      },
      error: function (xhr, status, error) {
        const errorData = xhr.responseJSON
          ? xhr.responseJSON
          : "Failed to change password. Please try again later.";
        console.error("Change password error:", errorData);
        console.error("Data dari server (error) bawah:", errorData);
        // Tampilkan pesan error di dalam modal
        $("#gantiPasswordAlert").append(
          `<div class="alert alert-danger"> ${errorData.message}! &nbsp; Error: ${errorData.error}</div>`
        );
      },
      complete: function () {
        // Sembunyikan overlay loading setelah AJAX selesai
        $("#loadingOverlay").addClass("d-none");
      },
    });
  });
});
