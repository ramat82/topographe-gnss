const viewer = document.querySelector('#viewer');
const viewerImage = viewer.querySelector('img');
const viewerText = viewer.querySelector('p');
document.querySelectorAll('.gallery article img').forEach((image) => {
  image.addEventListener('click', () => {
    viewerImage.src = image.src;
    viewerImage.alt = image.alt;
    viewerText.textContent = image.closest('article').querySelector('b').textContent;
    viewer.showModal();
  });
});
viewer.querySelector('button').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', (event) => {
  if (event.target === viewer) viewer.close();
});
