function transitionEffect() {
  const homepage = document.getElementById('homepage');
  homepage.classList.add('transition');
  setTimeout(() => {
    homepage.classList.remove('transition');
  }, 2000);
  setTimeout(() => {
    homepage.innerHTML = 'Click Sign-In to Begin';
    homepage.classList.add('transition');
  }, 6700);
}
transitionEffect();
