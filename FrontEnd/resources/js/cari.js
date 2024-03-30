$(document).ready(function() {
    $('form').submit(function(e) {
        e.preventDefault();
        
        const searchQuery = $('input[type="search"]').val();
        
        // Bersihkan hasil sebelumnya
        $('.search-results').empty();
        
        // Tampilkan hasil pencarian
        $.ajax({
            url: 'url_pencarian', // Ganti dengan URL yang sesuai untuk melakukan pencarian
            method: 'GET',
            data: { query: searchQuery },
            success: function(searchResults) {
              $.each(searchResults, function(index, result) {
                $('.search-results').append(`
                <div class="col-md-2">
                    <img src="${result.img}" class="img img-fluid rounded-start" alt="..."/>
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">${result.title}</h5>
                        <p class="card-text">${result.description}</p>
                        <p class="card-text">
                            <small class="text-body-secondary">${result.time}</small>
                        </p>
                    </div>
                </div>
                `);
              });
            },
        });
    });
});
  