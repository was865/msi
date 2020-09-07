$(function() {

    if ($('#status').val() == '' || $('#status').val() == '在席' || $('#status').val() == '帰宅') {
        $('.table_ikisaki').addClass('hide');
        $('.table_yoteijikoku').addClass('hide');
    } else if ($('#status').val() == '出張' ||　$('#status').val() == '研修' ||　$('#status').val() == 'その他') {
        $('.table_ikisaki').addClass('hide');
    } else if ($('#status').val() == '休暇') {
        $('.table_yoteijikoku').addClass('hide');
    }

}); 