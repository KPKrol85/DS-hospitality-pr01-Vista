export function initTabs(root = document) {
  const tabLists = [...root.querySelectorAll('[role="tablist"]')];
  if (!tabLists.length) return;

  tabLists.forEach((tabList) => {
    const tabs = [...tabList.querySelectorAll('[role="tab"]')];
    if (!tabs.length) return;

    const panels = tabs.map((tab) => {
      const panelId = tab.getAttribute("aria-controls");
      return panelId ? document.getElementById(panelId) : null;
    });

    const hash = window.location.hash;
    const hashIndex = hash ? panels.findIndex((panel) => panel && `#${panel.id}` === hash) : -1;

    let activeIndex = hashIndex;

    if (activeIndex < 0) {
      activeIndex = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    }
    if (activeIndex < 0) {
      activeIndex = tabs.findIndex((tab) => tab.classList.contains("is-active"));
    }
    if (activeIndex < 0) activeIndex = 0;

    const setActiveTab = (index, { focus = false } = {}) => {
      tabs.forEach((tab, idx) => {
        const active = idx === index;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });

      panels.forEach((panel, idx) => {
        if (!panel) return;
        const active = idx === index;
        panel.hidden = !active;
      });

      if (focus) {
        tabs[index]?.focus();
      }
    };

    const focusTab = (index) => {
      tabs.forEach((tab, idx) => {
        tab.tabIndex = idx === index ? 0 : -1;
      });
      tabs[index]?.focus();
    };

    tabs.forEach((tab, idx) => {
      tab.addEventListener("click", () => {
        activeIndex = idx;
        setActiveTab(activeIndex, { focus: true });
      });

      tab.addEventListener("keydown", (event) => {
        const currentIndex = tabs.indexOf(event.currentTarget);
        const lastIndex = tabs.length - 1;

        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          const nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
          focusTab(nextIndex);
        }

        if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          const prevIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
          focusTab(prevIndex);
        }

        if (event.key === "Home") {
          event.preventDefault();
          focusTab(0);
        }

        if (event.key === "End") {
          event.preventDefault();
          focusTab(lastIndex);
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activeIndex = currentIndex;
          setActiveTab(activeIndex);
        }
      });
    });

    setActiveTab(activeIndex);
  });
}
