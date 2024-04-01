$(document).ready(function() {
    $("form").submit(function(e) {
        e.preventDefault();

        var judul = $("#judul").val();
        var tagline = $("#tagline").val();
        var file = $("#file").prop('files')[0].name;
        var deskripsi = $("#deskripsi").val();

        $("#judul-hasil").text(judul);
        $("#tagline-hasil").text(tagline);
        $("#file-hasil").text(file);
        $("#deskripsi-hasil").text(deskripsi);
    });
});