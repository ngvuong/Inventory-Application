const menu = document.querySelector('.nav-menu');
const nav = document.querySelector('.nav');
const children = [...menu.childNodes];

menu.addEventListener('click', () => {
  nav.classList.toggle('active');
});

const removeActive = (e) => {
  if (e.target !== menu && !children.includes(e.target)) {
    nav.classList.remove('active');
  }
};

document.body.addEventListener('click', removeActive);
