let scrollY = 0;
let distance = 50;
let speed = 24;
let show = document.querySelectorAll("section[class='hide']");

function autoScrollTo(el) {
    show[0].classList.remove('hide');
    if(!show[0].classList.contains('hide')) {
        let currentY = window.pageYOffset;
        let targetY = document.getElementById(el).offsetTop;
        let bodyHeight = document.body.offsetHeight;
        let yPos = currentY + window.innerHeight;
        let animator = setTimeout('autoScrollTo(\'' + el + '\')', speed);

        if (yPos > bodyHeight) {
            clearTimeout(animator);
        } else {
            if (currentY < targetY - distance) {
                scrollY = currentY + distance + 100;
                window.scroll(0, scrollY);
            } else {
                clearTimeout(animator);
                show[0].classList.remove('hide');
            }
        }
    }
}