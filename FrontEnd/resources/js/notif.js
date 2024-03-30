// Script untuk tab
$(document).ready(function () {
  $('.nav-underline a').on('click', function (e) {
    e.preventDefault();
    $(this).tab('show');
  });
});

// Tampilkan data pesan
const renderPesan = (data) => {
  const allTab = $('#all');
  const recentTab = $('#recent');

  allTab.empty();
  recentTab.empty();

  if (data.length === 0) {
    allTab.append(`
    <figure class="figure">
      <img src="assets/notif-empty.png" class="figure-img img-fluid">
      <figcaption class="figure-caption text-center fw-bold">Belum ada notifikasi apapun</figcaption>
    </figure>
    `);
    return;
  }

  data.forEach((pesan) => {
    const user = pesan.user;
    const waktu = pesan.waktu;
    const isi = pesan.isi;

    const html = `
      <li class="list-group-item">
        <img src="${user.foto}" class="rounded-circle me-2" alt="Profil">
        <span class="fw-bold">${user.nama}</span>
        <br>
        <small class="text-muted">${waktu}</small>
        <p class="mb-0">${isi}</p>
      </li>
    `;

    // Tambahkan pesan ke tab "Semua"
    allTab.append(html);

    // Filter pesan untuk tab "Recent" (misal ambil 5 pesan terbaru)
    const currentDate = new Date();
    const messageDate = new Date(waktu);
    const diffInMinutes = (currentDate - messageDate) / (1000 * 60);
    const isRecent = diffInMinutes <= 5; // Filter pesan yang kurang dari atau sama dengan 5 menit
    if (isRecent) {
      recentTab.append(html);
    }
  });
};

// Panggil fungsi getPesan saat halaman dimuat
$(document).ready(async () => {
  const data = await getPesan();
  renderPesan(data);
});
