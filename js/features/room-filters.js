export function initRoomFilters(root = document) {
  const filterNav = root.querySelector(".rooms-filters");
  const grid = root.querySelector("[data-room-grid]");

  if (!filterNav || !grid) return;

  const buttons = [...filterNav.querySelectorAll("[data-room-filter]")];
  const cards = [...grid.querySelectorAll("[data-room-type]")];

  if (!buttons.length || !cards.length) return;

  const applyFilter = (filter) => {
    buttons.forEach((button) => {
      const isActive = button.dataset.roomFilter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    cards.forEach((card) => {
      const matches = filter === "all" || card.dataset.roomType === filter;
      card.hidden = !matches;
    });
  };

  const focusButton = (index) => {
    buttons[index]?.focus();
  };

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      applyFilter(button.dataset.roomFilter);
    });

    button.addEventListener("keydown", (event) => {
      const lastIndex = buttons.length - 1;
      let targetIndex = index;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        targetIndex = index === lastIndex ? 0 : index + 1;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        targetIndex = index === 0 ? lastIndex : index - 1;
      } else if (event.key === "Home") {
        targetIndex = 0;
      } else if (event.key === "End") {
        targetIndex = lastIndex;
      } else {
        return;
      }

      event.preventDefault();
      focusButton(targetIndex);
    });
  });

  const activeButton = buttons.find((button) => button.getAttribute("aria-pressed") === "true") ?? buttons[0];
  applyFilter(activeButton.dataset.roomFilter);
}
