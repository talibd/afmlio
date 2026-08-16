(function () {
  function previewFromInput(input, target) {
    var file = input.files && input.files[0];
    if (!file) return;
    var url = URL.createObjectURL(file);
    var img = target.querySelector("img");
    var empty = target.querySelector(".preview-empty");
    if (img) {
      img.src = url;
      img.hidden = false;
    } else {
      img = document.createElement("img");
      img.alt = target.getAttribute("data-alt") || "";
      img.src = url;
      target.insertBefore(img, target.firstChild);
    }
    if (empty) empty.hidden = true;
    var muteIco = target.querySelector(".ico-mute");
    if (muteIco) muteIco.hidden = true;
    var nameEl = target.querySelector(".upload-meta strong");
    if (nameEl && file.name) nameEl.textContent = file.name;
  }

  document.querySelectorAll("[data-pick]").forEach(function (wrap) {
    var input = wrap.querySelector('input[type="file"]');
    var preview = wrap.querySelector(".preview");
    if (!input || !preview) return;
    preview.addEventListener("click", function () {
      input.click();
    });
    preview.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        input.click();
      }
    });
    input.addEventListener("change", function () {
      previewFromInput(input, preview);
    });
  });

  document.querySelectorAll("[data-image]").forEach(function (el) {
    el.addEventListener("click", function () {
      var input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.addEventListener("change", function () {
        var file = input.files && input.files[0];
        if (!file) return;
        el.src = URL.createObjectURL(file);
      });
      input.click();
    });
  });

  document.querySelectorAll("[data-edit]").forEach(function (el) {
    el.setAttribute("tabindex", "0");
    function start() {
      el.contentEditable = "true";
      el.focus();
    }
    el.addEventListener("click", start);
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !el.hasAttribute("data-multiline")) {
        if (el.contentEditable !== "true") {
          e.preventDefault();
          start();
          return;
        }
        e.preventDefault();
        el.blur();
      }
    });
    el.addEventListener("blur", function () {
      el.contentEditable = "false";
    });
  });

  var addSkill = document.querySelector("[data-add-skill]");
  if (addSkill) {
    var field = document.querySelector("#skill-name");
    var chips = document.querySelector("[data-chips]");
    function add() {
      var name = (field.value || "").trim();
      if (!name) return;
      var chip = document.createElement("span");
      chip.className = "chip";
      chip.innerHTML =
        "<span></span><button type='button' aria-label='Remove'>&times;</button>";
      chip.querySelector("span").textContent = name;
      chip.querySelector("button").setAttribute("aria-label", "Remove " + name);
      chip.querySelector("button").addEventListener("click", function () {
        chip.remove();
      });
      chips.appendChild(chip);
      field.value = "";
      field.focus();
    }
    addSkill.addEventListener("click", add);
    field.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        add();
      }
    });
    chips.querySelectorAll(".chip button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        btn.parentElement.remove();
      });
    });
  }

  document.querySelectorAll("[data-choice]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll("[data-choice]").forEach(function (other) {
        other.setAttribute("aria-pressed", "false");
      });
      btn.setAttribute("aria-pressed", "true");
    });
  });

  var lastImage = document.querySelector("[data-image]");
  document.querySelectorAll("[data-image]").forEach(function (el) {
    el.addEventListener("click", function () {
      lastImage = el;
    });
  });

  var replaceImage = document.querySelector("[data-replace-image]");
  if (replaceImage) {
    replaceImage.addEventListener("click", function () {
      var target = lastImage || document.querySelector("[data-image]");
      if (target) target.click();
    });
  }

  var editText = document.querySelector("[data-edit-text]");
  if (editText) {
    editText.addEventListener("click", function () {
      var el = document.querySelector("[data-edit]");
      if (el) el.click();
    });
  }

  var templateBtn = document.querySelector("[data-template]");
  var templateMenu = document.querySelector("[data-template-menu]");
  if (templateBtn && templateMenu) {
    templateBtn.addEventListener("click", function () {
      var open = templateMenu.hidden;
      templateMenu.hidden = !open;
      templateBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (templateMenu.hidden) return;
      if (templateMenu.contains(e.target) || templateBtn.contains(e.target)) return;
      templateMenu.hidden = true;
      templateBtn.setAttribute("aria-expanded", "false");
    });
  }

  var publish = document.querySelector("[data-publish]");
  if (publish) {
    publish.addEventListener("click", function () {
      var toast = document.querySelector(".toast");
      if (!toast) return;
      toast.textContent = "Published. Live now.";
      toast.classList.add("show");
      window.setTimeout(function () {
        toast.classList.remove("show");
      }, 2200);
    });
  }
})();
