$(function () {
    $("#results").hide();
});

const xray_results = $('#xray_results');

let xRayForm = $('#formid')[0];
let results = $('#results')
let xray_container = $('#xray_canvas_container');
let contentImg = new Image();
const URL = window.webkitURL || window.URL;

function submitForm(){
    event.preventDefault();
    var form_data = new FormData(xRayForm);
    const no_error = validateXrayForm();
    if(no_error) uploadData(form_data, no_error );
}

function uploadData(form_data, no_error) {
    event.preventDefault();
    $("#results").hide();
    $('.message').text('Please wait...');
    $("#results .row").html("");



    if(no_error === true){
        $.ajaxSetup({
            headers: { "X-CSRFToken": getCookie("csrftoken") }
        });
        console.log(form_data);
        $.ajax({
            type: 'POST',
            url: '/uploadajax/',
            data: form_data,
            contentType: false,
            cache: false,
            beforeSend: function(){
                $("#results").show();
                $("#results h1").text("Please Wait...");
                $('html, body').animate({scrollTop: $("#results").offset().top - 200 }, 500);
            },
            complete: function () {
                $("#results h1").text("Results");
            },
            processData: false,
            success: function(data) {
                $('.message').text("");
                if(data.status === 1){
                    $('html, body').animate({scrollTop: $("#results").offset().top - 50}, 500);

                    var images = data.images;
                    var len = images.length;
                    // var str = '';
                    for(var i=0; i<len; i++){

                        // console.log(images[i]);
                        var image = images[i].image;
                        var prediction = images[i].pred;
                        var name = images[i].name;
                        var str = '<div class=\'col-md-4 g-margin-b-30--xs\'>\n' +
                            '                    <article>\n' +
                            '                        <img class="img-responsive" src="data:image/png;base64,'+image+'" alt="Image">\n' +
                            '                        <div class="g-bg-color--white g-box-shadow__dark-lightest-v2 g-text-center--xs g-padding-x-40--xs g-padding-y-30--xs">\n' +
                            '                            <p class="text-uppercase g-font-size-14--xs g-font-weight--700 g-color--primary g-letter-spacing--2">'+'image ' +(i + 1).toString()  +' - '+name+'</p>\n' +
                            '                            <h2 class="g-font-size-26--xs g-letter-spacing--1">'+prediction+' case</h2>\n' +
                            '                        </div>\n' +
                            '                    </article>\n' +
                            '                </div>';

                        $("#results .row").append(str);
                    }

                }
            }
        });

    }
    return false;

}

function validateXrayForm(){

    if(!validateShowFiles()){
        return false;
    }
    else return true;
}

function showFile(file){
    console.log(file);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = function() {
        context.drawImage(img, 20, 20);
    };
    img.src = url;
    canvas.classList.add('col-lg-2');
    xray_container.append(canvas);
}


function validateShowFiles(){
    $('.message').text("");
    const files = $('#formid input[name="files"]').get(0);
    const l = files.files.length;
    if(l < 1){
        $('.message').text("Please upload at least 1 image to continue");
        return false;
    }
    else if(l > 15){
       $('.message').text("Maximum 15 images are allowed");
        return false;
    }
    const image_extensions = ['ras', 'xwd', 'bmp', 'jpe', 'jpg', 'jpeg', 'xpm', 'ief', 'pbm', 'tif', 'gif', 'ppm', 'xbm',
                            'tiff', 'rgb', 'pgm', 'png', 'pnm'];
    for (let i = 0; i < l; i++) {
       const f = files.files[i];
       // console.log(f);
        const name = f.name;
       const ext = name.split('.').pop().toLowerCase();
       const size = f.size;
        if ($.inArray(ext, image_extensions) == -1){
            $('.message').text("The file"+ name + "is now allowed");
            return false;
        }
        else if(size > 1000000){
            $('.message').text("Image " + name +" should be less that 1 MB");
            return false;
        }
        // else{
        //     showFile(f);
        // }
    }
    return true;
}

function getCookie(c_name) {
    if (document.cookie.length > 0)
    {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1)
        {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start,c_end));
        }
    }
    return "";
}

