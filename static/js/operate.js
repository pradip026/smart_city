
$(".xray-image").click(
    (item) => {
        contentImg = new Image();
        contentImg.src = item.currentTarget.src;

        contentImg.onload = function() {
            canvas = document.getElementById('canvas');
            context = canvas.getContext('2d');
            context.drawImage(contentImg, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpg');
            makeRequest(dataUrl, 'POST', '/badge/', 'xray');
        }
});
