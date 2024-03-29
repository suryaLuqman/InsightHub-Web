$(document).ready(function() {
    $("form").submit(function(e) {
        e.preventDefault();

        var judul = $("#judul").val();
        var tagline = $("#tagline").val();
        var file = $("#file").val();
        var deskripsi = $("#deskripsi").val();

        $("#judul-hasil").text(judul);
        $("#tagline-hasil").text(tagline);
        $("#file-hasil").text(file);
        $("#deskripsi-hasil").text(deskripsi);
    });
});