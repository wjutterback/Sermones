function transitionEffect() {
  const homepage = document.getElementById('homepage');
  homepage.classList.add('transition');
  setTimeout(() => {
    homepage.classList.remove('transition');
  }, 2000);
  setTimeout(() => {
    homepage.innerHTML =
      'Bring your friends. We definitely will not be listening to your conversations';
    homepage.classList.add('transition');
  }, 6500);
  setTimeout(() => {
    homepage.classList.remove('transition');
  }, 8700);
}

transitionEffect();
