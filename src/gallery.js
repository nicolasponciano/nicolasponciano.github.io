export function createGallery(dialog) {
  const find = (selector) => dialog.querySelector(selector);
  const section = find(".screen-gallery");
  const sheet = find(".dialog-sheet");
  const bar = find(".dialog-bar");
  const viewer = find(".screen-viewer");
  const image = find("[data-screen]");
  const caption = find("[data-caption]");
  const choices = find(".screen-choices");
  const enlarge = find("[data-enlarge]");
  const back = find("[data-return]");
  const detail = viewer.querySelector("img");
  const error = viewer.querySelector("p");
  const pan = find(".screen-pan");
  const zoom = find("[data-zoom]");
  let selected;
  let scrollTop = 0;

  function select(shot, index) {
    selected = shot;
    image.hidden = false;
    image.alt = shot.alt;
    image.src = shot.src;
    enlarge.disabled = false;
    caption.textContent = shot.caption;
    Array.from(choices.children).forEach((button, i) => {
      button.setAttribute("aria-pressed", String(i === index));
    });
  }

  image.addEventListener("error", () => {
    image.hidden = true;
    enlarge.disabled = true;
    caption.textContent = `Não foi possível carregar a tela “${selected.title}”.`;
  });

  detail.addEventListener("error", () => {
    zoom.disabled = true;
    detail.hidden = true;
    error.hidden = false;
  });

  function toggleZoom(x = 0.5, y = 0.5) {
    const original = pan.classList.toggle("original-size");
    zoom.textContent = original ? "Ajustar à tela" : "Ver em 100%";
    if (original) {
      pan.scrollTo(detail.clientWidth * x - pan.clientWidth / 2,
        detail.clientHeight * y - pan.clientHeight / 2);
    }
  }

  zoom.addEventListener("click", () => toggleZoom());
  detail.addEventListener("click", (event) => {
    const bounds = detail.getBoundingClientRect();
    toggleZoom((event.clientX - bounds.left) / bounds.width,
      (event.clientY - bounds.top) / bounds.height);
  });

  enlarge.addEventListener("click", () => {
    scrollTop = sheet.scrollTop;
    sheet.hidden = bar.hidden = true;
    viewer.hidden = false;
    pan.classList.remove("original-size");
    zoom.textContent = "Ver em 100%";
    zoom.disabled = false;
    dialog.setAttribute("aria-labelledby", "screen-title");
    find("#screen-title").textContent = selected.title;
    error.hidden = true;
    detail.hidden = false;
    detail.alt = selected.alt;
    detail.src = selected.full || selected.src;
    pan.scrollTo(0, 0);
    back.focus();
  });

  function returnToSheet() {
    if (viewer.hidden) return false;
    viewer.hidden = true;
    sheet.hidden = bar.hidden = false;
    dialog.setAttribute("aria-labelledby", "project-dialog-title");
    sheet.scrollTop = scrollTop;
    enlarge.focus({ preventScroll: true });
    return true;
  }

  back.addEventListener("click", returnToSheet);
  viewer.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      returnToSheet();
    }
  });

  function reset(shots = []) {
    returnToSheet();
    choices.replaceChildren();
    section.hidden = !shots.length;
    sheet.scrollTop = 0;
    if (!shots.length) return;
    choices.hidden = shots.length < 2;
    if (!choices.hidden) shots.forEach((shot, index) => {
      const button = document.createElement("button");
      button.type = "button";
      const thumb = document.createElement("img");
      thumb.alt = "";
      thumb.src = shot.thumbnail || shot.src;
      button.append(thumb, shot.title);
      button.addEventListener("click", () => select(shot, index));
      choices.append(button);
    });
    select(shots[0], 0);
  }

  return { reset, returnToSheet };
}
