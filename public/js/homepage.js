function transitionEffect() {
  const homepage = document.getElementById('homepage');
  homepage.classList.add('transition');
  setTimeout(() => {
    homepage.classList.remove('transition');
  }, 0);
  setTimeout(() => {
    homepage.innerHTML = 'Click Sign-In to Begin';
    homepage.classList.add('transition');
  }, 4700);
}
transitionEffect();
