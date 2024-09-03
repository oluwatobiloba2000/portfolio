const navBar = document.querySelector('.tb-navbar')

window.addEventListener('scroll', () => {
   if(window.scrollY > 50 && window.innerWidth > 992) {
        navBar.classList.add('tb-navbar--bg-blur');
   }else{
        navBar.classList.remove('tb-navbar--bg-blur')
    }
})